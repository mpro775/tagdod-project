import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { Product, ProductStatus } from '../schemas/product.schema';
import { Variant } from '../schemas/variant.schema';
import { CacheService } from '../../../shared/cache/cache.service';
import { CategoriesService } from '../../categories/categories.service';

describe('ProductService', () => {
  let service: ProductService;

  const mockProduct = {
    _id: '507f1f77bcf86cd799439011',
    name: 'لوحة شمسية',
    nameEn: 'Solar Panel',
    slug: 'solar-panel-100w',
    description: 'وصف المنتج',
    descriptionEn: 'Product description',
    categoryId: '507f1f77bcf86cd799439012',
    brandId: '507f1f77bcf86cd799439013',
    status: 'active',
    variantsCount: 0,
    viewsCount: 0,
    salesCount: 0,
    reviewsCount: 0,
    averageRating: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    save: jest.fn(),
  };

  const mockProductModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockVariantModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
  };

  const mockCategoriesService = {
    incrementProductsCount: jest.fn(),
    decrementProductsCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(Variant.name),
          useValue: mockVariantModel,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create new product', async () => {
      const createDto = {
        name: 'منتج جديد',
        nameEn: 'New Product',
        description: 'وصف',
        descriptionEn: 'Description',
        categoryId: '507f1f77bcf86cd799439012',
        status: ProductStatus.ACTIVE,
      };

      mockProductModel.findOne.mockResolvedValue(null);
      mockProductModel.create.mockResolvedValue(mockProduct);
      mockCacheService.clear.mockResolvedValue(undefined);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProduct);
      expect(mockProductModel.create).toHaveBeenCalled();
      expect(mockCategoriesService.incrementProductsCount).toHaveBeenCalledWith(
        createDto.categoryId,
        1,
      );
    });

    it('should throw error when creating product with duplicate slug', async () => {
      const createDto = {
        name: 'منتج',
        nameEn: 'Product',
        slug: 'existing-slug',
      };

      mockProductModel.findOne.mockResolvedValue(mockProduct);

      await expect(service.create(createDto)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return product when found', async () => {
      mockProductModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockProduct);
      expect(mockProductModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw error when product not found', async () => {
      mockProductModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('invalid_id')).rejects.toThrow();
    });
  });

  describe('findBySlug', () => {
    it('should return product by slug', async () => {
      mockProductModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await service.findBySlug('solar-panel-100w');

      expect(result).toEqual(mockProduct);
      expect(mockProductModel.findOne).toHaveBeenCalled();
    });

    it('should throw error when product not found by slug', async () => {
      mockProductModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findBySlug('invalid-slug')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update existing product', async () => {
      const updateDto = {
        name: 'اسم محدث',
        nameEn: 'Updated Name',
      };

      mockProductModel.findById.mockResolvedValue(mockProduct);
      mockProductModel.findByIdAndUpdate.mockResolvedValue({
        ...mockProduct,
        ...updateDto,
      });
      mockCacheService.clear.mockResolvedValue(undefined);

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toBeDefined();
      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should throw error when updating non-existent product', async () => {
      mockProductModel.findById.mockResolvedValue(null);

      await expect(service.update('invalid_id', {})).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should soft delete existing product', async () => {
      const userId = 'admin123';
      mockProductModel.findById.mockResolvedValue(mockProduct);
      mockProductModel.findByIdAndUpdate.mockResolvedValue({
        ...mockProduct,
        deletedAt: new Date(),
      });
      mockCacheService.clear.mockResolvedValue(undefined);

      await service.delete('507f1f77bcf86cd799439011', userId);

      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should throw error when deleting non-existent product', async () => {
      mockProductModel.findById.mockResolvedValue(null);

      await expect(service.delete('invalid_id', 'admin123')).rejects.toThrow();
    });
  });

  describe('incrementViews', () => {
    it('should increment product views', async () => {
      mockProductModel.findByIdAndUpdate.mockResolvedValue(mockProduct);

      await service.incrementViews('507f1f77bcf86cd799439011');

      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { $inc: { viewsCount: 1 } },
      );
    });
  });
});

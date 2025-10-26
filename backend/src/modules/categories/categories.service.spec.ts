import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service';
import { Category } from './schemas/category.schema';
import { CacheService } from '../../shared/cache/cache.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategory = {
    _id: '507f1f77bcf86cd799439011',
    name: 'ألواح شمسية',
    nameEn: 'Solar Panels',
    slug: 'solar-panels',
    description: 'وصف الفئة',
    descriptionEn: 'Category description',
    parentId: null,
    imageId: 'image-id',
    order: 1,
    depth: 0,
    isActive: true,
    isFeatured: false,
    childrenCount: 0,
    productsCount: 0,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  const mockSubCategory = {
    _id: '507f1f77bcf86cd799439012',
    name: 'ألواح 100 واط',
    nameEn: '100W Panels',
    slug: '100w-panels',
    parentId: '507f1f77bcf86cd799439011',
    order: 1,
    depth: 1,
    isActive: true,
    isFeatured: false,
    childrenCount: 0,
    productsCount: 0,
    deletedAt: null,
    createdAt: new Date(),
    save: jest.fn(),
  };

  const mockCategoryModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create new category', async () => {
      const createDto = {
        name: 'فئة جديدة',
        nameEn: 'New Category',
        order: 1,
      };

      mockCategoryModel.findOne.mockResolvedValue(null);
      mockCategoryModel.create.mockResolvedValue(mockCategory);
      mockCacheService.clear.mockResolvedValue(undefined);

      const result = await service.createCategory(createDto);

      expect(result).toEqual(mockCategory);
      expect(mockCategoryModel.create).toHaveBeenCalled();
      expect(mockCacheService.clear).toHaveBeenCalled();
    });

    it('should create subcategory with parent', async () => {
      const createDto = {
        name: 'فئة فرعية',
        nameEn: 'Subcategory',
        parentId: '507f1f77bcf86cd799439011',
        order: 1,
      };

      mockCategoryModel.findOne.mockResolvedValue(null);
      mockCategoryModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockCategory),
      });
      mockCategoryModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockCategoryModel.create.mockResolvedValue(mockSubCategory);
      mockCacheService.clear.mockResolvedValue(undefined);

      const result = await service.createCategory(createDto);

      expect(result).toEqual(mockSubCategory);
      expect(mockCategoryModel.updateOne).toHaveBeenCalled();
    });

    it('should throw error when creating category with duplicate slug', async () => {
      const createDto = {
        name: 'فئة',
        nameEn: 'Existing Category',
        slug: 'existing-slug',
      };

      mockCategoryModel.findOne.mockResolvedValue(mockCategory);

      await expect(service.createCategory(createDto)).rejects.toThrow();
    });
  });

  describe('getCategory', () => {
    it('should return category when found', async () => {
      mockCategoryModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockCategory),
      });

      const result = await service.getCategory('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockCategory);
      expect(mockCategoryModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw error when category not found', async () => {
      mockCategoryModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getCategory('invalid_id')).rejects.toThrow();
    });
  });

  describe('listCategories', () => {
    it('should return all active categories', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockCategoryModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockCategory]),
      });
      mockCacheService.set.mockResolvedValue(undefined);

      const result = await service.listCategories({});

      expect(result).toEqual([mockCategory]);
      expect(mockCategoryModel.find).toHaveBeenCalled();
    });

    it('should filter categories by parent', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockCategoryModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockSubCategory]),
      });
      mockCacheService.set.mockResolvedValue(undefined);

      const result = await service.listCategories({ parentId: '507f1f77bcf86cd799439011' });

      expect(result).toContain(mockSubCategory);
    });

    it('should use cached data when available', async () => {
      const cachedCategories = [mockCategory];
      mockCacheService.get.mockResolvedValue(cachedCategories);

      const result = await service.listCategories({});

      expect(result).toEqual(cachedCategories);
      expect(mockCategoryModel.find).not.toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    it('should update existing category', async () => {
      const updateDto = {
        name: 'اسم محدث',
        nameEn: 'Updated Name',
      };

      mockCategoryModel.findById.mockResolvedValue(mockCategory);
      mockCategoryModel.findOne.mockResolvedValue(null);
      mockCategoryModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockCacheService.clear.mockResolvedValue(undefined);

      const result = await service.updateCategory('507f1f77bcf86cd799439011', updateDto);

      expect(result).toBeDefined();
      expect(mockCategoryModel.updateOne).toHaveBeenCalled();
    });

    it('should throw error when updating non-existent category', async () => {
      mockCategoryModel.findById.mockResolvedValue(null);

      await expect(service.updateCategory('invalid_id', {})).rejects.toThrow();
    });
  });

  describe('deleteCategory', () => {
    it('should soft delete category without children', async () => {
      mockCategoryModel.findById.mockResolvedValue(mockCategory);
      mockCategoryModel.countDocuments.mockResolvedValue(0);
      mockCategoryModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockCacheService.clear.mockResolvedValue(undefined);

      await service.deleteCategory('507f1f77bcf86cd799439011', 'admin123');

      expect(mockCategoryModel.updateOne).toHaveBeenCalled();
    });

    it('should throw error when deleting category with subcategories', async () => {
      mockCategoryModel.findById.mockResolvedValue(mockCategory);
      mockCategoryModel.countDocuments.mockResolvedValue(5);

      await expect(
        service.deleteCategory('507f1f77bcf86cd799439011', 'admin123'),
      ).rejects.toThrow();
    });

    it('should throw error when deleting non-existent category', async () => {
      mockCategoryModel.findById.mockResolvedValue(null);

      await expect(service.deleteCategory('invalid_id', 'admin123')).rejects.toThrow();
    });
  });

  describe('getCategoryTree', () => {
    it('should return category tree structure', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockCategoryModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockCategory, mockSubCategory]),
      });
      mockCacheService.set.mockResolvedValue(undefined);

      const result = await service.getCategoryTree();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should use cached tree when available', async () => {
      const cachedTree = [mockCategory];
      mockCacheService.get.mockResolvedValue(cachedTree);

      const result = await service.getCategoryTree();

      expect(result).toEqual(cachedTree);
      expect(mockCategoryModel.find).not.toHaveBeenCalled();
    });
  });

  describe('incrementProductsCount', () => {
    it('should increment products count', async () => {
      mockCategoryModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await service.incrementProductsCount('507f1f77bcf86cd799439011', 1);

      expect(mockCategoryModel.updateOne).toHaveBeenCalledWith(
        { _id: '507f1f77bcf86cd799439011' },
        { $inc: { productsCount: 1 } },
      );
    });

    it('should decrement products count', async () => {
      mockCategoryModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await service.incrementProductsCount('507f1f77bcf86cd799439011', -1);

      expect(mockCategoryModel.updateOne).toHaveBeenCalledWith(
        { _id: '507f1f77bcf86cd799439011' },
        { $inc: { productsCount: -1 } },
      );
    });
  });

  describe('getStats', () => {
    it('should return category statistics', async () => {
      mockCategoryModel.countDocuments.mockResolvedValue(50);
      mockCategoryModel.aggregate.mockResolvedValue([
        { _id: 0, count: 30 },
        { _id: 1, count: 20 },
      ]);

      const result = await service.getStats();

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.total).toBe(50);
      expect(mockCategoryModel.countDocuments).toHaveBeenCalled();
      expect(mockCategoryModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('restoreCategory', () => {
    it('should restore deleted category', async () => {
      const deletedCategory = { ...mockCategory, deletedAt: new Date() };
      mockCategoryModel.findById.mockResolvedValue(deletedCategory);
      mockCategoryModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockCacheService.clear.mockResolvedValue(undefined);

      await service.restoreCategory('507f1f77bcf86cd799439011');

      expect(mockCategoryModel.updateOne).toHaveBeenCalled();
    });

    it('should throw error when restoring non-deleted category', async () => {
      mockCategoryModel.findById.mockResolvedValue(mockCategory);

      await expect(service.restoreCategory('507f1f77bcf86cd799439011')).rejects.toThrow();
    });
  });
});

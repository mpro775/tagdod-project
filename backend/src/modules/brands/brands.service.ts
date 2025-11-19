import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Brand } from './schemas/brand.schema';
import { Product } from '../products/schemas/product.schema';
import { CreateBrandDto, UpdateBrandDto, ListBrandsDto } from './dto/brand.dto';
import { 
  BrandNotFoundException,
  BrandException,
  ErrorCode 
} from '../../shared/exceptions';
import { slugify } from '../../shared/utils/slug.util';

@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);

  constructor(
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  /**
   * Create a new brand
   */
  async createBrand(dto: CreateBrandDto): Promise<Brand> {
    try {
      // Generate slug from name
      const slug = slugify(dto.name);

      // Check if slug already exists
      const existing = await this.brandModel.findOne({ slug });
      if (existing) {
        throw new BrandException(ErrorCode.BRAND_ALREADY_EXISTS, { name: dto.name, slug, existingBrandId: existing._id.toString() });
      }

      const brand = new this.brandModel({
        ...dto,
        slug,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
        description: dto.description ?? '',
        descriptionEn: dto.descriptionEn ?? '',
      });

      return await brand.save();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to create brand', {
        error: err.message,
        stack: err.stack,
        name: dto.name,
        nameEn: dto.nameEn,
      });

      // إعادة رمي الخطأ إذا كان من نوع BrandException
      if (error instanceof BrandException) {
        throw error;
      }

      // معالجة أخطاء MongoDB
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        const mongoError = error as { keyPattern?: Record<string, unknown> };
        const field = Object.keys(mongoError.keyPattern || {})[0] || 'field';
        throw new BrandException(ErrorCode.BRAND_INVALID_DATA, {
          reason: 'duplicate_field',
          field,
          message: `${field} موجود مسبقاً`,
        });
      }

      throw new BrandException(ErrorCode.BRAND_CREATE_FAILED, {
        name: dto.name,
        nameEn: dto.nameEn,
        error: err.message,
      });
    }
  }

  /**
   * Get all brands with filters and pagination
   */
  async listBrands(dto: ListBrandsDto) {
    const { page = 1, limit = 20, search, isActive, sortBy = 'sortOrder', sortOrder = 'asc', language = 'ar' } = dto;

    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    // Search filter
    if (search) {
      if (language === 'en') {
        query.$or = [
          { nameEn: { $regex: search, $options: 'i' } },
          { descriptionEn: { $regex: search, $options: 'i' } },
        ];
      } else {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { nameEn: { $regex: search, $options: 'i' } },
          { descriptionEn: { $regex: search, $options: 'i' } },
        ];
      }
    }

    // Status filter
    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }

    // Sort options
    const sortOptions: Record<string, SortOrder> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [brands, total] = await Promise.all([
      this.brandModel.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      this.brandModel.countDocuments(query),
    ]);

    return {
      brands,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get brand by ID
   */
  async getBrandById(id: string): Promise<Brand> {
    const brand = await this.brandModel.findById(id);
    if (!brand) {
      throw new BrandNotFoundException({ brandId: id });
    }
    return brand;
  }

  /**
   * Get brand by slug
   */
  async getBrandBySlug(slug: string): Promise<Brand> {
    const brand = await this.brandModel.findOne({ slug });
    if (!brand) {
      throw new BrandNotFoundException({ slug });
    }
    return brand;
  }

  /**
   * Update brand
   */
  async updateBrand(id: string, dto: UpdateBrandDto): Promise<Brand> {
    try {
      const brand = await this.brandModel.findById(id);
      if (!brand) {
        throw new BrandNotFoundException({ brandId: id });
      }

      // If name is being updated, regenerate slug
      if (dto.name && dto.name !== brand.name) {
        const newSlug = slugify(dto.name);
        const existing = await this.brandModel.findOne({
          slug: newSlug,
          _id: { $ne: id },
        });
        if (existing) {
          throw new BrandException(ErrorCode.BRAND_ALREADY_EXISTS, { name: dto.name, slug: newSlug, existingBrandId: existing._id.toString() });
        }
        brand.slug = newSlug;
      }

      // Handle description fields with default values
      if (dto.description !== undefined) {
        brand.description = dto.description;
      }
      if (dto.descriptionEn !== undefined) {
        brand.descriptionEn = dto.descriptionEn;
      }

      // Update fields
      Object.assign(brand, dto);

      return await brand.save();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to update brand', {
        error: err.message,
        stack: err.stack,
        brandId: id,
      });

      // إعادة رمي الخطأ إذا كان من نوع BrandException
      if (error instanceof BrandException || error instanceof BrandNotFoundException) {
        throw error;
      }

      throw new BrandException(ErrorCode.BRAND_UPDATE_FAILED, {
        brandId: id,
        error: err.message,
      });
    }
  }

  /**
   * Delete brand
   */
  async deleteBrand(id: string): Promise<void> {
    try {
      const brand = await this.brandModel.findById(id);
      if (!brand) {
        throw new BrandNotFoundException({ brandId: id });
      }

      // Check if there are products using this brand
      const productsCount = await this.productModel.countDocuments({
        brandId: id,
        deletedAt: null,
      });

      if (productsCount > 0) {
        throw new BrandException(ErrorCode.BRAND_HAS_PRODUCTS, {
          brandId: id,
          productsCount,
        });
      }

      await this.brandModel.deleteOne({ _id: id });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to delete brand', {
        error: err.message,
        stack: err.stack,
        brandId: id,
      });

      // إعادة رمي الخطأ إذا كان من نوع BrandException
      if (error instanceof BrandException || error instanceof BrandNotFoundException) {
        throw error;
      }

      throw new BrandException(ErrorCode.BRAND_DELETE_FAILED, {
        brandId: id,
        error: err.message,
      });
    }
  }

  /**
   * Get all active brands (for public use)
   */
  async getActiveBrands() {
    return await this.brandModel.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  }

  /**
   * Toggle brand active status
   */
  async toggleBrandStatus(id: string): Promise<Brand> {
    try {
      const brand = await this.brandModel.findById(id);
      if (!brand) {
        throw new BrandNotFoundException({ brandId: id });
      }

      brand.isActive = !brand.isActive;
      return await brand.save();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to toggle brand status', {
        error: err.message,
        stack: err.stack,
        brandId: id,
      });

      // إعادة رمي الخطأ إذا كان من نوع BrandException
      if (error instanceof BrandException || error instanceof BrandNotFoundException) {
        throw error;
      }

      throw new BrandException(ErrorCode.BRAND_UPDATE_FAILED, {
        brandId: id,
        error: err.message,
      });
    }
  }

  /**
   * Get brand statistics
   */
  async getStats() {
    const [total, active, inactive, brandsWithProducts] = await Promise.all([
      this.brandModel.countDocuments({}),
      this.brandModel.countDocuments({ isActive: true }),
      this.brandModel.countDocuments({ isActive: false }),
      this.productModel.distinct('brandId', {
        brandId: { $ne: null },
        deletedAt: null,
      }),
    ]);

    return {
      total,
      active,
      inactive,
      withProducts: brandsWithProducts.length,
    };
  }
}

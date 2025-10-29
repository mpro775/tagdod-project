import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductStatus } from '../schemas/product.schema';
import { Variant } from '../schemas/variant.schema';
import { slugify } from '../../../shared/utils/slug.util';
import { 
  ProductNotFoundException,
  ProductException,
  ErrorCode 
} from '../../../shared/exceptions';
import { CacheService } from '../../../shared/cache/cache.service';
import { CategoriesService } from '../../categories/categories.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    private cacheService: CacheService,
    private categoriesService: CategoriesService,
  ) {}

  // ==================== CRUD Operations ====================

  async create(dto: Partial<Product>): Promise<Product> {
    const slug = slugify(dto.nameEn!);

    // التحقق من عدم التكرار
    const existing = await this.productModel.findOne({ slug, deletedAt: null });
    if (existing) {
      throw new ProductException(ErrorCode.PRODUCT_INVALID_DATA, { slug: dto.slug, reason: 'already_exists' });
    }

    const product = await this.productModel.create({
      ...dto,
      slug,
      variantsCount: 0,
      viewsCount: 0,
      salesCount: 0,
      reviewsCount: 0,
      averageRating: 0,
    });

    // تحديث عدد المنتجات في الفئة
    if (dto.categoryId) {
      await this.categoriesService.incrementProductsCount(dto.categoryId, 1);
    }

    await this.clearCache();
    return product;
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate('categoryId')
      .populate('brandId')
      .populate('mainImageId')
      .populate('imageIds')
      .lean();

    if (!product) {
      throw new ProductNotFoundException({ productId: id });
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ slug, deletedAt: null })
      .populate('categoryId')
      .populate('brandId')
      .populate('mainImageId')
      .populate('imageIds')
      .lean();

    if (!product) {
      throw new ProductNotFoundException({ slug });
    }

    return product;
  }

  async update(id: string, dto: Partial<Product>): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new ProductNotFoundException({ productId: id });
    }

    if (product.deletedAt) {
      throw new ProductException(ErrorCode.PRODUCT_NOT_FOUND, { productId: id, reason: 'deleted' });
    }

    // تحديث الـ slug إذا تغير الاسم
    if (dto.nameEn && dto.nameEn !== product.nameEn) {
      dto.slug = slugify(dto.nameEn);
    }

    // إذا تغيرت الفئة
    const oldCategoryId = product.categoryId;
    if (dto.categoryId && String(oldCategoryId) !== String(dto.categoryId)) {
      await this.categoriesService.incrementProductsCount(String(oldCategoryId), -1);
      await this.categoriesService.incrementProductsCount(dto.categoryId, 1);
    }

    await this.productModel.updateOne({ _id: id }, { $set: dto });
    await this.clearCache();

    return this.findById(id);
  }

  async delete(id: string, userId: string): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new ProductNotFoundException({ productId: id });
    }

    // Soft delete
    product.deletedAt = new Date();
    product.deletedBy = userId;
    await product.save();

    // تحديث عدد المنتجات في الفئة
    await this.categoriesService.incrementProductsCount(String(product.categoryId), -1);

    // Soft delete جميع الـ variants
    await this.variantModel.updateMany(
      { productId: id },
      { $set: { deletedAt: new Date(), deletedBy: userId } }
    );

    await this.clearCache();
    return product;
  }

  async restore(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product || !product.deletedAt) {
      throw new ProductException(ErrorCode.PRODUCT_NOT_FOUND, { productId: id, reason: 'not_deleted' });
    }

    product.deletedAt = null;
    product.deletedBy = undefined;
    await product.save();

    // استعادة الـ variants
    await this.variantModel.updateMany(
      { productId: id },
      { $set: { deletedAt: null, deletedBy: undefined } }
    );

    // تحديث عدد المنتجات في الفئة
    await this.categoriesService.incrementProductsCount(String(product.categoryId), 1);

    await this.clearCache();
    return product;
  }

  // ==================== List & Search ====================

  async list(query: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: ProductStatus;
    isFeatured?: boolean;
    isNew?: boolean;
    includeDeleted?: boolean;
  } = {}): Promise<{ data: Product[]; meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean } }> {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      brandId,
      status,
      isFeatured,
      isNew,
      includeDeleted = false,
    } = query;

    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (!includeDeleted) {
      filter.deletedAt = null;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    if (brandId) {
      filter.brandId = brandId;
    }

    if (status) {
      filter.status = status;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    if (isNew !== undefined) {
      filter.isNew = isNew;
    }

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId')
        .populate('brandId')
        .populate('mainImageId')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  // ==================== Statistics ====================

  async incrementViews(id: string): Promise<void> {
    await this.productModel.updateOne({ _id: id }, { $inc: { viewsCount: 1 } });
  }

  async updateStats(id: string): Promise<void> {
    const variantsCount = await this.variantModel.countDocuments({
      productId: id,
      deletedAt: null,
    });

    await this.productModel.updateOne({ _id: id }, { $set: { variantsCount } });
  }

  async getStats(): Promise<{ data: { total: number; active: number; featured: number; newProducts: number; byStatus: Record<ProductStatus, number> } }> {
    const [total, active, featured, newProducts, byStatus] = await Promise.all([
      this.productModel.countDocuments({ deletedAt: null }),
      this.productModel.countDocuments({ status: ProductStatus.ACTIVE, deletedAt: null }),
      this.productModel.countDocuments({ isFeatured: true, deletedAt: null }),
      this.productModel.countDocuments({ isNew: true, deletedAt: null }),
      this.productModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusStats: Record<ProductStatus, number> = {
      draft: 0,
      active: 0,
      archived: 0,
    };

    byStatus.forEach((item: { _id: ProductStatus; count: number }) => {
      if (item._id in statusStats) {
        statusStats[item._id] = item.count;
      }
    });

    return {
      data: {
        total,
        active,
        featured,
        newProducts,
        byStatus: statusStats,
      },
    };
  }

  // ==================== Related Products ====================

  /**
   * تحديث المنتجات الشبيهة لمنتج معين
   */
  async updateRelatedProducts(productId: string, relatedProductIds: string[]): Promise<Product> {
    // التحقق من وجود المنتج
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new ProductNotFoundException({ productId });
    }

    if (product.deletedAt) {
      throw new ProductException(ErrorCode.PRODUCT_NOT_FOUND, { productId, reason: 'deleted' });
    }

    // التحقق من أن جميع المنتجات الشبيهة موجودة وغير محذوفة
    const uniqueIds = [...new Set(relatedProductIds)]; // إزالة التكرارات
    
    // إزالة المنتج نفسه من القائمة إذا كان موجوداً
    const filteredIds = uniqueIds.filter(id => id !== productId);

    if (filteredIds.length > 0) {
      const relatedProducts = await this.productModel.find({
        _id: { $in: filteredIds },
        deletedAt: null,
      });

      if (relatedProducts.length !== filteredIds.length) {
        throw new ProductException(ErrorCode.PRODUCT_INVALID_DATA, { 
          reason: 'invalid_related_products',
          provided: filteredIds.length,
          found: relatedProducts.length 
        });
      }
    }

    // تحديث المنتجات الشبيهة
    product.relatedProducts = filteredIds;
    await product.save();

    await this.clearCache();
    return this.findById(productId);
  }

  /**
   * إضافة منتج شبيه واحد
   */
  async addRelatedProduct(productId: string, relatedProductId: string): Promise<Product> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new ProductNotFoundException({ productId });
    }

    // التحقق من أن المنتج لا يضيف نفسه
    if (productId === relatedProductId) {
      throw new ProductException(ErrorCode.PRODUCT_INVALID_DATA, { reason: 'self_reference', productId });
    }

    // التحقق من وجود المنتج الشبيه
    const relatedProduct = await this.productModel.findOne({
      _id: relatedProductId,
      deletedAt: null,
    });

    if (!relatedProduct) {
      throw new ProductNotFoundException({ productId: relatedProductId });
    }

    // إضافة المنتج إذا لم يكن موجوداً بالفعل
    if (!product.relatedProducts.includes(relatedProductId)) {
      product.relatedProducts.push(relatedProductId);
      await product.save();
      await this.clearCache();
    }

    return this.findById(productId);
  }

  /**
   * إزالة منتج شبيه
   */
  async removeRelatedProduct(productId: string, relatedProductId: string): Promise<Product> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new ProductNotFoundException({ productId });
    }

    product.relatedProducts = product.relatedProducts.filter(
      id => id !== relatedProductId,
    );
    await product.save();

    await this.clearCache();
    return this.findById(productId);
  }

  /**
   * الحصول على المنتجات الشبيهة لمنتج معين
   */
  async getRelatedProducts(productId: string, limit: number = 10): Promise<Product[]> {
    const product = await this.productModel.findOne({
      _id: productId,
      deletedAt: null,
    });

    if (!product) {
      throw new ProductNotFoundException({ productId });
    }

    if (!product.relatedProducts || product.relatedProducts.length === 0) {
      return [];
    }

    // جلب المنتجات الشبيهة
    const relatedProducts = await this.productModel
      .find({
        _id: { $in: product.relatedProducts },
        deletedAt: null,
        status: ProductStatus.ACTIVE,
        isActive: true,
      })
      .populate('categoryId')
      .populate('brandId')
      .populate('mainImageId')
      .limit(limit)
      .lean();

    return relatedProducts;
  }

  // ==================== Cache Management ====================

  private async clearCache(): Promise<void> {
    try {
      await this.cacheService.clear('product:*');
      await this.cacheService.clear('products:*');
      this.logger.log('Cleared all product caches');
    } catch (error) {
      this.logger.error('Error clearing product caches:', error);
    }
  }
}

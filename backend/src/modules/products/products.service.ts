import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Product, ProductStatus } from './schemas/product.schema';
import { Variant } from './schemas/variant.schema';
import { slugify } from '../../shared/utils/slug.util';
import { AppException } from '../../shared/exceptions/app.exception';
import { CacheService } from '../../shared/cache/cache.service';
import { AttributesService } from '../attributes/attributes.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly CACHE_TTL = {
    PRODUCT_LIST: 300, // 5 minutes
    PRODUCT_DETAIL: 600, // 10 minutes
  };

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    private cacheService: CacheService,
    private attributesService: AttributesService,
    private categoriesService: CategoriesService,
  ) {}

  // ==================== Products ====================

  async createProduct(dto: Partial<Product>) {
    const slug = slugify(dto.nameEn!);

    // التحقق من عدم التكرار
    const existing = await this.productModel.findOne({ slug, deletedAt: null });
    if (existing) {
      throw new AppException('PRODUCT_SLUG_EXISTS', 'اسم المنتج موجود بالفعل', null, 400);
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

    await this.clearAllCaches();

    return product;
  }

  async updateProduct(id: string, patch: Partial<Product>) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new AppException('PRODUCT_NOT_FOUND', 'المنتج غير موجود', null, 404);
    }

    if (product.deletedAt) {
      throw new AppException('PRODUCT_DELETED', 'المنتج محذوف', null, 400);
    }

    if (patch.nameEn) {
      patch.slug = slugify(patch.nameEn);
    }

    // إذا تغيرت الفئة
    const oldCategoryId = product.categoryId;
    if (patch.categoryId && String(oldCategoryId) !== String(patch.categoryId)) {
      // تقليل العدد من الفئة القديمة
      await this.categoriesService.incrementProductsCount(String(oldCategoryId), -1);
      // زيادة العدد في الفئة الجديدة
      await this.categoriesService.incrementProductsCount(patch.categoryId, 1);
    }

    await this.productModel.updateOne({ _id: id }, { $set: patch });

    await this.clearAllCaches();

    return this.productModel.findById(id);
  }

  async getProduct(id: string) {
    const cacheKey = `product:detail:${id}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.logger.debug(`Product detail cache hit: ${id}`);
      return cached;
    }

    const product = await this.productModel.findById(id)
      .populate('categoryId')
      .populate('mainImageId')
      .populate('imageIds')
      .lean();

    if (!product) {
      throw new AppException('PRODUCT_NOT_FOUND', 'المنتج غير موجود', null, 404);
    }

    // جلب الـ variants
    const variants = await this.variantModel
      .find({ productId: id, deletedAt: null, isActive: true })
      .populate('imageId')
      .lean();

    // جلب السمات مع قيمها
    const attributesData = await Promise.all(
      product.attributes.map(async (attrId: string) => {
        return this.attributesService.getAttribute(String(attrId));
      })
    );

    const result = {
      product,
      attributes: attributesData,
      variants,
    };

    await this.cacheService.set(cacheKey, result, { ttl: this.CACHE_TTL.PRODUCT_DETAIL });

    return result;
  }

  async listProducts(query: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: ProductStatus;
    isFeatured?: boolean;
    isNew?: boolean;
    includeDeleted?: boolean;
  } = {}) {
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
    const q: FilterQuery<Product> = {};

    if (!includeDeleted) {
      q.deletedAt = null;
    }

    if (search) {
      q.$text = { $search: search };
    }

    if (categoryId) {
      q.categoryId = new Types.ObjectId(categoryId);
    }

    if (brandId) {
      q.brandId = brandId;
    }

    if (status) {
      q.status = status;
    }

    if (isFeatured !== undefined) {
      q.isFeatured = isFeatured;
    }

    if (isNew !== undefined) {
      q.isNew = isNew;
    }

    const [items, total] = await Promise.all([
      this.productModel
        .find(q)
        .populate('categoryId')
        .populate('mainImageId')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(q),
    ]);

    return {
      data: items,
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

  async deleteProduct(id: string, userId: string) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new AppException('PRODUCT_NOT_FOUND', 'المنتج غير موجود', null, 404);
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
      { $set: { deletedAt: new Date() } }
    );

    await this.clearAllCaches();

    return product;
  }

  async restoreProduct(id: string) {
    const product = await this.productModel.findById(id);

    if (!product || !product.deletedAt) {
      throw new AppException('PRODUCT_NOT_DELETED', 'المنتج غير محذوف', null, 400);
    }

    product.deletedAt = null;
    product.deletedBy = undefined;
    await product.save();

    // استعادة الـ variants
    await this.variantModel.updateMany(
      { productId: id },
      { $set: { deletedAt: null } }
    );

    // تحديث عدد المنتجات في الفئة
    await this.categoriesService.incrementProductsCount(String(product.categoryId), 1);

    await this.clearAllCaches();

    return product;
  }

  async updateProductStats(productId: string) {
    const variantsCount = await this.variantModel.countDocuments({
      productId,
      deletedAt: null,
    });

    await this.productModel.updateOne(
      { _id: productId },
      { $set: { variantsCount } }
    );
  }

  async incrementViews(productId: string) {
    await this.productModel.updateOne(
      { _id: productId },
      { $inc: { viewsCount: 1 } }
    );
  }

  async getStats() {
    const [total, active, featured, newProducts, outOfStock, byStatus] = await Promise.all([
      this.productModel.countDocuments({ deletedAt: null }),
      this.productModel.countDocuments({ status: ProductStatus.ACTIVE, deletedAt: null }),
      this.productModel.countDocuments({ isFeatured: true, deletedAt: null }),
      this.productModel.countDocuments({ isNew: true, deletedAt: null }),
      this.productModel.countDocuments({ status: ProductStatus.OUT_OF_STOCK, deletedAt: null }),
      this.productModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusStats: Record<ProductStatus, number> = {
      draft: 0,
      active: 0,
      out_of_stock: 0,
      discontinued: 0,
    };
    byStatus.forEach((item: { _id: ProductStatus; count: number }) => {
      statusStats[item._id] = item.count;
    });

    return {
      data: {
        total,
        active,
        featured,
        newProducts,
        outOfStock,
        byStatus: statusStats,
      },
    };
  }

  async getProductsCount() {
    const count = await this.productModel.countDocuments({ 
      status: ProductStatus.ACTIVE, 
      deletedAt: null 
    });
    return count;
  }

  async clearAllCaches() {
    try {
      await this.cacheService.clear('product:*');
      await this.cacheService.clear('products:*');
      this.logger.log('Cleared all product caches');
    } catch (error) {
      this.logger.error('Error clearing product caches:', error);
    }
  }
}


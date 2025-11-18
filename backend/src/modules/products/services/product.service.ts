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
import { ProductPricingCalculatorService } from './product-pricing-calculator.service';
import { VariantService } from './variant.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    private cacheService: CacheService,
    private categoriesService: CategoriesService,
    private productPricingCalculator: ProductPricingCalculatorService,
    private variantService: VariantService,
  ) {}

  // ==================== CRUD Operations ====================

  async create(dto: Partial<Product>): Promise<Product> {
    const slug = slugify(dto.nameEn!);

    // التحقق من عدم التكرار
    const existing = await this.productModel.findOne({ slug, deletedAt: null });
    if (existing) {
      throw new ProductException(ErrorCode.PRODUCT_INVALID_DATA, { slug: dto.slug, reason: 'already_exists' });
    }

    const pricingFields = await this.buildDerivedPricingFields(dto);

    const product = await this.productModel.create({
      ...dto,
      ...pricingFields,
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

  async findByIds(ids: string[]): Promise<Product[]> {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    const objectIds = ids
      .filter((id): id is string => typeof id === 'string' && Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (objectIds.length === 0) {
      return [];
    }

    const products = await this.productModel
      .find({
        _id: { $in: objectIds },
        deletedAt: null,
      })
      .lean();

    return products as unknown as Product[];
  }

  async update(id: string, dto: Partial<Product>): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new ProductNotFoundException({ productId: id });
    }

    if (product.deletedAt) {
      throw new ProductException(ErrorCode.PRODUCT_NOT_FOUND, { productId: id, reason: 'deleted' });
    }

    // استخراج الحقول المتعلقة بتوليد المتغيرات قبل التحديث
    const autoGenerateVariants = (dto as any).autoGenerateVariants;
    const variantDefaultPrice = (dto as any).variantDefaultPrice;
    const variantDefaultStock = (dto as any).variantDefaultStock;
    const overwriteExistingVariants = (dto as any).overwriteExistingVariants ?? false;

    // إزالة الحقول المتعلقة بتوليد المتغيرات من dto لأنها ليست حقول في Product
    const { autoGenerateVariants: _, variantDefaultPrice: __, variantDefaultStock: ___, overwriteExistingVariants: ____, ...productUpdateDto } = dto as any;

    // التحقق من تغيير السمات
    const oldAttributes = (product.attributes || []).map(String).sort();
    const newAttributes = (productUpdateDto.attributes || product.attributes || []).map(String).sort();
    const attributesChanged = JSON.stringify(oldAttributes) !== JSON.stringify(newAttributes);

    // تحديث الـ slug إذا تغير الاسم
    if (productUpdateDto.nameEn && productUpdateDto.nameEn !== product.nameEn) {
      productUpdateDto.slug = slugify(productUpdateDto.nameEn);
    }

    // إذا تغيرت الفئة
    const oldCategoryId = product.categoryId;
    if (productUpdateDto.categoryId && String(oldCategoryId) !== String(productUpdateDto.categoryId)) {
      await this.categoriesService.incrementProductsCount(String(oldCategoryId), -1);
      await this.categoriesService.incrementProductsCount(productUpdateDto.categoryId, 1);
    }

    const pricingFieldsTouched =
      Object.prototype.hasOwnProperty.call(productUpdateDto, 'basePriceUSD') ||
      Object.prototype.hasOwnProperty.call(productUpdateDto, 'compareAtPriceUSD') ||
      Object.prototype.hasOwnProperty.call(productUpdateDto, 'costPriceUSD');

    const pricingFields = pricingFieldsTouched
      ? await this.buildDerivedPricingFields({ ...product.toObject(), ...productUpdateDto })
      : {};

    await this.productModel.updateOne(
      { _id: id },
      { $set: { ...productUpdateDto, ...pricingFields } },
    );
    await this.clearCache();

    // توليد المتغيرات تلقائياً إذا تم تحديث السمات
    const finalAttributes = productUpdateDto.attributes || product.attributes || [];
    if (attributesChanged && finalAttributes.length > 0) {
      const shouldAutoGenerate = autoGenerateVariants !== false; // افتراضياً true إذا لم يتم تحديده
      
      if (shouldAutoGenerate) {
        try {
          // استخدام القيم المحددة أو القيم الافتراضية من المنتج
          const defaultPrice = variantDefaultPrice ?? productUpdateDto.basePriceUSD ?? product.basePriceUSD ?? 0;
          const defaultStock = variantDefaultStock ?? productUpdateDto.stock ?? product.stock ?? 0;

          if (defaultPrice > 0) {
            await this.variantService.generateVariants(
              id,
              defaultPrice,
              defaultStock,
              overwriteExistingVariants,
            );
            this.logger.log(`Auto-generated variants for product ${id} after attributes update`);
          } else {
            this.logger.warn(`Skipping auto-generation for product ${id}: defaultPrice is 0 or not set`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorStack = error instanceof Error ? error.stack : undefined;
          this.logger.error(`Failed to auto-generate variants for product ${id}: ${errorMessage}`, errorStack);
          // لا نرمي الخطأ لأن التحديث تم بنجاح، فقط نسجل الخطأ
        }
      }
    }

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
    isActive?: boolean;
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
      isActive,
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
      const candidates: Array<string | Types.ObjectId> = [];

      if (Types.ObjectId.isValid(categoryId)) {
        const objectId = new Types.ObjectId(categoryId);
        candidates.push(objectId);
        candidates.push(objectId.toHexString());
      } else {
        candidates.push(categoryId);
      }

      filter.categoryId =
        candidates.length === 1 ? candidates[0] : { $in: candidates };
    }

    if (brandId) {
      filter.brandId = brandId;
    }

    if (status) {
      filter.status = status;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
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

  private async buildDerivedPricingFields(
    source: Partial<Product>,
  ): Promise<Partial<Product>> {
    const hasUsdPricing =
      source.basePriceUSD !== undefined ||
      source.compareAtPriceUSD !== undefined ||
      source.costPriceUSD !== undefined;

    if (!hasUsdPricing) {
      return {};
    }

    const derived = await this.productPricingCalculator.calculateProductPricing({
      basePriceUSD: source.basePriceUSD,
      compareAtPriceUSD: source.compareAtPriceUSD,
      costPriceUSD: source.costPriceUSD,
    });

    return derived;
  }

  // ==================== Cache Management ====================

  private async clearCache(): Promise<void> {
    try {
      await this.cacheService.clear('product:');
      await this.cacheService.clear('products:');
      await this.cacheService.clear('response:');
      this.logger.log('Cleared all product caches');
    } catch (error) {
      this.logger.error('Error clearing product caches:', error);
    }
  }
}

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
    this.logger.log(`Creating product: ${dto.nameEn}`, {
      name: dto.name,
      nameEn: dto.nameEn,
      categoryId: dto.categoryId,
      basePriceUSD: dto.basePriceUSD,
    });

    try {
      let slug = slugify(dto.nameEn!);
      const originalSlug = slug;
      
      this.logger.debug(`Checking for existing product with slug: ${slug}`, {
        nameEn: dto.nameEn,
        generatedSlug: slug,
      });

      // التحقق من عدم التكرار - البحث عن أي منتج بنفس slug (حتى المحذوف)
      const existing = await this.productModel.findOne({ slug });
      if (existing) {
        // إذا كان المنتج موجوداً وغير محذوف، نرفض الإنشاء
        if (!existing.deletedAt) {
          this.logger.warn(`Product with slug ${slug} already exists (not deleted)`, {
            existingProductId: existing._id,
            existingName: existing.nameEn,
            newName: dto.nameEn,
          });
          throw new ProductException(ErrorCode.PRODUCT_INVALID_DATA, { 
            slug, 
            reason: 'already_exists',
            existingProductId: String(existing._id),
            message: `منتج بنفس الاسم الإنجليزي موجود مسبقاً: ${existing.nameEn}`,
          });
        }
        
        // إذا كان المنتج محذوفاً، ننشئ slug فريد بإضافة timestamp
        // التأكد من أن الـ slug الجديد فريد (حتى لو كان هناك عدة منتجات محذوفة)
        let counter = 1;
        const baseTimestamp = Date.now();
        let newSlug = `${originalSlug}-${baseTimestamp}`;
        
        while (await this.productModel.findOne({ slug: newSlug })) {
          newSlug = `${originalSlug}-${baseTimestamp}-${counter}`;
          counter++;
          
          // حماية من loop لانهائي (غير محتمل لكن احتياطي)
          if (counter > 1000) {
            throw new ProductException(ErrorCode.PRODUCT_CREATE_FAILED, {
              reason: 'slug_generation_failed',
              message: 'فشل في إنشاء slug فريد للمنتج',
            });
          }
        }
        
        slug = newSlug;
        this.logger.warn(`Product with slug ${originalSlug} was deleted, using new slug: ${slug}`, {
          originalSlug,
          newSlug: slug,
          deletedProductId: existing._id,
        });
      }

      // إضافة retry logic لـ buildDerivedPricingFields
      let pricingFields: Partial<Product> = {};
      let retries = 3;
      while (retries > 0) {
        try {
          pricingFields = await this.buildDerivedPricingFields(dto);
          this.logger.log(`Pricing fields calculated successfully`);
          break;
        } catch (error) {
          retries--;
          const err = error instanceof Error ? error : new Error(String(error));
          if (retries === 0) {
            this.logger.error('Failed to calculate pricing fields after 3 attempts', {
              error: err.message,
              productName: dto.nameEn,
            });
            // لا نرمي خطأ هنا، نستخدم البيانات الأساسية فقط
            this.logger.warn('Continuing with base pricing only');
          } else {
            this.logger.warn(`Retrying pricing calculation, ${retries} attempts remaining`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

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

      this.logger.log(`Product created successfully: ${product._id}`);

      // تحديث عدد المنتجات في الفئة
      if (dto.categoryId) {
        try {
          await this.categoriesService.incrementProductsCount(dto.categoryId, 1);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          this.logger.warn(`Failed to increment category products count: ${err.message}`);
        }
      }

      await this.clearCache();
      return product;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Error creating product: ${err.message}`, {
        error: err.message,
        stack: err.stack,
        dto: {
          name: dto.name,
          nameEn: dto.nameEn,
          categoryId: dto.categoryId,
          basePriceUSD: dto.basePriceUSD,
        },
      });

      // إعادة رمي الخطأ
      if (error instanceof ProductException || error instanceof ProductNotFoundException) {
        throw error;
      }

      // معالجة أخطاء MongoDB
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        const mongoError = error as { keyPattern?: Record<string, unknown> };
        const field = Object.keys(mongoError.keyPattern || {})[0] || 'field';
        throw new ProductException(ErrorCode.PRODUCT_INVALID_DATA, {
          reason: 'duplicate_field',
          field,
          message: `${field} موجود مسبقاً`,
        });
      }

      throw new ProductException(ErrorCode.PRODUCT_CREATE_FAILED, {
        name: dto.name,
        nameEn: dto.nameEn,
        error: err.message,
      });
    }
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

    // إضافة isAvailable يدوياً لأن .lean() لا يرجع virtual fields
    const productWithAvailability = product as Product & { isAvailable?: boolean };
    if (productWithAvailability) {
      // حساب isAvailable
      if (!productWithAvailability.isActive || productWithAvailability.status !== ProductStatus.ACTIVE) {
        productWithAvailability.isAvailable = false;
      } else if (productWithAvailability.variantsCount > 0) {
        // للمنتجات مع variants، افتراضي true (سيتم التحقق الفعلي في service layer)
        productWithAvailability.isAvailable = true;
      } else if (productWithAvailability.trackStock) {
        productWithAvailability.isAvailable = (productWithAvailability.stock ?? 0) > 0;
      } else {
        productWithAvailability.isAvailable = true;
      }
    }

    return productWithAvailability;
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
      .populate('mainImageId')
      .populate('imageIds')
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
    includeSubcategories?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
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
      includeSubcategories = true, // افتراضي: true لتضمين الفئات الفرعية في admin و public
      sortBy,
      sortOrder,
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
      let categoryIds: Array<string | Types.ObjectId> = [];

      // إذا كان includeSubcategories مفعل، نجلب جميع الفئات الفرعية
      if (includeSubcategories) {
        try {
          // جلب جميع الفئات الفرعية (descendants)
          const descendants = await this.categoriesService.getCategoryDescendants(categoryId, true);
          this.logger.debug(`Category descendants for ${categoryId}:`, { count: descendants.length, ids: descendants });
          categoryIds = descendants.map((id) => {
            if (Types.ObjectId.isValid(id)) {
              return new Types.ObjectId(id);
            }
            return id;
          });
        } catch (error) {
          this.logger.warn(`Failed to get category descendants for ${categoryId}, using direct category only`, {
            error: error instanceof Error ? error.message : String(error),
          });
          // في حالة الخطأ، نستخدم الفئة المباشرة فقط
          if (Types.ObjectId.isValid(categoryId)) {
            categoryIds = [new Types.ObjectId(categoryId)];
          } else {
            categoryIds = [categoryId];
          }
        }
      } else {
        // استخدام الفئة المباشرة فقط
        if (Types.ObjectId.isValid(categoryId)) {
          categoryIds = [new Types.ObjectId(categoryId)];
        } else {
          categoryIds = [categoryId];
        }
      }

      this.logger.debug(`Filtering products by categoryIds:`, { 
        categoryId, 
        categoryIdsCount: categoryIds.length,
        categoryIds: categoryIds.map(id => id.toString()),
        includeSubcategories 
      });

      // تحويل جميع IDs إلى ObjectId للتأكد من التطابق
      const objectIds = categoryIds.map((id) => {
        if (id instanceof Types.ObjectId) {
          return id;
        }
        if (Types.ObjectId.isValid(String(id))) {
          return new Types.ObjectId(String(id));
        }
        this.logger.warn(`Invalid categoryId format: ${id}`);
        return id;
      });

      this.logger.debug(`Converted categoryIds to ObjectIds:`, {
        original: categoryIds.map(id => String(id)),
        converted: objectIds.map(id => id instanceof Types.ObjectId ? id.toString() : String(id)),
      });

      // التأكد من أن جميع IDs هي ObjectId صحيحة
      const validObjectIds = objectIds.filter(id => id instanceof Types.ObjectId);
      
      if (validObjectIds.length === 0) {
        this.logger.warn(`No valid ObjectIds found for categoryId: ${categoryId}`);
      } else {
        // استخدام $in مع string فقط لأن MongoDB قد لا يطابق ObjectId مع string بشكل موثوق في $in
        // المنتجات في قاعدة البيانات تحتوي على categoryId كـ string
        const categoryIdStrs = validObjectIds.map(id => id.toString());
        
        // استخدام $in مع string فقط للتأكد من المطابقة
        if (categoryIdStrs.length === 1) {
          filter.categoryId = categoryIdStrs[0];
        } else {
          filter.categoryId = { $in: categoryIdStrs };
        }
      }
      
      this.logger.debug(`Final categoryId filter:`, {
        type: validObjectIds.length === 1 ? 'single' : 'array',
        value: validObjectIds.length === 1 
          ? validObjectIds[0].toString()
          : validObjectIds.map(id => id.toString()),
        usingInWithBothTypes: true,
      });
    }

    if (brandId) {
      // تحويل brandId إلى ObjectId أيضاً للتأكد من التطابق
      if (Types.ObjectId.isValid(brandId)) {
        filter.brandId = new Types.ObjectId(brandId);
      } else {
        filter.brandId = brandId;
      }
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

    // تحديد الترتيب: إذا تم تحديد sortBy و sortOrder، نستخدمهما، وإلا نستخدم الترتيب الافتراضي (الأحدث أولاً)
    let sortCriteria: Record<string, 1 | -1> = {};
    
    if (sortBy && sortOrder) {
      // ترتيب مخصص من المستخدم
      sortCriteria[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      // الترتيب الافتراضي: الأحدث أولاً (createdAt: -1)، ثم الترتيب اليدوي (order: 1)
      sortCriteria = { createdAt: -1, order: 1 };
    }

    // تحويل filter إلى format يمكن loggingه بشكل صحيح
    const filterForLogging: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(filter)) {
      if (key === '$and' || key === '$or') {
        // معالجة خاصة لـ $and و $or
        const arrayValue = value as unknown[];
        filterForLogging[key] = arrayValue.map((item: unknown) => {
          if (typeof item === 'object' && item !== null) {
            const itemRecord = item as Record<string, unknown>;
            const loggedItem: Record<string, unknown> = {};
            for (const [subKey, subValue] of Object.entries(itemRecord)) {
              if (subKey === '$or' || subKey === '$in') {
                const subArray = subValue as unknown[];
                loggedItem[subKey] = subArray.map((v: unknown) => {
                  if (v instanceof Types.ObjectId) {
                    return `ObjectId("${v.toString()}")`;
                  } else if (typeof v === 'object' && v !== null && '$in' in v) {
                    const inArray = (v as { $in: unknown[] }).$in;
                    return {
                      $in: inArray.map((iv: unknown) =>
                        iv instanceof Types.ObjectId ? `ObjectId("${iv.toString()}")` : String(iv)
                      )
                    };
                  }
                  return String(v);
                });
              } else if (subValue instanceof Types.ObjectId) {
                loggedItem[subKey] = `ObjectId("${subValue.toString()}")`;
              } else {
                loggedItem[subKey] = subValue;
              }
            }
            return loggedItem;
          }
          return item;
        });
      } else if (value instanceof Types.ObjectId) {
        filterForLogging[key] = `ObjectId("${value.toString()}")`;
      } else if (typeof value === 'object' && value !== null && '$in' in value && Array.isArray(value.$in)) {
        // معالجة $in operator
        filterForLogging[key] = { 
          $in: (value.$in as unknown[]).map((v: unknown) => 
            v instanceof Types.ObjectId ? `ObjectId("${v.toString()}")` : String(v)
          ) 
        };
      } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Types.ObjectId) {
        filterForLogging[key] = value.map((v: Types.ObjectId) => `ObjectId("${v.toString()}")`);
      } else {
        filterForLogging[key] = value;
      }
    }
    
    this.logger.debug(`Product list filter:`, filterForLogging);

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId')
        .populate('brandId')
        .populate('mainImageId')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    // إذا لم يتم العثور على منتجات، نتحقق من المنتجات بدون فلترة صارمة
    // التحقق من وجود categoryId في filter أو في $and/$or
    const hasCategoryFilter = !!filter.categoryId || 
      (filter.$and && Array.isArray(filter.$and) && filter.$and.some((item: unknown) => {
        if (typeof item === 'object' && item !== null) {
          const itemRecord = item as Record<string, unknown>;
          return '$or' in itemRecord || 'categoryId' in itemRecord;
        }
        return false;
      })) ||
      (filter.$or && Array.isArray(filter.$or) && filter.$or.some((item: unknown) => {
        if (typeof item === 'object' && item !== null) {
          const itemRecord = item as Record<string, unknown>;
          return 'categoryId' in itemRecord;
        }
        return false;
      }));
    
    if (total === 0 && hasCategoryFilter) {
      let categoryIdForCheck: Types.ObjectId;
      const categoryIdFilter = filter.categoryId;
      
      if (categoryIdFilter instanceof Types.ObjectId) {
        categoryIdForCheck = categoryIdFilter;
      } else if (categoryIdFilter && typeof categoryIdFilter === 'object' && '$in' in categoryIdFilter && Array.isArray(categoryIdFilter.$in)) {
        // إذا كان $in operator، نستخدم أول ObjectId من المصفوفة
        const inArray = categoryIdFilter.$in as unknown[];
        const firstObjectId = inArray.find((id: unknown) => id instanceof Types.ObjectId);
        if (firstObjectId instanceof Types.ObjectId) {
          categoryIdForCheck = firstObjectId;
        } else {
          // إذا لم يكن هناك ObjectId، نستخدم أول عنصر ونحوله إلى ObjectId
          categoryIdForCheck = new Types.ObjectId(String(inArray[0]));
        }
      } else if (categoryIdFilter) {
        categoryIdForCheck = new Types.ObjectId(String(categoryIdFilter));
      } else if (categoryId && Types.ObjectId.isValid(categoryId)) {
        // إذا لم يكن هناك categoryId في الفلتر، نستخدم categoryId الأصلي من الـ query
        categoryIdForCheck = new Types.ObjectId(categoryId);
      } else {
        // إذا لم يكن هناك categoryId صالح، نستخدم categoryId الأصلي كـ string
        this.logger.warn(`Cannot determine categoryIdForCheck, skipping debug check`);
        // إضافة isAvailable يدوياً
        const dataWithAvailability = (data as Array<Product & { isAvailable?: boolean }>).map((product) => {
          if (!product.isActive || product.status !== ProductStatus.ACTIVE) {
            product.isAvailable = false;
          } else if (product.variantsCount > 0) {
            product.isAvailable = true;
          } else if (product.trackStock) {
            product.isAvailable = (product.stock ?? 0) > 0;
          } else {
            product.isAvailable = true;
          }
          return product;
        });
        return {
          data: dataWithAvailability,
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
      
      // التحقق من المنتجات مع ObjectId
      const productsWithObjectId = await this.productModel.countDocuments({
        categoryId: categoryIdForCheck,
      });
      
      // التحقق من المنتجات مع string (في حالة أن categoryId مخزن كـ string في قاعدة البيانات)
      const categoryIdString = categoryIdForCheck.toString();
      const productsWithString = await this.productModel.countDocuments({
        categoryId: categoryIdString,
      });
      
      // التحقق من المنتجات النشطة
      const activeProductsWithObjectId = await this.productModel.countDocuments({
        categoryId: categoryIdForCheck,
        status: ProductStatus.ACTIVE,
        isActive: true,
        deletedAt: null,
      });
      
      const activeProductsWithString = await this.productModel.countDocuments({
        categoryId: categoryIdString,
        status: ProductStatus.ACTIVE,
        isActive: true,
        deletedAt: null,
      });
      
      // جلب عينة من منتج واحد لفحص نوع categoryId
      const sampleProduct = await this.productModel.findOne({ categoryId: categoryIdForCheck }).lean();
      let sampleCategoryIdType = 'N/A';
      if (sampleProduct?.categoryId) {
        const catId = sampleProduct.categoryId;
        // التحقق من نوع categoryId
        if (typeof catId === 'string') {
          sampleCategoryIdType = 'string';
        } else if (catId && typeof catId === 'object') {
          // التحقق من خصائص ObjectId
          const objId = catId as { constructor?: { name?: string }; _bsontype?: string };
          if (objId.constructor?.name === 'ObjectId' || objId._bsontype === 'ObjectId') {
            sampleCategoryIdType = 'ObjectId';
          } else {
            sampleCategoryIdType = typeof catId;
          }
        } else {
          sampleCategoryIdType = typeof catId;
        }
      }
      
      this.logger.warn(`No products found with filters. Debug info:`, {
        categoryId: categoryIdForCheck.toString(),
        totalProductsInCategoryWithObjectId: productsWithObjectId,
        totalProductsInCategoryWithString: productsWithString,
        activeProductsInCategoryWithObjectId: activeProductsWithObjectId,
        activeProductsInCategoryWithString: activeProductsWithString,
        sampleCategoryIdType,
        filter: filterForLogging,
      });
    }

    // إضافة isAvailable يدوياً لأن .lean() لا يرجع virtual fields
    const dataWithAvailability = (data as Array<Product & { isAvailable?: boolean }>).map((product) => {
      if (!product.isActive || product.status !== ProductStatus.ACTIVE) {
        product.isAvailable = false;
      } else if (product.variantsCount > 0) {
        // للمنتجات مع variants، افتراضي true (سيتم التحقق الفعلي في service layer)
        product.isAvailable = true;
      } else if (product.trackStock) {
        product.isAvailable = (product.stock ?? 0) > 0;
      } else {
        product.isAvailable = true;
      }
      return product;
    });

    this.logger.debug(`Product list result:`, { 
      found: dataWithAvailability.length, 
      total, 
      filter: filterForLogging
    });

    return {
      data: dataWithAvailability,
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

  /**
   * تحديث عدد المبيعات للمنتج
   */
  async incrementSalesCount(productId: string, quantity: number = 1): Promise<void> {
    if (quantity <= 0) {
      this.logger.warn(`Invalid quantity for salesCount increment: ${quantity}`);
      return;
    }
    await this.productModel.updateOne(
      { _id: productId },
      { $inc: { salesCount: quantity } }
    );
    this.logger.debug(`Incremented salesCount for product ${productId} by ${quantity}`);
  }

  /**
   * التحقق من توفر المنتج
   */
  async getProductAvailability(productId: string): Promise<{
    isAvailable: boolean;
    availableStock?: number;
    reason?: string;
  }> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      return { isAvailable: false, reason: 'PRODUCT_NOT_FOUND' };
    }

    if (!product.isActive || product.status !== ProductStatus.ACTIVE) {
      return { isAvailable: false, reason: 'PRODUCT_NOT_ACTIVE' };
    }

    // إذا كان المنتج لديه variants
    if (product.variantsCount > 0) {
      const variants = await this.variantModel.find({
        productId: product._id,
        deletedAt: null,
        isActive: true,
      });

      const availableVariants = variants.filter(v => {
        if (!v.isAvailable) return false;
        if (v.trackInventory && v.stock <= 0) return false;
        return true;
      });

      return {
        isAvailable: availableVariants.length > 0,
        availableStock: availableVariants.reduce((sum, v) => sum + v.stock, 0),
      };
    }

    // للمنتجات البسيطة
    if (product.trackStock) {
      const stock = product.stock ?? 0;
      return {
        isAvailable: stock > 0,
        availableStock: stock,
      };
    }

    return { isAvailable: true };
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

    try {
      const derived = await this.productPricingCalculator.calculateProductPricing({
        basePriceUSD: source.basePriceUSD,
        compareAtPriceUSD: source.compareAtPriceUSD,
        costPriceUSD: source.costPriceUSD,
      });

      return derived;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Error calculating derived pricing fields: ${err.message}`, {
        error: err.message,
        basePriceUSD: source.basePriceUSD,
        compareAtPriceUSD: source.compareAtPriceUSD,
        costPriceUSD: source.costPriceUSD,
      });
      
      // إعادة رمي الخطأ إذا كان من نوع ProductException
      if (error instanceof ProductException) {
        throw error;
      }
      
      throw new ProductException(ErrorCode.PRODUCT_INVALID_PRICE, {
        basePriceUSD: source.basePriceUSD,
        compareAtPriceUSD: source.compareAtPriceUSD,
        costPriceUSD: source.costPriceUSD,
        error: err.message,
      });
    }
  }

  // ==================== Cache Management ====================

  async clearCache(): Promise<void> {
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

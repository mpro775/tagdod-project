import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { slugify } from '../../shared/utils/slug.util';
import { CacheService } from '../../shared/cache/cache.service';
import {
  CategoryNotFoundException,
  CategoryAlreadyExistsException,
  CategoryException,
  ErrorCode 
} from '../../shared/exceptions';

type CategoryBreadcrumb = {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
};

type CategoryLean = Category & {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CategoryDetail = CategoryLean & {
  children: CategoryLean[];
  breadcrumbs: CategoryBreadcrumb[];
};

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  private readonly CACHE_TTL = {
    CATEGORIES: 1800, // 30 minutes
    CATEGORY_TREE: 3600, // 1 hour
    CATEGORY_DETAIL: 600, // 10 minutes
  };

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private cacheService: CacheService,
  ) {}

  // ==================== إنشاء فئة ====================
  async createCategory(dto: Partial<Category>) {
    try {
      const slug = slugify(dto.nameEn!);

      // التحقق من عدم تكرار الـ slug
      const existing = await this.categoryModel.findOne({ slug, deletedAt: null });
      if (existing) {
        throw new CategoryAlreadyExistsException({ slug, categoryId: existing._id.toString() });
      }

      if (dto.parentId) {
        const parent = await this.categoryModel.findById(dto.parentId).lean();
        if (!parent) {
          throw new CategoryException(ErrorCode.CATEGORY_INVALID_PARENT, { parentId: dto.parentId });
        }
        if (parent.deletedAt) {
          throw new CategoryException(ErrorCode.CATEGORY_INVALID_PARENT, { parentId: dto.parentId, reason: 'deleted' });
        }

        // تحديث عدد الأطفال للأب
        await this.categoryModel.updateOne({ _id: dto.parentId }, { $inc: { childrenCount: 1 } });
      }

      const category = await this.categoryModel.create({
        ...dto,
        parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : null,
        slug,
        order: dto.order || 0,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        childrenCount: 0,
        productsCount: 0,
      });

      // Clear category caches
      await this.clearAllCaches();

      return category;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to create category', {
        error: err.message,
        stack: err.stack,
        name: dto.name,
        nameEn: dto.nameEn,
        parentId: dto.parentId,
      });

      // إعادة رمي الخطأ إذا كان من نوع CategoryException
      if (error instanceof CategoryException) {
        throw error;
      }

      // معالجة أخطاء MongoDB
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        const mongoError = error as { keyPattern?: Record<string, unknown> };
        const field = Object.keys(mongoError.keyPattern || {})[0] || 'field';
        throw new CategoryException(ErrorCode.CATEGORY_INVALID_DATA, {
          reason: 'duplicate_field',
          field,
          message: `${field} موجود مسبقاً`,
        });
      }

      throw new CategoryException(ErrorCode.CATEGORY_CREATE_FAILED, {
        name: dto.name,
        nameEn: dto.nameEn,
        parentId: dto.parentId,
        error: err.message,
      });
    }
  }

  // ==================== تحديث فئة ====================
  async updateCategory(id: string, patch: Partial<Category>) {
    try {
      const category = await this.categoryModel.findById(id);
      if (!category) {
        throw new CategoryNotFoundException({ categoryId: id });
      }

      if (category.deletedAt) {
        throw new CategoryNotFoundException({ categoryId: id, reason: 'deleted' });
      }

      if (patch.nameEn) {
        const slug = slugify(patch.nameEn);

        // التحقق من عدم تكرار الـ slug
        const existing = await this.categoryModel.findOne({
          slug,
          _id: { $ne: id },
          deletedAt: null,
        });
        if (existing) {
          throw new CategoryAlreadyExistsException({ slug, categoryId: existing._id.toString() });
        }

        patch.slug = slug;
      }

      // إذا تم تغيير parentId، نحتاج لتحديث الأطفال
      if (patch.parentId !== undefined && patch.parentId !== category.parentId) {
        await this.handleParentChange(id, category.parentId || null, patch.parentId || null);
      }

      await this.categoryModel.updateOne({ _id: id }, { $set: patch });

      const updated = await this.categoryModel.findById(id);

      // Clear category caches
      await this.clearAllCaches();

      return updated;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to update category', {
        error: err.message,
        stack: err.stack,
        categoryId: id,
      });

      // إعادة رمي الخطأ إذا كان من نوع CategoryException
      if (error instanceof CategoryException || error instanceof CategoryNotFoundException) {
        throw error;
      }

      throw new CategoryException(ErrorCode.CATEGORY_UPDATE_FAILED, {
        categoryId: id,
        error: err.message,
      });
    }
  }

  // ==================== عرض فئة واحدة ====================
  async getCategory(identifier: string): Promise<CategoryDetail> {
    let ver = 1;
    let categoryId = identifier;

    // Determine if identifier is ObjectId or slug
    try {
      if (!Types.ObjectId.isValid(identifier)) {
        const categoryBySlug = await this.categoryModel
          .findOne({ slug: identifier, deletedAt: null, isActive: true })
          .select('_id')
          .lean<{ _id: Types.ObjectId }>();

        if (!categoryBySlug) {
          throw new CategoryNotFoundException({ categoryId: identifier });
        }

        categoryId = categoryBySlug._id.toString();
      }
    } catch (error) {
      if (error instanceof CategoryNotFoundException) {
        throw error;
      }
      this.logger.error('Failed to resolve category identifier:', error instanceof Error ? error.message : String(error));
      throw new CategoryException(
        ErrorCode.DATABASE_ERROR,
        { 
          originalError: error instanceof Error ? error.message : String(error),
          identifier,
        },
      );
    }

    // Try to get cache version (graceful degradation if Redis fails)
    try {
      ver = await this.getCacheVersion();
    } catch (error) {
      this.logger.warn('Failed to get cache version for category detail, using default:', error instanceof Error ? error.message : String(error));
    }

    const cacheKey = `categories:v${ver}:detail:${categoryId}`;

    // Try to get from cache
    try {
      const cached = await this.cacheService.get<CategoryDetail>(cacheKey);
      if (cached) {
        this.logger.debug(`Category detail cache hit: ${categoryId}`);
        return cached;
      }
    } catch (error) {
      this.logger.warn('Cache read failed for category detail, proceeding to database:', error instanceof Error ? error.message : String(error));
    }

    // Fetch from database
    let categoryDoc;
    try {
      categoryDoc = await this.categoryModel
        .findOne({
          _id: categoryId,
          deletedAt: null,
          isActive: true,
        })
        .populate('imageId')
        .lean();
    } catch (error) {
      this.logger.error('Database query failed in getCategory:', error instanceof Error ? error.message : String(error));
      throw new CategoryException(
        ErrorCode.DATABASE_ERROR,
        { 
          originalError: error instanceof Error ? error.message : String(error),
          categoryId,
        },
      );
    }

    const category = categoryDoc as CategoryLean | null;

    if (!category) {
      throw new CategoryNotFoundException({ categoryId: identifier });
    }

    // جلب الأطفال
    let childrenDocs;
    try {
      childrenDocs = await this.categoryModel
        .find({ parentId: categoryId, deletedAt: null, isActive: true })
        .sort({ order: 1, name: 1 })
        .lean();
    } catch (error) {
      this.logger.error('Failed to fetch category children:', error instanceof Error ? error.message : String(error));
      throw new CategoryException(
        ErrorCode.DATABASE_ERROR,
        { 
          originalError: error instanceof Error ? error.message : String(error),
          categoryId,
        },
      );
    }

    const children = childrenDocs as CategoryLean[];

    // جلب breadcrumbs
    let breadcrumbs: CategoryBreadcrumb[];
    try {
      breadcrumbs = await this.getBreadcrumbs(categoryId);
    } catch (error) {
      this.logger.warn('Failed to get breadcrumbs, continuing without them:', error instanceof Error ? error.message : String(error));
      breadcrumbs = [];
    }

    const result: CategoryDetail = {
      ...category,
      children,
      breadcrumbs,
    };

    // Try to cache the result (graceful degradation if Redis fails)
    try {
      await this.cacheService.set(cacheKey, result, { ttl: this.CACHE_TTL.CATEGORY_DETAIL });
    } catch (error) {
      this.logger.warn('Cache write failed for category detail, but data retrieved successfully:', error instanceof Error ? error.message : String(error));
    }

    return result;
  }

  // ==================== قائمة الفئات ====================
  async listCategories(
    query: {
      parentId?: string | null;
      search?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      includeDeleted?: boolean;
      force?: boolean;
    } = {},
  ) {
    const { parentId, search, isActive, isFeatured, includeDeleted = false, force = false } = query;

    let ver = 1;
    let key = '';
    
    // Try to get cache version (graceful degradation if Redis fails)
    try {
      ver = await this.getCacheVersion();
      key = `categories:v${ver}:list:${this.normalizeQuery(query)}`;
    } catch (error) {
      this.logger.warn('Failed to get cache version, using default:', error instanceof Error ? error.message : String(error));
      key = `categories:v1:list:${this.normalizeQuery(query)}`;
    }

    // Try to get from cache first (unless force refresh)
    if (!force) {
      try {
        const cached = await this.cacheService.get<Category[]>(key);
        if (cached) {
          this.logger.debug(`Categories cache hit`);
          return cached;
        }
      } catch (error) {
        this.logger.warn('Cache read failed, proceeding to database:', error instanceof Error ? error.message : String(error));
      }
    }

    // Build query
    const q: Record<string, unknown> = {};

    if (!includeDeleted) {
      q.deletedAt = null;
    }

    // عرض الفئات النشطة افتراضياً لتطابق العرض الشجري
    if (isActive === undefined) {
      q.isActive = true;
    } else {
      q.isActive = isActive;
    }

    // تحسين معالجة parentId
    if (parentId !== undefined) {
      const isNullish = parentId === null || parentId === 'null' || parentId === '' || parentId === 'undefined';
      q.parentId = isNullish ? null : new Types.ObjectId(parentId);
    }

    if (search) {
      q.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isFeatured !== undefined) {
      q.isFeatured = isFeatured;
    }

    // Fetch from database
    let categories;
    try {
      categories = await this.categoryModel
        .find(q)
        .populate('imageId')
        .sort({ order: 1, name: 1 })
        .lean();
    } catch (error) {
      this.logger.error('Database query failed in listCategories:', error instanceof Error ? error.message : String(error));
      throw new CategoryException(
        ErrorCode.DATABASE_ERROR,
        { 
          originalError: error instanceof Error ? error.message : String(error),
          query: q,
        },
      );
    }

    // Try to cache the result (graceful degradation if Redis fails)
    try {
      await this.cacheService.set(key, categories, { ttl: this.CACHE_TTL.CATEGORIES });
    } catch (error) {
      this.logger.warn('Cache write failed, but data retrieved successfully:', error instanceof Error ? error.message : String(error));
    }

    return categories;
  }

  // ==================== شجرة الفئات الكاملة ====================
  async getCategoryTree() {
    let ver = 1;
    let cacheKey = '';
    
    // Try to get cache version (graceful degradation if Redis fails)
    try {
      ver = await this.getCacheVersion();
      cacheKey = `categories:v${ver}:tree:full`;
    } catch (error) {
      this.logger.warn('Failed to get cache version for tree, using default:', error instanceof Error ? error.message : String(error));
      cacheKey = `categories:v1:tree:full`;
    }

    // Try to get from cache
    try {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        this.logger.debug('Category tree cache hit');
        return cached;
      }
    } catch (error) {
      this.logger.warn('Cache read failed for tree, proceeding to database:', error instanceof Error ? error.message : String(error));
    }

    // جلب جميع الفئات النشطة
    let allCategories;
    try {
      allCategories = await this.categoryModel
        .find({ deletedAt: null, isActive: true })
        .populate('imageId')
        .sort({ order: 1, name: 1 })
        .lean();
    } catch (error) {
      this.logger.error('Database query failed in getCategoryTree:', error instanceof Error ? error.message : String(error));
      throw new CategoryException(
        ErrorCode.DATABASE_ERROR,
        { 
          originalError: error instanceof Error ? error.message : String(error),
        },
      );
    }

    // بناء الشجرة
    const tree = this.buildTree(allCategories, null);

    // Try to cache the result (graceful degradation if Redis fails)
    try {
      await this.cacheService.set(cacheKey, tree, { ttl: this.CACHE_TTL.CATEGORY_TREE });
    } catch (error) {
      this.logger.warn('Cache write failed for tree, but data retrieved successfully:', error instanceof Error ? error.message : String(error));
    }

    return tree;
  }

  // ==================== حذف فئة (Soft Delete) ====================
  async deleteCategory(id: string, userId: string) {
    try {
      const category = await this.categoryModel.findById(id);

      if (!category) {
        throw new CategoryNotFoundException({ categoryId: id });
      }

      if (category.deletedAt) {
        throw new CategoryException(ErrorCode.CATEGORY_INVALID_DATA, { categoryId: id, reason: 'already_deleted' });
      }

      // فحص إذا كان لديها أطفال
      const childrenCount = await this.categoryModel.countDocuments({
        parentId: id,
        deletedAt: null,
      });

      if (childrenCount > 0) {
        throw new CategoryException(ErrorCode.CATEGORY_HAS_SUBCATEGORIES, { categoryId: id, childrenCount });
      }

      // Soft delete
      category.deletedAt = new Date();
      category.deletedBy = userId;
      await category.save();

      // تحديث عدد الأطفال للأب
      if (category.parentId) {
        await this.categoryModel.updateOne(
          { _id: category.parentId },
          { $inc: { childrenCount: -1 } },
        );
      }

      await this.clearAllCaches();

      return category;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to delete category', {
        error: err.message,
        stack: err.stack,
        categoryId: id,
        userId,
      });

      // إعادة رمي الخطأ إذا كان من نوع CategoryException
      if (error instanceof CategoryException || error instanceof CategoryNotFoundException) {
        throw error;
      }

      throw new CategoryException(ErrorCode.CATEGORY_DELETE_FAILED, {
        categoryId: id,
        error: err.message,
      });
    }
  }

  // ==================== استعادة فئة محذوفة ====================
  async restoreCategory(id: string) {
    try {
      const category = await this.categoryModel.findById(id);

      if (!category) {
        throw new CategoryNotFoundException({ categoryId: id });
      }

      if (!category.deletedAt) {
        throw new CategoryException(ErrorCode.CATEGORY_INVALID_DATA, { categoryId: id, reason: 'not_deleted' });
      }

      category.deletedAt = null;
      category.deletedBy = undefined;
      await category.save();

      // تحديث عدد الأطفال للأب
      if (category.parentId) {
        await this.categoryModel.updateOne(
          { _id: category.parentId },
          { $inc: { childrenCount: 1 } },
        );
      }

      await this.clearAllCaches();

      return category;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to restore category', {
        error: err.message,
        stack: err.stack,
        categoryId: id,
      });

      // إعادة رمي الخطأ إذا كان من نوع CategoryException
      if (error instanceof CategoryException || error instanceof CategoryNotFoundException) {
        throw error;
      }

      throw new CategoryException(ErrorCode.CATEGORY_UPDATE_FAILED, {
        categoryId: id,
        error: err.message,
      });
    }
  }

  // ==================== حذف نهائي ====================
  async permanentDeleteCategory(id: string) {
    try {
      const category = await this.categoryModel.findById(id);

      if (!category) {
        throw new CategoryNotFoundException({ categoryId: id });
      }

      // التحقق من عدم وجود أطفال
      const childrenCount = await this.categoryModel.countDocuments({ parentId: id });
      if (childrenCount > 0) {
        throw new CategoryException(ErrorCode.CATEGORY_HAS_SUBCATEGORIES, { categoryId: id, childrenCount });
      }

      // حذف من قاعدة البيانات
      await this.categoryModel.deleteOne({ _id: id });

      // تحديث عدد الأطفال للأب
      if (category.parentId) {
        await this.categoryModel.updateOne(
          { _id: category.parentId },
          { $inc: { childrenCount: -1 } },
        );
      }

      await this.clearAllCaches();

      return { deleted: true };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to permanently delete category', {
        error: err.message,
        stack: err.stack,
        categoryId: id,
      });

      // إعادة رمي الخطأ إذا كان من نوع CategoryException
      if (error instanceof CategoryException || error instanceof CategoryNotFoundException) {
        throw error;
      }

      throw new CategoryException(ErrorCode.CATEGORY_DELETE_FAILED, {
        categoryId: id,
        error: err.message,
      });
    }
  }

  // ==================== تحديث الإحصائيات ====================
  async updateCategoryStats(categoryId: string) {
    const childrenCount = await this.categoryModel.countDocuments({
      parentId: categoryId,
      deletedAt: null,
    });

    await this.categoryModel.updateOne({ _id: categoryId }, { $set: { childrenCount } });

    return { updated: true };
  }

  // ==================== تحديث عدد المنتجات (من خارج Module) ====================
  async updateProductsCount(categoryId: string, count: number) {
    await this.categoryModel.updateOne({ _id: categoryId }, { $set: { productsCount: count } });

    await this.clearAllCaches();
  }

  // ==================== زيادة/تقليل عدد المنتجات ====================
  async incrementProductsCount(categoryId: string, increment: number = 1) {
    await this.categoryModel.updateOne({ _id: categoryId }, { $inc: { productsCount: increment } });

    await this.clearAllCaches();
  }

  // ==================== إحصائيات الفئات ====================
  async getStats() {
    const [totalCategories, activeCategories, featuredCategories, deletedCategories, productsStats] = await Promise.all([
      this.categoryModel.countDocuments({ deletedAt: null }),
      this.categoryModel.countDocuments({ deletedAt: null, isActive: true }),
      this.categoryModel.countDocuments({ deletedAt: null, isFeatured: true }),
      this.categoryModel.countDocuments({ deletedAt: { $ne: null } }),
      this.categoryModel.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: '$productsCount' },
            categoriesWithProducts: {
              $sum: { $cond: [{ $gt: ['$productsCount', 0] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const totalProducts = productsStats[0]?.totalProducts || 0;
    const categoriesWithProducts = productsStats[0]?.categoriesWithProducts || 0;
    const averageProductsPerCategory = totalCategories > 0 
      ? parseFloat((totalProducts / totalCategories).toFixed(2))
      : 0;

    return {
      totalCategories,
      activeCategories,
      featuredCategories,
      deletedCategories,
      totalProducts,
      categoriesWithProducts,
      averageProductsPerCategory,
    };
  }

  // ==================== Helper: بناء الشجرة ====================
  private buildTree(
    categories: Record<string, unknown>[],
    parentId: string | null,
  ): Record<string, unknown>[] {
    return categories
      .filter((cat) => {
        const catParentId = cat.parentId ? String(cat.parentId) : null;
        return catParentId === parentId;
      })
      .map((cat) => ({
        ...cat,
        children: this.buildTree(categories, String(cat._id)),
      }));
  }

  // ==================== Helper: Breadcrumbs ====================
  private async getBreadcrumbs(categoryId: string): Promise<CategoryBreadcrumb[]> {
    const breadcrumbs: CategoryBreadcrumb[] = [];
    let currentCategoryId: string | null = categoryId;

    while (currentCategoryId) {
      const category = await this.categoryModel.findById(currentCategoryId).lean() as CategoryDocument;
      if (!category || category.deletedAt) {
        break;
      }

      breadcrumbs.unshift({
        id: category._id.toString(),
        name: category.name,
        nameEn: category.nameEn,
        slug: category.slug,
      });

      currentCategoryId = category.parentId || null;
    }

    return breadcrumbs;
  }

  // ==================== Helper: تحديث الأطفال عند تغيير الأب ====================
  private async handleParentChange(categoryId: string, oldParentId: string | null, newParentId: string | null) {
    // التحقق من أن الـ newParentId صحيح
    if (newParentId) {
      const newParent = await this.categoryModel.findById(newParentId);
      if (!newParent || newParent.deletedAt) {
        throw new CategoryException(ErrorCode.CATEGORY_INVALID_PARENT, { parentId: newParentId });
      }
      
      // التحقق من عدم إنشاء حلقة (الفئة لا يمكن أن تكون أب لنفسها)
      if (newParentId === categoryId) {
        throw new CategoryException(ErrorCode.CATEGORY_INVALID_PARENT, { categoryId, reason: 'self_parent' });
      }
      
      // التحقق من عدم إنشاء حلقة مع الأحفاد
      const isDescendant = await this.isDescendant(categoryId, newParentId);
      if (isDescendant) {
        throw new CategoryException(ErrorCode.CATEGORY_INVALID_PARENT, { categoryId, reason: 'descendant_parent' });
      }
    }

    // تحديث عدد الأطفال للوالد القديم
    if (oldParentId) {
      await this.categoryModel.updateOne(
        { _id: oldParentId },
        { $inc: { childrenCount: -1 } }
      );
    }

    // تحديث عدد الأطفال للوالد الجديد
    if (newParentId) {
      await this.categoryModel.updateOne(
        { _id: newParentId },
        { $inc: { childrenCount: 1 } }
      );
    }
  }

  // ==================== Helper: التحقق من النسب ====================
  private async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    let currentId = descendantId;
    
    while (currentId) {
      const category = await this.categoryModel.findById(currentId).lean();
      if (!category || !category.parentId) {
        break;
      }
      
      if (String(category.parentId) === ancestorId) {
        return true;
      }
      
      currentId = String(category.parentId);
    }
    
    return false;
  }

  // ==================== جلب جميع الفئات الفرعية (Descendants) ====================
  /**
   * جلب جميع الفئات الفرعية (الأطفال والأحفاد) لفئة معينة بشكل recursive
   * يستخدم aggregation pipeline لتحسين الأداء
   * @param categoryId - معرف الفئة الرئيسية
   * @param includeSelf - هل يتم تضمين الفئة نفسها في النتائج (افتراضي: true)
   * @returns قائمة بمعرفات جميع الفئات الفرعية
   */
  async getCategoryDescendants(categoryId: string, includeSelf: boolean = true): Promise<string[]> {
    const categoryIds: string[] = [];
    
    // استخدام recursive aggregation لتحسين الأداء
    if (!Types.ObjectId.isValid(categoryId)) {
      this.logger.warn(`Invalid categoryId format: ${categoryId}`);
      // إذا كان categoryId غير صالح، نعيده فقط إذا كان includeSelf = true
      if (includeSelf) {
        return [categoryId];
      }
      return [];
    }

    const objectId = new Types.ObjectId(categoryId);

    // التحقق من وجود الفئة أولاً
    const categoryExists = await this.categoryModel.findOne({
      _id: objectId,
      deletedAt: null,
      isActive: true,
    }).select('_id').lean();

    if (!categoryExists) {
      this.logger.warn(`Category not found or inactive: ${categoryId}`);
      // إذا لم توجد الفئة، نعيدها فقط إذا كان includeSelf = true
      if (includeSelf) {
        return [categoryId];
      }
      return [];
    }

    // إضافة الفئة نفسها إذا كان includeSelf = true
    if (includeSelf) {
      categoryIds.push(categoryId);
    }

    // جلب جميع الفئات الفرعية باستخدام aggregation
    try {
      const descendants = await this.categoryModel.aggregate([
        {
          $match: {
            _id: objectId,
            deletedAt: null,
            isActive: true,
          },
        },
        {
          $graphLookup: {
            from: 'categories',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'parentId',
            as: 'descendants',
            restrictSearchWithMatch: {
              deletedAt: null,
              isActive: true,
            },
          },
        },
        {
          $project: {
            descendants: {
              $map: {
                input: '$descendants',
                as: 'desc',
                in: { $toString: '$$desc._id' },
              },
            },
          },
        },
      ]);

      if (descendants.length > 0 && descendants[0].descendants && Array.isArray(descendants[0].descendants)) {
        const descendantIds = descendants[0].descendants as string[];
        // إضافة الفئات الفرعية (تجنب التكرار)
        for (const descId of descendantIds) {
          if (!categoryIds.includes(descId)) {
            categoryIds.push(descId);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error getting category descendants for ${categoryId}:`, error);
      // في حالة الخطأ، نعيد الفئة نفسها فقط إذا كان includeSelf = true
      if (includeSelf) {
        return [categoryId];
      }
      return [];
    }

    return categoryIds;
  }


  // ==================== Cache Versioning ====================
  private async getCacheVersion(): Promise<number> {
    try {
      const ver = await this.cacheService.get<number>('categories:ver');
      return (typeof ver === 'number' ? ver : 1);
    } catch (error) {
      this.logger.warn('Failed to get cache version, using default:', error instanceof Error ? error.message : String(error));
      return 1;
    }
  }

  private async bumpCacheVersion(): Promise<void> {
    const v = await this.getCacheVersion();
    await this.cacheService.set('categories:ver', v + 1);
  }

  private normalizeQuery(obj: Record<string, unknown>): string {
    // احذف undefined وثبّت ترتيب المفاتيح
    const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
    entries.sort(([a], [b]) => a.localeCompare(b));
    return JSON.stringify(Object.fromEntries(entries));
  }

  // ==================== Cache Management ====================
  async clearAllCaches() {
    try {
      await this.bumpCacheVersion(); // أسرع وأضمن من مسح wildcards
      this.logger.log('Bumped categories cache version');
    } catch (error) {
      this.logger.error('Error bumping category cache version:', error);
    }
  }
}

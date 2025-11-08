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
    const slug = slugify(dto.nameEn!);

    // التحقق من عدم تكرار الـ slug
    const existing = await this.categoryModel.findOne({ slug, deletedAt: null });
    if (existing) {
      throw new CategoryAlreadyExistsException({ slug: dto.slug });
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
  }

  // ==================== تحديث فئة ====================
  async updateCategory(id: string, patch: Partial<Category>) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new CategoryNotFoundException({ categoryId: id });
    }

    if (category.deletedAt) {
      throw new CategoryException(ErrorCode.CATEGORY_NOT_FOUND, { categoryId: id, reason: 'deleted' });
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
        throw new CategoryAlreadyExistsException({ slug });
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
  }

  // ==================== عرض فئة واحدة ====================
  async getCategory(identifier: string): Promise<CategoryDetail> {
    const ver = await this.getCacheVersion();
    let categoryId = identifier;

    // Determine if identifier is ObjectId or slug
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

    const cacheKey = `categories:v${ver}:detail:${categoryId}`;

    const cached = await this.cacheService.get<CategoryDetail>(cacheKey);
    if (cached) {
      this.logger.debug(`Category detail cache hit: ${categoryId}`);
      return cached;
    }

    const categoryDoc = await this.categoryModel
      .findOne({
        _id: categoryId,
        deletedAt: null,
        isActive: true,
      })
      .populate('imageId')
      .lean();

    const category = categoryDoc as CategoryLean | null;

    if (!category) {
      throw new CategoryNotFoundException({ categoryId: identifier });
    }

    // جلب الأطفال
    const childrenDocs = await this.categoryModel
      .find({ parentId: categoryId, deletedAt: null, isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    const children = childrenDocs as CategoryLean[];

    // جلب breadcrumbs
    const breadcrumbs = await this.getBreadcrumbs(categoryId);

    const result: CategoryDetail = {
      ...category,
      children,
      breadcrumbs,
    };

    await this.cacheService.set(cacheKey, result, { ttl: this.CACHE_TTL.CATEGORY_DETAIL });

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

    const ver = await this.getCacheVersion();
    const key = `categories:v${ver}:list:${this.normalizeQuery(query)}`;

    // Try to get from cache first (unless force refresh)
    if (!force) {
      const cached = await this.cacheService.get<Category[]>(key);
      if (cached) {
        this.logger.debug(`Categories cache hit`);
        return cached;
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

    const categories = await this.categoryModel
      .find(q)
      .populate('imageId')
      .sort({ order: 1, name: 1 })
      .lean();

    // Cache the result
    await this.cacheService.set(key, categories, { ttl: this.CACHE_TTL.CATEGORIES });

    return categories;
  }

  // ==================== شجرة الفئات الكاملة ====================
  async getCategoryTree() {
    const ver = await this.getCacheVersion();
    const cacheKey = `categories:v${ver}:tree:full`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.logger.debug('Category tree cache hit');
      return cached;
    }

    // جلب جميع الفئات النشطة
    const allCategories = await this.categoryModel
      .find({ deletedAt: null, isActive: true })
      .populate('imageId')
      .sort({ order: 1, name: 1 })
      .lean();

    // بناء الشجرة
    const tree = this.buildTree(allCategories, null);

    await this.cacheService.set(cacheKey, tree, { ttl: this.CACHE_TTL.CATEGORY_TREE });

    return tree;
  }

  // ==================== حذف فئة (Soft Delete) ====================
  async deleteCategory(id: string, userId: string) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new CategoryNotFoundException({ categoryId: id });
    }

    if (category.deletedAt) {
      throw new CategoryException(ErrorCode.CATEGORY_NOT_FOUND, { categoryId: id, reason: 'already_deleted' });
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
  }

  // ==================== استعادة فئة محذوفة ====================
  async restoreCategory(id: string) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new CategoryNotFoundException({ categoryId: id });
    }

    if (!category.deletedAt) {
      throw new CategoryException(ErrorCode.CATEGORY_NOT_FOUND, { categoryId: id, reason: 'not_deleted' });
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
  }

  // ==================== حذف نهائي ====================
  async permanentDeleteCategory(id: string) {
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


  // ==================== Cache Versioning ====================
  private async getCacheVersion(): Promise<number> {
    const ver = await this.cacheService.get('categories:ver');
    return (typeof ver === 'number' ? ver : 1);
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

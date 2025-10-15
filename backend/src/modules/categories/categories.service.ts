import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './schemas/category.schema';
import { slugify } from '../../shared/utils/slug.util';
import { CacheService } from '../../shared/cache/cache.service';
import { AppException } from '../../shared/exceptions/app.exception';

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
      throw new AppException('CATEGORY_SLUG_EXISTS', 'اسم الفئة موجود بالفعل', null, 400);
    }

    let path = '/' + slug;
    let depth = 0;

    if (dto.parentId) {
      const parent = await this.categoryModel.findById(dto.parentId).lean();
      if (!parent) {
        throw new AppException('PARENT_NOT_FOUND', 'الفئة الأب غير موجودة', null, 404);
      }
      if (parent.deletedAt) {
        throw new AppException('PARENT_DELETED', 'الفئة الأب محذوفة', null, 400);
      }
      path = `${parent.path}/${slug}`;
      depth = parent.depth + 1;

      // تحديث عدد الأطفال للأب
      await this.categoryModel.updateOne({ _id: dto.parentId }, { $inc: { childrenCount: 1 } });
    }

    const category = await this.categoryModel.create({
      ...dto,
      parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : null,
      slug,
      path,
      depth,
      order: dto.order || 0,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      showInMenu: dto.showInMenu !== undefined ? dto.showInMenu : true,
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
      throw new AppException('CATEGORY_NOT_FOUND', 'الفئة غير موجودة', null, 404);
    }

    if (category.deletedAt) {
      throw new AppException('CATEGORY_DELETED', 'الفئة محذوفة', null, 400);
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
        throw new AppException('CATEGORY_SLUG_EXISTS', 'اسم الفئة موجود بالفعل', null, 400);
      }

      patch.slug = slug;

      // تحديث path للفئة وكل أطفالها
      const oldPath = category.path;
      const newPath = category.parentId
        ? (await this.categoryModel.findById(category.parentId).lean())!.path + '/' + slug
        : '/' + slug;

      // تحديث الفئة نفسها
      await this.categoryModel.updateOne({ _id: id }, { $set: { path: newPath, ...patch } });

      // تحديث كل الأطفال
      const children = await this.categoryModel.find({ path: { $regex: `^${oldPath}/` } });
      for (const child of children) {
        const updatedPath = child.path.replace(oldPath, newPath);
        await this.categoryModel.updateOne({ _id: child._id }, { $set: { path: updatedPath } });
      }
    } else {
      await this.categoryModel.updateOne({ _id: id }, { $set: patch });
    }

    const updated = await this.categoryModel.findById(id);

    // Clear category caches
    await this.clearAllCaches();

    return updated;
  }

  // ==================== عرض فئة واحدة ====================
  async getCategory(id: string) {
    const cacheKey = `category:detail:${id}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.logger.debug(`Category detail cache hit: ${id}`);
      return cached;
    }

    const category = await this.categoryModel
      .findById(id)
      .populate('imageId')
      .populate('iconId')
      .lean();

    if (!category) {
      throw new AppException('CATEGORY_NOT_FOUND', 'الفئة غير موجودة', null, 404);
    }

    // جلب الأطفال
    const children = await this.categoryModel
      .find({ parentId: id, deletedAt: null, isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    // جلب breadcrumbs
    const breadcrumbs = await this.getBreadcrumbs(category.path);

    const result = {
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
    } = {},
  ) {
    const { parentId, search, isActive, isFeatured, includeDeleted = false } = query;

    const cacheKey = `categories:list:${JSON.stringify(query)}`;

    // Try to get from cache first
    const cached = await this.cacheService.get<Category[]>(cacheKey);
    if (cached) {
      this.logger.debug(`Categories cache hit`);
      return cached;
    }

    // Build query
    const q: Record<string, unknown> = {};

    if (!includeDeleted) {
      q.deletedAt = null;
    }

    if (parentId !== undefined) {
      q.parentId = parentId === null || parentId === 'null' ? null : new Types.ObjectId(parentId);
    }

    if (search) {
      q.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      q.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      q.isFeatured = isFeatured;
    }

    const categories = await this.categoryModel
      .find(q)
      .populate('imageId')
      .populate('iconId')
      .sort({ order: 1, depth: 1, name: 1 })
      .lean();

    // Cache the result
    await this.cacheService.set(cacheKey, categories, { ttl: this.CACHE_TTL.CATEGORIES });

    return categories;
  }

  // ==================== شجرة الفئات الكاملة ====================
  async getCategoryTree() {
    const cacheKey = 'categories:tree:full';

    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.logger.debug('Category tree cache hit');
      return cached;
    }

    // جلب جميع الفئات النشطة
    const allCategories = await this.categoryModel
      .find({ deletedAt: null, isActive: true })
      .populate('imageId')
      .populate('iconId')
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
      throw new AppException('CATEGORY_NOT_FOUND', 'الفئة غير موجودة', null, 404);
    }

    if (category.deletedAt) {
      throw new AppException('CATEGORY_ALREADY_DELETED', 'الفئة محذوفة بالفعل', null, 400);
    }

    // فحص إذا كان لديها أطفال
    const childrenCount = await this.categoryModel.countDocuments({
      parentId: id,
      deletedAt: null,
    });

    if (childrenCount > 0) {
      throw new AppException(
        'CATEGORY_HAS_CHILDREN',
        'لا يمكن حذف فئة تحتوي على فئات فرعية. احذف الفئات الفرعية أولاً',
        { childrenCount },
        400,
      );
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
      throw new AppException('CATEGORY_NOT_FOUND', 'الفئة غير موجودة', null, 404);
    }

    if (!category.deletedAt) {
      throw new AppException('CATEGORY_NOT_DELETED', 'الفئة غير محذوفة', null, 400);
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
      throw new AppException('CATEGORY_NOT_FOUND', 'الفئة غير موجودة', null, 404);
    }

    // التحقق من عدم وجود أطفال
    const childrenCount = await this.categoryModel.countDocuments({ parentId: id });
    if (childrenCount > 0) {
      throw new AppException(
        'CATEGORY_HAS_CHILDREN',
        'لا يمكن حذف فئة تحتوي على فئات فرعية',
        { childrenCount },
        400,
      );
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
    const [total, active, featured, deleted, byDepth] = await Promise.all([
      this.categoryModel.countDocuments({ deletedAt: null }),
      this.categoryModel.countDocuments({ deletedAt: null, isActive: true }),
      this.categoryModel.countDocuments({ deletedAt: null, isFeatured: true }),
      this.categoryModel.countDocuments({ deletedAt: { $ne: null } }),
      this.categoryModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$depth', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const depthStats: Record<string, unknown> = {};
    byDepth.forEach((item: Record<string, unknown>) => {
      depthStats[`level_${item._id}`] = item.count;
    });

    return {
      data: {
        total,
        active,
        featured,
        deleted,
        byDepth: depthStats,
      },
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
  private async getBreadcrumbs(path: string) {
    const paths = path.split('/').filter(Boolean);
    const breadcrumbs: Record<string, unknown>[] = [];

    let currentPath = '';
    for (const segment of paths) {
      currentPath += '/' + segment;
      const cat = await this.categoryModel.findOne({ path: currentPath, deletedAt: null }).lean();
      if (cat) {
        breadcrumbs.push({
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          path: cat.path,
        });
      }
    }

    return breadcrumbs;
  }

  // ==================== Cache Management ====================
  async clearAllCaches() {
    try {
      await this.cacheService.clear('categories:*');
      await this.cacheService.clear('category:*');
      this.logger.log('Cleared all category caches');
    } catch (error) {
      this.logger.error('Error clearing category caches:', error);
    }
  }
}

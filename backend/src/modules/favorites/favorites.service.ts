import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Favorite } from './schemas/favorite.schema';
import {
  FavoriteNotFoundException,
} from '../../shared/exceptions';
import { PublicProductsPresenter } from '../products/services/public-products.presenter';

type SimplifiedProductRecord = Record<string, unknown>;

interface FavoriteLean extends Record<string, unknown> {
  _id: string;
  userId?: Types.ObjectId | string | null;
  deviceId?: string | null;
  productId?: Record<string, unknown> | string | null;
  note?: string | null;
  createdAt?: Date;
  deletedAt?: Date | null;
}

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(
    @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>,
    private readonly publicProductsPresenter: PublicProductsPresenter,
  ) {}

  private toObjectId(id: string) {
    return new Types.ObjectId(id);
  }

  // ==================== للمستخدمين المسجلين ====================

  async listUserFavorites(userId: string): Promise<FavoriteLean[]> {
    const objectUserId = this.toObjectId(userId);

    const favorites = (await this.favoriteModel
      .find({ userId: objectUserId, deletedAt: null })
      .populate({
        path: 'productId',
        select:
          'name nameEn status isActive isFeatured isNew isBestseller useManualRating manualRating manualReviewsCount averageRating basePriceUSD compareAtPriceUSD costPriceUSD',
        populate: {
          path: 'mainImageId',
          select: 'url',
        },
      })
      .sort({ createdAt: -1 })
      .select('-viewsCount -lastViewedAt -updatedAt')
      .lean<FavoriteLean>()) as unknown as FavoriteLean[];

    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(userId);

    return this.enrichFavoritesWithProductSummaries(favorites, {
      discountPercent,
      currency: 'USD',
    });
  }

  async addUserFavorite(userId: string, dto: { productId: string; note?: string }) {
    // التحقق من عدم التكرار
    const objectUserId = this.toObjectId(userId);
    const objectProductId = this.toObjectId(dto.productId);

    const existing = await this.favoriteModel.findOne({
      userId: objectUserId,
      productId: objectProductId,
    });

    if (existing) {
      // إذا كان موجوداً، وهذا يتضمن السجلات المحذوفة مسبقاً (soft delete)، نعيد تفعيلها
      if (existing.deletedAt) {
        existing.deletedAt = null;
        existing.isSynced = existing.isSynced ?? false;
        existing.viewsCount = existing.viewsCount ?? 0;
      }

      if (dto.note !== undefined) {
        existing.note = dto.note;
      }

      await existing.save();
      return existing;
    }

    // إنشاء مفضلة جديدة
    const favorite = await this.favoriteModel.create({
      userId: objectUserId,
      productId: objectProductId,
      note: dto.note || '',
      viewsCount: 0,
      isSynced: false,
    });

    return favorite;
  }

  async removeUserFavorite(userId: string, dto: { productId: string }) {
    const objectUserId = this.toObjectId(userId);
    const objectProductId = this.toObjectId(dto.productId);

    const result = await this.favoriteModel.updateOne(
      {
        userId: objectUserId,
        productId: objectProductId,
      },
      {
        $set: { deletedAt: new Date() }
      }
    );

    return { deleted: result.modifiedCount === 1 };
  }

  async updateUserFavorite(userId: string, favoriteId: string, dto: { note?: string }) {
    const objectUserId = this.toObjectId(userId);
    const objectFavoriteId = this.toObjectId(favoriteId);

    const favorite = await this.favoriteModel.findOne({
      _id: objectFavoriteId,
      userId: objectUserId,
      deletedAt: null,
    });

    if (!favorite) {
      throw new FavoriteNotFoundException({ favoriteId });
    }

    if (dto.note !== undefined) favorite.note = dto.note;

    await favorite.save();

    return favorite;
  }

  async clearUserFavorites(userId: string) {
    const objectUserId = this.toObjectId(userId);

    const result = await this.favoriteModel.updateMany(
      { userId: objectUserId, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );

    return { cleared: result.modifiedCount };
  }

  // ==================== للزوار (Guest users) ====================

  async listGuestFavorites(deviceId: string): Promise<FavoriteLean[]> {
    const favorites = (await this.favoriteModel
      .find({ deviceId, userId: null, deletedAt: null })
      .populate({
        path: 'productId',
        select:
          'name nameEn status isActive isFeatured isNew isBestseller useManualRating manualRating manualReviewsCount averageRating basePriceUSD compareAtPriceUSD costPriceUSD',
        populate: {
          path: 'mainImageId',
          select: 'url',
        },
      })
      .sort({ createdAt: -1 })
      .select('-viewsCount -lastViewedAt -updatedAt')
      .lean<FavoriteLean>()) as unknown as FavoriteLean[];

    return this.enrichFavoritesWithProductSummaries(favorites, {
      discountPercent: 0,
      currency: 'USD',
    });
  }

  async listFavoritesByProduct(productId: string): Promise<FavoriteLean[]> {
    const objectProductId = this.toObjectId(productId);

    const favorites = (await this.favoriteModel
      .find({ productId: objectProductId, deletedAt: null })
      .populate({
        path: 'productId',
        select:
          'name nameEn status isActive isFeatured isNew isBestseller useManualRating manualRating manualReviewsCount averageRating basePriceUSD compareAtPriceUSD costPriceUSD',
        populate: {
          path: 'mainImageId',
          select: 'url',
        },
      })
      .sort({ createdAt: -1 })
      .select('-viewsCount -lastViewedAt -updatedAt')
      .lean<FavoriteLean>()) as unknown as FavoriteLean[];

    return this.enrichFavoritesWithProductSummaries(favorites, {
      discountPercent: 0,
      currency: 'USD',
    });
  }

  async addGuestFavorite(deviceId: string, dto: { productId: string; note?: string }) {
    // التحقق من عدم التكرار
    const objectProductId = this.toObjectId(dto.productId);

    const existing = await this.favoriteModel.findOne({
      deviceId,
      userId: null,
      productId: objectProductId,
    });

    if (existing) {
      if (existing.deletedAt) {
        existing.deletedAt = null;
        existing.isSynced = existing.isSynced ?? false;
        existing.viewsCount = existing.viewsCount ?? 0;
      }

      if (dto.note !== undefined) {
        existing.note = dto.note;
      }

      await existing.save();
      return existing;
    }

    // إنشاء مفضلة جديدة
    const favorite = await this.favoriteModel.create({
      deviceId,
      userId: null,
      productId: objectProductId,
      note: dto.note || '',
      viewsCount: 0,
      isSynced: false,
    });

    return favorite;
  }

  async removeGuestFavorite(deviceId: string, dto: { productId: string }) {
    const objectProductId = this.toObjectId(dto.productId);

    const result = await this.favoriteModel.updateOne(
      {
        deviceId,
        userId: null,
        productId: objectProductId,
      },
      {
        $set: { deletedAt: new Date() }
      }
    );

    return { deleted: result.modifiedCount === 1 };
  }

  async clearGuestFavorites(deviceId: string) {
    const result = await this.favoriteModel.updateMany(
      { deviceId, userId: null, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );

    return { cleared: result.modifiedCount };
  }

  // ==================== المزامنة ====================

  async syncGuestToUser(deviceId: string, userId: string) {
    // جلب مفضلات الزائر
    const guestFavorites = await this.favoriteModel.find({
      deviceId,
      userId: null,
      deletedAt: null,
    }).lean();

    if (guestFavorites.length === 0) {
      return { synced: 0, skipped: 0, total: 0 };
    }

    let synced = 0;
    let skipped = 0;
    const objectUserId = this.toObjectId(userId);

    for (const guestFav of guestFavorites) {
      // التحقق من عدم وجود نفس المفضلة للمستخدم
      const existing = await this.favoriteModel.findOne({
        userId: objectUserId,
        productId: guestFav.productId,
        deletedAt: null,
      });

      if (existing) {
        // موجودة بالفعل - نتخطاها
        skipped++;
      } else {
        // نضيفها للمستخدم
        await this.favoriteModel.create({
          userId: objectUserId,
          productId: guestFav.productId,
          note: guestFav.note,
          viewsCount: guestFav.viewsCount || 0,
          isSynced: true,
          syncedAt: new Date(),
        });
        synced++;
      }
    }

    // حذف مفضلات الزائر بعد المزامنة
    await this.favoriteModel.updateMany(
      { deviceId, userId: null },
      { $set: { deletedAt: new Date(), isSynced: true, syncedAt: new Date() } }
    );

    this.logger.log(`Synced ${synced} favorites from device ${deviceId} to user ${userId}`);

    return {
      synced,
      skipped,
      total: guestFavorites.length,
    };
  }

  // ==================== التحليلات والإحصائيات ====================

  async getUserFavoritesCount(userId: string) {
    const objectUserId = this.toObjectId(userId);
    return this.favoriteModel.countDocuments({ userId: objectUserId, deletedAt: null });
  }

  async getGuestFavoritesCount(deviceId: string) {
    return this.favoriteModel.countDocuments({ deviceId, userId: null, deletedAt: null });
  }

  async getProductFavoritesCount(productId: string) {
    return this.favoriteModel.countDocuments({
      productId: new Types.ObjectId(productId),
      deletedAt: null,
    });
  }

  async getMostFavoritedProducts(limit = 10) {
    const results = await this.favoriteModel.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$productId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
    ]);

    return results.map(r => ({
      productId: r._id,
      count: r.count,
      product: r.product,
    }));
  }


  async incrementViews(favoriteId: string) {
    await this.favoriteModel.updateOne(
      { _id: favoriteId },
      {
        $inc: { viewsCount: 1 },
        $set: { lastViewedAt: new Date() },
      }
    );
  }

  async getStats() {
    const [totalUsers, totalGuests, totalSynced] = await Promise.all([
      this.favoriteModel.countDocuments({ userId: { $ne: null }, deletedAt: null }),
      this.favoriteModel.countDocuments({ deviceId: { $ne: null }, userId: null, deletedAt: null }),
      this.favoriteModel.countDocuments({ isSynced: true }),
    ]);

    return {
      data: {
        totalUsers,
        totalGuests,
        totalSynced,
        total: totalUsers + totalGuests,
      },
    };
  }

  private async enrichFavoritesWithProductSummaries(
    favorites: FavoriteLean[],
    options: { discountPercent: number; currency: string },
  ): Promise<FavoriteLean[]> {
    if (!Array.isArray(favorites) || favorites.length === 0) {
      return [];
    }

    const productRecords: Array<Record<string, unknown>> = [];
    const productIdOrder: string[] = [];

    for (const favorite of favorites) {
      const product = favorite.productId;
      if (product && typeof product === 'object') {
        const productRecord = product as Record<string, unknown>;
        const productId = this.extractIdString(productRecord['_id']);
        if (productId) {
          productRecords.push(productRecord);
          productIdOrder.push(productId);
        }
      }
    }

    if (productRecords.length === 0) {
      return favorites.map((favorite) => ({
        ...favorite,
        productId: null,
      }));
    }

    const preparedProducts =
      await this.publicProductsPresenter.buildProductsCollectionResponse(
        productRecords,
        options.discountPercent,
        options.currency,
      );

    const simplifiedMap = new Map<string, SimplifiedProductRecord>();

    preparedProducts.forEach((product, index) => {
      const productRecord = product as Record<string, unknown>;
      const id =
        this.extractIdString(productRecord['_id']) ?? this.extractIdString(productRecord['id']);

      if (id) {
        const simplified = this.pickFavoriteProductFields(productRecord);
        if (simplified) {
          simplifiedMap.set(id, simplified);
        }
      } else {
        // fallback to order index mapping when id is missing
        const orderedId = productIdOrder[index];
        if (orderedId) {
          const simplified = this.pickFavoriteProductFields(productRecord);
          if (simplified) {
            simplifiedMap.set(orderedId, simplified);
          }
        }
      }
    });

    return favorites.map((favorite) => {
      const product = favorite.productId;
      const productId =
        product && typeof product === 'object'
          ? this.extractIdString((product as Record<string, unknown>)['_id'])
          : typeof product === 'string'
          ? product
          : null;

      const simplifiedProduct = productId ? simplifiedMap.get(productId) ?? null : null;

      const enrichedFavorite: FavoriteLean = {
        ...favorite,
        productId: simplifiedProduct,
      };

      return enrichedFavorite;
    });
  }

  private extractIdString(value: unknown): string | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;

      if (record._id) {
        const innerId = record._id;
        if (typeof innerId === 'string') {
          return innerId;
        }
        if (innerId && typeof (innerId as { toString: () => string }).toString === 'function') {
          const converted = (innerId as { toString: () => string }).toString();
          return converted === '[object Object]' ? null : converted;
        }
      }

      if (typeof (record as { toString?: () => string }).toString === 'function') {
        const converted = (record as { toString: () => string }).toString();
        return converted === '[object Object]' ? null : converted;
      }
    }

    return null;
  }

  private pickFavoriteProductFields(product: Record<string, unknown>): SimplifiedProductRecord | null {
    if (!product) {
      return null;
    }

    const pricingRaw = product['pricingByCurrency'];
    const pricingByCurrency =
      pricingRaw && typeof pricingRaw === 'object'
        ? (pricingRaw as Record<string, unknown>)
        : {};

    const useManualRating = typeof product['useManualRating'] === 'boolean'
      ? (product['useManualRating'] as boolean)
      : false;

    const manualRating =
      typeof product['manualRating'] === 'number' ? (product['manualRating'] as number) : undefined;
    const averageRating =
      typeof product['averageRating'] === 'number'
        ? (product['averageRating'] as number)
        : undefined;

    const rating = useManualRating
      ? manualRating ?? averageRating ?? 0
      : averageRating ?? manualRating ?? 0;

    const manualReviewsCount =
      typeof product['manualReviewsCount'] === 'number'
        ? (product['manualReviewsCount'] as number)
        : undefined;
    const reviewsCountRaw =
      typeof product['reviewsCount'] === 'number' ? (product['reviewsCount'] as number) : undefined;

    const reviewsCount = useManualRating
      ? manualReviewsCount ?? 0
      : reviewsCountRaw ?? manualReviewsCount ?? 0;

    const result: SimplifiedProductRecord = {
      rating,
      pricingByCurrency,
    };

    if (product['_id']) {
      result._id = product['_id'];
    }
    if (typeof product['name'] === 'string') {
      result.name = product['name'];
    }
    if (typeof product['nameEn'] === 'string') {
      result.nameEn = product['nameEn'];
    }
    if (product['mainImage']) {
      result.mainImage = product['mainImage'];
    }
    if (product['status']) {
      result.status = product['status'];
    }
    if (typeof product['isActive'] === 'boolean') {
      result.isActive = product['isActive'] as boolean;
    }
    if (typeof product['isFeatured'] === 'boolean') {
      result.isFeatured = product['isFeatured'] as boolean;
    }
    if (typeof product['isNew'] === 'boolean') {
      result.isNew = product['isNew'] as boolean;
    }
    if (typeof product['isBestseller'] === 'boolean') {
      result.isBestseller = product['isBestseller'] as boolean;
    }
    if (typeof product['useManualRating'] === 'boolean') {
      result.useManualRating = useManualRating;
    }
    if (manualRating !== undefined) {
      result.manualRating = manualRating;
    }
    if (manualReviewsCount !== undefined) {
      result.manualReviewsCount = manualReviewsCount;
    }
    if (averageRating !== undefined) {
      result.averageRating = averageRating;
    }
    result.reviewsCount = reviewsCount;

    return result;
  }
}

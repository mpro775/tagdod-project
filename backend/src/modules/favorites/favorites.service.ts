import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Favorite } from './schemas/favorite.schema';
import { 
  FavoriteNotFoundException,
   
} from '../../shared/exceptions';

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(
    @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>,
  ) {}

  // ==================== للمستخدمين المسجلين ====================

  async listUserFavorites(userId: string) {
    const favorites = await this.favoriteModel
      .find({ userId, deletedAt: null })
      .populate('productId')
      .sort({ createdAt: -1 })
      .select('-viewsCount -lastViewedAt -updatedAt')
      .lean();

    return favorites;
  }

  async addUserFavorite(userId: string, dto: { productId: string; note?: string }) {
    // التحقق من عدم التكرار
    const existing = await this.favoriteModel.findOne({
      userId,
      productId: dto.productId,
      deletedAt: null,
    });

    if (existing) {
      // إذا كان موجوداً، نحدث البيانات فقط
      if (dto.note) existing.note = dto.note;
      await existing.save();
      return existing;
    }

    // إنشاء مفضلة جديدة
    const favorite = await this.favoriteModel.create({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(dto.productId),
      note: dto.note || '',
      viewsCount: 0,
      isSynced: false,
    });

    return favorite;
  }

  async removeUserFavorite(userId: string, dto: { productId: string }) {
    const result = await this.favoriteModel.updateOne(
      {
        userId,
        productId: dto.productId,
      },
      {
        $set: { deletedAt: new Date() }
      }
    );

    return { deleted: result.modifiedCount === 1 };
  }

  async updateUserFavorite(userId: string, favoriteId: string, dto: { note?: string }) {
    const favorite = await this.favoriteModel.findOne({
      _id: favoriteId,
      userId,
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
    const result = await this.favoriteModel.updateMany(
      { userId, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );

    return { cleared: result.modifiedCount };
  }

  // ==================== للزوار (Guest users) ====================

  async listGuestFavorites(deviceId: string) {
    const favorites = await this.favoriteModel
      .find({ deviceId, userId: null, deletedAt: null })
      .populate('productId')
      .sort({ createdAt: -1 })
      .lean();

    return favorites;
  }

  async addGuestFavorite(deviceId: string, dto: { productId: string; note?: string }) {
    // التحقق من عدم التكرار
    const existing = await this.favoriteModel.findOne({
      deviceId,
      userId: null,
      productId: dto.productId,
      deletedAt: null,
    });

    if (existing) {
      if (dto.note) existing.note = dto.note;
      await existing.save();
      return existing;
    }

    // إنشاء مفضلة جديدة
    const favorite = await this.favoriteModel.create({
      deviceId,
      userId: null,
      productId: new Types.ObjectId(dto.productId),
      note: dto.note || '',
      viewsCount: 0,
      isSynced: false,
    });

    return favorite;
  }

  async removeGuestFavorite(deviceId: string, dto: { productId: string }) {
    const result = await this.favoriteModel.updateOne(
      {
        deviceId,
        userId: null,
        productId: dto.productId,
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

    for (const guestFav of guestFavorites) {
      // التحقق من عدم وجود نفس المفضلة للمستخدم
      const existing = await this.favoriteModel.findOne({
        userId,
        productId: guestFav.productId,
        deletedAt: null,
      });

      if (existing) {
        // موجودة بالفعل - نتخطاها
        skipped++;
      } else {
        // نضيفها للمستخدم
        await this.favoriteModel.create({
          userId: new Types.ObjectId(userId),
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
    return this.favoriteModel.countDocuments({ userId, deletedAt: null });
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
}

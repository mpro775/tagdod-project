import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  EngineerProfile,
  EngineerProfileDocument,
  EngineerRating,
} from '../schemas/engineer-profile.schema';
import { User, UserDocument } from '../schemas/user.schema';
import {
  ServiceRequest,
  ServiceRequestDocument,
} from '../../services/schemas/service-request.schema';
import { Order, OrderDocument } from '../../checkout/schemas/order.schema';
import { Coupon, CouponDocument } from '../../marketing/schemas/coupon.schema';
import { ExchangeRatesService } from '../../exchange-rates/exchange-rates.service';

@Injectable()
export class EngineerProfileService {
  private readonly logger = new Logger(EngineerProfileService.name);

  constructor(
    @InjectModel(EngineerProfile.name)
    private readonly engineerProfileModel: Model<EngineerProfileDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(ServiceRequest.name)
    private readonly serviceRequestModel: Model<ServiceRequestDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
    private readonly exchangeRatesService: ExchangeRatesService,
  ) {}

  /**
   * تحويل المبلغ من USD إلى العملات الأخرى
   */
  private async convertAmountFromUSD(amountUSD: number): Promise<{
    usd: number;
    yer: number;
    sar: number;
  }> {
    try {
      const rates = await this.exchangeRatesService.getCurrentRates();
      return {
        usd: amountUSD,
        yer: Math.round(amountUSD * rates.usdToYer),
        sar: Math.round(amountUSD * rates.usdToSar * 100) / 100,
      };
    } catch (error) {
      this.logger.warn('Failed to get exchange rates, using USD only', error);
      // في حالة الخطأ، نعيد USD فقط
      return {
        usd: amountUSD,
        yer: amountUSD,
        sar: amountUSD,
      };
    }
  }

  /**
   * إنشاء بروفايل للمهندس (يُستدعى عند الموافقة على المهندس)
   */
  async createProfile(userId: string): Promise<EngineerProfileDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // التحقق من وجود بروفايل مسبقاً
    const existingProfile = await this.engineerProfileModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (existingProfile) {
      return existingProfile;
    }

    const profile = new this.engineerProfileModel({
      userId: new Types.ObjectId(userId),
      ratings: [],
      totalRatings: 0,
      averageRating: 0,
      ratingDistribution: [0, 0, 0, 0, 0],
      totalCompletedServices: 0,
      totalEarnings: 0,
    });

    return await profile.save();
  }

  /**
   * جلب بروفايل المهندس
   * يقبل إما userId أو _id للبروفايل
   */
  async getProfile(
    userIdOrProfileId: string,
    populateUser = true,
  ): Promise<
    | (EngineerProfileDocument & {
        jobTitle?: string;
        coupon?: {
          code: string;
          name: string;
          description?: string;
          discountValue?: number;
          type?: string;
          commissionRate?: number;
        };
        exchangeRates?: {
          usdToYer: number;
          usdToSar: number;
          lastUpdatedAt?: Date;
        };
        usdToYerRate?: number;
        usdToSarRate?: number;
      })
    | null
  > {
    let profile: EngineerProfileDocument | null = null;
    let actualUserId: Types.ObjectId | null = null;

    // محاولة البحث بـ _id أولاً (إذا كان معرف البروفايل)
    try {
      const profileById = await this.engineerProfileModel.findById(userIdOrProfileId).lean();
      if (profileById) {
        profile = profileById;
        actualUserId = profileById.userId as Types.ObjectId;
      }
    } catch (e) {
      // ليس ObjectId صالح، تجاهل
    }

    // إذا لم يُوجد، حاول البحث بـ userId
    if (!profile) {
      try {
        const query = this.engineerProfileModel.findOne({
          userId: new Types.ObjectId(userIdOrProfileId),
        });

        if (populateUser) {
          query.populate(
            'userId',
            'firstName lastName phone jobTitle city gender status engineer_status',
          );
        }

        profile = await query.lean();
        if (profile) {
          actualUserId = new Types.ObjectId(userIdOrProfileId);
        }
      } catch (e) {
        // ليس ObjectId صالح، تجاهل
      }
    } else {
      // إذا وُجد البروفايل بـ _id، نحتاج populate
      if (populateUser && actualUserId) {
        const populatedProfile = await this.engineerProfileModel
          .findOne({ _id: new Types.ObjectId(userIdOrProfileId) })
          .populate(
            'userId',
            'firstName lastName phone jobTitle city gender status engineer_status',
          )
          .lean();
        if (populatedProfile) {
          profile = populatedProfile;
        }
      }
    }

    if (!profile) {
      return null;
    }

    // تحديد userId الفعلي
    if (!actualUserId) {
      const userIdValue = profile.userId;
      if (userIdValue instanceof Types.ObjectId) {
        actualUserId = userIdValue;
      } else if (userIdValue && typeof userIdValue === 'object' && '_id' in userIdValue) {
        const userIdObj = userIdValue as { _id: Types.ObjectId | string };
        actualUserId = new Types.ObjectId(userIdObj._id);
      } else if (userIdValue) {
        actualUserId = new Types.ObjectId(String(userIdValue));
      }
    }

    // تحديث الإحصائيات من قاعدة البيانات الفعلية (عدد الخدمات المكتملة والأرباح)
    if (actualUserId) {
      await this.updateStatistics(actualUserId.toString());
      // إعادة جلب البروفايل المحدث بعد تحديث الإحصائيات
      const updatedProfileQuery = this.engineerProfileModel.findOne({
        userId: actualUserId,
      });
      if (populateUser) {
        updatedProfileQuery.populate(
          'userId',
          'firstName lastName phone jobTitle city gender status engineer_status',
        );
      }
      const updatedProfile = await updatedProfileQuery.lean();
      if (updatedProfile) {
        profile = updatedProfile;
      }
    }

    // جلب الكوبون المرتبط بالمهندس مع إحصائياته
    const coupon = await this.couponModel
      .findOne({ engineerId: actualUserId, status: 'active' })
      .select(
        'code name description discountValue type commissionRate usedCount totalCommissionEarned totalDiscountGiven totalRevenue',
      )
      .lean();

    // حساب إجمالي الدخل من العمولات من commissionTransactions
    const totalCommissionEarnings = (profile.commissionTransactions || []).reduce(
      (sum, transaction) => {
        // فقط العمولات (ليس السحوبات أو الاستردادات)
        if (transaction.type === 'commission' && transaction.amount > 0) {
          return sum + transaction.amount;
        }
        return sum;
      },
      0,
    );

    // إضافة المعلومات الإضافية
    const populatedUserId = profile.userId;
    const isPopulatedUser =
      populatedUserId &&
      typeof populatedUserId === 'object' &&
      !(populatedUserId instanceof Types.ObjectId) &&
      'firstName' in populatedUserId;

    interface PopulatedUser {
      jobTitle?: string;
    }

    const userData: PopulatedUser | null = isPopulatedUser
      ? (populatedUserId as PopulatedUser)
      : null;

    // استخراج createdAt من البروفايل (موجود تلقائياً بسبب timestamps: true)
    const profileWithTimestamps = profile as EngineerProfileDocument & {
      createdAt?: Date;
      updatedAt?: Date;
    };

    // تحويل العملات للرصيد وإجمالي العمولات
    const walletBalanceUSD = profile.walletBalance || 0;
    const walletBalanceConverted = await this.convertAmountFromUSD(walletBalanceUSD);
    const totalCommissionEarningsConverted =
      await this.convertAmountFromUSD(totalCommissionEarnings);

    // جلب أسعار الصرف الحالية
    const exchangeRates = await this.exchangeRatesService.getCurrentRates();

    const result = {
      ...profile,
      jobTitle: profile.jobTitle || (userData?.jobTitle ?? undefined),
      joinedAt: profileWithTimestamps.createdAt, // تاريخ الانضمام (تاريخ إنشاء البروفايل)
      totalCommissionEarnings, // إجمالي الدخل من العمولات (USD - للتوافق مع الكود القديم)
      // إضافة تحويلات العملات
      walletBalanceUSD: walletBalanceConverted.usd,
      walletBalanceYER: walletBalanceConverted.yer,
      walletBalanceSAR: walletBalanceConverted.sar,
      totalCommissionEarningsUSD: totalCommissionEarningsConverted.usd,
      totalCommissionEarningsYER: totalCommissionEarningsConverted.yer,
      totalCommissionEarningsSAR: totalCommissionEarningsConverted.sar,
      // إضافة أسعار الصرف
      exchangeRates: {
        usdToYer: exchangeRates.usdToYer,
        usdToSar: exchangeRates.usdToSar,
        lastUpdatedAt: exchangeRates.lastUpdatedAt,
      },
      // إرجاع أسعار الصرف بشكل مباشر لاستخدامها في الواجهة
      usdToYerRate: exchangeRates.usdToYer,
      usdToSarRate: exchangeRates.usdToSar,
    } as EngineerProfileDocument & {
      jobTitle?: string;
      joinedAt?: Date;
      totalCommissionEarnings?: number;
      walletBalanceUSD?: number;
      walletBalanceYER?: number;
      walletBalanceSAR?: number;
      totalCommissionEarningsUSD?: number;
      totalCommissionEarningsYER?: number;
      totalCommissionEarningsSAR?: number;
      exchangeRates?: {
        usdToYer: number;
        usdToSar: number;
        lastUpdatedAt?: Date;
      };
      usdToYerRate?: number;
      usdToSarRate?: number;
      coupon?: {
        code: string;
        name: string;
        description?: string;
        discountValue?: number;
        type?: string;
        commissionRate?: number;
        stats?: {
          usedCount: number;
          totalCommissionEarned: number;
          totalDiscountGiven: number;
          totalRevenue: number;
        };
      };
    };

    // إضافة الكوبون مع إحصائياته
    if (coupon) {
      result.coupon = {
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountValue: coupon.discountValue,
        type: coupon.type,
        commissionRate: coupon.commissionRate,
        stats: {
          usedCount: coupon.usedCount || 0,
          totalCommissionEarned: coupon.totalCommissionEarned || 0,
          totalDiscountGiven: coupon.totalDiscountGiven || 0,
          totalRevenue: coupon.totalRevenue || 0,
        },
      };
    }

    return result;
  }

  /**
   * تحديث معلومات البروفايل
   */
  async updateProfile(
    userId: string,
    updates: {
      bio?: string;
      avatarUrl?: string;
      whatsappNumber?: string;
      jobTitle?: string;
      specialties?: string[];
      yearsOfExperience?: number;
      certifications?: string[];
    },
  ): Promise<EngineerProfileDocument> {
    let profile = await this.engineerProfileModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!profile) {
      // إنشاء بروفايل جديد إذا لم يكن موجوداً
      profile = await this.createProfile(userId);
    }

    // تحديث الحقول
    if (updates.bio !== undefined) profile.bio = updates.bio;
    if (updates.avatarUrl !== undefined) profile.avatarUrl = updates.avatarUrl;
    if (updates.whatsappNumber !== undefined) profile.whatsappNumber = updates.whatsappNumber;
    if (updates.jobTitle !== undefined) profile.jobTitle = updates.jobTitle;
    if (updates.specialties !== undefined) profile.specialties = updates.specialties;
    if (updates.yearsOfExperience !== undefined)
      profile.yearsOfExperience = updates.yearsOfExperience;
    if (updates.certifications !== undefined) profile.certifications = updates.certifications;

    return await profile.save();
  }

  /**
   * إضافة أو تحديث تقييم من طلب خدمة
   * إذا كان التقييم موجوداً لنفس serviceRequestId، يتم تحديثه
   * وإلا يتم إضافة تقييم جديد
   */
  async addRatingFromServiceRequest(
    engineerId: string,
    serviceRequestId: string,
    customerId: string,
    score: number,
    comment: string,
  ): Promise<EngineerProfileDocument> {
    if (score < 1 || score > 5) {
      throw new BadRequestException('التقييم يجب أن يكون بين 1 و 5');
    }

    if (!comment || comment.trim().length === 0) {
      throw new BadRequestException('التعليق مطلوب');
    }

    // جلب بيانات العميل
    const customer = await this.userModel.findById(customerId).select('firstName lastName').lean();
    if (!customer) {
      throw new NotFoundException('العميل غير موجود');
    }

    // جلب أو إنشاء البروفايل
    let profile = await this.engineerProfileModel.findOne({
      userId: new Types.ObjectId(engineerId),
    });
    if (!profile) {
      profile = await this.createProfile(engineerId);
    }

    const serviceRequestObjectId = new Types.ObjectId(serviceRequestId);
    const customerObjectId = new Types.ObjectId(customerId);

    // التحقق من وجود تقييم سابق لنفس serviceRequestId
    const existingRatingIndex = profile.ratings.findIndex(
      (r) => r.serviceRequestId?.toString() === serviceRequestObjectId.toString(),
    );

    const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'عميل';

    if (existingRatingIndex >= 0) {
      // تحديث التقييم الموجود
      profile.ratings[existingRatingIndex] = {
        score,
        comment: comment.trim(),
        customerId: customerObjectId,
        customerName,
        serviceRequestId: serviceRequestObjectId,
        ratedAt: new Date(), // تحديث التاريخ أيضاً
      };
    } else {
      // إضافة تقييم جديد
      const newRating: EngineerRating = {
        score,
        comment: comment.trim(),
        customerId: customerObjectId,
        customerName,
        serviceRequestId: serviceRequestObjectId,
        ratedAt: new Date(),
      };
      profile.addRating(newRating);
    }

    // تحديث الإحصائيات
    await this.updateStatistics(engineerId);

    return await profile.save();
  }

  /**
   * حذف تقييم من طلب خدمة
   */
  async removeRatingFromServiceRequest(
    engineerId: string,
    serviceRequestId: string,
  ): Promise<EngineerProfileDocument | null> {
    const profile = await this.engineerProfileModel.findOne({
      userId: new Types.ObjectId(engineerId),
    });
    if (!profile) {
      return null;
    }

    const serviceRequestObjectId = new Types.ObjectId(serviceRequestId);

    // إزالة التقييم
    const initialLength = profile.ratings.length;
    profile.ratings = profile.ratings.filter(
      (r) => r.serviceRequestId?.toString() !== serviceRequestObjectId.toString(),
    );

    // إذا تم حذف تقييم، قم بإعادة حساب الإحصائيات
    if (profile.ratings.length < initialLength) {
      profile.calculateRatings();
      await this.updateStatistics(engineerId);
      return await profile.save();
    }

    return profile;
  }

  /**
   * إضافة تقييم من طلب (Order)
   */
  async addRatingFromOrder(
    engineerId: string,
    orderId: string,
    customerId: string,
    rating: number,
    review: string,
  ): Promise<EngineerProfileDocument> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('التقييم يجب أن يكون بين 1 و 5');
    }

    if (!review || review.trim().length === 0) {
      throw new BadRequestException('التعليق مطلوب');
    }

    // جلب بيانات العميل
    const customer = await this.userModel.findById(customerId).select('firstName lastName').lean();
    if (!customer) {
      throw new NotFoundException('العميل غير موجود');
    }

    // جلب أو إنشاء البروفايل
    let profile = await this.engineerProfileModel.findOne({
      userId: new Types.ObjectId(engineerId),
    });
    if (!profile) {
      profile = await this.createProfile(engineerId);
    }

    // إنشاء التقييم الجديد
    const newRating: EngineerRating = {
      score: rating,
      comment: review.trim(),
      customerId: new Types.ObjectId(customerId),
      customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'عميل',
      orderId: new Types.ObjectId(orderId),
      ratedAt: new Date(),
    };

    // إضافة التقييم
    profile.addRating(newRating);

    // تحديث الإحصائيات
    await this.updateStatistics(engineerId);

    return await profile.save();
  }

  /**
   * جلب التقييمات للمهندس
   */
  async getRatings(
    engineerId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'recent' | 'top' | 'oldest';
      minScore?: number;
    } = {},
  ): Promise<{
    ratings: EngineerRating[];
    total: number;
    page: number;
    limit: number;
    averageRating: number;
    totalRatings: number;
  }> {
    const { page = 1, limit = 10, sortBy = 'recent', minScore } = options;

    const profile = await this.engineerProfileModel.findOne({
      userId: new Types.ObjectId(engineerId),
    });
    if (!profile) {
      return {
        ratings: [],
        total: 0,
        page,
        limit,
        averageRating: 0,
        totalRatings: 0,
      };
    }

    let ratings = [...profile.ratings];

    // فلترة حسب الحد الأدنى للنجوم
    if (minScore) {
      ratings = ratings.filter((r) => r.score >= minScore);
    }

    // الترتيب
    switch (sortBy) {
      case 'recent':
        ratings.sort((a, b) => b.ratedAt.getTime() - a.ratedAt.getTime());
        break;
      case 'top':
        ratings.sort((a, b) => b.score - a.score);
        break;
      case 'oldest':
        ratings.sort((a, b) => a.ratedAt.getTime() - b.ratedAt.getTime());
        break;
    }

    const total = ratings.length;
    const startIndex = (page - 1) * limit;
    const paginatedRatings = ratings.slice(startIndex, startIndex + limit);

    return {
      ratings: paginatedRatings,
      total,
      page,
      limit,
      averageRating: profile.averageRating,
      totalRatings: profile.totalRatings,
    };
  }

  /**
   * تحديث الإحصائيات من قاعدة البيانات الفعلية
   */
  async updateStatistics(engineerId: string): Promise<void> {
    const profile = await this.engineerProfileModel.findOne({
      userId: new Types.ObjectId(engineerId),
    });
    if (!profile) {
      return;
    }

    // حساب الخدمات المكتملة (تشمل COMPLETED و RATED)
    const completedServices = await this.serviceRequestModel.countDocuments({
      engineerId: new Types.ObjectId(engineerId),
      status: { $in: ['COMPLETED', 'RATED'] },
    });

    // حساب الأرباح من العروض المقبولة (تشمل COMPLETED و RATED)
    const earningsResult = await this.serviceRequestModel.aggregate([
      {
        $match: {
          engineerId: new Types.ObjectId(engineerId),
          status: { $in: ['COMPLETED', 'RATED'] },
          acceptedOffer: { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$acceptedOffer.amount' },
        },
      },
    ]);

    profile.totalCompletedServices = completedServices;
    profile.totalEarnings = earningsResult[0]?.total || 0;

    // إعادة حساب التقييمات
    profile.calculateRatings();

    await profile.save();
  }

  /**
   * مزامنة جميع التقييمات من ServiceRequest و Order
   */
  async syncRatings(engineerId: string): Promise<void> {
    const profile = await this.engineerProfileModel.findOne({
      userId: new Types.ObjectId(engineerId),
    });
    if (!profile) {
      await this.createProfile(engineerId);
      return;
    }

    // جلب التقييمات من ServiceRequest
    const serviceRequests = await this.serviceRequestModel
      .find({
        engineerId: new Types.ObjectId(engineerId),
        'rating.score': { $exists: true, $gte: 1, $lte: 5 },
      })
      .populate('userId', 'firstName lastName')
      .lean();

    // جلب التقييمات من Order (إن وجدت)
    // يمكن إضافة هذا لاحقاً إذا كان هناك تقييمات في الطلبات

    // إنشاء map للتقييمات الموجودة لتجنب التكرار
    const existingRatingsMap = new Map<string, boolean>();
    profile.ratings.forEach((r) => {
      const key = r.serviceRequestId?.toString() || r.orderId?.toString() || '';
      if (key) existingRatingsMap.set(key, true);
    });

    // إضافة التقييمات الجديدة من ServiceRequest
    for (const request of serviceRequests) {
      if (!request.rating?.score || !request.rating?.comment) continue;

      const key = request._id.toString();
      if (existingRatingsMap.has(key)) continue;

      const customer = request.userId as { firstName?: string; lastName?: string } | string;
      const customerName =
        typeof customer === 'object' && customer
          ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'عميل'
          : 'عميل';

      const newRating: EngineerRating = {
        score: request.rating.score,
        comment: request.rating.comment,
        customerId: new Types.ObjectId(request.userId as string),
        customerName,
        serviceRequestId: request._id as Types.ObjectId,
        ratedAt: request.rating.at || new Date(),
      };

      profile.addRating(newRating);
    }

    // تحديث الإحصائيات
    await this.updateStatistics(engineerId);
  }

  /**
   * جلب قائمة المهندسين مع بروفايلاتهم مرتبة حسب التقييم
   */
  async getEngineersList(
    options: {
      page?: number;
      limit?: number;
      minRating?: number;
      sortBy?: 'rating' | 'reviews' | 'recent';
    } = {},
  ): Promise<{
    engineers: Array<{
      profile: EngineerProfileDocument;
      user: Partial<UserDocument>;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, minRating, sortBy = 'rating' } = options;

    const query: Record<string, unknown> = {};
    if (minRating) {
      query.averageRating = { $gte: minRating };
    }

    let sort: Record<string, 1 | -1> = {};
    switch (sortBy) {
      case 'rating':
        sort = { averageRating: -1, totalRatings: -1 };
        break;
      case 'reviews':
        sort = { totalRatings: -1, averageRating: -1 };
        break;
      case 'recent':
        sort = { createdAt: -1 };
        break;
    }

    const [profiles, total] = await Promise.all([
      this.engineerProfileModel
        .find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'firstName lastName phone jobTitle city engineer_status')
        .lean(),
      this.engineerProfileModel.countDocuments(query),
    ]);

    const engineers = profiles.map((profile) => {
      const populatedProfile = profile as unknown as EngineerProfileDocument & {
        userId: Partial<UserDocument>;
        createdAt?: Date;
        updatedAt?: Date;
      };
      return {
        profile: {
          ...populatedProfile,
          joinedAt: populatedProfile.createdAt, // تاريخ الانضمام (تاريخ إنشاء البروفايل)
        } as unknown as EngineerProfileDocument & { joinedAt?: Date },
        user: populatedProfile.userId,
      };
    });

    return {
      engineers,
      total,
      page,
      limit,
    };
  }
}

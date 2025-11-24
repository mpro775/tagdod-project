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
  ) {}

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
   */
  async getProfile(userId: string, populateUser = true): Promise<EngineerProfileDocument | null> {
    const query = this.engineerProfileModel.findOne({ userId: new Types.ObjectId(userId) });

    if (populateUser) {
      query.populate('userId', 'firstName lastName phone jobTitle city');
    }

    return await query.lean();
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
      specialties?: string[];
      yearsOfExperience?: number;
      certifications?: string[];
      languages?: string[];
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
    if (updates.specialties !== undefined) profile.specialties = updates.specialties;
    if (updates.yearsOfExperience !== undefined)
      profile.yearsOfExperience = updates.yearsOfExperience;
    if (updates.certifications !== undefined) profile.certifications = updates.certifications;
    if (updates.languages !== undefined) profile.languages = updates.languages;

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

    // حساب الخدمات المكتملة
    const completedServices = await this.serviceRequestModel.countDocuments({
      engineerId: new Types.ObjectId(engineerId),
      status: 'COMPLETED',
    });

    // حساب الأرباح من العروض المقبولة
    const earningsResult = await this.serviceRequestModel.aggregate([
      {
        $match: {
          engineerId: new Types.ObjectId(engineerId),
          status: 'COMPLETED',
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
      };
      return {
        profile: populatedProfile as unknown as EngineerProfileDocument,
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

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Coupon,
  CouponStatus,
  CouponType,
  CouponVisibility,
  DiscountAppliesTo,
} from './schemas/coupon.schema';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ListCouponsDto,
  ValidateCouponDto,
  BulkGenerateCouponsDto,
} from './dto/coupon.dto';
import { AppException } from '../../shared/exceptions/app.exception';

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  message?: string;
  calculatedDiscount?: number;
  finalAmount?: number;
}

export interface CouponApplicationResult {
  discountAmount: number;
  itemsAffected: string[];
  freeItems?: string[];
}

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<Coupon>,
  ) {}

  /**
   * Create a new coupon
   */
  async createCoupon(dto: CreateCouponDto, adminId?: string): Promise<Coupon> {
    // Check if code already exists
    const existing = await this.couponModel.findOne({
      code: dto.code.toUpperCase(),
      deletedAt: null,
    });

    if (existing) {
      throw new AppException('Coupon code already exists', 400);
    }

    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new AppException('End date must be after start date', 400);
    }

    // Validate discount configuration
    this.validateDiscountConfiguration(dto);

    const coupon = new this.couponModel({
      ...dto,
      code: dto.code.toUpperCase(),
      startDate,
      endDate,
      createdBy: adminId ? new Types.ObjectId(adminId) : undefined,
      currentUses: 0,
      stats: {
        views: 0,
        applies: 0,
        successfulOrders: 0,
        failedAttempts: 0,
        totalRevenue: 0,
        totalDiscount: 0,
      },
    });

    return await coupon.save();
  }

  /**
   * List coupons with filters
   */
  async listCoupons(dto: ListCouponsDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      type,
      visibility,
      includeDeleted = false,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto;

    const skip = (page - 1) * limit;
    const query: any = {};

    // Delete filter
    if (!includeDeleted) {
      query.deletedAt = null;
    }

    // Search
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (visibility) query.visibility = visibility;

    // Auto-update expired coupons
    await this.updateExpiredCoupons();

    const [coupons, total] = await Promise.all([
      this.couponModel
        .find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.couponModel.countDocuments(query),
    ]);

    return {
      coupons,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get coupon by ID
   */
  async getCouponById(id: string): Promise<Coupon> {
    const coupon = await this.couponModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!coupon) {
      throw new AppException('Coupon not found', 404);
    }

    return coupon;
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(code: string): Promise<Coupon | null> {
    return await this.couponModel.findOne({
      code: code.toUpperCase(),
      deletedAt: null,
    });
  }

  /**
   * Update coupon
   */
  async updateCoupon(
    id: string,
    dto: UpdateCouponDto,
    adminId?: string,
  ): Promise<Coupon> {
    const coupon = await this.getCouponById(id);

    // Validate dates if provided
    if (dto.startDate || dto.endDate) {
      const startDate = dto.startDate ? new Date(dto.startDate) : coupon.startDate;
      const endDate = dto.endDate ? new Date(dto.endDate) : coupon.endDate;

      if (endDate <= startDate) {
        throw new AppException('End date must be after start date', 400);
      }
    }

    Object.assign(coupon, dto);
    coupon.updatedBy = adminId ? new Types.ObjectId(adminId) : undefined;

    return await coupon.save();
  }

  /**
   * Delete coupon (soft delete)
   */
  async deleteCoupon(id: string, adminId?: string): Promise<void> {
    const coupon = await this.getCouponById(id);

    coupon.deletedAt = new Date();
    coupon.deletedBy = adminId ? new Types.ObjectId(adminId) : undefined;

    await coupon.save();
  }

  /**
   * Toggle coupon status
   */
  async toggleStatus(id: string): Promise<Coupon> {
    const coupon = await this.getCouponById(id);

    coupon.status =
      coupon.status === CouponStatus.ACTIVE
        ? CouponStatus.INACTIVE
        : CouponStatus.ACTIVE;

    return await coupon.save();
  }

  /**
   * Validate coupon
   */
  async validateCoupon(dto: ValidateCouponDto): Promise<CouponValidationResult> {
    const { code, orderAmount, currency, userId, accountType, productIds, categoryIds } = dto;

    // Find coupon
    const coupon = await this.getCouponByCode(code);

    if (!coupon) {
      return {
        valid: false,
        message: 'Coupon not found',
      };
    }

    // Check status
    if (coupon.status !== CouponStatus.ACTIVE) {
      return {
        valid: false,
        message: 'Coupon is not active',
      };
    }

    // Check dates
    const now = new Date();
    if (coupon.startDate > now) {
      return {
        valid: false,
        message: 'Coupon is not yet active',
      };
    }

    if (coupon.endDate < now) {
      return {
        valid: false,
        message: 'Coupon has expired',
      };
    }

    // Check usage limits
    if (coupon.maxTotalUses && coupon.currentUses >= coupon.maxTotalUses) {
      return {
        valid: false,
        message: 'Coupon usage limit reached',
      };
    }

    // Check per-user usage
    if (userId && coupon.maxUsesPerUser) {
      const userUsageCount = coupon.usageHistory?.filter(
        (h) => h.userId.toString() === userId,
      ).length || 0;

      if (userUsageCount >= coupon.maxUsesPerUser) {
        return {
          valid: false,
          message: 'You have already used this coupon maximum times',
        };
      }
    }

    // Check currency
    if (coupon.currency && coupon.currency !== currency) {
      return {
        valid: false,
        message: `Coupon is only valid for ${coupon.currency}`,
      };
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount is ${coupon.minOrderAmount} ${currency}`,
      };
    }

    // Check account type
    if (
      coupon.allowedAccountTypes &&
      coupon.allowedAccountTypes.length > 0 &&
      accountType
    ) {
      if (!coupon.allowedAccountTypes.includes(accountType)) {
        return {
          valid: false,
          message: 'Coupon is not valid for your account type',
        };
      }
    }

    // Check allowed users
    if (
      coupon.allowedUserIds &&
      coupon.allowedUserIds.length > 0 &&
      userId
    ) {
      const isAllowed = coupon.allowedUserIds.some(
        (id) => id.toString() === userId,
      );
      if (!isAllowed) {
        return {
          valid: false,
          message: 'This coupon is not available for you',
        };
      }
    }

    // Check applicable products/categories
    if (coupon.appliesTo === DiscountAppliesTo.SPECIFIC_PRODUCTS) {
      if (!productIds || productIds.length === 0) {
        return {
          valid: false,
          message: 'No applicable products in cart',
        };
      }

      const hasApplicableProduct = productIds.some((id) =>
        coupon.applicableProductIds?.includes(id),
      );

      if (!hasApplicableProduct) {
        return {
          valid: false,
          message: 'Coupon is not applicable to products in your cart',
        };
      }
    }

    if (coupon.appliesTo === DiscountAppliesTo.SPECIFIC_CATEGORIES) {
      if (!categoryIds || categoryIds.length === 0) {
        return {
          valid: false,
          message: 'No applicable categories in cart',
        };
      }

      const hasApplicableCategory = categoryIds.some((id) =>
        coupon.applicableCategoryIds?.includes(id),
      );

      if (!hasApplicableCategory) {
        return {
          valid: false,
          message: 'Coupon is not applicable to items in your cart',
        };
      }
    }

    // Calculate discount
    const calculatedDiscount = this.calculateDiscount(coupon, orderAmount);
    const finalAmount = Math.max(0, orderAmount - calculatedDiscount);

    // Increment views
    await this.couponModel.updateOne(
      { _id: coupon._id },
      { $inc: { 'stats.views': 1 } },
    );

    return {
      valid: true,
      coupon,
      calculatedDiscount,
      finalAmount,
    };
  }

  /**
   * Apply coupon to order
   */
  async applyCouponToOrder(
    couponCode: string,
    orderId: string,
    userId: string,
    orderAmount: number,
    discountAmount: number,
  ): Promise<void> {
    const coupon = await this.getCouponByCode(couponCode);

    if (!coupon) {
      throw new AppException('Coupon not found', 404);
    }

    // Update usage
    await this.couponModel.updateOne(
      { _id: coupon._id },
      {
        $inc: {
          currentUses: 1,
          'stats.applies': 1,
          'stats.successfulOrders': 1,
          'stats.totalRevenue': orderAmount,
          'stats.totalDiscount': discountAmount,
        },
        $push: {
          usageHistory: {
            userId: new Types.ObjectId(userId),
            usedAt: new Date(),
            orderId: new Types.ObjectId(orderId),
          },
        },
      },
    );

    this.logger.log(`Coupon ${couponCode} applied to order ${orderId}`);
  }

  /**
   * Increment failed attempts
   */
  async incrementFailedAttempts(code: string): Promise<void> {
    await this.couponModel.updateOne(
      { code: code.toUpperCase() },
      { $inc: { 'stats.failedAttempts': 1 } },
    );
  }

  /**
   * Bulk generate coupons
   */
  async bulkGenerateCoupons(
    dto: BulkGenerateCouponsDto,
    adminId?: string,
  ): Promise<Coupon[]> {
    const { prefix, count, discountPercentage, startDate, endDate, maxUsesPerUser = 1 } = dto;

    const coupons: Coupon[] = [];

    for (let i = 0; i < count; i++) {
      const randomSuffix = this.generateRandomString(8);
      const code = `${prefix}${randomSuffix}`;

      const coupon = await this.createCoupon(
        {
          code,
          title: `Bulk Generated Coupon ${code}`,
          type: CouponType.PERCENTAGE,
          discountPercentage,
          startDate,
          endDate,
          maxUsesPerUser,
          visibility: CouponVisibility.PRIVATE,
        } as CreateCouponDto,
        adminId,
      );

      coupons.push(coupon);
    }

    this.logger.log(`Bulk generated ${count} coupons with prefix ${prefix}`);

    return coupons;
  }

  /**
   * Get auto-apply coupons for user
   */
  async getAutoApplyCoupons(
    userId?: string,
    accountType?: string,
  ): Promise<Coupon[]> {
    const now = new Date();

    const query: any = {
      visibility: CouponVisibility.AUTO_APPLY,
      status: CouponStatus.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
      deletedAt: null,
    };

    // Check usage limits
    query.$or = [
      { maxTotalUses: { $exists: false } },
      { $expr: { $lt: ['$currentUses', '$maxTotalUses'] } },
    ];

    const coupons = await this.couponModel.find(query).lean();

    // Filter by account type if provided
    return coupons.filter((coupon) => {
      if (
        coupon.allowedAccountTypes &&
        coupon.allowedAccountTypes.length > 0 &&
        accountType
      ) {
        return coupon.allowedAccountTypes.includes(accountType);
      }
      return true;
    });
  }

  /**
   * Get coupon analytics
   */
  async getCouponAnalytics(id: string) {
    const coupon = await this.getCouponById(id);

    const conversionRate =
      coupon.stats.applies > 0
        ? (coupon.stats.successfulOrders / coupon.stats.applies) * 100
        : 0;

    const avgOrderValue =
      coupon.stats.successfulOrders > 0
        ? coupon.stats.totalRevenue / coupon.stats.successfulOrders
        : 0;

    const avgDiscount =
      coupon.stats.successfulOrders > 0
        ? coupon.stats.totalDiscount / coupon.stats.successfulOrders
        : 0;

    return {
      coupon,
      analytics: {
        conversionRate: conversionRate.toFixed(2) + '%',
        avgOrderValue,
        avgDiscount,
        totalOrders: coupon.stats.successfulOrders,
        totalRevenue: coupon.stats.totalRevenue,
        totalDiscount: coupon.stats.totalDiscount,
        usagePercentage: coupon.maxTotalUses
          ? ((coupon.currentUses / coupon.maxTotalUses) * 100).toFixed(2) + '%'
          : 'Unlimited',
      },
    };
  }

  /**
   * Get public coupons
   */
  async getPublicCoupons(): Promise<Coupon[]> {
    const now = new Date();

    return await this.couponModel
      .find({
        visibility: CouponVisibility.PUBLIC,
        status: CouponStatus.ACTIVE,
        startDate: { $lte: now },
        endDate: { $gte: now },
        deletedAt: null,
      })
      .select('code title description type discountPercentage discountAmount minOrderAmount')
      .lean();
  }

  // ===== Private Helper Methods =====

  private validateDiscountConfiguration(dto: CreateCouponDto | UpdateCouponDto): void {
    if (dto.type === CouponType.PERCENTAGE) {
      if (!dto.discountPercentage || dto.discountPercentage <= 0 || dto.discountPercentage > 100) {
        throw new AppException('Invalid discount percentage', 400);
      }
    }

    if (dto.type === CouponType.FIXED_AMOUNT) {
      if (!dto.discountAmount || dto.discountAmount <= 0) {
        throw new AppException('Invalid discount amount', 400);
      }
    }

    if (dto.type === CouponType.BUY_X_GET_Y) {
      if (!dto.buyXGetY || !dto.buyXGetY.buyQuantity || !dto.buyXGetY.getQuantity) {
        throw new AppException('Buy X Get Y configuration is required', 400);
      }
    }
  }

  private calculateDiscount(coupon: Coupon, orderAmount: number): number {
    let discount = 0;

    switch (coupon.type) {
      case CouponType.PERCENTAGE:
        discount = (orderAmount * (coupon.discountPercentage || 0)) / 100;
        break;

      case CouponType.FIXED_AMOUNT:
        discount = coupon.discountAmount || 0;
        break;

      case CouponType.FREE_SHIPPING:
        // Free shipping discount will be handled separately
        discount = 0;
        break;

      default:
        discount = 0;
    }

    // Apply max discount cap if set
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }

    return Math.min(discount, orderAmount);
  }

  private async updateExpiredCoupons(): Promise<void> {
    const now = new Date();

    await this.couponModel.updateMany(
      {
        status: CouponStatus.ACTIVE,
        endDate: { $lt: now },
      },
      {
        $set: { status: CouponStatus.EXPIRED },
      },
    );

    await this.couponModel.updateMany(
      {
        status: CouponStatus.ACTIVE,
        maxTotalUses: { $exists: true },
        $expr: { $gte: ['$currentUses', '$maxTotalUses'] },
      },
      {
        $set: { status: CouponStatus.EXHAUSTED },
      },
    );
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}


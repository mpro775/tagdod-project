import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerLocation, BannerPromotionType } from './schemas/banner.schema';
import { CreateBannerDto, UpdateBannerDto, ListBannersDto } from './dto/banner.dto';
import { AppException } from '../../shared/exceptions/app.exception';
import { PriceRule } from '../promotions/schemas/price-rule.schema';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<Banner>,
    @InjectModel(PriceRule.name) private priceRuleModel: Model<PriceRule>,
  ) {}

  /**
   * Create a new banner
   */
  async createBanner(dto: CreateBannerDto): Promise<Banner> {
    const banner = new this.bannerModel({
      ...dto,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      clickCount: 0,
      viewCount: 0,
    });

    return await banner.save();
  }

  /**
   * Get all banners with filters and pagination
   */
  async listBanners(dto: ListBannersDto) {
    const { page = 1, limit = 20, search, isActive, location, sortBy = 'sortOrder', sortOrder = 'asc' } = dto;
    
    const skip = (page - 1) * limit;
    const query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }

    // Location filter
    if (location) {
      query.location = location;
    }

    // Date filter - only show banners within their active date range
    const now = new Date();
    query.$or = [
      { startDate: { $exists: false }, endDate: { $exists: false } }, // No date restrictions
      { startDate: { $lte: now }, endDate: { $gte: now } }, // Within date range
      { startDate: { $lte: now }, endDate: { $exists: false } }, // Started but no end date
      { startDate: { $exists: false }, endDate: { $gte: now } }, // No start date but not ended
    ];

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [banners, total] = await Promise.all([
      this.bannerModel
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.bannerModel.countDocuments(query),
    ]);

    return {
      banners,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get banner by ID
   */
  async getBannerById(id: string): Promise<Banner> {
    const banner = await this.bannerModel.findById(id);
    if (!banner) {
      throw new AppException('Banner not found', 404);
    }
    return banner;
  }

  /**
   * Update banner
   */
  async updateBanner(id: string, dto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.bannerModel.findById(id);
    if (!banner) {
      throw new AppException('Banner not found', 404);
    }

    // Update fields
    Object.assign(banner, dto);

    return await banner.save();
  }

  /**
   * Delete banner
   */
  async deleteBanner(id: string): Promise<void> {
    const banner = await this.bannerModel.findById(id);
    if (!banner) {
      throw new AppException('Banner not found', 404);
    }

    await this.bannerModel.deleteOne({ _id: id });
  }

  /**
   * Get all active banners (for public use)
   */
  async getActiveBanners(location?: BannerLocation) {
    const now = new Date();
    const query: any = { isActive: true };

    if (location) {
      query.location = location;
    }

    // Filter by date range
    query.$or = [
      { startDate: { $exists: false }, endDate: { $exists: false } },
      { startDate: { $lte: now }, endDate: { $gte: now } },
      { startDate: { $lte: now }, endDate: { $exists: false } },
      { startDate: { $exists: false }, endDate: { $gte: now } },
    ];

    return await this.bannerModel
      .find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
  }

  /**
   * Toggle banner active status
   */
  async toggleBannerStatus(id: string): Promise<Banner> {
    const banner = await this.bannerModel.findById(id);
    if (!banner) {
      throw new AppException('Banner not found', 404);
    }

    banner.isActive = !banner.isActive;
    return await banner.save();
  }

  /**
   * Increment banner view count
   */
  async incrementViewCount(id: string): Promise<void> {
    await this.bannerModel.updateOne(
      { _id: id },
      { $inc: { viewCount: 1 } }
    );
  }

  /**
   * Increment banner click count
   */
  async incrementClickCount(id: string): Promise<void> {
    await this.bannerModel.updateOne(
      { _id: id },
      { $inc: { clickCount: 1 } }
    );
  }

  /**
   * Get banner with linked promotion details
   */
  async getBannerWithPromotion(id: string) {
    const banner = await this.bannerModel.findById(id).lean();
    
    if (!banner) {
      throw new AppException('Banner not found', 404);
    }

    let linkedPromotion = null;

    if (banner.promotionType === BannerPromotionType.PRICE_RULE && banner.linkedPriceRuleId) {
      linkedPromotion = await this.priceRuleModel.findById(banner.linkedPriceRuleId).lean();
    } else if (banner.promotionType === BannerPromotionType.COUPON && banner.linkedCouponCode) {
      linkedPromotion = await this.priceRuleModel.findOne({ 
        couponCode: banner.linkedCouponCode 
      }).lean();
    }

    return {
      ...banner,
      linkedPromotion,
    };
  }

  /**
   * Track banner conversion (purchase made after clicking banner)
   */
  async trackConversion(id: string, revenue: number): Promise<void> {
    await this.bannerModel.updateOne(
      { _id: id },
      { 
        $inc: { 
          conversionCount: 1,
          revenue: revenue,
        } 
      }
    );
  }
}


import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartItem, CartStatus } from './schemas/cart.schema';
import { Variant } from '../products/schemas/variant.schema';
import { Capabilities } from '../capabilities/schemas/capabilities.schema';
import { MarketingService } from '../marketing/marketing.service';

type ItemView = { itemId: string; variantId: string; qty: number };

type CartLine = {
  itemId: string;
  variantId: string;
  qty: number;
  unit: { base: number; final: number; currency: string; appliedRule: unknown };
  lineTotal: number;
};

// Optional promotions interface (duck-typing)
interface PromotionsLike {
  preview(input: {
    variantId: string;
    currency: string;
    qty: number;
    accountType: 'any' | 'customer' | 'engineer' | 'wholesale';
  }): Promise<{
    finalPrice: number;
    basePrice: number;
    appliedRule: unknown;
  } | null>;
}

@Injectable()
export class CartService {
  private MAX_ITEMS = 200;

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    @InjectModel(Capabilities.name) private capsModel: Model<Capabilities>,
    @Optional() private promotions?: PromotionsLike,
    @Optional() private marketingService?: MarketingService,
  ) {}

  // ---------- helpers
  private async getOrCreateUserCart(
    userId: string,
    currency: string = 'YER',
    accountType: string = 'retail',
  ) {
    let cart = await this.cartModel.findOne({ userId });
    if (!cart)
      cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
        currency,
        accountType,
        lastActivityAt: new Date(),
      });
    return cart;
  }
  private async getOrCreateGuestCart(
    deviceId: string,
    currency: string = 'YER',
    accountType: string = 'retail',
  ) {
    let cart = await this.cartModel.findOne({ deviceId });
    if (!cart)
      cart = await this.cartModel.create({
        deviceId,
        items: [],
        currency,
        accountType,
        lastActivityAt: new Date(),
      });
    return cart;
  }

  private ensureCapacity(cart: Cart) {
    if (cart.items.length > this.MAX_ITEMS) {
      throw new Error('Cart capacity exceeded');
    }
  }

  private toView(cart: Cart): ItemView[] {
    return (cart.items || []).map((ci: CartItem) => ({
      itemId: String(ci._id),
      variantId: String(ci.variantId),
      qty: ci.qty,
    }));
  }

  // ---------- user cart
  async getUserCart(userId: string) {
    const cart = await this.getOrCreateUserCart(userId);
    return { items: this.toView(cart) };
  }

  async updateCartSettings(
    userId: string,
    settings: { currency?: string; accountType?: string; metadata?: Record<string, unknown> },
  ) {
    const cart = await this.getOrCreateUserCart(userId);

    if (settings.currency) cart.currency = settings.currency;
    if (settings.accountType) cart.accountType = settings.accountType;
    if (settings.metadata) cart.metadata = { ...cart.metadata, ...settings.metadata };

    cart.lastActivityAt = new Date();
    await cart.save();

    return { items: this.toView(cart) };
  }

  async applyCoupon(userId: string, couponCode: string) {
    const cart = await this.getOrCreateUserCart(userId);

    // Validate coupon code with marketing service
    if (this.marketingService) {
      const validation = await this.marketingService.validateCoupon({
        code: couponCode,
        userId: userId,
        orderAmount: cart.pricingSummary?.subtotal || 0,
      });

      if (!validation.valid) {
        throw new Error(validation.message || 'Invalid coupon code');
      }

      // Store coupon details for discount calculation
      cart.appliedCouponCode = couponCode;
      cart.lastActivityAt = new Date();

      // Recalculate pricing with validated coupon
      await this.recalculatePricing(cart);
      await cart.save();
    } else {
      // Fallback if marketing service is not available
      cart.appliedCouponCode = couponCode;
      cart.lastActivityAt = new Date();

      await this.recalculatePricing(cart);
      await cart.save();
    }

    return { items: this.toView(cart) };
  }

  async removeCoupon(userId: string) {
    const cart = await this.getOrCreateUserCart(userId);

    cart.appliedCouponCode = undefined;
    cart.couponDiscount = 0;
    cart.lastActivityAt = new Date();

    // Recalculate pricing
    await this.recalculatePricing(cart);
    await cart.save();

    return { items: this.toView(cart) };
  }

  private async recalculatePricing(cart: Cart) {
    // This is a simplified version - in reality, you'd integrate with pricing service
    const pricingSummary = {
      subtotal: 0,
      promotionDiscount: 0,
      couponDiscount: 0,
      autoDiscount: 0,
      totalDiscount: 0,
      total: 0,
      itemsCount: cart.items.length,
      currency: cart.currency,
      lastCalculatedAt: new Date(),
    };

    // Calculate subtotal from items
    for (const item of cart.items) {
      if (item.pricing) {
        pricingSummary.subtotal += item.pricing.finalPrice * item.qty;
      }
    }

    // Apply coupon discount if exists
    if (cart.appliedCouponCode && this.marketingService) {
      // Calculate actual coupon discount
      const couponDiscount = await this.calculateCouponDiscount(
        cart.appliedCouponCode,
        pricingSummary.subtotal,
      );
      pricingSummary.couponDiscount = couponDiscount;
    } else if (cart.appliedCouponCode) {
      // Fallback calculation if marketing service is not available
      pricingSummary.couponDiscount = pricingSummary.subtotal * 0.1; // 10% example
    }

    pricingSummary.totalDiscount =
      pricingSummary.promotionDiscount +
      pricingSummary.couponDiscount +
      pricingSummary.autoDiscount;
    pricingSummary.total = pricingSummary.subtotal - pricingSummary.totalDiscount;

    cart.pricingSummary = pricingSummary;
  }

  private async calculateCouponDiscount(couponCode: string, subtotal: number): Promise<number> {
    if (!this.marketingService) {
      return 0;
    }

    try {
      // Get coupon details
      const validation = await this.marketingService.validateCoupon({
        code: couponCode,
        userId: '',
        orderAmount: subtotal,
      });

      if (!validation.valid || !validation.coupon) {
        return 0;
      }

      const coupon = validation.coupon;

      // Check minimum order amount
      if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
        return 0;
      }

      let discount = 0;

      // Calculate discount based on type
      if (coupon.type === 'percentage' && coupon.discountValue) {
        discount = (subtotal * coupon.discountValue) / 100;
      } else if (coupon.type === 'fixed_amount' && coupon.discountValue) {
        discount = coupon.discountValue;
      }

      // Apply maximum discount limit if set
      if (coupon.maximumDiscountAmount && discount > coupon.maximumDiscountAmount) {
        discount = coupon.maximumDiscountAmount;
      }

      // Ensure discount doesn't exceed subtotal
      return Math.min(discount, subtotal);
    } catch (error) {
      // Return 0 if calculation fails
      return 0;
    }
  }

  async addUserItem(userId: string, variantId: string, qty: number) {
    const cart = await this.getOrCreateUserCart(userId);
    const exist = cart.items.find((it: CartItem) => String(it.variantId) === String(variantId));
    if (exist) exist.qty = Math.min(999, exist.qty + qty);
    else cart.items.push({ variantId: new Types.ObjectId(variantId), qty, addedAt: new Date() });
    this.ensureCapacity(cart);
    await cart.save();
    return { items: this.toView(cart) };
  }
  async updateUserItem(userId: string, itemId: string, qty: number) {
    const cart = await this.getOrCreateUserCart(userId);
    const it = (cart.items as Types.DocumentArray<CartItem>).id(itemId);
    if (!it) return { items: this.toView(cart) };
    it.qty = qty;
    await cart.save();
    return { items: this.toView(cart) };
  }
  async removeUserItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateUserCart(userId);
    (
      (cart.items as Types.DocumentArray<CartItem>).id(itemId) as unknown as Types.Subdocument & {
        remove(): void;
      }
    )?.remove();
    await cart.save();
    return { items: this.toView(cart) };
  }
  async clearUserCart(userId: string) {
    const cart = await this.getOrCreateUserCart(userId);
    cart.items = [];
    await cart.save();
    return { items: [] };
  }

  // ---------- guest cart
  async getGuestCart(deviceId: string) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    return { items: this.toView(cart) };
  }
  async addGuestItem(deviceId: string, variantId: string, qty: number) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    const exist = cart.items.find((it: CartItem) => String(it.variantId) === String(variantId));
    if (exist) exist.qty = Math.min(999, exist.qty + qty);
    else cart.items.push({ variantId: new Types.ObjectId(variantId), qty, addedAt: new Date() });
    this.ensureCapacity(cart);
    await cart.save();
    return { items: this.toView(cart) };
  }
  async updateGuestItem(deviceId: string, itemId: string, qty: number) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    const it = (cart.items as Types.DocumentArray<CartItem>).id(itemId);
    if (!it) return { items: this.toView(cart) };
    it.qty = qty;
    await cart.save();
    return { items: this.toView(cart) };
  }
  async removeGuestItem(deviceId: string, itemId: string) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    (
      (cart.items as Types.DocumentArray<CartItem>).id(itemId) as unknown as Types.Subdocument & {
        remove(): void;
      }
    )?.remove();
    await cart.save();
    return { items: this.toView(cart) };
  }
  async clearGuestCart(deviceId: string) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    cart.items = [];
    await cart.save();
    return { items: [] };
  }

  // ---------- merge guest → user
  async merge(deviceId: string, userId: string) {
    const guest = await this.getOrCreateGuestCart(deviceId);
    const user = await this.getOrCreateUserCart(userId);
    for (const g of guest.items) {
      const u = user.items.find((x: CartItem) => String(x.variantId) === String(g.variantId));
      if (u) u.qty = Math.min(999, u.qty + g.qty);
      else user.items.push({ variantId: g.variantId, qty: g.qty, addedAt: g.addedAt });
    }
    await user.save();
    guest.items = [];
    await guest.save();
    return { items: this.toView(user) };
  }

  // ---------- preview
  async previewByCart(
    cart: Cart,
    currency: string,
    accountType: 'any' | 'customer' | 'engineer' | 'wholesale',
    userId?: string,
  ) {
    // Gather prices and totals
    const lines: CartLine[] = [];
    let subtotal = 0;
    let wholesaleDiscountPercent = 0;
    let wholesaleDiscountAmount = 0;

    // جلب قدرات المستخدم لتطبيق خصم التاجر
    if (userId) {
      const caps = await this.capsModel.findOne({ userId }).lean();
      if (caps && caps.wholesale_capable && caps.wholesale_discount_percent > 0) {
        wholesaleDiscountPercent = caps.wholesale_discount_percent;
      }
    }

    for (const it of cart.items) {
      // Get variant pricing - simplified approach without priceModel
      const variant = await this.variantModel.findById(it.variantId).lean();
      if (!variant) continue; // skip items without variant

      let final = variant.basePriceUSD || 0;
      let base = variant.basePriceUSD || 0;
      let appliedRule = null;

      // تطبيق العروض الترويجية أولاً
      if (this.promotions && typeof this.promotions.preview === 'function') {
        const res = await this.promotions.preview({
          variantId: String(it.variantId),
          currency,
          qty: it.qty,
          accountType,
        });
        if (res) {
          final = res.finalPrice;
          base = res.basePrice;
          appliedRule = res.appliedRule;
        }
      }

      // تطبيق خصم التاجر بعد العروض الترويجية
      if (wholesaleDiscountPercent > 0) {
        final = final * (1 - wholesaleDiscountPercent / 100);
      }

      const lineTotal = final * it.qty;
      subtotal += lineTotal;

      lines.push({
        itemId: String((it as unknown as { _id: string })._id),
        variantId: String(it.variantId),
        qty: it.qty,
        unit: { base, final, currency, appliedRule },
        lineTotal,
      });
    }

    // حساب مبلغ الخصم الإجمالي للتاجر
    if (wholesaleDiscountPercent > 0) {
      const subtotalBeforeWholesaleDiscount = lines.reduce((sum, line) => {
        const priceBeforeWholesaleDiscount = line.unit.final / (1 - wholesaleDiscountPercent / 100);
        return sum + priceBeforeWholesaleDiscount * line.qty;
      }, 0);
      wholesaleDiscountAmount = subtotalBeforeWholesaleDiscount - subtotal;
    }

    return {
      currency,
      subtotal,
      items: lines,
      meta: {
        count: lines.length,
        wholesaleDiscountPercent,
        wholesaleDiscountAmount: Math.round(wholesaleDiscountAmount * 100) / 100,
      },
    };
  }

  async previewUser(
    userId: string,
    currency: string,
    accountType: 'any' | 'customer' | 'engineer' | 'wholesale' = 'any',
  ) {
    const cart = await this.getOrCreateUserCart(userId);
    return this.previewByCart(cart, currency, accountType, userId);
  }

  async previewGuest(
    deviceId: string,
    currency: string,
    accountType: 'any' | 'customer' | 'engineer' | 'wholesale' = 'any',
  ) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    return this.previewByCart(cart, currency, accountType);
  }

  // ---------- abandoned carts (admin)
  async findAbandonedCarts(hoursInactive: number) {
    const threshold = new Date(Date.now() - hoursInactive * 60 * 60 * 1000);
    return this.cartModel
      .find({
        $or: [
          { isAbandoned: true },
          { status: CartStatus.ABANDONED },
          { $and: [{ status: CartStatus.ACTIVE }, { lastActivityAt: { $lte: threshold } }] },
        ],
      })
      .sort({ updatedAt: -1 })
      .lean();
  }

  async sendAbandonmentReminder(cartId: string) {
    const cart = await this.cartModel.findById(cartId);
    if (!cart) return { sent: false };
    cart.isAbandoned = true;
    cart.status = CartStatus.ABANDONED;
    cart.abandonmentEmailsSent = (cart.abandonmentEmailsSent || 0) + 1;
    cart.lastAbandonmentEmailAt = new Date();
    await cart.save();
    return { sent: true, cartId };
  }

  async processAbandonedCarts(hoursInactive: number = 24) {
    const candidates = await this.findAbandonedCarts(hoursInactive);
    let emailsSent = 0;
    type AbandonedLean = {
      _id?: unknown;
      lastAbandonmentEmailAt?: Date;
      abandonmentEmailsSent?: number;
    };

    for (const c of candidates as AbandonedLean[]) {
      const lastSent = c.lastAbandonmentEmailAt;
      const emailsSentCount = c.abandonmentEmailsSent || 0;

      // Determine if we should send email based on hours inactive and previous emails sent
      let shouldSend = false;

      if (hoursInactive === 1 && emailsSentCount === 0) {
        // First reminder after 1 hour
        shouldSend = !lastSent || Date.now() - lastSent.getTime() > 60 * 60 * 1000;
      } else if (hoursInactive === 24 && emailsSentCount === 1) {
        // Second reminder after 24 hours (only if first was sent)
        shouldSend = !lastSent || Date.now() - lastSent.getTime() > 24 * 60 * 60 * 1000;
      } else if (hoursInactive === 72 && emailsSentCount === 2) {
        // Final reminder after 72 hours (only if second was sent)
        shouldSend = !lastSent || Date.now() - lastSent.getTime() > 72 * 60 * 60 * 1000;
      }

      if (shouldSend) {
        const res = await this.sendAbandonmentReminder(String(c._id || ''));
        if (res.sent) emailsSent++;
      }
    }
    return { processed: candidates.length, emailsSent };
  }

  async markAbandonedCarts() {
    const now = new Date();
    const abandonmentThresholds = [
      { hours: 1, status: 'inactive' },
      { hours: 24, status: 'abandoned' },
    ];

    let marked = 0;

    for (const threshold of abandonmentThresholds) {
      const cutoffTime = new Date(now.getTime() - threshold.hours * 60 * 60 * 1000);

      const result = await this.cartModel.updateMany(
        {
          status: CartStatus.ACTIVE,
          lastActivityAt: { $lte: cutoffTime },
          isAbandoned: { $ne: true },
        },
        {
          $set: {
            isAbandoned: threshold.status === 'abandoned',
            status: threshold.status === 'abandoned' ? CartStatus.ABANDONED : CartStatus.ACTIVE,
            abandonedAt: threshold.status === 'abandoned' ? now : undefined,
          },
        },
      );

      marked += result.modifiedCount || 0;
    }

    return { marked };
  }

  // ---------- admin analytics and statistics
  async getCartAnalytics(periodDays: number) {
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const [
      totalCarts,
      activeCarts,
      abandonedCarts,
      convertedCarts,
      avgCartValue,
      avgItemsPerCart,
      conversionRate,
      abandonmentRate,
      recentActivity,
      topProducts,
      cartValueDistribution,
      hourlyActivity,
    ] = await Promise.all([
      this.cartModel.countDocuments({ createdAt: { $gte: startDate } }),
      this.cartModel.countDocuments({ status: CartStatus.ACTIVE, createdAt: { $gte: startDate } }),
      this.cartModel.countDocuments({
        status: CartStatus.ABANDONED,
        createdAt: { $gte: startDate },
      }),
      this.cartModel.countDocuments({
        status: CartStatus.CONVERTED,
        createdAt: { $gte: startDate },
      }),
      this.getAverageCartValue(startDate),
      this.getAverageItemsPerCart(startDate),
      this.getConversionRate(startDate),
      this.getAbandonmentRate(startDate),
      this.getRecentCartActivity(7),
      this.getTopProductsInCarts(startDate),
      this.getCartValueDistribution(startDate),
      this.getHourlyCartActivity(startDate),
    ]);

    return {
      overview: {
        totalCarts,
        activeCarts,
        abandonedCarts,
        convertedCarts,
        avgCartValue,
        avgItemsPerCart,
        conversionRate,
        abandonmentRate,
      },
      trends: {
        recentActivity,
        hourlyActivity,
      },
      insights: {
        topProducts,
        cartValueDistribution,
      },
      period: periodDays,
    };
  }

  async getCartStatistics() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [todayStats, yesterdayStats, weekStats, totalStats] = await Promise.all([
      this.getPeriodStats(today, now),
      this.getPeriodStats(yesterday, today),
      this.getPeriodStats(lastWeek, now),
      this.getPeriodStats(new Date(0), now),
    ]);

    return {
      today: todayStats,
      yesterday: yesterdayStats,
      lastWeek: weekStats,
      allTime: totalStats,
    };
  }

  async getConversionRates(periodDays: number) {
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const conversionData = await this.cartModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          totalCarts: { $sum: 1 },
          convertedCarts: {
            $sum: {
              $cond: [{ $eq: ['$status', CartStatus.CONVERTED] }, 1, 0],
            },
          },
          totalValue: {
            $sum: { $ifNull: ['$pricingSummary.total', 0] },
          },
          convertedValue: {
            $sum: {
              $cond: [
                { $eq: ['$status', CartStatus.CONVERTED] },
                { $ifNull: ['$pricingSummary.total', 0] },
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          conversionRate: {
            $cond: [
              { $eq: ['$totalCarts', 0] },
              0,
              { $multiply: [{ $divide: ['$convertedCarts', '$totalCarts'] }, 100] },
            ],
          },
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
        },
      },
      { $sort: { date: 1 } },
    ]);

    return {
      dailyRates: conversionData,
      averageRate:
        conversionData.length > 0
          ? conversionData.reduce((sum, day) => sum + day.conversionRate, 0) / conversionData.length
          : 0,
      period: periodDays,
    };
  }

  async getAllCarts(page: number, limit: number, filters: Record<string, unknown>) {
    const skip = (page - 1) * limit;
    const matchStage: Record<string, unknown> = {};

    if (filters.status) {
      matchStage.status = filters.status;
    }
    if (filters.userId && typeof filters.userId === 'string') {
      matchStage.userId = new Types.ObjectId(filters.userId);
    }
    if (filters.dateFrom || filters.dateTo) {
      matchStage.createdAt = {} as Record<string, unknown>;
      if (filters.dateFrom)
        (matchStage.createdAt as Record<string, unknown>).$gte = filters.dateFrom;
      if (filters.dateTo) (matchStage.createdAt as Record<string, unknown>).$lte = filters.dateTo;
    }

    const [carts, total] = await Promise.all([
      this.cartModel
        .find(matchStage)
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.cartModel.countDocuments(matchStage),
    ]);

    return {
      carts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCartById(cartId: string) {
    const cart = await this.cartModel
      .findById(cartId)
      .populate('userId', 'name email phone')
      .populate('items.variantId')
      .lean();

    if (!cart) {
      throw new Error('Cart not found');
    }

    return cart;
  }

  async convertToOrder(cartId: string) {
    const cart = await this.cartModel.findById(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    if (cart.status === CartStatus.CONVERTED) {
      throw new Error('Cart already converted');
    }

    // Update cart status
    cart.status = CartStatus.CONVERTED;
    cart.convertedAt = new Date();
    cart.convertedToOrderId = new Types.ObjectId(); // Placeholder - should be actual order ID
    await cart.save();

    return {
      cartId: cart._id,
      orderId: cart.convertedToOrderId,
      convertedAt: cart.convertedAt,
    };
  }

  // ---------- helper methods for analytics
  private async getAverageCartValue(startDate: Date) {
    const result = await this.cartModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, avgValue: { $avg: '$pricingSummary.total' } } },
    ]);
    return result[0]?.avgValue || 0;
  }

  private async getAverageItemsPerCart(startDate: Date) {
    const result = await this.cartModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, avgItems: { $avg: { $size: '$items' } } } },
    ]);
    return result[0]?.avgItems || 0;
  }

  private async getConversionRate(startDate: Date) {
    const [total, converted] = await Promise.all([
      this.cartModel.countDocuments({ createdAt: { $gte: startDate } }),
      this.cartModel.countDocuments({
        status: CartStatus.CONVERTED,
        createdAt: { $gte: startDate },
      }),
    ]);
    return total > 0 ? (converted / total) * 100 : 0;
  }

  private async getAbandonmentRate(startDate: Date) {
    const [total, abandoned] = await Promise.all([
      this.cartModel.countDocuments({ createdAt: { $gte: startDate } }),
      this.cartModel.countDocuments({
        status: CartStatus.ABANDONED,
        createdAt: { $gte: startDate },
      }),
    ]);
    return total > 0 ? (abandoned / total) * 100 : 0;
  }

  private async getRecentCartActivity(days: number) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.cartModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$pricingSummary.total', 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);
  }

  private async getTopProductsInCarts(startDate: Date) {
    return this.cartModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.variantId',
          totalQuantity: { $sum: '$items.qty' },
          cartCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);
  }

  private async getCartValueDistribution(startDate: Date) {
    return this.cartModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $bucket: {
          groupBy: '$pricingSummary.total',
          boundaries: [0, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
          default: '10000+',
          output: {
            count: { $sum: 1 },
            totalValue: { $sum: '$pricingSummary.total' },
          },
        },
      },
    ]);
  }

  private async getHourlyCartActivity(startDate: Date) {
    return this.cartModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$pricingSummary.total', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private async getPeriodStats(startDate: Date, endDate: Date) {
    const [total, active, abandoned, converted, totalValue] = await Promise.all([
      this.cartModel.countDocuments({ createdAt: { $gte: startDate, $lt: endDate } }),
      this.cartModel.countDocuments({
        status: CartStatus.ACTIVE,
        createdAt: { $gte: startDate, $lt: endDate },
      }),
      this.cartModel.countDocuments({
        status: CartStatus.ABANDONED,
        createdAt: { $gte: startDate, $lt: endDate },
      }),
      this.cartModel.countDocuments({
        status: CartStatus.CONVERTED,
        createdAt: { $gte: startDate, $lt: endDate },
      }),
      this.cartModel.aggregate([
        { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$pricingSummary.total', 0] } } } },
      ]),
    ]);

    return {
      total,
      active,
      abandoned,
      converted,
      totalValue: totalValue[0]?.total || 0,
      conversionRate: total > 0 ? (converted / total) * 100 : 0,
      abandonmentRate: total > 0 ? (abandoned / total) * 100 : 0,
    };
  }

  // ---------- maintenance/cleanup
  async cleanupExpiredCarts() {
    const now = new Date();
    const res = await this.cartModel.deleteMany({ expiresAt: { $lte: now } });
    return { deleted: res.deletedCount || 0 };
  }

  async deleteOldConvertedCarts(days: number) {
    const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const res = await this.cartModel.deleteMany({
      convertedToOrderId: { $ne: null },
      convertedAt: { $lte: threshold },
    });
    return { deleted: res.deletedCount || 0 };
  }

  // ---------- advanced analytics
  async getRecoveryCampaignAnalytics(periodDays: number) {
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const [totalAbandoned, recoveredAfterEmail, emailOpenRates, clickThroughRates, recoveryByHour] =
      await Promise.all([
        this.cartModel.countDocuments({
          status: CartStatus.ABANDONED,
          createdAt: { $gte: startDate },
        }),
        this.getRecoveredCartsAfterEmail(startDate),
        this.getEmailOpenRates(startDate),
        this.getClickThroughRates(startDate),
        this.getRecoveryByHour(startDate),
      ]);

    return {
      totalAbandoned,
      recoveredAfterEmail,
      recoveryRate: totalAbandoned > 0 ? (recoveredAfterEmail / totalAbandoned) * 100 : 0,
      emailOpenRates,
      clickThroughRates,
      recoveryByHour,
      period: periodDays,
    };
  }

  async getCustomerBehaviorAnalytics(periodDays: number) {
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const [
      sessionDuration,
      cartValueByDevice,
      abandonmentByTimeOfDay,
      abandonmentByDayOfWeek,
      repeatCustomers,
      newCustomers,
    ] = await Promise.all([
      this.getAverageSessionDuration(startDate),
      this.getCartValueByDevice(startDate),
      this.getAbandonmentByTimeOfDay(startDate),
      this.getAbandonmentByDayOfWeek(startDate),
      this.getRepeatCustomerStats(startDate),
      this.getNewCustomerStats(startDate),
    ]);

    return {
      sessionDuration,
      cartValueByDevice,
      abandonmentByTimeOfDay,
      abandonmentByDayOfWeek,
      repeatCustomers,
      newCustomers,
      period: periodDays,
    };
  }

  async getRevenueImpactAnalytics(periodDays: number) {
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const [lostRevenue, recoveredRevenue, potentialRevenue, revenueByHour, topLostProducts] =
      await Promise.all([
        this.getLostRevenue(startDate),
        this.getRecoveredRevenue(startDate),
        this.getPotentialRevenue(startDate),
        this.getRevenueByHour(startDate),
        this.getTopLostProducts(startDate),
      ]);

    return {
      lostRevenue,
      recoveredRevenue,
      potentialRevenue,
      recoveryEfficiency: lostRevenue > 0 ? (recoveredRevenue / lostRevenue) * 100 : 0,
      revenueByHour,
      topLostProducts,
      period: periodDays,
    };
  }

  async performBulkActions(action: string, cartIds: string[]) {
    let processed = 0;

    switch (action) {
      case 'send_reminders':
        for (const cartId of cartIds) {
          try {
            await this.sendAbandonmentReminder(cartId);
            processed++;
          } catch (error) {
            // Log error but continue processing
          }
        }
        break;

      case 'mark_abandoned': {
        const result = await this.cartModel.updateMany(
          { _id: { $in: cartIds } },
          {
            $set: {
              status: CartStatus.ABANDONED,
              isAbandoned: true,
              abandonedAt: new Date(),
            },
          },
        );
        processed = result.modifiedCount || 0;
        break;
      }

      case 'clear_carts': {
        const clearResult = await this.cartModel.updateMany(
          { _id: { $in: cartIds } },
          { $set: { items: [], status: CartStatus.EXPIRED } },
        );
        processed = clearResult.modifiedCount || 0;
        break;
      }
    }

    return { processed, action };
  }

  // ---------- helper methods for advanced analytics
  private async getRecoveredCartsAfterEmail(startDate: Date) {
    const result = await this.cartModel.countDocuments({
      status: CartStatus.CONVERTED,
      lastAbandonmentEmailAt: { $exists: true, $gte: startDate },
      convertedAt: { $gte: startDate },
    });
    return result;
  }

  private async getEmailOpenRates(_startDate: Date) {
    // This would integrate with email service to get actual open rates
    // For now, return mock data
    void _startDate;
    return {
      firstEmail: 65.2,
      secondEmail: 45.8,
      thirdEmail: 32.1,
    };
  }

  private async getClickThroughRates(startDate: Date) {
    // This would integrate with email service to get actual click rates
    void startDate;
    return {
      firstEmail: 12.5,
      secondEmail: 8.3,
      thirdEmail: 5.7,
    };
  }

  private async getRecoveryByHour(startDate: Date) {
    return this.cartModel.aggregate([
      {
        $match: {
          status: CartStatus.CONVERTED,
          lastAbandonmentEmailAt: { $exists: true, $gte: startDate },
          convertedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $hour: '$convertedAt' },
          count: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$pricingSummary.total', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private async getAverageSessionDuration(startDate: Date) {
    const result = await this.cartModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          avgDuration: {
            $avg: {
              $subtract: ['$lastActivityAt', '$createdAt'],
            },
          },
        },
      },
    ]);
    return result[0]?.avgDuration || 0;
  }

  private async getCartValueByDevice(startDate: Date) {
    return this.cartModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $cond: [{ $ifNull: ['$userId', false] }, 'registered', 'guest'] },
          avgValue: { $avg: { $ifNull: ['$pricingSummary.total', 0] } },
          count: { $sum: 1 },
        },
      },
    ]);
  }

  private async getAbandonmentByTimeOfDay(startDate: Date) {
    return this.cartModel.aggregate([
      {
        $match: {
          status: CartStatus.ABANDONED,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$pricingSummary.total', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private async getAbandonmentByDayOfWeek(startDate: Date) {
    return this.cartModel.aggregate([
      {
        $match: {
          status: CartStatus.ABANDONED,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$pricingSummary.total', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private async getRepeatCustomerStats(startDate: Date) {
    return this.cartModel.aggregate([
      {
        $match: {
          userId: { $exists: true },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$userId',
          cartCount: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$pricingSummary.total', 0] } },
        },
      },
      {
        $group: {
          _id: null,
          repeatCustomers: { $sum: { $cond: [{ $gt: ['$cartCount', 1] }, 1, 0] } },
          totalCustomers: { $sum: 1 },
          avgCartsPerCustomer: { $avg: '$cartCount' },
          avgValuePerCustomer: { $avg: '$totalValue' },
        },
      },
    ]);
  }

  private async getNewCustomerStats(startDate: Date) {
    return this.cartModel.aggregate([
      {
        $match: {
          userId: { $exists: true },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$userId',
          firstCartDate: { $min: '$createdAt' },
          cartCount: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$pricingSummary.total', 0] } },
        },
      },
      {
        $match: {
          firstCartDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          newCustomers: { $sum: 1 },
          avgValuePerNewCustomer: { $avg: '$totalValue' },
        },
      },
    ]);
  }

  private async getLostRevenue(startDate: Date) {
    const result = await this.cartModel.aggregate([
      {
        $match: {
          status: CartStatus.ABANDONED,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          lostRevenue: { $sum: { $ifNull: ['$pricingSummary.total', 0] } },
        },
      },
    ]);
    return result[0]?.lostRevenue || 0;
  }

  private async getRecoveredRevenue(startDate: Date) {
    const result = await this.cartModel.aggregate([
      {
        $match: {
          status: CartStatus.CONVERTED,
          lastAbandonmentEmailAt: { $exists: true },
          convertedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          recoveredRevenue: { $sum: { $ifNull: ['$pricingSummary.total', 0] } },
        },
      },
    ]);
    return result[0]?.recoveredRevenue || 0;
  }

  private async getPotentialRevenue(startDate: Date) {
    const result = await this.cartModel.aggregate([
      {
        $match: {
          status: { $in: [CartStatus.ACTIVE, CartStatus.ABANDONED] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          potentialRevenue: { $sum: { $ifNull: ['$pricingSummary.total', 0] } },
        },
      },
    ]);
    return result[0]?.potentialRevenue || 0;
  }

  private async getRevenueByHour(startDate: Date) {
    return this.cartModel.aggregate([
      {
        $match: {
          status: CartStatus.CONVERTED,
          convertedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $hour: '$convertedAt' },
          revenue: { $sum: { $ifNull: ['$pricingSummary.total', 0] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private async getTopLostProducts(startDate: Date) {
    return this.cartModel.aggregate([
      {
        $match: {
          status: CartStatus.ABANDONED,
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'variantprices',
          localField: 'items.variantId',
          foreignField: 'variantId',
          as: 'priceInfo',
        },
      },
      { $unwind: { path: '$priceInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$items.variantId',
          totalQuantity: { $sum: '$items.qty' },
          cartCount: { $sum: 1 },
          totalLostValue: {
            $sum: {
              $multiply: ['$items.qty', { $ifNull: ['$priceInfo.basePriceUSD', 0] }],
            },
          },
        },
      },
      { $sort: { totalLostValue: -1 } },
      { $limit: 10 },
    ]);
  }
}

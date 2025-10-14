import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartItem, CartStatus } from './schemas/cart.schema';
import { Variant } from '../catalog/schemas/variant.schema';
import { Product } from '../catalog/schemas/product.schema';
import { Brand } from '../brands/schemas/brand.schema';
import { PricingService } from '../pricing/pricing.service';
import { CouponsService } from '../coupons/coupons.service';
import { AppException } from '../../shared/exceptions/app.exception';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly MAX_ITEMS = 200;
  private readonly CART_EXPIRY_DAYS = 30;
  private readonly ABANDONED_AFTER_HOURS = 24;

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
    private pricingService: PricingService,
    private couponsService: CouponsService,
  ) {}

  // ==================== USER CART ====================

  async getUserCart(userId: string) {
    let cart = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
      status: { $in: [CartStatus.ACTIVE, CartStatus.ABANDONED] },
    });

    if (!cart) {
      cart = await this.createUserCart(userId);
    }

    // Auto-apply coupons
    await this.autoApplyCoupons(cart, userId);

    // Recalculate pricing
    await this.recalculatePricing(cart);

    // Update activity
    await this.updateLastActivity(cart);

    return cart;
  }

  async addUserItem(userId: string, variantId: string, qty: number) {
    const cart = await this.getUserCart(userId);

    // Validate variant exists
    const variant = await this.variantModel.findById(variantId);
    if (!variant) {
      throw new AppException('Variant not found', 404);
    }

    // Check capacity
    if (cart.items.length >= this.MAX_ITEMS) {
      throw new AppException(`Cart capacity exceeded (max ${this.MAX_ITEMS} items)`, 400);
    }

    // Check if item already exists
    const existingItem = cart.items.find(
      (item) => item.variantId.toString() === variantId,
    );

    if (existingItem) {
      existingItem.qty = Math.min(999, existingItem.qty + qty);
      await this.enrichItemWithProductData(existingItem);
    } else {
      const newItem: any = {
        variantId: new Types.ObjectId(variantId),
        qty,
        addedAt: new Date(),
      };

      await this.enrichItemWithProductData(newItem);
      cart.items.push(newItem);
    }

    await this.updateLastActivity(cart);
    await this.recalculatePricing(cart);
    await cart.save();

    this.logger.log(`Item added to cart for user ${userId}`);

    return cart;
  }

  async updateUserItem(userId: string, itemId: string, qty: number) {
    const cart = await this.getUserCart(userId);

    const item = (cart.items as Types.DocumentArray<CartItem>).id(itemId);
    
    if (!item) {
      throw new AppException('Item not found in cart', 404);
    }

    if (qty <= 0) {
      return await this.removeUserItem(userId, itemId);
    }

    item.qty = Math.min(999, qty);
    await this.enrichItemWithProductData(item);

    await this.updateLastActivity(cart);
    await this.recalculatePricing(cart);
    await cart.save();

    return cart;
  }

  async removeUserItem(userId: string, itemId: string) {
    const cart = await this.getUserCart(userId);

    const item = (cart.items as Types.DocumentArray<CartItem>).id(itemId);
    
    if (item) {
      (item as unknown as Types.Subdocument & { remove(): void }).remove();
    }

    await this.updateLastActivity(cart);
    await this.recalculatePricing(cart);
    await cart.save();

    return cart;
  }

  async clearUserCart(userId: string) {
    const cart = await this.getUserCart(userId);

    cart.items = [];
    cart.appliedCouponCode = undefined;
    cart.couponDiscount = 0;
    cart.autoAppliedCouponCodes = [];
    cart.autoAppliedDiscounts = [];
    cart.pricingSummary = undefined;

    await this.updateLastActivity(cart);
    await cart.save();

    return cart;
  }

  // ==================== GUEST CART ====================

  async getGuestCart(deviceId: string) {
    let cart = await this.cartModel.findOne({
      deviceId,
      status: { $in: [CartStatus.ACTIVE, CartStatus.ABANDONED] },
    });

    if (!cart) {
      cart = await this.createGuestCart(deviceId);
    }

    // Auto-apply coupons
    await this.autoApplyCoupons(cart);

    // Recalculate pricing
    await this.recalculatePricing(cart);

    // Update activity
    await this.updateLastActivity(cart);

    return cart;
  }

  async addGuestItem(deviceId: string, variantId: string, qty: number, metadata?: any) {
    const cart = await this.getGuestCart(deviceId);

    const variant = await this.variantModel.findById(variantId);
    if (!variant) {
      throw new AppException('Variant not found', 404);
    }

    if (cart.items.length >= this.MAX_ITEMS) {
      throw new AppException(`Cart capacity exceeded`, 400);
    }

    const existingItem = cart.items.find(
      (item) => item.variantId.toString() === variantId,
    );

    if (existingItem) {
      existingItem.qty = Math.min(999, existingItem.qty + qty);
      await this.enrichItemWithProductData(existingItem);
    } else {
      const newItem: any = {
        variantId: new Types.ObjectId(variantId),
        qty,
        addedAt: new Date(),
      };

      await this.enrichItemWithProductData(newItem);
      cart.items.push(newItem);
    }

    // Save metadata if provided
    if (metadata) {
      cart.metadata = { ...cart.metadata, ...metadata };
    }

    await this.updateLastActivity(cart);
    await this.recalculatePricing(cart);
    await cart.save();

    return cart;
  }

  // Guest cart methods similar to user cart...
  async updateGuestItem(deviceId: string, itemId: string, qty: number) {
    const cart = await this.getGuestCart(deviceId);
    const item = (cart.items as Types.DocumentArray<CartItem>).id(itemId);
    
    if (!item) {
      throw new AppException('Item not found', 404);
    }

    if (qty <= 0) {
      (item as unknown as Types.Subdocument & { remove(): void }).remove();
    } else {
      item.qty = Math.min(999, qty);
      await this.enrichItemWithProductData(item);
    }

    await this.updateLastActivity(cart);
    await this.recalculatePricing(cart);
    await cart.save();

    return cart;
  }

  async removeGuestItem(deviceId: string, itemId: string) {
    const cart = await this.getGuestCart(deviceId);
    const item = (cart.items as Types.DocumentArray<CartItem>).id(itemId);
    
    if (item) {
      (item as unknown as Types.Subdocument & { remove(): void }).remove();
    }

    await this.updateLastActivity(cart);
    await this.recalculatePricing(cart);
    await cart.save();

    return cart;
  }

  async clearGuestCart(deviceId: string) {
    const cart = await this.getGuestCart(deviceId);
    
    cart.items = [];
    cart.appliedCouponCode = undefined;
    cart.couponDiscount = 0;
    cart.pricingSummary = undefined;

    await this.updateLastActivity(cart);
    await cart.save();

    return cart;
  }

  // ==================== COUPON OPERATIONS ====================

  async applyCouponToCart(cart: Cart, couponCode: string, userId?: string) {
    // Calculate current total
    await this.recalculatePricing(cart);

    const subtotal = cart.pricingSummary?.subtotal || 0;
    const afterPromotions = subtotal - (cart.pricingSummary?.promotionDiscount || 0);

    // Validate coupon
    const validation = await this.couponsService.validateCoupon({
      code: couponCode,
      orderAmount: afterPromotions,
      currency: cart.currency,
      userId,
      productIds: cart.items.map((i) => i.productId?.toString()).filter(Boolean) as string[],
    });

    if (!validation.valid) {
      throw new AppException(validation.message || 'Invalid coupon', 400);
    }

    cart.appliedCouponCode = couponCode;
    cart.couponDiscount = validation.calculatedDiscount || 0;

    await this.recalculatePricing(cart);
    await cart.save();

    return cart;
  }

  async removeCouponFromCart(cart: Cart) {
    cart.appliedCouponCode = undefined;
    cart.couponDiscount = 0;

    await this.recalculatePricing(cart);
    await cart.save();

    return cart;
  }

  async autoApplyCoupons(cart: Cart, userId?: string, accountType?: string) {
    const autoCoupons = await this.couponsService.getAutoApplyCoupons(userId, accountType);

    if (!autoCoupons || autoCoupons.length === 0) {
      cart.autoAppliedCouponCodes = [];
      cart.autoAppliedDiscounts = [];
      return;
    }

    const codes: string[] = [];
    const discounts: number[] = [];

    for (const coupon of autoCoupons) {
      const validation = await this.couponsService.validateCoupon({
        code: coupon.code,
        orderAmount: cart.pricingSummary?.subtotal || 0,
        currency: cart.currency,
        userId,
      });

      if (validation.valid && validation.calculatedDiscount) {
        codes.push(coupon.code);
        discounts.push(validation.calculatedDiscount);
      }
    }

    cart.autoAppliedCouponCodes = codes;
    cart.autoAppliedDiscounts = discounts;
  }

  // ==================== PRICING ====================

  async recalculatePricing(cart: Cart) {
    if (cart.items.length === 0) {
      cart.pricingSummary = undefined;
      return;
    }

    let subtotal = 0;
    let promotionDiscount = 0;

    // Calculate each item
    for (const item of cart.items) {
      if (!item.pricing) {
        await this.enrichItemWithProductData(item);
      }

      const itemTotal = item.pricing!.finalPrice * item.qty;
      const itemDiscount = item.pricing!.discount * item.qty;

      subtotal += item.pricing!.basePrice * item.qty;
      promotionDiscount += itemDiscount;
    }

    const afterPromotions = subtotal - promotionDiscount;
    const couponDiscount = cart.couponDiscount || 0;
    const autoDiscount = cart.autoAppliedDiscounts?.reduce((sum, d) => sum + d, 0) || 0;
    const totalDiscount = promotionDiscount + couponDiscount + autoDiscount;
    const total = Math.max(0, subtotal - totalDiscount);

    cart.pricingSummary = {
      subtotal,
      promotionDiscount,
      couponDiscount,
      autoDiscount,
      totalDiscount,
      total,
      itemsCount: cart.items.length,
      currency: cart.currency,
      lastCalculatedAt: new Date(),
    };
  }

  // ==================== PRODUCT ENRICHMENT ====================

  async enrichItemWithProductData(item: any) {
    const variant = await this.variantModel.findById(item.variantId);
    if (!variant) return;

    const product = await this.productModel.findById(variant.productId);
    if (!product) return;

    let brandName = null;
    if (product.brandId) {
      const brand = await this.brandModel.findById(product.brandId).lean();
      brandName = brand?.name;
    }

    // Product snapshot
    item.productId = product._id;
    item.productSnapshot = {
      name: product.name,
      slug: product.slug,
      image: product.images?.[0]?.url,
      brandId: product.brandId,
      brandName,
      categoryId: product.categoryId,
    };

    // Pricing
    const pricing = await this.pricingService.calculateVariantPrice({
      variantId: item.variantId.toString(),
      currency: 'YER',  // أو من cart.currency
      quantity: item.qty,
    });

    item.pricing = {
      currency: pricing.currency,
      basePrice: pricing.originalPrice,
      finalPrice: pricing.finalPrice,
      discount: pricing.discount,
      appliedPromotionId: pricing.appliedPromotion?._id?.toString(),
    };
  }

  // ==================== MERGE CARTS ====================

  async mergeGuestToUser(deviceId: string, userId: string, clearGuest = true) {
    const guestCart = await this.cartModel.findOne({ deviceId, status: CartStatus.ACTIVE });
    const userCart = await this.getUserCart(userId);

    if (!guestCart || guestCart.items.length === 0) {
      return { merged: false, userCart };
    }

    let mergedItems = 0;

    // Merge items
    for (const guestItem of guestCart.items) {
      const existing = userCart.items.find(
        (item) => item.variantId.toString() === guestItem.variantId.toString(),
      );

      if (existing) {
        existing.qty = Math.min(999, existing.qty + guestItem.qty);
        mergedItems++;
      } else {
        userCart.items.push(guestItem);
        mergedItems++;
      }
    }

    // Merge coupon if applicable
    if (guestCart.appliedCouponCode && !userCart.appliedCouponCode) {
      try {
        await this.applyCouponToCart(userCart, guestCart.appliedCouponCode, userId);
      } catch (error) {
        this.logger.warn(`Failed to apply guest coupon: ${error.message}`);
      }
    }

    await this.recalculatePricing(userCart);
    await userCart.save();

    // Mark guest cart as merged
    if (clearGuest) {
      guestCart.status = CartStatus.CONVERTED;
      guestCart.isMerged = true;
      guestCart.mergedIntoUserId = new Types.ObjectId(userId);
      guestCart.mergedAt = new Date();
      await guestCart.save();
    }

    this.logger.log(`Merged ${mergedItems} items from guest cart to user ${userId}`);

    return { merged: true, mergedItems, userCart };
  }

  // ==================== ABANDONED CARTS ====================

  async findAbandonedCarts(hoursInactive: number = 24) {
    const cutoff = new Date(Date.now() - hoursInactive * 60 * 60 * 1000);

    const carts = await this.cartModel
      .find({
        status: CartStatus.ACTIVE,
        lastActivityAt: { $lt: cutoff },
        items: { $ne: [] },
        $or: [
          { userId: { $exists: true } },
        ],
      })
      .populate('userId', 'email phone name')
      .lean();

    return carts;
  }

  async processAbandonedCarts() {
    const abandonedCarts = await this.findAbandonedCarts(this.ABANDONED_AFTER_HOURS);

    let emailsSent = 0;
    let errors = 0;

    for (const cart of abandonedCarts) {
      try {
        await this.sendAbandonmentReminder(cart._id.toString());
        emailsSent++;
      } catch (error) {
        this.logger.error(`Failed to send reminder for cart ${cart._id}:`, error);
        errors++;
      }
    }

    return {
      found: abandonedCarts.length,
      emailsSent,
      errors,
    };
  }

  async sendAbandonmentReminder(cartId: string) {
    const cart = await this.cartModel.findById(cartId).populate('userId');

    if (!cart || !cart.userId) {
      throw new AppException('Cart or user not found', 404);
    }

    // Mark as abandoned
    cart.status = CartStatus.ABANDONED;
    cart.isAbandoned = true;
    cart.abandonmentEmailsSent = (cart.abandonmentEmailsSent || 0) + 1;
    cart.lastAbandonmentEmailAt = new Date();

    await cart.save();

    // TODO: Send email via notifications service
    this.logger.log(`Abandonment reminder sent for cart ${cartId}`);

    return { sent: true };
  }

  // ==================== CONVERSION ====================

  async markAsConverted(cartId: string, orderId: string) {
    await this.cartModel.updateOne(
      { _id: cartId },
      {
        $set: {
          status: CartStatus.CONVERTED,
          convertedToOrderId: new Types.ObjectId(orderId),
          convertedAt: new Date(),
        },
      },
    );

    this.logger.log(`Cart ${cartId} converted to order ${orderId}`);
  }

  // ==================== HELPERS ====================

  private async createUserCart(userId: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.CART_EXPIRY_DAYS);

    return await this.cartModel.create({
      userId: new Types.ObjectId(userId),
      status: CartStatus.ACTIVE,
      items: [],
      currency: 'YER',
      lastActivityAt: new Date(),
      expiresAt,
    });
  }

  private async createGuestCart(deviceId: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.CART_EXPIRY_DAYS);

    return await this.cartModel.create({
      deviceId,
      status: CartStatus.ACTIVE,
      items: [],
      currency: 'YER',
      lastActivityAt: new Date(),
      expiresAt,
    });
  }

  private async updateLastActivity(cart: Cart) {
    cart.lastActivityAt = new Date();
    
    // Reset abandoned status if cart becomes active again
    if (cart.isAbandoned) {
      cart.isAbandoned = false;
      cart.status = CartStatus.ACTIVE;
    }
  }

  async cleanupExpiredCarts() {
    const result = await this.cartModel.deleteMany({
      status: { $in: [CartStatus.EXPIRED, CartStatus.ABANDONED] },
      expiresAt: { $lt: new Date() },
    });

    return { deleted: result.deletedCount || 0 };
  }

  async deleteOldConvertedCarts(days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await this.cartModel.deleteMany({
      status: CartStatus.CONVERTED,
      convertedAt: { $lt: cutoff },
    });

    return { deleted: result.deletedCount || 0 };
  }
}


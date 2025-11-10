import { Injectable, Optional, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartItem, CartStatus } from './schemas/cart.schema';
import { Variant } from '../products/schemas/variant.schema';
import { Product } from '../products/schemas/product.schema';
import { Capabilities } from '../capabilities/schemas/capabilities.schema';
import { MarketingService } from '../marketing/marketing.service';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { randomUUID } from 'crypto';

type ItemView = {
  itemId: string;
  variantId?: string;
  productId?: string;
  qty: number;
};

type CartLine = {
  itemId: string;
  variantId?: string;
  productId?: string;
  qty: number;
  unit: {
    base: number;
    final: number;
    finalBeforeDiscount?: number;
    currency: string;
    appliedRule: unknown;
  };
  lineTotal: number;
  pricing?: CartItem['pricing'];
  snapshot?: CartItem['productSnapshot'];
};

type PriceSnapshot = {
  basePrice?: number;
  finalPrice?: number;
  discountPercent?: number;
  discountAmount?: number;
  currency?: string;
  exchangeRate?: number;
};

type CartPricing = {
  currency: string;
  basePrice: number;
  finalPrice: number;
  discount: number;
  appliedPromotionId?: string;
};

type PricingSummaryView = {
  currency: string;
  itemsCount: number;
  subtotalBeforeDiscount: number;
  subtotal: number;
  merchantDiscountAmount: number;
  couponDiscount: number;
  promotionDiscount: number;
  autoDiscount: number;
  totalDiscount: number;
  total: number;
};

type AddItemInput = {
  variantId?: string;
  productId?: string;
  qty: number;
};

// Optional promotions interface (duck-typing)
interface PromotionsLike {
  preview(input: {
    variantId: string;
    currency: string;
    qty: number;
    accountType: 'any' | 'customer' | 'engineer' | 'merchant';
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
    @InjectModel(Product.name) private productModel: Model<Product>,
    @Optional() private promotions?: PromotionsLike,
    @Optional() private marketingService?: MarketingService,
    @Inject(forwardRef(() => ExchangeRatesService))
    private exchangeRatesService?: ExchangeRatesService,
  ) {}

  // ---------- helpers
  private async getOrCreateUserCart(
    userId: string,
    currency: string = 'USD',
    accountType: string = 'retail',
  ) {
    const userObjectId = new Types.ObjectId(userId);
    let cart = await this.cartModel.findOne({ userId: userObjectId });
    if (!cart)
      cart = await this.cartModel.create({
        userId: userObjectId,
        items: [],
        currency,
        accountType,
        lastActivityAt: new Date(),
      });
    return cart;
  }
  private async getOrCreateGuestCart(
    deviceId: string,
    currency: string = 'USD',
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

  private normalizeCurrency(currency?: string): string {
    if (!currency || typeof currency !== 'string') {
      return 'USD';
    }
    return currency.trim().toUpperCase() || 'USD';
  }

  private normalizeNumber(value: unknown): number | undefined {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : undefined;
    }
    if (typeof value === 'bigint') {
      const asNumber = Number(value);
      return Number.isFinite(asNumber) ? asNumber : undefined;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return undefined;

      const arabicIndicDigits: Record<string, string> = {
        '٠': '0',
        '١': '1',
        '٢': '2',
        '٣': '3',
        '٤': '4',
        '٥': '5',
        '٦': '6',
        '٧': '7',
        '٨': '8',
        '٩': '9',
        '۰': '0',
        '۱': '1',
        '۲': '2',
        '۳': '3',
        '۴': '4',
        '۵': '5',
        '۶': '6',
        '۷': '7',
        '۸': '8',
        '۹': '9',
      };

      let normalized = trimmed
        .split('')
        .map((char) => arabicIndicDigits[char] ?? char)
        .join('');

      normalized = normalized.replace(/\s+/g, '');
      normalized = normalized.replace(/[٬﹐﹑]/g, '');
      normalized = normalized.replace(/٫/g, '.');

      if (normalized.includes(',') && normalized.includes('.')) {
        normalized = normalized.replace(/,/g, '');
      } else if (normalized.includes(',') && !normalized.includes('.')) {
        normalized = normalized.replace(/,/g, '.');
      } else {
        normalized = normalized.replace(/,/g, '');
      }

      normalized = normalized.replace(/[^0-9.-]/g, '');
      if (!normalized || normalized === '-' || normalized === '.' || normalized === '-.') {
        return undefined;
      }

      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    if (value instanceof Types.Decimal128) {
      const parsed = Number(value.toString());
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    if (value && typeof value === 'object') {
      if ('toString' in value && typeof (value as { toString: () => string }).toString === 'function') {
        const asString = (value as { toString: () => string }).toString();
        if (asString && asString !== '[object Object]') {
          return this.normalizeNumber(asString);
        }
      }
      if ('valueOf' in value && typeof (value as { valueOf: () => unknown }).valueOf === 'function') {
        const asPrimitive = (value as { valueOf: () => unknown }).valueOf();
        if (asPrimitive !== value) {
          return this.normalizeNumber(asPrimitive);
        }
      }
    }
    return undefined;
  }

  private shouldRefreshPricing(pricing?: CartItem['pricing']): boolean {
    if (!pricing) {
      return true;
    }
    const base = pricing.basePrice;
    const final = pricing.finalPrice;
    if (base === undefined || final === undefined) {
      return true;
    }
    if (!Number.isFinite(base) || !Number.isFinite(final)) {
      return true;
    }
    if (base <= 0 || final <= 0) {
      return true;
    }
    return false;
  }

  private roundPrice(value: number | undefined): number | undefined {
    if (value === undefined) {
      return undefined;
    }
    return Math.round(value * 100) / 100;
  }

  private getPricingRecord(pricingByCurrency: unknown, currency: string): PriceSnapshot | undefined {
    if (!pricingByCurrency || typeof pricingByCurrency !== 'object') {
      return undefined;
    }

    const normalizedCurrency = this.normalizeCurrency(currency);
    let entry: unknown;

    if (pricingByCurrency instanceof Map) {
      const mapEntries = Array.from(pricingByCurrency.entries());
      entry =
        mapEntries.find(([key]) => this.normalizeCurrency(String(key)) === normalizedCurrency)?.[1] ??
        mapEntries.find(([key]) => String(key).toLowerCase() === normalizedCurrency.toLowerCase())?.[1];
    } else {
      const pricingMap = pricingByCurrency as Record<string, unknown>;
      const directKey =
        pricingMap[normalizedCurrency] ??
        pricingMap[normalizedCurrency.toLowerCase()] ??
        pricingMap[normalizedCurrency.toUpperCase()] ??
        pricingMap[currency];

      if (!directKey) {
        const matchedKey = Object.keys(pricingMap).find(
          (key) => this.normalizeCurrency(key) === normalizedCurrency,
        );
        entry = matchedKey ? pricingMap[matchedKey] : undefined;
      } else {
        entry = directKey;
      }
    }

    if (!entry || typeof entry !== 'object') {
      return undefined;
    }

    const rec = entry as Record<string, unknown>;
    const basePrice = this.normalizeNumber(rec['basePrice']);
    const finalPrice = this.normalizeNumber(rec['finalPrice']);
    const discountPercent = this.normalizeNumber(rec['discountPercent']);
    const discountAmount = this.normalizeNumber(rec['discountAmount']);
    const exchangeRate = this.normalizeNumber(rec['exchangeRate']);
    const currencyCode =
      typeof rec['currency'] === 'string'
        ? this.normalizeCurrency(rec['currency'])
        : normalizedCurrency;

    return {
      basePrice,
      finalPrice,
      discountPercent,
      discountAmount,
      exchangeRate,
      currency: currencyCode,
    };
  }

  private async buildPricingForCurrency(options: {
    basePriceUSD?: number | null;
    compareAtPriceUSD?: number | null;
    pricingByCurrency?: unknown;
    currency: string;
  }): Promise<{ basePriceUSD: number; pricing: CartPricing }> {
    const targetCurrency = this.normalizeCurrency(options.currency);
    const baseInputUSD = this.normalizeNumber(
      options.basePriceUSD ?? options.compareAtPriceUSD ?? undefined,
    );
    const compareAtInputUSD = this.normalizeNumber(options.compareAtPriceUSD ?? undefined);
    const priceRecord = this.getPricingRecord(options.pricingByCurrency, targetCurrency);
    const usdRecord =
      targetCurrency === 'USD'
        ? priceRecord
        : this.getPricingRecord(options.pricingByCurrency, 'USD');

    let basePriceUSD = baseInputUSD ?? compareAtInputUSD;
    if (basePriceUSD === undefined) {
      basePriceUSD = this.normalizeNumber(usdRecord?.basePrice);
    }
    if (basePriceUSD === undefined && priceRecord?.basePrice && priceRecord?.exchangeRate) {
      basePriceUSD = priceRecord.basePrice / priceRecord.exchangeRate;
    }
    if (
      basePriceUSD === undefined &&
      priceRecord?.basePrice !== undefined &&
      priceRecord?.currency &&
      this.exchangeRatesService
    ) {
      try {
        const conversion = await this.exchangeRatesService.convertCurrency({
          amount: priceRecord.basePrice,
          fromCurrency: priceRecord.currency,
          toCurrency: 'USD',
        });
        basePriceUSD = conversion.result;
      } catch {
        // ignore and fallback
      }
    }

    if (basePriceUSD === undefined && priceRecord?.finalPrice !== undefined) {
      if (priceRecord.currency === 'USD' || targetCurrency === 'USD') {
        basePriceUSD = priceRecord.finalPrice;
      } else if (priceRecord.exchangeRate) {
        basePriceUSD = priceRecord.finalPrice / priceRecord.exchangeRate;
      } else if (this.exchangeRatesService) {
        try {
          const conversion = await this.exchangeRatesService.convertCurrency({
            amount: priceRecord.finalPrice,
            fromCurrency: priceRecord.currency ?? targetCurrency,
            toCurrency: 'USD',
          });
          basePriceUSD = conversion.result;
        } catch {
          // ignore
        }
      }
    }

    if (basePriceUSD === undefined && usdRecord?.finalPrice !== undefined) {
      basePriceUSD = usdRecord.finalPrice;
    }

    if (basePriceUSD === undefined) {
      // As a final fallback assume zero price to avoid breaking the cart
      basePriceUSD = 0;
    }

    if (basePriceUSD === undefined) {
      throw new Error('لم يتم تحديد سعر لهذا المنتج');
    }

    let basePrice = this.normalizeNumber(priceRecord?.basePrice);
    let finalPrice = this.normalizeNumber(priceRecord?.finalPrice);
    let discountAmount = this.normalizeNumber(priceRecord?.discountAmount);
    const discountPercent = this.normalizeNumber(priceRecord?.discountPercent);

    if (
      targetCurrency !== 'USD' &&
      (basePrice === undefined || finalPrice === undefined) &&
      this.exchangeRatesService
    ) {
      try {
        const conversion = await this.exchangeRatesService.convertCurrency({
          amount: basePriceUSD,
          fromCurrency: 'USD',
          toCurrency: targetCurrency,
        });
        if (basePrice === undefined) {
          basePrice = conversion.result;
        }
        if (finalPrice === undefined) {
          finalPrice = conversion.result;
        }
        if (discountAmount === undefined && discountPercent !== undefined) {
          const discount = (conversion.result * discountPercent) / 100;
          discountAmount = this.roundPrice(discount);
          finalPrice = conversion.result - (discountAmount ?? 0);
        }
      } catch {
        // ignore conversion errors and fallback to USD values
      }
    }

    if (basePrice === undefined) {
      basePrice = basePriceUSD ?? compareAtInputUSD ?? 0;
    }
    if (finalPrice === undefined) {
      if (discountAmount !== undefined) {
        finalPrice = Math.max(0, basePrice - discountAmount);
      } else if (discountPercent !== undefined) {
        finalPrice = Math.max(0, basePrice * (1 - discountPercent / 100));
      } else {
        finalPrice = basePrice;
      }
    }
    if (discountAmount === undefined) {
      discountAmount = Math.max(0, basePrice - finalPrice);
    }

    const roundedBase = this.roundPrice(basePrice) ?? basePrice ?? 0;
    const roundedFinal = this.roundPrice(finalPrice) ?? finalPrice ?? roundedBase;
    const roundedDiscount =
      this.roundPrice(discountAmount) ??
      discountAmount ??
      Math.max(0, roundedBase - roundedFinal);

    return {
      basePriceUSD,
      pricing: {
        currency: targetCurrency,
        basePrice: roundedBase,
        finalPrice: roundedFinal,
        discount: roundedDiscount,
      },
    };
  }

  private toView(cart: Cart): ItemView[] {
    return (cart.items || []).map((ci: CartItem) => {
      const rawId =
        (ci as unknown as { _id?: unknown })._id ??
        (ci as unknown as { id?: unknown }).id ??
        null;
      const variantIdStr = ci.variantId ? this.toStringId(ci.variantId) : undefined;
      const productIdStr = ci.productId ? this.toStringId(ci.productId) : undefined;
      const itemId =
        this.toStringId(rawId) ??
        (variantIdStr
          ? `variant-${variantIdStr}`
          : productIdStr
            ? `product-${productIdStr}`
            : `temp-${randomUUID()}`);

      return {
        itemId,
        variantId: variantIdStr,
        productId: productIdStr,
        qty: ci.qty,
      };
    });
  }

  // ---------- user cart
  async getUserCart(userId: string) {
    const cart = await this.getOrCreateUserCart(userId);

    const metadata =
      (cart.metadata && typeof cart.metadata === 'object' ? cart.metadata : {}) as Record<string, unknown>;
    const currencyManuallySet =
      typeof metadata.currencyManuallySet === 'boolean' ? metadata.currencyManuallySet : false;
    const cartCurrency = cart.currency ? this.normalizeCurrency(cart.currency) : undefined;

    let preferredCurrency = 'USD';
    if (cartCurrency) {
      if (cartCurrency === 'USD') {
        preferredCurrency = 'USD';
      } else if (cartCurrency === 'YER') {
        preferredCurrency = currencyManuallySet ? 'YER' : 'USD';
      } else {
        preferredCurrency = cartCurrency;
      }
    }

    if (!currencyManuallySet && cartCurrency === 'YER') {
      cart.currency = 'USD';
      cart.metadata = { ...metadata };
      await cart.save();
    }

    const accountType = (cart.accountType as 'any' | 'customer' | 'engineer' | 'merchant') || 'any';

    // Return full cart details with pricing and product info
    const preview = await this.previewByCart(cart, preferredCurrency, accountType, userId);

    return preview;
  }

  async updateCartSettings(
    userId: string,
    settings: { currency?: string; accountType?: string; metadata?: Record<string, unknown> },
  ) {
    const cart = await this.getOrCreateUserCart(userId);

    const currentMetadata =
      (cart.metadata && typeof cart.metadata === 'object' ? cart.metadata : {}) as Record<string, unknown>;

    if (settings.currency) {
      cart.currency = this.normalizeCurrency(settings.currency);
      currentMetadata.currencyManuallySet = true;
    }
    if (settings.accountType) cart.accountType = settings.accountType;
    if (settings.metadata) {
      Object.assign(currentMetadata, settings.metadata);
    }

    cart.metadata = currentMetadata;

    cart.lastActivityAt = new Date();
    await cart.save();

    return this.getUserCart(userId);
  }

  async applyCoupon(userId: string, couponCode: string) {
    const cart = await this.getOrCreateUserCart(userId);

    // Initialize appliedCouponCodes array if not exists
    if (!cart.appliedCouponCodes) {
      cart.appliedCouponCodes = [];
    }

    // Check if coupon already applied
    if (cart.appliedCouponCodes.includes(couponCode)) {
      throw new Error('هذا الكوبون مطبق بالفعل');
    }

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

      // Add coupon to array
      cart.appliedCouponCodes.push(couponCode);
      cart.lastActivityAt = new Date();

      // Backward compatibility: keep old field for now
      if (!cart.appliedCouponCode) {
        cart.appliedCouponCode = couponCode;
      }

      // Recalculate pricing with validated coupon
      await this.recalculatePricing(cart);
      await cart.save();
    } else {
      // Fallback if marketing service is not available
      cart.appliedCouponCodes.push(couponCode);
      cart.lastActivityAt = new Date();

      // Backward compatibility
      if (!cart.appliedCouponCode) {
        cart.appliedCouponCode = couponCode;
      }

      await this.recalculatePricing(cart);
      await cart.save();
    }

    return this.getUserCart(userId);
  }

  async removeCoupon(userId: string, couponCode?: string) {
    const cart = await this.getOrCreateUserCart(userId);

    // Initialize appliedCouponCodes array if not exists
    if (!cart.appliedCouponCodes) {
      cart.appliedCouponCodes = [];
    }

    if (couponCode) {
      // Remove specific coupon
      const index = cart.appliedCouponCodes.indexOf(couponCode);
      if (index > -1) {
        cart.appliedCouponCodes.splice(index, 1);
      }
    } else {
      // Remove all coupons
      cart.appliedCouponCodes = [];
    }

    // Backward compatibility: clear old field if no coupons left
    if (cart.appliedCouponCodes.length === 0) {
      cart.appliedCouponCode = undefined;
    } else {
      cart.appliedCouponCode = cart.appliedCouponCodes[0]; // Keep first for backward compatibility
    }

    cart.lastActivityAt = new Date();

    // Recalculate pricing
    await this.recalculatePricing(cart);
    await cart.save();

    return this.getUserCart(userId);
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
      } else if (item.variantId) {
        const variant = await this.variantModel.findById(item.variantId).lean();
        if (variant) {
          pricingSummary.subtotal += (variant.basePriceUSD || 0) * item.qty;
        }
      } else if (item.productId) {
        const product = await this.productModel.findById(item.productId).lean();
        if (product && product.basePriceUSD !== undefined && product.basePriceUSD !== null) {
          pricingSummary.subtotal += product.basePriceUSD * item.qty;
        }
      }
    }

    // Initialize appliedCouponCodes if not exists
    if (!cart.appliedCouponCodes) {
      cart.appliedCouponCodes = [];
      // Backward compatibility: migrate from old field
      if (cart.appliedCouponCode) {
        cart.appliedCouponCodes.push(cart.appliedCouponCode);
      }
    }

    // Calculate coupon discounts cumulatively (multiple coupons support)
    let cumulativeCouponDiscount = 0;
    let remainingSubtotal = pricingSummary.subtotal;

    if (cart.appliedCouponCodes.length > 0 && this.marketingService) {
      // Apply coupons one by one, each on the remaining amount after previous discounts
      for (const couponCode of cart.appliedCouponCodes) {
        const couponDiscount = await this.calculateCouponDiscount(
          couponCode,
          remainingSubtotal,
        );
        cumulativeCouponDiscount += couponDiscount;
        remainingSubtotal = Math.max(0, remainingSubtotal - couponDiscount);
      }
      pricingSummary.couponDiscount = cumulativeCouponDiscount;
    } else if (cart.appliedCouponCodes.length > 0) {
      // Fallback calculation if marketing service is not available
      // Apply 10% discount for each coupon (cumulative)
      let remaining = pricingSummary.subtotal;
      for (let i = 0; i < cart.appliedCouponCodes.length; i++) {
        const discount = remaining * 0.1; // 10% example
        cumulativeCouponDiscount += discount;
        remaining = Math.max(0, remaining - discount);
      }
      pricingSummary.couponDiscount = cumulativeCouponDiscount;
    }

    // Ensure total discount doesn't exceed subtotal
    pricingSummary.totalDiscount =
      pricingSummary.promotionDiscount +
      pricingSummary.couponDiscount +
      pricingSummary.autoDiscount;
    
    // Ensure total discount doesn't exceed subtotal
    pricingSummary.totalDiscount = Math.min(pricingSummary.totalDiscount, pricingSummary.subtotal);
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

  async addUserItem(userId: string, payload: AddItemInput) {
    const cart = await this.getOrCreateUserCart(userId);
    await this.addOrUpdateCartItem(cart, payload);
    await cart.save();
    
    // Return full cart details with pricing
    return this.getUserCart(userId);
  }
  async updateUserItem(userId: string, itemId: string, qty: number) {
    const cart = await this.getOrCreateUserCart(userId);
    
    // Parse itemId to find the actual item
    let it: CartItem | undefined;
    
    if (itemId.startsWith('product-')) {
      const productId = itemId.replace('product-', '');
      it = cart.items.find(
        (item: CartItem) =>
          !item.variantId &&
          item.productId &&
          String(item.productId) === productId,
      );
    } else if (itemId.startsWith('variant-')) {
      const variantId = itemId.replace('variant-', '');
      it = cart.items.find(
        (item: CartItem) =>
          item.variantId &&
          String(item.variantId) === variantId,
      );
    } else {
      // Fallback to _id lookup for backward compatibility
      it = (cart.items as Types.DocumentArray<CartItem>).id(itemId) ?? undefined;
    }
    
    if (!it) return this.getUserCart(userId);
    it.qty = qty;
    cart.lastActivityAt = new Date();
    await cart.save();
    return this.getUserCart(userId);
  }
  async removeUserItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateUserCart(userId);
    
    // Parse itemId to find the actual item
    let itemIndex = -1;
    
    if (itemId.startsWith('product-')) {
      const productId = itemId.replace('product-', '');
      itemIndex = cart.items.findIndex(
        (item: CartItem) =>
          !item.variantId &&
          item.productId &&
          String(item.productId) === productId,
      );
    } else if (itemId.startsWith('variant-')) {
      const variantId = itemId.replace('variant-', '');
      itemIndex = cart.items.findIndex(
        (item: CartItem) =>
          item.variantId &&
          String(item.variantId) === variantId,
      );
    } else {
      // Fallback to _id lookup for backward compatibility
      const foundItem = (cart.items as Types.DocumentArray<CartItem>).id(itemId);
      if (foundItem) {
        (foundItem as unknown as Types.Subdocument & { remove(): void })?.remove();
        cart.lastActivityAt = new Date();
        await cart.save();
        return this.getUserCart(userId);
      }
    }
    
    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
    }
    
    cart.lastActivityAt = new Date();
    await cart.save();
    return this.getUserCart(userId);
  }
  async clearUserCart(userId: string) {
    const cart = await this.getOrCreateUserCart(userId);
    cart.items = [];
    await cart.save();
    return this.getUserCart(userId);
  }

  // ---------- guest cart
  async getGuestCart(deviceId: string) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    return { items: this.toView(cart) };
  }
  async addGuestItem(
    payload: AddItemInput & { deviceId: string },
  ) {
    const { deviceId, ...itemInput } = payload;
    const cart = await this.getOrCreateGuestCart(deviceId);
    const result = await this.addOrUpdateCartItem(cart, itemInput);
    await cart.save();
    return result;
  }
  async updateGuestItem(deviceId: string, itemId: string, qty: number) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    
    // Parse itemId to find the actual item
    let it: CartItem | undefined;
    
    if (itemId.startsWith('product-')) {
      const productId = itemId.replace('product-', '');
      it = cart.items.find(
        (item: CartItem) =>
          !item.variantId &&
          item.productId &&
          String(item.productId) === productId,
      );
    } else if (itemId.startsWith('variant-')) {
      const variantId = itemId.replace('variant-', '');
      it = cart.items.find(
        (item: CartItem) =>
          item.variantId &&
          String(item.variantId) === variantId,
      );
    } else {
      // Fallback to _id lookup for backward compatibility
      it = (cart.items as Types.DocumentArray<CartItem>).id(itemId) ?? undefined;
    }
    
    if (!it) return { items: this.toView(cart) };
    it.qty = qty;
    cart.lastActivityAt = new Date();
    await cart.save();
    return { items: this.toView(cart) };
  }
  async removeGuestItem(deviceId: string, itemId: string) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    
    // Parse itemId to find the actual item
    let itemIndex = -1;
    
    if (itemId.startsWith('product-')) {
      const productId = itemId.replace('product-', '');
      itemIndex = cart.items.findIndex(
        (item: CartItem) =>
          !item.variantId &&
          item.productId &&
          String(item.productId) === productId,
      );
    } else if (itemId.startsWith('variant-')) {
      const variantId = itemId.replace('variant-', '');
      itemIndex = cart.items.findIndex(
        (item: CartItem) =>
          item.variantId &&
          String(item.variantId) === variantId,
      );
    } else {
      // Fallback to _id lookup for backward compatibility
      const foundItem = (cart.items as Types.DocumentArray<CartItem>).id(itemId);
      if (foundItem) {
        (foundItem as unknown as Types.Subdocument & { remove(): void })?.remove();
        cart.lastActivityAt = new Date();
        await cart.save();
        return { items: this.toView(cart) };
      }
    }
    
    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
    }
    
    cart.lastActivityAt = new Date();
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
      let target: CartItem | undefined;
      if (g.variantId) {
        target = user.items.find(
          (x: CartItem) => x.variantId && String(x.variantId) === String(g.variantId),
        );
      } else if (g.productId) {
        target = user.items.find(
          (x: CartItem) =>
            !x.variantId &&
            x.productId &&
            String(x.productId) === String(g.productId),
        );
      }

      if (target) {
        target.qty = Math.min(999, target.qty + g.qty);
      } else {
        user.items.push({
          variantId: g.variantId,
          productId: g.productId,
          itemType: g.itemType || (g.variantId ? 'variant' : 'product'),
          qty: g.qty,
          addedAt: g.addedAt,
          productSnapshot: g.productSnapshot,
          pricing: g.pricing,
        } as CartItem);
      }
    }
    user.lastActivityAt = new Date();
    this.ensureCapacity(user);
    await user.save();
    guest.items = [];
    await guest.save();
    return this.getUserCart(userId);
  }

  private async addOrUpdateCartItem(cart: Cart, input: AddItemInput) {
    const { variantId, productId, qty } = input;
    if (!variantId && !productId) {
      throw new Error('يجب تحديد المنتج أو المتغير لإضافته إلى السلة');
    }
    if (qty <= 0) {
      throw new Error('الكمية يجب أن تكون أكبر من صفر');
    }

    const resolved = await this.resolveCartItemIdentifiers({
      variantId,
      productId,
      currency: cart.currency,
    });

    let target: CartItem | undefined;
    if (resolved.variantId) {
      target = cart.items.find(
        (item: CartItem) =>
          item.variantId && String(item.variantId) === String(resolved.variantId),
      );
    } else {
      target = cart.items.find(
        (item: CartItem) =>
          !item.variantId &&
          item.productId &&
          String(item.productId) === String(resolved.productId),
      );
    }

    if (target) {
      target.qty = Math.min(999, target.qty + qty);
      target.productId = resolved.productId;
      target.variantId = resolved.variantId;
      target.itemType = resolved.itemType;
      target.productSnapshot = resolved.productSnapshot;
      const existingPromotionId = target.pricing?.appliedPromotionId;
      target.pricing = {
        ...resolved.pricing,
        ...(existingPromotionId ? { appliedPromotionId: existingPromotionId } : {}),
      };
      if (typeof (cart as unknown as { markModified?: (path: string) => void }).markModified === 'function') {
        (cart as unknown as { markModified: (path: string) => void }).markModified('items');
      }
    } else {
      const docItems = cart.items as Types.DocumentArray<CartItem>;
      const newItem = docItems.create({
        _id: new Types.ObjectId().toString(),
        variantId: resolved.variantId,
        productId: resolved.productId,
        itemType: resolved.itemType,
        qty,
        addedAt: new Date(),
        productSnapshot: resolved.productSnapshot,
        pricing: resolved.pricing,
      } as CartItem);
      docItems.push(newItem);
      if (typeof (cart as unknown as { markModified?: (path: string) => void }).markModified === 'function') {
        (cart as unknown as { markModified: (path: string) => void }).markModified('items');
      }
    }

    this.ensureCapacity(cart);
    cart.lastActivityAt = new Date();
    return { items: this.toView(cart) };
  }

  private toStringId(value?: unknown): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (value instanceof Types.ObjectId) return value.toString();
    if (typeof value === 'object' && '_id' in (value as Record<string, unknown>)) {
      return this.toStringId((value as { _id?: unknown })._id);
    }
    return undefined;
  }

  private buildUserSummary(
    user: unknown,
  ):
    | {
        _id: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        storeName?: string;
        email?: string;
        phone?: string;
      }
    | undefined {
    if (!user || typeof user !== 'object') {
      return undefined;
    }

    const userRecord = user as Record<string, unknown>;
    const id = this.toStringId(userRecord['_id']);
    if (!id) {
      return undefined;
    }

    const firstName =
      typeof userRecord['firstName'] === 'string' && userRecord['firstName'].trim().length > 0
        ? (userRecord['firstName'] as string).trim()
        : undefined;
    const lastName =
      typeof userRecord['lastName'] === 'string' && userRecord['lastName'].trim().length > 0
        ? (userRecord['lastName'] as string).trim()
        : undefined;
    const storeName =
      typeof userRecord['storeName'] === 'string' && userRecord['storeName'].trim().length > 0
        ? (userRecord['storeName'] as string).trim()
        : undefined;
    const email =
      typeof userRecord['email'] === 'string' && userRecord['email'].trim().length > 0
        ? (userRecord['email'] as string).trim()
        : undefined;
    const phone =
      typeof userRecord['phone'] === 'string' && userRecord['phone'].trim().length > 0
        ? (userRecord['phone'] as string).trim()
        : undefined;

    const nameCandidate = storeName || [firstName, lastName].filter(Boolean).join(' ').trim();
    const name = nameCandidate.length > 0 ? nameCandidate : email ?? phone;

    return {
      _id: id,
      name,
      firstName,
      lastName,
      storeName,
      email,
      phone,
    };
  }

  private buildProductSnapshot(
    product?: Product | null,
    currency: string = 'USD',
  ): CartItem['productSnapshot'] | undefined {
    if (!product) return undefined;

    const productRecord = product as unknown as Record<string, unknown>;
    const targetCurrency = this.normalizeCurrency(currency);

    let image: string | undefined;
    const mainImageCandidate =
      productRecord['mainImage'] ?? productRecord['mainImageId'] ?? productRecord['image'];
    if (
      mainImageCandidate &&
      typeof mainImageCandidate === 'object' &&
      'url' in (mainImageCandidate as Record<string, unknown>)
    ) {
      image = String((mainImageCandidate as { url?: unknown }).url ?? '');
    } else if (typeof mainImageCandidate === 'string') {
      image = mainImageCandidate;
    }

    const brand = productRecord['brandId'];
    const category = productRecord['categoryId'];

    const useManualRating =
      typeof productRecord['useManualRating'] === 'boolean'
        ? (productRecord['useManualRating'] as boolean)
        : false;
    const averageRating = this.normalizeNumber(productRecord['averageRating']);
    const manualRating = this.normalizeNumber(productRecord['manualRating']);
    const manualReviewsCount = this.normalizeNumber(productRecord['manualReviewsCount']);
    const reviewsCountRaw = this.normalizeNumber(productRecord['reviewsCount']);

    let ratingValue: number | undefined;
    let ratingSource: 'manual' | 'average' | undefined;
    if (useManualRating) {
      if (manualRating !== undefined) {
        ratingValue = manualRating;
        ratingSource = 'manual';
      } else if (averageRating !== undefined) {
        ratingValue = averageRating;
        ratingSource = 'average';
      }
    } else {
      if (averageRating !== undefined) {
        ratingValue = averageRating;
        ratingSource = 'average';
      } else if (manualRating !== undefined) {
        ratingValue = manualRating;
        ratingSource = 'manual';
      }
    }

    const reviewsCount = useManualRating
      ? manualReviewsCount ?? reviewsCountRaw ?? undefined
      : reviewsCountRaw ?? manualReviewsCount ?? undefined;

    let price: { base: number; final: number; currency: string } | undefined;
    const priceBase =
      this.normalizeNumber(productRecord['basePriceUSD']) ??
      this.normalizeNumber(productRecord['basePrice']) ??
      this.normalizeNumber(productRecord['compareAtPriceUSD']);
    const pricingSource = productRecord['pricingByCurrency'];
    const priceRecord =
      this.getPricingRecord(pricingSource, targetCurrency) ??
      this.getPricingRecord(pricingSource, 'USD');

    if (priceRecord) {
      const base =
        this.roundPrice(priceRecord.basePrice ?? priceRecord.finalPrice) ??
        priceRecord.basePrice ??
        priceRecord.finalPrice ??
        priceBase ??
        0;
      const final =
        this.roundPrice(priceRecord.finalPrice ?? priceRecord.basePrice) ??
        priceRecord.finalPrice ??
        priceRecord.basePrice ??
        base;
      const currencyCode = priceRecord.currency ?? targetCurrency;
      price = {
        base,
        final,
        currency: currencyCode,
      };
    } else if (priceBase !== undefined) {
      const convertedBase = this.roundPrice(priceBase) ?? priceBase;
      price = {
        base: convertedBase,
        final: convertedBase,
        currency: targetCurrency,
      };
    }

    return {
      name: (productRecord['name'] as string) ?? '',
      slug: (productRecord['slug'] as string) ?? '',
      image,
      brandId: this.toStringId(brand),
      brandName:
        brand && typeof brand === 'object' && 'name' in (brand as Record<string, unknown>)
          ? String((brand as { name?: unknown }).name ?? '')
          : undefined,
      categoryId: this.toStringId(category),
      averageRating: averageRating,
      ratingValue,
      ratingSource,
      reviewsCount,
      ...(price ? { price } : {}),
    };
  }

  private async resolveCartItemIdentifiers(input: {
    variantId?: string;
    productId?: string;
    currency?: string;
  }): Promise<{
    variantId?: Types.ObjectId;
    productId: Types.ObjectId;
    itemType: 'variant' | 'product';
    productSnapshot?: CartItem['productSnapshot'];
    basePriceUSD: number;
    pricing: CartPricing;
  }> {
    const targetCurrency = this.normalizeCurrency(input.currency);

    if (input.variantId) {
      const variant = await this.variantModel.findById(input.variantId).lean();
      if (!variant) {
        throw new Error('المتغير غير موجود');
      }

      const product = await this.productModel
        .findById(variant.productId)
        .populate('mainImageId')
        .lean();
      if (!product) {
        throw new Error('المنتج المرتبط بالمتغير غير موجود');
      }

      const variantRecord = variant as unknown as Record<string, unknown>;
      const productRecord = product as unknown as Record<string, unknown>;
      const pricingSource = variantRecord['pricingByCurrency'] ?? productRecord['pricingByCurrency'];

      let pricing: CartPricing;
      let basePriceUSD: number;
      if (variantRecord?.['pricingByCurrency'] || productRecord?.['pricingByCurrency']) {
        const resolved = await this.buildPricingForCurrency({
          basePriceUSD: variant.basePriceUSD ?? this.normalizeNumber(productRecord['basePriceUSD']),
          compareAtPriceUSD:
            this.normalizeNumber(variantRecord['compareAtPriceUSD']) ??
            this.normalizeNumber(productRecord['compareAtPriceUSD']),
          pricingByCurrency: pricingSource,
          currency: targetCurrency,
        });
        pricing = resolved.pricing;
        basePriceUSD = resolved.basePriceUSD;
      } else {
        const priceUSD = this.normalizeNumber(variantRecord?.['basePriceUSD']) ?? 0;
        basePriceUSD = priceUSD;
        const converted =
          targetCurrency === 'USD' || !this.exchangeRatesService
            ? priceUSD
            : (
                await this.exchangeRatesService.convertCurrency({
                  amount: priceUSD,
                  fromCurrency: 'USD',
                  toCurrency: targetCurrency,
                })
              ).result;
        pricing = {
          currency: targetCurrency,
          basePrice: converted,
          finalPrice: converted,
          discount: 0,
        };
      }

      return {
        variantId: new Types.ObjectId(String(variant._id)),
        productId: new Types.ObjectId(String(variant.productId)),
        itemType: 'variant',
        productSnapshot: this.buildProductSnapshot(product, input.currency ?? 'USD'),
        basePriceUSD,
        pricing,
      };
    }

    if (input.productId) {
      const product = await this.productModel
        .findById(input.productId)
        .populate('mainImageId')
        .lean();
      if (!product) {
        throw new Error('المنتج غير موجود');
      }

      const productRecord = product as unknown as Record<string, unknown>;
      const pricingByCurrency = productRecord['pricingByCurrency'];

      let pricing: CartPricing;
      let basePriceUSD: number;

      if (pricingByCurrency) {
        const resolved = await this.buildPricingForCurrency({
          basePriceUSD: this.normalizeNumber(productRecord['basePriceUSD'] ?? productRecord['basePrice']),
          compareAtPriceUSD: this.normalizeNumber(productRecord['compareAtPriceUSD']),
          pricingByCurrency,
          currency: targetCurrency,
        });
        pricing = resolved.pricing;
        basePriceUSD = resolved.basePriceUSD;
      } else {
        const priceUSD =
          this.normalizeNumber(productRecord['basePriceUSD']) ??
          this.normalizeNumber(productRecord['basePrice']) ??
          this.normalizeNumber(productRecord['compareAtPriceUSD']) ??
          0;
        basePriceUSD = priceUSD;
        const converted =
          targetCurrency === 'USD' || !this.exchangeRatesService
            ? priceUSD
            : (
                await this.exchangeRatesService.convertCurrency({
                  amount: priceUSD,
                  fromCurrency: 'USD',
                  toCurrency: targetCurrency,
                })
              ).result;
        pricing = {
          currency: targetCurrency,
          basePrice: converted,
          finalPrice: converted,
          discount: 0,
        };
      }

      return {
        productId: new Types.ObjectId(String(product._id)),
        itemType: 'product',
        productSnapshot: this.buildProductSnapshot(product, input.currency ?? 'USD'),
        basePriceUSD,
        pricing,
      };
    }

    throw new Error('يجب تحديد معرف المتغير أو المنتج');
  }

  // ---------- preview
  async previewByCart(
    cart: Cart,
    currency: string,
    accountType: 'any' | 'customer' | 'engineer' | 'merchant',
    userId?: string,
  ) {
    const normalizedCurrency = this.normalizeCurrency(currency);
    const lines: CartLine[] = [];
    let subtotalUSD = 0;
    let subtotalBeforeDiscountUSD = 0;
    let merchantDiscountPercent = 0;
    let merchantDiscountAmount = 0;

    // جلب قدرات المستخدم لتطبيق خصم التاجر
      if (userId) {
        const caps = await this.capsModel.findOne({ userId }).lean();
      if (caps && caps.merchant_capable && caps.merchant_discount_percent > 0) {
        merchantDiscountPercent = caps.merchant_discount_percent;
      }
    }

    for (const it of cart.items) {
      const rawId =
        (it as unknown as { _id?: unknown })._id ?? (it as unknown as { id?: unknown }).id ?? null;
      let variantIdStr = it.variantId ? this.toStringId(it.variantId) : undefined;
      let productIdStr = it.productId ? this.toStringId(it.productId) : undefined;
      let snapshot = it.productSnapshot;
      let appliedRule: unknown = null;

      let pricingDetails: CartItem['pricing'] | undefined = it.pricing
        ? { ...it.pricing }
        : undefined;
      const existingPromotionId = pricingDetails?.appliedPromotionId ?? undefined;

      let lineCurrency = this.normalizeCurrency(pricingDetails?.currency ?? normalizedCurrency);

      let variant: Variant | null = null;
      let product: Product | null = null;

      if (variantIdStr) {
        try {
          variant = await this.variantModel.findById(it.variantId).lean();
        } catch {
          variant = null;
        }
        if (variant) {
          const resolvedVariantId = this.toStringId(
            (variant as unknown as { _id?: unknown })._id,
          );
          if (resolvedVariantId) {
            variantIdStr = resolvedVariantId;
          }
          productIdStr =
            this.toStringId((variant as unknown as { productId?: unknown }).productId) ??
            productIdStr;
          try {
            product = await this.productModel
              .findById(variant.productId)
              .populate('mainImageId')
              .lean();
          } catch {
            product = null;
          }
        }
      }

      if (!variant && productIdStr) {
        try {
          product = await this.productModel
            .findById(it.productId ?? productIdStr)
            .populate('mainImageId')
            .lean();
        } catch {
          product = null;
        }
      }

      const refreshedSnapshot =
        this.buildProductSnapshot(product ?? undefined, normalizedCurrency) ?? snapshot;
      snapshot = refreshedSnapshot;
      const variantRecord = variant ? (variant as unknown as Record<string, unknown>) : undefined;
      const productRecord = product ? (product as unknown as Record<string, unknown>) : undefined;

      if (this.shouldRefreshPricing(pricingDetails)) {
        const basePriceUSDSource =
          this.normalizeNumber(variantRecord?.['basePriceUSD']) ??
          this.normalizeNumber(productRecord?.['basePriceUSD']) ??
          this.normalizeNumber(productRecord?.['basePrice']);
        const pricingByCurrencySource =
          (variantRecord?.['pricingByCurrency'] as unknown) ??
          (productRecord?.['pricingByCurrency'] as unknown);

        try {
          const { pricing } = await this.buildPricingForCurrency({
            basePriceUSD: basePriceUSDSource ?? undefined,
            compareAtPriceUSD:
              this.normalizeNumber(variantRecord?.['compareAtPriceUSD']) ??
              this.normalizeNumber(productRecord?.['compareAtPriceUSD']),
            pricingByCurrency: pricingByCurrencySource,
            currency: normalizedCurrency,
          });

          pricingDetails = {
            currency: pricing.currency,
            basePrice: pricing.basePrice,
            finalPrice: pricing.finalPrice,
            discount: pricing.discount,
          };

          if (existingPromotionId) {
            pricingDetails.appliedPromotionId = existingPromotionId;
          }

          lineCurrency = this.normalizeCurrency(pricing.currency);
        } catch {
          // ignore pricing calculation errors and fallback to existing values
        }
      } else if (existingPromotionId && pricingDetails) {
        pricingDetails.appliedPromotionId = existingPromotionId;
      }

      let base = pricingDetails?.basePrice;
      let final = pricingDetails?.finalPrice;

      if (base === undefined) {
        if (pricingDetails?.basePrice !== undefined) {
          base = pricingDetails.basePrice;
        } else if (variantRecord) {
          const variantBaseUSD = this.normalizeNumber(variantRecord['basePriceUSD']);
          if (variantBaseUSD !== undefined) {
            base = variantBaseUSD;
            lineCurrency = 'USD';
          }
        } else if (productRecord) {
          const productBaseUSD =
            this.normalizeNumber(productRecord['basePriceUSD']) ??
            this.normalizeNumber(productRecord['basePrice']);
          if (productBaseUSD !== undefined) {
            base = productBaseUSD;
            lineCurrency = 'USD';
          }
        }
      }

      if (final === undefined) {
        if (pricingDetails?.finalPrice !== undefined) {
          final = pricingDetails.finalPrice;
        } else {
          final = base ?? 0;
        }
      }

      base = base ?? 0;
      final = final ?? base;

      if (
        variant &&
        this.marketingService &&
        typeof this.marketingService.preview === 'function' &&
        variantIdStr
      ) {
        try {
          const res = await this.marketingService.preview({
            variantId: variantIdStr,
            currency: normalizedCurrency,
            qty: it.qty,
            accountType,
          });
          if (res) {
            final = res.finalPrice;
            base = res.basePrice ?? base;
            lineCurrency = normalizedCurrency;
            appliedRule = res.appliedRule;
          }
        } catch {
          // ignore marketing errors and fallback to existing pricing
        }
      }

      if (lineCurrency !== normalizedCurrency && this.exchangeRatesService) {
        try {
          const convertedFinal = await this.exchangeRatesService.convertCurrency({
            amount: final,
            fromCurrency: lineCurrency,
            toCurrency: normalizedCurrency,
          });
          final = convertedFinal.result;

          const convertedBase = await this.exchangeRatesService.convertCurrency({
            amount: base,
            fromCurrency: lineCurrency,
            toCurrency: normalizedCurrency,
          });
          base = convertedBase.result;

          lineCurrency = normalizedCurrency;
        } catch {
          // keep original currency if conversion fails
        }
      }

      if (pricingDetails) {
        pricingDetails.currency = normalizedCurrency;
        pricingDetails.basePrice = base;
        pricingDetails.finalPrice = final;
        pricingDetails.discount =
          this.roundPrice(Math.max(0, pricingDetails.basePrice - pricingDetails.finalPrice)) ??
          Math.max(0, pricingDetails.basePrice - pricingDetails.finalPrice);
      } else if (existingPromotionId !== undefined) {
        pricingDetails = {
          currency: normalizedCurrency,
          basePrice: base,
          finalPrice: final,
          discount:
            this.roundPrice(Math.max(0, base - final)) ?? Math.max(0, base - final),
          appliedPromotionId: existingPromotionId,
        };
      }

      const finalBeforeDiscount = final;
      const roundedBase = this.roundPrice(base) ?? base;
      const roundedFinalBefore = this.roundPrice(finalBeforeDiscount) ?? finalBeforeDiscount;

      if (merchantDiscountPercent > 0) {
        const merchantDiscountPerUnit = (roundedFinalBefore * merchantDiscountPercent) / 100;
        const discountedFinal = Math.max(0, roundedFinalBefore - merchantDiscountPerUnit);
        const roundedDiscountedFinal = this.roundPrice(discountedFinal) ?? discountedFinal;
        const lineMerchantDiscount =
          (roundedFinalBefore - roundedDiscountedFinal) * it.qty;
        merchantDiscountAmount += lineMerchantDiscount;
        final = roundedDiscountedFinal;
      } else {
        final = roundedFinalBefore;
      }

      const roundedFinal = this.roundPrice(final) ?? final;
      const computedDiscount =
        this.roundPrice(Math.max(0, roundedBase - roundedFinal)) ??
        Math.max(0, roundedBase - roundedFinal);
      const lineTotal = this.roundPrice(roundedFinal * it.qty) ?? roundedFinal * it.qty;

      if (this.exchangeRatesService) {
        const { result: baseUSD } = await this.exchangeRatesService.convertCurrency({
          amount: roundedBase,
          fromCurrency: normalizedCurrency,
          toCurrency: 'USD',
        });
        const { result: finalUSD } = await this.exchangeRatesService.convertCurrency({
          amount: roundedFinal,
          fromCurrency: normalizedCurrency,
          toCurrency: 'USD',
        });
        const lineTotalUSD = finalUSD * it.qty;

        subtotalUSD += lineTotalUSD;
        subtotalBeforeDiscountUSD += baseUSD * it.qty;
      } else {
        subtotalUSD += lineTotal;
        subtotalBeforeDiscountUSD += roundedBase * it.qty;
      }

      const itemId =
        this.toStringId(rawId) ??
        (variantIdStr
          ? `variant-${variantIdStr}`
          : productIdStr
            ? `product-${productIdStr}`
            : `temp-${randomUUID()}`);

      const pricingForView: CartItem['pricing'] = {
        currency: normalizedCurrency,
        basePrice: roundedBase,
        finalPrice: roundedFinal,
        discount: computedDiscount,
      };

      if (pricingDetails?.appliedPromotionId) {
        pricingForView.appliedPromotionId = pricingDetails.appliedPromotionId;
      }

      if (pricingDetails) {
        pricingDetails.basePrice = roundedBase;
        pricingDetails.finalPrice = roundedFinal;
        pricingDetails.discount = computedDiscount;
        pricingDetails.currency = normalizedCurrency;
      }

      lines.push({
        itemId,
        variantId: variantIdStr,
        productId: productIdStr,
        qty: it.qty,
        unit: {
          base: roundedBase,
          final: roundedFinal,
          finalBeforeDiscount: roundedFinalBefore,
          currency: normalizedCurrency,
          appliedRule: appliedRule ?? pricingDetails?.appliedPromotionId ?? null,
        },
        lineTotal,
        pricing: pricingForView,
        snapshot,
      });

      if (snapshot) {
        snapshot.price = {
          base: roundedBase,
          final: roundedFinal,
          currency: normalizedCurrency,
        };
      }
    }

    const totalQuantity = lines.reduce((sum, line) => sum + line.qty, 0);
    const roundedSubtotalBeforeDiscount =
      this.roundPrice(subtotalBeforeDiscountUSD) ?? subtotalBeforeDiscountUSD;
    const roundedSubtotal = this.roundPrice(subtotalUSD) ?? subtotalUSD;
    const roundedMerchantDiscount = this.roundPrice(merchantDiscountAmount) ?? merchantDiscountAmount;

    const storedCouponDiscount = this.roundPrice(cart.pricingSummary?.couponDiscount ?? 0) ?? 0;
    const storedPromotionDiscount =
      this.roundPrice(cart.pricingSummary?.promotionDiscount ?? 0) ?? 0;
    const storedAutoDiscount = this.roundPrice(cart.pricingSummary?.autoDiscount ?? 0) ?? 0;
    const additionalDiscounts = storedCouponDiscount + storedPromotionDiscount + storedAutoDiscount;
    const totalDiscountForConversion = roundedMerchantDiscount + additionalDiscounts;

    const appliedCoupons = [
      ...(cart.appliedCouponCodes ?? []),
      ...(cart.appliedCouponCode ? [cart.appliedCouponCode] : []),
    ].filter((code): code is string => Boolean(code));
    const uniqueAppliedCoupons = Array.from(new Set(appliedCoupons));

    let totalsInAllCurrencies:
      | Awaited<ReturnType<NonNullable<ExchangeRatesService>['calculateTotalsInAllCurrencies']>>
      | undefined;
    let pricingSummaryByCurrency: Record<string, PricingSummaryView> | undefined;
    let pricingSummary: PricingSummaryView;

    if (this.exchangeRatesService) {
      const convertComponentToUSD = async (amount: number): Promise<number> => {
        if (!amount) return 0;
        if (normalizedCurrency === 'USD') return amount;
        return this.exchangeRatesService!.convertToUSD(amount, normalizedCurrency);
      };

      const usdSubtotal =
        normalizedCurrency === 'USD' ? roundedSubtotal : await convertComponentToUSD(roundedSubtotal);
      const usdSubtotalBeforeDiscount =
        normalizedCurrency === 'USD'
          ? roundedSubtotalBeforeDiscount
          : await convertComponentToUSD(roundedSubtotalBeforeDiscount);
      const usdMerchantDiscount =
        normalizedCurrency === 'USD'
          ? roundedMerchantDiscount
          : await convertComponentToUSD(roundedMerchantDiscount);
      const usdCouponDiscount =
        normalizedCurrency === 'USD'
          ? storedCouponDiscount
          : await convertComponentToUSD(storedCouponDiscount);
      const usdPromotionDiscount =
        normalizedCurrency === 'USD'
          ? storedPromotionDiscount
          : await convertComponentToUSD(storedPromotionDiscount);
      const usdAutoDiscount =
        normalizedCurrency === 'USD'
          ? storedAutoDiscount
          : await convertComponentToUSD(storedAutoDiscount);

      const usdAdditionalDiscounts = usdCouponDiscount + usdPromotionDiscount + usdAutoDiscount;
      const usdTotalDiscount = usdMerchantDiscount + usdAdditionalDiscounts;
      const usdTotal = Math.max(0, usdSubtotal - usdAdditionalDiscounts);

      totalsInAllCurrencies = await this.exchangeRatesService.calculateTotalsInAllCurrencies(
        usdSubtotal,
        0,
        0,
        usdTotalDiscount,
      );

      pricingSummary = {
        currency: 'USD',
        itemsCount: totalQuantity,
        subtotalBeforeDiscount:
          this.roundPrice(usdSubtotalBeforeDiscount) ?? usdSubtotalBeforeDiscount,
        subtotal: this.roundPrice(usdSubtotal) ?? usdSubtotal,
        merchantDiscountAmount: this.roundPrice(usdMerchantDiscount) ?? usdMerchantDiscount,
        couponDiscount: this.roundPrice(usdCouponDiscount) ?? usdCouponDiscount,
        promotionDiscount: this.roundPrice(usdPromotionDiscount) ?? usdPromotionDiscount,
        autoDiscount: this.roundPrice(usdAutoDiscount) ?? usdAutoDiscount,
        totalDiscount: this.roundPrice(usdTotalDiscount) ?? usdTotalDiscount,
        total: this.roundPrice(usdTotal) ?? usdTotal,
      };

      const summaryCurrencies: Array<'USD' | 'YER' | 'SAR'> = ['USD', 'YER', 'SAR'];
      pricingSummaryByCurrency = {};

      for (const currencyCode of summaryCurrencies) {
        const totals = totalsInAllCurrencies[currencyCode];
        const ratio =
          currencyCode === 'USD' || usdSubtotal === 0
            ? currencyCode === 'USD'
              ? 1
              : undefined
            : totals.subtotal / usdSubtotal;

        const convertFromUSD = async (value: number): Promise<number> => {
          if (!value) return 0;
          if (currencyCode === 'USD') return value;
          if (ratio !== undefined && Number.isFinite(ratio)) {
            return value * ratio;
          }
          const conversion = await this.exchangeRatesService!.convertCurrency({
            amount: value,
            fromCurrency: 'USD',
            toCurrency: currencyCode,
          });
          return conversion.result;
        };

        const subtotalBeforeDiscountConverted = await convertFromUSD(usdSubtotalBeforeDiscount);
        const merchantDiscountConverted = await convertFromUSD(usdMerchantDiscount);
        const couponDiscountConverted = await convertFromUSD(usdCouponDiscount);
        const promotionDiscountConverted = await convertFromUSD(usdPromotionDiscount);
        const autoDiscountConverted = await convertFromUSD(usdAutoDiscount);
        const totalDiscountConverted = await convertFromUSD(usdTotalDiscount);
        const subtotalConverted =
          currencyCode === 'USD'
            ? pricingSummary.subtotal
            : this.roundPrice(totals.subtotal) ?? totals.subtotal;
        const totalConverted =
          currencyCode === 'USD'
            ? pricingSummary.total
            : this.roundPrice(totals.total) ?? totals.total;

        pricingSummaryByCurrency[currencyCode] = {
          currency: currencyCode,
          itemsCount: totalQuantity,
          subtotalBeforeDiscount:
            this.roundPrice(subtotalBeforeDiscountConverted) ?? subtotalBeforeDiscountConverted,
          subtotal: subtotalConverted,
          merchantDiscountAmount:
            this.roundPrice(merchantDiscountConverted) ?? merchantDiscountConverted,
          couponDiscount: this.roundPrice(couponDiscountConverted) ?? couponDiscountConverted,
          promotionDiscount:
            this.roundPrice(promotionDiscountConverted) ?? promotionDiscountConverted,
          autoDiscount: this.roundPrice(autoDiscountConverted) ?? autoDiscountConverted,
          totalDiscount: this.roundPrice(totalDiscountConverted) ?? totalDiscountConverted,
          total: totalConverted,
        };
      }
    } else {
      pricingSummary = {
        currency: normalizedCurrency,
        itemsCount: totalQuantity,
        subtotalBeforeDiscount: roundedSubtotalBeforeDiscount,
        subtotal: roundedSubtotal,
        merchantDiscountAmount: roundedMerchantDiscount,
        couponDiscount: storedCouponDiscount,
        promotionDiscount: storedPromotionDiscount,
        autoDiscount: storedAutoDiscount,
        totalDiscount:
          this.roundPrice(totalDiscountForConversion) ?? totalDiscountForConversion,
        total:
          this.roundPrice(Math.max(0, roundedSubtotal - additionalDiscounts)) ??
          Math.max(0, roundedSubtotal - additionalDiscounts),
      };
    }

    const effectiveCurrency = pricingSummary.currency;
    const effectiveSubtotalBeforeDiscount = pricingSummary.subtotalBeforeDiscount;
    const effectiveSubtotal = pricingSummary.subtotal;
    const effectiveMerchantDiscount = pricingSummary.merchantDiscountAmount;

    return {
      currency: effectiveCurrency,
      subtotal: effectiveSubtotal,
      subtotalBeforeDiscount: effectiveSubtotalBeforeDiscount,
      items: lines,
      appliedCoupons: uniqueAppliedCoupons,
      meta: {
        count: lines.length,
        quantity: totalQuantity,
        merchantDiscountPercent,
        merchantDiscountAmount: effectiveMerchantDiscount,
      },
      ...(totalsInAllCurrencies && { totalsInAllCurrencies }),
      ...(pricingSummaryByCurrency && { pricingSummaryByCurrency }),
      pricingSummary,
    };
  }

  async previewUser(
    userId: string,
    currency: string,
    accountType: 'any' | 'customer' | 'engineer' | 'merchant' = 'any',
  ) {
    const cart = await this.getOrCreateUserCart(userId);
    return this.previewByCart(cart, currency, accountType, userId);
  }

  async previewGuest(
    deviceId: string,
    currency: string,
    accountType: 'any' | 'customer' | 'engineer' | 'merchant' = 'any',
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

    const [rawCarts, total] = await Promise.all([
      this.cartModel
        .find(matchStage)
        .populate('userId', 'firstName lastName storeName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.cartModel.countDocuments(matchStage),
    ]);

    const carts = await Promise.all(
      rawCarts.map(async (cart) => {
        const userSummary = this.buildUserSummary(cart.userId);
        const enrichedCart = {
          ...cart,
          userId: userSummary?._id ?? this.toStringId(cart.userId) ?? cart.userId,
          ...(userSummary ? { user: userSummary } : {}),
        };

        try {
          const preview = await this.previewByCart(
            {
              ...(enrichedCart as unknown as Cart),
              items: (cart.items ?? []) as Cart['items'],
            },
            'USD',
            ((enrichedCart.accountType ?? 'any') as 'any' | 'customer' | 'engineer' | 'merchant') ||
              'any',
            userSummary?._id,
          );

          return {
            ...enrichedCart,
            pricingSummary: preview.pricingSummary,
            pricingSummaryByCurrency: preview.pricingSummaryByCurrency,
            totalsInAllCurrencies: preview.totalsInAllCurrencies,
            meta: preview.meta,
          };
        } catch {
          return enrichedCart;
        }
      }),
    );

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
      .populate('userId', 'firstName lastName storeName email phone')
      .populate('items.variantId')
      .lean();

    if (!cart) {
      throw new Error('Cart not found');
    }

    const userSummary = this.buildUserSummary(cart.userId);

    return {
      ...cart,
      userId: userSummary?._id ?? this.toStringId(cart.userId) ?? cart.userId,
      ...(userSummary ? { user: userSummary } : {}),
    };
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

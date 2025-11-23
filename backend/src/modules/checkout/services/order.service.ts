import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import {
  OrderNotFoundException,
  OrderPreviewFailedException,
  OrderCannotCancelException,
  OrderNotReadyToShipException,
  OrderRatingNotAllowedException,
  OrderException,
  OrderPdfGenerationFailedException,
  OrderExcelGenerationFailedException,
  AddressNotFoundException,
  ErrorCode,
  DomainException,
} from '../../../shared/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from '../../users/schemas/user.schema';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as XLSX from 'xlsx';
import {
  Order,
  OrderDocument,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '../schemas/order.schema';
import { OrderStateMachine } from '../utils/order-state-machine';
import { Inventory } from '../schemas/inventory.schema';
import { Reservation } from '../schemas/reservation.schema';
import { InventoryLedger } from '../schemas/inventory-ledger.schema';
import { Cart, CartStatus } from '../../cart/schemas/cart.schema';
import { CartService } from '../../cart/cart.service';
import { MarketingService } from '../../marketing/marketing.service';
import { AddressesService } from '../../addresses/addresses.service';
import { LocalPaymentAccountService } from '../../system-settings/services/local-payment-account.service';
import { ExchangeRatesService } from '../../exchange-rates/exchange-rates.service';
import { InventoryService as ProductsInventoryService } from '../../products/services/inventory.service';
import { VariantService } from '../../products/services/variant.service';
import { ProductService } from '../../products/services/product.service';
import { NotificationService } from '../../notifications/services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../../notifications/enums/notification.enums';
import { AuditService } from '../../../shared/services/audit.service';
import { EmailAdapter } from '../../notifications/adapters/email.adapter';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  CancelOrderDto,
  ShipOrderDto,
  RefundOrderDto,
  RateOrderDto,
  ListOrdersDto,
  ListRatingsDto,
  OrderAnalyticsDto,
  AddOrderNotesDto,
  VerifyPaymentDto,
  CheckoutPaymentOptionsResponseDto,
  CheckoutPaymentOptionStatusDto,
  CheckoutCODEligibilityDto,
  CheckoutCustomerOrderStatsDto,
  CheckoutLocalPaymentProviderDto,
  CheckoutLocalPaymentAccountDto,
  CheckoutProviderIconDto,
  CheckoutSessionResponseDto,
  CheckoutPreviewDto,
} from '../dto/order.dto';

interface CartLine {
  itemId: string;
  variantId?: string;
  productId?: string;
  qty: number;
  unit: { base: number; final: number; currency: string; appliedRule: unknown };
  lineTotal: number;
  snapshot?: Record<string, unknown>;
}

interface UserOrderCounters {
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  cancelledOrders: number;
}

type CartPreviewResult = Awaited<ReturnType<CartService['previewUser']>>;
type CouponValidationResult = Awaited<ReturnType<MarketingService['validateCoupon']>>;

interface InventoryReservationTarget {
  variantId?: string;
  productId?: string;
  qty: number;
}

export interface CODEligibilityResult extends UserOrderCounters {
  eligible: boolean;
  requiredOrders: number;
  remainingOrders: number;
  progress: string;
  message?: string;
  isAdmin?: boolean;
}

/**
 * خدمة الطلبات الموحدة - نظام احترافي شامل
 */
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private reservationTtlSec = Number(process.env.RESERVATION_TTL_SECONDS || 900);
  private paymentSigningKey = process.env.PAYMENT_SIGNING_KEY || 'dev_signing_key';
  private readonly checkoutPreviewCache = new Map<
    string,
    { expiresAt: number; data: CartPreviewResult }
  >();
  private readonly checkoutPreviewTtlMs = 60_000;
  private readonly couponValidationCache = new Map<
    string,
    { expiresAt: number; data: CouponValidationResult }
  >();
  private readonly couponValidationTtlMs = 60_000;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    @InjectModel(InventoryLedger.name) private ledgerModel: Model<InventoryLedger>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private cartService: CartService,
    private marketingService: MarketingService,
    private addressesService: AddressesService,
    private localPaymentAccountService: LocalPaymentAccountService,
    private exchangeRatesService: ExchangeRatesService,
    @Inject(forwardRef(() => ProductsInventoryService))
    private productsInventoryService: ProductsInventoryService,
    @Inject(forwardRef(() => VariantService))
    private variantService: VariantService,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    @Inject(forwardRef(() => NotificationService))
    private notificationService?: NotificationService,
    private auditService?: AuditService,
    @Inject(forwardRef(() => EmailAdapter))
    private emailAdapter?: EmailAdapter,
    private configService?: ConfigService,
  ) {}

  // ===== Helper Methods =====

  private hmac(payload: string): string {
    return crypto.createHmac('sha256', this.paymentSigningKey).update(payload).digest('hex');
  }

  private normalizeCurrency(currency?: string): string {
    if (!currency) return 'USD';
    return currency.toUpperCase();
  }

  private buildPreviewCacheKey(userId: string, currency: string): string {
    return `${userId}:${this.normalizeCurrency(currency)}`;
  }

  // ===== Notification Helpers =====

  private async safeNotify(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    messageEn: string,
    data?: Record<string, unknown>,
  ) {
    try {
      if (this.notificationService) {
        await this.notificationService.createNotification({
          recipientId: userId,
          type,
          title,
          message,
          messageEn,
          data,
          channel: NotificationChannel.IN_APP,
          priority: NotificationPriority.MEDIUM,
        });
      }
    } catch (error) {
      this.logger.warn(`Notification failed for user ${userId}:`, error);
    }
  }

  private async notifyAdmins(
    type: NotificationType,
    title: string,
    message: string,
    messageEn: string,
    data?: Record<string, unknown>,
  ) {
    try {
      if (!this.notificationService) return;

      const admins = await this.userModel
        .find({
          roles: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
          status: 'ACTIVE',
        })
        .select('_id')
        .lean();

      const notificationPromises = admins.map((admin) =>
        this.notificationService!.createNotification({
          recipientId: admin._id.toString(),
          type,
          title,
          message,
          messageEn,
          data,
          channel: NotificationChannel.IN_APP,
          priority: NotificationPriority.HIGH,
        }),
      );

      await Promise.all(notificationPromises);
      this.logger.log(`Sent ${type} notification to ${admins.length} admin(s)`);
    } catch (error) {
      this.logger.warn(`Failed to notify admins:`, error);
    }
  }

  invalidateCheckoutPreviewCache(userId: string, currency?: string): void {
    if (currency) {
      const key = this.buildPreviewCacheKey(userId, currency);
      this.checkoutPreviewCache.delete(key);
    } else {
      // إبطال جميع الـ cache entries لهذا المستخدم (لجميع العملات)
      const keysToDelete: string[] = [];
      for (const key of this.checkoutPreviewCache.keys()) {
        if (key.startsWith(`${userId}:`)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach((key) => this.checkoutPreviewCache.delete(key));
    }
  }

  private async getCartPreviewWithCache(
    userId: string,
    currency: string,
  ): Promise<CartPreviewResult> {
    const key = this.buildPreviewCacheKey(userId, currency);
    const now = Date.now();
    const cached = this.checkoutPreviewCache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const preview = await this.cartService.previewUser(userId, currency, 'any');
    this.checkoutPreviewCache.set(key, {
      data: preview,
      expiresAt: now + this.checkoutPreviewTtlMs,
    });

    return preview;
  }

  private buildCouponCacheKey(
    userId: string,
    code: string,
    orderAmount: number,
    productIds: string[],
  ): string {
    const normalizedProducts = [...productIds].sort().join(',');
    const normalizedAmount = orderAmount.toFixed(2);
    return `${userId}:${code}:${normalizedAmount}:${normalizedProducts}`;
  }

  private async validateCouponWithCache(params: {
    code: string;
    userId: string;
    orderAmount: number;
    productIds: string[];
  }): Promise<CouponValidationResult> {
    const key = this.buildCouponCacheKey(
      params.userId,
      params.code,
      params.orderAmount,
      params.productIds,
    );
    const now = Date.now();
    const cached = this.couponValidationCache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const result = await this.marketingService.validateCoupon({
      code: params.code,
      userId: params.userId,
      orderAmount: params.orderAmount,
      productIds: params.productIds,
    });

    this.couponValidationCache.set(key, {
      data: result,
      expiresAt: now + this.couponValidationTtlMs,
    });

    return result;
  }

  private combineCouponCodes(
    preview: CartPreviewResult,
    couponCode?: string,
    couponCodes?: string[],
  ): string[] {
    const combined = new Set<string>();
    if (couponCode && couponCode.trim()) {
      combined.add(couponCode.trim());
    }
    if (Array.isArray(couponCodes)) {
      couponCodes
        .filter((code): code is string => typeof code === 'string' && code.trim().length > 0)
        .forEach((code) => combined.add(code.trim()));
    }
    return Array.from(combined);
  }

  private async prioritizeCouponCodes(params: {
    codes: string[];
    userId: string;
    orderAmount: number;
    productIds: string[];
  }): Promise<string[]> {
    // جلب جميع التحققات في batch واحد بدلاً من loop متسلسل
    const validations = await Promise.all(
      params.codes.map((code) =>
        code
          ? this.validateCouponWithCache({
              code,
              userId: params.userId,
              orderAmount: params.orderAmount,
              productIds: params.productIds,
            }).catch(() => null)
          : Promise.resolve(null),
      ),
    );

    const fixed: string[] = [];
    const percentage: string[] = [];
    const others: string[] = [];

    validations.forEach((validation, index) => {
      if (!validation) {
        const code = params.codes[index];
        if (code) others.push(code);
        return;
      }

      const code = params.codes[index];
      if (!code) return;

      const type = validation.coupon?.type;
      if (type === 'fixed_amount') {
        fixed.push(code);
      } else if (type === 'percentage') {
        percentage.push(code);
      } else {
        others.push(code);
      }
    });

    const ordered = [...fixed, ...percentage, ...others];
    const uniqueOrdered: string[] = [];
    const seen = new Set<string>();

    for (const code of ordered) {
      if (!seen.has(code)) {
        seen.add(code);
        uniqueOrdered.push(code);
      }
    }

    return uniqueOrdered;
  }

  private async buildCheckoutComputation(params: {
    userId: string;
    currency: string;
    preview: CartPreviewResult;
    couponCode?: string;
    couponCodes?: string[];
    codEligibility?: CODEligibilityResult;
  }): Promise<{
    preview: CartPreviewResult;
    subtotal: number;
    shipping: number;
    total: number;
    discounts: {
      itemsDiscount: number;
      couponDiscount: number;
      totalDiscount: number;
      appliedCoupons: Array<{
        code: string;
        name: string;
        discountValue: number;
        type: string;
        discount: number;
      }>;
    };
    codEligibility: CODEligibilityResult;
    customerOrderStats: CheckoutCustomerOrderStatsDto;
  }> {
    const normalizedCurrency = this.normalizeCurrency(params.currency);
    const summaryMap = params.preview.pricingSummaryByCurrency ?? {};
    const summary =
      summaryMap[normalizedCurrency] ?? summaryMap['USD'] ?? Object.values(summaryMap)[0];

    const subtotalFromSummary =
      typeof summary?.subtotal === 'number'
        ? summary.subtotal
        : params.preview.items.reduce((sum: number, item: Partial<CartLine>) => {
            const unitFinal =
              typeof item.unit?.final === 'number'
                ? item.unit.final
                : typeof (item as { unit?: { finalBeforeDiscount?: number } }).unit
                      ?.finalBeforeDiscount === 'number'
                  ? (item as { unit?: { finalBeforeDiscount?: number } }).unit!.finalBeforeDiscount!
                  : 0;
            const qty = typeof item.qty === 'number' ? item.qty : 0;
            return sum + unitFinal * qty;
          }, 0);

    const couponCodes = this.combineCouponCodes(
      params.preview,
      params.couponCode,
      params.couponCodes,
    );

    const roundForCurrency = (amount: number, currencyCode: string): number => {
      if (!Number.isFinite(amount)) {
        return amount;
      }
      const normalized = this.normalizeCurrency(currencyCode);
      if (normalized === 'YER') {
        return Math.round(amount);
      }
      return Math.round(amount * 100) / 100;
    };

    const sanitizedItems = Array.isArray(params.preview.items)
      ? params.preview.items.map((item: Partial<CartLine>) => {
          if (!item || typeof item !== 'object') {
            return item;
          }

          const clonedItem: Partial<CartLine> & Record<string, unknown> = { ...item };
          const pricingValue = (clonedItem as unknown as { pricing?: unknown }).pricing;

          if (pricingValue && typeof pricingValue === 'object') {
            const pricingRecord = { ...(pricingValue as Record<string, unknown>) };
            const currencies = pricingRecord['currencies'];
            if (currencies && typeof currencies === 'object') {
              const currencyMap = currencies as Record<string, unknown>;
              const selected =
                currencyMap[normalizedCurrency] ??
                currencyMap[normalizedCurrency.toUpperCase()] ??
                currencyMap[normalizedCurrency.toLowerCase()];

              delete pricingRecord['currencies'];
              pricingRecord['currency'] = normalizedCurrency;

              if (selected && typeof selected === 'object') {
                Object.entries(selected as Record<string, unknown>).forEach(([key, value]) => {
                  pricingRecord[key] = value;
                });
              }
            }

            clonedItem['pricing'] = pricingRecord;
          }

          return clonedItem;
        })
      : params.preview.items;

    const previewWithSanitizedItems = {
      ...(params.preview as Record<string, unknown>),
      items: sanitizedItems,
    } as CartPreviewResult;

    let totalCouponDiscount = 0;
    let remainingSubtotal = subtotalFromSummary;
    const appliedCoupons: Array<{
      code: string;
      name: string;
      discountValue: number;
      type: string;
      discount: number;
    }> = [];

    const productIds = params.preview.items
      .map((item: Partial<CartLine>) => item.productId || item.variantId)
      .filter((id): id is string => typeof id === 'string' && id.trim().length > 0);

    // جلب التحققات مرة واحدة فقط مع prioritizeCouponCodes
    const prioritizedCouponCodes = await this.prioritizeCouponCodes({
      codes: couponCodes,
      userId: params.userId,
      orderAmount: subtotalFromSummary,
      productIds,
    });

    // جلب جميع التحققات للكوبونات المُرتبة في batch واحد
    // ملاحظة: نستخدم remainingSubtotal الأولي للتحقق، ثم نحدثه أثناء التطبيق
    const initialValidations = await Promise.all(
      prioritizedCouponCodes.map((code) =>
        code
          ? this.validateCouponWithCache({
              code,
              userId: params.userId,
              orderAmount: subtotalFromSummary,
              productIds,
            }).catch(() => null)
          : Promise.resolve(null),
      ),
    );

    // تطبيق الكوبونات باستخدام النتائج المحفوظة
    for (let i = 0; i < prioritizedCouponCodes.length; i++) {
      const code = prioritizedCouponCodes[i];
      if (!code) continue;

      const validation = initialValidations[i];
      if (!validation || !validation.valid || !validation.coupon) {
        this.logger.warn(`Invalid coupon: ${code} - ${validation?.message || 'Unknown error'}`);

        // تسجيل فشل تطبيق الكوبون في audit
        if (this.auditService && params.userId) {
          this.auditService
            .logCouponEvent({
              userId: params.userId,
              couponCode: code,
              action: 'application_failed',
              failureReason: validation?.message || 'Unknown error',
            })
            .catch((err) => this.logger.error('Failed to log coupon application failure', err));
        }

        continue;
      }

      try {
        let couponDiscount = 0;
        const coupon = validation.coupon;
        if (coupon.type === 'percentage' && coupon.discountValue) {
          couponDiscount = (remainingSubtotal * coupon.discountValue) / 100;
          if (coupon.maximumDiscountAmount) {
            couponDiscount = Math.min(couponDiscount, coupon.maximumDiscountAmount);
          }
        } else if (coupon.type === 'fixed_amount' && coupon.discountValue) {
          couponDiscount = coupon.discountValue;
        }

        couponDiscount = Math.min(couponDiscount, remainingSubtotal);

        if (couponDiscount > 0) {
          totalCouponDiscount += couponDiscount;
          remainingSubtotal = Math.max(0, remainingSubtotal - couponDiscount);
        }

        appliedCoupons.push({
          code,
          name: coupon.name,
          discountValue: coupon.discountValue || 0,
          type: coupon.type,
          discount: couponDiscount,
        });

        this.logger.debug(`Applied coupon ${code} with discount ${couponDiscount}`);

        // تسجيل تطبيق الكوبون في audit
        if (this.auditService && params.userId) {
          this.auditService
            .logCouponEvent({
              userId: params.userId,
              couponCode: code,
              action: 'applied',
              discountAmount: couponDiscount,
            })
            .catch((err) => this.logger.error('Failed to log coupon application', err));
        }
      } catch (error) {
        this.logger.error(`Error applying coupon ${code}`, error as Error);
      }
    }

    const itemsDiscount = params.preview.items.reduce((sum: number, item: Partial<CartLine>) => {
      const unitBase = typeof item.unit?.base === 'number' ? item.unit.base : 0;
      const unitFinal = typeof item.unit?.final === 'number' ? item.unit.final : unitBase;
      const qty = typeof item.qty === 'number' ? item.qty : 0;
      return sum + Math.max(0, unitBase - unitFinal) * qty;
    }, 0);

    const shipping = 0;
    const total = Math.max(0, subtotalFromSummary - totalCouponDiscount) + shipping;
    const totalDiscount = itemsDiscount + totalCouponDiscount;

    const codEligibility = params.codEligibility ?? (await this.checkCODEligibility(params.userId));

    const customerOrderStats: CheckoutCustomerOrderStatsDto = {
      totalOrders: codEligibility.totalOrders,
      completedOrders: codEligibility.completedOrders,
      inProgressOrders: codEligibility.inProgressOrders,
      cancelledOrders: codEligibility.cancelledOrders,
      requiredForCOD: codEligibility.requiredOrders,
      remainingForCOD: codEligibility.remainingOrders,
      codEligible: codEligibility.eligible,
    };

    type PricingSummaryView =
      CartPreviewResult['pricingSummaryByCurrency'] extends Record<string, infer T>
        ? NonNullable<T>
        : Record<string, unknown>;

    const itemsCount = Array.isArray(sanitizedItems)
      ? sanitizedItems.length
      : params.preview.items.length;

    const currenciesSet = new Set<string>();
    currenciesSet.add(normalizedCurrency);

    if (this.exchangeRatesService) {
      const baseCurrencies = ['USD', 'YER', 'SAR'];
      baseCurrencies.forEach((code) => currenciesSet.add(this.normalizeCurrency(code)));
    }

    const previewSummaryMap = params.preview.pricingSummaryByCurrency;
    if (previewSummaryMap) {
      Object.keys(previewSummaryMap).forEach((code) =>
        currenciesSet.add(this.normalizeCurrency(code)),
      );
    }

    const previewTotalsMap = (params.preview as Record<string, unknown>).totalsInAllCurrencies as
      | Record<string, unknown>
      | undefined;
    if (previewTotalsMap) {
      Object.keys(previewTotalsMap).forEach((code) =>
        currenciesSet.add(this.normalizeCurrency(code)),
      );
    }

    const baseTotals = {
      subtotal: roundForCurrency(subtotalFromSummary, normalizedCurrency),
      totalDiscount: roundForCurrency(totalDiscount, normalizedCurrency),
      total: roundForCurrency(total, normalizedCurrency),
    };

    const convertAmount = async (amount: number, targetCurrency: string): Promise<number> => {
      const normalizedTarget = this.normalizeCurrency(targetCurrency);
      if (normalizedTarget === normalizedCurrency) {
        return roundForCurrency(amount, normalizedTarget);
      }
      if (!this.exchangeRatesService) {
        return roundForCurrency(amount, normalizedTarget);
      }
      const conversion = await this.exchangeRatesService.convertCurrency({
        amount,
        fromCurrency: normalizedCurrency,
        toCurrency: normalizedTarget,
      });
      return roundForCurrency(conversion.result, normalizedTarget);
    };

    const toCurrencyTotals = async (
      currencyCode: string,
    ): Promise<{ subtotal: number; totalDiscount: number; total: number }> => {
      const normalizedCode = this.normalizeCurrency(currencyCode);
      const subtotalConverted = await convertAmount(baseTotals.subtotal, normalizedCode);
      const totalDiscountConverted =
        totalDiscount > 0 ? await convertAmount(totalDiscount, normalizedCode) : 0;
      const totalConverted = roundForCurrency(
        Math.max(0, subtotalConverted - totalDiscountConverted),
        normalizedCode,
      );
      return {
        subtotal: subtotalConverted,
        totalDiscount: totalDiscountConverted,
        total: totalConverted,
      };
    };

    const totalsEntries = await Promise.all(
      Array.from(currenciesSet).map(async (currencyCode) => {
        const totalsForCurrency = await toCurrencyTotals(currencyCode);
        return [this.normalizeCurrency(currencyCode), totalsForCurrency] as const;
      }),
    );

    const totalsByCurrency: Record<
      string,
      { subtotal: number; totalDiscount: number; total: number }
    > = Object.fromEntries(totalsEntries);

    const normalizedBaseTotals = totalsByCurrency[normalizedCurrency] ?? {
      subtotal: baseTotals.subtotal,
      totalDiscount: baseTotals.totalDiscount,
      total: baseTotals.total,
    };

    const summaryEntries = await Promise.all(
      Object.entries(totalsByCurrency).map(async ([currencyCode, totalsForCurrency]) => {
        const subtotalConverted = totalsForCurrency.subtotal;
        const totalDiscountConverted = totalsForCurrency.totalDiscount;
        const totalConverted = totalsForCurrency.total;

        const couponDiscountConverted =
          totalDiscount > 0
            ? roundForCurrency(
                (totalCouponDiscount / totalDiscount) * totalDiscountConverted,
                currencyCode,
              )
            : 0;
        const subtotalBeforeDiscountConverted = roundForCurrency(
          subtotalConverted + totalDiscountConverted,
          currencyCode,
        );

        const summary: PricingSummaryView = {
          currency: currencyCode,
          itemsCount,
          subtotalBeforeDiscount: subtotalBeforeDiscountConverted,
          subtotal: subtotalConverted,
          merchantDiscountAmount: 0,
          couponDiscount: couponDiscountConverted,
          promotionDiscount: 0,
          autoDiscount: 0,
          totalDiscount: totalDiscountConverted,
          total: totalConverted,
        } as PricingSummaryView;

        return [currencyCode, summary] as const;
      }),
    );

    const summaryByCurrency: Record<string, PricingSummaryView> =
      Object.fromEntries(summaryEntries);

    const previewRecord = previewWithSanitizedItems as Record<string, unknown>;
    previewRecord.pricingSummaryByCurrency = summaryByCurrency;
    previewRecord.pricingSummary = summaryByCurrency[normalizedCurrency];
    previewRecord.totals = {
      subtotal: normalizedBaseTotals.subtotal,
      shipping,
      total: normalizedBaseTotals.total,
      currency: normalizedCurrency,
    };
    previewRecord.totalsInAllCurrencies = Object.fromEntries(
      Object.entries(totalsByCurrency).map(([currencyCode, totalsForCurrency]) => [
        currencyCode,
        {
          subtotal: totalsForCurrency.subtotal,
          shippingCost: 0,
          tax: 0,
          totalDiscount: totalsForCurrency.totalDiscount,
          total: totalsForCurrency.total,
        },
      ]),
    );

    return {
      preview: previewWithSanitizedItems,
      subtotal: subtotalFromSummary,
      shipping,
      total,
      discounts: {
        itemsDiscount,
        couponDiscount: totalCouponDiscount,
        totalDiscount,
        appliedCoupons,
      },
      codEligibility,
      customerOrderStats,
    };
  }

  private async getUsersMap(userIds: Types.ObjectId[]): Promise<
    Map<
      string,
      {
        name: string;
        fullName: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
      }
    >
  > {
    const users = await this.userModel
      .find({ _id: { $in: userIds } }, { _id: 1, firstName: 1, lastName: 1, phone: 1 })
      .lean();

    const usersMap = new Map<
      string,
      {
        name: string;
        fullName: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
      }
    >();
    users.forEach((user) => {
      const firstName = user.firstName?.trim() || undefined;
      const lastName = user.lastName?.trim() || undefined;
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || user.phone || 'غير محدد';
      usersMap.set(user._id.toString(), {
        name: fullName,
        fullName,
        firstName,
        lastName,
        phone: user.phone || undefined,
      });
    });

    return usersMap;
  }

  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `ORD-${year}-${timestamp}`;
  }

  private async calculateUserOrderCounters(userId: string): Promise<UserOrderCounters> {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return {
        totalOrders: 0,
        completedOrders: 0,
        inProgressOrders: 0,
        cancelledOrders: 0,
      };
    }

    const userObjectId = new Types.ObjectId(userId);

    const [result] = await this.orderModel.aggregate<{
      totalOrders: number;
      completedOrders: number;
      inProgressOrders: number;
      cancelledOrders: number;
    }>([
      {
        $match: {
          userId: userObjectId,
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', OrderStatus.COMPLETED] }, 1, 0],
            },
          },
          inProgressOrders: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    [OrderStatus.PENDING_PAYMENT, OrderStatus.CONFIRMED, OrderStatus.PROCESSING],
                  ],
                },
                1,
                0,
              ],
            },
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', OrderStatus.CANCELLED] }, 1, 0],
            },
          },
        },
      },
    ]);

    return {
      totalOrders: result?.totalOrders ?? 0,
      completedOrders: result?.completedOrders ?? 0,
      inProgressOrders: result?.inProgressOrders ?? 0,
      cancelledOrders: result?.cancelledOrders ?? 0,
    };
  }

  private async addStatusHistory(
    order: OrderDocument,
    status: OrderStatus,
    changedBy: Types.ObjectId,
    changedByRole: 'customer' | 'admin' | 'system',
    notes?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy,
      changedByRole,
      notes,
      metadata,
    });
  }

  private normalizeObjectId(ref: unknown): string | undefined {
    if (!ref) {
      return undefined;
    }

    if (typeof ref === 'string') {
      return ref;
    }

    if (typeof ref === 'object' && ref !== null) {
      const maybeObjectId = ref as Types.ObjectId;
      if (typeof maybeObjectId.toString === 'function') {
        return maybeObjectId.toString();
      }
    }

    return undefined;
  }

  private buildInventoryFilter(target: {
    variantId?: string;
    productId?: string;
  }): Record<string, unknown> {
    if (target.variantId) {
      return { variantId: new Types.ObjectId(target.variantId) };
    }

    if (target.productId) {
      return { productId: new Types.ObjectId(target.productId) };
    }

    throw new DomainException(ErrorCode.VALIDATION_ERROR, {
      reason: 'inventory_target_missing',
    });
  }

  private getInventoryTargets(order: OrderDocument): InventoryReservationTarget[] {
    if (!order || !Array.isArray(order.items)) {
      return [];
    }

    const map = new Map<string, InventoryReservationTarget>();

    order.items.forEach((item) => {
      const variantId = this.normalizeObjectId(item.variantId);
      const productId = this.normalizeObjectId(item.productId);
      const qty = Number(item.qty ?? 0);

      if ((!variantId && !productId) || !Number.isFinite(qty) || qty <= 0) {
        return;
      }

      const key = variantId ? `variant:${variantId}` : `product:${productId}`;
      const existing = map.get(key);

      if (existing) {
        existing.qty += qty;
      } else {
        map.set(key, {
          variantId,
          productId: variantId ? undefined : productId,
          qty,
        });
      }
    });

    return Array.from(map.values());
  }

  private async ensureInventoryRecord(
    target: { variantId?: string; productId?: string },
    params: { onHand?: number; safetyStock?: number } = {},
  ): Promise<void> {
    // البحث أولاً بـ ObjectId
    const filter = this.buildInventoryFilter(target);
    let existing = await this.inventoryModel.findOne(filter).lean();

    // إذا لم يجد بـ ObjectId، جرب البحث بـ string
    if (!existing) {
      const stringFilter: Record<string, unknown> = {};
      if (target.variantId) {
        stringFilter.variantId = target.variantId;
      } else if (target.productId) {
        stringFilter.productId = target.productId;
      }
      existing = await this.inventoryModel.findOne(stringFilter).lean();

      // إذا وجد بـ string، حوله إلى ObjectId
      if (existing) {
        this.logger.debug(
          `Found inventory record with string filter, converting to ObjectId: ${JSON.stringify(stringFilter)}`,
        );
        const updates: Record<string, unknown> = {};
        if (target.variantId && typeof existing.variantId === 'string') {
          updates.variantId = new Types.ObjectId(existing.variantId);
        } else if (target.productId && typeof existing.productId === 'string') {
          updates.productId = new Types.ObjectId(existing.productId);
        }

        // تحديث on_hand إذا لزم الأمر
        if (
          typeof params.onHand === 'number' &&
          Number.isFinite(params.onHand) &&
          params.onHand >= 0 &&
          (typeof existing.on_hand !== 'number' || existing.on_hand < params.onHand)
        ) {
          updates.on_hand = params.onHand;
        }

        if (Object.keys(updates).length > 0) {
          await this.inventoryModel.updateOne(stringFilter, { $set: updates });
        }
        return;
      }
    }

    if (existing) {
      const updates: Record<string, unknown> = {};

      // تحديث on_hand إذا كانت القيمة المطلوبة أكبر من القيمة الحالية
      if (
        typeof params.onHand === 'number' &&
        Number.isFinite(params.onHand) &&
        params.onHand >= 0 &&
        (typeof existing.on_hand !== 'number' || existing.on_hand < params.onHand)
      ) {
        updates.on_hand = params.onHand;
      }

      if (
        typeof params.safetyStock === 'number' &&
        Number.isFinite(params.safetyStock) &&
        params.safetyStock >= 0 &&
        existing.safety_stock !== params.safetyStock
      ) {
        updates.safety_stock = params.safetyStock;
      }

      if (Object.keys(updates).length > 0) {
        await this.inventoryModel.updateOne(filter, { $set: updates });
      }
      return;
    }

    const onHand =
      typeof params.onHand === 'number' && Number.isFinite(params.onHand)
        ? Math.max(0, Math.round(params.onHand))
        : 0;
    const safetyStock =
      typeof params.safetyStock === 'number' && Number.isFinite(params.safetyStock)
        ? Math.max(0, Math.round(params.safetyStock))
        : 0;

    try {
      const created = await this.inventoryModel.create({
        ...filter,
        on_hand: onHand,
        reserved: 0,
        safety_stock: safetyStock,
      });
      this.logger.debug(
        `Created inventory record: ${JSON.stringify(filter)}, on_hand=${onHand}, safety_stock=${safetyStock}, id=${created._id}`,
      );
    } catch (error) {
      const mongoError = error as { code?: number };
      if (mongoError?.code === 11000) {
        // Record already exists (duplicate key) - السجل موجود، نعتبر العملية ناجحة
        this.logger.debug(
          `Inventory record already exists (duplicate key): ${JSON.stringify(filter)} - proceeding without verification`,
        );
        return;
      }
      this.logger.error(
        `Failed to create inventory record: ${JSON.stringify(filter)}`,
        error as Error,
      );
      throw error;
    }
  }

  private async rollbackInventoryReservations(
    orderId: string,
    entries: Array<{
      variantId?: string;
      productId?: string;
      qty: number;
      reservationId?: string;
      ledgerId?: string;
    }>,
  ): Promise<void> {
    if (!entries || entries.length === 0) {
      return;
    }

    // Rollback in reverse order to mitigate dependency issues
    for (const entry of [...entries].reverse()) {
      const filter = this.buildInventoryFilter({
        variantId: entry.variantId,
        productId: entry.productId,
      });

      try {
        await this.inventoryModel.updateOne(filter, {
          $inc: { on_hand: entry.qty, reserved: -entry.qty },
        });
      } catch (error) {
        this.logger.error(
          `Failed to rollback inventory counts for target ${JSON.stringify(filter)} (order ${orderId})`,
          error as Error,
        );
      }

      try {
        if (entry.variantId) {
          await this.productsInventoryService.updateStock(entry.variantId, entry.qty, 'add');
        } else if (entry.productId) {
          await this.productsInventoryService.updateProductStock(entry.productId, entry.qty, 'add');
        }
      } catch (error) {
        this.logger.error(
          `Failed to rollback stock for target ${JSON.stringify(filter)} (order ${orderId})`,
          error as Error,
        );
      }

      if (entry.reservationId) {
        await this.reservationModel.deleteOne({ _id: entry.reservationId });
      }

      if (entry.ledgerId) {
        await this.ledgerModel.deleteOne({ _id: entry.ledgerId });
      }
    }
  }

  private async reserveOrderInventory(order: OrderDocument): Promise<void> {
    const orderId = order?._id ? order._id.toString() : undefined;
    if (!orderId) {
      return;
    }

    const existingReservations = await this.reservationModel.countDocuments({
      orderId,
      status: { $in: ['ACTIVE', 'COMMITTED'] },
    });

    if (existingReservations > 0) {
      this.logger.debug(
        `Reservations already exist for order ${orderId}. Skipping duplicate reservation creation.`,
      );
      return;
    }

    const targets = this.getInventoryTargets(order);
    if (targets.length === 0) {
      this.logger.debug(
        `Order ${orderId} does not contain items that require inventory reservation.`,
      );
      return;
    }

    const expirationDate = new Date(Date.now() + this.reservationTtlSec * 1000);
    const successful: Array<{
      variantId?: string;
      productId?: string;
      qty: number;
      reservationId?: string;
      ledgerId?: string;
    }> = [];

    for (const target of targets) {
      const { variantId, productId, qty } = target;
      let inventoryAdjusted = false;
      let stockAdjusted = false;
      let reservationId: string | undefined;
      let ledgerId: string | undefined;

      try {
        let availability:
          | Awaited<ReturnType<typeof this.productsInventoryService.checkAvailability>>
          | Awaited<ReturnType<typeof this.productsInventoryService.checkProductAvailability>>;
        let initialOnHand = 0;
        let safetyStock: number | undefined;

        if (variantId) {
          const variantDetails = await this.variantService.findById(variantId);
          if (!variantDetails.trackInventory) {
            this.logger.debug(
              `Variant ${variantId} does not track inventory. Reservation skipped for order ${orderId}.`,
            );
            continue;
          }

          availability = await this.productsInventoryService.checkAvailability(variantId, qty);

          if (!availability.available && !availability.canBackorder) {
            throw new DomainException(ErrorCode.VALIDATION_ERROR, {
              reason: 'insufficient_stock',
              variantId,
              requestedQty: qty,
              availableStock: availability.availableStock ?? 0,
            });
          }

          initialOnHand =
            typeof availability.availableStock === 'number'
              ? availability.availableStock
              : typeof variantDetails.stock === 'number'
                ? variantDetails.stock
                : 0;

          safetyStock =
            typeof variantDetails.minStock === 'number' && Number.isFinite(variantDetails.minStock)
              ? variantDetails.minStock
              : undefined;
        } else if (productId) {
          const productDetails = await this.productService.findById(productId);
          if (!productDetails.trackStock) {
            this.logger.debug(
              `Product ${productId} does not track stock. Reservation skipped for order ${orderId}.`,
            );
            continue;
          }

          availability = await this.productsInventoryService.checkProductAvailability(
            productId,
            qty,
          );

          if (!availability.available && !availability.canBackorder) {
            throw new DomainException(ErrorCode.VALIDATION_ERROR, {
              reason: 'insufficient_stock',
              productId,
              requestedQty: qty,
              availableStock: availability.availableStock ?? 0,
            });
          }

          initialOnHand =
            typeof availability.availableStock === 'number'
              ? availability.availableStock
              : typeof productDetails.stock === 'number'
                ? productDetails.stock
                : 0;

          safetyStock =
            typeof productDetails.minStock === 'number' && Number.isFinite(productDetails.minStock)
              ? productDetails.minStock
              : undefined;
        } else {
          throw new DomainException(ErrorCode.VALIDATION_ERROR, {
            reason: 'inventory_target_missing',
          });
        }

        await this.ensureInventoryRecord(
          { variantId, productId },
          { onHand: initialOnHand, safetyStock },
        );

        const inventoryFilter = this.buildInventoryFilter({ variantId, productId });
        if (!availability.canBackorder) {
          inventoryFilter.on_hand = { $gte: qty };
        }

        let inventoryDoc = await this.inventoryModel.findOneAndUpdate(
          inventoryFilter,
          { $inc: { on_hand: -qty, reserved: qty } },
          { new: true },
        );

        // إذا لم يجد بـ ObjectId، جرب البحث بـ string
        if (!inventoryDoc) {
          const stringFilter: Record<string, unknown> = {};
          if (variantId) {
            stringFilter.variantId = variantId;
          } else if (productId) {
            stringFilter.productId = productId;
          }
          if (!availability.canBackorder) {
            stringFilter.on_hand = { $gte: qty };
          }
          inventoryDoc = await this.inventoryModel.findOneAndUpdate(
            stringFilter,
            { $inc: { on_hand: -qty, reserved: qty } },
            { new: true },
          );
        }

        // إذا لم يجد السجل بعد ensureInventoryRecord، نعتبر أن السجل موجود (duplicate key)
        // ونكمل العملية بدون تحديث inventory collection
        if (!inventoryDoc) {
          this.logger.warn(
            `Inventory record not found after ensureInventoryRecord for order ${orderId}. Filter: ${JSON.stringify(inventoryFilter)}. Proceeding without inventory update (record exists but may be in different format).`,
          );
          // نعتبر أن السجل موجود ونكمل العملية
          inventoryAdjusted = false; // لم نحدث inventory collection
        } else {
          inventoryAdjusted = true;
        }

        if (variantId) {
          const stockUpdate = await this.productsInventoryService.updateStock(
            variantId,
            qty,
            'subtract',
          );
          if (!stockUpdate?.success) {
            throw new DomainException(ErrorCode.VALIDATION_ERROR, {
              reason: 'variant_stock_update_failed',
              variantId,
              requestedQty: qty,
            });
          }
        } else if (productId) {
          const stockUpdate = await this.productsInventoryService.updateProductStock(
            productId,
            qty,
            'subtract',
          );
          if (!stockUpdate?.success) {
            throw new DomainException(ErrorCode.VALIDATION_ERROR, {
              reason: 'product_stock_update_failed',
              productId,
              requestedQty: qty,
            });
          }
        }
        stockAdjusted = true;

        const reservation = await this.reservationModel.create({
          variantId,
          productId,
          orderId,
          qty,
          expiresAt: expirationDate,
          status: 'ACTIVE',
        });
        reservationId = reservation._id.toString();

        const ledger = await this.ledgerModel.create({
          variantId,
          productId,
          change: -qty,
          reason: 'ORDER_RESERVED',
          refId: orderId,
        });
        ledgerId = ledger._id.toString();

        successful.push({ variantId, productId, qty, reservationId, ledgerId });
      } catch (error) {
        this.logger.error(
          `Failed to reserve inventory for order ${orderId} target ${JSON.stringify({
            variantId,
            productId,
          })}`,
          error as Error,
        );

        if (inventoryAdjusted) {
          await this.inventoryModel.updateOne(this.buildInventoryFilter({ variantId, productId }), {
            $inc: { on_hand: qty, reserved: -qty },
          });
        }

        if (stockAdjusted) {
          try {
            if (variantId) {
              await this.productsInventoryService.updateStock(variantId, qty, 'add');
            } else if (productId) {
              await this.productsInventoryService.updateProductStock(productId, qty, 'add');
            }
          } catch (rollbackError) {
            this.logger.error(
              `Failed to rollback stock update for target ${JSON.stringify({
                variantId,
                productId,
              })} during reservation rollback`,
              rollbackError as Error,
            );
          }
        }

        if (reservationId) {
          await this.reservationModel.deleteOne({ _id: reservationId });
        }

        if (ledgerId) {
          await this.ledgerModel.deleteOne({ _id: ledgerId });
        }

        await this.rollbackInventoryReservations(orderId, successful);

        if (error instanceof DomainException) {
          throw error;
        }

        throw new DomainException(ErrorCode.ORDER_CONFIRM_FAILED, {
          reason: 'inventory_reservation_failed',
          message: (error as Error).message,
        });
      }
    }
  }

  private async commitInventoryReservations(orderId: string): Promise<void> {
    const reservations = await this.reservationModel.find({
      orderId,
      status: 'ACTIVE',
    });

    if (reservations.length === 0) {
      return;
    }

    const committedExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // keep record for ~30 days

    for (const reservation of reservations) {
      const target = {
        variantId: this.normalizeObjectId(reservation.variantId),
        productId: this.normalizeObjectId(reservation.productId),
      };

      const inventoryFilter = this.buildInventoryFilter(target);
      const updateResult = await this.inventoryModel.updateOne(
        { ...inventoryFilter, reserved: { $gte: reservation.qty } },
        { $inc: { reserved: -reservation.qty } },
      );

      if (updateResult.modifiedCount === 0) {
        this.logger.warn(
          `Failed to decrement reserved quantity for target ${JSON.stringify(
            inventoryFilter,
          )} while committing order ${orderId}`,
        );
      }

      await this.reservationModel.updateOne(
        { _id: reservation._id },
        {
          $set: {
            status: 'COMMITTED',
            expiresAt: committedExpiry,
          },
        },
      );

      await this.ledgerModel.create({
        variantId: target.variantId,
        productId: target.productId,
        change: 0,
        reason: 'ORDER_COMMITTED',
        refId: orderId,
      });
    }
  }

  private async releaseInventoryReservations(orderId: string): Promise<void> {
    const reservations = await this.reservationModel.find({
      orderId,
      status: { $in: ['ACTIVE', 'COMMITTED'] },
    });

    if (reservations.length === 0) {
      return;
    }

    for (const reservation of reservations) {
      const target = {
        variantId: this.normalizeObjectId(reservation.variantId),
        productId: this.normalizeObjectId(reservation.productId),
      };

      const inventoryFilter = this.buildInventoryFilter(target);

      if (reservation.status === 'ACTIVE') {
        const releaseResult = await this.inventoryModel.updateOne(
          { ...inventoryFilter, reserved: { $gte: reservation.qty } },
          { $inc: { on_hand: reservation.qty, reserved: -reservation.qty } },
        );

        if (releaseResult.modifiedCount === 0) {
          this.logger.warn(
            `Inventory release skipped for target ${JSON.stringify(
              inventoryFilter,
            )} (order ${orderId}) due to insufficient reserved quantity`,
          );
        }
      } else {
        await this.inventoryModel.updateOne(inventoryFilter, {
          $inc: { on_hand: reservation.qty },
        });
      }

      let stockUpdate:
        | Awaited<ReturnType<typeof this.productsInventoryService.updateStock>>
        | Awaited<ReturnType<typeof this.productsInventoryService.updateProductStock>>
        | undefined;

      if (target.variantId) {
        stockUpdate = await this.productsInventoryService.updateStock(
          target.variantId,
          reservation.qty,
          'add',
        );
      } else if (target.productId) {
        stockUpdate = await this.productsInventoryService.updateProductStock(
          target.productId,
          reservation.qty,
          'add',
        );
      }

      if (stockUpdate && !stockUpdate.success) {
        this.logger.warn(
          `Stock update returned unsuccessful while releasing reservation for target ${JSON.stringify(
            inventoryFilter,
          )} (order ${orderId})`,
        );
      }

      await this.reservationModel.updateOne(
        { _id: reservation._id },
        {
          $set: {
            status: 'CANCELLED',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
      );

      await this.ledgerModel.create({
        variantId: target.variantId,
        productId: target.productId,
        change: reservation.qty,
        reason: 'ORDER_CANCELLED_RELEASE',
        refId: orderId,
      });
    }
  }

  /**
   * التحقق من صلاحية استخدام الدفع عند الاستلام (COD)
   * يجب أن يكون لدى المستخدم 3 طلبات مكتملة (DELIVERED) على الأقل
   * المستخدمون الذين لديهم صلاحيات Admin مستثنون من هذا التقييد
   */
  async checkCODEligibility(userId: string): Promise<CODEligibilityResult> {
    const requiredOrders = 3;

    // التحقق من أن المستخدم ليس Admin
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      return {
        eligible: false,
        completedOrders: 0,
        totalOrders: 0,
        inProgressOrders: 0,
        cancelledOrders: 0,
        requiredOrders,
        remainingOrders: requiredOrders,
        progress: '0/3',
        message: 'المستخدم غير موجود',
      };
    }

    const counters = await this.calculateUserOrderCounters(userId);

    // إذا كان المستخدم Admin، فهو مؤهل دائماً
    const isAdmin =
      user.roles?.includes(UserRole.ADMIN) || user.roles?.includes(UserRole.SUPER_ADMIN);
    if (isAdmin) {
      return {
        eligible: true,
        completedOrders: counters.completedOrders,
        totalOrders: counters.totalOrders,
        inProgressOrders: counters.inProgressOrders,
        cancelledOrders: counters.cancelledOrders,
        requiredOrders,
        remainingOrders: 0,
        progress: `${Math.min(counters.completedOrders, requiredOrders)}/${requiredOrders}`,
        message: 'المستخدم له صلاحيات إدارية',
        isAdmin: true,
      };
    }

    const completedOrdersCount = counters.completedOrders;
    const eligible = completedOrdersCount >= requiredOrders;
    const progress = `${Math.min(completedOrdersCount, requiredOrders)}/${requiredOrders}`;
    const remainingOrders = eligible ? 0 : Math.max(requiredOrders - completedOrdersCount, 0);

    return {
      eligible,
      completedOrders: completedOrdersCount,
      totalOrders: counters.totalOrders,
      inProgressOrders: counters.inProgressOrders,
      cancelledOrders: counters.cancelledOrders,
      requiredOrders,
      remainingOrders,
      progress,
      message: eligible
        ? undefined
        : `يجب إكمال ${requiredOrders} طلبات على الأقل لاستخدام الدفع عند الاستلام. لديك ${completedOrdersCount} طلب مكتمل`,
    };
  }

  /**
   * جلب خيارات الدفع المتاحة للمستخدم مع حالة الأهلية
   */
  async getPaymentOptions(
    userId: string,
    currency?: string,
    codEligibilityOverride?: CODEligibilityResult,
  ): Promise<CheckoutPaymentOptionsResponseDto> {
    const normalizedCurrency = currency?.toUpperCase();

    const [codEligibility, providers] = await Promise.all([
      codEligibilityOverride
        ? Promise.resolve(codEligibilityOverride)
        : this.checkCODEligibility(userId),
      normalizedCurrency
        ? this.localPaymentAccountService.findByCurrency(normalizedCurrency, true)
        : this.localPaymentAccountService.findGrouped(true),
    ]);

    const codStatus: CheckoutPaymentOptionStatusDto = {
      method: PaymentMethod.COD,
      status: codEligibility.eligible ? 'available' : 'restricted',
      allowed: codEligibility.eligible,
      reason: codEligibility.eligible ? undefined : codEligibility.message,
      codEligibility: this.mapCodEligibility(codEligibility),
    };

    const customerOrderStats: CheckoutCustomerOrderStatsDto = {
      totalOrders: codEligibility.totalOrders,
      completedOrders: codEligibility.completedOrders,
      inProgressOrders: codEligibility.inProgressOrders,
      cancelledOrders: codEligibility.cancelledOrders,
      requiredForCOD: codEligibility.requiredOrders,
      remainingForCOD: codEligibility.remainingOrders,
      codEligible: codEligibility.eligible,
    };

    const localPaymentProviders: CheckoutLocalPaymentProviderDto[] = providers
      .map((provider) => {
        const accounts: CheckoutLocalPaymentAccountDto[] = provider.accounts.map((account) => ({
          id: account.id,
          currency: account.currency,
          accountNumber: account.accountNumber,
          isActive: account.isActive,
          displayOrder: account.displayOrder,
          notes: account.notes,
        }));

        const primaryDisplayOrder =
          accounts.reduce(
            (min, account) => Math.min(min, account.displayOrder ?? 0),
            Number.POSITIVE_INFINITY,
          ) || 0;

        const icon: CheckoutProviderIconDto | undefined = provider.icon
          ? {
              id: provider.icon.id,
              url: provider.icon.url,
              ...(provider.icon.name ? { name: provider.icon.name } : {}),
            }
          : undefined;

        return {
          providerId: provider.providerId,
          providerName: provider.providerName,
          icon,
          type: provider.type,
          numberingMode: provider.numberingMode,
          supportedCurrencies: provider.supportedCurrencies,
          sharedAccountNumber: provider.sharedAccountNumber,
          displayOrder: Number.isFinite(primaryDisplayOrder) ? primaryDisplayOrder : 0,
          accounts,
        } as CheckoutLocalPaymentProviderDto;
      })
      .sort(
        (a, b) => a.displayOrder - b.displayOrder || a.providerName.localeCompare(b.providerName),
      );

    return {
      cod: codStatus,
      customerOrderStats,
      localPaymentProviders,
    };
  }

  private mapCodEligibility(eligibility: CODEligibilityResult): CheckoutCODEligibilityDto {
    return {
      eligible: eligibility.eligible,
      requiredOrders: eligibility.requiredOrders,
      remainingOrders: eligibility.remainingOrders,
      totalOrders: eligibility.totalOrders,
      completedOrders: eligibility.completedOrders,
      inProgressOrders: eligibility.inProgressOrders,
      cancelledOrders: eligibility.cancelledOrders,
      progress: eligibility.progress,
      message: eligibility.message,
      isAdmin: eligibility.isAdmin,
    };
  }

  async getCheckoutSession(
    userId: string,
    dto: CheckoutPreviewDto,
  ): Promise<CheckoutSessionResponseDto> {
    const normalizedCurrency = this.normalizeCurrency(dto.currency);

    const [preview, addresses, codEligibility, exchangeRatesDoc] = await Promise.all([
      this.getCartPreviewWithCache(userId, normalizedCurrency),
      this.addressesService.getActiveAddresses(userId),
      this.checkCODEligibility(userId),
      this.exchangeRatesService
        ? this.exchangeRatesService.getCurrentRates()
        : Promise.resolve(undefined),
    ]);

    // جلب computation و paymentOptions في parallel (باستخدام codEligibility الممرر)
    const [computation, paymentOptions] = await Promise.all([
      this.buildCheckoutComputation({
        userId,
        currency: normalizedCurrency,
        preview,
        couponCode: dto.couponCode,
        couponCodes: dto.couponCodes,
        codEligibility,
      }),
      this.getPaymentOptions(userId, normalizedCurrency, codEligibility),
    ]);

    let totalsInAllCurrencies: Record<string, unknown> | undefined;
    let exchangeRates:
      | {
          usdToYer: number;
          usdToSar: number;
          lastUpdatedAt?: Date;
        }
      | undefined;

    if (exchangeRatesDoc) {
      const toUSD = (amount: number, currencyCode: string): number => {
        if (!amount) return 0;
        switch (currencyCode) {
          case 'USD':
            return amount;
          case 'YER':
            return amount / exchangeRatesDoc.usdToYer;
          case 'SAR':
            return amount / exchangeRatesDoc.usdToSar;
          default:
            return amount;
        }
      };

      const fromUSD = (amountUSD: number, currencyCode: string): number => {
        switch (currencyCode) {
          case 'USD':
            return amountUSD;
          case 'YER':
            return amountUSD * exchangeRatesDoc.usdToYer;
          case 'SAR':
            return amountUSD * exchangeRatesDoc.usdToSar;
          default:
            return amountUSD;
        }
      };

      const subtotalUSD = toUSD(computation.subtotal, normalizedCurrency);
      const shippingUSD = toUSD(computation.shipping, normalizedCurrency);
      const taxUSD = 0;
      const discountUSD = toUSD(computation.discounts.totalDiscount, normalizedCurrency);
      const totalUSD = Math.max(0, subtotalUSD + shippingUSD + taxUSD - discountUSD);

      totalsInAllCurrencies = {
        USD: {
          subtotal: Math.round(subtotalUSD * 100) / 100,
          shippingCost: Math.round(shippingUSD * 100) / 100,
          tax: Math.round(taxUSD * 100) / 100,
          totalDiscount: Math.round(discountUSD * 100) / 100,
          total: Math.round(totalUSD * 100) / 100,
        },
        YER: {
          subtotal: Math.round(fromUSD(subtotalUSD, 'YER')),
          shippingCost: Math.round(fromUSD(shippingUSD, 'YER')),
          tax: Math.round(fromUSD(taxUSD, 'YER')),
          totalDiscount: Math.round(fromUSD(discountUSD, 'YER')),
          total: Math.round(fromUSD(totalUSD, 'YER')),
        },
        SAR: {
          subtotal: Math.round(fromUSD(subtotalUSD, 'SAR') * 100) / 100,
          shippingCost: Math.round(fromUSD(shippingUSD, 'SAR') * 100) / 100,
          tax: Math.round(fromUSD(taxUSD, 'SAR') * 100) / 100,
          totalDiscount: Math.round(fromUSD(discountUSD, 'SAR') * 100) / 100,
          total: Math.round(fromUSD(totalUSD, 'SAR') * 100) / 100,
        },
      };

      exchangeRates = {
        usdToYer: exchangeRatesDoc.usdToYer,
        usdToSar: exchangeRatesDoc.usdToSar,
        lastUpdatedAt: exchangeRatesDoc.lastUpdatedAt ?? undefined,
      };
    }

    const computationPreviewRecord = computation.preview as Record<string, unknown>;
    const previewMeta = computationPreviewRecord.meta as Record<string, unknown> | undefined;
    const previewTotalsInAllCurrencies = computationPreviewRecord.totalsInAllCurrencies as
      | Record<string, unknown>
      | undefined;

    return {
      cart: {
        pricingSummaryByCurrency: computation.preview.pricingSummaryByCurrency,
        totalsInAllCurrencies: totalsInAllCurrencies ?? previewTotalsInAllCurrencies,
        meta: previewMeta,
        items: computation.preview.items,
      },
      totals: {
        subtotal: computation.subtotal,
        shipping: computation.shipping,
        total: computation.total,
        currency: normalizedCurrency,
      },
      discounts: computation.discounts,
      paymentOptions,
      codEligibility: this.mapCodEligibility(codEligibility),
      customerOrderStats: computation.customerOrderStats,
      addresses: addresses.map((address) => ({
        id: address._id.toString(),
        label: address.label,
        line1: address.line1,
        city: address.city,
        coords: address.coords,
        notes: address.notes,
        isDefault: Boolean(address.isDefault),
        isActive: Boolean(address.isActive),
      })),
      ...(exchangeRates
        ? {
            exchangeRates: {
              usdToYer: exchangeRates.usdToYer,
              usdToSar: exchangeRates.usdToSar,
              lastUpdatedAt: exchangeRates.lastUpdatedAt,
            },
          }
        : {}),
    };
  }

  // ===== Checkout Methods =====

  /**
   * معاينة الطلب قبل التأكيد - دعم كوبونات متعددة
   */
  async previewCheckout(
    userId: string,
    currency: string,
    couponCode?: string,
    couponCodes?: string[],
  ) {
    try {
      const normalizedCurrency = this.normalizeCurrency(currency);
      const preview = await this.getCartPreviewWithCache(userId, normalizedCurrency);
      const computation = await this.buildCheckoutComputation({
        userId,
        currency: normalizedCurrency,
        preview,
        couponCode,
        couponCodes,
      });
      const codEligibility = computation.codEligibility;
      return {
        success: true,
        data: {
          items: computation.preview.items,
          subtotal: computation.subtotal,
          shipping: computation.shipping,
          total: computation.total,
          currency: normalizedCurrency,
          deliveryOptions: [], // خيارات التوصيل فارغة مؤقتاً حتى توقيع العقود
          // Detailed discounts breakdown
          discounts: computation.discounts,
          // COD Eligibility
          codEligibility: {
            eligible: codEligibility.eligible,
            completedOrders: codEligibility.completedOrders,
            totalOrders: codEligibility.totalOrders,
            inProgressOrders: codEligibility.inProgressOrders,
            cancelledOrders: codEligibility.cancelledOrders,
            requiredOrders: codEligibility.requiredOrders,
            remainingOrders: codEligibility.remainingOrders,
            progress: codEligibility.progress,
            message: codEligibility.message,
          },
          customerOrderStats: computation.customerOrderStats,
          // Backward compatibility
          appliedCoupon:
            computation.discounts.appliedCoupons.length > 0
              ? computation.discounts.appliedCoupons[0]
              : null,
          couponDiscount: computation.discounts.couponDiscount,
        },
      };
    } catch (error) {
      this.logger.error('Preview checkout failed:', error);
      throw new OrderPreviewFailedException();
    }
  }

  /**
   * تأكيد الطلب وإنشاؤه
   */
  async confirmCheckout(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<{
    order: {
      orderId: string;
      orderNumber: string;
      status: OrderStatus;
      payment?: { intentId: string; provider?: string; amount: number; signature: string };
    };
    codEligibility: CODEligibilityResult;
    customerOrderStats: {
      totalOrders: number;
      completedOrders: number;
      inProgressOrders: number;
      cancelledOrders: number;
      requiredForCOD: number;
      remainingForCOD: number;
      codEligible: boolean;
    };
  }> {
    try {
      // التحقق من ملكية العنوان
      const isValid = await this.addressesService.validateAddressOwnership(
        dto.deliveryAddressId,
        userId,
      );
      if (!isValid) {
        throw new AddressNotFoundException();
      }

      // جلب تفاصيل العنوان
      const address = await this.addressesService.getAddressById(dto.deliveryAddressId);

      const codEligibilityBefore = await this.checkCODEligibility(userId);

      // التحقق من صلاحية COD إذا كان المستخدم يريد استخدام الدفع عند الاستلام
      if (dto.paymentMethod === PaymentMethod.COD) {
        if (!codEligibilityBefore.eligible) {
          throw new DomainException(ErrorCode.VALIDATION_ERROR, {
            reason: 'cod_not_eligible',
            message: codEligibilityBefore.message || 'غير مؤهل لاستخدام الدفع عند الاستلام',
            codEligibility: {
              completedOrders: codEligibilityBefore.completedOrders,
              requiredOrders: codEligibilityBefore.requiredOrders,
              progress: codEligibilityBefore.progress,
              totalOrders: codEligibilityBefore.totalOrders,
              remainingOrders: codEligibilityBefore.remainingOrders,
            },
          });
        }
      }

      // إعادة حساب من السلة - دعم كوبونات متعددة
      const quote = (await this.previewCheckout(
        userId,
        dto.currency,
        dto.couponCode,
        dto.couponCodes,
      )) as {
        data: {
          total: number;
          subtotal: number;
          shipping: number;
          couponDiscount: number;
          itemsDiscount?: number;
          discounts?: {
            itemsDiscount: number;
            couponDiscount: number;
            totalDiscount: number;
            appliedCoupons: Array<{
              code: string;
              name: string;
              discountValue: number;
              type: string;
              discount: number;
            }>;
          };
          items: CartLine[];
        };
      };
      const total = quote.data.total;
      const subtotal = quote.data.subtotal;
      const shipping = quote.data.shipping || 0;
      const couponDiscount = quote.data.discounts?.couponDiscount || quote.data.couponDiscount || 0;
      const itemsDiscount = quote.data.discounts?.itemsDiscount || quote.data.itemsDiscount || 0;
      const totalDiscount = quote.data.discounts?.totalDiscount || itemsDiscount + couponDiscount;
      const appliedCoupons = quote.data.discounts?.appliedCoupons || [];
      const tax = 0; // الضريبة حالياً صفر

      // 🆕 حساب الإجماليات بالعملات الثلاث
      let totalsInAllCurrencies;
      if (this.exchangeRatesService) {
        // تحويل جميع المبالغ إلى USD أولاً
        const usdSubtotal = await this.exchangeRatesService.convertToUSD(subtotal, dto.currency);
        const usdShipping = await this.exchangeRatesService.convertToUSD(shipping, dto.currency);
        const usdTax = await this.exchangeRatesService.convertToUSD(tax, dto.currency);
        // تحويل إجمالي الخصومات (عروض + كوبونات) وليس الكوبونات فقط
        const usdDiscount = await this.exchangeRatesService.convertToUSD(
          totalDiscount,
          dto.currency,
        );

        totalsInAllCurrencies = await this.exchangeRatesService.calculateTotalsInAllCurrencies(
          usdSubtotal,
          usdShipping,
          usdTax,
          usdDiscount,
        );
      }

      // التحقق من الحساب المحلي إذا تم اختياره
      if (dto.paymentMethod === PaymentMethod.BANK_TRANSFER && dto.localPaymentAccountId) {
        const selection = await this.localPaymentAccountService.resolveAccountSelection(
          dto.localPaymentAccountId,
          dto.currency,
        );

        if (!selection || !selection.isActive) {
          throw new DomainException(ErrorCode.VALIDATION_ERROR, {
            reason: 'invalid_payment_account',
            message: 'الحساب المحدد غير موجود أو غير مفعل',
          });
        }

        // التحقق من تطابق العملة
        if (selection.currency !== dto.currency.toUpperCase()) {
          throw new DomainException(ErrorCode.VALIDATION_ERROR, {
            reason: 'currency_mismatch',
            message: `العملة المحددة (${dto.currency}) لا تطابق عملة الحساب (${selection.currency})`,
          });
        }

        // التحقق من وجود رقم الحوالة
        if (!dto.paymentReference || dto.paymentReference.trim().length === 0) {
          throw new DomainException(ErrorCode.VALIDATION_ERROR, {
            reason: 'payment_reference_required',
            message: 'يجب إدخال رقم الحوالة أو المرجع',
          });
        }
      }

      // إنشاء الطلب
      const order = new this.orderModel({
        orderNumber: this.generateOrderNumber(),
        userId: new Types.ObjectId(userId),
        status: OrderStatus.PENDING_PAYMENT,
        paymentStatus: PaymentStatus.PENDING,
        deliveryAddress: {
          addressId: address._id,
          label: address.label,
          line1: address.line1,
          city: address.city,
          coords: address.coords,
          notes: address.notes,
        },
        items: quote.data.items.map((item: CartLine) => {
          const productObjectId = item.productId || item.variantId;
          return {
            productId: productObjectId ? new Types.ObjectId(productObjectId) : undefined,
            variantId: item.variantId ? new Types.ObjectId(item.variantId) : undefined,
            qty: item.qty,
            basePrice: item.unit.base,
            finalPrice: item.unit.final,
            lineTotal: item.lineTotal,
            currency: dto.currency,
            snapshot: item.snapshot || {
              name: '',
              slug: '',
              attributes: {},
            },
          };
        }),
        currency: dto.currency,
        subtotal: subtotal,
        total,
        shippingCost: shipping,
        itemsDiscount: itemsDiscount,
        couponDiscount: couponDiscount,
        tax: tax,
        totalDiscount: totalDiscount,
        // Multiple coupons support
        appliedCouponCodes: appliedCoupons.map((c) => c.code),
        appliedCoupons: appliedCoupons.map((c) => ({
          code: c.code,
          discount: c.discount,
          details: {
            code: c.code,
            title: c.name,
            type: c.type,
            discountPercentage: c.type === 'percentage' ? c.discountValue : undefined,
            discountAmount: c.type === 'fixed_amount' ? c.discountValue : undefined,
          },
        })),
        // Backward compatibility
        appliedCouponCode: appliedCoupons.length > 0 ? appliedCoupons[0].code : dto.couponCode,
        couponDetails:
          appliedCoupons.length > 0
            ? {
                code: appliedCoupons[0].code,
                title: appliedCoupons[0].name,
                type: appliedCoupons[0].type,
                discountPercentage:
                  appliedCoupons[0].type === 'percentage'
                    ? appliedCoupons[0].discountValue
                    : undefined,
                discountAmount:
                  appliedCoupons[0].type === 'fixed_amount'
                    ? appliedCoupons[0].discountValue
                    : undefined,
              }
            : undefined,
        paymentMethod: dto.paymentMethod,
        paymentProvider: dto.paymentProvider,
        localPaymentAccountId: dto.localPaymentAccountId ?? undefined,
        paymentReference: dto.paymentReference,
        shippingMethod: dto.shippingMethod,
        customerNotes: dto.customerNotes,
        totalsInAllCurrencies,
        source: 'web',
      });

      await order.save();

      try {
        await this.reserveOrderInventory(order);
      } catch (inventoryError) {
        this.logger.error(
          `Inventory reservation failed for order ${order.orderNumber}`,
          inventoryError as Error,
        );
        await this.orderModel.deleteOne({ _id: order._id });
        if (inventoryError instanceof DomainException) {
          throw inventoryError;
        }
        throw new DomainException(ErrorCode.ORDER_CONFIRM_FAILED, {
          reason: 'inventory_reservation_failed',
          message: (inventoryError as Error).message,
        });
      }

      // إضافة سجل الحالة
      await this.addStatusHistory(
        order,
        OrderStatus.PENDING_PAYMENT,
        new Types.ObjectId(userId),
        'customer',
        'تم إنشاء الطلب',
      );

      // إذا كان الدفع عند الاستلام، تأكيد فوري وتحديث حالة الدفع
      if (dto.paymentMethod === PaymentMethod.COD) {
        // تحديث حالة الدفع أولاً
        const oldPaymentStatus = order.paymentStatus;
        const newPaymentStatus = PaymentStatus.PAID;
        order.paymentStatus = newPaymentStatus;
        order.paidAt = new Date();
        await order.save();

        // تسجيل حدث الدفع في audit
        if (this.auditService) {
          this.auditService
            .logPaymentEvent({
              userId,
              orderId: String(order._id),
              action: oldPaymentStatus !== newPaymentStatus ? 'status_changed' : 'completed',
              paymentMethod: PaymentMethod.COD,
              amount: order.total,
              currency: order.currency,
              failureReason:
                oldPaymentStatus !== newPaymentStatus
                  ? `Payment status changed from ${oldPaymentStatus} to ${newPaymentStatus}`
                  : undefined,
              ipAddress: undefined, // COD لا يحتاج IP
            })
            .catch((err) => this.logger.error('Failed to log COD payment', err));
        }

        // ثم تحديث حالة الطلب
        await this.updateOrderStatus(
          order._id.toString(),
          OrderStatus.CONFIRMED,
          new Types.ObjectId(userId),
          'admin',
          'تأكيد فوري للدفع عند الاستلام',
        );
      }

      // تحديث استخدام العنوان
      await this.addressesService.markAsUsed(dto.deliveryAddressId, userId);

      // تحديث السلة إلى حالة CONVERTED وربطها بالطلب
      await this.cartModel.updateOne(
        {
          userId: new Types.ObjectId(userId),
          status: { $ne: CartStatus.CONVERTED },
        },
        {
          $set: {
            status: CartStatus.CONVERTED,
            convertedToOrderId: order._id,
            convertedAt: new Date(),
            items: [], // تفريغ العناصر لمنع إعادة الاستخدام
          },
        },
      );

      this.logger.log(`Order created: ${order.orderNumber}, Cart converted`);

      // إرسال إشعار ORDER_CREATED للمدراء
      await this.notifyAdmins(
        NotificationType.ORDER_CREATED,
        'طلب جديد',
        `تم إنشاء طلب جديد: ${order.orderNumber}`,
        `New order created: ${order.orderNumber}`,
        {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          customerId: userId,
          total: total,
          currency: dto.currency,
        },
      );

      // إرسال إشعار COUPON_USED للمدراء إذا تم استخدام كوبون
      if (appliedCoupons.length > 0) {
        await this.notifyAdmins(
          NotificationType.COUPON_USED,
          'استخدام كوبون',
          `تم استخدام كوبون ${appliedCoupons.map((c) => c.code).join(', ')} في الطلب ${order.orderNumber}`,
          `Coupon ${appliedCoupons.map((c) => c.code).join(', ')} used in order ${order.orderNumber}`,
          {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            couponCodes: appliedCoupons.map((c) => c.code),
            discountAmount: couponDiscount,
            currency: dto.currency,
          },
        );
      }

      const codEligibilityAfter = await this.checkCODEligibility(userId);
      const customerOrderStats = {
        totalOrders: codEligibilityAfter.totalOrders,
        completedOrders: codEligibilityAfter.completedOrders,
        inProgressOrders: codEligibilityAfter.inProgressOrders,
        cancelledOrders: codEligibilityAfter.cancelledOrders,
        requiredForCOD: codEligibilityAfter.requiredOrders,
        remainingForCOD: codEligibilityAfter.remainingOrders,
        codEligible: codEligibilityAfter.eligible,
      };

      return {
        order: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          status: order.status,
          payment:
            dto.paymentMethod === 'BANK_TRANSFER'
              ? {
                  intentId: `local-${order._id}`,
                  provider: 'local_bank',
                  amount: total,
                  signature: this.hmac(`local-${order._id}|PENDING|${total}`),
                }
              : undefined,
        },
        codEligibility: codEligibilityAfter,
        customerOrderStats,
      };
    } catch (error) {
      this.logger.error('Confirm checkout failed:', error);
      throw new OrderException(ErrorCode.ORDER_CONFIRM_FAILED);
    }
  }

  // ===== Order Management =====

  /**
   * الحصول على طلبات المستخدم
   */
  async getUserOrders(userId: string, query: ListOrdersDto) {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      fromDate,
      toDate,
      hasRating,
      minRating,
    } = query;

    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    // Only filter by userId if it's provided (for customer queries)
    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (fromDate || toDate) {
      filter.createdAt = {} as Record<string, unknown>;
      if (fromDate) (filter.createdAt as Record<string, unknown>).$gte = new Date(fromDate);
      if (toDate) (filter.createdAt as Record<string, unknown>).$lte = new Date(toDate);
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'deliveryAddress.recipientName': { $regex: search, $options: 'i' } },
      ];
    }

    // فلترة حسب التقييم
    if (hasRating !== undefined) {
      if (hasRating) {
        filter['ratingInfo.rating'] = { $exists: true, $ne: null };
      } else {
        const existingOr = filter.$or as unknown[] | undefined;
        const ratingOr = [
          { 'ratingInfo.rating': { $exists: false } },
          { 'ratingInfo.rating': null },
        ];
        if (existingOr) {
          filter.$or = [...existingOr, ...ratingOr];
        } else {
          filter.$or = ratingOr;
        }
      }
    }
    if (minRating !== undefined) {
      const ratingFilter: Record<string, unknown> = { $gte: minRating };
      if (filter['ratingInfo.rating']) {
        const existingRatingFilter = filter['ratingInfo.rating'] as Record<string, unknown>;
        filter['ratingInfo.rating'] = { ...existingRatingFilter, ...ratingFilter };
      } else {
        filter['ratingInfo.rating'] = ratingFilter;
      }
    }

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.orderModel.countDocuments(filter),
    ]);

    const userIds = orders
      .map((order) => order.userId)
      .filter((id): id is Types.ObjectId => !!id)
      .map((id) => new Types.ObjectId(id));

    const usersMap = userIds.length > 0 ? await this.getUsersMap(userIds) : new Map();

    // جلب أنواع الحسابات المحلية للطلبات التي تستخدمها
    const localPaymentAccountIds = orders
      .map((order) => order.localPaymentAccountId)
      .filter((id): id is string => Boolean(id));

    const accountTypesMap = new Map<string, string>();
    if (localPaymentAccountIds.length > 0) {
      try {
        const uniqueAccountIds = Array.from(new Set(localPaymentAccountIds));
        // جلب نوع الحساب لكل حساب محلي
        await Promise.all(
          uniqueAccountIds.map(async (accountId) => {
            try {
              // البحث عن الطلب الذي يستخدم هذا الحساب للحصول على العملة
              const orderWithAccount = orders.find((o) => o.localPaymentAccountId === accountId);
              const currency = orderWithAccount?.currency || 'USD';

              const selection = await this.localPaymentAccountService.resolveAccountSelection(
                accountId,
                currency,
              );
              if (selection) {
                accountTypesMap.set(accountId, selection.type);
              }
            } catch (error) {
              // تجاهل الأخطاء في جلب نوع الحساب
              this.logger.debug(`Failed to resolve account type for ${accountId}: ${error}`);
            }
          }),
        );
      } catch (error) {
        this.logger.warn(`Failed to load account types: ${error}`);
      }
    }

    const enhancedOrders = orders.map((order) => {
      const userInfo = order.userId ? usersMap.get(order.userId.toString()) : undefined;
      const existingCustomerName = (order as { customerName?: string }).customerName;
      const existingCustomerPhone = (order as { customerPhone?: string }).customerPhone;
      const customerName =
        userInfo?.fullName ||
        existingCustomerName ||
        order.deliveryAddress?.recipientName ||
        'غير محدد';

      const updatedMetadata = {
        ...(order.metadata || {}),
        customer: {
          firstName: userInfo?.firstName ?? undefined,
          lastName: userInfo?.lastName ?? undefined,
          phone: userInfo?.phone ?? undefined,
        },
      };

      // إضافة نوع الحساب المحلي إذا كان موجوداً
      const localPaymentAccountType = order.localPaymentAccountId
        ? accountTypesMap.get(order.localPaymentAccountId)
        : undefined;

      return {
        ...order,
        customerName,
        customerPhone: userInfo?.phone ?? existingCustomerPhone,
        metadata: updatedMetadata,
        ...(localPaymentAccountType ? { localPaymentAccountType } : {}),
      };
    });

    return {
      orders: enhancedOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * الحصول على تفاصيل الطلب
   */
  async getOrderDetails(orderId: string, userId?: string): Promise<OrderDocument> {
    // Validate IDs before constructing ObjectId to avoid BSONError
    if (!Types.ObjectId.isValid(orderId)) {
      throw new OrderNotFoundException();
    }
    const filter: Record<string, unknown> = { _id: new Types.ObjectId(orderId) };
    if (userId) {
      if (!Types.ObjectId.isValid(userId)) {
        throw new OrderNotFoundException();
      }
      filter.userId = new Types.ObjectId(userId);
    }

    // جلب الطلب
    const order = await this.orderModel.findOne(filter);

    if (!order) {
      throw new OrderNotFoundException();
    }

    // جلب نوع الحساب المحلي إذا كان موجوداً (مع timeout لتجنب التأخير)
    if (order.localPaymentAccountId) {
      try {
        const selection = await Promise.race([
          this.localPaymentAccountService.resolveAccountSelection(
            order.localPaymentAccountId,
            order.currency || 'USD',
          ),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000)), // timeout 1 ثانية
        ]);
        if (selection) {
          (order as unknown as { localPaymentAccountType?: string }).localPaymentAccountType =
            selection.type;
        }
      } catch (error) {
        this.logger.debug(`Failed to resolve account type for order ${orderId}: ${error}`);
      }
    }

    return order;
  }

  /**
   * تحديث حالة الطلب
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    changedBy: Types.ObjectId,
    changedByRole: 'customer' | 'admin' | 'system',
    notes?: string,
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new OrderNotFoundException();
    }

    const previousStatus = order.status;

    // التحقق من صحة الانتقال
    if (!OrderStateMachine.canTransition(order.status, newStatus)) {
      throw new OrderException(ErrorCode.ORDER_INVALID_STATUS, {
        from: order.status,
        to: newStatus,
      });
    }

    // التحقق من الدفع قبل السماح بتغيير الحالة
    // الحالات الممنوعة بدون دفع: CONFIRMED, PROCESSING, COMPLETED
    // استثناء CANCELLED من هذا التحقق
    const statusesRequiringPayment = [
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.COMPLETED,
    ];

    if (statusesRequiringPayment.includes(newStatus) && newStatus !== OrderStatus.CANCELLED) {
      if (order.paymentStatus !== PaymentStatus.PAID) {
        throw new DomainException(ErrorCode.VALIDATION_ERROR, {
          reason: 'payment_required',
          message: `لا يمكن تغيير حالة الطلب إلى ${newStatus} بدون إتمام الدفع. حالة الدفع الحالية: ${order.paymentStatus}`,
          currentPaymentStatus: order.paymentStatus,
          requiredPaymentStatus: PaymentStatus.PAID,
        });
      }
    }

    if (newStatus === OrderStatus.CONFIRMED && previousStatus === OrderStatus.PENDING_PAYMENT) {
      await this.commitInventoryReservations(orderId);
    }

    if (newStatus === OrderStatus.CANCELLED) {
      await this.releaseInventoryReservations(orderId);
    }

    // تحديث الحالة
    order.status = newStatus;

    // إضافة سجل الحالة
    await this.addStatusHistory(order, newStatus, changedBy, changedByRole, notes);

    // تحديث التواريخ الخاصة
    const now = new Date();
    switch (newStatus) {
      case OrderStatus.CONFIRMED:
        order.confirmedAt = now;
        break;
      case OrderStatus.PROCESSING:
        order.processingStartedAt = now;
        break;
      case OrderStatus.COMPLETED:
        order.completedAt = now;
        order.deliveredAt = now;
        break;
      case OrderStatus.CANCELLED:
        order.cancelledAt = now;
        break;
    }

    await order.save();
    this.logger.log(`Order ${order.orderNumber} status updated to ${newStatus}`);

    // إرسال الفاتورة عند تأكيد الطلب أو إكماله
    if (newStatus === OrderStatus.CONFIRMED || newStatus === OrderStatus.COMPLETED) {
      // استخدام orderId بدلاً من order object لتجنب ParallelSaveError
      this.sendOrderInvoiceForStatus(order._id.toString()).catch((err: any) => {
        this.logger.error(`Failed to send invoice for order ${order.orderNumber}:`, err);
      });
    }

    // معالجة إكمال الطلب بعد حفظ التغييرات
    if (newStatus === OrderStatus.COMPLETED) {
      // استخدام orderId بدلاً من order object لتجنب ParallelSaveError
      this.handleOrderCompletion(order._id.toString()).catch((err) => {
        this.logger.error(`Failed to handle order completion for ${order.orderNumber}:`, err);
      });
    }

    // تسجيل تغيير حالة الطلب في audit
    if (this.auditService) {
      this.auditService
        .logOrderEvent({
          userId: String(order.userId),
          orderId: String(order._id),
          action: 'status_changed',
          orderNumber: order.orderNumber,
          oldStatus: previousStatus,
          newStatus,
          totalAmount: order.total,
          currency: order.currency,
          performedBy: String(changedBy),
          reason: notes,
        })
        .catch((err) => this.logger.error('Failed to log order status change', err));
    }

    return order;
  }

  /**
   * إلغاء الطلب
   */
  async cancelOrder(orderId: string, userId: string, dto: CancelOrderDto): Promise<OrderDocument> {
    const order = await this.getOrderDetails(orderId, userId);

    // التحقق من إمكانية الإلغاء
    if (!OrderStateMachine.canTransition(order.status, OrderStatus.CANCELLED)) {
      throw new OrderCannotCancelException({ status: order.status });
    }

    order.cancellationReason = dto.reason;
    await this.updateOrderStatus(
      orderId,
      OrderStatus.CANCELLED,
      new Types.ObjectId(userId),
      'customer',
      `تم الإلغاء: ${dto.reason}`,
    );

    return order;
  }

  /**
   * شحن الطلب
   */
  async shipOrder(orderId: string, dto: ShipOrderDto, adminId: string): Promise<OrderDocument> {
    const order = await this.getOrderDetails(orderId);

    if (order.status !== OrderStatus.PROCESSING) {
      throw new OrderNotReadyToShipException({ status: order.status });
    }

    order.trackingNumber = dto.trackingNumber;
    order.trackingUrl = dto.trackingUrl;
    order.shippingCompany = dto.shippingCompany;
    order.estimatedDeliveryDate = dto.estimatedDeliveryDate
      ? new Date(dto.estimatedDeliveryDate)
      : undefined;
    order.shippedAt = new Date();

    await this.addStatusHistory(
      order,
      order.status,
      new Types.ObjectId(adminId),
      'admin',
      dto.notes ?? 'تم تحديث معلومات الشحن',
      {
        trackingNumber: order.trackingNumber,
        shippingCompany: order.shippingCompany,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
      },
    );

    await order.save();

    return order;
  }

  /**
   * معالجة الاسترداد
   */
  async processRefund(
    orderId: string,
    dto: RefundOrderDto,
    adminId: string,
  ): Promise<OrderDocument> {
    const order = await this.getOrderDetails(orderId);

    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new OrderException(ErrorCode.ORDER_ALREADY_PAID);
    }

    if (dto.amount > order.total) {
      throw new OrderException(ErrorCode.ORDER_REFUND_AMOUNT_INVALID, {
        amount: dto.amount,
        total: order.total,
      });
    }

    order.returnInfo.isReturned = true;
    order.returnInfo.returnAmount = dto.amount;
    order.returnInfo.returnReason = dto.reason;
    order.returnInfo.returnedAt = new Date();
    order.returnInfo.returnedBy = new Types.ObjectId(adminId);

    // تحديث حالة الدفع
    const oldPaymentStatus = order.paymentStatus;
    const newPaymentStatus =
      dto.amount === order.total ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
    order.paymentStatus = newPaymentStatus;
    // ملاحظة: نستخدم REFUNDED فقط في OrderStatus (تم تبسيط الحالات)
    order.status = OrderStatus.REFUNDED;

    // تسجيل حدث الاسترداد في audit
    if (this.auditService) {
      this.auditService
        .logPaymentEvent({
          userId: String(order.userId),
          orderId: String(order._id),
          action: 'refunded',
          paymentMethod: order.paymentMethod || 'UNKNOWN',
          amount: dto.amount,
          currency: order.currency,
          transactionId: order.paymentTransactionId,
          failureReason:
            String(oldPaymentStatus) !== String(newPaymentStatus)
              ? `Payment status changed from ${oldPaymentStatus} to ${newPaymentStatus}`
              : undefined,
        })
        .catch((err) => this.logger.error('Failed to log refund', err));

      this.auditService
        .logOrderEvent({
          userId: String(order.userId),
          orderId: String(order._id),
          action: 'refunded',
          orderNumber: order.orderNumber,
          oldStatus: order.statusHistory[order.statusHistory.length - 1]?.status,
          newStatus: OrderStatus.REFUNDED,
          totalAmount: dto.amount,
          currency: order.currency,
          performedBy: adminId,
          reason: dto.reason,
        })
        .catch((err) => this.logger.error('Failed to log order refund', err));
    }

    await this.addStatusHistory(
      order,
      order.status,
      new Types.ObjectId(adminId),
      'admin',
      `استرداد ${dto.amount} - ${dto.reason}`,
    );

    await order.save();
    return order;
  }

  /**
   * تقييم الطلب
   */
  async rateOrder(orderId: string, userId: string, dto: RateOrderDto): Promise<OrderDocument> {
    const order = await this.getOrderDetails(orderId, userId);

    if (order.status !== OrderStatus.COMPLETED) {
      throw new OrderRatingNotAllowedException({ status: order.status });
    }

    order.ratingInfo.rating = dto.rating;
    order.ratingInfo.review = dto.review;
    order.ratingInfo.ratedAt = new Date();

    await order.save();

    // إرسال إشعار ORDER_RATED للمدراء
    await this.notifyAdmins(
      NotificationType.ORDER_RATED,
      'تقييم طلب',
      `تم تقييم الطلب ${order.orderNumber} بـ ${dto.rating} نجوم`,
      `Order ${order.orderNumber} rated with ${dto.rating} stars`,
      {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        rating: dto.rating,
        review: dto.review,
        customerId: userId,
      },
    );

    return order;
  }

  /**
   * إضافة ملاحظات للطلب
   */
  async addOrderNotes(
    orderId: string,
    dto: AddOrderNotesDto,
    userId: string,
    isAdmin = false,
  ): Promise<OrderDocument> {
    const order = await this.getOrderDetails(orderId, isAdmin ? undefined : userId);

    switch (dto.type) {
      case 'customer':
        order.customerNotes = dto.notes;
        break;
      case 'admin':
        order.adminNotes = dto.notes;
        break;
      case 'internal':
        order.internalNotes = dto.notes;
        break;
      default:
        order.customerNotes = dto.notes;
    }

    await order.save();
    return order;
  }

  // ===== Analytics =====

  /**
   * إحصائيات طلبات المستخدم
   */
  async getUserOrderStatistics(userId: string) {
    const [totalOrders, completedOrders, cancelledOrders, totalSpent] = await Promise.all([
      this.orderModel.countDocuments({ userId: new Types.ObjectId(userId) }),
      this.orderModel.countDocuments({
        userId: new Types.ObjectId(userId),
        status: OrderStatus.COMPLETED,
      }),
      this.orderModel.countDocuments({
        userId: new Types.ObjectId(userId),
        status: OrderStatus.CANCELLED,
      }),
      this.orderModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            status: OrderStatus.COMPLETED,
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const averageOrderValue =
      completedOrders > 0 ? (totalSpent[0]?.total || 0) / completedOrders : 0;

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalSpent: totalSpent[0]?.total || 0,
      averageOrderValue,
    };
  }

  /**
   * تحليلات إدارية
   */
  async getAdminAnalytics(query: OrderAnalyticsDto) {
    const { days = 7, status } = query;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const matchFilter: Record<string, unknown> = { createdAt: { $gte: fromDate } };
    if (status) matchFilter.status = status;

    const [totalOrders, totalRevenue, ordersByStatus, recentOrders] = await Promise.all([
      this.orderModel.countDocuments(matchFilter),
      this.orderModel.aggregate([
        { $match: { ...matchFilter, status: OrderStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      this.orderModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.orderModel.find(matchFilter).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const avgOrderValue = totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0;

    return {
      period: `آخر ${days} أيام`,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageOrderValue: avgOrderValue,
      ordersByStatus,
      recentOrders,
    };
  }

  // ===== Admin Methods =====

  /**
   * الحصول على جميع الطلبات (للإدارة)
   */
  async getAllOrders(query: ListOrdersDto) {
    return this.getUserOrders('', query); // استخدام نفس المنطق بدون فلتر المستخدم
  }

  /**
   * الحصول على تقييمات الطلبات (للإدارة)
   */
  async getRatings(query: ListRatingsDto) {
    const {
      page = 1,
      limit = 20,
      minRating,
      maxRating,
      search,
      sortOrder = 'desc',
      fromDate,
      toDate,
    } = query;

    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {
      'ratingInfo.rating': { $exists: true, $ne: null },
    };

    // فلترة حسب التقييم
    if (minRating !== undefined || maxRating !== undefined) {
      const ratingFilter: Record<string, unknown> = {};
      if (minRating !== undefined) ratingFilter.$gte = minRating;
      if (maxRating !== undefined) ratingFilter.$lte = maxRating;
      filter['ratingInfo.rating'] = ratingFilter;
    }

    // فلترة حسب التاريخ
    if (fromDate || toDate) {
      filter['ratingInfo.ratedAt'] = {} as Record<string, unknown>;
      if (fromDate)
        (filter['ratingInfo.ratedAt'] as Record<string, unknown>).$gte = new Date(fromDate);
      if (toDate) (filter['ratingInfo.ratedAt'] as Record<string, unknown>).$lte = new Date(toDate);
    }

    // البحث في رقم الطلب أو التقييم
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'ratingInfo.review': { $regex: search, $options: 'i' } },
        { 'deliveryAddress.recipientName': { $regex: search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = {};
    sort['ratingInfo.ratedAt'] = sortOrder === 'desc' ? -1 : 1;

    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.orderModel.countDocuments(filter),
    ]);

    const userIds = orders
      .map((order) => order.userId)
      .filter((id): id is Types.ObjectId => !!id)
      .map((id) => new Types.ObjectId(id));

    const usersMap = userIds.length > 0 ? await this.getUsersMap(userIds) : new Map();

    const ratings = orders.map((order) => {
      const userInfo = order.userId ? usersMap.get(order.userId.toString()) : undefined;
      const customerName =
        userInfo?.fullName ||
        (order as { customerName?: string }).customerName ||
        order.deliveryAddress?.recipientName ||
        'غير محدد';

      return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName,
        customerPhone: userInfo?.phone,
        rating: order.ratingInfo?.rating,
        review: order.ratingInfo?.review,
        ratedAt: order.ratingInfo?.ratedAt,
        orderStatus: order.status,
        orderTotal: order.total,
        orderCurrency: order.currency,
        createdAt: order.createdAt,
      };
    });

    return {
      ratings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * الحصول على إحصائيات التقييمات (للإدارة)
   */
  async getRatingsStats() {
    const [totalRatings, averageRating, ratingsByValue, recentRatings, ratingsWithReviews] =
      await Promise.all([
        // إجمالي التقييمات
        this.orderModel.countDocuments({
          'ratingInfo.rating': { $exists: true, $ne: null },
        }),
        // متوسط التقييم
        this.orderModel.aggregate([
          {
            $match: {
              'ratingInfo.rating': { $exists: true, $ne: null },
            },
          },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$ratingInfo.rating' },
              totalRatings: { $sum: 1 },
            },
          },
        ]),
        // التوزيع حسب القيمة
        this.orderModel.aggregate([
          {
            $match: {
              'ratingInfo.rating': { $exists: true, $ne: null },
            },
          },
          {
            $group: {
              _id: '$ratingInfo.rating',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: -1 },
          },
        ]),
        // آخر التقييمات
        this.orderModel
          .find({
            'ratingInfo.rating': { $exists: true, $ne: null },
          })
          .sort({ 'ratingInfo.ratedAt': -1 })
          .limit(5)
          .select('orderNumber ratingInfo.rating ratingInfo.review ratingInfo.ratedAt')
          .lean(),
        // التقييمات مع مراجعات
        this.orderModel.countDocuments({
          'ratingInfo.rating': { $exists: true, $ne: null },
          'ratingInfo.review': { $exists: true, $nin: [null, ''] },
        }),
      ]);

    const avgRatingResult = averageRating[0];
    const avgRating = avgRatingResult?.averageRating
      ? Math.round(avgRatingResult.averageRating * 10) / 10
      : 0;

    const ratingsDistribution = ratingsByValue.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<number, number>,
    );

    return {
      totalRatings,
      averageRating: avgRating,
      ratingsDistribution: {
        5: ratingsDistribution[5] || 0,
        4: ratingsDistribution[4] || 0,
        3: ratingsDistribution[3] || 0,
        2: ratingsDistribution[2] || 0,
        1: ratingsDistribution[1] || 0,
      },
      ratingsWithReviews,
      recentRatings: recentRatings.map((order) => ({
        orderNumber: order.orderNumber,
        rating: order.ratingInfo?.rating,
        review: order.ratingInfo?.review,
        ratedAt: order.ratingInfo?.ratedAt,
      })),
    };
  }

  /**
   * تحديث حالة الطلب (للإدارة)
   */
  async adminUpdateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    adminId: string,
  ): Promise<OrderDocument> {
    return this.updateOrderStatus(
      orderId,
      dto.status,
      new Types.ObjectId(adminId),
      'admin',
      dto.notes,
    );
  }

  // ===== Webhook Methods =====

  /**
   * معالجة webhook الدفع
   */
  async handlePaymentWebhook(
    intentId: string,
    status: 'SUCCESS' | 'FAILED',
    amount: string,
    signature: string,
  ): Promise<{ ok: boolean; reason?: string }> {
    const expected = this.hmac(`${intentId}|${status}|${amount}`);
    if (signature !== expected) {
      return { ok: false, reason: 'BAD_SIGNATURE' };
    }

    const order = await this.orderModel.findOne({ paymentIntentId: intentId });
    if (!order) {
      return { ok: false, reason: 'ORDER_NOT_FOUND' };
    }

    if (status === 'SUCCESS' && Number(amount) === order.total) {
      const oldPaymentStatus = order.paymentStatus;
      const newPaymentStatus = PaymentStatus.PAID;
      order.paymentStatus = newPaymentStatus;
      order.paidAt = new Date();

      // تسجيل حدث الدفع الناجح في audit
      if (this.auditService) {
        this.auditService
          .logPaymentEvent({
            userId: String(order.userId),
            orderId: String(order._id),
            action: oldPaymentStatus !== newPaymentStatus ? 'status_changed' : 'completed',
            paymentMethod: order.paymentMethod || 'ONLINE',
            amount: order.total,
            currency: order.currency,
            transactionId: intentId,
            failureReason:
              oldPaymentStatus !== newPaymentStatus
                ? `Payment status changed from ${oldPaymentStatus} to ${newPaymentStatus}`
                : undefined,
          })
          .catch((err) => this.logger.error('Failed to log payment completion', err));
      }

      await this.updateOrderStatus(
        order._id.toString(),
        OrderStatus.CONFIRMED,
        new Types.ObjectId('system'),
        'system',
        'تم تأكيد الدفع',
      );
    } else {
      const oldPaymentStatus = order.paymentStatus;
      const newPaymentStatus = PaymentStatus.FAILED;
      order.paymentStatus = newPaymentStatus;

      // تسجيل حدث فشل الدفع في audit
      if (this.auditService) {
        this.auditService
          .logPaymentEvent({
            userId: String(order.userId),
            orderId: String(order._id),
            action: oldPaymentStatus !== newPaymentStatus ? 'status_changed' : 'failed',
            paymentMethod: order.paymentMethod || 'ONLINE',
            amount: Number(amount),
            currency: order.currency,
            transactionId: intentId,
            failureReason:
              oldPaymentStatus !== newPaymentStatus
                ? `Payment status changed from ${oldPaymentStatus} to ${newPaymentStatus}. Original failure: ${status}`
                : `Payment failed: ${status}`,
          })
          .catch((err) => this.logger.error('Failed to log payment failure', err));
      }

      // في حالة فشل الدفع، نبقي الطلب في حالة PENDING_PAYMENT
      await this.addStatusHistory(
        order,
        order.status,
        new Types.ObjectId('system'),
        'system',
        'فشل في الدفع - يرجى المحاولة مرة أخرى',
      );
    }

    return { ok: true };
  }

  // ===== Analytics Methods =====

  /**
   * تحليل الإيرادات المفصل
   */
  async getRevenueAnalytics(params: { fromDate?: Date; toDate?: Date }) {
    const matchQuery: Record<string, unknown> = {};
    if (params.fromDate || params.toDate) {
      matchQuery.createdAt = {};
      if (params.fromDate) (matchQuery.createdAt as Record<string, unknown>).$gte = params.fromDate;
      if (params.toDate) (matchQuery.createdAt as Record<string, unknown>).$lte = params.toDate;
    }

    const analytics = await this.orderModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
        },
      },
    ]);

    const revenueByDay = await this.orderModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const revenueByStatus = await this.orderModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
    ]);

    return {
      totalRevenue: analytics[0]?.totalRevenue || 0,
      totalOrders: analytics[0]?.totalOrders || 0,
      averageOrderValue: analytics[0]?.averageOrderValue || 0,
      revenueByDay,
      revenueByStatus,
      topProducts: await this.getTopSellingProducts(matchQuery),
    };
  }

  /**
   * الحصول على المنتجات الأكثر مبيعاً
   */
  private async getTopSellingProducts(matchQuery: Record<string, unknown>) {
    const topProducts = await this.orderModel.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.snapshot.name' },
          totalQuantity: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.finalPrice', '$items.qty'] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    return topProducts.map((product) => ({
      productId: product._id?.toString(),
      name: product.productName || 'Unknown Product',
      totalQuantity: product.totalQuantity,
      totalRevenue: product.totalRevenue,
      orderCount: product.orderCount,
    }));
  }

  /**
   * تحليل الأداء
   */
  async getPerformanceAnalytics() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const metrics = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: lastMonth } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.COMPLETED] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.CANCELLED] }, 1, 0] } },
          returnedOrders: { $sum: { $cond: ['$returnInfo.isReturned', 1, 0] } },
          avgProcessingTime: { $avg: { $subtract: ['$completedAt', '$createdAt'] } },
        },
      },
    ]);

    const result = metrics[0] || {};
    const totalOrders = result.totalOrders || 0;

    return {
      averageProcessingTime: result.avgProcessingTime
        ? result.avgProcessingTime / (1000 * 60 * 60 * 24)
        : 0, // days
      fulfillmentRate: totalOrders > 0 ? (result.completedOrders / totalOrders) * 100 : 0,
      cancellationRate: totalOrders > 0 ? (result.cancelledOrders / totalOrders) * 100 : 0,
      returnRate: totalOrders > 0 ? (result.returnedOrders / totalOrders) * 100 : 0,
      customerSatisfaction: await this.calculateCustomerSatisfaction(),
    };
  }

  /**
   * حساب رضا العملاء من التقييمات
   */
  private async calculateCustomerSatisfaction(): Promise<number> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const ratingStats = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth },
          'ratingInfo.rating': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$ratingInfo.rating' },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    if (ratingStats.length === 0 || !ratingStats[0].averageRating) {
      // إذا لم توجد تقييمات، نرجع متوسط افتراضي بناءً على معدل الإنجاز
      const performanceStats = await this.orderModel.aggregate([
        { $match: { createdAt: { $gte: lastMonth } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            completedOrders: {
              $sum: { $cond: [{ $eq: ['$status', OrderStatus.COMPLETED] }, 1, 0] },
            },
          },
        },
      ]);

      const result = performanceStats[0];
      if (result && result.totalOrders > 0) {
        const completionRate = (result.completedOrders / result.totalOrders) * 100;
        // تحويل معدل الإنجاز إلى تقييم من 1-5
        return Math.max(1, Math.min(5, (completionRate / 100) * 5));
      }
      return 3.5; // متوسط افتراضي
    }

    return Math.round(ratingStats[0].averageRating * 10) / 10; // تقريب إلى منزلة عشرية واحدة
  }

  /**
   * إنشاء تقرير PDF للطلبات
   */
  async generateOrdersPDF(orders: OrderDocument[]): Promise<string> {
    try {
      // جلب بيانات المستخدمين
      const userIds = orders.map((order) => order.userId).filter((id) => id);
      const usersMap = await this.getUsersMap(userIds);

      // إحصائيات سريعة للتقرير
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const completedOrders = orders.filter(
        (order) => order.status === OrderStatus.COMPLETED,
      ).length;
      const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      // إنشاء محتوى HTML للتقرير
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير الطلبات</title>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 20px; direction: rtl; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-box { background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>تقرير الطلبات</h1>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <h3>إجمالي الطلبات</h3>
              <p>${totalOrders}</p>
            </div>
            <div class="stat-box">
              <h3>إجمالي الإيرادات</h3>
              <p>${totalRevenue.toLocaleString()} ريال</p>
            </div>
            <div class="stat-box">
              <h3>معدل الإنجاز</h3>
              <p>${completionRate.toFixed(1)}%</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th>المجموع</th>
                <th>اسم العميل</th>
              </tr>
            </thead>
            <tbody>
              ${orders
                .slice(0, 50)
                .map((order) => {
                  const userInfo = usersMap.get(order.userId.toString()) || {
                    name: 'غير محدد',
                    phone: 'غير محدد',
                  };
                  return `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${order.createdAt?.toLocaleDateString('ar-SA')}</td>
                  <td>${order.status}</td>
                  <td>${order.total?.toLocaleString()} ريال</td>
                  <td>${userInfo.name}</td>
                </tr>
              `;
                })
                .join('')}
            </tbody>
          </table>
          
          ${orders.length > 50 ? `<p style="text-align: center; margin-top: 20px;">عرض أول ${Math.min(50, orders.length)} طلب من إجمالي ${totalOrders} طلب</p>` : ''}
        </body>
        </html>
      `;

      // إنشاء مجلد التقارير إذا لم يكن موجوداً
      const reportsDir = path.join(process.cwd(), 'uploads', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const fileName = `orders-report-${new Date().toISOString().split('T')[0]}.pdf`;
      const filePath = path.join(reportsDir, fileName);

      // إنشاء PDF باستخدام puppeteer
      let browser;
      try {
        // في Windows/Linux المحلي: لا نحدد executablePath (سيجد Chrome تلقائياً)
        // في Docker/VPS: يجب تحديد PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
        const puppeteerExecPath = process.env.PUPPETEER_EXECUTABLE_PATH;
        browser = await puppeteer.launch({
          headless: true,
          ...(puppeteerExecPath && puppeteerExecPath !== 'temp-invoices'
            ? { executablePath: puppeteerExecPath }
            : {}),
          timeout: 60000, // زيادة timeout إلى 60 ثانية
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-blink-features=AutomationControlled',
            '--single-process', // مهم لـ Docker
          ],
        });

        const page = await browser.newPage();
        // استخدام 'load' بدلاً من 'networkidle0' لأنه أسرع وأكثر موثوقية
        await page.setContent(htmlContent, { waitUntil: 'load', timeout: 30000 });

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm',
          },
        });

        // حفظ الملف
        fs.writeFileSync(filePath, pdfBuffer);

        // إرسال إشعار INVOICE_CREATED للمدراء
        if (orders.length > 0) {
          await this.notifyAdmins(
            NotificationType.INVOICE_CREATED,
            'فاتورة جديدة',
            `تم إنشاء فاتورة PDF تحتوي على ${orders.length} طلب`,
            `Invoice PDF created with ${orders.length} order(s)`,
            {
              fileName,
              filePath: `/uploads/reports/${fileName}`,
              orderCount: orders.length,
              totalRevenue,
              orderIds: orders.map((o) => o._id.toString()),
            },
          );
        }

        // إرجاع المسار النسبي للوصول من الويب
        return `/uploads/reports/${fileName}`;
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error generating PDF report', {
        error: err.message,
        stack: err.stack,
        ordersCount: orders.length,
      });

      if (error instanceof OrderException) {
        throw error;
      }

      throw new OrderPdfGenerationFailedException({
        ordersCount: orders.length,
        error: err.message,
      });
    }
  }

  /**
   * إنشاء ملف Excel للطلبات
   */
  async generateOrdersExcel(orders: OrderDocument[]): Promise<string> {
    try {
      // جلب بيانات المستخدمين
      const userIds = orders.map((order) => order.userId).filter((id) => id);
      const usersMap = await this.getUsersMap(userIds);

      // إنشاء البيانات للتقرير
      const excelData = orders.map((order) => {
        const userInfo = usersMap.get(order.userId.toString()) || {
          name: 'غير محدد',
          phone: 'غير محدد',
        };

        return {
          'رقم الطلب': order.orderNumber,
          'تاريخ الطلب': order.createdAt?.toLocaleDateString('ar-SA'),
          الحالة: order.status,
          المجموع: order.total,
          العملة: order.currency,
          'اسم العميل': userInfo.name,
          'رقم الهاتف': userInfo.phone,
          المدينة: order.deliveryAddress?.city || 'غير محدد',
          'طريقة الدفع': order.paymentMethod,
          'عدد المنتجات': order.items?.length || 0,
          التقييم: order.ratingInfo?.rating || 'غير مقيم',
        };
      });

      // إنشاء مجلد التقارير إذا لم يكن موجوداً
      const reportsDir = path.join(process.cwd(), 'uploads', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const fileName = `orders-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      const filePath = path.join(reportsDir, fileName);

      // إنشاء ملف Excel باستخدام xlsx
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // تنسيق الأعمدة
      const columnWidths = [
        { wch: 15 }, // رقم الطلب
        { wch: 12 }, // تاريخ الطلب
        { wch: 12 }, // الحالة
        { wch: 12 }, // المجموع
        { wch: 8 }, // العملة
        { wch: 20 }, // اسم العميل
        { wch: 15 }, // رقم الهاتف
        { wch: 15 }, // المدينة
        { wch: 15 }, // طريقة الدفع
        { wch: 12 }, // عدد المنتجات
        { wch: 10 }, // التقييم
      ];

      worksheet['!cols'] = columnWidths;

      // إنشاء workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير الطلبات');

      // حفظ الملف
      XLSX.writeFile(workbook, filePath);

      // إرجاع المسار النسبي للوصول من الويب
      return `/uploads/reports/${fileName}`;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error generating Excel report', {
        error: err.message,
        stack: err.stack,
        ordersCount: orders.length,
      });

      if (error instanceof OrderException) {
        throw error;
      }

      throw new OrderExcelGenerationFailedException({
        ordersCount: orders.length,
        error: err.message,
      });
    }
  }

  /**
   * التقرير المالي
   */
  async generateFinancialReport() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const financialData = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: lastMonth } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          totalDiscounts: { $sum: '$totalDiscount' },
          totalRefunds: {
            $sum: { $cond: ['$returnInfo.isReturned', '$returnInfo.returnAmount', 0] },
          },
          totalShipping: { $sum: '$shippingCost' },
        },
      },
    ]);

    const result = financialData[0] || {};
    const totalRevenue = result.totalRevenue || 0;
    const totalRefunds = result.totalRefunds || 0;
    const netRevenue = totalRevenue - totalRefunds;

    return {
      totalRevenue,
      totalOrders: result.totalOrders || 0,
      averageOrderValue: result.totalOrders > 0 ? totalRevenue / result.totalOrders : 0,
      refunds: totalRefunds,
      netRevenue,
      profitMargin: totalRevenue > 0 ? (netRevenue / totalRevenue) * 100 : 0,
      totalDiscounts: result.totalDiscounts || 0,
      totalShipping: result.totalShipping || 0,
    };
  }

  /**
   * الحصول على إحصائيات الطلبات الأساسية (للإدارة)
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    onHold: number;
    cancelled: number;
    returned: number;
    refunded: number;
    totalRevenue: number;
    averageOrderValue: number;
  }> {
    try {
      // استخدام match أولاً للتأكد من وجود userId صالح
      const stats = await this.orderModel.aggregate([
        {
          $match: {
            userId: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.PENDING_PAYMENT] }, 1, 0] } },
            processing: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.PROCESSING] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.COMPLETED] }, 1, 0] } },
            onHold: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.ON_HOLD] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.CANCELLED] }, 1, 0] } },
            returned: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.RETURNED] }, 1, 0] } },
            refunded: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.REFUNDED] }, 1, 0] } },
            totalRevenue: {
              $sum: { $cond: [{ $eq: ['$status', OrderStatus.COMPLETED] }, '$total', 0] },
            },
            orderValues: {
              $push: { $cond: [{ $eq: ['$status', OrderStatus.COMPLETED] }, '$total', null] },
            },
          },
        },
      ]);

      const result = stats[0] || {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        onHold: 0,
        cancelled: 0,
        returned: 0,
        refunded: 0,
        totalRevenue: 0,
        orderValues: [],
      };

      // حساب متوسط قيمة الطلب
      const validOrderValues = result.orderValues.filter((value: number | null) => value !== null);
      const averageOrderValue =
        validOrderValues.length > 0
          ? validOrderValues.reduce((sum: number, value: number) => sum + value, 0) /
            validOrderValues.length
          : 0;

      return {
        total: result.total,
        pending: result.pending,
        processing: result.processing,
        completed: result.completed,
        onHold: result.onHold,
        cancelled: result.cancelled,
        returned: result.returned,
        refunded: result.refunded,
        totalRevenue: result.totalRevenue,
        averageOrderValue,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`Error getting order stats: ${errorMessage}`, errorStack);
      // في حالة حدوث خطأ، نعيد قيم افتراضية
      return {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        onHold: 0,
        cancelled: 0,
        returned: 0,
        refunded: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
      };
    }
  }

  /**
   * تصدير تحليلات الطلبات
   */
  async exportOrderAnalytics(
    format: string,
    params: OrderAnalyticsDto,
    fromDate?: string,
    toDate?: string,
  ) {
    this.logger.log('Exporting order analytics:', { format, params, fromDate, toDate });

    // Get analytics data
    const analytics = await this.getAdminAnalytics(params);

    // Get revenue analytics if date range provided
    let revenueAnalytics = null;
    if (fromDate && toDate) {
      revenueAnalytics = await this.getRevenueAnalytics({
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
      });
    }

    // Get performance analytics
    const performanceAnalytics = await this.getPerformanceAnalytics();

    // Generate filename
    const fileName = `order_analytics_${Date.now()}.${format}`;

    return {
      success: true,
      data: {
        fileUrl: `https://api.example.com/exports/${fileName}`,
        format,
        exportedAt: new Date().toISOString(),
        fileName,
        recordCount: analytics.totalOrders,
        summary: {
          totalOrders: analytics.totalOrders,
          totalRevenue: analytics.totalRevenue,
          averageOrderValue: analytics.averageOrderValue,
          byStatus: analytics.ordersByStatus,
          performance: performanceAnalytics,
          ...(revenueAnalytics && { revenue: revenueAnalytics }),
        },
      },
    };
  }

  /**
   * مطابقة الدفع المحلي
   */
  async verifyLocalPayment(
    orderId: string,
    dto: VerifyPaymentDto,
    adminId: string,
  ): Promise<Order> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new OrderNotFoundException();
    }

    if (!order.localPaymentAccountId) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, {
        reason: 'not_local_payment_order',
        message: 'هذا الطلب لا يستخدم الدفع المحلي',
      });
    }

    // التحقق من العملة (يمكن إضافة تحويل عملة هنا إذا لزم الأمر)
    if (dto.verifiedCurrency !== order.currency) {
      // في هذه الحالة، قد نحتاج إلى تحويل العملة أو رفضها
      // لأغراض بسيطة، سنرفض إذا كانت العملة مختلفة
      throw new DomainException(ErrorCode.VALIDATION_ERROR, {
        reason: 'currency_mismatch',
        message: `عملة المطابقة (${dto.verifiedCurrency}) لا تطابق عملة الطلب (${order.currency})`,
      });
    }

    // مقارنة المبلغ
    const isAmountSufficient = dto.verifiedAmount >= order.total;

    // تحديث معلومات المطابقة
    order.verifiedPaymentAmount = dto.verifiedAmount;
    order.verifiedPaymentCurrency = dto.verifiedCurrency;
    order.paymentVerifiedAt = new Date();
    order.paymentVerifiedBy = new Types.ObjectId(adminId);
    order.paymentVerificationNotes = dto.notes;

    if (isAmountSufficient) {
      const oldPaymentStatus = order.paymentStatus;
      const newPaymentStatus = PaymentStatus.PAID;
      order.paymentStatus = newPaymentStatus;
      order.paidAt = new Date();

      // تسجيل حدث الدفع الناجح في audit
      if (this.auditService) {
        this.auditService
          .logPaymentEvent({
            userId: String(order.userId),
            orderId: String(order._id),
            action: oldPaymentStatus !== newPaymentStatus ? 'status_changed' : 'completed',
            paymentMethod: order.paymentMethod || 'LOCAL',
            amount: dto.verifiedAmount,
            currency: dto.verifiedCurrency,
            transactionId: order.paymentReference,
            failureReason:
              oldPaymentStatus !== newPaymentStatus
                ? `Payment status changed from ${oldPaymentStatus} to ${newPaymentStatus}`
                : undefined,
          })
          .catch((err) => this.logger.error('Failed to log local payment verification', err));
      }

      // تحديث حالة الطلب إذا كان في انتظار الدفع
      if (order.status === OrderStatus.PENDING_PAYMENT) {
        order.status = OrderStatus.CONFIRMED;
        order.confirmedAt = new Date();
      }

      // إضافة إلى سجل الحالات
      await this.addStatusHistory(
        order,
        order.status,
        new Types.ObjectId(adminId),
        'admin',
        `تم قبول الدفع - المبلغ: ${dto.verifiedAmount} ${dto.verifiedCurrency}${dto.notes ? ` - ${dto.notes}` : ''}`,
      );
    } else {
      const oldPaymentStatus = order.paymentStatus;
      const newPaymentStatus = PaymentStatus.FAILED;
      order.paymentStatus = newPaymentStatus;

      // تسجيل حدث فشل الدفع في audit
      if (this.auditService) {
        const failureMessage = `Insufficient amount: ${dto.verifiedAmount} < ${order.total}`;
        this.auditService
          .logPaymentEvent({
            userId: String(order.userId),
            orderId: String(order._id),
            action: oldPaymentStatus !== newPaymentStatus ? 'status_changed' : 'failed',
            paymentMethod: order.paymentMethod || 'LOCAL',
            amount: dto.verifiedAmount,
            currency: dto.verifiedCurrency,
            transactionId: order.paymentReference,
            failureReason:
              oldPaymentStatus !== newPaymentStatus
                ? `Payment status changed from ${oldPaymentStatus} to ${newPaymentStatus}. ${failureMessage}`
                : failureMessage,
          })
          .catch((err) =>
            this.logger.error('Failed to log local payment verification failure', err),
          );
      }

      // إضافة إلى سجل الحالات (نبقي الطلب في حالته الحالية)
      await this.addStatusHistory(
        order,
        order.status,
        new Types.ObjectId(adminId),
        'admin',
        `تم رفض الدفع - المبلغ غير كافٍ: ${dto.verifiedAmount} ${dto.verifiedCurrency} (المطلوب: ${order.total} ${order.currency})${dto.notes ? ` - ${dto.notes}` : ''}`,
      );
    }

    await order.save();
    this.logger.log(
      `Payment verification for order ${order.orderNumber}: ${isAmountSufficient ? 'APPROVED' : 'REJECTED'}`,
    );
    return order;
  }

  /**
   * تصدير قائمة الطلبات
   */
  async exportOrders(format: string, query: ListOrdersDto) {
    this.logger.log('Exporting orders list:', { format, query });

    // Get orders list with filters
    const { orders, pagination } = await this.getAllOrders(query);

    // Generate filename
    const fileName = `orders_list_${Date.now()}.${format}`;

    // Get summary statistics
    const stats = await this.getStats();

    return {
      success: true,
      data: {
        fileUrl: `https://api.example.com/exports/${fileName}`,
        format,
        exportedAt: new Date().toISOString(),
        fileName,
        recordCount: pagination.total,
        summary: {
          totalOrders: pagination.total,
          exportedOrders: orders.length,
          filters: query,
          stats,
        },
      },
    };
  }

  /**
   * معالجة إكمال الطلب - إنشاء وإرسال الفاتورة
   */
  private async handleOrderCompletion(orderId: string): Promise<void> {
    let orderNumber = orderId; // للاستخدام في catch block
    try {
      // جلب نسخة جديدة من الطلب لتجنب ParallelSaveError
      const order = await this.orderModel.findById(orderId);
      if (!order) {
        this.logger.warn(`Order ${orderId} not found for completion handling`);
        return;
      }

      orderNumber = order.orderNumber; // حفظ orderNumber للاستخدام في catch block

      // إرسال الفاتورة (إذا لم يتم إرسالها مسبقاً عند CONFIRMED)
      // الفاتورة تُرسل الآن عند CONFIRMED و COMPLETED، لذا نتأكد من عدم إرسالها مرتين
      // (يمكن إزالة هذا إذا أردت إرسالها في كلا الحالتين)
      // تم نقل منطق إرسال الفاتورة إلى sendOrderInvoiceForStatus

      // معالجة عمولات الكوبونات المرتبطة بالمهندسين
      if (order.appliedCouponCodes && order.appliedCouponCodes.length > 0) {
        for (const couponCode of order.appliedCouponCodes) {
          const couponInfo = order.appliedCoupons?.find((c) => c.code === couponCode);
          if (couponInfo) {
            try {
              const commissionResult = await this.marketingService.recordCouponUsage({
                couponCode,
                orderId: String(order._id),
                userId: String(order.userId),
                discountAmount: couponInfo.discount,
                orderTotal: order.total,
              });

              if (commissionResult) {
                // إضافة العمولة لرصيد المهندس
                await this.addCommissionToEngineer(
                  commissionResult.engineerId,
                  commissionResult.commissionAmount,
                  String(order._id),
                  couponCode,
                );
              }
            } catch (error) {
              this.logger.error(`Failed to process commission for coupon ${couponCode}:`, error);
            }
          }
        }
      }

      // تحديث salesCount للمنتجات والـ variants
      try {
        const productSalesMap = new Map<string, number>();
        const variantSalesMap = new Map<string, number>();

        // تجميع الكميات المباعة لكل منتج و variant
        for (const item of order.items) {
          const productId = item.productId.toString();
          const currentProductSales = productSalesMap.get(productId) || 0;
          productSalesMap.set(productId, currentProductSales + item.qty);

          if (item.variantId) {
            const variantId = item.variantId.toString();
            const currentVariantSales = variantSalesMap.get(variantId) || 0;
            variantSalesMap.set(variantId, currentVariantSales + item.qty);
          }
        }

        // تحديث salesCount للمنتجات
        for (const [productId, qty] of productSalesMap.entries()) {
          await this.productService.incrementSalesCount(productId, qty);
        }

        // تحديث salesCount للـ variants
        for (const [variantId, qty] of variantSalesMap.entries()) {
          await this.variantService.incrementSalesCount(variantId, qty);
        }

        this.logger.log(`Updated salesCount for order ${order.orderNumber}`);
      } catch (error) {
        this.logger.error(`Failed to update salesCount for order ${order.orderNumber}:`, error);
        // لا نرمي خطأ هنا حتى لا نوقف عملية إكمال الطلب
      }

      this.logger.log(`Order completion handled successfully for ${order.orderNumber}`);
    } catch (error) {
      this.logger.error(`Error handling order completion for ${orderNumber}:`, error);
      // لا نرمي خطأ هنا حتى لا نوقف عملية تحديث الحالة
    }
  }

  /**
   * إضافة العمولة لرصيد المهندس
   */
  private async addCommissionToEngineer(
    engineerId: string,
    amount: number,
    orderId: string,
    couponCode: string,
  ): Promise<void> {
    try {
      const engineer = await this.userModel.findById(engineerId);
      if (!engineer) {
        this.logger.warn(`Engineer ${engineerId} not found for commission`);
        return;
      }

      // تحديث الرصيد
      engineer.walletBalance = (engineer.walletBalance || 0) + amount;

      // إضافة سجل المعاملة
      engineer.commissionTransactions = engineer.commissionTransactions || [];
      engineer.commissionTransactions.push({
        transactionId: `COMM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'commission',
        amount,
        orderId: new Types.ObjectId(orderId),
        couponCode,
        description: `عمولة من كوبون ${couponCode}`,
        createdAt: new Date(),
      });

      await engineer.save();

      this.logger.log(
        `Added commission ${amount} to engineer ${engineerId} from coupon ${couponCode}`,
      );
    } catch (error) {
      this.logger.error(`Failed to add commission to engineer ${engineerId}:`, error);
    }
  }

  /**
   * إنشاء فاتورة PDF لطلب واحد
   */
  private async generateOrderInvoicePDF(order: OrderDocument): Promise<Buffer> {
    try {
      // جلب بيانات المستخدم
      const user = await this.userModel.findById(order.userId);

      // تحديد نوع الحساب
      const getAccountType = (): string => {
        if (order.accountType) {
          // إذا كان موجود في Order، استخدمه مع الترجمة
          const accountTypeMap: Record<string, string> = {
            retail: 'عميل',
            merchant: 'تاجر',
            engineer: 'مهندس',
            user: 'عميل',
            admin: 'مدير',
            super_admin: 'مدير عام',
          };
          return accountTypeMap[order.accountType] || order.accountType;
        }

        if (user) {
          // تحديد من roles
          if (user.roles?.includes(UserRole.MERCHANT) || user.merchant_capable) {
            return 'تاجر';
          }
          if (user.roles?.includes(UserRole.ENGINEER) || user.engineer_capable) {
            return 'مهندس';
          }
          if (user.roles?.includes(UserRole.ADMIN) || user.roles?.includes(UserRole.SUPER_ADMIN)) {
            return user.roles.includes(UserRole.SUPER_ADMIN) ? 'مدير عام' : 'مدير';
          }
          return 'عميل';
        }

        return 'غير محدد';
      };

      const userInfo = user
        ? {
            name:
              (user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.firstName || user.lastName) ||
              order.customerName ||
              'غير محدد',
            phone: user.phone || order.customerPhone || 'غير محدد',
            accountType: getAccountType(),
          }
        : {
            name: order.customerName || 'غير محدد',
            phone: order.customerPhone || 'غير محدد',
            accountType: getAccountType(),
          };

      // مسار ترويسة الشركة (PNG شفاف)
      const assetsDir = this.configService?.get('ASSETS_DIR') || 'assets';
      const letterheadPath = path.join(process.cwd(), assetsDir, 'letterhead.png');
      let letterheadBase64 = '';

      if (fs.existsSync(letterheadPath)) {
        const letterheadBuffer = fs.readFileSync(letterheadPath);
        letterheadBase64 = `data:image/png;base64,${letterheadBuffer.toString('base64')}`;
      }

      // تنسيق التاريخ
      const formatDate = (date?: Date) => {
        if (!date) return 'غير محدد';
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      // تنسيق المبلغ
      const formatCurrency = (amount: number, currency: string) => {
        return `${amount.toLocaleString('en-US')} ${currency}`;
      };

      // حساب خصم التاجر (الفرق بين basePrice و finalPrice لكل منتج)
      let totalMerchantDiscount = 0;
      let totalPromotionDiscount = 0;
      const itemsWithPromotions: Array<{ name: string; promotionId?: any; discount: number }> = [];

      order.items.forEach((item) => {
        // حساب الخصم الإجمالي للمنتج
        const itemDiscount = (item.basePrice - item.finalPrice) * item.qty;

        // إذا كان هناك عرض مطبق، اجعله من خصم العرض
        if (item.appliedPromotionId) {
          const promotionDiscount = item.promotionDiscount * item.qty;
          totalPromotionDiscount += promotionDiscount;
          itemsWithPromotions.push({
            name: item.snapshot?.name || 'منتج',
            promotionId: item.appliedPromotionId,
            discount: promotionDiscount,
          });
          // باقي الخصم يعتبر خصم تاجر
          totalMerchantDiscount += itemDiscount - promotionDiscount;
        } else {
          // بدون عرض، كل الخصم يعتبر خصم تاجر
          totalMerchantDiscount += itemDiscount;
        }
      });

      // إنشاء محتوى HTML للفاتورة
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>فاتورة ${order.orderNumber}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Arial', 'Tahoma', sans-serif;
              direction: rtl;
              padding: 0;
              margin: 0;
              ${letterheadBase64 ? `background-image: url('${letterheadBase64}');` : 'background: #fff;'}
              background-size: cover;
              background-repeat: no-repeat;
              background-position: center;
              background-attachment: fixed;
              color: #333;
              font-size: 12px;
              line-height: 1.6;
              position: relative;
              min-height: 100vh;
            }
            body::before {
              content: '';
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              ${letterheadBase64 ? `background-image: url('${letterheadBase64}');` : ''}
              background-size: cover;
              background-repeat: no-repeat;
              background-position: center;
              z-index: 0;
              pointer-events: none;
            }
            body > * {
              position: relative;
              z-index: 1;
            }
            .invoice-info, .delivery-info, .items-table, .totals-section, .footer,
            div[style*="background: #fff3cd"], .discounts-section {
              background: rgba(255, 255, 255, 0.95);
            }
            .info-box {
              background: rgba(245, 245, 245, 0.95);
            }
            .discounts-section {
              margin-top: 20px;
              padding: 15px;
              background: rgba(227, 242, 253, 0.95);
              border-radius: 5px;
              border-right: 4px solid #1976d2;
            }
            .discounts-section h3 {
              color: #1976d2;
              margin-bottom: 15px;
              font-size: 14px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .discount-item {
              margin: 8px 0;
              padding: 8px;
              background: rgba(255, 255, 255, 0.7);
              border-radius: 3px;
              font-size: 12px;
            }
            .product-attributes {
              margin-top: 5px;
              font-size: 10px;
              color: #666;
              line-height: 1.5;
            }
            .product-attributes span {
              margin-left: 8px;
              display: inline-block;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              flex-wrap: wrap;
            }
            .info-box {
              flex: 1;
              min-width: 200px;
              margin: 10px;
              padding: 15px;
              background: #f5f5f5;
              border-radius: 5px;
            }
            .info-box h3 {
              color: #1976d2;
              margin-bottom: 10px;
              font-size: 14px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .info-box p {
              margin: 5px 0;
              font-size: 12px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: #fff;
            }
            .items-table th {
              background: #1976d2;
              color: #fff;
              padding: 12px;
              text-align: right;
              font-weight: bold;
              font-size: 13px;
            }
            .items-table td {
              padding: 10px;
              border: 1px solid #ddd;
              text-align: right;
              font-size: 12px;
            }
            .items-table tr:nth-child(even) {
              background: #f9f9f9;
            }
            .totals-section {
              margin-top: 30px;
              display: flex;
              justify-content: flex-end;
            }
            .totals-box {
              width: 350px;
              border: 2px solid #1976d2;
              border-radius: 5px;
              padding: 15px;
              background: #f9f9f9;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #ddd;
            }
            .total-row:last-child {
              border-bottom: none;
              border-top: 2px solid #1976d2;
              margin-top: 10px;
              padding-top: 10px;
              font-weight: bold;
              font-size: 16px;
              color: #1976d2;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 11px;
            }
            .delivery-info {
              margin-top: 20px;
              padding: 15px;
              background: #e3f2fd;
              border-radius: 5px;
              border-right: 4px solid #1976d2;
            }
            .delivery-info h3 {
              color: #1976d2;
              margin-bottom: 10px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-info">
            <div class="info-box">
              <h3>معلومات الفاتورة</h3>
              <p><strong>رقم الفاتورة:</strong> ${order.invoiceNumber || order.orderNumber}</p>
              <p><strong>رقم الطلب:</strong> ${order.orderNumber}</p>
              <p><strong>تاريخ الفاتورة:</strong> ${formatDate(order.completedAt || order.createdAt)}</p>
              <p><strong>تاريخ الطلب:</strong> ${formatDate(order.createdAt)}</p>
            </div>
            
            <div class="info-box">
              <h3>معلومات العميل</h3>
              <p><strong>الاسم:</strong> ${userInfo.name}</p>
              <p><strong>الهاتف:</strong> ${userInfo.phone}</p>
              <p><strong>نوع الحساب:</strong> ${userInfo.accountType}</p>
            </div>
          </div>

          <div class="delivery-info">
            <h3>عنوان التوصيل</h3>
            <p><strong>المستلم:</strong> ${order.deliveryAddress?.recipientName || userInfo.name}</p>
            <p><strong>الهاتف:</strong> ${order.deliveryAddress?.recipientPhone || userInfo.phone}</p>
            <p><strong>العنوان:</strong> ${order.deliveryAddress?.line1 || ''} ${order.deliveryAddress?.line2 || ''}</p>
            <p><strong>المدينة:</strong> ${order.deliveryAddress?.city || ''}</p>
            <p><strong>المنطقة:</strong> ${order.deliveryAddress?.region || 'غير محدد'}</p>
            ${order.deliveryAddress?.postalCode ? `<p><strong>الرمز البريدي:</strong> ${order.deliveryAddress.postalCode}</p>` : ''}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر الوحدة</th>
                <th>الخصم</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map((item, index) => {
                  // تجميع السمات
                  const attributes: string[] = [];

                  // إضافة attributes (Record<string, string>)
                  if (item.snapshot?.attributes) {
                    Object.entries(item.snapshot.attributes).forEach(([key, value]) => {
                      attributes.push(`${key}: ${value}`);
                    });
                  }

                  // إضافة variantAttributes (Array) - قد يكون موجود في البيانات الفعلية رغم عدم وجوده في النوع
                  const snapshotAny = item.snapshot as any;
                  if (
                    snapshotAny?.variantAttributes &&
                    Array.isArray(snapshotAny.variantAttributes)
                  ) {
                    snapshotAny.variantAttributes.forEach((attr: any) => {
                      const attrName = attr.attributeName || attr.attributeNameEn || 'Attribute';
                      const attrValue = attr.value || attr.valueEn || 'N/A';
                      attributes.push(`${attrName}: ${attrValue}`);
                    });
                  }

                  // تحديد إذا كان هناك عرض مطبق
                  const hasPromotion = item.appliedPromotionId ? ' (عرض مطبق)' : '';

                  return `
                <tr>
                  <td>${index + 1}</td>
                  <td>
                    <strong>${item.snapshot?.name || 'منتج'}${hasPromotion}</strong><br/>
                    ${item.snapshot?.sku ? `<small>SKU: ${item.snapshot.sku}</small><br/>` : ''}
                    ${item.snapshot?.brandName ? `<small>العلامة: ${item.snapshot.brandName}</small><br/>` : ''}
                    ${
                      attributes.length > 0
                        ? `
                    <div class="product-attributes">
                      ${attributes.map((attr) => `<span>${attr}</span>`).join(' • ')}
                    </div>
                    `
                        : ''
                    }
                  </td>
                  <td>${item.qty}</td>
                  <td>${formatCurrency(item.finalPrice, order.currency)}</td>
                  <td>${item.discount > 0 ? formatCurrency(item.discount, order.currency) : '-'}</td>
                  <td><strong>${formatCurrency(item.lineTotal, order.currency)}</strong></td>
                </tr>
              `;
                })
                .join('')}
            </tbody>
          </table>

          ${
            itemsWithPromotions.length > 0 ||
            (order.appliedCoupons && order.appliedCoupons.length > 0) ||
            (order.autoAppliedCoupons && order.autoAppliedCoupons.length > 0)
              ? `
          <div class="discounts-section">
            <h3>العروض والكوبونات المطبقة</h3>
            
            ${
              itemsWithPromotions.length > 0
                ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #1976d2;">العروض المطبقة على المنتجات:</strong>
              ${itemsWithPromotions
                .map(
                  (promo) => `
                <div class="discount-item">
                  ${promo.name}: خصم ${formatCurrency(promo.discount, order.currency)}
                </div>
              `,
                )
                .join('')}
            </div>
            `
                : ''
            }
            
            ${
              order.appliedCoupons && order.appliedCoupons.length > 0
                ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #1976d2;">الكوبونات المطبقة:</strong>
              ${order.appliedCoupons
                .map((coupon: any) => {
                  const couponType =
                    coupon.details?.type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت';
                  const couponValue =
                    coupon.details?.type === 'percentage'
                      ? `${coupon.details?.discountPercentage || 0}%`
                      : formatCurrency(coupon.details?.discountAmount || 0, order.currency);
                  return `
                <div class="discount-item">
                  <strong>${coupon.details?.title || coupon.code || 'كوبون'}</strong> (${couponType}: ${couponValue}) - خصم ${formatCurrency(coupon.discount, order.currency)}
                </div>
              `;
                })
                .join('')}
            </div>
            `
                : ''
            }
            
            ${
              order.autoAppliedCoupons && order.autoAppliedCoupons.length > 0
                ? `
            <div>
              <strong style="color: #1976d2;">الكوبونات التلقائية:</strong>
              ${order.autoAppliedCoupons
                .map(
                  (coupon: any) => `
                <div class="discount-item">
                  ${coupon.code || 'كوبون تلقائي'}: خصم ${formatCurrency(coupon.discount || 0, order.currency)}
                </div>
              `,
                )
                .join('')}
            </div>
            `
                : ''
            }
          </div>
          `
              : ''
          }

          <div class="totals-section">
            <div class="totals-box">
              <div class="total-row">
                <span>المجموع الفرعي:</span>
                <span>${formatCurrency(order.subtotal, order.currency)}</span>
              </div>
              ${
                totalMerchantDiscount > 0
                  ? `
              <div class="total-row">
                <span>خصم التاجر:</span>
                <span>- ${formatCurrency(totalMerchantDiscount, order.currency)}</span>
              </div>
              `
                  : ''
              }
              ${
                totalPromotionDiscount > 0
                  ? `
              <div class="total-row">
                <span>خصم العروض:</span>
                <span>- ${formatCurrency(totalPromotionDiscount, order.currency)}</span>
              </div>
              `
                  : ''
              }
              ${
                order.itemsDiscount > 0 &&
                totalMerchantDiscount + totalPromotionDiscount !== order.itemsDiscount
                  ? `
              <div class="total-row">
                <span>خصم إضافي على المنتجات:</span>
                <span>- ${formatCurrency(order.itemsDiscount - totalMerchantDiscount - totalPromotionDiscount, order.currency)}</span>
              </div>
              `
                  : ''
              }
              ${
                order.couponDiscount > 0 ||
                (order.autoDiscountsTotal && order.autoDiscountsTotal > 0)
                  ? `
              <div class="total-row">
                <span>خصم الكوبونات:</span>
                <span>- ${formatCurrency((order.couponDiscount || 0) + (order.autoDiscountsTotal || 0), order.currency)}</span>
              </div>
              `
                  : ''
              }
              ${
                order.shippingCost > 0
                  ? `
              <div class="total-row">
                <span>تكلفة الشحن:</span>
                <span>${formatCurrency(order.shippingCost, order.currency)}</span>
              </div>
              `
                  : ''
              }
              ${
                order.tax > 0
                  ? `
              <div class="total-row">
                <span>الضريبة (${order.taxRate}%):</span>
                <span>${formatCurrency(order.tax, order.currency)}</span>
              </div>
              `
                  : ''
              }
              <div class="total-row">
                <span>المجموع الكلي:</span>
                <span>${formatCurrency(order.total, order.currency)}</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 5px; border-right: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-bottom: 10px;">معلومات الدفع</h3>
            <p><strong>طريقة الدفع:</strong> ${order.paymentMethod === PaymentMethod.COD ? 'الدفع عند الاستلام' : order.paymentMethod === PaymentMethod.BANK_TRANSFER ? 'تحويل بنكي' : order.paymentMethod}</p>
            <p><strong>حالة الدفع:</strong> ${order.paymentStatus === PaymentStatus.PAID ? 'مدفوع ✓' : order.paymentStatus}</p>
            ${order.paidAt ? `<p><strong>تاريخ الدفع:</strong> ${formatDate(order.paidAt)}</p>` : ''}
            ${order.trackingNumber ? `<p><strong>رقم التتبع:</strong> ${order.trackingNumber}</p>` : ''}
            ${order.shippingCompany ? `<p><strong>شركة الشحن:</strong> ${order.shippingCompany}</p>` : ''}
          </div>

          <div class="footer">
            <p>شكراً لاختياركم خدماتنا</p>
            <p>Thank you for choosing our services</p>
            <p style="margin-top: 10px; color: #999;">تم إنشاء هذه الفاتورة تلقائياً من نظام إدارة الطلبات</p>
            <p style="color: #999;">This invoice was automatically generated by the order management system</p>
          </div>
        </body>
        </html>
      `;

      // إنشاء PDF باستخدام puppeteer
      // في Windows/Linux المحلي: undefined (سيجد Chrome تلقائياً)
      // في Docker/VPS: يجب تحديد PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
      const puppeteerExecPath = process.env.PUPPETEER_EXECUTABLE_PATH;
      const browser = await puppeteer.launch({
        headless: true,
        ...(puppeteerExecPath && puppeteerExecPath !== 'temp-invoices'
          ? { executablePath: puppeteerExecPath }
          : {}),
        timeout: 60000, // زيادة timeout إلى 60 ثانية
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-blink-features=AutomationControlled',
          '--single-process', // مهم لـ Docker
        ],
      });

      try {
        const page = await browser.newPage();
        // استخدام 'load' بدلاً من 'networkidle0' لأنه أسرع وأكثر موثوقية
        await page.setContent(htmlContent, { waitUntil: 'load', timeout: 30000 });

        const pdfData = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '10mm',
            right: '15mm',
            bottom: '15mm',
            left: '15mm',
          },
        });

        return Buffer.from(pdfData);
      } finally {
        await browser.close();
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error generating order invoice PDF', {
        error: err.message,
        stack: err.stack,
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      });
      throw new OrderPdfGenerationFailedException({
        ordersCount: 1,
        error: err.message,
      });
    }
  }

  /**
   * إرسال الفاتورة عند تغيير الحالة (CONFIRMED أو COMPLETED)
   */
  private async sendOrderInvoiceForStatus(orderId: string): Promise<void> {
    let orderNumber = orderId; // للاستخدام في catch block
    try {
      // جلب نسخة جديدة من الطلب لتجنب ParallelSaveError
      const order = await this.orderModel.findById(orderId);
      if (!order) {
        this.logger.warn(`Order ${orderId} not found for invoice sending`);
        return;
      }

      orderNumber = order.orderNumber;

      // التحقق من أن الفاتورة لم يتم إرسالها مسبقاً (اختياري - يمكن إزالة هذا إذا أردت إعادة الإرسال)
      // يمكن إضافة حقل `invoiceSentAt` لتتبع ذلك

      // إنشاء رقم فاتورة إذا لم يكن موجوداً
      if (!order.invoiceNumber) {
        const year = new Date().getFullYear();
        const count = await this.orderModel.countDocuments({
          invoiceNumber: { $exists: true },
          createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) },
        });
        order.invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, '0')}`;
        await order.save();
      }

      // إنشاء PDF الفاتورة
      const pdfBuffer = await this.generateOrderInvoicePDF(order);
      this.logger.log(
        `PDF generated successfully for order ${order.orderNumber}, size: ${pdfBuffer.length} bytes`,
      );

      // حفظ PDF مؤقت للتأكد من الإنشاء (للتطوير فقط)
      try {
        const tempInvoicesDir = this.configService?.get('TEMP_INVOICES_DIR') || 'temp-invoices';
        const tempPdfPath = path.join(
          process.cwd(),
          tempInvoicesDir,
          `invoice-${order.orderNumber}-${Date.now()}.pdf`,
        );
        const tempDir = path.dirname(tempPdfPath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        fs.writeFileSync(tempPdfPath, pdfBuffer);
        this.logger.log(`PDF saved temporarily at: ${tempPdfPath}`);
      } catch (saveError) {
        this.logger.warn(`Failed to save temporary PDF for order ${order.orderNumber}:`, saveError);
        // لا نوقف العملية إذا فشل الحفظ المؤقت
      }

      // إرسال الفاتورة عبر البريد الإلكتروني
      await this.sendOrderInvoiceEmail(order, pdfBuffer);

      this.logger.log(`Invoice sent successfully for order ${order.orderNumber}`);
    } catch (error) {
      this.logger.error(`Error sending invoice for order ${orderNumber}:`, error);
      // لا نرمي خطأ هنا حتى لا نوقف عملية تحديث الحالة
    }
  }

  /**
   * إرسال فاتورة الطلب عبر البريد الإلكتروني
   */
  private async sendOrderInvoiceEmail(order: OrderDocument, pdfBuffer: Buffer): Promise<void> {
    try {
      if (!this.emailAdapter || !this.emailAdapter.isInitialized()) {
        this.logger.warn('Email adapter not initialized. Cannot send invoice email.');
        return;
      }

      // جلب بيانات المستخدم للحصول على الاسم الكامل
      const user = await this.userModel.findById(order.userId);
      const customerName = user
        ? user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.lastName || order.customerName || 'N/A'
        : order.customerName || 'N/A';

      const customerPhone =
        user?.phone || order.customerPhone || order.deliveryAddress?.recipientPhone || 'N/A';

      // تنسيق العنوان الكامل
      const formatDeliveryAddress = () => {
        const addr = order.deliveryAddress;
        if (!addr) return 'N/A';

        const parts: string[] = [];
        if (addr.recipientName) parts.push(`Recipient: ${addr.recipientName}`);
        if (addr.recipientPhone) parts.push(`Phone: ${addr.recipientPhone}`);
        if (addr.line1) parts.push(`Address: ${addr.line1}`);
        if (addr.line2) parts.push(addr.line2);
        if (addr.city) parts.push(`City: ${addr.city}`);
        if (addr.region) parts.push(`Region: ${addr.region}`);
        if (addr.country) parts.push(`Country: ${addr.country}`);
        if (addr.postalCode) parts.push(`Postal Code: ${addr.postalCode}`);
        if (addr.label) parts.push(`Label: ${addr.label}`);
        if (addr.notes) parts.push(`Notes: ${addr.notes}`);

        return parts.length > 0 ? parts.join('<br>') : 'N/A';
      };

      const deliveryAddressHtml = formatDeliveryAddress();

      // تنسيق التاريخ والأرقام بالإنجليزية
      const formatDate = (date?: Date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      const formatNumber = (num: number) => {
        return num.toLocaleString('en-US');
      };

      const invoiceNumber = order.invoiceNumber || order.orderNumber;
      const fileName = `invoice-${invoiceNumber}-${Date.now()}.pdf`;

      // استخدام متغير البيئة للبريد الإلكتروني مع قيمة افتراضية
      const salesManagerEmail =
        this.configService?.get('SALES_MANAGER_EMAIL') || 'Mohammedsalehallawzi14@gmail.com';

      const result = await this.emailAdapter.sendEmail({
        to: salesManagerEmail,
        subject: `فاتورة جديدة - ${invoiceNumber} | New Invoice - ${invoiceNumber}`,
        html: `
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          </head>
          <body>
          <div dir="rtl" style="font-family: Arial, Tahoma, sans-serif; padding: 20px;">
            <h2 style="color: #1976d2;">فاتورة جديدة</h2>
            <p>تم إكمال طلب جديد وتم إنشاء الفاتورة المرفقة.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
            <h3 style="color: #333;">تفاصيل الطلب:</h3>
            <ul style="line-height: 1.8;">
              <li><strong>رقم الطلب:</strong> ${order.orderNumber}</li>
              <li><strong>رقم الفاتورة:</strong> ${invoiceNumber}</li>
              <li><strong>اسم العميل:</strong> ${customerName}</li>
              <li><strong>الهاتف:</strong> ${customerPhone}</li>
              <li><strong>المجموع:</strong> ${formatNumber(order.total)} ${order.currency}</li>
              <li><strong>تاريخ الإكمال:</strong> ${formatDate(order.completedAt)}</li>
            </ul>
            <h3 style="color: #333; margin-top: 20px;">عنوان التوصيل:</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; direction: ltr; text-align: left;">
              ${deliveryAddressHtml}
            </div>
            <p style="margin-top: 20px; color: #666;">يرجى الاطلاع على الفاتورة المرفقة للتفاصيل الكاملة.</p>
          </div>
          <div dir="ltr" style="font-family: Arial, sans-serif; padding: 20px; border-top: 1px solid #ddd; margin-top: 20px;">
            <h2 style="color: #1976d2;">New Invoice</h2>
            <p>A new order has been completed and the attached invoice has been generated.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
            <h3 style="color: #333;">Order Details:</h3>
            <ul style="line-height: 1.8;">
              <li><strong>Order Number:</strong> ${order.orderNumber}</li>
              <li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
              <li><strong>Customer Name:</strong> ${customerName}</li>
              <li><strong>Phone:</strong> ${customerPhone}</li>
              <li><strong>Total:</strong> ${formatNumber(order.total)} ${order.currency}</li>
              <li><strong>Completed Date:</strong> ${formatDate(order.completedAt)}</li>
            </ul>
            <h3 style="color: #333; margin-top: 20px;">Delivery Address:</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
              ${deliveryAddressHtml}
            </div>
            <p style="margin-top: 20px; color: #666;">Please review the attached invoice for complete details.</p>
          </div>
          </body>
          </html>
        `,
        attachments: [
          {
            filename: fileName,
            content: pdfBuffer, // Buffer - nodemailer يتعامل معه تلقائياً
            contentType: 'application/pdf',
          },
        ],
      });

      if (result.success) {
        this.logger.log(
          `Invoice email sent successfully for order ${order.orderNumber} to sales manager`,
        );
      } else {
        this.logger.error(
          `Failed to send invoice email for order ${order.orderNumber}: ${result.error}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error sending invoice email for order ${order.orderNumber}:`, error);
      // لا نرمي خطأ هنا حتى لا نوقف عملية تحديث الحالة
    }
  }
}

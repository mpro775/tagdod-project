import { Injectable, Logger } from '@nestjs/common';
import {
  OrderNotFoundException,
  OrderPreviewFailedException,
  OrderCannotCancelException,
  OrderNotReadyToShipException,
  OrderRatingNotAllowedException,
  OrderException,
  AddressNotFoundException,
  ErrorCode,
  DomainException
} from '../../../shared/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User , UserRole } from '../../users/schemas/user.schema';
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
  OrderStateMachine 
} from '../schemas/order.schema';
import { Inventory } from '../schemas/inventory.schema';
import { Reservation } from '../schemas/reservation.schema';
import { InventoryLedger } from '../schemas/inventory-ledger.schema';
import { Cart } from '../../cart/schemas/cart.schema';
import { CartService } from '../../cart/cart.service';
import { MarketingService } from '../../marketing/marketing.service';
import { AddressesService } from '../../addresses/addresses.service';
import { LocalPaymentAccountService } from '../../system-settings/services/local-payment-account.service';
import { ExchangeRatesService } from '../../exchange-rates/exchange-rates.service';
import * as crypto from 'crypto';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  CancelOrderDto,
  ShipOrderDto,
  RefundOrderDto,
  RateOrderDto,
  ListOrdersDto,
  OrderAnalyticsDto,
  AddOrderNotesDto,
  VerifyPaymentDto
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

/**
 * خدمة الطلبات الموحدة - نظام احترافي شامل
 */
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private reservationTtlSec = Number(process.env.RESERVATION_TTL_SECONDS || 900);
  private paymentSigningKey = process.env.PAYMENT_SIGNING_KEY || 'dev_signing_key';

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
  ) {}

  // ===== Helper Methods =====

  private hmac(payload: string): string {
    return crypto.createHmac('sha256', this.paymentSigningKey).update(payload).digest('hex');
  }

  private async getUsersMap(userIds: Types.ObjectId[]): Promise<Map<string, { name: string; phone: string }>> {
    const users = await this.userModel.find(
      { _id: { $in: userIds } },
      { _id: 1, firstName: 1, lastName: 1, phone: 1 }
    ).lean();

    const usersMap = new Map<string, { name: string; phone: string }>();
    users.forEach(user => {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'غير محدد';
      usersMap.set(user._id.toString(), {
        name: fullName,
        phone: user.phone || 'غير محدد'
      });
    });

    return usersMap;
  }

  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `ORD-${year}-${timestamp}`;
  }

  private async addStatusHistory(
    order: OrderDocument,
    status: OrderStatus,
    changedBy: Types.ObjectId,
    changedByRole: 'customer' | 'admin' | 'system',
    notes?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy,
      changedByRole,
      notes,
      metadata
    });
  }

  /**
   * التحقق من صلاحية استخدام الدفع عند الاستلام (COD)
   * يجب أن يكون لدى المستخدم 3 طلبات مكتملة (DELIVERED) على الأقل
   * المستخدمون الذين لديهم صلاحيات Admin مستثنون من هذا التقييد
   */
  async checkCODEligibility(userId: string): Promise<{
    eligible: boolean;
    completedOrders: number;
    requiredOrders: number;
    progress: string; // مثل "2/3"
    message?: string;
  }> {
    const requiredOrders = 3;
    
    // التحقق من أن المستخدم ليس Admin
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      return {
        eligible: false,
        completedOrders: 0,
        requiredOrders,
        progress: '0/3',
        message: 'المستخدم غير موجود'
      };
    }

    // إذا كان المستخدم Admin، فهو مؤهل دائماً
    const isAdmin = user.roles?.includes(UserRole.ADMIN) || user.roles?.includes(UserRole.SUPER_ADMIN);
    if (isAdmin) {
      return {
        eligible: true,
        completedOrders: requiredOrders, // يعتبر أنه مؤهل دائماً
        requiredOrders,
        progress: `${requiredOrders}/${requiredOrders}`,
        message: 'المستخدم له صلاحيات إدارية'
      };
    }

    // حساب عدد الطلبات المكتملة (DELIVERED)
    const completedOrdersCount = await this.orderModel.countDocuments({
      userId: new Types.ObjectId(userId),
      status: OrderStatus.DELIVERED
    });

    const eligible = completedOrdersCount >= requiredOrders;
    const progress = `${completedOrdersCount}/${requiredOrders}`;

    return {
      eligible,
      completedOrders: completedOrdersCount,
      requiredOrders,
      progress,
      message: eligible 
        ? undefined 
        : `يجب إكمال ${requiredOrders} طلبات على الأقل لاستخدام الدفع عند الاستلام. لديك ${completedOrdersCount} طلب مكتمل`
    };
  }

  // ===== Checkout Methods =====

  /**
   * معاينة الطلب قبل التأكيد - دعم كوبونات متعددة
   */
  async previewCheckout(userId: string, currency: string, couponCode?: string, couponCodes?: string[]) {
    try {
      const data = await this.cartService.previewUser(userId, currency, 'any');
      
      // Get coupon codes from cart or from parameters
      // We need to get cart to access appliedCouponCodes
      const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) }).lean();
      const cartCouponCodes: string[] = cart?.appliedCouponCodes || [];
      
      // Combine coupon codes: from cart, single couponCode, or array couponCodes
      const allCouponCodes = new Set<string>();
      if (cartCouponCodes.length > 0) {
        cartCouponCodes.forEach((code: string) => allCouponCodes.add(code));
      }
      if (couponCode) {
        allCouponCodes.add(couponCode);
      }
      if (couponCodes && couponCodes.length > 0) {
        couponCodes.forEach(code => allCouponCodes.add(code));
      }
      
      const couponCodesArray = Array.from(allCouponCodes);
      
      // Calculate discounts for all coupons cumulatively
      let totalCouponDiscount = 0;
      const appliedCoupons: Array<{
        code: string;
        name: string;
        discountValue: number;
        type: string;
        discount: number;
      }> = [];
      
      let remainingSubtotal = data.subtotal;
      
      // Extract product IDs from cart items
      const productIds = data.items
        .map(item => item.productId || item.variantId)
        .filter((id): id is string => Boolean(id));
      
      // Apply each coupon one by one
      for (const code of couponCodesArray) {
        try {
          const couponValidation = await this.marketingService.validateCoupon({
            code: code,
            userId: userId,
            orderAmount: remainingSubtotal,
            productIds: productIds
          });

          if (couponValidation.valid && couponValidation.coupon) {
            let couponDiscount = 0;
            
            // Calculate discount based on type
            if (couponValidation.coupon.type === 'percentage' && couponValidation.coupon.discountValue) {
              couponDiscount = (remainingSubtotal * couponValidation.coupon.discountValue) / 100;
              if (couponValidation.coupon.maximumDiscountAmount) {
                couponDiscount = Math.min(couponDiscount, couponValidation.coupon.maximumDiscountAmount);
              }
            } else if (couponValidation.coupon.type === 'fixed_amount' && couponValidation.coupon.discountValue) {
              couponDiscount = couponValidation.coupon.discountValue;
            }

            // Ensure discount doesn't exceed remaining subtotal
            couponDiscount = Math.min(couponDiscount, remainingSubtotal);
            
            totalCouponDiscount += couponDiscount;
            remainingSubtotal = Math.max(0, remainingSubtotal - couponDiscount);
            
            appliedCoupons.push({
              code: code,
              name: couponValidation.coupon.name,
              discountValue: couponValidation.coupon.discountValue || 0,
              type: couponValidation.coupon.type,
              discount: couponDiscount
            });
            
            this.logger.log(`Applied coupon: ${code}, discount: ${couponDiscount}`);
          } else {
            this.logger.warn(`Invalid coupon: ${code} - ${couponValidation.message}`);
          }
        } catch (error) {
          this.logger.error(`Error applying coupon ${code}:`, error);
        }
      }

      // Calculate items discount (from promotions)
      const itemsDiscount = data.items.reduce((sum, item) => {
        const itemDiscount = (item.unit.base - item.unit.final) * item.qty;
        return sum + itemDiscount;
      }, 0);

      const shipping = 0; // رسوم الشحن تأتي من لوحة التحكم لكل طلب على حدى (افتراضي صفر)
      const totalDiscount = itemsDiscount + totalCouponDiscount;
      const total = data.subtotal - totalDiscount + shipping;

      // التحقق من صلاحية COD
      const codEligibility = await this.checkCODEligibility(userId);

      return {
        success: true,
        data: {
          items: data.items,
          subtotal: data.subtotal,
          shipping,
          total,
          currency,
          deliveryOptions: [], // خيارات التوصيل فارغة مؤقتاً حتى توقيع العقود
          // Detailed discounts breakdown
          discounts: {
            itemsDiscount: itemsDiscount, // خصومات المنتجات من العروض الترويجية
            couponDiscount: totalCouponDiscount, // إجمالي خصم الكوبونات
            totalDiscount: totalDiscount, // إجمالي الخصومات
            appliedCoupons: appliedCoupons, // تفاصيل جميع الكوبونات المطبقة
          },
          // COD Eligibility
          codEligibility: {
            eligible: codEligibility.eligible,
            completedOrders: codEligibility.completedOrders,
            requiredOrders: codEligibility.requiredOrders,
            progress: codEligibility.progress,
            message: codEligibility.message
          },
          // Backward compatibility
          appliedCoupon: appliedCoupons.length > 0 ? appliedCoupons[0] : null,
          couponDiscount: totalCouponDiscount
        }
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
    dto: CreateOrderDto
  ): Promise<{ orderId: string; orderNumber: string; status: OrderStatus; payment?: { intentId: string; provider?: string; amount: number; signature: string } }> {
    try {
      // التحقق من ملكية العنوان
      const isValid = await this.addressesService.validateAddressOwnership(dto.deliveryAddressId, userId);
      if (!isValid) {
        throw new AddressNotFoundException();
      }

      // جلب تفاصيل العنوان
      const address = await this.addressesService.getAddressById(dto.deliveryAddressId);

      // التحقق من صلاحية COD إذا كان المستخدم يريد استخدام الدفع عند الاستلام
      if (dto.paymentMethod === PaymentMethod.COD) {
        const codEligibility = await this.checkCODEligibility(userId);
        if (!codEligibility.eligible) {
          throw new DomainException(ErrorCode.VALIDATION_ERROR, {
            reason: 'cod_not_eligible',
            message: codEligibility.message || 'غير مؤهل لاستخدام الدفع عند الاستلام',
            codEligibility: {
              completedOrders: codEligibility.completedOrders,
              requiredOrders: codEligibility.requiredOrders,
              progress: codEligibility.progress
            }
          });
        }
      }

      // إعادة حساب من السلة - دعم كوبونات متعددة
      const quote = await this.previewCheckout(userId, dto.currency, dto.couponCode, dto.couponCodes) as { data: { total: number; subtotal: number; shipping: number; couponDiscount: number; itemsDiscount?: number; discounts?: { itemsDiscount: number; couponDiscount: number; totalDiscount: number; appliedCoupons: Array<{ code: string; name: string; discountValue: number; type: string; discount: number }> }; items: CartLine[] } };
      const total = quote.data.total;
      const subtotal = quote.data.subtotal;
      const shipping = quote.data.shipping || 0;
      const couponDiscount = quote.data.discounts?.couponDiscount || quote.data.couponDiscount || 0;
      const itemsDiscount = quote.data.discounts?.itemsDiscount || quote.data.itemsDiscount || 0;
      const totalDiscount = quote.data.discounts?.totalDiscount || (itemsDiscount + couponDiscount);
      const appliedCoupons = quote.data.discounts?.appliedCoupons || [];
      const tax = 0; // الضريبة حالياً صفر

      // 🆕 حساب الإجماليات بالعملات الثلاث
      let totalsInAllCurrencies;
      if (this.exchangeRatesService) {
        // تحويل جميع المبالغ إلى USD أولاً
        const usdSubtotal = await this.exchangeRatesService.convertToUSD(subtotal, dto.currency);
        const usdShipping = await this.exchangeRatesService.convertToUSD(shipping, dto.currency);
        const usdTax = await this.exchangeRatesService.convertToUSD(tax, dto.currency);
        const usdDiscount = await this.exchangeRatesService.convertToUSD(couponDiscount, dto.currency);

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
            message: 'الحساب المحدد غير موجود أو غير مفعل'
          });
        }

        // التحقق من تطابق العملة
        if (selection.currency !== dto.currency.toUpperCase()) {
          throw new DomainException(ErrorCode.VALIDATION_ERROR, {
            reason: 'currency_mismatch',
            message: `العملة المحددة (${dto.currency}) لا تطابق عملة الحساب (${selection.currency})`
          });
        }

        // التحقق من وجود رقم الحوالة
        if (!dto.paymentReference || dto.paymentReference.trim().length === 0) {
          throw new DomainException(ErrorCode.VALIDATION_ERROR, {
            reason: 'payment_reference_required',
            message: 'يجب إدخال رقم الحوالة أو المرجع'
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
        appliedCouponCodes: appliedCoupons.map(c => c.code),
        appliedCoupons: appliedCoupons.map(c => ({
          code: c.code,
          discount: c.discount,
          details: {
            code: c.code,
            title: c.name,
            type: c.type,
            discountPercentage: c.type === 'percentage' ? c.discountValue : undefined,
            discountAmount: c.type === 'fixed_amount' ? c.discountValue : undefined,
          }
        })),
        // Backward compatibility
        appliedCouponCode: appliedCoupons.length > 0 ? appliedCoupons[0].code : dto.couponCode,
        couponDetails: appliedCoupons.length > 0 ? {
          code: appliedCoupons[0].code,
          title: appliedCoupons[0].name,
          type: appliedCoupons[0].type,
          discountPercentage: appliedCoupons[0].type === 'percentage' ? appliedCoupons[0].discountValue : undefined,
          discountAmount: appliedCoupons[0].type === 'fixed_amount' ? appliedCoupons[0].discountValue : undefined,
        } : undefined,
        paymentMethod: dto.paymentMethod,
        paymentProvider: dto.paymentProvider,
        localPaymentAccountId: dto.localPaymentAccountId ?? undefined,
        paymentReference: dto.paymentReference,
        shippingMethod: dto.shippingMethod,
        customerNotes: dto.customerNotes,
        totalsInAllCurrencies,
        source: 'web'
      });

      await order.save();

      // إضافة سجل الحالة
      await this.addStatusHistory(
        order,
        OrderStatus.PENDING_PAYMENT,
        new Types.ObjectId(userId),
        'customer',
        'تم إنشاء الطلب'
      );

      // إذا كان الدفع عند الاستلام، تأكيد فوري وتحديث حالة الدفع
      if (dto.paymentMethod === PaymentMethod.COD) {
        // تحديث حالة الدفع أولاً
        order.paymentStatus = PaymentStatus.PAID;
        order.paidAt = new Date();
        await order.save();
        
        // ثم تحديث حالة الطلب
        await this.updateOrderStatus(
          order._id.toString(),
          OrderStatus.CONFIRMED,
          new Types.ObjectId(userId),
          'admin',
          'تأكيد فوري للدفع عند الاستلام'
        );
      }

      // تحديث استخدام العنوان
      await this.addressesService.markAsUsed(dto.deliveryAddressId, userId);

      this.logger.log(`Order created: ${order.orderNumber}`);

      return {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status,
        payment: dto.paymentMethod === 'ONLINE' ? {
          intentId: `gw-${order._id}`,
          provider: dto.paymentProvider,
          amount: total,
          signature: this.hmac(`gw-${order._id}|PENDING|${total}`)
        } : undefined
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
      toDate
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
        { 'deliveryAddress.recipientName': { $regex: search, $options: 'i' } }
      ];
    }

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(filter)
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
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

    const order = await this.orderModel.findOne(filter);
    if (!order) {
      throw new OrderNotFoundException();
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
    notes?: string
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new OrderNotFoundException();
    }

    // التحقق من صحة الانتقال
    if (!OrderStateMachine.canTransition(order.status, newStatus)) {
      throw new OrderException(ErrorCode.ORDER_INVALID_STATUS, { from: order.status, to: newStatus });
    }

    // التحقق من الدفع قبل السماح بتغيير الحالة
    // الحالات الممنوعة بدون دفع: CONFIRMED, PROCESSING, READY_TO_SHIP, SHIPPED, OUT_FOR_DELIVERY, DELIVERED
    // استثناء CANCELLED من هذا التحقق
    const statusesRequiringPayment = [
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.READY_TO_SHIP,
      OrderStatus.SHIPPED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED
    ];

    if (statusesRequiringPayment.includes(newStatus) && newStatus !== OrderStatus.CANCELLED) {
      if (order.paymentStatus !== PaymentStatus.PAID) {
        throw new DomainException(ErrorCode.VALIDATION_ERROR, {
          reason: 'payment_required',
          message: `لا يمكن تغيير حالة الطلب إلى ${newStatus} بدون إتمام الدفع. حالة الدفع الحالية: ${order.paymentStatus}`,
          currentPaymentStatus: order.paymentStatus,
          requiredPaymentStatus: PaymentStatus.PAID
        });
      }
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
      case OrderStatus.SHIPPED:
        order.shippedAt = now;
        break;
      case OrderStatus.DELIVERED:
        order.deliveredAt = now;
        break;
      case OrderStatus.COMPLETED:
        order.completedAt = now;
        break;
      case OrderStatus.CANCELLED:
        order.cancelledAt = now;
        break;
    }

    await order.save();
    this.logger.log(`Order ${order.orderNumber} status updated to ${newStatus}`);

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
      `تم الإلغاء: ${dto.reason}`
    );

    return order;
  }

  /**
   * شحن الطلب
   */
  async shipOrder(orderId: string, dto: ShipOrderDto, adminId: string): Promise<OrderDocument> {
    const order = await this.getOrderDetails(orderId);
    
    if (![OrderStatus.PROCESSING, OrderStatus.READY_TO_SHIP].includes(order.status)) {
      throw new OrderNotReadyToShipException({ status: order.status });
    }

    order.trackingNumber = dto.trackingNumber;
    order.trackingUrl = dto.trackingUrl;
    order.shippingCompany = dto.shippingCompany;
    order.estimatedDeliveryDate = dto.estimatedDeliveryDate ? new Date(dto.estimatedDeliveryDate) : undefined;

    await this.updateOrderStatus(
      orderId,
      OrderStatus.SHIPPED,
      new Types.ObjectId(adminId),
      'admin',
      dto.notes
    );

    return order;
  }

  /**
   * معالجة الاسترداد
   */
  async processRefund(orderId: string, dto: RefundOrderDto, adminId: string): Promise<OrderDocument> {
    const order = await this.getOrderDetails(orderId);
    
    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new OrderException(ErrorCode.ORDER_ALREADY_PAID);
    }

    if (dto.amount > order.total) {
      throw new OrderException(ErrorCode.ORDER_REFUND_AMOUNT_INVALID, { amount: dto.amount, total: order.total });
    }

    order.returnInfo.isReturned = true;
    order.returnInfo.returnAmount = dto.amount;
    order.returnInfo.returnReason = dto.reason;
    order.returnInfo.returnedAt = new Date();
    order.returnInfo.returnedBy = new Types.ObjectId(adminId);

    // تحديث حالة الدفع
    order.paymentStatus = dto.amount === order.total ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
    order.status = dto.amount === order.total ? OrderStatus.REFUNDED : OrderStatus.PARTIALLY_REFUNDED;

    await this.addStatusHistory(
      order,
      order.status,
      new Types.ObjectId(adminId),
      'admin',
      `استرداد ${dto.amount} - ${dto.reason}`
    );

    await order.save();
    return order;
  }

  /**
   * تقييم الطلب
   */
  async rateOrder(orderId: string, userId: string, dto: RateOrderDto): Promise<OrderDocument> {
    const order = await this.getOrderDetails(orderId, userId);
    
    if (![OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(order.status)) {
      throw new OrderRatingNotAllowedException({ status: order.status });
    }

    order.ratingInfo.rating = dto.rating;
    order.ratingInfo.review = dto.review;
    order.ratingInfo.ratedAt = new Date();

    // إكمال الطلب تلقائياً عند التقييم
    if (order.status === OrderStatus.DELIVERED) {
      await this.updateOrderStatus(
        orderId,
        OrderStatus.COMPLETED,
        new Types.ObjectId(userId),
        'customer',
        `تم التقييم: ${dto.rating}/5`
      );
    }

    return order;
  }

  /**
   * إضافة ملاحظات للطلب
   */
  async addOrderNotes(orderId: string, dto: AddOrderNotesDto, userId: string, isAdmin = false): Promise<OrderDocument> {
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
        status: { $in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] }
      }),
      this.orderModel.countDocuments({
        userId: new Types.ObjectId(userId),
        status: OrderStatus.CANCELLED
      }),
      this.orderModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            status: { $in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    const averageOrderValue = completedOrders > 0 ? (totalSpent[0]?.total || 0) / completedOrders : 0;

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalSpent: totalSpent[0]?.total || 0,
      averageOrderValue
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
        { $match: { ...matchFilter, status: { $in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      this.orderModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      this.orderModel
        .find(matchFilter)
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    const avgOrderValue = totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0;

    return {
      period: `آخر ${days} أيام`,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageOrderValue: avgOrderValue,
      ordersByStatus,
      recentOrders
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
   * تحديث حالة الطلب (للإدارة)
   */
  async adminUpdateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    adminId: string
  ): Promise<OrderDocument> {
    return this.updateOrderStatus(orderId, dto.status, new Types.ObjectId(adminId), 'admin', dto.notes);
  }

  // ===== Webhook Methods =====

  /**
   * معالجة webhook الدفع
   */
  async handlePaymentWebhook(
    intentId: string,
    status: 'SUCCESS' | 'FAILED',
    amount: string,
    signature: string
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
      order.paymentStatus = PaymentStatus.PAID;
      order.paidAt = new Date();
      await this.updateOrderStatus(
        order._id.toString(),
        OrderStatus.CONFIRMED,
        new Types.ObjectId('system'),
        'system',
        'تم تأكيد الدفع'
      );
    } else {
      order.paymentStatus = PaymentStatus.FAILED;
      await this.updateOrderStatus(
        order._id.toString(),
        OrderStatus.PAYMENT_FAILED,
        new Types.ObjectId('system'),
        'system',
        'فشل في الدفع'
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
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    const revenueByDay = await this.orderModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const revenueByStatus = await this.orderModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      }
    ]);

    return {
      totalRevenue: analytics[0]?.totalRevenue || 0,
      totalOrders: analytics[0]?.totalOrders || 0,
      averageOrderValue: analytics[0]?.averageOrderValue || 0,
      revenueByDay,
      revenueByStatus,
      topProducts: await this.getTopSellingProducts(matchQuery)
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
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    return topProducts.map(product => ({
      productId: product._id?.toString(),
      name: product.productName || 'Unknown Product',
      totalQuantity: product.totalQuantity,
      totalRevenue: product.totalRevenue,
      orderCount: product.orderCount
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
          avgProcessingTime: { $avg: { $subtract: ['$completedAt', '$createdAt'] } }
        }
      }
    ]);

    const result = metrics[0] || {};
    const totalOrders = result.totalOrders || 0;

    return {
      averageProcessingTime: result.avgProcessingTime ? result.avgProcessingTime / (1000 * 60 * 60 * 24) : 0, // days
      fulfillmentRate: totalOrders > 0 ? (result.completedOrders / totalOrders) * 100 : 0,
      cancellationRate: totalOrders > 0 ? (result.cancelledOrders / totalOrders) * 100 : 0,
      returnRate: totalOrders > 0 ? (result.returnedOrders / totalOrders) * 100 : 0,
      customerSatisfaction: await this.calculateCustomerSatisfaction()
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
          'ratingInfo.rating': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$ratingInfo.rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    if (ratingStats.length === 0 || !ratingStats[0].averageRating) {
      // إذا لم توجد تقييمات، نرجع متوسط افتراضي بناءً على معدل الإنجاز
      const performanceStats = await this.orderModel.aggregate([
        { $match: { createdAt: { $gte: lastMonth } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            completedOrders: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.COMPLETED] }, 1, 0] } }
          }
        }
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
      const userIds = orders.map(order => order.userId).filter(id => id);
      const usersMap = await this.getUsersMap(userIds);

      // إحصائيات سريعة للتقرير
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const completedOrders = orders.filter(order => order.status === OrderStatus.COMPLETED).length;
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
              ${orders.slice(0, 50).map(order => {
                const userInfo = usersMap.get(order.userId.toString()) || { name: 'غير محدد', phone: 'غير محدد' };
                return `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${order.createdAt?.toLocaleDateString('ar-SA')}</td>
                  <td>${order.status}</td>
                  <td>${order.total?.toLocaleString()} ريال</td>
                  <td>${userInfo.name}</td>
                </tr>
              `}).join('')}
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
        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
          }
        });
        
        // حفظ الملف
        fs.writeFileSync(filePath, pdfBuffer);
        
        // إرجاع المسار النسبي للوصول من الويب
        return `/uploads/reports/${fileName}`;
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    } catch (error) {
      this.logger.error('Error generating PDF report:', error);
      throw new Error('فشل في إنشاء تقرير PDF');
    }
  }

  /**
   * إنشاء ملف Excel للطلبات
   */
  async generateOrdersExcel(orders: OrderDocument[]): Promise<string> {
    try {
      // جلب بيانات المستخدمين
      const userIds = orders.map(order => order.userId).filter(id => id);
      const usersMap = await this.getUsersMap(userIds);

      // إنشاء البيانات للتقرير
      const excelData = orders.map(order => {
        const userInfo = usersMap.get(order.userId.toString()) || { name: 'غير محدد', phone: 'غير محدد' };

        return {
          'رقم الطلب': order.orderNumber,
          'تاريخ الطلب': order.createdAt?.toLocaleDateString('ar-SA'),
          'الحالة': order.status,
          'المجموع': order.total,
          'العملة': order.currency,
          'اسم العميل': userInfo.name,
          'رقم الهاتف': userInfo.phone,
          'المدينة': order.deliveryAddress?.city || 'غير محدد',
          'طريقة الدفع': order.paymentMethod,
          'عدد المنتجات': order.items?.length || 0,
          'التقييم': order.ratingInfo?.rating || 'غير مقيم'
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
        { wch: 8 },  // العملة
        { wch: 20 }, // اسم العميل
        { wch: 15 }, // رقم الهاتف
        { wch: 15 }, // المدينة
        { wch: 15 }, // طريقة الدفع
        { wch: 12 }, // عدد المنتجات
        { wch: 10 }  // التقييم
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
      this.logger.error('Error generating Excel report:', error);
      throw new Error('فشل في إنشاء تقرير Excel');
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
          totalRefunds: { $sum: { $cond: ['$returnInfo.isReturned', '$returnInfo.returnAmount', 0] } },
          totalShipping: { $sum: '$shippingCost' }
        }
      }
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
      profitMargin: totalRevenue > 0 ? ((netRevenue / totalRevenue) * 100) : 0,
      totalDiscounts: result.totalDiscounts || 0,
      totalShipping: result.totalShipping || 0
    };
  }

  /**
   * الحصول على إحصائيات الطلبات الأساسية (للإدارة)
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    refunded: number;
    totalRevenue: number;
    averageOrderValue: number;
  }> {
    try {
      // استخدام match أولاً للتأكد من وجود userId صالح
      const stats = await this.orderModel.aggregate([
        {
          $match: {
            userId: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.PENDING_PAYMENT] }, 1, 0] } },
            processing: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.PROCESSING] }, 1, 0] } },
            shipped: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.SHIPPED] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.DELIVERED] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.CANCELLED] }, 1, 0] } },
            refunded: { $sum: { $cond: [{ $eq: ['$status', OrderStatus.REFUNDED] }, 1, 0] } },
            totalRevenue: { $sum: { $cond: [{ $in: ['$status', [OrderStatus.DELIVERED, OrderStatus.COMPLETED]] }, '$total', 0] } },
            orderValues: { $push: { $cond: [{ $in: ['$status', [OrderStatus.DELIVERED, OrderStatus.COMPLETED]] }, '$total', null] } }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        refunded: 0,
        totalRevenue: 0,
        orderValues: []
      };

      // حساب متوسط قيمة الطلب
      const validOrderValues = result.orderValues.filter((value: number | null) => value !== null);
      const averageOrderValue = validOrderValues.length > 0
        ? validOrderValues.reduce((sum: number, value: number) => sum + value, 0) / validOrderValues.length
        : 0;

      return {
        total: result.total,
        pending: result.pending,
        processing: result.processing,
        shipped: result.shipped,
        delivered: result.delivered,
        cancelled: result.cancelled,
        refunded: result.refunded,
        totalRevenue: result.totalRevenue,
        averageOrderValue
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
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        refunded: 0,
        totalRevenue: 0,
        averageOrderValue: 0
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
    toDate?: string
  ) {
    this.logger.log('Exporting order analytics:', { format, params, fromDate, toDate });

    // Get analytics data
    const analytics = await this.getAdminAnalytics(params);
    
    // Get revenue analytics if date range provided
    let revenueAnalytics = null;
    if (fromDate && toDate) {
      revenueAnalytics = await this.getRevenueAnalytics({
        fromDate: new Date(fromDate),
        toDate: new Date(toDate)
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
      }
    };
  }

  /**
   * مطابقة الدفع المحلي
   */
  async verifyLocalPayment(
    orderId: string,
    dto: VerifyPaymentDto,
    adminId: string
  ): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    
    if (!order) {
      throw new OrderNotFoundException();
    }

    if (!order.localPaymentAccountId) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, {
        reason: 'not_local_payment_order',
        message: 'هذا الطلب لا يستخدم الدفع المحلي'
      });
    }

    // التحقق من العملة (يمكن إضافة تحويل عملة هنا إذا لزم الأمر)
    if (dto.verifiedCurrency !== order.currency) {
      // في هذه الحالة، قد نحتاج إلى تحويل العملة أو رفضها
      // لأغراض بسيطة، سنرفض إذا كانت العملة مختلفة
      throw new DomainException(ErrorCode.VALIDATION_ERROR, {
        reason: 'currency_mismatch',
        message: `عملة المطابقة (${dto.verifiedCurrency}) لا تطابق عملة الطلب (${order.currency})`
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
      order.paymentStatus = PaymentStatus.PAID;
      order.paidAt = new Date();
      
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
        `تم قبول الدفع - المبلغ: ${dto.verifiedAmount} ${dto.verifiedCurrency}${dto.notes ? ` - ${dto.notes}` : ''}`
      );
    } else {
      order.paymentStatus = PaymentStatus.FAILED;
      
      // إضافة إلى سجل الحالات
      await this.addStatusHistory(
        order,
        OrderStatus.PAYMENT_FAILED,
        new Types.ObjectId(adminId),
        'admin',
        `تم رفض الدفع - المبلغ غير كافٍ: ${dto.verifiedAmount} ${dto.verifiedCurrency} (المطلوب: ${order.total} ${order.currency})${dto.notes ? ` - ${dto.notes}` : ''}`
      );
    }

    await order.save();
    this.logger.log(`Payment verification for order ${order.orderNumber}: ${isAmountSufficient ? 'APPROVED' : 'REJECTED'}`);
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
      }
    };
  }
}

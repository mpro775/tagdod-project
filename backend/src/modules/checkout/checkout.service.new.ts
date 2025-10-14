import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Order, OrderStatus, PaymentStatus } from './schemas/order.schema';
import { Inventory } from './schemas/inventory.schema';
import { Reservation } from './schemas/reservation.schema';
import { InventoryLedger } from './schemas/inventory-ledger.schema';
import { Cart } from '../cart/schemas/cart.schema';
import { Product } from '../catalog/schemas/product.schema';
import { Variant } from '../catalog/schemas/variant.schema';
import { AddressesService } from '../addresses/addresses.service';
import { CouponsService } from '../coupons/coupons.service';
import { AppException } from '../../shared/exceptions/app.exception';
import { CheckoutConfirmDto, CancelOrderDto, ShipOrderDto, RefundOrderDto } from './dto/checkout.dto';
import * as crypto from 'crypto';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);
  private readonly RESERVATION_TTL_SECONDS = 900; // 15 minutes
  private readonly PAYMENT_SIGNING_KEY = process.env.PAYMENT_SIGNING_KEY || 'dev_key';

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    @InjectModel(InventoryLedger.name) private ledgerModel: Model<InventoryLedger>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    @InjectConnection() private connection: Connection,
    private addressesService: AddressesService,
    private couponsService: CouponsService,
  ) {}

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.orderModel.countDocuments({
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${year + 1}-01-01`),
      },
    });

    const number = (count + 1).toString().padStart(5, '0');
    return `ORD-${year}-${number}`;
  }

  /**
   * Create order from cart
   */
  async createOrder(dto: CheckoutConfirmDto, userId: string) {
    const session = await this.connection.startSession();
    
    try {
      let order!: Order;

      await session.withTransaction(async () => {
        // 1. Get and validate cart
        const cart = await this.cartModel.findOne({
          userId: new Types.ObjectId(userId),
          status: 'active',
        }).session(session);

        if (!cart || !cart.items || cart.items.length === 0) {
          throw new AppException('السلة فارغة', 400);
        }

        // 2. Validate and get delivery address
        const isValidAddress = await this.addressesService.validateAddressOwnership(
          dto.deliveryAddressId,
          userId,
        );

        if (!isValidAddress) {
          throw new AppException('العنوان غير صحيح', 400);
        }

        const deliveryAddress = await this.addressesService.getAddressById(
          dto.deliveryAddressId,
        );

        // 3. Validate coupon if applied
        if (cart.appliedCouponCode) {
          const couponValidation = await this.couponsService.validateCoupon({
            code: cart.appliedCouponCode,
            orderAmount: cart.pricingSummary?.subtotal || 0,
            currency: dto.currency,
            userId,
          });

          if (!couponValidation.valid) {
            throw new AppException(
              `الكوبون غير صحيح: ${couponValidation.message}`,
              400,
            );
          }
        }

        // 4. Build order items with full details
        const orderItems = [];
        let subtotal = 0;
        let itemsDiscount = 0;

        for (const cartItem of cart.items) {
          const variant = await this.variantModel.findById(cartItem.variantId).session(session);
          if (!variant) {
            throw new AppException(`Variant ${cartItem.variantId} not found`, 404);
          }

          const product = await this.productModel.findById(variant.productId).session(session);
          if (!product) {
            throw new AppException(`Product not found`, 404);
          }

          // Get pricing from cart item (already calculated)
          const basePrice = cartItem.pricing?.basePrice || 0;
          const finalPrice = cartItem.pricing?.finalPrice || 0;
          const discount = cartItem.pricing?.discount || 0;
          const lineTotal = finalPrice * cartItem.qty;

          subtotal += basePrice * cartItem.qty;
          itemsDiscount += discount * cartItem.qty;

          orderItems.push({
            productId: product._id,
            variantId: variant._id,
            qty: cartItem.qty,
            basePrice,
            discount,
            finalPrice,
            lineTotal,
            currency: dto.currency,
            appliedPromotionId: cartItem.pricing?.appliedPromotionId,
            snapshot: {
              name: product.name,
              sku: variant.sku,
              slug: product.slug,
              image: product.images?.[0]?.url,
              brandName: cartItem.productSnapshot?.brandName,
              categoryName: cartItem.productSnapshot?.categoryName,
              attributes: variant.attributes,
            },
          });

          // Check inventory
          const inventory = await this.inventoryModel.findOne({ 
            variantId: variant._id 
          }).session(session);

          if (inventory) {
            const available = inventory.on_hand - inventory.reserved - inventory.safety_stock;
            if (available < cartItem.qty) {
              throw new AppException(
                `المخزون غير كافٍ للمنتج: ${product.name}`,
                400,
              );
            }
          }
        }

        // 5. Calculate totals
        const couponDiscount = cart.couponDiscount || 0;
        const shippingCost = dto.shippingMethod === 'express' ? 10000 : 0;
        const tax = 0; // يمكن حسابه لاحقاً
        const totalDiscount = itemsDiscount + couponDiscount;
        const total = subtotal - totalDiscount + shippingCost + tax;

        // 6. Generate order number
        const orderNumber = await this.generateOrderNumber();

        // 7. Create order
        const orderData = {
          orderNumber,
          userId: new Types.ObjectId(userId),
          status: dto.paymentMethod === 'COD' ? OrderStatus.CONFIRMED : OrderStatus.PENDING,
          paymentStatus: dto.paymentMethod === 'COD' ? PaymentStatus.PAID : PaymentStatus.PENDING,
          
          deliveryAddress: {
            addressId: deliveryAddress._id,
            recipientName: deliveryAddress.recipientName,
            recipientPhone: deliveryAddress.recipientPhone,
            line1: deliveryAddress.line1,
            line2: deliveryAddress.line2,
            city: deliveryAddress.city,
            region: deliveryAddress.region,
            country: deliveryAddress.country,
            coords: deliveryAddress.coords,
            notes: deliveryAddress.notes,
          },

          items: orderItems,

          currency: dto.currency,
          subtotal,
          itemsDiscount,
          appliedCouponCode: cart.appliedCouponCode,
          couponDiscount,
          couponDetails: cart.appliedCouponCode ? {
            code: cart.appliedCouponCode,
            title: '', // يمكن جلبه من CouponsService
            type: '',
          } : undefined,
          shippingCost,
          tax,
          totalDiscount,
          total,

          paymentMethod: dto.paymentMethod,
          paymentProvider: dto.paymentProvider,
          shippingMethod: dto.shippingMethod || 'standard',
          customerNotes: dto.customerNotes,

          statusHistory: [{
            status: dto.paymentMethod === 'COD' ? OrderStatus.CONFIRMED : OrderStatus.PENDING,
            changedAt: new Date(),
            changedByRole: 'system',
            notes: dto.paymentMethod === 'COD' 
              ? 'تم تأكيد الطلب - الدفع عند الاستلام'
              : 'تم إنشاء الطلب - في انتظار الدفع',
          }],

          paidAt: dto.paymentMethod === 'COD' ? new Date() : undefined,

          metadata: {
            cartId: cart._id.toString(),
            source: cart.metadata?.source || 'web',
          },
        };

        const [createdOrder] = await this.orderModel.create([orderData], { session });
        order = createdOrder;

        // 8. Reserve inventory
        for (const item of orderItems) {
          await this.reserveInventory(
            item.variantId.toString(),
            item.qty,
            order._id!.toString(),
            session,
          );
        }

        // 9. If COD, commit inventory immediately
        if (dto.paymentMethod === 'COD') {
          for (const item of orderItems) {
            await this.commitInventory(
              item.variantId.toString(),
              item.qty,
              order._id!.toString(),
              session,
            );
          }
        }

        // 10. Mark cart as converted
        cart.status = 'converted' as any;
        cart.convertedToOrderId = order._id;
        cart.convertedAt = new Date();
        await cart.save({ session });

        // 11. Update address usage
        await this.addressesService.markAsUsed(dto.deliveryAddressId, userId);

        // 12. Update coupon usage
        if (cart.appliedCouponCode) {
          await this.couponsService.applyCouponToOrder(
            cart.appliedCouponCode,
            order._id!.toString(),
            userId,
            total,
            couponDiscount,
          );
        }
      });

      this.logger.log(`Order created: ${order.orderNumber} for user ${userId}`);

      // TODO: Send notifications
      // await this.notifyCustomer(order);
      // await this.notifyAdmin(order);

      return order;
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: string, page = 1, limit = 20, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    const query: any = { userId: new Types.ObjectId(userId) };

    if (status) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId: string, userId: string) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      userId: new Types.ObjectId(userId),
    });

    if (!order) {
      throw new AppException('الطلب غير موجود', 404);
    }

    return order;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userId: string, reason: string) {
    const session = await this.connection.startSession();

    try {
      let order!: Order;

      await session.withTransaction(async () => {
        order = await this.orderModel.findOne({
          _id: orderId,
          userId: new Types.ObjectId(userId),
        }).session(session);

        if (!order) {
          throw new AppException('الطلب غير موجود', 404);
        }

        // Check if cancellation is allowed
        const allowedStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING];
        if (!allowedStatuses.includes(order.status)) {
          throw new AppException(
            'لا يمكن إلغاء الطلب في هذه المرحلة',
            400,
          );
        }

        // Release inventory reservations
        for (const item of order.items) {
          await this.releaseInventory(
            item.variantId.toString(),
            item.qty,
            orderId,
            session,
          );
        }

        // Update order
        order.status = OrderStatus.CANCELLED;
        order.cancelledAt = new Date();
        order.cancellationReason = reason;

        order.statusHistory.push({
          status: OrderStatus.CANCELLED,
          changedAt: new Date(),
          changedBy: new Types.ObjectId(userId),
          changedByRole: 'customer',
          notes: `تم الإلغاء من قبل العميل: ${reason}`,
        });

        await order.save({ session });

        // Process refund if already paid
        if (order.paymentStatus === PaymentStatus.PAID) {
          order.isRefunded = true;
          order.refundAmount = order.total;
          order.refundReason = 'Order cancelled';
          order.refundedAt = new Date();
          order.paymentStatus = PaymentStatus.REFUNDED;
          await order.save({ session });
        }
      });

      this.logger.log(`Order ${order.orderNumber} cancelled by user ${userId}`);

      // TODO: Send notifications
      // await this.notifyOrderCancelled(order);

      return order;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Update order status (Admin)
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminId: string,
    notes?: string,
  ) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new AppException('الطلب غير موجود', 404);
    }

    // Validate transition
    if (!this.isValidTransition(order.status, newStatus)) {
      throw new AppException(
        `لا يمكن تغيير الحالة من ${order.status} إلى ${newStatus}`,
        400,
      );
    }

    // Update status
    order.status = newStatus;

    // Add to history
    order.statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
      changedBy: new Types.ObjectId(adminId),
      changedByRole: 'admin',
      notes,
    });

    await order.save();

    this.logger.log(`Order ${order.orderNumber} status updated to ${newStatus}`);

    // TODO: Send notification
    // await this.notifyStatusChange(order);

    return order;
  }

  /**
   * Ship order (Admin)
   */
  async shipOrder(orderId: string, dto: ShipOrderDto, adminId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new AppException('الطلب غير موجود', 404);
    }

    if (order.status !== OrderStatus.PROCESSING && order.status !== OrderStatus.READY_TO_SHIP) {
      throw new AppException('الطلب غير جاهز للشحن', 400);
    }

    // Update shipping info
    order.trackingNumber = dto.trackingNumber;
    order.trackingUrl = this.generateTrackingUrl(dto.shippingCompany, dto.trackingNumber);
    order.estimatedDeliveryDate = dto.estimatedDeliveryDate 
      ? new Date(dto.estimatedDeliveryDate)
      : undefined;

    // Update status
    order.status = OrderStatus.SHIPPED;

    order.statusHistory.push({
      status: OrderStatus.SHIPPED,
      changedAt: new Date(),
      changedBy: new Types.ObjectId(adminId),
      changedByRole: 'admin',
      notes: dto.notes || `تم الشحن عبر ${dto.shippingCompany} - رقم التتبع: ${dto.trackingNumber}`,
    });

    await order.save();

    this.logger.log(`Order ${order.orderNumber} shipped`);

    // TODO: Send SMS/Email with tracking
    // await this.notifyShipped(order);

    return order;
  }

  /**
   * Process refund (Admin)
   */
  async processRefund(orderId: string, dto: RefundOrderDto, adminId: string) {
    const session = await this.connection.startSession();

    try {
      let order!: Order;

      await session.withTransaction(async () => {
        order = await this.orderModel.findById(orderId).session(session);

        if (!order) {
          throw new AppException('الطلب غير موجود', 404);
        }

        if (order.paymentStatus !== PaymentStatus.PAID) {
          throw new AppException('الطلب غير مدفوع', 400);
        }

        if (dto.amount > order.total) {
          throw new AppException('مبلغ الاسترداد أكبر من قيمة الطلب', 400);
        }

        const isPartialRefund = dto.amount < order.total;

        // Update order
        order.isRefunded = true;
        order.refundAmount = dto.amount;
        order.refundReason = dto.reason;
        order.refundedAt = new Date();
        order.paymentStatus = isPartialRefund 
          ? PaymentStatus.REFUNDED 
          : PaymentStatus.REFUNDED;
        order.status = isPartialRefund ? OrderStatus.REFUNDED : OrderStatus.REFUNDED;

        order.statusHistory.push({
          status: order.status,
          changedAt: new Date(),
          changedBy: new Types.ObjectId(adminId),
          changedByRole: 'admin',
          notes: `استرداد ${dto.amount} ${order.currency} - السبب: ${dto.reason}`,
        });

        await order.save({ session });

        // Restore inventory for returned items
        if (dto.items) {
          for (const returnItem of dto.items) {
            await this.restoreInventory(
              returnItem.variantId,
              returnItem.qty,
              orderId,
              session,
            );
          }
        }
      });

      this.logger.log(`Refund processed for order ${order.orderNumber}: ${dto.amount}`);

      // TODO: Process actual refund through payment gateway
      // await this.processPaymentRefund(order, dto.amount);

      return order;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get all orders (Admin)
   */
  async getAllOrders(
    page = 1,
    limit = 20,
    status?: OrderStatus,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'deliveryAddress.recipientName': { $regex: search, $options: 'i' } },
        { 'deliveryAddress.recipientPhone': { $regex: search, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ===== Helper Methods =====

  private async reserveInventory(
    variantId: string,
    qty: number,
    orderId: string,
    session: any,
  ) {
    const inventory = await this.inventoryModel.findOneAndUpdate(
      { variantId },
      { 
        $setOnInsert: { on_hand: 0, reserved: 0, safety_stock: 0 },
        $inc: { reserved: qty }
      },
      { upsert: true, new: true, session },
    );

    const expiresAt = new Date(Date.now() + this.RESERVATION_TTL_SECONDS * 1000);

    await this.reservationModel.create([{
      variantId: new Types.ObjectId(variantId),
      orderId: new Types.ObjectId(orderId),
      qty,
      expiresAt,
      status: 'ACTIVE',
    }], { session });

    this.logger.debug(`Reserved ${qty} units of variant ${variantId}`);
  }

  private async commitInventory(
    variantId: string,
    qty: number,
    orderId: string,
    session: any,
  ) {
    const inventory = await this.inventoryModel.findOne({ variantId }).session(session);

    if (inventory) {
      inventory.on_hand -= qty;
      inventory.reserved -= qty;
      await inventory.save({ session });
    }

    await this.ledgerModel.create([{
      variantId,
      change: -qty,
      reason: 'ORDER_CONFIRMED',
      refId: orderId,
    }], { session });

    await this.reservationModel.updateMany(
      { orderId, variantId, status: 'ACTIVE' },
      { $set: { status: 'COMMITTED' } },
    ).session(session);

    this.logger.debug(`Committed ${qty} units of variant ${variantId}`);
  }

  private async releaseInventory(
    variantId: string,
    qty: number,
    orderId: string,
    session: any,
  ) {
    const inventory = await this.inventoryModel.findOne({ variantId }).session(session);

    if (inventory) {
      inventory.reserved -= qty;
      await inventory.save({ session });
    }

    await this.reservationModel.updateMany(
      { orderId, variantId, status: 'ACTIVE' },
      { $set: { status: 'CANCELLED' } },
    ).session(session);

    this.logger.debug(`Released ${qty} units of variant ${variantId}`);
  }

  private async restoreInventory(
    variantId: string,
    qty: number,
    orderId: string,
    session: any,
  ) {
    const inventory = await this.inventoryModel.findOne({ variantId }).session(session);

    if (inventory) {
      inventory.on_hand += qty;
      await inventory.save({ session });
    }

    await this.ledgerModel.create([{
      variantId,
      change: qty,
      reason: 'ORDER_REFUNDED',
      refId: orderId,
    }], { session });

    this.logger.debug(`Restored ${qty} units of variant ${variantId}`);
  }

  private isValidTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.READY_TO_SHIP, OrderStatus.CANCELLED],
      [OrderStatus.READY_TO_SHIP]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.RETURNED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private generateTrackingUrl(company: string, trackingNumber: string): string {
    const urls: Record<string, string> = {
      DHL: `https://www.dhl.com/tracking?trackingNumber=${trackingNumber}`,
      ARAMEX: `https://www.aramex.com/track?number=${trackingNumber}`,
      SMSA: `https://www.smsaexpress.com/track?awb=${trackingNumber}`,
    };

    return urls[company.toUpperCase()] || '';
  }

  private hmac(payload: string): string {
    return crypto
      .createHmac('sha256', this.PAYMENT_SIGNING_KEY)
      .update(payload)
      .digest('hex');
  }
}


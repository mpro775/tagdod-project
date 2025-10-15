import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Order, OrderStatus, PaymentStatus } from './schemas/order.schema';
import { Inventory } from './schemas/inventory.schema';
import { Reservation } from './schemas/reservation.schema';
import { InventoryLedger } from './schemas/inventory-ledger.schema';
import { CartService } from '../cart/cart.service';
import * as crypto from 'crypto';
import { RefundOrderDto, ShipOrderDto, CheckoutConfirmDto } from './dto/checkout.dto';

interface CartLine {
  itemId: string;
  variantId: string;
  qty: number;
  unit: { base: number; final: number; currency: string; appliedRule: unknown };
  lineTotal: number;
}

@Injectable()
export class CheckoutService {
  private reservationTtlSec = Number(process.env.RESERVATION_TTL_SECONDS || 900);
  private paymentSigningKey = process.env.PAYMENT_SIGNING_KEY || 'dev_signing_key';

  constructor(
    @InjectModel(Order.name) private orders: Model<Order>,
    @InjectModel(Inventory.name) private inventory: Model<Inventory>,
    @InjectModel(Reservation.name) private reservations: Model<Reservation>,
    @InjectModel(InventoryLedger.name) private ledger: Model<InventoryLedger>,
    @InjectConnection() private conn: Connection,
    private cart: CartService,
  ) {}

  // ---- Helpers
  private hmac(payload: string) {
    return crypto.createHmac('sha256', this.paymentSigningKey).update(payload).digest('hex');
  }

  // ---- Preview
  async preview(userId: string, currency: string) {
    // Use CartService to compute lines and totals (already integrates promotions)
    const data = await this.cart.previewUser(userId, currency, 'any');
    return data;
  }

  // ---- Confirm
  async confirm(
    userId: string,
    currency: string,
    method: 'COD' | 'ONLINE',
    provider?: string,
    addressId?: string,
  ) {
    // Recalculate from cart to prevent tampering
    const quote = await this.preview(userId, currency);
    const total = quote.subtotal;

    const session = await this.conn.startSession();
    let orderDoc!: Order;
    await session.withTransaction(async () => {
      // 1) Create Order (PENDING)
      const createdOrders = await this.orders.create(
        [
          {
            userId: new Types.ObjectId(userId),
            addressId,
            status: 'PENDING',
            currency,
            total,
            wholesaleDiscountPercent: quote.meta.wholesaleDiscountPercent || 0,
            wholesaleDiscountAmount: quote.meta.wholesaleDiscountAmount || 0,
            items: quote.items.map((ln: CartLine) => ({
              productId: null, // Optional: fill if productId available in preview
              variantId: new Types.ObjectId(ln.variantId),
              qty: ln.qty,
              unitPrice: ln.unit.final,
              currency,
              snapshot: {
                /* could be enriched from catalog if needed */
              },
            })),
            paymentMethod: method,
            paymentProvider: provider,
          },
        ],
        { session },
      );
      orderDoc = createdOrders[0];

      // 2) Reserve inventory for each line
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.reservationTtlSec * 1000);

      for (const ln of quote.items as CartLine[]) {
        // Ensure inventory record exists
        const inv = await this.inventory.findOneAndUpdate(
          { variantId: ln.variantId },
          { $setOnInsert: { on_hand: 0, reserved: 0, safety_stock: 0 } },
          { upsert: true, new: true, session },
        );

        const available = inv.on_hand - inv.reserved - inv.safety_stock;
        if (available < ln.qty) {
          throw new Error('Inventory shortage');
        }

        inv.reserved += ln.qty;
        await inv.save({ session });

        await this.reservations.create(
          [
            {
              variantId: new Types.ObjectId(ln.variantId),
              orderId: orderDoc._id,
              qty: ln.qty,
              expiresAt,
              status: 'ACTIVE',
            },
          ],
          { session },
        );
      }

      // 3) If COD → commit immediately
      if (method === 'COD') {
        for (const ln of quote.items as CartLine[]) {
          const inv = await this.inventory.findOne({ variantId: ln.variantId }).session(session);
          if (inv) {
            inv.on_hand -= ln.qty;
            inv.reserved -= ln.qty;
            await inv.save({ session });
          }
          await this.ledger.create(
            [
              {
                variantId: ln.variantId,
                change: -ln.qty,
                reason: 'ORDER_CONFIRMED_OUT',
                refId: String(orderDoc._id),
              },
            ],
            { session },
          );
        }
        await this.orders.updateOne(
          { _id: orderDoc._id },
          { $set: { status: 'CONFIRMED' } },
          { session },
        );
      }
    });

    if (method === 'ONLINE') {
      // Create simple intentId + signature (client will redirect to provider normally)
      const intentId = 'gw-' + String(orderDoc._id);
      const payload = `${intentId}|PENDING|${total}`;
      const signature = this.hmac(payload);
      await this.orders.updateOne({ _id: orderDoc._id }, { $set: { paymentIntentId: intentId } });
      return {
        orderId: String(orderDoc._id),
        payment: { intentId, provider, amount: total, signature },
      };
    } else {
      return { orderId: String(orderDoc._id), status: 'CONFIRMED' };
    }
  }

  // ---- Webhook
  async handleWebhook(
    intentId: string,
    status: 'SUCCESS' | 'FAILED',
    amount: string,
    signature: string,
  ) {
    const expected = this.hmac(`${intentId}|${status}|${amount}`);
    if (signature !== expected) return { ok: false, reason: 'BAD_SIGNATURE' };

    const session = await this.conn.startSession();
    await session.withTransaction(async () => {
      const order = await this.orders.findOne({ paymentIntentId: intentId }).session(session);
      if (!order) return;

      const qtyByVariant = new Map<string, number>();
      for (const it of order.items) {
        const key = String(it.variantId);
        qtyByVariant.set(key, (qtyByVariant.get(key) || 0) + it.qty);
      }

      if (status === 'SUCCESS' && Number(amount) === order.total) {
        // Commit inventory
        for (const [variantId, qty] of qtyByVariant.entries()) {
          const inv = await this.inventory.findOne({ variantId }).session(session);
          if (inv) {
            inv.on_hand -= qty;
            inv.reserved -= qty;
            await inv.save({ session });
          }
          await this.ledger.create(
            [{ variantId, change: -qty, reason: 'ORDER_CONFIRMED_OUT', refId: String(order._id) }],
            { session },
          );
          await this.reservations
            .updateMany(
              { orderId: order._id, variantId, status: 'ACTIVE' },
              { $set: { status: 'COMMITTED' } },
            )
            .session(session);
        }
        order.status = OrderStatus.CONFIRMED;
        order.paidAt = new Date();
        await order.save({ session });
      } else {
        // Release reservations
        for (const [variantId, qty] of qtyByVariant.entries()) {
          const inv = await this.inventory.findOne({ variantId }).session(session);
          if (inv) {
            inv.reserved -= qty;
            await inv.save({ session });
          }
          await this.ledger.create(
            [{ variantId, change: 0, reason: 'PAYMENT_FAILED_RELEASE', refId: String(order._id) }],
            { session },
          );
          await this.reservations
            .updateMany(
              { orderId: order._id, variantId, status: 'ACTIVE' },
              { $set: { status: 'CANCELLED' } },
            )
            .session(session);
        }
        order.status = OrderStatus.PAYMENT_FAILED;
        await order.save({ session });
      }
    });
    return { ok: true };
  }

  // ---- FSM transitions
  private canUserCancel(status: string) {
    return ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(status);
  }
  private nextAllowed(current: string, next: string) {
    const allowed = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: ['COMPLETED'],
    } as Record<string, string[]>;
    return (allowed[current] || []).includes(next);
  }

  async listMy(userId: string) {
    return this.orders.find({ userId }).sort({ createdAt: -1 }).lean();
  }
  async getMy(userId: string, id: string) {
    return this.orders.findOne({ _id: id, userId }).lean();
  }
  async userCancel(userId: string, id: string) {
    const order = await this.orders.findOne({ _id: id, userId });
    if (!order) return null;
    if (!this.canUserCancel(order.status)) return { error: 'ORDER_CANNOT_CANCEL' };
    order.status = OrderStatus.CANCELLED;
    await order.save();
    // NOTE: in real flow, if order had reserved inventory (ONLINE not completed), release it.
    return { ok: true };
  }

  // ===== User helpers used by OrdersController =====
  async getUserOrders(userId: string, page = 1, limit = 20, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { userId };
    if (status) query.status = status;
    const [orders, total] = await Promise.all([
      this.orders
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orders.countDocuments(query),
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

  async cancelOrder(orderId: string, userId: string, reason: string) {
    const order = await this.orders.findOne({ _id: orderId, userId });
    if (!order) return null;
    if (!this.canUserCancel(order.status)) return { error: 'ORDER_CANNOT_CANCEL' };
    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    await order.save();
    return order;
  }

  async adminList() {
    return this.orders.find().sort({ createdAt: -1 }).lean();
  }
  async adminSetStatus(id: string, status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED') {
    const order = await this.orders.findById(id);
    if (!order) return null;
    if (!this.nextAllowed(order.status, status)) return { error: 'INVALID_TRANSITION' };
    order.status = status as OrderStatus;
    await order.save();
    return { ok: true };
  }

  // ===== Admin helpers used by AdminOrdersController =====
  async createOrder(dto: CheckoutConfirmDto, userId: string) {
    // Re-use confirm flow to create an order and then fetch it
    const res = await this.confirm(
      userId,
      dto.currency,
      (dto.paymentMethod === 'COD' ? 'COD' : 'ONLINE'),
      dto.paymentProvider,
      dto.deliveryAddressId,
    );
    const order = await this.orders.findById(res.orderId);
    return order;
  }

  async getAllOrders(
    page = 1,
    limit = 20,
    status?: OrderStatus,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

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
      this.orders
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orders.countDocuments(query),
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

  async getOrderDetails(orderId: string, userId?: string) {
    const q: Record<string, unknown> = { _id: orderId };
    if (userId) q.userId = userId;
    const order = await this.orders.findOne(q as Record<string, unknown>);
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminId: string,
    notes?: string,
  ) {
    const order = await this.orders.findById(orderId);
    if (!order) return null;
    if (!this.nextAllowed(order.status, newStatus)) return { error: 'INVALID_TRANSITION' };
    order.status = newStatus;
    order.statusHistory.push({ status: newStatus, changedAt: new Date(), changedBy: new Types.ObjectId(adminId), changedByRole: 'admin', notes });
    await order.save();
    return order;
  }

  async shipOrder(orderId: string, dto: ShipOrderDto, adminId: string) {
    const order = await this.orders.findById(orderId);
    if (!order) return null;
    if (![OrderStatus.PROCESSING, OrderStatus.READY_TO_SHIP].includes(order.status)) return null;
    order.trackingNumber = dto.trackingNumber;
    order.trackingUrl = '';
    order.estimatedDeliveryDate = dto.estimatedDeliveryDate ? new Date(dto.estimatedDeliveryDate) : undefined;
    order.status = OrderStatus.SHIPPED;
    order.statusHistory.push({ status: OrderStatus.SHIPPED, changedAt: new Date(), changedBy: new Types.ObjectId(adminId), changedByRole: 'admin', notes: dto.notes });
    await order.save();
    return order;
  }

  async processRefund(orderId: string, dto: RefundOrderDto, adminId: string) {
    const order = await this.orders.findById(orderId);
    if (!order) return null;
    if (order.paymentStatus !== PaymentStatus.PAID) return null;
    if (dto.amount > order.total) return null;
    order.isRefunded = true;
    order.refundAmount = dto.amount;
    order.refundReason = dto.reason;
    order.refundedAt = new Date();
    order.paymentStatus = PaymentStatus.REFUNDED;
    order.status = OrderStatus.REFUNDED;
    order.statusHistory.push({ status: order.status, changedAt: new Date(), changedBy: new Types.ObjectId(adminId), changedByRole: 'admin', notes: `Refund ${dto.amount}` });
    await order.save();
    return order;
  }
}

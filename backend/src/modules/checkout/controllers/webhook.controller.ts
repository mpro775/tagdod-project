import { Body, Controller, Post, Headers, Logger, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { OrderService } from '../services/order.service';
import { WebhookDto } from '../dto/order.dto';
import { Order, OrderDocument, OrderStatus } from '../schemas/order.schema';
import { Product, ProductDocument } from '../../products/schemas/product.schema';
import { Variant, VariantDocument } from '../../products/schemas/variant.schema';
import { NotificationService } from '../../notifications/services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../../notifications/enums/notification.enums';
import { FavoritesService } from '../../favorites/favorites.service';

interface InventoryWebhookDto {
  variantId: string;
  change: number;
  reason?: string;
  timestamp?: string;
}

/**
 * Controller للـ Webhooks - معالجة إشعارات الدفع
 */
@ApiTags('الخطافات')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly notificationsService: NotificationService,
    private readonly favoritesService: FavoritesService,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Variant.name) private variantModel: Model<VariantDocument>,
  ) {}

  /**
   * التحقق من صحة توقيع Webhook
   */
  private verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    if (!signature || !secret) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');

      const receivedSignature = signature.replace('sha256=', '');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex'),
      );
    } catch (error) {
      this.logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  @Post('payment')
  @ApiOperation({
    summary: 'Webhook الدفع',
    description: 'معالجة إشعارات الدفع من مزودي الخدمة',
  })
  @ApiHeader({
    name: 'X-Webhook-Signature',
    required: false,
    description: 'توقيع Webhook للتحقق من الأمان',
  })
  @ApiResponse({ status: 200, description: 'تم معالجة Webhook بنجاح' })
  @ApiResponse({ status: 400, description: 'Webhook غير صحيح' })
  async handlePaymentWebhook(
    @Body() dto: WebhookDto,
    @Headers('X-Webhook-Signature') signature?: string,
  ) {
    // التحقق من توقيع Webhook إذا كان موجوداً
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const payload = JSON.stringify(dto);
      if (!this.verifyWebhookSignature(payload, signature, webhookSecret)) {
        this.logger.warn('Invalid payment webhook signature');
        throw new UnauthorizedException('توقيع Webhook غير صحيح');
      }
    }

    const result = await this.orderService.handlePaymentWebhook(
      dto.intentId,
      dto.status,
      dto.amount,
      dto.signature,
    );

    return {
      result,
      message: result.ok ? 'تم معالجة الدفع بنجاح' : result.reason
    };
  }

  @Post('shipping')
  @ApiOperation({
    summary: 'Webhook الشحن',
    description: 'معالجة إشعارات الشحن من شركات النقل',
  })
  @ApiResponse({ status: 200, description: 'تم معالجة إشعار الشحن' })
  async handleShippingWebhook(
    @Body() body: Record<string, unknown>,
    @Headers('X-Webhook-Signature') signature?: string,
  ) {
    // التحقق من التوقيع (اختياري - يمكن تعطيله في التطوير)
    const webhookSecret = process.env.SHIPPING_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const payload = JSON.stringify(body);
      if (!this.verifyWebhookSignature(payload, signature, webhookSecret)) {
        this.logger.warn('Invalid shipping webhook signature');
        throw new UnauthorizedException('توقيع Webhook غير صحيح');
      }
    }

    const { trackingNumber, status, location, timestamp, estimatedDelivery, carrier } = body;

    // التحقق من صحة البيانات المطلوبة
    if (!trackingNumber || !status) {
      throw new UnauthorizedException('رقم التتبع والحالة مطلوبان');
    }

    // البحث عن الطلب بناءً على رقم التتبع
    const order = await this.orderModel
      .findOne({
        trackingNumber: trackingNumber,
      })
      .populate('userId', 'name email phone');

    if (!order) {
      this.logger.warn(`Order not found for tracking number: ${trackingNumber}`);
      throw new UnauthorizedException('الطلب غير موجود');
    }

    // تحديث معلومات الشحن
    const shippingUpdate = {
      status,
      location: location || (order.metadata as Record<string, unknown>)?.shippingLocation,
      lastUpdated: new Date((timestamp as string) || Date.now()),
      estimatedDelivery: estimatedDelivery
        ? new Date(estimatedDelivery as string)
        : order.estimatedDeliveryDate,
      carrier: carrier || order.shippingCompany,
    };

    // تحديث حالة الطلب بناءً على حالة الشحن
    let orderStatus = order.status;
    switch (status as string) {
      case 'shipped':
      case 'in_transit':
        orderStatus = OrderStatus.SHIPPED;
        break;
      case 'out_for_delivery':
        orderStatus = OrderStatus.OUT_FOR_DELIVERY;
        break;
      case 'delivered':
        orderStatus = OrderStatus.DELIVERED;
        break;
      case 'failed_delivery':
      case 'delivery_failed':
        orderStatus = OrderStatus.ON_HOLD;
        break;
      case 'returned_to_sender':
        orderStatus = OrderStatus.RETURNED;
        break;
    }

    // تحديث الطلب في قاعدة البيانات
    await this.orderModel.findByIdAndUpdate(order._id, {
      status: orderStatus,
      shippingCompany: shippingUpdate.carrier,
      estimatedDeliveryDate: shippingUpdate.estimatedDelivery,
      metadata: {
        ...order.metadata,
        shippingLocation: shippingUpdate.location,
        shippingStatus: shippingUpdate.status,
        shippingLastUpdated: shippingUpdate.lastUpdated,
      },
      updatedAt: new Date(),
    });

    // إرسال إشعار للعميل
    try {
      await this.notificationsService.createNotification({
        type: NotificationType.ORDER_SHIPPED,
        title: 'تحديث حالة الشحن',
        message: `تم تحديث حالة شحن طلبك رقم ${order.orderNumber} إلى: ${status}`,
        messageEn: `Your order ${order.orderNumber} shipping status updated to: ${status}`,
        recipientId: order.userId._id.toString(),
        data: {
          orderId: order._id.toString(),
          trackingNumber,
          status,
          location,
          estimatedDelivery: shippingUpdate.estimatedDelivery,
        },
        channel: NotificationChannel.DASHBOARD,
        priority: NotificationPriority.HIGH,
      });
    } catch (notificationError) {
      this.logger.error('Failed to send shipping notification:', notificationError);
      // لا نريد إيقاف العملية إذا فشل الإشعار
    }

    this.logger.log(`Shipping update processed for order ${order._id}: ${status}`);

    return {
      orderId: order._id,
      trackingNumber,
      status,
      orderStatus,
      updated: true,
      message: 'تم معالجة إشعار الشحن بنجاح'
    };
  }

  @Post('inventory')
  @ApiOperation({
    summary: 'Webhook المخزون',
    description: 'معالجة إشعارات تغيير المخزون',
  })
  @ApiResponse({ status: 200, description: 'تم معالجة إشعار المخزون' })
  async handleInventoryWebhook(
    @Body() body: InventoryWebhookDto,
    @Headers('X-Webhook-Signature') signature?: string,
  ) {
    // التحقق من التوقيع (اختياري - يمكن تعطيله في التطوير)
    const webhookSecret = process.env.INVENTORY_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const payload = JSON.stringify(body);
      if (!this.verifyWebhookSignature(payload, signature, webhookSecret)) {
        this.logger.warn('Invalid inventory webhook signature');
        throw new UnauthorizedException('توقيع Webhook غير صحيح');
      }
    }

    const { variantId, change, reason, timestamp } = body;

    // التحقق من صحة البيانات المطلوبة
    if (!variantId || change === undefined) {
      throw new UnauthorizedException('معرف المتغير والتغيير مطلوبان');
    }

    // البحث عن المتغير
    const variant = await this.variantModel
      .findById(variantId)
      .populate('product', 'name titleEn');
    if (!variant) {
      this.logger.warn(`Variant not found: ${variantId}`);
      throw new UnauthorizedException('المتغير غير موجود');
    }

    // حساب المخزون الجديد
    const oldStock = variant.stock || 0;
    let newStockLevel = oldStock + change;

    // التأكد من أن المخزون لا يكون سالباً
    if (newStockLevel < 0) {
      newStockLevel = 0;
    }

    // تحديث المخزون
    await this.variantModel.findByIdAndUpdate(variantId, {
      stock: newStockLevel,
      updatedAt: new Date(timestamp || Date.now()),
    });

    // تسجيل تغيير المخزون
    this.logger.log(
      `Inventory updated for variant ${variantId}: ${oldStock} -> ${newStockLevel} (${change > 0 ? '+' : ''}${change})`,
    );

    // إذا أصبح المنتج متوفراً (من 0 إلى أكثر من 0)
    if (oldStock === 0 && newStockLevel > 0) {
      try {
        // البحث عن العملاء الذين أضافوا هذا المنتج للمفضلة
        const interestedCustomers = await this.findCustomersInterestedInProduct(
          variant.productId.toString(),
        );

        // إرسال إشعارات للعملاء المهتمين
        if (interestedCustomers.length > 0) {
          for (const customer of interestedCustomers) {
            await this.notificationsService.createNotification({
              type: NotificationType.PRODUCT_BACK_IN_STOCK,
              title: 'المنتج متوفر الآن',
              message: `المنتج ${variant.productId} متوفر الآن في المخزون`,
              messageEn: `Product ${variant.productId} is now back in stock`,
              recipientId: customer._id.toString(),
              data: {
                productId: variant.productId.toString(),
                variantId: variantId,
              },
              channel: NotificationChannel.DASHBOARD,
              priority: NotificationPriority.MEDIUM,
            });
          }
        }

        // تحديث حالة الطلبات المعلقة التي تحتوي على هذا المتغير
        await this.updatePendingOrdersForVariant(variantId, newStockLevel);
      } catch (notificationError) {
        this.logger.error('Failed to send stock notifications:', notificationError);
      }
    }

    // إذا نفد المخزون (من أكثر من 0 إلى 0)
    if (oldStock > 0 && newStockLevel === 0) {
      try {
        // تحديث حالة الطلبات التي تحتوي على هذا المتغير
        await this.handleOutOfStockOrders(variantId);
      } catch (orderError) {
        this.logger.error('Failed to handle out of stock orders:', orderError);
      }
    }

    return {
      variantId,
      productId: variant.productId.toString(),
      oldStock,
      newStock: newStockLevel,
      change,
      reason,
      stockAvailable: newStockLevel > 0,
      updated: true,
      message: 'تم معالجة إشعار المخزون بنجاح'
    };
  }

  /**
   * البحث عن العملاء المهتمين بمنتج معين
   */
  private async findCustomersInterestedInProduct(
    productId: string,
  ): Promise<Array<{ _id: string; name: string; email: string; phone: string }>> {
    try {
      // البحث عن العملاء الذين أضافوا المنتج للمفضلة
      const favorites = await this.favoritesService.listUserFavorites(productId);

      // استخراج معرفات المستخدمين من المفضلة
      const userIds = favorites
        .filter((fav) => fav.userId && fav.userId !== null)
        .map((fav) => fav.userId!.toString());

      if (userIds.length === 0) {
        return [];
      }

      // البحث عن بيانات المستخدمين
      const users = await this.orderModel
        .distinct('userId', {
          _id: { $in: userIds },
        })
        .populate('userId', 'name email phone');

      // تحويل البيانات إلى الشكل المطلوب
      return users.map((user) => ({
        _id: user._id.toString(),
        name: user.name || 'مستخدم',
        email: user.email || '',
        phone: user.phone || '',
      }));
    } catch (error) {
      this.logger.error('Error finding interested customers:', error);
      return [];
    }
  }

  /**
   * تحديث الطلبات المعلقة عندما يصبح المتغير متوفراً
   */
  private async updatePendingOrdersForVariant(variantId: string, availableStock: number) {
    try {
      // البحث عن الطلبات المعلقة التي تحتوي على هذا المتغير
      const pendingOrders = await this.orderModel
        .find({
          status: 'pending',
          'items.variantId': variantId,
        })
        .populate('customer', 'name email phone');

      for (const order of pendingOrders) {
        const orderItem = order.items.find((item) => item.variantId.toString() === variantId);
        if (orderItem && orderItem.qty <= availableStock) {
          // يمكن إكمال الطلب إذا كان المخزون كافياً
          await this.orderService.updateOrderStatus(
            order._id.toString(),
            OrderStatus.CONFIRMED,
            new Types.ObjectId(), // system user
            'system',
            'Stock became available',
          );

          // إرسال إشعار للعميل
          try {
            await this.notificationsService.createNotification({
              type: NotificationType.ORDER_CONFIRMED,
              title: 'الطلب جاهز',
              message: `طلبك رقم ${order.orderNumber} جاهز الآن`,
              messageEn: `Your order ${order.orderNumber} is now ready`,
              recipientId: order.userId._id.toString(),
              data: {
                orderId: order._id.toString(),
              },
              channel: NotificationChannel.DASHBOARD,
              priority: NotificationPriority.HIGH,
            });
          } catch (notificationError) {
            this.logger.error('Failed to send order ready notification:', notificationError);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error updating pending orders:', error);
    }
  }

  /**
   * معالجة الطلبات عندما ينفد المخزون
   */
  private async handleOutOfStockOrders(variantId: string) {
    try {
      // البحث عن الطلبات المعلقة التي تحتوي على هذا المتغير
      const affectedOrders = await this.orderModel
        .find({
          status: { $in: ['pending', 'confirmed'] },
          'items.variantId': variantId,
        })
        .populate('customer', 'name email phone');

      for (const order of affectedOrders) {
        // تحديث حالة الطلب إلى معلق بسبب نقص المخزون
        await this.orderModel.findByIdAndUpdate(order._id, {
          status: 'out_of_stock',
          updatedAt: new Date(),
        });

        // إرسال إشعار للعميل
        try {
          await this.notificationsService.createNotification({
            type: NotificationType.OUT_OF_STOCK,
            title: 'المنتج غير متوفر',
            message: `طلبك رقم ${order.orderNumber} معلق بسبب عدم توفر المنتج`,
            messageEn: `Your order ${order.orderNumber} is on hold due to product unavailability`,
            recipientId: order.userId._id.toString(),
            data: {
              orderId: order._id.toString(),
            },
            channel: NotificationChannel.DASHBOARD,
            priority: NotificationPriority.HIGH,
          });
        } catch (notificationError) {
          this.logger.error('Failed to send out of stock notification:', notificationError);
        }
      }
    } catch (error) {
      this.logger.error('Error handling out of stock orders:', error);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Variant, VariantDocument } from '../schemas/variant.schema';
import { NotificationService } from '../../notifications/services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationCategory,
  NotificationNavigationType,
} from '../../notifications/enums/notification.enums';

type PopulatedProduct = { name: string; nameEn: string };

@Injectable()
export class StockAlertService {
  private readonly logger = new Logger(StockAlertService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Variant.name) private variantModel: Model<VariantDocument>,
    private notificationService: NotificationService,
  ) {}

  /**
   * Check for low stock products and send alerts
   */
  async checkLowStockAlerts(): Promise<void> {
    try {
      const lowStockVariants = await this.variantModel
        .find({
          trackInventory: true,
          stock: { $gt: 0 }, // استبعاد المنتجات التي نفذت (stock = 0)
          $expr: { $lt: ['$stock', '$minStock'] },
          isActive: true,
          deletedAt: null,
        })
        .select('_id productId sku stock minStock')
        .populate('productId', 'name nameEn');

      if (lowStockVariants.length > 0) {
        this.logger.warn(`Found ${lowStockVariants.length} variants with low stock`);

        for (const variant of lowStockVariants) {
          await this.sendLowStockAlert(variant);
        }
      }
    } catch (error) {
      this.logger.error('Failed to check low stock alerts:', error);
    }
  }

  /**
   * Send low stock alert for a specific product
   */
  async sendLowStockAlert(variant: VariantDocument): Promise<void> {
    try {
      const product = variant.productId as unknown as PopulatedProduct;
      const alert = {
        type: 'LOW_STOCK',
        variantId: variant._id.toString(),
        productId: variant.productId.toString(),
        productName: product?.name || 'Unknown Product',
        productNameEn: product?.nameEn || 'Unknown Product',
        sku: variant.sku,
        currentStock: variant.stock,
        minStock: variant.minStock,
        timestamp: new Date(),
        message: `متغير "${variant.sku || variant._id}" للمنتج "${product?.name || 'غير محدد'}" يحتوي على مخزون منخفض: ${variant.stock} (الحد الأدنى: ${variant.minStock})`,
        messageEn: `Variant "${variant.sku || variant._id}" for product "${product?.nameEn || 'Unknown'}" has low stock: ${variant.stock} (minimum: ${variant.minStock})`,
      };

      // Log the alert
      this.logger.warn(`LOW STOCK ALERT: ${alert.message}`);

      await this.createNotificationRecord(
        alert as {
          type: 'LOW_STOCK' | 'OUT_OF_STOCK';
          variantId: string;
          productId: string;
          productName: string;
          productNameEn: string;
          sku?: string;
          currentStock?: number;
          minStock?: number;
          timestamp: Date;
          message: string;
          messageEn: string;
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send low stock alert for variant ${variant._id}:`, error);
    }
  }

  /**
   * Check for out of stock products
   */
  async checkOutOfStockAlerts(): Promise<void> {
    try {
      const outOfStockVariants = await this.variantModel
        .find({
          trackInventory: true,
          stock: 0,
          isActive: true,
          deletedAt: null,
        })
        .select('_id productId sku')
        .populate('productId', 'name nameEn');

      if (outOfStockVariants.length > 0) {
        this.logger.warn(`Found ${outOfStockVariants.length} out of stock variants`);

        for (const variant of outOfStockVariants) {
          await this.sendOutOfStockAlert(variant);
        }
      }
    } catch (error) {
      this.logger.error('Failed to check out of stock alerts:', error);
    }
  }

  /**
   * Send out of stock alert
   */
  async sendOutOfStockAlert(variant: VariantDocument): Promise<void> {
    try {
      const product = variant.productId as unknown as PopulatedProduct;
      const alert = {
        type: 'OUT_OF_STOCK',
        variantId: variant._id.toString(),
        productId: variant.productId.toString(),
        productName: product?.name || 'Unknown Product',
        productNameEn: product?.nameEn || 'Unknown Product',
        sku: variant.sku,
        timestamp: new Date(),
        message: `متغير "${variant.sku || variant._id}" للمنتج "${product?.name || 'غير محدد'}" نفد من المخزون`,
        messageEn: `Variant "${variant.sku || variant._id}" for product "${product?.nameEn || 'Unknown'}" is out of stock`,
      };

      this.logger.warn(`OUT OF STOCK ALERT: ${alert.message}`);
      await this.createNotificationRecord(
        alert as {
          type: 'LOW_STOCK' | 'OUT_OF_STOCK';
          variantId: string;
          productId: string;
          productName: string;
          productNameEn: string;
          sku?: string;
          currentStock?: number;
          minStock?: number;
          timestamp: Date;
          message: string;
          messageEn: string;
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send out of stock alert for variant ${variant._id}:`, error);
    }
  }

  /**
   * Create notification record using notifications service
   */
  private async createNotificationRecord(alert: {
    type: 'LOW_STOCK' | 'OUT_OF_STOCK';
    variantId: string;
    productId: string;
    productName: string;
    productNameEn: string;
    sku?: string;
    currentStock?: number;
    minStock?: number;
    timestamp: Date;
    message: string;
    messageEn: string;
  }): Promise<void> {
    try {
      const notificationType =
        alert.type === 'LOW_STOCK' ? NotificationType.LOW_STOCK : NotificationType.OUT_OF_STOCK;

      // التحقق من وجود إشعار حديث لنفس المتغير (خلال آخر ساعة) لمنع التكرار
      const hasRecent = await this.notificationService.hasRecentNotification(
        notificationType,
        alert.variantId,
        60 * 60 * 1000, // آخر ساعة
      );

      if (hasRecent) {
        this.logger.debug(
          `Skipping ${alert.type} alert for variant ${alert.variantId} - recent notification exists`,
        );
        return;
      }

      // Extract productId safely - handle both string and object cases
      const productId = (() => {
        if (typeof alert.productId === 'string') {
          return alert.productId;
        } else if (alert.productId) {
          const productIdObj = alert.productId as any;
          return productIdObj._id?.toString() || productIdObj.toString() || '';
        }
        return '';
      })();

      await this.notificationService.createNotification({
        type: notificationType,
        title: alert.type === 'LOW_STOCK' ? 'تنبيه مخزون منخفض' : 'تنبيه نفاد المخزون',
        message: alert.message,
        messageEn: alert.messageEn,
        channel: NotificationChannel.DASHBOARD,
        priority: NotificationPriority.HIGH,
        category: NotificationCategory.PRODUCT,
        data: {
          variantId: alert.variantId,
          productId,
          productName: alert.productName,
          productNameEn: alert.productNameEn,
          sku: alert.sku,
          currentStock: alert.currentStock,
          minStock: alert.minStock,
          timestamp: alert.timestamp,
        },
        navigationType: NotificationNavigationType.PRODUCT,
        navigationTarget: productId,
        isSystemGenerated: true,
      });

      this.logger.log(
        `Stock alert notification created: ${alert.type} for variant ${alert.variantId} (product ${alert.productId})`,
      );
    } catch (error) {
      this.logger.error(`Failed to create stock alert notification:`, error);
    }
  }

  /**
   * Get low stock products summary
   */
  async getLowStockSummary(): Promise<{
    lowStockCount: number;
    outOfStockCount: number;
    lowStockVariants: Array<{
      variantId: string;
      productId: string;
      productName: string;
      productNameEn: string;
      sku?: string;
      currentStock: number;
      minStock: number;
    }>;
    outOfStockVariants: Array<{
      variantId: string;
      productId: string;
      productName: string;
      productNameEn: string;
      sku?: string;
    }>;
  }> {
    const [lowStockVariants, outOfStockVariants] = await Promise.all([
      this.variantModel
        .find({
          trackInventory: true,
          stock: { $gt: 0 }, // استبعاد المنتجات التي نفذت (stock = 0)
          $expr: { $lt: ['$stock', '$minStock'] },
          isActive: true,
          deletedAt: null,
        })
        .select('_id productId sku stock minStock')
        .populate('productId', 'name nameEn')
        .lean(),

      this.variantModel
        .find({
          trackInventory: true,
          stock: 0,
          isActive: true,
          deletedAt: null,
        })
        .select('_id productId sku')
        .populate('productId', 'name nameEn')
        .lean(),
    ]);

    return {
      lowStockCount: lowStockVariants.length,
      outOfStockCount: outOfStockVariants.length,
      lowStockVariants: lowStockVariants.map((v) => {
        const product = v.productId as unknown as PopulatedProduct;
        return {
          variantId: v._id.toString(),
          productId: v.productId.toString(),
          productName: product.name,
          productNameEn: product.nameEn,
          sku: v.sku,
          currentStock: v.stock,
          minStock: v.minStock,
        };
      }),

      outOfStockVariants: outOfStockVariants.map((v) => {
        const product = v.productId as unknown as PopulatedProduct;
        return {
          variantId: v._id.toString(),
          productId: v.productId.toString(),
          productName: product.name,
          productNameEn: product.nameEn,
          sku: v.sku,
        };
      }),
    };
  }
}

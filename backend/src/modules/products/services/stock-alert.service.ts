import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationType, NotificationChannel, NotificationPriority } from '../../notifications/enums/notification.enums';

@Injectable()
export class StockAlertService {
  private readonly logger = new Logger(StockAlertService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private notificationService: NotificationService,
  ) {}

  /**
   * Check for low stock products and send alerts
   */
  async checkLowStockAlerts(): Promise<void> {
    try {
      const lowStockProducts = await this.productModel.find({
        trackStock: true,
        $expr: { $lt: ['$stock', '$minStock'] },
        deletedAt: null
      }).select('_id name stock minStock categoryId');

      if (lowStockProducts.length > 0) {
        this.logger.warn(`Found ${lowStockProducts.length} products with low stock`);
        
        for (const product of lowStockProducts) {
          await this.sendLowStockAlert(product);
        }
      }
    } catch (error) {
      this.logger.error('Failed to check low stock alerts:', error);
    }
  }

  /**
   * Send low stock alert for a specific product
   */
  async sendLowStockAlert(product: ProductDocument): Promise<void> {
    try {
      const alert = {
        type: 'LOW_STOCK',
        productId: product._id.toString(),
        productName: product.name,
        currentStock: product.stock,
        minStock: product.minStock,
        categoryId: product.categoryId,
        timestamp: new Date(),
        message: `منتج "${product.name}" يحتوي على مخزون منخفض: ${product.stock} (الحد الأدنى: ${product.minStock})`,
        messageEn: `Product "${product.name}" has low stock: ${product.stock} (minimum: ${product.minStock})`
      };

      // Log the alert
      this.logger.warn(`LOW STOCK ALERT: ${alert.message}`);

      // Here you can add more notification methods:
      // - Send email to admin
      // - Send SMS notification
      // - Create notification in admin dashboard
      // - Send to webhook endpoint
      
      await this.createNotificationRecord(alert as {
        type: 'LOW_STOCK' | 'OUT_OF_STOCK';
        productId: string;
        productName: string;
        currentStock?: number;
        minStock?: number;
        message: string;
        messageEn: string;
      });
    } catch (error) {
      this.logger.error(`Failed to send low stock alert for product ${product._id}:`, error);
    }
  }

  /**
   * Check for out of stock products
   */
  async checkOutOfStockAlerts(): Promise<void> {
    try {
      const outOfStockProducts = await this.productModel.find({
        trackStock: true,
        stock: 0,
        deletedAt: null
      }).select('_id name categoryId');

      if (outOfStockProducts.length > 0) {
        this.logger.warn(`Found ${outOfStockProducts.length} out of stock products`);
        
        for (const product of outOfStockProducts) {
          await this.sendOutOfStockAlert(product);
        }
      }
    } catch (error) {
      this.logger.error('Failed to check out of stock alerts:', error);
    }
  }

  /**
   * Send out of stock alert
   */
  async sendOutOfStockAlert(product: ProductDocument): Promise<void> {
    try {
      const alert = {
        type: 'OUT_OF_STOCK',
        productId: product._id.toString(),
        productName: product.name,
        categoryId: product.categoryId,
        timestamp: new Date(),
        message: `منتج "${product.name}" نفد من المخزون`,
        messageEn: `Product "${product.name}" is out of stock`
      };

      this.logger.error(`OUT OF STOCK ALERT: ${alert.message}`);
      await this.createNotificationRecord(alert as {
        type: 'LOW_STOCK' | 'OUT_OF_STOCK';
        productId: string;
        productName: string;
        categoryId: string;
        timestamp: Date;
        message: string;
        messageEn: string;
      });
    } catch (error) {
      this.logger.error(`Failed to send out of stock alert for product ${product._id}:`, error);
    }
  }

  /**
   * Create notification record using notifications service
   */
  private async createNotificationRecord(alert: {
    type: 'LOW_STOCK' | 'OUT_OF_STOCK';
    productId: string;
    productName: string;
    currentStock?: number;
    minStock?: number;
    message: string;
    messageEn: string;
  }): Promise<void> {
    try {
      await this.notificationService.createNotification({
        type: alert.type === 'LOW_STOCK' ? NotificationType.LOW_STOCK : NotificationType.OUT_OF_STOCK,
        title: alert.type === 'LOW_STOCK' ? 'تنبيه مخزون منخفض' : 'تنبيه نفاد المخزون',
        message: alert.message,
        messageEn: alert.messageEn,
        channel: NotificationChannel.DASHBOARD,
        priority: NotificationPriority.HIGH,
        data: {
          productId: alert.productId,
          currentStock: alert.currentStock,
          minStock: alert.minStock,
        },
        isSystemGenerated: true,
      });
      
      this.logger.log(`Stock alert notification created: ${alert.type} for product ${alert.productId}`);
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
    lowStockProducts: Array<{
      productId: string;
      name: string;
      currentStock: number;
      minStock: number;
    }>;
    outOfStockProducts: Array<{
      productId: string;
      name: string;
    }>;
  }> {
    const [lowStockProducts, outOfStockProducts] = await Promise.all([
      this.productModel.find({
        trackStock: true,
        $expr: { $lt: ['$stock', '$minStock'] },
        deletedAt: null
      }).select('_id name stock minStock').lean(),
      
      this.productModel.find({
        trackStock: true,
        stock: 0,
        deletedAt: null
      }).select('_id name').lean()
    ]);

    return {
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts: lowStockProducts.map(p => ({
        productId: p._id.toString(),
        name: p.name,
        currentStock: p.stock,
        minStock: p.minStock
      })),
      outOfStockProducts: outOfStockProducts.map(p => ({
        productId: p._id.toString(),
        name: p.name
      }))
    };
  }
}

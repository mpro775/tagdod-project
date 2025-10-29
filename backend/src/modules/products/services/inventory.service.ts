import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Variant } from '../schemas/variant.schema';
import { 
  VariantNotFoundException,
  ProductException,
  ErrorCode 
} from '../../../shared/exceptions';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationType, NotificationChannel, NotificationPriority } from '../../notifications/enums/notification.enums';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    private notificationService: NotificationService,
  ) {}

  // ==================== Stock Management ====================

  async updateStock(
    variantId: string, 
    quantity: number, 
    operation: 'add' | 'subtract' = 'subtract',
    reason?: string
  ): Promise<{ success: boolean; newStock: number; message?: string }> {
    const variant = await this.variantModel.findById(variantId);

    if (!variant) {
      throw new VariantNotFoundException({ variantId });
    }

    const update = operation === 'add' 
      ? { $inc: { stock: quantity } } 
      : { $inc: { stock: -quantity } };

    await this.variantModel.updateOne({ _id: variantId }, update);

    // جلب المخزون الجديد
    const updatedVariant = await this.variantModel.findById(variantId);
    const newStock = updatedVariant?.stock || 0;

    // فحص المخزون المنخفض
    await this.checkLowStock(variantId);

    // تسجيل العملية
    this.logger.log(
      `Stock ${operation} for variant ${variantId}: ${quantity} units. New stock: ${newStock}. Reason: ${reason || 'Manual update'}`
    );

    return {
      success: true,
      newStock,
      message: `تم ${operation === 'add' ? 'إضافة' : 'خصم'} ${quantity} وحدة. المخزون الجديد: ${newStock}`
    };
  }

  async setStock(variantId: string, newStock: number, reason?: string): Promise<{
    success: boolean;
    oldStock: number;
    newStock: number;
    message?: string;
  }> {
    const variant = await this.variantModel.findById(variantId);

    if (!variant) {
      throw new VariantNotFoundException({ variantId });
    }

    const oldStock = variant.stock;

    await this.variantModel.updateOne(
      { _id: variantId },
      { $set: { stock: newStock } }
    );

    // فحص المخزون المنخفض
    await this.checkLowStock(variantId);

    // تسجيل العملية
    this.logger.log(
      `Stock set for variant ${variantId}: ${oldStock} -> ${newStock}. Reason: ${reason || 'Manual update'}`
    );

    return {
      success: true,
      oldStock,
      newStock,
      message: `تم تحديث المخزون من ${oldStock} إلى ${newStock}`
    };
  }

  // ==================== Availability Check ====================

  async checkAvailability(
    variantId: string, 
    requestedQuantity: number
  ): Promise<{
    available: boolean;
    reason?: string;
    availableStock?: number;
    canBackorder?: boolean;
  }> {
    const variant = await this.variantModel.findById(variantId).lean();

    if (!variant) {
      return { available: false, reason: 'VARIANT_NOT_FOUND' };
    }

    if (!variant.isActive || !variant.isAvailable) {
      return { available: false, reason: 'VARIANT_NOT_AVAILABLE' };
    }

    // التحقق من صحة قيمة المخزون
    if (variant.trackInventory && isNaN(variant.stock)) {
      this.logger.warn(`Invalid stock value for variant ${variantId}: ${variant.stock}`);
      return { available: false, reason: 'INVALID_STOCK_VALUE' };
    }

    if (variant.trackInventory && variant.stock < requestedQuantity) {
      if (!variant.allowBackorder) {
        return { 
          available: false, 
          reason: 'INSUFFICIENT_STOCK',
          availableStock: variant.stock,
          canBackorder: false
        };
      }
      return {
        available: true,
        reason: 'BACKORDER_ALLOWED',
        availableStock: variant.stock,
        canBackorder: true
      };
    }

    return { 
      available: true, 
      availableStock: variant.stock,
      canBackorder: variant.allowBackorder
    };
  }

  async checkMultipleAvailability(
    requests: Array<{ variantId: string; quantity: number }>
  ): Promise<Array<{
    variantId: string;
    available: boolean;
    reason?: string;
    availableStock?: number;
    canBackorder?: boolean;
  }>> {
    const results = await Promise.all(
      requests.map(async (request) => {
        const result = await this.checkAvailability(request.variantId, request.quantity);
        return {
          variantId: request.variantId,
          ...result
        };
      })
    );

    return results;
  }

  // ==================== Low Stock Alerts ====================

  private async checkLowStock(variantId: string): Promise<void> {
    const variant = await this.variantModel.findById(variantId).lean();

    if (!variant || !variant.trackInventory) {
      return;
    }

    // التحقق من صحة قيم المخزون
    if (isNaN(variant.stock) || isNaN(variant.minStock)) {
      this.logger.warn(`Invalid stock values for variant ${variantId}: stock=${variant.stock}, minStock=${variant.minStock}`);
      return;
    }

    // فحص المخزون المنخفض
    if (variant.stock <= variant.minStock) {
      await this.sendLowStockAlert(variant);
    }

    // فحص نفاد المخزون
    if (variant.stock === 0) {
      await this.sendOutOfStockAlert(variant);
    }
  }

  private async sendLowStockAlert(variant: Variant & { _id: Types.ObjectId }): Promise<void> {
    try {
      await this.notificationService.createNotification({
        type: NotificationType.LOW_STOCK,
        title: 'تنبيه مخزون منخفض',
        message: `المتغير ${variant.sku || variant._id.toString()} يحتوي على مخزون منخفض: ${variant.stock} (الحد الأدنى: ${variant.minStock})`,
        messageEn: `Variant ${variant.sku || variant._id.toString()} has low stock: ${variant.stock} (minimum: ${variant.minStock})`,
        channel: NotificationChannel.DASHBOARD,
        priority: NotificationPriority.HIGH,
        data: {
          variantId: variant._id.toString(),
          productId: variant.productId.toString(),
          currentStock: variant.stock,
          minStock: variant.minStock,
        },
        isSystemGenerated: true,
      });

      this.logger.warn(`LOW STOCK ALERT: Variant ${variant._id.toString()} has ${variant.stock} units (minimum: ${variant.minStock})`);
    } catch (error) {
      this.logger.error(`Failed to send low stock alert for variant ${variant._id.toString()}:`, error);
    }
  }

  private async sendOutOfStockAlert(variant: Variant & { _id: Types.ObjectId }): Promise<void> {
    try {
      await this.notificationService.createNotification({
        type: NotificationType.OUT_OF_STOCK,
        title: 'تنبيه نفاد المخزون',
        message: `المتغير ${variant.sku || variant._id.toString()} نفد من المخزون`,
        messageEn: `Variant ${variant.sku || variant._id.toString()} is out of stock`,
        channel: NotificationChannel.DASHBOARD,
        priority: NotificationPriority.HIGH,
        data: {
          variantId: variant._id.toString(),
          productId: variant.productId.toString(),
          currentStock: 0,
        },
        isSystemGenerated: true,
      });

      this.logger.error(`OUT OF STOCK ALERT: Variant ${variant._id.toString()} is out of stock`);
    } catch (error) {
      this.logger.error(`Failed to send out of stock alert for variant ${variant._id.toString()}:`, error);
    }
  }

  // ==================== Inventory Reports ====================

  async getLowStockVariants(threshold?: number): Promise<Array<{
    variantId: string;
    productId: string;
    sku?: string;
    currentStock: number;
    minStock: number;
    difference: number;
  }>> {
    try {
      // جلب جميع الـ variants النشطة ثم تصفيتها في JavaScript (تجنب مشاكل NaN في MongoDB)
      const variants = await this.variantModel
        .find({
          trackInventory: true,
          deletedAt: null,
          isActive: true,
        })
        .select('_id productId sku stock minStock')
        .lean();

      // تصفية في JavaScript لتجنب مشاكل NaN
      const validVariants = variants.filter(variant => {
        // التأكد من أن القيم أرقام صحيحة
        const stockIsValid = typeof variant.stock === 'number' && 
                            !isNaN(variant.stock) && 
                            isFinite(variant.stock) && 
                            variant.stock !== null;
        
        const minStockIsValid = typeof variant.minStock === 'number' && 
                               !isNaN(variant.minStock) && 
                               isFinite(variant.minStock) && 
                               variant.minStock !== null;

        if (!stockIsValid || !minStockIsValid) {
          return false;
        }

        // تطبيق شرط threshold أو المقارنة
        if (threshold !== undefined && !isNaN(threshold)) {
          return variant.stock <= threshold;
        } else {
          return variant.stock <= variant.minStock;
        }
      });

      return validVariants.map(variant => ({
        variantId: variant._id.toString(),
        productId: variant.productId.toString(),
        sku: variant.sku,
        currentStock: variant.stock,
        minStock: variant.minStock,
        difference: variant.minStock - variant.stock
      }));
    } catch (error) {
      this.logger.error('Error getting low stock variants:', error);
      
      // إرجاع مصفوفة فارغة بدلاً من رمي خطأ
      this.logger.warn('Returning empty array due to query error');
      return [];
    }
  }

  async getOutOfStockVariants(): Promise<Array<{
    variantId: string;
    productId: string;
    sku?: string;
  }>> {
    try {
      // جلب الـ variants ثم تصفيتها في JavaScript
      const variants = await this.variantModel
        .find({
          trackInventory: true,
          deletedAt: null,
          isActive: true,
        })
        .select('_id productId sku stock')
        .lean();

      // تصفية في JavaScript لتجنب مشاكل NaN
      return variants
        .filter(variant => {
          const stockIsValid = typeof variant.stock === 'number' && 
                              !isNaN(variant.stock) && 
                              isFinite(variant.stock);
          return stockIsValid && variant.stock === 0;
        })
        .map(variant => ({
          variantId: variant._id.toString(),
          productId: variant.productId.toString(),
          sku: variant.sku
        }));
    } catch (error) {
      this.logger.error('Error getting out of stock variants:', error);
      
      // إرجاع مصفوفة فارغة بدلاً من رمي خطأ
      this.logger.warn('Returning empty array due to query error');
      return [];
    }
  }

  async getInventorySummary(): Promise<{
    totalVariants: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    lowStockVariants: Array<{
      variantId: string;
      productId: string;
      sku?: string;
      currentStock: number;
      minStock: number;
      difference: number;
    }>;
    outOfStockVariants: Array<{
      variantId: string;
      productId: string;
      sku?: string;
    }>;
  }> {
    const [totalVariants, inStock, lowStockVariants, outOfStockVariants] = await Promise.all([
      this.variantModel.countDocuments({ deletedAt: null, isActive: true }),
      this.variantModel.countDocuments({ 
        deletedAt: null, 
        isActive: true,
        trackInventory: true,
        stock: { $gt: 0 }
      }),
      this.getLowStockVariants(),
      this.getOutOfStockVariants()
    ]);

    return {
      totalVariants,
      inStock,
      lowStock: lowStockVariants.length,
      outOfStock: outOfStockVariants.length,
      lowStockVariants,
      outOfStockVariants
    };
  }

  // ==================== Bulk Operations ====================

  async bulkUpdateStock(
    updates: Array<{
      variantId: string;
      quantity: number;
      operation: 'add' | 'subtract' | 'set';
      reason?: string;
    }>
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ variantId: string; error: string }>;
  }> {
    const errors: Array<{ variantId: string; error: string }> = [];
    let success = 0;
    let failed = 0;

    for (const update of updates) {
      try {
        if (update.operation === 'set') {
          await this.setStock(update.variantId, update.quantity, update.reason);
        } else {
          await this.updateStock(update.variantId, update.quantity, update.operation, update.reason);
        }
        success++;
      } catch (error) {
        failed++;
        errors.push({
          variantId: update.variantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { success, failed, errors };
  }
}

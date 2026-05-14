import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AnalyticsAlert, AnalyticsAlertDocument } from '../schemas/analytics-alert.schema';
import { Order, OrderDocument, OrderStatus } from '../../checkout/schemas/order.schema';
import { Product, ProductDocument } from '../../products/schemas/product.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { SupportTicket, SupportTicketDocument } from '../../support/schemas/support-ticket.schema';
import { SystemMonitoringService } from '../../system-monitoring/system-monitoring.service';
import { ListAlertsQueryDto, UpdateAlertStatusDto } from '../dto/report-builder.dto';

@Injectable()
export class AnalyticsAlertsService {
  private readonly logger = new Logger(AnalyticsAlertsService.name);

  constructor(
    @InjectModel(AnalyticsAlert.name)
    private alertModel: Model<AnalyticsAlertDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(SupportTicket.name)
    private supportModel: Model<SupportTicketDocument>,
    private systemMonitoring: SystemMonitoringService,
  ) {}

  async findAll(query: ListAlertsQueryDto): Promise<{ data: AnalyticsAlertDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const { status, severity, source, page = 1, limit = 20 } = query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (source) filter.source = source;

    const [data, total] = await Promise.all([
      this.alertModel.find(filter).sort({ severity: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.alertModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<AnalyticsAlertDocument> {
    const alert = await this.alertModel.findById(id).exec();
    if (!alert) {
      throw new Error(`Alert "${id}" not found`);
    }
    return alert;
  }

  async updateStatus(id: string, dto: UpdateAlertStatusDto, userId?: string): Promise<AnalyticsAlertDocument> {
    const update: Record<string, unknown> = { status: dto.status };
    if (dto.status === 'acknowledged' && userId) {
      update.acknowledgedBy = new Types.ObjectId(userId);
      update.acknowledgedAt = new Date();
    }
    if (dto.status === 'resolved' && userId) {
      update.resolvedBy = new Types.ObjectId(userId);
      update.resolvedAt = new Date();
    }

    const alert = await this.alertModel.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
    if (!alert) {
      throw new Error(`Alert "${id}" not found`);
    }
    return alert;
  }

  async delete(id: string): Promise<void> {
    const result = await this.alertModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new Error(`Alert "${id}" not found`);
    }
  }

  async getStats(): Promise<{
    total: number;
    open: number;
    acknowledged: number;
    resolved: number;
    ignored: number;
    bySeverity: Record<string, number>;
    bySource: Record<string, number>;
  }> {
    const [total, open, acknowledged, resolved, ignored, bySeverity, bySource] = await Promise.all([
      this.alertModel.countDocuments().exec(),
      this.alertModel.countDocuments({ status: 'open' }).exec(),
      this.alertModel.countDocuments({ status: 'acknowledged' }).exec(),
      this.alertModel.countDocuments({ status: 'resolved' }).exec(),
      this.alertModel.countDocuments({ status: 'ignored' }).exec(),
      this.alertModel.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]).exec(),
      this.alertModel.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]).exec(),
    ]);

    return {
      total,
      open,
      acknowledged,
      resolved,
      ignored,
      bySeverity: Object.fromEntries(bySeverity.map((s) => [s._id, s.count])),
      bySource: Object.fromEntries(bySource.map((s) => [s._id, s.count])),
    };
  }

  async scanAndGenerateAlerts(): Promise<AnalyticsAlertDocument[]> {
    this.logger.log('Starting alert scan...');
    const newAlerts: AnalyticsAlertDocument[] = [];

    const salesDropAlert = await this.checkSalesDrop();
    if (salesDropAlert) newAlerts.push(salesDropAlert);

    const cancellationSpikeAlert = await this.checkCancellationSpike();
    if (cancellationSpikeAlert) newAlerts.push(cancellationSpikeAlert);

    const lowStockAlerts = await this.checkLowStock();
    newAlerts.push(...lowStockAlerts);

    const outOfStockAlerts = await this.checkOutOfStock();
    newAlerts.push(...outOfStockAlerts);

    const systemAlert = await this.checkSystemHealth();
    if (systemAlert) newAlerts.push(systemAlert);

    const supportAlert = await this.checkSupportTickets();
    if (supportAlert) newAlerts.push(supportAlert);

    this.logger.log(`Alert scan completed. Found ${newAlerts.length} new alerts.`);
    return newAlerts;
  }

  private async checkSalesDrop(): Promise<AnalyticsAlertDocument | null> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [currentWeekOrders, previousWeekOrders] = await Promise.all([
      this.orderModel.countDocuments({ createdAt: { $gte: sevenDaysAgo, $lte: now }, status: OrderStatus.COMPLETED }).exec(),
      this.orderModel.countDocuments({ createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo }, status: OrderStatus.COMPLETED }).exec(),
    ]);

    if (previousWeekOrders === 0) return null;

    const dropPercentage = ((previousWeekOrders - currentWeekOrders) / previousWeekOrders) * 100;

    if (dropPercentage > 20) {
      const existing = await this.alertModel.findOne({ type: 'sales_drop', status: { $in: ['open', 'acknowledged'] } }).exec();
      if (existing) {
        await this.alertModel.updateOne({ _id: existing._id }, { $set: { lastTriggeredAt: now, $inc: { triggerCount: 1 }, metadata: { dropPercentage, currentWeekOrders, previousWeekOrders } } }).exec();
        return existing;
      }

      const alert = new this.alertModel({
        type: 'sales_drop',
        title: `انخفاض المبيعات بنسبة ${dropPercentage.toFixed(1)}%`,
        titleEn: `Sales dropped by ${dropPercentage.toFixed(1)}%`,
        description: `عدد الطلبات المكتملة هذا الأسبوع (${currentWeekOrders}) أقل من الأسبوع السابق (${previousWeekOrders})`,
        descriptionEn: `Completed orders this week (${currentWeekOrders}) are lower than last week (${previousWeekOrders})`,
        severity: dropPercentage > 40 ? 'critical' : 'high',
        source: 'sales',
        suggestedAction: 'راجع استراتيجية التسعير والعروض الترويجية',
        suggestedActionEn: 'Review pricing strategy and promotional offers',
        metadata: { dropPercentage, currentWeekOrders, previousWeekOrders },
        thresholds: { warning: 20, critical: 40, currentValue: dropPercentage },
      });
      return alert.save();
    }

    return null;
  }

  private async checkCancellationSpike(): Promise<AnalyticsAlertDocument | null> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [currentMonthOrders, currentMonthCancelled, previousMonthOrders, previousMonthCancelled] = await Promise.all([
      this.orderModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo, $lte: now } }).exec(),
      this.orderModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo, $lte: now }, status: OrderStatus.CANCELLED }).exec(),
      this.orderModel.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }).exec(),
      this.orderModel.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, status: OrderStatus.CANCELLED }).exec(),
    ]);

    if (currentMonthOrders === 0 || previousMonthOrders === 0) return null;

    const currentRate = (currentMonthCancelled / currentMonthOrders) * 100;
    const previousRate = (previousMonthCancelled / previousMonthOrders) * 100;

    if (currentRate > previousRate * 1.5 && currentRate > 5) {
      const existing = await this.alertModel.findOne({ type: 'orders_cancellation_spike', status: { $in: ['open', 'acknowledged'] } }).exec();
      if (existing) {
        await this.alertModel.updateOne({ _id: existing._id }, { $set: { lastTriggeredAt: now, $inc: { triggerCount: 1 }, metadata: { currentRate, previousRate } } }).exec();
        return existing;
      }

      const alert = new this.alertModel({
        type: 'orders_cancellation_spike',
        title: `ارتفاع معدل إلغاء الطلبات إلى ${currentRate.toFixed(1)}%`,
        titleEn: `Order cancellation rate increased to ${currentRate.toFixed(1)}%`,
        description: `معدل الإلغاء ارتفع من ${previousRate.toFixed(1)}% إلى ${currentRate.toFixed(1)}%`,
        descriptionEn: `Cancellation rate increased from ${previousRate.toFixed(1)}% to ${currentRate.toFixed(1)}%`,
        severity: currentRate > 15 ? 'critical' : 'high',
        source: 'orders',
        suggestedAction: 'تحقق من أسباب الإلغاء وتحسين تجربة العميل',
        suggestedActionEn: 'Investigate cancellation reasons and improve customer experience',
        metadata: { currentRate, previousRate, currentMonthCancelled, previousMonthCancelled },
        thresholds: { warning: 5, critical: 15, currentValue: currentRate },
      });
      return alert.save();
    }

    return null;
  }

  private async checkLowStock(): Promise<AnalyticsAlertDocument[]> {
    const lowStockProducts = await this.productModel.countDocuments({ status: 'active', isActive: true, deletedAt: null, quantity: { $gt: 0, $lte: 10 } }).exec();

    if (lowStockProducts > 0) {
      const existing = await this.alertModel.findOne({ type: 'low_stock', status: { $in: ['open', 'acknowledged'] } }).exec();
      if (existing) {
        await this.alertModel.updateOne({ _id: existing._id }, { $set: { lastTriggeredAt: new Date(), $inc: { triggerCount: 1 }, metadata: { lowStockProducts } } }).exec();
        return [existing];
      }

      const alert = new this.alertModel({
        type: 'low_stock',
        title: `${lowStockProducts} منتجات قريبة من النفاد`,
        titleEn: `${lowStockProducts} products running low on stock`,
        description: `يوجد ${lowStockProducts} منتج بكمية أقل من 10 وحدات`,
        descriptionEn: `There are ${lowStockProducts} products with less than 10 units in stock`,
        severity: lowStockProducts > 20 ? 'high' : 'medium',
        source: 'inventory',
        suggestedAction: 'قم بإعادة تعبئة المخزون للمنتجات المنخفضة',
        suggestedActionEn: 'Restock low inventory products',
        metadata: { lowStockProducts },
        thresholds: { warning: 5, critical: 20, currentValue: lowStockProducts },
      });
      return [await alert.save()];
    }

    return [];
  }

  private async checkOutOfStock(): Promise<AnalyticsAlertDocument[]> {
    const outOfStockProducts = await this.productModel.countDocuments({ status: 'out_of_stock', deletedAt: null }).exec();

    if (outOfStockProducts > 0) {
      const existing = await this.alertModel.findOne({ type: 'out_of_stock', status: { $in: ['open', 'acknowledged'] } }).exec();
      if (existing) {
        await this.alertModel.updateOne({ _id: existing._id }, { $set: { lastTriggeredAt: new Date(), $inc: { triggerCount: 1 }, metadata: { outOfStockProducts } } }).exec();
        return [existing];
      }

      const alert = new this.alertModel({
        type: 'out_of_stock',
        title: `${outOfStockProducts} منتجات غير متوفرة`,
        titleEn: `${outOfStockProducts} products out of stock`,
        description: `يوجد ${outOfStockProducts} منتج غير متوفر حاليًا`,
        descriptionEn: `There are ${outOfStockProducts} products currently out of stock`,
        severity: outOfStockProducts > 10 ? 'critical' : 'high',
        source: 'inventory',
        suggestedAction: 'قم بإعادة تعبئة المخزون فورًا أو إخفاء المنتجات',
        suggestedActionEn: 'Restock immediately or hide out-of-stock products',
        metadata: { outOfStockProducts },
        thresholds: { warning: 3, critical: 10, currentValue: outOfStockProducts },
      });
      return [await alert.save()];
    }

    return [];
  }

  private async checkSystemHealth(): Promise<AnalyticsAlertDocument | null> {
    try {
      const health = await this.systemMonitoring.getSystemHealth();
      if (health.errorRate > 5) {
        const existing = await this.alertModel.findOne({ type: 'api_errors_spike', status: { $in: ['open', 'acknowledged'] } }).exec();
        if (existing) {
          await this.alertModel.updateOne({ _id: existing._id }, { $set: { lastTriggeredAt: new Date(), $inc: { triggerCount: 1 }, metadata: { errorRate: health.errorRate } } }).exec();
          return existing;
        }

        const alert = new this.alertModel({
          type: 'api_errors_spike',
          title: `ارتفاع معدل أخطاء API إلى ${health.errorRate.toFixed(1)}%`,
          titleEn: `API error rate increased to ${health.errorRate.toFixed(1)}%`,
          description: `معدل الأخطاء الحالي: ${health.errorRate.toFixed(1)}%`,
          descriptionEn: `Current error rate: ${health.errorRate.toFixed(1)}%`,
          severity: health.errorRate > 10 ? 'critical' : 'high',
          source: 'system',
          suggestedAction: 'تحقق من سجلات الأخطاء وراجع صحة النظام',
          suggestedActionEn: 'Check error logs and review system health',
          metadata: { errorRate: health.errorRate, cpuUsage: health.cpuUsage, memoryUsage: health.memoryUsage },
          thresholds: { warning: 5, critical: 10, currentValue: health.errorRate },
        });
        return alert.save();
      }
    } catch {
      // System monitoring might not be available
    }
    return null;
  }

  private async checkSupportTickets(): Promise<AnalyticsAlertDocument | null> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const openTickets = await this.supportModel.countDocuments({ status: { $in: ['open', 'new'] } }).exec();
    const newTicketsToday = await this.supportModel.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } }).exec();

    if (openTickets > 50 || newTicketsToday > 20) {
      const existing = await this.alertModel.findOne({ type: 'support_tickets_spike', status: { $in: ['open', 'acknowledged'] } }).exec();
      if (existing) {
        await this.alertModel.updateOne({ _id: existing._id }, { $set: { lastTriggeredAt: now, $inc: { triggerCount: 1 }, metadata: { openTickets, newTicketsToday } } }).exec();
        return existing;
      }

      const alert = new this.alertModel({
        type: 'support_tickets_spike',
        title: `ارتفاع التذاكر المفتوحة إلى ${openTickets}`,
        titleEn: `Open support tickets increased to ${openTickets}`,
        description: `يوجد ${openTickets} تذكرة مفتوحة، ${newTicketsToday} تذكرة جديدة خلال 24 ساعة`,
        descriptionEn: `There are ${openTickets} open tickets, ${newTicketsToday} new tickets in the last 24 hours`,
        severity: openTickets > 100 ? 'critical' : 'high',
        source: 'support',
        suggestedAction: 'قم بتوزيع التذاكر على فريق الدعم',
        suggestedActionEn: 'Distribute tickets to support team',
        metadata: { openTickets, newTicketsToday },
        thresholds: { warning: 50, critical: 100, currentValue: openTickets },
      });
      return alert.save();
    }

    return null;
  }
}

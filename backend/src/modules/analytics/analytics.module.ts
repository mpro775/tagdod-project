import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AdvancedAnalyticsController } from './advanced-analytics.controller';
import { ReportSchedulesController } from './controllers/report-schedules.controller';
import { ReportTemplatesController } from './controllers/report-templates.controller';
import { AnalyticsAlertsController } from './controllers/analytics-alerts.controller';
import { AnalyticsService } from './analytics.service';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { AdvancedReportsService } from './services/advanced-reports.service';
import { ReportIdService } from './services/report-id.service';
import { ReportGenerationService } from './services/report-generation.service';
import { ReportAuditService } from './services/report-audit.service';
import { ReportSchedulesService } from './services/report-schedules.service';
import { ReportScheduleCronService } from './services/report-schedule-cron.service';
import { AnalyticsCronService } from './services/analytics-cron.service';
import { AnalyticsCalculationService } from './services/analytics-calculation.service';
import { AnalyticsCacheService } from './services/analytics-cache.service';
import { FileStorageService } from './services/file-storage.service';
import { ExportService } from './services/export.service';
import { SalesCategoryAnalyticsService } from './services/sales-category-analytics.service';
import { InventoryAnalyticsService } from './services/inventory-analytics.service';
import { ReportTemplatesService } from './services/report-templates.service';
import { AnalyticsInsightsService } from './services/analytics-insights.service';
import { AnalyticsAlertsService } from './services/analytics-alerts.service';
import { StockAlertService } from '../products/services/stock-alert.service';
import { ActivityTrackingMiddleware } from '../../shared/middleware/activity-tracking.middleware';
import { NotificationsCompleteModule } from '../notifications/notifications-complete.module';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { SystemMonitoringModule } from '../system-monitoring/system-monitoring.module';
import { ErrorLogsModule } from '../error-logs/error-logs.module';
// Schemas
import { AnalyticsSnapshot, AnalyticsSnapshotSchema } from './schemas/analytics-snapshot.schema';
import { ReportSchedule, ReportScheduleSchema } from './schemas/report-schedule.schema';
import { AdvancedReport, AdvancedReportSchema } from './schemas/advanced-report.schema';
import { ReportAuditLog, ReportAuditLogSchema } from './schemas/report-audit-log.schema';
import { ReportTemplate, ReportTemplateSchema } from './schemas/report-template.schema';
import { AnalyticsAlert, AnalyticsAlertSchema } from './schemas/analytics-alert.schema';

// Related schemas
import { User, UserSchema } from '../users/schemas/user.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Variant, VariantSchema } from '../products/schemas/variant.schema';
import { Order, OrderSchema } from '../checkout/schemas/order.schema';
import { ServiceRequest, ServiceRequestSchema } from '../services/schemas/service-request.schema';
import { SupportTicket, SupportTicketSchema } from '../support/schemas/support-ticket.schema';
import { Cart, CartSchema } from '../cart/schemas/cart.schema';
import { Coupon, CouponSchema } from '../marketing/schemas/coupon.schema';
import { Banner, BannerSchema } from '../marketing/schemas/banner.schema';

// Shared services
import { CacheService } from '../../shared/cache/cache.service';

@Module({
  imports: [
    NotificationsCompleteModule,
    forwardRef(() => AuthModule),
    forwardRef(() => SystemMonitoringModule),
    forwardRef(() => ErrorLogsModule),
    MongooseModule.forFeature([
      { name: AnalyticsSnapshot.name, schema: AnalyticsSnapshotSchema },
      { name: ReportSchedule.name, schema: ReportScheduleSchema },
      { name: AdvancedReport.name, schema: AdvancedReportSchema },
      { name: ReportAuditLog.name, schema: ReportAuditLogSchema },
      { name: ReportTemplate.name, schema: ReportTemplateSchema },
      { name: AnalyticsAlert.name, schema: AnalyticsAlertSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: Order.name, schema: OrderSchema },
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: Banner.name, schema: BannerSchema },
    ]),
    SharedModule,
  ],
  controllers: [AnalyticsController, AdvancedAnalyticsController, ReportSchedulesController, ReportTemplatesController, AnalyticsAlertsController],
  providers: [
    AnalyticsService,
    AdvancedAnalyticsService,
    AdvancedReportsService,
    ReportIdService,
    ReportGenerationService,
    ReportAuditService,
    ReportSchedulesService,
    ReportScheduleCronService,
    AnalyticsCronService,
    AnalyticsCalculationService,
    AnalyticsCacheService,
    FileStorageService,
    ExportService,
    SalesCategoryAnalyticsService,
    InventoryAnalyticsService,
    StockAlertService,
    ActivityTrackingMiddleware,
    CacheService,
    ReportTemplatesService,
    AnalyticsInsightsService,
    AnalyticsAlertsService,
  ],
  exports: [
    AnalyticsService,
    AdvancedAnalyticsService,
    AdvancedReportsService,
    ReportIdService,
    ReportGenerationService,
    ReportAuditService,
    ReportSchedulesService,
    ReportScheduleCronService,
    AnalyticsCronService,
    AnalyticsCalculationService,
    AnalyticsCacheService,
    FileStorageService,
    ExportService,
    SalesCategoryAnalyticsService,
    InventoryAnalyticsService,
    StockAlertService,
    ActivityTrackingMiddleware,
    ReportTemplatesService,
    AnalyticsInsightsService,
    AnalyticsAlertsService,
  ],
})
export class AnalyticsModule {}

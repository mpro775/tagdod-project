import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AdvancedAnalyticsController } from './advanced-analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { AdvancedReportsService } from './services/advanced-reports.service';
import { AnalyticsCronService } from './services/analytics-cron.service';
import { AnalyticsCalculationService } from './services/analytics-calculation.service';
import { AnalyticsCacheService } from './services/analytics-cache.service';
import { StockAlertService } from '../products/services/stock-alert.service';
import { ActivityTrackingMiddleware } from '../../shared/middleware/activity-tracking.middleware';
import { NotificationsCompleteModule } from '../notifications/notifications-complete.module';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';  
// Schemas
import { AnalyticsSnapshot, AnalyticsSnapshotSchema } from './schemas/analytics-snapshot.schema';
import { ReportSchedule, ReportScheduleSchema } from './schemas/report-schedule.schema';
import { AdvancedReport, AdvancedReportSchema } from './schemas/advanced-report.schema';

// Related schemas
import { User, UserSchema } from '../users/schemas/user.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Variant, VariantSchema } from '../products/schemas/variant.schema';
import { Order, OrderSchema } from '../checkout/schemas/order.schema';
import { ServiceRequest, ServiceRequestSchema } from '../services/schemas/service-request.schema';
import { SupportTicket, SupportTicketSchema } from '../support/schemas/support-ticket.schema';
import { Cart, CartSchema } from '../cart/schemas/cart.schema';
import { Coupon, CouponSchema } from '../marketing/schemas/coupon.schema';

// Shared services
import { CacheService } from '../../shared/cache/cache.service';

@Module({
  imports: [
    NotificationsCompleteModule,
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      { name: AnalyticsSnapshot.name, schema: AnalyticsSnapshotSchema },
      { name: ReportSchedule.name, schema: ReportScheduleSchema },
      { name: AdvancedReport.name, schema: AdvancedReportSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: Order.name, schema: OrderSchema },
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
    SharedModule,
  ],
  controllers: [
    AnalyticsController,
    AdvancedAnalyticsController,
  ],
  providers: [
    AnalyticsService,
    AdvancedAnalyticsService,
    AdvancedReportsService,
    AnalyticsCronService,
    AnalyticsCalculationService,
    AnalyticsCacheService,
    StockAlertService,
    ActivityTrackingMiddleware,
    CacheService,
  ],
  exports: [
    AnalyticsService,
    AdvancedAnalyticsService,
    AdvancedReportsService,
    AnalyticsCronService,
    AnalyticsCalculationService,
    AnalyticsCacheService,
    StockAlertService,
    ActivityTrackingMiddleware,
  ],
})
export class AnalyticsModule {}
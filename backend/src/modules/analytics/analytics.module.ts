import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsController } from './analytics.controller';
import { AdvancedAnalyticsController } from './advanced-analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { AdvancedReportsService } from './services/advanced-reports.service';
import {
  AnalyticsSnapshot,
  AnalyticsSnapshotSchema
} from './schemas/analytics-snapshot.schema';
import {
  ReportSchedule,
  ReportScheduleSchema
} from './schemas/report-schedule.schema';
import {
  AdvancedReport,
  AdvancedReportSchema
} from './schemas/advanced-report.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Order, OrderSchema } from '../checkout/schemas/order.schema.new';
import { Cart, CartSchema } from '../cart/schemas/cart.schema';
import { Coupon, CouponSchema } from '../coupons/schemas/coupon.schema';
import { ServiceRequest, ServiceRequestSchema } from '../services/schemas/service-request.schema';
import { SupportTicket, SupportTicketSchema } from '../support/schemas/support-ticket.schema';
import { CacheModule } from '../../shared/cache/cache.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // Database schemas
    MongooseModule.forFeature([
      { name: AnalyticsSnapshot.name, schema: AnalyticsSnapshotSchema },
      { name: ReportSchedule.name, schema: ReportScheduleSchema },
      { name: AdvancedReport.name, schema: AdvancedReportSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
    ]),

    // Cache Module
    CacheModule,

    // Auth Module for JwtAuthGuard
    AuthModule,

    // Enable scheduling for automated reports
    ScheduleModule.forRoot(),
  ],
  controllers: [AnalyticsController, AdvancedAnalyticsController],
  providers: [AnalyticsService, AdvancedAnalyticsService, AdvancedReportsService],
  exports: [AnalyticsService, AdvancedAnalyticsService, AdvancedReportsService], // Export for use in other modules
})
export class AnalyticsModule {}

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { SystemMonitoringController } from './system-monitoring.controller';
import { SystemMonitoringService } from './system-monitoring.service';
import { RedisHealthIndicator } from '../../health/redis-health.indicator';
import { SystemMetric, SystemMetricSchema } from './schemas/system-metric.schema';
import { SystemAlert, SystemAlertSchema } from './schemas/system-alert.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    TerminusModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: SystemMetric.name, schema: SystemMetricSchema },
      { name: SystemAlert.name, schema: SystemAlertSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
    SharedModule,
  ],
  controllers: [SystemMonitoringController],
  providers: [SystemMonitoringService, RedisHealthIndicator],
  exports: [SystemMonitoringService],
})
export class SystemMonitoringModule {}


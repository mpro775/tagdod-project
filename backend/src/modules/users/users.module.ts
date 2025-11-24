import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { EngineerProfile, EngineerProfileSchema } from './schemas/engineer-profile.schema';
import { Order, OrderSchema } from '../checkout/schemas/order.schema';
import { ServiceRequest, ServiceRequestSchema } from '../services/schemas/service-request.schema';
import { Favorite, FavoriteSchema } from '../favorites/schemas/favorite.schema';
import { SupportTicket, SupportTicketSchema } from '../support/schemas/support-ticket.schema';
import { UserAnalyticsService } from './services/user-analytics.service';
import { UserScoringService } from './services/user-scoring.service';
import { UserBehaviorService } from './services/user-behavior.service';
import { UserCacheService } from './services/user-cache.service';
import { UserErrorService } from './services/user-error.service';
import { UserQueryService } from './services/user-query.service';
import { EngineerProfileService } from './services/engineer-profile.service';
import { UserAnalyticsController } from './controllers/user-analytics.controller';
import { UserVerificationController } from './controllers/user-verification.controller';
import { EngineerProfileController } from './controllers/engineer-profile.controller';
import { CheckoutModule } from '../checkout/checkout.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { SupportModule } from '../support/support.module';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { UsersAdminModule } from './admin/users.admin.module';
import { CapabilitiesModule } from '../capabilities/capabilities.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EngineerProfile.name, schema: EngineerProfileSchema },
      { name: Order.name, schema: OrderSchema },
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: Favorite.name, schema: FavoriteSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
    ]),
    // استيراد الوحدات المطلوبة
    forwardRef(() => AuthModule),
    forwardRef(() => CheckoutModule),
    forwardRef(() => FavoritesModule),
    forwardRef(() => SupportModule),
    SharedModule,
    UsersAdminModule,
    CapabilitiesModule,
    UploadModule,
  ],
  controllers: [UserAnalyticsController, UserVerificationController, EngineerProfileController],
  providers: [
    UserAnalyticsService,
    UserScoringService,
    UserBehaviorService,
    UserCacheService,
    UserErrorService,
    UserQueryService,
    EngineerProfileService,
  ],
  exports: [
    MongooseModule,
    UserAnalyticsService,
    UserScoringService,
    UserBehaviorService,
    UserCacheService,
    UserErrorService,
    UserQueryService,
    EngineerProfileService,
  ],
})
export class UsersModule {}

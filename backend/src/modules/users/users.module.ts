import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Order, OrderSchema } from '../checkout/schemas/order.schema';
import { Favorite, FavoriteSchema } from '../favorites/schemas/favorite.schema';
import { SupportTicket, SupportTicketSchema } from '../support/schemas/support-ticket.schema';
import { UserAnalyticsService } from './services/user-analytics.service';
import { UserAnalyticsController } from './controllers/user-analytics.controller';
import { CheckoutModule } from '../checkout/checkout.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { SupportModule } from '../support/support.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Favorite.name, schema: FavoriteSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
    ]),
    // استيراد الوحدات المطلوبة
    forwardRef(() => AuthModule),
    forwardRef(() => CheckoutModule),
    forwardRef(() => FavoritesModule),
    forwardRef(() => SupportModule),
  ],
  controllers: [UserAnalyticsController],
  providers: [UserAnalyticsService],
  exports: [
    MongooseModule,
    UserAnalyticsService,
  ],
})
export class UsersModule {}

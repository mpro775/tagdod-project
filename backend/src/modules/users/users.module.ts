import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Order, OrderSchema } from '../checkout/schemas/order.schema';
import { Favorite, FavoriteSchema } from '../favorites/schemas/favorite.schema';
import { SupportTicket, SupportTicketSchema } from '../support/schemas/support-ticket.schema';
import { UserAnalyticsService } from './services/user-analytics.service';
import { UserAnalyticsController } from './controllers/user-analytics.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Favorite.name, schema: FavoriteSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
    ]),
    // استيراد الوحدات المطلوبة
    forwardRef(() => import('../checkout/checkout.module')),
    forwardRef(() => import('../favorites/favorites.module')),
    forwardRef(() => import('../support/support.module')),
  ],
  controllers: [UserAnalyticsController],
  providers: [UserAnalyticsService],
  exports: [
    MongooseModule,
    UserAnalyticsService,
  ],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import { InventoryLedger, InventoryLedgerSchema } from './schemas/inventory-ledger.schema';
import { Cart, CartSchema } from '../cart/schemas/cart.schema';
import { Product, ProductSchema } from '../catalog/schemas/product.schema';
import { Variant, VariantSchema } from '../catalog/schemas/variant.schema';
import { CartModule } from '../cart/cart.module';
import { AddressesModule } from '../addresses/addresses.module';
import { MarketingModule } from '../marketing/marketing.module';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    CartModule,
    AddressesModule,
    MarketingModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: InventoryLedger.name, schema: InventoryLedgerSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    CheckoutController,
    OrdersController,
    AdminOrdersController,
  ],
  providers: [
    CheckoutService,
    OrdersService,
  ],
  exports: [MongooseModule, CheckoutService, OrdersService],
})
export class CheckoutModule {}

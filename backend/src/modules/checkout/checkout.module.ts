import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Schemas
import { Order, OrderSchema } from './schemas/order.schema';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import { InventoryLedger, InventoryLedgerSchema } from './schemas/inventory-ledger.schema';

// Services
import { OrderService } from './services/order.service';

// Controllers
import { OrderController } from './controllers/order.controller';
import { AdminOrderController } from './controllers/admin-order.controller';
import { WebhookController } from './controllers/webhook.controller';

// External Services
import { CartModule } from '../cart/cart.module';

/**
 * Module موحد للطلبات والدفع - نظام احترافي شامل
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: InventoryLedger.name, schema: InventoryLedgerSchema },
    ]),
    CartModule,
  ],
  controllers: [
    OrderController,
    AdminOrderController,
    WebhookController,
  ],
  providers: [
    OrderService,
  ],
  exports: [
    OrderService,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: InventoryLedger.name, schema: InventoryLedgerSchema },
    ]),
  ],
})
export class CheckoutModule {}
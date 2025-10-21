import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Variant, VariantSchema } from '../products/schemas/variant.schema';
// VariantPrice schema removed - pricing is now handled in Variant schema
import { Capabilities, CapabilitiesSchema } from '../capabilities/schemas/capabilities.schema';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { GuestCartController } from './guest-cart.controller';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AdminCartController } from './admin-cart.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: Capabilities.name, schema: CapabilitiesSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
    SharedModule,
  ],
  controllers: [CartController, GuestCartController, AdminCartController],
  providers: [CartService],
  exports: [MongooseModule, CartService],
})
export class CartModule {}

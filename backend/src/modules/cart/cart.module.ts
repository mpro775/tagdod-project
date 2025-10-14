import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Variant, VariantSchema } from '../catalog/schemas/variant.schema';
import { VariantPrice, VariantPriceSchema } from '../catalog/schemas/variant-price.schema';
import { Capabilities, CapabilitiesSchema } from '../capabilities/schemas/capabilities.schema';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { GuestCartController } from './guest-cart.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: VariantPrice.name, schema: VariantPriceSchema },
      { name: Capabilities.name, schema: CapabilitiesSchema },
    ]),
  ],
  controllers: [CartController, GuestCartController],
  providers: [CartService],
  exports: [MongooseModule, CartService],
})
export class CartModule {}

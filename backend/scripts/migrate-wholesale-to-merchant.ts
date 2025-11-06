import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../src/modules/users/schemas/user.schema';
import { Cart, CartDocument } from '../src/modules/cart/schemas/cart.schema';
import { Order, OrderDocument } from '../src/modules/checkout/schemas/order.schema';
import { Capabilities, CapabilitiesDocument } from '../src/modules/capabilities/schemas/capabilities.schema';

async function migrateWholesaleToMerchant() {
  console.log('🚀 Starting migration: wholesale → merchant');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const UserModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    const CapabilitiesModel = app.get<Model<CapabilitiesDocument>>(getModelToken(Capabilities.name));
    const CartModel = app.get<Model<CartDocument>>(getModelToken(Cart.name));
    const OrderModel = app.get<Model<OrderDocument>>(getModelToken(Order.name));
    
    // 1. Update Users collection
    console.log('📝 Updating Users collection...');
    const userResult = await UserModel.collection.updateMany(
      {},
      {
        $rename: {
          'wholesale_capable': 'merchant_capable',
          'wholesale_status': 'merchant_status',
          'wholesale_discount_percent': 'merchant_discount_percent',
        }
      }
    );
    console.log(`✅ Updated ${userResult.modifiedCount} users (matched: ${userResult.matchedCount})`);
    
    // 2. Update Capabilities collection
    console.log('📝 Updating Capabilities collection...');
    const capsResult = await CapabilitiesModel.collection.updateMany(
      {},
      {
        $rename: {
          'wholesale_capable': 'merchant_capable',
          'wholesale_status': 'merchant_status',
          'wholesale_discount_percent': 'merchant_discount_percent',
        }
      }
    );
    console.log(`✅ Updated ${capsResult.modifiedCount} capabilities (matched: ${capsResult.matchedCount})`);
    
    // 3. Update accountType in Carts collection
    console.log('📝 Updating accountType in Carts collection...');
    const cartResult = await CartModel.collection.updateMany(
      { accountType: 'wholesale' },
      {
        $set: {
          accountType: 'merchant'
        }
      }
    );
    console.log(`✅ Updated ${cartResult.modifiedCount} carts (matched: ${cartResult.matchedCount})`);
    
    // 4. Update accountType in Orders collection
    console.log('📝 Updating accountType in Orders collection...');
    const orderResult = await OrderModel.collection.updateMany(
      { accountType: 'wholesale' },
      {
        $set: {
          accountType: 'merchant'
        }
      }
    );
    console.log(`✅ Updated ${orderResult.modifiedCount} orders (matched: ${orderResult.matchedCount})`);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${userResult.modifiedCount} updated`);
    console.log(`   - Capabilities: ${capsResult.modifiedCount} updated`);
    console.log(`   - Carts: ${cartResult.modifiedCount} updated`);
    console.log(`   - Orders: ${orderResult.modifiedCount} updated`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    try {
      await app.close();
    } catch (closeError) {
      // Ignore close errors (e.g., Redis connection already closed)
      const errorMessage = closeError instanceof Error ? closeError.message : String(closeError);
      console.log('⚠️ Warning during app close (can be ignored):', errorMessage);
    }
  }
}

if (require.main === module) {
  migrateWholesaleToMerchant()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateWholesaleToMerchant };


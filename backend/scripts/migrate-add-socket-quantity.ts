import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Migration script to update stock value to 200 for all Products and Variants
 * and set trackStock to true for products with stock > 0
 */
async function migrateUpdateStockTo200() {
  console.log('🚀 Starting migration: update stock to 200 for Products and Variants');
  
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is required');
  }
  
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // 1. Update Products collection - set stock to 200 for all products
    console.log('📝 Updating Products collection - setting stock to 200...');
    const productResult = await db.collection('products').updateMany(
      {},
      {
        $set: {
          stock: 200
        }
      }
    );
    console.log(`✅ Updated stock for ${productResult.modifiedCount} products (matched: ${productResult.matchedCount})`);
    
    // 2. Set trackStock to true for products with stock > 0
    console.log('📝 Setting trackStock to true for products with stock > 0...');
    const trackStockResult = await db.collection('products').updateMany(
      {
        $or: [
          { stock: { $gt: 0 } },
          { stock: { $exists: false } } // Products without stock field
        ]
      },
      {
        $set: {
          trackStock: true
        }
      }
    );
    console.log(`✅ Set trackStock=true for ${trackStockResult.modifiedCount} products (matched: ${trackStockResult.matchedCount})`);
    
    // 3. Update Variants collection - set stock to 200
    console.log('📝 Updating Variants collection...');
    const variantResult = await db.collection('variants').updateMany(
      {},
      {
        $set: {
          stock: 200
        }
      }
    );
    console.log(`✅ Updated ${variantResult.modifiedCount} variants (matched: ${variantResult.matchedCount})`);
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`   - Products stock updated: ${productResult.modifiedCount}`);
    console.log(`   - Products trackStock enabled: ${trackStockResult.modifiedCount}`);
    console.log(`   - Variants updated: ${variantResult.modifiedCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('✅ MongoDB connection closed');
  }
}

if (require.main === module) {
  migrateUpdateStockTo200()
    .then(() => {
      console.log('✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { migrateUpdateStockTo200 };


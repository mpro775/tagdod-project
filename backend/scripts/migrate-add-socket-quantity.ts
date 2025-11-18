import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Migration script to update stock value to 200 for all Products and Variants
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
    
    // 1. Update Products collection - set stock to 200 and trackStock to true for products with stock
    console.log('📝 Updating Products collection...');
    const productResult = await db.collection('products').updateMany(
      {},
      {
        $set: {
          stock: 200,
          trackStock: true
        }
      }
    );
    console.log(`✅ Updated ${productResult.modifiedCount} products (matched: ${productResult.matchedCount})`);
    
    // 2. Update Variants collection - set stock to 200
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
    console.log(`   - Products updated: ${productResult.modifiedCount}`);
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


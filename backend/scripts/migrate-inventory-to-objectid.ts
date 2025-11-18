import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Migration script to convert inventory collection productId and variantId from string to ObjectId
 * This ensures consistency in the database and fixes issues with inventory reservation
 */
async function migrateInventoryToObjectId() {
  console.log('🚀 Starting migration: convert inventory productId/variantId to ObjectId');
  
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is required');
  }
  
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Try to find the correct collection name
    // Mongoose pluralizes: Inventory -> inventories (not inventoryledgers)
    const collectionNames = await db.listCollections().toArray();
    console.log(`📋 Available collections: ${collectionNames.map(c => c.name).join(', ')}`);
    
    // First, try to find 'inventories' exactly
    let inventoryCollectionName = collectionNames.find(
      (col) => col.name.toLowerCase() === 'inventories'
    )?.name;
    
    // If not found, look for collection with 'on_hand' field (inventory structure)
    if (!inventoryCollectionName) {
      console.log('📝 Searching for collection with inventory structure...');
      for (const col of collectionNames) {
        if (col.name.toLowerCase().includes('ledger')) continue; // Skip ledgers
        const testSample = await db.collection(col.name).findOne({ on_hand: { $exists: true } });
        if (testSample && (testSample.productId || testSample.variantId)) {
          inventoryCollectionName = col.name;
          console.log(`   ✅ Found inventory collection: ${col.name}`);
          break;
        }
      }
    }
    
    if (!inventoryCollectionName) {
      throw new Error('Could not find inventory collection. Please check collection names.');
    }
    
    console.log(`📝 Using collection: ${inventoryCollectionName}`);
    const inventoryCollection = db.collection(inventoryCollectionName);
    
    // 1. Find all inventory records
    console.log('📝 Finding inventory records...');
    const allRecords = await inventoryCollection.find({}).toArray();
    console.log(`   Found ${allRecords.length} total inventory records`);
    
    let productIdUpdated = 0;
    let variantIdUpdated = 0;
    let skipped = 0;
    let errors = 0;
    
    // 2. Process each record
    for (const record of allRecords) {
      try {
        const updates: Record<string, unknown> = {};
        let needsUpdate = false;
        
        // Check and convert productId
        if (record.productId) {
          // Check if it's a string (needs conversion)
          if (typeof record.productId === 'string') {
            // Validate ObjectId format
            if (ObjectId.isValid(record.productId)) {
              updates.productId = new ObjectId(record.productId);
              needsUpdate = true;
              productIdUpdated++;
            } else {
              console.warn(`   ⚠️  Invalid productId format: ${record.productId} (skipping record ${record._id})`);
              errors++;
              continue;
            }
          }
          // If already ObjectId, no conversion needed
        }
        
        // Check and convert variantId
        if (record.variantId) {
          // Check if it's a string (needs conversion)
          if (typeof record.variantId === 'string') {
            // Validate ObjectId format
            if (ObjectId.isValid(record.variantId)) {
              updates.variantId = new ObjectId(record.variantId);
              needsUpdate = true;
              variantIdUpdated++;
            } else {
              console.warn(`   ⚠️  Invalid variantId format: ${record.variantId} (skipping record ${record._id})`);
              errors++;
              continue;
            }
          }
          // If already ObjectId, no conversion needed
        }
        
        // Update the record if needed
        if (needsUpdate) {
          await inventoryCollection.updateOne(
            { _id: record._id },
            { $set: updates }
          );
          console.log(`   ✅ Updated record ${record._id}: ${Object.keys(updates).join(', ')}`);
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`   ❌ Error processing record ${record._id}:`, error);
        errors++;
      }
    }
    
    console.log('\n✅ Migration completed!');
    console.log(`   - Records processed: ${allRecords.length}`);
    console.log(`   - productId converted: ${productIdUpdated}`);
    console.log(`   - variantId converted: ${variantIdUpdated}`);
    console.log(`   - Records skipped (already ObjectId or invalid): ${skipped}`);
    console.log(`   - Errors: ${errors}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('✅ MongoDB connection closed');
  }
}

if (require.main === module) {
  migrateInventoryToObjectId()
    .then(() => {
      console.log('✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { migrateInventoryToObjectId };


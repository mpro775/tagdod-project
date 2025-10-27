#!/usr/bin/env ts-node

/**
 * Script to fix NaN stock values in variants collection
 * This script finds all variants with NaN stock or minStock values and resets them to 0
 */

import { connect, connection } from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

interface VariantDoc {
  _id: any;
  sku?: string;
  stock: number;
  minStock: number;
  trackInventory: boolean;
}

async function fixNaNStockValues() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tagdod';
    
    console.log('🔄 Connecting to MongoDB...');
    await connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const db = connection.db;
    const variantsCollection = db.collection('variants');

    console.log('🔍 Searching for variants with invalid stock values...\n');

    // Find all variants (we'll check for NaN in JavaScript since MongoDB doesn't have a direct NaN query)
    const allVariants = await variantsCollection.find({
      deletedAt: null
    }).toArray() as VariantDoc[];

    console.log(`📊 Total variants found: ${allVariants.length}\n`);

    let fixedCount = 0;
    let errors = 0;
    const problematicVariants: Array<{
      id: string;
      sku?: string;
      stock: any;
      minStock: any;
    }> = [];

    // Check each variant for NaN values
    for (const variant of allVariants) {
      let needsUpdate = false;
      const updates: any = {};

      // Check stock
      if (typeof variant.stock !== 'number' || isNaN(variant.stock) || variant.stock === null || variant.stock === undefined) {
        needsUpdate = true;
        updates.stock = 0;
        problematicVariants.push({
          id: variant._id.toString(),
          sku: variant.sku,
          stock: variant.stock,
          minStock: variant.minStock
        });
      }

      // Check minStock
      if (typeof variant.minStock !== 'number' || isNaN(variant.minStock) || variant.minStock === null || variant.minStock === undefined) {
        needsUpdate = true;
        updates.minStock = 0;
        if (!problematicVariants.find(v => v.id === variant._id.toString())) {
          problematicVariants.push({
            id: variant._id.toString(),
            sku: variant.sku,
            stock: variant.stock,
            minStock: variant.minStock
          });
        }
      }

      // Update if needed
      if (needsUpdate) {
        try {
          const result = await variantsCollection.updateOne(
            { _id: variant._id },
            { $set: updates }
          );

          if (result.modifiedCount > 0) {
            fixedCount++;
            console.log(`✅ Fixed variant ${variant._id} (SKU: ${variant.sku || 'N/A'})`);
            console.log(`   - Old stock: ${variant.stock}, New stock: ${updates.stock ?? variant.stock}`);
            console.log(`   - Old minStock: ${variant.minStock}, New minStock: ${updates.minStock ?? variant.minStock}\n`);
          }
        } catch (error) {
          errors++;
          console.error(`❌ Error fixing variant ${variant._id}:`, error);
        }
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total variants scanned: ${allVariants.length}`);
    console.log(`Problematic variants found: ${problematicVariants.length}`);
    console.log(`Successfully fixed: ${fixedCount}`);
    console.log(`Errors: ${errors}`);
    console.log('='.repeat(60));

    if (problematicVariants.length > 0) {
      console.log('\n📋 List of problematic variants:');
      problematicVariants.forEach((v, index) => {
        console.log(`\n${index + 1}. Variant ID: ${v.id}`);
        console.log(`   SKU: ${v.sku || 'N/A'}`);
        console.log(`   Stock: ${v.stock} (${typeof v.stock})`);
        console.log(`   MinStock: ${v.minStock} (${typeof v.minStock})`);
      });
    }

    console.log('\n✅ Cleanup completed successfully!\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
if (require.main === module) {
  fixNaNStockValues()
    .then(() => {
      console.log('\n✨ Script finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { fixNaNStockValues };


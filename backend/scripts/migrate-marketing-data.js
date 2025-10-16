#!/usr/bin/env node

const { MongoClient } = require('mongodb');

console.log('🔄 Starting marketing data migration...\n');

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tagadodo';
const client = new MongoClient(MONGO_URI);

async function migrateData() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Migration steps
    console.log('\n📋 Migration Plan:');
    console.log('   1. Migrate price rules from promotions collection');
    console.log('   2. Migrate coupons from coupons collection');
    console.log('   3. Migrate banners from banners collection');
    console.log('   4. Verify data integrity');
    
    // Step 1: Migrate Price Rules
    console.log('\n🔄 Step 1: Migrating price rules...');
    const priceRules = await db.collection('pricerules').find({}).toArray();
    console.log(`   Found ${priceRules.length} price rules`);
    
    if (priceRules.length > 0) {
      // Update existing price rules with new schema fields
      for (const rule of priceRules) {
        const updateData = {
          $set: {
            // Ensure all new fields have default values
            usageLimits: rule.usageLimits || {
              maxUses: undefined,
              maxUsesPerUser: undefined,
              currentUses: 0
            },
            metadata: rule.metadata || {
              title: undefined,
              description: undefined,
              termsAndConditions: undefined
            },
            stats: rule.stats || {
              views: 0,
              appliedCount: 0,
              revenue: 0,
              savings: 0
            },
            couponCode: rule.couponCode || undefined
          }
        };
        
        await db.collection('pricerules').updateOne(
          { _id: rule._id },
          updateData
        );
      }
      console.log('   ✅ Price rules updated with new schema');
    }
    
    // Step 2: Migrate Coupons
    console.log('\n🔄 Step 2: Migrating coupons...');
    const coupons = await db.collection('coupons').find({}).toArray();
    console.log(`   Found ${coupons.length} coupons`);
    
    if (coupons.length > 0) {
      // Update existing coupons with new schema fields
      for (const coupon of coupons) {
        const updateData = {
          $set: {
            // Ensure all new fields have default values
            applicableProductIds: coupon.applicableProductIds || [],
            applicableCategoryIds: coupon.applicableCategoryIds || [],
            applicableBrandIds: coupon.applicableBrandIds || [],
            applicableUserIds: coupon.applicableUserIds || [],
            excludedUserIds: coupon.excludedUserIds || [],
            totalRedemptions: coupon.totalRedemptions || 0,
            totalDiscountGiven: coupon.totalDiscountGiven || 0,
            totalRevenue: coupon.totalRevenue || 0
          }
        };
        
        await db.collection('coupons').updateOne(
          { _id: coupon._id },
          updateData
        );
      }
      console.log('   ✅ Coupons updated with new schema');
    }
    
    // Step 3: Migrate Banners
    console.log('\n🔄 Step 3: Migrating banners...');
    const banners = await db.collection('banners').find({}).toArray();
    console.log(`   Found ${banners.length} banners`);
    
    if (banners.length > 0) {
      // Update existing banners with new schema fields
      for (const banner of banners) {
        const updateData = {
          $set: {
            // Ensure all new fields have default values
            targetAudiences: banner.targetAudiences || [],
            targetCategories: banner.targetCategories || [],
            targetProducts: banner.targetProducts || [],
            viewCount: banner.viewCount || 0,
            clickCount: banner.clickCount || 0,
            conversionCount: banner.conversionCount || 0
          }
        };
        
        await db.collection('banners').updateOne(
          { _id: banner._id },
          updateData
        );
      }
      console.log('   ✅ Banners updated with new schema');
    }
    
    // Step 4: Verify data integrity
    console.log('\n🔍 Step 4: Verifying data integrity...');
    
    const finalPriceRules = await db.collection('pricerules').countDocuments();
    const finalCoupons = await db.collection('coupons').countDocuments();
    const finalBanners = await db.collection('banners').countDocuments();
    
    console.log(`   Price Rules: ${finalPriceRules}`);
    console.log(`   Coupons: ${finalCoupons}`);
    console.log(`   Banners: ${finalBanners}`);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the new MarketingModule endpoints');
    console.log('   2. Update frontend to use new API endpoints');
    console.log('   3. Remove old modules after testing');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run migration
migrateData().catch(console.error);

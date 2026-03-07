#!/usr/bin/env node
/**
 * سكربت إصلاح بروفايلات المهندسين الناقصة (مستقل - بدون NestJS/Redis)
 *
 * ينشئ بروفايل EngineerProfile لكل مهندس معتمد بدون بروفايل.
 * يعمل مباشرة مع MongoDB فقط - لا يحتاج Redis أو تشغيل التطبيق.
 *
 * الاستخدام:
 *   node scripts/repair-missing-engineer-profiles.js
 *   npm run repair:engineer-profiles
 *
 * المتطلبات: MONGO_URI في .env أو متغير البيئة
 */

const path = require('path');

// تحميل mongoose من node_modules في مجلد backend (يعمل داخل Docker/الحاوية)
const backendDir = path.resolve(__dirname, '..');
const mongoose = require(path.join(backendDir, 'node_modules', 'mongoose'));

// تحميل .env إن وجد
try {
  require('dotenv').config();
} catch (e) {
  // dotenv غير مثبت - استخدام متغيرات البيئة الحالية
}

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/solar-commerce';

async function repairMissingEngineerProfiles() {
  console.log('🚀 بدء إصلاح بروفايلات المهندسين الناقصة...\n');
  console.log('📡 الاتصال بـ MongoDB:', MONGO_URI.replace(/:[^:@]+@/, ':****@'));

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات\n');

    const db = mongoose.connection.db;

    // جلب المهندسين المعتمدين (engineer_capable + engineer_status=approved)
    const engineers = await db
      .collection('users')
      .find({
        engineer_capable: true,
        engineer_status: 'approved',
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
      })
      .project({ _id: 1, firstName: 1, lastName: 1, phone: 1 })
      .toArray();

    console.log(`📊 عدد المهندسين المعتمدين: ${engineers.length}\n`);

    if (engineers.length === 0) {
      console.log('✅ لا يوجد مهندسون معتمدون');
      await mongoose.disconnect();
      return;
    }

    const engineerProfiles = db.collection('engineerprofiles');
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const u of engineers) {
      const userId = u._id;
      const label = `${u.firstName || ''} ${u.lastName || ''} (${u.phone || userId})`.trim() || userId.toString();

      try {
        const existing = await engineerProfiles.findOne({ userId });
        if (!existing) {
          await engineerProfiles.insertOne({
            userId,
            ratings: [],
            totalRatings: 0,
            averageRating: 0,
            ratingDistribution: [0, 0, 0, 0, 0],
            totalCompletedServices: 0,
            totalEarnings: 0,
            completionRate: 0,
            walletBalance: 0,
            commissionTransactions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          created++;
          console.log(`✅ تم إنشاء بروفايل: ${label}`);
        } else {
          skipped++;
        }
      } catch (error) {
        errors++;
        console.error(`❌ فشل إنشاء بروفايل لـ ${label}:`, error.message);
      }
    }

    console.log('\n📊 تقرير الإصلاح:');
    console.log(`   ✅ تم إنشاء: ${created}`);
    console.log(`   ⏭️  تم تخطي (لديهم بروفايل): ${skipped}`);
    console.log(`   ❌ أخطاء: ${errors}`);
    console.log(`   📈 إجمالي المهندسين: ${engineers.length}`);

    await mongoose.disconnect();
    console.log('\n🎉 تم الانتهاء!');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

repairMissingEngineerProfiles();

/**
 * سكريبت إصلاح عمولات المهندسين السابقة
 * ================================
 *
 * هذا السكريبت يقوم بإعادة حساب العمولات التي تم حسابها خطأً من مبلغ الخصم
 * ليتم حسابها من إجمالي الطلب الأصلي (subtotal)
 *
 * الاستخدام:
 * npx ts-node src/scripts/fix-engineer-commissions.ts
 *
 * أو من خلال npm script:
 * npm run fix:commissions
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tagdod';

interface UsageHistoryItem {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  discountAmount: number;
  commissionAmount: number;
  usedAt: Date;
}

interface CouponDoc {
  _id: mongoose.Types.ObjectId;
  code: string;
  engineerId?: mongoose.Types.ObjectId | null;
  commissionRate?: number | null;
  usageHistory: UsageHistoryItem[];
  totalCommissionEarned: number;
}

interface OrderDoc {
  _id: mongoose.Types.ObjectId;
  subtotal: number;
  total: number;
}

interface EngineerProfileDoc {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  walletBalance: number;
  commissionTransactions: Array<{
    transactionId: string;
    type: string;
    amount: number;
    orderId?: mongoose.Types.ObjectId;
    couponCode?: string;
    description?: string;
    createdAt: Date;
  }>;
}

interface FixResult {
  couponCode: string;
  engineerId: string;
  orderId: string;
  oldCommission: number;
  newCommission: number;
  difference: number;
  orderSubtotal: number;
}

async function fixEngineerCommissions() {
  console.log('🔧 بدء إصلاح عمولات المهندسين...\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات\n');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('لم يتم الاتصال بقاعدة البيانات');
    }

    const couponsCollection = db.collection<CouponDoc>('coupons');
    const ordersCollection = db.collection<OrderDoc>('orders');
    const engineerProfilesCollection = db.collection<EngineerProfileDoc>('engineerprofiles');

    // 1. جلب جميع الكوبونات المرتبطة بمهندسين والتي لديها سجل استخدامات
    const engineerCoupons = await couponsCollection
      .find({
        engineerId: { $exists: true, $ne: null },
        commissionRate: { $exists: true, $gt: 0 },
        'usageHistory.0': { $exists: true }, // لديها على الأقل استخدام واحد
      })
      .toArray();

    console.log(`📋 تم العثور على ${engineerCoupons.length} كوبون مهندس مع سجلات استخدام\n`);

    if (engineerCoupons.length === 0) {
      console.log('✨ لا توجد سجلات تحتاج إصلاح!');
      return;
    }

    const fixResults: FixResult[] = [];
    const engineerAdjustments: Map<string, number> = new Map(); // engineerId -> total adjustment

    // 2. معالجة كل كوبون
    for (const coupon of engineerCoupons) {
      console.log(`\n📦 معالجة الكوبون: ${coupon.code}`);
      console.log(`   نسبة العمولة: ${coupon.commissionRate}%`);
      console.log(`   عدد الاستخدامات: ${coupon.usageHistory.length}`);

      let totalOldCommission = 0;
      let totalNewCommission = 0;
      const updatedUsageHistory: UsageHistoryItem[] = [];

      // 3. معالجة كل استخدام
      for (const usage of coupon.usageHistory) {
        // جلب الطلب للحصول على subtotal
        const order = await ordersCollection.findOne({ _id: usage.orderId });

        if (!order) {
          console.log(`   ⚠️ لم يتم العثور على الطلب: ${usage.orderId}`);
          updatedUsageHistory.push(usage);
          totalOldCommission += usage.commissionAmount;
          totalNewCommission += usage.commissionAmount;
          continue;
        }

        // حساب العمولة الجديدة من subtotal
        const newCommissionAmount = (order.subtotal * coupon.commissionRate!) / 100;
        const oldCommissionAmount = usage.commissionAmount;
        const difference = newCommissionAmount - oldCommissionAmount;

        if (Math.abs(difference) > 0.01) {
          // فقط إذا كان هناك فرق حقيقي
          fixResults.push({
            couponCode: coupon.code,
            engineerId: String(coupon.engineerId),
            orderId: String(usage.orderId),
            oldCommission: oldCommissionAmount,
            newCommission: newCommissionAmount,
            difference,
            orderSubtotal: order.subtotal,
          });

          // تجميع التعديلات لكل مهندس
          const currentAdjustment = engineerAdjustments.get(String(coupon.engineerId)) || 0;
          engineerAdjustments.set(String(coupon.engineerId), currentAdjustment + difference);
        }

        // تحديث سجل الاستخدام
        updatedUsageHistory.push({
          ...usage,
          commissionAmount: newCommissionAmount,
        });

        totalOldCommission += oldCommissionAmount;
        totalNewCommission += newCommissionAmount;
      }

      // 4. تحديث الكوبون
      if (Math.abs(totalNewCommission - totalOldCommission) > 0.01) {
        await couponsCollection.updateOne(
          { _id: coupon._id },
          {
            $set: {
              usageHistory: updatedUsageHistory,
              totalCommissionEarned: totalNewCommission,
            },
          },
        );
        console.log(`   ✅ تم تحديث الكوبون: ${coupon.code}`);
        console.log(`      العمولة القديمة: ${totalOldCommission.toFixed(2)}`);
        console.log(`      العمولة الجديدة: ${totalNewCommission.toFixed(2)}`);
        console.log(`      الفرق: ${(totalNewCommission - totalOldCommission).toFixed(2)}`);
      }
    }

    // 5. تحديث رصيد المهندسين
    console.log('\n💰 تحديث أرصدة المهندسين...\n');

    for (const [engineerId, adjustment] of engineerAdjustments) {
      if (Math.abs(adjustment) < 0.01) continue;

      const profile = await engineerProfilesCollection.findOne({
        userId: new mongoose.Types.ObjectId(engineerId),
      });

      if (!profile) {
        console.log(`⚠️ لم يتم العثور على بروفايل المهندس: ${engineerId}`);
        continue;
      }

      // تحديث الرصيد
      const newBalance = Math.max(0, profile.walletBalance + adjustment);

      // إضافة سجل تعديل
      const adjustmentTransaction = {
        transactionId: `ADJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: adjustment > 0 ? 'commission' : 'refund',
        amount: adjustment,
        description: `تعديل عمولات سابقة - إصلاح طريقة الحساب من مبلغ الخصم إلى إجمالي الطلب`,
        createdAt: new Date(),
      };

      await engineerProfilesCollection.updateOne(
        { _id: profile._id },
        {
          $set: { walletBalance: newBalance },
          $push: { commissionTransactions: adjustmentTransaction as any },
        },
      );

      console.log(`✅ تم تحديث رصيد المهندس: ${engineerId}`);
      console.log(`   الرصيد القديم: ${profile.walletBalance.toFixed(2)}`);
      console.log(`   التعديل: ${adjustment > 0 ? '+' : ''}${adjustment.toFixed(2)}`);
      console.log(`   الرصيد الجديد: ${newBalance.toFixed(2)}`);
    }

    // 6. طباعة التقرير النهائي
    console.log('\n' + '='.repeat(60));
    console.log('📊 التقرير النهائي');
    console.log('='.repeat(60) + '\n');

    if (fixResults.length === 0) {
      console.log('✨ لا توجد سجلات تحتاج إصلاح!');
    } else {
      console.log(`إجمالي السجلات المُصلحة: ${fixResults.length}\n`);

      // طباعة جدول التفاصيل
      console.log('تفاصيل التعديلات:');
      console.log('-'.repeat(100));
      console.log(
        '| كود الكوبون | رقم الطلب | العمولة القديمة | العمولة الجديدة | الفرق | subtotal |',
      );
      console.log('-'.repeat(100));

      for (const result of fixResults) {
        console.log(
          `| ${result.couponCode.padEnd(12)} | ${result.orderId.slice(-8).padEnd(10)} | ` +
            `${result.oldCommission.toFixed(2).padStart(14)} | ${result.newCommission.toFixed(2).padStart(14)} | ` +
            `${(result.difference > 0 ? '+' : '') + result.difference.toFixed(2).padStart(5)} | ` +
            `${result.orderSubtotal.toFixed(2).padStart(8)} |`,
        );
      }
      console.log('-'.repeat(100));

      // ملخص التعديلات لكل مهندس
      console.log('\n📈 ملخص التعديلات لكل مهندس:');
      console.log('-'.repeat(50));

      for (const [engineerId, adjustment] of engineerAdjustments) {
        if (Math.abs(adjustment) < 0.01) continue;
        console.log(
          `المهندس ${engineerId.slice(-8)}: ${adjustment > 0 ? '+' : ''}${adjustment.toFixed(2)} ريال`,
        );
      }
    }

    console.log('\n✅ تم الانتهاء من إصلاح العمولات بنجاح!');
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم إغلاق الاتصال بقاعدة البيانات');
  }
}

// تشغيل السكريبت
fixEngineerCommissions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

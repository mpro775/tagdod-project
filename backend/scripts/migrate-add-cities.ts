/**
 * Migration Script: إضافة حقل المدينة للمستخدمين وطلبات الخدمات
 * 
 * هذا الـ script يضيف حقل "city" للبيانات الموجودة
 * ويضع القيمة الافتراضية "صنعاء" للسجلات التي لا تحتوي على مدينة
 */

import { connect } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tagadodo';
const DEFAULT_CITY = 'صنعاء';

async function migrateAddCities() {
  console.log('🚀 بدء Migration: إضافة حقل المدينة');
  console.log('📍 المدينة الافتراضية:', DEFAULT_CITY);
  console.log('─'.repeat(50));

  try {
    // الاتصال بقاعدة البيانات
    console.log('🔗 الاتصال بقاعدة البيانات...');
    const connection = await connect(MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح');
    console.log('');

    const db = connection.connection.db;

    // ==================== تحديث المستخدمين ====================
    console.log('👥 تحديث المستخدمين...');
    
    const usersCollection = db.collection('users');
    
    // إحصائيات قبل التحديث
    const totalUsers = await usersCollection.countDocuments();
    const usersWithoutCity = await usersCollection.countDocuments({ 
      city: { $exists: false } 
    });
    
    console.log(`  📊 إجمالي المستخدمين: ${totalUsers}`);
    console.log(`  📊 بدون مدينة: ${usersWithoutCity}`);
    
    if (usersWithoutCity > 0) {
      const usersResult = await usersCollection.updateMany(
        { city: { $exists: false } },
        { $set: { city: DEFAULT_CITY } }
      );
      
      console.log(`  ✅ تم تحديث ${usersResult.modifiedCount} مستخدم`);
    } else {
      console.log(`  ✅ جميع المستخدمين لديهم مدن بالفعل`);
    }
    console.log('');

    // ==================== تحديث طلبات الخدمات ====================
    console.log('🛠️  تحديث طلبات الخدمات...');
    
    const serviceRequestsCollection = db.collection('servicerequests');
    
    // إحصائيات قبل التحديث
    const totalRequests = await serviceRequestsCollection.countDocuments();
    const requestsWithoutCity = await serviceRequestsCollection.countDocuments({ 
      city: { $exists: false } 
    });
    
    console.log(`  📊 إجمالي الطلبات: ${totalRequests}`);
    console.log(`  📊 بدون مدينة: ${requestsWithoutCity}`);
    
    if (requestsWithoutCity > 0) {
      const requestsResult = await serviceRequestsCollection.updateMany(
        { city: { $exists: false } },
        { $set: { city: DEFAULT_CITY } }
      );
      
      console.log(`  ✅ تم تحديث ${requestsResult.modifiedCount} طلب`);
    } else {
      console.log(`  ✅ جميع الطلبات لديها مدن بالفعل`);
    }
    console.log('');

    // ==================== إنشاء الفهارس ====================
    console.log('📑 إنشاء الفهارس...');
    
    // فهارس طلبات الخدمات
    await serviceRequestsCollection.createIndex({ city: 1, status: 1 });
    console.log('  ✅ تم إنشاء فهرس: { city: 1, status: 1 }');
    
    await serviceRequestsCollection.createIndex({ city: 1, createdAt: -1 });
    console.log('  ✅ تم إنشاء فهرس: { city: 1, createdAt: -1 }');
    console.log('');

    // ==================== التحقق من النتائج ====================
    console.log('🔍 التحقق من النتائج...');
    
    const finalUsersWithCity = await usersCollection.countDocuments({ 
      city: { $exists: true } 
    });
    const finalRequestsWithCity = await serviceRequestsCollection.countDocuments({ 
      city: { $exists: true } 
    });
    
    console.log(`  ✅ المستخدمين مع مدينة: ${finalUsersWithCity} / ${totalUsers}`);
    console.log(`  ✅ الطلبات مع مدينة: ${finalRequestsWithCity} / ${totalRequests}`);
    console.log('');

    // ==================== إحصائيات المدن ====================
    console.log('📊 إحصائيات المدن:');
    
    const citiesStats = await serviceRequestsCollection.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('  الطلبات حسب المدينة:');
    citiesStats.forEach((stat: any) => {
      console.log(`    • ${stat._id}: ${stat.count} طلب`);
    });
    console.log('');

    const engineersStats = await usersCollection.aggregate([
      { 
        $match: { 
          $or: [
            { engineer_capable: true },
            { roles: 'engineer' }
          ]
        } 
      },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('  المهندسين حسب المدينة:');
    engineersStats.forEach((stat: any) => {
      console.log(`    • ${stat._id}: ${stat.count} مهندس`);
    });
    console.log('');

    // ==================== النتيجة النهائية ====================
    console.log('─'.repeat(50));
    console.log('✅ تمت عملية الـ Migration بنجاح!');
    console.log('');
    console.log('📋 الملخص:');
    console.log(`  • المستخدمين المحدثين: ${usersWithoutCity}`);
    console.log(`  • الطلبات المحدثة: ${requestsWithoutCity}`);
    console.log(`  • الفهارس المنشأة: 2`);
    console.log(`  • المدينة الافتراضية: ${DEFAULT_CITY}`);
    console.log('');
    console.log('🎯 الخطوات التالية:');
    console.log('  1. تحقق من البيانات في قاعدة البيانات');
    console.log('  2. اختبر فلترة الطلبات حسب المدينة');
    console.log('  3. تأكد من أن المهندسين يرون طلبات مدينتهم فقط');
    console.log('');

    // إغلاق الاتصال
    await connection.connection.close();
    console.log('🔌 تم إغلاق الاتصال بقاعدة البيانات');

  } catch (error) {
    console.error('❌ حدث خطأ أثناء الـ Migration:');
    console.error(error);
    process.exit(1);
  }
}

// تشغيل الـ Migration
migrateAddCities()
  .then(() => {
    console.log('');
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });


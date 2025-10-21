import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRole, CapabilityStatus } from '../src/modules/users/schemas/user.schema';
import { Capabilities } from '../src/modules/capabilities/schemas/capabilities.schema';

async function migrateCapabilitiesToUser() {
  console.log('🚀 بدء ترحيل البيانات من Capabilities إلى User...');

  try {
    // إنشاء تطبيق NestJS
    const app = await NestFactory.createApplicationContext(AppModule);

    // الحصول على نماذج قاعدة البيانات
    const userModel = app.get<Model<User>>(getModelToken(User.name));
    const capsModel = app.get<Model<Capabilities>>(getModelToken(Capabilities.name));

    console.log('📊 جاري حساب عدد السجلات...');

    // عد السجلات الموجودة
    const totalCapabilities = await capsModel.countDocuments();
    console.log(`📈 عدد سجلات Capabilities: ${totalCapabilities}`);

    if (totalCapabilities === 0) {
      console.log('✅ لا توجد بيانات للترحيل');
      await app.close();
      return;
    }

    // جلب جميع capabilities مع بيانات المستخدمين
    const capabilities = await capsModel.find().populate('userId').lean();
    console.log(`📋 تم جلب ${capabilities.length} سجل`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // ترحيل كل capability
    for (const cap of capabilities) {
      try {
        const userId = cap.userId;

        if (!userId) {
          console.warn(`⚠️  Capability بدون userId: ${cap._id}`);
          skippedCount++;
          continue;
        }

        // البحث عن المستخدم
        const user = await userModel.findById(userId);

        if (!user) {
          console.warn(`⚠️  مستخدم غير موجود: ${userId}`);
          skippedCount++;
          continue;
        }

        // تحديث capabilities في المستخدم
        let needsUpdate = false;

        // نسخ capabilities
        if (user.customer_capable !== cap.customer_capable) {
          user.customer_capable = cap.customer_capable;
          needsUpdate = true;
        }

        if (user.engineer_capable !== cap.engineer_capable) {
          user.engineer_capable = cap.engineer_capable;
          needsUpdate = true;
        }

        if (user.engineer_status !== cap.engineer_status) {
          user.engineer_status = cap.engineer_status as CapabilityStatus;
          needsUpdate = true;
        }

        if (user.wholesale_capable !== cap.wholesale_capable) {
          user.wholesale_capable = cap.wholesale_capable;
          needsUpdate = true;
        }

        if (user.wholesale_status !== cap.wholesale_status) {
          user.wholesale_status = cap.wholesale_status as CapabilityStatus;
          needsUpdate = true;
        }

        if (user.wholesale_discount_percent !== cap.wholesale_discount_percent) {
          user.wholesale_discount_percent = cap.wholesale_discount_percent;
          needsUpdate = true;
        }

        if (user.admin_capable !== cap.admin_capable) {
          user.admin_capable = cap.admin_capable;
          needsUpdate = true;
        }

        if (user.admin_status !== cap.admin_status) {
          user.admin_status = cap.admin_status as CapabilityStatus;
          needsUpdate = true;
        }

        // تحديث الأدوار بناءً على capabilities
        const newRoles = [...user.roles]; // نسخ الأدوار الحالية

        // إضافة الأدوار بناءً على capabilities المعتمدة
        if (cap.engineer_capable && cap.engineer_status === 'approved' && !newRoles.includes(UserRole.ENGINEER)) {
          newRoles.push(UserRole.ENGINEER);
          needsUpdate = true;
        }

        if (cap.wholesale_capable && cap.wholesale_status === 'approved' && !newRoles.includes(UserRole.MERCHANT)) {
          newRoles.push(UserRole.MERCHANT);
          needsUpdate = true;
        }

        if (cap.admin_capable && cap.admin_status === 'approved' && !newRoles.includes(UserRole.ADMIN)) {
          newRoles.push(UserRole.ADMIN);
          needsUpdate = true;
        }

        // إزالة الأدوار إذا تم رفض الطلبات
        if (cap.engineer_status === 'rejected' && newRoles.includes(UserRole.ENGINEER)) {
          const index = newRoles.indexOf(UserRole.ENGINEER);
          newRoles.splice(index, 1);
          needsUpdate = true;
        }

        if (cap.wholesale_status === 'rejected' && newRoles.includes(UserRole.MERCHANT)) {
          const index = newRoles.indexOf(UserRole.MERCHANT);
          newRoles.splice(index, 1);
          needsUpdate = true;
        }

        if (cap.admin_status === 'rejected' && newRoles.includes(UserRole.ADMIN)) {
          const index = newRoles.indexOf(UserRole.ADMIN);
          newRoles.splice(index, 1);
          needsUpdate = true;
        }

        if (newRoles.length !== user.roles.length || !newRoles.every(role => user.roles.includes(role))) {
          user.roles = newRoles;
          needsUpdate = true;
        }

        // حفظ التغييرات إذا لزم الأمر
        if (needsUpdate) {
          await user.save();
          migratedCount++;
          console.log(`✅ تم ترحيل مستخدم: ${user.phone}`);
        } else {
          skippedCount++;
          console.log(`⏭️  تم تخطي مستخدم (لا تغييرات): ${user.phone}`);
        }

      } catch (error) {
        console.error(`❌ خطأ في ترحيل capability ${cap._id}:`, error);
        errorCount++;
      }
    }

    console.log('\n📊 تقرير الترحيل:');
    console.log(`✅ تم الترحيل: ${migratedCount}`);
    console.log(`⏭️  تم التخطي: ${skippedCount}`);
    console.log(`❌ أخطاء: ${errorCount}`);
    console.log(`📈 إجمالي: ${capabilities.length}`);

    if (errorCount === 0) {
      console.log('\n🔄 هل تريد حذف collection Capabilities القديم؟');
      console.log('⚠️  تحذير: هذا الإجراء لا رجعة فيه!');
      console.log('💡 للحذف، قم بتشغيل script منفصل: npm run migrate:cleanup-capabilities');
    }

    await app.close();
    console.log('\n🎉 تم الانتهاء من الترحيل!');

  } catch (error) {
    console.error('❌ خطأ في عملية الترحيل:', error);
    process.exit(1);
  }
}

// تشغيل الـ migration
if (require.main === module) {
  migrateCapabilitiesToUser();
}

export { migrateCapabilitiesToUser };

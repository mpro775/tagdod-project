import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRole, UserStatus } from '../src/modules/users/schemas/user.schema';
import { Capabilities } from '../src/modules/capabilities/schemas/capabilities.schema';
import * as bcrypt from 'bcryptjs';

async function createSuperAdmin() {
  console.log('🚀 بدء إنشاء الادمن الرئيسي...');

  try {
    // إنشاء تطبيق NestJS
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // الحصول على نماذج قاعدة البيانات
    const userModel = app.get<Model<User>>(getModelToken(User.name));
    const capsModel = app.get<Model<Capabilities>>(getModelToken(Capabilities.name));

    // بيانات الادمن الرئيسي
    const superAdminData = {
      phone: '+966500000000', // رقم هاتف افتراضي
      firstName: 'Super',
      lastName: 'Admin',
      gender: 'male' as const,
      jobTitle: 'System Administrator',
      passwordHash: await bcrypt.hash('Admin123!@#', 10), // كلمة مرور قوية
      isAdmin: true,
      roles: [UserRole.SUPER_ADMIN],
      permissions: [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'products.create',
        'products.read',
        'products.update',
        'products.delete',
        'orders.create',
        'orders.read',
        'orders.update',
        'orders.delete',
        'analytics.read',
        'reports.read',
        'settings.read',
        'settings.update',
        'admin.access',
        'super_admin.access'
      ],
      status: UserStatus.ACTIVE
    };

    // التحقق من وجود الادمن الرئيسي
    const existingAdmin = await userModel.findOne({ 
      $or: [
        { phone: superAdminData.phone },
        { roles: UserRole.SUPER_ADMIN }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  الادمن الرئيسي موجود بالفعل!');
      console.log(`📱 رقم الهاتف: ${existingAdmin.phone}`);
      console.log(`👤 الاسم: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`🔑 الأدوار: ${existingAdmin.roles?.join(', ')}`);
      console.log(`📊 الحالة: ${existingAdmin.status}`);
      
      // تحديث كلمة المرور إذا لزم الأمر
      if (process.argv.includes('--update-password')) {
        existingAdmin.passwordHash = await bcrypt.hash('Admin123!@#', 10);
        await existingAdmin.save();
        console.log('✅ تم تحديث كلمة المرور');
      }
      
      await app.close();
      return;
    }

    // إنشاء الادمن الرئيسي
    console.log('📝 إنشاء الادمن الرئيسي...');
    const superAdmin = await userModel.create(superAdminData);

    // إنشاء capabilities للادمن الرئيسي
    const adminCapabilities = {
      userId: superAdmin._id.toString(),
      customer_capable: true,
      engineer_capable: true,
      engineer_status: 'approved',
      wholesale_capable: true,
      wholesale_status: 'approved',
      wholesale_discount_percent: 0,
      admin_capable: true,
      admin_status: 'approved'
    };

    await capsModel.create(adminCapabilities);

    console.log('✅ تم إنشاء الادمن الرئيسي بنجاح!');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log(`📱 رقم الهاتف: ${superAdmin.phone}`);
    console.log(`🔐 كلمة المرور: Admin123!@#`);
    console.log(`👤 الاسم: ${superAdmin.firstName} ${superAdmin.lastName}`);
    console.log(`🔑 الأدوار: ${superAdmin.roles?.join(', ')}`);
    console.log(`📊 الحالة: ${superAdmin.status}`);
    console.log(`🆔 معرف المستخدم: ${superAdmin._id}`);
    
    console.log('\n🔐 طرق تسجيل الدخول:');
    console.log('1. تسجيل الدخول بالهاتف وكلمة المرور (إذا كان النظام يدعم ذلك)');
    console.log('2. تسجيل الدخول بـ OTP (إرسال OTP إلى رقم الهاتف)');
    console.log('3. استخدام API مباشرة مع Bearer Token');
    
    console.log('\n⚠️  تحذيرات أمنية:');
    console.log('- قم بتغيير كلمة المرور فوراً بعد تسجيل الدخول الأول');
    console.log('- تأكد من تحديث رقم الهاتف برقم حقيقي');
    console.log('- احتفظ بمعلومات تسجيل الدخول في مكان آمن');
    console.log('- لا تشارك هذه المعلومات مع أي شخص');

    await app.close();
    console.log('\n🎉 تم الانتهاء من إنشاء الادمن الرئيسي!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء الادمن الرئيسي:', error);
    process.exit(1);
  }
}

// تشغيل السكريبت
if (require.main === module) {
  createSuperAdmin();
}

export { createSuperAdmin };

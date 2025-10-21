import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Capabilities } from '../src/modules/capabilities/schemas/capabilities.schema';

async function cleanupCapabilities() {
  console.log('🧹 بدء تنظيف Capabilities collection...');
  console.log('⚠️  تحذير: هذا الإجراء لا رجعة فيه!');

  // انتظار تأكيد المستخدم
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  await new Promise((resolve) => {
    rl.question('هل أنت متأكد من حذف Capabilities collection؟ (اكتب "نعم" للتأكيد): ', (answer: string) => {
      if (answer.toLowerCase() !== 'نعم' && answer.toLowerCase() !== 'yes') {
        console.log('❌ تم إلغاء العملية');
        process.exit(0);
      }
      resolve(true);
    });
  });

  rl.close();

  try {
    // إنشاء تطبيق NestJS
    const app = await NestFactory.createApplicationContext(AppModule);

    // الحصول على نموذج Capabilities
    const capsModel = app.get<Model<Capabilities>>(getModelToken(Capabilities.name));

    console.log('📊 جاري حساب عدد السجلات...');

    // عد السجلات الموجودة
    const totalCapabilities = await capsModel.countDocuments();
    console.log(`📈 عدد سجلات Capabilities: ${totalCapabilities}`);

    if (totalCapabilities === 0) {
      console.log('✅ Capabilities collection فارغ بالفعل');
      await app.close();
      return;
    }

    // إنشاء backup قبل الحذف
    console.log('💾 إنشاء backup...');
    const allCapabilities = await capsModel.find().lean();
    const backupPath = `./backup-capabilities-${new Date().toISOString().split('T')[0]}.json`;

    const fs = require('fs');
    fs.writeFileSync(backupPath, JSON.stringify(allCapabilities, null, 2));
    console.log(`✅ تم إنشاء backup في: ${backupPath}`);

    // حذف جميع السجلات
    console.log('🗑️  جاري حذف السجلات...');
    const deleteResult = await capsModel.deleteMany({});
    console.log(`✅ تم حذف ${deleteResult.deletedCount} سجل`);

    await app.close();
    console.log('🎉 تم تنظيف Capabilities collection بنجاح!');
    console.log('📁 يمكنك العثور على الـ backup في: ' + backupPath);

  } catch (error) {
    console.error('❌ خطأ في تنظيف Capabilities:', error);
    process.exit(1);
  }
}

// تشغيل التنظيف
if (require.main === module) {
  cleanupCapabilities();
}

export { cleanupCapabilities };

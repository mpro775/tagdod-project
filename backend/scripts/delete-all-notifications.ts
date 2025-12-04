import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { UnifiedNotification } from '../src/modules/notifications/schemas/unified-notification.schema';
import { NotificationQueueService } from '../src/modules/notifications/queue/notification-queue.service';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { BullModule } from '@nestjs/bull';
import { getQueueToken } from '@nestjs/bull';
import {
  NOTIFICATION_QUEUE,
  NOTIFICATION_SCHEDULED_QUEUE,
  NOTIFICATION_RETRY_QUEUE,
} from '../src/modules/notifications/queue/queue.constants';

async function deleteAllNotifications() {
  console.log('🧹 بدء حذف جميع الإشعارات...');
  console.log('⚠️  تحذير: هذا الإجراء لا رجعة فيه!');
  console.log('📋 سيتم حذف:');
  console.log('   - جميع الإشعارات من قاعدة البيانات (MongoDB)');
  console.log('   - جميع الـ Jobs من الـ Queue (Redis/Bull)');
  console.log('   - جميع البيانات من الكاش (Redis)');

  // انتظار تأكيد المستخدم
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  await new Promise((resolve) => {
    rl.question(
      'هل أنت متأكد من حذف جميع الإشعارات؟ (اكتب "نعم" للتأكيد): ',
      (answer: string) => {
        if (answer.toLowerCase() !== 'نعم' && answer.toLowerCase() !== 'yes') {
          console.log('❌ تم إلغاء العملية');
          process.exit(0);
        }
        resolve(true);
      },
    );
  });

  rl.close();

  let app: any;
  let redisClient: any;

  try {
    // إنشاء تطبيق NestJS
    console.log('🔌 الاتصال بالتطبيق...');
    app = await NestFactory.createApplicationContext(AppModule);

    // الحصول على نموذج UnifiedNotification
    const notificationModel = app.get(getModelToken(UnifiedNotification.name)) as Model<any>;

    // الحصول على ConfigService
    const configService = app.get(ConfigService) as ConfigService;

    // ===== 1. حذف من قاعدة البيانات =====
    console.log('\n📊 جاري حساب عدد الإشعارات في قاعدة البيانات...');
    const totalNotifications = await notificationModel.countDocuments();
    console.log(`📈 عدد الإشعارات في قاعدة البيانات: ${totalNotifications}`);

    if (totalNotifications > 0) {
      // إنشاء backup قبل الحذف
      console.log('💾 إنشاء backup...');
      const allNotifications = await notificationModel.find().lean();
      const fs = require('fs');
      const backupDir = './backups';
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const backupPath = `${backupDir}/notifications-backup-${new Date().toISOString().split('T')[0]}.json`;
      fs.writeFileSync(backupPath, JSON.stringify(allNotifications, null, 2));
      console.log(`✅ تم إنشاء backup في: ${backupPath}`);

      // حذف جميع الإشعارات
      console.log('🗑️  جاري حذف الإشعارات من قاعدة البيانات...');
      const deleteResult = await notificationModel.deleteMany({});
      console.log(`✅ تم حذف ${deleteResult.deletedCount} إشعار من قاعدة البيانات`);
    } else {
      console.log('✅ قاعدة البيانات فارغة بالفعل');
    }

    // ===== 2. حذف من الـ Queue (Bull) =====
    console.log('\n📋 جاري تنظيف الـ Queue...');

    try {
      // استخدام BullModule للحصول على الـ queues
      const bullModule = app.get(BullModule);
      
      // محاولة الحصول على الـ queues مباشرة
      let sendQueue: any;
      let scheduledQueue: any;
      let retryQueue: any;

      try {
        sendQueue = app.get(getQueueToken(NOTIFICATION_QUEUE));
      } catch {
        console.log('   ⚠️  لا يمكن الوصول إلى Send Queue');
      }

      try {
        scheduledQueue = app.get(getQueueToken(NOTIFICATION_SCHEDULED_QUEUE));
      } catch {
        console.log('   ⚠️  لا يمكن الوصول إلى Scheduled Queue');
      }

      try {
        retryQueue = app.get(getQueueToken(NOTIFICATION_RETRY_QUEUE));
      } catch {
        console.log('   ⚠️  لا يمكن الوصول إلى Retry Queue');
      }

      const queues = [
        { name: 'Send Queue', queue: sendQueue },
        { name: 'Scheduled Queue', queue: scheduledQueue },
        { name: 'Retry Queue', queue: retryQueue },
      ];

      for (const { name, queue } of queues) {
        if (!queue) {
          continue;
        }

        try {
          // الحصول على إحصائيات الـ Queue
          const counts = await queue.getJobCounts();
          const total = counts.waiting + counts.active + counts.completed + counts.failed + counts.delayed;
          console.log(`   ${name}: ${total} jobs`);

          if (total > 0) {
            // حذف جميع الـ Jobs
            await queue.empty();
            console.log(`   ✅ تم تنظيف ${name}`);
          } else {
            console.log(`   ✅ ${name} فارغ بالفعل`);
          }
        } catch (error) {
          console.log(`   ⚠️  خطأ في تنظيف ${name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    } catch (error) {
      console.log(`⚠️  خطأ في تنظيف الـ Queue: ${error instanceof Error ? error.message : String(error)}`);
    }

    // ===== 3. تنظيف Redis Cache =====
    console.log('\n🗄️  جاري تنظيف الكاش...');

    try {
      const redisUrl = configService.get('REDIS_URL') as string | undefined;
      if (redisUrl) {
        // إنشاء Redis client
        redisClient = createClient({
          url: redisUrl,
        });

        await redisClient.connect();
        console.log('   ✅ تم الاتصال بـ Redis');

        // البحث عن جميع المفاتيح المتعلقة بالإشعارات
        const notificationKeys = await redisClient.keys('*notification*');
        const bullKeys = await redisClient.keys('bull:notification*');

        const allKeys = [...new Set([...notificationKeys, ...bullKeys])];
        console.log(`   📊 وجد ${allKeys.length} مفتاح متعلق بالإشعارات`);

        if (allKeys.length > 0) {
          // حذف جميع المفاتيح
          for (const key of allKeys) {
            await redisClient.del(key);
          }
          console.log(`   ✅ تم حذف ${allKeys.length} مفتاح من الكاش`);
        } else {
          console.log('   ✅ الكاش فارغ بالفعل');
        }

        await redisClient.quit();
      } else {
        console.log('   ⚠️  REDIS_URL غير محدد، تم تخطي تنظيف الكاش');
      }
    } catch (error) {
      console.log(`   ⚠️  خطأ في تنظيف الكاش: ${error instanceof Error ? error.message : String(error)}`);
      if (redisClient) {
        try {
          await redisClient.quit();
        } catch {
          // ignore
        }
      }
    }

    await app.close();
    console.log('\n🎉 تم حذف جميع الإشعارات بنجاح!');
    console.log('📁 يمكنك العثور على الـ backup في مجلد ./backups');

  } catch (error) {
    console.error('❌ خطأ في حذف الإشعارات:', error);
    if (app) {
      try {
        await app.close();
      } catch {
        // ignore
      }
    }
    if (redisClient) {
      try {
        await redisClient.quit();
      } catch {
        // ignore
      }
    }
    process.exit(1);
  }
}

// تشغيل الحذف
if (require.main === module) {
  deleteAllNotifications();
}

export { deleteAllNotifications };


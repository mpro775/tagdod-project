import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { UnifiedNotification } from '../src/modules/notifications/schemas/unified-notification.schema';
import { NotificationStatus } from '../src/modules/notifications/enums/notification.enums';

const VISIBLE_DAYS = 7;
const RETENTION_DAYS = 90;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  const app = await NestFactory.createApplicationContext(AppModule);
  const notificationModel = app.get<Model<any>>(
    getModelToken(UnifiedNotification.name),
  );

  const now = new Date();

  const visibleCutoff = new Date(now);
  visibleCutoff.setDate(visibleCutoff.getDate() - VISIBLE_DAYS);

  const deleteCutoff = new Date(now);
  deleteCutoff.setDate(deleteCutoff.getDate() - RETENTION_DAYS);

  const total = await notificationModel.countDocuments();

  const activeVisible = await notificationModel.countDocuments({
    createdAt: { $gte: visibleCutoff },
  });

  const expiredButRetained = await notificationModel.countDocuments({
    createdAt: { $lt: visibleCutoff, $gte: deleteCutoff },
  });

  const deletableOld = await notificationModel.countDocuments({
    createdAt: { $lt: deleteCutoff },
    $or: [
      { scheduledFor: { $exists: false } },
      { scheduledFor: null },
      { scheduledFor: { $lt: now } },
    ],
    status: {
      $nin: [
        NotificationStatus.PENDING,
        NotificationStatus.QUEUED,
        NotificationStatus.SENDING,
      ],
    },
  });

  console.log('Notifications cleanup preview:');
  console.log({
    total,
    activeVisible,
    expiredButRetained,
    deletableOld,
    dryRun,
  });

  if (dryRun) {
    await app.close();
    return;
  }

  const backupDir = path.resolve(process.cwd(), 'backups');
  fs.mkdirSync(backupDir, { recursive: true });

  const backupPath = path.join(
    backupDir,
    `notifications-cleanup-backup-${new Date()
      .toISOString()
      .replace(/[:.]/g, '-')}.json`,
  );

  const oldNotifications = await notificationModel
    .find({
      createdAt: { $lt: deleteCutoff },
    })
    .lean();

  fs.writeFileSync(backupPath, JSON.stringify(oldNotifications, null, 2));

  console.log(`Backup created: ${backupPath}`);

  const cursor = notificationModel
    .find({
      visibleUntil: { $exists: false },
    })
    .cursor();

  let backfilled = 0;

  for await (const notification of cursor) {
    const createdAt = notification.createdAt || now;

    const baseDate =
      notification.scheduledFor && notification.scheduledFor > now
        ? notification.scheduledFor
        : createdAt;

    const visibleUntil = addDays(baseDate, VISIBLE_DAYS);
    const shouldBeHidden = visibleUntil <= now;

    await notificationModel.updateOne(
      { _id: notification._id },
      {
        $set: {
          visibleUntil,
          ...(shouldBeHidden ? { hiddenFromUserAt: visibleUntil } : {}),
        },
      },
    );

    backfilled++;
  }

  const archiveResult = await notificationModel.updateMany(
    {
      visibleUntil: { $lte: now },
      hiddenFromUserAt: { $exists: false },
    },
    {
      $set: {
        hiddenFromUserAt: now,
      },
    },
  );

  const deleteResult = await notificationModel.deleteMany({
    createdAt: { $lt: deleteCutoff },
    $or: [
      { scheduledFor: { $exists: false } },
      { scheduledFor: null },
      { scheduledFor: { $lt: now } },
    ],
    status: {
      $nin: [
        NotificationStatus.PENDING,
        NotificationStatus.QUEUED,
        NotificationStatus.SENDING,
      ],
    },
  });

  console.log('Cleanup completed:');
  console.log({
    backfilled,
    archived: archiveResult.modifiedCount,
    deleted: deleteResult.deletedCount,
    backupPath,
  });

  await app.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
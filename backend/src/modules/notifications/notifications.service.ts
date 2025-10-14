import { Inject, Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { DeviceToken } from './schemas/device-token.schema';
import { TEMPLATES, render } from './templates';
import { PUSH_PORT, PushPort, NullPushAdapter } from './ports/push.port';
import { SMS_PORT, SmsPort, NullSmsAdapter } from './ports/sms.port';
import { RegisterDeviceDto } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notes: Model<Notification>,
    @InjectModel(DeviceToken.name) private devices: Model<DeviceToken>,
    @Optional() @Inject(PUSH_PORT) private push: PushPort = new NullPushAdapter(),
    @Optional() @Inject(SMS_PORT) private sms: SmsPort = new NullSmsAdapter(),
  ) {}

  // ---- API used by other modules
  async emit(userId: string, templateKey: string, payload: Record<string, unknown>) {
    const tpl = TEMPLATES[templateKey];
    const title = tpl ? render(tpl.title, payload) : templateKey;
    const body = tpl ? render(tpl.body, payload) : JSON.stringify(payload || {});
    const link = tpl && tpl.link ? tpl.link(payload) : undefined;

    // 1) In-App
    await this.notes.create({
      userId: new Types.ObjectId(userId),
      channel: 'inapp',
      templateKey,
      payload,
      title,
      body,
      link,
      status: 'sent',
      sentAt: new Date(),
    });

    // 2) Push (if tokens exist)
    const tokens = await this.devices.find({ userId }).lean();
    if (tokens.length > 0) {
      try {
        await this.push.send(tokens.map(t => ({ userId: String(t.userId), token: t.token, platform: t.platform })), title, body, { templateKey, link, ...payload });
        await this.notes.create({
          userId: new Types.ObjectId(userId),
          channel: 'push',
          templateKey,
          payload,
          title,
          body,
          link,
          status: 'sent',
          sentAt: new Date(),
        });
      } catch (e: unknown) {
        await this.notes.create({
          userId: new Types.ObjectId(userId),
          channel: 'push',
          templateKey,
          payload,
          title,
          body,
          link,
          status: 'failed',
          error: String((e as Error)?.message || e),
        });
      }
    }

    // 3) SMS (optional): only if payload.phone exists
    if (payload?.phone) {
      try {
        await this.sms.send(payload.phone as string, body);
        await this.notes.create({
          userId: new Types.ObjectId(userId),
          channel: 'sms',
          templateKey,
          payload,
          title,
          body,
          status: 'sent',
          sentAt: new Date(),
        });
      } catch (e: unknown) {
        await this.notes.create({
          userId: new Types.ObjectId(userId),
          channel: 'sms',
          templateKey,
          payload,
          title,
          body,
          status: 'failed',
          error: String((e as Error)?.message || e),
        });
      }
    }
  }

  // ---- User surface
  async list(userId: string, page = 1, limit = 20, channel?: string) {
    const q: Record<string, unknown> = { userId };
    if (channel) q.channel = channel;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.notes.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.notes.countDocuments(q),
    ]);
    return { items, meta: { page, limit, total } };
  }

  async unreadCount(userId: string) {
    const n = await this.notes.countDocuments({ userId, status: 'sent' });
    return { count: n };
  }

  async markRead(userId: string, ids: string[]) {
    await this.notes.updateMany({ _id: { $in: ids }, userId }, { $set: { status: 'read', readAt: new Date() } });
    return { ok: true };
  }

  async markReadAll(userId: string, channel?: string) {
    const q: Record<string, unknown> = { userId, status: 'sent' };
    if (channel) q.channel = channel;
    await this.notes.updateMany(q, { $set: { status: 'read', readAt: new Date() } });
    return { ok: true };
  }

  // ---- Devices
  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    const doc = await this.devices.findOneAndUpdate(
      { token: dto.token },
      { $set: { userId: new Types.ObjectId(userId), platform: dto.platform, userAgent: dto.userAgent, appVersion: dto.appVersion } },
      { upsert: true, new: true },
    );
    return doc;
  }

  async deleteDevice(userId: string, id: string) {
    const res = await this.devices.deleteOne({ _id: id, userId });
    return { deleted: res.deletedCount === 1 };
  }
}

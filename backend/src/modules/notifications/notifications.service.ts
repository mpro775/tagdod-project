import { Inject, Injectable, Optional, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { DeviceToken } from './schemas/device-token.schema';
import { TEMPLATES, render } from './templates';
import { PUSH_PORT, PushPort, NullPushAdapter } from './ports/push.port';
import { SMS_PORT, SmsPort, NullSmsAdapter } from './ports/sms.port';
import { 
  RegisterDeviceDto,
  AdminListNotificationsDto,
  AdminCreateNotificationDto,
  AdminUpdateNotificationDto,
  AdminSendNotificationDto
} from './dto/notifications.dto';

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

  // ---- Admin functions
  async adminList(query: AdminListNotificationsDto) {
    const { page, limit, channel, status, search, userId } = query;
    const skip = (page - 1) * limit;
    
    const filter: Record<string, unknown> = {};
    if (channel) filter.channel = channel;
    if (status) filter.status = status;
    if (userId) filter.userId = new Types.ObjectId(userId);
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
        { templateKey: { $regex: search, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      this.notes.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .lean(),
      this.notes.countDocuments(filter),
    ]);

    return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getAvailableTemplates() {
    return Object.keys(TEMPLATES).map(key => ({
      key,
      title: TEMPLATES[key].title,
      body: TEMPLATES[key].body,
      hasLink: !!TEMPLATES[key].link
    }));
  }

  async adminCreate(dto: AdminCreateNotificationDto) {
    const notificationData: any = {
      title: dto.title,
      body: dto.body,
      channel: dto.channel,
      templateKey: dto.templateKey || 'MANUAL',
      payload: dto.payload || {},
      link: dto.link,
      status: dto.scheduledAt ? 'queued' : 'sent',
    };

    if (dto.targetUsers && dto.targetUsers.length > 0) {
      // Create notification for each target user
      const notifications = dto.targetUsers.map(userId => ({
        ...notificationData,
        userId: new Types.ObjectId(userId),
        sentAt: dto.scheduledAt ? undefined : new Date(),
        isAdminCreated: true,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      }));
      
      const created = await this.notes.insertMany(notifications);
      return created;
    } else {
      // Create notification without specific user (for admin reference)
      const created = await this.notes.create({
        ...notificationData,
        userId: null, // Admin notification
        sentAt: dto.scheduledAt ? undefined : new Date(),
        isAdminCreated: true,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      });
      return created;
    }
  }

  async adminGetById(id: string) {
    const notification = await this.notes.findById(id).populate('userId', 'name email').lean();
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async adminUpdate(id: string, dto: AdminUpdateNotificationDto) {
    const notification = await this.notes.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true }
    ).populate('userId', 'name email').lean();
    
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async adminSend(id: string, dto: AdminSendNotificationDto) {
    const notification = await this.notes.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const targetUsers = dto.targetUsers || (notification.userId ? [String(notification.userId)] : []);
    
    if (targetUsers.length === 0) {
      throw new Error('No target users specified');
    }

    const results = [];
    for (const userId of targetUsers) {
      try {
        await this.emit(userId, notification.templateKey, notification.payload);
        results.push({ userId, status: 'sent' });
      } catch (error) {
        results.push({ userId, status: 'failed', error: String(error) });
      }
    }

    // Update notification status
    await this.notes.findByIdAndUpdate(id, {
      $set: { 
        status: 'sent',
        sentAt: new Date(),
        userId: targetUsers.length === 1 ? new Types.ObjectId(targetUsers[0]) : null
      }
    });

    return results;
  }

  async adminDelete(id: string) {
    const result = await this.notes.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Notification not found');
    }
    return { deleted: true };
  }

  async getAdminStats() {
    const [
      total,
      sent,
      failed,
      queued,
      read,
      byChannel,
      recent
    ] = await Promise.all([
      this.notes.countDocuments(),
      this.notes.countDocuments({ status: 'sent' }),
      this.notes.countDocuments({ status: 'failed' }),
      this.notes.countDocuments({ status: 'queued' }),
      this.notes.countDocuments({ status: 'read' }),
      this.notes.aggregate([
        { $group: { _id: '$channel', count: { $sum: 1 } } }
      ]),
      this.notes.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    return {
      total,
      sent,
      failed,
      queued,
      read,
      byChannel: byChannel.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      recent24h: recent
    };
  }

  async adminBulkSend(dto: AdminCreateNotificationDto & { targetUsers: string[] }) {
    const results = [];
    
    for (const userId of dto.targetUsers) {
      try {
        await this.emit(userId, dto.templateKey || 'MANUAL', {
          ...dto.payload,
          title: dto.title,
          body: dto.body,
          link: dto.link
        });
        results.push({ userId, status: 'sent' });
      } catch (error) {
        results.push({ userId, status: 'failed', error: String(error) });
      }
    }

    return results;
  }
}

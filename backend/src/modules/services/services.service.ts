import { Injectable, Logger, Optional, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { ServiceRequest, ServiceRating } from './schemas/service-request.schema';
import { EngineerOffer } from './schemas/engineer-offer.schema';
import { User, CapabilityStatus } from '../users/schemas/user.schema';
import { EngineerProfile } from '../users/schemas/engineer-profile.schema';
import { Coupon, CouponDocument } from '../marketing/schemas/coupon.schema';
import { AddressesService } from '../addresses/addresses.service';
import { NotificationService } from '../notifications/services/notification.service';
import { EngineerProfileService } from '../users/services/engineer-profile.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationNavigationType,
} from '../notifications/enums/notification.enums';
import { CreateServiceRequestDto, UpdateServiceRequestDto } from './dto/requests.dto';
import { CreateOfferDto, UpdateOfferDto } from './dto/offers.dto';
import { DistanceService } from './services/distance.service';
import { UploadService } from '../upload/upload.service';
import { SMSAdapter } from '../notifications/adapters/sms.adapter';
import { normalizeYemeniPhone } from '../../shared/utils/phone.util';

type ServiceRequestLean = ServiceRequest & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
type EngineerOfferLean = EngineerOffer & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

interface PopulatedEngineer {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string | null;
}

// Helper function to check if engineer is populated
function isPopulatedEngineer(
  engineer: PopulatedEngineer | Types.ObjectId | null | undefined,
): engineer is PopulatedEngineer {
  return (
    engineer !== null &&
    engineer !== undefined &&
    !(engineer instanceof Types.ObjectId) &&
    typeof engineer === 'object' &&
    '_id' in engineer
  );
}

// Helper function to extract ObjectId from engineer
function extractEngineerId(
  engineer: PopulatedEngineer | Types.ObjectId | null | undefined,
): Types.ObjectId | null {
  if (!engineer) return null;
  if (engineer instanceof Types.ObjectId) return engineer;
  if (isPopulatedEngineer(engineer)) return engineer._id;
  return null;
}

interface PopulatedAddress {
  _id: Types.ObjectId;
  label?: string;
  line1?: string;
  city?: string;
  coords?: { lat?: number; lng?: number } | null;
}

interface PopulatedCustomer {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

type ServiceRequestPopulated = ServiceRequestLean & {
  engineerId?: PopulatedEngineer | Types.ObjectId | null;
  addressId?: PopulatedAddress | Types.ObjectId | null;
  userId?: PopulatedCustomer | Types.ObjectId | null;
};

type EngineerOfferPopulated = EngineerOfferLean & {
  engineerId?: PopulatedEngineer | Types.ObjectId | null;
};

export interface OfferListItem {
  _id: Types.ObjectId;
  requestId: string;
  amount: number;
  currency: string;
  note: string | null;
  status: EngineerOffer['status'];
  statusLabel: string;
  createdAt: Date;
  engineer: {
    id: string;
    name: string | null;
    jobTitle: string | null;
    phone: string | null;
    whatsapp: string | null;
  } | null;
}

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);
  private readonly enableSMSToEngineers: boolean;

  constructor(
    @InjectModel(ServiceRequest.name) private requests: Model<ServiceRequest>,
    @InjectModel(EngineerOffer.name) private offers: Model<EngineerOffer>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(EngineerProfile.name) private engineerProfileModel: Model<EngineerProfile>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectConnection() private conn: Connection,
    private distanceService: DistanceService,
    private addressesService: AddressesService,
    private uploadService: UploadService,
    private configService: ConfigService,
    @Optional() private notificationService?: NotificationService,
    @Inject(forwardRef(() => EngineerProfileService))
    @Optional()
    private engineerProfileService?: EngineerProfileService,
    @Inject(forwardRef(() => SMSAdapter))
    @Optional()
    private smsAdapter?: SMSAdapter,
  ) {
    // قراءة متغير البيئة للتحكم في إرسال SMS للمهندسين
    this.enableSMSToEngineers = this.configService.get<boolean>('ENABLE_SMS_TO_ENGINEERS', false);
  }

  // Helper method for safe notification sending
  private async safeNotify(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
    navigationType?: NotificationNavigationType,
    navigationTarget?: string,
  ) {
    try {
      if (this.notificationService) {
        await this.notificationService.createNotification({
          recipientId: userId,
          type,
          title,
          message,
          messageEn: message, // Using same message for English
          data,
          channel: NotificationChannel.IN_APP,
          priority: NotificationPriority.MEDIUM,
          navigationType,
          navigationTarget,
        });
      }
    } catch (error) {
      console.warn(`Notification failed for user ${userId}:`, error);
      // Don't throw error - notifications are not critical for core functionality
    }
  }

  /**
   * تطبيع رقم الهاتف بإضافة +967 للأرقام اليمنية
   */
  private normalizePhoneNumber(phone: string): string | null {
    try {
      if (!phone || typeof phone !== 'string' || phone.trim() === '') {
        return null;
      }
      return normalizeYemeniPhone(phone.trim());
    } catch (error) {
      this.logger.warn(`Failed to normalize phone number ${phone}:`, error);
      return null;
    }
  }

  /**
   * جلب جميع أرقام المهندسين من قاعدة البيانات
   */
  private async getAllEngineersPhones(): Promise<
    Array<{ phone: string; normalizedPhone: string }>
  > {
    try {
      const engineers = await this.userModel
        .find({
          $or: [{ roles: { $in: ['engineer'] } }, { engineer_capable: true }],
          status: { $ne: 'deleted' },
          phone: { $exists: true, $nin: [null, ''] },
        })
        .select('_id phone firstName lastName')
        .lean();

      const validPhones: Array<{ phone: string; normalizedPhone: string }> = [];

      for (const engineer of engineers) {
        if (engineer.phone) {
          const normalized = this.normalizePhoneNumber(engineer.phone);
          if (normalized) {
            validPhones.push({
              phone: engineer.phone,
              normalizedPhone: normalized,
            });
          } else {
            this.logger.warn(
              `Skipping invalid phone number for engineer ${engineer._id}: ${engineer.phone}`,
            );
          }
        }
      }

      return validPhones;
    } catch (error) {
      this.logger.error('Failed to get engineers phones:', error);
      return [];
    }
  }

  /**
   * إرسال SMS لجميع المهندسين عند إنشاء طلب خدمة جديد
   */
  private async sendSMSToAllEngineers(requestId: string, requestTitle: string): Promise<void> {
    try {
      // التحقق من تفعيل إرسال SMS للمهندسين من متغير البيئة
      if (!this.enableSMSToEngineers) {
        this.logger.debug(
          'SMS to engineers is disabled via ENABLE_SMS_TO_ENGINEERS environment variable. Skipping SMS notification.',
        );
        return;
      }

      if (!this.smsAdapter) {
        this.logger.warn('SMS adapter not available. Skipping SMS notification to engineers.');
        return;
      }

      const engineersPhones = await this.getAllEngineersPhones();

      if (engineersPhones.length === 0) {
        this.logger.warn('No valid engineer phone numbers found. Skipping SMS notification.');
        return;
      }

      const message = `تم إنشاء طلب خدمة جديد: ${requestTitle}. يمكنك عرض التفاصيل والتقدم بعرض في التطبيق.`;

      const smsNotifications = engineersPhones.map(({ normalizedPhone }) => ({
        to: normalizedPhone,
        message,
      }));

      this.logger.log(
        `Sending SMS to ${smsNotifications.length} engineers for request ${requestId}`,
      );

      const result = await this.smsAdapter.sendBulkSMS(smsNotifications);

      if (result.successCount > 0) {
        this.logger.log(
          `Successfully sent SMS to ${result.successCount} engineers for request ${requestId}`,
        );
      }

      if (result.failureCount > 0) {
        this.logger.warn(
          `Failed to send SMS to ${result.failureCount} engineers for request ${requestId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send SMS to engineers for request ${requestId}:`, error);
      // Don't throw error - SMS sending should not fail the request creation
    }
  }

  // ---- Customer flows
  async createRequest(
    userId: string,
    dto: CreateServiceRequestDto,
    uploadedFiles?: Array<{ buffer: Buffer; originalname: string; mimetype: string; size: number }>,
  ) {
    // التحقق من ملكية العنوان
    const isValid = await this.addressesService.validateAddressOwnership(dto.addressId, userId);
    if (!isValid) {
      throw new Error('ADDRESS_NOT_FOUND');
    }

    // جلب تفاصيل العنوان
    const addr = await this.addressesService.getAddressById(dto.addressId);

    const rawLng = (addr.coords as { lng?: unknown } | undefined)?.lng;
    const rawLat = (addr.coords as { lat?: unknown } | undefined)?.lat;

    const lng = typeof rawLng === 'number' ? rawLng : Number(rawLng);
    const lat = typeof rawLat === 'number' ? rawLat : Number(rawLat);

    const hasValidCoords = Number.isFinite(lng) && Number.isFinite(lat);
    if (!hasValidCoords) {
      this.logger.warn(`Address ${dto.addressId} is missing coordinates; using fallback [0,0].`);
    }

    const location = hasValidCoords
      ? { type: 'Point', coordinates: [lng, lat] as [number, number] }
      : { type: 'Point', coordinates: [0, 0] as [number, number] };

    // رفع الصور تلقائياً إلى Bunny.net إذا كانت موجودة
    const imageUrls: string[] = [];

    // إذا كانت هناك ملفات مرفوعة، ارفعها أولاً
    if (uploadedFiles && uploadedFiles.length > 0) {
      this.logger.log(
        `Uploading ${uploadedFiles.length} image(s) to Bunny.net for service request`,
      );
      for (const file of uploadedFiles) {
        try {
          const uploadResult = await this.uploadService.uploadFile(
            {
              buffer: file.buffer,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
            },
            'services/requests', // مجلد خاص بطلبات الخدمات
          );
          imageUrls.push(uploadResult.url);
          this.logger.log(`Successfully uploaded image: ${uploadResult.url}`);
        } catch (error) {
          this.logger.error(`Failed to upload image ${file.originalname}:`, error);
          // لا نوقف العملية إذا فشل رفع صورة واحدة، نكمل مع الصور الأخرى
        }
      }
    }

    // دمج الصور المرفوعة مع الصور المرسلة كروابط (إن وجدت)
    const allImages = [...imageUrls, ...(dto.images || [])];

    const doc = await this.requests.create({
      userId: new Types.ObjectId(userId),
      title: dto.title,
      type: dto.type,
      description: dto.description,
      images: allImages,
      city: addr.city, // المدينة تُستمد من العنوان المختار
      addressId: addr._id,
      location,
      status: 'OPEN',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      engineerId: null,
    });

    await this.safeNotify(
      userId,
      NotificationType.SERVICE_REQUEST_OPENED,
      'تم استلام طلب خدمة',
      `تم إنشاء طلب خدمة جديد: ${String(doc._id)}`,
      { requestId: String(doc._id) },
      NotificationNavigationType.SERVICE_REQUEST,
      String(doc._id),
    );

    // إرسال SMS لجميع المهندسين - معطل مؤقتاً للتطوير
    await this.sendSMSToAllEngineers(String(doc._id), dto.title);

    // تحديث استخدام العنوان
    await this.addressesService.markAsUsed(dto.addressId, userId);

    return doc;
  }

  async updateRequest(
    userId: string,
    id: string,
    dto: UpdateServiceRequestDto,
    uploadedFiles?: Array<{ buffer: Buffer; originalname: string; mimetype: string; size: number }>,
  ) {
    // التحقق من ملكية الطلب
    const userObjectId = new Types.ObjectId(userId);
    const requestObjectId = new Types.ObjectId(id);
    const r = await this.requests.findOne({ _id: requestObjectId, userId: userObjectId });
    if (!r) {
      return { error: 'NOT_FOUND' };
    }

    // التحقق من عدم وجود أي عروض على الطلب
    const offersCount = await this.offers.countDocuments({ requestId: r._id });
    if (offersCount > 0) {
      return { error: 'HAS_OFFERS' };
    }

    // التحقق من أن الطلب في حالة تسمح بالتعديل (OPEN فقط)
    if (r.status !== 'OPEN') {
      return { error: 'INVALID_STATUS' };
    }

    const updateData: Record<string, unknown> = {};

    // تحديث العنوان إذا تم تغييره
    if (dto.addressId) {
      const isValid = await this.addressesService.validateAddressOwnership(dto.addressId, userId);
      if (!isValid) {
        return { error: 'ADDRESS_NOT_FOUND' };
      }

      const addr = await this.addressesService.getAddressById(dto.addressId);
      const rawLng = (addr.coords as { lng?: unknown } | undefined)?.lng;
      const rawLat = (addr.coords as { lat?: unknown } | undefined)?.lat;

      const lng = typeof rawLng === 'number' ? rawLng : Number(rawLng);
      const lat = typeof rawLat === 'number' ? rawLat : Number(rawLat);

      const hasValidCoords = Number.isFinite(lng) && Number.isFinite(lat);
      if (!hasValidCoords) {
        this.logger.warn(`Address ${dto.addressId} is missing coordinates; using fallback [0,0].`);
      }

      const location = hasValidCoords
        ? { type: 'Point', coordinates: [lng, lat] as [number, number] }
        : { type: 'Point', coordinates: [0, 0] as [number, number] };

      updateData.addressId = addr._id;
      updateData.city = addr.city;
      updateData.location = location;
    }

    // رفع الصور الجديدة إذا كانت موجودة
    const imageUrls: string[] = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      this.logger.log(
        `Uploading ${uploadedFiles.length} image(s) to Bunny.net for service request update`,
      );
      for (const file of uploadedFiles) {
        try {
          const uploadResult = await this.uploadService.uploadFile(
            {
              buffer: file.buffer,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
            },
            'services/requests',
          );
          imageUrls.push(uploadResult.url);
          this.logger.log(`Successfully uploaded image: ${uploadResult.url}`);
        } catch (error) {
          this.logger.error(`Failed to upload image ${file.originalname}:`, error);
        }
      }
    }

    // دمج الصور المرفوعة مع الصور المرسلة كروابط (إن وجدت)
    if (dto.images !== undefined || (uploadedFiles && uploadedFiles.length > 0)) {
      const newImages = dto.images || [];
      const allNewImages = [...imageUrls, ...newImages];
      updateData.images = allNewImages;
    }

    // تحديث الحقول الأخرى
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.scheduledAt !== undefined) {
      updateData.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    }

    // تطبيق التحديثات
    Object.assign(r, updateData);
    await r.save();

    return r;
  }

  async myRequests(
    userId: string,
    status?: string | string[],
  ): Promise<
    Array<{
      _id: Types.ObjectId;
      userId: Types.ObjectId | string;
      title: string;
      type?: string;
      description?: string;
      images?: string[];
      city: string;
      status: string;
      statusLabel: string;
      scheduledAt?: Date;
      createdAt: Date;
      updatedAt: Date;
      address: {
        label: string | null;
        line1: string | null;
        city: string | null;
      } | null;
      engineer: {
        id: string | null;
        name: string | null;
        phone: string | null;
        whatsapp: string | null;
      } | null;
      acceptedOffer: {
        offerId: string;
        amount: number;
        currency: string;
        note?: string;
      } | null;
      rating?: ServiceRating;
    }>
  > {
    const userObjectId = new Types.ObjectId(userId);

    // بناء query للفلترة حسب الحالة
    // إذا تم تمرير status، نفلتر حسب الحالات المحددة + CANCELLED دائماً
    // إذا لم يتم تمرير status، نرجع جميع الطلبات (بما فيها CANCELLED)
    let statusFilter: string[] | undefined;

    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      // إضافة CANCELLED دائماً إذا لم تكن موجودة
      if (!statuses.includes('CANCELLED')) {
        statusFilter = [...statuses, 'CANCELLED'];
      } else {
        statusFilter = statuses;
      }
    }

    const query: any = { userId: userObjectId };
    if (statusFilter) {
      query.status = { $in: statusFilter };
    }

    const docs = (await this.requests
      .find(query)
      .populate('engineerId', 'firstName lastName phone')
      .populate('addressId', 'label line1 city')
      .sort({ createdAt: -1 })
      .lean()) as ServiceRequestPopulated[];

    return docs.map((doc) => {
      const engineerData = this.extractEngineer(doc.engineerId);
      const engineerPhone: string | null = engineerData?.phone ?? null;
      const engineerName = engineerData
        ? `${engineerData.firstName ?? ''} ${engineerData.lastName ?? ''}`.trim()
        : null;
      const whatsapp = engineerPhone ? this.makeWhatsappLink(engineerPhone) : null;

      const addressData = this.extractAddress(doc.addressId);

      const engineerId: string | null = engineerData
        ? String(engineerData._id)
        : doc.engineerId
          ? String(doc.engineerId)
          : null;

      return {
        _id: doc._id,
        userId: doc.userId,
        title: doc.title,
        type: doc.type,
        description: doc.description,
        images: doc.images,
        city: doc.city,
        status: doc.status,
        statusLabel: this.requestStatusLabel(doc.status),
        scheduledAt: doc.scheduledAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        address: addressData
          ? {
              label: addressData.label ?? null,
              line1: addressData.line1 ?? null,
              city: addressData.city ?? null,
            }
          : null,
        engineer: engineerData
          ? {
              id: engineerId ?? String(engineerData._id),
              name: engineerName,
              phone: engineerPhone,
              whatsapp,
            }
          : null,
        acceptedOffer: doc.acceptedOffer
          ? {
              ...doc.acceptedOffer,
              currency: doc.acceptedOffer.currency || 'YER',
            }
          : null,
        rating: doc.rating,
      };
    });
  }

  async myRequestsWithoutOffers(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const offersCollection = this.offers.collection.name;
    return this.requests
      .aggregate([
        { $match: { userId: userObjectId } },
        {
          $lookup: {
            from: offersCollection,
            localField: '_id',
            foreignField: 'requestId',
            as: 'offers',
          },
        },
        { $addFields: { offersCount: { $size: '$offers' } } },
        { $match: { offersCount: 0 } },
        { $project: { offers: 0, offersCount: 0 } },
        { $sort: { createdAt: -1 } },
      ])
      .exec();
  }

  async myRequestsWithOffersPending(userId: string): Promise<
    Array<{
      _id: Types.ObjectId;
      userId: Types.ObjectId | string;
      title: string;
      type?: string;
      description?: string;
      images?: string[];
      city: string;
      status: string;
      statusLabel: string;
      scheduledAt?: Date;
      createdAt: Date;
      updatedAt: Date;
      address: {
        label: string | null;
        line1: string | null;
        city: string | null;
      } | null;
      offers: OfferListItem[];
    }>
  > {
    const userObjectId = new Types.ObjectId(userId);
    const requests = (await this.requests
      .find({
        userId: userObjectId,
        acceptedOffer: null,
        status: { $in: ['OPEN', 'OFFERS_COLLECTING'] },
      })
      .populate('addressId', 'label line1 city')
      .sort({ createdAt: -1 })
      .lean()) as ServiceRequestPopulated[];

    if (!requests.length) return [];

    const requestIds = requests.map((r) => r._id);
    const offers = (await this.offers
      .find({ requestId: { $in: requestIds }, status: 'OFFERED' })
      .populate('engineerId', 'firstName lastName phone')
      .sort({ createdAt: 1 })
      .lean()) as EngineerOfferPopulated[];

    // جلب jobTitle من EngineerProfile لجميع المهندسين
    const engineerIds: Types.ObjectId[] = [];
    for (const offer of offers) {
      const id = extractEngineerId(offer.engineerId);
      if (id) {
        engineerIds.push(id);
      }
    }

    const profiles = await this.engineerProfileModel
      .find({ userId: { $in: engineerIds } })
      .select('userId jobTitle')
      .lean();

    const profilesMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    const offersByRequest = new Map<string, OfferListItem[]>();

    for (const offer of offers) {
      const key = String(offer.requestId);
      const engineerData = this.extractEngineer(offer.engineerId);
      const engineerId = engineerData?._id?.toString();
      const profile = engineerId ? profilesMap.get(engineerId) : null;
      const engineerPhone: string | null = engineerData?.phone ?? null;
      const engineerName = engineerData
        ? `${engineerData.firstName ?? ''} ${engineerData.lastName ?? ''}`.trim()
        : null;
      const whatsapp = engineerPhone ? this.makeWhatsappLink(engineerPhone) : null;

      const formattedOffer: OfferListItem = {
        _id: offer._id,
        requestId: String(offer.requestId),
        amount: offer.amount,
        currency: offer.currency || 'YER',
        note: offer.note ?? null,
        status: offer.status,
        statusLabel: this.offerStatusLabel(offer.status),
        createdAt: offer.createdAt,
        engineer: engineerData
          ? {
              id: String(engineerData._id),
              name: engineerName,
              jobTitle: profile?.jobTitle ?? null,
              phone: engineerPhone,
              whatsapp,
            }
          : null,
      };

      if (!offersByRequest.has(key)) {
        offersByRequest.set(key, []);
      }
      offersByRequest.get(key)!.push(formattedOffer);
    }

    return requests
      .map((req) => {
        const addressData = this.extractAddress(req.addressId);

        return {
          _id: req._id,
          userId: req.userId,
          title: req.title,
          type: req.type,
          description: req.description,
          images: req.images,
          city: req.city,
          status: req.status,
          statusLabel: this.requestStatusLabel(req.status),
          scheduledAt: req.scheduledAt,
          createdAt: req.createdAt,
          updatedAt: req.updatedAt,
          address: addressData
            ? {
                label: addressData.label ?? null,
                line1: addressData.line1 ?? null,
                city: addressData.city ?? null,
              }
            : null,
          offers: offersByRequest.get(String(req._id)) ?? [],
        };
      })
      .filter((item) => item.offers.length > 0);
  }

  async myRequestsWithAcceptedOffers(
    userId: string,
    status?: string | string[],
  ): Promise<
    Array<{
      _id: Types.ObjectId;
      userId: Types.ObjectId | string;
      title: string;
      type?: string;
      description?: string;
      images?: string[];
      city: string;
      status: string;
      statusLabel: string;
      scheduledAt?: Date;
      createdAt: Date;
      updatedAt: Date;
      address: {
        label: string | null;
        line1: string | null;
        city: string | null;
      } | null;
      engineer: {
        id: string | null;
        name: string | null;
        phone: string | null;
        whatsapp: string | null;
      } | null;
      acceptedOffer: {
        offerId: string;
        amount: number;
        currency: string;
        note?: string;
      } | null;
    }>
  > {
    const userObjectId = new Types.ObjectId(userId);
    const statuses = Array.isArray(status)
      ? status
      : status
        ? [status]
        : ['ASSIGNED', 'COMPLETED', 'RATED'];

    const docs = (await this.requests
      .find({
        userId: userObjectId,
        acceptedOffer: { $ne: null },
        status: { $in: statuses },
      })
      .populate('engineerId', 'firstName lastName phone')
      .populate('addressId', 'label line1 city')
      .sort({ createdAt: -1 })
      .lean()) as ServiceRequestPopulated[];

    return docs.map((doc) => {
      const engineerData = this.extractEngineer(doc.engineerId);
      const engineerPhone: string | null = engineerData?.phone ?? null;
      const engineerName = engineerData
        ? `${engineerData.firstName ?? ''} ${engineerData.lastName ?? ''}`.trim()
        : null;
      const whatsapp = engineerPhone ? this.makeWhatsappLink(engineerPhone) : null;

      const addressData = this.extractAddress(doc.addressId);

      const engineerId: string | null = engineerData
        ? String(engineerData._id)
        : doc.engineerId
          ? String(doc.engineerId)
          : null;

      return {
        _id: doc._id,
        userId: doc.userId,
        title: doc.title,
        type: doc.type,
        description: doc.description,
        images: doc.images,
        city: doc.city,
        status: doc.status,
        statusLabel: this.requestStatusLabel(doc.status),
        scheduledAt: doc.scheduledAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        address: addressData
          ? {
              label: addressData.label ?? null,
              line1: addressData.line1 ?? null,
              city: addressData.city ?? null,
            }
          : null,
        engineer: engineerData
          ? {
              id: engineerId ?? String(engineerData._id),
              name: engineerName,
              phone: engineerPhone,
              whatsapp,
            }
          : null,
        acceptedOffer: doc.acceptedOffer
          ? {
              ...doc.acceptedOffer,
              currency: doc.acceptedOffer.currency || 'YER',
            }
          : null,
      };
    });
  }

  async getRequest(userId: string, id: string) {
    const userObjectId = new Types.ObjectId(userId);
    const requestObjectId = new Types.ObjectId(id);
    return this.requests.findOne({ _id: requestObjectId, userId: userObjectId }).lean();
  }

  async cancel(userId: string, id: string, reason: string) {
    const userObjectId = new Types.ObjectId(userId);
    const requestObjectId = new Types.ObjectId(id);
    const r = await this.requests.findOne({ _id: requestObjectId, userId: userObjectId });
    if (!r) return { error: 'NOT_FOUND' };

    // التحقق من أن السبب مطلوب
    if (!reason || reason.trim().length === 0) {
      return { error: 'REASON_REQUIRED' };
    }

    // السماح بالإلغاء فقط من حالة ASSIGNED (بعد قبول عرض)
    if (r.status !== 'ASSIGNED') {
      return { error: 'CANNOT_CANCEL', message: 'يمكن إلغاء الطلب فقط بعد قبول عرض من مهندس' };
    }

    // التحقق من عدد الإلغاءات (حد أقصى 3)
    const cancellationCount = await this.requests.countDocuments({
      userId: userObjectId,
      status: 'CANCELLED',
      cancelledAt: { $exists: true },
    });

    if (cancellationCount >= 3) {
      return {
        error: 'CANCELLATION_LIMIT_REACHED',
        message:
          'لقد وصلت إلى الحد الأقصى المسموح به من الإلغاءات (3). يرجى الانتظار حتى يتم التعامل مع الخدمات الحالية.',
      };
    }

    // تحديث حالة الطلب
    r.status = 'CANCELLED';
    r.cancellationReason = reason.trim();
    r.cancelledAt = new Date();
    await r.save();

    // تحديث حالة العروض المرتبطة
    await this.offers.updateMany(
      { requestId: r._id, status: { $in: ['OFFERED', 'ACCEPTED'] } },
      { $set: { status: 'CANCELLED' } },
    );

    // إرسال إشعار للمهندس المقبول عرضه
    if (r.engineerId) {
      await this.safeNotify(
        String(r.engineerId),
        NotificationType.SERVICE_REQUEST_CANCELLED,
        'تم إلغاء طلب الخدمة',
        `تم إلغاء الطلب ${String(r._id)} من قبل العميل. السبب: ${reason.trim()}`,
        { requestId: String(r._id), reason: reason.trim() },
        NotificationNavigationType.SERVICE_REQUEST,
        String(r._id),
      );
    }

    await this.safeNotify(
      userId,
      NotificationType.SERVICE_REQUEST_CANCELLED,
      'تم إلغاء طلب الخدمة',
      `تم إلغاء الطلب ${String(r._id)}`,
      { requestId: String(r._id), reason: reason.trim() },
      NotificationNavigationType.SERVICE_REQUEST,
      String(r._id),
    );

    return { ok: true };
  }

  async deleteRequest(userId: string, id: string) {
    const userObjectId = new Types.ObjectId(userId);
    const requestObjectId = new Types.ObjectId(id);
    const r = await this.requests.findOne({ _id: requestObjectId, userId: userObjectId });
    if (!r) return { error: 'NOT_FOUND' };

    // يمكن حذف الطلب فقط إذا كان في حالة OPEN أو CANCELLED
    // (لم يتم قبول أي عروض أو تم إلغاؤه)
    if (!['OPEN', 'CANCELLED'].includes(r.status)) {
      return {
        error: 'CANNOT_DELETE',
        message: 'لا يمكن حذف الطلب في حالته الحالية. يمكن حذف الطلبات المفتوحة أو الملغاة فقط.',
      };
    }

    // حذف جميع العروض المرتبطة بالطلب
    await this.offers.deleteMany({ requestId: r._id });

    // حذف الصور من Bunny.net إذا كانت موجودة
    if (r.images && r.images.length > 0) {
      try {
        for (const imageUrl of r.images) {
          try {
            // استخراج مسار الملف من URL
            // URL format: https://cdn.example.com/services/requests/uuid-filename.jpg
            // أو: https://storage.bunnycdn.com/zone/services/requests/uuid-filename.jpg
            // نحتاج: services/requests/uuid-filename.jpg

            const urlObj = new URL(imageUrl);
            let filePath = urlObj.pathname;

            // إزالة الـ leading slash
            if (filePath.startsWith('/')) {
              filePath = filePath.substring(1);
            }

            // البحث عن مجلد services/requests في المسار
            // إذا كان موجوداً، نأخذ كل شيء بعد storage zone name (إن وجد)
            // أو نأخذ المسار مباشرة إذا كان يبدأ بـ services/
            const servicesIndex = filePath.indexOf('services/');
            if (servicesIndex !== -1) {
              // نأخذ المسار من services/ فصاعداً
              filePath = filePath.substring(servicesIndex);
            } else {
              // إذا لم نجد services/، نحاول استخراج اسم الملف فقط
              // ونضيف المجلد الافتراضي
              const fileName = filePath.split('/').pop();
              if (fileName) {
                filePath = `services/requests/${fileName}`;
              } else {
                continue; // نتخطى هذه الصورة
              }
            }

            if (filePath) {
              await this.uploadService.deleteFile(filePath).catch((err) => {
                this.logger.warn(`Failed to delete image ${filePath}: ${err.message}`);
              });
            }
          } catch (urlError) {
            // إذا فشل تحليل URL، نتجاهل هذه الصورة
            this.logger.warn(`Failed to parse image URL ${imageUrl}: ${urlError}`);
          }
        }
      } catch (error) {
        this.logger.warn(`Error deleting images for request ${id}: ${error}`);
        // نستمر في الحذف حتى لو فشل حذف الصور
      }
    }

    // حذف الطلب
    await this.requests.deleteOne({ _id: r._id });

    return { ok: true };
  }

  async acceptOffer(userId: string, id: string, offerId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const requestObjectId = new Types.ObjectId(id);
    const r = await this.requests.findOne({ _id: requestObjectId, userId: userObjectId });
    if (!r) return { error: 'NOT_FOUND' };
    if (!['OPEN', 'OFFERS_COLLECTING'].includes(r.status)) return { error: 'INVALID_STATUS' };

    const offerObjectId = new Types.ObjectId(offerId);
    const offer = await this.offers.findOne({
      _id: offerObjectId,
      requestId: r._id,
      status: 'OFFERED',
    });
    if (!offer) return { error: 'OFFER_NOT_FOUND' };

    r.status = 'ASSIGNED';
    r.engineerId = offer.engineerId;
    r.acceptedOffer = {
      offerId: String(offer._id),
      amount: offer.amount,
      currency: offer.currency || 'YER',
      note: offer.note,
    };
    await r.save();

    offer.status = 'ACCEPTED';
    await offer.save();

    // تحديث حالة العروض الأخرى إلى OUTBID (تم قبول عرض آخر)
    const otherOffers = await this.offers.find({
      requestId: r._id,
      _id: { $ne: offer._id },
      status: 'OFFERED',
    });

    if (otherOffers.length > 0) {
      await this.offers.updateMany(
        { requestId: r._id, _id: { $ne: offer._id }, status: 'OFFERED' },
        { $set: { status: 'OUTBID' } },
      );

      // إرسال إشعارات للمهندسين الذين تم رفض عروضهم بسبب قبول عرض آخر
      for (const otherOffer of otherOffers) {
        await this.safeNotify(
          String(otherOffer.engineerId),
          NotificationType.OFFER_REJECTED,
          'تم قبول عرض آخر',
          `تم قبول عرض آخر للطلب ${String(r._id)}. تم إيقاف عرضك.`,
          { requestId: String(r._id), offerId: String(otherOffer._id) },
          NotificationNavigationType.SERVICE_REQUEST,
          String(r._id),
        );
      }
    }

    await this.safeNotify(
      String(offer.engineerId),
      NotificationType.OFFER_ACCEPTED,
      'تم قبول عرضك',
      `تم قبول عرضك للطلب ${String(r._id)}`,
      { requestId: String(r._id) },
      NotificationNavigationType.SERVICE_REQUEST,
      String(r._id),
    );
    return { ok: true };
  }

  async rate(userId: string, id: string, score: number, comment?: string) {
    const userObjectId = new Types.ObjectId(userId);
    const requestObjectId = new Types.ObjectId(id);
    const r = await this.requests.findOne({ _id: requestObjectId, userId: userObjectId });
    if (!r) return { error: 'NOT_FOUND' };
    if (r.status !== 'COMPLETED') return { error: 'NOT_COMPLETED' };

    // التحقق من وجود تعليق (مطلوب)
    if (!comment || comment.trim().length === 0) {
      return { error: 'COMMENT_REQUIRED' };
    }

    r.rating = { score, comment: comment.trim(), at: new Date() };
    r.status = 'RATED';
    await r.save();

    // إضافة التقييم إلى بروفايل المهندس تلقائياً
    if (r.engineerId && this.engineerProfileService) {
      try {
        await this.engineerProfileService.addRatingFromServiceRequest(
          r.engineerId.toString(),
          r._id.toString(),
          userId,
          score,
          comment.trim(),
        );
      } catch (error) {
        this.logger.warn(`Failed to add rating to engineer profile: ${error}`);
        // لا نوقف العملية إذا فشل تحديث البروفايل
      }
    }

    await this.safeNotify(
      userId,
      NotificationType.SERVICE_RATED,
      'تم تقييم الخدمة',
      `تم تقييم الخدمة بنتيجة ${score} نجوم`,
      { requestId: String(r._id), score },
      NotificationNavigationType.SERVICE_REQUEST,
      String(r._id),
    );
    return { ok: true };
  }

  // جلب العروض لطلب معين (للعميل)
  async getOffersForRequest(
    userId: string,
    requestId: string,
    status?: string | string[],
  ): Promise<
    | { error: string }
    | Array<{
        _id: Types.ObjectId;
        requestId: string | Types.ObjectId;
        amount: number;
        currency: string;
        note?: string | null;
        distanceKm?: number;
        status: string;
        statusLabel: string;
        createdAt: Date;
        updatedAt: Date;
        engineerId?:
          | {
              _id: Types.ObjectId;
              firstName?: string;
              lastName?: string;
              phone?: string;
              jobTitle?: string | null;
            }
          | Types.ObjectId
          | null;
      }>
  > {
    const userObjectId = new Types.ObjectId(userId);
    const requestObjectId = new Types.ObjectId(requestId);
    const r = await this.requests.findOne({ _id: requestObjectId, userId: userObjectId });
    if (!r) return { error: 'REQUEST_NOT_FOUND' };

    // بناء فلتر الحالة
    const query: { requestId: Types.ObjectId; status?: { $in: string[] } } = {
      requestId: r._id,
    };

    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      if (statuses.length > 0) {
        query.status = { $in: statuses };
      }
    }

    const offers = (await this.offers
      .find(query)
      .populate('engineerId', 'firstName lastName phone')
      .sort({ distanceKm: 1, amount: 1 }) // أقرب ثم أرخص
      .lean()) as EngineerOfferPopulated[];

    // جلب jobTitle من EngineerProfile
    const engineerIds: Types.ObjectId[] = [];
    for (const offer of offers) {
      const id = extractEngineerId(offer.engineerId);
      if (id) {
        engineerIds.push(id);
      }
    }

    const jobTitlesMap = await this.getEngineersJobTitles(engineerIds);

    // إضافة jobTitle و statusLabel للعروض
    return offers.map((offer) => {
      const id = extractEngineerId(offer.engineerId);
      const engineerId = id ? id.toString() : null;

      if (engineerId && jobTitlesMap.has(engineerId) && isPopulatedEngineer(offer.engineerId)) {
        offer.engineerId.jobTitle = jobTitlesMap.get(engineerId) ?? null;
      }

      return {
        ...offer,
        statusLabel: this.offerStatusLabel(offer.status),
      };
    });
  }

  async getOfferDetails(userId: string, requestId: string, offerId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const requestObjectId = new Types.ObjectId(requestId);
    const request = await this.requests
      .findOne({ _id: requestObjectId, userId: userObjectId })
      .populate('addressId', 'label line1 city')
      .lean<ServiceRequestPopulated | null>();
    if (!request) return { error: 'REQUEST_NOT_FOUND' };

    const offerObjectId = new Types.ObjectId(offerId);
    const offer = await this.offers
      .findOne({ _id: offerObjectId, requestId: request._id })
      .populate('engineerId', 'firstName lastName phone city')
      .lean<EngineerOfferPopulated | null>();
    if (!offer) return { error: 'OFFER_NOT_FOUND' };

    const engineerData = this.extractEngineer(offer.engineerId);
    const engineerPhone: string | null = engineerData?.phone ?? null;
    const engineerName = engineerData
      ? `${engineerData.firstName ?? ''} ${engineerData.lastName ?? ''}`.trim()
      : null;
    const whatsapp = engineerPhone ? this.makeWhatsappLink(engineerPhone) : null;

    // جلب jobTitle من EngineerProfile
    let jobTitle: string | null = null;
    if (engineerData?._id) {
      const profile = await this.engineerProfileModel
        .findOne({ userId: engineerData._id })
        .select('jobTitle')
        .lean();
      jobTitle = profile?.jobTitle ?? null;
    }

    const addressData = this.extractAddress(request.addressId);

    const formattedOffer: OfferListItem = {
      _id: offer._id,
      requestId: String(offer.requestId),
      amount: offer.amount,
      currency: offer.currency || 'YER',
      note: offer.note ?? null,
      status: offer.status,
      statusLabel: this.offerStatusLabel(offer.status),
      createdAt: offer.createdAt,
      engineer: engineerData
        ? {
            id: String(engineerData._id),
            name: engineerName,
            jobTitle,
            phone: engineerPhone,
            whatsapp,
          }
        : null,
    };

    return {
      offer: formattedOffer,
      request: {
        _id: request._id,
        title: request.title,
        type: request.type ?? null,
        description: request.description ?? null,
        images: request.images ?? [],
        status: request.status,
        statusLabel: this.requestStatusLabel(request.status),
        scheduledAt: request.scheduledAt ?? null,
        createdAt: request.createdAt,
        city: request.city,
        address: addressData
          ? {
              label: addressData.label ?? null,
              line1: addressData.line1 ?? null,
              city: addressData.city ?? null,
            }
          : null,
      },
    };
  }

  // ---- Engineer flows
  async nearby(
    engineerUserId: string,
    lat: number,
    lng: number,
    radiusKm: number,
    status?: string | string[],
  ) {
    const meters = radiusKm * 1000;

    // جلب مدينة المهندس
    const engineer = await this.userModel.findById(engineerUserId).select('city').lean();
    const engineerCity = engineer?.city || 'صنعاء'; // القيمة الافتراضية صنعاء

    this.logger.log(
      `Engineer ${engineerUserId} from city: ${engineerCity} searching for nearby requests`,
    );

    // بناء فلتر الحالة
    // بدون فلترة: السلوك الافتراضي (OPEN, OFFERS_COLLECTING)
    // مع فلترة: تطبيق الفلترة على الحالات المحددة
    let statusFilter: string[] = ['OPEN', 'OFFERS_COLLECTING'];
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      if (statuses.length > 0) {
        statusFilter = statuses;
      }
    }

    const query: any = {
      city: engineerCity, // فقط الطلبات من نفس المدينة
      userId: { $ne: new Types.ObjectId(engineerUserId) }, // منع المهندس من رؤية طلباته الخاصة
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: meters,
        },
      },
    };

    // إذا كانت الفلترة تشمل فقط OPEN و OFFERS_COLLECTING، نضيف شرط engineerId: null
    // إذا كانت الفلترة تشمل ASSIGNED أو COMPLETED أو RATED فقط، نضيف شرط engineerId: engineerUserId
    // إذا كانت الفلترة تشمل كلا النوعين، نستخدم $or للجمع بين الحالتين
    const hasAvailableStatuses = statusFilter.some((s) =>
      ['OPEN', 'OFFERS_COLLECTING'].includes(s),
    );
    const hasAssignedStatuses = statusFilter.some((s) =>
      ['ASSIGNED', 'COMPLETED', 'RATED'].includes(s),
    );

    if (hasAvailableStatuses && !hasAssignedStatuses) {
      // فقط حالات متاحة
      query.status = { $in: statusFilter };
      query.engineerId = null;
    } else if (hasAssignedStatuses && !hasAvailableStatuses) {
      // فقط حالات مخصصة
      query.status = { $in: statusFilter };
      query.engineerId = new Types.ObjectId(engineerUserId);
    } else if (hasAvailableStatuses && hasAssignedStatuses) {
      // كلا النوعين - نستخدم $or
      query.$or = [
        {
          engineerId: null,
          status: { $in: statusFilter.filter((s) => ['OPEN', 'OFFERS_COLLECTING'].includes(s)) },
        },
        {
          engineerId: new Types.ObjectId(engineerUserId),
          status: {
            $in: statusFilter.filter((s) => ['ASSIGNED', 'COMPLETED', 'RATED'].includes(s)),
          },
        },
      ];
    } else {
      // حالات أخرى (مثل CANCELLED)
      query.status = { $in: statusFilter };
    }

    const list = await this.requests.find(query).limit(100).lean();

    this.logger.log(`Found ${list.length} nearby requests in city ${engineerCity}`);
    return list;
  }

  async listRequestsInEngineerCity(engineerUserId: string, status?: string | string[]) {
    const engineer = await this.userModel.findById(engineerUserId).select('city').lean();
    const engineerCity = engineer?.city || 'صنعاء';

    // بناء فلتر الحالة
    // بدون فلترة: السلوك الافتراضي (OPEN, OFFERS_COLLECTING)
    // مع فلترة: تطبيق الفلترة على الحالات المحددة
    let statusFilter: string[] = ['OPEN', 'OFFERS_COLLECTING'];
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      if (statuses.length > 0) {
        statusFilter = statuses;
      }
    }

    const query: any = {
      status: { $in: statusFilter },
      city: engineerCity,
    };

    // إذا كانت الفلترة تشمل فقط OPEN و OFFERS_COLLECTING، نضيف شرط engineerId: null
    // إذا كانت الفلترة تشمل ASSIGNED أو COMPLETED أو RATED فقط، نضيف شرط engineerId: engineerUserId
    // إذا كانت الفلترة تشمل كلا النوعين، نستخدم $or للجمع بين الحالتين
    const hasAvailableStatuses = statusFilter.some((s) =>
      ['OPEN', 'OFFERS_COLLECTING'].includes(s),
    );
    const hasAssignedStatuses = statusFilter.some((s) =>
      ['ASSIGNED', 'COMPLETED', 'RATED'].includes(s),
    );

    if (hasAvailableStatuses && !hasAssignedStatuses) {
      // فقط حالات متاحة
      query.engineerId = null;
    } else if (hasAssignedStatuses && !hasAvailableStatuses) {
      // فقط حالات مخصصة
      query.engineerId = new Types.ObjectId(engineerUserId);
    } else if (hasAvailableStatuses && hasAssignedStatuses) {
      // كلا النوعين - نستخدم $or
      query.$or = [
        {
          engineerId: null,
          status: { $in: statusFilter.filter((s) => ['OPEN', 'OFFERS_COLLECTING'].includes(s)) },
        },
        {
          engineerId: new Types.ObjectId(engineerUserId),
          status: {
            $in: statusFilter.filter((s) => ['ASSIGNED', 'COMPLETED', 'RATED'].includes(s)),
          },
        },
      ];
      // نزيل status من query الرئيسي لأننا استخدمناها في $or
      delete query.status;
    }

    return this.requests.find(query).sort({ createdAt: -1 }).lean();
  }

  async listAllAvailableRequests(status?: string | string[]) {
    // بناء فلتر الحالة
    // بدون فلترة: السلوك الافتراضي (OPEN, OFFERS_COLLECTING)
    // مع فلترة: تطبيق الفلترة على الحالات المحددة
    let statusFilter: string[] = ['OPEN', 'OFFERS_COLLECTING'];
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      if (statuses.length > 0) {
        statusFilter = statuses;
      }
    }

    const query: any = {
      status: { $in: statusFilter },
    };

    // إذا كانت الفلترة تشمل فقط OPEN و OFFERS_COLLECTING، نضيف شرط engineerId: null
    // إذا كانت الفلترة تشمل ASSIGNED أو COMPLETED أو RATED، نضيف شرط engineerId: engineerUserId
    // لكن في listAllAvailableRequests، لا نعرف engineerUserId، لذا نزيل شرط engineerId فقط إذا كانت الفلترة تشمل حالات متاحة
    const hasOnlyAvailableStatuses =
      statusFilter.length === 2 &&
      statusFilter.includes('OPEN') &&
      statusFilter.includes('OFFERS_COLLECTING');

    if (hasOnlyAvailableStatuses) {
      query.engineerId = null;
    }
    // إذا كانت الفلترة تشمل حالات أخرى، لا نضيف شرط engineerId للسماح برؤية جميع الطلبات

    return this.requests.find(query).sort({ createdAt: -1 }).lean();
  }

  // Helper: حساب المسافة بين نقطتين (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    return this.distanceService.calculateDistance(lat1, lng1, lat2, lng2);
  }

  private makeWhatsappLink(phone: string): string | null {
    const digitsOnly = phone.replace(/\D+/g, '');
    if (!digitsOnly) return null;

    let normalized = digitsOnly;
    if (normalized.startsWith('00')) normalized = normalized.slice(2);
    if (normalized.startsWith('0')) normalized = normalized.slice(1);
    if (!normalized.startsWith('967')) normalized = `967${normalized}`;

    return `https://wa.me/${normalized}`;
  }

  private requestStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      OPEN: 'بانتظار العروض',
      OFFERS_COLLECTING: 'تجميع العروض',
      ASSIGNED: 'تم قبول العرض',
      COMPLETED: 'اكتملت الخدمة',
      RATED: 'تم التقييم',
      CANCELLED: 'ملغى',
    };
    return labels[status] ?? status;
  }

  private offerStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      OFFERED: 'عرض مقدم',
      ACCEPTED: 'عرض مقبول',
      REJECTED: 'عرض مرفوض',
      CANCELLED: 'عرض ملغى',
      OUTBID: 'تم قبول عرض آخر',
      EXPIRED: 'عرض منتهي الصلاحية',
    };
    return labels[status] ?? status;
  }

  private extractEngineer(
    engineer: PopulatedEngineer | Types.ObjectId | null | undefined,
  ): PopulatedEngineer | null {
    if (!engineer) return null;
    return engineer instanceof Types.ObjectId ? null : engineer;
  }

  /**
   * جلب jobTitle من EngineerProfile لجميع المهندسين دفعة واحدة
   */
  private async getEngineersJobTitles(
    engineerIds: Types.ObjectId[],
  ): Promise<Map<string, string | null>> {
    if (engineerIds.length === 0) return new Map();

    const profiles = await this.engineerProfileModel
      .find({ userId: { $in: engineerIds } })
      .select('userId jobTitle')
      .lean();

    return new Map(profiles.map((p) => [p.userId.toString(), p.jobTitle ?? null]));
  }

  private extractAddress(
    address: PopulatedAddress | Types.ObjectId | null | undefined,
  ): PopulatedAddress | null {
    if (!address) return null;
    return address instanceof Types.ObjectId ? null : address;
  }

  private extractCustomer(
    customer: PopulatedCustomer | Types.ObjectId | null | undefined,
  ): PopulatedCustomer | null {
    if (!customer) return null;
    return customer instanceof Types.ObjectId ? null : customer;
  }

  async offer(engineerUserId: string, dto: CreateOfferDto) {
    const r = await this.requests.findById(dto.requestId);
    if (!r) return { error: 'REQUEST_NOT_FOUND' };
    if (String(r.userId) === String(engineerUserId)) return { error: 'SELF_NOT_ALLOWED' };
    if (!['OPEN', 'OFFERS_COLLECTING'].includes(r.status)) return { error: 'INVALID_STATUS' };

    // التحقق من حالة التحقق للمهندس
    const engineer = await this.userModel.findById(engineerUserId);
    if (!engineer) return { error: 'ENGINEER_NOT_FOUND' };

    // التحقق من صلاحية المهندس
    if (!engineer.engineer_capable) {
      return {
        error: 'NOT_ENGINEER',
        message: 'يجب تفعيل صلاحية المهندس أولاً',
      };
    }

    // التحقق من حالة التحقق
    if (engineer.engineer_status !== CapabilityStatus.APPROVED) {
      switch (engineer.engineer_status) {
        case CapabilityStatus.UNVERIFIED:
          return {
            error: 'ENGINEER_UNVERIFIED',
            message: 'حسابك غير موثق. يرجى رفع وثائق التحقق أولاً',
          };
        case CapabilityStatus.PENDING:
          return {
            error: 'ENGINEER_PENDING',
            message: 'طلب التحقق قيد المراجعة. يرجى الانتظار حتى يتم الموافقة على حسابك',
          };
        case CapabilityStatus.REJECTED:
          return {
            error: 'ENGINEER_REJECTED',
            message: 'تم رفض طلب التحقق الخاص بك. يرجى التواصل مع الدعم',
          };
        default:
          return {
            error: 'ENGINEER_NOT_APPROVED',
            message: 'يجب تفعيل صلاحية المهندس أولاً',
          };
      }
    }

    // التحقق من وجود عرض سابق للمهندس على نفس الطلب
    const existingOffer = await this.offers.findOne({
      requestId: r._id,
      engineerId: new Types.ObjectId(engineerUserId),
    });

    if (existingOffer) {
      return {
        error: 'OFFER_ALREADY_EXISTS',
        message:
          'لا يمكنك تقديم أكثر من عرض واحد لنفس الطلب. يمكنك تعديل عرضك الموجود بدلاً من ذلك.',
      };
    }

    // حساب المسافة بين المهندس والطلب
    const [requestLng, requestLat] = r.location.coordinates;
    const distanceKm = this.calculateDistance(dto.lat, dto.lng, requestLat, requestLng);

    // If first offer → move to OFFERS_COLLECTING
    if (r.status === 'OPEN') {
      r.status = 'OFFERS_COLLECTING';
      await r.save();
    }

    // إنشاء عرض جديد
    const doc = await this.offers.create({
      requestId: r._id,
      engineerId: new Types.ObjectId(engineerUserId),
      amount: dto.amount,
      currency: dto.currency,
      note: dto.note,
      distanceKm: Math.round(distanceKm * 100) / 100,
      status: 'OFFERED',
      updatesCount: 0,
    });

    await this.safeNotify(
      String(r.userId),
      NotificationType.NEW_ENGINEER_OFFER,
      'عرض جديد من مهندس',
      `تم تقديم عرض جديد للطلب ${String(r._id)}`,
      { requestId: String(r._id) },
      NotificationNavigationType.SERVICE_REQUEST,
      String(r._id),
    );
    return doc;
  }

  async updateOffer(engineerUserId: string, id: string, patch: UpdateOfferDto) {
    const off = await this.offers.findOne({
      _id: id,
      engineerId: new Types.ObjectId(engineerUserId),
    });
    if (!off) return { error: 'NOT_FOUND' };
    if (off.status !== 'OFFERED') return { error: 'CANNOT_UPDATE' };
    if ((off.updatesCount || 0) >= 1) return { error: 'UPDATE_LIMIT_REACHED' };
    if (patch.amount !== undefined) off.amount = patch.amount;
    if (patch.currency !== undefined) off.currency = patch.currency;
    if (patch.note !== undefined) off.note = patch.note;
    off.updatesCount = (off.updatesCount || 0) + 1;
    await off.save();
    return off;
  }

  async deleteOffer(engineerUserId: string, id: string) {
    const off = await this.offers.findOne({
      _id: id,
      engineerId: new Types.ObjectId(engineerUserId),
    });
    if (!off) return { error: 'NOT_FOUND' };
    if (off.status !== 'OFFERED') return { error: 'CANNOT_DELETE' };

    await this.offers.deleteOne({ _id: off._id });

    const stillAvailable = await this.offers.exists({
      requestId: off.requestId,
      status: 'OFFERED',
    });
    if (!stillAvailable) {
      const req = await this.requests.findById(off.requestId);
      if (req && req.status === 'OFFERS_COLLECTING') {
        req.status = 'OPEN';
        await req.save();
      }
    }

    return { ok: true };
  }

  async start() {
    // تم إزالة هذه الطريقة لأننا لا نحتاج حالة IN_PROGRESS
    // يمكن للمهندس الانتقال مباشرة من ASSIGNED إلى COMPLETED
    return {
      error: 'DEPRECATED',
      message: 'تم إزالة هذه الطريقة. يمكن إكمال الخدمة مباشرة من حالة ASSIGNED',
    };
  }

  async complete(customerUserId: string, requestId: string) {
    const r = await this.requests.findById(requestId);
    if (!r) return { error: 'NOT_FOUND' };
    // التحقق من أن المستخدم هو العميل (صاحب الطلب)
    if (String(r.userId) !== String(customerUserId)) return { error: 'NOT_OWNER' };
    if (r.status !== 'ASSIGNED') return { error: 'INVALID_STATUS' };
    r.status = 'COMPLETED';
    await r.save();
    // إرسال إشعار للمهندس بأن العميل أكد إكمال الخدمة
    if (r.engineerId) {
      await this.safeNotify(
        String(r.engineerId),
        NotificationType.SERVICE_COMPLETED,
        'تم تأكيد إنجاز الخدمة',
        `تم تأكيد إنجاز الخدمة للطلب ${String(r._id)} من قبل العميل`,
        { requestId: String(r._id) },
        NotificationNavigationType.SERVICE_REQUEST,
        String(r._id),
      );
    }
    return { ok: true };
  }

  // جلب عروض المهندس
  async myOffers(engineerUserId: string, status?: string | string[]) {
    const query: any = {
      engineerId: new Types.ObjectId(engineerUserId),
    };

    // بناء فلتر الحالة
    // بدون فلترة: جميع العروض
    // مع فلترة: تطبيق الفلترة على الحالات المحددة
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      if (statuses.length > 0) {
        query.status = { $in: statuses };
      }
    }

    return this.offers.find(query).populate('requestId').sort({ createdAt: -1 }).lean();
  }

  // جلب تفاصيل الطلب للمهندس
  async getRequestForEngineer(engineerUserId: string, requestId: string) {
    const request = await this.requests
      .findById(requestId)
      .populate('userId', 'firstName lastName phone')
      .populate('addressId', 'label line1 city coords')
      .lean<ServiceRequestPopulated | null>();

    if (!request) {
      return { error: 'REQUEST_NOT_FOUND' };
    }

    // جلب عرض المهندس إن وجد
    const engineerOffer = await this.offers
      .findOne({
        requestId: request._id,
        engineerId: new Types.ObjectId(engineerUserId),
      })
      .lean<EngineerOfferLean | null>();

    const addressData = this.extractAddress(request.addressId);
    const customerData = this.extractCustomer(request.userId);

    return {
      _id: request._id,
      title: request.title,
      type: request.type ?? null,
      description: request.description ?? null,
      images: request.images ?? [],
      city: request.city,
      status: request.status,
      statusLabel: this.requestStatusLabel(request.status),
      scheduledAt: request.scheduledAt ?? null,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      location: request.location,
      address: addressData
        ? {
            label: addressData.label ?? null,
            line1: addressData.line1 ?? null,
            city: addressData.city ?? null,
            coords: addressData.coords ?? null,
          }
        : null,
      customer: customerData
        ? {
            id: String(customerData._id),
            name:
              customerData.firstName && customerData.lastName
                ? `${customerData.firstName} ${customerData.lastName}`.trim()
                : null,
            phone: customerData.phone ?? null,
            whatsapp: customerData.phone ? this.makeWhatsappLink(customerData.phone) : null,
          }
        : null,
      engineerId: request.engineerId ? String(request.engineerId) : null,
      acceptedOffer: request.acceptedOffer ?? null,
      rating: request.rating ?? null,
      distanceKm: engineerOffer?.distanceKm ?? null,
      myOffer: engineerOffer
        ? {
            _id: engineerOffer._id,
            amount: engineerOffer.amount,
            currency: engineerOffer.currency || 'YER',
            note: engineerOffer.note ?? null,
            status: engineerOffer.status,
            statusLabel: this.offerStatusLabel(engineerOffer.status),
            distanceKm: engineerOffer.distanceKm ?? null,
            createdAt: engineerOffer.createdAt,
          }
        : null,
    };
  }

  // ---- Admin - إدارة متقدمة
  async adminList(params: {
    status?: string;
    type?: string;
    engineerId?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      status,
      type,
      engineerId,
      userId,
      dateFrom,
      dateTo,
      search,
      page = 1,
      limit = 20,
    } = params;
    const q: Record<string, unknown> = {};

    if (status) q.status = status;
    if (type) q.type = { $regex: type, $options: 'i' };
    if (engineerId) q.engineerId = new Types.ObjectId(engineerId);
    if (userId) q.userId = new Types.ObjectId(userId);
    if (dateFrom || dateTo) {
      q.createdAt = {} as Record<string, Date>;
      if (dateFrom) (q.createdAt as Record<string, Date>).$gte = dateFrom;
      if (dateTo) (q.createdAt as Record<string, Date>).$lte = dateTo;
    }
    if (search) {
      q.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.requests
        .find(q)
        .populate('userId', 'firstName lastName phone email')
        .populate('engineerId', 'firstName lastName phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.requests.countDocuments(q),
    ]);

    // جلب jobTitle من EngineerProfile لجميع المهندسين
    const engineerIds: Types.ObjectId[] = [];
    for (const item of items) {
      const engineerId = item.engineerId as PopulatedEngineer | Types.ObjectId | null | undefined;
      const id = extractEngineerId(engineerId);
      if (id) {
        engineerIds.push(id);
      }
    }

    const jobTitlesMap = await this.getEngineersJobTitles(engineerIds);

    // إضافة jobTitle للعناصر
    const itemsWithJobTitle = items.map((item) => {
      const engineerId = item.engineerId as PopulatedEngineer | Types.ObjectId | null | undefined;
      const id = extractEngineerId(engineerId);
      const engineerIdStr = id ? id.toString() : null;

      if (engineerIdStr && jobTitlesMap.has(engineerIdStr) && isPopulatedEngineer(engineerId)) {
        (engineerId as PopulatedEngineer).jobTitle = jobTitlesMap.get(engineerIdStr) ?? null;
      }
      return item;
    });

    return { items: itemsWithJobTitle, meta: { page, limit, total } };
  }

  async adminGetRequest(id: string): Promise<null | {
    _id: Types.ObjectId;
    userId?:
      | Types.ObjectId
      | {
          _id: Types.ObjectId;
          firstName?: string;
          lastName?: string;
          phone?: string;
          email?: string;
        }
      | null;
    engineerId?:
      | Types.ObjectId
      | {
          _id: Types.ObjectId;
          firstName?: string;
          lastName?: string;
          phone?: string;
          jobTitle?: string | null;
        }
      | null;
    addressId?:
      | Types.ObjectId
      | { _id: Types.ObjectId; label?: string; line1?: string; city?: string }
      | null;
    title: string;
    type?: string;
    description?: string;
    images?: string[];
    city: string;
    status: string;
    scheduledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    location?: { type: string; coordinates: [number, number] };
    acceptedOffer?: { offerId: string; amount: number; currency?: string; note?: string };
    rating?: { score?: number; comment?: string; at?: Date };
    cancellationReason?: string;
    cancelledAt?: Date;
    adminNotes?: Array<{ note: string; at: Date }>;
    offers: Array<{
      _id: Types.ObjectId;
      requestId: string | Types.ObjectId;
      amount: number;
      note?: string | null;
      distanceKm?: number;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      engineerId?:
        | Types.ObjectId
        | {
            _id: Types.ObjectId;
            firstName?: string;
            lastName?: string;
            phone?: string;
            jobTitle?: string | null;
          }
        | null;
    }>;
  }> {
    const request = (await this.requests
      .findById(id)
      .populate('userId', 'firstName lastName phone email')
      .populate('engineerId', 'firstName lastName phone')
      .lean()) as ServiceRequestPopulated | null;

    if (!request) return null;

    const offers = (await this.offers
      .find({ requestId: id })
      .populate('engineerId', 'firstName lastName phone')
      .sort({ createdAt: -1 })
      .lean()) as EngineerOfferPopulated[];

    // جلب jobTitle من EngineerProfile
    const engineerIds: Types.ObjectId[] = [];
    const requestEngineerId = extractEngineerId(request.engineerId);
    if (requestEngineerId) {
      engineerIds.push(requestEngineerId);
    }
    for (const offer of offers) {
      const id = extractEngineerId(offer.engineerId);
      if (id && !engineerIds.some((existingId) => existingId.equals(id))) {
        engineerIds.push(id);
      }
    }

    const jobTitlesMap = await this.getEngineersJobTitles(engineerIds);

    // إضافة jobTitle للطلب
    if (requestEngineerId && isPopulatedEngineer(request.engineerId)) {
      const engineerId = requestEngineerId.toString();
      if (jobTitlesMap.has(engineerId)) {
        request.engineerId.jobTitle = jobTitlesMap.get(engineerId) ?? null;
      }
    }

    // إضافة jobTitle للعروض
    const offersWithJobTitle = offers.map((offer) => {
      const id = extractEngineerId(offer.engineerId);
      const engineerId = id ? id.toString() : null;

      if (engineerId && jobTitlesMap.has(engineerId) && isPopulatedEngineer(offer.engineerId)) {
        offer.engineerId.jobTitle = jobTitlesMap.get(engineerId) ?? null;
      }
      return offer;
    });

    return { ...request, offers: offersWithJobTitle };
  }

  async adminGetRequestOffers(id: string): Promise<
    Array<{
      _id: Types.ObjectId;
      requestId: string | Types.ObjectId;
      amount: number;
      note?: string | null;
      distanceKm?: number;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      engineerId?:
        | Types.ObjectId
        | {
            _id: Types.ObjectId;
            firstName?: string;
            lastName?: string;
            phone?: string;
            jobTitle?: string | null;
          }
        | null;
    }>
  > {
    const offers = (await this.offers
      .find({ requestId: id })
      .populate('engineerId', 'firstName lastName phone')
      .sort({ createdAt: -1 })
      .lean()) as EngineerOfferPopulated[];

    // جلب jobTitle من EngineerProfile
    const engineerIds: Types.ObjectId[] = [];
    for (const offer of offers) {
      const id = extractEngineerId(offer.engineerId);
      if (id) {
        engineerIds.push(id);
      }
    }

    const jobTitlesMap = await this.getEngineersJobTitles(engineerIds);

    // إضافة jobTitle للعروض
    return offers.map((offer) => {
      const id = extractEngineerId(offer.engineerId);
      const engineerId = id ? id.toString() : null;

      if (engineerId && jobTitlesMap.has(engineerId) && isPopulatedEngineer(offer.engineerId)) {
        offer.engineerId.jobTitle = jobTitlesMap.get(engineerId) ?? null;
      }
      return offer;
    });
  }

  async adminUpdateRequestStatus(id: string, status: string, note?: string) {
    const r = await this.requests.findById(id);
    if (!r) return { error: 'NOT_FOUND' };

    const validStatuses = [
      'OPEN',
      'OFFERS_COLLECTING',
      'ASSIGNED',
      'COMPLETED',
      'RATED',
      'CANCELLED',
    ];
    if (!validStatuses.includes(status)) return { error: 'INVALID_STATUS' };

    r.status = status as
      | 'OPEN'
      | 'OFFERS_COLLECTING'
      | 'ASSIGNED'
      | 'COMPLETED'
      | 'RATED'
      | 'CANCELLED';
    if (note) {
      r.adminNotes = r.adminNotes || [];
      r.adminNotes.push({ note, at: new Date() });
    }
    await r.save();

    await this.safeNotify(
      String(r.userId),
      NotificationType.SERVICE_REQUEST_OPENED, // Using available type
      'تم تحديث حالة الخدمة',
      `تم تحديث حالة الخدمة إلى ${status}`,
      { requestId: String(r._id), status, note },
      NotificationNavigationType.SERVICE_REQUEST,
      String(r._id),
    );

    return { ok: true };
  }

  async adminCancel(id: string, reason?: string) {
    const r = await this.requests.findById(id);
    if (!r) return { error: 'NOT_FOUND' };
    if (['COMPLETED', 'RATED', 'CANCELLED'].includes(r.status)) return { error: 'INVALID_STATUS' };

    r.status = 'CANCELLED';
    r.cancellationReason = reason || 'إلغاء إداري';
    r.cancelledAt = new Date();
    if (reason) {
      r.adminNotes = r.adminNotes || [];
      r.adminNotes.push({ note: `إلغاء إداري: ${reason}`, at: new Date() });
    }
    await r.save();

    await this.offers.updateMany(
      { requestId: r._id, status: 'OFFERED' },
      { $set: { status: 'REJECTED' } },
    );

    await this.safeNotify(
      String(r.userId),
      NotificationType.SERVICE_REQUEST_CANCELLED,
      'تم إلغاء الخدمة من قبل الإدارة',
      `تم إلغاء الخدمة من قبل الإدارة: ${reason || 'لا يوجد سبب محدد'}`,
      { requestId: String(r._id), reason },
      NotificationNavigationType.SERVICE_REQUEST,
      String(r._id),
    );

    return { ok: true };
  }

  async adminAssignEngineer(id: string, engineerId: string, note?: string) {
    const r = await this.requests.findById(id);
    if (!r) return { error: 'NOT_FOUND' };
    if (r.status !== 'OPEN' && r.status !== 'OFFERS_COLLECTING') return { error: 'INVALID_STATUS' };

    r.status = 'ASSIGNED';
    r.engineerId = engineerId;
    if (note) {
      r.adminNotes = r.adminNotes || [];
      r.adminNotes.push({ note: `تعيين مهندس: ${note}`, at: new Date() });
    }
    await r.save();

    await this.offers.updateMany({ requestId: r._id }, { $set: { status: 'REJECTED' } });

    await this.safeNotify(
      String(r.userId),
      NotificationType.OFFER_ACCEPTED,
      'تم تعيين مهندس من قبل الإدارة',
      `تم تعيين مهندس للخدمة من قبل الإدارة`,
      { requestId: String(r._id), engineerId },
      NotificationNavigationType.SERVICE_REQUEST,
      String(r._id),
    );

    return { ok: true };
  }

  // === إحصائيات شاملة ===
  async getOverviewStatistics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // إصلاح حساب startOfWeek
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - weekDate.getDay());
    weekDate.setHours(0, 0, 0, 0);
    const startOfWeek = weekDate;

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const [
      totalRequests,
      totalOffers,
      totalEngineers,
      monthlyRequests,
      weeklyRequests,
      dailyRequests,
      completedRequests,
      cancelledRequests,
      averageRating,
      totalRevenue,
      // بيانات الشهر الحالي
      monthlyOffers,
      monthlyRevenue,
      monthlyEngineers,
      // البيانات للفترة السابقة لحساب الاتجاهات
      previousMonthRequests,
      previousMonthOffers,
      previousMonthEngineers,
      previousMonthRevenue,
    ] = await Promise.all([
      this.requests.countDocuments(),
      this.offers.countDocuments(),
      this.requests.distinct('engineerId').then((ids) => ids.filter((id) => id !== null).length),
      this.requests.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.requests.countDocuments({ createdAt: { $gte: startOfWeek } }),
      this.requests.countDocuments({ createdAt: { $gte: startOfDay } }),
      this.requests.countDocuments({ status: 'COMPLETED' }),
      this.requests.countDocuments({ status: 'CANCELLED' }),
      this.requests
        .aggregate([
          { $match: { 'rating.score': { $exists: true } } },
          { $group: { _id: null, avgRating: { $avg: '$rating.score' } } },
        ])
        .then((result) => result[0]?.avgRating || 0),
      this.requests
        .aggregate([
          { $match: { status: 'COMPLETED', acceptedOffer: { $exists: true } } },
          { $group: { _id: null, total: { $sum: '$acceptedOffer.amount' } } },
        ])
        .then((result) => result[0]?.total || 0),
      // بيانات الشهر الحالي
      this.offers.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.requests
        .aggregate([
          {
            $match: {
              status: 'COMPLETED',
              acceptedOffer: { $exists: true },
              createdAt: { $gte: startOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: '$acceptedOffer.amount' } } },
        ])
        .then((result) => result[0]?.total || 0),
      this.requests
        .distinct('engineerId', {
          createdAt: { $gte: startOfMonth },
          engineerId: { $ne: null },
        })
        .then((ids) => ids.filter((id) => id !== null).length),
      // حساب البيانات للفترة السابقة
      this.requests.countDocuments({
        createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      }),
      this.offers.countDocuments({
        createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      }),
      this.requests
        .distinct('engineerId', {
          createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
          engineerId: { $ne: null },
        })
        .then((ids) => ids.filter((id) => id !== null).length),
      this.requests
        .aggregate([
          {
            $match: {
              status: 'COMPLETED',
              acceptedOffer: { $exists: true },
              createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
            },
          },
          { $group: { _id: null, total: { $sum: '$acceptedOffer.amount' } } },
        ])
        .then((result) => result[0]?.total || 0),
    ]);

    // حساب نسب التغيير
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) {
        return current > 0 ? { value: 100, isPositive: true } : { value: 0, isPositive: true };
      }
      const change = ((current - previous) / previous) * 100;
      return {
        value: Math.abs(change),
        isPositive: change >= 0,
      };
    };

    // حساب الاتجاهات
    const requestsTrend = calculateTrend(monthlyRequests, previousMonthRequests);
    const offersTrend = calculateTrend(monthlyOffers, previousMonthOffers);
    const engineersTrend = calculateTrend(monthlyEngineers, previousMonthEngineers);
    const revenueTrend = calculateTrend(monthlyRevenue, previousMonthRevenue);

    return {
      totalRequests,
      totalOffers,
      totalEngineers,
      monthlyRequests,
      weeklyRequests,
      dailyRequests,
      completedRequests,
      cancelledRequests,
      completionRate:
        totalRequests > 0 ? ((completedRequests / totalRequests) * 100).toFixed(1) : 0,
      averageRating: Number(averageRating.toFixed(1)),
      totalRevenue,
      // إضافة الاتجاهات
      trends: {
        requests: requestsTrend,
        offers: offersTrend,
        engineers: engineersTrend,
        revenue: revenueTrend,
      },
    };
  }

  async getRequestsStatistics(params: {
    dateFrom?: Date;
    dateTo?: Date;
    groupBy: 'day' | 'week' | 'month';
  }) {
    const { dateFrom, dateTo, groupBy } = params;
    const matchStage: Record<string, unknown> = {};

    if (dateFrom || dateTo) {
      matchStage.createdAt = {} as Record<string, Date>;
      if (dateFrom) (matchStage.createdAt as Record<string, Date>).$gte = dateFrom;
      if (dateTo) (matchStage.createdAt as Record<string, Date>).$lte = dateTo;
    }

    const groupFormat = groupBy === 'day' ? '%Y-%m-%d' : groupBy === 'week' ? '%Y-W%U' : '%Y-%m';

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: '$createdAt' },
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 as const } },
    ];

    return this.requests.aggregate(pipeline);
  }

  async getEngineersStatistics(params: { dateFrom?: Date; dateTo?: Date; limit: number }) {
    const { dateFrom, dateTo, limit } = params;
    const matchStage: Record<string, unknown> = { engineerId: { $ne: null } };

    if (dateFrom || dateTo) {
      matchStage.createdAt = {} as Record<string, Date>;
      if (dateFrom) (matchStage.createdAt as Record<string, Date>).$gte = dateFrom;
      if (dateTo) (matchStage.createdAt as Record<string, Date>).$lte = dateTo;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$engineerId',
          totalRequests: { $sum: 1 },
          completedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          averageRating: {
            $avg: {
              $cond: [{ $gt: ['$rating.score', 0] }, '$rating.score', null],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ['$status', 'COMPLETED'] }, { $gt: ['$acceptedOffer.amount', 0] }],
                },
                '$acceptedOffer.amount',
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'engineer',
        },
      },
      { $unwind: '$engineer' },
      {
        $project: {
          engineerId: '$_id',
          engineerName: { $concat: ['$engineer.firstName', ' ', '$engineer.lastName'] },
          engineerPhone: '$engineer.phone',
          totalRequests: 1,
          completedRequests: 1,
          completionRate: {
            $multiply: [{ $divide: ['$completedRequests', '$totalRequests'] }, 100],
          },
          averageRating: { $round: ['$averageRating', 1] },
          totalRevenue: 1,
        },
      },
      { $sort: { totalRequests: -1 as const } },
      { $limit: limit },
    ];

    return this.requests.aggregate(pipeline);
  }

  async getServiceTypesStatistics(params: { dateFrom?: Date; dateTo?: Date }) {
    const { dateFrom, dateTo } = params;
    const matchStage: Record<string, unknown> = {};

    if (dateFrom || dateTo) {
      matchStage.createdAt = {} as Record<string, Date>;
      if (dateFrom) (matchStage.createdAt as Record<string, Date>).$gte = dateFrom;
      if (dateTo) (matchStage.createdAt as Record<string, Date>).$lte = dateTo;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          averageRevenue: {
            $avg: {
              $cond: [
                {
                  $and: [{ $eq: ['$status', 'COMPLETED'] }, { $gt: ['$acceptedOffer.amount', 0] }],
                },
                '$acceptedOffer.amount',
                null,
              ],
            },
          },
        },
      },
      { $sort: { total: -1 as const } },
    ];

    return this.requests.aggregate(pipeline);
  }

  async getRevenueStatistics(params: {
    dateFrom?: Date;
    dateTo?: Date;
    groupBy: 'day' | 'week' | 'month';
  }) {
    const { dateFrom, dateTo, groupBy } = params;
    const matchStage: Record<string, unknown> = {
      status: 'COMPLETED',
      'acceptedOffer.amount': { $gt: 0 },
    };

    if (dateFrom || dateTo) {
      matchStage.createdAt = {} as Record<string, Date>;
      if (dateFrom) (matchStage.createdAt as Record<string, Date>).$gte = dateFrom;
      if (dateTo) (matchStage.createdAt as Record<string, Date>).$lte = dateTo;
    }

    const groupFormat = groupBy === 'day' ? '%Y-%m-%d' : groupBy === 'week' ? '%Y-W%U' : '%Y-%m';

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: '$createdAt' },
          },
          totalRevenue: { $sum: '$acceptedOffer.amount' },
          requestsCount: { $sum: 1 },
          averageRevenue: { $avg: '$acceptedOffer.amount' },
        },
      },
      { $sort: { _id: 1 as const } },
    ];

    return this.requests.aggregate(pipeline);
  }

  // === إدارة المهندسين ===
  async getEngineersList(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;

    // بناء استعلام البحث للمهندسين
    const matchStage: Record<string, unknown> = {
      $or: [{ roles: { $in: ['engineer'] } }, { engineer_capable: true }],
      status: { $ne: 'deleted' },
    };

    if (search) {
      matchStage.$and = [
        {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    // جلب المهندسين من جدول المستخدمين
    const engineersQuery = this.userModel.find(matchStage);
    const total = await this.userModel.countDocuments(matchStage);

    const engineers = await engineersQuery
      .select('_id firstName lastName phone email engineer_status')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // جلب إحصائيات المهندسين من جدول الخدمات
    const engineerIds = engineers.map((e) => e._id);

    const statsPipeline = [
      { $match: { engineerId: { $in: engineerIds } } },
      {
        $group: {
          _id: '$engineerId',
          totalRequests: { $sum: 1 },
          completedRequests: {
            $sum: { $cond: [{ $in: ['$status', ['COMPLETED', 'RATED']] }, 1, 0] },
          },
          averageRating: {
            $avg: {
              $cond: [{ $gt: ['$rating.score', 0] }, '$rating.score', null],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$status', ['COMPLETED', 'RATED']] },
                    { $gt: ['$acceptedOffer.amount', 0] },
                  ],
                },
                '$acceptedOffer.amount',
                0,
              ],
            },
          },
        },
      },
    ];

    const statsMap = new Map();
    const stats = await this.requests.aggregate(statsPipeline);

    stats.forEach((stat) => {
      statsMap.set(stat._id.toString(), {
        totalRequests: stat.totalRequests || 0,
        completedRequests: stat.completedRequests || 0,
        completionRate:
          stat.totalRequests > 0
            ? Math.round((stat.completedRequests / stat.totalRequests) * 100 * 10) / 10
            : 0,
        averageRating: stat.averageRating ? Math.round(stat.averageRating * 10) / 10 : 0,
        totalRevenue: stat.totalRevenue || 0,
      });
    });

    // جلب عدد الكوبونات النشطة لكل مهندس
    const couponsMap = new Map<string, { totalCoupons: number; activeCoupons: number }>();
    // جلب الرصيد من بروفايل المهندس
    const walletBalanceMap = new Map<string, number>();

    if (engineerIds.length > 0) {
      // تحويل engineerIds إلى ObjectId إذا لزم الأمر
      const engineerObjectIds = engineerIds.map((id) => {
        if (id instanceof Types.ObjectId) {
          return id;
        }
        const idString = typeof id === 'string' ? id : String(id);
        return new Types.ObjectId(idString);
      });

      // جلب الكوبونات
      const couponsStats = await this.couponModel.aggregate([
        {
          $match: {
            engineerId: { $in: engineerObjectIds },
            deletedAt: null,
          },
        },
        {
          $group: {
            _id: '$engineerId',
            totalCoupons: { $sum: 1 },
            activeCoupons: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
            },
          },
        },
      ]);

      couponsStats.forEach((couponStat) => {
        const engineerIdStr = couponStat._id.toString();
        couponsMap.set(engineerIdStr, {
          totalCoupons: couponStat.totalCoupons || 0,
          activeCoupons: couponStat.activeCoupons || 0,
        });
      });

      // جلب الرصيد من بروفايل المهندس
      const profiles = await this.engineerProfileModel
        .find({ userId: { $in: engineerObjectIds } })
        .select('userId walletBalance')
        .lean();

      profiles.forEach((profile) => {
        const engineerIdStr = profile.userId.toString();
        walletBalanceMap.set(engineerIdStr, profile.walletBalance || 0);
      });
    }

    // دمج البيانات
    const items = engineers.map((engineer) => {
      const engineerIdStr = engineer._id.toString();

      const stats = statsMap.get(engineerIdStr) || {
        totalRequests: 0,
        completedRequests: 0,
        completionRate: 0,
        averageRating: 0,
        totalRevenue: 0,
      };

      const coupons = couponsMap.get(engineerIdStr) || {
        totalCoupons: 0,
        activeCoupons: 0,
      };

      const walletBalance = walletBalanceMap.get(engineerIdStr) || 0;

      return {
        engineerId: engineerIdStr,
        engineerName: `${engineer.firstName || ''} ${engineer.lastName || ''}`.trim() || 'بدون اسم',
        engineerPhone: engineer.phone,
        totalRequests: stats.totalRequests,
        completedRequests: stats.completedRequests,
        completionRate: stats.completionRate,
        averageRating: stats.averageRating,
        totalRevenue: stats.totalRevenue,
        walletBalance,
        totalCoupons: coupons.totalCoupons,
        activeCoupons: coupons.activeCoupons,
      };
    });

    return { items, meta: { page, limit, total } };
  }

  async getEngineerStatistics(engineerId: string): Promise<{
    engineer:
      | Types.ObjectId
      | {
          _id: Types.ObjectId;
          firstName?: string;
          lastName?: string;
          phone?: string;
          email?: string;
          jobTitle?: string | null;
        }
      | null
      | undefined;
    statistics: {
      _id?: Types.ObjectId;
      totalRequests?: number;
      completedRequests?: number;
      assignedRequests?: number;
      averageRating?: number;
      totalRevenue?: number;
      averageRevenue?: number;
    };
    offersStats: Array<{
      _id: string;
      count: number;
      averageAmount: number;
    }>;
  }> {
    const pipeline = [
      { $match: { engineerId: new Types.ObjectId(engineerId) } },
      {
        $group: {
          _id: '$engineerId',
          totalRequests: { $sum: 1 },
          completedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          assignedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'ASSIGNED'] }, 1, 0] },
          },
          averageRating: {
            $avg: {
              $cond: [{ $gt: ['$rating.score', 0] }, '$rating.score', null],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ['$status', 'COMPLETED'] }, { $gt: ['$acceptedOffer.amount', 0] }],
                },
                '$acceptedOffer.amount',
                0,
              ],
            },
          },
          averageRevenue: {
            $avg: {
              $cond: [
                {
                  $and: [{ $eq: ['$status', 'COMPLETED'] }, { $gt: ['$acceptedOffer.amount', 0] }],
                },
                '$acceptedOffer.amount',
                null,
              ],
            },
          },
        },
      },
    ];

    const stats = await this.requests.aggregate(pipeline);
    const engineer = await this.requests
      .findOne({ engineerId: new Types.ObjectId(engineerId) })
      .populate('engineerId', 'firstName lastName phone email')
      .lean();

    // جلب jobTitle من EngineerProfile
    const engineerWithJobTitle = engineer?.engineerId as
      | PopulatedEngineer
      | Types.ObjectId
      | null
      | undefined;
    if (engineerWithJobTitle) {
      const engineerId = extractEngineerId(engineerWithJobTitle);

      if (engineerId) {
        const jobTitlesMap = await this.getEngineersJobTitles([engineerId]);
        const engineerIdStr = engineerId.toString();
        if (jobTitlesMap.has(engineerIdStr) && isPopulatedEngineer(engineerWithJobTitle)) {
          (engineerWithJobTitle as PopulatedEngineer).jobTitle =
            jobTitlesMap.get(engineerIdStr) ?? null;
        }
      }
    }

    const offersStats = await this.offers.aggregate([
      { $match: { engineerId: new Types.ObjectId(engineerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
        },
      },
    ]);

    return {
      engineer: engineerWithJobTitle,
      statistics: stats[0] || {},
      offersStats,
    };
  }

  async getEngineerOffers(
    engineerId: string,
    params: {
      status?: string;
      page: number;
      limit: number;
    },
  ) {
    const { status, page, limit } = params;
    const q: Record<string, unknown> = { engineerId: new Types.ObjectId(engineerId) };
    if (status) q.status = status;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.offers
        .find(q)
        .populate('requestId', 'title type status createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.offers.countDocuments(q),
    ]);

    return { items, meta: { page, limit, total } };
  }

  // === إحصائيات المهندسين ===
  async getEngineersOverviewStatistics() {
    const [totalEngineers, averageRating, averageCompletionRate, totalRevenue] = await Promise.all([
      // إجمالي عدد المهندسين الذين لديهم طلبات
      this.requests.distinct('engineerId').then((ids) => ids.filter((id) => id !== null).length),

      // متوسط التقييم
      this.requests
        .aggregate([
          { $match: { 'rating.score': { $exists: true } } },
          { $group: { _id: null, avgRating: { $avg: '$rating.score' } } },
        ])
        .then((result) => result[0]?.avgRating || 0),

      // متوسط معدل الإنجاز
      this.requests
        .aggregate([
          { $match: { engineerId: { $exists: true, $ne: null } } },
          {
            $group: {
              _id: '$engineerId',
              totalRequests: { $sum: 1 },
              completedRequests: {
                $sum: { $cond: [{ $in: ['$status', ['COMPLETED', 'RATED']] }, 1, 0] },
              },
            },
          },
          {
            $group: {
              _id: null,
              avgCompletionRate: {
                $avg: {
                  $multiply: [{ $divide: ['$completedRequests', '$totalRequests'] }, 100],
                },
              },
            },
          },
        ])
        .then((result) => result[0]?.avgCompletionRate || 0),

      // إجمالي الإيرادات
      this.requests
        .aggregate([
          {
            $match: {
              status: { $in: ['COMPLETED', 'RATED'] },
              acceptedOffer: { $exists: true },
            },
          },
          { $group: { _id: null, total: { $sum: '$acceptedOffer.amount' } } },
        ])
        .then((result) => result[0]?.total || 0),
    ]);

    return {
      totalEngineers,
      averageRating: Math.round(averageRating * 10) / 10,
      averageCompletionRate: Math.round(averageCompletionRate * 10) / 10,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    };
  }

  // === إحصائيات العروض ===
  async getOffersStatistics(filters?: { dateFrom?: Date; dateTo?: Date }) {
    const q: Record<string, unknown> = {};

    if (filters?.dateFrom || filters?.dateTo) {
      q.createdAt = {} as Record<string, Date>;
      if (filters.dateFrom) (q.createdAt as Record<string, Date>).$gte = filters.dateFrom;
      if (filters.dateTo) (q.createdAt as Record<string, Date>).$lte = filters.dateTo;
    }

    const [totalOffers, acceptedOffers, pendingOffers, totalValue, averageOffer, totalsByCurrency] =
      await Promise.all([
        this.offers.countDocuments(q),
        this.offers.countDocuments({ ...q, status: 'ACCEPTED' }),
        this.offers.countDocuments({ ...q, status: 'OFFERED' }),
        this.offers
          .aggregate([
            { $match: { ...q, status: 'ACCEPTED' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ])
          .then((result) => result[0]?.total || 0),
        this.offers
          .aggregate([{ $match: q }, { $group: { _id: null, average: { $avg: '$amount' } } }])
          .then((result) => result[0]?.average || 0),
        this.offers
          .aggregate([
            { $match: { ...q, status: 'ACCEPTED' } },
            { $group: { _id: '$currency', total: { $sum: '$amount' } } },
          ])
          .then((rows) =>
            rows.reduce(
              (acc, row) => {
                const key = (row?._id as string) || 'USD';
                acc[key] = Math.round((row?.total || 0) * 100) / 100;
                return acc;
              },
              {
                USD: 0,
                YER: 0,
                SAR: 0,
              } as Record<string, number>,
            ),
          ),
      ]);

    return {
      totalOffers,
      acceptedOffers,
      pendingOffers,
      totalValue: Math.round(totalValue * 100) / 100, // Round to 2 decimal places
      averageOffer: Math.round(averageOffer * 100) / 100,
      offersTotalProfit: totalsByCurrency,
    };
  }

  // === إدارة العروض (للأدمن) ===
  async getOffersManagementList(params: {
    status?: string;
    requestId?: string;
    engineerId?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const { status, requestId, engineerId, search, page, limit } = params;
    const q: Record<string, unknown> = {};

    if (status) q.status = status;
    if (requestId) q.requestId = new Types.ObjectId(requestId);
    if (engineerId) q.engineerId = new Types.ObjectId(engineerId);

    // إضافة البحث
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      q.$or = [
        { note: searchRegex },
        { amount: isNaN(Number(search)) ? undefined : Number(search) },
      ].filter(Boolean);
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.offers
        .find(q)
        .populate('requestId', 'title type status createdAt userId addressId')
        .populate('engineerId', 'firstName lastName phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.offers.countDocuments(q),
    ]);

    // جلب jobTitle من EngineerProfile
    const engineerIds: Types.ObjectId[] = [];
    for (const item of items) {
      const engineerId = item.engineerId as unknown as
        | PopulatedEngineer
        | Types.ObjectId
        | null
        | undefined;
      const id = extractEngineerId(engineerId);
      if (id) {
        engineerIds.push(id);
      }
    }

    const jobTitlesMap = await this.getEngineersJobTitles(engineerIds);

    // إضافة jobTitle للعناصر
    const itemsWithJobTitle = items.map((item) => {
      const engineerId = item.engineerId as unknown as
        | PopulatedEngineer
        | Types.ObjectId
        | null
        | undefined;
      const id = extractEngineerId(engineerId);
      const engineerIdStr = id ? id.toString() : null;

      if (engineerIdStr && jobTitlesMap.has(engineerIdStr) && isPopulatedEngineer(engineerId)) {
        (engineerId as PopulatedEngineer).jobTitle = jobTitlesMap.get(engineerIdStr) ?? null;
      }
      return item;
    });

    return { items: itemsWithJobTitle, meta: { page, limit, total } };
  }

  // === إدارة العروض ===
  async getOffersList(params: {
    status?: string;
    requestId?: string;
    engineerId?: string;
    page: number;
    limit: number;
  }) {
    const { status, requestId, engineerId, page, limit } = params;
    const q: Record<string, unknown> = {};

    if (status) q.status = status;
    if (requestId) q.requestId = new Types.ObjectId(requestId);
    if (engineerId) q.engineerId = new Types.ObjectId(engineerId);

    const skip = (page - 1) * limit;
    const [itemsRaw, total] = await Promise.all([
      this.offers
        .find(q)
        .populate('requestId', 'title type status createdAt userId')
        .populate('engineerId', 'firstName lastName phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.offers.countDocuments(q),
    ]);
    const items = itemsRaw as EngineerOfferPopulated[];

    // جلب jobTitle من EngineerProfile
    const engineerIds: Types.ObjectId[] = [];
    for (const item of items) {
      const id = extractEngineerId(item.engineerId);
      if (id) {
        engineerIds.push(id);
      }
    }

    const jobTitlesMap = await this.getEngineersJobTitles(engineerIds);

    // إضافة jobTitle للعناصر
    const itemsWithJobTitle = items.map((item) => {
      const id = extractEngineerId(item.engineerId);
      const engineerIdStr = id ? id.toString() : null;

      if (
        engineerIdStr &&
        jobTitlesMap.has(engineerIdStr) &&
        isPopulatedEngineer(item.engineerId)
      ) {
        item.engineerId.jobTitle = jobTitlesMap.get(engineerIdStr) ?? null;
      }
      return item;
    });

    return { items: itemsWithJobTitle, meta: { page, limit, total } };
  }

  // === قبول عرض من الأدمن ===
  async adminAcceptOffer(requestId: string, offerId: string) {
    const r = await this.requests.findById(requestId);
    if (!r) return { error: 'REQUEST_NOT_FOUND' };

    if (!['OPEN', 'OFFERS_COLLECTING'].includes(r.status)) {
      return { error: 'INVALID_STATUS' };
    }

    const offer = await this.offers.findOne({
      _id: offerId,
      requestId: r._id,
      status: 'OFFERED',
    });

    if (!offer) return { error: 'OFFER_NOT_FOUND' };

    // تحديث الطلب
    r.status = 'ASSIGNED';
    r.engineerId = offer.engineerId;
    r.acceptedOffer = {
      offerId: String(offer._id),
      amount: offer.amount,
      currency: offer.currency || 'YER',
      note: offer.note,
    };
    await r.save();

    // تحديث العرض المقبول
    offer.status = 'ACCEPTED';
    await offer.save();

    // رفض جميع العروض الأخرى
    await this.offers.updateMany(
      { requestId: r._id, _id: { $ne: offer._id }, status: 'OFFERED' },
      { $set: { status: 'REJECTED' } },
    );

    // إرسال إشعار للمهندس
    await this.safeNotify(
      String(offer.engineerId),
      NotificationType.OFFER_ACCEPTED,
      'تم قبول عرضك',
      `تم قبول عرضك للطلب ${String(r._id)} من قبل الإدارة`,
      { requestId: String(r._id) },
      NotificationNavigationType.SERVICE_REQUEST,
      String(r._id),
    );

    this.logger.log(`Admin accepted offer ${offerId} for request ${requestId}`);
    return { ok: true };
  }

  // === رفض عرض من الأدمن ===
  async adminRejectOffer(offerId: string, reason?: string) {
    const offer = await this.offers.findById(offerId);
    if (!offer) return { error: 'OFFER_NOT_FOUND' };

    if (offer.status !== 'OFFERED') {
      return { error: 'INVALID_STATUS' };
    }

    // تحديث حالة العرض
    offer.status = 'REJECTED';
    await offer.save();

    // إرسال إشعار للمهندس
    await this.safeNotify(
      String(offer.engineerId),
      NotificationType.OFFER_REJECTED,
      'تم رفض عرضك',
      reason || `تم رفض عرضك للطلب ${String(offer.requestId)} من قبل الإدارة`,
      { requestId: String(offer.requestId), reason },
      NotificationNavigationType.SERVICE_REQUEST,
      String(offer.requestId),
    );

    this.logger.log(`Admin rejected offer ${offerId}. Reason: ${reason || 'No reason provided'}`);
    return { ok: true };
  }

  // === إلغاء عرض من الأدمن ===
  async adminCancelOffer(offerId: string, reason?: string) {
    const offer = await this.offers.findById(offerId);
    if (!offer) return { error: 'OFFER_NOT_FOUND' };

    if (!['OFFERED', 'ACCEPTED'].includes(offer.status)) {
      return { error: 'INVALID_STATUS' };
    }

    const previousStatus = offer.status;

    // تحديث حالة العرض
    offer.status = 'CANCELLED';
    await offer.save();

    // إذا كان العرض مقبولاً، نحتاج إلى تحديث الطلب أيضاً
    if (previousStatus === 'ACCEPTED') {
      const request = await this.requests.findById(offer.requestId);
      if (request && request.status === 'ASSIGNED') {
        request.status = 'OPEN';
        request.engineerId = null;
        request.acceptedOffer = undefined;
        await request.save();

        this.logger.log(
          `Request ${offer.requestId} status reverted to OPEN after cancelling accepted offer`,
        );
      }
    }

    // إرسال إشعار للمهندس
    await this.safeNotify(
      String(offer.engineerId),
      NotificationType.OFFER_CANCELLED,
      'تم إلغاء عرضك',
      reason || `تم إلغاء عرضك للطلب ${String(offer.requestId)} من قبل الإدارة`,
      { requestId: String(offer.requestId), reason },
      NotificationNavigationType.SERVICE_REQUEST,
      String(offer.requestId),
    );

    this.logger.log(`Admin cancelled offer ${offerId}. Reason: ${reason || 'No reason provided'}`);
    return { ok: true };
  }

  /**
   * انتهاء صلاحية الطلبات والعروض القديمة (5 أيام)
   * يتم استدعاؤها من cron job
   */
  async expireOldRequestsAndOffers(): Promise<{ expiredRequests: number; expiredOffers: number }> {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    // انتهاء صلاحية الطلبات: OPEN أو OFFERS_COLLECTING لمدة 5 أيام بدون قبول عرض
    const expiredRequestsResult = await this.requests.updateMany(
      {
        status: { $in: ['OPEN', 'OFFERS_COLLECTING'] },
        createdAt: { $lt: fiveDaysAgo },
        engineerId: null, // لم يتم قبول أي عرض
      },
      {
        $set: {
          status: 'CANCELLED',
          cancellationReason: 'انتهت صلاحية الطلب (5 أيام بدون قبول عرض)',
          cancelledAt: new Date(),
        },
      },
    );

    const expiredRequests = expiredRequestsResult.modifiedCount || 0;

    // إرسال إشعارات للعملاء
    if (expiredRequests > 0) {
      const expiredRequestsList = await this.requests
        .find({
          status: 'CANCELLED',
          cancellationReason: 'انتهت صلاحية الطلب (5 أيام بدون قبول عرض)',
          cancelledAt: { $gte: new Date(Date.now() - 60000) }, // في الدقيقة الأخيرة
        })
        .select('userId _id')
        .lean();

      for (const req of expiredRequestsList) {
        await this.safeNotify(
          String(req.userId),
          NotificationType.SERVICE_REQUEST_CANCELLED,
          'انتهت صلاحية طلب الخدمة',
          `انتهت صلاحية الطلب ${String(req._id)} بعد 5 أيام بدون قبول أي عرض`,
          { requestId: String(req._id) },
          NotificationNavigationType.SERVICE_REQUEST,
          String(req._id),
        );
      }
    }

    // انتهاء صلاحية العروض: OFFERED لمدة 5 أيام بدون قبول
    const expiredOffersResult = await this.offers.updateMany(
      {
        status: 'OFFERED',
        createdAt: { $lt: fiveDaysAgo },
      },
      {
        $set: {
          status: 'EXPIRED',
        },
      },
    );

    const expiredOffers = expiredOffersResult.modifiedCount || 0;

    // إرسال إشعارات للمهندسين
    if (expiredOffers > 0) {
      const expiredOffersList = await this.offers
        .find({
          status: 'EXPIRED',
          updatedAt: { $gte: new Date(Date.now() - 60000) }, // في الدقيقة الأخيرة
        })
        .select('engineerId requestId _id')
        .lean();

      for (const offer of expiredOffersList) {
        await this.safeNotify(
          String(offer.engineerId),
          NotificationType.OFFER_CANCELLED,
          'انتهت صلاحية عرضك',
          `انتهت صلاحية عرضك للطلب ${String(offer.requestId)} بعد 5 أيام`,
          { requestId: String(offer.requestId), offerId: String(offer._id) },
          NotificationNavigationType.SERVICE_REQUEST,
          String(offer.requestId),
        );
      }
    }

    this.logger.log(
      `Expired ${expiredRequests} requests and ${expiredOffers} offers older than 5 days`,
    );

    return { expiredRequests, expiredOffers };
  }
}

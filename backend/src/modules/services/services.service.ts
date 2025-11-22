import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { ServiceRequest } from './schemas/service-request.schema';
import { EngineerOffer } from './schemas/engineer-offer.schema';
import { User } from '../users/schemas/user.schema';
import { AddressesService } from '../addresses/addresses.service';
import { NotificationService } from '../notifications/services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../notifications/enums/notification.enums';
import { CreateServiceRequestDto, UpdateServiceRequestDto } from './dto/requests.dto';
import { CreateOfferDto, UpdateOfferDto } from './dto/offers.dto';
import { DistanceService } from './services/distance.service';
import { UploadService } from '../upload/upload.service';

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
  amountYER: number;
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
  constructor(
    @InjectModel(ServiceRequest.name) private requests: Model<ServiceRequest>,
    @InjectModel(EngineerOffer.name) private offers: Model<EngineerOffer>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectConnection() private conn: Connection,
    private distanceService: DistanceService,
    private addressesService: AddressesService,
    private uploadService: UploadService,
    @Optional() private notificationService?: NotificationService,
  ) {}

  // Helper method for safe notification sending
  private async safeNotify(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
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
        });
      }
    } catch (error) {
      console.warn(`Notification failed for user ${userId}:`, error);
      // Don't throw error - notifications are not critical for core functionality
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
    );

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

  async myRequests(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    return this.requests.find({ userId: userObjectId }).sort({ createdAt: -1 }).lean();
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
      .populate('engineerId', 'firstName lastName phone jobTitle')
      .sort({ createdAt: 1 })
      .lean()) as EngineerOfferPopulated[];

    const offersByRequest = new Map<string, OfferListItem[]>();

    for (const offer of offers) {
      const key = String(offer.requestId);
      const engineerData = this.extractEngineer(offer.engineerId);
      const engineerPhone: string | null = engineerData?.phone ?? null;
      const engineerName = engineerData
        ? `${engineerData.firstName ?? ''} ${engineerData.lastName ?? ''}`.trim()
        : null;
      const whatsapp = engineerPhone ? this.makeWhatsappLink(engineerPhone) : null;

      const formattedOffer: OfferListItem = {
        _id: offer._id,
        requestId: String(offer.requestId),
        amountYER: offer.amount,
        note: offer.note ?? null,
        status: offer.status,
        statusLabel: this.offerStatusLabel(offer.status),
        createdAt: offer.createdAt,
        engineer: engineerData
          ? {
              id: String(engineerData._id),
              name: engineerName,
              jobTitle: engineerData.jobTitle ?? null,
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
        note?: string;
        amountYER: number;
      } | null;
    }>
  > {
    const userObjectId = new Types.ObjectId(userId);
    const statuses = Array.isArray(status)
      ? status
      : status
        ? [status]
        : ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'RATED'];

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
              amountYER: doc.acceptedOffer.amount,
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

  async cancel(userId: string, id: string) {
    const userObjectId = new Types.ObjectId(userId);
    const requestObjectId = new Types.ObjectId(id);
    const r = await this.requests.findOne({ _id: requestObjectId, userId: userObjectId });
    if (!r) return { error: 'NOT_FOUND' };
    if (['OPEN', 'OFFERS_COLLECTING'].includes(r.status)) {
      r.status = 'CANCELLED';
      await r.save();
      await this.offers.updateMany(
        { requestId: r._id, status: 'OFFERED' },
        { $set: { status: 'REJECTED' } },
      );
      await this.safeNotify(
        userId,
        NotificationType.SERVICE_REQUEST_CANCELLED,
        'تم إلغاء طلب الخدمة',
        `تم إلغاء الطلب ${String(r._id)}`,
        { requestId: String(r._id) },
      );
      return { ok: true };
    }
    return { error: 'CANNOT_CANCEL' };
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
    r.acceptedOffer = { offerId: String(offer._id), amount: offer.amount, note: offer.note };
    await r.save();

    offer.status = 'ACCEPTED';
    await offer.save();
    await this.offers.updateMany(
      { requestId: r._id, _id: { $ne: offer._id }, status: 'OFFERED' },
      { $set: { status: 'REJECTED' } },
    );

    await this.safeNotify(
      String(offer.engineerId),
      NotificationType.OFFER_ACCEPTED,
      'تم قبول عرضك',
      `تم قبول عرضك للطلب ${String(r._id)}`,
      { requestId: String(r._id) },
    );
    return { ok: true };
  }

  async rate(userId: string, id: string, score: number, comment?: string) {
    const userObjectId = new Types.ObjectId(userId);
    const requestObjectId = new Types.ObjectId(id);
    const r = await this.requests.findOne({ _id: requestObjectId, userId: userObjectId });
    if (!r) return { error: 'NOT_FOUND' };
    if (r.status !== 'COMPLETED') return { error: 'NOT_COMPLETED' };
    r.rating = { score, comment, at: new Date() };
    r.status = 'RATED';
    await r.save();
    await this.safeNotify(
      userId,
      NotificationType.SERVICE_RATED,
      'تم تقييم الخدمة',
      `تم تقييم الخدمة بنتيجة ${score} نجوم`,
      { requestId: String(r._id), score },
    );
    return { ok: true };
  }

  // جلب العروض لطلب معين (للعميل)
  async getOffersForRequest(userId: string, requestId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const requestObjectId = new Types.ObjectId(requestId);
    const r = await this.requests.findOne({ _id: requestObjectId, userId: userObjectId });
    if (!r) return { error: 'REQUEST_NOT_FOUND' };

    const offers = await this.offers
      .find({ requestId: r._id })
      .populate('engineerId', 'firstName lastName phone jobTitle')
      .sort({ distanceKm: 1, amount: 1 }) // أقرب ثم أرخص
      .lean();

    return offers;
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
      .populate('engineerId', 'firstName lastName phone jobTitle city')
      .lean<EngineerOfferPopulated | null>();
    if (!offer) return { error: 'OFFER_NOT_FOUND' };

    const engineerData = this.extractEngineer(offer.engineerId);
    const engineerPhone: string | null = engineerData?.phone ?? null;
    const engineerName = engineerData
      ? `${engineerData.firstName ?? ''} ${engineerData.lastName ?? ''}`.trim()
      : null;
    const whatsapp = engineerPhone ? this.makeWhatsappLink(engineerPhone) : null;

    const addressData = this.extractAddress(request.addressId);

    const formattedOffer: OfferListItem = {
      _id: offer._id,
      requestId: String(offer.requestId),
      amountYER: offer.amount,
      note: offer.note ?? null,
      status: offer.status,
      statusLabel: this.offerStatusLabel(offer.status),
      createdAt: offer.createdAt,
      engineer: engineerData
        ? {
            id: String(engineerData._id),
            name: engineerName,
            jobTitle: engineerData.jobTitle ?? null,
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
  async nearby(engineerUserId: string, lat: number, lng: number, radiusKm: number) {
    const meters = radiusKm * 1000;

    // جلب مدينة المهندس
    const engineer = await this.userModel.findById(engineerUserId).select('city').lean();
    const engineerCity = engineer?.city || 'صنعاء'; // القيمة الافتراضية صنعاء

    this.logger.log(
      `Engineer ${engineerUserId} from city: ${engineerCity} searching for nearby requests`,
    );

    const list = await this.requests
      .find({
        status: { $in: ['OPEN', 'OFFERS_COLLECTING'] },
        engineerId: null,
        city: engineerCity, // فقط الطلبات من نفس المدينة
        userId: { $ne: new Types.ObjectId(engineerUserId) }, // منع المهندس من رؤية طلباته الخاصة
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: meters,
          },
        },
      })
      .limit(100)
      .lean();

    this.logger.log(`Found ${list.length} nearby requests in city ${engineerCity}`);
    return list;
  }

  async listRequestsInEngineerCity(engineerUserId: string) {
    const engineer = await this.userModel.findById(engineerUserId).select('city').lean();
    const engineerCity = engineer?.city || 'صنعاء';

    return this.requests
      .find({
        status: { $in: ['OPEN', 'OFFERS_COLLECTING'] },
        engineerId: null,
        city: engineerCity,
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async listAllAvailableRequests() {
    return this.requests
      .find({
        status: { $in: ['OPEN', 'OFFERS_COLLECTING'] },
        engineerId: null,
      })
      .sort({ createdAt: -1 })
      .lean();
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
      IN_PROGRESS: 'قيد التنفيذ',
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
    };
    return labels[status] ?? status;
  }

  private extractEngineer(
    engineer: PopulatedEngineer | Types.ObjectId | null | undefined,
  ): PopulatedEngineer | null {
    if (!engineer) return null;
    return engineer instanceof Types.ObjectId ? null : engineer;
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

    // حساب المسافة بين المهندس والطلب
    const [requestLng, requestLat] = r.location.coordinates;
    const distanceKm = this.calculateDistance(dto.lat, dto.lng, requestLat, requestLng);

    // If first offer → move to OFFERS_COLLECTING
    if (r.status === 'OPEN') {
      r.status = 'OFFERS_COLLECTING';
      await r.save();
    }

    const doc = await this.offers.findOneAndUpdate(
      { requestId: r._id, engineerId: new Types.ObjectId(engineerUserId) },
      {
        $set: {
          amount: dto.amount,
          note: dto.note,
          distanceKm: Math.round(distanceKm * 100) / 100,
          status: 'OFFERED',
          updatesCount: 0,
        },
      },
      { upsert: true, new: true },
    );
    await this.safeNotify(
      String(r.userId),
      NotificationType.NEW_ENGINEER_OFFER,
      'عرض جديد من مهندس',
      `تم تقديم عرض جديد للطلب ${String(r._id)}`,
      { requestId: String(r._id) },
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

  async start(engineerUserId: string, requestId: string) {
    const r = await this.requests.findById(requestId);
    if (!r) return { error: 'NOT_FOUND' };
    if (String(r.engineerId) !== String(engineerUserId)) return { error: 'NOT_ASSIGNED' };
    if (r.status !== 'ASSIGNED') return { error: 'INVALID_STATUS' };
    r.status = 'IN_PROGRESS';
    await r.save();
    await this.safeNotify(
      String(r.userId),
      NotificationType.SERVICE_STARTED,
      'تم بدء الخدمة',
      `تم بدء تنفيذ الخدمة للطلب ${String(r._id)}`,
      { requestId: String(r._id) },
    );
    return { ok: true };
  }

  async complete(engineerUserId: string, requestId: string) {
    const r = await this.requests.findById(requestId);
    if (!r) return { error: 'NOT_FOUND' };
    if (String(r.engineerId) !== String(engineerUserId)) return { error: 'NOT_ASSIGNED' };
    if (r.status !== 'IN_PROGRESS') return { error: 'INVALID_STATUS' };
    r.status = 'COMPLETED';
    await r.save();
    await this.safeNotify(
      String(r.userId),
      NotificationType.SERVICE_COMPLETED,
      'تم إنجاز الخدمة',
      `تم إنجاز الخدمة للطلب ${String(r._id)}`,
      { requestId: String(r._id) },
    );
    return { ok: true };
  }

  // جلب عروض المهندس
  async myOffers(engineerUserId: string) {
    return this.offers
      .find({ engineerId: new Types.ObjectId(engineerUserId) })
      .populate('requestId')
      .sort({ createdAt: -1 })
      .lean();
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
        .populate('engineerId', 'firstName lastName phone jobTitle')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.requests.countDocuments(q),
    ]);
    return { items, meta: { page, limit, total } };
  }

  async adminGetRequest(id: string) {
    const request = await this.requests
      .findById(id)
      .populate('userId', 'firstName lastName phone email')
      .populate('engineerId', 'firstName lastName phone jobTitle')
      .lean();

    if (!request) return null;

    const offers = await this.offers
      .find({ requestId: id })
      .populate('engineerId', 'firstName lastName phone jobTitle')
      .sort({ createdAt: -1 })
      .lean();

    return { ...request, offers };
  }

  async adminGetRequestOffers(id: string) {
    return this.offers
      .find({ requestId: id })
      .populate('engineerId', 'firstName lastName phone jobTitle')
      .sort({ createdAt: -1 })
      .lean();
  }

  async adminUpdateRequestStatus(id: string, status: string, note?: string) {
    const r = await this.requests.findById(id);
    if (!r) return { error: 'NOT_FOUND' };

    const validStatuses = [
      'OPEN',
      'OFFERS_COLLECTING',
      'ASSIGNED',
      'IN_PROGRESS',
      'COMPLETED',
      'RATED',
      'CANCELLED',
    ];
    if (!validStatuses.includes(status)) return { error: 'INVALID_STATUS' };

    r.status = status as
      | 'OPEN'
      | 'OFFERS_COLLECTING'
      | 'ASSIGNED'
      | 'IN_PROGRESS'
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
    );

    return { ok: true };
  }

  async adminCancel(id: string, reason?: string) {
    const r = await this.requests.findById(id);
    if (!r) return { error: 'NOT_FOUND' };
    if (['COMPLETED', 'RATED', 'CANCELLED'].includes(r.status)) return { error: 'INVALID_STATUS' };

    r.status = 'CANCELLED';
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
      .select('_id firstName lastName phone email jobTitle engineer_status')
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

    // دمج البيانات
    const items = engineers.map((engineer) => {
      const stats = statsMap.get(engineer._id.toString()) || {
        totalRequests: 0,
        completedRequests: 0,
        completionRate: 0,
        averageRating: 0,
        totalRevenue: 0,
      };

      return {
        engineerId: engineer._id.toString(),
        engineerName: `${engineer.firstName || ''} ${engineer.lastName || ''}`.trim() || 'بدون اسم',
        engineerPhone: engineer.phone,
        totalRequests: stats.totalRequests,
        completedRequests: stats.completedRequests,
        completionRate: stats.completionRate,
        averageRating: stats.averageRating,
        totalRevenue: stats.totalRevenue,
      };
    });

    return { items, meta: { page, limit, total } };
  }

  async getEngineerStatistics(engineerId: string) {
    const pipeline = [
      { $match: { engineerId: new Types.ObjectId(engineerId) } },
      {
        $group: {
          _id: '$engineerId',
          totalRequests: { $sum: 1 },
          completedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          inProgressRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] },
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
      .populate('engineerId', 'firstName lastName phone email jobTitle')
      .lean();

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
      engineer: engineer?.engineerId,
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
              completedRequests: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
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
          { $match: { status: 'COMPLETED', acceptedOffer: { $exists: true } } },
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

    const [totalOffers, acceptedOffers, pendingOffers, totalValue, averageOffer] =
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
      ]);

    return {
      totalOffers,
      acceptedOffers,
      pendingOffers,
      totalValue: Math.round(totalValue * 100) / 100, // Round to 2 decimal places
      averageOffer: Math.round(averageOffer * 100) / 100,
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
        .populate('engineerId', 'firstName lastName phone jobTitle')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.offers.countDocuments(q),
    ]);

    return { items, meta: { page, limit, total } };
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
    const [items, total] = await Promise.all([
      this.offers
        .find(q)
        .populate('requestId', 'title type status createdAt userId')
        .populate('engineerId', 'firstName lastName phone jobTitle')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.offers.countDocuments(q),
    ]);

    return { items, meta: { page, limit, total } };
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
    );

    this.logger.log(`Admin cancelled offer ${offerId}. Reason: ${reason || 'No reason provided'}`);
    return { ok: true };
  }
}

import { Injectable, Optional, Inject } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { ServiceRequest } from './schemas/service-request.schema';
import { EngineerOffer } from './schemas/engineer-offer.schema';
import { Address } from '../addresses/schemas/address.schema';
import { NOTIFICATIONS_PORT, NotificationsPort } from '../notifications/notifications.port';
import { CreateServiceRequestDto } from './dto/requests.dto';
import { CreateOfferDto, UpdateOfferDto } from './dto/offers.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceRequest.name) private requests: Model<ServiceRequest>,
    @InjectModel(EngineerOffer.name) private offers: Model<EngineerOffer>,
    @InjectModel(Address.name) private addresses: Model<Address>,
    @InjectConnection() private conn: Connection,
    @Optional() @Inject(NOTIFICATIONS_PORT) private notifier?: NotificationsPort,
  ) {}

  // ---- Customer flows
  async createRequest(userId: string, dto: CreateServiceRequestDto) {
    const addr = await this.addresses.findOne({ _id: dto.addressId, userId }).lean();
    if (!addr) throw new Error('ADDRESS_NOT_FOUND');

    const location = addr.coords
      ? { type: 'Point', coordinates: [addr.coords.lng, addr.coords.lat] as [number, number] }
      : { type: 'Point', coordinates: [0, 0] as [number, number] };

    const doc = await this.requests.create({
      userId: new Types.ObjectId(userId),
      title: dto.title,
      type: dto.type,
      description: dto.description,
      images: dto.images || [],
      addressId: addr._id,
      location,
      status: 'OPEN',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      engineerId: null,
    });

    await this.notifier?.emit(userId, 'SERVICE_REQUEST_OPENED', { requestId: String(doc._id) });
    return doc;
  }

  async myRequests(userId: string) {
    return this.requests.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async getRequest(userId: string, id: string) {
    return this.requests.findOne({ _id: id, userId }).lean();
  }

  async cancel(userId: string, id: string) {
    const r = await this.requests.findOne({ _id: id, userId });
    if (!r) return null;
    if (['OPEN', 'OFFERS_COLLECTING'].includes(r.status)) {
      r.status = 'CANCELLED';
      await r.save();
      await this.offers.updateMany({ requestId: r._id, status: 'OFFERED' }, { $set: { status: 'REJECTED' } });
      await this.notifier?.emit(userId, 'SERVICE_REQUEST_CANCELLED', { requestId: String(r._id) });
      return { ok: true };
    }
    return { error: 'CANNOT_CANCEL' };
  }

  async acceptOffer(userId: string, id: string, offerId: string) {
    const r = await this.requests.findOne({ _id: id, userId });
    if (!r) return { error: 'NOT_FOUND' };
    if (!['OPEN','OFFERS_COLLECTING'].includes(r.status)) return { error: 'INVALID_STATUS' };

    const offer = await this.offers.findOne({ _id: offerId, requestId: r._id, status: 'OFFERED' });
    if (!offer) return { error: 'OFFER_NOT_FOUND' };

    r.status = 'ASSIGNED';
    r.engineerId = offer.engineerId;
    r.acceptedOffer = { offerId: String(offer._id), amount: offer.amount, note: offer.note };
    await r.save();

    offer.status = 'ACCEPTED';
    await offer.save();
    await this.offers.updateMany({ requestId: r._id, _id: { $ne: offer._id }, status: 'OFFERED' }, { $set: { status: 'REJECTED' } });

    await this.notifier?.emit(String(offer.engineerId), 'OFFER_ACCEPTED', { requestId: String(r._id) });
    return { ok: true };
  }

  async rate(userId: string, id: string, score: number, comment?: string) {
    const r = await this.requests.findOne({ _id: id, userId });
    if (!r) return { error: 'NOT_FOUND' };
    if (r.status !== 'COMPLETED') return { error: 'NOT_COMPLETED' };
    r.rating = { score, comment, at: new Date() };
    r.status = 'RATED';
    await r.save();
    await this.notifier?.emit(userId, 'SERVICE_RATED', { requestId: String(r._id), score });
    return { ok: true };
  }

  // جلب العروض لطلب معين (للعميل)
  async getOffersForRequest(userId: string, requestId: string) {
    const r = await this.requests.findOne({ _id: requestId, userId });
    if (!r) return { error: 'REQUEST_NOT_FOUND' };
    
    const offers = await this.offers
      .find({ requestId: r._id })
      .populate('engineerId', 'firstName lastName phone jobTitle')
      .sort({ distanceKm: 1, amount: 1 }) // أقرب ثم أرخص
      .lean();
    
    return offers;
  }

  // ---- Engineer flows
  async nearby(engineerUserId: string, lat: number, lng: number, radiusKm: number) {
    const meters = radiusKm * 1000;
    const list = await this.requests.find({
      status: { $in: ['OPEN','OFFERS_COLLECTING'] },
      engineerId: null,
      userId: { $ne: new Types.ObjectId(engineerUserId) }, // منع المهندس من رؤية طلباته الخاصة
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: meters,
        },
      },
    }).limit(100).lean();
    return list;
  }

  // Helper: حساب المسافة بين نقطتين (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async offer(engineerUserId: string, dto: CreateOfferDto) {
    const r = await this.requests.findById(dto.requestId);
    if (!r) return { error: 'REQUEST_NOT_FOUND' };
    if (String(r.userId) === String(engineerUserId)) return { error: 'SELF_NOT_ALLOWED' };
    if (!['OPEN','OFFERS_COLLECTING'].includes(r.status)) return { error: 'INVALID_STATUS' };

    // حساب المسافة بين المهندس والطلب
    const [requestLng, requestLat] = r.location.coordinates;
    const distanceKm = this.calculateDistance(dto.lat, dto.lng, requestLat, requestLng);

    // If first offer → move to OFFERS_COLLECTING
    if (r.status === 'OPEN') { r.status = 'OFFERS_COLLECTING'; await r.save(); }

    const doc = await this.offers.findOneAndUpdate(
      { requestId: r._id, engineerId: new Types.ObjectId(engineerUserId) },
      { $set: { amount: dto.amount, note: dto.note, distanceKm: Math.round(distanceKm * 100) / 100, status: 'OFFERED' } },
      { upsert: true, new: true },
    );
    await this.notifier?.emit(String(r.userId), 'NEW_ENGINEER_OFFER', { requestId: String(r._id) });
    return doc;
  }

  async updateOffer(engineerUserId: string, id: string, patch: UpdateOfferDto) {
    const off = await this.offers.findOne({ _id: id, engineerId: engineerUserId });
    if (!off) return { error: 'NOT_FOUND' };
    if (off.status !== 'OFFERED') return { error: 'CANNOT_UPDATE' };
    if (patch.amount !== undefined) off.amount = patch.amount;
    if (patch.note !== undefined) off.note = patch.note;
    await off.save();
    return off;
  }

  async start(engineerUserId: string, requestId: string) {
    const r = await this.requests.findById(requestId);
    if (!r) return { error: 'NOT_FOUND' };
    if (String(r.engineerId) !== String(engineerUserId)) return { error: 'NOT_ASSIGNED' };
    if (r.status !== 'ASSIGNED') return { error: 'INVALID_STATUS' };
    r.status = 'IN_PROGRESS';
    await r.save();
    await this.notifier?.emit(String(r.userId), 'SERVICE_STARTED', { requestId: String(r._id) });
    return { ok: true };
  }

  async complete(engineerUserId: string, requestId: string) {
    const r = await this.requests.findById(requestId);
    if (!r) return { error: 'NOT_FOUND' };
    if (String(r.engineerId) !== String(engineerUserId)) return { error: 'NOT_ASSIGNED' };
    if (r.status !== 'IN_PROGRESS') return { error: 'INVALID_STATUS' };
    r.status = 'COMPLETED';
    await r.save();
    await this.notifier?.emit(String(r.userId), 'SERVICE_COMPLETED', { requestId: String(r._id) });
    return { ok: true };
  }

  // جلب عروض المهندس
  async myOffers(engineerUserId: string) {
    return this.offers
      .find({ engineerId: engineerUserId })
      .populate('requestId')
      .sort({ createdAt: -1 })
      .lean();
  }

  // ---- Admin
  async adminList(status?: string, page = 1, limit = 20) {
    const q: Record<string, unknown> = {}; if (status) q.status = status;
    page = Number(page); limit = Number(limit);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.requests.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.requests.countDocuments(q),
    ]);
    return { items, meta: { page, limit, total } };
  }

  async adminCancel(id: string) {
    const r = await this.requests.findById(id);
    if (!r) return { error: 'NOT_FOUND' };
    if (['COMPLETED','RATED','CANCELLED'].includes(r.status)) return { error: 'INVALID_STATUS' };
    r.status = 'CANCELLED';
    await r.save();
    await this.offers.updateMany({ requestId: r._id, status: 'OFFERED' }, { $set: { status: 'REJECTED' } });
    return { ok: true };
  }
}


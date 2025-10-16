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
    const { status, type, engineerId, userId, dateFrom, dateTo, search, page = 1, limit = 20 } = params;
    const q: Record<string, unknown> = {};
    
    if (status) q.status = status;
    if (type) q.type = { $regex: type, $options: 'i' };
    if (engineerId) q.engineerId = new Types.ObjectId(engineerId);
    if (userId) q.userId = new Types.ObjectId(userId);
    if (dateFrom || dateTo) {
      q.createdAt = {};
      if (dateFrom) q.createdAt.$gte = dateFrom;
      if (dateTo) q.createdAt.$lte = dateTo;
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
    
    const validStatuses = ['OPEN', 'OFFERS_COLLECTING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) return { error: 'INVALID_STATUS' };
    
    r.status = status as any;
    if (note) {
      r.adminNotes = r.adminNotes || [];
      r.adminNotes.push({ note, at: new Date() });
    }
    await r.save();
    
    await this.notifier?.emit(String(r.userId), 'SERVICE_STATUS_UPDATED', { 
      requestId: String(r._id), 
      status, 
      note 
    });
    
    return { ok: true };
  }

  async adminCancel(id: string, reason?: string) {
    const r = await this.requests.findById(id);
    if (!r) return { error: 'NOT_FOUND' };
    if (['COMPLETED','RATED','CANCELLED'].includes(r.status)) return { error: 'INVALID_STATUS' };
    
    r.status = 'CANCELLED';
    if (reason) {
      r.adminNotes = r.adminNotes || [];
      r.adminNotes.push({ note: `إلغاء إداري: ${reason}`, at: new Date() });
    }
    await r.save();
    
    await this.offers.updateMany({ requestId: r._id, status: 'OFFERED' }, { $set: { status: 'REJECTED' } });
    
    await this.notifier?.emit(String(r.userId), 'SERVICE_CANCELLED_BY_ADMIN', { 
      requestId: String(r._id), 
      reason 
    });
    
    return { ok: true };
  }

  async adminAssignEngineer(id: string, engineerId: string, note?: string) {
    const r = await this.requests.findById(id);
    if (!r) return { error: 'NOT_FOUND' };
    if (r.status !== 'OPEN' && r.status !== 'OFFERS_COLLECTING') return { error: 'INVALID_STATUS' };
    
    r.status = 'ASSIGNED';
    r.engineerId = new Types.ObjectId(engineerId);
    if (note) {
      r.adminNotes = r.adminNotes || [];
      r.adminNotes.push({ note: `تعيين مهندس: ${note}`, at: new Date() });
    }
    await r.save();
    
    await this.offers.updateMany({ requestId: r._id }, { $set: { status: 'REJECTED' } });
    
    await this.notifier?.emit(String(r.userId), 'ENGINEER_ASSIGNED_BY_ADMIN', { 
      requestId: String(r._id), 
      engineerId 
    });
    
    return { ok: true };
  }

  // === إحصائيات شاملة ===
  async getOverviewStatistics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

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
    ] = await Promise.all([
      this.requests.countDocuments(),
      this.offers.countDocuments(),
      this.requests.distinct('engineerId').then(ids => ids.filter(id => id !== null).length),
      this.requests.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.requests.countDocuments({ createdAt: { $gte: startOfWeek } }),
      this.requests.countDocuments({ createdAt: { $gte: startOfDay } }),
      this.requests.countDocuments({ status: 'COMPLETED' }),
      this.requests.countDocuments({ status: 'CANCELLED' }),
      this.requests.aggregate([
        { $match: { 'rating.score': { $exists: true } } },
        { $group: { _id: null, avgRating: { $avg: '$rating.score' } } },
      ]).then(result => result[0]?.avgRating || 0),
      this.requests.aggregate([
        { $match: { status: 'COMPLETED', acceptedOffer: { $exists: true } } },
        { $group: { _id: null, total: { $sum: '$acceptedOffer.amount' } } },
      ]).then(result => result[0]?.total || 0),
    ]);

    return {
      totalRequests,
      totalOffers,
      totalEngineers,
      monthlyRequests,
      weeklyRequests,
      dailyRequests,
      completedRequests,
      cancelledRequests,
      completionRate: totalRequests > 0 ? (completedRequests / totalRequests * 100).toFixed(1) : 0,
      averageRating: Number(averageRating.toFixed(1)),
      totalRevenue,
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
      matchStage.createdAt = {};
      if (dateFrom) matchStage.createdAt.$gte = dateFrom;
      if (dateTo) matchStage.createdAt.$lte = dateTo;
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
      { $sort: { _id: 1 } },
    ];

    return this.requests.aggregate(pipeline);
  }

  async getEngineersStatistics(params: {
    dateFrom?: Date;
    dateTo?: Date;
    limit: number;
  }) {
    const { dateFrom, dateTo, limit } = params;
    const matchStage: Record<string, unknown> = { engineerId: { $ne: null } };
    
    if (dateFrom || dateTo) {
      matchStage.createdAt = {};
      if (dateFrom) matchStage.createdAt.$gte = dateFrom;
      if (dateTo) matchStage.createdAt.$lte = dateTo;
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
              $cond: [
                { $gt: ['$rating.score', 0] },
                '$rating.score',
                null,
              ],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'COMPLETED'] }, { $gt: ['$acceptedOffer.amount', 0] }] },
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
            $multiply: [
              { $divide: ['$completedRequests', '$totalRequests'] },
              100,
            ],
          },
          averageRating: { $round: ['$averageRating', 1] },
          totalRevenue: 1,
        },
      },
      { $sort: { totalRequests: -1 } },
      { $limit: limit },
    ];

    return this.requests.aggregate(pipeline);
  }

  async getServiceTypesStatistics(params: {
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const { dateFrom, dateTo } = params;
    const matchStage: Record<string, unknown> = {};
    
    if (dateFrom || dateTo) {
      matchStage.createdAt = {};
      if (dateFrom) matchStage.createdAt.$gte = dateFrom;
      if (dateTo) matchStage.createdAt.$lte = dateTo;
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
                { $and: [{ $eq: ['$status', 'COMPLETED'] }, { $gt: ['$acceptedOffer.amount', 0] }] },
                '$acceptedOffer.amount',
                null,
              ],
            },
          },
        },
      },
      { $sort: { total: -1 } },
    ];

    return this.requests.aggregate(pipeline);
  }

  async getRevenueStatistics(params: {
    dateFrom?: Date;
    dateTo?: Date;
    groupBy: 'day' | 'week' | 'month';
  }) {
    const { dateFrom, dateTo, groupBy } = params;
    const matchStage = {
      status: 'COMPLETED',
      'acceptedOffer.amount': { $gt: 0 },
    };
    
    if (dateFrom || dateTo) {
      matchStage.createdAt = {};
      if (dateFrom) matchStage.createdAt.$gte = dateFrom;
      if (dateTo) matchStage.createdAt.$lte = dateTo;
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
      { $sort: { _id: 1 } },
    ];

    return this.requests.aggregate(pipeline);
  }

  // === إدارة المهندسين ===
  async getEngineersList(params: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const { page, limit, search } = params;
    const matchStage: Record<string, unknown> = {};
    
    if (search) {
      matchStage.$or = [
        { 'engineer.firstName': { $regex: search, $options: 'i' } },
        { 'engineer.lastName': { $regex: search, $options: 'i' } },
        { 'engineer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const pipeline = [
      { $match: { engineerId: { $ne: null } } },
      {
        $group: {
          _id: '$engineerId',
          totalRequests: { $sum: 1 },
          completedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          averageRating: {
            $avg: {
              $cond: [
                { $gt: ['$rating.score', 0] },
                '$rating.score',
                null,
              ],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'COMPLETED'] }, { $gt: ['$acceptedOffer.amount', 0] }] },
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
          engineerEmail: '$engineer.email',
          totalRequests: 1,
          completedRequests: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedRequests', '$totalRequests'] },
              100,
            ],
          },
          averageRating: { $round: ['$averageRating', 1] },
          totalRevenue: 1,
        },
      },
      { $match: matchStage },
      { $sort: { totalRequests: -1 } },
    ];

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.requests.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
      this.requests.aggregate([...pipeline, { $count: 'total' }]).then(result => result[0]?.total || 0),
    ]);

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
              $cond: [
                { $gt: ['$rating.score', 0] },
                '$rating.score',
                null,
              ],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'COMPLETED'] }, { $gt: ['$acceptedOffer.amount', 0] }] },
                '$acceptedOffer.amount',
                0,
              ],
            },
          },
          averageRevenue: {
            $avg: {
              $cond: [
                { $and: [{ $eq: ['$status', 'COMPLETED'] }, { $gt: ['$acceptedOffer.amount', 0] }] },
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

  async getEngineerOffers(engineerId: string, params: {
    status?: string;
    page: number;
    limit: number;
  }) {
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
}


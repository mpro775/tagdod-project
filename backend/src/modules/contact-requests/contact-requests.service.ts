import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactRequest, ContactRequestDocument, ContactRequestStatus } from './schemas/contact-request.schema';
import { CreateContactRequestDto, UpdateContactRequestStatusDto, AssignContactRequestDto, ContactRequestQueryDto } from './dto/contact-request.dto';

@Injectable()
export class ContactRequestsService {
  private readonly logger = new Logger(ContactRequestsService.name);

  constructor(
    @InjectModel(ContactRequest.name) private contactRequestModel: Model<ContactRequestDocument>,
  ) {}

  async create(dto: CreateContactRequestDto): Promise<ContactRequest> {
    const contactRequest = new this.contactRequestModel({
      ...dto,
      status: ContactRequestStatus.NEW,
      source: dto.source || 'landing_page',
      requestType: dto.requestType || 'general',
    });

    return await contactRequest.save();
  }

  async findAll(dto: ContactRequestQueryDto) {
    const { page = 1, limit = 20, requestType, status, search, sortBy, sortOrder } = dto;
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    if (requestType) query.requestType = requestType;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortBy && sortOrder) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const [requests, total] = await Promise.all([
      this.contactRequestModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      this.contactRequestModel.countDocuments(query),
    ]);

    return {
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<ContactRequestDocument> {
    const request = await this.contactRequestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException('طلب التواصل غير موجود');
    }
    return request;
  }

  async updateStatus(id: string, dto: UpdateContactRequestStatusDto): Promise<ContactRequest> {
    const request = await this.findById(id);
    request.status = dto.status as ContactRequestStatus;
    const saved = await request.save();
    return saved.toObject() as ContactRequest;
  }

  async assign(id: string, dto: AssignContactRequestDto): Promise<ContactRequest> {
    const request = await this.findById(id);
    request.assignedTo = dto.assignedTo;
    const saved = await request.save();
    return saved.toObject() as ContactRequest;
  }

  async addNotes(id: string, notes: string): Promise<ContactRequest> {
    const request = await this.findById(id);
    request.notes = notes;
    const saved = await request.save();
    return saved.toObject() as ContactRequest;
  }

  async delete(id: string): Promise<void> {
    const request = await this.findById(id);
    await this.contactRequestModel.deleteOne({ _id: id });
  }

  async getStats() {
    const [total, byStatus, byType, newCount] = await Promise.all([
      this.contactRequestModel.countDocuments({}),
      this.contactRequestModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.contactRequestModel.aggregate([
        { $group: { _id: '$requestType', count: { $sum: 1 } } },
      ]),
      this.contactRequestModel.countDocuments({ status: 'new' }),
    ]);

    return {
      total,
      newCount,
      byStatus,
      byType,
    };
  }
}

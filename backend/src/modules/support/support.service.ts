import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  TicketNotFoundException,
  SupportException,
  ForbiddenException,
  ErrorCode,
} from '../../shared/exceptions';
import { FilterQuery, Model } from 'mongoose';
import {
  SupportTicket,
  SupportTicketDocument,
  SupportStatus,
  SupportPriority,
  SupportCategory,
} from './schemas/support-ticket.schema';
import {
  SupportMessage,
  SupportMessageDocument,
  MessageType,
} from './schemas/support-message.schema';
import { CannedResponse, CannedResponseDocument } from './schemas/canned-response.schema';
import { CreateSupportTicketDto } from './dto/create-ticket.dto';
import { AddSupportMessageDto } from './dto/add-message.dto';
import { UpdateSupportTicketDto } from './dto/update-ticket.dto';
import { RateTicketDto } from './dto/rate-ticket.dto';
import { CreateCannedResponseDto, UpdateCannedResponseDto } from './dto/canned-response.dto';
import { WebSocketService } from '../../shared/websocket/websocket.service';
import { NotificationService } from '../notifications/services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../notifications/enums/notification.enums';
import { User, UserRole, UserStatus } from '../users/schemas/user.schema';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicket.name) private ticketModel: Model<SupportTicketDocument>,
    @InjectModel(SupportMessage.name) private messageModel: Model<SupportMessageDocument>,
    @InjectModel(CannedResponse.name) private cannedResponseModel: Model<CannedResponseDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly webSocketService: WebSocketService,
    private readonly notificationService?: NotificationService,
  ) {}

  // ===== Notification Helpers =====

  private async notifyAdmins(
    type: NotificationType,
    title: string,
    message: string,
    messageEn: string,
    data?: Record<string, unknown>,
  ) {
    try {
      if (!this.notificationService) return;

      const admins = await this.userModel
        .find({
          roles: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
          status: UserStatus.ACTIVE,
        })
        .select('_id')
        .lean();

      const notificationPromises = admins.map((admin) =>
        this.notificationService!.createNotification({
          recipientId: admin._id.toString(),
          type,
          title,
          message,
          messageEn,
          data,
          channel: NotificationChannel.IN_APP,
          priority: NotificationPriority.HIGH,
        }),
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      // Don't throw - notifications are not critical
    }
  }

  /**
   * Create a new support ticket
   */
  async createTicket(userId: string, dto: CreateSupportTicketDto): Promise<SupportTicketDocument> {
    const priority = dto.priority || SupportPriority.MEDIUM;
    const slaHours = this.calculateSLAHours(priority);
    const slaDueDate = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const ticket = new this.ticketModel({
      userId,
      title: dto.title,
      description: dto.description,
      category: dto.category || SupportCategory.OTHER,
      priority,
      attachments: dto.attachments || [],
      metadata: dto.metadata || {},
      slaHours,
      slaDueDate,
    });

    const savedTicket = await ticket.save();

    // Create initial message with the ticket description
    await this.createMessage(savedTicket._id.toString(), userId, {
      content: dto.description,
      attachments: dto.attachments,
      messageType: MessageType.USER_MESSAGE,
    });

    // إرسال إشعار TICKET_CREATED للمدراء
    await this.notifyAdmins(
      NotificationType.TICKET_CREATED,
      'تذكرة دعم فني جديدة',
      `تم إنشاء تذكرة دعم فني جديدة: ${savedTicket.title}`,
      `New support ticket created: ${savedTicket.title}`,
      {
        ticketId: savedTicket._id.toString(),
        ticketTitle: savedTicket.title,
        category: savedTicket.category,
        priority: savedTicket.priority,
        customerId: userId,
      },
    );

    return savedTicket;
  }

  /**
   * Get user's tickets
   */
  async getUserTickets(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    tickets: SupportTicketDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      this.ticketModel
        .find({ userId, isArchived: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'name email')
        .exec(),
      this.ticketModel.countDocuments({ userId, isArchived: false }),
    ]);

    return {
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get ticket by ID (with permission check)
   */
  async getTicket(
    ticketId: string,
    userId: string,
    isAdmin = false,
  ): Promise<SupportTicketDocument> {
    const ticket = await this.ticketModel
      .findById(ticketId)
      .populate('assignedTo', 'name email')
      .exec();

    if (!ticket) {
      throw new TicketNotFoundException({ ticketId });
    }

    // Check permissions
    if (!isAdmin && ticket.userId.toString() !== userId) {
      throw new ForbiddenException({ ticketId, userId });
    }

    return ticket;
  }

  /**
   * Get all tickets (admin only)
   */
  async getAllTickets(
    filters: {
      status?: SupportStatus;
      priority?: SupportPriority;
      category?: SupportCategory;
      assignedTo?: string;
    } = {},
    page = 1,
    limit = 20,
  ): Promise<{
    tickets: SupportTicketDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: FilterQuery<SupportTicketDocument> = { isArchived: false };

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.category) query.category = filters.category;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;

    const [tickets, total] = await Promise.all([
      this.ticketModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email')
        .exec(),
      this.ticketModel.countDocuments(query),
    ]);

    return {
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update ticket (admin only)
   */
  async updateTicket(
    ticketId: string,
    dto: UpdateSupportTicketDto,
    updatedBy: string,
  ): Promise<SupportTicketDocument> {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new TicketNotFoundException({ ticketId });
    }

    // Update status timestamps
    const updateData: UpdateSupportTicketDto & { firstResponseAt?: Date } = { ...dto };

    if (dto.status === SupportStatus.RESOLVED && !ticket.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    if (dto.status === SupportStatus.CLOSED && !ticket.closedAt) {
      updateData.closedAt = new Date();
    }

    // Track first response time
    if (dto.status === SupportStatus.IN_PROGRESS && !ticket.firstResponseAt) {
      updateData.firstResponseAt = new Date();
    }

    const updatedTicket = await this.ticketModel
      .findByIdAndUpdate(ticketId, updateData, { new: true })
      .populate('assignedTo', 'name email')
      .exec();

    if (!updatedTicket) {
      throw new TicketNotFoundException({ ticketId });
    }

    // Add system message for status change
    if (dto.status && dto.status !== ticket.status) {
      await this.createMessage(ticketId, updatedBy, {
        content: `Ticket status changed to ${dto.status}`,
        messageType: MessageType.SYSTEM_MESSAGE,
      });
    }

    return updatedTicket;
  }

  /**
   * Add message to ticket
   */
  async addMessage(
    ticketId: string,
    senderId: string,
    dto: AddSupportMessageDto,
    isAdmin = false,
  ): Promise<SupportMessageDocument> {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new TicketNotFoundException({ ticketId });
    }

    // Check permissions
    if (!isAdmin && ticket.userId.toString() !== senderId) {
      throw new ForbiddenException({ ticketId, userId: senderId });
    }

    const messageType = isAdmin ? MessageType.ADMIN_REPLY : MessageType.USER_MESSAGE;

    return this.createMessage(ticketId, senderId, {
      content: dto.content,
      attachments: dto.attachments,
      messageType,
      isInternal: dto.isInternal,
      metadata: dto.metadata,
    });
  }

  /**
   * Get ticket messages
   */
  async getTicketMessages(
    ticketId: string,
    userId: string,
    isAdmin = false,
    page = 1,
    limit = 50,
  ): Promise<{
    messages: SupportMessageDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new TicketNotFoundException({ ticketId });
    }

    // Check permissions
    if (!isAdmin && ticket.userId.toString() !== userId) {
      throw new ForbiddenException({ ticketId, userId });
    }

    const skip = (page - 1) * limit;
    const filter = isAdmin ? {} : { isInternal: false };

    const [messages, total] = await Promise.all([
      this.messageModel
        .find({ ticketId, ...filter })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'name email')
        .exec(),
      this.messageModel.countDocuments({ ticketId, ...filter }),
    ]);

    return {
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Archive ticket (soft delete)
   */
  async archiveTicket(ticketId: string, userId: string, isAdmin = false): Promise<void> {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new TicketNotFoundException({ ticketId });
    }

    // Check permissions
    if (!isAdmin && ticket.userId.toString() !== userId) {
      throw new ForbiddenException({ ticketId, userId });
    }

    await this.ticketModel.findByIdAndUpdate(ticketId, { isArchived: true });
  }

  /**
   * Get ticket statistics (admin only)
   */
  async getTicketStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    averageResponseTime: number;
    averageResolutionTime: number;
    slaBreachedCount: number;
  }> {
    const stats = await this.ticketModel.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', SupportStatus.OPEN] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', SupportStatus.IN_PROGRESS] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', SupportStatus.RESOLVED] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', SupportStatus.CLOSED] }, 1, 0] } },
        },
      },
    ]);

    const categoryStats = await this.ticketModel.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const priorityStats = await this.ticketModel.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const baseStats = stats[0] || { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };

    // Calculate average response time
    const responseTimeStats = await this.ticketModel.aggregate([
      { $match: { isArchived: false, firstResponseAt: { $exists: true } } },
      {
        $addFields: {
          responseTimeHours: {
            $divide: [{ $subtract: ['$firstResponseAt', '$createdAt'] }, 1000 * 60 * 60],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageResponseTime: { $avg: '$responseTimeHours' },
        },
      },
    ]);

    // Calculate average resolution time
    const resolutionTimeStats = await this.ticketModel.aggregate([
      { $match: { isArchived: false, resolvedAt: { $exists: true } } },
      {
        $addFields: {
          resolutionTimeHours: {
            $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageResolutionTime: { $avg: '$resolutionTimeHours' },
        },
      },
    ]);

    // Count SLA breached tickets
    const slaBreachedCount = await this.ticketModel.countDocuments({
      isArchived: false,
      slaBreached: true,
    });

    return {
      ...baseStats,
      byCategory: categoryStats.reduce(
        (acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byPriority: priorityStats.reduce(
        (acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      averageResponseTime: responseTimeStats[0]?.averageResponseTime || 0,
      averageResolutionTime: resolutionTimeStats[0]?.averageResolutionTime || 0,
      slaBreachedCount,
    };
  }

  /**
   * Calculate SLA hours based on priority
   */
  private calculateSLAHours(priority: SupportPriority): number {
    const slaMap = {
      [SupportPriority.URGENT]: 1,
      [SupportPriority.HIGH]: 4,
      [SupportPriority.MEDIUM]: 24,
      [SupportPriority.LOW]: 48,
    };
    return slaMap[priority];
  }

  /**
   * Check and update SLA breach status
   */
  async checkSLAStatus(ticketId: string): Promise<boolean> {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket || ticket.slaBreached) {
      return ticket?.slaBreached || false;
    }

    const now = new Date();
    const isBreached = ticket.slaDueDate && now > ticket.slaDueDate;

    if (isBreached) {
      await this.ticketModel.findByIdAndUpdate(ticketId, { slaBreached: true });
    }

    return isBreached || false;
  }

  /**
   * Get tickets with breached SLA
   */
  async getBreachedSLATickets(): Promise<SupportTicketDocument[]> {
    const now = new Date();
    return this.ticketModel
      .find({
        slaDueDate: { $lt: now },
        slaBreached: false,
        status: { $nin: [SupportStatus.RESOLVED, SupportStatus.CLOSED] },
      })
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .exec();
  }

  /**
   * Rate a support ticket
   */
  async rateTicket(
    ticketId: string,
    userId: string,
    dto: RateTicketDto,
  ): Promise<SupportTicketDocument> {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new TicketNotFoundException({ ticketId });
    }

    // Check permissions
    if (ticket.userId.toString() !== userId) {
      throw new ForbiddenException({ ticketId, userId });
    }

    // Check if ticket is resolved or closed
    if (![SupportStatus.RESOLVED, SupportStatus.CLOSED].includes(ticket.status)) {
      throw new SupportException(ErrorCode.TICKET_INVALID_STATUS, {
        ticketId,
        status: ticket.status,
      });
    }

    // Check if already rated
    if (ticket.rating) {
      throw new SupportException(ErrorCode.TICKET_INVALID_STATUS, {
        ticketId,
        reason: 'already_rated',
      });
    }

    const updatedTicket = await this.ticketModel
      .findByIdAndUpdate(
        ticketId,
        {
          rating: dto.rating,
          feedback: dto.feedback,
          feedbackAt: new Date(),
        },
        { new: true },
      )
      .populate('assignedTo', 'name email')
      .exec();

    if (!updatedTicket) {
      throw new TicketNotFoundException({ ticketId });
    }

    return updatedTicket;
  }

  /**
   * Create a canned response
   */
  async createCannedResponse(dto: CreateCannedResponseDto): Promise<CannedResponseDocument> {
    const cannedResponse = new this.cannedResponseModel(dto);
    return cannedResponse.save();
  }

  /**
   * Get all canned responses
   */
  async getCannedResponses(
    category?: SupportCategory,
    search?: string,
    page = 1,
    limit = 20,
  ): Promise<{
    responses: CannedResponseDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: FilterQuery<CannedResponseDocument> = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [responses, total] = await Promise.all([
      this.cannedResponseModel
        .find(query)
        .sort({ usageCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.cannedResponseModel.countDocuments(query),
    ]);

    return {
      responses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get canned response by ID
   */
  async getCannedResponse(id: string): Promise<CannedResponseDocument> {
    const response = await this.cannedResponseModel.findById(id);
    if (!response) {
      throw new SupportException(ErrorCode.TICKET_INVALID_STATUS, {
        responseId: id,
        reason: 'not_found',
      });
    }
    return response;
  }

  /**
   * Update canned response
   */
  async updateCannedResponse(
    id: string,
    dto: UpdateCannedResponseDto,
  ): Promise<CannedResponseDocument> {
    const response = await this.cannedResponseModel.findByIdAndUpdate(id, dto, { new: true });
    if (!response) {
      throw new SupportException(ErrorCode.TICKET_INVALID_STATUS, {
        responseId: id,
        reason: 'not_found',
      });
    }
    return response;
  }

  /**
   * Delete canned response
   */
  async deleteCannedResponse(id: string): Promise<void> {
    const response = await this.cannedResponseModel.findByIdAndDelete(id);
    if (!response) {
      throw new SupportException(ErrorCode.TICKET_INVALID_STATUS, {
        responseId: id,
        reason: 'not_found',
      });
    }
  }

  /**
   * Use canned response (increment usage count)
   */
  async useCannedResponse(id: string): Promise<CannedResponseDocument> {
    const response = await this.cannedResponseModel.findByIdAndUpdate(
      id,
      { $inc: { usageCount: 1 } },
      { new: true },
    );
    if (!response) {
      throw new SupportException(ErrorCode.TICKET_INVALID_STATUS, {
        responseId: id,
        reason: 'not_found',
      });
    }
    return response;
  }

  /**
   * Get canned response by shortcut
   */
  async getCannedResponseByShortcut(shortcut: string): Promise<CannedResponseDocument> {
    const response = await this.cannedResponseModel.findOne({
      shortcut,
      isActive: true,
    });
    if (!response) {
      throw new SupportException(ErrorCode.TICKET_INVALID_STATUS, {
        shortcut,
        reason: 'not_found',
      });
    }
    return response;
  }

  /**
   * Private method to create a message
   */
  private async createMessage(
    ticketId: string,
    senderId: string,
    data: {
      content: string;
      attachments?: string[];
      messageType: MessageType;
      isInternal?: boolean;
      metadata?: Record<string, unknown>;
    },
  ): Promise<SupportMessageDocument> {
    const message = new this.messageModel({
      ticketId,
      senderId,
      content: data.content,
      attachments: data.attachments || [],
      messageType: data.messageType,
      isInternal: data.isInternal || false,
      metadata: data.metadata || {},
    });

    const savedMessage = await message.save();

    // إرسال الرسالة عبر WebSocket إلى جميع المشتركين في التذكرة
    if (!data.isInternal) {
      const ticket = await this.ticketModel.findById(ticketId);
      if (ticket) {
        const messageObj = savedMessage.toObject();
        const messageData = {
          id: savedMessage._id.toString(),
          ticketId: ticketId,
          senderId: senderId,
          content: data.content,
          attachments: data.attachments || [],
          messageType: data.messageType,
          createdAt: (messageObj as { createdAt?: Date }).createdAt || new Date(),
        };

        // إرسال إلى room التذكرة (استثناء المرسل)
        this.webSocketService.sendToTicket(ticketId, 'message:new', messageData, senderId);

        // إرسال إشعار للمستخدم الآخر إذا لم يكن هو المرسل
        if (ticket.userId.toString() !== senderId) {
          this.webSocketService.sendToUser(ticket.userId.toString(), 'support:new-message', {
            ticketId: ticketId,
            ticketTitle: ticket.title,
            message: messageData,
          });
        }

        // إرسال إشعار SUPPORT_MESSAGE_RECEIVED للمدراء إذا كانت الرسالة من العميل
        if (data.messageType === MessageType.USER_MESSAGE && this.notificationService) {
          await this.notifyAdmins(
            NotificationType.SUPPORT_MESSAGE_RECEIVED,
            'رسالة دعم فني جديدة',
            `رسالة جديدة في التذكرة: ${ticket.title}`,
            `New message in ticket: ${ticket.title}`,
            {
              ticketId: ticketId,
              ticketTitle: ticket.title,
              messageId: savedMessage._id.toString(),
              customerId: ticket.userId.toString(),
            },
          );
        }
      }
    }

    return savedMessage;
  }
}

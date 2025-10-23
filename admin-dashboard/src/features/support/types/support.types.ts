import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Support Enums - متطابق 100% مع Backend
export enum SupportCategory {
  // eslint-disable-next-line no-unused-vars
  TECHNICAL = 'technical',
  // eslint-disable-next-line no-unused-vars
  BILLING = 'billing',
  // eslint-disable-next-line no-unused-vars
  PRODUCTS = 'products',
  // eslint-disable-next-line no-unused-vars
  SERVICES = 'services',
  // eslint-disable-next-line no-unused-vars
  ACCOUNT = 'account',
  // eslint-disable-next-line no-unused-vars
  OTHER = 'other',
}

export enum SupportPriority {
  // eslint-disable-next-line no-unused-vars
  LOW = 'low',
  // eslint-disable-next-line no-unused-vars
  MEDIUM = 'medium',
  // eslint-disable-next-line no-unused-vars
  HIGH = 'high',
  // eslint-disable-next-line no-unused-vars
  URGENT = 'urgent',
}

export enum SupportStatus {
  // eslint-disable-next-line no-unused-vars
  OPEN = 'open',
  // eslint-disable-next-line no-unused-vars
  IN_PROGRESS = 'in_progress',
  // eslint-disable-next-line no-unused-vars
  WAITING_FOR_USER = 'waiting_for_user',
  // eslint-disable-next-line no-unused-vars
  RESOLVED = 'resolved',
  // eslint-disable-next-line no-unused-vars
  CLOSED = 'closed',
}

export enum MessageType {
  // eslint-disable-next-line no-unused-vars
  USER_MESSAGE = 'user_message',
  // eslint-disable-next-line no-unused-vars
  ADMIN_REPLY = 'admin_reply',
  // eslint-disable-next-line no-unused-vars
  SYSTEM_MESSAGE = 'system_message',
}

// Support Ticket Interface - متطابق 100% مع Backend Schema
export interface SupportTicket extends BaseEntity {
  userId: string;
  title: string;
  description: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  assignedTo: string | null;
  attachments: string[];
  tags: string[];
  isArchived: boolean;
  
  // Timing
  firstResponseAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  
  // SLA
  slaHours: number;
  slaDueDate?: Date;
  slaBreached: boolean;
  
  // Rating
  rating?: number;
  feedback?: string;
  feedbackAt?: Date;
  
  metadata?: Record<string, unknown>;
}

// Support Message Interface - متطابق 100% مع Backend Schema
export interface SupportMessage extends BaseEntity {
  ticketId: string;
  senderId: string;
  messageType: MessageType;
  content: string;
  attachments: string[];
  isInternal: boolean;
  metadata?: Record<string, unknown>;
}

// Canned Response Interface - متطابق 100% مع Backend Schema
export interface CannedResponse extends BaseEntity {
  title: string;
  content: string;
  contentEn: string;
  category?: SupportCategory;
  tags: string[];
  isActive: boolean;
  usageCount: number;
  shortcut?: string;
}

// DTOs - متطابقة 100% مع Backend DTOs
export interface CreateSupportTicketDto {
  title: string;
  description: string;
  category?: SupportCategory;
  priority?: SupportPriority;
  attachments?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateSupportTicketDto {
  status?: SupportStatus;
  priority?: SupportPriority;
  category?: SupportCategory;
  assignedTo?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  firstResponseAt?: Date;
}

export interface AddSupportMessageDto {
  content: string;
  attachments?: string[];
  isInternal?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CreateCannedResponseDto {
  title: string;
  content: string;
  contentEn: string;
  category?: SupportCategory;
  tags?: string[];
  shortcut?: string;
}

export interface UpdateCannedResponseDto {
  title?: string;
  content?: string;
  contentEn?: string;
  category?: SupportCategory;
  tags?: string[];
  shortcut?: string;
  isActive?: boolean;
}

export interface ListTicketsParams extends ListParams {
  status?: SupportStatus;
  priority?: SupportPriority;
  category?: SupportCategory;
  assignedTo?: string;
}

export interface ListCannedResponsesParams extends ListParams {
  category?: SupportCategory;
  search?: string;
}

// Support Stats - متطابق مع Backend Response
export interface SupportStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  slaBreached: number;
  byCategory: Record<SupportCategory, number>;
  byPriority: Record<SupportPriority, number>;
}

// SLA Status Response
export interface SLAStatusResponse {
  ticketId: string;
  slaBreached: boolean;
}

// Breached SLA Tickets Response
export interface BreachedSLATicketsResponse {
  tickets: SupportTicket[];
  totalBreached: number;
  criticalCount: number;
}


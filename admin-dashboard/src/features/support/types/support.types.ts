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

// Support Ticket Interface
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

// Support Message Interface
export interface SupportMessage extends BaseEntity {
  ticketId: string;
  userId: string;
  message: string;
  isAdminReply: boolean;
  attachments?: string[];
  isInternal?: boolean;
}

// DTOs
export interface CreateSupportTicketDto {
  title: string;
  description: string;
  category?: SupportCategory;
  priority?: SupportPriority;
  attachments?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateSupportTicketDto {
  title?: string;
  description?: string;
  category?: SupportCategory;
  priority?: SupportPriority;
  status?: SupportStatus;
  assignedTo?: string;
  tags?: string[];
}

export interface AddSupportMessageDto {
  message: string;
  attachments?: string[];
  isInternal?: boolean;
}

export interface ListTicketsParams extends ListParams {
  status?: SupportStatus;
  priority?: SupportPriority;
  category?: SupportCategory;
  assignedTo?: string;
}

// Support Stats
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


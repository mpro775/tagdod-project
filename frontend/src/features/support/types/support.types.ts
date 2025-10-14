import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Support Enums - متطابق 100% مع Backend
export enum SupportCategory {
  TECHNICAL = 'technical',
  BILLING = 'billing',
  PRODUCTS = 'products',
  SERVICES = 'services',
  ACCOUNT = 'account',
  OTHER = 'other',
}

export enum SupportPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum SupportStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_FOR_USER = 'waiting_for_user',
  RESOLVED = 'resolved',
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
  
  metadata?: Record<string, any>;
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


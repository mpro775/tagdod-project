import { BaseEntity, ListParams } from '@/shared/types/common.types';

export enum ServiceStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface ServiceRequest extends BaseEntity {
  userId: string;
  type: string;
  description: string;
  status: ServiceStatus;
  assignedEngineerId?: string;
  scheduledDate?: Date;
  completedAt?: Date;
}

export interface ListServicesParams extends ListParams {
  status?: ServiceStatus;
}


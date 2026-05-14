export type RequestType = 'general' | 'technical_support' | 'service_center' | 'maintenance' | 'contracting' | 'partnership' | 'other';
export type RequestStatus = 'new' | 'in_review' | 'contacted' | 'converted' | 'closed';
export type RequestSource = 'landing_page' | 'website' | 'mobile_app' | 'admin';

export interface ContactRequest {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  requestType: RequestType;
  subject?: string;
  message: string;
  source: RequestSource;
  status: RequestStatus;
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactRequestDto {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  requestType: RequestType;
  subject?: string;
  message: string;
  source?: RequestSource;
}

export interface UpdateContactRequestStatusDto {
  status: RequestStatus;
}

export interface AssignContactRequestDto {
  assignedTo: string;
}

export interface AddNoteDto {
  notes: string;
}

export interface ListContactRequestsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  requestType?: RequestType;
  status?: RequestStatus;
  source?: RequestSource;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

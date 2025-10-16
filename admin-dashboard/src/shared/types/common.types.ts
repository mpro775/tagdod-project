// Common Types

export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  requestId: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    fieldErrors?: FieldError[];
  };
  requestId: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams extends ListParams {
  [key: string]: unknown;
}

// Status Types
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

// Common Actions
export type Action = 'create' | 'read' | 'update' | 'delete';

// Language
export type Language = 'ar' | 'en';

// Direction
export type Direction = 'ltr' | 'rtl';

// Theme
export type ThemeMode = 'light' | 'dark';

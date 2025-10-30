import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Attribute Type - متطابق مع Backend
export enum AttributeType {
  // eslint-disable-next-line no-unused-vars
  SELECT = 'select',
  // eslint-disable-next-line no-unused-vars
  MULTISELECT = 'multiselect',
  // eslint-disable-next-line no-unused-vars
  TEXT = 'text',
  // eslint-disable-next-line no-unused-vars
  NUMBER = 'number',
  // eslint-disable-next-line no-unused-vars
  BOOLEAN = 'boolean',
  // eslint-disable-next-line no-unused-vars
  COLOR = 'color',
}

// Attribute Interface - متطابق تماماً مع Backend
export interface Attribute extends BaseEntity {
  name: string; // Arabic
  nameEn: string; // English
  slug: string;
  type: AttributeType;
  description?: string;

  // Display & Order
  order: number;
  isActive: boolean;
  isFilterable: boolean;
  isRequired: boolean;
  showInFilters: boolean;

  // Group
  groupId?: string | null;

  // Statistics
  usageCount: number;

  // Soft Delete
  deletedAt?: Date | null;
  deletedBy?: string;

  // Populated
  group?: AttributeGroup;
  values?: AttributeValue[];
}

// Attribute Value Interface - متطابق تماماً مع Backend
export interface AttributeValue extends BaseEntity {
  attributeId: string;
  value: string; // Arabic
  valueEn?: string; // English
  slug: string;

  // Additional Info
  hexCode?: string; // For colors
  imageUrl?: string;
  imageId?: string;
  description?: string;

  // Display & Order
  order: number;
  isActive: boolean;

  // Statistics
  usageCount: number;

  // Soft Delete
  deletedAt?: Date | null;
  deletedBy?: string;
}

// Attribute Group
export interface AttributeGroup extends BaseEntity {
  name: string;
  nameEn: string;
  slug: string;
  order: number;
  isActive: boolean;
}

// DTOs - متطابقة مع Backend

export interface CreateAttributeDto {
  name: string;
  nameEn: string;
  type: AttributeType;
  description?: string;
  order?: number;
  // ملاحظة: isActive غير موجود في CreateDto في Backend
  // يتم تعيينه تلقائياً كـ true في Backend
  isFilterable?: boolean;
  isRequired?: boolean;
  showInFilters?: boolean;
  groupId?: string | null;
}

export interface UpdateAttributeDto {
  name?: string;
  nameEn?: string;
  type?: AttributeType;
  description?: string;
  order?: number;
  isActive?: boolean; // UpdateDto يحتوي على isActive
  isFilterable?: boolean;
  isRequired?: boolean;
  showInFilters?: boolean;
  groupId?: string | null;
}

export interface CreateAttributeValueDto {
  value: string;
  valueEn?: string;
  hexCode?: string;
  imageUrl?: string;
  imageId?: string;
  description?: string;
  order?: number;
  // ملاحظة: isActive غير موجود في CreateDto في Backend
  // يتم تعيينه تلقائياً كـ true في Backend
}

export interface UpdateAttributeValueDto {
  value?: string;
  valueEn?: string;
  hexCode?: string;
  imageUrl?: string;
  imageId?: string;
  description?: string;
  order?: number;
  isActive?: boolean; // UpdateDto يحتوي على isActive
}

export interface ListAttributesParams extends ListParams {
  type?: AttributeType;
  isActive?: boolean;
  isFilterable?: boolean;
  groupId?: string;
  includeDeleted?: boolean;
}

// ==================== Backend Response Types ====================

export interface BackendResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AttributeStats {
  total: number;
  active: number;
  filterable: number;
  byType: {
    select: number;
    multiselect: number;
    text: number;
    number: number;
    boolean: number;
    color: number;
  };
}

// ==================== Form Types ====================

export interface AttributeFormData {
  name: string;
  nameEn: string;
  type: AttributeType;
  description?: string;
  order?: number;
  isActive?: boolean;
  isFilterable?: boolean;
  isRequired?: boolean;
  showInFilters?: boolean;
  groupId?: string | null;
}

export interface AttributeValueFormData {
  value: string;
  valueEn?: string;
  hexCode?: string;
  imageUrl?: string;
  imageId?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}


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
  isActive?: boolean;
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
  isActive?: boolean;
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
  isActive?: boolean;
}

export interface UpdateAttributeValueDto {
  value?: string;
  valueEn?: string;
  hexCode?: string;
  imageUrl?: string;
  imageId?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface ListAttributesParams extends ListParams {
  type?: AttributeType;
  isActive?: boolean;
  isFilterable?: boolean;
  groupId?: string;
  includeDeleted?: boolean;
}


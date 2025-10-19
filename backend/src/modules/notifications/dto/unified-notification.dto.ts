import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsMongoId,
  IsInt,
  Min,
  Max,
  MaxLength,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  NotificationType,
  NotificationStatus,
  NotificationChannel,
  NotificationPriority,
  NotificationCategory,
  DevicePlatform,
} from '../enums/notification.enums';
import { PaginationMetaDto } from '../../../shared/dto/api-responses.dto';

// ===== Base DTOs =====
export class BaseNotificationDto {
  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(1000)
  message!: string;

  @IsString()
  @MaxLength(1000)
  messageEn!: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;
}

// ===== Create Notification DTO =====
export class CreateNotificationDto extends BaseNotificationDto {
  @IsOptional()
  @IsMongoId()
  recipientId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  templateKey?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  scheduledFor?: Date;

  @IsOptional()
  @IsMongoId()
  createdBy?: string;

  @IsOptional()
  @IsBoolean()
  isSystemGenerated?: boolean;
}

// ===== Update Notification DTO =====
export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  messageEn?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  scheduledFor?: Date;
}

// ===== List Notifications DTO =====
export class ListNotificationsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsMongoId()
  recipientId?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}

// ===== Mark as Read DTO =====
export class MarkAsReadDto {
  @IsArray()
  @IsMongoId({ each: true })
  notificationIds!: string[];
}

// ===== Bulk Send DTO =====
export class BulkSendNotificationDto extends BaseNotificationDto {
  @IsArray()
  @IsMongoId({ each: true })
  targetUserIds!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  templateKey?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  scheduledFor?: Date;

  @IsOptional()
  @IsBoolean()
  isSystemGenerated?: boolean;
}

// ===== Template DTOs =====
export class CreateTemplateDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(100)
  key!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(1000)
  message!: string;

  @IsString()
  @MaxLength(1000)
  messageEn!: string;

  @IsOptional()
  @IsString()
  template?: string;

  @ValidateNested()
  @Type(() => Object)
  channels!: {
    inApp: boolean;
    push: boolean;
    sms: boolean;
    email: boolean;
  };

  @IsString()
  type!: string;

  @IsEnum(NotificationCategory)
  category!: NotificationCategory;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean' | 'date';
      required: boolean;
      defaultValue?: unknown;
      description?: string;
    }
  >;

  @IsOptional()
  @IsObject()
  exampleData?: Record<string, unknown>;
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  messageEn?: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  channels?: {
    inApp?: boolean;
    push?: boolean;
    sms?: boolean;
    email?: boolean;
  };

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ===== Preference DTOs =====
export class UpdatePreferenceDto {
  @IsOptional()
  @IsBoolean()
  enableNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  enableInApp?: boolean;

  @IsOptional()
  @IsBoolean()
  enablePush?: boolean;

  @IsOptional()
  @IsBoolean()
  enableSms?: boolean;

  @IsOptional()
  @IsBoolean()
  enableEmail?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
    days: number[];
  };

  @IsOptional()
  @IsObject()
  categoryPreferences?: Partial<
    Record<
      NotificationCategory,
      {
        inApp?: boolean;
        push?: boolean;
        sms?: boolean;
        email?: boolean;
      }
    >
  >;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mutedTemplates?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  priorityTemplates?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  deliveryPreferences?: {
    groupNotifications?: boolean;
    batchInterval?: number;
    instantDelivery?: boolean;
  };

  @IsOptional()
  @IsString()
  @MaxLength(255)
  preferredEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  preferredPhone?: string;

  @IsOptional()
  @IsEnum(['ar', 'en'])
  preferredLanguage?: 'ar' | 'en';

  @IsOptional()
  @IsBoolean()
  receiveMarketingEmails?: boolean;

  @IsOptional()
  @IsBoolean()
  receiveMarketingSms?: boolean;

  @IsOptional()
  @IsBoolean()
  receivePromotionalPush?: boolean;

  @IsOptional()
  @IsBoolean()
  receiveNewsletter?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  frequencyLimits?: {
    maxNotificationsPerDay?: number;
    maxEmailsPerWeek?: number;
    maxSmsPerMonth?: number;
    maxPushPerHour?: number;
  };
}

// ===== Device Token DTOs =====
export class RegisterDeviceDto {
  @IsEnum(DevicePlatform)
  platform!: DevicePlatform;

  @IsString()
  @MaxLength(500)
  token!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  appVersion?: string;
}

export class UpdateDeviceTokenDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  token?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ===== Statistics DTOs =====
export class NotificationStatsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @IsOptional()
  @IsMongoId()
  userId?: string;
}

// ===== Response DTOs =====
export class NotificationResponseDto {
  success!: boolean;
  data?: unknown;
  meta?: PaginationMetaDto;
  message?: string;
}

export class NotificationListResponseDto {
  success!: boolean;
  data!: {
    notifications: unknown[];
    total: number;
  };
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class NotificationStatsResponseDto {
  success!: boolean;
  data!: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byChannel: Record<string, number>;
    byCategory: Record<string, number>;
    unreadCount: number;
    readRate: number;
    deliveryRate: number;
  };
}

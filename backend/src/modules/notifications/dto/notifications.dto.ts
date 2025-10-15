import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsMongoId, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListQueryDto {
  @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) limit: number = 20;
  @IsOptional() @IsIn(['inapp','push','sms','email']) channel?: 'inapp'|'push'|'sms'|'email';
}

export class MarkReadDto {
  @IsArray() @IsMongoId({ each: true }) ids!: string[];
}

export class ReadAllDto {
  @IsOptional() @IsIn(['inapp','push','sms','email']) channel?: 'inapp'|'push'|'sms'|'email';
}

export class RegisterDeviceDto {
  @IsIn(['ios','android','web']) platform!: 'ios'|'android'|'web';
  @IsString() token!: string;
  @IsOptional() @IsString() userAgent?: string;
  @IsOptional() @IsString() appVersion?: string;
}

export class AdminTestDto {
  @IsMongoId() userId!: string;
  @IsString() templateKey!: string;
  payload!: Record<string, unknown>;
}

export class AdminListNotificationsDto {
  @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) limit: number = 20;
  @IsOptional() @IsIn(['inapp','push','sms','email']) channel?: 'inapp'|'push'|'sms'|'email';
  @IsOptional() @IsIn(['queued','sent','failed','read']) status?: 'queued'|'sent'|'failed'|'read';
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsMongoId() userId?: string;
}

export class AdminCreateNotificationDto {
  @IsString() title!: string;
  @IsString() body!: string;
  @IsIn(['inapp','push','sms','email']) channel!: 'inapp'|'push'|'sms'|'email';
  @IsOptional() @IsString() templateKey?: string;
  @IsOptional() payload?: Record<string, unknown>;
  @IsOptional() @IsString() link?: string;
  @IsOptional() @IsArray() @IsMongoId({ each: true }) targetUsers?: string[];
  @IsOptional() @IsString() scheduledAt?: string; // ISO date string
}

export class AdminUpdateNotificationDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() link?: string;
  @IsOptional() payload?: Record<string, unknown>;
}

export class AdminSendNotificationDto {
  @IsOptional() @IsArray() @IsMongoId({ each: true }) targetUsers?: string[];
  @IsOptional() @IsString() scheduledAt?: string; // ISO date string
}
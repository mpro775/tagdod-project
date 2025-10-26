import { IsString, IsOptional, IsBoolean, IsNumber, IsEmail, IsUrl, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SettingCategory {
  GENERAL = 'general',
  EMAIL = 'email',
  PAYMENT = 'payment',
  SHIPPING = 'shipping',
  SECURITY = 'security',
  NOTIFICATIONS = 'notifications',
  SEO = 'seo',
  ADVANCED = 'advanced',
}

export class UpdateSettingDto {
  @ApiProperty({ description: 'قيمة الإعداد' })
  value: any;

  @ApiPropertyOptional({ description: 'الوصف' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateSettingDto {
  @ApiProperty({ description: 'مفتاح الإعداد', example: 'site_name' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'قيمة الإعداد' })
  value: any;

  @ApiProperty({ 
    description: 'الفئة', 
    enum: SettingCategory,
    default: SettingCategory.GENERAL
  })
  @IsEnum(SettingCategory)
  category: SettingCategory;

  @ApiPropertyOptional({ description: 'نوع البيانات', enum: ['string', 'number', 'boolean', 'object', 'array'] })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'وصف الإعداد' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'هل هذا الإعداد عام (يمكن للمستخدمين رؤيته)؟' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class SettingDto {
  @ApiProperty({ description: 'معرف الإعداد' })
  id: string;

  @ApiProperty({ description: 'مفتاح الإعداد' })
  key: string;

  @ApiProperty({ description: 'قيمة الإعداد' })
  value: any;

  @ApiProperty({ description: 'الفئة', enum: SettingCategory })
  category: string;

  @ApiProperty({ description: 'نوع البيانات' })
  type: string;

  @ApiProperty({ description: 'الوصف' })
  description?: string;

  @ApiProperty({ description: 'هل عام؟' })
  isPublic: boolean;

  @ApiProperty({ description: 'آخر تحديث' })
  updatedAt: Date;

  @ApiProperty({ description: 'آخر من قام بالتحديث' })
  updatedBy?: string;
}

export class BulkUpdateSettingsDto {
  @ApiProperty({ 
    description: 'الإعدادات المراد تحديثها',
    example: {
      site_name: 'TagDoD',
      site_description: 'منصة الطاقة الشمسية',
      maintenance_mode: false,
    }
  })
  @IsObject()
  settings: Record<string, any>;
}

// Predefined settings interfaces for type safety
export class GeneralSettingsDto {
  @ApiPropertyOptional({ description: 'اسم الموقع' })
  site_name?: string;

  @ApiPropertyOptional({ description: 'وصف الموقع' })
  site_description?: string;

  @ApiPropertyOptional({ description: 'الشعار' })
  logo_url?: string;

  @ApiPropertyOptional({ description: 'Favicon' })
  favicon_url?: string;

  @ApiPropertyOptional({ description: 'المنطقة الزمنية' })
  timezone?: string;

  @ApiPropertyOptional({ description: 'اللغة الافتراضية' })
  default_language?: string;

  @ApiPropertyOptional({ description: 'العملة الافتراضية' })
  default_currency?: string;

  @ApiPropertyOptional({ description: 'وضع الصيانة' })
  maintenance_mode?: boolean;

  @ApiPropertyOptional({ description: 'رسالة وضع الصيانة' })
  maintenance_message?: string;
}

export class EmailSettingsDto {
  @ApiPropertyOptional({ description: 'SMTP Host' })
  smtp_host?: string;

  @ApiPropertyOptional({ description: 'SMTP Port' })
  smtp_port?: number;

  @ApiPropertyOptional({ description: 'SMTP User' })
  smtp_user?: string;

  @ApiPropertyOptional({ description: 'SMTP Password (مشفر)' })
  smtp_password?: string;

  @ApiPropertyOptional({ description: 'SMTP Secure (TLS)' })
  smtp_secure?: boolean;

  @ApiPropertyOptional({ description: 'بريد المرسل' })
  from_email?: string;

  @ApiPropertyOptional({ description: 'اسم المرسل' })
  from_name?: string;
}

export class PaymentSettingsDto {
  @ApiPropertyOptional({ description: 'تفعيل الدفع عند الاستلام' })
  cod_enabled?: boolean;

  @ApiPropertyOptional({ description: 'تفعيل البطاقات' })
  card_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Stripe Public Key' })
  stripe_public_key?: string;

  @ApiPropertyOptional({ description: 'Stripe Secret Key (مشفر)' })
  stripe_secret_key?: string;

  @ApiPropertyOptional({ description: 'رسوم الدفع (%)' })
  payment_fee_percentage?: number;
}

export class ShippingSettingsDto {
  @ApiPropertyOptional({ description: 'تفعيل الشحن المجاني' })
  free_shipping_enabled?: boolean;

  @ApiPropertyOptional({ description: 'الحد الأدنى للشحن المجاني' })
  free_shipping_threshold?: number;

  @ApiPropertyOptional({ description: 'تكلفة الشحن الافتراضية' })
  default_shipping_cost?: number;

  @ApiPropertyOptional({ description: 'مدة التوصيل المتوقعة (أيام)' })
  estimated_delivery_days?: number;
}

export class SecuritySettingsDto {
  @ApiPropertyOptional({ description: 'المصادقة الثنائية إجبارية' })
  force_2fa?: boolean;

  @ApiPropertyOptional({ description: 'مدة صلاحية الجلسة (دقائق)' })
  session_timeout?: number;

  @ApiPropertyOptional({ description: 'الحد الأقصى لمحاولات تسجيل الدخول' })
  max_login_attempts?: number;

  @ApiPropertyOptional({ description: 'مدة الحظر بعد الفشل (دقائق)' })
  lockout_duration?: number;

  @ApiPropertyOptional({ description: 'قوة كلمة المرور (ضعيفة/متوسطة/قوية)' })
  password_strength?: string;
}

export class NotificationSettingsDto {
  @ApiPropertyOptional({ description: 'إشعارات البريد الإلكتروني' })
  email_notifications_enabled?: boolean;

  @ApiPropertyOptional({ description: 'إشعارات SMS' })
  sms_notifications_enabled?: boolean;

  @ApiPropertyOptional({ description: 'إشعارات Push' })
  push_notifications_enabled?: boolean;

  @ApiPropertyOptional({ description: 'إشعار الطلبات الجديدة' })
  notify_new_orders?: boolean;

  @ApiPropertyOptional({ description: 'إشعار المخزون المنخفض' })
  notify_low_stock?: boolean;
}

export class SEOSettingsDto {
  @ApiPropertyOptional({ description: 'Meta Title الافتراضي' })
  default_meta_title?: string;

  @ApiPropertyOptional({ description: 'Meta Description الافتراضي' })
  default_meta_description?: string;

  @ApiPropertyOptional({ description: 'Meta Keywords الافتراضية' })
  default_meta_keywords?: string;

  @ApiPropertyOptional({ description: 'Google Analytics ID' })
  google_analytics_id?: string;

  @ApiPropertyOptional({ description: 'Google Tag Manager ID' })
  google_tag_manager_id?: string;

  @ApiPropertyOptional({ description: 'Facebook Pixel ID' })
  facebook_pixel_id?: string;
}


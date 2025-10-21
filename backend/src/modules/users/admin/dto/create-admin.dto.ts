import { IsString, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../schemas/user.schema';
import { AdminPermission } from '../../../../shared/constants/permissions';

export class CreateAdminDto {
  @ApiProperty({
    description: 'رقم هاتف الأدمن',
    example: '+966501234567',
  })
  @IsString()
  phone!: string;

  @ApiProperty({
    description: 'الاسم الأول',
    example: 'أحمد',
  })
  @IsString()
  firstName!: string;

  @ApiPropertyOptional({
    description: 'الاسم الأخير',
    example: 'محمد',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'الجنس',
    enum: ['male', 'female', 'other'],
    example: 'male',
  })
  @IsOptional()
  @IsString()
  gender?: 'male' | 'female' | 'other';

  @ApiProperty({
    description: 'الأدوار الممنوحة للأدمن',
    type: [String],
    enum: UserRole,
    example: [UserRole.ADMIN],
  })
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles!: UserRole[];

  @ApiProperty({
    description: 'الصلاحيات المخصصة للأدمن',
    type: [String],
    enum: AdminPermission,
    example: [
      AdminPermission.USERS_READ,
      AdminPermission.PRODUCTS_READ,
      AdminPermission.ORDERS_READ,
      AdminPermission.ADMIN_ACCESS,
    ],
  })
  @IsArray()
  @IsEnum(AdminPermission, { each: true })
  permissions!: AdminPermission[];

  @ApiPropertyOptional({
    description: 'كلمة مرور مؤقتة (سيتم تغييرها عند أول تسجيل دخول)',
    example: 'TempPass123!',
  })
  @IsOptional()
  @IsString()
  temporaryPassword?: string;

  @ApiPropertyOptional({
    description: 'تفعيل الحساب فوراً',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activateImmediately?: boolean = true;

  @ApiPropertyOptional({
    description: 'وصف الدور والمسؤوليات',
    example: 'أدمن المنتجات والمبيعات',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

// DTO لتخصيص الأدمن بناءً على الدور
export class CreateRoleBasedAdminDto {
  @ApiProperty({
    description: 'نوع الأدمن المطلوب',
    enum: ['full_admin', 'product_manager', 'sales_manager', 'support_manager', 'marketing_manager', 'content_manager', 'view_only'],
    example: 'product_manager',
  })
  @IsString()
  adminType!: 'full_admin' | 'product_manager' | 'sales_manager' | 'support_manager' | 'marketing_manager' | 'content_manager' | 'view_only';

  @ApiProperty({
    description: 'رقم هاتف الأدمن',
    example: '+966501234567',
  })
  @IsString()
  phone!: string;

  @ApiProperty({
    description: 'الاسم الأول',
    example: 'أحمد',
  })
  @IsString()
  firstName!: string;

  @ApiPropertyOptional({
    description: 'الاسم الأخير',
    example: 'محمد',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'الجنس',
    enum: ['male', 'female', 'other'],
    example: 'male',
  })
  @IsOptional()
  @IsString()
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({
    description: 'صلاحيات إضافية للدور المحدد',
    type: [String],
    enum: AdminPermission,
    example: [AdminPermission.SYSTEM_LOGS],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AdminPermission, { each: true })
  additionalPermissions?: AdminPermission[];

  @ApiPropertyOptional({
    description: 'وصف الدور والمسؤوليات',
    example: 'أدمن المنتجات مع صلاحيات النظام',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

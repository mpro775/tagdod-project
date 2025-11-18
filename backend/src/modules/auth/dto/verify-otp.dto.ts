import { IsString, IsOptional, IsIn, IsNumberString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'رقم الهاتف المرتبط بكود التحقق',
    example: '+966501234567',
    pattern: '^\\+?[1-9]\\d{1,14}$',
    minLength: 10,
    maxLength: 15
  })
  @IsString() phone!: string;

  @ApiProperty({
    description: 'كود التحقق المرسل عبر الرسائل النصية',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    pattern: '^[0-9]{6}$'
  })
  @IsNumberString() @Length(6, 6) code!: string;

  @ApiPropertyOptional({
    description: 'الاسم الأول للمستخدم (للتسجيل)',
    example: 'أحمد',
    minLength: 2,
    maxLength: 50
  })
  @IsOptional() @IsString() firstName?: string;

  @ApiPropertyOptional({
    description: 'الاسم الأخير للمستخدم (للتسجيل)',
    example: 'محمد',
    minLength: 2,
    maxLength: 50
  })
  @IsOptional() @IsString() lastName?: string;

  @ApiPropertyOptional({
    description: 'الجنس',
    enum: ['male', 'female', 'other'],
    example: 'male'
  })
  @IsOptional() @IsString() gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({
    description: 'المدينة',
    example: 'صنعاء',
    minLength: 2,
    maxLength: 50
  })
  @IsOptional() @IsString() city?: string;

  @ApiPropertyOptional({
    description: 'نوع القدرة المطلوبة',
    enum: ['engineer', 'merchant'],
    example: 'engineer'
  })
  @IsOptional() @IsIn(['engineer', 'merchant']) capabilityRequest?: 'engineer' | 'merchant';

  @ApiPropertyOptional({
    description: 'المسمى الوظيفي للمهندس (اختياري)',
    example: 'مهندس ميكانيكي',
    minLength: 3,
    maxLength: 100
  })
  @IsOptional() @IsString() jobTitle?: string; // المسمى الوظيفي للمهندس (اختياري)

  @ApiPropertyOptional({
    description: 'معرف الجهاز للمزامنة التلقائية للمفضلات',
    example: 'device_123456789',
    minLength: 10,
    maxLength: 50
  })
  @IsOptional() @IsString() deviceId?: string; // معرف الجهاز للمزامنة التلقائية للمفضلات
}

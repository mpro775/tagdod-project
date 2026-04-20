import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateMarketerEngineerDto {
  @ApiProperty({ example: '777123456', description: 'رقم هاتف المستخدم' })
  @IsString()
  @Matches(/^\d{9}$/, { message: 'رقم الهاتف يجب أن يتكون من 9 أرقام' })
  phone!: string;

  @ApiProperty({ example: 'أحمد', description: 'الاسم الأول' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @ApiPropertyOptional({ example: 'محمد', description: 'الاسم الأخير' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other'], example: 'male' })
  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({ example: 'صنعاء', description: 'المدينة' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'مهندس كهرباء', description: 'المسمى الوظيفي' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @ApiPropertyOptional({ example: 'Pass1234!', description: 'كلمة مرور المستخدم' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ example: 'تم التحقق ميدانياً', description: 'ملاحظة التحقق' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class CreateMarketerMerchantDto {
  @ApiProperty({ example: '777123456', description: 'رقم هاتف المستخدم' })
  @IsString()
  @Matches(/^\d{9}$/, { message: 'رقم الهاتف يجب أن يتكون من 9 أرقام' })
  phone!: string;

  @ApiProperty({ example: 'محمد', description: 'الاسم الأول' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @ApiPropertyOptional({ example: 'صالح', description: 'الاسم الأخير' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other'], example: 'male' })
  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({ example: 'صنعاء', description: 'المدينة' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'محل الطاقة الشمسية', description: 'اسم المحل' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  storeName!: string;

  @ApiProperty({ example: 'شارع الزبيري - صنعاء', description: 'عنوان المحل (الموقع الجغرافي)' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  storeAddress!: string;

  @ApiProperty({ enum: ['small', 'medium', 'large'], example: 'medium', description: 'حجم المحل' })
  @IsString()
  @IsIn(['small', 'medium', 'large'])
  storeSize!: 'small' | 'medium' | 'large';

  @ApiProperty({ enum: ['yes', 'no'], example: 'no', description: 'هل هو عميل سابق لدينا؟' })
  @IsString()
  @IsIn(['yes', 'no'])
  previousCustomer!: 'yes' | 'no';

  @ApiPropertyOptional({
    enum: ['knows', 'heard_only', 'none'],
    example: 'heard_only',
    description: 'هل لديه معرفة بتجدد؟ (مطلوب فقط عند previousCustomer = no)',
  })
  @IsOptional()
  @IsString()
  @IsIn(['knows', 'heard_only', 'none'])
  tejadodAwareness?: 'knows' | 'heard_only' | 'none';

  @ApiProperty({ enum: ['yes', 'no'], example: 'yes', description: 'هل المحل يتعامل مع القواطع؟' })
  @IsString()
  @IsIn(['yes', 'no'])
  dealsWithBreakers!: 'yes' | 'no';

  @ApiPropertyOptional({
    isArray: true,
    enum: ['schneider', 'chint', 'legrand', 'cnc', 'other'],
    example: ['schneider', 'chint'],
    description: 'أنواع القواطع التي يتعامل معها المحل (مطلوب عند dealsWithBreakers = yes)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        return [];
      }

      try {
        const parsed = JSON.parse(trimmedValue) as unknown;
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return trimmedValue.split(',').map((item) => item.trim()).filter(Boolean);
      }

      return [trimmedValue];
    }

    return [];
  })
  @IsArray()
  @IsIn(['schneider', 'chint', 'legrand', 'cnc', 'other'], { each: true })
  breakerBrands?: Array<'schneider' | 'chint' | 'legrand' | 'cnc' | 'other'>;

  @ApiPropertyOptional({
    example: 'ABB',
    description: 'مثال للخيار "أخرى" في القواطع (مطلوب عند اختيار other)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  breakerOtherExample?: string;

  @ApiProperty({ enum: ['yes', 'no'], example: 'no', description: 'هل المحل لديه لمبات (إضاءة)؟' })
  @IsString()
  @IsIn(['yes', 'no'])
  hasLighting!: 'yes' | 'no';

  @ApiPropertyOptional({
    example: 'يوجد قسم إضاءة متنوع',
    description: 'ملاحظة عن الإضاءة (اختياري عند hasLighting = yes)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  lightingNote?: string;

  @ApiPropertyOptional({ example: 'Pass1234!', description: 'كلمة مرور المستخدم' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ example: 'تم التحقق ميدانياً', description: 'ملاحظة التحقق' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

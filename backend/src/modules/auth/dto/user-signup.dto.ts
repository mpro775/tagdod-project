import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, IsIn, IsOptional, Matches } from 'class-validator';

export class UserSignupDto {
  @ApiProperty({
    description: 'رقم هاتف المستخدم',
    example: '0501234567',
    required: true,
  })
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  @IsString({ message: 'رقم الهاتف يجب أن يكون نصاً' })
  @Matches(/^(05|5|7)\d{8}$/, {
    message: 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 05 أو 5 أو 7 ويتكون من 9-10 أرقام',
  })
  phone!: string;

  @ApiProperty({
    description: 'كلمة المرور',
    example: 'MySecurePassword123!',
    required: true,
    minLength: 6,
  })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password!: string;

  @ApiProperty({
    description: 'الاسم الأول',
    example: 'أحمد',
    required: true,
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'الاسم الأول مطلوب' })
  @IsString({ message: 'الاسم الأول يجب أن يكون نصاً' })
  @MinLength(2, { message: 'الاسم الأول يجب أن يكون حرفين على الأقل' })
  @MaxLength(50, { message: 'الاسم الأول يجب أن يكون أقل من 50 حرف' })
  firstName!: string;

  @ApiProperty({
    description: 'الاسم الأخير',
    example: 'محمد',
    required: true,
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'الاسم الأخير مطلوب' })
  @IsString({ message: 'الاسم الأخير يجب أن يكون نصاً' })
  @MinLength(2, { message: 'الاسم الأخير يجب أن يكون حرفين على الأقل' })
  @MaxLength(50, { message: 'الاسم الأخير يجب أن يكون أقل من 50 حرف' })
  lastName!: string;

  @ApiProperty({
    description: 'الجنس',
    enum: ['male', 'female', 'other'],
    example: 'male',
    required: true,
  })
  @IsNotEmpty({ message: 'الجنس مطلوب' })
  @IsString({ message: 'الجنس يجب أن يكون نصاً' })
  @IsIn(['male', 'female', 'other'], { message: 'الجنس يجب أن يكون male أو female أو other' })
  gender!: 'male' | 'female' | 'other';

  @ApiPropertyOptional({
    description: 'المدينة',
    example: 'صنعاء',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'المدينة يجب أن تكون نصاً' })
  @MinLength(2, { message: 'المدينة يجب أن تكون حرفين على الأقل' })
  @MaxLength(50, { message: 'المدينة يجب أن تكون أقل من 50 حرف' })
  city?: string;

  @ApiPropertyOptional({
    description: 'نوع القدرة المطلوبة',
    enum: ['engineer', 'merchant'],
    example: 'engineer',
  })
  @IsOptional()
  @IsIn(['engineer', 'merchant'], { message: 'نوع القدرة يجب أن يكون engineer أو merchant' })
  capabilityRequest?: 'engineer' | 'merchant';

  @ApiPropertyOptional({
    description: 'المسمى الوظيفي للمهندس (اختياري)',
    example: 'مهندس كهرباء',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'المسمى الوظيفي يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'المسمى الوظيفي يجب أن يكون أقل من 100 حرف' })
  jobTitle?: string;

  @ApiPropertyOptional({
    description: 'معرف الجهاز للمزامنة التلقائية للمفضلات',
    example: 'device_123456789',
    minLength: 10,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'معرف الجهاز يجب أن يكون نصاً' })
  @MinLength(10, { message: 'معرف الجهاز يجب أن يكون 10 أحرف على الأقل' })
  @MaxLength(50, { message: 'معرف الجهاز يجب أن يكون أقل من 50 حرف' })
  deviceId?: string;
}

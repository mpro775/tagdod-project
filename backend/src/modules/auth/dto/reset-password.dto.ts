import { IsString, IsNumberString, Length, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'رقم الهاتف المرتبط بالحساب',
    example: '+967777123456',
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
    pattern: '^[0-9]{6}$',
    required: false,
  })
  @IsOptional() @IsNumberString() @Length(6, 6) code?: string;

  @ApiProperty({
    description: 'جلسة إعادة تعيين كلمة المرور بعد تحقق OTP',
    example: 'a3f3fef3d4f54a2ea2f47f5f1b8f4f45c520ff954b8d5bc6b65c6f6e653a90be',
    required: false,
  })
  @IsOptional() @IsString() resetToken?: string;

  @ApiProperty({
    description: 'كلمة المرور الجديدة',
    example: 'NewSecurePassword123!',
    minLength: 8,
    maxLength: 128
  })
  @IsString() @MinLength(8) newPassword!: string;
}

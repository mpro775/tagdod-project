import { IsString, IsNumberString, Length, MinLength } from 'class-validator';
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
    pattern: '^[0-9]{6}$'
  })
  @IsNumberString() @Length(6, 6) code!: string;

  @ApiProperty({
    description: 'كلمة المرور الجديدة',
    example: 'NewSecurePassword123!',
    minLength: 8,
    maxLength: 128
  })
  @IsString() @MinLength(8) newPassword!: string;
}

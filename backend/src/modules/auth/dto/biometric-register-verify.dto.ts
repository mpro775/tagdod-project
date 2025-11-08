import { ApiProperty } from '@nestjs/swagger';
import { Matches, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';

export class BiometricRegisterVerifyDto {
  @ApiProperty({
    description: 'رقم هاتف المستخدم المرتبط بالحساب',
    example: '0501234567',
  })
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  @IsString({ message: 'رقم الهاتف يجب أن يكون نصاً' })
  @Matches(/^(05|5|7)\d{8}$/, {
    message: 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 05 أو 5 أو 7 ويتكون من 9-10 أرقام',
  })
  phone!: string;

  @ApiProperty({
    description: 'استجابة WebAuthn من الجهاز',
    type: 'object',
  })
  @IsNotEmpty({ message: 'استجابة الجهاز مطلوبة' })
  @IsObject({ message: 'استجابة الجهاز يجب أن تكون كائن JSON' })
  response!: RegistrationResponseJSON;

  @ApiProperty({
    description: 'اسم ودي للجهاز لتسجيله في الحساب',
    example: 'MacBook Pro M3',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'اسم الجهاز يجب أن يكون نصاً' })
  deviceName?: string;

  @ApiProperty({
    description: 'قيمة User-Agent الخاصة بالجهاز',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'قيمة User-Agent يجب أن تكون نصاً' })
  userAgent?: string;

}


import { ApiProperty } from '@nestjs/swagger';
import { Matches, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BiometricLoginChallengeDto {
  @ApiProperty({
    description: 'رقم هاتف المستخدم',
    example: '0501234567',
  })
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  @IsString({ message: 'رقم الهاتف يجب أن يكون نصاً' })
  @Matches(/^(05|5|7)\d{8}$/, {
    message: 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 05 أو 5 أو 7 ويتكون من 9-10 أرقام',
  })
  phone!: string;

  @ApiProperty({
    description: 'قيمة User-Agent للجهاز الحالي',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'قيمة User-Agent يجب أن تكون نصاً' })
  userAgent?: string;
}


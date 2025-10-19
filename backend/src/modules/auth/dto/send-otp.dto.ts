import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'رقم الهاتف لإرسال كود التحقق إليه',
    example: '+966501234567',
    pattern: '^\\+?[1-9]\\d{1,14}$',
    minLength: 10,
    maxLength: 15
  })
  @IsString() phone!: string;

  @ApiPropertyOptional({
    description: 'سياق إرسال كود التحقق',
    enum: ['register', 'reset'],
    example: 'register',
    default: 'register'
  })
  @IsOptional() @IsIn(['register', 'reset']) context?: 'register' | 'reset' = 'register';
}

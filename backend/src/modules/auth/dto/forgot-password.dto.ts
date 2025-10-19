import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'رقم الهاتف المرتبط بالحساب',
    example: '+966501234567',
    pattern: '^\\+?[1-9]\\d{1,14}$',
    minLength: 10,
    maxLength: 15
  })
  @IsString() phone!: string;
}

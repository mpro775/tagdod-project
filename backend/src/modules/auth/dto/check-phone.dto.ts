import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckPhoneDto {
  @ApiProperty({
    description: 'رقم الهاتف للتحقق من وجوده',
    example: '+967777123456',
    pattern: '^\\+?[1-9]\\d{1,14}$',
    minLength: 10,
    maxLength: 15
  })
  @IsString()
  phone!: string;
}


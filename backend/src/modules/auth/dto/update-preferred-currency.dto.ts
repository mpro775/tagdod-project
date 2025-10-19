import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../users/schemas/user.schema';

export class UpdatePreferredCurrencyDto {
  @ApiProperty({
    description: 'العملة المفضلة للمستخدم',
    enum: Currency,
    example: Currency.SAR,
    enumName: 'Currency'
  })
  @IsEnum(Currency)
  currency!: Currency;
}

import { IsEnum } from 'class-validator';
import { Currency } from '../../users/schemas/user.schema';

export class UpdatePreferredCurrencyDto {
  @IsEnum(Currency)
  currency!: Currency;
}

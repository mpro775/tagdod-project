import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SmsRecipientStatus } from '../sms-campaign.constants';

export class ListSmsCampaignRecipientsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(SmsRecipientStatus)
  status?: SmsRecipientStatus;

  @IsOptional()
  @IsString()
  q?: string;
}

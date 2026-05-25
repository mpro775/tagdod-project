import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SmsCampaignTarget } from '../sms-campaign.constants';
import { SmsCampaignFiltersDto } from './shared-sms-campaign-filters.dto';

export class CreateSmsCampaignDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message!: string;

  @IsEnum(SmsCampaignTarget)
  target!: SmsCampaignTarget;

  @IsOptional()
  @ValidateNested()
  @Type(() => SmsCampaignFiltersDto)
  filters?: SmsCampaignFiltersDto;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  customUserIds?: string[];

  @IsOptional()
  @IsBoolean()
  confirmSend?: boolean;
}

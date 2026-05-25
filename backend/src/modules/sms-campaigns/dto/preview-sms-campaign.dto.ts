import {
  IsArray,
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

export class PreviewSmsCampaignDto {
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
}

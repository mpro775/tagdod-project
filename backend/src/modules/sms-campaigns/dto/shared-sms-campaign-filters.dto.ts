import { IsOptional, IsString } from 'class-validator';

export class SmsCampaignFiltersDto {
  @IsOptional()
  @IsString()
  city?: string;
}

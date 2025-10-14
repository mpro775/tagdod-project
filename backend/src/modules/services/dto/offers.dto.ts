import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOfferDto {
  @IsMongoId() requestId!: string;
  @Type(() => Number) @IsNumber() @Min(0) amount!: number;
  @IsOptional() @IsString() note?: string;
  
  // موقع المهندس لحساب المسافة
  @Type(() => Number) @IsNumber() lat!: number;
  @Type(() => Number) @IsNumber() lng!: number;
}

export class UpdateOfferDto {
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) amount?: number;
  @IsOptional() @IsString() note?: string;
}

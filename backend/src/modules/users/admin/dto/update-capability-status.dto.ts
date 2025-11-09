import { IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { CapabilityStatus } from '../../schemas/user.schema';

export class UpdateCapabilityStatusDto {
  @IsEnum(CapabilityStatus)
  status!: CapabilityStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  merchantDiscountPercent?: number;
}


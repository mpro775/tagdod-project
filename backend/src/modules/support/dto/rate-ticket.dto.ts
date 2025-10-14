import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class RateTicketDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number; // 1-5 نجوم

  @IsOptional()
  @IsString()
  feedback?: string; // ملاحظات اختيارية
}


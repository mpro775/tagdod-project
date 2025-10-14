import { IsString, IsOptional } from 'class-validator';

export class SuspendUserDto {
  @IsOptional()
  @IsString()
  reason?: string; // سبب الإيقاف
}


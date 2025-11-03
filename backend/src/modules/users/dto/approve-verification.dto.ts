import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveVerificationDto {
  @ApiPropertyOptional({
    description: 'سبب الرفض (اختياري - يظهر فقط عند الرفض)',
    example: 'الوثائق غير واضحة أو غير مكتملة',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'سبب الرفض يجب أن يكون نصاً' })
  @MaxLength(500, { message: 'سبب الرفض يجب أن يكون أقل من 500 حرف' })
  reason?: string;
}


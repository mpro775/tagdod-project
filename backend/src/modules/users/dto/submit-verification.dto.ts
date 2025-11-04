import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitVerificationDto {
  @ApiPropertyOptional({
    description: 'ملاحظة التحقق (اختياري)',
    example: 'ملاحظة إضافية حول طلب التحقق',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'الملاحظة يجب أن تكون نصاً' })
  @MaxLength(500, { message: 'الملاحظة يجب أن تكون أقل من 500 حرف' })
  note?: string;
}

export class SubmitMerchantVerificationDto extends SubmitVerificationDto {
  @ApiProperty({
    description: 'اسم المحل',
    example: 'محل الأجهزة الكهربائية',
    required: true,
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'اسم المحل يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'اسم المحل يجب أن يكون أقل من 100 حرف' })
  storeName!: string;
}


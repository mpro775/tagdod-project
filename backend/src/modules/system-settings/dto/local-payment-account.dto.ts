import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, Min, IsMongoId, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentAccountType } from '../schemas/local-payment-account.schema';

export class CreateLocalPaymentAccountDto {
  @ApiProperty({ example: 'الكريمي', description: 'اسم البنك أو المحفظة' })
  @IsString()
  providerName!: string;

  @ApiPropertyOptional({ example: '64f9c0b5c1a2b3d4e5f67890', description: 'معرف الوسائط للأيقونة' })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsMongoId()
  iconMediaId?: string | null;

  @ApiProperty({ example: '1234567890', description: 'رقم الحساب' })
  @IsString()
  accountNumber!: string;

  @ApiProperty({ enum: PaymentAccountType, example: PaymentAccountType.BANK })
  @IsEnum(PaymentAccountType)
  type!: PaymentAccountType;

  @ApiProperty({ enum: ['YER', 'SAR', 'USD'], example: 'YER' })
  @IsString()
  currency!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class UpdateLocalPaymentAccountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsMongoId()
  iconMediaId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ enum: PaymentAccountType })
  @IsOptional()
  @IsEnum(PaymentAccountType)
  type?: PaymentAccountType;

  @ApiPropertyOptional({ enum: ['YER', 'SAR', 'USD'] })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

// DTO للعرض المجمع
export class MediaReferenceDto {
  @ApiProperty({ example: '64f9c0b5c1a2b3d4e5f67890' })
  id!: string;

  @ApiProperty({ example: 'https://cdn.example.com/images/bank-icon.png' })
  url!: string;

  @ApiPropertyOptional({ example: 'أيقونة بنك الكريمي' })
  name?: string;
}

export class GroupedPaymentAccountDto {
  @ApiProperty({ example: 'الكريمي' })
  providerName!: string;

  @ApiPropertyOptional({
    type: () => MediaReferenceDto,
    description: 'بيانات الوسائط المرتبطة بالأيقونة',
  })
  icon?: MediaReferenceDto;

  @ApiProperty({ enum: PaymentAccountType })
  type!: PaymentAccountType;

  @ApiProperty({ 
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        accountNumber: { type: 'string' },
        currency: { type: 'string' },
        isActive: { type: 'boolean' },
        displayOrder: { type: 'number' },
      }
    }
  })
  accounts!: Array<{
    id: string;
    accountNumber: string;
    currency: string;
    isActive: boolean;
    displayOrder: number;
  }>;
}


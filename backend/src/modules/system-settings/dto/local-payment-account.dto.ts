import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentAccountType } from '../schemas/local-payment-account.schema';

export class CreateLocalPaymentAccountDto {
  @ApiProperty({ example: 'الكريمي', description: 'اسم البنك أو المحفظة' })
  @IsString()
  providerName!: string;

  @ApiPropertyOptional({ example: 'https://example.com/icon.png' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

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
  @IsString()
  iconUrl?: string;

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
export class GroupedPaymentAccountDto {
  @ApiProperty({ example: 'الكريمي' })
  providerName!: string;

  @ApiPropertyOptional()
  iconUrl?: string;

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


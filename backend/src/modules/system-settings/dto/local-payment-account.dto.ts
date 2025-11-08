import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  IsMongoId,
  ValidateIf,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PaymentAccountNumberingMode,
  PaymentAccountType,
} from '../schemas/local-payment-account.schema';

export class ProviderCurrencyAccountDto {
  @ApiProperty({ enum: ['YER', 'SAR', 'USD'], example: 'YER' })
  @IsString()
  currency!: string;

  @ApiProperty({ example: '1234567890', description: 'رقم الحساب' })
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateLocalPaymentAccountDto {
  @ApiProperty({ example: 'الكريمي', description: 'اسم البنك أو المحفظة' })
  @IsString()
  providerName!: string;

  @ApiPropertyOptional({
    example: '64f9c0b5c1a2b3d4e5f67890',
    description: 'معرف الوسائط للأيقونة',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsMongoId()
  iconMediaId?: string | null;

  @ApiProperty({ enum: PaymentAccountType, example: PaymentAccountType.BANK })
  @IsEnum(PaymentAccountType)
  type!: PaymentAccountType;

  @ApiProperty({
    enum: PaymentAccountNumberingMode,
    example: PaymentAccountNumberingMode.SHARED,
  })
  @IsEnum(PaymentAccountNumberingMode)
  numberingMode!: PaymentAccountNumberingMode;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'رقم حساب مشترك لكل العملات (في وضع shared)',
  })
  @IsOptional()
  @ValidateIf((dto: CreateLocalPaymentAccountDto) => dto.numberingMode === PaymentAccountNumberingMode.SHARED)
  @IsString()
  @IsNotEmpty()
  sharedAccountNumber?: string;

  @ApiPropertyOptional({
    type: [String],
    enum: ['YER', 'SAR', 'USD'],
    description: 'العملات المدعومة عندما يكون الحساب مشتركاً',
  })
  @IsOptional()
  @ValidateIf((dto: CreateLocalPaymentAccountDto) => dto.numberingMode === PaymentAccountNumberingMode.SHARED)
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  supportedCurrencies?: string[];

  @ApiPropertyOptional({
    type: [ProviderCurrencyAccountDto],
    description: 'الحسابات لكل عملة (في وضع per_currency أو عند وجود استثناءات)',
  })
  @IsOptional()
  @ValidateIf((dto: CreateLocalPaymentAccountDto) => dto.numberingMode === PaymentAccountNumberingMode.PER_CURRENCY || (dto.accounts?.length ?? 0) > 0)
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProviderCurrencyAccountDto)
  accounts?: ProviderCurrencyAccountDto[];

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

  @ApiPropertyOptional({ enum: PaymentAccountType })
  @IsOptional()
  @IsEnum(PaymentAccountType)
  type?: PaymentAccountType;

  @ApiPropertyOptional({ enum: PaymentAccountNumberingMode })
  @IsOptional()
  @IsEnum(PaymentAccountNumberingMode)
  numberingMode?: PaymentAccountNumberingMode;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((dto: UpdateLocalPaymentAccountDto) => dto.numberingMode === PaymentAccountNumberingMode.SHARED)
  @IsString()
  @IsNotEmpty()
  sharedAccountNumber?: string;

  @ApiPropertyOptional({
    type: [String],
    enum: ['YER', 'SAR', 'USD'],
  })
  @IsOptional()
  @ValidateIf((dto: UpdateLocalPaymentAccountDto) => dto.numberingMode === PaymentAccountNumberingMode.SHARED)
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  supportedCurrencies?: string[];

  @ApiPropertyOptional({
    type: [ProviderCurrencyAccountDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProviderCurrencyAccountDto)
  accounts?: ProviderCurrencyAccountDto[];

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

export class ProviderAccountItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id!: string;

  @ApiProperty({ example: 'YER' })
  currency!: string;

  @ApiProperty({ example: '1234567890' })
  accountNumber!: string;

  @ApiProperty({ default: true })
  isActive!: boolean;

  @ApiProperty({ default: 0 })
  displayOrder!: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty({ default: false })
  isOverride!: boolean;
}

export class GroupedPaymentAccountItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id!: string;

  @ApiProperty({ example: 'YER' })
  currency!: string;

  @ApiProperty({ example: '1234567890' })
  accountNumber!: string;

  @ApiProperty({ default: true })
  isActive!: boolean;

  @ApiProperty({ default: 0 })
  displayOrder!: number;

  @ApiPropertyOptional()
  notes?: string;
}

export class GroupedPaymentAccountDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  providerId!: string;

  @ApiProperty({ example: 'الكريمي' })
  providerName!: string;

  @ApiPropertyOptional({
    type: () => MediaReferenceDto,
    description: 'بيانات الوسائط المرتبطة بالأيقونة',
  })
  icon?: MediaReferenceDto;

  @ApiProperty({ enum: PaymentAccountType })
  type!: PaymentAccountType;

  @ApiProperty({ enum: PaymentAccountNumberingMode })
  numberingMode!: PaymentAccountNumberingMode;

  @ApiProperty({
    type: [String],
    enum: ['YER', 'SAR', 'USD'],
    description: 'العملات المدعومة في وضع shared أو أي حسابات متاحة',
  })
  supportedCurrencies!: string[];

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'رقم الحساب المشترك (في وضع shared)',
  })
  sharedAccountNumber?: string;

  @ApiProperty({
    type: [GroupedPaymentAccountItemDto],
    description: 'تفاصيل الحسابات لكل عملة',
  })
  accounts!: GroupedPaymentAccountItemDto[];
}

export class LocalPaymentAccountResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id!: string;

  @ApiProperty({ example: 'الكريمي' })
  providerName!: string;

  @ApiPropertyOptional({ type: () => MediaReferenceDto })
  icon?: MediaReferenceDto;

  @ApiPropertyOptional({ example: '64f9c0b5c1a2b3d4e5f67890' })
  iconMediaId?: string;

  @ApiProperty({ enum: PaymentAccountType })
  type!: PaymentAccountType;

  @ApiProperty({ enum: PaymentAccountNumberingMode })
  numberingMode!: PaymentAccountNumberingMode;

  @ApiProperty({
    type: [String],
    enum: ['YER', 'SAR', 'USD'],
  })
  supportedCurrencies!: string[];

  @ApiPropertyOptional({
    example: '1234567890',
  })
  sharedAccountNumber?: string;

  @ApiProperty({ type: [ProviderAccountItemDto] })
  accounts!: ProviderAccountItemDto[];

  @ApiProperty({ default: true })
  isActive!: boolean;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty({ default: 0 })
  displayOrder!: number;

  @ApiPropertyOptional()
  updatedBy?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}


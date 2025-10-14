import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AddressType } from '../schemas/address.schema';

class CoordsDto {
  @ApiProperty({ example: 15.3694 })
  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 44.1910 })
  @Type(() => Number)
  @IsNumber()
  lng!: number;
}

export class CreateAddressDto {
  @ApiProperty({ example: 'المنزل', description: 'تسمية العنوان' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  label!: string;

  @ApiProperty({ enum: AddressType, required: false, default: AddressType.HOME })
  @IsOptional()
  @IsEnum(AddressType)
  addressType?: AddressType;

  @ApiProperty({ example: 'أحمد محمد', description: 'اسم المستلم' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  recipientName!: string;

  @ApiProperty({ example: '773123456', description: 'رقم هاتف المستلم' })
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'رقم الهاتف غير صحيح' })
  recipientPhone!: string;

  @ApiProperty({ example: 'شارع الستين، بجوار مطعم السلطان' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  line1!: string;

  @ApiProperty({ required: false, example: 'الدور الثالث، شقة 12' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  line2?: string;

  @ApiProperty({ example: 'صنعاء' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city!: string;

  @ApiProperty({ required: false, example: 'حي السبعين' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiProperty({ required: false, default: 'Yemen' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ required: false, type: CoordsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordsDto)
  coords?: CoordsDto;

  @ApiProperty({ required: false, example: 'يرجى الاتصال عند الوصول' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  placeId?: string;
}

export class UpdateAddressDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  label?: string;

  @ApiProperty({ enum: AddressType, required: false })
  @IsOptional()
  @IsEnum(AddressType)
  addressType?: AddressType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  recipientName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'رقم الهاتف غير صحيح' })
  recipientPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  line1?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  line2?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ required: false, type: CoordsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordsDto)
  coords?: CoordsDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  placeId?: string;
}

export class SelectAddressDto {
  @ApiProperty({ example: '65abc123def456789' })
  @IsString()
  addressId!: string;
}

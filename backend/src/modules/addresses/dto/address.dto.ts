import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: 'شارع الستين، بجوار مطعم السلطان' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  line1!: string;

  @ApiProperty({ example: 'صنعاء' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city!: string;

  @ApiProperty({ type: CoordsDto, description: 'الإحداثيات (إجباري)' })
  @ValidateNested()
  @Type(() => CoordsDto)
  coords!: CoordsDto;

  @ApiProperty({ required: false, example: 'يرجى الاتصال عند الوصول' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  label?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  line1?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city?: string;

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
}

export class SelectAddressDto {
  @ApiProperty({ example: '65abc123def456789' })
  @IsString()
  addressId!: string;
}

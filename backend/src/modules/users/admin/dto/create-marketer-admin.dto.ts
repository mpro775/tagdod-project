import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateMarketerAdminDto {
  @ApiProperty({
    description: 'رقم هاتف المسوق',
    example: '777123456',
  })
  @IsString()
  @Matches(/^(05|5|7|0)?\d{8,10}$/, {
    message: 'رقم الهاتف غير صحيح',
  })
  phone!: string;

  @ApiProperty({
    description: 'الاسم الأول',
    example: 'محمد',
  })
  @IsString()
  firstName!: string;

  @ApiPropertyOptional({
    description: 'الاسم الأخير',
    example: 'أحمد',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'الجنس',
    enum: ['male', 'female', 'other'],
    example: 'male',
  })
  @IsOptional()
  @IsString()
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({
    description: 'كلمة مرور مؤقتة',
    example: 'TempPass123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  temporaryPassword?: string;

  @ApiPropertyOptional({
    description: 'تفعيل الحساب مباشرة',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activateImmediately?: boolean = true;
}

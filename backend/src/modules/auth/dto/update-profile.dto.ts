import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'الاسم الأول',
    example: 'أحمد',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'الاسم الأول يجب أن يكون نصاً' })
  @MinLength(2, { message: 'الاسم الأول يجب أن يكون حرفين على الأقل' })
  @MaxLength(50, { message: 'الاسم الأول يجب أن يكون أقل من 50 حرف' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'الاسم الأخير',
    example: 'محمد',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'الاسم الأخير يجب أن يكون نصاً' })
  @MinLength(2, { message: 'الاسم الأخير يجب أن يكون حرفين على الأقل' })
  @MaxLength(50, { message: 'الاسم الأخير يجب أن يكون أقل من 50 حرف' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'الجنس',
    enum: ['male', 'female', 'other'],
    example: 'male',
  })
  @IsOptional()
  @IsIn(['male', 'female', 'other'], { message: 'الجنس يجب أن يكون: male, female, أو other' })
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({
    description: 'المدينة',
    example: 'صنعاء',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'المدينة يجب أن تكون نصاً' })
  @MaxLength(100, { message: 'المدينة يجب أن تكون أقل من 100 حرف' })
  city?: string;

  @ApiPropertyOptional({
    description: 'المسمى الوظيفي',
    example: 'مهندس كهرباء',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'المسمى الوظيفي يجب أن يكون نصاً' })
  @MaxLength(100, { message: 'المسمى الوظيفي يجب أن يكون أقل من 100 حرف' })
  jobTitle?: string;
}


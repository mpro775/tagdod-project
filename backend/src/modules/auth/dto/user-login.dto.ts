import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({
    description: 'رقم هاتف المستخدم',
    example: '0501234567',
    required: true,
  })
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  @IsString({ message: 'رقم الهاتف يجب أن يكون نصاً' })
  @Matches(/^(05|5|7)\d{8}$/, {
    message: 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 05 أو 5 أو 7 ويتكون من 9-10 أرقام',
  })
  phone!: string;

  @ApiProperty({
    description: 'كلمة المرور',
    example: 'MyPassword123!',
    required: true,
    minLength: 6,
  })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password!: string;
}

import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetPasswordDto {
  @ApiProperty({
    description: 'كلمة المرور الجديدة',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 128,
    format: 'password'
  })
  @IsString() @MinLength(8) password!: string;
}

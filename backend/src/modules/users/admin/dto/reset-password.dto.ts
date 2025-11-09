import { IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class AdminResetPasswordDto {
  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  newPassword!: string;

  @IsOptional()
  @IsBoolean()
  notifyUser?: boolean; // إشعار المستخدم بالتغيير
}


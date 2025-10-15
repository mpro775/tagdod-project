import { IsString, IsNumberString, Length, MinLength } from 'class-validator';
export class ResetPasswordDto {
  @IsString() phone!: string;
  @IsNumberString() @Length(6, 6) code!: string;
  @IsString() @MinLength(8) newPassword!: string;
}

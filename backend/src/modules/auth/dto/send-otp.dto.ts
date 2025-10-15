import { IsString, IsOptional, IsIn } from 'class-validator';
export class SendOtpDto {
  @IsString() phone!: string;
  @IsOptional() @IsIn(['register', 'reset']) context?: 'register' | 'reset' = 'register';
}

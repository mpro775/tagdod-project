import { IsString, IsOptional, IsIn, IsNumberString, Length } from 'class-validator';
export class VerifyOtpDto {
  @IsString() phone!: string;
  @IsNumberString() @Length(6, 6) code!: string;
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() gender?: 'male' | 'female' | 'other';
  @IsOptional() @IsIn(['engineer', 'wholesale']) capabilityRequest?: 'engineer' | 'wholesale';
  @IsOptional() @IsString() jobTitle?: string; // المسمى الوظيفي للمهندس (مطلوب إذا كان capabilityRequest = 'engineer')
  @IsOptional() @IsString() deviceId?: string; // معرف الجهاز للمزامنة التلقائية للمفضلات
}

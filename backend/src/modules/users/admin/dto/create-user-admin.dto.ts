import { IsString, IsOptional, IsIn, IsArray, IsEnum, IsPhoneNumber, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '../../schemas/user.schema';

export class CreateUserAdminDto {
  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  // Capabilities
  @IsOptional()
  @IsIn(['engineer', 'wholesale'])
  capabilityRequest?: 'engineer' | 'wholesale';

  @IsOptional()
  wholesaleDiscountPercent?: number;
}


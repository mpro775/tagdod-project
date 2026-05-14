import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactRequestType, ContactRequestSource } from '../schemas/contact-request.schema';

export class CreateContactRequestDto {
  @ApiProperty({ description: 'الاسم' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'رقم الهاتف' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'المدينة' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'نوع الطلب', enum: ['general', 'technical_support', 'service_center', 'maintenance', 'contracting', 'partnership', 'other'] })
  @IsOptional()
  @IsEnum(ContactRequestType)
  requestType?: ContactRequestType;

  @ApiPropertyOptional({ description: 'الموضوع' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'الرسالة' })
  @IsString()
  message!: string;

  @ApiPropertyOptional({ description: 'المصدر', enum: ['landing_page', 'website', 'mobile_app', 'admin'], default: 'landing_page' })
  @IsOptional()
  @IsEnum(ContactRequestSource)
  source?: ContactRequestSource;
}

export class UpdateContactRequestStatusDto {
  @ApiProperty({ description: 'الحالة', enum: ['new', 'in_review', 'contacted', 'converted', 'closed'] })
  @IsString()
  status!: string;
}

export class AssignContactRequestDto {
  @ApiProperty({ description: 'معرف الشخص المسند إليه' })
  @IsString()
  assignedTo!: string;
}

export class ContactRequestQueryDto {
  @ApiPropertyOptional({ description: 'رقم الصفحة', example: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'عدد العناصر', example: 20 })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'نوع الطلب' })
  @IsOptional()
  @IsString()
  requestType?: string;

  @ApiPropertyOptional({ description: 'الحالة' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'البحث' })
  @IsOptional()
  @IsString()
  search?: string;
}

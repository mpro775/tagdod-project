import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsObject } from 'class-validator';
import { SupportCategory, SupportPriority } from '../schemas/support-ticket.schema';

export class CreateSupportTicketDto {
  @ApiProperty({
    description: 'عنوان المشكلة',
    example: 'مشكلة في لوحة الطاقة الشمسية',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'وصف تفصيلي للمشكلة',
    example: 'اللوحة لا تعمل بشكل صحيح منذ يومين',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'تصنيف المشكلة',
    enum: SupportCategory,
    example: SupportCategory.TECHNICAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(SupportCategory)
  category?: SupportCategory;

  @ApiProperty({
    description: 'أولوية المشكلة',
    enum: SupportPriority,
    example: SupportPriority.MEDIUM,
    required: false,
  })
  @IsOptional()
  @IsEnum(SupportPriority)
  priority?: SupportPriority;

  @ApiProperty({
    description: 'روابط الملفات المرفوعة',
    type: [String],
    example: ['https://cdn.bunny.net/uploads/image1.jpg'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({
    description: 'بيانات إضافية (مثل رقم الطلب أو رقم المنتج)',
    example: { orderId: '12345', productId: '67890' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

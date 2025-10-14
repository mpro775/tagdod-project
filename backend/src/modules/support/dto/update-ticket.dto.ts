import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { SupportStatus, SupportPriority, SupportCategory } from '../schemas/support-ticket.schema';

export class UpdateSupportTicketDto {
  @ApiProperty({
    description: 'حالة التذكرة',
    enum: SupportStatus,
    example: SupportStatus.IN_PROGRESS,
    required: false,
  })
  @IsOptional()
  @IsEnum(SupportStatus)
  status?: SupportStatus;

  @ApiProperty({
    description: 'أولوية التذكرة',
    enum: SupportPriority,
    example: SupportPriority.HIGH,
    required: false,
  })
  @IsOptional()
  @IsEnum(SupportPriority)
  priority?: SupportPriority;

  @ApiProperty({
    description: 'تصنيف التذكرة',
    enum: SupportCategory,
    example: SupportCategory.TECHNICAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(SupportCategory)
  category?: SupportCategory;

  @ApiProperty({
    description: 'معرف المشرف المسؤول',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({
    description: 'تاريخ الحل (يتم تعيينه تلقائياً عند تغيير الحالة إلى RESOLVED)',
    required: false,
  })
  @IsOptional()
  resolvedAt?: Date;

  @ApiProperty({
    description: 'تاريخ الإغلاق (يتم تعيينه تلقائياً عند تغيير الحالة إلى CLOSED)',
    required: false,
  })
  @IsOptional()
  closedAt?: Date;
}

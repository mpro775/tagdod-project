import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject } from 'class-validator';

export class AddSupportMessageDto {
  @ApiProperty({
    description: 'محتوى الرسالة',
    example: 'شكراً لك على الإبلاغ عن المشكلة. سنعمل على حلها في أقرب وقت ممكن.',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    description: 'روابط الملفات المرفوعة مع الرسالة',
    type: [String],
    example: ['https://cdn.bunny.net/uploads/solution.pdf'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({
    description: 'رسالة داخلية (للمشرفين فقط)',
    example: false,
    required: false,
  })
  @IsOptional()
  isInternal?: boolean;

  @ApiProperty({
    description: 'بيانات إضافية',
    example: { action: 'escalated' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

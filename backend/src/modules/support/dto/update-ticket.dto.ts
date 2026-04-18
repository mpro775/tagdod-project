import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  SupportAiStatus,
  SupportCategory,
  SupportChannel,
  SupportPriority,
  SupportStatus,
} from '../schemas/support-ticket.schema';

export class UpdateSupportTicketDto {
  @ApiProperty({
    description: 'Ticket status',
    enum: SupportStatus,
    required: false,
    example: SupportStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(SupportStatus)
  status?: SupportStatus;

  @ApiProperty({
    description: 'Ticket priority',
    enum: SupportPriority,
    required: false,
    example: SupportPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(SupportPriority)
  priority?: SupportPriority;

  @ApiProperty({
    description: 'Ticket category',
    enum: SupportCategory,
    required: false,
    example: SupportCategory.TECHNICAL,
  })
  @IsOptional()
  @IsEnum(SupportCategory)
  category?: SupportCategory;

  @ApiProperty({
    description: 'Ticket channel',
    enum: SupportChannel,
    required: false,
    example: SupportChannel.WEB,
  })
  @IsOptional()
  @IsEnum(SupportChannel)
  channel?: SupportChannel;

  @ApiProperty({
    description: 'Assigned admin id',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({
    description: 'Resolved timestamp',
    required: false,
  })
  @IsOptional()
  resolvedAt?: Date;

  @ApiProperty({
    description: 'Closed timestamp',
    required: false,
  })
  @IsOptional()
  closedAt?: Date;

  @ApiProperty({
    description: 'First response timestamp',
    required: false,
  })
  @IsOptional()
  firstResponseAt?: Date;

  @ApiProperty({
    description: 'Whether this ticket is handled by AI',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAiHandled?: boolean;

  @ApiProperty({
    description: 'AI handling status',
    enum: SupportAiStatus,
    required: false,
    example: SupportAiStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(SupportAiStatus)
  aiStatus?: SupportAiStatus;

  @ApiProperty({
    description: 'Reason for handoff to human support',
    required: false,
  })
  @IsOptional()
  @IsString()
  handoffReason?: string;
}


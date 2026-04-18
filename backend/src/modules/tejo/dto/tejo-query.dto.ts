import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { SupportChannel } from '../../support/schemas/support-ticket.schema';

export class TejoQueryDto {
  @ApiProperty({ required: false, description: 'Existing support ticket id' })
  @IsOptional()
  @IsString()
  ticketId?: string;

  @ApiProperty({ description: 'User message for Tejo', minLength: 1 })
  @IsString()
  @MinLength(1)
  message!: string;

  @ApiProperty({
    description: 'Conversation channel',
    enum: SupportChannel,
    example: SupportChannel.WEB,
  })
  @IsString()
  channel!: SupportChannel;

  @ApiProperty({ required: false, description: 'Locale like ar or en', example: 'ar' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({ required: false, description: 'Optional extra context' })
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}


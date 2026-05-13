import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TejoChannel } from '../schemas/tejo-session.schema';

export class CreateTejoSessionDto {
  @ApiProperty({ description: 'Conversation channel', enum: TejoChannel, example: TejoChannel.WEB })
  @IsEnum(TejoChannel)
  channel!: TejoChannel;

  @ApiProperty({ required: false, description: 'Locale like ar-SA or en-US', example: 'ar-SA' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({ required: false, description: 'Optional storefront host' })
  @IsOptional()
  @IsString()
  storefrontHost?: string;
}

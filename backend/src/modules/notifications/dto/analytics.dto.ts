import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { NotificationChannel, NotificationStatus, NotificationType } from '../enums/notification.enums';

export class AnalyticsFilterDto {
  @ApiPropertyOptional({
    description: 'Start date for analytics period',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date for analytics period',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter by notification type',
    enum: NotificationType,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    description: 'Filter by notification channel',
    enum: NotificationChannel,
  })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiPropertyOptional({
    description: 'Filter by notification status',
    enum: NotificationStatus,
  })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @ApiPropertyOptional({
    description: 'Filter by campaign name',
    example: 'summer-sale-2024',
  })
  @IsOptional()
  @IsString()
  campaign?: string;
}

export class CTRResponseDto {
  period!: string;
  sent!: number;
  opened!: number;
  clicked!: number;
  openRate!: number;
  clickRate!: number;
  ctr!: number;
}

export class ConversionResponseDto {
  period!: string;
  sent!: number;
  converted!: number;
  conversionRate!: number;
  totalValue!: number;
  avgValue!: number;
}

export class PerformanceResponseDto {
  category!: string;
  sent!: number;
  delivered!: number;
  opened!: number;
  clicked!: number;
  converted!: number;
  deliveryRate!: number;
  openRate!: number;
  ctr!: number;
  conversionRate!: number;
}

export class AdvancedAnalyticsResponseDto {
  overview!: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalConverted: number;
    overallDeliveryRate: number;
    overallOpenRate: number;
    overallCTR: number;
    overallConversionRate: number;
  };
  topPerformingTypes!: PerformanceResponseDto[];
  recentTrend!: CTRResponseDto[];
}


import { IsOptional, IsBoolean, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BackupStatus, BackupType } from '../schemas/backup.schema';

export class CreateBackupDto {
  @ApiPropertyOptional({ description: 'اسم مخصص للنسخة الاحتياطية' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class BackupScheduleDto {
  @ApiProperty({ description: 'تفعيل النسخ اليومي' })
  @IsBoolean()
  dailyEnabled!: boolean;

  @ApiProperty({ description: 'تفعيل النسخ الأسبوعي' })
  @IsBoolean()
  weeklyEnabled!: boolean;

  @ApiProperty({ description: 'تفعيل النسخ الشهري' })
  @IsBoolean()
  monthlyEnabled!: boolean;
}

export class BackupResponseDto {
  @ApiProperty()
  _id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  filename!: string;

  @ApiPropertyOptional()
  localPath?: string;

  @ApiPropertyOptional()
  bunnyPath?: string;

  @ApiPropertyOptional()
  bunnyUrl?: string;

  @ApiProperty()
  size!: number;

  @ApiProperty({ enum: BackupStatus })
  status!: BackupStatus;

  @ApiProperty({ enum: BackupType })
  type!: BackupType;

  @ApiPropertyOptional()
  errorMessage?: string;

  @ApiPropertyOptional()
  createdBy?: string;

  @ApiProperty()
  isAutomatic!: boolean;

  @ApiPropertyOptional()
  scheduledAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class BackupStatsDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  completed!: number;

  @ApiProperty()
  failed!: number;

  @ApiProperty()
  totalSize!: number;

  @ApiPropertyOptional()
  lastBackup?: Date;
}


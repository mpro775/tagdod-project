import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportSchedulesService } from './report-schedules.service';

@Injectable()
export class ReportScheduleCronService implements OnModuleInit {
  private readonly logger = new Logger(ReportScheduleCronService.name);
  private isProcessing = false;

  constructor(private reportSchedulesService: ReportSchedulesService) {}

  onModuleInit() {
    this.logger.log('Report Schedule Cron Service initialized');
  }

  @Cron('0 */5 * * * *')
  async processDueSchedules() {
    if (this.isProcessing) {
      this.logger.debug('Schedule processing already in progress, skipping');
      return;
    }

    this.isProcessing = true;

    try {
      this.logger.log('Starting scheduled reports processing...');
      await this.reportSchedulesService.processDueSchedules();
      this.logger.log('Scheduled reports processing completed');
    } catch (error) {
      this.logger.error(
        `Failed to process scheduled reports: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      this.isProcessing = false;
    }
  }

  @Cron('0 0 */6 * * *')
  async logScheduleStats() {
    try {
      const stats = await this.reportSchedulesService.getScheduleStats();
      this.logger.log(`Schedule stats: ${JSON.stringify(stats)}`);
    } catch (error) {
      this.logger.error(
        `Failed to log schedule stats: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

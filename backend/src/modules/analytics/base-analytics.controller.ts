import { Logger } from '@nestjs/common';

export interface QueryParams {
  period?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
  status?: string;
  format?: string;
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  period?: string;
  limit?: number;
  page?: number;
}

export abstract class BaseAnalyticsController {
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Convert query parameters to analytics parameters
   */
  protected convertQueryParams(params: QueryParams): AnalyticsParams {
    return {
      startDate: params.startDate,
      endDate: params.endDate,
      period: params.period,
      limit: params.limit ? parseInt(params.limit, 10) : undefined,
      page: params.page ? parseInt(params.page, 10) : undefined,
    };
  }

  /**
   * Handle common error responses
   */
  protected handleError(error: Error, operation: string) {
    this.logger.error(`Error in ${operation}:`, error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date(),
    };
  }

  /**
   * Format success response
   */
  protected formatSuccessResponse(data: Record<string, unknown>, message?: string) {
    return {
      success: true,
      data,
      message: message || 'Operation completed successfully',
      timestamp: new Date(),
    };
  }
}

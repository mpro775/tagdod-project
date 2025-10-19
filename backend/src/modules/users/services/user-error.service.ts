import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorContext {
  userId?: string;
  operation?: string;
  additionalInfo?: Record<string, unknown>;
}

export interface StandardErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    context?: ErrorContext;
    timestamp: string;
    requestId?: string;
  };
}

@Injectable()
export class UserErrorService {
  private readonly logger = new Logger(UserErrorService.name);

  /**
   * معالجة أخطاء المستخدمين
   */
  handleUserError(error: Error, context: ErrorContext = {}): HttpException {
    const errorCode = this.getErrorCode(error);
    const errorMessage = this.getErrorMessage(error);
    const details = this.getErrorDetails(error);

    // تسجيل الخطأ
    this.logger.error(`User Error [${errorCode}]: ${errorMessage}`, {
      context,
      details,
      stack: error.stack,
    });

    // إنشاء استجابة خطأ موحدة
    const statusCode = this.getHttpStatusCode(errorCode);
    const standardResponse: StandardErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details,
        context,
        timestamp: new Date().toISOString(),
      },
    };

    return new HttpException(standardResponse, statusCode);
  }

  /**
   * معالجة أخطاء التحليل
   */
  handleAnalyticsError(error: Error, context: ErrorContext = {}): HttpException {
    const errorCode = this.getAnalyticsErrorCode(error);
    const errorMessage = this.getAnalyticsErrorMessage(error);
    const details = this.getErrorDetails(error);

    // تسجيل الخطأ
    this.logger.error(`Analytics Error [${errorCode}]: ${errorMessage}`, {
      context,
      details,
      stack: error.stack,
    });

    // إنشاء استجابة خطأ موحدة
    const statusCode = this.getHttpStatusCode(errorCode);
    const standardResponse: StandardErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details,
        context,
        timestamp: new Date().toISOString(),
      },
    };

    return new HttpException(standardResponse, statusCode);
  }

  /**
   * معالجة أخطاء التخزين المؤقت
   */
  handleCacheError(error: Error, context: ErrorContext = {}): HttpException {
    const errorCode = 'CACHE_ERROR';
    const errorMessage = 'خطأ في نظام التخزين المؤقت';
    const details = this.getErrorDetails(error);

    // تسجيل الخطأ
    this.logger.error(`Cache Error: ${errorMessage}`, {
      context,
      details,
      stack: error.stack,
    });

    // إنشاء استجابة خطأ موحدة
    const standardResponse: StandardErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details,
        context,
        timestamp: new Date().toISOString(),
      },
    };

    return new HttpException(standardResponse, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  /**
   * معالجة أخطاء قاعدة البيانات
   */
  handleDatabaseError(error: Error, context: ErrorContext = {}): HttpException {
    const errorCode = this.getDatabaseErrorCode(error);
    const errorMessage = this.getDatabaseErrorMessage(error);
    const details = this.getErrorDetails(error);

    // تسجيل الخطأ
    this.logger.error(`Database Error [${errorCode}]: ${errorMessage}`, {
      context,
      details,
      stack: error.stack,
    });

    // إنشاء استجابة خطأ موحدة
    const statusCode = this.getHttpStatusCode(errorCode);
    const standardResponse: StandardErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details,
        context,
        timestamp: new Date().toISOString(),
      },
    };

    return new HttpException(standardResponse, statusCode);
  }

  /**
   * معالجة أخطاء التحقق من الصلاحيات
   */
  handlePermissionError(error: Error, context: ErrorContext = {}): HttpException {
    const errorCode = 'PERMISSION_DENIED';
    const errorMessage = 'ليس لديك صلاحية للوصول إلى هذا المورد';
    const details = this.getErrorDetails(error);

    // تسجيل الخطأ
    this.logger.error(`Permission Error: ${errorMessage}`, {
      context,
      details,
      stack: error.stack,
    });

    // إنشاء استجابة خطأ موحدة
    const standardResponse: StandardErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details,
        context,
        timestamp: new Date().toISOString(),
      },
    };

    return new HttpException(standardResponse, HttpStatus.FORBIDDEN);
  }

  /**
   * تحديد رمز الخطأ
   */
  private getErrorCode(error: Error & { code?: string }): string {
    if (error.code) {
      return error.code;
    }

    if (error.message?.includes('User not found')) {
      return 'USER_NOT_FOUND';
    }

    if (error.message?.includes('User already exists')) {
      return 'USER_ALREADY_EXISTS';
    }

    if (error.message?.includes('Invalid data')) {
      return 'INVALID_DATA';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * تحديد رمز خطأ التحليل
   */
  private getAnalyticsErrorCode(error: Error & { code?: string }): string {
    if (error.code) {
      return error.code;
    }

    if (error.message?.includes('Analytics')) {
      return 'ANALYTICS_ERROR';
    }

    if (error.message?.includes('Scoring')) {
      return 'SCORING_ERROR';
    }

    if (error.message?.includes('Behavior')) {
      return 'BEHAVIOR_ANALYSIS_ERROR';
    }

    return 'ANALYTICS_UNKNOWN_ERROR';
  }

  /**
   * تحديد رمز خطأ قاعدة البيانات
   */
  private getDatabaseErrorCode(error: Error & { code?: string }): string {
    if (error.code) {
      return error.code;
    }

    if (error.message?.includes('MongoDB')) {
      return 'DATABASE_ERROR';
    }

    if (error.message?.includes('connection')) {
      return 'DATABASE_CONNECTION_ERROR';
    }

    if (error.message?.includes('timeout')) {
      return 'DATABASE_TIMEOUT';
    }

    return 'DATABASE_UNKNOWN_ERROR';
  }

  /**
   * تحديد رسالة الخطأ
   */
  private getErrorMessage(error: Error & { message?: string }): string {
    if (error.message) {
      return error.message;
    }

    const code = this.getErrorCode(error);

    switch (code) {
      case 'USER_NOT_FOUND':
        return 'المستخدم غير موجود';
      case 'USER_ALREADY_EXISTS':
        return 'المستخدم موجود بالفعل';
      case 'INVALID_DATA':
        return 'البيانات المدخلة غير صحيحة';
      default:
        return 'حدث خطأ غير متوقع';
    }
  }

  /**
   * تحديد رسالة خطأ التحليل
   */
  private getAnalyticsErrorMessage(error: Error & { message?: string }): string {
    if (error.message) {
      return error.message;
    }

    const code = this.getAnalyticsErrorCode(error);

    switch (code) {
      case 'ANALYTICS_ERROR':
        return 'خطأ في تحليل البيانات';
      case 'SCORING_ERROR':
        return 'خطأ في حساب النقاط';
      case 'BEHAVIOR_ANALYSIS_ERROR':
        return 'خطأ في تحليل السلوك';
      default:
        return 'خطأ في التحليل';
    }
  }

  /**
   * تحديد رسالة خطأ قاعدة البيانات
   */
  private getDatabaseErrorMessage(error: Error & { message?: string }): string {
    if (error.message) {
      return error.message;
    }

    const code = this.getDatabaseErrorCode(error);

    switch (code) {
      case 'DATABASE_ERROR':
        return 'خطأ في قاعدة البيانات';
      case 'DATABASE_CONNECTION_ERROR':
        return 'خطأ في الاتصال بقاعدة البيانات';
      case 'DATABASE_TIMEOUT':
        return 'انتهت مهلة الاتصال بقاعدة البيانات';
      default:
        return 'خطأ في قاعدة البيانات';
    }
  }

  /**
   * تحديد تفاصيل الخطأ
   */
  private getErrorDetails(error: Error & { details?: string }): string | undefined {
    if (error.details) {
      return error.details;
    }

    if (error.stack) {
      return error.stack.split('\n')[0];
    }

    return undefined;
  }

  /**
   * تحديد رمز حالة HTTP
   */
  private getHttpStatusCode(errorCode: string): HttpStatus {
    switch (errorCode) {
      case 'USER_NOT_FOUND':
        return HttpStatus.NOT_FOUND;
      case 'USER_ALREADY_EXISTS':
        return HttpStatus.CONFLICT;
      case 'INVALID_DATA':
        return HttpStatus.BAD_REQUEST;
      case 'PERMISSION_DENIED':
        return HttpStatus.FORBIDDEN;
      case 'DATABASE_CONNECTION_ERROR':
      case 'DATABASE_TIMEOUT':
        return HttpStatus.SERVICE_UNAVAILABLE;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * إنشاء استجابة نجاح موحدة
   */
  createSuccessResponse<T>(
    data: T,
    message: string = 'تمت العملية بنجاح',
  ): {
    success: true;
    data: T;
    message: string;
    timestamp: string;
  } {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * إنشاء استجابة خطأ موحدة
   */
  createErrorResponse(
    code: string,
    message: string,
    context: ErrorContext = {},
    details?: string,
  ): StandardErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        context,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

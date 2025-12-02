import { HttpException } from '@nestjs/common';
import { ErrorCode, getErrorMessage, getHttpStatusCode } from '../constants/error-codes';

/**
 * Base Domain Exception
 * الاستثناء الأساسي للنطاق
 */
export class DomainException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    public readonly details?: unknown,
    public readonly fieldErrors?: Array<{ field: string; message: string }>,
  ) {
    const message = getErrorMessage(code);
    const status = getHttpStatusCode(code);
    
    super(
      {
        success: false,
        error: {
          code,
          message,
          details,
          fieldErrors: fieldErrors || null,
        },
      },
      status,
    );
  }
}

// ==================== Auth Exceptions ====================

export class AuthException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class InvalidOTPException extends AuthException {
  constructor(details?: unknown) {
    super(ErrorCode.AUTH_INVALID_OTP, details);
  }
}

export class UserNotFoundException extends AuthException {
  constructor(details?: unknown) {
    super(ErrorCode.AUTH_USER_NOT_FOUND, details);
  }
}

export class InvalidPasswordException extends AuthException {
  constructor(details?: unknown) {
    super(ErrorCode.AUTH_INVALID_PASSWORD, details);
  }
}

export class UserBlockedException extends AuthException {
  constructor(details?: unknown) {
    super(ErrorCode.AUTH_USER_BLOCKED, details);
  }
}

export class UnauthorizedException extends AuthException {
  constructor(details?: unknown) {
    super(ErrorCode.AUTH_UNAUTHORIZED, details);
  }
}

export class ForbiddenException extends AuthException {
  constructor(details?: unknown) {
    super(ErrorCode.AUTH_FORBIDDEN, details);
  }
}

export class NoPasswordException extends AuthException {
  constructor(details?: unknown) {
    super(ErrorCode.AUTH_NO_PASSWORD, details);
  }
}

export class SuperAdminExistsException extends AuthException {
  constructor(details?: unknown) {
    super(ErrorCode.AUTH_SUPER_ADMIN_EXISTS, details);
  }
}

export class InvalidSecretException extends AuthException {
  constructor(details?: unknown) {
    super(ErrorCode.AUTH_INVALID_SECRET, details);
  }
}

export class NotAllowedInProductionException extends AuthException {
  constructor(details?: unknown) {
    super(ErrorCode.AUTH_NOT_ALLOWED_IN_PRODUCTION, details);
  }
}

export class InvalidPhoneException extends AuthException {
  constructor(details?: unknown) {
    super(ErrorCode.AUTH_INVALID_PHONE, details);
  }
}

// ==================== Product Exceptions ====================

export class ProductException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class ProductNotFoundException extends ProductException {
  constructor(details?: unknown) {
    super(ErrorCode.PRODUCT_NOT_FOUND, details);
  }
}

export class ProductOutOfStockException extends ProductException {
  constructor(details?: unknown) {
    super(ErrorCode.PRODUCT_OUT_OF_STOCK, details);
  }
}

export class InsufficientStockException extends ProductException {
  constructor(details?: unknown) {
    super(ErrorCode.PRODUCT_INSUFFICIENT_STOCK, details);
  }
}

export class VariantNotFoundException extends ProductException {
  constructor(details?: unknown) {
    super(ErrorCode.VARIANT_NOT_FOUND, details);
  }
}

// ==================== Cart Exceptions ====================

export class CartException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class CartNotFoundException extends CartException {
  constructor(details?: unknown) {
    super(ErrorCode.CART_NOT_FOUND, details);
  }
}

export class CartEmptyException extends CartException {
  constructor(details?: unknown) {
    super(ErrorCode.CART_EMPTY, details);
  }
}

export class CartItemNotFoundException extends CartException {
  constructor(details?: unknown) {
    super(ErrorCode.CART_ITEM_NOT_FOUND, details);
  }
}

export class CartInvalidQuantityException extends CartException {
  constructor(details?: unknown) {
    super(ErrorCode.CART_INVALID_QUANTITY, details);
  }
}

export class CartCapacityExceededException extends CartException {
  constructor(details?: unknown) {
    super(ErrorCode.CART_CAPACITY_EXCEEDED, details);
  }
}

export class CartProductPriceMissingException extends CartException {
  constructor(details?: unknown) {
    super(ErrorCode.CART_PRODUCT_PRICE_MISSING, details);
  }
}

export class CartVariantNotFoundException extends CartException {
  constructor(details?: unknown) {
    super(ErrorCode.CART_VARIANT_NOT_FOUND, details);
  }
}

export class CartProductNotFoundException extends CartException {
  constructor(details?: unknown) {
    super(ErrorCode.CART_PRODUCT_NOT_FOUND, details);
  }
}

export class CartAlreadyConvertedException extends CartException {
  constructor(details?: unknown) {
    super(ErrorCode.CART_ALREADY_CONVERTED, details);
  }
}

// ==================== Order Exceptions ====================

export class OrderException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class OrderNotFoundException extends OrderException {
  constructor(details?: unknown) {
    super(ErrorCode.ORDER_NOT_FOUND, details);
  }
}

export class OrderCannotCancelException extends OrderException {
  constructor(details?: unknown) {
    super(ErrorCode.ORDER_CANNOT_CANCEL, details);
  }
}

export class OrderCannotUpdateException extends OrderException {
  constructor(details?: unknown) {
    super(ErrorCode.ORDER_CANNOT_UPDATE, details);
  }
}

export class OrderPreviewFailedException extends OrderException {
  constructor(details?: unknown) {
    super(ErrorCode.ORDER_PREVIEW_FAILED, details);
  }
}

export class OrderNotReadyToShipException extends OrderException {
  constructor(details?: unknown) {
    super(ErrorCode.ORDER_NOT_READY_TO_SHIP, details);
  }
}

export class OrderRatingNotAllowedException extends OrderException {
  constructor(details?: unknown) {
    super(ErrorCode.ORDER_RATING_NOT_ALLOWED, details);
  }
}

export class OrderReportGenerationFailedException extends OrderException {
  constructor(details?: unknown) {
    super(ErrorCode.ORDER_REPORT_GENERATION_FAILED, details);
  }
}

export class OrderPdfGenerationFailedException extends OrderException {
  constructor(details?: unknown) {
    super(ErrorCode.ORDER_PDF_GENERATION_FAILED, details);
  }
}

export class OrderExcelGenerationFailedException extends OrderException {
  constructor(details?: unknown) {
    super(ErrorCode.ORDER_EXCEL_GENERATION_FAILED, details);
  }
}

// ==================== Address Exceptions ====================

export class AddressException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class AddressNotFoundException extends AddressException {
  constructor(details?: unknown) {
    super(ErrorCode.ADDRESS_NOT_FOUND, details);
  }
}

// ==================== Category Exceptions ====================

export class CategoryException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class CategoryNotFoundException extends CategoryException {
  constructor(details?: unknown) {
    super(ErrorCode.CATEGORY_NOT_FOUND, details);
  }
}

export class CategoryAlreadyExistsException extends CategoryException {
  constructor(details?: unknown) {
    super(ErrorCode.CATEGORY_ALREADY_EXISTS, details);
  }
}

// ==================== Brand Exceptions ====================

export class BrandException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class BrandNotFoundException extends BrandException {
  constructor(details?: unknown) {
    super(ErrorCode.BRAND_NOT_FOUND, details);
  }
}

// ==================== Payment Exceptions ====================

export class PaymentException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class PaymentFailedException extends PaymentException {
  constructor(details?: unknown) {
    super(ErrorCode.PAYMENT_FAILED, details);
  }
}

// ==================== Favorite Exceptions ====================

export class FavoriteException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class FavoriteNotFoundException extends FavoriteException {
  constructor(details?: unknown) {
    super(ErrorCode.FAVORITE_NOT_FOUND, details);
  }
}

export class FavoriteAlreadyExistsException extends FavoriteException {
  constructor(details?: unknown) {
    super(ErrorCode.FAVORITE_ALREADY_EXISTS, details);
  }
}

// ==================== Service Exceptions ====================

export class ServiceException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class ServiceNotFoundException extends ServiceException {
  constructor(details?: unknown) {
    super(ErrorCode.SERVICE_NOT_FOUND, details);
  }
}

export class ServiceRequestNotFoundException extends ServiceException {
  constructor(details?: unknown) {
    super(ErrorCode.SERVICE_REQUEST_NOT_FOUND, details);
  }
}

// ==================== Support Exceptions ====================

export class SupportException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class TicketNotFoundException extends SupportException {
  constructor(details?: unknown) {
    super(ErrorCode.TICKET_NOT_FOUND, details);
  }
}

export class TicketAlreadyClosedException extends SupportException {
  constructor(details?: unknown) {
    super(ErrorCode.TICKET_ALREADY_CLOSED, details);
  }
}

// ==================== Marketing Exceptions ====================

export class MarketingException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class CouponNotFoundException extends MarketingException {
  constructor(details?: unknown) {
    super(ErrorCode.COUPON_NOT_FOUND, details);
  }
}

export class CouponExpiredException extends MarketingException {
  constructor(details?: unknown) {
    super(ErrorCode.COUPON_EXPIRED, details);
  }
}

export class CouponInvalidException extends MarketingException {
  constructor(details?: unknown) {
    super(ErrorCode.COUPON_INVALID, details);
  }
}

// ==================== Notification Exceptions ====================

export class NotificationException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class NotificationNotFoundException extends NotificationException {
  constructor(details?: unknown) {
    super(ErrorCode.NOTIFICATION_NOT_FOUND, details);
  }
}

// ==================== I18n Exceptions ====================

export class I18nException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class I18nKeyNotFoundException extends I18nException {
  constructor(details?: unknown) {
    super(ErrorCode.I18N_KEY_NOT_FOUND, details);
  }
}

export class I18nKeyAlreadyExistsException extends I18nException {
  constructor(details?: unknown) {
    super(ErrorCode.I18N_KEY_ALREADY_EXISTS, details);
  }
}

// ==================== Upload Exceptions ====================

export class UploadException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class UploadFailedException extends UploadException {
  constructor(details?: unknown) {
    super(ErrorCode.UPLOAD_FAILED, details);
  }
}

export class FileTooLargeException extends UploadException {
  constructor(details?: unknown) {
    super(ErrorCode.UPLOAD_FILE_TOO_LARGE, details);
  }
}

export class InvalidFileTypeException extends UploadException {
  constructor(details?: unknown) {
    super(ErrorCode.UPLOAD_INVALID_FILE_TYPE, details);
  }
}

export class MediaNotFoundException extends UploadException {
  constructor(details?: unknown) {
    super(ErrorCode.MEDIA_NOT_FOUND, details);
  }
}

export class ImageTooSmallException extends UploadException {
  constructor(details?: unknown) {
    super(ErrorCode.UPLOAD_IMAGE_TOO_SMALL, details);
  }
}

export class InvalidAspectRatioException extends UploadException {
  constructor(details?: unknown) {
    super(ErrorCode.UPLOAD_INVALID_ASPECT_RATIO, details);
  }
}

// ==================== Exchange Rate Exceptions ====================

export class ExchangeRateException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class ExchangeRateNotFoundException extends ExchangeRateException {
  constructor(details?: unknown) {
    super(ErrorCode.EXCHANGE_RATE_NOT_FOUND, details);
  }
}

export class CurrencyNotSupportedException extends ExchangeRateException {
  constructor(details?: unknown) {
    super(ErrorCode.CURRENCY_NOT_SUPPORTED, details);
  }
}

export class ExchangeRateFetchFailedException extends ExchangeRateException {
  constructor(details?: unknown) {
    super(ErrorCode.EXCHANGE_RATE_FETCH_FAILED, details);
  }
}

export class ExchangeRateSyncJobNotFoundException extends ExchangeRateException {
  constructor(details?: unknown) {
    super(ErrorCode.EXCHANGE_RATE_SYNC_JOB_NOT_FOUND, details);
  }
}

export class ExchangeRateSyncJobInvalidException extends ExchangeRateException {
  constructor(details?: unknown) {
    super(ErrorCode.EXCHANGE_RATE_SYNC_JOB_INVALID, details);
  }
}

export class ExchangeRateSyncFailedException extends ExchangeRateException {
  constructor(details?: unknown) {
    super(ErrorCode.EXCHANGE_RATE_SYNC_FAILED, details);
  }
}

// ==================== Analytics Exceptions ====================

export class AnalyticsException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class AnalyticsReportNotFoundException extends AnalyticsException {
  constructor(details?: unknown) {
    super(ErrorCode.ANALYTICS_REPORT_NOT_FOUND, details);
  }
}

export class AnalyticsReportGenerationFailedException extends AnalyticsException {
  constructor(details?: unknown) {
    super(ErrorCode.ANALYTICS_REPORT_GENERATION_FAILED, details);
  }
}

export class AnalyticsSnapshotGenerationFailedException extends AnalyticsException {
  constructor(details?: unknown) {
    super(ErrorCode.ANALYTICS_SNAPSHOT_GENERATION_FAILED, details);
  }
}

export class AnalyticsCacheException extends AnalyticsException {
  constructor(details?: unknown) {
    super(ErrorCode.ANALYTICS_CACHE_ERROR, details);
  }
}

export class AnalyticsInvalidDateRangeException extends AnalyticsException {
  constructor(details?: unknown) {
    super(ErrorCode.ANALYTICS_INVALID_DATE_RANGE, details);
  }
}

export class AnalyticsQueryFailedException extends AnalyticsException {
  constructor(details?: unknown) {
    super(ErrorCode.ANALYTICS_QUERY_FAILED, details);
  }
}

export class AnalyticsCalculationFailedException extends AnalyticsException {
  constructor(details?: unknown) {
    super(ErrorCode.ANALYTICS_CALCULATION_FAILED, details);
  }
}

export class AnalyticsUserCalculationFailedException extends AnalyticsException {
  constructor(details?: unknown) {
    super(ErrorCode.ANALYTICS_USER_CALCULATION_FAILED, details);
  }
}

export class AnalyticsProductCalculationFailedException extends AnalyticsException {
  constructor(details?: unknown) {
    super(ErrorCode.ANALYTICS_PRODUCT_CALCULATION_FAILED, details);
  }
}

export class AnalyticsOrderCalculationFailedException extends AnalyticsException {
  constructor(details?: unknown) {
    super(ErrorCode.ANALYTICS_ORDER_CALCULATION_FAILED, details);
  }
}

export class AnalyticsServiceCalculationFailedException extends AnalyticsException {
  constructor(details?: unknown) {
    super(ErrorCode.ANALYTICS_SERVICE_CALCULATION_FAILED, details);
  }
}

export class AnalyticsSupportCalculationFailedException extends AnalyticsException {
  constructor(details?: unknown) {
    super(ErrorCode.ANALYTICS_SUPPORT_CALCULATION_FAILED, details);
  }
}

export class AnalyticsCronJobFailedException extends AnalyticsException {
  constructor(details?: unknown) {
    super(ErrorCode.ANALYTICS_CRON_JOB_FAILED, details);
  }
}

// ==================== Attribute Exceptions ====================

export class AttributeException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class AttributeNotFoundException extends AttributeException {
  constructor(details?: unknown) {
    super(ErrorCode.ATTRIBUTE_NOT_FOUND, details);
  }
}

export class AttributeAlreadyExistsException extends AttributeException {
  constructor(details?: unknown) {
    super(ErrorCode.ATTRIBUTE_ALREADY_EXISTS, details);
  }
}

export class AttributeInUseException extends AttributeException {
  constructor(details?: unknown) {
    super(ErrorCode.ATTRIBUTE_IN_USE, details);
  }
}

export class AttributeValueNotFoundException extends AttributeException {
  constructor(details?: unknown) {
    super(ErrorCode.ATTRIBUTE_VALUE_NOT_FOUND, details);
  }
}

export class AttributeValueAlreadyExistsException extends AttributeException {
  constructor(details?: unknown) {
    super(ErrorCode.ATTRIBUTE_VALUE_ALREADY_EXISTS, details);
  }
}

export class AttributeValueInUseException extends AttributeException {
  constructor(details?: unknown) {
    super(ErrorCode.ATTRIBUTE_VALUE_IN_USE, details);
  }
}

export class AttributeValueInvalidHexException extends AttributeException {
  constructor(details?: unknown) {
    super(ErrorCode.ATTRIBUTE_VALUE_INVALID_HEX, details);
  }
}

export class AttributeValueHexRequiredException extends AttributeException {
  constructor(details?: unknown) {
    super(ErrorCode.ATTRIBUTE_VALUE_HEX_REQUIRED, details);
  }
}


/**
 * نظام موحد لأكواد الأخطاء
 * Error Codes System
 * 
 * التنسيق: MODULE_XXX
 * حيث XXX رقم من 100-999
 */

export enum ErrorCode {
  // ==================== عام (GENERAL: 001-099) ====================
  UNEXPECTED_ERROR = 'GENERAL_001',
  INTERNAL_SERVER_ERROR = 'GENERAL_002',
  DATABASE_ERROR = 'GENERAL_003',
  VALIDATION_ERROR = 'GENERAL_004',
  NETWORK_ERROR = 'GENERAL_005',
  TIMEOUT_ERROR = 'GENERAL_006',
  RATE_LIMIT_EXCEEDED = 'GENERAL_007',
  SERVICE_UNAVAILABLE = 'GENERAL_008',

  // ==================== المصادقة (AUTH: 100-199) ====================
  AUTH_INVALID_OTP = 'AUTH_100',
  AUTH_OTP_EXPIRED = 'AUTH_101',
  AUTH_OTP_SEND_FAILED = 'AUTH_102',
  AUTH_USER_NOT_FOUND = 'AUTH_103',
  AUTH_INVALID_PASSWORD = 'AUTH_104',
  AUTH_INVALID_CREDENTIALS = 'AUTH_105',
  AUTH_USER_BLOCKED = 'AUTH_106',
  AUTH_USER_SUSPENDED = 'AUTH_107',
  AUTH_USER_DELETED = 'AUTH_108',
  AUTH_USER_EXISTS = 'AUTH_109',
  AUTH_EMAIL_EXISTS = 'AUTH_111',
  AUTH_INVALID_TOKEN = 'AUTH_112',
  AUTH_TOKEN_EXPIRED = 'AUTH_113',
  AUTH_REFRESH_TOKEN_INVALID = 'AUTH_114',
  AUTH_UNAUTHORIZED = 'AUTH_115',
  AUTH_FORBIDDEN = 'AUTH_116',
  AUTH_NO_PASSWORD = 'AUTH_117',
  AUTH_WEAK_PASSWORD = 'AUTH_118',
  AUTH_SUPER_ADMIN_EXISTS = 'AUTH_119',
  AUTH_INVALID_SECRET = 'AUTH_120',
  AUTH_NOT_ALLOWED_IN_PRODUCTION = 'AUTH_121',
  AUTH_JOB_TITLE_REQUIRED = 'AUTH_122',
  AUTH_CAPS_NOT_FOUND = 'AUTH_123',
  AUTH_INVALID_DISCOUNT = 'AUTH_124',
  AUTH_PASSWORD_NOT_SET = 'AUTH_125',
  AUTH_USER_NOT_ACTIVE = 'AUTH_126',
  AUTH_NOT_ADMIN = 'AUTH_127',
  AUTH_PHONE_EXISTS = 'AUTH_128',
  AUTH_INVALID_PHONE = 'AUTH_129',

  // ==================== المستخدمون (USERS: 200-299) ====================
  USER_NOT_FOUND = 'USER_200',
  USER_ALREADY_EXISTS = 'USER_201',
  USER_INVALID_DATA = 'USER_202',
  USER_UPDATE_FAILED = 'USER_203',
  USER_DELETE_FAILED = 'USER_204',
  USER_BLOCKED = 'USER_205',
  USER_SUSPENDED = 'USER_206',
  USER_NOT_VERIFIED = 'USER_207',
  USER_PERMISSION_DENIED = 'USER_208',

  // ==================== المنتجات (PRODUCTS: 300-399) ====================
  PRODUCT_NOT_FOUND = 'PRODUCT_300',
  PRODUCT_OUT_OF_STOCK = 'PRODUCT_301',
  PRODUCT_INSUFFICIENT_STOCK = 'PRODUCT_302',
  PRODUCT_INVALID_QUANTITY = 'PRODUCT_303',
  PRODUCT_INVALID_PRICE = 'PRODUCT_304',
  PRODUCT_INVALID_DATA = 'PRODUCT_305',
  PRODUCT_CREATE_FAILED = 'PRODUCT_306',
  PRODUCT_UPDATE_FAILED = 'PRODUCT_307',
  PRODUCT_DELETE_FAILED = 'PRODUCT_308',
  PRODUCT_INACTIVE = 'PRODUCT_309',
  PRODUCT_DISCONTINUED = 'PRODUCT_310',
  VARIANT_NOT_FOUND = 'PRODUCT_311',
  VARIANT_OUT_OF_STOCK = 'PRODUCT_312',
  VARIANT_INACTIVE = 'PRODUCT_313',
  VARIANT_DUPLICATE_SKU = 'PRODUCT_314',
  VARIANT_CREATE_FAILED = 'PRODUCT_315',
  VARIANT_UPDATE_FAILED = 'PRODUCT_316',
  VARIANT_DELETE_FAILED = 'PRODUCT_317',

  // ==================== الفئات (CATEGORIES: 400-449) ====================
  CATEGORY_NOT_FOUND = 'CATEGORY_400',
  CATEGORY_ALREADY_EXISTS = 'CATEGORY_401',
  CATEGORY_HAS_PRODUCTS = 'CATEGORY_402',
  CATEGORY_HAS_SUBCATEGORIES = 'CATEGORY_403',
  CATEGORY_INVALID_PARENT = 'CATEGORY_404',
  CATEGORY_INVALID_DATA = 'CATEGORY_405',
  CATEGORY_CREATE_FAILED = 'CATEGORY_406',
  CATEGORY_UPDATE_FAILED = 'CATEGORY_407',
  CATEGORY_DELETE_FAILED = 'CATEGORY_408',

  // ==================== العلامات التجارية (BRANDS: 450-499) ====================
  BRAND_NOT_FOUND = 'BRAND_450',
  BRAND_ALREADY_EXISTS = 'BRAND_451',
  BRAND_HAS_PRODUCTS = 'BRAND_452',
  BRAND_INVALID_DATA = 'BRAND_453',
  BRAND_CREATE_FAILED = 'BRAND_454',
  BRAND_UPDATE_FAILED = 'BRAND_455',
  BRAND_DELETE_FAILED = 'BRAND_456',

  // ==================== السلة (CART: 500-549) ====================
  CART_NOT_FOUND = 'CART_500',
  CART_EMPTY = 'CART_501',
  CART_ITEM_NOT_FOUND = 'CART_502',
  CART_INVALID_QUANTITY = 'CART_503',
  CART_PRODUCT_UNAVAILABLE = 'CART_504',
  CART_ADD_FAILED = 'CART_505',
  CART_UPDATE_FAILED = 'CART_506',
  CART_REMOVE_FAILED = 'CART_507',
  CART_CLEAR_FAILED = 'CART_508',
  CART_EXPIRED = 'CART_509',
  CART_CAPACITY_EXCEEDED = 'CART_510',
  CART_PRODUCT_PRICE_MISSING = 'CART_511',
  CART_VARIANT_NOT_FOUND = 'CART_512',
  CART_PRODUCT_NOT_FOUND = 'CART_513',
  CART_ALREADY_CONVERTED = 'CART_514',
  CART_INVALID_DATA = 'CART_515',
  CART_MERGE_FAILED = 'CART_516',
  CART_SYNC_FAILED = 'CART_517',

  // ==================== الطلبات (ORDERS: 550-649) ====================
  ORDER_NOT_FOUND = 'ORDER_600',
  ORDER_INVALID_STATUS = 'ORDER_601',
  ORDER_CANNOT_CANCEL = 'ORDER_602',
  ORDER_CANNOT_UPDATE = 'ORDER_603',
  ORDER_ALREADY_PAID = 'ORDER_604',
  ORDER_ALREADY_CANCELLED = 'ORDER_605',
  ORDER_CREATE_FAILED = 'ORDER_607',
  ORDER_UPDATE_FAILED = 'ORDER_608',
  ORDER_PREVIEW_FAILED = 'ORDER_609',
  ORDER_CONFIRM_FAILED = 'ORDER_610',
  ORDER_NOT_READY_TO_SHIP = 'ORDER_611',
  ORDER_REFUND_FAILED = 'ORDER_612',
  ORDER_REFUND_AMOUNT_INVALID = 'ORDER_613',
  ORDER_RATING_NOT_ALLOWED = 'ORDER_614',
  ORDER_ADDRESS_NOT_FOUND = 'ORDER_615',
  ORDER_ADDRESS_INVALID = 'ORDER_616',
  ORDER_REPORT_GENERATION_FAILED = 'ORDER_617',
  ORDER_PDF_GENERATION_FAILED = 'ORDER_618',
  ORDER_EXCEL_GENERATION_FAILED = 'ORDER_619',

  // ==================== العناوين (ADDRESSES: 650-699) ====================
  ADDRESS_NOT_FOUND = 'ADDRESS_650',
  ADDRESS_INVALID_DATA = 'ADDRESS_651',
  ADDRESS_CREATE_FAILED = 'ADDRESS_652',
  ADDRESS_UPDATE_FAILED = 'ADDRESS_653',
  ADDRESS_DELETE_FAILED = 'ADDRESS_654',

  // ==================== الدفع (PAYMENT: 700-749) ====================
  PAYMENT_FAILED = 'PAYMENT_700',
  PAYMENT_INVALID_METHOD = 'PAYMENT_701',
  PAYMENT_GATEWAY_ERROR = 'PAYMENT_702',
  PAYMENT_INSUFFICIENT_FUNDS = 'PAYMENT_703',
  PAYMENT_TIMEOUT = 'PAYMENT_704',
  PAYMENT_CANCELLED = 'PAYMENT_705',
  PAYMENT_ALREADY_PROCESSED = 'PAYMENT_706',

  // ==================== المفضلة (FAVORITES: 750-799) ====================
  FAVORITE_NOT_FOUND = 'FAVORITE_750',
  FAVORITE_ALREADY_EXISTS = 'FAVORITE_751',
  FAVORITE_ADD_FAILED = 'FAVORITE_752',
  FAVORITE_REMOVE_FAILED = 'FAVORITE_753',

  // ==================== الخدمات (SERVICES: 800-849) ====================
  SERVICE_NOT_FOUND = 'SERVICE_800',
  SERVICE_REQUEST_NOT_FOUND = 'SERVICE_801',
  SERVICE_INVALID_STATUS = 'SERVICE_802',
  SERVICE_CREATE_FAILED = 'SERVICE_803',
  SERVICE_UPDATE_FAILED = 'SERVICE_804',
  SERVICE_OFFER_NOT_FOUND = 'SERVICE_805',
  SERVICE_OFFER_EXPIRED = 'SERVICE_806',

  // ==================== الدعم (SUPPORT: 850-899) ====================
  TICKET_NOT_FOUND = 'SUPPORT_850',
  TICKET_INVALID_STATUS = 'SUPPORT_851',
  TICKET_CREATE_FAILED = 'SUPPORT_852',
  TICKET_UPDATE_FAILED = 'SUPPORT_853',
  TICKET_ALREADY_CLOSED = 'SUPPORT_854',
  TICKET_CANNOT_REOPEN = 'SUPPORT_855',
  MESSAGE_ADD_FAILED = 'SUPPORT_856',

  // ==================== التسويق (MARKETING: 900-949) ====================
  COUPON_NOT_FOUND = 'MARKETING_900',
  COUPON_EXPIRED = 'MARKETING_901',
  COUPON_INVALID = 'MARKETING_902',
  COUPON_ALREADY_USED = 'MARKETING_903',
  COUPON_MAX_USES_REACHED = 'MARKETING_904',
  COUPON_MIN_AMOUNT_NOT_MET = 'MARKETING_905',
  BANNER_NOT_FOUND = 'MARKETING_906',
  PRICE_RULE_NOT_FOUND = 'MARKETING_907',

  // ==================== الإشعارات (NOTIFICATIONS: 950-999) ====================
  NOTIFICATION_NOT_FOUND = 'NOTIFICATION_950',
  NOTIFICATION_SEND_FAILED = 'NOTIFICATION_951',
  NOTIFICATION_TEMPLATE_NOT_FOUND = 'NOTIFICATION_952',
  NOTIFICATION_PREFERENCE_UPDATE_FAILED = 'NOTIFICATION_953',

  // ==================== الترجمة (I18N: 1000-1049) ====================
  I18N_KEY_NOT_FOUND = 'I18N_1000',
  I18N_KEY_ALREADY_EXISTS = 'I18N_1001',
  I18N_TRANSLATION_NOT_FOUND = 'I18N_1002',
  I18N_UPDATE_FAILED = 'I18N_1003',
  I18N_INVALID_LANGUAGE = 'I18N_1004',

  // ==================== الرفع (UPLOAD: 1050-1099) ====================
  UPLOAD_FAILED = 'UPLOAD_1050',
  UPLOAD_FILE_TOO_LARGE = 'UPLOAD_1051',
  UPLOAD_INVALID_FILE_TYPE = 'UPLOAD_1052',
  UPLOAD_NO_FILE = 'UPLOAD_1053',
  MEDIA_NOT_FOUND = 'UPLOAD_1054',
  MEDIA_DELETE_FAILED = 'UPLOAD_1055',

  // ==================== أسعار الصرف (EXCHANGE_RATES: 1100-1149) ====================
  EXCHANGE_RATE_NOT_FOUND = 'EXCHANGE_1100',
  EXCHANGE_RATE_UPDATE_FAILED = 'EXCHANGE_1101',
  CURRENCY_NOT_SUPPORTED = 'EXCHANGE_1102',
  CONVERSION_FAILED = 'EXCHANGE_1103',
  EXCHANGE_RATE_FETCH_FAILED = 'EXCHANGE_1104',

  // ==================== التحليلات (ANALYTICS: 1150-1199) ====================
  ANALYTICS_REPORT_NOT_FOUND = 'ANALYTICS_1150',
  ANALYTICS_REPORT_GENERATION_FAILED = 'ANALYTICS_1151',
  ANALYTICS_SNAPSHOT_GENERATION_FAILED = 'ANALYTICS_1152',
  ANALYTICS_CACHE_ERROR = 'ANALYTICS_1153',
  ANALYTICS_INVALID_DATE_RANGE = 'ANALYTICS_1154',
  ANALYTICS_QUERY_FAILED = 'ANALYTICS_1155',
  ANALYTICS_CALCULATION_FAILED = 'ANALYTICS_1156',
  ANALYTICS_USER_CALCULATION_FAILED = 'ANALYTICS_1157',
  ANALYTICS_PRODUCT_CALCULATION_FAILED = 'ANALYTICS_1158',
  ANALYTICS_ORDER_CALCULATION_FAILED = 'ANALYTICS_1159',
  ANALYTICS_SERVICE_CALCULATION_FAILED = 'ANALYTICS_1160',
  ANALYTICS_SUPPORT_CALCULATION_FAILED = 'ANALYTICS_1161',
  ANALYTICS_CRON_JOB_FAILED = 'ANALYTICS_1162',

  // ==================== السمات (ATTRIBUTES: 1200-1249) ====================
  ATTRIBUTE_NOT_FOUND = 'ATTRIBUTE_1200',
  ATTRIBUTE_ALREADY_EXISTS = 'ATTRIBUTE_1201',
  ATTRIBUTE_IN_USE = 'ATTRIBUTE_1202',
  ATTRIBUTE_INVALID_DATA = 'ATTRIBUTE_1203',
  ATTRIBUTE_CREATE_FAILED = 'ATTRIBUTE_1204',
  ATTRIBUTE_UPDATE_FAILED = 'ATTRIBUTE_1205',
  ATTRIBUTE_DELETE_FAILED = 'ATTRIBUTE_1206',
  ATTRIBUTE_VALUE_NOT_FOUND = 'ATTRIBUTE_1207',
  ATTRIBUTE_VALUE_ALREADY_EXISTS = 'ATTRIBUTE_1208',
  ATTRIBUTE_VALUE_IN_USE = 'ATTRIBUTE_1209',
  ATTRIBUTE_VALUE_INVALID_HEX = 'ATTRIBUTE_1210',
  ATTRIBUTE_VALUE_HEX_REQUIRED = 'ATTRIBUTE_1211',
}

/**
 * رسائل الأخطاء بالعربية
 * Error Messages in Arabic
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // ==================== عام ====================
  [ErrorCode.UNEXPECTED_ERROR]: 'حدث خطأ غير متوقع',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'خطأ في الخادم الداخلي',
  [ErrorCode.DATABASE_ERROR]: 'خطأ في قاعدة البيانات',
  [ErrorCode.VALIDATION_ERROR]: 'خطأ في التحقق من البيانات',
  [ErrorCode.NETWORK_ERROR]: 'خطأ في الاتصال بالشبكة',
  [ErrorCode.TIMEOUT_ERROR]: 'انتهت مهلة الطلب',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'تم تجاوز الحد المسموح من الطلبات',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'الخدمة غير متاحة حالياً',

  // ==================== المصادقة ====================
  [ErrorCode.AUTH_INVALID_OTP]: 'رمز التحقق غير صالح',
  [ErrorCode.AUTH_OTP_EXPIRED]: 'انتهت صلاحية رمز التحقق',
  [ErrorCode.AUTH_OTP_SEND_FAILED]: 'فشل إرسال رمز التحقق',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'المستخدم غير موجود',
  [ErrorCode.AUTH_INVALID_PASSWORD]: 'كلمة المرور غير صحيحة',
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'بيانات الدخول غير صحيحة',
  [ErrorCode.AUTH_USER_BLOCKED]: 'تم حظر المستخدم',
  [ErrorCode.AUTH_USER_SUSPENDED]: 'تم تعليق حساب المستخدم',
  [ErrorCode.AUTH_USER_DELETED]: 'تم حذف حساب المستخدم',
  [ErrorCode.AUTH_USER_EXISTS]: 'المستخدم موجود بالفعل',
  [ErrorCode.AUTH_EMAIL_EXISTS]: 'البريد الإلكتروني مسجل بالفعل',
  [ErrorCode.AUTH_INVALID_TOKEN]: 'رمز الوصول غير صالح',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'انتهت صلاحية رمز الوصول',
  [ErrorCode.AUTH_REFRESH_TOKEN_INVALID]: 'رمز التحديث غير صالح',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'غير مصرح بالوصول',
  [ErrorCode.AUTH_FORBIDDEN]: 'ليس لديك صلاحية للوصول',
  [ErrorCode.AUTH_NO_PASSWORD]: 'كلمة المرور غير محددة',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'كلمة المرور ضعيفة',
  [ErrorCode.AUTH_SUPER_ADMIN_EXISTS]: 'المدير الرئيسي موجود بالفعل',
  [ErrorCode.AUTH_INVALID_SECRET]: 'المفتاح السري غير صحيح',
  [ErrorCode.AUTH_NOT_ALLOWED_IN_PRODUCTION]: 'هذه العملية غير متاحة في بيئة الإنتاج',
  [ErrorCode.AUTH_JOB_TITLE_REQUIRED]: 'المسمى الوظيفي مطلوب للمهندسين',
  [ErrorCode.AUTH_CAPS_NOT_FOUND]: 'سجل القدرات غير موجود',
  [ErrorCode.AUTH_INVALID_DISCOUNT]: 'نسبة الخصم يجب أن تكون بين 0 و 100',
  [ErrorCode.AUTH_PASSWORD_NOT_SET]: 'لم يتم تعيين كلمة مرور لهذا الحساب',
  [ErrorCode.AUTH_USER_NOT_ACTIVE]: 'هذا الحساب غير نشط',
  [ErrorCode.AUTH_NOT_ADMIN]: 'هذا الحساب غير مصرح له بالدخول للوحة التحكم',
  [ErrorCode.AUTH_PHONE_EXISTS]: 'رقم الهاتف موجود مسبقاً',
  [ErrorCode.AUTH_INVALID_PHONE]: 'رقم الهاتف غير صحيح',

  // ==================== المستخدمون ====================
  [ErrorCode.USER_NOT_FOUND]: 'المستخدم غير موجود',
  [ErrorCode.USER_ALREADY_EXISTS]: 'المستخدم موجود بالفعل',
  [ErrorCode.USER_INVALID_DATA]: 'بيانات المستخدم غير صالحة',
  [ErrorCode.USER_UPDATE_FAILED]: 'فشل تحديث بيانات المستخدم',
  [ErrorCode.USER_DELETE_FAILED]: 'فشل حذف المستخدم',
  [ErrorCode.USER_BLOCKED]: 'المستخدم محظور',
  [ErrorCode.USER_SUSPENDED]: 'حساب المستخدم معلق',
  [ErrorCode.USER_NOT_VERIFIED]: 'حساب المستخدم غير موثق',
  [ErrorCode.USER_PERMISSION_DENIED]: 'ليس لديك صلاحية للقيام بهذا الإجراء',

  // ==================== المنتجات ====================
  [ErrorCode.PRODUCT_NOT_FOUND]: 'المنتج غير موجود',
  [ErrorCode.PRODUCT_OUT_OF_STOCK]: 'المنتج غير متوفر في المخزون',
  [ErrorCode.PRODUCT_INSUFFICIENT_STOCK]: 'الكمية المتوفرة غير كافية',
  [ErrorCode.PRODUCT_INVALID_QUANTITY]: 'الكمية غير صالحة',
  [ErrorCode.PRODUCT_INVALID_PRICE]: 'السعر غير صالح',
  [ErrorCode.PRODUCT_INVALID_DATA]: 'بيانات المنتج غير صالحة',
  [ErrorCode.PRODUCT_CREATE_FAILED]: 'فشل إنشاء المنتج',
  [ErrorCode.PRODUCT_UPDATE_FAILED]: 'فشل تحديث المنتج',
  [ErrorCode.PRODUCT_DELETE_FAILED]: 'فشل حذف المنتج',
  [ErrorCode.PRODUCT_INACTIVE]: 'المنتج غير نشط',
  [ErrorCode.PRODUCT_DISCONTINUED]: 'تم إيقاف المنتج',
  [ErrorCode.VARIANT_NOT_FOUND]: 'خيار المنتج غير موجود',
  [ErrorCode.VARIANT_OUT_OF_STOCK]: 'خيار المنتج غير متوفر',
  [ErrorCode.VARIANT_INACTIVE]: 'خيار المنتج غير نشط',
  [ErrorCode.VARIANT_DUPLICATE_SKU]: 'رمز SKU موجود مسبقاً',
  [ErrorCode.VARIANT_CREATE_FAILED]: 'فشل إنشاء خيار المنتج',
  [ErrorCode.VARIANT_UPDATE_FAILED]: 'فشل تحديث خيار المنتج',
  [ErrorCode.VARIANT_DELETE_FAILED]: 'فشل حذف خيار المنتج',

  // ==================== الفئات ====================
  [ErrorCode.CATEGORY_NOT_FOUND]: 'الفئة غير موجودة',
  [ErrorCode.CATEGORY_ALREADY_EXISTS]: 'الفئة موجودة بالفعل',
  [ErrorCode.CATEGORY_HAS_PRODUCTS]: 'لا يمكن حذف الفئة لوجود منتجات بها',
  [ErrorCode.CATEGORY_HAS_SUBCATEGORIES]: 'لا يمكن حذف الفئة لوجود فئات فرعية',
  [ErrorCode.CATEGORY_INVALID_PARENT]: 'الفئة الأب غير صالحة',
  [ErrorCode.CATEGORY_INVALID_DATA]: 'بيانات الفئة غير صالحة',
  [ErrorCode.CATEGORY_CREATE_FAILED]: 'فشل إنشاء الفئة',
  [ErrorCode.CATEGORY_UPDATE_FAILED]: 'فشل تحديث الفئة',
  [ErrorCode.CATEGORY_DELETE_FAILED]: 'فشل حذف الفئة',

  // ==================== العلامات التجارية ====================
  [ErrorCode.BRAND_NOT_FOUND]: 'العلامة التجارية غير موجودة',
  [ErrorCode.BRAND_ALREADY_EXISTS]: 'العلامة التجارية موجودة بالفعل',
  [ErrorCode.BRAND_HAS_PRODUCTS]: 'لا يمكن حذف العلامة التجارية لوجود منتجات بها',
  [ErrorCode.BRAND_INVALID_DATA]: 'بيانات العلامة التجارية غير صالحة',
  [ErrorCode.BRAND_CREATE_FAILED]: 'فشل إنشاء العلامة التجارية',
  [ErrorCode.BRAND_UPDATE_FAILED]: 'فشل تحديث العلامة التجارية',
  [ErrorCode.BRAND_DELETE_FAILED]: 'فشل حذف العلامة التجارية',

  // ==================== السلة ====================
  [ErrorCode.CART_NOT_FOUND]: 'السلة غير موجودة',
  [ErrorCode.CART_EMPTY]: 'السلة فارغة',
  [ErrorCode.CART_ITEM_NOT_FOUND]: 'المنتج غير موجود في السلة',
  [ErrorCode.CART_INVALID_QUANTITY]: 'الكمية غير صالحة',
  [ErrorCode.CART_PRODUCT_UNAVAILABLE]: 'المنتج غير متوفر',
  [ErrorCode.CART_ADD_FAILED]: 'فشل إضافة المنتج إلى السلة',
  [ErrorCode.CART_UPDATE_FAILED]: 'فشل تحديث السلة',
  [ErrorCode.CART_REMOVE_FAILED]: 'فشل إزالة المنتج من السلة',
  [ErrorCode.CART_CLEAR_FAILED]: 'فشل تفريغ السلة',
  [ErrorCode.CART_EXPIRED]: 'انتهت صلاحية السلة',
  [ErrorCode.CART_CAPACITY_EXCEEDED]: 'تم تجاوز الحد الأقصى لعدد العناصر في السلة',
  [ErrorCode.CART_PRODUCT_PRICE_MISSING]: 'لم يتم تحديد سعر لهذا المنتج',
  [ErrorCode.CART_VARIANT_NOT_FOUND]: 'المتغير غير موجود',
  [ErrorCode.CART_PRODUCT_NOT_FOUND]: 'المنتج غير موجود',
  [ErrorCode.CART_ALREADY_CONVERTED]: 'تم تحويل السلة إلى طلب بالفعل',
  [ErrorCode.CART_INVALID_DATA]: 'بيانات السلة غير صالحة',
  [ErrorCode.CART_MERGE_FAILED]: 'فشل دمج السلات',
  [ErrorCode.CART_SYNC_FAILED]: 'فشل مزامنة السلة',

  // ==================== الطلبات ====================
  [ErrorCode.ORDER_NOT_FOUND]: 'الطلب غير موجود',
  [ErrorCode.ORDER_INVALID_STATUS]: 'حالة الطلب غير صالحة',
  [ErrorCode.ORDER_CANNOT_CANCEL]: 'لا يمكن إلغاء الطلب في هذه المرحلة',
  [ErrorCode.ORDER_CANNOT_UPDATE]: 'لا يمكن تعديل الطلب',
  [ErrorCode.ORDER_ALREADY_PAID]: 'الطلب مدفوع بالفعل',
  [ErrorCode.ORDER_ALREADY_CANCELLED]: 'الطلب ملغى بالفعل',
  [ErrorCode.ORDER_CREATE_FAILED]: 'فشل إنشاء الطلب',
  [ErrorCode.ORDER_UPDATE_FAILED]: 'فشل تحديث الطلب',
  [ErrorCode.ORDER_PREVIEW_FAILED]: 'فشل في معاينة الطلب',
  [ErrorCode.ORDER_CONFIRM_FAILED]: 'فشل تأكيد الطلب',
  [ErrorCode.ORDER_NOT_READY_TO_SHIP]: 'الطلب غير جاهز للشحن',
  [ErrorCode.ORDER_REFUND_FAILED]: 'فشل استرداد المبلغ',
  [ErrorCode.ORDER_REFUND_AMOUNT_INVALID]: 'مبلغ الاسترداد غير صالح',
  [ErrorCode.ORDER_RATING_NOT_ALLOWED]: 'لا يمكن التقييم إلا بعد استلام الطلب',
  [ErrorCode.ORDER_ADDRESS_NOT_FOUND]: 'عنوان التوصيل غير موجود',
  [ErrorCode.ORDER_ADDRESS_INVALID]: 'عنوان التوصيل غير صالح',
  [ErrorCode.ORDER_REPORT_GENERATION_FAILED]: 'فشل إنشاء تقرير الطلبات',
  [ErrorCode.ORDER_PDF_GENERATION_FAILED]: 'فشل في إنشاء تقرير PDF',
  [ErrorCode.ORDER_EXCEL_GENERATION_FAILED]: 'فشل في إنشاء تقرير Excel',

  // ==================== العناوين ====================
  [ErrorCode.ADDRESS_NOT_FOUND]: 'العنوان غير موجود',
  [ErrorCode.ADDRESS_INVALID_DATA]: 'بيانات العنوان غير صالحة',
  [ErrorCode.ADDRESS_CREATE_FAILED]: 'فشل إضافة العنوان',
  [ErrorCode.ADDRESS_UPDATE_FAILED]: 'فشل تحديث العنوان',
  [ErrorCode.ADDRESS_DELETE_FAILED]: 'فشل حذف العنوان',

  // ==================== الدفع ====================
  [ErrorCode.PAYMENT_FAILED]: 'فشلت عملية الدفع',
  [ErrorCode.PAYMENT_INVALID_METHOD]: 'طريقة الدفع غير صالحة',
  [ErrorCode.PAYMENT_GATEWAY_ERROR]: 'خطأ في بوابة الدفع',
  [ErrorCode.PAYMENT_INSUFFICIENT_FUNDS]: 'الرصيد غير كافي',
  [ErrorCode.PAYMENT_TIMEOUT]: 'انتهت مهلة عملية الدفع',
  [ErrorCode.PAYMENT_CANCELLED]: 'تم إلغاء عملية الدفع',
  [ErrorCode.PAYMENT_ALREADY_PROCESSED]: 'تمت معالجة الدفع بالفعل',

  // ==================== المفضلة ====================
  [ErrorCode.FAVORITE_NOT_FOUND]: 'المفضلة غير موجودة',
  [ErrorCode.FAVORITE_ALREADY_EXISTS]: 'المنتج موجود في المفضلة بالفعل',
  [ErrorCode.FAVORITE_ADD_FAILED]: 'فشل إضافة المنتج إلى المفضلة',
  [ErrorCode.FAVORITE_REMOVE_FAILED]: 'فشل إزالة المنتج من المفضلة',

  // ==================== الخدمات ====================
  [ErrorCode.SERVICE_NOT_FOUND]: 'الخدمة غير موجودة',
  [ErrorCode.SERVICE_REQUEST_NOT_FOUND]: 'طلب الخدمة غير موجود',
  [ErrorCode.SERVICE_INVALID_STATUS]: 'حالة الخدمة غير صالحة',
  [ErrorCode.SERVICE_CREATE_FAILED]: 'فشل إنشاء طلب الخدمة',
  [ErrorCode.SERVICE_UPDATE_FAILED]: 'فشل تحديث طلب الخدمة',
  [ErrorCode.SERVICE_OFFER_NOT_FOUND]: 'العرض غير موجود',
  [ErrorCode.SERVICE_OFFER_EXPIRED]: 'انتهت صلاحية العرض',

  // ==================== الدعم ====================
  [ErrorCode.TICKET_NOT_FOUND]: 'التذكرة غير موجودة',
  [ErrorCode.TICKET_INVALID_STATUS]: 'حالة التذكرة غير صالحة',
  [ErrorCode.TICKET_CREATE_FAILED]: 'فشل إنشاء التذكرة',
  [ErrorCode.TICKET_UPDATE_FAILED]: 'فشل تحديث التذكرة',
  [ErrorCode.TICKET_ALREADY_CLOSED]: 'التذكرة مغلقة بالفعل',
  [ErrorCode.TICKET_CANNOT_REOPEN]: 'لا يمكن إعادة فتح التذكرة',
  [ErrorCode.MESSAGE_ADD_FAILED]: 'فشل إضافة الرسالة',

  // ==================== التسويق ====================
  [ErrorCode.COUPON_NOT_FOUND]: 'كود الخصم غير موجود',
  [ErrorCode.COUPON_EXPIRED]: 'انتهت صلاحية كود الخصم',
  [ErrorCode.COUPON_INVALID]: 'كود الخصم غير صالح',
  [ErrorCode.COUPON_ALREADY_USED]: 'تم استخدام كود الخصم من قبل',
  [ErrorCode.COUPON_MAX_USES_REACHED]: 'تم الوصول للحد الأقصى لاستخدام كود الخصم',
  [ErrorCode.COUPON_MIN_AMOUNT_NOT_MET]: 'المبلغ أقل من الحد الأدنى لاستخدام كود الخصم',
  [ErrorCode.BANNER_NOT_FOUND]: 'الإعلان غير موجود',
  [ErrorCode.PRICE_RULE_NOT_FOUND]: 'قاعدة السعر غير موجودة',

  // ==================== الإشعارات ====================
  [ErrorCode.NOTIFICATION_NOT_FOUND]: 'الإشعار غير موجود',
  [ErrorCode.NOTIFICATION_SEND_FAILED]: 'فشل إرسال الإشعار',
  [ErrorCode.NOTIFICATION_TEMPLATE_NOT_FOUND]: 'قالب الإشعار غير موجود',
  [ErrorCode.NOTIFICATION_PREFERENCE_UPDATE_FAILED]: 'فشل تحديث إعدادات الإشعارات',

  // ==================== الترجمة ====================
  [ErrorCode.I18N_KEY_NOT_FOUND]: 'مفتاح الترجمة غير موجود',
  [ErrorCode.I18N_KEY_ALREADY_EXISTS]: 'مفتاح الترجمة موجود بالفعل',
  [ErrorCode.I18N_TRANSLATION_NOT_FOUND]: 'الترجمة غير موجودة',
  [ErrorCode.I18N_UPDATE_FAILED]: 'فشل تحديث الترجمة',
  [ErrorCode.I18N_INVALID_LANGUAGE]: 'اللغة غير مدعومة',

  // ==================== الرفع ====================
  [ErrorCode.UPLOAD_FAILED]: 'فشل رفع الملف',
  [ErrorCode.UPLOAD_FILE_TOO_LARGE]: 'حجم الملف كبير جداً',
  [ErrorCode.UPLOAD_INVALID_FILE_TYPE]: 'نوع الملف غير مدعوم',
  [ErrorCode.UPLOAD_NO_FILE]: 'لم يتم اختيار ملف',
  [ErrorCode.MEDIA_NOT_FOUND]: 'الملف غير موجود',
  [ErrorCode.MEDIA_DELETE_FAILED]: 'فشل حذف الملف',

  // ==================== أسعار الصرف ====================
  [ErrorCode.EXCHANGE_RATE_NOT_FOUND]: 'سعر الصرف غير موجود',
  [ErrorCode.EXCHANGE_RATE_UPDATE_FAILED]: 'فشل تحديث سعر الصرف',
  [ErrorCode.CURRENCY_NOT_SUPPORTED]: 'العملة غير مدعومة',
  [ErrorCode.CONVERSION_FAILED]: 'فشل تحويل العملة',
  [ErrorCode.EXCHANGE_RATE_FETCH_FAILED]: 'فشل في جلب أسعار الصرف. يرجى المحاولة مرة أخرى',

  // ==================== التحليلات ====================
  [ErrorCode.ANALYTICS_REPORT_NOT_FOUND]: 'التقرير غير موجود',
  [ErrorCode.ANALYTICS_REPORT_GENERATION_FAILED]: 'فشل إنشاء التقرير',
  [ErrorCode.ANALYTICS_SNAPSHOT_GENERATION_FAILED]: 'فشل إنشاء لقطة التحليلات',
  [ErrorCode.ANALYTICS_CACHE_ERROR]: 'خطأ في ذاكرة التخزين المؤقت للتحليلات',
  [ErrorCode.ANALYTICS_INVALID_DATE_RANGE]: 'نطاق التاريخ غير صالح',
  [ErrorCode.ANALYTICS_QUERY_FAILED]: 'فشل استعلام التحليلات',
  [ErrorCode.ANALYTICS_CALCULATION_FAILED]: 'فشل حساب التحليلات',
  [ErrorCode.ANALYTICS_USER_CALCULATION_FAILED]: 'فشل حساب تحليلات المستخدمين',
  [ErrorCode.ANALYTICS_PRODUCT_CALCULATION_FAILED]: 'فشل حساب تحليلات المنتجات',
  [ErrorCode.ANALYTICS_ORDER_CALCULATION_FAILED]: 'فشل حساب تحليلات الطلبات',
  [ErrorCode.ANALYTICS_SERVICE_CALCULATION_FAILED]: 'فشل حساب تحليلات الخدمات',
  [ErrorCode.ANALYTICS_SUPPORT_CALCULATION_FAILED]: 'فشل حساب تحليلات الدعم الفني',
  [ErrorCode.ANALYTICS_CRON_JOB_FAILED]: 'فشل تنفيذ مهمة التحليلات المجدولة',

  // ==================== السمات ====================
  [ErrorCode.ATTRIBUTE_NOT_FOUND]: 'السمة غير موجودة',
  [ErrorCode.ATTRIBUTE_ALREADY_EXISTS]: 'السمة موجودة بالفعل',
  [ErrorCode.ATTRIBUTE_IN_USE]: 'لا يمكن حذف السمة لاستخدامها في منتجات',
  [ErrorCode.ATTRIBUTE_INVALID_DATA]: 'بيانات السمة غير صالحة',
  [ErrorCode.ATTRIBUTE_CREATE_FAILED]: 'فشل إنشاء السمة',
  [ErrorCode.ATTRIBUTE_UPDATE_FAILED]: 'فشل تحديث السمة',
  [ErrorCode.ATTRIBUTE_DELETE_FAILED]: 'فشل حذف السمة',
  [ErrorCode.ATTRIBUTE_VALUE_NOT_FOUND]: 'قيمة السمة غير موجودة',
  [ErrorCode.ATTRIBUTE_VALUE_ALREADY_EXISTS]: 'قيمة السمة موجودة بالفعل',
  [ErrorCode.ATTRIBUTE_VALUE_IN_USE]: 'لا يمكن حذف قيمة السمة لاستخدامها في منتجات',
  [ErrorCode.ATTRIBUTE_VALUE_INVALID_HEX]: 'كود اللون غير صالح',
  [ErrorCode.ATTRIBUTE_VALUE_HEX_REQUIRED]: 'كود اللون مطلوب للسمات من نوع لون',
};

/**
 * الحصول على رسالة خطأ بناءً على الكود
 */
export function getErrorMessage(code: ErrorCode): string {
  return ErrorMessages[code] || ErrorMessages[ErrorCode.UNEXPECTED_ERROR];
}

/**
 * الحصول على HTTP Status Code المناسب
 */
export function getHttpStatusCode(code: ErrorCode): number {
  // Auth errors - 401 Unauthorized
  if (code.startsWith('AUTH_') && 
      (code.includes('INVALID') || code.includes('EXPIRED') || code.includes('UNAUTHORIZED'))) {
    return 401;
  }
  
  // Forbidden - 403
  if (code.includes('FORBIDDEN') || code.includes('PERMISSION') || code.includes('NOT_ALLOWED')) {
    return 403;
  }
  
  // Not Found - 404
  if (code.includes('NOT_FOUND')) {
    return 404;
  }
  
  // Conflict - 409
  if (code.includes('ALREADY_EXISTS') || code.includes('ALREADY_USED')) {
    return 409;
  }
  
  // Too Many Requests - 429
  if (code.includes('RATE_LIMIT')) {
    return 429;
  }
  
  // Internal Server Error - 500
  if (code.includes('INTERNAL') || code.includes('DATABASE') || code.includes('NETWORK')) {
    return 500;
  }
  
  // Service Unavailable - 503
  if (code.includes('UNAVAILABLE') || code.includes('TIMEOUT')) {
    return 503;
  }
  
  // Default - 400 Bad Request
  return 400;
}


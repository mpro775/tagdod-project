type Tpl = { title: string; body: string; link?: (p: Record<string, unknown>) => string | undefined };
export const TEMPLATES: Record<string, Tpl> = {
  // Orders
  ORDER_CONFIRMED: {
    title: 'تم تأكيد طلبك',
    body: 'رقم الطلب {{orderId}} بمبلغ {{amount}} {{currency}}',
    link: (p) => p.orderId ? `/orders/${p.orderId}` : undefined,
  },
  ORDER_CANCELLED: {
    title: 'تم إلغاء الطلب',
    body: 'تم إلغاء طلبك {{orderId}} وسيتم إرجاع المبلغ خلال 3-5 أيام عمل',
    link: (p) => p.orderId ? `/orders/${p.orderId}` : undefined,
  },
  ORDER_REFUNDED: {
    title: 'تم إرجاع المبلغ',
    body: 'تم إرجاع مبلغ {{amount}} {{currency}} لطلبك {{orderId}}',
    link: (p) => p.orderId ? `/orders/${p.orderId}` : undefined,
  },
  
  // Engineer Services
  SERVICE_REQUEST_OPENED: {
    title: 'تم استلام طلب خدمة',
    body: 'تم إنشاء طلب خدمة جديد: {{requestId}}',
    link: (p) => p.requestId ? `/services/${p.requestId}` : undefined,
  },
  NEW_ENGINEER_OFFER: {
    title: 'عرض جديد من مهندس',
    body: 'يوجد عرض جديد على طلبك {{requestId}} من المهندس {{engineerName}}',
    link: (p) => p.requestId ? `/services/${p.requestId}` : undefined,
  },
  OFFER_ACCEPTED: {
    title: 'تم قبول عرضك',
    body: 'تم قبول العرض على الطلب {{requestId}}',
    link: (p) => p.requestId ? `/services/${p.requestId}` : undefined,
  },
  SERVICE_STARTED: {
    title: 'بدأ تنفيذ الخدمة',
    body: 'جارٍ تنفيذ طلب الخدمة {{requestId}} من المهندس {{engineerName}}',
    link: (p) => p.requestId ? `/services/${p.requestId}` : undefined,
  },
  SERVICE_COMPLETED: {
    title: 'اكتملت الخدمة',
    body: 'اكتملت خدمة الطلب {{requestId}}. قيّم التجربة من فضلك.',
    link: (p) => p.requestId ? `/services/${p.requestId}` : undefined,
  },
  SERVICE_RATED: {
    title: 'تم تسجيل تقييمك',
    body: 'شكرًا لتقييمك طلب {{requestId}}',
    link: (p) => p.requestId ? `/services/${p.requestId}` : undefined,
  },
  SERVICE_REQUEST_CANCELLED: {
    title: 'إلغاء طلب الخدمة',
    body: 'تم إلغاء الطلب {{requestId}}',
    link: (p) => p.requestId ? `/services/${p.requestId}` : undefined,
  },
  
  // Products
  PRODUCT_BACK_IN_STOCK: {
    title: 'المنتج متوفر الآن',
    body: 'المنتج {{productName}} متوفر الآن في المخزون',
    link: (p) => p.productId ? `/products/${p.productId}` : undefined,
  },
  PRODUCT_PRICE_DROP: {
    title: 'انخفاض في السعر',
    body: 'انخفض سعر {{productName}} من {{oldPrice}} إلى {{newPrice}} {{currency}}',
    link: (p) => p.productId ? `/products/${p.productId}` : undefined,
  },
  
  // Promotions
  PROMOTION_STARTED: {
    title: 'عرض جديد بدأ',
    body: 'عرض {{promotionName}} بدأ الآن! استمتع بخصم {{discount}}%',
    link: (p) => p.promotionId ? `/promotions/${p.promotionId}` : undefined,
  },
  PROMOTION_ENDING: {
    title: 'العرض ينتهي قريباً',
    body: 'عرض {{promotionName}} ينتهي خلال {{timeLeft}} ساعات',
    link: (p) => p.promotionId ? `/promotions/${p.promotionId}` : undefined,
  },
  
  // Account & Security
  ACCOUNT_VERIFIED: {
    title: 'تم تأكيد الحساب',
    body: 'مرحباً {{userName}}! تم تأكيد حسابك بنجاح',
    link: () => '/profile',
  },
  PASSWORD_CHANGED: {
    title: 'تم تغيير كلمة المرور',
    body: 'تم تغيير كلمة مرور حسابك بنجاح',
    link: () => '/profile',
  },
  LOGIN_ATTEMPT: {
    title: 'محاولة تسجيل دخول جديدة',
    body: 'تم تسجيل محاولة دخول جديدة لحسابك من {{device}} في {{location}}',
    link: () => '/profile',
  },
  
  // Support
  TICKET_CREATED: {
    title: 'تم إنشاء تذكرة الدعم',
    body: 'تم إنشاء تذكرة الدعم رقم {{ticketId}} وسيتم الرد خلال 24 ساعة',
    link: (p) => p.ticketId ? `/support/${p.ticketId}` : undefined,
  },
  TICKET_UPDATED: {
    title: 'تم تحديث تذكرة الدعم',
    body: 'تم تحديث تذكرة الدعم رقم {{ticketId}}',
    link: (p) => p.ticketId ? `/support/${p.ticketId}` : undefined,
  },
  TICKET_RESOLVED: {
    title: 'تم حل تذكرة الدعم',
    body: 'تم حل تذكرة الدعم رقم {{ticketId}}',
    link: (p) => p.ticketId ? `/support/${p.ticketId}` : undefined,
  },
  
  // System
  SYSTEM_MAINTENANCE: {
    title: 'صيانة النظام',
    body: 'سيتم إجراء صيانة للنظام من {{startTime}} إلى {{endTime}}',
    link: () => '/status',
  },
  NEW_FEATURE: {
    title: 'ميزة جديدة متاحة',
    body: 'ميزة {{featureName}} متاحة الآن! جربها الآن',
    link: (p) => (typeof p.featureLink === 'string' && p.featureLink) ? p.featureLink : '/features',
  },
  
  // Marketing
  WELCOME_NEW_USER: {
    title: 'مرحباً بك في Tagadodo!',
    body: 'مرحباً {{userName}}! شكراً لانضمامك إلينا. استمتع بتجربة تسوق رائعة',
    link: () => '/',
  },
  BIRTHDAY_GREETING: {
    title: 'عيد ميلاد سعيد!',
    body: 'عيد ميلاد سعيد {{userName}}! إليك خصم خاص {{discount}}% على طلبك التالي',
    link: () => '/offers',
  },
  CART_ABANDONMENT: {
    title: 'لا تنسى سلة التسوق الخاصة بك',
    body: 'لديك {{itemCount}} عنصر في سلة التسوق. أكمل طلبك الآن!',
    link: () => '/cart',
  },
};

export function render(str: string, payload: Record<string, unknown>) {
  return str.replace(/{{\s*(\w+)\s*}}/g, (_m, k) => (payload?.[k] ?? '') as string);
}

type Tpl = { title: string; body: string; link?: (p: Record<string, unknown>) => string | undefined };
export const TEMPLATES: Record<string, Tpl> = {
  // Orders
  ORDER_CONFIRMED: {
    title: 'تم تأكيد طلبك',
    body: 'رقم الطلب {{orderId}} بمبلغ {{amount}} {{currency}}',
    link: (p) => p.orderId ? `/orders/${p.orderId}` : undefined,
  },
  ORDER_SHIPPED: {
    title: 'تم شحن طلبك',
    body: 'طلب {{orderId}} في الطريق إليك',
    link: (p) => p.orderId ? `/orders/${p.orderId}` : undefined,
  },
  ORDER_DELIVERED: {
    title: 'تم التسليم',
    body: 'تم تسليم طلب {{orderId}}. نتمنى لك يوماً سعيداً!',
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
    body: 'يوجد عرض جديد على طلبك {{requestId}}',
    link: (p) => p.requestId ? `/services/${p.requestId}` : undefined,
  },
  OFFER_ACCEPTED: {
    title: 'تم قبول عرضك',
    body: 'تم قبول العرض على الطلب {{requestId}}',
    link: (p) => p.requestId ? `/services/${p.requestId}` : undefined,
  },
  SERVICE_STARTED: {
    title: 'بدأ تنفيذ الخدمة',
    body: 'جارٍ تنفيذ طلب الخدمة {{requestId}}',
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
};

export function render(str: string, payload: Record<string, unknown>) {
  return str.replace(/{{\s*(\w+)\s*}}/g, (_m, k) => (payload?.[k] ?? '') as string);
}

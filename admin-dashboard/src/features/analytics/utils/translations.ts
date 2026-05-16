/**
 * Analytics Translations — ترجمات حقول التحليلات
 */

export const translatePaymentMethod = (method: string): string => {
  const map: Record<string, string> = {
    BANK_TRANSFER: 'تحويل بنكي',
    CASH: 'نقدًا',
    CARD: 'بطاقة',
    CREDIT_CARD: 'بطاقة ائتمان',
    DEBIT_CARD: 'بطاقة خصم',
    WALLET: 'محفظة إلكترونية',
    OTHER: 'أخرى',
  };
  return map[method?.toUpperCase()] ?? method ?? 'غير معروف';
};

export const translateUserRole = (role: string): string => {
  const map: Record<string, string> = {
    admin: 'مدير',
    manager: 'مشرف',
    user: 'مستخدم',
    customer: 'عميل',
    engineer: 'فني',
    support: 'دعم فني',
    guest: 'زائر',
  };
  return map[role?.toLowerCase()] ?? role ?? 'غير معروف';
};

export const translateStockMovementType = (type: string): string => {
  const map: Record<string, string> = {
    in: 'إدخال',
    out: 'إخراج',
    IN: 'إدخال',
    OUT: 'إخراج',
  };
  return map[type] ?? type ?? 'غير معروف';
};

export const translateCampaignMetric = (name: string): string => {
  const map: Record<string, string> = {
    reach: 'الوصول',
    impressions: 'مرات الظهور',
    clicks: 'النقرات',
    conversions: 'التحويلات',
    revenue: 'الإيراد',
    cost: 'التكلفة',
    roi: 'العائد على الاستثمار',
  };
  return map[name] ?? name;
};

export const translateSystemStatus = (status: string): string => {
  const map: Record<string, string> = {
    healthy: 'صحي',
    warning: 'تحذير',
    critical: 'حرج',
    maintenance: 'صيانة',
    down: 'متوقف',
  };
  return map[status?.toLowerCase()] ?? status ?? 'غير معروف';
};

export const translateSupportPriority = (priority: string): string => {
  const map: Record<string, string> = {
    low: 'منخفض',
    medium: 'متوسط',
    high: 'عالي',
    critical: 'حرج',
  };
  return map[priority?.toLowerCase()] ?? priority ?? 'غير معروف';
};

export const translateReportCategory = (category: string): string => {
  const map: Record<string, string> = {
    sales: 'المبيعات',
    products: 'المنتجات',
    customers: 'العملاء',
    inventory: 'المخزون',
    financial: 'المالية',
    marketing: 'التسويق',
    services: 'الخدمات',
    support: 'الدعم الفني',
    custom: 'مخصص',
  };
  return map[category?.toLowerCase()] ?? category ?? 'غير معروف';
};

export const translateReportStatus = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'معلق',
    processing: 'جاري المعالجة',
    completed: 'مكتمل',
    failed: 'فاشل',
    archived: 'مؤرشف',
  };
  return map[status?.toLowerCase()] ?? status ?? 'غير معروف';
};

export const translateReportPriority = (priority: string): string => {
  const map: Record<string, string> = {
    low: 'منخفض',
    medium: 'متوسط',
    high: 'عالي',
    critical: 'حرج',
  };
  return map[priority?.toLowerCase()] ?? priority ?? 'غير معروف';
};

export const translateScheduleFrequency = (frequency: string): string => {
  const map: Record<string, string> = {
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري',
    quarterly: 'ربع سنوي',
  };
  return map[frequency?.toLowerCase()] ?? frequency ?? 'غير معروف';
};

export const translateScheduleStatus = (status: string): string => {
  const map: Record<string, string> = {
    active: 'نشط',
    paused: 'متوقف',
    inactive: 'غير نشط',
  };
  return map[status?.toLowerCase()] ?? status ?? 'غير معروف';
};

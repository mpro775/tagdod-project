# نظام التدقيق (Audit System)

نظام شامل لمراقبة وتتبع جميع العمليات في النظام، يوفر رؤية شاملة لجميع الأنشطة والعمليات التي تحدث في المنصة.

## المميزات الرئيسية

### 🔍 مراقبة شاملة
- تتبع جميع العمليات في النظام
- تسجيل تفاصيل المستخدمين والعمليات
- مراقبة التغييرات في البيانات

### 🛡️ أمان متقدم
- تصنيف العمليات حسب الحساسية
- تتبع محاولات الوصول غير المصرح بها
- مراقبة التغييرات في الصلاحيات والأدوار

### 📊 تحليلات وإحصائيات
- إحصائيات مفصلة للعمليات
- تحليل الأنماط والاتجاهات
- تقارير قابلة للتصدير

### 🔧 أدوات إدارية
- فلاتر متقدمة للبحث
- تصدير البيانات
- واجهة سهلة الاستخدام

## البنية التقنية

### الملفات الرئيسية

```
audit/
├── api/
│   └── auditApi.ts          # API calls للخادم
├── components/
│   ├── AuditFilters.tsx     # مكون الفلاتر
│   ├── AuditStatsCards.tsx   # بطاقات الإحصائيات
│   ├── AuditLogsTable.tsx   # جدول السجلات
│   ├── AuditLogDetails.tsx  # تفاصيل السجل
│   └── index.ts
├── hooks/
│   └── useAudit.ts          # React hooks
├── pages/
│   ├── AuditMainPage.tsx    # الصفحة الرئيسية
│   ├── AuditLogsPage.tsx    # صفحة السجلات
│   ├── AuditAnalyticsPage.tsx # صفحة التحليلات
│   └── index.ts
├── types/
│   └── audit.types.ts       # تعريفات الأنواع
└── index.ts
```

### أنواع العمليات المدعومة

#### إدارة المستخدمين
- `USER_CREATED` - إنشاء مستخدم
- `USER_UPDATED` - تحديث مستخدم
- `USER_DELETED` - حذف مستخدم
- `USER_SUSPENDED` - تعليق مستخدم
- `USER_ACTIVATED` - تفعيل مستخدم

#### المصادقة والتفويض
- `LOGIN_SUCCESS` - تسجيل دخول ناجح
- `LOGIN_FAILED` - فشل تسجيل الدخول
- `LOGOUT` - تسجيل خروج
- `PASSWORD_CHANGED` - تغيير كلمة المرور
- `PASSWORD_RESET` - إعادة تعيين كلمة المرور

#### الصلاحيات والأدوار
- `PERMISSION_GRANTED` - منح صلاحية
- `PERMISSION_REVOKED` - سحب صلاحية
- `ROLE_ASSIGNED` - تعيين دور
- `ROLE_REMOVED` - إزالة دور
- `CAPABILITY_APPROVED` - موافقة على قدرة
- `CAPABILITY_REJECTED` - رفض قدرة

#### الإجراءات الإدارية
- `ADMIN_ACTION` - إجراء إداري

#### أحداث النظام
- `SYSTEM_BACKUP` - نسخ احتياطي للنظام
- `SYSTEM_MAINTENANCE` - صيانة النظام
- `DATA_MIGRATION` - ترحيل البيانات

### أنواع الموارد

- `USER` - مستخدم
- `PERMISSION` - صلاحية
- `ROLE` - دور
- `CAPABILITY` - قدرة
- `SYSTEM` - نظام
- `AUTH` - مصادقة
- `ADMIN` - إدارة

## الاستخدام

### الصفحة الرئيسية
```tsx
import { AuditMainPage } from '@/features/audit';

function App() {
  return <AuditMainPage />;
}
```

### صفحة السجلات
```tsx
import { AuditLogsPage } from '@/features/audit';

function LogsPage() {
  return <AuditLogsPage />;
}
```

### صفحة التحليلات
```tsx
import { AuditAnalyticsPage } from '@/features/audit';

function AnalyticsPage() {
  return <AuditAnalyticsPage />;
}
```

### استخدام Hooks

```tsx
import { useAuditLogs, useAuditStats } from '@/features/audit';

function MyComponent() {
  const { logs, isLoading } = useAuditLogs();
  const { stats } = useAuditStats();
  
  return (
    <div>
      {isLoading ? 'جاري التحميل...' : logs.map(log => (
        <div key={log._id}>{log.action}</div>
      ))}
    </div>
  );
}
```

## الفلاتر المتاحة

### فلاتر أساسية
- معرف المستخدم
- المستخدم الذي قام بالعملية
- نوع العملية
- نوع المورد
- معرف المورد

### فلاتر زمنية
- تاريخ البداية
- تاريخ النهاية
- فلاتر سريعة (اليوم، الأسبوع، الشهر)

### فلاتر متقدمة
- العمليات الحساسة فقط
- مستوى الخطورة
- نوع الجلسة

## التصدير والتصدير

### تصدير البيانات
```tsx
import { useAuditExport } from '@/features/audit';

function ExportButton() {
  const { exportLogs, isExporting } = useAuditExport();
  
  const handleExport = () => {
    exportLogs({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      isSensitive: true
    });
  };
  
  return (
    <Button onClick={handleExport} disabled={isExporting}>
      {isExporting ? 'جاري التصدير...' : 'تصدير البيانات'}
    </Button>
  );
}
```

## الأمان والخصوصية

### تصنيف العمليات
- **منخفض**: عمليات عادية مثل تسجيل الدخول
- **متوسط**: تغييرات في البيانات
- **عالي**: تغييرات في الصلاحيات والأدوار
- **حرج**: عمليات إدارية حساسة

### العمليات الحساسة
يتم تمييز العمليات الحساسة التي تتطلب مراجعة إضافية:
- تغييرات في الصلاحيات
- تعديلات على الأدوار
- العمليات الإدارية
- الوصول إلى البيانات الحساسة

## التخصيص والتطوير

### إضافة أنواع عمليات جديدة
```tsx
// في audit.types.ts
export enum AuditAction {
  // ... العمليات الموجودة
  CUSTOM_ACTION = 'custom.action',
}

// إضافة التسمية
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  // ... التسميات الموجودة
  [AuditAction.CUSTOM_ACTION]: 'عملية مخصصة',
};
```

### إضافة فلاتر جديدة
```tsx
// في AuditFilters.tsx
const handleCustomFilter = (value: string) => {
  onFiltersChange({ customField: value });
};
```

## الأداء والتحسين

### التخزين المؤقت
- استخدام React Query للتخزين المؤقت
- تحديث البيانات كل 30 ثانية
- تخزين مؤقت للفلاتر والإعدادات

### التحسينات
- تحميل تدريجي للبيانات
- فهرسة قاعدة البيانات
- ضغط البيانات المرسلة

## الدعم والمساعدة

للحصول على المساعدة أو الإبلاغ عن مشاكل:
1. راجع هذا الدليل أولاً
2. تحقق من console للأخطاء
3. تأكد من صحة البيانات المرسلة
4. تحقق من صلاحيات المستخدم

## التحديثات المستقبلية

- [ ] إشعارات فورية للعمليات الحساسة
- [ ] تحليلات متقدمة بالذكاء الاصطناعي
- [ ] تقارير مخصصة
- [ ] تكامل مع أنظمة مراقبة خارجية
- [ ] دعم للبيانات الضخمة
- [ ] واجهة API للوصول الخارجي

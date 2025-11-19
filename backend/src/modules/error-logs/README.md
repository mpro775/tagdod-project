# Error & Logs Management Module

## نظرة عامة

نظام متقدم لإدارة الأخطاء والسجلات مع التتبع، التحليل، والتنبيهات.

## المميزات

### 1. تسجيل الأخطاء
- **Deduplication**: دمج الأخطاء المتشابهة تلقائياً
- **Error Levels**: Error, Warning, Fatal, Debug
- **Categories**: Database, API, Authentication, Validation, Business Logic, External Service, System, Frontend
- **Stack Traces**: حفظ Stack traces كاملة
- **Metadata**: معلومات إضافية قابلة للتخصيص

### 2. التصنيف والتنظيم
- تصنيف الأخطاء حسب المستوى
- تجميع حسب الفئة
- ربط بنقاط API endpoints
- ربط بالمستخدمين
- Hash للأخطاء المتشابهة

### 3. إحصائيات متقدمة
- إجمالي الأخطاء
- أخطاء آخر 24 ساعة و 7 أيام
- معدل الأخطاء
- أكثر الأخطاء تكراراً
- الأخطاء حسب نقطة النهاية
- اتجاهات الأخطاء

### 4. التصدير
- JSON
- CSV
- TXT
- تصفية حسب الفترة والمستوى

### 5. سجلات النظام
- سجلات عامة للنظام
- تصنيف حسب السياق (Module)
- مستويات متعددة: Info, Debug, Warn, Error

### 6. Deduplication الذكي
- دمج الأخطاء المتشابهة خلال ساعة
- حساب عدد التكرارات
- تتبع أول وآخر ظهور

### 7. الحل والإدارة
- وضع علامة كمحلول
- إضافة ملاحظات
- تتبع من قام بالحل
- حذف الأخطاء

## API Endpoints

### إنشاء خطأ
```
POST /error-logs
```
تسجيل خطأ جديد (يدمج تلقائياً مع الأخطاء المشابهة).

### قائمة الأخطاء
```
GET /error-logs?level=error&category=api&search=timeout&page=1&limit=20
```
البحث والتصفية في الأخطاء.

### الإحصائيات
```
GET /error-logs/statistics
```
إحصائيات شاملة.

### الاتجاهات
```
GET /error-logs/trends?days=7
```
تحليل اتجاه الأخطاء.

### تفاصيل خطأ
```
GET /error-logs/:id
```
معلومات مفصلة عن خطأ معين.

### حل خطأ
```
POST /error-logs/:id/resolve
{
  "notes": "تم إصلاح المشكلة في الإصدار 2.1"
}
```

### حذف خطأ
```
DELETE /error-logs/:id
```

### التصدير
```
GET /error-logs/export?format=csv&startDate=2024-01-01&endDate=2024-01-31&level=error
```

### سجلات النظام
```
GET /error-logs/system-logs?level=info&context=ProductsService&page=1
```

### تنظيف السجلات القديمة
```
POST /error-logs/cleanup
{
  "days": 30
}
```

## نماذج البيانات

### ErrorLog
```typescript
{
  level: string;              // error, warn, fatal, debug
  category: string;           // database, api, authentication, validation, business_logic, external_service, system, frontend, unknown
  message: string;            // رسالة الخطأ
  stack: string;              // Stack trace
  metadata: object;           // معلومات إضافية
  userId: string;             // المستخدم المرتبط
  endpoint: string;           // نقطة API
  method: string;             // GET, POST, etc.
  statusCode: number;         // HTTP status code
  occurrences: number;        // عدد التكرارات
  firstOccurrence: Date;      // أول ظهور
  lastOccurrence: Date;       // آخر ظهور
  resolved: boolean;          // هل تم الحل؟
  resolvedAt: Date;           // وقت الحل
  resolvedBy: string;         // من قام بالحل
  notes: string;              // ملاحظات الحل
  hash: string;               // Hash للتكرار
}
```

### SystemLog
```typescript
{
  level: string;              // info, debug, warn, error
  message: string;            // الرسالة
  context: string;            // اسم الوحدة/الخدمة
  data: object;               // بيانات إضافية
  timestamp: Date;            // الوقت
  userId: string;             // المستخدم (اختياري)
  requestId: string;          // Request ID للتتبع
  correlationId: string;      // Correlation ID
}
```

## الاستخدام

### في الكود

```typescript
// تسجيل خطأ
try {
  // ... some code
} catch (error) {
  await errorLogsService.createErrorLog({
    level: ErrorLevel.ERROR,
    category: ErrorCategory.DATABASE,
    message: error.message,
    stack: error.stack,
    endpoint: req.path,
    method: req.method,
    userId: req.user?.userId,
    metadata: {
      query: req.query,
      body: req.body,
    },
  });
  
  throw error;
}

// تسجيل سجل نظام
await errorLogsService.createSystemLog(
  'info',
  'User logged in successfully',
  'AuthService',
  { userId: user.id, ip: req.ip }
);

// تسجيل خطأ من الفرونت إند
await errorLogsService.createErrorLog({
  level: ErrorLevel.ERROR,
  category: ErrorCategory.FRONTEND,
  message: error.message,
  stack: error.stack,
  userId: user?.id,
  metadata: {
    url: window.location.href,
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    browser: navigator.userAgent,
  },
});
```

### التكامل مع Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private errorLogsService: ErrorLogsService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    
    // Log error
    this.errorLogsService.createErrorLog({
      level: ErrorLevel.ERROR,
      category: this.determineCategory(exception),
      message: exception.message,
      stack: exception.stack,
      endpoint: request.url,
      method: request.method,
      statusCode: exception.status || 500,
      userId: request.user?.userId,
    });

    // Send response
    response.status(exception.status || 500).json({
      success: false,
      message: exception.message,
    });
  }
}
```

## TTL والتنظيف التلقائي

- **Error Logs**: تُحذف تلقائياً بعد 180 يوم (6 أشهر)
- **System Logs**: تُحذف تلقائياً بعد 90 يوم (3 أشهر)
- **Manual Cleanup**: يمكن حذف السجلات القديمة يدوياً عبر API

## الفهرسة والأداء

الفهارس المتوفرة:
- `level, category` (Compound)
- `createdAt` (Descending)
- `resolved, createdAt` (Compound)
- `hash` (للبحث السريع عن الأخطاء المشابهة)
- `message, stack` (Text index للبحث النصي)

## الصلاحيات

جميع endpoints تتطلب:
- JWT Authentication
- Admin Role

## الإشعارات (المستقبل)

- [ ] إرسال بريد إلكتروني عند الأخطاء الحرجة
- [ ] تكامل مع Slack/Discord
- [ ] تنبيهات SMS للأخطاء الفادحة
- [ ] Webhooks للتكامل الخارجي

## التقارير (المستقبل)

- [ ] تقارير أسبوعية تلقائية
- [ ] تقارير شهرية مفصلة
- [ ] مقارنة الأداء عبر الفترات
- [ ] توصيات تلقائية للإصلاح


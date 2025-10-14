# 🚀 مرجع سريع - نظام التحليلات والتقارير

## 📋 جدول المحتويات السريع

- [الـ Endpoints الأساسية](#endpoints-الأساسية)
- [الفلاتر المتاحة](#الفلاتر-المتاحة)
- [أمثلة سريعة](#أمثلة-سريعة)
- [الرموز الشائعة](#الرموز-الشائعة)

---

## Endpoints الأساسية

### التحليلات الأساسية
```
GET  /api/analytics/dashboard              # لوحة التحكم الرئيسية
GET  /api/analytics/overview               # النظرة العامة
GET  /api/analytics/kpis                   # المؤشرات الرئيسية
GET  /api/analytics/performance            # مقاييس الأداء
POST /api/analytics/refresh                # تحديث البيانات
```

### التقارير المتقدمة
```
POST   /api/analytics/advanced/reports/generate        # إنشاء تقرير
GET    /api/analytics/advanced/reports                 # قائمة التقارير
GET    /api/analytics/advanced/reports/:id             # تقرير محدد
POST   /api/analytics/advanced/reports/:id/export     # تصدير تقرير
POST   /api/analytics/advanced/reports/:id/archive    # أرشفة تقرير
DELETE /api/analytics/advanced/reports/:id             # حذف تقرير
```

### التحليلات التفصيلية
```
GET /api/analytics/advanced/sales                # تحليلات المبيعات
GET /api/analytics/advanced/products/performance # أداء المنتجات
GET /api/analytics/advanced/customers            # تحليلات العملاء
GET /api/analytics/advanced/inventory            # تقرير المخزون
GET /api/analytics/advanced/financial            # التقرير المالي
GET /api/analytics/advanced/cart-analytics       # تحليلات السلة
GET /api/analytics/advanced/marketing            # تحليلات التسويق
```

### المقاييس والمقارنات
```
GET /api/analytics/advanced/realtime         # المقاييس الفورية
GET /api/analytics/advanced/quick-stats      # إحصائيات سريعة
GET /api/analytics/advanced/comparison       # مقارنة الفترات
GET /api/analytics/advanced/trends/:metric   # اتجاهات المقياس
```

### التصدير
```
GET /api/analytics/advanced/export/sales      # تصدير المبيعات
GET /api/analytics/advanced/export/products   # تصدير المنتجات
GET /api/analytics/advanced/export/customers  # تصدير العملاء
```

---

## الفلاتر المتاحة

### فلاتر التواريخ
```
?startDate=2024-01-01
?endDate=2024-01-31
?period=daily|weekly|monthly|yearly
```

### فلاتر التصنيف
```
?categories=solar_panels,inverters
?brands=brand1,brand2
?regions=Riyadh,Jeddah
```

### فلاتر الطلبات
```
?orderStatus=COMPLETED,DELIVERED
?paymentMethods=COD,ONLINE
```

### فلاتر العرض
```
?page=1
?limit=20
?sortBy=revenue|sales|views|rating
?sortOrder=asc|desc
?groupBy=daily|weekly|monthly
```

### فلاتر المقارنة
```
?compareWithPrevious=true
?includeRecommendations=true
?generateCharts=true
```

---

## أمثلة سريعة

### 1. Dashboard اليوم
```bash
curl GET "http://localhost:3000/api/analytics/dashboard?period=daily" \
  -H "Authorization: Bearer {token}"
```

### 2. مبيعات الشهر الحالي
```bash
curl GET "http://localhost:3000/api/analytics/advanced/sales?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer {token}"
```

### 3. أفضل 10 منتجات
```bash
curl GET "http://localhost:3000/api/analytics/advanced/products/performance?limit=10&sortBy=revenue&sortOrder=desc" \
  -H "Authorization: Bearer {token}"
```

### 4. مقاييس فورية
```bash
curl GET "http://localhost:3000/api/analytics/advanced/realtime" \
  -H "Authorization: Bearer {token}"
```

### 5. إنشاء تقرير مبيعات
```bash
curl POST "http://localhost:3000/api/analytics/advanced/reports/generate" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "تقرير المبيعات",
    "titleEn": "Sales Report",
    "category": "sales",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "compareWithPrevious": true
  }'
```

### 6. مقارنة شهرين
```bash
curl GET "http://localhost:3000/api/analytics/advanced/comparison?currentStart=2024-01-01&currentEnd=2024-01-31&previousStart=2023-12-01&previousEnd=2023-12-31" \
  -H "Authorization: Bearer {token}"
```

### 7. تصدير Excel
```bash
curl GET "http://localhost:3000/api/analytics/advanced/export/sales?format=excel&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer {token}"
```

### 8. سلل مهجورة
```bash
curl GET "http://localhost:3000/api/analytics/advanced/cart-analytics?status=abandoned&includeRecovery=true" \
  -H "Authorization: Bearer {token}"
```

---

## الرموز الشائعة

### أنواع التقارير (ReportCategory)
```typescript
sales       // تقارير المبيعات
products    // تقارير المنتجات
customers   // تقارير العملاء
financial   // تقارير مالية
marketing   // تقارير تسويقية
operations  // تقارير تشغيلية
inventory   // تقارير المخزون
custom      // تقارير مخصصة
```

### أولويات التقارير (ReportPriority)
```typescript
low       // منخفضة
medium    // متوسطة
high      // عالية
critical  // حرجة
```

### الفترات الزمنية (PeriodType)
```typescript
daily      // يومي
weekly     // أسبوعي
monthly    // شهري
quarterly  // ربع سنوي
yearly     // سنوي
```

### صيغ التصدير
```typescript
pdf    // PDF
excel  // Excel
csv    // CSV
json   // JSON
```

### حالات الطلبات
```typescript
PENDING         // قيد الانتظار
PROCESSING      // قيد المعالجة
SHIPPED         // تم الشحن
DELIVERED       // تم التسليم
COMPLETED       // مكتمل
CANCELLED       // ملغي
```

### حالات السلة
```typescript
active      // نشطة
abandoned   // مهجورة
converted   // تم التحويل
expired     // منتهية
```

---

## Response Formats

### نجاح
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }  // للـ pagination فقط
}
```

### خطأ
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "رسالة الخطأ",
    "details": { ... }
  }
}
```

---

## أكواد الأخطاء الشائعة

```
400 - طلب غير صحيح (فلاتر خاطئة، تواريخ غير صحيحة)
401 - غير مصرح (token غير صحيح أو منتهي)
403 - ممنوع (ليس لديك صلاحيات)
404 - غير موجود (التقرير غير موجود)
429 - تجاوز الحد (rate limit)
500 - خطأ في السيرفر
```

---

## نصائح سريعة

### ⚡ للأداء الأفضل
1. استخدم `period` بدلاً من تواريخ مخصصة عندما يكون ممكناً
2. حدد `limit` لتقليل حجم البيانات
3. استخدم الفلاتر لتضييق النتائج
4. استفد من الـ cache (البيانات تُخزن مؤقتاً)

### 🔒 للأمان
1. احفظ الـ JWT token بشكل آمن
2. لا تشارك الـ tokens
3. حدّث الـ token قبل انتهاء صلاحيته

### 📊 للتقارير
1. استخدم `compareWithPrevious=true` للمقارنات
2. فعّل `includeRecommendations=true` للتوصيات
3. استخدم `generateCharts=true` للرسوم البيانية

### 💾 للتصدير
1. استخدم `excel` للبيانات المفصلة
2. استخدم `pdf` للتقارير الرسمية
3. استخدم `csv` للتحليل في Excel
4. استخدم `json` للمعالجة البرمجية

---

## KPIs الرئيسية

```
revenueGrowth           معدل نمو الإيرادات
customerSatisfaction    رضا العملاء
orderConversion         معدل التحويل
serviceEfficiency       كفاءة الخدمة
supportResolution       حل تذاكر الدعم
systemUptime            وقت تشغيل النظام
```

---

## وحدات القياس

```
المبالغ:     YER (ريال يمني)
النسب:       % (نسبة مئوية)
الوقت:       ms (ميلي ثانية) | hours (ساعات) | days (أيام)
الأحجام:     bytes | KB | MB | GB
```

---

## الحدود

```
Rate Limits:
- عام:           100 طلب/دقيقة
- تصدير:         10 طلبات/دقيقة
- توليد تقارير:   5 طلبات/دقيقة

Pagination:
- Max limit:     100 نتيجة/صفحة
- Default limit: 20 نتيجة/صفحة

Date Range:
- Max range:     365 يوم
```

---

## روابط مفيدة

- **التوثيق الكامل**: `PROFESSIONAL_ANALYTICS_SYSTEM.md`
- **أمثلة API**: `ANALYTICS_API_EXAMPLES.md`
- **Postman Collection**: `/postman/analytics.json`

---

## تواصل معنا

📧 Email: support@example.com  
📚 Docs: https://docs.example.com  
🐛 Issues: https://github.com/example/issues

---

**آخر تحديث**: 2024-01-15  
**النسخة**: 1.0.0  
**الحالة**: ✅ Production Ready


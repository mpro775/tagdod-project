# Analytics Module (نظام التحليلات والتقارير الاحترافية)

نظام تحليلات وتقارير احترافي شامل لتطبيق خدمات الطاقة الشمسية مع لوحات تحكم تفاعلية وتقارير مفصلة.

## الميزات

- ✅ **لوحة تحكم شاملة**: مؤشرات KPI ومخططات في الوقت الفعلي
- ✅ **تحليلات متعددة الأبعاد**: للمستخدمين، المنتجات، الطلبات، الخدمات، والدعم
- ✅ **تقارير احترافية**: PDF، Excel، CSV، JSON مع تصميم مخصص
- ✅ **جدولة تلقائية**: تقارير يومية، أسبوعية، وشهرية
- ✅ **مقارنات زمنية**: تحليل الاتجاهات ومقارنة الفترات
- ✅ **مؤشرات الأداء**: KPI شامل مع حسابات متقدمة
- ✅ **تحليلات جغرافية**: خرائط وتوزيع حسب المناطق
- ✅ **مراقبة الأداء**: استجابة النظام وحالة الخدمات
- ✅ **تصدير متقدم**: بصيغ متعددة للتحليل الخارجي
- ✅ **تنبيهات ذكية**: إشعارات للمؤشرات المهمة

## البيانات المحللة

### 📊 مؤشرات KPI الرئيسية
- **معدل التحويل**: نسبة الزوار الذين يصبحون عملاء
- **قيمة العميل مدى الحياة**: إجمالي الإيرادات من العميل
- **معدل الاحتفاظ**: نسبة العملاء المحتفظ بهم
- **تكلفة اكتساب العميل**: التكلفة لجذب عميل جديد
- **معدل الارتداد**: نسبة العملاء الذين يتوقفون
- **درجة رضا العملاء**: NPS ومعدلات الرضا

### 📈 التحليلات المتاحة

#### تحليلات المستخدمين
- إحصائيات التسجيل والنشاط
- توزيع الأدوار (عملاء، مهندسين، مشرفين)
- معدلات الاحتفاظ والارتداد
- التحليل الجغرافي للمستخدمين

#### تحليلات المنتجات
- أداء المبيعات لكل منتج
- المنتجات الأكثر شعبية
- معدلات التقييم والمراجعات
- تحليل المخزون ونقاط إعادة الطلب

#### تحليلات الطلبات والمبيعات
- إحصائيات الطلبات (مكتملة، معلقة، ملغية)
- متوسط قيمة الطلب
- تحليل الإيرادات حسب الفترة الزمنية
- أداء طرق الدفع المختلفة

#### تحليلات الخدمات
- إحصائيات طلبات الخدمات
- أداء المهندسين (وقت الاستجابة، معدل الإنجاز)
- تقييمات الخدمات وجودة العمل
- تحليل أنواع الخدمات المطلوبة

#### تحليلات الدعم الفني
- إحصائيات التذاكر (مفتوحة، مغلقة، قيد المراجعة)
- أوقات حل المشاكل
- رضا العملاء عن الدعم
- أداء ممثلي الدعم

#### تحليلات الأداء التقني
- أوقات استجابة API
- معدلات الأخطاء والتوفر
- استخدام الموارد (CPU، ذاكرة، قاعدة بيانات)
- نقاط النهاية الأبطأ

## API Endpoints

### لوحة التحكم الرئيسية

#### الحصول على بيانات لوحة التحكم
```http
GET /analytics/dashboard?period=monthly&startDate=2024-01-01&endDate=2024-12-31&compareWithPrevious=true
Authorization: Bearer {admin-token}
```

**Parameters:**
- `period`: `daily`, `weekly`, `monthly`, `quarterly`, `yearly`
- `startDate`: تاريخ البداية (ISO format)
- `endDate`: تاريخ النهاية (ISO format)
- `compareWithPrevious`: مقارنة مع الفترة السابقة

**Response:**
```json
{
  "overview": {
    "totalUsers": 1250,
    "totalRevenue": 450000,
    "totalOrders": 890,
    "activeServices": 45,
    "openSupportTickets": 12,
    "systemHealth": 98.5
  },
  "revenueCharts": {
    "daily": [...],
    "monthly": [...],
    "byCategory": [...]
  },
  "userCharts": {...},
  "productCharts": {...},
  "serviceCharts": {...},
  "supportCharts": {...},
  "kpis": {
    "revenueGrowth": 15.5,
    "customerSatisfaction": 4.6,
    "orderConversion": 12.5,
    "serviceEfficiency": 94.2,
    "supportResolution": 85.3,
    "systemUptime": 99.9
  }
}
```

### التحليلات التفصيلية

#### تحليلات المستخدمين
```http
GET /analytics/users?period=monthly&startDate=2024-01-01&endDate=2024-12-31
```

#### تحليلات المنتجات
```http
GET /analytics/products?period=monthly&startDate=2024-01-01&endDate=2024-12-31
```

#### تحليلات الإيرادات
```http
GET /analytics/revenue?period=monthly&startDate=2024-01-01&endDate=2024-12-31
```

#### تحليلات الخدمات
```http
GET /analytics/services?period=monthly&startDate=2024-01-01&endDate=2024-12-31
```

#### تحليلات الدعم
```http
GET /analytics/support?period=monthly&startDate=2024-01-01&endDate=2024-12-31
```

#### مؤشرات الأداء
```http
GET /analytics/kpis?period=monthly
```

### إنشاء التقارير

#### تقرير مخصص
```http
POST /analytics/reports/generate
Content-Type: application/json
Authorization: Bearer {admin-token}

{
  "reportType": "monthly_report",
  "formats": ["pdf", "excel"],
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "includeCharts": true,
  "includeRawData": false
}
```

**Response:**
```json
{
  "id": "report_1726185600000",
  "type": "monthly_report",
  "period": "يناير 2024",
  "generatedAt": "2024-01-31T23:59:59Z",
  "data": {...},
  "insights": [
    "الإيرادات زادت بنسبة 15% مقارنة بالشهر الماضي",
    "معدل رضا العملاء بلغ 4.6 من 5"
  ],
  "fileUrls": [
    "https://cdn.example.com/reports/monthly-report-2024-01.pdf",
    "https://cdn.example.com/reports/monthly-report-2024-01.xlsx"
  ]
}
```

#### جدولة التقارير
```http
POST /analytics/reports/schedule
Content-Type: application/json
Authorization: Bearer {admin-token}

{
  "name": "تقرير المبيعات الأسبوعي",
  "description": "تقرير شامل للمبيعات والإيرادات الأسبوعية",
  "reportType": "weekly_report",
  "frequency": "weekly",
  "formats": ["pdf"],
  "recipients": ["manager@example.com", "ceo@example.com"],
  "filters": {
    "includeCharts": true,
    "customMetrics": ["revenue", "orders", "conversion"]
  }
}
```

### مقارنة الفترات

```http
GET /analytics/comparison?currentStart=2024-02-01&currentEnd=2024-02-28&previousStart=2024-01-01&previousEnd=2024-01-31
```

**Response:**
```json
{
  "data": {
    "overview": {
      "totalUsers": {
        "current": 1350,
        "previous": 1200,
        "change": 12.5
      },
      "totalRevenue": {
        "current": 480000,
        "previous": 420000,
        "change": 14.3
      }
    },
    "currentPeriod": "2024-02-01 to 2024-02-28",
    "previousPeriod": "2024-01-01 to 2024-01-31"
  }
}
```

### الاتجاهات والتوقعات

#### اتجاهات المؤشرات
```http
GET /analytics/trends/revenue?period=daily&days=30
```

**Response:**
```json
{
  "metric": "revenue",
  "period": "daily",
  "data": [
    {
      "date": "2024-01-01",
      "value": 12500,
      "change": 0
    },
    {
      "date": "2024-01-02",
      "value": 13200,
      "change": 5.6
    }
  ]
}
```

### التصدير

#### تصدير البيانات
```http
GET /analytics/export/csv?type=users&period=monthly
```

**Response:**
```json
{
  "message": "Export generated successfully",
  "fileUrl": "https://cdn.example.com/exports/users_2024-01.csv",
  "format": "csv",
  "type": "users",
  "generatedAt": "2024-01-31T10:30:00Z"
}
```

### مراقبة الأداء

#### مؤشرات الأداء التقني
```http
GET /analytics/performance
```

**Response:**
```json
{
  "apiResponseTime": 245,
  "errorRate": 0.02,
  "uptime": 99.9,
  "concurrentUsers": 1250,
  "memoryUsage": 75.5,
  "cpuUsage": 45.2,
  "diskUsage": 68.3,
  "activeConnections": 5,
  "slowestEndpoints": [
    {
      "endpoint": "/api/search",
      "method": "GET",
      "averageTime": 1200,
      "maxTime": 5000,
      "callCount": 5000
    }
  ],
  "databaseStats": {
    "totalCollections": 12,
    "totalDocuments": 50000,
    "databaseSize": 500000000,
    "indexSize": 50000000
  }
}
```

## أمثلة الاستخدام

### لوحة تحكم تفاعلية

```javascript
// الحصول على بيانات لوحة التحكم
async function loadDashboard() {
  try {
    const response = await fetch('/analytics/dashboard?period=monthly&compareWithPrevious=true', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const data = await response.json();

    // عرض المؤشرات الرئيسية
    displayKPIs(data.kpis);

    // رسم مخططات الإيرادات
    drawRevenueCharts(data.revenueCharts);

    // رسم مخططات المستخدمين
    drawUserCharts(data.userCharts);

  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}
```

### إنشاء تقرير شهري

```javascript
async function generateMonthlyReport() {
  const reportConfig = {
    reportType: 'monthly_report',
    formats: ['pdf', 'excel'],
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    includeCharts: true,
    includeRawData: true
  };

  try {
    const response = await fetch('/analytics/reports/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportConfig)
    });

    const result = await response.json();
    console.log('Report generated:', result);

    // عرض روابط التحميل
    displayDownloadLinks(result.fileUrls);

  } catch (error) {
    console.error('Failed to generate report:', error);
  }
}
```

### مراقبة الأداء التلقائية

```javascript
// مراقبة الأداء كل 5 دقائق
setInterval(async () => {
  try {
    const response = await fetch('/analytics/performance', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const metrics = await response.json();

    // التحقق من حدود الأداء
    checkPerformanceThresholds(metrics);

    // تحديث مؤشرات لوحة التحكم
    updatePerformanceIndicators(metrics);

  } catch (error) {
    console.error('Performance monitoring failed:', error);
  }
}, 5 * 60 * 1000);
```

### تحليل الاتجاهات

```javascript
async function analyzeTrends() {
  const metrics = ['revenue', 'users', 'orders', 'support_tickets'];

  for (const metric of metrics) {
    try {
      const response = await fetch(`/analytics/trends/${metric}?days=90`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const trendData = await response.json();

      // تحليل الاتجاهات
      const analysis = analyzeTrend(trendData.data);

      // عرض النتائج
      displayTrendAnalysis(metric, analysis);

    } catch (error) {
      console.error(`Failed to analyze ${metric} trend:`, error);
    }
  }
}
```

## الجدولة التلقائية

النظام يدعم جدولة التقارير التلقائية:

- **يومية**: ملخص يومي للأنشطة
- **أسبوعية**: تقرير شامل للأسبوع
- **شهرية**: تحليل شامل للشهر
- **ربع سنوية**: تقارير استراتيجية

## التنبيهات والإشعارات

- تنبيهات للانحرافات في المؤشرات الرئيسية
- إشعارات للتقارير الجديدة
- تنبيهات لمشاكل الأداء التقني
- إشعارات لتغييرات مهمة في البيانات

## الأمان والصلاحيات

- **مشرفين فقط**: جميع endpoints محمية بـ AdminGuard
- **تدقيق شامل**: تسجيل جميع عمليات الوصول
- **تشفير البيانات**: البيانات الحساسة محمية
- **حدود الوصول**: قيود على عدد الاستعلامات

## ملاحظات مهمة

1. **التخزين التلقائي**: البيانات التحليلية تُحفظ تلقائياً يومياً
2. **الأداء**: الاستعلامات محسّنة بـ indexes مناسبة
3. **الذاكرة**: البيانات مُقسمة حسب الفترات الزمنية
4. **النسخ الاحتياطي**: البيانات المهمة تُنسخ احتياطياً
5. **التوسع**: النظام مصمم للتعامل مع كميات كبيرة من البيانات

## التطوير المستقبلي

- **ذكاء اصطناعي**: تحليلات تنبؤية متقدمة
- **تخصيص**: لوحات تحكم مخصصة لكل مستخدم
- **تكامل**: مع أدوات BI خارجية (Tableau, Power BI)
- **الوقت الفعلي**: تحديثات فورية للمؤشرات
- **التنبيهات المتقدمة**: قواعد تنبيه مخصصة

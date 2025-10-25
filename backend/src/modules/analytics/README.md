# Analytics Module (نظام التحليلات والتقارير)

نظام تحليلات متقدم مع لوحات تحكم تفاعلية، حسابات KPI معقدة من بيانات قاعدة البيانات الحقيقية، والجدولة التلقائية.

## الميزات المطبقة فعلياً

### ✅ **الميزات الأساسية المطبقة بالكامل:**
- ✅ **لوحة تحكم شاملة**: مؤشرات KPI ومخططات تفاعلية
- ✅ **تحليلات متعددة الأبعاد**: للمستخدمين، المنتجات، الطلبات، الخدمات، والدعم
- ✅ **جدولة تلقائية**: تقارير يومية، أسبوعية، وشهرية
- ✅ **مقارنات زمنية**: تحليل الاتجاهات ومقارنة الفترات
- ✅ **مؤشرات الأداء**: KPI شامل مع حسابات متقدمة
- ✅ **مراقبة الأداء**: استجابة النظام وحالة الخدمات
- ✅ **التخزين المؤقت**: Cache system للأداء المحسن

### ⚠️ **الميزات المطبقة جزئياً:**
- ⚠️ **تقارير احترافية**: JSON مكتمل، PDF/Excel mock implementation
- ⚠️ **تصدير متقدم**: CSV/JSON مكتمل، XLSX/PDF mock implementation

### ❌ **الميزات غير المطبقة:**
- ❌ **تحليلات جغرافية**: خرائط وتوزيع حسب المناطق
- ❌ **تنبيهات ذكية**: إشعارات متقدمة للمؤشرات المهمة
- ❌ **ذكاء اصطناعي**: تحليلات تنبؤية
- ❌ **تكامل BI**: مع أدوات خارجية (Tableau, Power BI)
- ❌ **الوقت الفعلي**: تحديثات فورية متقدمة

## البيانات المحللة فعلياً

### 📊 مؤشرات KPI المطبقة فعلياً:
- ✅ **إجمالي المستخدمين**: عدد المستخدمين النشطين والمسجلين
- ✅ **إجمالي الإيرادات**: إيرادات المنتجات والخدمات
- ✅ **إجمالي الطلبات**: عدد الطلبات المكتملة والمعلقة
- ✅ **الخدمات النشطة**: عدد الخدمات المفتوحة والقيد التنفيذ
- ✅ **تذاكر الدعم المفتوحة**: حالة تذاكر الدعم الفني
- ✅ **صحة النظام**: مؤشرات الأداء التقني

### 📈 التحليلات المتاحة فعلياً:

#### تحليلات المستخدمين ✅
- إحصائيات التسجيل والنشاط
- توزيع الأدوار (عملاء، مهندسين، مشرفين)
- إحصائيات التحقق من البريد الإلكتروني
- عدد المستخدمين المعلقين

#### تحليلات المنتجات ✅
- أداء المبيعات لكل منتج
- إحصائيات المخزون والمتغيرات
- تحليل الطلبات حسب المنتج

#### تحليلات الطلبات والمبيعات ✅
- إحصائيات الطلبات (مكتملة، معلقة، ملغية)
- متوسط قيمة الطلب
- تحليل الإيرادات حسب الفترة الزمنية
- إحصائيات الطلبات حسب الحالة

#### تحليلات الخدمات ✅
- إحصائيات طلبات الخدمات
- توزيع الخدمات حسب الحالة
- إحصائيات المهندسين

#### تحليلات الدعم الفني ✅
- إحصائيات التذاكر (مفتوحة، مغلقة، قيد المراجعة)
- توزيع التذاكر حسب الأولوية

#### تحليلات الأداء التقني ✅
- أوقات استجابة API (محسوبة)
- معدلات الأخطاء والتوفر
- إحصائيات قاعدة البيانات
- نقاط النهاية الأبطأ

## API Endpoints المتاحة فعلياً

### 🎯 **Analytics Controller** (`/analytics`)

#### لوحة التحكم الرئيسية
```http
GET /analytics/dashboard?period=monthly&startDate=2024-01-01&endDate=2024-12-31&compareWithPrevious=true
Authorization: Bearer {admin-token}
```

#### التحليلات المفصلة
```http
GET /analytics/overview      # نظرة عامة على المؤشرات
GET /analytics/revenue       # تحليلات الإيرادات
GET /analytics/users         # تحليلات المستخدمين
GET /analytics/products      # تحليلات المنتجات
GET /analytics/services      # تحليلات الخدمات
GET /analytics/support       # تحليلات الدعم
GET /analytics/kpis          # مؤشرات الأداء الرئيسية
GET /analytics/performance   # أداء النظام التقني
```

#### التقارير والمقارنات
```http
GET /analytics/comparison    # مقارنة فترتين زمنيتين
GET /analytics/trends/:metric # اتجاهات مؤشر محدد
GET /analytics/export/:format # تصدير البيانات
```

#### إدارة التقارير
```http
POST /analytics/reports/generate    # إنشاء تقرير
POST /analytics/reports/schedule    # جدولة تقرير
GET /analytics/reports/:id          # الحصول على تقرير
POST /analytics/refresh             # تحديث البيانات
```

### 🔬 **Advanced Analytics Controller** (`/analytics/advanced`)

#### تحليلات متقدمة
```http
GET /analytics/advanced/sales              # تحليلات المبيعات المتقدمة
GET /analytics/advanced/products/performance # أداء المنتجات
GET /analytics/advanced/customers          # تحليلات العملاء
GET /analytics/advanced/inventory          # تحليلات المخزون
GET /analytics/advanced/financial          # التحليلات المالية
GET /analytics/advanced/cart-analytics     # تحليلات سلة التسوق
GET /analytics/advanced/marketing          # تحليلات التسويق
GET /analytics/advanced/realtime           # البيانات في الوقت الفعلي
GET /analytics/advanced/quick-stats        # إحصائيات سريعة
```

#### إدارة التقارير المتقدمة
```http
POST /analytics/advanced/reports/generate   # إنشاء تقرير متقدم
GET /analytics/advanced/reports             # قائمة التقارير
GET /analytics/advanced/reports/:reportId   # تفاصيل تقرير
POST /analytics/advanced/reports/:reportId/archive # أرشفة تقرير
POST /analytics/advanced/reports/:reportId/export  # تصدير تقرير
```

#### التصدير المتقدم
```http
GET /analytics/advanced/export/sales        # تصدير مبيعات
GET /analytics/advanced/export/products     # تصدير منتجات
GET /analytics/advanced/export/customers    # تصدير عملاء
GET /analytics/advanced/comparison          # مقارنة متقدمة
GET /analytics/advanced/trends/:metric      # اتجاهات متقدمة
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

## الجدولة التلقائية المطبقة فعلياً

النظام يدعم إنشاء snapshots تلقائية للبيانات:

- ✅ **يومية**: إنشاء snapshot يومي في منتصف الليل (`@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`)
- ✅ **أسبوعية**: إنشاء snapshot أسبوعي كل يوم أحد (`@Cron('0 0 * * 0')`)
- ✅ **شهرية**: إنشاء snapshot شهري في بداية كل شهر
- ✅ **سنوية**: إنشاء snapshot سنوي في بداية كل سنة

## التنبيهات والإشعارات

### ❌ **غير مطبق فعلياً:**
- ❌ تنبيهات للانحرافات في المؤشرات الرئيسية
- ❌ إشعارات للتقارير الجديدة
- ❌ تنبيهات لمشاكل الأداء التقني
- ❌ إشعارات لتغييرات مهمة في البيانات

### ✅ **المطبق فعلياً:**
- ✅ **إشعارات التقارير**: يمكن إرسال التقارير عبر البريد الإلكتروني (في جدولة التقارير)
- ✅ **مراقبة الأداء**: endpoints لمراقبة صحة النظام

## الأمان والصلاحيات

- **مشرفين فقط**: جميع endpoints محمية بـ AdminGuard
- **تدقيق شامل**: تسجيل جميع عمليات الوصول
- **تشفير البيانات**: البيانات الحساسة محمية
- **حدود الوصول**: قيود على عدد الاستعلامات

## ملاحظات مهمة

### ✅ **المطبق فعلياً:**
1. **التخزين التلقائي**: البيانات التحليلية تُحفظ في snapshots تلقائياً
2. **التخزين المؤقت**: Cache system لتحسين الأداء
3. **الحسابات المعقدة**: حسابات KPI متقدمة من بيانات قاعدة البيانات الحقيقية
4. **الأمان**: جميع endpoints محمية بـ AdminGuard
5. **البنية المعقدة**: فصل الاهتمامات مع services متعددة

### ⚠️ **قيود حالية:**
1. **Mock Data**: بعض التقارير والتصدير يستخدم mock data
2. **لا تنبيهات**: عدم وجود نظام تنبيهات ذكية
3. **لا AI**: عدم وجود تحليلات تنبؤية
4. **لا BI Integration**: عدم تكامل مع أدوات خارجية

## التطوير المستقبلي المطلوب

### 🎯 **أولويات عالية:**
- **إكمال التقارير**: تطبيق PDF/Excel generation فعلياً
- **نظام التنبيهات**: تنبيهات ذكية للمؤشرات المهمة
- **تحسين الأداء**: تحسين الاستعلامات وإضافة المزيد من indexes

### 🚀 **تطوير مستقبلي:**
- **ذكاء اصطناعي**: تحليلات تنبؤية متقدمة
- **تخصيص**: لوحات تحكم مخصصة لكل مستخدم
- **تكامل BI**: مع أدوات خارجية (Tableau, Power BI)
- **الوقت الفعلي**: WebSocket للتحديثات الفورية
- **تحليلات جغرافية**: خرائط تفاعلية لتوزيع المستخدمين

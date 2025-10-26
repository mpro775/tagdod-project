# System Monitoring Module

## نظرة عامة

نظام متقدم لمراقبة صحة وأداء النظام في الوقت الفعلي مع تتبع تاريخي وتنبيهات تلقائية.

## المميزات

### 1. مراقبة الموارد
- **CPU Usage**: مراقبة استخدام المعالج والنوى والحمل
- **Memory Usage**: متابعة استخدام الذاكرة (RAM & Heap)
- **Disk Usage**: مراقبة مساحة القرص المتاحة
- **Real-time Tracking**: تتبع فوري لجميع الموارد

### 2. مراقبة قاعدة البيانات
- حالة الاتصال بـ MongoDB
- وقت الاستجابة
- عدد المجموعات والوثائق
- حجم قاعدة البيانات والفهارس
- تتبع الاستعلامات البطيئة

### 3. مراقبة Redis Cache
- حالة الاتصال
- استخدام الذاكرة
- معدل الإصابة (Hit Rate)
- عدد المفاتيح
- العمليات في الثانية

### 4. مراقبة أداء API
- إجمالي الطلبات
- معدل النجاح/الفشل
- متوسط وقت الاستجابة
- أبطأ نقاط النهاية
- معدل الأخطاء

### 5. نظام التنبيهات
- تنبيهات تلقائية عند تجاوز الحدود
- ثلاثة مستويات: Info, Warning, Critical
- إمكانية حل التنبيهات
- تتبع من قام بالحل

### 6. البيانات التاريخية
- حفظ المقاييس كل دقيقة
- الاحتفاظ بالبيانات لمدة 90 يوم
- إمكانية عرض التاريخ حسب الفترة
- إحصائيات (Min, Max, Avg)

## API Endpoints

### الصحة العامة
```
GET /system-monitoring/health
```
يعيد صحة النظام الشاملة مع جميع المقاييس الرئيسية.

### استخدام الموارد
```
GET /system-monitoring/resources
```
معلومات CPU, Memory, Disk.

### قاعدة البيانات
```
GET /system-monitoring/database
```
مقاييس MongoDB.

### Redis Cache
```
GET /system-monitoring/redis
```
مقاييس Redis.

### أداء API
```
GET /system-monitoring/api-performance
```
إحصائيات الطلبات والاستجابة.

### تاريخ المقاييس
```
GET /system-monitoring/metrics/history?metricType=cpu&timeRange=last_24_hours
```
البيانات التاريخية للمقاييس.

### التنبيهات
```
GET /system-monitoring/alerts
POST /system-monitoring/alerts/:id/resolve
```

### النظرة العامة الشاملة
```
GET /system-monitoring/overview
```
جميع المقاييس في استجابة واحدة.

## الجدولة التلقائية (Cron Jobs)

### كل دقيقة
- جمع مقاييس CPU, Memory, Disk
- حفظها في قاعدة البيانات
- فحص الحدود وإنشاء تنبيهات

## نماذج البيانات

### SystemMetric
```typescript
{
  metricType: string;      // cpu, memory, disk, database, redis, api
  value: number;           // القيمة الحالية
  metadata: object;        // معلومات إضافية
  timestamp: Date;         // وقت القياس
  details: object;         // تفاصيل كاملة
}
```

### SystemAlert
```typescript
{
  type: string;           // warning, critical, info
  category: string;       // cpu, memory, disk, etc.
  message: string;        // رسالة التنبيه
  details: string;        // التفاصيل
  resolved: boolean;      // هل تم الحل؟
  resolvedAt: Date;       // وقت الحل
  resolvedBy: string;     // من قام بالحل
  timestamp: Date;        // وقت إنشاء التنبيه
}
```

## حدود التنبيهات

### CPU
- Warning: > 70%
- Critical: > 90%

### Memory
- Warning: > 70%
- Critical: > 90%

### Disk
- Warning: > 80%
- Critical: > 90%

### Error Rate
- Warning: > 5%
- Critical: > 10%

## الاستخدام

### في الكود
```typescript
// Track API request
systemMonitoringService.trackRequest('/api/products', 150, true);

// Get system health
const health = await systemMonitoringService.getSystemHealth();

// Get metrics history
const history = await systemMonitoringService.getMetricsHistory({
  metricType: MetricType.CPU,
  timeRange: TimeRange.LAST_24_HOURS,
});
```

## التكامل مع Middleware

يمكن إنشاء middleware لتتبع الطلبات تلقائياً:

```typescript
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private monitoringService: SystemMonitoringService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const success = res.statusCode < 400;
      this.monitoringService.trackRequest(req.path, duration, success);
    });

    next();
  }
}
```

## الصلاحيات

جميع endpoints تتطلب:
- JWT Authentication
- Admin Role

## الأداء

- المقاييس تُجمع كل دقيقة
- التنظيف التلقائي بعد 90 يوم (TTL Index)
- Caching للبيانات الثقيلة
- Optimized queries مع Indexes

## المستقبل

- [ ] تكامل مع Grafana/Prometheus
- [ ] إشعارات بالبريد الإلكتروني
- [ ] تصدير التقارير
- [ ] AI-based predictions
- [ ] Auto-scaling recommendations


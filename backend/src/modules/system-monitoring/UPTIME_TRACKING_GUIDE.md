# 📊 دليل تتبع Uptime - نظام مراقبة التوفر

## ما هو Uptime؟

**Uptime** هو مقياس لنسبة الوقت الذي يكون فيه النظام متاحاً وقيد التشغيل.

### أنواع Uptime:

#### 1️⃣ **Process Uptime** (مدة التشغيل الحالية)
```typescript
process.uptime() // عدد الثواني منذ آخر تشغيل
// مثال: 86400 ثانية = يوم واحد
```

#### 2️⃣ **Uptime Percentage** (نسبة التوفر)
```typescript
calculateUptimePercentage(30) // نسبة التوفر لآخر 30 يوم
// مثال: 99.95% = متوفر 99.95% من الوقت
```

---

## 🎯 كيف يعمل النظام؟

### نظام تتبع الأحداث (Events):

```typescript
// أنواع الأحداث
type UptimeEvent = 
  | 'startup'   // ✅ بدء تشغيل السيرفر
  | 'shutdown'  // 🔴 إيقاف مخطط
  | 'crash'     // ⚠️ توقف مفاجئ
  | 'restart'   // 🔄 إعادة تشغيل
```

### Schema:

```typescript
{
  eventType: 'startup',           // نوع الحدث
  timestamp: new Date(),          // وقت الحدث
  duration: 86400,                // مدة التشغيل السابقة (بالثواني)
  metadata: {
    version: 'v18.0.0',          // إصدار Node.js
    pid: 12345,                   // Process ID
    hostname: 'server-1',         // اسم السيرفر
    platform: 'linux',            // نظام التشغيل
  },
  isPlanned: false,               // هل كان التوقف مخطط؟
}
```

---

## 🔧 كيفية الاستخدام

### 1. **تسجيل التشغيل الأولي** (تلقائي ✅)

```typescript
// في constructor SystemMonitoringService
constructor(...) {
  // يتم تسجيل startup event تلقائياً عند بدء التشغيل
  this.recordUptimeEvent('startup');
}
```

### 2. **تسجيل Shutdown المخطط**

```typescript
// في main.ts أو app shutdown hook
app.enableShutdownHooks();

process.on('SIGTERM', async () => {
  await systemMonitoringService.recordUptimeEvent('shutdown', 
    { reason: 'Graceful shutdown' }, 
    true  // isPlanned = true
  );
  await app.close();
});
```

### 3. **تسجيل Crash غير متوقع**

```typescript
// في global exception filter أو process error handler
process.on('uncaughtException', async (error) => {
  await systemMonitoringService.recordUptimeEvent('crash', 
    { 
      reason: error.message,
      stack: error.stack 
    },
    false  // isPlanned = false
  );
  process.exit(1);
});
```

### 4. **الحصول على Uptime Percentage**

```typescript
// في Analytics أو Dashboard
const uptimePercentage = await systemMonitoring.calculateUptimePercentage(30);
// Returns: 99.95

console.log(`System Uptime: ${uptimePercentage}%`);
```

### 5. **الحصول على إحصائيات كاملة**

```typescript
const stats = await systemMonitoring.getUptimeStatistics(30);

console.log(stats);
/*
{
  uptimePercentage: 99.95,
  currentUptime: 86400,  // Current session: 1 day
  period: 'Last 30 days',
  events: {
    startup: 3,
    shutdown: 2,
    crash: 1,
    restart: 0
  },
  downtimeIncidents: 3,  // shutdown + crash
  recentEvents: [...]
}
*/
```

---

## 📐 كيف يتم حساب Uptime Percentage؟

### الصيغة:
```
Uptime % = ((Total Time - Downtime) / Total Time) × 100
```

### مثال:
```typescript
// فترة 30 يوم = 2,592,000 ثانية
Total Time: 2,592,000 seconds

// حدثت 3 توقفات:
Downtime 1: 120 seconds  (2 دقيقة)
Downtime 2: 300 seconds  (5 دقائق)
Downtime 3: 60 seconds   (1 دقيقة)
Total Downtime: 480 seconds (8 دقائق)

// الحساب:
Uptime % = ((2,592,000 - 480) / 2,592,000) × 100
         = (2,591,520 / 2,592,000) × 100
         = 99.98%
```

### كيف يكتشف النظام Downtime؟

```typescript
// يبحث عن:
1. shutdown → startup  = Downtime مخطط
2. crash → startup     = Downtime غير مخطط

// يحسب الوقت بين الحدثين
downtime = startup.timestamp - shutdown.timestamp
```

---

## 🚀 التكامل مع Analytics

### في `analytics.service.ts`:

```typescript
// ✅ بعد التحديث
const uptimePercentage = await this.systemMonitoring.calculateUptimePercentage(30);

// ❌ قبل (كان مقدر)
// const uptimePercentage = 99.9;
```

### في Dashboard:

```typescript
{
  systemHealth: {
    status: 'healthy',
    uptime: 99.95,              // ✅ حقيقي من تتبع فعلي
    responseTime: 120,
    errorRate: 0.05
  }
}
```

---

## 📊 معايير الصناعة (Industry Standards)

| Uptime % | Downtime/Year | Downtime/Month | الوصف |
|----------|---------------|----------------|-------|
| 90%      | 36.5 يوم      | 3 أيام         | ⚠️ غير مقبول |
| 95%      | 18.25 يوم     | 1.5 يوم        | ⚠️ ضعيف |
| 99%      | 3.65 يوم      | 7.2 ساعة       | 🟡 مقبول |
| 99.9%    | 8.76 ساعة     | 43.2 دقيقة     | ✅ جيد |
| 99.95%   | 4.38 ساعة     | 21.6 دقيقة     | ✅ ممتاز |
| 99.99%   | 52.56 دقيقة   | 4.32 دقيقة     | ⭐ استثنائي |
| 99.999%  | 5.26 دقيقة    | 26 ثانية       | 🏆 Five Nines |

---

## 🎯 أفضل الممارسات

### 1. **تسجيل جميع الأحداث**
```typescript
// ✅ Good
await recordUptimeEvent('shutdown', { reason: 'Maintenance' }, true);

// ❌ Bad
process.exit(0); // لا يسجل الحدث
```

### 2. **التفريق بين المخطط وغير المخطط**
```typescript
// Planned (صيانة مخططة)
isPlanned: true

// Unplanned (crash مفاجئ)
isPlanned: false
```

### 3. **إضافة metadata مفيدة**
```typescript
metadata: {
  reason: 'Monthly security updates',
  version: '2.0.0',
  duration: 300  // Expected downtime
}
```

### 4. **المراقبة المستمرة**
```typescript
// كل يوم، راجع uptime
const stats = await getUptimeStatistics(30);
if (stats.uptimePercentage < 99.9) {
  // أرسل تنبيه للفريق
  sendAlert('Low uptime detected!');
}
```

---

## 🔌 Graceful Shutdown Handler

أضف هذا في `main.ts`:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable shutdown hooks
  app.enableShutdownHooks();
  
  // Get SystemMonitoringService
  const systemMonitoring = app.get(SystemMonitoringService);
  
  // Handle SIGTERM (Docker/K8s shutdown)
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    
    await systemMonitoring.recordUptimeEvent('shutdown', {
      reason: 'SIGTERM signal',
      graceful: true
    }, true);
    
    await app.close();
    process.exit(0);
  });
  
  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    
    await systemMonitoring.recordUptimeEvent('shutdown', {
      reason: 'SIGINT signal (Ctrl+C)',
      graceful: true
    }, true);
    
    await app.close();
    process.exit(0);
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    
    await systemMonitoring.recordUptimeEvent('crash', {
      reason: error.message,
      stack: error.stack,
      type: 'uncaughtException'
    }, false);
    
    process.exit(1);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    
    await systemMonitoring.recordUptimeEvent('crash', {
      reason: String(reason),
      type: 'unhandledRejection'
    }, false);
    
    process.exit(1);
  });
  
  await app.listen(3000);
  console.log('Application is running on port 3000');
}

bootstrap();
```

---

## 📈 API Endpoints

يمكنك إضافة endpoints في `system-monitoring.controller.ts`:

```typescript
@Get('uptime/stats')
async getUptimeStats(@Query('days') days?: string) {
  const period = days ? parseInt(days) : 30;
  return await this.systemMonitoring.getUptimeStatistics(period);
}

@Get('uptime/percentage')
async getUptimePercentage(@Query('days') days?: string) {
  const period = days ? parseInt(days) : 30;
  const percentage = await this.systemMonitoring.calculateUptimePercentage(period);
  return { uptimePercentage: percentage, period: `Last ${period} days` };
}

@Post('uptime/record')
@Roles('admin')
async recordEvent(@Body() dto: RecordUptimeEventDto) {
  await this.systemMonitoring.recordUptimeEvent(
    dto.eventType,
    dto.metadata,
    dto.isPlanned
  );
  return { success: true };
}
```

---

## ✅ الخلاصة

### ما تم تنفيذه:

1. ✅ **UptimeRecord Schema** - تخزين جميع الأحداث
2. ✅ **recordUptimeEvent()** - تسجيل الأحداث
3. ✅ **calculateUptimePercentage()** - حساب النسبة الحقيقية
4. ✅ **getUptimeStatistics()** - إحصائيات كاملة
5. ✅ **تكامل مع Analytics** - استخدام البيانات الحقيقية

### ما تحتاج لإضافته (اختياري):

1. ⏰ **Graceful Shutdown Handler** في `main.ts`
2. 🎯 **Monitoring Dashboard** لعرض uptime
3. 🔔 **Alerts** عند انخفاض uptime عن حد معين
4. 📊 **External Monitoring** (Pingdom, UptimeRobot, etc.)

---

**الآن uptime مربوط 100% ببيانات حقيقية!** 🎉


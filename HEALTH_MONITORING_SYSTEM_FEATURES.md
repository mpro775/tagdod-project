# مميزات نظام الصحة والمراقبة الشامل

## مقدمة عن النظام

نظام مراقبة وصحة متقدم مصمم خصيصاً لمنصة خدمات الطاقة الشمسية يوفر مراقبة شاملة للحالة الصحية للتطبيق وقواعد البيانات والخدمات الخارجية. النظام يدعم فحوصات متعددة المستويات (Health, Ready, Live) مع مراقبة مستمرة للأداء والموارد.

## قسم فحوصات الصحة المتعددة

### أنواع فحوصات الصحة

#### 1. **فحص الصحة الشامل (Health Check)**
```typescript
GET /health

// فحص جميع الخدمات الحرجة
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "storage": {
      "status": "up"
    }
  },
  "details": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up",
      "message": "Redis is responsive"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "storage": {
      "status": "up"
    }
  }
}
```

#### 2. **فحص الجاهزية (Readiness Check)**
```typescript
GET /health/ready

// فحص الخدمات الحرجة فقط
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    }
  }
}
```

#### 3. **فحص الحيوية (Liveness Check)**
```typescript
GET /health/live

// فحص بسيط لحيوية العملية
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 4. **فحص بسيط (Simple Check)**
```typescript
GET /health/simple

// معلومات أساسية عن حالة التطبيق
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "production"
}
```

## قسم مراقبة قواعد البيانات

### فحص صحة MongoDB

#### 1. **فحص اتصال قاعدة البيانات**
```typescript
// فحص ping للتأكد من استجابة قاعدة البيانات
() => this.db.pingCheck('database')

// يتحقق من:
// - إمكانية الاتصال بقاعدة البيانات
// - استجابة ping في وقت معقول
// - حالة الشبكة والوصول
```

#### 2. **مراقبة حالة الاتصال**
```typescript
// مراقبة مستمرة لحالة قاعدة البيانات
const dbHealth = await mongoose.connection.readyState;

// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting

if (dbHealth !== 1) {
  throw new HealthCheckError('Database connection unhealthy');
}
```

## قسم مراقبة الذاكرة والأداء

### مراقبة استخدام الموارد

#### 1. **مراقبة كومة الذاكرة (Memory Heap)**
```typescript
// فحص كومة الذاكرة (حد أقصى 150MB)
() => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024)

// يراقب:
// - استخدام كومة الذاكرة الحالي
// - منع تجاوز الحد المسموح
// - الكشف المبكر عن تسرب الذاكرة
```

#### 2. **مراقبة استخدام الذاكرة (Memory RSS)**
```typescript
// فحص استخدام الذاكرة (حد أقصى 300MB)
() => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024)

// يراقب:
// - إجمالي الذاكرة المستخدمة
// - نمط استخدام الذاكرة
// - الحد الأقصى المسموح
```

#### 3. **مراقبة مساحة التخزين**
```typescript
// فحص مساحة القرص (حد أدنى 50GB)
() => this.disk.checkStorage('storage', {
  threshold: 50 * 1024 * 1024 * 1024,
  path: '/'
})

// يراقب:
// - مساحة القرص المتاحة
// - نمط استخدام التخزين
// - الحد الأدنى المطلوب
```

## قسم مراقبة الخدمات الخارجية

### فحص صحة Redis والبنية التحتية

#### 1. **فحص اتصال Redis**
```typescript
// فحص استجابة Redis
async isHealthy(key: string): Promise<HealthIndicatorResult> {
  try {
    const result = await this.redis.ping();

    if (result === 'PONG') {
      return this.getStatus(key, true, {
        status: 'up',
        message: 'Redis is responsive',
      });
    }

    throw new Error('Redis ping failed');
  } catch (error) {
    throw new HealthCheckError(
      'Redis check failed',
      this.getStatus(key, false, {
        status: 'down',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    );
  }
}
```

#### 2. **مراقبة أداء Redis**
```typescript
// مراقبة مفاتيح Redis والأداء
const redisInfo = await this.redis.info();

// مراقبة:
// - عدد المفاتيح المخزنة
// - استخدام الذاكرة في Redis
// - عدد العمليات في الثانية
// - وقت استجابة الأوامر
```

## قسم مراقبة النشاط والأداء

### تتبع نشاط المستخدمين

#### 1. **تتبع النشاط التلقائي**
```typescript
// تحديث آخر نشاط للمستخدم
private async updateUserActivity(userId: string): Promise<void> {
  try {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          lastActivityAt: new Date()
        }
      }
    );
  } catch (error) {
    this.logger.error(`Failed to update activity for user ${userId}:`, error);
  }
}
```

#### 2. **مراقبة النشاط في الوسيط**
```typescript
// تطبيق وسيط تتبع النشاط على جميع المسارات
consumer
  .apply(ActivityTrackingMiddleware)
  .forRoutes('*');
```

## قسم مراقبة الأداء والاستجابة

### مراقبة زمن الاستجابة والأداء

#### 1. **تتبع معرف الطلب (Request ID)**
```typescript
// إضافة معرف فريد لكل طلب
consumer
  .apply(RequestIdMiddleware)
  .forRoutes('*');

// يساعد في:
// - تتبع الطلبات في السجلات
// - ربط الأخطاء بالطلبات
// - مراقبة أداء الطلبات
```

#### 2. **مراقبة الطلبات المكررة (Idempotency)**
```typescript
// تطبيق على المسارات الحرجة فقط
consumer
  .apply(IdempotencyMiddleware)
  .forRoutes(
    { path: 'api/v1/checkout', method: RequestMethod.POST },
    { path: 'api/v1/orders', method: RequestMethod.POST },
    { path: 'api/v1/cart/checkout', method: RequestMethod.POST },
  );
```

#### 3. **غلاف الاستجابة الموحد**
```typescript
// إضافة معرف الطلب لكل استجابة
intercept(ctx: ExecutionContext, next: CallHandler) {
  const req = ctx.switchToHttp().getRequest();
  return next.handle().pipe(map((data) => ({
    success: true,
    data,
    requestId: req?.requestId
  })));
}
```

## قسم مراقبة الأمان والحماية

### مراقبة الأمان والحماية الشاملة

#### 1. **حماية الرؤوس الأمنية (Helmet)**
```typescript
// تطبيق رؤوس أمنية متقدمة
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// يوفر حماية من:
// - XSS attacks
// - Clickjacking
// - MIME type sniffing
// - وغيرها من الهجمات الشائعة
```

#### 2. **ضغط الاستجابات (Compression)**
```typescript
// ضغط تلقائي للاستجابات
app.use(compression());

// يحسن:
// - سرعة تحميل الصفحات
// - استخدام النطاق الترددي
// - تجربة المستخدم
```

#### 3. **تحقق صحة البيانات (Validation)**
```typescript
// تحقق صارم من البيانات المدخلة
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  disableErrorMessages: false,
}));
```

## قسم مراقبة السجلات والأخطاء

### نظام السجلات المتقدم

#### 1. **مستويات السجلات**
```typescript
// إعداد مستويات السجلات حسب البيئة
logger: ['error', 'warn', 'debug', 'verbose']

// في الإنتاج: ['error', 'warn']
// في التطوير: ['error', 'warn', 'debug', 'verbose']
```

#### 2. **تسجيل الأخطاء الشامل**
```typescript
// تسجيل مفصل للأخطاء
logger.error('Failed to create NestJS application:', error);
logger.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error');

// يساعد في:
// - تشخيص المشاكل بسرعة
// - مراقبة حالة النظام
// - تحليل الأخطاء المتكررة
```

#### 3. **مراقبة بدء التشغيل**
```typescript
// مراقبة عملية بدء التشغيل
console.log('🔌 Starting server on port', port);
console.log('📍 Attempting to bind to: 0.0.0.0:', port);
console.log('⏳ This may take a few seconds...\n');

await app.listen(port, '0.0.0.0');

console.log('\n✅ Server started successfully!');
logger.log(`🚀 Application is running on: http://localhost:${port}`);
logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
logger.log(`🔍 Analytics Dashboard: http://localhost:${port}/api/analytics/dashboard`);
```

## قسم مراقبة قاعدة البيانات

### مراقبة أداء قاعدة البيانات

#### 1. **مراقبة حالة الاتصال**
```typescript
// مراقبة حالة اتصال MongoDB
const connectionState = mongoose.connection.readyState;

// حالات الاتصال:
// 0 = disconnected (غير متصل)
// 1 = connected (متصل)
// 2 = connecting (جاري الاتصال)
// 3 = disconnecting (جاري قطع الاتصال)
```

#### 2. **مراقبة أداء الاستعلامات**
```typescript
// مراقبة زمن تنفيذ الاستعلامات
const queryStartTime = Date.now();

// تنفيذ الاستعلام
const results = await collection.find({}).toArray();

const queryExecutionTime = Date.now() - queryStartTime;

// تسجيل زمن التنفيذ للمراقبة
logger.debug(`Query executed in ${queryExecutionTime}ms`);
```

#### 3. **مراقبة استخدام الفهارس**
```typescript
// مراقبة كفاءة الفهارس
const indexStats = await db.collection('users').indexes();

// مراقبة:
// - استخدام الفهارس
// - حجم الفهارس
// - تكرار الاستعلامات
```

## قسم مراقبة الخدمات الخارجية

### مراقبة الخدمات الخارجية

#### 1. **مراقبة Bunny.net Storage**
```typescript
// فحص اتصال Bunny.net
const checkBunnyConnection = async () => {
  try {
    const response = await axios.get(`${bunnyHostname}/health`);
    return response.status === 200;
  } catch (error) {
    logger.error('Bunny.net storage health check failed:', error);
    return false;
  }
};
```

#### 2. **مراقبة خدمات البريد الإلكتروني**
```typescript
// فحص خدمة البريد الإلكتروني
const checkEmailService = async () => {
  try {
    // اختبار إرسال بريد إلكتروني
    await emailService.sendTestEmail();
    return true;
  } catch (error) {
    logger.error('Email service health check failed:', error);
    return false;
  }
};
```

#### 3. **مراقبة خدمات الدفع**
```typescript
// فحص خدمات الدفع
const checkPaymentGateway = async () => {
  try {
    // اختبار اتصال بوابة الدفع
    const response = await paymentService.healthCheck();
    return response.status === 'healthy';
  } catch (error) {
    logger.error('Payment gateway health check failed:', error);
    return false;
  }
};
```

## قسم مراقبة الأداء والمقاييس

### مقاييس الأداء الرئيسية

#### 1. **مقاييس الاستجابة**
```typescript
// قياس زمن استجابة الطلبات
const measureResponseTime = (startTime: number) => {
  const endTime = Date.now();
  const responseTime = endTime - startTime;

  // تصنيف زمن الاستجابة
  if (responseTime > 5000) {
    logger.warn(`Slow response detected: ${responseTime}ms`);
  } else if (responseTime > 1000) {
    logger.info(`Moderate response time: ${responseTime}ms`);
  }
};
```

#### 2. **مقاييس استخدام الذاكرة**
```typescript
// مراقبة استخدام الذاكرة
const memUsage = process.memoryUsage();

// مراقبة:
// - rss: Resident Set Size (الذاكرة المستخدمة فعلياً)
// - heapTotal: إجمالي حجم الكومة المخصصة
// - heapUsed: حجم الكومة المستخدمة فعلياً
// - external: حجم الذاكرة الخارجية المستخدمة بواسطة محرك V8
```

#### 3. **مقاييس قاعدة البيانات**
```typescript
// مراقبة أداء قاعدة البيانات
const dbStats = await db.stats();

// مراقبة:
// - collections: عدد المجموعات
// - objects: إجمالي عدد الوثائق
// - avgObjSize: متوسط حجم الوثيقة
// - dataSize: حجم البيانات
// - storageSize: حجم التخزين المستخدم
// - indexes: عدد الفهارس
// - indexSize: حجم الفهارس
```

## قسم التنبيهات والإشعارات

### نظام التنبيهات الذكي

#### 1. **تنبيهات الأداء**
```typescript
// تنبيهات عند تجاوز الحدود
const performanceAlerts = {
  highMemoryUsage: (usage) => {
    if (usage > 80) {
      logger.warn(`High memory usage detected: ${usage}%`);
      // إرسال إشعار للمشرفين
    }
  },

  slowDatabaseQueries: (queryTime) => {
    if (queryTime > 1000) {
      logger.warn(`Slow database query detected: ${queryTime}ms`);
      // إرسال إشعار لفريق قاعدة البيانات
    }
  },

  highErrorRate: (errorRate) => {
    if (errorRate > 5) {
      logger.error(`High error rate detected: ${errorRate}%`);
      // إرسال إشعار فوري للمطورين
    }
  }
};
```

#### 2. **تنبيهات الأمان**
```typescript
// تنبيهات الأمان
const securityAlerts = {
  failedLoginAttempts: (attempts) => {
    if (attempts > 5) {
      logger.warn(`Multiple failed login attempts detected`);
      // حظر IP أو إشعار أمني
    }
  },

  suspiciousActivity: (activity) => {
    logger.warn(`Suspicious activity detected: ${activity}`);
    // تحليل وإجراءات أمنية
  },

  unauthorizedAccess: (accessAttempt) => {
    logger.error(`Unauthorized access attempt: ${accessAttempt}`);
    // إجراءات أمنية فورية
  }
};
```

## قسم مراقبة البيئات المختلفة

### مراقبة حسب البيئة

#### 1. **البيئة التطويرية**
```typescript
// مراقبة مفصلة للتطوير
const devMonitoring = {
  detailedLogging: true,
  performanceTracking: true,
  errorReporting: true,
  realTimeUpdates: true
};
```

#### 2. **البيئة الإنتاجية**
```typescript
// مراقبة محسنة للإنتاج
const prodMonitoring = {
  performanceMetrics: true,
  errorAggregation: true,
  healthChecks: true,
  securityMonitoring: true,
  resourceUsage: true
};
```

## قسم التكامل مع أدوات المراقبة

### تكامل مع أدوات خارجية

#### 1. **تكامل مع Prometheus**
```typescript
// تصدير مقاييس لـ Prometheus
const prometheusMetrics = {
  httpRequestsTotal: register.counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
  }),

  responseTimeHistogram: register.histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2.5, 5, 10]
  })
};
```

#### 2. **تكامل مع Grafana**
```typescript
// لوحات مراقبة Grafana
const grafanaDashboards = {
  applicationHealth: 'Application Health Dashboard',
  performanceMetrics: 'Performance Metrics Dashboard',
  databaseMonitoring: 'Database Monitoring Dashboard',
  securityMonitoring: 'Security Monitoring Dashboard'
};
```

#### 3. **تكامل مع Sentry**
```typescript
// تتبع الأخطاء مع Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

## قسم الصيانة والتحديث

### آليات الصيانة والمراقبة

#### 1. **فحوصات الصحة الدورية**
```typescript
// جدولة فحوصات الصحة
@Cron('0 */5 * * * *') // كل 5 دقائق
async performHealthChecks() {
  const healthStatus = await this.health.check([...]);

  if (healthStatus.status !== 'ok') {
    logger.error('Health check failed:', healthStatus);
    // إرسال تنبيهات للمشرفين
  }
}
```

#### 2. **تنظيف السجلات القديمة**
```typescript
// تنظيف السجلات الشهرية
@Cron('0 0 1 * *') // أول يوم من كل شهر
async cleanupOldLogs() {
  // حذف السجلات الأقدم من شهر
  // ضغط السجلات لتوفير المساحة
  // أرشفة السجلات المهمة
}
```

#### 3. **تحديث الشهادات والمفاتيح**
```typescript
// مراقبة صلاحية الشهادات
@Cron('0 0 * * *') // يومياً
async checkCertificates() {
  const certExpiry = await checkCertificateExpiry();

  if (certExpiry.daysUntilExpiry < 30) {
    logger.warn(`Certificate expires soon: ${certExpiry.daysUntilExpiry} days`);
    // إشعار فريق العمليات
  }
}
```

## الخلاصة

نظام الصحة والمراقبة هذا يوفر **مراقبة شاملة ومتعددة المستويات** لجميع جوانب التطبيق مع إمكانيات متقدمة للكشف المبكر عن المشاكل والأداء.

### نقاط القوة:
- ✅ **فحوصات متعددة المستويات** (Health, Ready, Live, Simple)
- ✅ **مراقبة شاملة للموارد** (ذاكرة، قرص، قاعدة بيانات، Redis)
- ✅ **تتبع النشاط والأداء** للمستخدمين والنظام
- ✅ **حماية أمنية متقدمة** مع مراقبة مستمرة
- ✅ **تنبيهات ذكية** للحالات الاستثنائية
- ✅ **تكامل مع أدوات المراقبة** الخارجية
- ✅ **مراقبة البيئات المختلفة** (تطوير، إنتاج، اختبار)

### المميزات التقنية:
- 🔍 **فحوصات صحة شاملة** لجميع الخدمات الحرجة
- 📊 **مراقبة أداء متقدمة** مع مقاييس مفصلة
- 🔔 **تنبيهات فورية** للحالات الاستثنائية
- 🔒 **حماية أمنية متكاملة** مع Helmet وCORS
- 📈 **تتبع مقاييس مفصلة** للأداء والاستخدام
- 🗂️ **تنظيم السجلات الذكي** مع مستويات متعددة
- 🔧 **مرونة في التخصيص** والتكيف مع الاحتياجات
- 🚀 **أداء محسن** مع ضغط وتخزين مؤقت

هذا النظام يضمن **استقرار وأداء عالي** لمنصة خدمات الطاقة الشمسية مع **مراقبة شاملة ومستمرة** للحالة الصحية و **كشف مبكر للمشاكل** لضمان تجربة مستخدم ممتازة وتوفر عالي للخدمات.

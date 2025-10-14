# Security Module (نظام الحماية والأمان المتقدم)

نظام حماية شامل ومتقدم لمنصة خدمات الطاقة الشمسية مع طبقات متعددة من الحماية والمراقبة الأمنية.

## الميزات الأمنية

- ✅ **Rate Limiting متقدم**: حماية من الهجمات مع Redis
- ✅ **CORS احترافي**: إعدادات متقدمة مع دعم ديناميكي
- ✅ **Guards أمنية**: حماية IP وبصمات الأجهزة
- ✅ **Interceptors أمنية**: تسجيل شامل ومراقبة
- ✅ **Middlewares أمنية**: headers أمنية وكشف التهديدات
- ✅ **تشفير شامل**: حماية البيانات والتواصل
- ✅ **مراقبة أمنية**: كشف وتتبع التهديدات
- ✅ **إدارة الجلسات**: حماية من التزييف والسرقة

## البنية الأمنية

### 1. Rate Limiting (تحديد معدل الطلبات)

#### المكونات:
- `RateLimitingService`: إدارة حدود الطلبات مع Redis
- `RateLimitingMiddleware`: تطبيق الحدود على الطلبات
- دعم متعدد المستويات للحدود

#### أنواع الحدود:

| المحدد | الوصف | الحدود |
|--------|--------|---------|
| `api` | API العام | 1000 طلب/15 دقيقة |
| `auth` | المصادقة | 10 محاولات/15 دقيقة |
| `login` | تسجيل الدخول | 5 محاولات/15 دقيقة |
| `upload` | رفع الملفات | 50 ملف/ساعة |
| `search` | البحث | 200 استعلام/15 دقيقة |
| `admin` | الإدارة | 500 طلب/15 دقيقة |

#### مثال الاستخدام:
```javascript
// التحقق من الحد في الخدمة
const result = await rateLimitingService.checkLimit('api', userIP);
if (result.isBlocked) {
  throw new ForbiddenException('Rate limit exceeded');
}
```

### 2. CORS Configuration (إعدادات Cross-Origin)

#### المكونات:
- `CORSService`: إدارة إعدادات CORS المتقدمة
- دعم الـ origins الديناميكية
- إعدادات أمنية شاملة

#### الميزات:
- **Dynamic Origin Validation**: تحقق ذكي من المصادر
- **Wildcard Support**: دعم أنماط البدل
- **Credentials Support**: دعم المصادقة
- **Preflight Caching**: تخزين مؤقت للتحققات

#### إعدادات CORS:
```javascript
{
  origin: dynamicOriginValidator,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [...securityHeaders],
  exposedHeaders: [...rateLimitHeaders],
  credentials: true,
  maxAge: 86400
}
```

### 3. Security Guards (الحراسات الأمنية)

#### IP Whitelist Guard:
```typescript
@Injectable()
export class IPWhitelistGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientIP = this.getClientIP(request);

    if (this.isBlacklisted(clientIP)) {
      throw new ForbiddenException('IP blocked');
    }

    if (!this.isWhitelisted(clientIP)) {
      throw new ForbiddenException('IP not allowed');
    }

    return true;
  }
}
```

#### Device Fingerprint Guard:
```typescript
@Injectable()
export class DeviceFingerprintGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (this.isSuspiciousUserAgent(request.get('User-Agent'))) {
      throw new BadRequestException('Invalid request');
    }

    if (this.isAutomatedRequest(request)) {
      throw new BadRequestException('Automated requests blocked');
    }

    // Generate device fingerprint
    request['deviceFingerprint'] = this.generateFingerprint(request);
    return true;
  }
}
```

### 4. Security Interceptors (المعترضات الأمنية)

#### Security Logging Interceptor:
- تسجيل شامل للأحداث الأمنية
- مراقبة الأداء والطلبات البطيئة
- تتبع الأخطاء والاستثناءات
- إشعارات للحوادث الأمنية

#### الأحداث المسجلة:
- عمليات الإدارة الحساسة
- محاولات المصادقة الفاشلة
- رفع الملفات
- الوصول للبيانات الحساسة
- الأخطاء الخادم (>500)

### 5. Security Middlewares (الوسائط الأمنية)

#### Security Headers Middleware:
```typescript
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

    // Remove server information
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    next();
  }
}
```

#### Threat Detection Middleware:
- **SQL Injection Detection**: كشف محاولات حقن SQL
- **XSS Detection**: كشف محاولات Cross-Site Scripting
- **Path Traversal Detection**: كشف محاولات عبور المسارات
- **Command Injection Detection**: كشف محاولات حقن الأوامر

#### أنماط الكشف:
```javascript
// SQL Injection
/(b(union|select|insert|update|delete|drop|create|alter|exec|execute)b)/i

// XSS
/<script[^>]*>.*?<\/script>/gi
/javascript:/gi
/onload\s*=/gi

// Path Traversal
/\.\.\//g
/\.\\/g
```

## إعدادات الأمان

### متغيرات البيئة:

```env
# Security Configuration
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
IP_WHITELIST=127.0.0.1,::1,localhost
IP_BLACKLIST=

# JWT Security
JWT_SECRET=your-super-secure-jwt-secret-32-chars-min
REFRESH_SECRET=your-super-secure-refresh-secret-32-chars-min

# Encryption
ENCRYPTION_KEY=32-character-encryption-key
ENCRYPTION_IV=16-character-iv

# Security Features
SECURITY_HEADERS_ENABLED=true
THREAT_DETECTION_ENABLED=true
RATE_LIMITING_ENABLED=true
```

## APIs المتاحة

### Rate Limiting APIs

#### التحقق من الحد:
```http
GET /security/rate-limit/check?limiter=api&key=user_ip
```

#### الحصول على حالة الحد:
```http
GET /security/rate-limit/status?limiter=api&key=user_ip
```

#### إعادة تعيين الحد:
```http
POST /security/rate-limit/reset
{
  "limiter": "api",
  "key": "user_ip"
}
```

#### إحصائيات Rate Limiting:
```http
GET /security/rate-limit/stats
```

### CORS APIs

#### الحصول على إعدادات CORS:
```http
GET /security/cors/config
```

#### تحديث إعدادات CORS:
```http
PUT /security/cors/config
{
  "origin": ["https://new-domain.com"],
  "credentials": true
}
```

#### إضافة origin مسموح:
```http
POST /security/cors/origins
{
  "origin": "https://trusted-domain.com"
}
```

#### التحقق من صحة الإعدادات:
```http
GET /security/cors/validate
```

### IP Management APIs

#### إدارة القائمة البيضاء:
```http
GET /security/ip/whitelist
POST /security/ip/whitelist
DELETE /security/ip/whitelist/:ip
```

#### إدارة القائمة السوداء:
```http
GET /security/ip/blacklist
POST /security/ip/blacklist
DELETE /security/ip/blacklist/:ip
```

## مراقبة الأمان

### مؤشرات الأمان الرئيسية:

#### مؤشرات وقائية:
- عدد محاولات الدخول الفاشلة
- عدد الطلبات المرفوضة (Rate Limiting)
- عدد الهجمات المكتشفة
- تغطية IP whitelist/blacklist

#### مؤشرات استجابية:
- وقت استجابة نظام الكشف
- دقة كشف التهديدات (True Positive Rate)
- معدل الإيجابيات الخاطئة (False Positive Rate)

### السجلات الأمنية:

#### مستويات التسجيل:
- **DEBUG**: تفاصيل فنية للتطوير
- **INFO**: أحداث نظام عادية
- **WARN**: تحذيرات أمنية غير حرجة
- **ERROR**: أخطاء أمنية حرجة
- **FATAL**: حوادث أمنية خطيرة

#### أنواع السجلات:
- **Authentication Events**: عمليات تسجيل الدخول
- **Authorization Events**: عمليات التحقق من الصلاحيات
- **Security Incidents**: حوادث أمنية
- **Threat Detections**: كشف التهديدات
- **Rate Limit Events**: تجاوز حدود الطلبات

## استكشاف الأخطاء

### مشاكل شائعة وحلولها:

#### Rate Limiting Issues:
```javascript
// Check if Redis is connected
const stats = await rateLimitingService.getStatistics();
if (!stats.redisConnected) {
  console.error('Redis connection failed');
}

// Reset rate limit for testing
await rateLimitingService.resetLimit('api', 'test_ip');
```

#### CORS Issues:
```javascript
// Validate CORS configuration
const validation = corsService.validateSetup();
if (!validation.valid) {
  console.error('CORS validation failed:', validation.issues);
}

// Add development origins
if (process.env.NODE_ENV === 'development') {
  corsService.addAllowedOrigin('http://localhost:3001');
}
```

#### IP Blocking Issues:
```javascript
// Check IP status
const isWhitelisted = ipWhitelistGuard['isWhitelisted']('192.168.1.1');
const isBlacklisted = ipWhitelistGuard['isBlacklisted']('192.168.1.1');

// Temporarily allow IP for testing
ipWhitelistGuard.addToWhitelist('192.168.1.1');
```

## الأمان في التطوير مقابل الإنتاج

### بيئة التطوير:
- CORS أكثر مرونة
- تسجيل مفصل للأخطاء
- حدود rate limiting أعلى
- إخفاء أقل للبيانات الحساسة

### بيئة الإنتاج:
- CORS مقيد بشدة
- تسجيل مشفر للأخطاء
- حدود rate limiting صارمة
- إخفاء كامل للبيانات الحساسة

## التكامل مع أنظمة أخرى

### تكامل مع Analytics:
```typescript
// Log security events to analytics
analyticsService.logSecurityEvent({
  type: 'threat_detected',
  severity: 'high',
  details: threatDetails,
  ip: clientIP,
  timestamp: new Date(),
});
```

### تكامل مع Notifications:
```typescript
// Send security alerts
notificationService.sendAlert({
  type: 'security_incident',
  priority: 'high',
  message: 'Multiple failed login attempts detected',
  recipients: ['security@company.com'],
});
```

## الصيانة والتحديثات

### مهام الصيانة الأسبوعية:
- مراجعة السجلات الأمنية
- تحديث قواعد كشف التهديدات
- التحقق من صحة شهادات SSL
- اختبار نسخ احتياطية الأمان

### مهام الصيانة الشهرية:
- تحديث البرمجيات والمكتبات
- مراجعة وتحديث السياسات الأمنية
- تدريب الفريق على التحديثات الأمنية
- اختبار خطة الاستجابة للحوادث

### التحديثات الأمنية:
- متابعة تحديثات OWASP
- تطبيق patches الأمنية
- تحديث خوارزميات التشفير
- مراجعة وتحسين قواعد الكشف

## الامتثال والمعايير

### معايير الأمان المطبقة:
- **OWASP Top 10**: حماية من أكبر 10 ثغرات أمنية
- **GDPR**: حماية البيانات الأوروبية
- **CCPA**: خصوصية كاليفورنيا
- **ISO 27001**: إدارة أمن المعلومات

### التدقيق الأمني:
- **Automated Scanning**: فحص تلقائي للثغرات
- **Manual Penetration Testing**: اختبار الاختراق اليدوي
- **Code Review**: مراجعة الكود الأمنية
- **Compliance Audits**: تدقيق الامتثال

## الخلاصة

نظام الأمان هذا يوفر حماية شاملة متعددة الطبقات تغطي جميع جوانب الأمان الرقمي للمنصة. النظام مصمم ليكون قابلاً للتوسع والتكيف مع المتطلبات الأمنية المتغيرة.

### نقاط القوة:
- ✅ طبقات حماية متعددة
- ✅ مراقبة في الوقت الفعلي
- ✅ استجابة سريعة للتهديدات
- ✅ امتثال للمعايير العالمية
- ✅ سهولة الصيانة والتحديث

### التوسع المستقبلي:
- 🔄 إضافة Web Application Firewall
- 🔄 تطبيق DDoS Protection
- 🔄 دمج SIEM system
- 🔄 إضافة AI للكشف عن التهديدات

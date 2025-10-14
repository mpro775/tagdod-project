# 📋 سجل القرارات المعمارية (Architecture Decision Records)

## ما هو ADR؟
**ADR (Architecture Decision Record)** هو وثيقة تسجل قراراً معمارياً مهماً، تتضمن:
- السياق (لماذا نحتاج هذا القرار؟)
- القرار (ماذا قررنا؟)
- البدائل المدروسة
- العواقب (الإيجابية والسلبية)

---

## 📚 قائمة القرارات المعمارية

### [ADR-001] استخدام NestJS كإطار عمل للـ Backend
**الحالة:** ✅ مقبول  
**التاريخ:** 2025-10-01

#### السياق
نحتاج إلى اختيار إطار عمل لبناء REST API للمنصة.

#### القرار
استخدام **NestJS** مع TypeScript.

#### البدائل المدروسة
1. **Express.js** - بسيط لكن يحتاج لبناء الكثير من الأشياء من الصفر
2. **Fastify** - سريع لكن نظامه البيئي أصغر
3. **NestJS** - مُنظم، enterprise-ready، dependency injection
4. **AdonisJS** - جيد لكن مجتمعه أصغر

#### الأسباب
- ✅ **Architecture**: Modular architecture مدمجة
- ✅ **TypeScript**: دعم كامل لـ TypeScript
- ✅ **DI Container**: Dependency Injection مدمج
- ✅ **Decorators**: Clean code with decorators
- ✅ **Testing**: أدوات اختبار مدمجة
- ✅ **Documentation**: Swagger integration سهل
- ✅ **Scalability**: سهل التحويل إلى Microservices
- ✅ **Community**: مجتمع كبير ونشط

#### العواقب
- ✅ **إيجابي**: كود منظم وقابل للصيانة
- ✅ **إيجابي**: سهل لمطوري Angular (مفاهيم مشابهة)
- ⚠️ **سلبي**: Learning curve أعلى من Express
- ⚠️ **سلبي**: Overhead أكبر قليلاً

---

### [ADR-002] استخدام MongoDB كقاعدة بيانات رئيسية
**الحالة:** ✅ مقبول  
**التاريخ:** 2025-10-01

#### السياق
نحتاج لاختيار قاعدة بيانات للمنصة.

#### القرار
استخدام **MongoDB** (NoSQL).

#### البدائل المدروسة
1. **PostgreSQL** - Relational, قوية لكن أقل مرونة
2. **MySQL** - Relational, شائعة
3. **MongoDB** - NoSQL, مرنة، scalable
4. **DynamoDB** - AWS-specific, vendor lock-in

#### الأسباب
- ✅ **Flexibility**: Schema مرن (good للتطوير السريع)
- ✅ **Scalability**: Sharding مدمج
- ✅ **JSON**: يعمل بشكل طبيعي مع Node.js
- ✅ **Aggregation**: Pipeline قوي للتحليلات
- ✅ **Indexing**: Indexes متنوعة (text, geo, compound)
- ✅ **Atlas**: MongoDB Atlas سهل النشر

#### العواقب
- ✅ **إيجابي**: تطوير أسرع
- ✅ **إيجابي**: سهل التوسع horizontally
- ⚠️ **سلبي**: لا يوجد joins حقيقية (نحتاج denormalization)
- ⚠️ **سلبي**: Transactions محدودة (لكن موجودة)

---

### [ADR-003] استخدام JWT للمصادقة
**الحالة:** ✅ مقبول  
**التاريخ:** 2025-10-01

#### السياق
نحتاج لآلية مصادقة للـ API (Web + Mobile).

#### القرار
استخدام **JWT (JSON Web Tokens)** مع **Refresh Tokens**.

#### البدائل المدروسة
1. **Session-based** - Server-side sessions
2. **OAuth 2.0** - معقد للـ use case البسيط
3. **JWT** - Stateless, scalable

#### الأسباب
- ✅ **Stateless**: لا نحتاج لتخزين sessions في server
- ✅ **Scalability**: يعمل مع multiple servers
- ✅ **Mobile-friendly**: مناسب لتطبيقات الهاتف
- ✅ **Standard**: معيار صناعي
- ✅ **Payload**: يمكن تضمين بيانات إضافية

#### التصميم
```
- Access Token: 15 دقيقة (في الـ memory)
- Refresh Token: 7 أيام (في Redis)
- تدوير Refresh Tokens عند الاستخدام
```

#### العواقب
- ✅ **إيجابي**: Scalable وسريع
- ✅ **إيجابي**: يعمل مع Load Balancers
- ⚠️ **سلبي**: لا يمكن إلغاء Token قبل انتهائه (نستخدم Refresh Token للتحكم)
- ⚠️ **سلبي**: حجم الـ header أكبر

---

### [ADR-004] استخدام Redis للـ Caching و Rate Limiting
**الحالة:** ✅ مقبول  
**التاريخ:** 2025-10-01

#### السياق
نحتاج لـ caching layer و rate limiting.

#### القرار
استخدام **Redis**.

#### البدائل المدروسة
1. **In-Memory Cache** - سريع لكن لا يُشارك بين instances
2. **Memcached** - جيد لكن ميزات أقل
3. **Redis** - Full-featured, يدعم data structures متنوعة

#### الأسباب
- ✅ **Performance**: سريع جداً (in-memory)
- ✅ **Data Structures**: Strings, Lists, Sets, Sorted Sets, Hashes
- ✅ **TTL**: Expiration مدمج
- ✅ **Pub/Sub**: يمكن استخدامه للـ real-time
- ✅ **Atomic Operations**: INCR, DECR للـ rate limiting
- ✅ **Persistence**: يمكن حفظ البيانات على disk

#### الاستخدامات
- Caching (Products, Categories, User profiles)
- Sessions (Refresh Tokens)
- Rate Limiting (Counters)
- Queue (Background jobs - مستقبلاً)

#### العواقب
- ✅ **إيجابي**: تحسين كبير في الأداء
- ✅ **إيجابي**: تقليل الحمل على MongoDB
- ⚠️ **سلبي**: تكلفة إضافية (Redis instance)
- ⚠️ **سلبي**: نقطة فشل إضافية (نحتاج monitoring)

---

### [ADR-005] استخدام OTP عبر SMS لتسجيل الدخول
**الحالة:** ✅ مقبول  
**التاريخ:** 2025-10-01

#### السياق
نحتاج لآلية تسجيل دخول آمنة وسهلة للعملاء.

#### القرار
استخدام **OTP (One-Time Password)** عبر SMS.

#### البدائل المدروسة
1. **Username/Password** - تقليدي لكن المستخدمون ينسون
2. **Social Login** - جيد لكن privacy concerns
3. **Email OTP** - بعض المستخدمين لا يستخدمون Email
4. **SMS OTP** - شائع في السعودية

#### الأسباب
- ✅ **User-friendly**: لا حاجة لتذكر password
- ✅ **Security**: OTP يُستخدم مرة واحدة فقط
- ✅ **Phone Verification**: نتحقق من رقم الهاتف مباشرة
- ✅ **Local Preference**: شائع في المنطقة

#### التصميم
```
- OTP: 6 أرقام
- مدة الصلاحية: 5 دقائق
- محاولات محدودة: 3 محاولات خاطئة
- Rate Limiting: 3 طلبات في 5 دقائق
```

#### العواقب
- ✅ **إيجابي**: تجربة مستخدم أفضل
- ✅ **إيجابي**: أمان جيد
- ⚠️ **سلبي**: تكلفة SMS
- ⚠️ **سلبي**: يعتمد على خدمة SMS خارجية

---

### [ADR-006] استخدام React مع TypeScript للـ Admin Panel
**الحالة:** ✅ مقبول  
**التاريخ:** 2025-10-01

#### السياق
نحتاج لبناء Admin Panel.

#### القرار
استخدام **React** مع **TypeScript** و **Material-UI**.

#### البدائل المدروسة
1. **Vue.js** - جيد لكن نظام TypeScript أقل نضجاً
2. **Angular** - Enterprise-ready لكن أثقل
3. **Svelte** - سريع لكن نظامه البيئي صغير
4. **React** - الأكثر شعبية، نظام بيئي ضخم

#### الأسباب
- ✅ **Ecosystem**: أكبر نظام بيئي
- ✅ **TypeScript**: دعم ممتاز
- ✅ **Material-UI**: مكونات جاهزة وجميلة
- ✅ **Community**: مجتمع ضخم
- ✅ **Talent Pool**: سهل إيجاد مطورين
- ✅ **State Management**: خيارات متعددة (Zustand, Redux)

#### العواقب
- ✅ **إيجابي**: تطوير سريع
- ✅ **إيجابي**: مكونات قابلة لإعادة الاستخدام
- ⚠️ **سلبي**: Bundle size أكبر قليلاً

---

### [ADR-007] استخدام Modular Monolith بدلاً من Microservices
**الحالة:** ✅ مقبول  
**التاريخ:** 2025-10-01

#### السياق
نحتاج لتحديد معمارية النظام.

#### القرار
البدء بـ **Modular Monolith** قابل للتحويل إلى Microservices.

#### البدائل المدروسة
1. **Monolith** - بسيط لكن صعب التوسع
2. **Microservices** - scalable لكن معقد جداً للبداية
3. **Modular Monolith** - توازن بين البساطة والقابلية للتوسع

#### الأسباب
- ✅ **Simplicity**: نشر أسهل (single deployment)
- ✅ **Development Speed**: تطوير أسرع في البداية
- ✅ **Modularity**: فصل واضح بين الوحدات
- ✅ **Future-proof**: يمكن التحويل إلى Microservices لاحقاً
- ✅ **Lower Complexity**: لا نحتاج لـ service mesh, API gateway, إلخ
- ✅ **Cost**: تكلفة infrastructure أقل

#### المبادئ
```
1. كل module مستقل (controllers, services, schemas)
2. لا يوجد dependencies دائرية بين modules
3. Communication عبر well-defined interfaces
4. Shared layer للمشتركات فقط
```

#### متى نحول إلى Microservices؟
- عندما يصل المستخدمون لـ 100,000+
- عندما تحتاج وحدات معينة لـ scaling مختلف
- عندما يكبر الفريق (10+ مطورين)

#### العواقب
- ✅ **إيجابي**: بداية سريعة
- ✅ **إيجابي**: نشر أسهل
- ✅ **إيجابي**: debugging أسهل
- ⚠️ **سلبي**: صعوبة scale وحدات معينة فقط
- ⚠️ **سلبي**: نشر واحد للكل (لكن مع CI/CD يصير سريع)

---

### [ADR-008] استخدام S3/Cloudinary لتخزين الصور
**الحالة:** ✅ مقبول  
**التاريخ:** 2025-10-01

#### السياق
نحتاج لتخزين صور المنتجات والمستخدمين.

#### القرار
استخدام **S3** أو **Cloudinary** (قابل للتبديل).

#### البدائل المدروسة
1. **Local Storage** - مشاكل مع scaling
2. **Database** - بطيء ومكلف
3. **S3** - scalable, reliable, رخيص
4. **Cloudinary** - S3 + معالجة الصور

#### الأسباب
- ✅ **Scalability**: يتعامل مع ملايين الصور
- ✅ **CDN**: توصيل سريع عالمياً
- ✅ **Cost-effective**: تكلفة منخفضة
- ✅ **Reliability**: SLA عالية
- ✅ **Image Processing**: (Cloudinary) resize, compress, format

#### التصميم
```
- استخدام Ports & Adapters pattern
- يمكن التبديل بين S3 و Cloudinary بسهولة
- Signed URLs للأمان
```

#### العواقب
- ✅ **إيجابي**: لا حمل على servers
- ✅ **إيجابي**: سريع ومتوفر عالمياً
- ⚠️ **سلبي**: تكلفة شهرية (لكن منخفضة)
- ⚠️ **سلبي**: vendor dependency

---

### [ADR-009] استخدام Rate Limiting للحماية من DDoS
**الحالة:** ✅ مقبول  
**التاريخ:** 2025-10-01

#### السياق
نحتاج لحماية API من abuse و DDoS attacks.

#### القرار
تطبيق **Rate Limiting** باستخدام Redis.

#### الاستراتيجية
```typescript
// قواعد مختلفة حسب الـ endpoint
{
  '/api': 100 requests/minute,
  '/auth/send-otp': 3 requests/5 minutes,
  '/auth/verify-otp': 5 requests/5 minutes,
  '/auth/login': 5 requests/15 minutes,
}
```

#### الأسباب
- ✅ **Security**: يمنع brute force attacks
- ✅ **Availability**: يمنع استهلاك الموارد
- ✅ **Fair Use**: يضمن تجربة جيدة للجميع

#### التطبيق
- استخدام `rate-limiter-flexible` library
- تخزين counters في Redis
- Headers للعميل: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

### [ADR-010] استخدام i18n لدعم اللغات المتعددة
**الحالة:** ✅ مقبول  
**التاريخ:** 2025-10-01

#### السياق
نحتاج لدعم العربية والإنجليزية.

#### القرار
تخزين المحتوى متعدد اللغات في قاعدة البيانات.

#### التصميم
```typescript
// في Database
{
  name: { ar: "لوح شمسي", en: "Solar Panel" },
  description: { ar: "...", en: "..." }
}

// في Frontend
i18next للترجمات
RTL Support في CSS
```

#### الأسباب
- ✅ **Flexibility**: سهل إضافة لغات جديدة
- ✅ **SEO**: محتوى بلغات متعددة
- ✅ **User Experience**: تجربة أفضل

#### العواقب
- ✅ **إيجابي**: دعم كامل للغات
- ⚠️ **سلبي**: حجم البيانات أكبر قليلاً

---

## 📝 كيفية إضافة ADR جديد

### Template

```markdown
### [ADR-XXX] عنوان القرار
**الحالة:** 🔄 مقترح / ✅ مقبول / ❌ مرفوض / ⚠️ محل نقاش  
**التاريخ:** YYYY-MM-DD

#### السياق
لماذا نحتاج هذا القرار؟ ما هي المشكلة؟

#### القرار
ماذا قررنا؟

#### البدائل المدروسة
1. خيار 1 - ...
2. خيار 2 - ...
3. خيار 3 - ...

#### الأسباب
- ✅ سبب 1
- ✅ سبب 2
- ✅ سبب 3

#### العواقب
- ✅ **إيجابي**: ...
- ✅ **إيجابي**: ...
- ⚠️ **سلبي**: ...
- ⚠️ **سلبي**: ...
```

---

## 📊 إحصائيات القرارات

- **المجموع:** 10 قرارات
- **مقبول:** 10
- **مقترح:** 0
- **مرفوض:** 0
- **محل نقاش:** 0

---

**آخر تحديث:** 14 أكتوبر 2025


# نظام الرد الموحد والأخطاء في مشروع Tagadodo

## نظرة عامة

يستخدم مشروع Tagadodo نظاماً موحداً للردود والأخطاء يضمن تجربة متسقة عبر جميع APIs. النظام مبني على NestJS ويستخدم interceptors و filters لمعالجة الردود والاستثناءات.

## نظام الرد الموحد (Unified Response System)

### هيكل الردود الناجحة

جميع الردود الناجحة تغلف في هيكل موحد باستخدام `ResponseEnvelopeInterceptor`:

```typescript
{
  success: true,
  data: <البيانات_الأصلية>,
  meta: <المعلومات_الإضافية_إن_وجودت>,
  requestId: <معرف_الطلب>
}
```

### مثال على رد ناجح

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "phone": "+966501234567",
      "firstName": "أحمد",
      "lastName": "محمد"
    },
    "capabilities": {
      "customer_capable": true,
      "engineer_capable": false
    }
  },
  "requestId": "req-123456789"
}
```

### مثال على رد مع meta (بيانات إضافية)

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "منتج تجريبي",
      "price": 100
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  },
  "requestId": "req-123456789"
}
```

## نظام الأخطاء الموحد

### هيكل الرد عند الخطأ

جميع الأخطاء تغلف في هيكل موحد باستخدام `GlobalExceptionFilter`:

```typescript
{
  success: false,
  error: {
    code: <رمز_الخطأ>,
    message: <رسالة_للمستخدم>,
    details: <تفاصيل_إضافية>,
    fieldErrors: <أخطاء_الحقول_إن_وجودت>
  },
  requestId: <معرف_الطلب>
}
```

### أمثلة على ردود الأخطاء

#### خطأ في رمز OTP
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_OTP",
    "message": "رمز التحقق غير صالح",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-123456789"
}
```

#### خطأ في المستخدم غير موجود
```json
{
  "success": false,
  "error": {
    "code": "AUTH_USER_NOT_FOUND",
    "message": "المستخدم غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-123456789"
}
```

#### خطأ في التحقق من صحة البيانات
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "خطأ في البيانات المدخلة",
    "details": null,
    "fieldErrors": [
      {
        "field": "phone",
        "message": "رقم الهاتف مطلوب"
      },
      {
        "field": "password",
        "message": "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
      }
    ]
  },
  "requestId": "req-123456789"
}
```

## المكونات الرئيسية للنظام

### 1. ResponseEnvelopeInterceptor

يقع في: `src/shared/interceptors/response-envelope.interceptor.ts`

**الوظيفة:**
- يغلف جميع الردود الناجحة في هيكل موحد
- يستخرج البيانات والمعلومات الإضافية من الرد الأصلي
- يضيف معرف الطلب

```typescript
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const requestId = req.id ?? null;
    return next.handle().pipe(
      map((original) => {
        const hasMeta = original && typeof original === 'object' && 'meta' in original;
        const data = hasMeta ? original.data : original;
        const meta = hasMeta ? original.meta : null;
        return { success: true, data, meta, requestId };
      }),
    );
  }
}
```

### 2. AppException Class

يقع في: `src/shared/exceptions/app.exception.ts`

**الوظيفة:**
- كلاس استثناء مخصص يرث من HttpException
- يدعم رموز الأخطاء والرسائل العربية
- يدعم التفاصيل الإضافية وأخطاء الحقول

```typescript
export class AppException extends HttpException {
  constructor(
    public code: string = 'UNEXPECTED_ERROR',
    public userMessage: string = 'حدث خطأ غير متوقع',
    public details: unknown = null,
    status: number = HttpStatus.BAD_REQUEST,
    public fieldErrors?: Array<{ field: string; message: string }> | null,
  ) {
    super(userMessage, status);
  }
}
```

### 3. GlobalExceptionFilter

يقع في: `src/shared/filters/global-exception.filter.ts`

**الوظيفة:**
- يلتقط جميع الاستثناءات غير المعالجة
- يحولها إلى هيكل الرد الموحد للأخطاء
- يضمن أن جميع الأخطاء ترجع بنفس التنسيق

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exc = exception as AppException;

    res.status(status).json({
      success: false,
      error: {
        code: exc.code ?? 'UNEXPECTED_ERROR',
        message: exc.userMessage ?? exc.message ?? 'حدث خطأ غير متوقع',
        details: exc.details ?? null,
        fieldErrors: exc.fieldErrors ?? null,
      },
      requestId: req.id ?? null,
    });
  }
}
```

## رموز الأخطاء المستخدمة

### أخطاء المصادقة (AUTH_*)
- `AUTH_INVALID_OTP`: رمز التحقق غير صالح
- `AUTH_USER_NOT_FOUND`: المستخدم غير موجود

### أخطاء القدرات (CAPS_*)
- `CAPS_NOT_FOUND`: سجل القدرات غير موجود

### أخطاء عامة
- `UNEXPECTED_ERROR`: خطأ غير متوقع (افتراضي)
- `VALIDATION_ERROR`: خطأ في التحقق من صحة البيانات

## كيفية استخدام النظام

### في Controllers

```typescript
// مثال من AuthController
@Post('verify-otp')
async verifyOtp(@Body() dto: VerifyOtpDto) {
  const ok = await this.otp.verifyOtp(dto.phone, dto.code, 'register');
  if (!ok) throw new AppException('AUTH_INVALID_OTP', 'رمز التحقق غير صالح', null, 401);

  // ... باقي الكود
  return { tokens: { access, refresh }, me: { id: user._id, phone: user.phone } };
}
```

### في Services

```typescript
// مثال من CatalogService
async createCategory(parentId: string | null, name: string, isActive = true) {
  // ...
  if (parentId) {
    const parent = await this.categoryModel.findById(parentId).lean();
    if (!parent) throw new Error('Parent not found'); // سيتم التقاطه بواسطة GlobalExceptionFilter
  }
  // ...
}
```

## التكوين في main.ts

```typescript
// تسجيل النظام في التطبيق
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
app.useGlobalFilters(new GlobalExceptionFilter());
app.useGlobalInterceptors(
  new ResponseEnvelopeInterceptor(),
  securityLoggingInterceptor,
);
```

## مميزات النظام

✅ **تجربة موحدة**: جميع APIs ترجع نفس هيكل الردود والأخطاء  
✅ **دعم اللغة العربية**: جميع رسائل الأخطاء بالعربية  
✅ **رموز أخطاء واضحة**: سهلة التتبع والمعالجة من جانب العميل  
✅ **معرف الطلب**: لتتبع الطلبات في السجلات  
✅ **أخطاء الحقول**: دعم لأخطاء التحقق من صحة البيانات المفصلة  
✅ **معالجة شاملة**: يغطي جميع الاستثناءات (حتى غير المتوقعة)  
✅ **أمان**: لا يكشف تفاصيل فنية للمستخدم  

## نصائح للتطوير

1. **استخدم AppException دائماً** للأخطاء المخصصة
2. **استخدم رموز أخطاء واضحة** تتبع نمط `MODULE_ERROR_TYPE`
3. **اكتب الرسائل بالعربية** للمستخدمين
4. **استخدم fieldErrors** لأخطاء التحقق من صحة البيانات
5. **لا تكشف معلومات حساسة** في الرسائل أو التفاصيل

هذا النظام يضمن تجربة موحدة ومتسقة لجميع APIs في مشروع Tagadodo! 🚀

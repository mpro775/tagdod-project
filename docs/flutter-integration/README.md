# 📱 دليل الربط مع تطبيق Flutter

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: أكتوبر 2025

مرحباً بك في دليل الربط الشامل للتطبيق. هذا الدليل يحتوي على جميع المعلومات التي تحتاجها للتكامل مع الـ Backend API.

---

## 📋 جدول المحتويات

### نظرة عامة

- [**نظرة عامة على تكامل Flutter**](./نظرة_عامة_Flutter.md) – ملخص سريع لفريق Flutter

### الأساسيات

1. [**هيكل الاستجابة الموحدة والأخطاء**](./01-response-structure.md) - **ابدأ من هنا**
   - شكل الاستجابة الناجحة
   - شكل الاستجابة عند حدوث خطأ
   - أكواد الأخطاء الشائعة
   - معالجة الأخطاء في Flutter

### الخدمات الرئيسية

2. [**خدمة المصادقة (Authentication)**](./02-auth-service.md)

   - تسجيل الدخول بواسطة OTP
   - إدارة الحساب
   - التوكنات (Access & Refresh)

3. [**خدمة المنتجات (Products)**](./03-products-service.md)

   - قائمة المنتجات
   - تفاصيل المنتج
   - المنتجات المميزة والجديدة
   - الفلاتر والترتيب

4. [**خدمة السلة (Cart)**](./04-cart-service.md)

   - إضافة منتجات للسلة
   - تحديث الكميات
   - حساب الإجمالي
   - دمج سلة الزائر مع المستخدم

5. [**خدمة الدفع والطلبات (Checkout & Orders)**](./05-checkout-service.md)

   - معاينة الطلب
   - تأكيد الطلب
   - إدارة الطلبات
   - حالات الطلب

6. [**خدمة التصنيفات (Categories)**](./06-categories-service.md)

   - قائمة التصنيفات
   - شجرة التصنيفات
   - التصنيفات المميزة

7. [**خدمة المفضلات (Favorites)**](./07-favorites-service.md)

   - إضافة وحذف المفضلات
   - قائمة المفضلات
   - مزامنة المفضلات

8. [**خدمة العناوين (Addresses)**](./08-addresses-service.md)
   - إدارة عناوين التوصيل
   - تعيين العنوان الافتراضي
   - التحقق من صحة العناوين

### الخدمات المساعدة

9. [**خدمة البنرات (Banners)**](./09-banners-service.md)

   - عرض البنرات
   - تتبع المشاهدات والنقرات

10. [**خدمة العلامات التجارية (Brands)**](./10-brands-service.md)

    - قائمة البراندات
    - تفاصيل البراند

11. [**خدمة البحث (Search)**](./11-search-service.md)

    - البحث الشامل
    - البحث المتقدم
    - الاقتراحات التلقائية

12. [**خدمة الكوبونات (Coupons)**](./12-coupons-service.md)

    - التحقق من الكوبونات
    - أنواع الخصومات المختلفة

13. [**خدمة الإشعارات (Notifications)**](./13-notifications-service.md)

    - قائمة الإشعارات
    - تسجيل الأجهزة للإشعارات
    - إدارة الإشعارات

14. [**خدمة الطلبات الهندسية (Services)**](./14-services-service.md)

    - إنشاء طلب خدمة (للعملاء)
    - الطلبات القريبة (للمهندسين)
    - إدارة العروض والتقييم

15. [**خدمة السمات (Attributes)**](./15-attributes-service.md)

    - قائمة السمات النشطة
    - السمات القابلة للفلترة
    - تفاصيل السمة ومجموعاتها

16. [**خدمة الدعم (Support)**](./16-support-service.md)

    - إنشاء تذكرة دعم
    - إدارة الرسائل
    - تتبع حالة التذكرة وتقييمها

17. [**خدمة بروفايل المهندس (Engineer Profile)**](./18-engineer-profile-service.md)

    - إدارة بروفايل المهندس
    - التقييمات والإحصائيات
    - الرصيد والعمولات

18. [**WebSocket - الاتصال الفوري**](./websocket.md)
    - إعدادات WebSocket
    - خدمة الإشعارات الفورية
    - خدمة رسائل الدعم الفني
    - حل مشكلة المنفذ `:0`

### ميزات إضافية

19. [**خدمة أدلة التركيب (Installation Guides)**](./19-installation-guides-service.md)

    - قائمة أدلة التركيب مع باجنيشن
    - البحث والفلترة بالتاغ
    - صور وفيديوهات متعددة
    - المنتجات المرتبطة

- [**التحكم بإصدار التطبيق**](./APP_VERSION_CONTROL_FOR_FLUTTER.md) - سياسة النسخ، وضع الصيانة، التحديث الإجباري
- [**التقييد الجغرافي (اليمن فقط)**](./YEMEN_REGION_RESTRICTION_FOR_FLUTTER.md) - التعامل مع تقييد الوصول حسب الدولة

---

## 🌐 معلومات عامة

### Base URL

```
http://localhost:3000
```

> **ملاحظة:** استبدل هذا الرابط بالرابط الفعلي للـ Production عند النشر

### الهيدرات (Headers) المطلوبة

#### للطلبات العامة (Public):

```dart
{
  'Content-Type': 'application/json',
}
```

#### للطلبات المحمية (Protected):

```dart
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {access_token}',
}
```

---

## 🔑 المصادقة (Authentication)

API يستخدم **JWT (JSON Web Tokens)** للمصادقة:

- **Access Token**: صالح لمدة قصيرة (15 دقيقة)
- **Refresh Token**: صالح لمدة طويلة (7 أيام)

عند انتهاء صلاحية Access Token، استخدم Refresh Token للحصول على توكن جديد.

---

## 📦 هيكل الاستجابة الموحدة

### الاستجابة الناجحة

```json
{
  "success": true,
  "data": {
    /* البيانات */
  },
  "meta": {
    /* معلومات إضافية مثل pagination */
  },
  "requestId": "uuid-string"
}
```

### الاستجابة عند الخطأ

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "رسالة الخطأ بالعربية",
    "details": null,
    "fieldErrors": [
      {
        "field": "phone",
        "message": "رقم الهاتف غير صحيح"
      }
    ]
  },
  "requestId": "uuid-string"
}
```

> **للمزيد من التفاصيل، راجع:** [هيكل الاستجابة الموحدة](./01-response-structure.md)

---

## 🚀 البدء السريع

### 1. قم بإنشاء HTTP Client في Flutter:

```dart
import 'package:dio/dio.dart';

class ApiClient {
  final Dio _dio;
  final String baseUrl = 'http://localhost:3000';

  ApiClient() : _dio = Dio() {
    _dio.options.baseUrl = baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 30);
    _dio.options.receiveTimeout = const Duration(seconds: 30);

    // إضافة Interceptor للتوكن
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await getAccessToken(); // من SharedPreferences
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          // معالجة انتهاء صلاحية التوكن
          if (error.response?.statusCode == 401) {
            // قم بتحديث التوكن
            final newToken = await refreshToken();
            if (newToken != null) {
              // أعد المحاولة
              error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
              return handler.resolve(await _dio.fetch(error.requestOptions));
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  Dio get dio => _dio;
}
```

### 2. قم بإنشاء Models للاستجابة:

```dart
class ApiResponse<T> {
  final bool success;
  final T? data;
  final ApiError? error;
  final Map<String, dynamic>? meta;
  final String? requestId;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    this.meta,
    this.requestId,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse(
      success: json['success'] ?? false,
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : json['data'],
      error: json['error'] != null
          ? ApiError.fromJson(json['error'])
          : null,
      meta: json['meta'],
      requestId: json['requestId'],
    );
  }
}

class ApiError {
  final String code;
  final String message;
  final dynamic details;
  final List<FieldError>? fieldErrors;

  ApiError({
    required this.code,
    required this.message,
    this.details,
    this.fieldErrors,
  });

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      code: json['code'] ?? 'UNKNOWN_ERROR',
      message: json['message'] ?? 'حدث خطأ غير متوقع',
      details: json['details'],
      fieldErrors: json['fieldErrors'] != null
          ? (json['fieldErrors'] as List)
              .map((e) => FieldError.fromJson(e))
              .toList()
          : null,
    );
  }
}

class FieldError {
  final String field;
  final String message;

  FieldError({required this.field, required this.message});

  factory FieldError.fromJson(Map<String, dynamic> json) {
    return FieldError(
      field: json['field'] ?? '',
      message: json['message'] ?? '',
    );
  }
}
```

### 3. استخدام API:

```dart
final apiClient = ApiClient();

// مثال: تسجيل دخول
Future<void> login() async {
  try {
    final response = await apiClient.dio.post(
      '/auth/send-otp',
      data: {
        'phone': '777123456',
        'context': 'register',
      },
    );

    final apiResponse = ApiResponse.fromJson(
      response.data,
      (data) => data,
    );

    if (apiResponse.success) {
      print('تم إرسال الكود: ${apiResponse.data}');
    } else {
      print('خطأ: ${apiResponse.error?.message}');
    }
  } on DioException catch (e) {
    print('خطأ في الاتصال: ${e.message}');
  }
}
```

---

## 📚 الخطوات التالية

1. **ابدأ بقراءة** [هيكل الاستجابة الموحدة](./01-response-structure.md)
2. **قم بإعداد** [خدمة المصادقة](./02-auth-service.md)
3. **تصفح** بقية الخدمات حسب احتياجك

---

## 💡 نصائح مهمة

### ✅ أفضل الممارسات

1. **احفظ التوكن بشكل آمن** في `SharedPreferences` أو `FlutterSecureStorage`
2. **استخدم Interceptors** للتعامل مع التوكنات تلقائياً
3. **تعامل مع الأخطاء** بشكل مناسب وأظهر رسائل واضحة للمستخدم
4. **استخدم Models** لكل استجابة بدلاً من التعامل مع JSON مباشرة
5. **فعّل Caching** للطلبات التي لا تتغير كثيراً (مثل Categories و Brands)

### ⚠️ تحذيرات

1. **لا تخزن** البيانات الحساسة (مثل كلمات المرور) على الجهاز
2. **استخدم HTTPS** في الـ Production
3. **تحقق دائماً** من `success` في الاستجابة قبل استخدام البيانات
4. **تعامل مع** حالات انقطاع الإنترنت

---

## 🆘 الدعم

في حالة وجود أي استفسارات أو مشاكل:

1. راجع الملف المناسب للخدمة
2. تحقق من أكواد الأخطاء في [هيكل الاستجابة](./01-response-structure.md)
3. تواصل مع فريق الـ Backend

---

## 📊 إحصائيات التوثيق

**عدد الخدمات الموثقة:** 19 خدمة  
**الحالة:** ✅ جميع الخدمات متحققة ومطابقة 100%  
**آخر تحديث:** مايو 2026  
**النسخة:** 2.2.0

### الخدمات المتحققة:

- ✅ Response Structure - هيكل الاستجابة الموحدة
- ✅ Auth - المصادقة والتوثيق
- ✅ Products - المنتجات والمتغيرات
- ✅ Cart - السلة وإدارة العناصر
- ✅ Checkout & Orders - الدفع والطلبات
- ✅ Categories - التصنيفات الهرمية
- ✅ Favorites - المفضلات والمزامنة
- ✅ Addresses - عناوين التوصيل
- ✅ Banners - البنرات التسويقية
- ✅ Brands - العلامات التجارية
- ✅ Search - البحث المتقدم والاقتراحات
- ✅ Coupons - الكوبونات والخصومات
- ✅ Notifications - الإشعارات وFCM
- ✅ Services - طلبات الخدمات الهندسية
- ✅ Attributes - السمات والمجموعات
- ✅ Support - الدعم الفني والتذاكر
- ✅ Engineer Profile - بروفايل المهندس والتقييمات
- ✅ Installation Guides - أدلة التركيب (صور وفيديوهات متعددة + باجنيشن)
- ✅ WebSocket - الاتصال الفوري للإشعارات والرسائل

---

**آخر تحديث:** مايو 2026  
**النسخة:** 2.2.0

# التقييد الجغرافي (اليمن فقط) — دليل مطوّر Flutter

هذا الملف يشرح التعديلات والإضافات المطلوبة في تطبيق Flutter للتعامل مع **ميزة تقييد الوصول الجغرافي** في الـ Backend: عند تفعيل الإعداد من لوحة التحكم، يُسمح فقط للمستخدمين من اليمن بالوصول إلى التطبيق وواجهة الـ API.

---

## 1. نظرة عامة

### ما يحدث في الـ Backend

- يمكن للمشرف تفعيل إعداد **"تقيد الوصول بالمستخدمين من اليمن فقط"** من لوحة التحكم (إعدادات الأمان).
- عند التفعيل، يتحقق الـ Backend من عنوان IP لكل طلب (HTTP و WebSocket) باستخدام GeoIP.
- إذا كان المستخدم **خارج اليمن** ولم يكن IP في القائمة البيضاء → يتم رفض الطلب.
- **المسارات المستثناة** (لا يُطبق عليها التقييد): لوحة التحكم، تسجيل دخول الإداريين، الصحة، روابط المشاركة، إلخ.

### ما المطلوب في Flutter؟

1. **التعرف على خطأ التقييد الجغرافي** عند استلام استجابة 403 مع `reason: 'region_restricted'`.
2. **عرض شاشة مخصصة** بدلاً من رسالة خطأ عامة، توضّح أن الخدمة غير متاحة خارج اليمن.
3. **التعامل مع فشل اتصال WebSocket** إن كان المستخدم خارج اليمن.

---

## 2. شكل الاستجابة عند الرفض (HTTP)

### HTTP Status Code

`403 Forbidden`

### هيكل الاستجابة

```json
{
  "success": false,
  "error": {
    "code": "AUTH_116",
    "message": "ليس لديك صلاحية للوصول",
    "details": {
      "reason": "region_restricted",
      "ip": "203.0.113.45",
      "country": "US"
    },
    "fieldErrors": null
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-02-12T14:30:00.000Z",
  "path": "/api/v1/auth/send-otp"
}
```

### الخصائص المهمة

| الخاصية | الوصف |
|---------|-------|
| `error.code` | `AUTH_116` (أي خطأ 403 من المصادقة) |
| `error.details.reason` | **`region_restricted`** — المفتاح المهم للتعرّف على التقييد الجغرافي |
| `error.details.country` | رمز الدولة (ISO 3166-1 alpha-2) لعنوان IP المستخدم |
| `error.details.ip` | عنوان IP الذي تم رفضه (قد لا يُرسل في بيئة الإنتاج) |

> **ملاحظة:** كود الخطأ العام هو `AUTH_116` لأن التقييد يُصنّف ضمن Forbidden. يجب الاعتماد على `details.reason == 'region_restricted'` للتمييز عن باقي أخطاء 403.

---

## 3. التعديلات المطلوبة في Flutter

### 3.1 نموذج استجابة الخطأ (إن لم يكن موجوداً)

تأكد أن نموذج استجابة الخطأ يدعم الحقل `details`:

```dart
class ApiError {
  final bool success;
  final ApiErrorBody? error;
  final String? requestId;
  final String? timestamp;
  final String? path;

  ApiError({
    required this.success,
    this.error,
    this.requestId,
    this.timestamp,
    this.path,
  });

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      success: json['success'] ?? false,
      error: json['error'] != null ? ApiErrorBody.fromJson(json['error']) : null,
      requestId: json['requestId'],
      timestamp: json['timestamp'],
      path: json['path'],
    );
  }

  /// تحقق هل الخطأ بسبب التقييد الجغرافي
  bool get isRegionRestricted =>
      error?.details != null &&
      error!.details is Map &&
      (error!.details as Map)['reason'] == 'region_restricted';
}

class ApiErrorBody {
  final String code;
  final String message;
  final dynamic details;
  final List<dynamic>? fieldErrors;

  ApiErrorBody({
    required this.code,
    required this.message,
    this.details,
    this.fieldErrors,
  });

  factory ApiErrorBody.fromJson(Map<String, dynamic> json) {
    return ApiErrorBody(
      code: json['code'] ?? '',
      message: json['message'] ?? '',
      details: json['details'],
      fieldErrors: json['fieldErrors'] as List<dynamic>?,
    );
  }
}
```

### 3.2 معالجة الخطأ في Interceptor أو Dio

عند استلام خطأ 403، افحص `details.reason`:

```dart
// مثال باستخدام Dio
void _setupDioInterceptor() {
  dio.interceptors.add(
    InterceptorsWrapper(
      onError: (error, handler) async {
        if (error.response?.statusCode == 403) {
          final data = error.response?.data;
          if (data != null && data is Map) {
            final errorObj = data['error'];
            final details = errorObj is Map ? errorObj['details'] : null;
            final reason = details is Map ? details['reason'] : null;

            if (reason == 'region_restricted') {
              // إظهار شاشة التقييد الجغرافي بدلاً من معالجة الخطأ العادية
              _navigateToRegionRestrictedScreen();
              return handler.resolve(
                Response(requestOptions: error.requestOptions),
              );
            }
          }
        }
        return handler.next(error);
      },
    ),
  );
}
```

### 3.3 شاشة التقييد الجغرافي

أنشئ شاشة مخصصة تُعرض عند `region_restricted`:

```dart
// import 'package:flutter/services.dart' عند استخدام SystemNavigator.pop()
class RegionRestrictedScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.public_off, size: 80, color: Colors.grey),
              SizedBox(height: 24),
              Text(
                'الخدمة غير متاحة في منطقتك',
                style: Theme.of(context).textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 16),
              Text(
                'هذا التطبيق متاح فقط للمستخدمين من اليمن. '
                'يُرجى التأكد من اتصالك أو التواصل مع الدعم الفني.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              SizedBox(height: 32),
              OutlinedButton(
                onPressed: () {
                  // إغلاق التطبيق أو إعادة المحاولة
                  SystemNavigator.pop();
                },
                child: Text('إغلاق التطبيق'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 3.4 تدفق التطبيق المقترح

1. **عند بدء التطبيق:** بعد استدعاء `app/config` (التحكم بالإصدار)، وأي طلب عام أولي:
   - إذا حصلت على 403 مع `region_restricted` → اعرض شاشة التقييد الجغرافي فوراً.
2. **خلال الاستخدام:** عند أي طلب API يرجع 403 مع `region_restricted`:
   - اعرض الشاشة المخصصة (أو اعرضها كـ overlay / dialog حسب تصميم التطبيق).
3. **عدم إعادة المحاولة تلقائياً:** لا تعيد الطلب عند هذا الخطأ؛ التقييد لن يتغير بتكرار الطلب.

---

## 4. WebSocket

### 4.1 سلوك الاتصال

عند تفعيل التقييد الجغرافي، اتصال WebSocket (مثل `/support` أو `/notifications`) قد يُرفض **قبل** المصادقة.

### 4.2 رسالة الرفض

عند الرفض، يُرمى `WsException` من السيرفر. مع Socket.IO، عادةً يُستقبل في حدث `connect_error` أو `error`:

```dart
socket.onConnectError((data) {
  // data قد يحتوي على رسالة الخطأ من السيرفر
  // افحص إن كان السبب region_restricted
});

socket.on('error', (data) {
  if (data is Map && data['reason'] == 'region_restricted') {
    _showRegionRestrictedMessage();
  }
});
```

> **ملاحظة:** الشكل الدقيق لرسالة الخطأ قد يختلف حسب إعدادات Socket.IO والـ adapter. جرّب في بيئة اختبار مع VPN خارج اليمن للتأكد من سلوك الاتصال.

### 4.3 التوصية

- عند فشل اتصال WebSocket بعد محاولات إعادة الاتصال، تحقق من أن الطلبات HTTP تعمل. إن كانت الطلبات HTTP ترجع `region_restricted`، فاحتمال أن فشل WebSocket ناتج عن التقييد الجغرافي مرتفع.
- يمكن عرض نفس شاشة التقييد الجغرافي عند فشل متكرر للـ WebSocket إذا تزامن مع 403 على HTTP.

---

## 5. ملخص التعديلات

| الملف / المكوّن | التعديل |
|------------------|---------|
| نموذج خطأ API | إضافة دعم `details` و helper مثل `isRegionRestricted` |
| Dio / HTTP Interceptor | عند 403، فحص `details.reason == 'region_restricted'` والتوجيه لشاشة مخصصة |
| شاشة جديدة | `RegionRestrictedScreen` أو ما يعادلها |
| تدفق بدء التشغيل | التعامل مع `region_restricted` قبل أو مع التحقق من إصدار التطبيق |
| WebSocket | معالجة `connect_error` / `error` والتنسيق مع رسالة التقييد الجغرافي إن وُجدت |

---

## 6. اختبار التطبيق

1. **اختبار محلي:** تفعيل إعداد "تقيد الوصول بالمستخدمين من اليمن فقط" من لوحة التحكم، واستخدام VPN خارج اليمن، ثم فتح التطبيق. يجب أن تظهر شاشة التقييد.
2. **اختبار داخل اليمن:** إيقاف VPN أو الاتصال من شبكة يمنية — يجب أن يعمل التطبيق بشكل طبيعي.
3. **القائمة البيضاء:** يمكن للمشرف إضافة IPs مستثناة (مثل إداري يعمل من الخارج). تأكد أن التطبيق لا يعرض شاشة التقييد للمستخدمين من عناوين مُضافة للقائمة البيضاء.

---

## 7. المراجع

- [هيكل الاستجابة والأخطاء](01-response-structure.md)
- [التحكم بإصدار التطبيق](APP_VERSION_CONTROL_FOR_FLUTTER.md)
- [WebSocket](websocket.md)

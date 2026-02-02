# إصلاح خطأ "No active device tokens found" في Flutter (Push Notifications)

> **لمن:** مطور Flutter  
> **الغرض:** توضيح سبب فشل إرسال الإشعارات Push وطريقة إصلاحها بتسجيل جهاز المستخدم (FCM Token) في الـ Backend.

**ملاحظة عن هيكل الاستجابة:** الـ Backend يرجِع استجابة موحدة بصيغة واحدة فقط: `{ "success": true, "data": <النتيجة>, "requestId": "..." }`. لا يوجد تداخل مزدوج (مثل `data.data`). استخدم دائماً `response.data` للوصول إلى المحتوى الفعلي.

---

## 1. المشكلة

عند إرسال إشعار من نوع **Push** للمستخدم، قد يرجع الـ Backend:

- **الرسالة:** `"No active device tokens found"`
- **الكود:** `NO_DEVICE_TOKEN`

ومثال على الاستجابة (بعد التحديث الأخير، الاستجابة بصيغة واحدة فقط `success` و `data`):

```json
{
  "success": true,
  "data": {
    "notification": { ... },
    "logs": [
      {
        "errorMessage": "No active device tokens found",
        "errorCode": "NO_DEVICE_TOKEN",
        "channel": "push"
      }
    ],
    "summary": { "total": 1, "sent": 0, "failed": 1, "pending": 0 }
  },
  "requestId": "..."
}
```

---

## 2. السبب

الـ Backend يرسل Push عبر **FCM** إلى أجهزة المستخدم المسجّلة فقط.  
يخزّن الـ Backend قائمة **Device Tokens** (FCM tokens) لكل مستخدم في مجموعة `device_tokens`.

- إذا **لم يُسجَّل** أي FCM Token للمستخدم بعد تسجيل الدخول → لا يوجد جهاز لإرسال الإشعار إليه → يظهر `No active device tokens found`.
- إذا تم **تعطيل** التوكن (مثلاً بعد فشل إرسال سابق) أو **تنظيفه تلقائياً** (بعد فترة عدم استخدام) → نفس الخطأ.

**الخلاصة:** التطبيق (Flutter) **يجب** أن يستدعي **تسجيل الجهاز** بعد تسجيل الدخول ومع كل تجديد لـ FCM Token.

---

## 3. الحل: تسجيل الجهاز (Register Device)

### 3.1 الـ Endpoint

| العنصر     | القيمة                                                                  |
| ---------- | ----------------------------------------------------------------------- |
| **Method** | `POST`                                                                  |
| **Path**   | `/notifications/devices/register`                                       |
| **Auth**   | مطلوب — إرسال JWT في الـ Header: `Authorization: Bearer <access_token>` |

(استخدم البادئة الأساسية للـ API إن وُجدت، مثلاً: `https://your-api.com/api/notifications/devices/register`)

### 3.2 Body (JSON)

| الحقل        | النوع  | مطلوب | الوصف                                        |
| ------------ | ------ | ----- | -------------------------------------------- |
| `token`      | string | نعم   | FCM Device Token من Firebase                 |
| `platform`   | string | نعم   | أحد القيم: `"android"` \| `"ios"` \| `"web"` |
| `userAgent`  | string | لا    | وصف الجهاز/المتصفح (مثل "Android 13")        |
| `appVersion` | string | لا    | إصدار التطبيق (مثل "1.0.0")                  |

**مثال:**

```json
{
  "token": "fcm_token_from_firebase_messaging",
  "platform": "android",
  "userAgent": "Android 13",
  "appVersion": "1.0.0"
}
```

لـ iOS استخدم `"platform": "ios"`.

### 3.3 الاستجابة الناجحة (بعد التحديث الأخير)

الشكل الموحد للاستجابة من الـ Backend:

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Device registered successfully",
    "deviceToken": {
      "_id": "...",
      "userId": "...",
      "token": "fcm_token_here...",
      "platform": "android",
      "isActive": true,
      "lastUsedAt": "2026-02-02T14:00:00.000Z"
    }
  },
  "requestId": "uuid"
}
```

في Flutter يمكنك استخدام `response.data` (أو حسب طريقة parse الـ API لديك) للوصول إلى `message` و `deviceToken`.

---

## 4. ما المطلوب تنفيذه في Flutter

### 4.1 الحصول على FCM Token

استخدم **Firebase Messaging**:

```dart
import 'package:firebase_messaging/firebase_messaging.dart';

Future<String?> getFCMToken() async {
  final messaging = FirebaseMessaging.instance;
  await messaging.requestPermission(); // للإصدارات التي تدعمها
  final token = await messaging.getToken();
  return token;
}
```

### 4.2 استدعاء تسجيل الجهاز بعد تسجيل الدخول

بعد نجاح **تسجيل الدخول** (وعند الحصول على الـ JWT):

1. استدعاء `getFCMToken()`.
2. إذا كان التوكن غير null، استدعاء:

```http
POST /notifications/devices/register
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "token": "<fcm_token>",
  "platform": "android",   // أو "ios" حسب المنصة
  "userAgent": "...",      // اختياري
  "appVersion": "1.0.0"   // اختياري
}
```

### 4.3 التعامل مع تجديد التوكن (Token Refresh)

Firebase قد يغيّر الـ FCM Token. استمع للتحديث وأعد التسجيل:

```dart
FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
  // أعد تسجيل الجهاز بالتوكن الجديد
  await registerDeviceWithBackend(newToken);
});
```

تأكد أن المستخدم لا يزال مسجّل الدخول (لديك JWT صالح) عند استدعاء `registerDeviceWithBackend`.

### 4.4 إلغاء تسجيل الجهاز عند تسجيل الخروج (اختياري لكن مُفضّل)

عند **تسجيل الخروج** يمكن استدعاء:

```http
POST /notifications/devices/unregister
Authorization: Bearer <access_token>
Content-Type: application/json

{ "token": "<fcm_token>" }
```

بهذا لا يبقى التوكن نشطاً للمستخدم بعد الخروج.

---

## 5. التحقق من أن الإصلاح يعمل

1. تسجيل الدخول من التطبيق.
2. التأكد من استدعاء `POST /notifications/devices/register` مع FCM Token و JWT.
3. إرسال إشعار Push لنفس المستخدم من لوحة الإدارة أو من الـ Backend.
4. يجب أن يصل الإشعار للجهاز ولا يظهر `No active device tokens found` في الـ logs أو الاستجابة.

---

## 6. ملخص سريع

| الخطوة | الوصف                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------- |
| 1      | الحصول على FCM Token من `FirebaseMessaging.instance.getToken()`                                |
| 2      | بعد تسجيل الدخول، استدعاء `POST /notifications/devices/register` مع `token` و `platform` و JWT |
| 3      | عند `onTokenRefresh` إعادة استدعاء نفس الـ endpoint بالتوكن الجديد                             |
| 4      | (اختياري) عند تسجيل الخروج استدعاء `POST /notifications/devices/unregister`                    |

بعد تنفيذ هذه الخطوات، الإشعارات من نوع **Push** يجب أن تصل للجهاز ولا يظهر خطأ "No active device tokens found".

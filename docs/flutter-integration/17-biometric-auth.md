# 17. Biometric Authentication (WebAuthn / Passkeys)

يوضح هذا الدليل كيفية دمج تسجيل الدخول بالبصمة (أو أي وسيلة مصادقة حيوية مدعومة من الجهاز) في تطبيق Flutter الذي يستهدف Android وiOS، باستخدام واجهات `WebAuthn/FIDO2` المضافة إلى خادم Tagdod.

> **ملاحظة:** في الواجهة الأمامية يمكن عرض الميزة باسم "بصمة اليد" أو "Passkey"، أما على مستوى البروتوكول فمن الضروري الالتزام بـ WebAuthn لضمان التوافق مع جميع المنصات.

---

## 1. متطلبات قبل البدء

- تحديث الخادم بالاعتمادات الجديدة (تم دمج `@simplewebauthn/server` ضمن `AuthModule`).
- ضبط المتغيرات البيئية التالية (أو الاعتماد على القيم الافتراضية):
  - `WEBAUTHN_RP_ID`
  - `WEBAUTHN_RP_NAME`
  - `WEBAUTHN_ORIGIN`
  - `WEBAUTHN_CHALLENGE_TTL_MS`
- في تطبيق Flutter استخدم إحدى الحزم التي تدعم WebAuthn / Passkeys:
  - [`flutter_passkeys`](https://pub.dev/packages/flutter_passkeys) – تدعم Android (FIDO2) وiOS (Passkeys).
  - [`flutter_webauthn`](https://pub.dev/packages/flutter_webauthn) – توفر واجهة عامة، وقد تحتاج لقنوات مخصصة في بعض الأجهزة.
  - يمكن إنشاء قنوات Platform Channels مخصصة لاستدعاء `Fido2ApiClient` في Android و`ASAuthorizationPlatformPublicKeyCredentialProvider` في iOS عند الحاجة.
- التواصل الآمن (HTTPS) مطلوب، كما يجب أن يتطابق `origin`/`rpId` بين الخادم والعميل.

---

## 2. نظرة عامة على التدفق

### 2.1 تسجيل جهاز جديد (مرة واحدة لكل جهاز/مستخدم)

1. **العميل** يرسل رقم الهاتف للحصول على تحدي عبر `POST /auth/biometric/register-challenge`.
2. **الخادم** يعيد خيارات WebAuthn (`PublicKeyCredentialCreationOptions`).
3. **العميل** يستدعي WebAuthn/Passkeys APIs بالجهاز لتوليد الاستجابة (تخزين المفتاح الخاص محلياً).
4. **العميل** يرسل الاستجابة (Credential JSON) إلى `POST /auth/biometric/register-verify`.
5. **الخادم** يتحقق من الاستجابة، يخزن بيانات الاعتماد العامة، ويعيد Tokens للمستخدم (نفس بنية الرد في تسجيل الدخول التقليدي).

### 2.2 تسجيل الدخول بجهاز مسجّل

1. **العميل** يطلب تحدي تسجيل الدخول عبر `POST /auth/biometric/login-challenge`.
2. **الخادم** يرسل `PublicKeyCredentialRequestOptions`.
3. **العميل** يستدعي آلية WebAuthn لتوقيع التحدي بالمفتاح الخاص.
4. **العميل** يرسل النتيجة إلى `POST /auth/biometric/login-verify`.
5. **الخادم** يتحقق ويعيد Tokens لمتابعة الجلسة.

> يمكن الاحتفاظ بطريقة تسجيل الدخول التقليدية (OTP أو كلمة مرور) كخيار احتياطي.

---

## 3. نقاط النهاية الجديدة

### 3.1 إنشاء تحدي تسجيل جهاز

- **Endpoint:** `POST /auth/biometric/register-challenge`
- **Body:** `BiometricRegisterChallengeDto`

```json
{
  "phone": "0501234567",
  "deviceName": "iPhone 15 Pro",
  "userAgent": "my_flutter_app/1.0.0 (iOS)"
}
```

- **Response:** 

```json
{
  "options": {
    "challenge": "...",
    "rp": { "name": "Tagdod Platform", "id": "app.example.com" },
    "user": {
      "id": "BASE64_USER_ID",
      "name": "+966501234567",
      "displayName": "+966501234567"
    },
    "pubKeyCredParams": [ { "type": "public-key", "alg": -7 }, ... ],
    "excludeCredentials": [...],
    "authenticatorSelection": { "userVerification": "required" },
    "timeout": 300000
  }
}
```

### 3.2 التحقق وتخزين جهاز جديد

- **Endpoint:** `POST /auth/biometric/register-verify`
- **Body:** `BiometricRegisterVerifyDto`

```json
{
  "phone": "0501234567",
  "response": {
    "id": "credential-id",
    "rawId": "base64url-raw-id",
    "type": "public-key",
    "response": {
      "attestationObject": "...",
      "clientDataJSON": "..."
    },
    "clientExtensionResults": {}
  },
  "deviceName": "iPhone 15 Pro",
  "userAgent": "my_flutter_app/1.0.0 (iOS)"
}
```

- **Response:** نفس بنية رد تسجيل الدخول الاعتيادي:

```json
{
  "tokens": {
    "access": "JWT_ACCESS",
    "refresh": "JWT_REFRESH"
  },
  "me": {
    "id": "507f1f77bcf86cd799439011",
    "phone": "+966501234567",
    "roles": [],
    "permissions": [],
    "preferredCurrency": "USD",
    "engineerStatus": "none",
    "merchantStatus": "none"
  }
}
```

### 3.3 إنشاء تحدي تسجيل الدخول

- **Endpoint:** `POST /auth/biometric/login-challenge`
- **Body:** `BiometricLoginChallengeDto`

```json
{
  "phone": "0501234567",
  "userAgent": "my_flutter_app/1.0.0 (Android)"
}
```

- **Response:** خيارات WebAuthn للمصادقة:

```json
{
  "options": {
    "challenge": "...",
    "allowCredentials": [
      { "type": "public-key", "id": "base64url-credential-id", "transports": ["internal"] }
    ],
    "rpId": "app.example.com",
    "timeout": 300000,
    "userVerification": "required"
  }
}
```

### 3.4 التحقق من تسجيل الدخول بالبصمة

- **Endpoint:** `POST /auth/biometric/login-verify`
- **Body:** `BiometricLoginVerifyDto`

```json
{
  "phone": "0501234567",
  "response": {
    "id": "credential-id",
    "rawId": "base64url-raw-id",
    "type": "public-key",
    "response": {
      "authenticatorData": "...",
      "clientDataJSON": "...",
      "signature": "...",
      "userHandle": "..."
    },
    "clientExtensionResults": {}
  },
  "userAgent": "my_flutter_app/1.0.0 (Android)"
}
```

- **Response:** نفس رد تسجيل الدخول التقليدي مع الـ Tokens.

---

## 4. واجهة Flutter (أمثلة مختصرة)

### 4.1 الحصول على تحدي التسجيل

```dart
final optionsResponse = await http.post(
  Uri.parse('$baseUrl/auth/biometric/register-challenge'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'phone': phoneNumber,
    'deviceName': deviceName,
    'userAgent': userAgentString,
  }),
);

final creationOptions = jsonDecode(optionsResponse.body)['options'];
```

### 4.2 استدعاء Passkey/ WebAuthn في Flutter

```dart
final passkeyResult = await FlutterPasskeys.registerPasskey(
  challenge: creationOptions['challenge'],
  relyingParty: creationOptions['rp']['id'],
  userName: creationOptions['user']['name'],
  userDisplayName: creationOptions['user']['displayName'],
  userId: creationOptions['user']['id'],
  authAttachment: AuthenticatorAttachment.platform,
  userVerification: UserVerificationRequirement.required,
);
```

> تختلف التفاصيل بين الحزم. تأكد من تحويل قيم `challenge`, `id`, `rawId` بين base64 وbase64url حسب المتطلبات.

### 4.3 إرسال الاستجابة للتحقق

```dart
final verifyResponse = await http.post(
  Uri.parse('$baseUrl/auth/biometric/register-verify'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'phone': phoneNumber,
    'response': passkeyResult.toJson(),
    'deviceName': deviceName,
    'userAgent': userAgentString,
  }),
);

final tokens = jsonDecode(verifyResponse.body)['tokens'];
```

### 4.4 تسجيل الدخول بجهاز مسجّل

نفس النمط، ولكن استخدم `login-challenge` ثم `login-verify`. عند الاستدعاء في Flutter:

```dart
final assertion = await FlutterPasskeys.authenticate(
  challenge: requestOptions['challenge'],
  relyingParty: requestOptions['rpId'],
  allowCredentials: requestOptions['allowCredentials'],
  userVerification: UserVerificationRequirement.required,
);
```

ثم إرسال النتيجة إلى `/auth/biometric/login-verify`.

---

## 5. حالات الفشل وأكواد الأخطاء

| الحالة | الكود | الوصف |
|--------|-------|--------|
| المستخدم غير موجود | `AUTH_USER_NOT_FOUND` | تأكد من التسجيل المسبق أو استدعاء OTP |
| الحساب غير نشط | `AUTH_USER_NOT_ACTIVE` | لا يسمح بتسجيل أجهزة أو تسجيل الدخول |
| لم يتم تسجيل بصمة | `AUTH_INVALID_CREDENTIALS` + `biometric_not_registered` | يجب إجراء التسجيل أولاً |
| انتهت صلاحية التحدي | `AUTH_INVALID_CREDENTIALS` + `challenge_expired` | أعد طلب التحدي وإعادة المحاولة |
| بيانات الاستجابة خاطئة | `AUTH_INVALID_CREDENTIALS` | تأكد من إرسال `rawId`, `clientDataJSON`, ... كما هي من النظام |

<br />

## 6. أفضل الممارسات

- احتفظ بخيار الرجوع لـ OTP أو كلمة مرور لتفادي إقفال المستخدم عن حسابه.
- استخدم `deviceName` لعرض الأجهزة الموثوقة في واجهة المستخدم (يمكن إضافة Endpoints لاحقاً لإدارتها).
- احرص على مسح التحديات بعد الاستخدام في الطرف العميل لتقليل أي تسرب محتمل.
- في Android تأكد من تفعيل Google Play Services (FIDO2 API) وفي iOS يلزم iOS 16 أو أحدث لدعم Passkeys.
- استخدم cache على مستوى التطبيق لتجنب طلب تحديات متعددة في نفس الوقت للمستخدم نفسه.

---

## 7. قائمة اختبارات مقترحة

- تسجيل جهاز لأول مرة، ثم تسجيل الدخول بنجاح.
- محاولة تسجيل جهاز جديد لنفس المستخدم من أكثر من جهاز (يجب السماح بذلك مع حفظ كل جهاز).
- تسجيل الدخول بجهاز مسجّل باستخدام بصمة سليمة، مع التحقق من تحديث `signCount`.
- تسجيل الدخول بعد انقضاء التحدي (يجب رفضه وإعادة الخطوات).
- التعامل مع مستخدم غير نشط أو حساب مقفل (يجب رفض التشغيل).
- اختبار fallback إلى OTP أو كلمة المرور في حالة رفض البصمة.

---

## 8. الأسئلة الشائعة (FAQ)

**هل يلزم تغيير شيء في تطبيق Flutter ليعمل على الويب؟**  
نعم، WebAuthn يعمل أيضاً على الويب، لكن يتطلب ربطاً مع واجهة JavaScript (يمكن استخدام `package:web_authn` أو بناء قناة JS مع Flutter Web).

**هل يمكن حذف جهاز مسجل؟**  
حالياً يتم التخزين داخل حقل `webauthnCredentials` في `User` وثمة حاجة لإضافة Endpoint إداري أو للمستخدم مستقبلاً لحذفه. يمكن اعتماد `deviceName` و`lastUsedAt` للتمييز بين الأجهزة.

**ما هي الحماية من إعادة تشغيل (Replay)?**  
الخادم يتحقق من `counter` (`signCount`). أي استجابة قديمة سيتم رفضها بسبب الرقم المتزايد المخزن.

---

باستخدام هذا الدليل يمكن لتطبيق Flutter تشغيل المصادقة البيومترية بسلاسة على Android وiOS مع الحفاظ على التوافق الكامل مع خادم Tagdod وخدماته الأخرى.


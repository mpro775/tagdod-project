# التحكم باصدار التطبيق عن بُعد — دليل مطوّر Flutter

هذا الملف يشرح **تكامل التحكم باصدار التطبيق** بين الـ Backend وتطبيق Flutter: كيف تستدعي سياسة النسخ، وماذا تعرض للمستخدم حسب النتيجة (تحديث إجباري، وضع صيانة، أو السماح بالاستخدام).

---

## 1. الهدف

- الـ Backend يخزّن **سياسة إصدار التطبيق** لكل منصة (أندرويد / آيفون): أقل نسخة مسموح بها، نسخ محظورة، وضع صيانة، ورابط التحديث (Play Store أو App Store).
- التطبيق (Flutter) يستدعي **endpoint عام** عند بدء التشغيل (وربما قبل عمليات مهمة) ويقرأ النسخة الحالية من `package_info_plus` ويرسل المنصة (`X-Platform: android` أو `ios`) لاستلام الإعداد ورابط المتجر المناسب.
- حسب النتيجة:
  - **النسخة مسموحة** → يُسمح للمستخدم بالمتابعة.
  - **النسخة قديمة أو محظورة** → عرض شاشة تحديث إجبارية مع زر يفتح رابط المتجر (`updateUrl`)، وعدم إمكانية المتابعة دون التحديث.
  - **وضع الصيانة** → عرض شاشة "التطبيق قيد الصيانة" وعدم السماح بالاستخدام.

---

## 2. الـ API

### 2.1 Endpoint

| الطريقة | المسار               | المصادقة     |
| ------- | -------------------- | ------------ |
| `GET`   | `/api/v1/app/config` | **لا** (عام) |

- الـ Base URL هو نفسه المستخدم في باقي الطلبات (مثلاً `https://api.yourdomain.com/api/v1`).
- لا حاجة لـ `Authorization` أو token؛ الـ endpoint عام لجميع المستخدمين.

### 2.2 الهيدر الاختياري (مهم للتقييم)

| الهيدر          | القيمة                       | مطلوب؟              | الوصف                                                                                                          |
| --------------- | ---------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| `X-App-Version` | نسخة التطبيق (مثلاً `1.0.5`) | **لا** (لكن مُفضّل) | نسخة التطبيق الحالية؛ الـ Backend يقارنها مع `minVersion` و`blockedVersions` ويُرجِع `shouldUpdate` و `canUse` |
| `X-Platform`    | `android` أو `ios`           | **لا** (مُفضّل)     | منصة التطبيق؛ الـ Backend يُرجِع إعداد تلك المنصة (رابط التحديث والأصدارات الخاصة بها)                         |

- إذا **أرسلت** `X-App-Version`: الـ Backend يحسب لك `shouldUpdate` و `canUse` بناءً على مقارنة semver.
- إذا **لم ترسل**: ستحصل على السياسة فقط (`minVersion`, `blockedVersions`, إلخ) ويمكنك تنفيذ المقارنة في Flutter إن رغبت.
- إذا **أرسلت** `X-Platform: android` أو `X-Platform: ios`: ستحصل على `minVersion`, `latestVersion`, `updateUrl`, `blockedVersions` الخاصة بتلك المنصة (مثلاً رابط Play Store للأندرويد ورابط App Store للآيفون).

**مصدر النسخة في Flutter:** استخدم `package_info_plus` (مثلاً `PackageInfo.fromPlatform()` ثم `version`).

**مصدر المنصة في Flutter:** أرسل الهيدر `X-Platform` حسب المنصة الحالية، مثلاً باستخدام `dart:io`:

```dart
import 'dart:io';

// عند بناء الـ request:
final platform = Platform.isAndroid ? 'android' : (Platform.isIOS ? 'ios' : null);
if (platform != null) {
  headers['X-Platform'] = platform;
}
```

أو من `Theme.of(context).platform` إن كنت في سياق Material. بهذا يحصل مستخدمو أندرويد على رابط Play Store ومستخدمو آيفون على رابط App Store تلقائياً.

---

## 3. شكل الاستجابة (Response)

الاستجابة تُغلّف بالـ envelope المعتاد للـ API (مثلاً `{ "success": true, "data": { ... } }`). المحتوى الفعلي داخل `data`:

| الحقل             | النوع      | الوصف                                                                                                              |
| ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| `minVersion`      | `string`   | أقل نسخة مسموح بها (مثلاً `"1.0.5"`)                                                                               |
| `latestVersion`   | `string`   | أحدث نسخة متاحة (للعرض الاختياري)                                                                                  |
| `blockedVersions` | `string[]` | قائمة نسخ محظورة (مثلاً `["1.0.3", "1.0.4"]`)                                                                      |
| `forceUpdate`     | `boolean`  | إن كان `true` يظهر طلب التحديث حتى لو النسخة فوق الحد الأدنى (حسب منطق الـ Backend)                                |
| `maintenanceMode` | `boolean`  | إن كان `true` التطبيق في وضع صيانة — لا يُسمح بالاستخدام                                                           |
| `updateUrl`       | `string`   | رابط التحديث (Play Store أو App Store حسب المنصة عند إرسال `X-Platform`) لزر "تحديث"                               |
| `shouldUpdate`    | `boolean`  | _(يُرجَع عند إرسال X-App-Version)_ `true` = النسخة قديمة أو محظورة أو `forceUpdate` مفعّل — يجب إظهار شاشة التحديث |
| `canUse`          | `boolean`  | _(يُرجَع عند إرسال X-App-Version)_ `true` = يمكن استخدام التطبيق (لا حظر ولا صيانة)                                |

### 3.1 مثال استجابة (مع إرسال X-App-Version)

```json
{
  "success": true,
  "data": {
    "minVersion": "1.0.5",
    "latestVersion": "1.0.6",
    "blockedVersions": ["1.0.3", "1.0.4"],
    "forceUpdate": false,
    "maintenanceMode": false,
    "updateUrl": "https://play.google.com/store/apps/details?id=com.example.app",
    "shouldUpdate": false,
    "canUse": true
  },
  "requestId": "..."
}
```

### 3.2 مثال عند وجوب التحديث (نسخة قديمة أو محظورة)

لو النسخة المرسلة في `X-App-Version` هي `1.0.2` (أقل من `minVersion`):

```json
{
  "success": true,
  "data": {
    "minVersion": "1.0.5",
    "latestVersion": "1.0.6",
    "blockedVersions": ["1.0.3", "1.0.4"],
    "forceUpdate": false,
    "maintenanceMode": false,
    "updateUrl": "https://play.google.com/store/apps/details?id=com.example.app",
    "shouldUpdate": true,
    "canUse": false
  },
  "requestId": "..."
}
```

### 3.3 مثال عند تفعيل وضع الصيانة

```json
{
  "success": true,
  "data": {
    "minVersion": "1.0.5",
    "latestVersion": "1.0.6",
    "blockedVersions": [],
    "forceUpdate": false,
    "maintenanceMode": true,
    "updateUrl": "https://...",
    "shouldUpdate": false,
    "canUse": false
  },
  "requestId": "..."
}
```

---

## 4. تدفق العمل المطلوب في Flutter

1. **عند بدء التشغيل** (مثلاً بعد الـ splash أو في أول شاشة):

   - جلب نسخة التطبيق من `package_info_plus`.
   - تحديد المنصة (أندرويد أو آيفون) من `dart:io` — `Platform.isAndroid` / `Platform.isIOS`.
   - استدعاء `GET /api/v1/app/config` مع هيدرَي `X-App-Version: <version>` و `X-Platform: android` أو `X-Platform: ios`.
   - قراءة `data.canUse` و `data.shouldUpdate` و `data.maintenanceMode` و `data.updateUrl` (الخاصة بمنصتك).

2. **اتخاذ القرار:**

   - إذا **`maintenanceMode == true`** → عرض شاشة **"التطبيق قيد الصيانة"** (بدون زر تحديث أو مع رسالة فقط)، وعدم السماح بالدخول للتطبيق.
   - إذا **`shouldUpdate == true`** (نسخة قديمة أو محظورة) → عرض شاشة **تحديث إجباري**:
     - رسالة واضحة (مثل: "يجب تحديث التطبيق لاستمرار الاستخدام").
     - زر يفتح `updateUrl` (رابط المتجر) عبر `url_launcher` أو ما شابه.
     - عدم إمكانية إغلاق الشاشة أو المتابعة دون التحديث.
   - إذا **`canUse == true`** → السماح بالمتابعة كالمعتاد.

3. **(اختياري)** إعادة فحص السياسة قبل عمليات حساسة (مثل الدفع، إنشاء طلب) بنفس الـ endpoint؛ أو الاعتماد على فحص واحد عند البدء.

4. **معالجة الأخطاء:**
   - إذا فشل الطلب (شبكة، 5xx): يمكن السماح للمستخدم بالمتابعة مؤقتاً أو إظهار رسالة "تحقق من الاتصال وحاول لاحقاً" حسب سياسة المنتج.
   - إذا رجع الـ API **426 Upgrade Required** (انظر القسم 5): اعتبارها مثل `shouldUpdate == true` وإظهار شاشة التحديث.

---

## 5. رد 426 Upgrade Required (اختياري من الـ Backend)

قد يُفعّل الـ Backend **Guard** على بعض المسارات بحيث يرفض الطلبات من نسخ قديمة أو محظورة ويرجع:

- **Status:** `426 Upgrade Required`
- **Body:** رسالة توضح وجوب التحديث.

في Flutter:

- عند استلام **426** من أي استدعاء API:
  - اعرض شاشة التحديث الإجباري (نفس شاشة `shouldUpdate == true`).
  - استخدم `updateUrl` من آخر استجابة ناجحة لـ `/api/v1/app/config` إن وُجدت (ستكون مناسبة للمنصة إذا أرسلت `X-Platform`)، أو احفظها عند أول نجاح.

لا تُطبّق 426 على endpoint `/api/v1/app/config` نفسه ولا على مسارات الـ health؛ لذلك التطبيق يستطيع دائماً جلب السياسة.

---

## 6. ما يلزم مطوّر Flutter (قائمة تنفيذ)

| #   | المهمة                                                               | ملاحظات                                                                                                                         |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | إضافة/استخدام **Model** لاستجابة `/api/v1/app/config`                | حقول: `minVersion`, `latestVersion`, `blockedVersions`, `forceUpdate`, `maintenanceMode`, `updateUrl`, `shouldUpdate`, `canUse` |
| 2   | استدعاء **GET /api/v1/app/config** مع هيدر **X-App-Version**         | القيمة من `package_info_plus` (مثلاً `PackageInfo.fromPlatform().then((p) => p.version)`)                                       |
| 3   | إرسال هيدر **X-Platform: android** أو **X-Platform: ios**            | حسب `Platform.isAndroid` / `Platform.isIOS`؛ لاستلام `updateUrl` ونسخ خاصة بكل منصة (Play Store / App Store)                    |
| 4   | فحص الاستجابة عند **بدء التشغيل** (main أو أول شاشة بعد الـ splash)  | حسب `canUse`, `shouldUpdate`, `maintenanceMode`                                                                                 |
| 5   | شاشة **تحديث إجباري**                                                | عند `shouldUpdate == true`: رسالة + زر يفتح `updateUrl`، بدون إمكانية المتابعة                                                  |
| 6   | شاشة **وضع الصيانة**                                                 | عند `maintenanceMode == true`: رسالة فقط، بدون متابعة                                                                           |
| 7   | **(اختياري)** التعامل مع **426** من أي API                           | إظهار شاشة التحديث واستخدام `updateUrl` المحفوظ أو من آخر نجاح لـ app/config                                                    |
| 8   | **(اختياري)** إرسال **X-App-Version** و **X-Platform** في طلبات أخرى | يساعد الـ Backend إن فُعّل Guard على مسارات معينة                                                                               |

---

## 7. مثال طلب (للمرجع)

```
GET /api/v1/app/config HTTP/1.1
Host: api.yourdomain.com
Accept: application/json
Accept-Language: ar
X-App-Version: 1.0.5
X-Platform: android
```

(استبدل `android` بـ `ios` على آيفون.) لا حاجة لـ `Authorization` لهذا الـ endpoint.

---

## 8. ملخص سريع

- **Endpoint:** `GET /api/v1/app/config` (بدون مصادقة).
- **هيدر مُفضّل:** `X-App-Version: <نسخة التطبيق>` و `X-Platform: android` أو `X-Platform: ios` (لرابط المتجر والأصدارات الخاصة بكل منصة).
- **القرار:**
  - `maintenanceMode == true` → شاشة صيانة.
  - `shouldUpdate == true` → شاشة تحديث إجبارية + زر يفتح `updateUrl` (Play Store أو App Store حسب المنصة).
  - `canUse == true` → متابعة عادية.
- **426:** إن وُجدت، عالجها كتحديث إجباري واستخدم `updateUrl`.

بعد تنفيذ النقاط أعلاه يكون تطبيق Flutter متكاملاً مع التحكم باصدار التطبيق من الـ Backend ولوحة الإدارة، مع دعم منصتي أندرويد وآيفون ورابط تحديث منفصل لكل منهما.

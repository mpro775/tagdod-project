# موديول إعداد التطبيق (App Config)

موديول NestJS لإدارة **سياسة إصدار التطبيق** ومراقبة النسخ: تحديد الحد الأدنى للنسخة، حظر نسخ معينة، وضع الصيانة، وإجبار التحديث.

---

## الهدف

- توفير endpoint عام للعميل (موبايل/ويب) لمعرفة هل يجب التحديث أو يمكن الاستمرار.
- تمكين الأدمن من تعديل السياسة (minVersion, blockedVersions, maintenanceMode, updateUrl).
- حماية الـ API من النسخ القديمة أو المحظورة عبر `AppVersionGuard` (استجابة 426 Upgrade Required).

---

## هيكل الملفات

```
app-config/
├── app-config.module.ts          # تعريف الموديول والـ imports/exports
├── app-config.service.ts         # منطق السياسة وجلب/تحديث الإعداد
├── app-config.controller.ts      # API عام: GET /app/config
├── app-config.admin.controller.ts # API أدمن: GET/PUT /admin/app-config
├── app-version.guard.ts         # Guard يرفض النسخ القديمة/المحظورة (426)
├── dto/
│   └── app-config.dto.ts        # DTOs: Policy, ClientResponse, Update
├── schemas/
│   └── app-version-policy.schema.ts  # Mongoose schema لسياسة النسخ
└── README.md
```

---

## الـ API

### 1. API عام (للعميل)

| الطريقة | المسار        | الوصف                                                                    |
| ------- | ------------- | ------------------------------------------------------------------------ |
| `GET`   | `/app/config` | إرجاع سياسة النسخ مع `shouldUpdate` و `canUse` عند إرسال `X-App-Version` |

**الرأس الاختياري:**

- `X-App-Version`: نسخة التطبيق الحالية (مثلاً `1.0.5`) لمقارنة semver.

**نموذج الاستجابة (200):**

```json
{
  "minVersion": "1.0.5",
  "latestVersion": "1.0.6",
  "blockedVersions": ["1.0.3", "1.0.4"],
  "forceUpdate": false,
  "maintenanceMode": false,
  "updateUrl": "https://...",
  "shouldUpdate": false,
  "canUse": true
}
```

- **shouldUpdate**: `true` إذا كانت النسخة قديمة (أقل من minVersion) أو ضمن blockedVersions أو `forceUpdate = true`.
- **canUse**: `true` عندما لا يجب التحديث ولا وضع الصيانة مفعّل.

---

### 2. API أدمن (محمي بـ JWT + Admin)

| الطريقة | المسار              | الوصف                                                                                                     |
| ------- | ------------------- | --------------------------------------------------------------------------------------------------------- |
| `GET`   | `/admin/app-config` | جلب سياسة إصدار التطبيق الحالية                                                                           |
| `PUT`   | `/admin/app-config` | تحديث السياسة (جزئي: minVersion, latestVersion, blockedVersions, forceUpdate, maintenanceMode, updateUrl) |

يتطلب: `Authorization: Bearer <token>` وحساب أدمن.

---

## حقل السياسة (Policy)

| الحقل             | النوع    | الوصف                              |
| ----------------- | -------- | ---------------------------------- |
| `minVersion`      | string   | أقل نسخة مسموح بها (مقارنة semver) |
| `latestVersion`   | string   | أحدث نسخة معروفة                   |
| `blockedVersions` | string[] | نسخ محظورة من الاستخدام            |
| `forceUpdate`     | boolean  | إجبار التحديث لجميع المستخدمين     |
| `maintenanceMode` | boolean  | وضع الصيانة (منع الاستخدام)        |
| `updateUrl`       | string   | رابط التحديث (متجر التطبيق)        |

---

## AppVersionGuard

- **الوظيفة:** يقرأ `X-App-Version` من الـ request، ويستدعي `AppConfigService.isVersionBlockedOrOutdated()`.
- إذا كانت النسخة قديمة أو محظورة أو في وضع صيانة، يرمي `HttpException` برمز **426 Upgrade Required** ورسالة مناسبة.
- **تخطي الفحص:** استخدم الـ metadata `SKIP_APP_VERSION_CHECK` على الـ controller أو الـ handler:
  - `@SetMetadata(SKIP_APP_VERSION_CHECK, true)`
- **ملاحظة:** لا تفعّل الـ Guard على مسارات مثل `GET /app/config` ومسارات الصحة (health) حتى يتمكن العميل من معرفة أنه يجب التحديث.

---

## متغيرات البيئة (اختيارية)

تُستخدم كقيم افتراضية عند إنشاء السياسة الأولى فقط:

| المتغير              | الوصف              | الافتراضي |
| -------------------- | ------------------ | --------- |
| `APP_MIN_VERSION`    | أقل نسخة مسموح بها | `1.0.0`   |
| `APP_LATEST_VERSION` | أحدث نسخة          | `1.0.0`   |
| `APP_UPDATE_URL`     | رابط التحديث       | `''`      |

---

## قاعدة البيانات

- **المجموعة:** تُعرّف من اسم الـ schema (Mongoose).
- **المستند:** سياسة واحدة بمعرف ثابت (`policyId: 'default'`). يتم إنشاؤها تلقائياً عند أول تشغيل إذا لم تكن موجودة.

---

## تكامل العميل (موبايل/ويب)

1. عند بدء التطبيق أو قبل استدعاءات الـ API المحمية، استدعِ `GET /app/config` مع الهيدر `X-App-Version: <نسخة التطبيق>`.
2. إذا كان `shouldUpdate === true`: اعرض شاشة تحديث واربط الزر بـ `updateUrl`.
3. إذا كان `canUse === false` بسبب `maintenanceMode`: اعرض رسالة صيانة.
4. احتفظ بـ `minVersion` و `latestVersion` لعرضها في واجهة "حول التطبيق" أو التحديث.

---

## التصدير (Exports)

الموديول يصدّر:

- `AppConfigService` — للاستخدام في موديولات أخرى (مثلاً للتحقق من النسخة).
- `AppVersionGuard` — لربطه globally أو على مسارات محددة لرفض النسخ القديمة/المحظورة.

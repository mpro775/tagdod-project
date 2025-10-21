# دليل الترحيل - نظام الصلاحيات الموحد

## 🚀 نظرة عامة

هذا الدليل يوضح كيفية ترحيل النظام من النظام القديم (منفصل Capabilities/ Roles) إلى النظام الجديد الموحد.

## 📋 المتطلبات الأساسية

- ✅ Node.js 18+
- ✅ MongoDB 4.4+
- ✅ npm أو yarn
- ✅ Backup حديث لقاعدة البيانات

## 🗂️ الملفات المهمة

```
scripts/
├── migrate-capabilities-to-user.ts    # Script الترحيل الرئيسي
├── cleanup-capabilities.ts           # تنظيف البيانات القديمة
└── run-migration.ts                  # Runner للترحيل

src/modules/audit/                    # نظام التدقيق الجديد
├── schemas/audit-log.schema.ts
├── audit.controller.ts
└── audit.module.ts
```

## 📊 خطوات الترحيل

### الخطوة 1: التحضير

```bash
# 1. إنشاء backup شامل
mongodump --db solar-commerce --out backup-$(date +%Y%m%d-%H%M%S)

# 2. تشغيل الخادم في وضع التطوير
npm run start:dev

# 3. التأكد من عمل الخادم
curl http://localhost:3000/health
```

### الخطوة 2: الترحيل

```bash
# تشغيل script الترحيل
npm run migrate:capabilities

# المتوقع في الإخراج:
# 🚀 بدء ترحيل البيانات من Capabilities إلى User...
# 📊 عدد سجلات Capabilities: X
# ✅ تم ترحيل مستخدم: +966XXXXXXXXX
# 📊 تقرير الترحيل:
# ✅ تم الترحيل: X
# ⏭️  تم التخطي: Y
# ❌ أخطاء: 0
```

### الخطوة 3: الاختبار

```bash
# 1. اختبار endpoints الجديدة
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/admin/audit/logs

# 2. اختبار capabilities
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/auth/admin/pending

# 3. اختبار audit logs
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:3000/admin/audit/stats"
```

### الخطوة 4: النشر

```bash
# 1. بناء المشروع
npm run build

# 2. تشغيل في الإنتاج
npm run start:prod

# 3. مراقبة السجلات للتأكد من عمل النظام
```

### الخطوة 5: التنظيف (اختياري)

```bash
# ⚠️  فقط بعد التأكد من نجاح الترحيل

# حذف Capabilities collection القديمة
npm run migrate:cleanup

# سيطلب تأكيد:
# هل أنت متأكد من حذف Capabilities collection؟ (اكتب "نعم" للتأكيد): نعم
```

## 🔍 التحقق من النجاح

### فحص البيانات
```javascript
// في MongoDB shell
db.users.findOne({phone: "+966XXXXXXXXX"})
// يجب أن يحتوي على:
// - customer_capable, engineer_capable, etc.
// - roles array محدث
// - permissions array
```

### فحص الصلاحيات
```bash
# GET admin/users يجب أن يعمل مع token أدمن
# POST admin/approve يجب أن يعمل
# GET admin/audit/logs يجب أن يعمل
```

### فحص Audit Logs
```bash
# يجب أن تحتوي قاعدة البيانات على جدول audit_logs
# يجب أن تظهر العمليات في السجلات
```

## 🆘 استكشاف الأخطاء

### خطأ: "Capabilities collection فارغ"
```
✅ لا توجد بيانات للترحيل
```
**الحل:** هذا طبيعي إذا كانت Capabilities فارغة. النظام الجديد جاهز.

### خطأ: "فشل في الترحيل"
```
❌ خطأ في ترحيل capability X: MongoError
```
**الحل:**
1. تحقق من صحة قاعدة البيانات
2. تحقق من صحة البيانات في Capabilities
3. شغل الترحيل مرة أخرى

### خطأ: "Endpoint يرفض الوصول"
```
403 Forbidden
```
**الحل:**
1. تأكد من token الأدمن صحيح
2. تحقق من أن المستخدم لديه الصلاحيات المطلوبة
3. تحقق من أن AdminGuard لم يعد يسمح للجميع

## 📊 ما تغير

### قبل الترحيل
```javascript
// Capabilities collection منفصل
{
  userId: ObjectId,
  customer_capable: true,
  engineer_capable: false,
  engineer_status: "none"
}

// User collection
{
  roles: ["user"],
  permissions: []
}
```

### بعد الترحيل
```javascript
// User collection موحد
{
  // البيانات الأساسية
  phone: "+966XXXXXXXXX",
  firstName: "أحمد",

  // الأدوار والصلاحيات
  roles: ["user", "engineer"],
  permissions: ["admin.access"],

  // Capabilities مدمجة
  customer_capable: true,
  engineer_capable: true,
  engineer_status: "approved",
  wholesale_capable: false,
  wholesale_status: "none",
  admin_capable: false,
  admin_status: "none"
}
```

## 🔐 الصلاحيات الجديدة

| Endpoint | الصلاحية المطلوبة | الوصف |
|----------|-------------------|--------|
| `GET /admin/users` | `users.read, admin.access` | قائمة المستخدمين |
| `POST /admin/users` | `users.create, admin.access` | إنشاء مستخدم |
| `PATCH /admin/users/:id` | `users.update, admin.access` | تحديث مستخدم |
| `DELETE /admin/users/:id` | `users.delete, admin.access` | حذف مستخدم |
| `GET /auth/admin/pending` | `capabilities.read, admin.access` | طلبات القدرات |
| `POST /auth/admin/approve` | `capabilities.update, admin.access` | الموافقة على القدرات |
| `GET /admin/audit/logs` | `admin.access` (Super Admin only) | سجلات التدقيق |

## 📞 الدعم

### في حالة المشاكل
1. راجع هذا الدليل أولاً
2. تحقق من السجلات في وحدة التحكم
3. راجع `WEEK2_COMPLETION_REPORT.md` للتفاصيل
4. اتصل بفريق التطوير

### البيانات الحساسة
- جميع العمليات الحساسة مُسجلة في `audit_logs`
- يمكن البحث والفلترة في السجلات
- السجلات محفوظة لمدة 90 يوم افتراضياً

---

## ✅ قائمة التحقق النهائية

- [ ] Backup تم إنشاؤه
- [ ] الخادم يعمل في وضع التطوير
- [ ] Migration script تم تشغيله بنجاح
- [ ] جميع endpoints تعمل
- [ ] Audit logs تحتوي على السجلات
- [ ] اختبار شامل تم إجراؤه
- [ ] النشر للإنتاج تم
- [ ] Cleanup (اختياري) تم

**تاريخ الترحيل:** _______________
**الشخص المسؤول:** _______________
**الحالة:** ✅ مكتمل / ❌ يحتاج مراجعة

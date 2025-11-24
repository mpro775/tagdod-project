# ملخص Endpoints الخاصة بالمهندس

## ✅ Endpoints جلب بروفايل المهندس

### 1. جلب بروفايل المهندس الحالي (المسجل دخول)
```
GET /engineers/profile/me
Authorization: Bearer {token}
```
- **الوصف**: جلب بروفايل المهندس المسجل دخول حالياً
- **المتطلبات**: JWT Token + Engineer Role
- **الاستجابة**: `EngineerProfile` كامل مع معلومات المستخدم
- **ملاحظة**: إذا لم يكن البروفايل موجوداً، يتم إنشاؤه تلقائياً

### 2. جلب بروفايل مهندس محدد
```
GET /engineers/profile/:engineerId
```
- **الوصف**: جلب بروفايل مهندس محدد (عام - لا يحتاج تسجيل دخول)
- **المتطلبات**: معرف المهندس
- **الاستجابة**: `EngineerProfile` كامل مع معلومات المستخدم

### 3. تحديث بروفايل المهندس الحالي
```
PUT /engineers/profile/me
Authorization: Bearer {token}
Body: UpdateEngineerProfileDto
```
- **الوصف**: تحديث بروفايل المهندس المسجل دخول
- **المتطلبات**: JWT Token + Engineer Role
- **الحقول القابلة للتحديث**:
  - `bio` - النبذة
  - `avatarUrl` - رابط الأفاتار
  - `whatsappNumber` - رقم الواتساب
  - `cvFileUrl` - رابط السيرة الذاتية
  - `jobTitle` - المسمى الوظيفي
  - `specialties` - التخصصات
  - `yearsOfExperience` - سنوات الخبرة
  - `certifications` - الشهادات
  - `languages` - اللغات

### 4. جلب تقييمات مهندس محدد
```
GET /engineers/profile/:engineerId/ratings
Query Parameters:
  - page?: number (default: 1)
  - limit?: number (default: 10)
  - sortBy?: 'recent' | 'top' | 'oldest' (default: 'recent')
  - minScore?: number (1-5)
```
- **الوصف**: جلب تقييمات مهندس محدد مع خيارات التصفية والترتيب

### 5. جلب تقييمات المهندس الحالي
```
GET /engineers/profile/me/ratings
Authorization: Bearer {token}
Query Parameters: (نفس المذكورة أعلاه)
```
- **الوصف**: جلب تقييمات المهندس المسجل دخول

---

## ✅ Endpoint التوثيق (Verification)

### رفع وثائق التحقق
```
POST /users/verification/submit
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
  - file: File (CV للمهندس أو صورة المحل للتاجر)
  - storeName?: string (مطلوب للتاجر فقط)
  - note?: string
```
- **الوصف**: رفع ملف السيرة الذاتية للمهندس أو صورة المحل للتاجر
- **المتطلبات**: JWT Token + Engineer أو Merchant Role
- **حالة المهندس**: يجب أن تكون `UNVERIFIED`
- **أنواع الملفات المقبولة للمهندس**:
  - PDF (`application/pdf`)
  - DOC (`application/msword`)
  - DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
- **ما يحدث بعد الرفع**:
  1. يتم رفع الملف إلى Bunny.net في مجلد `verification/engineers`
  2. يتم حفظ `cvFileUrl` في `EngineerProfile`
  3. يتم تحديث حالة المهندس إلى `PENDING`
  4. يتم حفظ `verificationNote` في `User`

### ✅ التحقق من التأثير
- ✅ **تم تحديث endpoint التوثيق**: يستخدم الآن `EngineerProfile` لحفظ `cvFileUrl`
- ✅ **يعمل بشكل صحيح**: يتم إنشاء `EngineerProfile` تلقائياً إذا لم يكن موجوداً
- ✅ **لا يوجد تعارض**: الكود محدث ويعمل بشكل صحيح

---

## ✅ نظام كوبونات المهندس

### 1. إنشاء كوبون للمهندس (Admin Only)
```
POST /admin/marketing/coupons/engineer
Authorization: Bearer {admin_token}
Body: CreateEngineerCouponDto
```
- **الوصف**: إنشاء كوبون مرتبط بمهندس مع نسبة عمولة
- **الحقول المطلوبة**:
  - `engineerId`: معرف المهندس
  - `code`: كود الكوبون
  - `name`: اسم الكوبون
  - `commissionRate`: نسبة العمولة (0-100)
  - `validFrom`: تاريخ البداية
  - `validUntil`: تاريخ النهاية
- **الحقول الاختيارية**:
  - `description`: الوصف
  - `discountValue`: قيمة الخصم
  - `usageLimit`: حد الاستخدام
  - `usageLimitPerUser`: حد الاستخدام لكل مستخدم
  - `minimumOrderAmount`: الحد الأدنى للطلب

### 2. جلب كوبونات مهندس محدد
```
GET /admin/marketing/engineers/:engineerId/coupons
Authorization: Bearer {admin_token}
```
- **الوصف**: جلب جميع كوبونات مهندس محدد

### 3. إحصائيات كوبونات مهندس
```
GET /admin/marketing/engineers/:engineerId/coupons/stats
Authorization: Bearer {admin_token}
```
- **الوصف**: جلب إحصائيات كوبونات مهندس (عدد الاستخدامات، إجمالي العمولات، إلخ)

### ✅ التحقق من الربط
- ✅ **الكوبونات مرتبطة بـ `engineerId`**: يتم حفظ `engineerId` في `Coupon` schema
- ✅ **العمولات تُضاف لـ `EngineerProfile`**: عند استخدام كوبون مهندس:
  1. يتم حساب العمولة من `commissionRate`
  2. يتم إضافة العمولة إلى `walletBalance` في `EngineerProfile`
  3. يتم إضافة سجل في `commissionTransactions`
  4. يتم تحديث إحصائيات الكوبون (`totalCommissionEarned`, `usageHistory`)
- ✅ **الربط صحيح**: النظام يعمل بشكل متكامل

### تدفق العمل عند استخدام كوبون مهندس:
1. **التحقق من الكوبون**: يتم التحقق من أن الكوبون مرتبط بمهندس (`engineerId` موجود)
2. **حساب العمولة**: يتم حساب العمولة من `commissionRate` × `discountAmount`
3. **تحديث الكوبون**: يتم تحديث `usageHistory` و `totalCommissionEarned`
4. **إضافة العمولة**: يتم استدعاء `addCommissionToEngineer()` في `OrderService`
5. **تحديث البروفايل**: يتم تحديث `walletBalance` و `commissionTransactions` في `EngineerProfile`

---

## ملخص

### ✅ Endpoints جلب البروفايل
- **موجودة**: `/engineers/profile/me` و `/engineers/profile/:engineerId`
- **تعمل بشكل صحيح**: تم إصلاح استخدام `req.user.sub` بدلاً من `req.user.userId`
- **مربوطة بـ `EngineerProfile`**: جميع البيانات تأتي من `EngineerProfile` schema

### ✅ Endpoint التوثيق
- **محدث**: يستخدم `EngineerProfile` لحفظ `cvFileUrl`
- **يعمل بشكل صحيح**: لا توجد مشاكل أو تعارضات
- **يُنشئ البروفايل تلقائياً**: إذا لم يكن موجوداً

### ✅ نظام الكوبونات
- **مرتبط بشكل صحيح**: الكوبونات مرتبطة بـ `engineerId` في `Coupon` schema
- **العمولات تُضاف لـ `EngineerProfile`**: يتم تحديث `walletBalance` و `commissionTransactions`
- **يعمل بشكل متكامل**: النظام كامل ومربوط بشكل صحيح


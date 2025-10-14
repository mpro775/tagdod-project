# ملخص التغييرات - نظام التاجر والمهندس

> ⚠️ **ملاحظة:** جميع التغييرات تتبع **نظام الردود الموحد** و**حمايات Guards** في المشروع.  
> للأمثلة الكاملة: [`API_EXAMPLES_WHOLESALE_ENGINEER.md`](./API_EXAMPLES_WHOLESALE_ENGINEER.md)

## 📌 نظرة سريعة

تم تطبيق نظام متكامل يدعم:
1. **التاجر**: خصم نسبة مئوية يطبق تلقائياً على كل طلباته
2. **المهندس**: مسمى وظيفي + استلام طلبات الخدمات (بدون رؤية طلباته الخاصة)
3. **الحمايات**: استخدام `JwtAuthGuard`, `AdminGuard`, `EngineerGuard`
4. **الردود**: جميع الـ APIs تتبع نظام الردود الموحد

---

## 🔧 الملفات المعدلة

### 1. **Capabilities Schema**
**الملف:** `backend/src/modules/capabilities/schemas/capabilities.schema.ts`

```diff
+ @Prop({ default: 0, min: 0, max: 100 }) wholesale_discount_percent!: number;
```

**الغرض:** حفظ نسبة خصم التاجر (0-100%)

---

### 2. **User Schema**
**الملف:** `backend/src/modules/users/schemas/user.schema.ts`

```diff
+ @Prop() jobTitle?: string;
```

**الغرض:** حفظ المسمى الوظيفي للمهندس (مثل: "كهربائي معتمد")

---

### 3. **Verify OTP DTO**
**الملف:** `backend/src/modules/auth/dto/verify-otp.dto.ts`

```diff
+ @IsOptional() @IsString() jobTitle?: string;
```

**الغرض:** استقبال المسمى الوظيفي عند التسجيل

---

### 4. **Auth Controller**
**الملف:** `backend/src/modules/auth/auth.controller.ts`

**التغييرات:**

#### أ) في `verify-otp`:
```typescript
// التحقق من وجود jobTitle للمهندس
if (dto.capabilityRequest === 'engineer' && !dto.jobTitle) {
  throw new AppException('AUTH_JOB_TITLE_REQUIRED', 'المسمى الوظيفي مطلوب للمهندسين', null, 400);
}

// حفظ jobTitle
user = await this.userModel.create({
  // ...
  jobTitle: dto.capabilityRequest === 'engineer' ? dto.jobTitle : undefined,
});
```

#### ب) في `admin/approve`:
```typescript
// إضافة wholesaleDiscountPercent في الـ body
@Body() body: { 
  userId: string; 
  capability: 'engineer' | 'wholesale'; 
  approve: boolean;
  wholesaleDiscountPercent?: number;  // 👈 جديد
}

// حفظ نسبة الخصم عند الموافقة
if (body.capability === 'wholesale') {
  if (body.approve) {
    caps.wholesale_discount_percent = body.wholesaleDiscountPercent;
  } else {
    caps.wholesale_discount_percent = 0;
  }
}
```

#### ج) في `GET /auth/me`:
```typescript
return {
  user: {
    // ...
    jobTitle: user!.jobTitle,  // 👈 جديد
  },
  // ...
};
```

#### د) في `PATCH /auth/me`:
```typescript
// السماح بتحديث jobTitle
const allowed = ['firstName', 'lastName', 'gender', 'jobTitle'];
```

---

### 5. **Cart Service**
**الملف:** `backend/src/modules/cart/cart.service.ts`

**التغييرات:**

#### أ) Import Capabilities:
```typescript
import { Capabilities } from '../capabilities/schemas/capabilities.schema';
```

#### ب) في Constructor:
```typescript
constructor(
  // ...
  @InjectModel(Capabilities.name) private capsModel: Model<Capabilities>,
  // ...
) {}
```

#### ج) في `previewByCart`:
```typescript
async previewByCart(
  cart: Cart, 
  currency: string, 
  accountType: 'any'|'customer'|'engineer'|'wholesale',
  userId?: string  // 👈 جديد
) {
  // جلب خصم التاجر
  if (userId) {
    const caps = await this.capsModel.findOne({ userId }).lean();
    if (caps && caps.wholesale_capable && caps.wholesale_discount_percent > 0) {
      wholesaleDiscountPercent = caps.wholesale_discount_percent;
    }
  }

  // تطبيق الخصم بعد العروض الترويجية
  if (wholesaleDiscountPercent > 0) {
    final = final * (1 - wholesaleDiscountPercent / 100);
  }

  // إرجاع معلومات الخصم
  return {
    // ...
    meta: { 
      count: lines.length,
      wholesaleDiscountPercent,
      wholesaleDiscountAmount,
    },
  };
}
```

#### د) في `previewUser`:
```typescript
async previewUser(userId: string, currency: string, accountType = 'any') {
  const cart = await this.getOrCreateUserCart(userId);
  return this.previewByCart(cart, currency, accountType, userId);  // 👈 تمرير userId
}
```

---

### 6. **Cart Module**
**الملف:** `backend/src/modules/cart/cart.module.ts`

```diff
+ import { Capabilities, CapabilitiesSchema } from '../capabilities/schemas/capabilities.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      // ...
+     { name: Capabilities.name, schema: CapabilitiesSchema },
    ]),
  ],
})
```

---

### 7. **Order Schema**
**الملف:** `backend/src/modules/checkout/schemas/order.schema.ts`

```diff
+ @Prop({ default: 0 }) wholesaleDiscountPercent?: number;
+ @Prop({ default: 0 }) wholesaleDiscountAmount?: number;
```

**الغرض:** حفظ معلومات الخصم في الطلب للتقارير

---

### 8. **Checkout Service**
**الملف:** `backend/src/modules/checkout/checkout.service.ts`

```diff
const createdOrders = await this.orders.create([{
  // ...
+ wholesaleDiscountPercent: quote.meta.wholesaleDiscountPercent || 0,
+ wholesaleDiscountAmount: quote.meta.wholesaleDiscountAmount || 0,
  // ...
}]);
```

---

### 9. **Services Service**
**الملف:** `backend/src/modules/services/services.service.ts`

```diff
async nearby(engineerUserId: string, lat: number, lng: number, radiusKm: number) {
  const list = await this.requests.find({
    // ...
+   userId: { $ne: new Types.ObjectId(engineerUserId) },  // منع رؤية طلباته
    // ...
  });
}
```

**الغرض:** منع المهندس من رؤية طلباته الخاصة في نتائج البحث

---

## 📝 ملفات التوثيق الجديدة

1. **WHOLESALE_AND_ENGINEER_SYSTEM.md** - دليل شامل للنظام
2. **API_EXAMPLES_WHOLESALE_ENGINEER.md** - أمثلة عملية للاختبار
3. **CHANGES_SUMMARY.md** - هذا الملف

---

## ✅ الميزات المطبقة

### التاجر:
- [x] حقل `wholesale_discount_percent` في Capabilities
- [x] الإدارة تضيف نسبة الخصم عند الموافقة
- [x] تطبيق الخصم تلقائياً في السلة
- [x] تطبيق الخصم بعد العروض الترويجية
- [x] حفظ معلومات الخصم في الطلب
- [x] إرجاع معلومات الخصم في API

### المهندس:
- [x] حقل `jobTitle` في User Schema
- [x] التحقق من وجود jobTitle عند التسجيل
- [x] رسالة خطأ واضحة إذا كان jobTitle مفقوداً
- [x] حفظ jobTitle في قاعدة البيانات
- [x] منع المهندس من رؤية طلباته في nearby
- [x] منع المهندس من تقديم عرض على طلبه (كان موجوداً مسبقاً)
- [x] المهندس يشتري بشكل عادي (بدون خصم)

---

## 🧪 اختبارات موصى بها

### التاجر:
```bash
# 1. تسجيل تاجر
POST /auth/verify-otp
{ "capabilityRequest": "wholesale", ... }

# 2. موافقة الإدارة
POST /auth/admin/approve
{ "capability": "wholesale", "approve": true, "wholesaleDiscountPercent": 15 }

# 3. التحقق من الخصم
GET /cart/preview
# توقع: wholesaleDiscountPercent = 15

# 4. إنشاء طلب
POST /checkout/confirm
# توقع: الطلب يحتوي على wholesaleDiscountPercent و wholesaleDiscountAmount
```

### المهندس:
```bash
# 1. تسجيل بدون jobTitle (يجب أن يفشل)
POST /auth/verify-otp
{ "capabilityRequest": "engineer", "jobTitle": null }
# توقع: AUTH_JOB_TITLE_REQUIRED

# 2. تسجيل مع jobTitle (يجب أن ينجح)
POST /auth/verify-otp
{ "capabilityRequest": "engineer", "jobTitle": "كهربائي" }
# توقع: نجاح

# 3. التحقق من jobTitle
GET /auth/me
# توقع: user.jobTitle = "كهربائي"

# 4. التحقق من عدم رؤية طلباته
# المهندس ينشئ طلب ثم يبحث
POST /services/requests
GET /services/requests/nearby
# توقع: طلبه لا يظهر في النتائج
```

---

## 🔒 الأمان

1. **خصم التاجر:**
   - ✅ يُحسب من السيرفر فقط
   - ✅ لا يمكن التلاعب به من العميل
   - ✅ محفوظ في الطلب للتقارير

2. **المهندس:**
   - ✅ لا يمكنه رؤية طلباته
   - ✅ لا يمكنه تقديم عرض على طلبه
   - ✅ التحقق من الصلاحيات في كل خطوة

---

## 📊 أمثلة سريعة

### خصم التاجر:
```
السعر الأصلي: 1000 ريال
عرض ترويجي (-10%): 900 ريال
خصم التاجر (15%): 765 ريال
─────────────────────────────────
مبلغ الخصم: 235 ريال (23.5%)
```

### المهندس:
```json
{
  "user": {
    "phone": "0555222222",
    "firstName": "خالد",
    "jobTitle": "كهربائي معتمد"  ⬅️
  },
  "capabilities": {
    "engineer_capable": true
  }
}
```

---

## 🚀 الخطوات التالية (اختياري)

1. إضافة endpoint لتحديث نسبة الخصم للتاجر
2. إضافة تقرير بمبيعات التجار
3. إضافة تخصصات متعددة للمهندس
4. إضافة تقييمات للمهندسين

---

## 📞 الدعم

للاستفسارات: فريق التطوير - Tagadodo

**آخر تحديث:** 13 أكتوبر 2025


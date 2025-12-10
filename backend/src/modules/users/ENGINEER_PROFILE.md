# بروفايل المهندس والتقييمات

## نظرة عامة

تم إنشاء نظام منفصل لإدارة بروفايل المهندس والتقييمات، مما يوفر:
- فصل واضح بين بيانات المستخدم الأساسية وبروفايل المهندس
- إدارة شاملة للتقييمات (النجوم + النص)
- حساب تلقائي للإحصائيات والتقييمات المجمعة
- قابلية التطوير المستقبلي

## الملفات المُنشأة

### 1. Schema
- `schemas/engineer-profile.schema.ts`: Schema بروفايل المهندس مع التقييمات

### 2. Service
- `services/engineer-profile.service.ts`: Service لإدارة البروفايل والتقييمات

### 3. Controller
- `controllers/engineer-profile.controller.ts`: Controller للـ API endpoints

### 4. DTOs
- `dto/engineer-profile.dto.ts`: DTOs للتحديث والاستعلام

## البنية

### EngineerProfile Schema

```typescript
{
  userId: ObjectId, // ربط بـ User
  bio?: string, // النبذة
  avatarUrl?: string, // رابط الأفاتار
  whatsappNumber?: string, // رقم الواتساب
  ratings: EngineerRating[], // قائمة التقييمات (كل تقييم له نص ونجوم)
  totalRatings: number, // إجمالي التقييمات
  averageRating: number, // المتوسط (محسوب تلقائياً)
  ratingDistribution: number[], // [5نجوم, 4نجوم, 3نجوم, 2نجوم, 1نجمة]
  totalCompletedServices: number,
  offersTotalProfit: {
    USD: number,
    YER: number,
    SAR: number
  },
  totalEarnings: number, // legacy aggregate (غير محول)
  specialties?: string[],
  yearsOfExperience?: number,
  certifications?: string[],
  languages?: string[]
}
```

### EngineerRating (التقييم الفردي)

```typescript
{
  score: number, // 1-5 (مطلوب)
  comment: string, // النص/التعليق (مطلوب)
  customerId: ObjectId, // العميل الذي قام بالتقييم
  customerName?: string, // اسم العميل
  serviceRequestId?: ObjectId, // طلب الخدمة المرتبط
  orderId?: ObjectId, // الطلب المرتبط
  ratedAt: Date // تاريخ التقييم
}
```

## API Endpoints

### 1. جلب بروفايل المهندس الحالي
```
GET /engineers/profile/me
Headers: Authorization: Bearer <token>
```

### 2. تحديث بروفايل المهندس
```
PUT /engineers/profile/me
Headers: Authorization: Bearer <token>
Body: {
  bio?: string,
  avatarUrl?: string,
  whatsappNumber?: string,
  specialties?: string[],
  yearsOfExperience?: number,
  certifications?: string[],
  languages?: string[]
}
```

### 3. جلب بروفايل مهندس معين
```
GET /engineers/profile/:engineerId
```

### 4. جلب تقييمات مهندس معين
```
GET /engineers/profile/:engineerId/ratings?page=1&limit=10&sortBy=recent&minScore=4
```

### 5. جلب تقييمات المهندس الحالي
```
GET /engineers/profile/me/ratings?page=1&limit=10&sortBy=recent
Headers: Authorization: Bearer <token>
```

## التكامل التلقائي

### عند إضافة تقييم لطلب خدمة

عند استدعاء `rate()` في `ServicesService`:
1. يتم حفظ التقييم في `ServiceRequest`
2. يتم إضافة التقييم تلقائياً إلى `EngineerProfile`
3. يتم إعادة حساب `averageRating` و `ratingDistribution` تلقائياً

### عند الموافقة على مهندس

يُنصح بإنشاء بروفايل تلقائياً:
```typescript
await engineerProfileService.createProfile(userId);
```

## المميزات

### 1. التقييمات الكاملة
- كل تقييم يحتوي على **النجوم (1-5)** و **النص/التعليق** (مطلوب)
- لا يمكن إضافة تقييم بدون نص

### 2. الحساب التلقائي
- يتم حساب `averageRating` تلقائياً من التقييمات
- يتم حساب `ratingDistribution` تلقائياً
- يتم تحديث الإحصائيات عند إضافة تقييم جديد

### 3. الفصل الواضح
- `User` schema: بيانات المصادقة والحساب الأساسية
- `EngineerProfile` schema: بيانات البروفايل والتقييمات
- لا يؤثر على تسجيل الدخول أو المصادقة

### 4. قابلية التطوير
- يمكن إضافة حقول جديدة بسهولة (specialties, certifications, etc.)
- يمكن إضافة ميزات جديدة (portfolio, gallery, etc.)

## الاستخدام

### إنشاء بروفايل للمهندس
```typescript
const profile = await engineerProfileService.createProfile(userId);
```

### تحديث البروفايل
```typescript
await engineerProfileService.updateProfile(userId, {
  bio: 'مهندس محترف...',
  avatarUrl: 'https://cdn.example.com/avatar.jpg',
  whatsappNumber: '967711234567',
  specialties: ['ميكانيك', 'كهرباء'],
  yearsOfExperience: 10
});
```

### جلب التقييمات
```typescript
const result = await engineerProfileService.getRatings(engineerId, {
  page: 1,
  limit: 10,
  sortBy: 'recent', // أو 'top' أو 'oldest'
  minScore: 4 // اختياري
});
```

### مزامنة التقييمات من ServiceRequest
```typescript
await engineerProfileService.syncRatings(engineerId);
```

## ملاحظات مهمة

1. **التعليق مطلوب**: لا يمكن إضافة تقييم بدون نص/تعليق
2. **النجوم من 1-5**: يجب أن يكون التقييم بين 1 و 5
3. **الحساب التلقائي**: يتم حساب الإحصائيات تلقائياً عند الحفظ
4. **الفصل الواضح**: بروفايل المهندس منفصل تماماً عن User schema

## التطوير المستقبلي

يمكن إضافة:
- معرض أعمال (portfolio)
- صور المشاريع السابقة
- أوقات العمل المتاحة
- مناطق الخدمة
- أسعار الخدمات
- نظام الحجوزات


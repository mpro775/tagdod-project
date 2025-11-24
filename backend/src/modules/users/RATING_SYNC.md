# نظام مزامنة التقييمات بين ServiceRequest و EngineerProfile

## المشكلة

يوجد تعارض محتمل بين:
- **`ServiceRating`** في `ServiceRequest` - تقييم الخدمة المحددة
- **`EngineerRating`** في `EngineerProfile` - تقييم المهندس

**المشكلة**: تقييم الخدمة هو في الواقع تقييم للمهندس، لذا يجب أن يكون هناك تزامن بينهما.

## الحل المطبق

### 1. المبدأ الأساسي
- **`ServiceRating`** في `ServiceRequest` هو **المصدر الأساسي (Source of Truth)** للخدمة المحددة
- **`EngineerRating`** في `EngineerProfile` هو **نسخة مزامنة** من التقييم في بروفايل المهندس
- عند إضافة/تحديث/حذف التقييم في `ServiceRequest`، يتم تحديث `EngineerProfile` تلقائياً

### 2. منع التكرار
- يتم التحقق من وجود تقييم سابق لنفس `serviceRequestId` قبل الإضافة
- إذا كان موجوداً، يتم **تحديثه** بدلاً من إضافة جديد
- إذا لم يكن موجوداً، يتم **إضافته** كتقييم جديد

### 3. التحديث التلقائي
عند استدعاء `rate()` في `ServicesService`:
1. يتم حفظ التقييم في `ServiceRequest.rating`
2. يتم استدعاء `addRatingFromServiceRequest()` في `EngineerProfileService`
3. يتم التحقق من وجود تقييم سابق لنفس `serviceRequestId`
4. إذا كان موجوداً: يتم تحديثه
5. إذا لم يكن موجوداً: يتم إضافته
6. يتم إعادة حساب `averageRating` و `ratingDistribution` تلقائياً

### 4. الحذف التلقائي
عند حذف التقييم من `ServiceRequest` (إن أمكن):
- يمكن استدعاء `removeRatingFromServiceRequest()` لحذف التقييم من `EngineerProfile`

## الكود

### في ServicesService.rate()
```typescript
async rate(userId: string, id: string, score: number, comment?: string) {
  // ... التحقق من صحة البيانات ...
  
  // حفظ التقييم في ServiceRequest
  r.rating = { score, comment: comment.trim(), at: new Date() };
  r.status = 'RATED';
  await r.save();

  // مزامنة التقييم مع EngineerProfile
  if (r.engineerId && this.engineerProfileService) {
    await this.engineerProfileService.addRatingFromServiceRequest(
      r.engineerId.toString(),
      r._id.toString(),
      userId,
      score,
      comment.trim(),
    );
  }
  
  return { ok: true };
}
```

### في EngineerProfileService.addRatingFromServiceRequest()
```typescript
async addRatingFromServiceRequest(
  engineerId: string,
  serviceRequestId: string,
  customerId: string,
  score: number,
  comment: string,
): Promise<EngineerProfileDocument> {
  // ... التحقق من صحة البيانات ...
  
  // التحقق من وجود تقييم سابق
  const existingRatingIndex = profile.ratings.findIndex(
    (r) => r.serviceRequestId?.toString() === serviceRequestObjectId.toString(),
  );

  if (existingRatingIndex >= 0) {
    // تحديث التقييم الموجود
    profile.ratings[existingRatingIndex] = {
      score,
      comment: comment.trim(),
      customerId: customerObjectId,
      customerName,
      serviceRequestId: serviceRequestObjectId,
      ratedAt: new Date(),
    };
  } else {
    // إضافة تقييم جديد
    profile.addRating(newRating);
  }
  
  // إعادة حساب الإحصائيات
  profile.calculateRatings();
  return await profile.save();
}
```

## الفوائد

### 1. عدم التكرار
- لا يمكن إضافة تقييمين لنفس الخدمة
- إذا تم تعديل التقييم، يتم تحديثه بدلاً من إضافة جديد

### 2. التزامن التلقائي
- أي تغيير في `ServiceRequest.rating` ينعكس تلقائياً على `EngineerProfile`
- لا حاجة لمزامنة يدوية

### 3. الاتساق
- `ServiceRequest.rating` هو المصدر الأساسي
- `EngineerProfile.ratings` هو تجميع لجميع التقييمات

### 4. الأداء
- يتم تحديث التقييم الموجود بدلاً من إضافة جديد وحذف القديم
- يتم إعادة حساب الإحصائيات تلقائياً

## السيناريوهات

### السيناريو 1: إضافة تقييم جديد
1. العميل يقيم الخدمة لأول مرة
2. يتم حفظ التقييم في `ServiceRequest.rating`
3. يتم إضافة التقييم إلى `EngineerProfile.ratings`
4. يتم إعادة حساب `averageRating` و `ratingDistribution`

### السيناريو 2: تعديل تقييم موجود
1. العميل يعدل التقييم (نفس الخدمة)
2. يتم تحديث `ServiceRequest.rating`
3. يتم العثور على التقييم الموجود في `EngineerProfile.ratings`
4. يتم تحديثه بدلاً من إضافة جديد
5. يتم إعادة حساب الإحصائيات

### السيناريو 3: حذف التقييم (إن أمكن)
1. يتم حذف التقييم من `ServiceRequest.rating`
2. يتم استدعاء `removeRatingFromServiceRequest()`
3. يتم حذف التقييم من `EngineerProfile.ratings`
4. يتم إعادة حساب الإحصائيات

## ملاحظات مهمة

1. **`serviceRequestId` هو المفتاح الفريد**: يتم استخدامه للتحقق من وجود تقييم سابق
2. **التحديث التلقائي**: أي تغيير في `ServiceRequest.rating` ينعكس على `EngineerProfile`
3. **الحساب التلقائي**: يتم إعادة حساب `averageRating` و `ratingDistribution` تلقائياً
4. **عدم التكرار**: لا يمكن إضافة تقييمين لنفس الخدمة

## التطوير المستقبلي

يمكن إضافة:
- **تحديث التقييم**: endpoint لتحديث تقييم موجود
- **حذف التقييم**: endpoint لحذف تقييم (مع التحقق من الصلاحيات)
- **تاريخ التعديل**: تتبع آخر تعديل للتقييم
- **نسخة احتياطية**: حفظ تاريخ التقييمات السابقة


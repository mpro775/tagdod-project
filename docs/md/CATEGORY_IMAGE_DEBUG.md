# 🖼️ تصحيح صور الفئات - Category Image Debug Guide

## 🔍 خطوات التحقق

### 1. **تحقق من Console**

عند رفع/اختيار صورة في صفحة الفئة، افتح Console (F12) وابحث عن:

```
🖼️ ImageField onChange - media: {...}
🆔 Extracted mediaId: "..."
📤 Category form data: {...}
🖼️ Selected image: {...}
📦 Category data to send: { imageId: "..." }
```

### 2. **تحقق من البيانات المُرسلة**

في Network tab (F12 → Network):
- ابحث عن request إلى `/api/v1/admin/categories`
- تحقق من Request Payload:

```json
{
  "name": "قواطع",
  "nameEn": "breakers",
  "imageId": "67890abc123..."  // ✅ يجب أن يكون موجوداً
}
```

### 3. **تحقق من Response**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "قواطع",
    "imageId": "67890abc123..."  // ✅ يجب أن يُحفظ
  }
}
```

### 4. **تحقق من قاعدة البيانات**

في MongoDB Compass/Shell:

```javascript
// تحقق من الفئة
db.categories.findOne({ _id: ObjectId("6900794a8314b77977418889") })

// يجب أن ترى:
{
  "_id": "...",
  "name": "قواطع",
  "imageId": ObjectId("...")  // ✅ موجود
}
```

### 5. **تحقق من Media في قاعدة البيانات**

```javascript
// تحقق من أن الصورة موجودة
db.media.findOne({ _id: ObjectId("...") })

// يجب أن ترى:
{
  "_id": "...",
  "url": "/uploads/...",
  "filename": "...",
  "mimetype": "image/jpeg"
}
```

---

## 🐛 المشاكل المحتملة وحلولها

### المشكلة 1: imageId لا يُرسل

#### السبب:
```typescript
// قد يكون media object يحتوي على:
{ _id: "123" }  // ❌ لكن الكود يبحث عن id
{ id: "123" }   // ✅
```

#### الحل:
```typescript
// في CategoryFormPage.tsx (تم تطبيقه)
const mediaId = media?._id || media?.id || '';
methods.setValue('imageId', mediaId);
```

### المشكلة 2: imageId يُرسل لكن لا يُحفظ

#### التحقق:
```javascript
// في MongoDB
db.categories.findOne({ _id: ObjectId("...") })
// هل imageId موجود؟
```

#### الحل:
```typescript
// في backend/categories.service.ts
const category = await this.categoryModel.create({
  ...dto,  // ✅ يحفظ جميع الحقول بما فيها imageId
  slug,
  order: dto.order || 0,
  // ...
});
```

### المشكلة 3: imageId يُحفظ لكن لا يُرجع

#### التحقق:
```bash
GET /api/v1/admin/categories/:id
# هل imageId موجود في Response؟
```

#### الحل:
```typescript
// في categories.service.ts (موجود بالفعل)
const category = await this.categoryModel
  .findById(id)
  .populate('imageId')  // ✅ يُرجع Media object كامل
  .lean();
```

### المشكلة 4: populate لا يعمل

#### السبب المحتمل:
- Media model غير مُسجل
- ref في Schema خاطئ

#### التحقق:
```typescript
// في category.schema.ts
@Prop({ type: Types.ObjectId, ref: 'Media' })  // ✅ الاسم صحيح؟
imageId?: string;
```

#### الحل:
تأكد من أن:
1. Media model مُسجل في AppModule
2. ref name = 'Media' (نفس اسم الـ model)

---

## ✅ الكود الصحيح المُطبق

### Frontend - CategoryFormPage.tsx:

```typescript
// عند التحميل (Load)
if (category.imageId) {
  if (typeof category.imageId === 'string') {
    imageId = category.imageId;
    imageData = { 
      id: imageId,
      _id: imageId, 
      url: `${baseURL}/uploads/${imageId}` 
    };
  } else if (typeof category.imageId === 'object') {
    imageId = category.imageId._id || category.imageId.id;
    imageData = {
      id: imageId,
      _id: imageId,
      url: category.imageId.url,
      filename: category.imageId.filename,
    };
  }
}

// عند التغيير (onChange)
onChange={(media: any) => {
  setSelectedImage(media);
  const mediaId = media?._id || media?.id || '';  // ✅ يدعم كلاهما
  methods.setValue('imageId', mediaId);
}}

// عند الحفظ (Submit)
imageId: selectedImage?.id || selectedImage?._id || data.imageId || undefined
```

### Backend - categories.service.ts:

```typescript
// Create
const category = await this.categoryModel.create({
  ...dto,  // ✅ imageId مضمن
  slug,
  // ...
});

// Get
const category = await this.categoryModel
  .findById(id)
  .populate('imageId')  // ✅ يُرجع Media object
  .lean();

// List
const categories = await this.categoryModel
  .find(q)
  .populate('imageId')  // ✅ يُرجع Media object
  .sort({ order: 1 })
  .lean();
```

---

## 🎯 خطوات الاختبار المباشر

### 1. **إضافة فئة جديدة**:
```
1. Navigate to /categories/new
2. املأ الاسم (عربي + English)
3. اذهب للخطوة 2 (الصور)
4. اختر صورة من المكتبة أو ارفع جديدة
5. افتح Console → ابحث عن:
   🖼️ ImageField onChange
   🆔 Extracted mediaId
6. اذهب للخطوة 4 وأحفظ
7. افتح Console → ابحث عن:
   📦 Category data to send: { imageId: "..." }
8. تحقق من Network → Request Payload
```

### 2. **تعديل فئة**:
```
1. Navigate to /categories/:id
2. تحقق من Console:
   هل imageId موجود في category data؟
3. غيّر الصورة
4. احفظ
5. تحقق من Console والNetwork
```

### 3. **عرض الصور**:
```
1. Navigate to /categories
2. هل الصور تظهر في القائمة؟
3. افتح DevTools → Elements
4. ابحث عن <img src="...">
5. تحقق من src attribute
```

---

## 🔧 إصلاحات إضافية مقترحة

### إذا استمرت المشكلة:

#### 1. **تحديث CategoryImage.tsx**:
```typescript
const getImageUrl = (image: string | Media): string | undefined => {
  if (!image) return undefined;
  
  if (typeof image === 'string') {
    // إذا URL كامل
    if (image.startsWith('http') || image.startsWith('/')) {
      return image;
    }
    // إذا ID
    return `${baseURL}/uploads/${image}`;
  }
  
  // إذا Media object
  return image?.url || image?.path;
};
```

#### 2. **تحديث onSubmit في CategoryFormPage**:
```typescript
const onSubmit = (data: CategoryFormData) => {
  // استخراج imageId بشكل أكثر شمولاً
  let finalImageId = undefined;
  
  if (selectedImage) {
    finalImageId = selectedImage._id || selectedImage.id;
  } else if (data.imageId) {
    finalImageId = data.imageId;
  }
  
  const categoryData = {
    ...data,
    imageId: finalImageId,
  };
  
  console.log('📦 Final category data:', categoryData);
  // إرسال...
};
```

---

## ✅ الملفات المعدلة

- ✅ `admin-dashboard/src/features/categories/pages/CategoryFormPage.tsx`
  - إضافة console.log
  - إصلاح استخراج imageId (_id || id)
  - تحسين تحميل الصورة

- ✅ `backend/src/modules/categories/dto/category.dto.ts`
  - إضافة parentId في UpdateCategoryDto

---

**جرّب الآن وتحقق من Console للمزيد من المعلومات!** 🔍

تاريخ: 2025-10-29


# نظام إدارة الميديا (Media Management System)

نظام شامل لإدارة الوسائط والملفات مع تكامل كامل مع Bunny CDN.

## الميزات

### 🎯 الميزات الأساسية
- ✅ رفع ملفات متعددة الأنواع (صور، فيديوهات، مستندات)
- ✅ تكامل مع Bunny CDN للتخزين السحابي
- ✅ إدارة الفئات والوسوم
- ✅ البحث والفلترة المتقدمة
- ✅ عرض شبكي وقائمة
- ✅ إحصائيات مفصلة

### 🔧 الميزات المتقدمة
- ✅ Soft Delete مع إمكانية الاستعادة
- ✅ إدارة الصلاحيات (عام/خاص)
- ✅ تتبع استخدام الملفات
- ✅ معاينة الصور قبل الرفع
- ✅ نسخ الروابط بسهولة
- ✅ تحسين الصور تلقائياً
- ✅ **مكون اختيار الصور من المكتبة**
- ✅ **مكون حقل الصورة المتكامل**
- ✅ **تكامل مع نماذج المنتجات والفئات والبراندات والبانرات**

## البنية

```
src/features/media/
├── api/
│   └── mediaApi.ts          # خدمات API
├── components/
│   ├── MediaUploader.tsx    # مكون رفع الملفات
│   ├── MediaListItem.tsx    # مكون عرض الملف في القائمة
│   ├── MediaPicker.tsx      # مكون اختيار الصور من المكتبة
│   └── ImageField.tsx       # مكون حقل الصورة المتكامل
├── hooks/
│   └── useMedia.ts          # React Query hooks
├── pages/
│   └── MediaLibraryPage.tsx # الصفحة الرئيسية
├── types/
│   └── media.types.ts       # أنواع البيانات
├── index.ts                 # تصدير المكونات
└── README.md               # هذا الملف
```

## الاستخدام

### 1. رفع ملف جديد

```tsx
import { MediaUploader } from '@/features/media';

<MediaUploader
  open={uploadDialogOpen}
  onClose={() => setUploadDialogOpen(false)}
  onSuccess={() => refetch()}
/>
```

### 2. عرض مكتبة الميديا

```tsx
import { MediaLibraryPage } from '@/features/media';

// في التوجيه
<Route path="/media" element={<MediaLibraryPage />} />
```

### 3. استخدام hooks

```tsx
import { useMedia, useUploadMedia } from '@/features/media';

// جلب قائمة الملفات
const { data, isLoading } = useMedia({
  page: 1,
  limit: 24,
  category: 'product',
  search: 'بحث'
});

// رفع ملف
const { mutate: upload } = useUploadMedia();
upload({ file, data: { name, category, description } });
```

### 4. استخدام مكون حقل الصورة

```tsx
import { ImageField } from '@/features/media';

<ImageField
  label="صورة المنتج"
  value={selectedImage}
  onChange={(media) => setSelectedImage(media)}
  category="product"
  helperText="يمكنك اختيار صورة من المكتبة أو رفع صورة جديدة"
/>
```

### 5. استخدام مكون اختيار الصور

```tsx
import { MediaPicker } from '@/features/media';

<MediaPicker
  open={pickerOpen}
  onClose={() => setPickerOpen(false)}
  onSelect={(media) => setSelectedMedia(media)}
  category="product"
  title="اختيار صورة المنتج"
  acceptTypes={['image']}
/>
```

## التكامل مع النماذج

تم تحديث جميع النماذج لاستخدام مكون `ImageField` بدلاً من حقول رابط الصورة التقليدية:

### ✅ النماذج المحدثة:
- **نموذج المنتجات**: حقل صورة المنتج
- **نموذج الفئات**: حقل صورة الفئة  
- **نموذج البراندات**: حقل شعار البراند
- **نموذج البانرات**: حقل صورة البانر

### 🎯 الميزات الجديدة:
- **اختيار من المكتبة**: تصفح واختيار الصور الموجودة
- **رفع مباشر**: رفع صور جديدة دون مغادرة النموذج
- **معاينة فورية**: عرض الصورة المختارة قبل الحفظ
- **تصنيف تلقائي**: تصنيف الصور حسب نوع النموذج
- **إدارة سهلة**: تعديل أو حذف الصورة بسهولة

### 💡 مثال على الاستخدام:

```tsx
// في نموذج المنتج
<ImageField
  label="صورة المنتج"
  value={selectedImage}
  onChange={(media) => {
    setSelectedImage(media);
    methods.setValue('imageUrl', media?.url || '');
  }}
  category="product"
  helperText="يمكنك اختيار صورة من المكتبة أو رفع صورة جديدة"
/>
```

## أنواع الملفات المدعومة

### الصور
- JPEG/JPG
- PNG
- GIF
- WebP

### الفيديوهات
- MP4
- AVI
- MOV
- WebM

### المستندات
- PDF
- DOC/DOCX
- TXT

## الفئات المتاحة

- `product` - منتجات
- `category` - فئات
- `brand` - براندات
- `banner` - بانرات
- `other` - أخرى

## API Endpoints

### رفع ملف
```
POST /admin/media/upload
Content-Type: multipart/form-data
```

### قائمة الملفات
```
GET /admin/media?page=1&limit=24&category=product&search=بحث
```

### تحديث ملف
```
PATCH /admin/media/:id
```

### حذف ملف
```
DELETE /admin/media/:id
```

### استعادة ملف محذوف
```
POST /admin/media/:id/restore
```

### إحصائيات
```
GET /admin/media/stats/summary
```

## الإعدادات

### متغيرات البيئة المطلوبة
```env
BUNNY_STORAGE_ZONE=your-storage-zone-name
BUNNY_API_KEY=your-bunny-api-key
BUNNY_HOSTNAME=storage.bunnycdn.com
BUNNY_CDN_HOSTNAME=your-cdn-hostname.b-cdn.net
```

### حدود الملفات
- الحد الأقصى: 10MB لكل ملف
- الحد الأقصى للملفات المتعددة: 10 ملفات

## الأمان

- جميع العمليات تتطلب مصادقة JWT
- التحقق من أنواع الملفات
- توليد أسماء فريدة للملفات
- Soft Delete للحماية من الحذف العرضي

## التخصيص

يمكن تخصيص النظام من خلال:

1. **إضافة فئات جديدة**: تحديث `MediaCategory` enum
2. **تغيير حدود الملفات**: تحديث الإعدادات في الباك إند
3. **إضافة أنواع ملفات جديدة**: تحديث قائمة الملفات المقبولة
4. **تخصيص الواجهة**: تعديل مكونات React

## الدعم

للحصول على الدعم أو الإبلاغ عن مشاكل:
- راجع الوثائق في `backend/src/modules/upload/README.md`
- تحقق من logs في وحدة التحكم
- تأكد من إعدادات Bunny CDN

## الترخيص

هذا النظام جزء من مشروع Tagadodo وهو محمي بحقوق الطبع والنشر.

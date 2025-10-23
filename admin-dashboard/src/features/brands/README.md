# Brands Management System - نظام إدارة العلامات التجارية

نظام إدارة شامل للعلامات التجارية مع دعم كامل للغتين العربية والإنجليزية، متكامل مع الباك إند ومصمم باستخدام Material UI.

## المميزات الرئيسية ✨

### 🔧 العمليات الإدارية
- ✅ **إنشاء علامة تجارية جديدة** - مع دعم اللغتين العربية والإنجليزية
- ✅ **تعديل العلامات التجارية** - تحديث جميع البيانات
- ✅ **حذف العلامات التجارية** - مع تأكيد الحذف
- ✅ **تبديل حالة العلامة** - تفعيل/إيقاف العلامات
- ✅ **ترتيب العلامات** - نظام ترتيب مرن
- ✅ **البحث والفلترة** - بحث متقدم مع فلاتر متعددة

### 🎨 واجهة المستخدم
- ✅ **Material UI** - تصميم احترافي وحديث
- ✅ **Responsive Design** - متجاوب مع جميع الأجهزة
- ✅ **Loading States** - حالات التحميل والانتظار
- ✅ **Error Handling** - إدارة شاملة للأخطاء
- ✅ **Toast Notifications** - إشعارات تفاعلية

### 🌐 دعم اللغات
- ✅ **العربية والإنجليزية** - دعم كامل للغتين
- ✅ **Full-text Search** - بحث في المحتوى باللغتين
- ✅ **Language-aware Filtering** - فلترة حسب اللغة

## البنية التقنية 🏗️

```
src/features/brands/
├── types/
│   └── brand.types.ts          # أنواع البيانات
├── api/
│   └── brandsApi.ts            # طبقة API
├── hooks/
│   └── useBrands.ts            # Custom Hooks
├── components/
│   ├── BrandStatsCards.tsx     # بطاقات الإحصائيات
│   ├── BrandFilters.tsx       # فلاتر البحث
│   ├── BrandFormDialog.tsx    # نافذة النموذج
│   └── BrandDeleteDialog.tsx  # نافذة تأكيد الحذف
├── pages/
│   ├── BrandsListPage.tsx      # صفحة القائمة
│   └── BrandFormPage.tsx      # صفحة النموذج
├── index.ts                    # ملف التصدير
└── README.md                   # هذا الملف
```

## الاستخدام 📖

### 1. استيراد المكونات

```typescript
import {
  BrandsListPage,
  BrandFormPage,
  useBrands,
  useCreateBrand,
  brandsApi
} from '@/features/brands';
```

### 2. استخدام Hooks

```typescript
// جلب قائمة العلامات التجارية
const { data: brands, isLoading, error } = useBrands({
  page: 1,
  limit: 20,
  search: 'Apple',
  isActive: true,
  sortBy: 'name',
  sortOrder: 'asc'
});

// إنشاء علامة تجارية جديدة
const { mutate: createBrand, isPending } = useCreateBrand();

createBrand({
  name: 'أبل',
  nameEn: 'Apple',
  image: 'https://example.com/logo.png',
  description: 'شركة التكنولوجيا الرائدة',
  isActive: true,
  sortOrder: 0
});
```

### 3. استخدام API مباشرة

```typescript
import { brandsApi } from '@/features/brands';

// جلب العلامات التجارية
const brands = await brandsApi.list({
  page: 1,
  limit: 20,
  search: 'Samsung'
});

// إنشاء علامة تجارية
const newBrand = await brandsApi.create({
  name: 'سامسونج',
  nameEn: 'Samsung',
  image: 'https://example.com/samsung.png'
});
```

## أنواع البيانات 📊

### Brand Interface
```typescript
interface Brand {
  _id: string;
  name: string;              // الاسم بالعربية (مطلوب)
  nameEn: string;            // الاسم بالإنجليزية (مطلوب)
  slug: string;             // Auto-generated
  image: string;             // صورة العلامة (مطلوبة)
  description?: string;      // الوصف بالعربية
  descriptionEn?: string;    // الوصف بالإنجليزية
  isActive: boolean;         // حالة النشاط
  sortOrder: number;        // ترتيب العرض
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Response Format
```typescript
// استجابة موحدة
{
  "success": true,
  "data": {
    "data": [...brands],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

## المكونات المتاحة 🧩

### BrandStatsCards
بطاقات عرض إحصائيات العلامات التجارية
```tsx
<BrandStatsCards />
```

### BrandFilters
فلاتر البحث والفلترة المتقدمة
```tsx
<BrandFilters
  filters={filters}
  onFiltersChange={handleFiltersChange}
  onReset={handleReset}
  loading={isLoading}
/>
```

### BrandFormDialog
نافذة إضافة/تعديل العلامة التجارية
```tsx
<BrandFormDialog
  open={open}
  onClose={handleClose}
  brand={brand}
  mode="create" // أو "edit"
/>
```

### BrandDeleteDialog
نافذة تأكيد حذف العلامة التجارية
```tsx
<BrandDeleteDialog
  open={open}
  onClose={handleClose}
  onConfirm={handleConfirm}
  brand={brand}
  loading={isDeleting}
/>
```

## الصفحات المتاحة 📄

### BrandsListPage
الصفحة الرئيسية لإدارة العلامات التجارية
- عرض قائمة العلامات التجارية
- فلاتر البحث المتقدمة
- إحصائيات العلامات التجارية
- عمليات CRUD كاملة

### BrandFormPage
صفحة إضافة/تعديل العلامة التجارية
- نموذج شامل للبيانات
- دعم اللغتين العربية والإنجليزية
- رفع وإدارة الصور
- التحقق من صحة البيانات

## التكامل مع الباك إند 🔗

### Endpoints المدعومة
```
POST   /admin/brands                    - إنشاء علامة تجارية
GET    /admin/brands                    - قائمة العلامات التجارية
GET    /admin/brands/:id                - علامة تجارية محددة
PATCH  /admin/brands/:id                - تحديث علامة تجارية
DELETE /admin/brands/:id                - حذف علامة تجارية
PATCH  /admin/brands/:id/toggle-status - تبديل الحالة
GET    /admin/brands/stats              - إحصائيات العلامات التجارية
```

### معاملات البحث والفلترة
```typescript
interface ListBrandsParams {
  page?: number;           // رقم الصفحة
  limit?: number;          // عدد العناصر في الصفحة
  search?: string;         // البحث في الاسم والوصف
  isActive?: boolean;      // فلترة حسب الحالة
  sortBy?: 'name' | 'nameEn' | 'createdAt' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
  language?: 'ar' | 'en';   // اللغة المفضلة
}
```

## إدارة الأخطاء ⚠️

### Error Handling
```typescript
// في Hooks
const { data, error, isLoading } = useBrands();

if (error) {
  console.error('خطأ في جلب البيانات:', error.message);
}

// في API
try {
  const brand = await brandsApi.create(data);
} catch (error) {
  console.error('فشل في إنشاء العلامة:', error.message);
}
```

### Toast Notifications
```typescript
// تلقائية في Hooks
const { mutate: createBrand } = useCreateBrand();
// سيظهر toast تلقائياً عند النجاح أو الفشل

// يدوياً
import toast from 'react-hot-toast';
toast.success('تم إنشاء العلامة بنجاح');
toast.error('فشل في إنشاء العلامة');
```

## الأداء والتحسين 🚀

### Caching Strategy
- **React Query** للكاش الذكي
- **Stale Time** محسن (5-10 دقائق)
- **Background Refetch** تلقائي
- **Optimistic Updates** للعمليات السريعة

### Loading States
- **Skeleton Loading** للبيانات
- **Progressive Loading** للمكونات
- **Error Boundaries** للأخطاء

## الأمان 🔒

### Authentication
- **JWT Token** مطلوب لجميع العمليات
- **Role-based Access** (Admin/Super Admin)
- **Permission Checks** في كل عملية

### Validation
- **Client-side Validation** مع Zod
- **Server-side Validation** في الباك إند
- **Type Safety** مع TypeScript

## التطوير المستقبلي 🔮

### المميزات المخططة
- [ ] **Bulk Operations** - عمليات مجمعة
- [ ] **Import/Export** - استيراد وتصدير البيانات
- [ ] **Analytics Dashboard** - لوحة تحليلات متقدمة
- [ ] **Brand Templates** - قوالب جاهزة للعلامات
- [ ] **SEO Optimization** - تحسين محركات البحث

### التحسينات التقنية
- [ ] **Virtual Scrolling** للقوائم الكبيرة
- [ ] **Real-time Updates** مع WebSocket
- [ ] **Offline Support** مع Service Workers
- [ ] **Progressive Web App** دعم

## الدعم والمساعدة 🆘

### المشاكل الشائعة
1. **خطأ في التحميل**: تأكد من صحة API endpoint
2. **مشكلة في الصور**: تحقق من صحة URL الصورة
3. **خطأ في التحقق**: راجع قواعد Validation

### التطوير المحلي
```bash
# تثبيت التبعيات
npm install

# تشغيل في وضع التطوير
npm run dev

# بناء للإنتاج
npm run build
```

---

**تم تطوير هذا النظام بواسطة فريق التطوير**  
**آخر تحديث: ديسمبر 2024**

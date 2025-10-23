# Categories Feature - Enhanced Admin Interface

## نظرة عامة

تم تحسين نظام إدارة الفئات بالكامل ليتوافق مع العمليات الإدارية في الباك إند، مع استخدام Material UI حصرياً لبناء واجهة احترافية وحديثة.

## الميزات الجديدة

### 🔧 العمليات الإدارية الكاملة
- ✅ إنشاء فئة جديدة
- ✅ عرض قائمة الفئات مع فلترة وبحث
- ✅ عرض شجرة الفئات الهرمية
- ✅ عرض فئة واحدة مع التفاصيل
- ✅ تحديث فئة
- ✅ حذف مؤقت (Soft Delete)
- ✅ استعادة فئة محذوفة
- ✅ حذف نهائي (Super Admin فقط)
- ✅ تحديث إحصائيات الفئة
- ✅ إحصائيات عامة

### 🎨 واجهة مستخدم محسنة
- **إحصائيات تفاعلية**: بطاقات إحصائيات مع تحديث فوري
- **فلترة متقدمة**: بحث وفلترة متعددة المعايير
- **عرض شجري**: عرض هرمي للفئات مع إحصائيات
- **نموذج متدرج**: إنشاء/تعديل الفئات بخطوات منظمة
- **حوارات تأكيد**: تأكيد العمليات الحساسة
- **تحميل ذكي**: Skeleton loaders وتحسينات UX

### 📊 مكونات جديدة

#### CategoryStatsCards
```typescript
<CategoryStatsCards onRefresh={handleRefresh} />
```
- عرض إحصائيات شاملة للفئات
- تحديث فوري للإحصائيات
- تصميم responsive مع MUI Cards

#### CategoryFilters
```typescript
<CategoryFilters onFiltersChange={handleFiltersChange} />
```
- فلترة متقدمة بالبحث والتصنيف
- فلترة حسب الفئة الأب والحالة
- عرض الفلاتر النشطة مع إمكانية المسح

#### CategoryTreeView (محسن)
```typescript
<CategoryTreeView 
  onEdit={handleEdit}
  onDelete={handleDelete}
  onAdd={handleAdd}
  showStats={true}
/>
```
- عرض شجري تفاعلي
- إحصائيات سريعة
- إجراءات مباشرة على كل فئة

## البنية التقنية

### API Layer
```typescript
// categoriesApi.ts - متطابق مع Backend
export const categoriesApi = {
  create: async (data: CreateCategoryDto): Promise<Category>
  list: async (params: ListCategoriesParams): Promise<Category[]>
  getTree: async (): Promise<CategoryTreeNode[]>
  getById: async (id: string): Promise<Category>
  update: async (id: string, data: UpdateCategoryDto): Promise<Category>
  delete: async (id: string): Promise<{deleted: boolean; deletedAt: Date}>
  restore: async (id: string): Promise<{restored: boolean}>
  permanentDelete: async (id: string): Promise<{deleted: boolean; message: string}>
  updateStats: async (id: string): Promise<{updated: boolean; productCount: number}>
  getStats: async (): Promise<CategoryStats>
}
```

### Hooks Layer
```typescript
// useCategories.ts - React Query hooks
export const useCategories = (params: ListCategoriesParams)
export const useCategoryTree = ()
export const useCategory = (id: string)
export const useCreateCategory = ()
export const useUpdateCategory = ()
export const useDeleteCategory = ()
export const useRestoreCategory = ()
export const usePermanentDeleteCategory = ()
export const useUpdateCategoryStats = ()
export const useCategoryStats = ()
```

### Types Layer
```typescript
// category.types.ts - متطابق مع Backend Schema
export interface Category extends BaseEntity {
  parentId: string | null;
  name: string; // Arabic
  nameEn: string; // English
  slug: string;
  description?: string;
  descriptionEn?: string;
  imageId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  productsCount: number;
  childrenCount: number;
  deletedAt?: Date | null;
  deletedBy?: string;
  parent?: Category;
  children?: Category[];
}
```

## الصفحات المحسنة

### CategoriesListPage
- **إحصائيات في الأعلى**: CategoryStatsCards
- **فلترة متقدمة**: CategoryFilters
- **تبديل العرض**: قائمة أو شجرة
- **جدول محسن**: أعمدة جديدة مع إجراءات متقدمة
- **حوارات تأكيد**: للحذف والعمليات الحساسة

### CategoryFormPage
- **نموذج متدرج**: 4 خطوات منظمة
  1. المعلومات الأساسية
  2. الصور والوسائط
  3. تحسين محركات البحث
  4. الإعدادات
- **تحميل ذكي**: Skeleton loaders
- **تنقل سهل**: أزرار السابق/التالي
- **تحقق من البيانات**: Zod validation

## التصميم والـ UX

### Material UI Components
- **Cards**: للإحصائيات والمحتوى
- **Chips**: للعلامات والحالات
- **Dialogs**: للتأكيدات
- **Steppers**: للنماذج المتدرجة
- **Skeletons**: للتحميل
- **Alerts**: للتنبيهات
- **Tooltips**: للمساعدة

### Responsive Design
- **Grid System**: تخطيط متجاوب
- **Breakpoints**: xs, sm, md, lg, xl
- **Mobile First**: تصميم محسن للهواتف

### Accessibility
- **ARIA Labels**: للقارئات الصوتية
- **Keyboard Navigation**: التنقل بالكيبورد
- **Color Contrast**: تباين ألوان مناسب
- **Focus Management**: إدارة التركيز

## الاستخدام

### إضافة فئة جديدة
```typescript
// 1. انتقل إلى /categories/new
// 2. املأ المعلومات الأساسية
// 3. أضف الصور والوسائط
// 4. أدخل بيانات SEO
// 5. حدد الإعدادات
// 6. احفظ الفئة
```

### إدارة الفئات
```typescript
// عرض قائمة الفئات
<CategoriesListPage />

// فلترة الفئات
<CategoryFilters onFiltersChange={setFilters} />

// عرض الإحصائيات
<CategoryStatsCards onRefresh={handleRefresh} />
```

### العمليات المتقدمة
```typescript
// حذف مؤقت
const { mutate: deleteCategory } = useDeleteCategory();

// استعادة فئة محذوفة
const { mutate: restoreCategory } = useRestoreCategory();

// حذف نهائي (Super Admin)
const { mutate: permanentDelete } = usePermanentDeleteCategory();

// تحديث الإحصائيات
const { mutate: updateStats } = useUpdateCategoryStats();
```

## التكامل مع Backend

### Response Format
```typescript
// جميع الردود تتبع النمط الموحد
{
  "success": true,
  "data": {
    "data": [...],
    "meta": {...}
  }
}

// في حالة الخطأ
{
  "success": false,
  "error": {
    "message": "خطأ في العملية",
    "code": "ERROR_CODE"
  }
}
```

### Error Handling
```typescript
// معالجة الأخطاء الموحدة
try {
  const result = await categoriesApi.create(data);
  toast.success('تم إنشاء الفئة بنجاح');
} catch (error) {
  ErrorHandler.showError(error);
}
```

## الأداء والتحسين

### React Query
- **Caching**: تخزين مؤقت ذكي
- **Background Updates**: تحديثات في الخلفية
- **Optimistic Updates**: تحديثات تفاؤلية
- **Error Retry**: إعادة المحاولة التلقائية

### Bundle Optimization
- **Code Splitting**: تقسيم الكود
- **Lazy Loading**: تحميل كسول
- **Tree Shaking**: إزالة الكود غير المستخدم

## الاختبار

### Unit Tests
```bash
npm test categories
```

### Integration Tests
```bash
npm run test:integration categories
```

### E2E Tests
```bash
npm run test:e2e categories
```

## المساهمة

### إضافة ميزة جديدة
1. أضف النوع في `category.types.ts`
2. أضف API method في `categoriesApi.ts`
3. أضف hook في `useCategories.ts`
4. أضف المكون في `components/`
5. حدث الصفحات حسب الحاجة

### إرشادات التطوير
- استخدم TypeScript حصرياً
- اتبع Material UI Design System
- اكتب tests للوظائف الجديدة
- وثق التغييرات في README

## الدعم

للحصول على المساعدة:
- راجع الوثائق التقنية
- تحقق من console للأخطاء
- استخدم React DevTools
- راجع Network tab للـ API calls

---

**تم التطوير بواسطة**: فريق التطوير  
**آخر تحديث**: ديسمبر 2024  
**الإصدار**: 2.0.0

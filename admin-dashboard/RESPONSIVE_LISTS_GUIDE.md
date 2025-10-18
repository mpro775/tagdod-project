# دليل القوائم المتجاوبة 📱💻

## نظرة عامة
تم تطوير نظام متقدم للقوائم المتجاوبة التي تتحول تلقائياً من DataGrid إلى بطاقات (Card list) على الشاشات الصغيرة لتحسين تجربة المستخدم على الموبايل.

## 🎯 الميزات الرئيسية

### 1. التبديل التلقائي
- **DataGrid**: للشاشات الكبيرة (Desktop/Tablet)
- **Card List**: للشاشات الصغيرة (Mobile)
- **Breakpoints قابلة للتخصيص**: xs, sm, md

### 2. مكونات البطاقات المتخصصة
- **UserCard**: بطاقات المستخدمين مع الأدوار والصلاحيات
- **ProductCard**: بطاقات المنتجات مع الصور والأسعار
- **OrderCard**: بطاقات الطلبات مع تفاصيل العميل والحالة

### 3. حالات UX موحدة
- **Loading**: تحميل مع Skeleton
- **Empty**: حالة فارغة مع إجراءات
- **Error**: معالجة الأخطاء مع إعادة المحاولة

## 🛠️ المكونات الأساسية

### useBreakpoint Hook
```tsx
import { useBreakpoint, useCardLayout } from '@/shared/hooks/useBreakpoint';

const MyComponent = () => {
  const { isMobile, isTablet, isDesktop, current } = useBreakpoint();
  const useCardLayout = useCardLayout('sm'); // تبديل عند sm وأقل
  
  return (
    <div>
      {useCardLayout ? <CardView /> : <GridView />}
    </div>
  );
};
```

### ResponsiveListWrapper
```tsx
import { ResponsiveListWrapper } from '@/shared/components/ResponsiveList';

<ResponsiveListWrapper
  data={data}
  loading={isLoading}
  error={error}
  columns={columns}
  CardComponent={UserCard}
  getRowId={(item) => item.id}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
  showActions={true}
  cardBreakpoint="md"
  emptyMessage="لا يوجد بيانات"
  emptyDescription="لم يتم العثور على أي عناصر"
  errorMessage="حدث خطأ أثناء التحميل"
/>
```

## 📱 بطاقات العناصر

### UserCard
```tsx
import { UserCard } from '@/shared/components/Cards';

<UserCard
  user={user}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
  onToggleStatus={handleToggleStatus}
  showActions={true}
/>
```

**الميزات:**
- عرض صورة المستخدم والأدوار
- معلومات الاتصال والصلاحيات
- إجراءات سريعة (تعديل، حذف، تفعيل/إيقاف)
- قائمة سياق مع إجراءات إضافية

### ProductCard
```tsx
import { ProductCard } from '@/shared/components/Cards';

<ProductCard
  product={product}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
  onToggleStatus={handleToggleStatus}
  showActions={true}
/>
```

**الميزات:**
- عرض صورة المنتج والسعر
- معلومات المخزون والفئة
- تقييم المنتج وعدد المراجعات
- العلامات التجارية والتصنيفات

### OrderCard
```tsx
import { OrderCard } from '@/shared/components/Cards';

<OrderCard
  order={order}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
  onUpdateStatus={handleUpdateStatus}
  showActions={true}
/>
```

**الميزات:**
- رقم الطلب وتاريخ الإنشاء
- معلومات العميل وعنوان الشحن
- حالة الطلب والدفع
- ملخص العناصر والمجموع

## 🎨 التخصيص والتصميم

### Breakpoints
```tsx
// تخصيص نقطة التبديل
cardBreakpoint="sm"  // تبديل عند sm وأقل
cardBreakpoint="md"  // تبديل عند md وأقل
cardBreakpoint="xs"  // تبديل عند xs فقط
```

### تخصيص التصميم
```tsx
<ResponsiveListWrapper
  cardContainerProps={{
    sx: { 
      px: { xs: 2, sm: 3 },
      py: 1,
      bgcolor: 'background.paper'
    }
  }}
  gridProps={{
    sx: { 
      height: 'calc(100vh - 200px)',
      '& .MuiDataGrid-root': {
        border: 'none',
      }
    }
  }}
/>
```

## 📋 أمثلة عملية

### صفحة المستخدمين
```tsx
export const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useUsers();

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'الاسم', minWidth: 150 },
    { field: 'email', headerName: 'البريد الإلكتروني', minWidth: 200 },
    { field: 'roles', headerName: 'الأدوار', minWidth: 100 },
    // ... المزيد من الأعمدة
  ];

  return (
    <Box>
      <ResponsiveListWrapper
        data={data?.data || []}
        loading={isLoading}
        error={error}
        columns={columns}
        CardComponent={UserCard}
        getRowId={(user) => user._id}
        onEdit={(user) => navigate(`/users/${user._id}`)}
        onDelete={handleDelete}
        onView={(user) => navigate(`/users/${user._id}`)}
        showActions={true}
        cardBreakpoint="md"
        emptyMessage="لا يوجد مستخدمون"
        emptyDescription="لم يتم العثور على أي مستخدمين"
        errorMessage="حدث خطأ أثناء تحميل المستخدمين"
      />
    </Box>
  );
};
```

### صفحة المنتجات
```tsx
export const ProductsListPage: React.FC = () => {
  const { data, isLoading, error } = useProducts();

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'اسم المنتج', minWidth: 200 },
    { field: 'price', headerName: 'السعر', minWidth: 100 },
    { field: 'stock', headerName: 'المخزون', minWidth: 80 },
    // ... المزيد من الأعمدة
  ];

  return (
    <ResponsiveListWrapper
      data={data?.data || []}
      loading={isLoading}
      error={error}
      columns={columns}
      CardComponent={ProductCard}
      getRowId={(product) => product._id}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      showActions={true}
      cardBreakpoint="sm"
      emptyMessage="لا يوجد منتجات"
      emptyDescription="لم يتم العثور على أي منتجات"
    />
  );
};
```

## 🔧 الإعدادات المتقدمة

### Pagination
```tsx
<ResponsiveListWrapper
  pagination={true}
  pageSize={20}
  pageSizeOptions={[10, 20, 50, 100]}
/>
```

### Custom Actions
```tsx
<ResponsiveListWrapper
  onEdit={(item) => handleEdit(item)}
  onDelete={(item) => handleDelete(item)}
  onView={(item) => handleView(item)}
  onToggleStatus={(item) => handleToggleStatus(item)}
  showActions={true}
/>
```

### Loading States
```tsx
<ResponsiveListWrapper
  loading={isLoading}
  error={error}
  // Loading skeleton will be shown automatically
/>
```

## 📊 مراقبة الأداء

### تحسينات الأداء
- **Lazy Loading**: تحميل البطاقات عند الحاجة
- **Virtual Scrolling**: للقوائم الطويلة
- **Memoization**: تحسين إعادة الرسم
- **Debounced Search**: بحث محسن

### قياس الأداء
```tsx
import { trackPerformance } from '@/lib/analytics';

// قياس وقت تحميل القائمة
const startTime = performance.now();
// ... تحميل البيانات
const endTime = performance.now();
trackPerformance('list_load_time', endTime - startTime);
```

## 🎯 أفضل الممارسات

### 1. تصميم البطاقات
- **معلومات أساسية**: عرض المعلومات المهمة أولاً
- **إجراءات واضحة**: أزرار واضحة ومفهومة
- **تصميم متسق**: استخدام نفس النمط لجميع البطاقات

### 2. Breakpoints
- **اختبار على أجهزة مختلفة**: تأكد من العمل على جميع الأحجام
- **نقاط التبديل المناسبة**: اختر النقاط المناسبة لنوع البيانات
- **تجربة سلسة**: تأكد من الانتقال السلس بين الأنماط

### 3. الأداء
- **تحسين الصور**: استخدام صور محسنة للبطاقات
- **تحميل تدريجي**: تحميل البيانات عند الحاجة
- **Cache**: تخزين البيانات المؤقتة

## 🚀 التطوير المستقبلي

### ميزات مخططة
- **Infinite Scroll**: تمرير لا نهائي للبطاقات
- **Drag & Drop**: إعادة ترتيب البطاقات
- **Batch Actions**: إجراءات جماعية
- **Advanced Filtering**: فلترة متقدمة
- **Export Options**: خيارات التصدير

### تحسينات مقترحة
- **Animation**: انتقالات سلسة
- **Accessibility**: تحسين إمكانية الوصول
- **Keyboard Navigation**: التنقل بلوحة المفاتيح
- **Voice Commands**: أوامر صوتية

---

## 📞 الدعم والمساعدة

إذا كنت بحاجة إلى مساعدة في تطبيق النظام أو تخصيصه، يرجى:
1. مراجعة الأمثلة المتوفرة
2. اختبار النظام على أجهزة مختلفة
3. التحقق من التوافق مع البيانات الخاصة بك

**النظام جاهز للاستخدام والإنتاج! 🎉**

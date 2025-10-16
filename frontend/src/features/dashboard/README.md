# لوحة التحكم - Dashboard

## نظرة عامة

لوحة تحكم احترافية وتفاعلية تعرض إحصائيات شاملة عن النظام مبنية على بيانات حقيقية من API الباك إند.

## المكونات

### 1. لوحة التحكم الرئيسية (`DashboardPage.tsx`)

#### الميزات:
- **بيانات حقيقية من API**: جميع البيانات المعروضة تأتي من endpoints حقيقية
- **إحصائيات أساسية**: عرض إجمالي المستخدمين، الطلبات، الإيرادات، والمنتجات
- **مؤشرات النمو**: عرض نسب النمو لكل مؤشر مع تأثيرات بصرية
- **الطلبات الأخيرة**: قائمة بالطلبات الحديثة مع تفاصيل الحالة
- **إجراءات سريعة**: أزرار للوصول السريع للوظائف المهمة
- **إحصائيات الأداء**: معلومات عن صحة النظام والأداء
- **مخططات تفاعلية**: رسوم بيانية لتحليل البيانات

#### البيانات المستخدمة:
- `useDashboardOverview()` - البيانات الرئيسية من `/analytics/dashboard`
- `useRecentOrders()` - الطلبات الأخيرة من `/admin/orders`
- `useProductsCount()` - عدد المنتجات من `/products/count`
- `usePerformanceMetrics()` - إحصائيات الأداء من `/analytics/performance`

### 2. مكونات العرض

#### `StatsCard.tsx`
- عرض الإحصائيات الرئيسية بتصميم احترافي
- تأثيرات hover وانيميشن
- مؤشرات النمو مع ألوان ديناميكية
- دعم الألوان المختلفة (primary, success, warning, error, info)

#### `RevenueChart.tsx`
- مخطط الإيرادات التفاعلي
- دعم الفترات الزمنية (يومي، أسبوعي، شهري)
- بيانات حقيقية من `revenueCharts.daily`
- تنسيق الأرقام بالعربية

#### `TopProductsWidget.tsx`
- عرض أفضل 5 منتجات مبيعاً
- بيانات من `productCharts.topSelling`
- مؤشرات الترند والنمو
- شريط تقدم لعرض نسبة المبيعات

#### `CategoryDistribution.tsx`
- توزيع المبيعات حسب الفئات
- مخطط دائري تفاعلي
- بيانات من `revenueCharts.byCategory`
- حساب النسب المئوية تلقائياً

#### `RecentOrders.tsx`
- قائمة بآخر الطلبات
- عرض معلومات العميل والحالة
- تنسيق التواريخ بالعربية
- حسابات تلقائية لعدد المنتجات

#### `ActivityTimeline.tsx`
- خط زمني للأنشطة الأخيرة
- تحويل الطلبات إلى أنشطة
- حساب الوقت النسبي (منذ X دقائق/ساعات)
- رموز وألوان حسب نوع النشاط

#### `QuickStatsWidget.tsx`
- إحصائيات سريعة للأداء
- صحة النظام
- معدلات الأخطاء ووقت الاستجابة

#### `QuickActions.tsx`
- أزرار سريعة للإجراءات الشائعة
- تصميم متجاوب
- أيقونات وألوان مميزة

### 3. Hooks مخصصة (`hooks/`)

#### `useDashboardData.ts`
مجموعة من الhooks لجلب البيانات:

```typescript
// البيانات الرئيسية
useDashboardOverview()

// الطلبات الأخيرة
useRecentOrders(limit)

// إحصائيات سريعة
useQuickStats()

// مقاييس في الوقت الفعلي
useRealTimeMetrics()

// عدد المنتجات
useProductsCount()
```

## التكامل مع API

### Endpoints المستخدمة:

#### Analytics
- `GET /analytics/dashboard` - البيانات الرئيسية للوحة التحكم
  ```json
  {
    "overview": {
      "totalUsers": 1250,
      "totalRevenue": 450000,
      "totalOrders": 890
    },
    "revenueCharts": {
      "daily": [...],
      "byCategory": [...]
    },
    "productCharts": {
      "topSelling": [...]
    },
    "kpis": {
      "revenueGrowth": 15.5,
      "userGrowth": 8.2
    }
  }
  ```

- `GET /analytics/performance` - إحصائيات الأداء
- `GET /analytics/advanced/quick-stats` - إحصائيات سريعة
- `GET /analytics/advanced/realtime` - مقاييس في الوقت الفعلي

#### Orders
- `GET /admin/orders?limit=5&page=1` - الطلبات الأخيرة

#### Products
- `GET /products/count` - عدد المنتجات

### معالجة الأخطاء:
- عرض رسائل خطأ واضحة بالعربية
- إمكانية إعادة المحاولة
- حالات التحميل المتقدمة
- Fallback للبيانات الفارغة

## الاستخدام

```tsx
import { DashboardPage } from './pages/DashboardPage';

// في التطبيق
<DashboardPage />
```

## التصميم

### الألوان والثيم
- استخدام MUI theme system
- دعم الوضع الليلي/النهاري
- ألوان ديناميكية حسب الحالة
- تدرجات لونية احترافية

### التأثيرات
- Hover effects متقدمة
- انتقالات سلسة
- تأثيرات الظل الديناميكية
- انيميشن للبطاقات

### Responsive Design
- تصميم متجاوب كامل
- Grid system من MUI
- دعم جميع أحجام الشاشات
  - xs: 12 columns
  - sm: 6 columns
  - md: 3-4 columns
  - lg: 3-4-5 columns

## الميزات المتقدمة

### ✅ تم إنجازه:
1. **استخدام البيانات الحقيقية**: جميع المكونات متصلة بـ API
2. **مكونات احترافية**: 8 مكونات متخصصة
3. **تصميم عصري**: تأثيرات وانيميشن متقدمة
4. **معالجة شاملة للأخطاء**: حالات متعددة (تحميل، خطأ، فارغة)
5. **تنسيق عربي**: جميع الأرقام والتواريخ بالعربية
6. **Hooks مخصصة**: 5 hooks لجلب البيانات
7. **تحديث تلقائي**: auto-refresh للبيانات الحية
8. **Performance optimized**: staleTime و refetchInterval

### 🎨 التحسينات التصميمية:
- بطاقات مع تدرجات لونية
- خطوط زمنية تفاعلية
- مخططات دائرية وخطية
- أشرطة تقدم ديناميكية
- أزرار بتأثيرات 3D
- رموز ملونة ومعبرة

## البيانات المعروضة

### Overview Stats
- إجمالي المستخدمين
- إجمالي الطلبات
- إجمالي الإيرادات
- إجمالي المنتجات

### Charts
- مخطط الإيرادات اليومية
- توزيع الفئات
- أفضل المنتجات

### Lists
- الطلبات الأخيرة (5)
- النشاط الأخير (5)

### Performance
- صحة النظام
- معدل الأخطاء
- وقت الاستجابة
- المستخدمون النشطون

## التكوين

تأكد من أن المتغيرات التالية مُعرّفة في ملف `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_ANALYTICS=true
```

## التوافق

- React 18+
- Material-UI 5+
- TanStack Query v5+
- Recharts 2+
- TypeScript 5+

## الأداء

- **Caching**: استخدام TanStack Query cache
- **Stale Time**: 1-10 دقائق حسب نوع البيانات
- **Auto Refresh**: 30 ثانية للبيانات الحية
- **Lazy Loading**: تحميل المكونات عند الحاجة
- **Memoization**: لتحسين الأداء

## الصيانة

### إضافة مكون جديد:
1. إنشاء الملف في `/components`
2. استخدام البيانات من hooks
3. إضافة للـ `index.ts`
4. استخدام في `DashboardPage.tsx`

### إضافة endpoint جديد:
1. إنشاء hook في `/hooks/useDashboardData.ts`
2. تصدير من `/hooks/index.ts`
3. استخدام في المكون المناسب

## المراجع

- [Analytics API Documentation](../../../backend/docs/ANALYTICS_API.md)
- [Orders API Documentation](../../../backend/docs/CHECKOUT_API.md)
- [TanStack Query](https://tanstack.com/query/latest)
- [Recharts](https://recharts.org/)

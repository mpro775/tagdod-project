# نظام التحليلات المتقدم - Analytics System

## نظرة عامة

نظام التحليلات المتقدم هو نظام شامل ومتطور يوفر تحليلات مفصلة ومؤشرات أداء متقدمة لإدارة أفضل. تم تطويره باستخدام React + TypeScript + Material-UI ويتكامل مع API الباك إند بشكل كامل.

## المميزات الرئيسية

### 🎯 لوحة التحليلات الرئيسية
- **نظرة عامة شاملة**: مؤشرات الأداء الرئيسية (KPIs) في الوقت الفعلي
- **رسوم بيانية تفاعلية**: مخططات متقدمة لعرض البيانات بصرياً
- **فلاتر متقدمة**: إمكانية فلترة البيانات حسب الفترة الزمنية والمعايير المختلفة
- **تصميم متجاوب**: يعمل بشكل مثالي على جميع الأجهزة

### 📊 التحليلات المتقدمة
- **تحليلات المبيعات**: إحصائيات مفصلة عن المبيعات والإيرادات
- **تحليلات المنتجات**: أداء المنتجات والمخزون
- **تحليلات العملاء**: سلوك العملاء والتفاعلات
- **تحليلات المخزون**: إدارة المخزون وتنبيهات إعادة التموين
- **التحليلات المالية**: تقارير مالية شاملة
- **تحليلات التسويق**: أداء الحملات التسويقية

### 📈 المقاييس الفورية
- **مراقبة الأداء**: مقاييس الأداء في الوقت الفعلي
- **صحة النظام**: حالة النظام والموارد
- **إحصائيات قاعدة البيانات**: معلومات مفصلة عن قاعدة البيانات
- **نقاط النهاية الأبطأ**: تحليل أداء API

### 📋 إدارة التقارير
- **إنشاء التقارير**: إنشاء تقارير مخصصة بصيغ مختلفة
- **جدولة التقارير**: جدولة التقارير التلقائية
- **أرشفة التقارير**: إدارة وتنظيم التقارير
- **تصدير متقدم**: تصدير البيانات بصيغ مختلفة (PDF, Excel, CSV, JSON)

## البنية التقنية

### 📁 هيكل الملفات
```
src/features/analytics/
├── api/                    # API calls and data fetching
│   └── analyticsApi.ts
├── components/             # Reusable UI components
│   ├── AnalyticsDashboard.tsx
│   ├── AdvancedAnalyticsDashboard.tsx
│   ├── SalesAnalyticsCard.tsx
│   ├── RealTimeMetricsCard.tsx
│   ├── PerformanceMetricsCard.tsx
│   ├── DataExportDialog.tsx
│   ├── AnalyticsSkeleton.tsx
│   └── AnalyticsErrorBoundary.tsx
├── hooks/                 # Custom React hooks
│   └── useAnalytics.ts
├── pages/                 # Page components
│   ├── AnalyticsMainPage.tsx
│   ├── ReportsManagementPage.tsx
│   └── DataExportPage.tsx
├── types/                 # TypeScript type definitions
│   └── analytics.types.ts
└── README.md
```

### 🔧 التقنيات المستخدمة

#### Frontend
- **React 18**: مكتبة واجهة المستخدم
- **TypeScript**: لكتابة كود آمن ومنظم
- **Material-UI (MUI)**: مكتبة مكونات UI احترافية
- **React Query**: لإدارة حالة البيانات والـ caching
- **Recharts**: لإنشاء الرسوم البيانية التفاعلية
- **React Hook Form**: لإدارة النماذج

#### State Management
- **React Query**: لإدارة حالة الخادم
- **React Context**: لإدارة الحالة المحلية
- **Custom Hooks**: لإعادة استخدام منطق المكونات

#### Error Handling
- **Error Boundaries**: لمعالجة الأخطاء في المكونات
- **Toast Notifications**: لإظهار الرسائل للمستخدم
- **Fallback UI**: واجهات بديلة عند حدوث أخطاء

## الاستخدام

### 🚀 الاستخدام الأساسي

```tsx
import { AnalyticsMainPage } from '@/features/analytics/pages';

function App() {
  return (
    <div>
      <AnalyticsMainPage />
    </div>
  );
}
```

### 📊 استخدام المكونات الفردية

```tsx
import { 
  AnalyticsDashboard,
  SalesAnalyticsCard,
  RealTimeMetricsCard 
} from '@/features/analytics/components';

function MyAnalyticsPage() {
  return (
    <div>
      <AnalyticsDashboard />
      <SalesAnalyticsCard data={salesData} />
      <RealTimeMetricsCard data={metricsData} />
    </div>
  );
}
```

### 🎣 استخدام الـ Hooks

```tsx
import { 
  useDashboard, 
  useSalesAnalytics,
  useRealTimeMetrics 
} from '@/features/analytics/hooks';

function MyComponent() {
  const { data: dashboardData, isLoading } = useDashboard();
  const { data: salesData } = useSalesAnalytics();
  const { data: metricsData } = useRealTimeMetrics();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {/* Render your analytics components */}
    </div>
  );
}
```

## API Integration

### 🔌 نقاط النهاية المدعومة

#### Dashboard Analytics
- `GET /analytics/dashboard` - بيانات لوحة التحكم الرئيسية
- `GET /analytics/overview` - نظرة عامة على المؤشرات
- `GET /analytics/kpis` - المؤشرات الرئيسية للأداء

#### Advanced Analytics
- `GET /analytics/advanced/sales` - تحليلات المبيعات المتقدمة
- `GET /analytics/advanced/products/performance` - أداء المنتجات
- `GET /analytics/advanced/customers` - تحليلات العملاء
- `GET /analytics/advanced/inventory` - تقارير المخزون
- `GET /analytics/advanced/financial` - التقارير المالية
- `GET /analytics/advanced/marketing` - تحليلات التسويق

#### Real-time Metrics
- `GET /analytics/advanced/realtime` - المقاييس الفورية
- `GET /analytics/performance` - مقاييس الأداء

#### Reports Management
- `POST /analytics/advanced/reports/generate` - إنشاء تقرير
- `GET /analytics/advanced/reports` - قائمة التقارير
- `GET /analytics/advanced/reports/:id` - تفاصيل التقرير
- `POST /analytics/advanced/reports/:id/archive` - أرشفة التقرير
- `DELETE /analytics/advanced/reports/:id` - حذف التقرير

#### Data Export
- `GET /analytics/advanced/export/sales` - تصدير بيانات المبيعات
- `GET /analytics/advanced/export/products` - تصدير بيانات المنتجات
- `GET /analytics/advanced/export/customers` - تصدير بيانات العملاء

### 📝 نمط الاستجابة الموحد

جميع الردود تتبع النمط التالي:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    filters?: Record<string, any>;
  };
  message?: string;
  errors?: string[];
}
```

## المكونات الرئيسية

### 🎛️ AnalyticsDashboard
لوحة التحليلات الرئيسية مع:
- مؤشرات الأداء الرئيسية
- رسوم بيانية تفاعلية
- فلاتر متقدمة
- تحديث فوري للبيانات

### 📊 AdvancedAnalyticsDashboard
لوحة التحليلات المتقدمة مع:
- تحليلات متخصصة
- تقارير مفصلة
- إدارة التقارير
- تصدير البيانات

### 📈 SalesAnalyticsCard
بطاقة تحليلات المبيعات مع:
- إحصائيات المبيعات
- اتجاهات الإيرادات
- أفضل المنتجات
- طرق الدفع

### ⚡ RealTimeMetricsCard
بطاقة المقاييس الفورية مع:
- المستخدمون النشطون
- مبيعات اليوم
- حالة النظام
- استخدام الموارد

### 🔧 PerformanceMetricsCard
بطاقة مقاييس الأداء مع:
- وقت استجابة API
- معدل الأخطاء
- وقت التشغيل
- إحصائيات قاعدة البيانات

## إدارة الأخطاء

### 🛡️ Error Boundary
```tsx
import { AnalyticsErrorBoundary } from '@/features/analytics/components';

function App() {
  return (
    <AnalyticsErrorBoundary>
      <AnalyticsMainPage />
    </AnalyticsErrorBoundary>
  );
}
```

### 🔄 Retry Logic
```tsx
import { useAnalytics } from '@/features/analytics/hooks';

function MyComponent() {
  const { data, error, refetch } = useAnalytics();
  
  if (error) {
    return (
      <div>
        <p>حدث خطأ في تحميل البيانات</p>
        <button onClick={refetch}>إعادة المحاولة</button>
      </div>
    );
  }
  
  return <div>{/* Render data */}</div>;
}
```

## التخصيص

### 🎨 تخصيص الألوان
```tsx
import { useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <Box sx={{
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      color: 'white',
    }}>
      {/* Content */}
    </Box>
  );
}
```

### 📱 التصميم المتجاوب
```tsx
import { useMediaQuery, useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Grid container spacing={isMobile ? 1 : 3}>
      {/* Responsive content */}
    </Grid>
  );
}
```

## الأداء

### ⚡ تحسينات الأداء
- **Lazy Loading**: تحميل المكونات عند الحاجة
- **Memoization**: استخدام React.memo و useMemo
- **Virtual Scrolling**: للقوائم الطويلة
- **Image Optimization**: تحسين الصور
- **Code Splitting**: تقسيم الكود

### 📊 Caching Strategy
- **React Query**: cache للبيانات من الخادم
- **Local Storage**: حفظ إعدادات المستخدم
- **Session Storage**: حفظ البيانات المؤقتة

## الاختبار

### 🧪 Unit Tests
```typescript
import { render, screen } from '@testing-library/react';
import { AnalyticsDashboard } from './AnalyticsDashboard';

test('renders analytics dashboard', () => {
  render(<AnalyticsDashboard />);
  expect(screen.getByText('لوحة التحليلات')).toBeInTheDocument();
});
```

### 🔍 Integration Tests
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { AnalyticsMainPage } from './AnalyticsMainPage';

test('loads analytics data', async () => {
  render(<AnalyticsMainPage />);
  
  await waitFor(() => {
    expect(screen.getByText('المؤشرات الرئيسية')).toBeInTheDocument();
  });
});
```

## النشر

### 🚀 Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start development server
npm run dev
```

### 📦 Environment Variables
```env
REACT_APP_API_BASE_URL=https://api.example.com
REACT_APP_ANALYTICS_ENABLED=true
REACT_APP_DEBUG_MODE=false
```

## المساهمة

### 🤝 كيفية المساهمة
1. Fork المشروع
2. إنشاء branch جديد للميزة
3. Commit التغييرات
4. Push إلى الـ branch
5. إنشاء Pull Request

### 📋 معايير الكود
- استخدام TypeScript
- اتباع ESLint rules
- كتابة tests للميزات الجديدة
- توثيق الكود

## الدعم

### 📞 التواصل
- **Email**: support@example.com
- **Documentation**: [docs.example.com](https://docs.example.com)
- **Issues**: [GitHub Issues](https://github.com/example/issues)

### 🐛 الإبلاغ عن الأخطاء
عند الإبلاغ عن خطأ، يرجى تضمين:
- وصف الخطأ
- خطوات إعادة إنتاج الخطأ
- لقطة شاشة (إن أمكن)
- معلومات المتصفح والنظام

---

**تم تطوير هذا النظام بعناية فائقة ليوفر تجربة تحليلية متقدمة ومتطورة للمستخدمين.**

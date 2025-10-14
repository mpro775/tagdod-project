# خطة شاملة لبناء لوحة التحكم الإدارية
# Admin Dashboard Complete Development Plan

> 🎯 **خطة تطوير احترافية وشاملة لبناء لوحة تحكم إدارية متكاملة بناءً على Backend API**

**التاريخ:** 14 أكتوبر 2025  
**التقنيات:** React 19 + TypeScript + Material-UI (MUI) + Vite  
**الحالة:** خطة تطوير - جاهز للتنفيذ

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المتطلبات والأدوات](#المتطلبات-والأدوات)
3. [البنية المعمارية](#البنية-المعمارية)
4. [هيكل المجلدات الكامل](#هيكل-المجلدات-الكامل)
5. [قواعد الكتابة والمعايير](#قواعد-الكتابة-والمعايير)
6. [نظام الحماية والمصادقة](#نظام-الحماية-والمصادقة)
7. [نظام الردود والأخطاء](#نظام-الردود-والأخطاء)
8. [نظام اللغات والاتجاهات](#نظام-اللغات-والاتجاهات)
9. [نظام الثيمات](#نظام-الثيمات)
10. [المكونات المشتركة](#المكونات-المشتركة)
11. [الصفحات والموديولات](#الصفحات-والموديولات)
12. [خطة التنفيذ](#خطة-التنفيذ)
13. [التوثيق والمراجع](#التوثيق-والمراجع)

---

## 🎯 نظرة عامة

### الهدف الرئيسي
بناء لوحة تحكم إدارية احترافية تعكس Backend API بالكامل مع تجربة مستخدم متميزة ومعايير برمجة عالمية.

### الميزات الأساسية

✅ **إدارة شاملة** - تغطية 100% لجميع موديولات Backend  
✅ **تجربة متميزة** - واجهة عصرية وسهلة الاستخدام  
✅ **أمان محكم** - نظام مصادقة وصلاحيات متقدم  
✅ **أداء عالي** - تحسينات وcaching ذكي  
✅ **ثنائي اللغة** - دعم كامل للعربية والإنجليزية  
✅ **responsive** - متوافق مع جميع الأجهزة  
✅ **قابل للتوسع** - معمارية قابلة للنمو  

### الموديولات الرئيسية (من Backend)

| # | الموديول | Endpoints | الحالة |
|---|---------|-----------|--------|
| 1 | المستخدمين والصلاحيات | 10+ | ✅ Backend جاهز |
| 2 | المنتجات | 15+ | ✅ Backend جاهز |
| 3 | الفئات | 12+ | ✅ Backend جاهز |
| 4 | السمات | 10+ | ✅ Backend جاهز |
| 5 | البراندات | 7+ | ✅ Backend جاهز |
| 6 | البنرات | 10+ | ✅ Backend جاهز |
| 7 | الكوبونات | 13+ | ✅ Backend جاهز |
| 8 | السلة | 15+ | ✅ Backend جاهز |
| 9 | الطلبات | 14+ | ✅ Backend جاهز |
| 10 | العناوين | 10+ | ✅ Backend جاهز |
| 11 | المفضلة | 17+ | ✅ Backend جاهز |
| 12 | طلبات الخدمات | 15+ | ✅ Backend جاهز |
| 13 | الدعم الفني | 8+ | ✅ Backend جاهز |
| 14 | الإشعارات | 10+ | ✅ Backend جاهز |
| 15 | مستودع الصور | 8+ | ✅ Backend جاهز |
| 16 | التحليلات المتقدمة | 12+ | ✅ Backend جاهز |
| 17 | التسعير | 3+ | ✅ Backend جاهز |
| 18 | البحث | 4+ | ✅ Backend جاهز |

**المجموع:** ~180+ Endpoint

---

## 🛠️ المتطلبات والأدوات

### البيئة التطويرية

```json
{
  "node": ">=20.0.0",
  "npm": ">=10.0.0",
  "typescript": "^5.5.0"
}
```

### المكتبات الأساسية

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.26.0",
    "@mui/material": "^6.1.0",
    "@mui/icons-material": "^6.1.0",
    "@mui/x-data-grid": "^7.17.0",
    "@mui/x-date-pickers": "^7.17.0",
    "@emotion/react": "^11.13.0",
    "@emotion/styled": "^11.13.0",
    "axios": "^1.7.0",
    "react-query": "^5.56.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "i18next": "^23.15.0",
    "react-i18next": "^15.0.0",
    "date-fns": "^3.6.0",
    "recharts": "^2.12.0",
    "react-hot-toast": "^2.4.1",
    "notistack": "^3.0.1",
    "react-dropzone": "^14.2.0",
    "react-beautiful-dnd": "^13.1.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^22.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "typescript": "^5.5.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "vite-plugin-pwa": "^0.20.0"
  }
}
```

### الأدوات الإضافية

- **State Management:** Zustand (بسيط وقوي)
- **Data Fetching:** React Query (caching ذكي)
- **Forms:** React Hook Form + Zod (performance + validation)
- **UI Components:** MUI v6 (أحدث إصدار)
- **Charts:** Recharts (سهل وجميل)
- **Notifications:** React Hot Toast + Notistack
- **Date Handling:** date-fns (خفيف)

---

## 🏗️ البنية المعمارية

### النمط المعماري
نستخدم **Feature-Based Architecture** مع **Layered Architecture**

```
┌─────────────────────────────────────────────────┐
│             Presentation Layer                  │
│  (Components, Pages, Layout)                    │
├─────────────────────────────────────────────────┤
│             Application Layer                   │
│  (Hooks, State Management, Business Logic)      │
├─────────────────────────────────────────────────┤
│             Domain Layer                        │
│  (Types, Models, Interfaces, Validators)        │
├─────────────────────────────────────────────────┤
│             Infrastructure Layer                │
│  (API Client, HTTP, Storage, Utils)             │
└─────────────────────────────────────────────────┘
```

### المبادئ الأساسية

1. **Separation of Concerns** - فصل المسؤوليات
2. **DRY (Don't Repeat Yourself)** - لا تكرر نفسك
3. **SOLID Principles** - مبادئ SOLID
4. **Single Source of Truth** - مصدر واحد للحقيقة
5. **Composition over Inheritance** - التركيب أفضل من الوراثة

---

## 📁 هيكل المجلدات الكامل

```
admin-dashboard/
├── public/
│   ├── locales/                    # ملفات الترجمة
│   │   ├── ar/
│   │   │   ├── common.json
│   │   │   ├── dashboard.json
│   │   │   ├── products.json
│   │   │   └── ...
│   │   └── en/
│   │       ├── common.json
│   │       ├── dashboard.json
│   │       └── ...
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   └── favicon.ico
│
├── src/
│   ├── main.tsx                    # نقطة الدخول
│   ├── App.tsx                     # المكون الرئيسي
│   │
│   ├── config/                     # الإعدادات
│   │   ├── env.ts                  # متغيرات البيئة
│   │   ├── constants.ts            # الثوابت
│   │   ├── routes.ts               # مسارات التطبيق
│   │   └── theme.config.ts         # إعدادات الثيمات
│   │
│   ├── core/                       # الأساسيات المشتركة
│   │   ├── api/                    # طبقة الـ API
│   │   │   ├── client.ts           # Axios instance
│   │   │   ├── interceptors.ts     # Request/Response interceptors
│   │   │   ├── endpoints.ts        # API endpoints
│   │   │   └── types.ts            # API types
│   │   │
│   │   ├── auth/                   # نظام المصادقة
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── useAuth.ts
│   │   │   ├── authService.ts
│   │   │   ├── tokenService.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── router/                 # نظام التوجيه
│   │   │   ├── AppRouter.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── RoleGuard.tsx
│   │   │   └── routes.config.ts
│   │   │
│   │   ├── i18n/                   # نظام اللغات
│   │   │   ├── i18n.ts
│   │   │   ├── LanguageProvider.tsx
│   │   │   ├── useTranslation.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── theme/                  # نظام الثيمات
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── lightTheme.ts
│   │   │   ├── darkTheme.ts
│   │   │   ├── rtlTheme.ts
│   │   │   └── types.ts
│   │   │
│   │   └── error/                  # معالجة الأخطاء
│   │       ├── ErrorBoundary.tsx
│   │       ├── ErrorHandler.ts
│   │       └── types.ts
│   │
│   ├── shared/                     # المشتركات
│   │   ├── components/             # مكونات مشتركة
│   │   │   ├── DataTable/
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── DataTableToolbar.tsx
│   │   │   │   ├── DataTablePagination.tsx
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── Form/
│   │   │   │   ├── FormInput.tsx
│   │   │   │   ├── FormSelect.tsx
│   │   │   │   ├── FormCheckbox.tsx
│   │   │   │   ├── FormDatePicker.tsx
│   │   │   │   ├── FormImageUpload.tsx
│   │   │   │   └── FormMultiLanguage.tsx
│   │   │   │
│   │   │   ├── Layout/
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Breadcrumbs.tsx
│   │   │   │
│   │   │   ├── Dialog/
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   ├── FormDialog.tsx
│   │   │   │   └── AlertDialog.tsx
│   │   │   │
│   │   │   ├── Loading/
│   │   │   │   ├── PageLoader.tsx
│   │   │   │   ├── SkeletonLoader.tsx
│   │   │   │   └── CircularProgress.tsx
│   │   │   │
│   │   │   ├── Card/
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   ├── InfoCard.tsx
│   │   │   │   └── ChartCard.tsx
│   │   │   │
│   │   │   ├── Status/
│   │   │   │   ├── StatusChip.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   └── StatusIndicator.tsx
│   │   │   │
│   │   │   └── Empty/
│   │   │       ├── EmptyState.tsx
│   │   │       └── NoData.tsx
│   │   │
│   │   ├── hooks/                  # Hooks مشتركة
│   │   │   ├── useDataTable.ts
│   │   │   ├── usePagination.ts
│   │   │   ├── useSearch.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useConfirm.ts
│   │   │   └── useToast.ts
│   │   │
│   │   ├── utils/                  # دوال مساعدة
│   │   │   ├── formatters.ts       # تنسيق البيانات
│   │   │   ├── validators.ts       # التحقق من الصحة
│   │   │   ├── helpers.ts          # دوال مساعدة عامة
│   │   │   ├── constants.ts        # ثوابت مشتركة
│   │   │   └── storage.ts          # Local/Session storage
│   │   │
│   │   └── types/                  # أنواع مشتركة
│   │       ├── common.types.ts
│   │       ├── api.types.ts
│   │       ├── form.types.ts
│   │       └── table.types.ts
│   │
│   ├── features/                   # الموديولات الرئيسية
│   │   │
│   │   ├── dashboard/              # لوحة المعلومات
│   │   │   ├── pages/
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── StatsOverview.tsx
│   │   │   │   ├── RecentOrders.tsx
│   │   │   │   ├── SalesChart.tsx
│   │   │   │   └── TopProducts.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDashboardStats.ts
│   │   │   ├── api/
│   │   │   │   └── dashboardApi.ts
│   │   │   └── types/
│   │   │       └── dashboard.types.ts
│   │   │
│   │   ├── auth/                   # المصادقة
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── ForgotPasswordPage.tsx
│   │   │   │   └── ResetPasswordPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── PasswordResetForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useLogin.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   ├── users/                  # إدارة المستخدمين
│   │   │   ├── pages/
│   │   │   │   ├── UsersListPage.tsx
│   │   │   │   ├── UserDetailsPage.tsx
│   │   │   │   └── UserFormPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── UsersTable.tsx
│   │   │   │   ├── UserForm.tsx
│   │   │   │   ├── UserFilters.tsx
│   │   │   │   ├── UserStatusChip.tsx
│   │   │   │   └── UserRoleBadge.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useUsers.ts
│   │   │   │   ├── useUser.ts
│   │   │   │   ├── useCreateUser.ts
│   │   │   │   └── useUpdateUser.ts
│   │   │   ├── api/
│   │   │   │   └── usersApi.ts
│   │   │   └── types/
│   │   │       └── user.types.ts
│   │   │
│   │   ├── products/               # إدارة المنتجات
│   │   │   ├── pages/
│   │   │   │   ├── ProductsListPage.tsx
│   │   │   │   ├── ProductDetailsPage.tsx
│   │   │   │   ├── ProductFormPage.tsx
│   │   │   │   └── VariantsManagePage.tsx
│   │   │   ├── components/
│   │   │   │   ├── ProductsTable.tsx
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   ├── ProductFilters.tsx
│   │   │   │   ├── VariantsTable.tsx
│   │   │   │   ├── VariantForm.tsx
│   │   │   │   ├── ImageGallery.tsx
│   │   │   │   └── AttributeSelector.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProducts.ts
│   │   │   │   ├── useProduct.ts
│   │   │   │   ├── useVariants.ts
│   │   │   │   └── useGenerateVariants.ts
│   │   │   ├── api/
│   │   │   │   └── productsApi.ts
│   │   │   └── types/
│   │   │       └── product.types.ts
│   │   │
│   │   ├── categories/             # إدارة الفئات
│   │   │   ├── pages/
│   │   │   │   ├── CategoriesListPage.tsx
│   │   │   │   └── CategoryFormPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── CategoriesTree.tsx
│   │   │   │   ├── CategoryForm.tsx
│   │   │   │   ├── CategoryCard.tsx
│   │   │   │   └── CategoryBreadcrumb.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCategories.ts
│   │   │   │   └── useCategoryTree.ts
│   │   │   ├── api/
│   │   │   │   └── categoriesApi.ts
│   │   │   └── types/
│   │   │       └── category.types.ts
│   │   │
│   │   ├── attributes/             # إدارة السمات
│   │   │   ├── pages/
│   │   │   │   ├── AttributesListPage.tsx
│   │   │   │   └── AttributeFormPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── AttributesTable.tsx
│   │   │   │   ├── AttributeForm.tsx
│   │   │   │   ├── AttributeValuesManager.tsx
│   │   │   │   └── AttributeGroupForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAttributes.ts
│   │   │   │   └── useAttributeValues.ts
│   │   │   ├── api/
│   │   │   │   └── attributesApi.ts
│   │   │   └── types/
│   │   │       └── attribute.types.ts
│   │   │
│   │   ├── brands/                 # إدارة البراندات
│   │   │   ├── pages/
│   │   │   │   ├── BrandsListPage.tsx
│   │   │   │   └── BrandFormPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── BrandsTable.tsx
│   │   │   │   ├── BrandForm.tsx
│   │   │   │   └── BrandCard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useBrands.ts
│   │   │   ├── api/
│   │   │   │   └── brandsApi.ts
│   │   │   └── types/
│   │   │       └── brand.types.ts
│   │   │
│   │   ├── banners/                # إدارة البنرات
│   │   │   ├── pages/
│   │   │   │   ├── BannersListPage.tsx
│   │   │   │   └── BannerFormPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── BannersTable.tsx
│   │   │   │   ├── BannerForm.tsx
│   │   │   │   ├── BannerPreview.tsx
│   │   │   │   └── BannerAnalytics.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useBanners.ts
│   │   │   ├── api/
│   │   │   │   └── bannersApi.ts
│   │   │   └── types/
│   │   │       └── banner.types.ts
│   │   │
│   │   ├── coupons/                # إدارة الكوبونات
│   │   │   ├── pages/
│   │   │   │   ├── CouponsListPage.tsx
│   │   │   │   └── CouponFormPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── CouponsTable.tsx
│   │   │   │   ├── CouponForm.tsx
│   │   │   │   ├── CouponConditions.tsx
│   │   │   │   └── CouponAnalytics.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCoupons.ts
│   │   │   ├── api/
│   │   │   │   └── couponsApi.ts
│   │   │   └── types/
│   │   │       └── coupon.types.ts
│   │   │
│   │   ├── orders/                 # إدارة الطلبات
│   │   │   ├── pages/
│   │   │   │   ├── OrdersListPage.tsx
│   │   │   │   └── OrderDetailsPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── OrdersTable.tsx
│   │   │   │   ├── OrderDetails.tsx
│   │   │   │   ├── OrderStatusStepper.tsx
│   │   │   │   ├── OrderItems.tsx
│   │   │   │   ├── OrderPricing.tsx
│   │   │   │   └── OrderActions.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useOrders.ts
│   │   │   │   ├── useOrder.ts
│   │   │   │   └── useOrderActions.ts
│   │   │   ├── api/
│   │   │   │   └── ordersApi.ts
│   │   │   └── types/
│   │   │       └── order.types.ts
│   │   │
│   │   ├── media/                  # مستودع الصور
│   │   │   ├── pages/
│   │   │   │   └── MediaLibraryPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── MediaGrid.tsx
│   │   │   │   ├── MediaUploader.tsx
│   │   │   │   ├── MediaFilters.tsx
│   │   │   │   ├── MediaDetails.tsx
│   │   │   │   └── MediaSelector.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useMedia.ts
│   │   │   │   └── useMediaUpload.ts
│   │   │   ├── api/
│   │   │   │   └── mediaApi.ts
│   │   │   └── types/
│   │   │       └── media.types.ts
│   │   │
│   │   ├── analytics/              # التحليلات
│   │   │   ├── pages/
│   │   │   │   ├── AnalyticsPage.tsx
│   │   │   │   └── ReportsPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── SalesChart.tsx
│   │   │   │   ├── ProductsChart.tsx
│   │   │   │   ├── UsersChart.tsx
│   │   │   │   └── RevenueChart.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAnalytics.ts
│   │   │   ├── api/
│   │   │   │   └── analyticsApi.ts
│   │   │   └── types/
│   │   │       └── analytics.types.ts
│   │   │
│   │   ├── support/                # الدعم الفني
│   │   │   ├── pages/
│   │   │   │   ├── TicketsListPage.tsx
│   │   │   │   └── TicketDetailsPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── TicketsTable.tsx
│   │   │   │   ├── TicketDetails.tsx
│   │   │   │   ├── TicketMessages.tsx
│   │   │   │   └── MessageForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useTickets.ts
│   │   │   ├── api/
│   │   │   │   └── supportApi.ts
│   │   │   └── types/
│   │   │       └── support.types.ts
│   │   │
│   │   └── settings/               # الإعدادات
│   │       ├── pages/
│   │       │   ├── SettingsPage.tsx
│   │       │   └── ProfilePage.tsx
│   │       ├── components/
│   │       │   ├── GeneralSettings.tsx
│   │       │   ├── SecuritySettings.tsx
│   │       │   └── ProfileForm.tsx
│   │       ├── hooks/
│   │       │   └── useSettings.ts
│   │       └── types/
│   │           └── settings.types.ts
│   │
│   ├── store/                      # State Management (Zustand)
│   │   ├── authStore.ts
│   │   ├── themeStore.ts
│   │   ├── languageStore.ts
│   │   ├── sidebarStore.ts
│   │   └── notificationStore.ts
│   │
│   └── styles/                     # الأنماط العامة
│       ├── global.css
│       ├── variables.css
│       └── animations.css
│
├── .env.example                    # متغيرات البيئة النموذجية
├── .eslintrc.json                  # إعدادات ESLint
├── .prettierrc.json                # إعدادات Prettier
├── tsconfig.json                   # إعدادات TypeScript
├── vite.config.ts                  # إعدادات Vite
├── package.json
└── README.md
```

---

## 📝 قواعد الكتابة والمعايير

### معايير TypeScript

#### 1. التسمية (Naming Conventions)

```typescript
// ✅ صحيح
// Components: PascalCase
const UserForm: React.FC = () => {};
const DataTable: React.FC = () => {};

// Interfaces & Types: PascalCase
interface User {}
type UserRole = 'admin' | 'user';

// Functions: camelCase
const fetchUsers = () => {};
const calculateTotal = () => {};

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = '';
const MAX_UPLOAD_SIZE = 5242880;

// Enums: PascalCase (keys: PascalCase)
enum UserStatus {
  Active = 'active',
  Suspended = 'suspended',
}

// Files:
// - Components: PascalCase.tsx (UserForm.tsx)
// - Hooks: camelCase.ts (useUsers.ts)
// - Utils: camelCase.ts (formatters.ts)
// - Types: camelCase.types.ts (user.types.ts)
```

#### 2. هيكلة الملفات

```typescript
// ✅ ترتيب الـ imports
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { useQuery } from 'react-query';

// 2. Internal - Absolute imports
import { useAuth } from '@/core/auth';
import { DataTable } from '@/shared/components';

// 3. Relative imports
import { UserForm } from './components/UserForm';
import { useUsers } from './hooks/useUsers';
import type { User } from './types/user.types';

// 4. Styles
import './UsersList.css';

// ✅ ترتيب محتوى المكون
const UsersList: React.FC = () => {
  // 1. Hooks
  const { t } = useTranslation();
  const { data, isLoading } = useUsers();
  
  // 2. State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // 3. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 4. Event handlers
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };
  
  // 5. Render helpers
  const renderUserRow = (user: User) => {
    // ...
  };
  
  // 6. Conditional returns
  if (isLoading) return <PageLoader />;
  
  // 7. Main render
  return (
    <Box>
      {/* ... */}
    </Box>
  );
};

export default UsersList;
```

#### 3. Types & Interfaces

```typescript
// ✅ استخدم Interface للـ objects
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ استخدم Type للـ unions & intersections
type UserRole = 'admin' | 'moderator' | 'user';
type UserWithRole = User & { role: UserRole };

// ✅ Generic Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

// ✅ Utility Types
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type UserKeys = keyof User;
```

#### 4. React Components

```typescript
// ✅ Function Components مع TypeScript
interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ 
  user, 
  onSubmit, 
  onCancel 
}) => {
  // Component logic
};

// ✅ استخدم memo للـ performance
export default React.memo(UserForm);

// ✅ Children prop
interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div>
      <h3>{title}</h3>
      {children}
    </div>
  );
};
```

### معايير الكود

#### 1. ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-debugger": "error"
  }
}
```

#### 2. Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

#### 3. Best Practices

```typescript
// ✅ استخدم const/let (لا var)
const userName = 'Ahmed';
let count = 0;

// ✅ استخدم Arrow Functions
const add = (a: number, b: number): number => a + b;

// ✅ استخدم Template Literals
const greeting = `Hello, ${userName}!`;

// ✅ استخدم Optional Chaining
const userCity = user?.address?.city;

// ✅ استخدم Nullish Coalescing
const displayName = userName ?? 'Guest';

// ✅ استخدم Destructuring
const { id, name, email } = user;
const [first, second, ...rest] = items;

// ✅ استخدم Spread Operator
const newUser = { ...user, isActive: true };
const newArray = [...oldArray, newItem];

// ✅ Early Returns
const processUser = (user: User | null) => {
  if (!user) return null;
  if (!user.isActive) return null;
  
  // Process user
  return processedData;
};

// ❌ تجنب Any
const getData = (): any => {}; // Bad

// ✅ استخدم Types المحددة
const getData = (): User[] => {}; // Good
```

### معايير Git

```bash
# Commit Messages (Conventional Commits)
# Format: <type>(<scope>): <subject>

# Types:
feat:     # ميزة جديدة
fix:      # إصلاح bug
docs:     # تحديث التوثيق
style:    # تنسيق الكود (لا يؤثر على المنطق)
refactor: # إعادة هيكلة الكود
test:     # إضافة اختبارات
chore:    # مهام صيانة

# أمثلة:
feat(products): add product filtering
fix(auth): resolve token expiration issue
docs(readme): update installation steps
refactor(users): simplify user form validation
```

---

## 🔐 نظام الحماية والمصادقة

### معمارية المصادقة

```
┌──────────────┐
│   Login      │
│   Page       │
└──────┬───────┘
       │
       ▼
┌──────────────┐      ┌──────────────┐
│   Backend    │─────▶│  JWT Tokens  │
│     API      │      │ Access+Refresh│
└──────┬───────┘      └──────┬───────┘
       │                     │
       │                     │
       ▼                     ▼
┌────────────────────────────────────┐
│     AuthContext / AuthStore        │
│  - User Info                       │
│  - Tokens                          │
│  - Permissions                     │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────┐
│  Protected Routes  │
│  - RoleGuard       │
│  - PermissionGuard │
└────────────────────┘
```

### تطبيق نظام المصادقة

#### 1. Token Service

```typescript
// src/core/auth/tokenService.ts

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const tokenService = {
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getUserData(): User | null {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setUserData(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
};
```

#### 2. Auth Store (Zustand)

```typescript
// src/store/authStore.ts

import { create } from 'zustand';
import { tokenService } from '@/core/auth/tokenService';
import type { User, UserRole } from '@/features/users/types/user.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  
  // Helpers
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: tokenService.getUserData(),
  isAuthenticated: !!tokenService.getAccessToken(),
  isLoading: false,

  login: (accessToken, refreshToken, user) => {
    tokenService.setAccessToken(accessToken);
    tokenService.setRefreshToken(refreshToken);
    tokenService.setUserData(user);
    
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    tokenService.clearTokens();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      tokenService.setUserData(updatedUser);
      set({ user: updatedUser });
    }
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  hasRole: (role) => {
    const user = get().user;
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.some(r => user.roles?.includes(r));
  },

  hasPermission: (permission) => {
    const user = get().user;
    if (!user) return false;
    
    return user.permissions?.includes(permission) ?? false;
  },
}));
```

#### 3. API Client مع Interceptors

```typescript
// src/core/api/client.ts

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { tokenService } from '@/core/auth/tokenService';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// إنشاء Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - إضافة Token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // إضافة اللغة
    const language = localStorage.getItem('language') || 'ar';
    config.headers['Accept-Language'] = language;
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - معالجة الأخطاء والـ Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Token Expired - محاولة Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenService.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // طلب token جديد
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        // حفظ الـ token الجديد
        tokenService.setAccessToken(data.accessToken);
        
        // إعادة المحاولة بالـ token الجديد
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // فشل Refresh - تسجيل خروج
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

#### 4. Protected Route Component

```typescript
// src/core/router/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/shared/components/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    // إعادة توجيه لصفحة تسجيل الدخول مع حفظ المسار الحالي
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

#### 5. Role Guard Component

```typescript
// src/core/router/RoleGuard.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Box, Typography, Button } from '@mui/material';
import { UserRole } from '@/features/users/types/user.types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
}) => {
  const { hasRole } = useAuthStore();

  if (!hasRole(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
      >
        <Typography variant="h4" gutterBottom>
          🚫 غير مصرح
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={2}>
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </Typography>
        <Button variant="contained" onClick={() => window.history.back()}>
          العودة
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};
```

#### 6. استخدام Guards في Routes

```typescript
// src/core/router/AppRouter.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { UserRole } from '@/features/users/types/user.types';

// Pages
import LoginPage from '@/features/auth/pages/LoginPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import UsersListPage from '@/features/users/pages/UsersListPage';
import ProductsListPage from '@/features/products/pages/ProductsListPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard - متاح للجميع */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Users - Admin+ فقط */}
          <Route
            path="users/*"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                <Routes>
                  <Route index element={<UsersListPage />} />
                  <Route path=":id" element={<UserDetailsPage />} />
                  <Route path="new" element={<UserFormPage />} />
                </Routes>
              </RoleGuard>
            }
          />
          
          {/* Products - Moderator+ */}
          <Route
            path="products/*"
            element={
              <RoleGuard
                allowedRoles={[
                  UserRole.MODERATOR,
                  UserRole.ADMIN,
                  UserRole.SUPER_ADMIN,
                ]}
              >
                <Routes>
                  <Route index element={<ProductsListPage />} />
                  <Route path=":id" element={<ProductDetailsPage />} />
                  <Route path="new" element={<ProductFormPage />} />
                </Routes>
              </RoleGuard>
            }
          />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
```

---

## ⚠️ نظام الردود والأخطاء

### هيكل الردود من Backend

#### 1. الردود الناجحة

```typescript
// Response Structure
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  requestId: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

#### 2. الردود مع الأخطاء

```typescript
// Error Response Structure
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    fieldErrors?: FieldError[];
  };
  requestId: string;
}

interface FieldError {
  field: string;
  message: string;
}
```

### معالجة الأخطاء في Frontend

#### 1. Error Handler Utility

```typescript
// src/core/error/ErrorHandler.ts

import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  fieldErrors?: FieldError[];
  statusCode?: number;
}

export class ErrorHandler {
  /**
   * معالجة الأخطاء من API
   */
  static handleApiError(error: unknown): AppError {
    // Axios Error
    if (error instanceof AxiosError) {
      const response = error.response?.data;
      
      if (response && !response.success) {
        return {
          code: response.error?.code || 'API_ERROR',
          message: response.error?.message || 'حدث خطأ غير متوقع',
          details: response.error?.details,
          fieldErrors: response.error?.fieldErrors,
          statusCode: error.response?.status,
        };
      }
      
      // Network Error
      if (error.code === 'ERR_NETWORK') {
        return {
          code: 'NETWORK_ERROR',
          message: 'فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت',
          statusCode: 0,
        };
      }
      
      // Timeout
      if (error.code === 'ECONNABORTED') {
        return {
          code: 'TIMEOUT_ERROR',
          message: 'انتهت مهلة الطلب. حاول مرة أخرى',
          statusCode: 408,
        };
      }
    }
    
    // Unknown Error
    return {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
    };
  }

  /**
   * عرض رسالة خطأ للمستخدم
   */
  static showError(error: unknown): void {
    const appError = this.handleApiError(error);
    
    // رسائل خاصة لأكواد معينة
    const customMessages: Record<string, string> = {
      AUTH_INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
      AUTH_TOKEN_EXPIRED: 'انتهت صلاحية الجلسة. سجل الدخول مرة أخرى',
      VALIDATION_ERROR: 'يرجى التحقق من البيانات المدخلة',
      PERMISSION_DENIED: 'ليس لديك صلاحية لتنفيذ هذا الإجراء',
    };
    
    const message = customMessages[appError.code] || appError.message;
    
    toast.error(message, {
      duration: 4000,
      position: 'top-center',
    });
  }

  /**
   * معالجة أخطاء النماذج
   */
  static handleFormErrors(
    error: AppError,
    setError: (field: string, error: { message: string }) => void
  ): void {
    if (error.fieldErrors) {
      error.fieldErrors.forEach((fieldError) => {
        setError(fieldError.field, {
          message: fieldError.message,
        });
      });
    }
  }
}
```

#### 2. Error Boundary Component

```typescript
// src/core/error/ErrorBoundary.tsx

import React, { Component, ErrorInfo } from 'react';
import { Box, Button, Typography, Container } from '@mui/material';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // يمكنك إرسال الخطأ لخدمة مثل Sentry
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container maxWidth="md">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            textAlign="center"
          >
            <Typography variant="h2" component="h1" gutterBottom>
              😔 عذراً
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              حدث خطأ غير متوقع
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
              {this.state.error?.message || 'حدث خطأ أثناء عرض هذه الصفحة'}
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={this.handleReset}
              >
                حاول مرة أخرى
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.href = '/'}
              >
                العودة للرئيسية
              </Button>
            </Box>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
```

#### 3. استخدام Error Handling مع React Query

```typescript
// مثال: استخدام في Custom Hook

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import { usersApi } from '../api/usersApi';

export const useUsers = (params: ListUsersParams) => {
  return useQuery(
    ['users', params],
    () => usersApi.list(params),
    {
      onError: (error) => {
        ErrorHandler.showError(error);
      },
      // إعدادات إضافية
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: CreateUserDto) => usersApi.create(data),
    {
      onSuccess: () => {
        toast.success('تم إنشاء المستخدم بنجاح');
        queryClient.invalidateQueries('users');
      },
      onError: (error) => {
        ErrorHandler.showError(error);
      },
    }
  );
};
```

---

## 🌍 نظام اللغات والاتجاهات

### إعداد i18next

#### 1. التكوين الأساسي

```typescript
// src/core/i18n/i18n.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        common: require('/public/locales/ar/common.json'),
        dashboard: require('/public/locales/ar/dashboard.json'),
        products: require('/public/locales/ar/products.json'),
        // ... باقي الملفات
      },
      en: {
        common: require('/public/locales/en/common.json'),
        dashboard: require('/public/locales/en/dashboard.json'),
        products: require('/public/locales/en/products.json'),
        // ... باقي الملفات
      },
    },
    fallbackLng: 'ar',
    defaultNS: 'common',
    ns: ['common', 'dashboard', 'products', 'users'],
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

#### 2. ملفات الترجمة

```json
// public/locales/ar/common.json
{
  "app": {
    "name": "لوحة تحكم تقدودو",
    "slogan": "نظام إدارة شامل"
  },
  "navigation": {
    "dashboard": "لوحة المعلومات",
    "users": "المستخدمون",
    "products": "المنتجات",
    "orders": "الطلبات",
    "settings": "الإعدادات"
  },
  "actions": {
    "add": "إضافة",
    "edit": "تعديل",
    "delete": "حذف",
    "save": "حفظ",
    "cancel": "إلغاء",
    "search": "بحث",
    "filter": "تصفية",
    "export": "تصدير",
    "import": "استيراد"
  },
  "messages": {
    "success": "تمت العملية بنجاح",
    "error": "حدث خطأ",
    "loading": "جاري التحميل...",
    "noData": "لا توجد بيانات"
  },
  "validation": {
    "required": "هذا الحقل مطلوب",
    "email": "البريد الإلكتروني غير صحيح",
    "minLength": "الحد الأدنى {{min}} حرف",
    "maxLength": "الحد الأقصى {{max}} حرف"
  }
}
```

```json
// public/locales/en/common.json
{
  "app": {
    "name": "Tagadodo Dashboard",
    "slogan": "Complete Management System"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "users": "Users",
    "products": "Products",
    "orders": "Orders",
    "settings": "Settings"
  },
  "actions": {
    "add": "Add",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "search": "Search",
    "filter": "Filter",
    "export": "Export",
    "import": "Import"
  },
  "messages": {
    "success": "Operation completed successfully",
    "error": "An error occurred",
    "loading": "Loading...",
    "noData": "No data available"
  },
  "validation": {
    "required": "This field is required",
    "email": "Invalid email address",
    "minLength": "Minimum {{min}} characters",
    "maxLength": "Maximum {{max}} characters"
  }
}
```

#### 3. Language Store

```typescript
// src/store/languageStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/core/i18n/i18n';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LanguageState {
  language: Language;
  direction: Direction;
  
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'ar',
      direction: 'rtl',

      setLanguage: (lang) => {
        const direction = lang === 'ar' ? 'rtl' : 'ltr';
        
        // تحديث i18n
        i18n.changeLanguage(lang);
        
        // تحديث HTML dir
        document.documentElement.dir = direction;
        document.documentElement.lang = lang;
        
        set({ language: lang, direction });
      },

      toggleLanguage: () => {
        const currentLang = get().language;
        const newLang = currentLang === 'ar' ? 'en' : 'ar';
        get().setLanguage(newLang);
      },
    }),
    {
      name: 'language-storage',
    }
  )
);
```

#### 4. Language Toggle Component

```typescript
// src/shared/components/LanguageToggle.tsx

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from 'react-i18next';

export const LanguageToggle: React.FC = () => {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguageStore();

  return (
    <Tooltip title={language === 'ar' ? 'English' : 'عربي'}>
      <IconButton onClick={toggleLanguage} color="inherit">
        <LanguageIcon />
      </IconButton>
    </Tooltip>
  );
};
```

#### 5. استخدام الترجمة في المكونات

```typescript
// مثال في مكون

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@mui/material';

const ProductsPage: React.FC = () => {
  const { t } = useTranslation(['products', 'common']);

  return (
    <div>
      <Typography variant="h4">
        {t('products:title')}
      </Typography>
      
      <Button variant="contained">
        {t('common:actions.add')}
      </Button>
      
      {/* مع متغيرات */}
      <Typography>
        {t('products:totalProducts', { count: 150 })}
      </Typography>
    </div>
  );
};
```

### دعم RTL في MUI

#### 1. إعداد RTL Theme

```typescript
// src/core/theme/rtlTheme.ts

import { createTheme, Theme } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import createCache from '@emotion/cache';

// إنشاء RTL cache للـ Emotion
export const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// دالة لإنشاء Theme مع RTL
export const createRtlTheme = (theme: Theme): Theme => {
  return createTheme({
    ...theme,
    direction: 'rtl',
  });
};
```

#### 2. تطبيق RTL في App

```typescript
// src/App.tsx

import React, { useEffect } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useLanguageStore } from '@/store/languageStore';
import { cacheRtl, createRtlTheme } from '@/core/theme/rtlTheme';
import CssBaseline from '@mui/material/CssBaseline';

const App: React.FC = () => {
  const { direction } = useLanguageStore();
  
  // إنشاء Theme
  const baseTheme = createTheme({
    // ... theme configuration
  });
  
  const theme = direction === 'rtl' 
    ? createRtlTheme(baseTheme) 
    : baseTheme;

  return (
    <CacheProvider value={direction === 'rtl' ? cacheRtl : undefined}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRouter />
      </ThemeProvider>
    </CacheProvider>
  );
};

export default App;
```

---

## 🎨 نظام الثيمات

### تكوين MUI Theme

```typescript
// src/core/theme/lightTheme.ts

import { createTheme, ThemeOptions } from '@mui/material/styles';

const commonTheme: ThemeOptions = {
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  
  shape: {
    borderRadius: 8,
  },
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#fff',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

export const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#ce93d8',
      light: '#f3e5f5',
      dark: '#ab47bc',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});
```

### Theme Store

```typescript
// src/store/themeStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',

      setMode: (mode) => {
        set({ mode });
      },

      toggleMode: () => {
        const currentMode = get().mode;
        set({ mode: currentMode === 'light' ? 'dark' : 'light' });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
```

### Theme Provider Component

```typescript
// src/core/theme/ThemeProvider.tsx

import React from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
} from '@mui/material';
import { CacheProvider } from '@emotion/react';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { lightTheme, darkTheme } from './lightTheme';
import { cacheRtl, createRtlTheme } from './rtlTheme';

interface Props {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<Props> = ({ children }) => {
  const { mode } = useThemeStore();
  const { direction } = useLanguageStore();

  // اختيار Theme
  let theme = mode === 'light' ? lightTheme : darkTheme;
  
  // تطبيق RTL إذا لزم
  if (direction === 'rtl') {
    theme = createRtlTheme(theme);
  }

  const content = (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );

  // تطبيق RTL cache إذا لزم
  if (direction === 'rtl') {
    return <CacheProvider value={cacheRtl}>{content}</CacheProvider>;
  }

  return content;
};
```

---

هذا الجزء الأول من الخطة الشاملة. سأكمل في الأجزاء التالية:
- المكونات المشتركة
- الصفحات والموديولات
- خطة التنفيذ
- التوثيق والمراجع

هل تريد أن أكمل الآن؟


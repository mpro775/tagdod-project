# Tagadodo Admin Dashboard

> لوحة تحكم إدارية احترافية لمنصة تقدودو

## ✅ ما تم إنجازه

### 1. البنية الأساسية
- ✅ إنشاء مشروع React 19 + TypeScript + Vite
- ✅ تثبيت جميع المكتبات الأساسية
- ✅ إنشاء هيكل المجلدات الكامل
- ✅ إعداد ملفات التكوين (tsconfig, vite.config, prettier)

### 2. Core Systems
- ✅ نظام API Client مع Interceptors
- ✅ نظام المصادقة (Auth System)
  - TokenService
  - Auth Store (Zustand)
  - Auto token refresh
- ✅ نظام اللغات (i18n)
  - دعم العربية والإنجليزية
  - ملفات الترجمة الأساسية
- ✅ نظام الثيمات
  - Light/Dark Mode
  - دعم RTL/LTR
  - Material-UI Theme

### 3. Shared Components
- ✅ Layout Components (MainLayout)
- ✅ Utilities (formatters)
- ✅ Types (common.types)

## 🚀 البدء السريع

### المتطلبات
- Node.js >= 20
- npm >= 10

### التشغيل

```bash
# تثبيت المكتبات (إذا لم يتم)
npm install

# تشغيل المشروع
npm run dev
```

سيفتح المشروع على: `http://localhost:3001`

### البناء للإنتاج

```bash
npm run build
```

## 📁 هيكل المشروع

```
frontend/
├── public/
│   └── locales/
│       ├── ar/
│       └── en/
├── src/
│   ├── config/           # الإعدادات والثوابت
│   ├── core/             # الأنظمة الأساسية
│   │   ├── api/          # API Client
│   │   ├── auth/         # نظام المصادقة
│   │   ├── i18n/         # نظام اللغات
│   │   ├── theme/        # نظام الثيمات
│   │   └── error/        # معالجة الأخطاء
│   ├── shared/           # المكونات والـ Utilities المشتركة
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   ├── features/         # الموديولات (Dashboard, Users, etc.)
│   │   ├── dashboard/
│   │   ├── auth/
│   │   ├── users/
│   │   └── products/
│   ├── store/            # State Management (Zustand)
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

## 🔧 التقنيات المستخدمة

### Frontend Stack
- **React 19** - UI Framework
- **TypeScript 5.5** - Type Safety
- **Vite** - Build Tool
- **Material-UI v6** - UI Components
- **Emotion** - CSS-in-JS

### State Management & Data
- **Zustand** - State Management
- **React Query** - Data Fetching & Caching
- **Axios** - HTTP Client

### Forms & Validation
- **React Hook Form** - Form Management
- **Zod** - Schema Validation

### i18n & RTL
- **i18next** - Internationalization
- **stylis-plugin-rtl** - RTL Support

## 📝 المكتبات المثبتة

### Dependencies
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^6.26.0",
  "@mui/material": "^6.1.0",
  "@mui/icons-material": "^6.1.0",
  "@mui/x-data-grid": "^7.17.0",
  "@mui/x-date-pickers": "^7.17.0",
  "@emotion/react": "^11.13.0",
  "@emotion/styled": "^11.13.0",
  "@emotion/cache": "^11.13.0",
  "axios": "^1.7.0",
  "@tanstack/react-query": "^5.56.0",
  "zustand": "^4.5.0",
  "react-hook-form": "^7.53.0",
  "@hookform/resolvers": "^3.9.0",
  "zod": "^3.23.0",
  "i18next": "^23.15.0",
  "react-i18next": "^15.0.0",
  "date-fns": "^3.6.0",
  "recharts": "^2.12.0",
  "react-hot-toast": "^2.4.1",
  "notistack": "^3.0.1",
  "react-dropzone": "^14.2.0",
  "stylis-plugin-rtl": "^2.1.1"
}
```

## 🎯 الخطوات التالية

### المرحلة القادمة
1. [ ] إنشاء Router و Protected Routes
2. [ ] إنشاء صفحة تسجيل الدخول
3. [ ] إنشاء صفحة Dashboard الرئيسية
4. [ ] إنشاء Sidebar و Header Components
5. [ ] إنشاء DataTable Component
6. [ ] إنشاء Form Components
7. [ ] إنشاء موديول Users Management

### الموديولات المخططة (18 موديول)
- Dashboard
- Users Management
- Products Management
- Categories Management
- Attributes Management
- Brands Management
- Banners Management
- Orders Management
- Coupons Management
- Media Library
- Analytics & Reports
- Support Tickets
- Notifications
- Services & Engineers
- Settings
- Cart Management
- Addresses Management
- Promotions & Price Rules

## 📚 الوثائق

راجع الملفات التالية للمزيد من التفاصيل:
- `../admin-dashboard/ADMIN_DASHBOARD_COMPLETE_PLAN.md` - الخطة الكاملة
- `../admin-dashboard/ADMIN_DASHBOARD_IMPLEMENTATION_GUIDE.md` - دليل التنفيذ
- `../admin-dashboard/ADMIN_DASHBOARD_CONFIGS_EXAMPLES.md` - أمثلة الإعداد
- `../admin-dashboard/ADMIN_DASHBOARD_QUICK_START_GUIDE.md` - دليل البدء السريع

## 🔐 المصادقة

النظام يستخدم JWT مع Access و Refresh Tokens:

```typescript
// تسجيل الدخول
const { login } = useAuthStore();
login(user, accessToken, refreshToken);

// تسجيل الخروج
const { logout } = useAuthStore();
logout();

// التحقق من الصلاحيات
const { hasRole, hasPermission } = useAuthStore();
if (hasRole('admin')) {
  // ...
}
```

## 🌍 اللغات

```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// استخدام الترجمة
<h1>{t('app.name')}</h1>

// تغيير اللغة
i18n.changeLanguage('ar'); // or 'en'
```

## 🎨 الثيمات

```typescript
import { useThemeStore } from '@/store/themeStore';

const { mode, toggleMode, setDirection } = useThemeStore();

// تبديل Light/Dark
toggleMode();

// تغيير الاتجاه
setDirection('rtl'); // or 'ltr'
```

## 📡 API Calls

```typescript
import { apiClient } from '@/core/api/client';

// GET
const response = await apiClient.get('/users');

// POST
const response = await apiClient.post('/users', data);

// PUT/PATCH
const response = await apiClient.patch('/users/123', data);

// DELETE
const response = await apiClient.delete('/users/123');
```

## 🐛 معالجة الأخطاء

```typescript
import { ErrorHandler } from '@/core/error/ErrorHandler';

try {
  // API call
} catch (error) {
  ErrorHandler.showError(error);
  ErrorHandler.logError(error, 'UsersList');
}
```

## 🔄 React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Query
const { data, isLoading } = useQuery(['users'], fetchUsers);

// Mutation
const { mutate } = useMutation(createUser, {
  onSuccess: () => {
    // ...
  },
});
```

## 💡 نصائح

1. **استخدم Path Aliases**
   ```typescript
   import { Button } from '@/shared/components';
   import { useAuthStore } from '@/store/authStore';
   ```

2. **التزم بالـ TypeScript**
   - لا تستخدم `any`
   - أنشئ Types محددة في `shared/types`

3. **استخدم i18n دائماً**
   ```typescript
   // ❌ خطأ
   <Button>Add User</Button>
   
   // ✅ صحيح
   <Button>{t('actions.add')}</Button>
   ```

4. **اتبع هيكل المجلدات**
   - Features في `features/`
   - Shared في `shared/`
   - Core في `core/`

## 🚀 أوامر متاحة

```bash
# Development
npm run dev              # تشغيل المشروع
npm run build            # بناء للإنتاج
npm run preview          # معاينة البناء

# Code Quality
npm run lint             # فحص الأكواد
npm run lint:fix         # إصلاح الأخطاء
npm run type-check       # فحص الـ Types
npm run format           # تنسيق الأكواد
npm run format:check     # فحص التنسيق
```

## 📞 الدعم

للمساعدة والدعم:
- 📧 Email: dev@tagadodo.com
- 💬 Slack: #tagadodo-frontend
- 📚 Docs: `/admin-dashboard/`

---

**✨ تم إنشاء المشروع بنجاح - جاهز للتطوير! 🚀**

**التاريخ:** 14 أكتوبر 2025  
**الإصدار:** 1.0.0  
**المطور:** فريق تقدودو التقني

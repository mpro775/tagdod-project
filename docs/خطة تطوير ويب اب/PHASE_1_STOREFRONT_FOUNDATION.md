# Phase 1 — Storefront Foundation & Web Layout Refactor

## مشروع: تطوير الويب أب إلى متجر ويب احترافي

## الهدف الرئيسي

تحويل أساس الواجهة من تجربة تشبه تطبيق موبايل إلى **Storefront Web Layout احترافي** مناسب للمتاجر الإلكترونية على الديسكتوب والتابلت والموبايل.

هذه المرحلة لا تهدف إلى إعادة بناء كل الصفحات، بل تهدف إلى إصلاح الجذر الذي يجعل الموقع يظهر كأنه تطبيق مستنسخ.  
بعد هذه المرحلة يجب أن يصبح لدينا:

- Header احترافي للديسكتوب.
- Header مناسب للموبايل.
- Footer كامل.
- Container موحد.
- Breadcrumbs قابلة لإعادة الاستخدام.
- Bottom Navigation يظهر فقط في الموبايل.
- Layout عام مناسب لمتجر ويب.
- إزالة الاعتماد العام على `pb-20` و `fixed bottom` في الديسكتوب.
- تجهيز الأرضية لباقي مراحل التطوير.

---

# 1. نطاق المرحلة

## داخل النطاق

يجب تنفيذ التالي:

1. إنشاء Layout جديد للمتجر باسم `StoreLayout`.
2. إنشاء `DesktopHeader`.
3. إنشاء `MobileHeader`.
4. تعديل `BottomNavBar` ليظهر فقط في الموبايل.
5. إنشاء `StoreFooter`.
6. إنشاء `Container` موحد.
7. إنشاء `Breadcrumbs`.
8. تعديل `AppShell` أو استبداله لاستخدام `StoreLayout`.
9. تحسين نظام المسافات العامة للصفحات.
10. إصلاح أسماء بعض المسارات غير الاحترافية أو إضافة redirects لها.
11. توحيد تجربة الديسكتوب والموبايل دون كسر الصفحات الحالية.
12. تجهيز مفاتيح الترجمة اللازمة للهيدر والفوتر والتنقل.

## خارج النطاق

لا تنفذ في هذه المرحلة:

- إعادة بناء الصفحة الرئيسية بالكامل.
- إعادة بناء كروت المنتجات بالكامل.
- إعادة بناء صفحة المنتج بالكامل.
- إعادة بناء السلة بالكامل.
- بناء الفلاتر الاحترافية.
- بناء Mega Menu متقدم جدًا.
- بناء SEO كامل.
- بناء Checkout جديد.

يمكن وضع placeholders بسيطة فقط عند الحاجة.

---

# 2. المشكلة الحالية التي يجب علاجها

الموقع الحالي يعتمد على منطق قريب من تطبيق موبايل:

- `BottomNavBar` ثابت أسفل الشاشة.
- `AppBar` صغير مثل تطبيق.
- الصفحات تعتمد على padding سفلي بسبب الشريط السفلي.
- لا يوجد Footer حقيقي.
- لا يوجد Header متجر احترافي.
- لا يوجد Container Web مناسب.
- لا توجد Breadcrumbs.
- التنقل لا يشبه المتاجر الإلكترونية.
- بعض المسارات مثل `/CartPage` و `/allCategories` غير مناسبة كروابط متجر احترافي.

المطلوب في هذه المرحلة هو إصلاح هذه الأساسات.

---

# 3. الملفات الحالية المهمة للفحص قبل التنفيذ

يجب على وكيل AI فحص هذه الملفات قبل التعديل:

```txt
src/components/layout/AppShell.tsx
src/components/layout/AppBar.tsx
src/components/layout/BottomNavBar.tsx
src/config/routes.tsx
src/router/*
src/features/home/HomePage.tsx
src/features/cart/CartPage.tsx
src/features/categories/*
src/features/search/SearchPage.tsx
src/components/shared/*
src/core/i18n/*
src/index.css
src/App.tsx
```

> ملاحظة: قد تختلف أسماء ملفات الراوتر حسب المشروع. افحص البنية الفعلية ولا تفترض اسمًا واحدًا فقط.

---

# 4. الهيكل المقترح إضافته

أنشئ أو عدّل البنية التالية:

```txt
src/components/layout/
├── StoreLayout.tsx
├── DesktopHeader.tsx
├── MobileHeader.tsx
├── StoreFooter.tsx
├── BottomNavBar.tsx
├── Breadcrumbs.tsx
├── Container.tsx
└── index.ts
```

إن كان المشروع يستخدم هيكلًا مختلفًا، التزم بنمط المشروع الحالي لكن حافظ على نفس التقسيم المنطقي.

---

# 5. المتطلبات التفصيلية

## 5.1 إنشاء Container موحد

### الملف المقترح

```txt
src/components/layout/Container.tsx
```

### الهدف

توحيد عرض المحتوى في جميع صفحات المتجر.

### السلوك المطلوب

- يوفر `max-width` مناسب للديسكتوب.
- يضيف padding أفقي مناسب للموبايل والديسكتوب.
- يقبل `className`.
- يقبل `children`.

### مثال بنية مقترحة

```tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}
```

إن لم يوجد `cn` في المشروع، استخدم template string أو أضف helper بسيط متوافق مع المشروع.

---

## 5.2 إنشاء StoreLayout

### الملف المقترح

```txt
src/components/layout/StoreLayout.tsx
```

### الهدف

يكون هو الجذر الجديد لتجربة المتجر.

### يجب أن يحتوي

- `DesktopHeader`
- `MobileHeader`
- `main`
- `StoreFooter`
- `BottomNavBar` للموبايل فقط

### السلوك المطلوب

- الديسكتوب يستخدم Header علوي وفوتر.
- الموبايل يستخدم Mobile Header وقد يستخدم BottomNavBar.
- لا تضع padding سفلي عام للديسكتوب.
- أي padding متعلق بالـ BottomNav يكون للموبايل فقط.

### مثال بنية

```tsx
import { Outlet } from 'react-router-dom';
import { DesktopHeader } from './DesktopHeader';
import { MobileHeader } from './MobileHeader';
import { StoreFooter } from './StoreFooter';
import { BottomNavBar } from './BottomNavBar';

export function StoreLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DesktopHeader />
      <MobileHeader />

      <main className="min-h-[60vh] pb-20 md:pb-0">
        <Outlet />
      </main>

      <StoreFooter />
      <BottomNavBar />
    </div>
  );
}
```

> مهم: `pb-20` يجب أن يكون فقط لحماية محتوى الموبايل من `BottomNavBar`.  
> لا تستخدم `pb-20` على الديسكتوب.

---

## 5.3 إنشاء DesktopHeader

### الملف المقترح

```txt
src/components/layout/DesktopHeader.tsx
```

### الهدف

بناء Header متجر حقيقي للديسكتوب.

### يجب أن يظهر فقط على الديسكتوب

```tsx
hidden md:block
```

### المكونات المطلوبة داخله

#### 1. Top Bar اختياري لكنه مفضل

يحتوي على:

- رقم تواصل أو نص دعم.
- رابط تتبع الطلب إن وجد.
- اختيار اللغة إن موجود.
- روابط بسيطة مثل: تواصل معنا / من نحن.

#### 2. Main Header

يحتوي على:

- Logo.
- Search bar واضح في المنتصف.
- Account/Login.
- Favorites.
- Cart with count.
- Language switch إذا موجود.

#### 3. Navigation Bar

يحتوي على:

- الرئيسية.
- التصنيفات.
- المنتجات.
- العروض.
- الصيانة أو الخدمات إن كانت موجودة.
- تواصل معنا.

### المتطلبات البصرية

- ارتفاع مناسب.
- خلفية واضحة.
- Border bottom خفيف.
- Search input واضح وعريض.
- Cart icon واضح.
- لا تجعل الهيدر صغيرًا مثل AppBar.
- لا تستخدم fixed header إلا إذا كان موجودًا في التصميم الحالي ومضبوطًا، وإلا اجعله sticky فقط عند الحاجة.

### ملاحظات الربط

- استخدم routes الحالية قدر الإمكان.
- لو لا توجد صفحات لبعض الروابط، استخدم روابط موجودة أو اخفها مؤقتًا.
- لا تكسر التنقل الحالي.

---

## 5.4 إنشاء MobileHeader

### الملف المقترح

```txt
src/components/layout/MobileHeader.tsx
```

### الهدف

تجربة موبايل نظيفة، لكن ليست AppBar فقيرة.

### يجب أن يظهر فقط على الموبايل

```tsx
md:hidden
```

### يحتوي على

- Logo.
- زر بحث أو search compact.
- زر السلة.
- زر القائمة الجانبية أو Drawer إن كان سهلًا.
- لا تكرر نفس `DesktopHeader`.

### الحد الأدنى المقبول

إن لم يوجد Drawer جاهز:

- Logo
- Search icon/link
- Cart icon
- Menu button بسيط يفتح قائمة أو ينقل للتصنيفات

---

## 5.5 تعديل BottomNavBar

### الملف الحالي غالبًا

```txt
src/components/layout/BottomNavBar.tsx
```

### المطلوب

- يجب أن يظهر فقط في الموبايل.
- يجب ألا يظهر نهائيًا في الديسكتوب.
- أضف class:

```tsx
md:hidden
```

### ممنوع

- ممنوع أن يبقى `fixed bottom` ظاهرًا على الديسكتوب.
- ممنوع أن يفرض padding عام على كل الصفحات في الديسكتوب.

### مثال

```tsx
<nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
  ...
</nav>
```

---

## 5.6 إنشاء StoreFooter

### الملف المقترح

```txt
src/components/layout/StoreFooter.tsx
```

### الهدف

إضافة Footer يعطي الموقع طابع متجر احترافي وثقة أعلى.

### يجب أن يحتوي على أقسام

1. نبذة عن المتجر/الشركة.
2. روابط سريعة.
3. خدمة العملاء.
4. السياسات.
5. التواصل.
6. الحقوق.

### روابط مقترحة

- الرئيسية.
- التصنيفات.
- المنتجات.
- السلة.
- حسابي.
- تواصل معنا.
- من نحن.
- سياسة الخصوصية.
- سياسة الاسترجاع.
- الشحن والتوصيل.
- الشروط والأحكام.

### السلوك

- يظهر على الديسكتوب والتابلت.
- يمكن إظهاره على الموبايل أيضًا، لكن يجب ألا يتعارض مع BottomNavBar.
- استخدم Grid responsive.

---

## 5.7 إنشاء Breadcrumbs

### الملف المقترح

```txt
src/components/layout/Breadcrumbs.tsx
```

### الهدف

تجهيز مكون عام يمكن استخدامه لاحقًا في:

- صفحة المنتج.
- صفحة التصنيف.
- صفحة السلة.
- صفحة البحث.

### Props مقترحة

```ts
type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};
```

### السلوك

- أول عنصر غالبًا الرئيسية.
- العنصر الأخير لا يكون رابطًا.
- دعم RTL.
- تصميم بسيط وهادئ.
- لا تستخدم حجمًا كبيرًا.

---

## 5.8 تعديل AppShell أو استبداله

### المطلوب

إذا كان `AppShell` مستخدمًا في الراوتر، أمامك خياران:

#### الخيار الأول — الأفضل

استبدال استخدام `AppShell` بـ `StoreLayout`.

#### الخيار الثاني

تعديل `AppShell` ليصبح داخليًا يستخدم نفس منطق `StoreLayout`.

### المهم

- لا يبقى `AppShell` بمنطق تطبيق موبايل.
- لا يبقى `AppBar` القديم هو الهيدر الأساسي للديسكتوب.
- لا يبقى `BottomNavBar` ظاهرًا على الديسكتوب.

---

## 5.9 التعامل مع AppBar القديم

### المطلوب

- إما حذف الاعتماد عليه من Layout العام.
- أو تحويله إلى `MobileHeader`.
- لا تستخدمه كهيدر ديسكتوب.

### تحذير

لا تترك `AppBar` القديم يظهر فوق `DesktopHeader` حتى لا يتكرر الهيدر.

---

## 5.10 تحسين المسارات Routes

### المشكلة

بعض المسارات الحالية قد تكون مثل:

```txt
/CartPage
/allCategories
```

### المطلوب

إضافة مسارات احترافية:

```txt
/cart
/categories
/products
/search
/account
/orders
```

### مهم جدًا

لا تكسر المسارات القديمة مباشرة.  
أضف redirects مؤقتة:

```txt
/CartPage       -> /cart
/allCategories  -> /categories
```

إذا كان نظام الراوتر يسمح بذلك.

### معايير القبول

- الروابط القديمة لا تكسر المستخدم.
- الروابط الجديدة مستخدمة في الهيدر والفوتر.
- التنقل من الهيدر والفوتر يعمل.

---

# 6. متطلبات الترجمة

إذا كان المشروع يدعم i18n، أضف مفاتيح للهيدر والفوتر بدل النصوص المباشرة.

## مفاتيح مقترحة

### ar.json

```json
{
  "layout": {
    "topBar": {
      "support": "دعم العملاء",
      "trackOrder": "تتبع الطلب",
      "contact": "تواصل معنا"
    },
    "nav": {
      "home": "الرئيسية",
      "categories": "التصنيفات",
      "products": "المنتجات",
      "offers": "العروض",
      "services": "الخدمات",
      "maintenance": "الصيانة",
      "contact": "تواصل معنا",
      "about": "من نحن",
      "cart": "السلة",
      "account": "حسابي",
      "favorites": "المفضلة"
    },
    "search": {
      "placeholder": "ابحث عن منتج أو قطعة..."
    },
    "footer": {
      "aboutTitle": "عن المتجر",
      "aboutText": "متجر إلكتروني يوفر تجربة تسوق سهلة وموثوقة.",
      "quickLinks": "روابط سريعة",
      "customerService": "خدمة العملاء",
      "policies": "السياسات",
      "contact": "التواصل",
      "privacy": "سياسة الخصوصية",
      "returns": "سياسة الاسترجاع",
      "shipping": "الشحن والتوصيل",
      "terms": "الشروط والأحكام",
      "rights": "جميع الحقوق محفوظة"
    }
  }
}
```

### en.json

```json
{
  "layout": {
    "topBar": {
      "support": "Customer Support",
      "trackOrder": "Track Order",
      "contact": "Contact Us"
    },
    "nav": {
      "home": "Home",
      "categories": "Categories",
      "products": "Products",
      "offers": "Offers",
      "services": "Services",
      "maintenance": "Maintenance",
      "contact": "Contact Us",
      "about": "About",
      "cart": "Cart",
      "account": "Account",
      "favorites": "Favorites"
    },
    "search": {
      "placeholder": "Search for a product or part..."
    },
    "footer": {
      "aboutTitle": "About Store",
      "aboutText": "An online store that provides a simple and reliable shopping experience.",
      "quickLinks": "Quick Links",
      "customerService": "Customer Service",
      "policies": "Policies",
      "contact": "Contact",
      "privacy": "Privacy Policy",
      "returns": "Return Policy",
      "shipping": "Shipping & Delivery",
      "terms": "Terms & Conditions",
      "rights": "All rights reserved"
    }
  }
}
```

> إذا كانت ملفات الترجمة موزعة حسب modules، ضع المفاتيح في الملف المناسب حسب بنية المشروع.

---

# 7. معايير التصميم المطلوبة

## Desktop

يجب أن يشعر المستخدم أنه داخل متجر ويب:

- Header عريض وواضح.
- Search bar مركزي.
- روابط تصفح واضحة.
- Cart في الهيدر.
- Footer كامل.
- المحتوى داخل Container وليس ملتصقًا بالحواف.
- لا يوجد Bottom Nav.
- لا توجد أزرار شراء مثبتة أسفل الديسكتوب من هذه المرحلة.

## Mobile

يجب الحفاظ على سهولة التطبيق لكن بشكل Web نظيف:

- Mobile Header مختصر.
- BottomNav مسموح فقط على الموبايل.
- Padding سفلي فقط للموبايل.
- عدم كسر الصفحات الحالية.

## Tablet

- لا يظهر BottomNav إذا كان العرض `md` فأعلى.
- الهيدر الديسكتوب يظهر من `md` أو `lg` حسب الأفضل للتصميم.
- لا يحدث تداخل بين الهيدر والمحتوى.

---

# 8. تعليمات صارمة لوكيل التنفيذ

## ممنوع

- ممنوع تغيير منطق API في هذه المرحلة.
- ممنوع إعادة بناء كل الصفحات.
- ممنوع حذف ملفات مهمة بدون التأكد من عدم استخدامها.
- ممنوع ترك BottomNav يظهر على الديسكتوب.
- ممنوع إضافة مكتبات UI جديدة ثقيلة بدون ضرورة.
- ممنوع كسر RTL.
- ممنوع استخدام نصوص hardcoded إذا المشروع يعتمد i18n.
- ممنوع جعل Header fixed بطريقة تغطي المحتوى.
- ممنوع ترك padding سفلي عام للديسكتوب.
- ممنوع تنفيذ Checkout أو Product Filters هنا.

## مطلوب

- الحفاظ على عمل الصفحات الحالية.
- تحسين الهيكل العام فقط.
- استخدام TypeScript types واضحة.
- استخدام مكونات صغيرة قابلة لإعادة الاستخدام.
- احترام نظام الألوان الحالي.
- احترام الخطوط الحالية.
- الحفاظ على responsive behavior.
- إضافة exports في `index.ts` إن كان المشروع يستخدم barrel exports.
- اختبار build بعد الانتهاء.

---

# 9. خطوات التنفيذ المقترحة

## Step 1 — فحص البنية الحالية

افحص:

- الراوتر.
- AppShell.
- AppBar.
- BottomNavBar.
- ملفات الترجمة.
- طريقة استخدام الأيقونات.
- طريقة استخدام الـ theme/colors.

ثم وثق سريعًا داخل تعليق أو `IMPLEMENTATION_NOTES.md` ما الذي تم تغييره.

---

## Step 2 — إنشاء Container

- أنشئ `Container.tsx`.
- استخدمه داخل الهيدر والفوتر.
- لا تعدل كل الصفحات الآن إلا إذا كان التعديل بسيطًا وآمنًا.

---

## Step 3 — إنشاء DesktopHeader

- أنشئ Header ديسكتوب.
- أضف Search bar.
- أضف روابط التنقل.
- أضف Cart.
- أضف Account/Favorites إن كانت المسارات موجودة.
- استخدم i18n.

---

## Step 4 — إنشاء MobileHeader

- أنشئ Header موبايل.
- أضف logo/search/cart/menu.
- تأكد أنه لا يظهر على الديسكتوب.

---

## Step 5 — تعديل BottomNavBar

- أضف `md:hidden`.
- تأكد من z-index.
- تأكد أن `main` لديه padding سفلي فقط في الموبايل.

---

## Step 6 — إنشاء StoreFooter

- أنشئ Footer كامل.
- اربط روابط حقيقية قدر الإمكان.
- استخدم i18n.
- استخدم responsive grid.

---

## Step 7 — إنشاء Breadcrumbs

- أنشئ المكون.
- لا تحتاج لتطبيقه على كل الصفحات الآن.
- يمكن إضافته تجريبيًا في السلة أو صفحة التصنيف إن كان ذلك آمنًا.

---

## Step 8 — إنشاء StoreLayout وربطه بالراوتر

- استبدل `AppShell` أو عدله.
- تأكد أن `Outlet` يعمل.
- تأكد أن كل الصفحات الحالية تظهر.

---

## Step 9 — تحسين Routes

- أضف `/cart` بدل `/CartPage`.
- أضف `/categories` بدل `/allCategories`.
- أضف redirects للمسارات القديمة.
- حدّث روابط الهيدر والفوتر.

---

## Step 10 — اختبار شامل

شغّل:

```bash
npm run lint
npm run build
```

أو حسب أوامر المشروع:

```bash
pnpm lint
pnpm build
```

إذا المشروع يستخدم yarn:

```bash
yarn lint
yarn build
```

---

# 10. معايير القبول النهائية

لا تعتبر المرحلة مكتملة إلا إذا تحقق التالي:

## Layout

- [ ] يوجد `StoreLayout`.
- [ ] كل الصفحات تعمل داخله.
- [ ] لا يوجد تكرار Header.
- [ ] لا يوجد كسر في الراوتر.

## Desktop

- [ ] يظهر `DesktopHeader`.
- [ ] لا يظهر `BottomNavBar`.
- [ ] يظهر `StoreFooter`.
- [ ] المحتوى داخل عرض مناسب.
- [ ] لا توجد padding سفلية ضخمة بسبب الموبايل.

## Mobile

- [ ] يظهر `MobileHeader`.
- [ ] يظهر `BottomNavBar`.
- [ ] لا يتداخل BottomNav مع المحتوى.
- [ ] السلة والبحث يمكن الوصول لهما.

## Navigation

- [ ] روابط الهيدر تعمل.
- [ ] روابط الفوتر تعمل.
- [ ] `/cart` يعمل.
- [ ] `/categories` يعمل.
- [ ] redirects القديمة تعمل إن أمكن.

## i18n

- [ ] لا توجد نصوص Layout الأساسية hardcoded بدون داعي.
- [ ] مفاتيح العربية والإنجليزية موجودة.
- [ ] لا تظهر مفاتيح الترجمة كنصوص في الواجهة.

## Build

- [ ] TypeScript بدون أخطاء.
- [ ] Build ناجح.
- [ ] لا توجد أخطاء واضحة في Console عند التنقل.

---

# 11. اختبار يدوي بعد التنفيذ

اختبر على الشاشات التالية:

## Mobile

- 360px
- 390px
- 430px

تحقق من:

- ظهور MobileHeader.
- ظهور BottomNav.
- عدم تداخل الفوتر.
- إمكانية فتح السلة والبحث.

## Tablet

- 768px
- 820px
- 1024px

تحقق من:

- عدم ظهور BottomNav عند `md` فأعلى.
- الهيدر لا ينكسر.
- الروابط واضحة.

## Desktop

- 1280px
- 1440px
- 1920px

تحقق من:

- الموقع يبدو كمتجر ويب.
- Header واضح.
- Search واضح.
- Footer واضح.
- المحتوى ليس ضيقًا مثل تطبيق.

---

# 12. مخرجات المرحلة المطلوبة

في نهاية المرحلة يجب تسليم:

1. كود معدل للـ layout.
2. `DesktopHeader`.
3. `MobileHeader`.
4. `StoreFooter`.
5. `Container`.
6. `Breadcrumbs`.
7. `BottomNavBar` معدل للموبايل فقط.
8. تحديث الراوتر.
9. تحديث مفاتيح الترجمة.
10. ملف ملاحظات تنفيذ:

```txt
IMPLEMENTATION_NOTES_PHASE_1.md
```

يحتوي على:

- ما تم تنفيذه.
- الملفات المعدلة.
- أي مشاكل ظهرت.
- أي قرارات اضطرارية.
- ما يجب استكماله في المرحلة الثانية.

---

# 13. نموذج IMPLEMENTATION_NOTES_PHASE_1.md

```md
# Implementation Notes — Phase 1

## Completed

- Created StoreLayout.
- Created DesktopHeader.
- Created MobileHeader.
- Created StoreFooter.
- Created Container.
- Created Breadcrumbs.
- Updated BottomNavBar to mobile only.
- Updated route links.
- Added layout translation keys.

## Modified Files

- src/components/layout/StoreLayout.tsx
- src/components/layout/DesktopHeader.tsx
- src/components/layout/MobileHeader.tsx
- src/components/layout/StoreFooter.tsx
- src/components/layout/BottomNavBar.tsx
- src/components/layout/Container.tsx
- src/components/layout/Breadcrumbs.tsx
- src/config/routes.tsx
- src/core/i18n/locales/ar/*.json
- src/core/i18n/locales/en/*.json

## Notes

- Old AppBar is no longer used as desktop header.
- BottomNavBar is mobile-only.
- Old routes were preserved with redirects where possible.

## Pending for Phase 2

- Rebuild HomePage as professional storefront.
- Replace mobile-like category strip on desktop.
- Add commercial hero section.
- Add trust/features section.
```

---

# 14. Definition of Done

تعتبر المرحلة الأولى مغلقة عندما يكون الانطباع العام عند فتح الموقع من الديسكتوب:

> "هذا متجر ويب حقيقي لديه هيدر وفوتر وتنقل واضح"

وليس:

> "هذا تطبيق موبايل مكبّر داخل المتصفح"

إذا تحقق هذا، ننتقل إلى المرحلة الثانية:  
**Professional Home Page Rebuild**

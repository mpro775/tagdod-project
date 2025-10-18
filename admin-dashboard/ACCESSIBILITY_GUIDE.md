# دليل إمكانية الوصول - Tagadodo Admin Dashboard

## نظرة عامة

تم تطوير لوحة تحكم Tagadodo مع التركيز على إمكانية الوصول الشاملة، مما يضمن أن جميع المستخدمين يمكنهم استخدام النظام بفعالية، بغض النظر عن قدراتهم أو التقنيات المساعدة التي يستخدمونها.

## الميزات المطبقة

### 1. دعم RTL (Right-to-Left)
- **التبديل الديناميكي**: يمكن للمستخدمين التبديل بين العربية والإنجليزية مع تغيير اتجاه النص تلقائياً
- **دعم CSS**: جميع الأنماط تدعم الاتجاهين RTL و LTR
- **خطوط عربية محسنة**: استخدام خطوط Graphik Arabic المحسنة للعربية

### 2. إمكانية الوصول للوحة المفاتيح
- **التنقل بالتبويب**: جميع العناصر التفاعلية قابلة للوصول عبر مفتاح Tab
- **مفاتيح الاختصار**: دعم مفاتيح الاختصار الشائعة (Enter, Space, Escape, Arrow Keys)
- **مؤشرات التركيز**: مؤشرات بصرية واضحة للعنصر النشط

### 3. دعم قارئات الشاشة
- **ARIA Labels**: جميع العناصر التفاعلية لها تسميات ARIA مناسبة
- **Live Regions**: إشعارات فورية للتغييرات في المحتوى
- **Semantic HTML**: استخدام العناصر الدلالية الصحيحة

### 4. التباين العالي
- **وضع التباين العالي**: تحسين الألوان للوضوح الأقصى
- **كشف تفضيلات النظام**: كشف وإعداد التباين العالي تلقائياً
- **ألوان محسنة**: مخطط ألوان يلبي معايير WCAG

### 5. تقليل الحركة
- **وضع الحركة المحدودة**: إزالة أو تقليل الحركات والانتقالات
- **احترام تفضيلات النظام**: كشف تفضيلات المستخدم للحركة المحدودة
- **بدائل بصرية**: مؤشرات بديلة للحركة

## المكونات المتاحة

### 1. AccessibleButton
```tsx
import { AccessibleButton } from '@/shared/components';

<AccessibleButton
  variant="primary"
  size="medium"
  loading={false}
  loadingText="جاري التحميل..."
  description="زر لإضافة منتج جديد"
  onClick={handleClick}
>
  إضافة منتج
</AccessibleButton>
```

### 2. AccessibleFormField
```tsx
import { AccessibleFormField } from '@/shared/components';

<AccessibleFormField
  label="اسم المنتج"
  type="text"
  required
  error={hasError}
  errorMessage="اسم المنتج مطلوب"
  helperText="أدخل اسم المنتج باللغة العربية"
  description="حقل إدخال اسم المنتج"
/>
```

### 3. AccessibleNavigation
```tsx
import { AccessibleNavigation } from '@/shared/components';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    icon: <DashboardIcon />,
    href: '/dashboard',
    description: 'عرض الإحصائيات الرئيسية'
  }
];

<AccessibleNavigation
  title="Tagadodo Admin"
  items={navigationItems}
  onItemClick={handleItemClick}
/>
```

### 4. AccessibilitySettings
```tsx
import { AccessibilitySettings } from '@/shared/components';

<AccessibilitySettings
  onClose={handleClose}
/>
```

## الـ Hooks المتاحة

### 1. useRTL
```tsx
import { useRTL } from '@/shared/hooks';

const {
  isRTL,
  direction,
  toggleRTL,
  getTextAlign,
  getFlexDirection,
  createRTLStyles
} = useRTL();
```

### 2. useAccessibility
```tsx
import { useAccessibility } from '@/shared/hooks';

const {
  useFocusTrap,
  useSkipLink,
  useLiveRegion,
  useKeyboardNavigation,
  useModalAccessibility,
  useFormFieldAccessibility
} = useAccessibility();
```

## إعدادات ESLint

تم تكوين ESLint مع `eslint-plugin-jsx-a11y` لفحص إمكانية الوصول:

```javascript
// eslint.config.js
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default defineConfig([
  {
    extends: [
      jsxA11y.configs.recommended,
    ],
    rules: {
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/aria-props': 'error',
      // ... المزيد من القواعد
    },
  },
]);
```

## CSS للوصول

تم إضافة ملف `accessibility.css` الذي يتضمن:

- **High Contrast Mode**: أنماط للتباين العالي
- **Reduced Motion**: أنماط للحركة المحدودة
- **RTL Support**: دعم كامل للاتجاه من اليمين لليسار
- **Focus Management**: إدارة التركيز والتنقل
- **Screen Reader Support**: دعم قارئات الشاشة

## أفضل الممارسات

### 1. استخدام ARIA Labels
```tsx
<button
  aria-label="إغلاق النافذة"
  aria-describedby="close-description"
>
  ×
</button>
```

### 2. إدارة التركيز
```tsx
const { useFocusTrap } = useAccessibility();
const containerRef = useFocusTrap(isModalOpen);
```

### 3. الإشعارات للقارئات
```tsx
const { useLiveRegion } = useAccessibility();
const { announce } = useLiveRegion('polite');
announce('تم حفظ البيانات بنجاح');
```

### 4. التنقل بالكيبورد
```tsx
const { useKeyboardNavigation } = useAccessibility();
const { handleKeyDown } = useKeyboardNavigation(menuItems, 'vertical');
```

## الاختبار

### 1. اختبار قارئات الشاشة
- **NVDA**: قارئ شاشة مجاني لنظام Windows
- **JAWS**: قارئ شاشة متقدم لنظام Windows
- **VoiceOver**: قارئ شاشة مدمج في macOS

### 2. اختبار التنقل بالكيبورد
- تأكد من إمكانية الوصول لجميع العناصر باستخدام Tab
- تأكد من عمل مفاتيح الاختصار بشكل صحيح
- تأكد من وضوح مؤشرات التركيز

### 3. اختبار التباين
- استخدم أدوات فحص التباين مثل WebAIM Contrast Checker
- تأكد من تحقيق معايير WCAG AA على الأقل

## الموارد الإضافية

### 1. معايير WCAG
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Resources](https://webaim.org/)

### 2. أدوات الاختبار
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)

### 3. التوثيق التقني
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)

## الدعم والمساعدة

إذا واجهت أي مشاكل في إمكانية الوصول أو تحتاج إلى مساعدة في التطبيق، يرجى التواصل مع فريق التطوير.

---

**ملاحظة**: هذا الدليل يتم تحديثه باستمرار لضمان أفضل تجربة مستخدم ممكنة لجميع المستخدمين.

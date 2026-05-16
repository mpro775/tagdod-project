# Phase 6 — Cart & Checkout UX Rebuild

## مشروع: تطوير الويب أب إلى متجر ويب احترافي

## المرحلة السادسة: إعادة بناء السلة وتجربة الشراء Cart & Checkout UX

---

# 1. الهدف الرئيسي

تحويل صفحة السلة وتجربة الشراء من تجربة قريبة من تطبيق موبايل إلى **تجربة متجر ويب احترافية** واضحة، موثوقة، وسهلة الاستخدام على الديسكتوب والموبايل.

هذه المرحلة تركّز على:

- صفحة السلة.
- ملخص الطلب.
- تعديل الكميات.
- حذف المنتجات.
- الكوبونات إن كانت مدعومة.
- تقدير الشحن إن كان مدعومًا.
- Empty Cart احترافي.
- تحسين Checkout entry point.
- تحسين تجربة الموبايل دون إفساد الديسكتوب.
- الحفاظ على منطق السلة الحالي.

بعد تنفيذ هذه المرحلة يجب أن يشعر المستخدم أن السلة جزء من متجر إلكتروني حقيقي، وليس قائمة منتجات بتصميم تطبيق.

---

# 2. الاعتماد على المراحل السابقة

هذه المرحلة تعتمد على:

## Phase 1 — Storefront Foundation

- `StoreLayout`
- `DesktopHeader`
- `MobileHeader`
- `StoreFooter`
- `Container`
- `Breadcrumbs`
- BottomNav للموبايل فقط

## Phase 2 — Professional Home Page

- تنظيم الصفحة الرئيسية.
- أقسام المنتجات.

## Phase 3 — Product Card System

- Product helpers.
- ProductCard variants.
- ProductPrice formatting.

## Phase 4 — Product Listing & Filters

- صفحات المنتجات والتصفح.
- روابط المنتجات.
- Query params.

## Phase 5 — Product Details Page

- Add to cart من صفحة المنتج.
- Quantity/Variants.
- Product availability logic.

المرحلة السادسة يجب أن تستهلك السلة الناتجة من المراحل السابقة، وتحسن عرضها وإكمال الشراء.

---

# 3. المشكلة الحالية

صفحة السلة الحالية غالبًا تعاني من:

- تصميم يشبه تطبيق موبايل.
- زر دفع ثابت أسفل الصفحة حتى على الديسكتوب.
- غياب Order Summary واضح في الديسكتوب.
- عناصر السلة تظهر كـ cards فقط، بدون تخطيط Web مناسب.
- لا يوجد تقسيم واضح بين المنتجات والملخص.
- لا يوجد Empty Cart احترافي.
- لا يوجد تقدير تكلفة واضح.
- لا يوجد Coupon UX واضح إن كان مدعومًا.
- لا توجد Breadcrumbs.
- لا توجد حالات loading/error مناسبة.
- لا توجد حماية كافية عند تعديل الكمية.
- لا يوجد تمييز واضح للمنتجات غير المتوفرة أو المتغيرات.
- الديسكتوب لا يستفيد من المساحة الواسعة.

---

# 4. نطاق المرحلة

## داخل النطاق

يجب تنفيذ التالي:

1. إعادة بناء صفحة السلة.
2. إنشاء Layout احترافي للسلة.
3. إنشاء `CartItemsList`.
4. إنشاء `CartItemRow` للديسكتوب.
5. إنشاء `CartItemCard` للموبايل.
6. إنشاء `OrderSummary`.
7. إنشاء `CartQuantityControl`.
8. إنشاء `CartCouponBox` إذا كان مدعومًا.
9. إنشاء `CartShippingEstimate` إذا كان مدعومًا.
10. إنشاء `CartEmptyState`.
11. إنشاء `CartLoadingState`.
12. إنشاء `CartErrorState`.
13. إنشاء `CartMobileCheckoutBar` للموبايل فقط.
14. إزالة fixed checkout button من الديسكتوب.
15. تحسين Checkout CTA.
16. الحفاظ على منطق السلة الحالي.
17. دعم المنتجات ذات المتغيرات.
18. دعم المنتجات غير المتوفرة أو غير الصالحة إن أمكن.
19. إضافة Breadcrumbs.
20. إضافة مفاتيح ترجمة عربية وإنجليزية.
21. تحسين responsive behavior.

## خارج النطاق

لا تنفذ في هذه المرحلة:

- بوابة دفع حقيقية جديدة.
- Backend جديد للطلبات.
- نظام كوبونات backend جديد.
- نظام شحن backend جديد.
- إعادة بناء صفحة المنتج.
- إعادة بناء Product Listing.
- SEO كامل.
- صفحة تتبع الطلبات.
- نظام عناوين كامل إذا لم يكن موجودًا.
- نظام تسجيل دخول كامل.
- Admin order management.
- Email/SMS notifications.

إذا كان Checkout موجودًا، حسّن مدخل الانتقال إليه وتجربة السلة فقط.  
إذا لم يكن Checkout موجودًا، جهّز CTA آمن وواضح إلى المسار الموجود أو اترك TODO واضح.

---

# 5. الملفات الحالية المهمة للفحص

افحص قبل التنفيذ:

```txt
src/features/cart/CartPage.tsx
src/features/cart/*
src/stores/*
src/services/*
src/api/*
src/types/*
src/features/product/*
src/components/layout/Breadcrumbs.tsx
src/components/layout/Container.tsx
src/components/ecommerce/product-card/*
src/components/shared/*
src/config/routes.tsx
src/core/i18n/*
```

ابحث عن:

```txt
cartStore
useCart
cartItems
addToCart
removeFromCart
updateQuantity
clearCart
checkout
coupon
discount
shipping
subtotal
total
currency
variant
product
stock
```

لا تفترض أسماء الدوال أو الحقول. افحص الموجود فعليًا.

---

# 6. الهيكل المقترح للملفات

أنشئ أو نظّم مكونات السلة داخل:

```txt
src/features/cart/components/
├── CartLayout.tsx
├── CartItemsList.tsx
├── CartItemRow.tsx
├── CartItemCard.tsx
├── CartQuantityControl.tsx
├── CartItemPrice.tsx
├── CartItemMeta.tsx
├── OrderSummary.tsx
├── CartCouponBox.tsx
├── CartShippingEstimate.tsx
├── CartEmptyState.tsx
├── CartLoadingState.tsx
├── CartErrorState.tsx
├── CartMobileCheckoutBar.tsx
├── cart.helpers.ts
├── cart.types.ts
└── index.ts
```

وصفحة السلة الرئيسية:

```txt
src/features/cart/CartPage.tsx
```

إذا بنية المشروع مختلفة، التزم بالنمط الحالي، لكن حافظ على الفصل المنطقي.

---

# 7. التصميم العام المطلوب

## Desktop Layout

```txt
CartPage
├── Breadcrumbs
├── Page Header
└── Cart Layout
    ├── Cart Items Area
    │   ├── CartItemRow
    │   ├── CartItemRow
    │   └── ...
    └── OrderSummary
        ├── Subtotal
        ├── Discount
        ├── Shipping
        ├── Total
        ├── CouponBox
        └── Checkout Button
```

## Mobile Layout

```txt
CartPage
├── Breadcrumbs compact
├── Page Header
├── CartItemCard list
├── OrderSummary
└── CartMobileCheckoutBar
```

مهم:

- `CartMobileCheckoutBar` يظهر فقط على الموبايل.
- لا يظهر أي fixed checkout bar على الديسكتوب.
- لا يغطي BottomNav.
- إذا يوجد BottomNav، اضبط padding سفلي للموبايل فقط.

---

# 8. المتطلبات التفصيلية

## 8.1 CartPage

### الهدف

الصفحة الرئيسية للسلة.

### يجب أن تحتوي

- Breadcrumbs.
- عنوان الصفحة.
- عدد العناصر.
- Cart layout.
- Empty state إذا السلة فارغة.
- Loading/Error states إن كان للسلة تحميل من API.
- Order summary.
- Mobile checkout bar.

### لا يجب

- لا تضع كل منطق السلة داخل ملف واحد ضخم.
- لا تستخدم fixed bottom على الديسكتوب.
- لا تكسر store الحالي.

---

## 8.2 CartItemsList

### الهدف

عرض عناصر السلة بشكل موحد.

### السلوك

Desktop:

- استخدم `CartItemRow`.
- يمكن أن يظهر كقائمة rows أو table-like layout.

Mobile:

- استخدم `CartItemCard`.
- تصميم مريح للمساحة الصغيرة.

### Props مقترحة

```ts
type CartItemsListProps = {
  items: CartItem[];
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
};
```

استخدم type الفعلي من المشروع.

---

## 8.3 CartItemRow

### الهدف

عرض عنصر السلة في الديسكتوب.

### يجب أن يحتوي

- صورة المنتج.
- اسم المنتج.
- رابط المنتج.
- المتغيرات إن وجدت.
- SKU إن وجد.
- السعر الفردي.
- كمية.
- الإجمالي.
- زر حذف.
- حالة التوفر إن وجدت.

### تصميم مقترح

```txt
[Image] [Product Info] [Unit Price] [Quantity] [Total] [Remove]
```

### مهم

- لا تجعل card ضخم جدًا.
- لا تجعل النصوص تتداخل.
- استخدم line-clamp للاسم عند الحاجة.
- الصورة fallback إذا غير موجودة.

---

## 8.4 CartItemCard

### الهدف

عرض عنصر السلة في الموبايل.

### يجب أن يحتوي

- صورة المنتج.
- الاسم.
- المتغيرات.
- السعر.
- كمية.
- الإجمالي.
- حذف.

### التصميم

- card compact.
- لا يوجد table على الموبايل.
- أزرار الكمية سهلة الضغط.
- لا يوجد overflow.

---

## 8.5 CartQuantityControl

### الهدف

تعديل كمية المنتج داخل السلة.

### يجب أن يدعم

- زيادة.
- نقصان.
- حد أدنى 1.
- حد أعلى حسب stock إن كان معروفًا.
- تعطيل الأزرار أثناء التحديث إن كان async.
- عدم السماح بقيم سالبة أو صفر.
- منع تجاوز المخزون إن كان معروفًا.

### مهم

إذا updateQuantity الحالي يتوقع:

```txt
productId
cartItemId
variantId
```

استخدم المطلوب فعليًا.  
لا تفترض `id` فقط.

---

## 8.6 CartItemPrice

### الهدف

توحيد عرض سعر عنصر السلة.

### يجب أن يعرض

- السعر الفردي.
- السعر قبل الخصم إن وجد.
- إجمالي العنصر.
- العملة.
- fallback إذا السعر غير موجود.

### ملاحظة

اعتمد العملة من النظام أو المنتج.  
لا تستخدم USD افتراضيًا.  
إذا المشروع يعتمد YER، اعرض الريال اليمني عند الحاجة.

---

## 8.7 CartItemMeta

### الهدف

عرض تفاصيل المنتج داخل السلة.

### معلومات محتملة

- المتغيرات:
  - اللون.
  - الحجم.
  - السعة.
- SKU.
- التصنيف.
- البراند.
- حالة التوفر.

### قواعد

- لا تعرض حقول فارغة.
- لا تعرض `undefined`.
- لا تكرر معلومات كثيرة.

---

## 8.8 OrderSummary

### الهدف

إعطاء المستخدم ملخصًا واضحًا للتكلفة.

### يجب أن يحتوي

- Subtotal.
- Discount إن وجد.
- Coupon discount إن وجد.
- Shipping إن وجد.
- Tax إن وجد.
- Total.
- Checkout button.
- ملاحظة صغيرة عن الشحن أو الضرائب إذا غير نهائية.

### التصميم

- Card جانبي على الديسكتوب.
- يمكن أن يكون sticky داخل الصفحة على الديسكتوب إذا لا يسبب مشاكل.
- يظهر بعد العناصر على الموبايل.
- واضح وقابل للقراءة.

### ملاحظة مهمة

إذا الشحن أو الضريبة لا يتم حسابها الآن، لا تخترع أرقامًا.  
اعرض نصًا آمنًا:

```txt
يتم احتساب الشحن عند تأكيد الطلب.
```

---

## 8.9 CartCouponBox

### الهدف

تجربة إدخال الكوبون إذا النظام يدعم ذلك.

### إذا الكوبونات مدعومة

- input للكود.
- زر تطبيق.
- زر إزالة.
- عرض الخطأ.
- عرض الخصم.

### إذا غير مدعومة

- لا تعرض box للمستخدم.
- ضع TODO في notes.
- لا تبني نظام وهمي.

---

## 8.10 CartShippingEstimate

### الهدف

عرض تقدير الشحن إذا النظام يدعمه.

### إذا مدعوم

- اختيار المدينة/العنوان إن موجود.
- عرض تكلفة الشحن.
- عرض رسالة عند عدم توفر الشحن.

### إذا غير مدعوم

- استخدم نصًا عامًا داخل OrderSummary:

```txt
يتم احتساب تكلفة الشحن عند تأكيد الطلب.
```

---

## 8.11 CartEmptyState

### الهدف

حالة سلة فارغة احترافية.

### يجب أن تحتوي

- رسم/أيقونة بسيطة.
- عنوان واضح.
- وصف.
- زر العودة للتسوق.
- رابط التصنيفات أو المنتجات.

### نص مقترح

```txt
سلتك فارغة
ابدأ بإضافة المنتجات التي تحتاجها إلى السلة.
```

### CTA

- تصفح المنتجات.
- تصفح التصنيفات.

---

## 8.12 CartLoadingState

### الهدف

Loading مناسب للسلة.

### يجب أن يحتوي

- skeleton لعناصر السلة.
- skeleton للملخص.
- لا تستخدم spinner فقط.

---

## 8.13 CartErrorState

### الهدف

معالجة فشل تحميل السلة أو تحديثها.

### يحتوي على

- رسالة خطأ.
- زر إعادة المحاولة إن أمكن.
- رابط العودة للتسوق.

---

## 8.14 CartMobileCheckoutBar

### الهدف

تسهيل الانتقال للدفع على الموبايل.

### يظهر فقط على الموبايل

```txt
md:hidden
```

### يحتوي على

- الإجمالي.
- زر إتمام الطلب.
- عدد العناصر اختياري.

### مهم جدًا

- لا يظهر على الديسكتوب.
- لا يغطي BottomNav.
- إذا BottomNav موجود، ضع sticky bar فوقه أو اجعل الصفحة تمنح padding كافيًا.
- لا يظهر إذا السلة فارغة.
- لا يظهر إذا يوجد خطأ يمنع الشراء.

---

# 9. Checkout Entry Requirements

## إذا صفحة checkout موجودة

اربط زر checkout بالمسار الموجود:

```txt
/checkout
/orders/checkout
```

حسب المشروع.

## إذا لا توجد صفحة checkout

- لا تنشئ checkout كامل هنا.
- اربط إلى المسار الأقرب إن وجد.
- أو أظهر زر CTA مع disabled state ورسالة واضحة في notes فقط، لكن الأفضل وجود مسار آمن.

## شروط تعطيل checkout

يجب تعطيل زر إتمام الطلب إذا:

- السلة فارغة.
- يوجد منتج غير متوفر ولا يمكن طلبه.
- توجد كمية أكبر من المخزون المعروف.
- توجد متغيرات ناقصة داخل عنصر السلة.
- السلة في حالة تحديث.

---

# 10. Data & Helper Requirements

أنشئ:

```txt
cart.helpers.ts
```

## وظائف مقترحة

```ts
getCartItemId(item)
getCartItemProductId(item)
getCartItemProductName(item)
getCartItemProductHref(item)
getCartItemImage(item)
getCartItemVariantLabel(item)
getCartItemSku(item)
getCartItemUnitPrice(item)
getCartItemComparePrice(item)
getCartItemQuantity(item)
getCartItemTotal(item)
getCartItemCurrency(item)
getCartItemStock(item)
isCartItemAvailable(item)
canIncreaseQuantity(item)
calculateCartSubtotal(items)
calculateCartDiscount(items)
calculateCartTotal(items, extras?)
formatCartPrice(amount, currency)
```

### الهدف

تجنب تكرار قراءة بيانات السلة في كل مكون.

---

# 11. التعامل مع Cart Store

## يجب فحص

- شكل item داخل السلة.
- طريقة update quantity.
- طريقة remove.
- طريقة clear.
- هل السلة local فقط أو API.
- هل التحديث async أو sync.
- هل يوجد loading state.
- هل يوجد error state.

## ممنوع

- ممنوع تغيير cart store جذريًا.
- ممنوع كسر add to cart من صفحة المنتج.
- ممنوع كسر عدد عناصر السلة في الهيدر.
- ممنوع تغيير schema بدون تحديث كل الأماكن.

---

# 12. Breadcrumb Requirements

استخدم `Breadcrumbs` من المرحلة الأولى.

## مثال

```txt
الرئيسية / السلة
```

أو:

```txt
Home / Cart
```

حسب اللغة.

---

# 13. Responsive Requirements

## Mobile

- Cart items كـ cards.
- أزرار الكمية سهلة اللمس.
- Mobile checkout bar يظهر.
- لا يوجد overflow.
- BottomNav لا يغطي checkout bar.
- Empty state مناسب.

## Tablet

- يمكن استخدام cards أو rows حسب العرض.
- OrderSummary يظهر أسفل أو بجانب حسب المساحة.

## Desktop

- Cart layout بعمودين:
  - items.
  - summary.
- لا يوجد fixed checkout button.
- OrderSummary واضح وربما sticky.
- العناصر ليست cards موبايل ضخمة.

---

# 14. i18n Requirements

أضف مفاتيح ترجمة.

## ar.json مقترح

```json
{
  "cart": {
    "breadcrumb": {
      "home": "الرئيسية",
      "cart": "السلة"
    },
    "title": "سلة التسوق",
    "itemsCount": "{{count}} عنصر",
    "itemsCount_plural": "{{count}} عناصر",
    "labels": {
      "product": "المنتج",
      "unitPrice": "سعر الوحدة",
      "quantity": "الكمية",
      "total": "الإجمالي",
      "subtotal": "المجموع الفرعي",
      "discount": "الخصم",
      "couponDiscount": "خصم الكوبون",
      "shipping": "الشحن",
      "tax": "الضريبة",
      "grandTotal": "الإجمالي النهائي",
      "sku": "رمز المنتج",
      "variant": "الخيار",
      "availability": "التوفر"
    },
    "actions": {
      "increase": "زيادة الكمية",
      "decrease": "تقليل الكمية",
      "remove": "حذف",
      "clearCart": "تفريغ السلة",
      "continueShopping": "متابعة التسوق",
      "browseProducts": "تصفح المنتجات",
      "browseCategories": "تصفح التصنيفات",
      "checkout": "إتمام الطلب",
      "applyCoupon": "تطبيق",
      "removeCoupon": "إزالة الكوبون",
      "retry": "إعادة المحاولة"
    },
    "coupon": {
      "title": "هل لديك كوبون؟",
      "placeholder": "أدخل كود الخصم",
      "applied": "تم تطبيق الكوبون",
      "invalid": "كود الخصم غير صالح",
      "notSupported": "الكوبونات غير متاحة حاليًا"
    },
    "shipping": {
      "calculatedAtCheckout": "يتم احتساب الشحن عند تأكيد الطلب.",
      "estimateTitle": "تقدير الشحن"
    },
    "stock": {
      "inStock": "متوفر",
      "outOfStock": "غير متوفر",
      "limitedStock": "كمية محدودة",
      "quantityUnavailable": "الكمية المطلوبة غير متوفرة"
    },
    "states": {
      "loading": "جاري تحميل السلة...",
      "emptyTitle": "سلتك فارغة",
      "emptySubtitle": "ابدأ بإضافة المنتجات التي تحتاجها إلى السلة.",
      "errorTitle": "تعذر تحميل السلة",
      "errorSubtitle": "حدث خطأ أثناء تحميل السلة. حاول مرة أخرى.",
      "updating": "جاري التحديث..."
    },
    "summary": {
      "title": "ملخص الطلب",
      "note": "قد تختلف تكلفة الشحن النهائية حسب المدينة وطريقة التوصيل.",
      "secureCheckout": "إتمام آمن للطلب"
    }
  }
}
```

## en.json مقترح

```json
{
  "cart": {
    "breadcrumb": {
      "home": "Home",
      "cart": "Cart"
    },
    "title": "Shopping Cart",
    "itemsCount": "{{count}} item",
    "itemsCount_plural": "{{count}} items",
    "labels": {
      "product": "Product",
      "unitPrice": "Unit Price",
      "quantity": "Quantity",
      "total": "Total",
      "subtotal": "Subtotal",
      "discount": "Discount",
      "couponDiscount": "Coupon Discount",
      "shipping": "Shipping",
      "tax": "Tax",
      "grandTotal": "Grand Total",
      "sku": "SKU",
      "variant": "Option",
      "availability": "Availability"
    },
    "actions": {
      "increase": "Increase quantity",
      "decrease": "Decrease quantity",
      "remove": "Remove",
      "clearCart": "Clear Cart",
      "continueShopping": "Continue Shopping",
      "browseProducts": "Browse Products",
      "browseCategories": "Browse Categories",
      "checkout": "Checkout",
      "applyCoupon": "Apply",
      "removeCoupon": "Remove Coupon",
      "retry": "Retry"
    },
    "coupon": {
      "title": "Have a coupon?",
      "placeholder": "Enter coupon code",
      "applied": "Coupon applied",
      "invalid": "Invalid coupon code",
      "notSupported": "Coupons are not available right now"
    },
    "shipping": {
      "calculatedAtCheckout": "Shipping is calculated when confirming the order.",
      "estimateTitle": "Shipping Estimate"
    },
    "stock": {
      "inStock": "In Stock",
      "outOfStock": "Out of Stock",
      "limitedStock": "Limited Stock",
      "quantityUnavailable": "Requested quantity is not available"
    },
    "states": {
      "loading": "Loading cart...",
      "emptyTitle": "Your cart is empty",
      "emptySubtitle": "Start adding the products you need to your cart.",
      "errorTitle": "Could not load cart",
      "errorSubtitle": "An error occurred while loading the cart. Please try again.",
      "updating": "Updating..."
    },
    "summary": {
      "title": "Order Summary",
      "note": "Final shipping cost may vary depending on city and delivery method.",
      "secureCheckout": "Secure checkout"
    }
  }
}
```

ضع المفاتيح حسب بنية ملفات الترجمة الحالية.

---

# 15. UX Rules

## يجب

- المستخدم يرى بوضوح ماذا في السلة.
- المستخدم يرى تكلفة الطلب بوضوح.
- تعديل الكمية سهل.
- حذف المنتج سهل.
- إتمام الطلب واضح.
- السلة الفارغة تدفع المستخدم للعودة للتسوق.
- الديسكتوب يستخدم layout بعمودين.
- الموبايل يستخدم cards و sticky checkout bar فقط للموبايل.
- لا توجد أرقام مزيفة للشحن أو الخصم.

## ممنوع

- ممنوع fixed checkout bar على الديسكتوب.
- ممنوع إظهار كوبون إذا غير مدعوم.
- ممنوع حساب شحن وهمي.
- ممنوع السماح بكمية 0 أو سالبة.
- ممنوع السماح بتجاوز المخزون إذا معروف.
- ممنوع حذف item بدون تأكيد إذا المشروع يتطلب confirmation، لكن لا تضف modal معقد بلا ضرورة.
- ممنوع كسر cart store.
- ممنوع تجاهل RTL.
- ممنوع استخدام USD كافتراضي إذا المشروع يعتمد YER أو عملة من config.

---

# 16. Accessibility Requirements

- أزرار الكمية لها `aria-label`.
- زر الحذف له `aria-label`.
- زر checkout واضح.
- inputs لها labels.
- رسائل الخطأ مفهومة.
- لا تعتمد على اللون فقط.
- focus states واضحة.
- OrderSummary قابل للقراءة بالكيبورد.
- لا تجعل card كله clickable إذا داخله أزرار.

---

# 17. Performance Requirements

- لا تعيد حساب totals بطريقة مكلفة داخل كل render.
- استخدم helpers أو memo عند الحاجة.
- لا تضف مكتبات كبيرة.
- لا تستخدم صور بحجم ضخم.
- skeleton بدل spinner فقط.
- تجنب rerender لكل السلة عند تعديل عنصر واحد قدر الإمكان، دون تعقيد زائد.

---

# 18. خطوات التنفيذ

## Step 1 — فحص Cart Store والـ Types

حدد:

- شكل عناصر السلة.
- كيف يتم تحديث الكمية.
- كيف يتم حذف عنصر.
- كيف يتم تفريغ السلة.
- هل يوجد coupon.
- هل يوجد shipping.
- هل يوجد checkout route.
- كيف يتم حساب total حاليًا.
- العملة المستخدمة.

وثق ذلك في `IMPLEMENTATION_NOTES_PHASE_6.md`.

---

## Step 2 — إنشاء helpers وtypes

أنشئ:

```txt
cart.helpers.ts
cart.types.ts
```

لتوحيد:

- قراءة عناصر السلة.
- حساب subtotal.
- حساب total.
- تنسيق الأسعار.
- التحقق من توفر المنتج.
- التحقق من إمكانية checkout.

---

## Step 3 — بناء Cart Layout

أنشئ:

```txt
CartLayout.tsx
```

يحتوي على:

- items area.
- summary area.
- responsive grid.

---

## Step 4 — بناء CartItemRow و CartItemCard

- Row للديسكتوب.
- Card للموبايل.
- نفس البيانات.
- نفس actions.

---

## Step 5 — بناء Quantity Control

- زيادة/نقصان.
- validation.
- update quantity.
- disabled states.

---

## Step 6 — بناء OrderSummary

- subtotal.
- discount.
- shipping note.
- total.
- checkout button.
- disabled states.

---

## Step 7 — بناء Coupon/Shipping حسب الدعم

- إذا مدعوم: نفذ الواجهة.
- إذا غير مدعوم: أخف القسم.
- وثق في notes.

---

## Step 8 — بناء Empty/Loading/Error states

- Empty cart احترافي.
- Loading skeleton.
- Error state.

---

## Step 9 — بناء Mobile Checkout Bar

- يظهر فقط للموبايل.
- total + checkout.
- لا يغطي BottomNav.
- لا يظهر عند السلة الفارغة.

---

## Step 10 — تحديث CartPage

استبدل التصميم القديم بالمكونات الجديدة.

احذف أو عطّل أي fixed checkout للديسكتوب.

---

## Step 11 — إضافة الترجمة

أضف مفاتيح ar/en وتأكد من عدم ظهور مفاتيح خام.

---

## Step 12 — اختبار build

شغّل:

```bash
npm run lint
npm run build
```

أو:

```bash
pnpm lint
pnpm build
```

أو:

```bash
yarn lint
yarn build
```

حسب المشروع.

---

# 19. معايير القبول النهائية

لا تعتبر المرحلة مكتملة إلا إذا تحقق التالي:

## Cart Page

- [ ] `/cart` يعمل.
- [ ] تعرض Breadcrumbs.
- [ ] تعرض عنوان السلة وعدد العناصر.
- [ ] تعرض عناصر السلة بشكل row على الديسكتوب.
- [ ] تعرض عناصر السلة بشكل card على الموبايل.
- [ ] تعرض OrderSummary واضح.
- [ ] لا يوجد fixed checkout bar على الديسكتوب.
- [ ] Mobile checkout bar يظهر فقط على الموبايل.

## Cart Items

- [ ] صورة المنتج تظهر أو fallback.
- [ ] اسم المنتج يظهر.
- [ ] رابط المنتج يعمل.
- [ ] المتغيرات تظهر إن وجدت.
- [ ] السعر الفردي يظهر.
- [ ] الإجمالي يظهر.
- [ ] الكمية قابلة للتعديل.
- [ ] حذف المنتج يعمل.
- [ ] لا يمكن تعيين كمية 0 أو سالبة.
- [ ] لا يمكن تجاوز المخزون إذا معروف.

## Order Summary

- [ ] subtotal صحيح.
- [ ] total صحيح.
- [ ] shipping note يظهر إذا الشحن غير محسوب.
- [ ] coupon يظهر فقط إذا مدعوم.
- [ ] زر checkout واضح.
- [ ] checkout disabled عند السلة الفارغة أو الخطأ.

## Empty/Loading/Error

- [ ] Empty cart احترافي.
- [ ] Loading skeleton.
- [ ] Error state مع retry أو CTA.

## Responsive

- [ ] Mobile لا يوجد overflow.
- [ ] BottomNav لا يغطي checkout bar.
- [ ] Tablet جيد.
- [ ] Desktop بعمودين.

## i18n

- [ ] مفاتيح عربية موجودة.
- [ ] مفاتيح إنجليزية موجودة.
- [ ] لا تظهر مفاتيح خام.

## Build

- [ ] TypeScript بدون أخطاء.
- [ ] Build ناجح.
- [ ] لا توجد أخطاء Console واضحة.

---

# 20. اختبار يدوي

## Desktop

اختبر:

```txt
/cart
```

مع الحالات:

- سلة فارغة.
- منتج واحد.
- عدة منتجات.
- منتج بمتغير.
- منتج بدون صورة.
- منتج غير متوفر.
- تعديل الكمية.
- حذف منتج.
- إتمام الطلب.

تأكد من:

- OrderSummary واضح.
- لا يوجد Bottom fixed button.
- Footer يظهر بشكل طبيعي.

## Mobile

اختبر:

- CartItemCard.
- أزرار الكمية.
- زر الحذف.
- Mobile checkout bar.
- عدم تغطية BottomNav.
- Empty state.

## Edge Cases

- quantity = 1 ثم الضغط على ناقص.
- stock = 1 ثم الضغط على زائد.
- price missing.
- product removed/unavailable.
- API error.
- checkout route missing.

---

# 21. تعليمات صارمة لوكيل التنفيذ

## ممنوع

- ممنوع بناء Checkout كامل إذا غير موجود.
- ممنوع تغيير cart store جذريًا.
- ممنوع كسر add to cart من صفحة المنتج.
- ممنوع كسر عداد السلة في الهيدر.
- ممنوع fixed checkout على الديسكتوب.
- ممنوع عرض coupon وهمي.
- ممنوع حساب shipping وهمي.
- ممنوع السماح بكمية غير صالحة.
- ممنوع تجاهل variants.
- ممنوع تجاهل RTL.
- ممنوع استخدام عملة خاطئة.
- ممنوع إضافة مكتبات ثقيلة.

## مطلوب

- كود منظم.
- مكونات صغيرة.
- Helpers واضحة.
- TypeScript آمن.
- Responsive ممتاز.
- Empty/Loading/Error states.
- i18n.
- الحفاظ على منطق السلة الحالي.
- Build ناجح.
- Notes واضحة.

---

# 22. مخرجات المرحلة المطلوبة

في نهاية المرحلة يجب تسليم:

1. CartPage جديدة أو محسنة.
2. CartLayout.
3. CartItemsList.
4. CartItemRow.
5. CartItemCard.
6. CartQuantityControl.
7. CartItemPrice.
8. CartItemMeta.
9. OrderSummary.
10. CartCouponBox إذا مدعوم.
11. CartShippingEstimate إذا مدعوم.
12. CartEmptyState.
13. CartLoadingState.
14. CartErrorState.
15. CartMobileCheckoutBar.
16. cart.helpers.ts.
17. cart.types.ts.
18. مفاتيح ترجمة عربية وإنجليزية.
19. ملف ملاحظات تنفيذ:

```txt
IMPLEMENTATION_NOTES_PHASE_6.md
```

---

# 23. نموذج IMPLEMENTATION_NOTES_PHASE_6.md

```md
# Implementation Notes — Phase 6

## Completed

- Rebuilt CartPage layout.
- Added desktop cart item rows.
- Added mobile cart item cards.
- Added OrderSummary.
- Added CartQuantityControl.
- Added CartMobileCheckoutBar.
- Added CartEmptyState.
- Added CartLoadingState.
- Added CartErrorState.
- Added cart helpers.
- Added cart translation keys.

## Cart Store Mapping

- Cart items source:
- Item ID field:
- Product ID field:
- Product name field:
- Product image field:
- Variant field:
- Unit price field:
- Quantity field:
- Stock field:
- Currency field:
- Update quantity function:
- Remove item function:
- Clear cart function:

## Checkout

- Checkout route:
- Checkout disabled conditions:

## Coupon Support

- Supported:
- Implementation:
- Notes:

## Shipping Support

- Supported:
- Implementation:
- Notes:

## Decisions

- Mobile checkout bar is mobile-only.
- No fixed checkout button on desktop.
- Coupon box is hidden if coupons are not supported.
- Shipping cost is not faked; shown as calculated at checkout when unavailable.
- Quantity cannot go below 1.
- Quantity cannot exceed known stock.

## Modified Files

- src/features/cart/CartPage.tsx
- src/features/cart/components/CartLayout.tsx
- src/features/cart/components/CartItemsList.tsx
- src/features/cart/components/CartItemRow.tsx
- src/features/cart/components/CartItemCard.tsx
- src/features/cart/components/CartQuantityControl.tsx
- src/features/cart/components/CartItemPrice.tsx
- src/features/cart/components/CartItemMeta.tsx
- src/features/cart/components/OrderSummary.tsx
- src/features/cart/components/CartCouponBox.tsx
- src/features/cart/components/CartShippingEstimate.tsx
- src/features/cart/components/CartEmptyState.tsx
- src/features/cart/components/CartLoadingState.tsx
- src/features/cart/components/CartErrorState.tsx
- src/features/cart/components/CartMobileCheckoutBar.tsx
- src/features/cart/components/cart.helpers.ts
- src/features/cart/components/cart.types.ts
- src/config/routes.tsx
- src/core/i18n/locales/ar/*.json
- src/core/i18n/locales/en/*.json

## Pending for Phase 7

- SEO basics.
- Static policy pages.
- Open Graph.
- Final responsive polish.
- Accessibility pass.
- Performance pass.
- Analytics events.
```

---

# 24. Definition of Done

تعتبر المرحلة السادسة مغلقة عندما تصبح السلة:

> صفحة متجر ويب احترافية بعمودين على الديسكتوب، cards مناسبة للموبايل، ملخص طلب واضح، تعديل كميات آمن، Empty state ممتاز، وزر checkout واضح.

وليست:

> قائمة منتجات بتصميم تطبيق مع زر دفع مثبت أسفل الشاشة في كل الأجهزة.

بعد إغلاق هذه المرحلة ننتقل إلى المرحلة السابعة:

**SEO, Static Pages, Analytics & Launch Polish**

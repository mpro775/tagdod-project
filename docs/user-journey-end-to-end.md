## رحلة المستخدم الشاملة: من فتح التطبيق حتى إتمام الطلب (منتج/خدمة)

يشرح هذا المستند تدفّق تجربة المستخدم بكافة الحالات الواقعية: تصفّح كضيف، البحث والتصفية، التسعير والعروض والكوبونات، السلة، إنشاء/تسجيل الدخول، المزامنة بين الأجهزة، الطلبات للخدمات والمنتجات، والمفضلة.

### 1) مخطط شامل عالي المستوى
```mermaid
flowchart TD
  A[المستخدم يفتح التطبيق] --> B{تسجيل الدخول؟}
  B -- نعم --> B1[حالة مستخدم مصادق]
  B -- لا --> B2[حالة ضيف]

  B1 --> C[التصفح/البحث/الفلاتر]
  B2 --> C

  C --> D{نمط الشراء؟}
  D -- منتج --> P1[عرض قائمة/تفاصيل المنتجات]
  D -- خدمة --> S1[عرض طلبات الخدمات أو إنشاء طلب]

  %% مسار المنتجات
  P1 --> P2[إضافة إلى السلة]
  P2 --> P3{كوبون/عرض؟}
  P3 -- كوبون --> P4[تحقق الكوبون + تطبيقه]
  P3 -- عروض تلقائية --> P5[تسعير نهائي حسب Promotions/Pricing]
  P4 --> P5
  P5 --> CHK[الانتقال للدفع]

  %% مسار الخدمات
  S1 --> S2{دخول مهندس أم عميل؟}
  S2 -- عميل --> S3[إنشاء طلب خدمة + الموقع]
  S3 --> S4[استلام عروض مهندسين]
  S4 --> S5[قبول عرض]
  S5 --> S6[بدء/إنهاء الخدمة]
  S6 --> S7[التقييم]
  S2 -- مهندس --> S8[استعراض طلبات قريبة + تقديم عروض]

  %% نقاط مشتركة
  CHK --> AU{مصادقة مطلوبة؟}
  AU -- غير مسجّل --> AU1[إنشاء حساب/تسجيل الدخول]
  AU -- مسجّل --> PAY[الدفع]
  AU1 --> SYNC[مزامنة السلة/المفضلة والبيانات]
  SYNC --> PAY
  PAY --> DONE[نجاح الطلب]
  DONE --> FAV[إدارة المفضلة + مراجعة الطلبات]
```

### 2) تسلسل تفصيلي لمسار المنتجات
```mermaid
sequenceDiagram
  participant U as User (Guest/Logged)
  participant FE as Frontend
  participant SR as Search API
  participant CT as Catalog/Pricing
  participant PR as Promotions/Coupons
  participant CART as Cart
  participant AUTH as Auth
  participant ORD as Orders/Checkout

  U->>FE: يكتب في مربع البحث / يفتح فئة
  FE->>SR: GET /search/products?q=&filters...
  SR-->>FE: نتائج + Facets
  U->>FE: يفتح منتج
  FE->>CT: GET /catalog/products/:id?currency=YER
  CT-->>FE: product + variants + prices

  U->>FE: يختار متغير ويضغط "أضف إلى السلة"
  FE->>CART: addItem(variantId, qty)
  CART-->>FE: cart state

  par عروض/كوبونات
    FE->>PR: GET /pricing/variant?variantId&currency&qty&accountType
    PR-->>FE: finalPrice + appliedPromotion + badge
    U->>FE: يدخل كوبون
    FE->>PR: GET /pricing/coupon/:code (validate)
    PR-->>FE: valid/invalid + message
  end

  U->>FE: الانتقال للدفع
  FE->>AUTH: هل المستخدم مصادق؟
  alt ضيف
    FE->>AUTH: إظهار واجهة إنشاء حساب/تسجيل الدخول
    AUTH-->>FE: success + tokens
    FE->>CART: sync guest cart → user cart
  else مصادق
    FE->>CART: load user cart
  end

  FE->>ORD: إنشاء طلب + دفع (مع الأسعار النهائية والعروض/الكوبونات)
  ORD-->>FE: نجاح الطلب + رقم الطلب
```

### 3) تسلسل تفصيلي لمسار الخدمات (عميل/مهندس)
```mermaid
sequenceDiagram
  participant C as Customer
  participant E as Engineer
  participant SVC as Services API
  participant GEO as Geo/Addresses
  participant AUTH as Auth

  C->>AUTH: تسجيل الدخول (إن لزم)
  C->>SVC: POST /services/requests { addressId, title, type, images? }
  SVC->>GEO: تحويل address → GeoJSON
  SVC-->>C: requestId + status=OPEN

  E->>AUTH: تسجيل الدخول كمهندس
  E->>SVC: GET /services/requests/nearby?lat&lng&radiusKm
  SVC-->>E: طلبات قريبة
  E->>SVC: POST /services/offers { requestId, amount, note, lat, lng }
  SVC-->>E: offerId + distanceKm

  C->>SVC: GET /services/requests/:id/offers
  SVC-->>C: عروض مرتبة (الأقرب ثم الأرخص)
  C->>SVC: POST /services/requests/:id/accept-offer { offerId }
  SVC-->>C: status=ASSIGNED
  E->>SVC: POST /services/requests/:id/start → IN_PROGRESS
  E->>SVC: POST /services/requests/:id/complete → COMPLETED
  C->>SVC: POST /services/requests/:id/rate
```

### 4) أين تظهر العروض والكوبونات؟
- عند عرض السعر في صفحة المنتج/السلة: يستدعي الواجهة `GET /pricing/variant...` لتطبيق قواعد العروض (Promotions) تلقائيًا واختيار أفضل توفير.
- عند إدخال الكوبون: `GET /pricing/coupon/:code` للتحقق قبل تأكيد الطلب. إن كان صالحًا، يُطبق في التسعير النهائي.
- البنرات: تعرض الحملات بصريًا ويمكن ربطها بقاعدة سعر أو كوبون؛ لكنها لا تستبدل منطق التسعير.

### 5) متى نطلب من المستخدم إنشاء حساب/تسجيل الدخول؟
- كضيف: يُسمح بالتصفح، البحث، الإضافة للسلة، وإدارة مفضلة محلية.
- عند الانتقال للدفع: يُطلب المصادقة (إنشاء/تسجيل الدخول) لضمان العناوين، طرق الدفع، والسجل.
- مزامنة بعد المصادقة: تُدمج سلة الضيف والمفضلة المحلية ضمن حساب المستخدم.

### 6) المزامنة بين الأجهزة
- عند المصادقة: تُرفع سلة/مفضلة الجهاز الحالي وتُدمج مع السحابة (سلة ومفضلة الحساب).
- على الأجهزة الأخرى: عند تسجيل الدخول، يستدعي العميل API لاسترجاع سلة/مفضلة المستخدم.
- تعارضات: سياسة الدمج تفضّل الجمع مع إزالة التكرارات وتجميع الكميات.

### 7) تجربة المفضّلة (Favorites)
- للضيف: حفظ محلي (localStorage/IndexedDB) بعناصر المنتج/الخدمة المفضلة.
- للمستخدم المصادق: حفظ في قاعدة البيانات وربط بـ userId.
- عند المصادقة: دمج المفضلة المحلية في مفضلة الحساب (مع إزالة التكرار)، وتحديث عدادات الاستخدام إن لزم.

### 8) حالات إضافية واقعية
- تغيّر السعر أثناء التصفح: إعادة طلب تسعير قبيل الدفع لضمان السعر النهائي.
- كوبون غير صالح/انتهى: عرض رسالة واضحة وتفاصيل السبب.
- نفاذ مخزون متغير: منع الإضافة للسلة أو اقتراح متغير بديل.
- فشل الدفع: إبقاء السلة كما هي وعرض خيارات دفع بديلة.
- إلغاء خدمة قبل قبول عرض: يسمح الإلغاء، وتُرفض العروض المفتوحة تلقائيًا.

### 9) نقاط تكامل مع الموديولات
- Search: للاكتشاف وواجهات الاقتراحات.
- Catalog: لجلب تفاصيل المنتج/المتغير والسعر الأساس.
- Pricing/Promotions/Coupons: لحساب السعر النهائي والتحقق من الكوبونات.
- Banners: لإبراز الحملات وتسويقها.
- Upload/Media: لعرض صور المنتجات والبنرات.
- Services: لمسار الطلبات الميدانية للمهندسين.
- Auth: للمصادقة وتوليد الرموز ومزامنة السلة/المفضلة.

### 10) قائمة تحقق UX مختصرة
- وضوح حالة المستخدم (ضيف/مسجّل) وأثرها على المزايا.
- عرض شارات العروض `badge` بجانب الأسعار المتأثرة.
- واجهة إدخال كوبون بسيطة مع رسائل خطأ دقيقة.
- حفظ مؤقت للسلة/المفضلة للضيف مع دمج ذكي عند تسجيل الدخول.
- إعادة تسعير قبل الدفع النهائي لتجنّب المفاجآت.



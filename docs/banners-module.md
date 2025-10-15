## موديول البنرات (Banners Module)

### ما الهدف؟
- **الغرض**: إدارة وعرض البنرات التسويقية (صور/فيديو/Carousel) في مواقع مختلفة، مع تتبع المشاهدات والنقرات وقياس الأداء.
- **نطاق**: تقديم واجهات عامة لعرض البنرات وواجهات إدارية لإنشائها/تحديثها/حذفها/تفعيلها.
- **المكان**: `backend/src/modules/banners/`.

### المكونات
- **BannersModule**: تهيئة مخطط `Banner` وتوفير الخدمة والتحكمات.
- **BannersService**: CRUD للبنرات، فلترة بالتاريخ والموقع، تتبع views/clicks، ربط اختياري بالعروض.
- **BannersPublicController**: واجهات عامة لعرض البنرات وتتبع الإحصائيات.
- **BannersAdminController**: واجهات إدارية لإدارة البنرات مع صلاحيات.

### أنواع البنرات ومواقع العرض
- الأنواع: `image`, `video`, `carousel`.
- المواقع: `home_top`, `home_middle`, `home_bottom`, `category_top`, `product_sidebar`, `custom`.

### نقاط الدخول (Endpoints)
- عام (بدون حماية):
  - `GET /banners?location=...` إرجاع البنرات النشطة حسب الموقع.
  - `GET /banners/:id` جلب بنر.
  - `POST /banners/:id/view` زيادة عدّاد المشاهدات.
  - `POST /banners/:id/click` زيادة عدّاد النقرات.
  - `GET /banners/:id/promotion` جلب البنر مع تفاصيل العرض المرتبط (إن وُجد).

- إداري (Protected):
  - `POST /admin/banners` إنشاء بنر.
  - `GET /admin/banners` قائمة مع بحث/ترتيب/ترقيم صفحات.
  - `GET /admin/banners/:id` جلب بنر.
  - `PATCH /admin/banners/:id` تحديث بنر.
  - `DELETE /admin/banners/:id` حذف بنر.
  - `PATCH /admin/banners/:id/toggle-status` تبديل حالة التفعيل.

### منطق الخدمة باختصار
- فلترة نشطة حسب التاريخ الحالي: يعرض البنرات ضمن مدى `startDate`/`endDate` أو بدون قيود.
- ترتيب افتراضي: `sortOrder` ثم `createdAt`.
- تتبع الأداء: `viewCount`, `clickCount`, وحقول إضافية مثل `conversionCount`, `revenue` عند التتبع.
- ربط بالعروض (اختياري):
  - عبر `linkedPriceRuleId` (قاعدة سعرية من Promotions)
  - أو `linkedCouponCode` (كوبون)

### أمثلة الاستخدام
- عرض بنرات أعلى الصفحة الرئيسية: `GET /banners?location=home_top`
- تتبع مشاهدة: `POST /banners/{id}/view`
- تتبع نقرة: `POST /banners/{id}/click`
- جلب بنر مع العرض المرتبط: `GET /banners/{id}/promotion`

### التكامل مع Promotions
- يمكن للبنر إبراز حملة تسعير محددة بربطه بقاعدة سعر (`PriceRule`) أو كوبون.
- يبقى التسعير الفعلي عند الشراء من اختصاص موديولات التسعير/العروض.

### أفضل الممارسات
- تحسين الصور واستخدام CDN وLazy Loading.
- الحد من عدد البنرات في الصفحة.
- تحليل CTR وإزالة البنرات ذات الأداء الضعيف.



# قائمة التدفقات المطلوبة (Flowcharts Checklist)

> الهدف: تحديد أهم التدفقات التي يجب توثيقها بمخططات تدفق (Flowchart) و/أو تسلسل (Sequence) و/أو نشاط (Activity) و/أو حالات (State).

## 1) إدارة المستخدمين والحساب
- [x] تسجيل مستخدم جديد (Phone Signup + Verification) — انظر: `docs/requirements/flows/auth/signup-login.mmd`
- [x] تسجيل الدخول (Login) وإدارة الجلسة (Session) — انظر: `docs/requirements/flows/auth/signup-login.mmd`
- [ ] استرجاع/تغيير كلمة المرور
- [x] إدارة الأدوار والصلاحيات (RBAC) وتحقق الحماية على الـ APIs — انظر: `docs/requirements/flows/rbac/role-permissions.mmd`
- [ ] تحديث الملف الشخصي وحذف/تعطيل الحساب

## 2) إدارة العناوين
- [x] إضافة/تعديل/حذف عنوان — انظر: `docs/requirements/flows/addresses/address-management.mmd`
- [x] اختيار العنوان الافتراضي — انظر: `docs/requirements/flows/addresses/address-management.mmd`
- [x] التحقق من العنوان والإحداثيات (Geo) — انظر: `docs/requirements/flows/addresses/address-management.mmd`

## 3) الكتالوج والبحث
- [x] تصفح التصنيفات الشجرية (Category Tree Navigation) — انظر: `docs/requirements/flows/catalog/search-browse.mmd`
- [x] تفاصيل المنتج (Product Details) مع تنويعات — انظر: `docs/requirements/flows/catalog/search-browse.mmd`
- [x] البحث النصي والفلترة بالسمات (Full-text + Faceted Filters) — انظر: `docs/requirements/flows/catalog/search-browse.mmd`
- [ ] عرض السعر حسب الحساب/العروض

## 4) إدارة المنتجات والسمات (لوحة التحكم)
- [x] إضافة/تعديل/أرشفة منتج — انظر: `docs/requirements/flows/products/product-management.mmd`
- [ ] إدارة التنويعات (SKU/Stock/Price)
- [ ] إدارة السمات والقيم والمجموعات
- [ ] ربط الصور والوسائط

## 5) السلة (Cart)
- [x] إضافة عنصر للسلة (مسجل/زائر) — انظر: `docs/requirements/flows/cart/add-sync.mmd`
- [x] مزامنة سلة الزائر عند تسجيل الدخول — انظر: `docs/requirements/flows/cart/add-sync.mmd`
- [ ] تطبيق كوبون/خصم تلقائي وحساب المجموع
- [x] انتهاء صلاحية السلة وتتبع الهجر (Abandoned Cart) — انظر: `docs/requirements/flows/cart/abandoned-cart.mmd`

## 6) الطلب (Order)
- [x] Checkout خطوة بخطوة (عنوان > شحن > دفع > تأكيد) — انظر: `docs/requirements/flows/checkout/checkout-flow.mmd`
- [ ] توليد رقم الطلب وحفظ Snapshot العناصر
- [x] تغيير حالة الطلب (FSM) وتسلسل التحديثات — انظر: `docs/requirements/flows/order/status-fsm.mmd`
- [ ] تتبع الشحن وتحديث بيانات التتبع
- [ ] الإرجاع والاسترداد (RMA)

## 7) الدفع
- [ ] إنشاء نية دفع (Payment Intent) والتوجيه لموفر الدفع
- [x] Webhook الدفع (نجاح/فشل/استرداد) — انظر: `docs/requirements/flows/payment/webhook.mmd`
- [ ] المصادقة وإغلاق الطلب بعد الدفع

## 8) المخزون
- [x] خصم/إرجاع المخزون عند الحجز/الطلب/الإرجاع — انظر: `docs/requirements/flows/inventory/adjustments.mmd`
- [ ] عتبة تنبيه انخفاض المخزون
- [ ] ترحيل المخزون عبر سجل الحركات

## 9) المفضلات
- [x] إضافة/إزالة من المفضلة (مستخدم/جهاز) — انظر: `docs/requirements/flows/favorites/favorites-sync.mmd`
- [x] مزامنة المفضلات عند الانتقال من زائر إلى مستخدم — انظر: `docs/requirements/flows/favorites/favorites-sync.mmd`

## 10) الوسائط (Media)
- [x] رفع صورة/ملف والتحقق من النوع والحجم — انظر: `docs/requirements/flows/media/media-upload.mmd`
- [x] ربط الوسائط بالكيانات (منتج/تنويعة/تصنيف) — انظر: `docs/requirements/flows/media/media-upload.mmd`
- [x] تنظيف الملفات غير المستخدمة — انظر: `docs/requirements/flows/media/media-upload.mmd`

## 11) الدعم الفني والإشعارات
- [x] إنشاء تذكرة دعم وتصنيفها وتدفق الرسائل — انظر: `docs/requirements/flows/support/ticket-flow.mmd`
- [ ] الردود الجاهزة (Canned Responses)
- [x] إشعارات النظام (Email/SMS/Push) لمسارات رئيسية (طلب، دفع، شحن) — انظر: `docs/requirements/flows/notifications/notification-system.mmd`

## 12) التقارير والتحليلات
- [x] توليد التقارير المجدولة وإرسالها — انظر: `docs/requirements/flows/reports/report-generation.mmd`
- [ ] لقطات المؤشرات (Snapshots) وتخزينها

## 14) الكوبونات والعروض
- [x] تطبيق الكوبونات والتحقق من صحتها — انظر: `docs/requirements/flows/coupons/coupon-application.mmd`
- [ ] العروض التلقائية حسب سلوك المستخدم
- [ ] إدارة كوبونات المجموعات

## 13) الحوكمة والأمن
- [ ] تدقيق الوصول (Audit) على العمليات الحساسة
- [ ] النسخ الاحتياطي والاستعادة
- [ ] إدارة المفاتيح والأسرار

---

ملاحظات:
- عند اختيار أولوية الرسم، ابدأ بتدفقات: Checkout، الدفع، حالات الطلب، مزامنة السلة، إدارة المخزون.
- لكل تدفق: أنشئ ملف Mermaid تحت `docs/requirements/flows/<domain>/<flow>.mmd` مع وصف موجز في `README.md`.

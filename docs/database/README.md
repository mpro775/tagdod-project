### مخطط قاعدة البيانات (ERD)

- ملف المخطط: `docs/database/ERD.mmd` (Mermaid). لعرضه استخدم أي عارض Mermaid أو الموقع: `https://mermaid.live`.
- هذا المخطط يعكس نموذج البيانات في الـ Backend (NestJS + Mongoose/MongoDB).

### الكيانات الأساسية والعلاقات

- **User**: يمثل المستخدم. له علاقات مع:
  - `Address` (عناوين المستخدم)
  - `Cart` (السلة الحالية/السابقة)
  - `Order` (الطلبات)
  - `Favorite` (المفضلات)
  - `Media` (الصور/الملفات التي رفعها)
  - `SupportTicket` (تذاكر الدعم الفني)
  - `ServiceRequest` (طلبات الخدمات)

- **Address**: عنوان تابع لـ `User` ويستخدم أثناء إنشاء الطلب.

- **Media**: ملفات وصور مرفوعة، يمكن ربطها بكيانات أخرى مثل `Product`, `Variant`, `Category`.

- **Category**: تصنيف هرمي (أب-ابن) للفئات. كل `Product` ينتمي لفئة واحدة.

- **Brand**: علامة تجارية اختيارية يمكن ربطها بالمنتجات.

- **Attribute / AttributeValue**: سمات المنتج وقيمها (مثل اللون/الحجم). يتم استعمالها ضمن تكوين الـ `Variant`.

- **AttributeGroup**: مجموعات السمات لتنظيمها بشكل أفضل.

- **Product**: المنتج الأساسي، يحتوي بيانات عامة ومتعددة اللغات، ويرتبط بـ `Category` ويدعَم صورًا وسِمات.

- **Variant**: تنويعة المنتج (تركيبة قيم السمات) مع سعر ومخزون وصورة اختيارية.

- **Cart / CartItem**: سلة المستخدم تضم عناصر `Variant` (مع لقطات سعرية ومعلومات منتج مخزنة للسُرعة).

- **Order / OrderItem**: الطلب النهائي المنبثق من السلة، يتضمن العناصر، التسعير التفصيلي، والتتبع.

- **Favorite**: يربط المستخدم أو الجهاز مع منتج/تنويعة محفوظة كمفضلة.

- **SupportTicket / SupportMessage**: نظام تذاكر الدعم الفني مع الرسائل.

- **ServiceRequest / EngineerOffer**: نظام طلبات الخدمات وعروض المهندسين.

- **Notification**: نظام الإشعارات للمستخدمين.

- **AnalyticsSnapshot**: لقطات تحليلية للبيانات والإحصائيات.

### أهم العلاقات

- `User` 1..* `Address`
- `User` 1..* `Cart`، و`Cart` 1..* `CartItem`
- `User` 1..* `Order`، و`Order` 1..* `OrderItem`
- `User` 1..* `SupportTicket`
- `User` 1..* `ServiceRequest`
- `User` 1..* `Notification`
- `Category` 1..* `Product`
- `Category` 1..* `Category` (علاقة أب-ابن)
- `Product` 1..* `Variant`
- `AttributeGroup` 1..* `Attribute`
- `Attribute` 1..* `AttributeValue`
- `Variant` m..n `AttributeValue` (عبر مصفوفة `attributeValues`)
- `SupportTicket` 1..* `SupportMessage`
- `ServiceRequest` 1..* `EngineerOffer`
- `Media` يمكن أن تُستخدم في `Product`, `Variant`, `Category`

### كيفية التحديث

- عند تعديل أي `schema` في الـ Backend (ملفات `*.schema.ts`)، قم بتحديث:
  - ملف `ERD.mmd` إذا أضيفت/حُذفت كيانات أو علاقات أو حقول مهمة.
  - هذا الملف إذا تغيرت أوصاف الجداول/العلاقات.

### ملاحظات تقنية

- قاعدة البيانات المستخدمة: MongoDB عبر Mongoose.
- معظم الكيانات تحتوي `timestamps` (حقول `createdAt`, `updatedAt`).
- تم استخدام فهارس متقدمة للأداء والبحث (انظر `indexes.md`):
  - **Unique**: فهارس فريدة للحقول المهمة
  - **Sparse**: فهارس نادرة للحقول الاختيارية
  - **Partial**: فهارس جزئية للشروط المعقدة
  - **TTL**: فهارس انتهاء الصلاحية للتنظيف التلقائي
  - **Text**: فهارس البحث النصي
  - **2dsphere**: فهارس جغرافية
- بعض الحقول تحتوي مراجع `ObjectId` لـ `ref` لتسهيل `populate`.
- دعم Soft Delete في معظم الكيانات عبر حقل `deletedAt`.
- نظام أدوار وصلاحيات متقدم للمستخدمين.
- دعم ثنائي اللغة (عربي/إنجليزي) في الكيانات المناسبة.

### سكربتات الترحيل والبذور

تم إضافة سكربتات لإدارة قاعدة البيانات:

#### **الترحيل (Migrations)**
```bash
# تشغيل جميع الترحيلات
npm run db:migrate migrate

# عرض الفهارس الحالية
npm run db:migrate list

# التراجع عن ترحيل معين
npm run db:migrate rollback create_initial_indexes
```

#### **البذور (Seeding)**
```bash
# زرع البيانات التجريبية
npm run db:seed seed

# مسح جميع البيانات
npm run db:seed clear

# عرض إحصائيات البيانات
npm run db:seed list

# مسح وزرع البيانات
npm run db:seed seed --clear
```

#### **الميزات المتاحة:**
- إنشاء فهارس متقدمة (unique, sparse, partial, TTL)
- بيانات تجريبية شاملة لجميع الكيانات
- دعم ثنائي اللغة في البيانات التجريبية
- نظام تراجع للترحيلات
- إحصائيات مفصلة للبيانات

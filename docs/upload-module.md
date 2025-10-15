## موديول الرفع والوسائط (Upload & Media Module)

### ما الهدف؟
- **الغرض**: رفع الملفات (صورة/مستند) إلى Bunny.net، توليد رابط CDN عام، إدارة مكتبة وسائط داخلية مع بيانات ووسوم وتتبع استخدام.
- **المكان**: `backend/src/modules/upload/`.

### المكونات
- **UploadModule**: يهيئ Multer وحدود الحجم، مخططات `Media` و`User`، ويدمج `AuthModule`.
- **UploadController**: واجهات رفع/حذف/معلومات الملفات العامة المحمية بـ JWT تحت `upload/`.
- **UploadService**: التكامل مع Bunny.net (رفع/حذف/معلومات)، فحص الحجم والأنواع المسموحة، توليد اسم فريد.
- **MediaController**: واجهات إدارية لمكتبة الوسائط تحت `admin/media` (رفع لمستودع، قائمة، تفاصيل، تحديث، حذف/استعادة، إحصائيات).
- **MediaService**: منطق مكتبة الوسائط: كشف التكرار بالـ hash، استخراج أبعاد الصورة، تخزين البيانات، pagination، إحصائيات، تتبع usage.

### الإعداد (Environment)
أضِف متغيرات البيئة:
```env
BUNNY_STORAGE_ZONE=your-storage-zone-name
BUNNY_API_KEY=your-bunny-api-key
BUNNY_HOSTNAME=storage.bunnycdn.com
BUNNY_CDN_HOSTNAME=your-cdn-hostname.b-cdn.net
```

### أهم الـ Endpoints
- رفع ملف واحد (JWT):
  - `POST /upload/file` (multipart: `file`, اختياريًا `folder`, `filename`)
- رفع عدة ملفات (JWT):
  - `POST /upload/files` (multipart: `files[]`, اختياريًا `folder`)
- حذف ملف (JWT):
  - `DELETE /upload/file` body: `{ "filePath": "uploads/.." }`
- معلومات ملف (JWT):
  - `GET /upload/file/<path>`

- مكتبة الوسائط (Admin: JWT + Roles):
  - `POST /admin/media/upload` رفع إلى المستودع مع بيانات وصفية (`name`, `category`, `tags`, `isPublic`...)
  - `GET /admin/media` قائمة مع بحث/ترقيم/فرز
  - `GET /admin/media/:id` تفاصيل
  - `PATCH /admin/media/:id` تحديث بيانات
  - `DELETE /admin/media/:id` حذف منطقي (Soft)
  - `POST /admin/media/:id/restore` استعادة
  - `DELETE /admin/media/:id/permanent` حذف نهائي (Super Admin)
  - `GET /admin/media/stats/summary` إحصائيات عامة

### آلية العمل باختصار
1) العميل يرسل ملفًا عبر `UploadController` → يتم فحص الحجم والنوع (10MB وأصناف محددة).
2) `UploadService` يرفع الملف إلى Bunny.net باستخدام `PUT` مع AccessKey، ويولّد اسمًا فريدًا.
3) إذا كان رفع لمكتبة الوسائط، `MediaService` يحسب hash لمنع التكرار، يستخرج أبعاد الصورة (sharp)، ويسجّل المستند في `Media`.
4) عند الحذف النهائي، يتم محاولة حذف الملف من Bunny.net ومن ثم حذف سجل قاعدة البيانات.

### أمثلة سريعة
- رفع ملف واحد:
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@./image.jpg" \
  -F "folder=products" \
  https://api.example.com/upload/file
```

- رفع إلى مكتبة الوسائط (Admin):
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@./banner.jpg" \
  -F "name=Homepage Banner" \
  -F "category=banners" \
  -F "isPublic=true" \
  https://api.example.com/admin/media/upload
```

### قيود الملفات
- أقصى حجم: 10MB.
- الأنواع المسموحة: صور `jpeg/png/gif/webp`، مستندات `pdf/doc/docx`.

### ملاحظات
- يُفضّل تقديم الملفات عبر CDN في الإنتاج.
- كشف التكرار يقلّل تكلفة التخزين والنسخ المكرّرة.
- استخدم `usageCount` و`usedIn` لتتبّع ارتباط الوسائط بالعناصر (منتجات/بنرات...).



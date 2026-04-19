# الدليل الإرشادي للتعامل مع Tejo

هذا الدليل يشرح تشغيل Tejo وإدارته داخل المشروع بشكل عملي: إعداد المزود، ربط مفاتيح API، إدارة المعرفة، بناء الـ embeddings، والتحقق قبل الإطلاق.

## 1) نظرة سريعة

Tejo في هذا المشروع يعمل داخل نظام الدعم الحالي، وليس نظامًا منفصلًا:

- محادثة Tejo تحفظ في `SupportTicket`.
- رسائل Tejo تحفظ في `SupportMessage`.
- المعرفة تأتي من مصدرين:
- منتجات المتجر (Products).
- قاعدة المعرفة العامة (KB: FAQ، الدوام، الفروع، السياسات).
- الـ embeddings تحفظ في Mongo داخل:
- `tejo_product_embeddings`
- `tejo_kb_embeddings`

## 2) المتطلبات قبل التشغيل

1. تشغيل `MongoDB`.
2. تشغيل `Redis` (مطلوب لطابور reindex).
3. تشغيل الـ backend.
4. تشغيل لوحة الإدارة `admin-dashboard`.
5. حساب أدمن بصلاحيات:
6. `admin.access`
7. `tejo.read`
8. `tejo.manage`
9. `tejo.analytics`

ملاحظة: `super_admin` يجب أن يرى صفحات Tejo من السايدبار تحت `Support`.

## 3) أين أضيف مزود AI ومفاتيحه؟

### على مستوى البيئة (ENV)

ضع القيم في:

- `backend/.env`

المتغيرات الأساسية:

```env
TEJO_ENABLED=true
TEJO_WEB_PILOT_ENABLED=false
TEJO_PROVIDER_ORDER=gemini,provider-a,provider-b
TEJO_HANDOFF_THRESHOLD=0.55

TEJO_GEMINI_API_KEY=YOUR_KEY
TEJO_GEMINI_CHAT_MODEL=gemini-2.0-flash
TEJO_GEMINI_EMBEDDING_MODEL=gemini-embedding-001
TEJO_GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

### على مستوى لوحة الإدارة

يمكن تعديلها من:

- `Support > Tejo Settings`
- API: `PATCH /admin/tejo/settings`

القيم تحفظ في system settings بالمفاتيح:

- `tejo.gemini_api_key`
- `tejo.gemini_chat_model`
- `tejo.gemini_embedding_model`
- `tejo.gemini_base_url`
- `tejo.provider_order`
- `tejo.enabled`
- `tejo.web_pilot_enabled`
- `tejo.handoff_threshold`

## 4) هل المشروع يقبل فقط Gemini؟

حاليًا المزود الحقيقي المربوط للإنتاج هو `gemini`.

يوجد Adapter routing متعدد المزودات، لكن:

- `provider-a` و`provider-b` موجودان كـ fallback adapters داخلية (placeholder).
- الإنتاج الفعلي يجب أن يعتمد على Gemini.

## 5) ما هو نموذج Embedding المستخدم؟

القيمة الافتراضية الحالية:

- `TEJO_GEMINI_EMBEDDING_MODEL=gemini-embedding-001`

يمكن تغييره من:

- ENV.
- Tejo Settings في لوحة الإدارة.

## 6) هل يوجد Reranking؟

نعم، يوجد Hybrid retrieval + reranking في الخدمة:

- Lexical search من محرك المنتجات.
- Vector similarity من embeddings.
- Business score (مثل rating/featured).

معادلة الدمج الحالية:

- `final = lexical*0.55 + vector*0.30 + business*0.15`

## 7) كيف أحول المنتجات إلى Vector؟

من لوحة الإدارة:

1. افتح `Support > Tejo Settings`.
2. تأكد أن `Gemini API Key` و`Gemini Embedding Model` مضبوطان.
3. شغّل إعادة الفهرسة عبر `Reindex`.

أو عبر API:

```http
POST /admin/tejo/reindex
Content-Type: application/json

{
  "scope": "products",
  "full": true,
  "reason": "initial_product_embeddings"
}
```

القيم الممكنة لـ `scope`:

- `products`
- `kb`
- `all`

## 8) كيف أضيف المعرفة (FAQ/الدوام/الفروع)؟

من واجهة الإدارة:

- `Support > Tejo Knowledge`

الحقول الأساسية لكل عنصر:

- `key` مفتاح فريد.
- `text` النص المعرفي.
- `locale` مثل `ar` أو `en` أو `ar,en`.
- `metadata` اختياري.

أو عبر API:

```http
POST /admin/tejo/knowledge
Content-Type: application/json

{
  "key": "faq_working_hours",
  "text": "ساعات الدوام من السبت إلى الخميس من 9 صباحاً حتى 5 مساءً.",
  "locale": "ar",
  "metadata": {
    "source": "ops"
  }
}
```

## 9) اختبار Tejo بسرعة

### اختبار الاستعلام الرئيسي

```http
POST /tejo/query
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "message": "أريد أفضل بطارية مناسبة لمنزل صغير",
  "channel": "web",
  "locale": "ar"
}
```

الاستجابة تحتوي عادة على:

- `reply`
- `cards`
- `suggestions`
- `actions`
- `confidence`
- `handoffSuggested`
- `ticketId`
- `messageId`
- `latencyMs`

### ملاحظة مهمة

إذا كان `channel=web` و`TEJO_WEB_PILOT_ENABLED=false` ستظهر رسالة رفض (pilot مغلق).

## 10) الصفحات الإدارية المهمة

- `GET /admin/tejo/prompts`
- `POST /admin/tejo/prompts`
- `PATCH /admin/tejo/prompts/:id`
- `GET /admin/tejo/knowledge`
- `POST /admin/tejo/knowledge`
- `PATCH /admin/tejo/knowledge/:key`
- `POST /admin/tejo/knowledge/:key/delete`
- `POST /admin/tejo/reindex`
- `GET /admin/tejo/analytics/overview`
- `GET /admin/tejo/analytics/quality`
- `GET /admin/tejo/analytics/volume`
- `GET /admin/tejo/conversations`
- `GET /admin/tejo/conversations/:id`
- `GET /admin/tejo/settings`
- `PATCH /admin/tejo/settings`

## 11) التحقق قبل الرفع النهائي (Mongo + تشغيل)

1. تأكد أن `MONGO_URI` صحيح.
2. تأكد أن `REDIS_URL` يعمل لأن reindex يعتمد على queue.
3. تأكد وجود مفاتيح Gemini وإعداد النماذج.
4. نفذ reindex كامل:
5. `scope=all`
6. `full=true`
7. تحقق من Mongo:
8. `tejo_product_embeddings` فيها بيانات.
9. `tejo_kb_embeddings` فيها بيانات.
10. اختبر `POST /tejo/query` على حالات:
11. سؤال منتج.
12. سؤال معرفة عامة.
13. طلب تحويل لموظف بشري.
14. تأكد أن صفحات Tejo تظهر في السايدبار لحسابات الإدارة المطلوبة.

## 12) مشاكل شائعة وحلها

### 1) Tejo غير ظاهر في السايدبار

- تحقق من الصلاحيات (`tejo.read/manage/analytics` + `admin.access`).
- أعد تسجيل الدخول.
- نفذ hard refresh.

### 2) خطأ Gemini API key is missing

- أضف `TEJO_GEMINI_API_KEY` في `.env` أو من صفحة Tejo Settings.
- أعد تشغيل backend.

### 3) لا توجد نتائج منتجات جيدة

- تأكد من reindex للمنتجات.
- تأكد أن `tejo_product_embeddings` ليست فارغة.

### 4) إجابات FAQ ضعيفة

- حسّن نصوص KB.
- أعد reindex لـ `scope=kb`.

### 5) لا يعمل Web channel

- فعّل `TEJO_WEB_PILOT_ENABLED=true` أو من إعدادات Tejo.

## 13) مراجع داخل المشروع

- Backend module: `backend/src/modules/tejo`
- Admin pages: `admin-dashboard/src/features/tejo/pages`
- Admin API client: `admin-dashboard/src/features/tejo/api/tejoApi.ts`
- Env template: `backend/.env.example`


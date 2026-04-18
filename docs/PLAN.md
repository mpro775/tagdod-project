# خطة تنفيذ Tejo (Decision-Complete)

## الملخص
- الهدف: إطلاق مساعد Tejo داخل نظام الدعم الحالي بدون كسر المسارات الحالية، مع تصعيد سلس للموظف البشري، وبنية قابلة للتوسّع لمزوّدات LLM متعددة.
- استراتيجية الإطلاق المعتمدة: `Admin أولاً` ثم `Web Pilot`.
- القرارات المحسومة:
  - مزوّد ذكاء اصطناعي عبر طبقة `Adapter` متعددة المزوّدات من اليوم الأول.
  - إضافة `channel` صريح في التذاكر.
  - تخزين embeddings داخل Mongo collections (بدون vector DB خارجي في v1).
- تعريف النجاح (MVP): ردود Tejo تعمل على تذاكر الدعم الحالية، handoff يعمل بنفس ticket، لوحات admin تعمل، ومؤشرات جودة/أداء أساسية متاحة.

## التغييرات الأساسية في الواجهات والعقود (APIs / Interfaces / Types)
- **Public API (Tejo Query)**
  - `POST /tejo/query`
  - الطلب: `ticketId?`, `message`, `channel`, `locale?`, `context?`
  - الاستجابة: `reply`, `cards[]`, `suggestions[]`, `actions[]`, `confidence`, `handoffSuggested`, `ticketId`, `messageId`, `latencyMs`
- **Support APIs (Backwards-Compatible)**
  - الحفاظ على endpoints الحالية كما هي.
  - توسيع نماذج الرسائل لإضافة حمولة AI (`payload`) وبيانات تفسير (`metadata.intent`, `metadata.entities`, `metadata.model`, `metadata.confidence`) بدون كسر consumers الحاليين.
- **Admin APIs**
  - `GET/POST/PUT /admin/tejo/prompts` لإدارة الإصدارات وتفعيل Prompt.
  - `POST /admin/tejo/reindex` لإعادة بناء embeddings.
  - `GET /admin/tejo/analytics/*` لمؤشرات الجودة/الحجم/التحويل إلى handoff.
  - `GET /admin/tejo/conversations` + `GET /admin/tejo/conversations/:id` لمراجعة المحادثات.
- **WebSocket Contract**
  - الاستمرار بإرسال `message:new` للتوافق.
  - إضافة event alias جديد `ticket-message` تدريجياً.
- **Type/System Changes**
  - `SupportTicket`: إضافة `channel`, `isAiHandled`, `aiStatus`, `handoffReason?`.
  - `SupportMessage`: إضافة أنواع رسائل AI (`ai_reply`, `ai_action`, `ai_handoff`) مع `payload` موحّد.

## خطة التنفيذ المرحلية
1. **Phase 0: Foundation & Guardrails (3-4 أيام)**
- إنشاء `TejoModule` وطبقة `LLM Adapter` بواجهات ثابتة: `chat()`, `embed()`, `healthCheck()`.
- ربط الإعدادات عبر env + system settings مع feature flags: `TEJO_ENABLED`, `TEJO_WEB_PILOT_ENABLED`, `TEJO_PROVIDER_ORDER`.
- إعداد logging correlation (ticketId, messageId, traceId) في كل pipeline.

2. **Phase 1: Core Conversation داخل نظام الدعم (5-7 أيام)**
- بناء orchestrator يلتقط رسالة العميل، يستخرج intent/entities، ويولّد رد منظّم.
- تسجيل رسالة Tejo داخل نفس ticket عبر `SupportService`.
- تطبيق handoff policy: عند low confidence أو طلب بشري صريح يتم تعيين ticket للحالة البشرية مع رسالة تفسير.
- إبقاء مسار الموظف البشري الحالي دون تغيير وظيفي.

3. **Phase 2: Retrieval + Knowledge (5-7 أيام)**
- ربط product search الحالي (text-first) كطبقة retrieval أولى.
- إضافة embeddings pipeline في Bull queue:
  - Collections منفصلة: `tejo_product_embeddings`, `tejo_kb_embeddings`.
  - مهام incremental reindex + full reindex.
- hybrid retrieval strategy: lexical score + vector score + business re-rank.
- fallback واضح: إذا retrieval فشل، Tejo يرجع رد آمن + اقتراح handoff.

4. **Phase 3: Prompt Management + Admin Experience (4-6 أيام)**
- تفعيل `TejoPrompt` versioning: draft/active/archived + rollback فوري.
- إضافة صفحات admin لـ prompts، analytics، conversations، settings.
- إضافة صلاحيات جديدة: `tejo.read`, `tejo.manage`, `tejo.analytics`.

5. **Phase 4: Web Pilot (4-5 أيام)**
- تفعيل Tejo لجزء من مستخدمي web عبر feature flag (نسبة/whitelist).
- تحديث واجهة chat لعرض الرسائل المنظمة (cards/actions/suggestions) مع fallback نصي.
- الحفاظ على تجربة websocket الحالية مع التوافق الكامل للأحداث.

6. **Phase 5: Observability, Hardening, Release (3-4 أيام)**
- metrics: latency p50/p95، confidence distribution، handoff rate، error rate، deflection rate.
- dashboards + alerts + runbook للحوادث.
- تنفيذ Go/No-Go checklist ثم توسيع النسبة تدريجياً.

## خطة الاختبارات ومعايير القبول
- **Unit Tests**
  - intent/entity parsing.
  - prompt assembly.
  - provider adapter routing/fallback.
  - response composer (cards/actions/suggestions).
- **Integration Tests**
  - Tejo ↔ SupportService ticket/message lifecycle.
  - Tejo ↔ SearchModule retrieval and ranking.
  - queue jobs for embeddings/reindex.
- **E2E Tests**
  - سيناريو محادثة كاملة: سؤال منتج → رد Tejo → متابعة → handoff → رد موظف.
  - توافق websocket events (`message:new` + alias).
  - صلاحيات admin على صفحات وواجهات Tejo.
- **Non-Functional**
  - load test على endpoint `/tejo/query`.
  - resilience test عند تعطل provider أو Redis queue.
  - security test: prompt injection/basic jailbreak guards + PII-safe logging.
- **قبول MVP**
  - لا يوجد كسر في دعم العملاء الحالي.
  - >95% من طلبات Tejo تنتهي برد valid أو handoff صحيح.
  - جميع صفحات Admin الأساسية تعمل بصلاحيات واضحة.
  - observability baseline جاهز قبل pilot العام.

## الافتراضات والاختيارات الافتراضية
- المزود الأولي: Provider A كـ primary وProvider B كـ fallback عبر نفس adapter contract.
- اللغات في v1: العربية + الإنجليزية، مع default حسب `locale` القادم من العميل.
- لا يوجد vector database خارجي في v1؛ Mongo كافٍ للمرحلة الأولى.
- أي تغيير على wire contract الحالي سيكون additive فقط (بدون breaking changes).
- نطاق هذا التنفيذ: backend + admin + web chat فقط (بدون mobile app changes في هذه الدورة).

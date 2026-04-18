# خطة تنفيذ شاملة لميزة Tejo (الباك اند + لوحة التحكم)

> هذا المستند هو خطة التنفيذ الرسمية لميزة **Tejo** داخل مشروع **تجدد**، بشكل احترافي وقابل للتسليم على مراحل.
> 
> الهدف: بناء مساعد ذكي متكامل داخل نفس نظام الدعم الحالي، مع قسم إداري مستقل باسم **Tejo** يحتوي كل ما يتعلق بالمحادثات، التدريب، المنتجات، التحويل للبشري، والتحليلات.

---

## 1) الرؤية والهدف

### 1.1 الرؤية
تحويل Tejo من "بوت ردود" إلى **نظام تشغيل AI كامل** داخل منصة الدعم، بحيث:

- يعمل ضمن نفس `SupportTicket` و`SupportMessage` (بدون تكرار).
- يقدم ردود Structured قابلة للعرض مباشرة في الواجهة.
- يربط الاستفسارات بالمنتجات وKB بشكل موثوق.
- يدعم التحويل للبشري داخل نفس المحادثة.
- يتيح إدارة التدريب والتشغيل والتحليل من لوحة تحكم موحدة.

### 1.2 أهداف العمل

- توحيد قناة Tejo ضمن بنية الدعم الحالية.
- إتاحة إدارة البرومبت والـ KB من الأدمن بدون إعادة نشر.
- بناء خط استرجاع تدريجي: Text أولاً ثم Hybrid (Text + Vector).
- توفير قابلية قياس عالية: جودة الردود، الثقة، الأداء، والتحويل للبشري.

---

## 2) النطاق (Scope)

### 2.1 داخل النطاق

- محادثات Tejo عبر REST + WebSocket.
- Intent + Entities + Structured Rendering.
- Products Retrieval + KB/FAQ Retrieval.
- Prompt Management مع Versioning وActivation.
- Handoff للبشري داخل نفس الـ ticket.
- Observability ولوحات قياس داخل الأدمن.

### 2.2 خارج النطاق (حالياً)

- أي اعتماد على n8n لتوليد embeddings.
- بناء نظام دعم جديد منفصل عن الحالي.
- تعدد لغات متقدم خارج (`ar`, `en`) في المرحلة الأولى.

---

## 3) المبادئ المعمارية الأساسية

1. **No Duplication**: إعادة استخدام `SupportTicket`, `SupportMessage`, `SupportMessagesGateway`.
2. **Single Thread**: Tejo + Human Support في نفس ticket.
3. **Structured First**: كل رد AI يجب أن يكون payload منظم قابل للعرض.
4. **Correctness over Creativity**: السعر/المخزون من DB فقط، ومعلومات الفروع/الدوام من KB فقط.
5. **Traceability**: كل رد AI يجب أن يحمل `intent`, `confidence`, `promptVersionId`.

---

## 4) التصميم العام (Backend Architecture)

## 4.1 الموديولات

```text
src/
  tejo/
    tejo.module.ts
    tejo.controller.ts
    tejo.service.ts                 // Orchestrator

    prompt/
      tejo-prompt.module.ts
      tejo-prompt.service.ts

    intent/
      intent.module.ts
      intent.service.ts

    retrieval/
      products.retrieval.ts
      kb.retrieval.ts

    render/
      tejo.renderer.ts

    embeddings/
      embeddings.module.ts
      embeddings.service.ts
      embeddings.worker.ts
      embeddings.scheduler.ts       // optional
```

## 4.2 إعادة الاستخدام من support

- `SupportTicketsService`
- `SupportMessagesService`
- `SupportMessagesGateway`
- `WebSocketService`

---

## 5) نموذج البيانات (Data Model)

### 5.1 SupportTicket (إضافات)

- `channel: 'support' | 'tejo'`
- `aiEnabled?: boolean`
- `handoffRequestedAt?: Date`
- `handoffReason?: string`
- `aiSummary?: string`

### 5.2 SupportMessage (إضافات)

- `messageType` إضافة قيمة: `ai_reply`
- `payload?: object`
- `intent?: string`
- `confidence?: number`
- `entities?: object`
- `promptVersionId?: ObjectId`
- `retrievalTrace?: object` (اختياري)

### 5.3 TejoPrompt (Collection جديدة)

- `key`: (`tejo_system`, `tejo_intent`, `tejo_style`, `tejo_products`, `tejo_kb`, ...)
- `version`
- `content`
- `status`: `draft | active | archived`
- `updatedBy`, `updatedAt`

### 5.4 (اختياري موصى به) TejoMetricsDaily

- `date`
- `totalConversations`
- `totalMessages`
- `handoffCount`
- `avgConfidence`
- `avgLatencyMs`
- `zeroResultRate`

---

## 6) API Contract

### 6.1 Public Tejo APIs

1. `POST /tejo/conversations`
   - Input: `userId|deviceId`, `locale?`, `context?`
   - Output: `{ ticketId }`

2. `POST /tejo/conversations/:ticketId/messages`
   - Input: `{ text, locale, context? }`
   - Action:
     - save user message
     - broadcast user message
     - run Tejo pipeline
     - save ai message
     - broadcast ai message
   - Output: structured ai response

3. `GET /tejo/conversations/:ticketId/messages?limit=50`
   - Output: messages array (with payload)

### 6.2 Admin Tejo APIs (Prompts)

- `GET /admin/tejo/prompts`
- `POST /admin/tejo/prompts`
- `PATCH /admin/tejo/prompts/:id`
- `POST /admin/tejo/prompts/:id/activate`
- `POST /admin/tejo/prompts/:id/duplicate`

### 6.3 Admin Tejo APIs (Conversations/Analytics)

- `GET /admin/tejo/conversations`
- `GET /admin/tejo/conversations/:ticketId`
- `POST /admin/tejo/conversations/:ticketId/handoff`
- `POST /admin/tejo/conversations/:ticketId/assign`
- `GET /admin/tejo/analytics/overview`
- `GET /admin/tejo/analytics/intents`
- `GET /admin/tejo/analytics/retrieval`

---

## 7) WebSocket Contract

- Namespace: `/support`
- Join: `join-ticket` → joins `ticket:{ticketId}`
- Unified Message Event: `ticket-message`
- Optional Typing Event: `ai-typing`
- Optional Status Event: `ticket-status-updated`

---

## 8) مسار الرسالة (End-to-End Pipeline)

1. Frontend يرسل رسالة عبر `POST /tejo/conversations/:ticketId/messages`.
2. حفظ رسالة المستخدم في `SupportMessage`.
3. بث الرسالة عبر `ticket-message`.
4. تحميل prompts الفعالة من cache/service.
5. تنفيذ `IntentService` لاستخراج intent/entities/confidence.
6. تنفيذ Retrieval:
   - Products: text (ثم hybrid لاحقًا)
   - KB: vector RAG
7. Renderer يبني structured payload.
8. حفظ رسالة AI (`ai_reply`) مع metadata التحليلية.
9. بث رد AI عبر نفس غرفة التذكرة.
10. الواجهة ترسم cards/actions/suggestions.

---

## 9) تصميم قسم لوحة التحكم: Tejo

> يتم إنشاء قسم رئيسي مستقل باسم **Tejo** في Sidebar مع التفرعات التالية:

1. **Overview**
2. **Conversations**
3. **Live Chat**
4. **Prompts**
5. **Knowledge Base**
6. **Retrieval & Products**
7. **Handoff Queue**
8. **Analytics**
9. **Settings**

### 9.1 Overview

- KPIs سريعة: عدد المحادثات، handoff rate، avg confidence، avg latency، zero-result.
- مخطط زمني يومي/أسبوعي لأداء Tejo.

### 9.2 Conversations

- جدول محادثات `channel=tejo`.
- أعمدة: status, last message, intent الأخير, confidence, assignedTo, handoff flag.
- فلاتر: التاريخ، الحالة، intent، تم التحويل/لا.

### 9.3 Live Chat

- عرض لحظي لنفس thread (user + ai + human).
- إظهار payload بصيغة cards/actions/suggestions.
- عرض trace مختصر لكل رد AI.

### 9.4 Prompts

- إدارة keys + versions + status.
- إجراءات: create, update, duplicate, activate.
- فرق نسخ (diff) بين البرومبتات (اختياري موصى به).

### 9.5 Knowledge Base

- CRUD لعناصر KB/FAQ.
- حقل حالة embedding لكل عنصر (`pending`, `indexed`, `failed`).
- زر Reindex فردي/جماعي.

### 9.6 Retrieval & Products

- أكثر منتجات تم ترشيحها/النقر عليها.
- تتبع `resultCount` ونسبة no-results.
- مقارنة text-only vs hybrid (عند التفعيل).

### 9.7 Handoff Queue

- عرض جميع الحالات المحولة للبشري.
- `handoffReason`, وقت التحويل, SLA, assigned agent.
- إجراءات: assign/reassign/resolve.

### 9.8 Analytics

- توزيع intents.
- confidence bands.
- handoff trend.
- latency percentile (P50/P95).

### 9.9 Settings

- feature flags (text/hybrid, ai-typing, retrievalTrace).
- thresholds (confidence threshold, max results, timeout limits).
- cache TTL للبرومبت.

---

## 10) إدارة التدريب (Training Lifecycle)

### 10.1 Prompts Training

- تحديث prompts عبر الأدمن.
- تفعيل نسخة active لكل key.
- الربط بـ `promptVersionId` لكل رسالة AI.

### 10.2 KB Training

- تحديث FAQ والسياسات والفروع.
- إطلاق jobs لتحديث embeddings بعد كل تعديل.

### 10.3 Products Training

- بناء embeddingText من خصائص المنتج.
- توليد embeddings بالخلفية (Queue/Worker).

### 10.4 Quality Loop

- مراقبة no-answer + handoff reasons.
- تعديل prompt/KB/rules بناءً على البيانات.

---

## 11) Hybrid Search Strategy

### 11.1 المرحلة الأولى (MVP)

- Intent rules + Text search فقط.

### 11.2 المرحلة الثانية

- Vector retrieval للـ KB أولًا.

### 11.3 المرحلة الثالثة

- Products Hybrid (Text + Vector + rerank + filters).

### 11.4 فشل آمن (Safe Fallback)

- إذا vector غير جاهز: العودة مباشرة لنتائج text.
- إذا لا نتائج موثوقة: handoff + actions (اتصال/واتساب).

---

## 12) Guardrails (منع الهلوسة)

1. السعر/المخزون/التوفر من DB فقط.
2. الدوام/الفروع/الأرقام من KB فقط.
3. عند انخفاض الثقة: سؤال توضيحي واحد فقط.
4. عند انعدام ثقة كافٍ: تحويل للبشري داخل نفس ticket.

---

## 13) الأمان والصلاحيات (RBAC)

### 13.1 أدوار مقترحة

- `tejo.viewer`: قراءة فقط.
- `tejo.operator`: تشغيل المحادثات والتحويل والتعيين.
- `tejo.admin`: إدارة prompts/KB/settings.

### 13.2 متطلبات أمنية

- حماية كل admin endpoints.
- audit log على: prompts, KB, handoff, settings changes.
- rate limiting على endpoints العامة.

---

## 14) المراقبة والقياس (Observability)

### 14.1 Metrics أساسية

- `intent`, `confidence`, `resultCount`, `handoff`, `latencyMs`.
- نسبة no-result.
- نسبة fallback إلى text-only.

### 14.2 Logs/Traces

- حفظ `retrievalTrace` اختياريًا للتحليل.
- correlation id لكل رسالة لتتبع رحلة الطلب.

### 14.3 Dashboards

- Dashboard عام في `Tejo > Overview`.
- Dashboard تفصيلي في `Tejo > Analytics`.

---

## 15) خطة التنفيذ الزمنية (Roadmap)

## Phase 1 — MVP Core (1-2 أسبوع)

1. Tejo module/controller/service.
2. APIs الأساسية (create conversation, send message, get messages).
3. `ai_reply` + structured payload fields.
4. WebSocket broadcast داخل ticket room.
5. Intent rules + text retrieval.
6. واجهة Admin مبدئية: Tejo > Conversations + Live Chat.

**معيار القبول:**
- المستخدم يرسل ويستقبل رسائل Tejo داخل نفس ticket.
- cards الأساسية للمنتجات تعمل.

## Phase 2 — Prompt + Handoff + Admin Foundation (3-5 أيام)

1. `TejoPrompt` collection + APIs.
2. Prompt service مع cache.
3. حفظ `promptVersionId`.
4. handoff workflow داخل نفس ticket.
5. Tejo > Prompts و Tejo > Handoff Queue.

**معيار القبول:**
- تعديل البرومبت من الأدمن وتطبيقه runtime.
- التحويل للبشري يعمل بدون نقل المحادثة.

## Phase 3 — Embeddings + Hybrid Retrieval (1 أسبوع)

1. Embeddings module + worker + jobs.
2. KB embeddings ثم products embeddings.
3. Hybrid search + rerank + filters.
4. fallback إلى text-only.
5. Tejo > Retrieval & Products.

**معيار القبول:**
- تحسن واضح في استرجاع الأسئلة الطبيعية.
- عدم تأثر زمن رد الشات بسبب التوليد الخلفي.

## Phase 4 — Observability + Quality Guardrails (3-4 أيام)

1. metrics logging كامل.
2. analytics endpoints.
3. Tejo > Overview + Tejo > Analytics.
4. تفعيل قواعد correctness checks النهائية.

**معيار القبول:**
- رؤية تشغيلية كاملة + أدوات تحسين مستمرة.

---

## 16) خطة الاختبارات (Testing Strategy)

### 16.1 Unit Tests

- intent classification rules
- renderer payload output
- guardrails checks
- prompt cache behavior

### 16.2 Integration Tests

- tejo APIs + DB persistence
- websocket broadcast correctness
- handoff state transitions

### 16.3 E2E Tests

- user → ai → handoff → human داخل نفس ticket
- admin prompt update ثم تأثيره على الرسائل الجديدة

### 16.4 Non-Functional

- latency under load
- queue failure/retry behavior
- fallback reliability when vector unavailable

---

## 17) سجل المخاطر والتخفيف

1. **ضعف دقة intent في البداية**
   - تخفيف: قواعد بسيطة + سؤال توضيحي واحد + مراجعة أسبوعية للبيانات.

2. **تأخر embeddings أو فشل jobs**
   - تخفيف: retries + dead-letter queue + text fallback دائم.

3. **هلوسة معلومات غير موثوقة**
   - تخفيف: guardrails صارمة + منع مصادر خارج DB/KB.

4. **توسع سريع دون قياس**
   - تخفيف: فرض metrics من أول sprint وتتبّع جودة إلزامي.

---

## 18) قائمة التسليم النهائية (Deliverables)

1. Backend APIs + WebSocket flow لتيجو.
2. Tejo Admin Section كامل بتفرعاته.
3. Prompt management runtime.
4. Handoff workflow داخل نفس ticket.
5. Embeddings pipeline داخلي + Hybrid retrieval.
6. Dashboards + metrics + quality guardrails.
7. Test suites (unit/integration/e2e) مع معايير قبول واضحة.

---

## 19) تعريف النجاح النهائي

تعتبر الميزة جاهزة إنتاجيًا عندما:

- كل محادثات Tejo تظهر وتُدار من قسم **Tejo** في الأدمن.
- كل رد AI قابل للتتبع (`intent/confidence/promptVersion`).
- المنتجات والـ KB مرتبطة فعليًا بالردود المنسقة.
- التحويل للبشري يعمل داخل نفس التذكرة بدون فقد سياق.
- توجد رؤية رقمية واضحة لأداء Tejo وجودة الردود وقدرة التحسين المستمر.

---

**النسخة:** v1.0  
**الحالة:** Ready for Implementation

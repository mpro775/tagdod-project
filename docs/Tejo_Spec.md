# Tejo (تيجو) — مواصفة تطوير/توثيق (NestJS + MongoDB + n8n + WebSocket)

> هذا المستند هو المرجع الرسمي لتطوير مساعد الشات الذكي **تيجو** داخل مشروع **تجدد**.
> يهدف لتوحيد الفهم المعماري، الـ APIs، التخزين، إدارة البرومبت، والـ Vector/Hybrid Search، مع إعادة استخدام نظام الدعم الحالي بدون تكرار.

---

## 1) تعريف تيجو (What is Tejo?)

**تيجو** هو مساعد ذكي داخل شات التطبيق يقوم بـ:

1. استقبال رسالة المستخدم من واجهة WebChat.
2. تحديد **نية المستخدم** (Intent) + استخراج البيانات (Entities).
3. استرجاع نتائج موثوقة من:
   - **المنتجات** عبر **Hybrid Search (Text + Vector)**.
   - **قاعدة المعرفة KB/FAQ** عبر **Vector RAG**.
4. إخراج رد **Structured** (منظم) يحتوي:
   - رسالة نصية قصيرة.
   - **بطاقات منتجات قابلة للنقر** (deeplink/slug).
   - أزرار اقتراحات (suggestions chips).
   - Actions (اتصال/واتساب/خريطة…).
5. تخزين كل شيء داخل الباك اند ضمن **نفس نظام الدعم الحالي** (Support Tickets/Messages).
6. دعم **التحويل للبشري (Handoff)** داخل نفس المحادثة.

---

## 2) مبدأ أساسي: لا تكرار — إعادة استخدام نظام الدعم الحالي

لدينا مسبقًا:

- `SupportTicket` = يمثل المحادثة (Conversation / Thread)
- `SupportMessage` = يمثل الرسائل (Messages)
- `SupportMessagesGateway` + `WebSocketService` = بث فوري Real-time

✅ تيجو سيعمل **داخل نفس النظام** كالتالي:

- محادثة تيجو = `SupportTicket` مع تمييز:
  - `channel = 'tejo'` أو `tags: ['tejo']`
- رد تيجو = `SupportMessage` مع تمييز:
  - `messageType = 'ai_reply'` (يُضاف للـ enum)

---

## 3) تجربة المستخدم داخل التطبيق (WebChat UX Flow)

### 3.1 إنشاء محادثة
الواجهة تطلب:
- `POST /tejo/conversations`

الناتج:
- `ticketId` (وهو معرف المحادثة)

### 3.2 الانضمام للـ WebSocket
الواجهة تتصل بالويب سوكت الحالي:
- Namespace: `/support`
- ثم ترسل event للانضمام لغرفة:
  - `join-ticket` مع `ticketId`
- يتم وضع العميل في Room:
  - `ticket:{ticketId}`

### 3.3 إرسال رسالة
الواجهة ترسل:
- `POST /tejo/conversations/:ticketId/messages`
  - body: `{ text, locale, context? }`

السيرفر يقوم بـ:
1. حفظ رسالة المستخدم كـ `SupportMessage(user_message)`.
2. بث رسالة المستخدم عبر WebSocket لنفس الغرفة.
3. تشغيل تيجو (Intent → Retrieval → Render).
4. حفظ رد تيجو كـ `SupportMessage(ai_reply)` مع payload منظم.
5. بث رد تيجو عبر WebSocket لنفس الغرفة.

---

## 4) واجهات API المطلوبة (Endpoints)

> هذه الواجهات تُبنى فوق نفس خدمات الدعم (Support services) بدون تكرار جداول/منطق.

### 4.1 إنشاء محادثة تيجو
**POST** `/tejo/conversations`

- Input:
  - `userId` أو `deviceId` (للزائر)
  - `locale` (اختياري)
  - `context` (اختياري)
- Server Action:
  - إنشاء `SupportTicket` مع `channel=tejo`
- Output:
  - `{ ticketId }`

### 4.2 إرسال رسالة
**POST** `/tejo/conversations/:ticketId/messages`

- Input:
  - `text: string`
  - `locale: 'ar' | 'en'`
  - `context?: { productId?, page?, cart? }`
- Output:
  - Structured Response (مثل payload الذي سيصل عبر WebSocket)

### 4.3 جلب الرسائل
**GET** `/tejo/conversations/:ticketId/messages?limit=50`

- Output:
  - Array من الرسائل (مع payload)

---

## 5) WebSocket Events (Real-time)

> يتم استخدام نفس الـ Gateway الموجود (namespace `/support`).

### 5.1 Join Room
- Event: `join-ticket`
- Payload: `{ ticketId }`
- Result:
  - socket joins `ticket:{ticketId}`

### 5.2 Message Broadcast (موحّد لكل الرسائل)
- Event: `ticket-message`
- Payload: `SupportMessageDTO` (يتضمن المحتوى + payload)

### 5.3 (اختياري) مؤشرات الكتابة
- Event: `ai-typing`
- Payload: `{ ticketId, isTyping: boolean }`

### 5.4 (اختياري) تحديث الحالة عند Handoff
- Event: `ticket-status-updated`
- Payload: `{ ticketId, status, assignedTo? }`

---

## 6) التخزين (MongoDB Collections)

### 6.1 SupportTicket (محادثة)
يُستخدم كما هو مع إضافات خفيفة:

**حقول مقترحة (أو ضمن metadata):**
- `channel: 'support' | 'tejo'`  *(افتراضي support)*
- `aiEnabled?: boolean` *(افتراضي true عند channel=tejo)*
- `handoffRequestedAt?: Date`
- `handoffReason?: string`
- `aiSummary?: string` *(ملخص للمشرف عند التحويل)*

### 6.2 SupportMessage (رسالة)
يُستخدم كما هو مع إضافات لتيجو:

**تعديلات/إضافات مقترحة:**
- إضافة enum في `messageType`:
  - `ai_reply`
- إضافة:
  - `payload?: object` *(Structured cards/actions/suggestions)*
  - `intent?: string`
  - `confidence?: number`
  - `entities?: object`
  - `promptVersionId?: ObjectId`
  - `retrievalTrace?: object` *(اختياري: نتائج text/vector, ids, scores)*

> ملاحظة: يمكن وضع معظم هذه ضمن `metadata` إذا رغبت، لكن وجود حقول واضحة يسهل التحليلات والتقارير.

### 6.3 TejoPrompt (إدارة البرومبت)
**Collection جديدة منفصلة** عن الدعم:

- `key`: `tejo_system` | `tejo_intent` | `tejo_style` | `tejo_products` | `tejo_kb` ...
- `version`: رقم/نص
- `content`: نص البرومبت
- `status`: `draft` | `active` | `archived`
- `updatedBy`, `updatedAt`

---

## 7) إدارة البرومبت من لوحة التحكم (Admin)

### 7.1 Admin Endpoints (مقترح)
- `GET /admin/tejo/prompts`
- `POST /admin/tejo/prompts`
- `PATCH /admin/tejo/prompts/:id`
- `POST /admin/tejo/prompts/:id/activate`
- `POST /admin/tejo/prompts/:id/duplicate`

### 7.2 Runtime Behavior
- `TejoPromptService` يحمّل نسخة `active` لكل key
- يعمل Cache (مثلاً TTL 60 ثانية)
- كل رسالة تيجو تحفظ `promptVersionId` للرجوع والتحليل.

---

## 8) قلب تيجو: Intent Engine (فهم النية)

### 8.1 Intents الأساسية
- `PRODUCT_SEARCH`
- `PRODUCT_DETAILS`
- `STORE_INFO`
- `FAQ`
- `HANDOFF_HUMAN`

### 8.2 Entities (Slots) حسب المجال
- **لمبات**: `watt`, `colorTemp`, `indoorOutdoor`, `brand`, `budget`
- **قواطع**: `ampere`, `poles`, `breakerType(MCB/RCCB/RCBO)`, `brand`, `budget`
- **مفاتيح**: `series`, `color`, `type`, `brand`

### 8.3 قاعدة التوضيح
إذا `confidence` منخفض:
- تيجو يسأل **سؤال واحد فقط** مع أزرار جاهزة (suggestions).

---

## 9) الاسترجاع الذكي (Retrieval)

### 9.1 منتجات: Hybrid Search (Text + Vector)
#### لماذا Hybrid؟
- **Text**: ممتاز للأرقام/الأكواد/الأسماء الدقيقة (12W, 20A, ABB)
- **Vector**: ممتاز للمعنى والأسئلة الطبيعية

#### خطوات البحث (مقترح)
1. `textSearch(query)` → IDs + score
2. `vectorSearch(query)` → IDs + score
3. Merge + Re-rank بسيط
4. Apply filters من entities (category/brand/budget…)
5. Return Top N

#### عرض السعر (Display Price)
- إذا المنتج له variants:
  - `displayPrice` = أقل سعر Variant مناسب
- إذا بدون variants:
  - `displayPrice` = `Product.basePrice*`

> يفضّل أن endpoint البحث يرجّع `displayPrice` جاهز لتقليل استعلامات الشات.

### 9.2 KB/FAQ: Vector RAG
- البحث يتم داخل `kb_items` (سياسات/أسئلة شائعة/دوام/فروع…)
- النتيجة:
  - نص جواب موثوق (قصير)
  - (اختياري) reference/source داخلي
- إذا لا يوجد جواب موثوق:
  - تيجو يوصي بـ Handoff + زر واتساب/اتصال.

---

## 10) الـ Vector Data & Embeddings (دور n8n)

### 10.1 لماذا n8n؟
- توليد embeddings “خلفيًا” دون إبطاء الشات.
- تحديث embeddings عند تعديل المنتجات/KB.

### 10.2 Flow: Products Embeddings
- Trigger: منتج جديد أو تحديث (Webhook أو Cron)
- Steps:
  1. Build `embeddingText` (name + description + keywords + category + brand…)
  2. Generate embedding
  3. Save embedding في:
     - `Product.embedding` (أو collection منفصلة `product_vectors`)

### 10.3 Flow: KB/FAQ Embeddings
- Trigger: تعديل KB من لوحة التحكم
- Steps:
  1. Build text
  2. Generate embedding
  3. Save embedding في `kb_items`

---

## 11) إخراج الرد (Structured Response Format)

> الواجهة تعتمد على payload منظم لتحويل النتائج إلى عناصر قابلة للنقر.

### 11.1 Products Reply
```json
{
  "type": "products_reply",
  "message": "لقيت لك أفضل الخيارات:",
  "products": [
    {
      "id": "p_123",
      "title": "لمبة LED 12W",
      "price": 2500,
      "currency": "YER",
      "shortDesc": "إضاءة قوية مناسبة للمنازل",
      "deeplink": "tajadd://product/slug-here"
    }
  ],
  "suggestions": ["أرخص", "أقوى", "للخارج"],
  "actions": []
}
```

### 11.2 Store Info / FAQ Reply
```json
{
  "type": "info_reply",
  "message": "دوامنا من السبت إلى الخميس 9 صباحًا - 9 مساءً.",
  "actions": [
    { "title": "اتصل الآن", "deeplink": "tel:+9677xxxxxxx" },
    { "title": "واتساب", "deeplink": "https://wa.me/9677xxxxxxx" }
  ],
  "suggestions": ["عناوين الفروع", "سياسة الاستبدال"]
}
```

---

## 12) منع الهلوسة (Rules of Correctness)

1. **لا** يذكر تيجو سعر/مخزون/توفر إلا من DB.
2. **لا** يجيب عن الدوام/الفروع/الأرقام إلا من KB.
3. إذا نية المستخدم غير واضحة → **سؤال واحد فقط** للتوضيح.
4. إذا لا توجد إجابة موثوقة → Handoff للبشري مع Actions جاهزة.

---

## 13) التحويل للبشري (Handoff) داخل نفس Ticket

عندما يحتاج تيجو تحويل:
1. تحديث `SupportTicket`:
   - `handoffRequestedAt = now`
   - `handoffReason = ...`
   - `status = in_progress` (أو حسب نظامك)
   - (اختياري) `assignedTo = ...`
2. إرسال رسالة system/ai:
   - "تم تحويلك للدعم…"
3. بث التحديث والرسالة عبر WebSocket

✅ الدعم البشري يكمل داخل **نفس** ticket دون أي تكرار.

---

## 14) هيكلة الموديولات داخل NestJS (مقترح)

> هدفنا الاستفادة من existing Support modules مع إضافة طبقة Tejo فقط.

```
src/
  tejo/
    tejo.module.ts
    tejo.controller.ts         // /tejo/*
    tejo.service.ts            // orchestrator (calls intent/retrieval/render)

    prompt/
      tejo-prompt.module.ts
      tejo-prompt.service.ts

    intent/
      intent.module.ts
      intent.service.ts

    retrieval/
      products.retrieval.ts     // hybrid search using Product/Variant
      kb.retrieval.ts           // RAG using kb_items

    render/
      tejo.renderer.ts          // builds structured payload

  support/
    support-tickets.service.ts
    support-messages.service.ts
    support-messages.gateway.ts
    websocket.service.ts
```

> TejoService يعيد استخدام SupportTicketsService + SupportMessagesService + WebSocketService.

---

## 15) رحلة رسالة واحدة (End-to-End)

1. Frontend calls: `POST /tejo/conversations/:ticketId/messages`
2. Backend saves user SupportMessage
3. Backend broadcasts user message (WS)
4. Backend loads active prompts (cached)
5. IntentService returns intent/entities
6. Retrieval runs:
   - Products → Hybrid Search
   - KB → Vector RAG
7. Renderer builds structured response
8. Backend saves ai SupportMessage (with promptVersionId)
9. Backend broadcasts ai message (WS)
10. Frontend renders message + cards + actions

---

## 16) ملاحظات تنفيذية سريعة (Best Practices)

- اعمل **تبويب** في لوحة التحكم:
  - Support (channel=support)
  - Tejo (channel=tejo)
- سجّل دائمًا:
  - intent/confidence
  - promptVersionId
  - resultCount
  - handoff flags
- ابدأ بـ Hybrid تدريجيًا:
  - Text search + intent rules (مبدئيًا)
  - ثم فعّل Vector عبر embeddings من n8n

---

## 17) نطاق التيجو الحالي (Scope)

**المنتجات الحالية:**
- قواطع
- لمبات
- مفاتيح كهربائية

**الاستفسارات العامة:**
- مواعيد الدوام
- عناوين الفروع
- أرقام التواصل
- أسئلة شائعة وسياسات

---

> نهاية المستند.

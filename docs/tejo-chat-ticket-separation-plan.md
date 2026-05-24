# خطة الحل النهائي لفصل محادثات تيجو عن تذاكر الدعم البشري

## 1. الهدف من التعديل

الهدف هو إصلاح المشكلة الحالية التي تجعل محادثة تيجو من الويب تتحول تلقائيًا إلى تذكرة دعم ورد بشري عند الخروج والرجوع.

الحل النهائي هو اعتماد مبدأ:

```txt
Tejo First, Ticket Later
```

أي:

```txt
تيجو يبدأ كمحادثة AI مستقلة.
التذكرة لا تُنشأ إلا عند تصعيد حقيقي للدعم البشري.
```

---

## 2. المشكلة الحالية

حاليًا عند التحدث مع تيجو من الويب، النظام يقوم بإنشاء تذكرة دعم مباشرة أو يربط المحادثة بنظام التذاكر من البداية.

بعد ذلك، عند الخروج والرجوع، الواجهة تستخدم Endpoint الدعم البشري بدل Endpoint تيجو، وبالتالي تتحول المحادثة إلى تذكرة دعم وتظهر في لوحة التحكم كأنها تحتاج رد بشري.

المشكلة ناتجة عن الخلط بين مفهومين مختلفين:

1. محادثة AI مع تيجو.
2. تذكرة دعم بشرية.

---

## 3. السلوك الحالي الخاطئ

التدفق الحالي تقريبًا:

```txt
User opens Tejo chat
↓
Tejo receives message
↓
System creates SupportTicket
↓
Tejo replies inside ticket
↓
User leaves and returns
↓
Frontend sends next messages to support endpoint
↓
Ticket becomes human support flow
```

هذا يؤدي إلى:

- إنشاء تذاكر كثيرة بدون داعي.
- ظهور محادثات AI في لوحة الدعم.
- فقدان تجربة تيجو عند الرجوع.
- خلط بين رد الذكاء ورد الموظف.
- صعوبة تحليل أداء تيجو بشكل مستقل.

---

## 4. السلوك المطلوب

التدفق الصحيح:

```txt
User opens Tejo chat
↓
System creates TejoSession
↓
Messages are saved as TejoMessages
↓
Tejo replies normally
↓
User leaves and returns
↓
Frontend loads same TejoSession
↓
User continues with AI
```

ولا يتم إنشاء تذكرة دعم إلا هنا:

```txt
Tejo fails to answer confidently
or user explicitly asks for human support
↓
Tejo asks for confirmation
↓
User confirms handoff
↓
System creates SupportTicket
↓
Support team handles the ticket
```

---

## 5. التصميم المعماري الجديد

يجب فصل الكيانات إلى:

```txt
TejoSession
TejoMessage
SupportTicket
```

العلاقة تكون:

```txt
User / Visitor
   ↓
TejoSession
   ↓ only when needed
SupportTicket
```

وليس:

```txt
User / Visitor
   ↓
SupportTicket
   ↓
AI replies inside ticket
```

---

## 6. قاعدة البيانات المقترحة

### 6.1 جدول أو Collection: tejo_sessions

الحقول المقترحة:

```ts
id
tenantId
visitorId
customerId?
channel // web, whatsapp, messenger, instagram, etc.
status // active, resolved, escalation_suggested, escalated, closed
locale
storefrontHost?
supportTicketId?
lastMessageAt
createdAt
updatedAt
```

### 6.2 جدول أو Collection: tejo_messages

الحقول المقترحة:

```ts
id
sessionId
tenantId
role // user, assistant, system
content
metadata
createdAt
```

### 6.3 تعديل support_tickets

إضافة الحقول:

```ts
tejoSessionId?
source // manual, contact_form, tejo_handoff, web_chat
```

---

## 7. الحالات المعتمدة

### 7.1 TejoSessionStatus

```ts
enum TejoSessionStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  ESCALATION_SUGGESTED = 'escalation_suggested',
  ESCALATED = 'escalated',
  CLOSED = 'closed',
}
```

### 7.2 SupportTicketSource

```ts
enum SupportTicketSource {
  MANUAL = 'manual',
  CONTACT_FORM = 'contact_form',
  TEJO_HANDOFF = 'tejo_handoff',
  WEB_CHAT = 'web_chat',
}
```

### 7.3 AiStatus داخل التذكرة - مؤقتًا فقط

```ts
enum AiStatus {
  NONE = 'none',
  ACTIVE = 'active',
  HANDOFF_SUGGESTED = 'handoff_suggested',
  HANDED_OFF = 'handed_off',
}
```

ملاحظة: بعد الفصل الكامل، الأفضل تقليل الاعتماد على `aiStatus` داخل التذكرة، لأن حالة الذكاء يجب أن تكون داخل `TejoSession`.

---

## 8. تعديلات الباك إند

### 8.1 تعديل TejoService

المطلوب:

- إيقاف إنشاء SupportTicket عند أول رسالة.
- إنشاء TejoSession بدلًا من ذلك.
- حفظ رسالة المستخدم في tejo_messages.
- توليد رد تيجو.
- حفظ رد تيجو في tejo_messages.
- إرجاع `sessionId` للواجهة.

السلوك الجديد:

```ts
if (!sessionId) {
  session = await tejoSessionService.create({
    tenantId,
    visitorId,
    channel,
    locale,
    storefrontHost,
    status: 'active',
  });
} else {
  session = await tejoSessionService.findById(sessionId);
}

await tejoMessageService.create({
  sessionId: session.id,
  tenantId,
  role: 'user',
  content: message,
});

const answer = await tejoAiService.answer(message, context);

await tejoMessageService.create({
  sessionId: session.id,
  tenantId,
  role: 'assistant',
  content: answer.text,
  metadata: answer.metadata,
});
```

---

## 9. تعديل منطق Handoff

### 9.1 لا تحول تلقائيًا عند فشل الاسترجاع

حاليًا قد يتم التحويل للدعم عند:

```ts
retrievalFailed = true
confidence < threshold
handoffSuggested = true
```

المطلوب:

عند ضعف الإجابة، لا يتم إنشاء تذكرة مباشرة.

بدل ذلك:

```ts
session.status = 'escalation_suggested';
handoffSuggested = true;
handoffTriggered = false;
```

ويرد تيجو برسالة مثل:

```txt
لم أجد إجابة مؤكدة. هل تريد تحويلك لموظف دعم؟
```

مع زر:

```txt
نعم، حولني لموظف
```

### 9.2 التحويل الحقيقي لا يتم إلا بتأكيد المستخدم

عند ضغط المستخدم على زر التحويل أو طلب موظف بوضوح:

```ts
await createTicketFromTejoSession(sessionId);
```

---

## 10. دالة إنشاء تذكرة من جلسة تيجو

يجب إنشاء دالة مستقلة:

```ts
createTicketFromTejoSession(sessionId: string)
```

مسؤوليتها:

1. جلب جلسة تيجو.
2. جلب آخر رسائل الجلسة.
3. إنشاء SupportTicket جديد.
4. ربط التذكرة بالجلسة.
5. تحديث حالة الجلسة إلى escalated.
6. حفظ ملخص المحادثة أو الرسائل داخل التذكرة كـ context.

مثال شبه برمجي:

```ts
async createTicketFromTejoSession(sessionId: string) {
  const session = await tejoSessionService.findById(sessionId);
  const messages = await tejoMessageService.findBySession(sessionId);

  const ticket = await supportService.createTicket({
    tenantId: session.tenantId,
    source: 'tejo_handoff',
    tejoSessionId: session.id,
    subject: 'تصعيد من تيجو',
    initialMessage: buildConversationSummary(messages),
    status: 'open',
  });

  await tejoSessionService.update(session.id, {
    status: 'escalated',
    supportTicketId: ticket.id,
  });

  return ticket;
}
```

---

## 11. Endpoints جديدة مقترحة

### 11.1 إنشاء أو إرسال رسالة إلى جلسة تيجو

```http
POST /tejo/sessions/:sessionId/messages
```

أو:

```http
POST /tejo/query
```

Body:

```json
{
  "sessionId": "optional",
  "message": "مرحبا",
  "channel": "web",
  "locale": "ar",
  "storefrontHost": "example.com"
}
```

Response:

```json
{
  "sessionId": "session_123",
  "answer": "أهلًا بك...",
  "handoffSuggested": false,
  "status": "active"
}
```

### 11.2 جلب رسائل الجلسة

```http
GET /tejo/sessions/:sessionId/messages
```

### 11.3 طلب التحويل للدعم

```http
POST /tejo/sessions/:sessionId/handoff
```

Response:

```json
{
  "ticketId": "ticket_123",
  "sessionId": "session_123",
  "status": "escalated"
}
```

---

## 12. تعديلات الواجهة الأمامية Web

### 12.1 الاعتماد على sessionId بدل ticketId

في واجهة تيجو، يجب تخزين:

```ts
tejoSessionId
```

بدل الاعتماد على:

```ts
ticketId
```

يمكن حفظه في:

```ts
localStorage
```

مثال:

```ts
localStorage.setItem('tejo_session_id', sessionId);
```

وعند فتح المحادثة:

```ts
const sessionId = localStorage.getItem('tejo_session_id');
```

ثم:

```ts
GET /tejo/sessions/:sessionId/messages
```

---

## 13. تعديل إرسال الرسائل من الويب

### السلوك الخاطئ الحالي

```ts
supportService.sendMessage(ticketId, { content });
```

### السلوك المطلوب

إذا كانت الجلسة AI:

```ts
tejoService.sendMessage(sessionId, {
  message: content,
  channel: 'web',
  locale: 'ar',
});
```

إذا كانت الجلسة مصعدة:

```ts
supportService.sendMessage(ticketId, {
  content,
});
```

القاعدة:

```ts
if (tejoSession.status !== 'escalated') {
  sendToTejo();
} else {
  sendToSupportTicket();
}
```

---

## 14. تعديل لوحة التحكم Admin Dashboard

### 14.1 فصل التبويبات

يجب أن تكون هناك تبويبات واضحة:

```txt
1. محادثات تيجو
2. تذاكر الدعم
```

### 14.2 محادثات تيجو

تعرض:

- اسم الزائر أو العميل.
- القناة.
- آخر رسالة.
- عدد الرسائل.
- حالة الجلسة.
- هل تم اقتراح تحويل؟
- هل تم التصعيد؟
- وقت آخر رسالة.

### 14.3 تذاكر الدعم

تعرض فقط التذاكر البشرية الفعلية:

- تذاكر من نموذج التواصل.
- تذاكر تم إنشاؤها يدويًا.
- تذاكر تم تصعيدها من تيجو بعد تأكيد المستخدم.

---

## 15. تحسين تجربة المستخدم

عند فشل تيجو في الإجابة، يجب أن يقول:

```txt
لم أجد إجابة مؤكدة على سؤالك. يمكنني تحويلك لموظف دعم لمساعدتك بشكل أفضل.
```

ثم تظهر أزرار:

```txt
نعم، حولني لموظف
لا، أريد متابعة الحديث مع تيجو
```

إذا ضغط المستخدم نعم:

```txt
تم تحويل المحادثة لموظف دعم. سيتم الرد عليك من لوحة التحكم.
```

إذا ضغط لا:

```txt
تمام، يمكنك إعادة صياغة سؤالك وسأحاول مساعدتك.
```

---

## 16. خطة التنفيذ على مراحل

## Sprint 1: إصلاح سريع بدون كسر النظام

الهدف: حل المشكلة الحالية بأقل تغيير ممكن.

المهام:

1. تعديل الويب:
   - إذا `isAiHandled = true` و `aiStatus = active`، يتم الإرسال إلى `/tejo/query`.
   - لا يتم الإرسال إلى `/support/tickets/:id/messages` إلا إذا `aiStatus = handed_off`.

2. تعديل TejoService:
   - منع التحويل التلقائي عند `retrievalFailed`.
   - تحويله إلى اقتراح فقط.

3. إضافة زر تأكيد:
   - "نعم، حولني لموظف".
   - لا يتم إنشاء أو تفعيل handoff إلا بعد الضغط عليه.

4. إبقاء `ticketId` مؤقتًا للتوافق مع النظام الحالي.

---

## Sprint 2: الفصل الحقيقي

الهدف: إنشاء بنية مستقلة لمحادثات تيجو.

المهام:

1. إنشاء `tejo_sessions`.
2. إنشاء `tejo_messages`.
3. إنشاء `TejoSessionService`.
4. إنشاء `TejoMessageService`.
5. تعديل `TejoService` ليعتمد على Session بدل Ticket.
6. إضافة Endpoint لجلب رسائل الجلسة.
7. حفظ `sessionId` في الواجهة.

---

## Sprint 3: التصعيد النظيف للدعم

الهدف: إنشاء التذكرة فقط عند طلب الدعم البشري.

المهام:

1. إنشاء دالة:

```ts
createTicketFromTejoSession(sessionId)
```

2. ربط التذكرة بالجلسة:

```ts
supportTicket.tejoSessionId = session.id;
tejoSession.supportTicketId = ticket.id;
```

3. نقل آخر رسائل الجلسة كتاريخ أو ملخص داخل التذكرة.
4. تحديث حالة الجلسة إلى:

```ts
escalated
```

5. جعل لوحة الدعم تعرض فقط التذاكر المصعدة.

---

## Sprint 4: تحسين لوحة التحكم

الهدف: جعل التجربة واضحة للإدارة.

المهام:

1. إضافة صفحة أو تبويب "محادثات تيجو".
2. إضافة فلاتر:
   - نشطة.
   - تم اقتراح تحويل.
   - مصعدة.
   - مغلقة.
3. إضافة صفحة تفاصيل جلسة تيجو.
4. عرض ملخص جلسة تيجو داخل تذكرة الدعم المصعدة.
5. إضافة مؤشرات:
   - عدد محادثات تيجو.
   - عدد المحادثات المصعدة.
   - نسبة التصعيد.
   - أكثر الأسئلة التي فشل فيها تيجو.

---

## 17. شروط القبول Acceptance Criteria

يعتبر التنفيذ صحيحًا إذا تحقق التالي:

1. عند فتح تيجو وإرسال رسالة، لا يتم إنشاء تذكرة دعم مباشرة.
2. عند الخروج والرجوع، تظهر نفس محادثة تيجو.
3. عند إرسال رسالة بعد الرجوع، يرد تيجو وليس الدعم البشري.
4. لا تظهر محادثات تيجو العادية داخل قائمة تذاكر الدعم.
5. لا يتم إنشاء تذكرة إلا عند تأكيد المستخدم للتحويل.
6. عند التصعيد، تظهر التذكرة في لوحة التحكم مع ملخص المحادثة.
7. يمكن للموظف رؤية سياق المحادثة قبل الرد.
8. يمكن تتبع عدد جلسات تيجو ونسبة التصعيد.
9. لا يتم كسر نظام الدعم الحالي.
10. تبقى التذاكر القديمة قابلة للعمل.

---

## 18. ملاحظات مهمة أثناء التنفيذ

- لا تحذف نظام SupportTicket الحالي.
- لا تجعل كل محادثة AI تذكرة.
- لا تجعل `retrievalFailed` يعني handoff مباشر.
- يجب فصل `handoffSuggested` عن `handoffTriggered`.
- لا تستخدم endpoint الدعم البشري إلا بعد التصعيد.
- يجب حفظ `sessionId` في الويب للرجوع لنفس الجلسة.
- يجب أن تكون رسائل تيجو قابلة للعرض لاحقًا في لوحة التحكم.
- يفضل عمل Migration أو Script لمعالجة التذاكر القديمة التي أنشأها تيجو سابقًا.

---

## 19. القرار النهائي المعتمد

اعتماد البنية التالية:

```txt
TejoSession = محادثة ذكاء اصطناعي
TejoMessage = رسائل المحادثة
SupportTicket = دعم بشري فقط
```

واعتماد المبدأ:

```txt
AI conversation first.
Human ticket only after explicit escalation.
```

أو بصيغة المشروع:

```txt
تيجو أولًا، التذكرة لاحقًا.
```

---

## 20. Prompt مختصر لوكيل AI للتنفيذ

استخدم هذا النص مع Codex أو أي وكيل AI داخل المشروع:

```txt
نريد إصلاح بنية محادثات Tejo بحيث لا يتم إنشاء SupportTicket عند أول رسالة من المستخدم. المطلوب فصل Tejo AI Chat عن Human Support Tickets.

اعتمد مبدأ Tejo First, Ticket Later.

المطلوب:
1. إنشاء TejoSession و TejoMessage إن لم تكن موجودة.
2. تعديل TejoService بحيث يبدأ أو يستكمل جلسة TejoSession بدل إنشاء SupportTicket.
3. حفظ رسائل المستخدم وردود AI داخل tejo_messages.
4. تعديل منطق handoff بحيث retrievalFailed أو low confidence لا ينشئ تذكرة مباشرة، بل يضع handoffSuggested فقط.
5. إنشاء endpoint لتأكيد التحويل للدعم: POST /tejo/sessions/:sessionId/handoff.
6. عند تأكيد المستخدم فقط، يتم إنشاء SupportTicket وربطه بـ tejoSessionId.
7. تعديل واجهة الويب بحيث تعتمد على sessionId وليس ticketId في محادثة Tejo.
8. عند الرجوع للمحادثة، يتم جلب رسائل TejoSession وليس تذكرة الدعم.
9. لا يتم استخدام /support/tickets/:id/messages إلا إذا session.status = escalated.
10. تعديل لوحة التحكم بحيث تعرض محادثات Tejo منفصلة عن تذاكر الدعم البشرية.

حافظ على التوافق مع النظام الحالي قدر الإمكان، ولا تكسر تذاكر الدعم القديمة.
```

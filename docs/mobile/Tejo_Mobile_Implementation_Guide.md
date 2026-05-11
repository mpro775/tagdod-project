# دليل تطوير ميزة تيجو (Tejo) لتطبيق الموبايل (Flutter)

> **الهدف:** تحويل صفحة `TajaChatPage` الحالية (التي تعمل بـ mock/محاكاة محلية) إلى ميزة تيجو كاملة متصلة بالباك اند، تدعم الردود الذكية، بطاقات المنتجات، أزرار الاقتراحات، والتحويل للدعم البشري.

---

## جدول المحتويات

1. [الوضع الحالي](#1-الوضع-الحالي)
2. [الهدف النهائي](#2-الهدف-النهائي)
3. [الـ API المتاح في الباك اند](#3-ال-api-المتاح-في-الباك-اند)
4. [نموذج البيانات](#4-نموذج-البيانات)
5. [هيكلة الملفات المطلوبة](#5-هيكلة-الملفات-المطلوبة)
6. [الـ Data Layer](#6-ال-data-layer)
7. [الـ Domain Layer](#7-ال-domain-layer)
8. [الـ Presentation Layer](#8-ال-presentation-layer)
9. [حقن التبعيات (DI)](#9-حقن-التبعيات-di)
10. [الـ Routing](#10-ال-routing)
11. [تجربة المستخدم (UX Flow)](#11-تجربة-المستخدم-ux-flow)
12. [الترجمة (i18n)](#12-الترجمة-i18n)
13. [التعامل مع الحالات الخاصة](#13-التعامل-مع-الحالات-الخاصة)
14. [خطة التنفيذ بالمراحل](#14-خطة-التنفيذ-بالمراحل)
15. [ملاحظات مهمة](#15-ملاحظات-مهمة)

---

## 1) الوضع الحالي

### ما هو موجود الآن:

| العنصر | الحالة | الملف |
|--------|--------|-------|
| صفحة تيجو (`TajaChatPage`) | Mock محلي بالكامل - بدون اتصال بالباك اند | `features/chat/presentation/pages/taja_chat_page.dart` |
| كيان `ChatMessage` | مبسط جداً (`text`, `isFromUser`, `timestamp`) | `features/chat/domain/entities/chat_message.dart` |
| `MessageBubble` | يعمل مع `ChatMessage` فقط | `features/chat/presentation/widgets/message_bubble.dart` |
| `MessageInput` | يعمل بشكل جيد | `features/chat/presentation/widgets/message_input.dart` |
| WebSocket للدعم | يعمل عبر `SupportWebSocketService` (Socket.IO) | `features/chat/data/services/support_websocket_service.dart` |
| `SupportChatCubit` | يدير تذاكر الدعم + الرسائل + WebSocket | `features/chat/presentation/cubit/support_chat_cubit.dart` |
| أيقونة تيجو | `AppAssets.chatBotIcon` / `AppAssets.chatBotDarkIcon` | `assets/icons/support/` |

### ما الذي ينقص:

1. **لا يوجد اتصال بـ `POST /tejo/query`** - كل شيء محلي
2. **لا يوجد cubit مخصص لتيجو** - `TajaChatPage` لا يستخدم أي state management
3. **لا يوجد models للاستجابة المنظمة** (cards, suggestions, actions)
4. **لا يوجد widgets لعرض المنتجات/الاقتراحات/الأزرار**
5. **لا يوجد مؤشر كتابة AI** (typing indicator)
6. **لا يوجد handoff للدعم البشري** داخل نفس المحادثة

---

## 2) الهدف النهائي

تيجو يعمل كمساعد ذكي حقيقي داخل التطبيق:

```
المستخدم ←→ TajaChatPage ←→ TejoCubit ←→ POST /tejo/query
                                      ↕
                              عرض: نص + بطاقات منتجات + اقتراحات + أزرار
                                      ↕
                              التحويل للدعم البشري (نفس ticket)
```

### تجربة المستخدم المستهدفة:

1. المستخدم يفتح شات تيجو من قائمة الدعم أو من الشاشة الرئيسية
2. تظهر رسالة ترحيب تلقائية
3. المستخدم يكتب رسالة → يظهر مؤشر "تيجو يكتب..."
4. يظهر رد تيجو يحتوي:
   - نص الرسالة
   - **بطاقات منتجات** قابلة للنقر (تفتح صفحة المنتج)
   - **أزرار اقتراحات** (suggestion chips) قابلة للنقر
   - **أزرار إجراءات** (actions) مثل اتصال/واتساب
5. إذا تقرر التحويل للبشري → يظهر زر "متابعة مع الدعم" يفتح `ChatDetailPage` بنفس التذكرة

---

## 3) الـ API المتاح في الباك اند

### 3.1 Endpoint الوحيد المطلوب للموبايل

```
POST /api/v1/tejo/query
```

**المصدر:** `backend/src/modules/tejo/tejo.controller.ts`

**الـ Auth:** يتطلب JWT Token (Bearer)

**الـ Request Body:**

```json
{
  "message": "أبغى لمبة LED 12 واط",
  "channel": "mobile",
  "ticketId": "665abc...",        // اختياري - null يعني محادثة جديدة
  "locale": "ar",                // اختياري - افتراضي "ar"
  "context": {                   // اختياري
    "productId": "p_123",
    "page": "home"
  }
}
```

**الـ Response:**

```json
{
  "reply": "لقيت لك أفضل الخيارات:",
  "cards": [
    {
      "id": "665abc...",
      "title": "لمبة LED 12W",
      "slug": "led-bulb-12w",
      "price": 2500,
      "currency": "YER",
      "image": "https://cdn.bunny.net/...",
      "shortDesc": "إضاءة قوية مناسبة للمنازل"
    }
  ],
  "suggestions": ["أرخص", "أقوى إضاءة", "للخارج"],
  "actions": [
    { "title": "اتصل الآن", "type": "tel", "value": "tel:+9677xxxxxxx" },
    { "title": "واتساب", "type": "url", "value": "https://wa.me/9677xxxxxxx" }
  ],
  "confidence": 0.85,
  "handoffSuggested": false,
  "ticketId": "665def...",
  "messageId": "665ghi...",
  "latencyMs": 1200
}
```

### 3.2 شرح حقول الاستجابة

| الحقل | النوع | الوصف |
|-------|-------|-------|
| `reply` | `string` | نص رد تيجو |
| `cards` | `TejoCard[]` | بطاقات المنتجات المقترحة |
| `suggestions` | `string[]` | أزرار اقتراحات سريعة (chips) |
| `actions` | `TejoAction[]` | أزرار إجراءات (اتصال/واتساب/خريطة) |
| `confidence` | `number` | مستوى ثقة الـ AI (0-1) |
| `handoffSuggested` | `boolean` | هل يُنصح بالتحويل لبشري؟ |
| `ticketId` | `string` | معرف التذكرة (أنشئت أو موجودة) |
| `messageId` | `string` | معرف رسالة AI المحفوظة |
| `latencyMs` | `number` | زمن الاستجابة بالملي ثانية |

### 3.3 هيكل `TejoCard`

```json
{
  "id": "665abc...",
  "title": "لمبة LED 12W",
  "slug": "led-bulb-12w",
  "price": 2500,
  "currency": "YER",
  "image": "https://cdn.bunny.net/...",
  "shortDesc": "إضاءة قوية مناسبة للمنازل"
}
```

### 3.4 هيكل `TejoAction`

```json
{
  "title": "اتصل الآن",
  "type": "tel",
  "value": "tel:+9677xxxxxxx"
}
```

**أنواع `type` المحتملة:**
- `"tel"` → اتصال هاتفي
- `"url"` → فتح رابط (واتساب، خريطة، إلخ)
- `"deeplink"` → التنقل داخل التطبيق

### 3.5 Error Responses

| HTTP Status | المعنى |
|-------------|--------|
| `403` | تيجو معطل (`Tejo is disabled`) أو الموبايل غير مفعل |
| `401` | انتهت صلاحية الـ JWT |
| `429` | تجاوز limit الطلبات |
| `500` | خطأ في الخادم |

---

## 4) نموذج البيانات

### 4.1 الكيانات الجديدة المطلوبة (Domain Layer)

#### `TejoCard` — بطاقة منتج

```dart
class TejoCard extends Equatable {
  final String id;
  final String title;
  final String? slug;
  final double? price;
  final String? currency;
  final String? image;
  final String? shortDesc;

  const TejoCard({
    required this.id,
    required this.title,
    this.slug,
    this.price,
    this.currency,
    this.image,
    this.shortDesc,
  });

  @override
  List<Object?> get props => [id, title, slug, price, currency, image, shortDesc];
}
```

#### `TejoAction` — زر إجراء

```dart
enum TejoActionType { tel, url, deeplink }

class TejoAction extends Equatable {
  final String title;
  final TejoActionType type;
  final String value;

  const TejoAction({
    required this.title,
    required this.type,
    required this.value,
  });

  @override
  List<Object?> get props => [title, type, value];
}
```

#### `TejoMessage` — رسالة تيجو (تمثل رسالة واحدة في المحادثة)

```dart
enum TejoMessageSource { user, ai, system }

class TejoMessage extends Equatable {
  final String id;
  final TejoMessageSource source;
  final String text;
  final List<TejoCard> cards;
  final List<String> suggestions;
  final List<TejoAction> actions;
  final double? confidence;
  final bool handoffSuggested;
  final DateTime timestamp;

  const TejoMessage({
    required this.id,
    required this.source,
    required this.text,
    this.cards = const [],
    this.suggestions = const [],
    this.actions = const [],
    this.confidence,
    this.handoffSuggested = false,
    required this.timestamp,
  });

  bool get isUser => source == TejoMessageSource.user;
  bool get isAi => source == TejoMessageSource.ai;
  bool get hasCards => cards.isNotEmpty;
  bool get hasSuggestions => suggestions.isNotEmpty;
  bool get hasActions => actions.isNotEmpty;

  @override
  List<Object?> get props => [id, source, text, cards, suggestions, actions, confidence, handoffSuggested, timestamp];
}
```

#### `TejoQueryResponse` — استجابة الباك اند الكاملة

```dart
class TejoQueryResponse extends Equatable {
  final String reply;
  final List<TejoCard> cards;
  final List<String> suggestions;
  final List<TejoAction> actions;
  final double confidence;
  final bool handoffSuggested;
  final String ticketId;
  final String messageId;
  final int latencyMs;

  const TejoQueryResponse({
    required this.reply,
    required this.cards,
    required this.suggestions,
    required this.actions,
    required this.confidence,
    required this.handoffSuggested,
    required this.ticketId,
    required this.messageId,
    required this.latencyMs,
  });

  @override
  List<Object?> get props => [reply, cards, suggestions, actions, confidence, handoffSuggested, ticketId, messageId, latencyMs];
}
```

### 4.2 الـ Models الجديدة (Data Layer)

#### `TejoQueryResponseModel` — تحويل JSON إلى كيان

```dart
class TejoQueryResponseModel extends TejoQueryResponse {
  TejoQueryResponseModel.fromJson(Map<String, dynamic> json)
      : super(
          reply: json['reply'] as String? ?? '',
          cards: (json['cards'] as List<dynamic>?)
                  ?.map((e) => TejoCardModel.fromJson(e as Map<String, dynamic>))
                  .toList() ??
              [],
          suggestions: (json['suggestions'] as List<dynamic>?)
                  ?.map((e) => e.toString())
                  .toList() ??
              [],
          actions: (json['actions'] as List<dynamic>?)
                  ?.map((e) => TejoActionModel.fromJson(e as Map<String, dynamic>))
                  .toList() ??
              [],
          confidence: (json['confidence'] as num?)?.toDouble() ?? 0.0,
          handoffSuggested: json['handoffSuggested'] as bool? ?? false,
          ticketId: json['ticketId'] as String? ?? '',
          messageId: json['messageId'] as String? ?? '',
          latencyMs: json['latencyMs'] as int? ?? 0,
        );
}
```

#### `TejoCardModel`

```dart
class TejoCardModel extends TejoCard {
  TejoCardModel.fromJson(Map<String, dynamic> json)
      : super(
          id: json['id'] as String? ?? '',
          title: json['title'] as String? ?? '',
          slug: json['slug'] as String?,
          price: (json['price'] as num?)?.toDouble(),
          currency: json['currency'] as String?,
          image: json['image'] as String?,
          shortDesc: json['shortDesc'] as String?,
        );
}
```

#### `TejoActionModel`

```dart
class TejoActionModel extends TejoAction {
  TejoActionModel.fromJson(Map<String, dynamic> json)
      : super(
          title: json['title'] as String? ?? '',
          type: _parseType(json['type'] as String?),
          value: json['value'] as String? ?? '',
        );

  static TejoActionType _parseType(String? type) {
    switch (type) {
      case 'tel':
        return TejoActionType.tel;
      case 'deeplink':
        return TejoActionType.deeplink;
      case 'url':
      default:
        return TejoActionType.url;
    }
  }
}
```

---

## 5) هيكلة الملفات المطلوبة

```
lib/features/chat/
├── data/
│   ├── datasources/
│   │   ├── support_remote_datasource.dart        # موجود - لا تغيير
│   │   └── tejo_remote_datasource.dart           # ✨ جديد
│   ├── models/
│   │   ├── support_ticket_model.dart             # موجود - لا تغيير
│   │   ├── support_message_model.dart            # موجود - لا تغيير
│   │   ├── paginated_support_tickets_model.dart  # موجود - لا تغيير
│   │   ├── paginated_support_messages_model.dart  # موجود - لا تغيير
│   │   ├── tejo_query_response_model.dart        # ✨ جديد
│   │   ├── tejo_card_model.dart                  # ✨ جديد
│   │   └── tejo_action_model.dart                # ✨ جديد
│   ├── services/
│   │   └── support_websocket_service.dart        # موجود - لا تغيير
│   └── repositories/
│       ├── support_repository_impl.dart          # موجود - لا تغيير
│       └── tejo_repository_impl.dart             # ✨ جديد
├── domain/
│   ├── entities/
│   │   ├── support_enums.dart                    # موجود - لا تغيير
│   │   ├── support_common_entities.dart          # موجود - لا تغيير
│   │   ├── support_ticket.dart                   # موجود - لا تغيير
│   │   ├── support_message.dart                  # موجود - لا تغيير
│   │   ├── chat_message.dart                     # موجود - يمكن الاحتفاظ به
│   │   ├── tejo_message.dart                     # ✨ جديد
│   │   ├── tejo_card.dart                        # ✨ جديد
│   │   ├── tejo_action.dart                      # ✨ جديد
│   │   └── tejo_query_response.dart              # ✨ جديد
│   ├── repositories/
│   │   ├── support_repository.dart               # موجود - لا تغيير
│   │   └── tejo_repository.dart                  # ✨ جديد
│   └── usecases/
│       ├── create_ticket.dart                    # موجود - لا تغيير
│       ├── add_message.dart                      # موجود - لا تغيير
│       ├── get_support_tickets.dart              # موجود - لا تغيير
│       ├── get_support_ticket.dart               # موجود - لا تغيير
│       ├── get_ticket_messages.dart              # موجود - لا تغيير
│       └── tejo_query.dart                       # ✨ جديد
└── presentation/
    ├── cubit/
    │   ├── support_chat_cubit.dart               # موجود - لا تغيير
    │   └── tejo_chat_cubit.dart                  # ✨ جديد
    ├── helpers/
    │   └── support_chat_socket_binder.dart       # موجود - لا تغيير
    ├── pages/
    │   ├── chat_page.dart                        # موجود - تعديل بسيط
    │   ├── chat_detail_page.dart                 # موجود - لا تغيير
    │   ├── chat_detail_page_sections.dart        # موجود - لا تغيير
    │   └── taja_chat_page.dart                   # موجود - إعادة كتابة كاملة
    └── widgets/
        ├── message_bubble.dart                   # موجود - تعديل لدعم TejoMessage
        ├── message_input.dart                    # موجود - لا تغيير
        ├── tejo_card_widget.dart                 # ✨ جديد
        ├── tejo_suggestions_chips.dart           # ✨ جديد
        ├── tejo_action_buttons.dart              # ✨ جديد
        ├── tejo_typing_indicator.dart            # ✨ جديد
        └── tejo_handoff_banner.dart              # ✨ جديد
```

---

## 6) الـ Data Layer

### 6.1 `tejo_remote_datasource.dart`

```dart
class TejoRemoteDataSource {
  final ApiClient _apiClient;

  TejoRemoteDataSource(this._apiClient);

  Future<Map<String, dynamic>> query({
    required String message,
    String? ticketId,
    String channel = 'mobile',
    String locale = 'ar',
    Map<String, dynamic>? context,
  }) async {
    final body = <String, dynamic>{
      'message': message,
      'channel': channel,
      'locale': locale,
    };

    if (ticketId != null) body['ticketId'] = ticketId;
    if (context != null) body['context'] = context;

    final response = await _apiClient.post('/tejo/query', data: body);
    return response.data as Map<String, dynamic>;
  }
}
```

### 6.2 `tejo_repository_impl.dart`

```dart
class TejoRepositoryImpl implements TejoRepository {
  final TejoRemoteDataSource _dataSource;

  TejoRepositoryImpl(this._dataSource);

  @override
  Future<TejoQueryResponse> query({
    required String message,
    String? ticketId,
    String locale = 'ar',
    Map<String, dynamic>? context,
  }) async {
    final json = await _dataSource.query(
      message: message,
      ticketId: ticketId,
      locale: locale,
      context: context,
    );
    return TejoQueryResponseModel.fromJson(json);
  }
}
```

---

## 7) الـ Domain Layer

### 7.1 `tejo_repository.dart` (Interface)

```dart
abstract class TejoRepository {
  Future<TejoQueryResponse> query({
    required String message,
    String? ticketId,
    String locale = 'ar',
    Map<String, dynamic>? context,
  });
}
```

### 7.2 `tejo_query.dart` (UseCase)

```dart
class TejoQuery {
  final TejoRepository _repository;

  TejoQuery(this._repository);

  Future<Either<Failure, TejoQueryResponse>> call({
    required String message,
    String? ticketId,
    String locale = 'ar',
    Map<String, dynamic>? context,
  }) async {
    return executeEither(() => _repository.query(
          message: message,
          ticketId: ticketId,
          locale: locale,
          context: context,
        ));
  }
}
```

> **ملاحظة:** استخدم نفس نمط `executeEither` الموجود في `BaseCubit` أو اتبع نفس نمط الـ UseCases الموجودة مثل `CreateTicket`.

---

## 8) الـ Presentation Layer

### 8.1 `tejo_chat_cubit.dart`

**هذا هو العنصر الأهم - الـ Cubit الذي يدير كل حالة تيجو.**

```dart
part 'tejo_chat_state.dart';

class TejoChatCubit extends BaseCubit<TejoChatState> {
  final TejoQuery _tejoQuery;
  final SoundService _soundService;

  TejoChatCubit(
    this._tejoQuery,
    ExceptionHandler exceptionHandler,
    ErrorDisplayService errorDisplayService,
    ErrorLogger errorLogger,
    this._soundService,
  ) : super(
          exceptionHandler: exceptionHandler,
          errorDisplayService: errorDisplayService,
          errorLogger: errorLogger,
        );

  String? _ticketId;
  final List<TejoMessage> _messages = [];

  List<TejoMessage> get messages => List.unmodifiable(_messages);
  String? get ticketId => _ticketId;
  bool get hasTicket => _ticketId != null;

  void addWelcomeMessage(String welcomeText) {
    _messages.insert(0, TejoMessage(
      id: 'welcome',
      source: TejoMessageSource.ai,
      text: welcomeText,
      timestamp: DateTime.now(),
    ));
    emit(TejoChatLoaded(List.from(_messages)));
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    // 1. إضافة رسالة المستخدم فوراً
    final userMessage = TejoMessage(
      id: 'user_${DateTime.now().millisecondsSinceEpoch}',
      source: TejoMessageSource.user,
      text: text.trim(),
      timestamp: DateTime.now(),
    );
    _messages.add(userMessage);
    emit(TejoChatLoaded(List.from(_messages), isTyping: true));

    // 2. إرسال للباك اند
    final result = await _tejoQuery(
      message: text.trim(),
      ticketId: _ticketId,
      locale: Localizations.localeOf(context).languageCode, // أو من خدمة اللغة
    );

    result.fold(
      (failure) {
        // إزالة مؤشر الكتابة وإظهار الخطأ
        emit(TejoChatError(failure.message, List.from(_messages)));
      },
      (response) {
        // حفظ ticketId للمحادثة المستمرة
        _ticketId = response.ticketId;

        // 3. إضافة رد AI
        final aiMessage = TejoMessage(
          id: response.messageId,
          source: TejoMessageSource.ai,
          text: response.reply,
          cards: response.cards,
          suggestions: response.suggestions,
          actions: response.actions,
          confidence: response.confidence,
          handoffSuggested: response.handoffSuggested,
          timestamp: DateTime.now(),
        );
        _messages.add(aiMessage);

        // 4. تشغيل صوت استقبال الرسالة
        _soundService.playReceiveMessageSound();

        emit(TejoChatLoaded(
          List.from(_messages),
          handoffSuggested: response.handoffSuggested,
        ));
      },
    );
  }

  void onSuggestionTap(String suggestion) {
    sendMessage(suggestion);
  }

  void onActionTap(TejoAction action) {
    // يتم التعامل معها في الـ UI عبر ExternalLinkService
    emit(TejoActionTriggered(action, List.from(_messages)));
  }
}
```

### 8.2 `tejo_chat_state.dart`

```dart
part of 'tejo_chat_cubit.dart';

abstract class TejoChatState extends Equatable {
  final List<TejoMessage> messages;

  const TejoChatState(this.messages);

  @override
  List<Object?> get props => [messages];
}

class TejoChatInitial extends TejoChatState {
  TejoChatInitial() : super(const []);
}

class TejoChatLoaded extends TejoChatState {
  final bool isTyping;
  final bool handoffSuggested;

  const TejoChatLoaded(List<TejoMessage> messages, {
    this.isTyping = false,
    this.handoffSuggested = false,
  }) : super(messages);

  @override
  List<Object?> get props => [messages, isTyping, handoffSuggested];
}

class TejoChatError extends TejoChatState {
  final String errorMessage;

  const TejoChatError(this.errorMessage, List<TejoMessage> messages)
      : super(messages);

  @override
  List<Object?> get props => [errorMessage, messages];
}

class TejoActionTriggered extends TejoChatState {
  final TejoAction action;

  const TejoActionTriggered(this.action, List<TejoMessage> messages)
      : super(messages);

  @override
  List<Object?> get props => [action, messages];
}
```

### 8.3 إعادة كتابة `taja_chat_page.dart`

**الصفحة تُعاد كتابتها بالكامل لاستخدام `TejoChatCubit`:**

```dart
class TajaChatPage extends StatelessWidget {
  // يتم حقن TejoChatCubitFactory من الـ routing
  // ...

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => tejoChatCubit..addWelcomeMessage(l10n.welcomeMessageAI),
      child: BlocConsumer<TejoChatCubit, TejoChatState>(
        listener: (context, state) {
          // التعامل مع ActionTriggered
          // التعامل مع Error
        },
        builder: (context, state) {
          return Scaffold(
            appBar: CustomAppBar(
              title: l10n.tajaAssistant,
              onBackPressed: () => context.pop(),
            ),
            body: Column(
              children: [
                // Messages list
                Expanded(
                  child: state.maybeWhen(
                    loaded: (messages, isTyping, handoff) =>
                        _buildMessagesList(messages, isTyping, handoff),
                    error: (err, messages) =>
                        _buildMessagesList(messages, false, false),
                    orElse: () => const Center(child: CircularProgressIndicator()),
                  ),
                ),

                // Handoff banner
                if (handoffSuggested)
                  TejoHandoffBanner(
                    onTap: () => _navigateToSupportChat(context),
                  ),

                // Input
                MessageInput(
                  messageController: _messageController,
                  onSendMessage: cubit.sendMessage,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMessagesList(List<TejoMessage> messages, bool isTyping, bool handoff) {
    return ListView.builder(
      reverse: false, // أحدث رسالة في الأسفل
      controller: _scrollController,
      itemCount: messages.length + (isTyping ? 1 : 0),
      itemBuilder: (context, index) {
        if (isTyping && index == messages.length) {
          return const TejoTypingIndicator();
        }

        final message = messages[index];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // الرسالة النصية
            MessageBubble(
              message: ChatMessage(
                text: message.text,
                isFromUser: message.isUser,
                timestamp: message.timestamp,
              ),
              chatIcon: AppAssets.chatBotIcon,
              isBot: message.isAi,
            ),

            // بطاقات المنتجات
            if (message.hasCards)
              TejoCardsCarousel(cards: message.cards),

            // أزرار الإجراءات
            if (message.hasActions)
              TejoActionButtons(
                actions: message.actions,
                onActionTap: (action) => cubit.onActionTap(action),
              ),

            // أزرار الاقتراحات
            if (message.hasSuggestions)
              TejoSuggestionsChips(
                suggestions: message.suggestions,
                onSuggestionTap: (s) => cubit.onSuggestionTap(s),
              ),

            SizedBox(height: 8.h),
          ],
        );
      },
    );
  }
}
```

### 8.4 الـ Widgets الجديدة

#### `tejo_card_widget.dart` — بطاقة منتج

```dart
class TejoCardWidget extends StatelessWidget {
  final TejoCard card;

  const TejoCardWidget({super.key, required this.card});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // التنقل لصفحة المنتج
        if (card.slug != null) {
          context.push('${AppRoutes.productDetailsPrefix}${card.slug}');
        } else {
          context.push('${AppRoutes.productDetailsPrefix}${card.id}');
        }
      },
      child: Container(
        width: 160.w,
        margin: EdgeInsets.symmetric(horizontal: 4.w),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // صورة المنتج
            if (card.image != null)
              ClipRRect(
                borderRadius: BorderRadius.vertical(top: Radius.circular(12.r)),
                child: CachedNetworkImage(
                  imageUrl: card.image!,
                  width: double.infinity,
                  height: 100.h,
                  fit: BoxFit.cover,
                  errorWidget: (_, __, ___) => Container(
                    height: 100.h,
                    color: Colors.grey[200],
                    child: const Icon(Icons.image_not_supported),
                  ),
                ),
              ),

            // معلومات المنتج
            Padding(
              padding: EdgeInsets.all(8.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    card.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  if (card.shortDesc != null) ...[
                    SizedBox(height: 2.h),
                    Text(
                      card.shortDesc!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                    ),
                  ],
                  if (card.price != null) ...[
                    SizedBox(height: 4.h),
                    Text(
                      '${card.price!.toStringAsFixed(0)} ${card.currency ?? 'YER'}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// كاروسيل لعرض عدة بطاقات أفقياً
class TejoCardsCarousel extends StatelessWidget {
  final List<TejoCard> cards;

  const TejoCardsCarousel({super.key, required this.cards});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 180.h,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        itemCount: cards.length,
        separatorBuilder: (_, __) => SizedBox(width: 8.w),
        itemBuilder: (context, index) =>
            TejoCardWidget(card: cards[index]),
      ),
    );
  }
}
```

#### `tejo_suggestions_chips.dart` — أزرار الاقتراحات

```dart
class TejoSuggestionsChips extends StatelessWidget {
  final List<String> suggestions;
  final ValueChanged<String> onSuggestionTap;

  const TejoSuggestionsChips({
    super.key,
    required this.suggestions,
    required this.onSuggestionTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 4.h),
      child: Wrap(
        spacing: 8.w,
        runSpacing: 4.h,
        children: suggestions.map((suggestion) {
          return ActionChip(
            label: Text(suggestion),
            onPressed: () => onSuggestionTap(suggestion),
          );
        }).toList(),
      ),
    );
  }
}
```

#### `tejo_action_buttons.dart` — أزرار الإجراءات

```dart
class TejoActionButtons extends StatelessWidget {
  final List<TejoAction> actions;
  final ValueChanged<TejoAction> onActionTap;

  const TejoActionButtons({
    super.key,
    required this.actions,
    required this.onActionTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 4.h),
      child: Wrap(
        spacing: 8.w,
        runSpacing: 4.h,
        children: actions.map((action) {
          return ElevatedButton.icon(
            onPressed: () => onActionTap(action),
            icon: Icon(_getIcon(action.type), size: 16),
            label: Text(action.title),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
              textStyle: Theme.of(context).textTheme.bodySmall,
            ),
          );
        }).toList(),
      ),
    );
  }

  IconData _getIcon(TejoActionType type) {
    switch (type) {
      case TejoActionType.tel:
        return Icons.phone;
      case TejoActionType.url:
        return Icons.open_in_new;
      case TejoActionType.deeplink:
        return Icons.arrow_forward;
    }
  }
}
```

#### `tejo_typing_indicator.dart` — مؤشر كتابة AI

```dart
class TejoTypingIndicator extends StatelessWidget {
  const TejoTypingIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
      child: Row(
        children: [
          // أيقونة تيجو
          CircleAvatar(
            radius: 16.r,
            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
            child: SvgPicture.asset(
              AppAssets.chatBotIcon,
              width: 20.w,
              height: 20.w,
            ),
          ),
          SizedBox(width: 8.w),
          // ثلاث نقاط متحركة
          Container(
            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(16.r),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(3, (index) {
                return Padding(
                  padding: EdgeInsets.symmetric(horizontal: 2.w),
                  child: AnimatedBuilder(
                    // استخدم أي حركة نقاط متحركة تناسب التصميم
                    // مثال: FadeTransition أو Lottie
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}
```

#### `tejo_handoff_banner.dart` — بانر التحويل للدعم البشري

```dart
class TejoHandoffBanner extends StatelessWidget {
  final VoidCallback onTap;

  const TejoHandoffBanner({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Row(
        children: [
          Icon(Icons.support_agent, color: Theme.of(context).colorScheme.primary),
          SizedBox(width: 8.w),
          Expanded(
            child: Text(
              l10n.tejoHandoffMessage, // تحتاج إضافة هذا للترجمة
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
          TextButton(
            onPressed: onTap,
            child: Text(l10n.tejoHandoffButton), // تحتاج إضافة هذا للترجمة
          ),
        ],
      ),
    );
  }
}
```

---

## 9) حقن التبعيات (DI)

### تحديث `core/di/modules/support_chat_module.dart`

أضف التسجيلات التالية في نهاية الموديول:

```dart
// في دالة register() داخل SupportChatModule:

// Tejo dependencies
getIt.registerLazySingleton<TejoRemoteDataSource>(
  () => TejoRemoteDataSource(getIt<ApiClient>()),
);

getIt.registerLazySingleton<TejoRepository>(
  () => TejoRepositoryImpl(getIt<TejoRemoteDataSource>()),
);

getIt.registerLazySingleton<TejoQuery>(
  () => TejoQuery(getIt<TejoRepository>()),
);

// TejoChatCubit كـ Factory (نسخة جديدة كل مرة)
getIt.registerFactoryParam<TejoChatCubit, void, void>(
  (__, ___) => TejoChatCubit(
    getIt<TejoQuery>(),
    getIt<ExceptionHandler>(),
    getIt<ErrorDisplayService>(),
    getIt<ErrorLogger>(),
    getIt<SoundService>(),
  ),
);
```

> **أو بإنشاء ملف منفصل:** `core/di/modules/tejo_module.dart` بنفس النمط ثم تسجيله في `injection.dart`.

---

## 10) الـ Routing

### تحديث `core/routing/routes/notifications_support_routes.dart`

```dart
// إضافة TejoChatCubitFactory typedef
typedef TejoChatCubitFactory = TejoChatCubit Function();

GoRoute(
  path: AppRoutes.tajaChat,
  pageBuilder: (context, state) => buildNoTransitionPage(
    state: state,
    child: TajaChatPage(
      tejoChatCubitFactory: dependencies.factories.tejoChatCubitFactory,
      soundService: dependencies.services.soundService,
      externalLinkService: dependencies.services.externalLinkService,
    ),
  ),
),
```

### تحديث `core/routing/app_router_dependencies.dart`

أضف `TejoChatCubitFactory` إلى `FactoryContainer`.

### تحديث `chat_page.dart` (التنقل لتيجو)

**الموقع:** في الدالة `_navigateToChatDetail` أو عند الضغط على تذكرة:

```dart
// الحالي: يقارن عنوان التذكرة بـ l10n.tajaAssistant
// إذا تطابق → يفتح TajaChatPage

// المطلوب: نفس المنطق لكن يمرر ticketId إن وُجد
if (ticket.title == l10n.tajaAssistant) {
  context.push(AppRoutes.tajaChat);
  return;
}
```

> **ملاحظة:** حالياً عندما ينشئ المستخدم محادثة "تيجو" من `ChatPage`، يتم إنشاء ticket عادي. المستقبل يمكن أن يكون لتيجو تدفق منفصل بدون المرور بـ ChatPage. هذا قرار تصميمي يمكنك مناقشته.

---

## 11) تجربة المستخدم (UX Flow)

### Flow 1: فتح تيجو لأول مرة

```
المستخدم يضغط على "تيجو"
    ↓
TajaChatPage تفتح
    ↓
يظهر welcome message تلقائي (محلي - بدون API call)
    ↓
المستخدم يكتب رسالة
    ↓
يظهر typing indicator
    ↓
POST /tejo/query { message: "...", channel: "mobile", locale: "ar" }
    ↓
يظهر رد AI مع cards + suggestions + actions
    ↓
يحفظ ticketId في الـ cubit للمحادثة المستمرة
```

### Flow 2: إرسال رسالة ثانية في نفس المحادثة

```
المستخدم يكتب رسالة
    ↓
POST /tejo/query { message: "...", ticketId: "xxx", channel: "mobile" }
    ↓
يظهر رد AI (نفس ticket - سياق مستمر)
```

### Flow 3: تيجو يقترح تحويل لبشري

```
handoffSuggested = true
    ↓
يظهر HandoffBanner: "يبدو إنك تحتاج مساعدة من فريق الدعم"
    ↓
المستخدم يضغط "تواصل مع الدعم"
    ↓
الانتقال لـ ChatDetailPage بنفس ticketId
    ↓
الدعم البشري يكمل في نفس التذكرة
```

### Flow 4: النقر على بطاقة منتج

```
المستخدم يضغط على TejoCard
    ↓
الانتقال لـ ProductDetailsPage عبر slug أو id
    ↓
يمكن العودة لتيجو والمحادثة مستمرة
```

### Flow 5: النقر على زر اقتراح

```
المستخدم يضغط على chip "أرخص"
    ↓
نص الاقتراح يرسل كرسالة تلقائية
    ↓
POST /tejo/query { message: "أرخص", ticketId: "xxx" }
    ↓
يظهر رد AI جديد
```

---

## 12) الترجمة (i18n)

### النصوص الجديدة المطلوبة في `app_localizations_ar.dart`

```dart
// رسائل تيجو
String get tejoTyping => 'تيجو يكتب...';
String get tejoHandoffMessage => 'يبدو أنك تحتاج مساعدة من فريق الدعم البشري';
String get tejoHandoffButton => 'تواصل مع الدعم';
String get tejoErrorMessage => 'حدث خطأ، حاول مرة أخرى';
String get tejoRetry => 'إعادة المحاولة';
String get tejoNewChat => 'محادثة جديدة';
```

### النصوص الموجودة (لا تغيير)

```dart
String get tajaAssistant => 'المساعد تيجو';
String get welcomeMessageAI => 'أهلاً بك مع تيجو! 🤖\n\nأنا مساعدك الذكي...';
```

> **تذكر:** أضف الترجمات الإنجليزية المقابلة في `app_localizations_en.dart`.

---

## 13) التعامل مع الحالات الخاصة

### 13.1 تيجو معطل (403 Forbidden)

```dart
// في cubit أو في error handling:
// إذا كان الخطأ 403 مع رسالة "Tejo is disabled"
// اعرض رسالة: "المساعد غير متاح حالياً، تواصل مع الدعم"
// اعرض زر "تواصل مع الدعم" يفتح ChatPage
```

### 13.2 انقطاع الاتصال

```dart
// إذا فشل الطلب:
// 1. أزل مؤشر الكتابة
// 2. اعرض رسالة خطأ مؤقتة
// 3. احتفظ برسالة المستخدم في القائمة
// 4. اعرض زر "إعادة المحاولة"
```

### 13.3 استجابة بدون بطاقات أو اقتراحات

```dart
// cards = [] و suggestions = []
// اعرض فقط النص بدون أي widgets إضافية
// هذا طبيعي - ليس كل رد يحتوي على بطاقات
```

### 13.4 handoffSuggested = true

```dart
// 1. اعرض HandoffBanner في أسفل الشاشة
// 2. عند الضغط → انتقل لـ ChatDetailPage بنفس ticketId
// 3. مرر chatTitle = "الدعم البشري" أو اسم التذكرة
// 4. الدعم البشري يرى نفس المحادثة مع سياق تيجو
```

### 13.5 رسالة المستخدم الفارغة

```dart
// لا ترسل رسالة فارغة للباك اند
// تحقق من text.trim().isNotEmpty قبل الإرسال
// أزل أزرار الاقتراحات بعد النقر عليها (اختياري)
```

---

## 14) خطة التنفيذ بالمراحل

### المرحلة 1: الأساس (Data + Domain) — يوم واحد

- [ ] إنشاء `tejo_card.dart`, `tejo_action.dart`, `tejo_message.dart`, `tejo_query_response.dart`
- [ ] إنشاء `tejo_card_model.dart`, `tejo_action_model.dart`, `tejo_query_response_model.dart`
- [ ] إنشاء `tejo_repository.dart` (interface)
- [ ] إنشاء `tejo_remote_datasource.dart`
- [ ] إنشاء `tejo_repository_impl.dart`
- [ ] إنشاء `tejo_query.dart` (use case)
- [ ] تسجيل الكل في DI

**اختبار:** استدعاء `POST /tejo/query` من التطبيق والتحقق من الاستجابة في الـ logs.

### المرحلة 2: الـ Cubit — نصف يوم

- [ ] إنشاء `tejo_chat_cubit.dart` + `tejo_chat_state.dart`
- [ ] تسجيل الـ Cubit في DI كـ Factory
- [ ] ربط الـ cubit بـ TejoQuery use case

**اختبار:** إنشاء cubit يدوياً وإرسال رسالة، التحقق من تغير الحالة.

### المرحلة 3: الـ Widgets الجديدة — يوم واحد

- [ ] إنشاء `tejo_card_widget.dart` (بطاقة + كاروسيل)
- [ ] إنشاء `tejo_suggestions_chips.dart`
- [ ] إنشاء `tejo_action_buttons.dart`
- [ ] إنشاء `tejo_typing_indicator.dart`
- [ ] إنشاء `tejo_handoff_banner.dart`

**اختبار:** عرض كل widget بشكل منفصل مع بيانات mock.

### المرحلة 4: إعادة كتابة TajaChatPage — يوم واحد

- [ ] إعادة كتابة `taja_chat_page.dart` بالكامل
- [ ] ربطها بـ `TejoChatCubit`
- [ ] عرض الرسائل + البطاقات + الاقتراحات + الأزرار
- [ ] التعامل مع الحالات (loading, error, typing)
- [ ] التمرير التلقائي عند وصول رسالة جديدة

**اختبار:** تجربة كاملة مع الباك اند — إرسال رسالة واستقبال رد مع بطاقات.

### المرحلة 5: الـ Routing + الـ Handoff — نصف يوم

- [ ] تحديث `notifications_support_routes.dart`
- [ ] تحديث `app_router_dependencies.dart`
- [ ] ربط HandoffBanner بـ ChatDetailPage
- [ ] التعامل مع actions (tel, url, deeplink)

**اختبار:** التحويل للدعم البشري يعمل. الأزرار تفتح التطبيقات المناسبة.

### المرحلة 6: الترجمة + التنظيف — نصف يوم

- [ ] إضافة النصوص الجديدة لـ AR + EN
- [ ] حذف كود الـ mock القديم من `TajaChatPage`
- [ ] حذف النصوص القديمة غير المستخدمة (`tajaProductKeywords` وغيرها) **اختياري**
- [ ] اختبار RTL + LTR
- [ ] اختبار الوضع الداكن + الفاتح

---

## 15) ملاحظات مهمة

### 15.1 لا تستخدم WebSocket لتيجو (حالياً)

الباك اند يستخدم **REST فقط** لتيجو (`POST /tejo/query`). الـ WebSocket مخصص لنظام الدعم البشري. عندما يتم التحويل لبشري (handoff)، عندها يمكن لـ `ChatDetailPage` استخدام WebSocket الموجود.

### 15.2 احفظ `ticketId` في الـ Cubit

أول استجابة من `/tejo/query` ستحتوي على `ticketId`. احفظه في الـ cubit وأرسله مع كل طلب لاحق لضمان استمرارية السياق.

### 15.3 الـ `channel` دائماً `"mobile"`

عند استدعاء `/tejo/query`، مرر `channel: 'mobile'` دائماً.

### 15.4 لا تعدل ملفات الدعم الموجودة

كل ملفات `support_*` و `SupportChatCubit` يجب أن تبقى كما هي بدون تعديل. ميزة تيجو تعمل بشكل مستقل تماماً عن نظام الدعم، إلا عند التحويل (handoff).

### 15.5 التعامل مع الأسعار

الأسعار تأتي من الباك اند بـ `price` + `currency`. استخدم `CurrencyService` الموجود لتنسيق العرض حسب العملة المختارة من المستخدم.

### 15.6 التنقل لصفحة المنتج

عند النقر على بطاقة منتج:
- إذا وُجد `slug` → `context.push('${AppRoutes.productDetailsPrefix}${card.slug}')`
- إذا لم يوجد `slug` → `context.push('${AppRoutes.productDetailsPrefix}${card.id}')`

### 15.7 الأداء

- لا ترسل طلبات متزامنة. انتظر رد tijo قبل السماح بإرسال رسالة جديدة.
- استخدم `Equatable` لكل الكيانات لتجنب إعادة البناء غير الضرورية.
- استخدم `CachedNetworkImage` لصور المنتجات (موجود في pubspec.yaml).

### 15.8 الخادم يدعم CORS و SSL

الـ API متاح على `https://api.allawzi.net/api/v1/tejo/query`. لا حاجة لإعدادات إضافية.

---

## ملخص سريع: ماذا تحتاج تصنع؟

| # | المهمة | ملفات جديدة | ملفات معدلة |
|---|--------|-------------|-------------|
| 1 | كيانات تيجو | 4 ملفات domain | - |
| 2 | Models لتيجو | 3 ملفات data/models | - |
| 3 | DataSource + Repository | 2 ملفات data | - |
| 4 | UseCase | 1 ملف domain | - |
| 5 | Cubit + State | 2 ملف presentation/cubit | - |
| 6 | Widgets جديدة | 5 ملفات widgets | - |
| 7 | إعادة كتابة TajaChatPage | - | 1 ملف pages |
| 8 | DI Registration | - | 1 ملف di |
| 9 | Routing | - | 2 ملفات routing |
| 10 | i18n | - | 2 ملفات l10n |

**الإجمالي:** ~17 ملف جديد، ~6 ملفات معدلة

---

> **النسخة:** v1.0  
> **آخر تحديث:** مايو 2026  
> **الحالة:** Ready for Implementation

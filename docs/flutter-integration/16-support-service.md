# 🎧 خدمة الدعم (Support Service)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: أكتوبر 2025

خدمة الدعم توفر endpoints لإدارة تذاكر الدعم والرسائل.

---

## 📋 جدول المحتويات

1. [إنشاء تذكرة دعم](#1-إنشاء-تذكرة-دعم)
2. [تذاكري](#2-تذاكري)
3. [تفاصيل تذكرة](#3-تفاصيل-تذكرة)
4. [رسائل التذكرة](#4-رسائل-التذكرة)
5. [إضافة رسالة](#5-إضافة-رسالة)
6. [أرشفة تذكرة](#6-أرشفة-تذكرة)
7. [Models في Flutter](#models-في-flutter)

---

## 1. إنشاء تذكرة دعم

ينشئ تذكرة دعم جديدة.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/support/tickets`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "title": "مشكلة في لوحة الطاقة الشمسية",
  "description": "اللوحة لا تعمل بشكل صحيح منذ يومين",
  "category": "technical",
  "priority": "medium",
  "attachments": [
    "https://cdn.bunny.net/uploads/image1.jpg"
  ],
  "metadata": {
    "orderId": "12345",
    "productId": "67890"
  }
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "64ticket123",
    "userId": "64user123",
    "title": "مشكلة في لوحة الطاقة الشمسية",
    "description": "اللوحة لا تعمل بشكل صحيح منذ يومين",
    "category": "technical",
    "priority": "medium",
    "status": "open",
    "assignedTo": null,
    "attachments": [
      "https://cdn.bunny.net/uploads/image1.jpg"
    ],
    "tags": [],
    "isArchived": false,
    "firstResponseAt": null,
    "resolvedAt": null,
    "closedAt": null,
    "slaHours": 24,
    "slaDueDate": "2025-01-16T10:00:00.000Z",
    "slaBreached": false,
    "rating": null,
    "feedback": null,
    "feedbackAt": null,
    "metadata": {
      "orderId": "12345",
      "productId": "67890"
    },
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "requestId": "req_support_001"
}
```

### كود Flutter

```dart
Future<SupportTicket> createSupportTicket({
  required String title,
  required String description,
  SupportCategory? category,
  SupportPriority? priority,
  List<String>? attachments,
  Map<String, dynamic>? metadata,
}) async {
  final response = await _dio.post('/support/tickets', data: {
    'title': title,
    'description': description,
    if (category != null) 'category': category.value,
    if (priority != null) 'priority': priority.value,
    if (attachments != null) 'attachments': attachments,
    if (metadata != null) 'metadata': metadata,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return SupportTicket.fromJson(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. تذاكري

يسترجع قائمة تذاكر المستخدم.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/support/tickets/my`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `page` | `number` | ❌ | رقم الصفحة (افتراضي: 1) |
| `limit` | `number` | ❌ | عدد العناصر (افتراضي: 10) |

### Response - نجاح

```json
{
  "success": true,
  "tickets": [
    {
      "_id": "64ticket123",
      "userId": "64user123",
      "title": "مشكلة في لوحة الطاقة الشمسية",
      "description": "اللوحة لا تعمل بشكل صحيح منذ يومين",
      "category": "technical",
      "priority": "medium",
      "status": "open",
      "assignedTo": null,
      "attachments": [
        "https://cdn.bunny.net/uploads/image1.jpg"
      ],
      "tags": [],
      "isArchived": false,
      "firstResponseAt": null,
      "resolvedAt": null,
      "closedAt": null,
      "slaHours": 24,
      "slaDueDate": "2025-01-16T10:00:00.000Z",
      "slaBreached": false,
      "rating": null,
      "feedback": null,
      "feedbackAt": null,
      "metadata": {
        "orderId": "12345",
        "productId": "67890"
      },
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1,
  "requestId": "req_support_002"
}
```

### كود Flutter

```dart
Future<PaginatedSupportTickets> getMyTickets({
  int page = 1,
  int limit = 10,
}) async {
  final response = await _dio.get('/support/tickets/my', queryParameters: {
    'page': page,
    'limit': limit,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return PaginatedSupportTickets.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 3. تفاصيل تذكرة

يسترجع تفاصيل تذكرة محددة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/support/tickets/:id`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "64ticket123",
    "userId": "64user123",
    "title": "مشكلة في لوحة الطاقة الشمسية",
    "description": "اللوحة لا تعمل بشكل صحيح منذ يومين",
    "category": "technical",
    "priority": "medium",
    "status": "open",
    "assignedTo": null,
    "attachments": [
      "https://cdn.bunny.net/uploads/image1.jpg"
    ],
    "tags": [],
    "isArchived": false,
    "firstResponseAt": null,
    "resolvedAt": null,
    "closedAt": null,
    "slaHours": 24,
    "slaDueDate": "2025-01-16T10:00:00.000Z",
    "slaBreached": false,
    "rating": null,
    "feedback": null,
    "feedbackAt": null,
    "metadata": {
      "orderId": "12345",
      "productId": "67890"
    },
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "requestId": "req_support_003"
}
```

### كود Flutter

```dart
Future<SupportTicket> getSupportTicket(String ticketId) async {
  final response = await _dio.get('/support/tickets/$ticketId');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return SupportTicket.fromJson(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 4. رسائل التذكرة

يسترجع رسائل تذكرة محددة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/support/tickets/:id/messages`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `page` | `number` | ❌ | رقم الصفحة (افتراضي: 1) |
| `limit` | `number` | ❌ | عدد العناصر (افتراضي: 50) |

### Response - نجاح

```json
{
  "success": true,
  "messages": [
    {
      "_id": "64message123",
      "ticketId": "64ticket123",
      "senderId": "64user123",
      "messageType": "user_message",
      "content": "اللوحة لا تعمل بشكل صحيح منذ يومين",
      "attachments": [],
      "isInternal": false,
      "metadata": {},
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1,
  "requestId": "req_support_004"
}
```

### كود Flutter

```dart
Future<PaginatedSupportMessages> getTicketMessages(
  String ticketId, {
  int page = 1,
  int limit = 50,
}) async {
  final response = await _dio.get('/support/tickets/$ticketId/messages', queryParameters: {
    'page': page,
    'limit': limit,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return PaginatedSupportMessages.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 5. إضافة رسالة

يضيف رسالة جديدة للتذكرة.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/support/tickets/:id/messages`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "content": "شكراً لك على الإبلاغ عن المشكلة. سنعمل على حلها في أقرب وقت ممكن.",
  "attachments": [
    "https://cdn.bunny.net/uploads/solution.pdf"
  ],
  "isInternal": false,
  "metadata": {
    "action": "escalated"
  }
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "64message123",
    "ticketId": "64ticket123",
    "senderId": "64user123",
    "messageType": "user_message",
    "content": "شكراً لك على الإبلاغ عن المشكلة. سنعمل على حلها في أقرب وقت ممكن.",
    "attachments": [
      "https://cdn.bunny.net/uploads/solution.pdf"
    ],
    "isInternal": false,
    "metadata": {
      "action": "escalated"
    },
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "requestId": "req_support_005"
}
```

### كود Flutter

```dart
Future<SupportMessage> addMessage(
  String ticketId, {
  required String content,
  List<String>? attachments,
  bool isInternal = false,
  Map<String, dynamic>? metadata,
}) async {
  final response = await _dio.post('/support/tickets/$ticketId/messages', data: {
    'content': content,
    if (attachments != null) 'attachments': attachments,
    'isInternal': isInternal,
    if (metadata != null) 'metadata': metadata,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return SupportMessage.fromJson(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 6. أرشفة تذكرة

يؤرشف تذكرة دعم.

### معلومات الطلب

- **Method:** `PUT`
- **Endpoint:** `/support/tickets/:id/archive`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "message": "Ticket archived successfully",
  "requestId": "req_support_006"
}
```

### كود Flutter

```dart
Future<bool> archiveTicket(String ticketId) async {
  final response = await _dio.put('/support/tickets/$ticketId/archive');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  return apiResponse.isSuccess;
}
```

---

## Models في Flutter

### ملف: `lib/models/support/support_models.dart`

```dart
enum SupportCategory {
  technical,
  billing,
  products,
  services,
  account,
  other,
}

extension SupportCategoryExtension on SupportCategory {
  String get value => name;
  
  static SupportCategory fromString(String value) {
    return SupportCategory.values.firstWhere(
      (e) => e.name == value,
      orElse: () => SupportCategory.other,
    );
  }
}

enum SupportPriority {
  low,
  medium,
  high,
  urgent,
}

extension SupportPriorityExtension on SupportPriority {
  String get value => name;
  
  static SupportPriority fromString(String value) {
    return SupportPriority.values.firstWhere(
      (e) => e.name == value,
      orElse: () => SupportPriority.medium,
    );
  }
}

enum SupportStatus {
  open,
  in_progress,
  waiting_for_user,
  resolved,
  closed,
}

extension SupportStatusExtension on SupportStatus {
  String get value {
    switch (this) {
      case SupportStatus.open: return 'open';
      case SupportStatus.in_progress: return 'in_progress';
      case SupportStatus.waiting_for_user: return 'waiting_for_user';
      case SupportStatus.resolved: return 'resolved';
      case SupportStatus.closed: return 'closed';
    }
  }

  static SupportStatus fromString(String value) {
    return SupportStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => SupportStatus.open,
    );
  }
}

enum MessageType {
  user_message,
  admin_reply,
  system_message,
}

extension MessageTypeExtension on MessageType {
  String get value {
    switch (this) {
      case MessageType.user_message: return 'user_message';
      case MessageType.admin_reply: return 'admin_reply';
      case MessageType.system_message: return 'system_message';
    }
  }

  static MessageType fromString(String value) {
    return MessageType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => MessageType.user_message,
    );
  }
}

class SupportTicket {
  final String id;
  final String userId;
  final String title;
  final String description;
  final SupportCategory category;
  final SupportPriority priority;
  final SupportStatus status;
  final String? assignedTo;
  final List<String> attachments;
  final List<String> tags;
  final bool isArchived;
  final DateTime? firstResponseAt;
  final DateTime? resolvedAt;
  final DateTime? closedAt;
  final int slaHours;
  final DateTime? slaDueDate;
  final bool slaBreached;
  final int? rating;
  final String? feedback;
  final DateTime? feedbackAt;
  final Map<String, dynamic> metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  SupportTicket({
    required this.id,
    required this.userId,
    required this.title,
    required this.description,
    required this.category,
    required this.priority,
    required this.status,
    this.assignedTo,
    required this.attachments,
    required this.tags,
    required this.isArchived,
    this.firstResponseAt,
    this.resolvedAt,
    this.closedAt,
    required this.slaHours,
    this.slaDueDate,
    required this.slaBreached,
    this.rating,
    this.feedback,
    this.feedbackAt,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SupportTicket.fromJson(Map<String, dynamic> json) {
    return SupportTicket(
      id: json['_id'] ?? '',
      userId: json['userId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: SupportCategoryExtension.fromString(json['category']),
      priority: SupportPriorityExtension.fromString(json['priority']),
      status: SupportStatusExtension.fromString(json['status']),
      assignedTo: json['assignedTo'],
      attachments: List<String>.from(json['attachments'] ?? []),
      tags: List<String>.from(json['tags'] ?? []),
      isArchived: json['isArchived'] ?? false,
      firstResponseAt: json['firstResponseAt'] != null ? DateTime.parse(json['firstResponseAt']) : null,
      resolvedAt: json['resolvedAt'] != null ? DateTime.parse(json['resolvedAt']) : null,
      closedAt: json['closedAt'] != null ? DateTime.parse(json['closedAt']) : null,
      slaHours: json['slaHours'] ?? 24,
      slaDueDate: json['slaDueDate'] != null ? DateTime.parse(json['slaDueDate']) : null,
      slaBreached: json['slaBreached'] ?? false,
      rating: json['rating']?.toInt(),
      feedback: json['feedback'],
      feedbackAt: json['feedbackAt'] != null ? DateTime.parse(json['feedbackAt']) : null,
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  bool get isOpen => status == SupportStatus.open;
  bool get isInProgress => status == SupportStatus.in_progress;
  bool get isWaitingForUser => status == SupportStatus.waiting_for_user;
  bool get isResolved => status == SupportStatus.resolved;
  bool get isClosed => status == SupportStatus.closed;
  
  bool get isTechnical => category == SupportCategory.technical;
  bool get isBilling => category == SupportCategory.billing;
  bool get isProducts => category == SupportCategory.products;
  bool get isServices => category == SupportCategory.services;
  bool get isAccount => category == SupportCategory.account;
  bool get isOther => category == SupportCategory.other;
  
  bool get isLowPriority => priority == SupportPriority.low;
  bool get isMediumPriority => priority == SupportPriority.medium;
  bool get isHighPriority => priority == SupportPriority.high;
  bool get isUrgentPriority => priority == SupportPriority.urgent;
  
  bool get hasAttachments => attachments.isNotEmpty;
  bool get hasTags => tags.isNotEmpty;
  bool get hasAssignedTo => assignedTo != null && assignedTo!.isNotEmpty;
  bool get hasFirstResponse => firstResponseAt != null;
  bool get hasResolved => resolvedAt != null;
  bool get hasClosed => closedAt != null;
  bool get hasSlaDueDate => slaDueDate != null;
  bool get hasRating => rating != null && rating! > 0;
  bool get hasFeedback => feedback != null && feedback!.isNotEmpty;
  bool get hasFeedbackAt => feedbackAt != null;
  bool get hasMetadata => metadata.isNotEmpty;
  
  bool get isActive => !isArchived && !isClosed;
  bool get isCompleted => isResolved || isClosed;
  bool get isPending => isOpen || isWaitingForUser;
  bool get isInProgress => isInProgress;
  
  String get statusDisplay {
    switch (status) {
      case SupportStatus.open:
        return 'مفتوح';
      case SupportStatus.in_progress:
        return 'جاري العمل';
      case SupportStatus.waiting_for_user:
        return 'في انتظار المستخدم';
      case SupportStatus.resolved:
        return 'تم الحل';
      case SupportStatus.closed:
        return 'مغلق';
    }
  }
  
  String get priorityDisplay {
    switch (priority) {
      case SupportPriority.low:
        return 'منخفض';
      case SupportPriority.medium:
        return 'متوسط';
      case SupportPriority.high:
        return 'عالي';
      case SupportPriority.urgent:
        return 'عاجل';
    }
  }
  
  String get categoryDisplay {
    switch (category) {
      case SupportCategory.technical:
        return 'تقني';
      case SupportCategory.billing:
        return 'فوترة';
      case SupportCategory.products:
        return 'منتجات';
      case SupportCategory.services:
        return 'خدمات';
      case SupportCategory.account:
        return 'حساب';
      case SupportCategory.other:
        return 'أخرى';
    }
  }
}

class SupportMessage {
  final String id;
  final String ticketId;
  final String senderId;
  final MessageType messageType;
  final String content;
  final List<String> attachments;
  final bool isInternal;
  final Map<String, dynamic> metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  SupportMessage({
    required this.id,
    required this.ticketId,
    required this.senderId,
    required this.messageType,
    required this.content,
    required this.attachments,
    required this.isInternal,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SupportMessage.fromJson(Map<String, dynamic> json) {
    return SupportMessage(
      id: json['_id'] ?? '',
      ticketId: json['ticketId'] ?? '',
      senderId: json['senderId'] ?? '',
      messageType: MessageTypeExtension.fromString(json['messageType']),
      content: json['content'] ?? '',
      attachments: List<String>.from(json['attachments'] ?? []),
      isInternal: json['isInternal'] ?? false,
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  bool get isUserMessage => messageType == MessageType.user_message;
  bool get isAdminReply => messageType == MessageType.admin_reply;
  bool get isSystemMessage => messageType == MessageType.system_message;
  
  bool get hasAttachments => attachments.isNotEmpty;
  bool get hasMetadata => metadata.isNotEmpty;
  
  String get messageTypeDisplay {
    switch (messageType) {
      case MessageType.user_message:
        return 'رسالة مستخدم';
      case MessageType.admin_reply:
        return 'رد إداري';
      case MessageType.system_message:
        return 'رسالة نظام';
    }
  }
}

class PaginatedSupportTickets {
  final List<SupportTicket> tickets;
  final int total;
  final int page;
  final int limit;
  final int totalPages;

  PaginatedSupportTickets({
    required this.tickets,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });

  factory PaginatedSupportTickets.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? json;
    return PaginatedSupportTickets(
      tickets: (data['tickets'] as List)
          .map((item) => SupportTicket.fromJson(item))
          .toList(),
      total: data['total'] ?? json['total'] ?? 0,
      page: data['page'] ?? json['page'] ?? 1,
      limit: data['limit'] ?? 10,
      totalPages: data['totalPages'] ?? json['totalPages'] ?? 1,
    );
  }

  bool get hasTickets => tickets.isNotEmpty;
  bool get isEmpty => tickets.isEmpty;
  int get count => tickets.length;
  bool get hasNextPage => page < totalPages;
  bool get hasPrevPage => page > 1;
  bool get isFirstPage => page == 1;
  bool get isLastPage => page == totalPages;
}

class PaginatedSupportMessages {
  final List<SupportMessage> messages;
  final int total;
  final int page;
  final int limit;
  final int totalPages;

  PaginatedSupportMessages({
    required this.messages,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });

  factory PaginatedSupportMessages.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? json;
    return PaginatedSupportMessages(
      messages: (data['messages'] as List)
          .map((item) => SupportMessage.fromJson(item))
          .toList(),
      total: data['total'] ?? json['total'] ?? 0,
      page: data['page'] ?? json['page'] ?? 1,
      limit: data['limit'] ?? 50,
      totalPages: data['totalPages'] ?? json['totalPages'] ?? 1,
    );
  }

  bool get hasMessages => messages.isNotEmpty;
  bool get isEmpty => messages.isEmpty;
  int get count => messages.length;
  bool get hasNextPage => page < totalPages;
  bool get hasPrevPage => page > 1;
  bool get isFirstPage => page == 1;
  bool get isLastPage => page == totalPages;
}
```

---

## 📝 ملاحظات مهمة

1. **تصنيفات التذاكر:**
   - `technical`: تقني
   - `billing`: فوترة
   - `products`: منتجات
   - `services`: خدمات
   - `account`: حساب
   - `other`: أخرى

2. **أولويات التذاكر:**
   - `low`: منخفض
   - `medium`: متوسط
   - `high`: عالي
   - `urgent`: عاجل

3. **حالات التذاكر:**
   - `open`: مفتوح
   - `in_progress`: جاري العمل
   - `waiting_for_user`: في انتظار المستخدم
   - `resolved`: تم الحل
   - `closed`: مغلق

4. **أنواع الرسائل:**
   - `user_message`: رسالة مستخدم
   - `admin_reply`: رد إداري
   - `system_message`: رسالة نظام

5. **SLA (Service Level Agreement):**
   - `slaHours`: عدد الساعات المتوقع للحل
   - `slaDueDate`: تاريخ انتهاء SLA
   - `slaBreached`: هل تم تجاوز SLA

6. **التقييم والملاحظات:**
   - `rating`: تقييم من 1 إلى 5
   - `feedback`: ملاحظات العميل
   - `feedbackAt`: وقت التقييم

7. **الاستخدام:**
   - استخدم `statusDisplay` لعرض حالة التذكرة
   - استخدم `priorityDisplay` لعرض أولوية التذكرة
   - استخدم `categoryDisplay` لعرض تصنيف التذكرة
   - استخدم `messageTypeDisplay` لعرض نوع الرسالة

8. **التحقق من الصحة:**
   - استخدم `isActive` للتحقق من نشاط التذكرة
   - استخدم `isCompleted` للتحقق من اكتمال التذكرة
   - استخدم `isPending` للتحقق من انتظار التذكرة
   - استخدم `hasAttachments` للتحقق من وجود مرفقات

9. **الأداء:**
   - يتم ترتيب التذاكر حسب تاريخ الإنشاء
   - يتم ترتيب الرسائل حسب تاريخ الإرسال
   - يتم دعم الصفحات للنتائج الكبيرة

---

## 🔄 Notes on Update

**التغييرات الرئيسية:**
1. ✅ تصحيح Endpoint - `/support/tickets/my` بدلاً من `/support/tickets` للحصول على تذاكر المستخدم
2. ✅ تصحيح Response Structures - `{ tickets, total, page, totalPages }` و `{ messages, total, page, totalPages }` في المستوى العلوي
3. ✅ تحديث Enums - استخدام snake_case: `in_progress`, `waiting_for_user`, `user_message`, `admin_reply`, `system_message`
4. ✅ إضافة Extensions للـ Enums - `SupportStatusExtension`, `MessageTypeExtension`
5. ✅ تصحيح archive response - `{ message }` بدلاً من `{ data: { message } }`
6. ✅ تحديث جميع أكواد Flutter - استخدام `apiResponse.data!['data']` حيثما مناسب
7. ✅ إزالة `limit` من response (ليس موجود في list response)

**ملاحظات مهمة:**
- endpoint لإنشاء تذكرة: `POST /support/tickets`
- endpoint لجلب تذاكر المستخدم: `GET /support/tickets/my`
- `SupportStatus`: الآن `in_progress`, `waiting_for_user` بدلاً من `inProgress`, `waitingForUser`
- `MessageType`: الآن `user_message`, `admin_reply`, `system_message`
- `assignedTo` قد يكون populated (object) أو null في بعض الـ responses
- عند إنشاء تذكرة، يتم إنشاء رسالة أولية تلقائياً مع description

**ملفات Backend المرجعية:**
- `backend/src/modules/support/customer.controller.ts` - جميع endpoints للعملاء
- `backend/src/modules/support/support.service.ts` - المنطق والـ queries
- `backend/src/modules/support/schemas/support-ticket.schema.ts` - SupportTicket Schema و Enums
- `backend/src/modules/support/schemas/support-message.schema.ts` - SupportMessage Schema و MessageType

---

**التالي:** [خدمة التقييمات (Reviews)](./18-reviews-service.md)

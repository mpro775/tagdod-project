# 🔔 خدمة الإشعارات (Notifications Service)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: نوفمبر 2025  
> 🆕 **محدث**: إضافة WebSocket للإشعارات الفورية

خدمة الإشعارات توفر endpoints لإدارة الإشعارات وتسجيل الأجهزة مع دعم قنوات متعددة.

---

## 📋 جدول المحتويات

1. [قائمة الإشعارات](#1-قائمة-الإشعارات)
2. [تحديد كمقروء (متعدد)](#2-تحديد-كمقروء-متعدد)
3. [تحديد الكل كمقروء](#3-تحديد-الكل-كمقروء)
4. [عدد الإشعارات غير المقروءة](#4-عدد-الإشعارات-غير-المقروءة)
5. [WebSocket - الإشعارات الفورية](#5-websocket---الإشعارات-الفورية)
6. [Models في Flutter](#models-في-flutter)

---

## 1. قائمة الإشعارات

يسترجع قائمة إشعارات المستخدم مع إمكانية الفلترة والترقيم.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/notifications`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `limit` | `number` | ❌ | عدد العناصر (افتراضي: 20) |
| `offset` | `number` | ❌ | الإزاحة (افتراضي: 0) |

### Response - نجاح

```json
{
  "success": true,
  "notifications": [
    {
      "_id": "64notif123",
      "type": "ORDER_SHIPPED",
      "title": "تم شحن طلبك",
      "message": "طلب رقم ORD-2025-001234 في الطريق إليك",
      "messageEn": "Order #ORD-2025-001234 is on its way",
      "data": {
        "orderId": "order_123",
        "orderNumber": "ORD-2025-001234"
      },
      "channel": "push",
      "status": "sent",
      "priority": "medium",
      "category": "order",
      "recipientId": "64user123",
      "recipientEmail": "user@example.com",
      "recipientPhone": "+967123456789",
      "templateId": "64template123",
      "templateKey": "order_shipped",
      "scheduledFor": "2025-01-15T14:30:00.000Z",
      "sentAt": "2025-01-15T14:30:00.000Z",
      "deliveredAt": "2025-01-15T14:30:05.000Z",
      "readAt": null,
      "clickedAt": null,
      "failedAt": null,
      "errorMessage": null,
      "errorCode": null,
      "retryCount": 0,
      "nextRetryAt": null,
      "trackingId": "notif_1234567890_abc123",
      "externalId": null,
      "metadata": {
        "provider": "fcm",
        "campaign": "order_updates"
      },
      "createdBy": "64admin123",
      "isSystemGenerated": true,
      "createdAt": "2025-01-15T14:30:00.000Z",
      "updatedAt": "2025-01-15T14:30:05.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPrevPage": false,
  "requestId": "req_notif_001"
}
```

### كود Flutter

```dart
Future<PaginatedNotifications> getNotifications({
  int limit = 20,
  int offset = 0,
}) async {
  final response = await _dio.get('/notifications', queryParameters: {
    'limit': limit,
    'offset': offset,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return PaginatedNotifications.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. تحديد كمقروء (متعدد)

يحدد إشعارات محددة كمقروءة (يمكن تحديد واحد أو أكثر).

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/notifications/mark-read`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "notificationIds": ["64notif123", "64notif124", "64notif125"]
}
```

### Response - نجاح

```json
{
  "success": true,
  "markedCount": 3,
  "message": "3 notifications marked as read",
  "requestId": "req_notif_002"
}
```

### كود Flutter

```dart
Future<int> markAsRead(List<String> notificationIds) async {
  final response = await _dio.post('/notifications/mark-read', data: {
    'notificationIds': notificationIds,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['markedCount'] ?? 0;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 3. تحديد الكل كمقروء

يحدد جميع الإشعارات كمقروءة.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/notifications/mark-all-read`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "markedCount": 5,
  "message": "5 notifications marked as read",
  "requestId": "req_notif_003"
}
```

### كود Flutter

```dart
Future<int> markAllAsRead() async {
  final response = await _dio.post('/notifications/mark-all-read');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['markedCount'] ?? 0;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 4. عدد الإشعارات غير المقروءة

يسترجع عدد الإشعارات غير المقروءة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/notifications/unread-count`
- **Auth Required:** ✅ نعم
- **Cache:** ✅ نعم (1 دقيقة)

### Response - نجاح

```json
{
  "success": true,
  "unreadCount": 5,
  "requestId": "req_notif_004"
}
```

**ملاحظة:** الـ response يعيد فقط عدد الإشعارات غير المقروءة (بدون تفصيل حسب النوع أو القناة).

### كود Flutter

```dart
Future<int> getUnreadCount() async {
  final response = await _dio.get('/notifications/unread-count');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['unreadCount'] ?? 0;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 5. WebSocket - الإشعارات الفورية

يوفر النظام اتصال WebSocket في الوقت الفعلي لاستقبال الإشعارات فوراً دون الحاجة لـ polling.

### معلومات الاتصال

- **Namespace:** `/notifications`
- **URL:** `ws://your-api-url/notifications` أو `wss://your-api-url/notifications`
- **Auth Required:** ✅ نعم (JWT Token)
- **Reconnection:** ✅ تلقائي

### إعداد Dependencies

في `pubspec.yaml`:
```yaml
dependencies:
  socket_io_client: ^2.0.3+1
```

### كود Flutter - خدمة WebSocket

```dart
// lib/services/notifications_websocket_service.dart
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:shared_preferences/shared_preferences.dart';

class NotificationsWebSocketService {
  static final NotificationsWebSocketService _instance = 
      NotificationsWebSocketService._internal();
  factory NotificationsWebSocketService() => _instance;
  NotificationsWebSocketService._internal();

  IO.Socket? _socket;
  bool _isConnected = false;
  
  // Callbacks
  Function(Map<String, dynamic>)? onNotificationReceived;
  Function(int)? onUnreadCountChanged;
  Function()? onConnected;
  Function()? onDisconnected;
  Function(String)? onError;

  /// الاتصال بـ WebSocket
  Future<void> connect() async {
    if (_isConnected && _socket?.connected == true) {
      return;
    }

    try {
      // الحصول على Token
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token');
      
      if (token == null) {
        throw Exception('No access token found');
      }

      // إنشاء الاتصال
      _socket = IO.io(
        'http://your-api-url/notifications', // أو wss:// للـ HTTPS
        IO.OptionBuilder()
            .setTransports(['websocket', 'polling'])
            .enableAutoConnect()
            .setExtraHeaders({'authorization': 'Bearer $token'})
            .setAuth({'token': token})
            .build(),
      );

      // إعداد Event Listeners
      _setupEventListeners();
      
      _isConnected = true;
      print('✅ Connected to notifications WebSocket');
    } catch (e) {
      print('❌ Error connecting to WebSocket: $e');
      if (onError != null) {
        onError!(e.toString());
      }
    }
  }

  /// إعداد Event Listeners
  void _setupEventListeners() {
    if (_socket == null) return;

    // الاتصال الناجح
    _socket!.onConnect((_) {
      print('✅ WebSocket connected');
      if (onConnected != null) {
        onConnected!();
      }
    });

    // رسالة الاتصال الناجح مع البيانات
    _socket!.on('connected', (data) {
      print('✅ Authenticated: $data');
    });

    // إشعار جديد
    _socket!.on('notification:new', (data) {
      print('🔔 New notification received: $data');
      if (onNotificationReceived != null) {
        onNotificationReceived!(data as Map<String, dynamic>);
      }
    });

    // تحديث عدد الإشعارات غير المقروءة
    _socket!.on('unread-count', (data) {
      final count = (data as Map<String, dynamic>)['count'] as int? ?? 0;
      print('📊 Unread count: $count');
      if (onUnreadCountChanged != null) {
        onUnreadCountChanged!(count);
      }
    });

    // انقطاع الاتصال
    _socket!.onDisconnect((_) {
      print('❌ WebSocket disconnected');
      _isConnected = false;
      if (onDisconnected != null) {
        onDisconnected!();
      }
    });

    // خطأ
    _socket!.onError((error) {
      print('❌ WebSocket error: $error');
      if (onError != null) {
        onError!(error.toString());
      }
    });

    // Ping/Pong
    _socket!.on('pong', (data) {
      print('🏓 Pong received');
    });
  }

  /// طلب عدد الإشعارات غير المقروءة
  void getUnreadCount() {
    _socket?.emit('get-unread-count');
  }

  /// تحديد إشعارات كمقروءة
  void markAsRead(List<String> notificationIds) {
    _socket?.emit('mark-as-read', {'notificationIds': notificationIds});
  }

  /// تحديد جميع الإشعارات كمقروءة
  void markAllAsRead() {
    _socket?.emit('mark-all-as-read');
  }

  /// إرسال Ping
  void ping() {
    _socket?.emit('ping');
  }

  /// قطع الاتصال
  void disconnect() {
    _socket?.disconnect();
    _isConnected = false;
    print('🔌 WebSocket disconnected');
  }

  /// التحقق من حالة الاتصال
  bool get isConnected => _isConnected && (_socket?.connected ?? false);
}
```

### استخدام الخدمة في التطبيق

```dart
// lib/main.dart
import 'services/notifications_websocket_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // ... تهيئة أخرى ...
  
  // تهيئة WebSocket للإشعارات
  final wsService = NotificationsWebSocketService();
  
  // إعداد Callbacks
  wsService.onNotificationReceived = (notification) {
    // عرض الإشعار في UI
    _showNotification(notification);
  };
  
  wsService.onUnreadCountChanged = (count) {
    // تحديث Badge
    _updateUnreadBadge(count);
  };
  
  wsService.onConnected = () {
    print('✅ Connected to real-time notifications');
  };
  
  wsService.onDisconnected = () {
    print('❌ Disconnected from notifications');
    // إعادة الاتصال بعد 5 ثوان
    Future.delayed(Duration(seconds: 5), () => wsService.connect());
  };
  
  // الاتصال
  await wsService.connect();
  
  runApp(MyApp());
}
```

### استخدام في Widget

```dart
// lib/screens/notifications_screen.dart
class _NotificationsScreenState extends State<NotificationsScreen> {
  final _wsService = NotificationsWebSocketService();
  final _notificationsApi = NotificationsApi();
  
  List<Notification> _notifications = [];
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _setupWebSocket();
    _loadNotifications();
  }

  void _setupWebSocket() {
    _wsService.onNotificationReceived = (data) {
      // إضافة الإشعار الجديد للقائمة
      setState(() {
        _notifications.insert(0, Notification.fromJson(data));
        _unreadCount++;
      });
      
      // عرض إشعار محلي
      _showLocalNotification(data);
    };
    
    _wsService.onUnreadCountChanged = (count) {
      setState(() {
        _unreadCount = count;
      });
    };
    
    _wsService.connect();
  }

  @override
  void dispose() {
    _wsService.disconnect();
    super.dispose();
  }

  // ... باقي الكود ...
}
```

### الأحداث المتاحة

| الحدث | الوصف | البيانات |
|------|-------|---------|
| `connected` | اتصال ناجح | `{ success: true, userId: string, timestamp: string }` |
| `notification:new` | إشعار جديد | `{ id, title, message, messageEn, type, priority, data, createdAt, isRead }` |
| `unread-count` | عدد غير مقروء | `{ count: number }` |
| `marked-as-read` | تم تحديد كمقروء | `{ success: true, markedCount: number }` |
| `marked-all-as-read` | تم تحديد الكل كمقروء | `{ success: true, markedCount: number }` |
| `pong` | رد على ping | `{ pong: true, timestamp: string }` |

### الأوامر المتاحة

| الأمر | الوصف | البيانات |
|------|-------|---------|
| `ping` | اختبار الاتصال | لا |
| `get-unread-count` | طلب عدد غير مقروء | لا |
| `mark-as-read` | تحديد كمقروء | `{ notificationIds: string[] }` |
| `mark-all-as-read` | تحديد الكل كمقروء | لا |

### ملاحظات مهمة

1. **Authentication**: يجب إرسال JWT Token في `authorization` header أو `auth.token`
2. **Reconnection**: Socket.IO يعيد الاتصال تلقائياً عند الانقطاع
3. **Fallback**: إذا فشل WebSocket، استخدم REST API كـ fallback
4. **Token Refresh**: عند تحديث Token، أعد الاتصال
5. **Background**: في الخلفية، استخدم Push Notifications بدلاً من WebSocket

---

## Models في Flutter

### ملف: `lib/models/notification/notification_models.dart`

```dart
enum NotificationType {
  // Order related
  ORDER_CONFIRMED,
  ORDER_SHIPPED,
  ORDER_DELIVERED,
  ORDER_CANCELLED,
  ORDER_REFUNDED,
  
  // Service related
  SERVICE_REQUEST_OPENED,
  NEW_ENGINEER_OFFER,
  OFFER_ACCEPTED,
  SERVICE_STARTED,
  SERVICE_COMPLETED,
  SERVICE_RATED,
  SERVICE_REQUEST_CANCELLED,
  
  // Product related
  PRODUCT_BACK_IN_STOCK,
  PRODUCT_PRICE_DROP,
  LOW_STOCK,
  OUT_OF_STOCK,
  
  // Promotion related
  PROMOTION_STARTED,
  PROMOTION_ENDING,
  
  // Account & Security
  ACCOUNT_VERIFIED,
  PASSWORD_CHANGED,
  LOGIN_ATTEMPT,
  
  // Support
  TICKET_CREATED,
  TICKET_UPDATED,
  TICKET_RESOLVED,
  
  // System
  SYSTEM_MAINTENANCE,
  NEW_FEATURE,
  SYSTEM_ALERT,
  
  // Marketing
  WELCOME_NEW_USER,
  BIRTHDAY_GREETING,
  CART_ABANDONMENT,
  
  // Payment
  PAYMENT_FAILED,
  PAYMENT_SUCCESS,
}

enum NotificationStatus {
  pending,
  queued,
  sending,
  sent,
  delivered,
  read,
  clicked,
  failed,
  bounced,
  rejected,
  cancelled,
}

enum NotificationChannel {
  inApp,
  push,
  sms,
  email,
  dashboard,
}

enum NotificationPriority {
  low,
  medium,
  high,
  urgent,
}

enum NotificationCategory {
  order,
  product,
  service,
  promotion,
  account,
  system,
  support,
  payment,
  marketing,
}

class Notification {
  final String id;
  final NotificationType type;
  final String title;
  final String message;
  final String messageEn;
  final Map<String, dynamic> data;
  final NotificationChannel channel;
  final NotificationStatus status;
  final NotificationPriority priority;
  final NotificationCategory category;
  final String? recipientId;
  final String? recipientEmail;
  final String? recipientPhone;
  final String? templateId;
  final String? templateKey;
  final DateTime? scheduledFor;
  final DateTime? sentAt;
  final DateTime? deliveredAt;
  final DateTime? readAt;
  final DateTime? clickedAt;
  final DateTime? failedAt;
  final String? errorMessage;
  final String? errorCode;
  final int retryCount;
  final DateTime? nextRetryAt;
  final String? trackingId;
  final String? externalId;
  final Map<String, dynamic> metadata;
  final String? createdBy;
  final bool isSystemGenerated;
  final DateTime createdAt;
  final DateTime updatedAt;

  Notification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.messageEn,
    required this.data,
    required this.channel,
    required this.status,
    required this.priority,
    required this.category,
    this.recipientId,
    this.recipientEmail,
    this.recipientPhone,
    this.templateId,
    this.templateKey,
    this.scheduledFor,
    this.sentAt,
    this.deliveredAt,
    this.readAt,
    this.clickedAt,
    this.failedAt,
    this.errorMessage,
    this.errorCode,
    required this.retryCount,
    this.nextRetryAt,
    this.trackingId,
    this.externalId,
    required this.metadata,
    this.createdBy,
    required this.isSystemGenerated,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Notification.fromJson(Map<String, dynamic> json) {
    return Notification(
      id: json['_id'] ?? '',
      type: NotificationType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => NotificationType.SYSTEM_ALERT,
      ),
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      messageEn: json['messageEn'] ?? '',
      data: Map<String, dynamic>.from(json['data'] ?? {}),
      channel: NotificationChannel.values.firstWhere(
        (e) => e.name == json['channel'],
        orElse: () => NotificationChannel.inApp,
      ),
      status: NotificationStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => NotificationStatus.pending,
      ),
      priority: NotificationPriority.values.firstWhere(
        (e) => e.name == json['priority'],
        orElse: () => NotificationPriority.medium,
      ),
      category: NotificationCategory.values.firstWhere(
        (e) => e.name == json['category'],
        orElse: () => NotificationCategory.system,
      ),
      recipientId: json['recipientId'],
      recipientEmail: json['recipientEmail'],
      recipientPhone: json['recipientPhone'],
      templateId: json['templateId'],
      templateKey: json['templateKey'],
      scheduledFor: json['scheduledFor'] != null ? DateTime.parse(json['scheduledFor']) : null,
      sentAt: json['sentAt'] != null ? DateTime.parse(json['sentAt']) : null,
      deliveredAt: json['deliveredAt'] != null ? DateTime.parse(json['deliveredAt']) : null,
      readAt: json['readAt'] != null ? DateTime.parse(json['readAt']) : null,
      clickedAt: json['clickedAt'] != null ? DateTime.parse(json['clickedAt']) : null,
      failedAt: json['failedAt'] != null ? DateTime.parse(json['failedAt']) : null,
      errorMessage: json['errorMessage'],
      errorCode: json['errorCode'],
      retryCount: json['retryCount'] ?? 0,
      nextRetryAt: json['nextRetryAt'] != null ? DateTime.parse(json['nextRetryAt']) : null,
      trackingId: json['trackingId'],
      externalId: json['externalId'],
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
      createdBy: json['createdBy'],
      isSystemGenerated: json['isSystemGenerated'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  String getMessage(String locale) {
    if (locale == 'en') return messageEn;
    return message;
  }

  // Type checks
  bool get isOrderType => category == NotificationCategory.order;
  bool get isServiceType => category == NotificationCategory.service;
  bool get isProductType => category == NotificationCategory.product;
  bool get isPromotionType => category == NotificationCategory.promotion;
  bool get isAccountType => category == NotificationCategory.account;
  bool get isSystemType => category == NotificationCategory.system;
  bool get isSupportType => category == NotificationCategory.support;
  bool get isPaymentType => category == NotificationCategory.payment;
  bool get isMarketingType => category == NotificationCategory.marketing;
  
  // Status checks
  bool get isPending => status == NotificationStatus.pending;
  bool get isQueued => status == NotificationStatus.queued;
  bool get isSending => status == NotificationStatus.sending;
  bool get isSent => status == NotificationStatus.sent;
  bool get isDelivered => status == NotificationStatus.delivered;
  bool get isRead => status == NotificationStatus.read;
  bool get isClicked => status == NotificationStatus.clicked;
  bool get isFailed => status == NotificationStatus.failed;
  bool get isBounced => status == NotificationStatus.bounced;
  bool get isRejected => status == NotificationStatus.rejected;
  bool get isCancelled => status == NotificationStatus.cancelled;
  bool get isUnread => status != NotificationStatus.read;
  
  // Channel checks
  bool get isInApp => channel == NotificationChannel.inApp;
  bool get isEmail => channel == NotificationChannel.email;
  bool get isSms => channel == NotificationChannel.sms;
  bool get isPush => channel == NotificationChannel.push;
  bool get isDashboard => channel == NotificationChannel.dashboard;
  
  // Priority checks
  bool get isLowPriority => priority == NotificationPriority.low;
  bool get isMediumPriority => priority == NotificationPriority.medium;
  bool get isHighPriority => priority == NotificationPriority.high;
  bool get isUrgent => priority == NotificationPriority.urgent;
  
  // Field checks
  bool get hasRecipient => recipientId != null;
  bool get hasEmail => recipientEmail != null && recipientEmail!.isNotEmpty;
  bool get hasPhone => recipientPhone != null && recipientPhone!.isNotEmpty;
  bool get hasTemplate => templateId != null || templateKey != null;
  bool get hasError => errorMessage != null && errorMessage!.isNotEmpty;
  bool get hasRetries => retryCount > 0;
  bool get isScheduled => scheduledFor != null;
  bool get hasCreator => createdBy != null;
  bool get hasTracking => trackingId != null;
  bool get hasExternalId => externalId != null;
  bool get hasMetadata => metadata.isNotEmpty;
  
  // Data extraction
  String? get orderId => data['orderId']?.toString();
  String? get orderNumber => data['orderNumber']?.toString();
  String? get productId => data['productId']?.toString();
  String? get userId => data['userId']?.toString();
  String? get serviceId => data['serviceId']?.toString();
  String? get ticketId => data['ticketId']?.toString();
  
  bool get hasOrderData => orderId != null || orderNumber != null;
  bool get hasProductData => productId != null;
  bool get hasUserData => userId != null;
  bool get hasServiceData => serviceId != null;
  bool get hasTicketData => ticketId != null;
  
  // Metadata extraction
  String? get provider => metadata['provider']?.toString();
  double? get cost => metadata['cost']?.toDouble();
  int? get credits => metadata['credits']?.toInt();
  String? get campaign => metadata['campaign']?.toString();
  List<String>? get tags => metadata['tags'] != null 
      ? List<String>.from(metadata['tags']) 
      : null;
  
  // Timing
  DateTime get displayDate => readAt ?? deliveredAt ?? sentAt ?? createdAt;
  bool get isRecent => DateTime.now().difference(displayDate).inDays < 7;
  bool get isOld => DateTime.now().difference(displayDate).inDays > 30;
}

class PaginatedNotifications {
  final List<Notification> notifications;
  final int total;
  final int page;
  final int limit;
  final int totalPages;
  final bool hasNextPage;
  final bool hasPrevPage;

  PaginatedNotifications({
    required this.notifications,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
    required this.hasNextPage,
    required this.hasPrevPage,
  });

  factory PaginatedNotifications.fromJson(Map<String, dynamic> json) {
    return PaginatedNotifications(
      notifications: (json['notifications'] as List)
          .map((item) => Notification.fromJson(item))
          .toList(),
      total: json['total'] ?? 0,
      page: json['page'] ?? 1,
      limit: json['limit'] ?? 20,
      totalPages: json['totalPages'] ?? 0,
      hasNextPage: json['hasNextPage'] ?? false,
      hasPrevPage: json['hasPrevPage'] ?? false,
    );
  }

  bool get hasNotifications => notifications.isNotEmpty;
  bool get isEmpty => notifications.isEmpty;
  int get count => notifications.length;
  List<Notification> get unreadNotifications => notifications.where((n) => n.isUnread).toList();
  List<Notification> get readNotifications => notifications.where((n) => n.isRead).toList();
  int get unreadCount => unreadNotifications.length;
  int get readCount => readNotifications.length;
  bool get isFirstPage => page == 1;
  bool get isLastPage => page == totalPages;
}
```

---

## 🔔 دليل التكامل الكامل مع Push Notifications (FCM)

هذا الدليل يشرح كيفية ربط تطبيق Flutter مع خدمة الإشعارات بشكل صحيح، بحيث تظهر الإشعارات داخل وخارج التطبيق.

---

## 📦 1. إعداد المشروع

### 1.1 إضافة Dependencies

في `pubspec.yaml`:
```yaml
dependencies:
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.6
  flutter_local_notifications: ^16.3.0
  device_info_plus: ^9.1.0
  package_info_plus: ^5.0.1
  shared_preferences: ^2.2.2
```

### 1.2 إعداد Firebase

#### Android:

> **📥 تحميل ملف `google-services.json`:**
> 
> تمت تهيئة Android app في Firebase. يمكنك تحميل الملف مباشرة من الرابط التالي:
> 
> **[⬇️ تحميل google-services.json](https://console.firebase.google.com/project/tagadod-5932b/settings/general/android:com.tagadod.app)**
> 
> سيجد الملف جاهزاً للتحميل في الصفحة (ستجد زر "Download google-services.json" في أعلى الصفحة).

1. حمّل ملف `google-services.json` من الرابط أعلاه (أو من Firebase Console)
2. ضعه في `android/app/`
3. أضف في `android/build.gradle`:
```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
}
```
4. أضف في `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

#### iOS:
1. حمّل ملف `GoogleService-Info.plist` من Firebase Console
2. ضعه في `ios/Runner/`
3. في `ios/Runner/Info.plist` أضف:
```xml
<key>FirebaseAppDelegateProxyEnabled</key>
<false/>
```

---

## 🚀 2. تهيئة Firebase في التطبيق

### 2.1 إعداد Background Handler

```dart
// lib/main.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// Handler للإشعارات في الخلفية (يجب أن يكون top-level function)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('Handling background message: ${message.messageId}');
  print('Message data: ${message.data}');
  
  // يمكنك إضافة منطق إضافي هنا (مثل تحديث قاعدة البيانات المحلية)
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // تهيئة Firebase
  await Firebase.initializeApp();
  
  // تسجيل Background Handler
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  
  runApp(MyApp());
}
```

---

## 🎯 3. إنشاء خدمة الإشعارات الكاملة

### 3.1 ملف الخدمة الأساسي

```dart
// lib/services/notifications_service.dart
import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_client.dart';
import '../models/notification/notification_models.dart';

class NotificationsService {
  static final NotificationsService _instance = NotificationsService._internal();
  factory NotificationsService() => _instance;
  NotificationsService._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = 
      FlutterLocalNotificationsPlugin();
  final ApiClient _apiClient = ApiClient();
  
  bool _isInitialized = false;
  String? _currentToken;
  
  // Callback للتنقل عند النقر على الإشعار
  Function(Map<String, dynamic>)? onNotificationTapped;

  /// تهيئة خدمة الإشعارات
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // 1. تهيئة Local Notifications
      await _initializeLocalNotifications();
      
      // 2. طلب الأذونات
      final settings = await _requestPermissions();
      
      if (settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional) {
        
        // 3. الحصول على Token وتسجيله
        await _setupToken();
        
        // 4. إعداد Listeners للإشعارات
        await _setupNotificationListeners();
        
        _isInitialized = true;
        print('✅ NotificationsService initialized successfully');
      } else {
        print('❌ Notification permissions denied');
      }
    } catch (e) {
      print('❌ Error initializing NotificationsService: $e');
    }
  }

  /// تهيئة Local Notifications
  Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    
    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
    
    // إنشاء Notification Channel للـ Android
    if (Platform.isAndroid) {
      const androidChannel = AndroidNotificationChannel(
        'high_importance_channel',
        'High Importance Notifications',
        description: 'This channel is used for important notifications',
        importance: Importance.high,
        playSound: true,
        enableVibration: true,
      );
      
      await _localNotifications
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(androidChannel);
    }
  }

  /// طلب أذونات الإشعارات
  Future<NotificationSettings> _requestPermissions() async {
    return await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
      announcement: false,
      carPlay: false,
      criticalAlert: false,
    );
  }

  /// إعداد Token وتسجيله
  Future<void> _setupToken() async {
    try {
      // الحصول على Token الحالي
      _currentToken = await _fcm.getToken();
      
      if (_currentToken != null) {
        print('📱 FCM Token: ${_currentToken.substring(0, 20)}...');
        
        // تسجيل الجهاز في Backend
        await _registerDevice(_currentToken!);
        
        // حفظ Token محلياً
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('fcm_token', _currentToken!);
      }
      
      // الاستماع لتحديثات Token
      _fcm.onTokenRefresh.listen((newToken) async {
        print('🔄 FCM Token refreshed');
        _currentToken = newToken;
        
        // تحديث Token في Backend
        await _registerDevice(newToken);
        
        // حفظ Token الجديد
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('fcm_token', newToken);
      });
    } catch (e) {
      print('❌ Error setting up token: $e');
    }
  }

  /// تسجيل الجهاز في Backend
  Future<void> _registerDevice(String token) async {
    try {
      final deviceInfo = DeviceInfoPlugin();
      final packageInfo = await PackageInfo.fromPlatform();
      
      String platform;
      String? userAgent;
      
      if (Platform.isAndroid) {
        final androidInfo = await deviceInfo.androidInfo;
        platform = 'android';
        userAgent = 'Android ${androidInfo.version.release}';
      } else if (Platform.isIOS) {
        final iosInfo = await deviceInfo.iosInfo;
        platform = 'ios';
        userAgent = 'iOS ${iosInfo.systemVersion}';
      } else {
        platform = 'web';
      }
      
      final response = await _apiClient.dio.post(
        '/notifications/devices/register',
        data: {
          'platform': platform,
          'token': token,
          'userAgent': userAgent,
          'appVersion': packageInfo.version,
        },
      );
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        print('✅ Device registered successfully');
      }
    } catch (e) {
      print('❌ Error registering device: $e');
      // لا نرمي خطأ هنا لأن التطبيق يجب أن يعمل حتى لو فشل التسجيل
    }
  }

  /// إعداد Listeners للإشعارات
  Future<void> _setupNotificationListeners() async {
    // 1. إشعارات Foreground (التطبيق مفتوح)
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('📨 Foreground notification received');
      _handleForegroundNotification(message);
    });
    
    // 2. إشعارات Background (التطبيق في الخلفية)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('📨 Background notification tapped');
      _handleNotificationTap(message);
    });
    
    // 3. إشعار فتح التطبيق (التطبيق كان مغلقاً)
    final initialMessage = await _fcm.getInitialMessage();
    if (initialMessage != null) {
      print('📨 App opened from notification');
      _handleNotificationTap(initialMessage);
    }
  }

  /// معالجة إشعار Foreground
  Future<void> _handleForegroundNotification(RemoteMessage message) async {
    // عرض إشعار محلي
    await _showLocalNotification(message);
    
    // تحديث حالة الإشعار في Backend (delivered)
    if (message.data['notificationId'] != null) {
      await _markAsDelivered(message.data['notificationId']);
    }
  }

  /// عرض إشعار محلي
  Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    final data = message.data;
    
    if (notification == null) return;
    
    const androidDetails = AndroidNotificationDetails(
      'high_importance_channel',
      'High Importance Notifications',
      channelDescription: 'This channel is used for important notifications',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      enableVibration: true,
      playSound: true,
    );
    
    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );
    
    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await _localNotifications.show(
      message.hashCode,
      notification.title ?? 'إشعار جديد',
      notification.body ?? '',
      details,
      payload: data.toString(),
    );
  }

  /// معالجة النقر على الإشعار
  void _onNotificationTapped(NotificationResponse response) {
    if (response.payload != null) {
      // يمكنك parse الـ payload هنا
      print('Notification tapped: ${response.payload}');
    }
  }

  /// معالجة النقر على إشعار FCM
  void _handleNotificationTap(RemoteMessage message) {
    final data = message.data;
    
    // استدعاء Callback للتنقل
    if (onNotificationTapped != null) {
      onNotificationTapped!(data);
    }
    
    // تحديث حالة الإشعار في Backend (clicked)
    if (data['notificationId'] != null) {
      _markAsClicked(data['notificationId']);
    }
  }

  /// تحديث حالة الإشعار كمقروء
  Future<void> markAsRead(String notificationId) async {
    try {
      await _apiClient.dio.post(
        '/notifications/mark-read',
        data: {
          'notificationIds': [notificationId],
        },
      );
    } catch (e) {
      print('❌ Error marking notification as read: $e');
    }
  }

  /// تحديث حالة الإشعار كمقروء (متعدد)
  Future<void> markMultipleAsRead(List<String> notificationIds) async {
    try {
      await _apiClient.dio.post(
        '/notifications/mark-read',
        data: {
          'notificationIds': notificationIds,
        },
      );
    } catch (e) {
      print('❌ Error marking notifications as read: $e');
    }
  }

  /// تحديث حالة الإشعار كـ delivered
  Future<void> _markAsDelivered(String notificationId) async {

    // يمكنك إضافة endpoint خاص لهذا إذا كان متوفراً
    // أو يمكنك استخدام markAsRead
  }

  /// تحديث حالة الإشعار كـ clicked
  Future<void> _markAsClicked(String notificationId) async {
    // يمكنك إضافة endpoint خاص لهذا إذا كان متوفراً
    // أو يمكنك استخدام markAsRead
  }

  /// الحصول على Token الحالي
  String? get currentToken => _currentToken;

  /// التحقق من حالة التهيئة
  bool get isInitialized => _isInitialized;
}
```

---

## 🎨 4. استخدام الخدمة في التطبيق

### 4.1 تهيئة الخدمة في main.dart

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'services/notifications_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // ... تهيئة Firebase ...
  
  // تهيئة خدمة الإشعارات
  final notificationsService = NotificationsService();
  await notificationsService.initialize();
  
  // إعداد Callback للتنقل
  notificationsService.onNotificationTapped = (data) {
    _handleNotificationNavigation(data);
  };
  
  runApp(MyApp());
}

void _handleNotificationNavigation(Map<String, dynamic> data) {
  // معالجة التنقل حسب نوع الإشعار
  final navigatorKey = GlobalKey<NavigatorState>();
  
  if (data['orderId'] != null) {
    navigatorKey.currentState?.pushNamed('/orders/${data['orderId']}');
  } else if (data['productId'] != null) {
    navigatorKey.currentState?.pushNamed('/products/${data['productId']}');
  } else if (data['serviceId'] != null) {
    navigatorKey.currentState?.pushNamed('/services/${data['serviceId']}');
  } else if (data['ticketId'] != null) {
    navigatorKey.currentState?.pushNamed('/support/${data['ticketId']}');
  }
  // ... إلخ
}
```

### 4.2 استخدام الخدمة في Widget

```dart
// lib/screens/notifications_screen.dart
import 'package:flutter/material.dart';
import '../services/notifications_service.dart';
import '../api/notifications_api.dart';

class NotificationsScreen extends StatefulWidget {
  @override
  _NotificationsScreenState createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final NotificationsService _notificationsService = NotificationsService();
  final NotificationsApi _api = NotificationsApi();
  
  List<Notification> _notifications = [];
  bool _isLoading = true;
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
    _loadUnreadCount();
  }

  Future<void> _loadNotifications() async {
    try {
      setState(() => _isLoading = true);
      final result = await _api.getNotifications();
      setState(() {
        _notifications = result.notifications;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('خطأ في تحميل الإشعارات: $e')),
      );
    }
  }

  Future<void> _loadUnreadCount() async {
    try {
      final count = await _api.getUnreadCount();
      setState(() => _unreadCount = count);
    } catch (e) {
      print('Error loading unread count: $e');
    }
  }

  Future<void> _markAsRead(String notificationId) async {
    try {
      await _notificationsService.markAsRead(notificationId);
      await _loadNotifications();
      await _loadUnreadCount();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('خطأ في تحديث الإشعار')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('الإشعارات'),
        actions: [
          if (_unreadCount > 0)
            Center(
              child: Padding(
                padding: EdgeInsets.only(right: 16),
                child: Text(
                  '$_unreadCount',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? Center(child: Text('لا توجد إشعارات'))
              : RefreshIndicator(
                  onRefresh: _loadNotifications,
                  child: ListView.builder(
                    itemCount: _notifications.length,
                    itemBuilder: (context, index) {
                      final notification = _notifications[index];
                      return ListTile(
                        leading: _getNotificationIcon(notification),
                        title: Text(notification.title),
                        subtitle: Text(notification.getMessage('ar')),
                        trailing: notification.isUnread
                            ? Icon(Icons.circle, color: Colors.blue, size: 12)
                            : null,
                        onTap: () {
                          _markAsRead(notification.id);
                          _handleNotificationTap(notification);
                        },
                      );
                    },
                  ),
                ),
    );
  }

  Widget _getNotificationIcon(Notification notification) {
    if (notification.isOrderType) {
      return Icon(Icons.shopping_cart, color: Colors.blue);
    } else if (notification.isServiceType) {
      return Icon(Icons.build, color: Colors.orange);
    } else if (notification.isProductType) {
      return Icon(Icons.shopping_bag, color: Colors.green);
    } else {
      return Icon(Icons.notifications, color: Colors.grey);
    }
  }

  void _handleNotificationTap(Notification notification) {
    // التنقل حسب نوع الإشعار
    if (notification.orderId != null) {
      Navigator.pushNamed(context, '/orders/${notification.orderId}');
    } else if (notification.productId != null) {
      Navigator.pushNamed(context, '/products/${notification.productId}');
    } else if (notification.serviceId != null) {
      Navigator.pushNamed(context, '/services/${notification.serviceId}');
    }
  }
}
```

---

## 📱 5. معالجة الإشعارات حسب الحالة

### 5.1 داخل التطبيق (Foreground)

عندما يكون التطبيق مفتوحاً، يتم استقبال الإشعارات عبر `FirebaseMessaging.onMessage` ويتم عرضها كإشعارات محلية.

### 5.2 في الخلفية (Background)

عندما يكون التطبيق في الخلفية، يتم استقبال الإشعارات عبر `FirebaseMessaging.onMessageOpenedApp` عند النقر عليها.

### 5.3 التطبيق مغلق (Terminated)

عندما يكون التطبيق مغلقاً تماماً، يتم استقبال الإشعارات عبر `FirebaseMessaging.getInitialMessage()` عند فتح التطبيق.

---

## 🔧 6. إعدادات إضافية

### 6.1 إعدادات Android (android/app/src/main/AndroidManifest.xml)

```xml
<manifest>
  <uses-permission android:name="android.permission.INTERNET"/>
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
  
  <application>
    <!-- ... -->
    
    <!-- إشعارات FCM -->
    <service
      android:name="com.google.firebase.messaging.FirebaseMessagingService"
      android:exported="false">
      <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
      </intent-filter>
    </service>
  </application>
</manifest>
```

### 6.2 إعدادات iOS (ios/Runner/Info.plist)

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

---

## ✅ 7. التحقق من التكامل

### 7.1 التحقق من Token

```dart
final token = await NotificationsService().currentToken;
print('FCM Token: $token');
```

### 7.2 اختبار الإشعارات

1. **من Firebase Console**: أرسل إشعار تجريبي
2. **من Backend**: استخدم endpoint إرسال الإشعارات
3. **تحقق من**:
   - ظهور الإشعار داخل التطبيق
   - ظهور الإشعار في الخلفية
   - فتح التطبيق عند النقر على الإشعار
   - تحديث حالة الإشعار في Backend

---

## 🎯 8. أفضل الممارسات

1. **احفظ Token محلياً**: لتجنب إعادة التسجيل عند كل تشغيل
2. **عالج الأخطاء**: لا ترمي أخطاء عند فشل التسجيل
3. **استخدم Callbacks**: للتنقل عند النقر على الإشعارات
4. **حدّث الحالة**: حدّث حالة الإشعارات (read, clicked) في Backend
5. **اختبر جميع الحالات**: Foreground, Background, Terminated

---

## 📝 ملاحظات مهمة

- **Background Handler**: يجب أن يكون top-level function
- **Token Refresh**: استمع لتحديثات Token وأعد التسجيل
- **Permissions**: اطلب الأذونات بشكل مناسب حسب المنصة
- **Navigation**: استخدم NavigatorKey للتنقل من أي مكان
- **Error Handling**: تعامل مع الأخطاء بشكل مناسب

---

## 🎛️ إرسال الإشعارات من لوحة التحكم (Admin Dashboard)

بعد إعداد Firebase في تطبيق Flutter وتسجيل الأجهزة، يمكن للمسؤولين إرسال إشعارات إلى العملاء من لوحة التحكم.

### ✅ المتطلبات

1. **Backend مُعد بشكل صحيح:**
   - متغيرات FCM موجودة في `.env`
   - Firebase Admin SDK مُهيأ
   - Endpoints الإدارية متاحة

2. **تطبيق Flutter مُعد:**
   - Firebase مُهيأ
   - الأجهزة مسجلة (`/notifications/devices/register`)
   - Token محفوظ في Backend

### 📤 كيفية الإرسال من لوحة التحكم

#### الطريقة 1: إنشاء وإرسال إشعار واحد

1. **من لوحة التحكم:**
   - اذهب إلى صفحة الإشعارات
   - اضغط "إنشاء إشعار جديد"
   - املأ البيانات:
     ```json
     {
       "type": "SYSTEM_ALERT",
       "title": "إعلان مهم",
       "message": "رسالة مهمة لجميع المستخدمين",
       "messageEn": "Important announcement for all users",
       "channel": "push",
       "priority": "high",
       "category": "system",
       "recipientId": "user_id_here"
     }
     ```

2. **الإرسال:**
   - بعد إنشاء الإشعار، اضغط "إرسال"
   - سيتم إرسال الإشعار عبر FCM إلى الجهاز المسجل

#### الطريقة 2: إرسال مجمع (Bulk Send)

لإرسال إشعار لعدة مستخدمين دفعة واحدة:

```json
POST /notifications/admin/bulk-send
{
  "type": "PROMOTION_STARTED",
  "title": "عرض جديد",
  "message": "عرض خاص على جميع المنتجات",
  "messageEn": "Special offer on all products",
  "channel": "push",
  "priority": "medium",
  "category": "promotion",
  "targetUserIds": [
    "user_id_1",
    "user_id_2",
    "user_id_3"
  ],
  "data": {
    "promotionId": "promo_123",
    "discount": 30
  }
}
```

### 🔄 تدفق الإرسال

```
لوحة التحكم (Admin Dashboard)
    ↓
POST /notifications/admin/create
    ↓
Backend يحفظ الإشعار في قاعدة البيانات
    ↓
POST /notifications/admin/{id}/send
    ↓
Backend يبحث عن Device Tokens للمستخدم
    ↓
Backend يرسل عبر FCM إلى Firebase
    ↓
Firebase يرسل إلى الأجهزة المسجلة
    ↓
تطبيق Flutter يستقبل الإشعار
    ↓
يظهر الإشعار للمستخدم
```

### 📋 البيانات المطلوبة للإرسال

عند إنشاء إشعار من لوحة التحكم، تأكد من:

1. **`channel`**: يجب أن يكون `"push"` لإرسال Push Notification
2. **`recipientId`**: معرف المستخدم المستلم (مطلوب)
3. **`title`** و **`message`**: محتوى الإشعار
4. **`data`**: بيانات إضافية (اختياري) مثل:
   ```json
   {
     "orderId": "order_123",
     "productId": "product_456",
     "serviceId": "service_789"
   }
   ```

### ✅ التحقق من نجاح الإرسال

بعد إرسال الإشعار، يمكنك التحقق من:

1. **في لوحة التحكم:**
   - حالة الإشعار (sent, delivered, failed)
   - وقت الإرسال
   - أي أخطاء حدثت

2. **في تطبيق Flutter:**
   - يجب أن يظهر الإشعار للمستخدم
   - يمكن التحقق من سجل الإشعارات في التطبيق

### ⚠️ ملاحظات مهمة

1. **Device Token مطلوب:**
   - يجب أن يكون المستخدم قد سجل جهازه أولاً
   - بدون Device Token، لن يتم إرسال الإشعار

2. **Channel مهم:**
   - استخدم `"push"` للإشعارات الفورية
   - استخدم `"inApp"` للإشعارات داخل التطبيق فقط

3. **الأذونات:**
   - يجب أن يكون المستخدم قد منح أذونات الإشعارات
   - على Android 13+، يجب طلب الأذونات صراحة

4. **الحالة:**
   - الإشعارات تُحفظ في قاعدة البيانات أولاً
   - ثم تُرسل عبر FCM
   - يمكن تتبع حالة كل إشعار

---

## 📝 ملاحظات مهمة

1. **أنواع الإشعارات (43 نوع):**
   - **Order**: ORDER_CONFIRMED, ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED, ORDER_REFUNDED
   - **Service**: SERVICE_REQUEST_OPENED, NEW_ENGINEER_OFFER, OFFER_ACCEPTED, SERVICE_STARTED, SERVICE_COMPLETED, SERVICE_RATED, SERVICE_REQUEST_CANCELLED
   - **Product**: PRODUCT_BACK_IN_STOCK, PRODUCT_PRICE_DROP, LOW_STOCK, OUT_OF_STOCK
   - **Promotion**: PROMOTION_STARTED, PROMOTION_ENDING
   - **Account**: ACCOUNT_VERIFIED, PASSWORD_CHANGED, LOGIN_ATTEMPT
   - **Support**: TICKET_CREATED, TICKET_UPDATED, TICKET_RESOLVED
   - **System**: SYSTEM_MAINTENANCE, NEW_FEATURE, SYSTEM_ALERT
   - **Marketing**: WELCOME_NEW_USER, BIRTHDAY_GREETING, CART_ABANDONMENT
   - **Payment**: PAYMENT_FAILED, PAYMENT_SUCCESS

2. **حالات الإشعارات (11 حالة):**
   - `pending`: في الانتظار
   - `queued`: في الصف
   - `sending`: جاري الإرسال
   - `sent`: تم الإرسال
   - `delivered`: تم التسليم
   - `read`: مقروء
   - `clicked`: تم النقر عليه
   - `failed`: فشل
   - `bounced`: مرتد
   - `rejected`: مرفوض
   - `cancelled`: ملغي

3. **قنوات الإشعارات:**
   - `inApp`: داخل التطبيق
   - `push`: الإشعارات الفورية
   - `sms`: الرسائل النصية
   - `email`: البريد الإلكتروني
   - `dashboard`: لوحة التحكم

4. **الأولويات:**
   - `low`: منخفضة
   - `medium`: متوسطة
   - `high`: عالية
   - `urgent`: عاجلة

5. **الفئات:**
   - `order`: طلبات
   - `product`: منتجات
   - `service`: خدمات
   - `promotion`: عروض
   - `account`: حساب
   - `system`: نظام
   - `support`: دعم
   - `payment`: دفع
   - `marketing`: تسويق

6. **البيانات الإضافية:**
   - `data`: بيانات إضافية (orderId, productId, userId, serviceId, ticketId)
   - `recipientId`: معرف المستلم
   - `recipientEmail`: بريد المستلم
   - `recipientPhone`: هاتف المستلم
   - `templateId`/`templateKey`: معلومات القالب
   - `scheduledFor`: موعد الإرسال المجدول
   - `sentAt`: وقت الإرسال
   - `deliveredAt`: وقت التسليم
   - `readAt`: وقت القراءة
   - `clickedAt`: وقت النقر
   - `failedAt`: وقت الفشل
   - `errorMessage`/`errorCode`: معلومات الخطأ
   - `retryCount`/`nextRetryAt`: معلومات إعادة المحاولة
   - `trackingId`/`externalId`: معلومات التتبع
   - `metadata`: بيانات وصفية (provider, cost, credits, campaign, tags)

7. **التحقق من الفئة:**
   - `isOrderType`: إشعار طلب
   - `isServiceType`: إشعار خدمة
   - `isProductType`: إشعار منتج
   - `isPromotionType`: إشعار عرض
   - `isAccountType`: إشعار حساب
   - `isSystemType`: إشعار نظام
   - `isSupportType`: إشعار دعم
   - `isPaymentType`: إشعار دفع
   - `isMarketingType`: إشعار تسويقي

8. **التحقق من الحالة:**
   - `isPending`, `isQueued`, `isSending`, `isSent`, `isDelivered`
   - `isRead`, `isClicked`, `isFailed`, `isBounced`, `isRejected`, `isCancelled`
   - `isUnread`: غير مقروء

9. **التحقق من القناة:**
   - `isInApp`: داخل التطبيق
   - `isEmail`: بريد إلكتروني
   - `isSms`: رسالة نصية
   - `isPush`: إشعار فوري
   - `isDashboard`: لوحة تحكم

10. **التحقق من الأولوية:**
    - `isLowPriority`: منخفضة
    - `isMediumPriority`: متوسطة
    - `isHighPriority`: عالية
    - `isUrgent`: عاجلة

11. **التحقق من البيانات:**
    - `hasRecipient`, `hasEmail`, `hasPhone`: معلومات المستلم
    - `hasTemplate`, `hasError`, `hasRetries`: معلومات الإرسال
    - `isScheduled`, `hasCreator`, `isSystemGenerated`: معلومات النظام
    - `hasTracking`, `hasExternalId`, `hasMetadata`: معلومات التتبع

12. **استخراج البيانات:**
    - `orderId`, `orderNumber`: بيانات الطلب
    - `productId`: بيانات المنتج
    - `userId`: بيانات المستخدم
    - `serviceId`: بيانات الخدمة
    - `ticketId`: بيانات التذكرة
    - `hasOrderData`, `hasProductData`, `hasUserData`, `hasServiceData`, `hasTicketData`

13. **استخراج Metadata:**
    - `provider`: مزود الخدمة
    - `cost`: تكلفة الإرسال
    - `credits`: الأرصدة المستخدمة
    - `campaign`: اسم الحملة
    - `tags`: وسوم الإشعار

14. **التوقيت:**
    - `displayDate`: تاريخ العرض (readAt ?? deliveredAt ?? sentAt ?? createdAt)
    - `isRecent`: حديث (أقل من 7 أيام)
    - `isOld`: قديم (أكثر من 30 يوم)

15. **الصفحات:**
    - `PaginatedNotifications`: للنتائج مع الصفحات الكاملة
    - `page`, `limit`, `totalPages`, `hasNextPage`, `hasPrevPage`
    - `hasNotifications`, `isEmpty`, `count`
    - `unreadNotifications`, `readNotifications`
    - `unreadCount`, `readCount`
    - `isFirstPage`, `isLastPage`

16. **الاستخدام:**
    - استخدم `getMessage(locale)` للحصول على الرسالة حسب اللغة
    - استخدم category helpers للتحقق من الفئة (isOrderType, isServiceType, إلخ)
    - استخدم `isRead`, `isUnread` للتحقق من القراءة
    - استخدم channel helpers للتمييز بين القنوات
    - استخدم priority helpers للتحقق من الأولوية

17. **البيانات:**
    - استخدم `orderId`, `orderNumber` لبيانات الطلب
    - استخدم `productId`, `userId`, `serviceId`, `ticketId` لبيانات أخرى
    - استخدم data helpers (hasOrderData, hasProductData, إلخ) للتحقق
    - استخدم metadata helpers (provider, cost, campaign, tags)

18. **التوقيت:**
    - استخدم `displayDate` لعرض التاريخ (ذكي - يختار الأفضل)
    - استخدم `isRecent`, `isOld` للتصنيف الزمني
    - استخدم `sentAt`, `deliveredAt`, `readAt`, `clickedAt` للتوقيتات المحددة

19. **التحسين:**
    - استخدم `hasNextPage`, `hasPrevPage` للتنقل
    - استخدم `isFirstPage`, `isLastPage` للتحقق
    - استخدم `unreadCount` في الـ badge
    - استخدم `isUrgent` لتمييز الإشعارات العاجلة

---

## 🔄 Notes on Update

**التغييرات الرئيسية:**
1. ✅ تصحيح Endpoint - `/notifications` بدلاً من `/notifications/history`
2. ✅ تصحيح mark-read endpoint - `/notifications/mark-read` مع body (notificationIds array)
3. ✅ تصحيح mark-all-read endpoint - `/notifications/mark-all-read`
4. ✅ تصحيح unread-count response - `{ unreadCount: number }` بدلاً من البنية المعقدة
5. ✅ تصحيح Response Structure - إضافة pagination fields في نفس المستوى
6. ✅ **إضافة WebSocket للإشعارات الفورية**:
   - Namespace: `/notifications`
   - Events: `notification:new`, `unread-count`, `marked-as-read`, `marked-all-as-read`
   - Commands: `ping`, `get-unread-count`, `mark-as-read`, `mark-all-as-read`
   - Real-time notifications بدون polling
7. ✅ **توسيع كبير في الـ Enums**:
   - NotificationType: من 6 أنواع إلى 43 نوع
   - NotificationStatus: من 4 حالات إلى 11 حالة
   - NotificationChannel: إضافة inApp
   - إضافة NotificationPriority (4 levels)
   - إضافة NotificationCategory (9 فئات)
7. ✅ **توسيع نموذج Notification**:
   - إضافة priority, category
   - إضافة templateId, templateKey
   - إضافة deliveredAt, clickedAt, failedAt
   - إضافة errorCode, nextRetryAt
   - إضافة trackingId, externalId
   - إضافة metadata object
8. ✅ تحديث PaginatedNotifications - إضافة pagination fields كـ properties
9. ✅ إزالة UnreadCount model - يتم إرجاع عدد فقط

**ملاحظات مهمة:**
- الـ endpoint الأساسي هو `/notifications` (وليس `/notifications/history`)
- mark-read يأخذ array من IDs (يمكن تحديد متعدد)
- unread-count يعيد رقم فقط (بدون تفاصيل)
- `category` يتم تحديدها تلقائياً من `type` في Backend
- `status` الافتراضي: `pending`، وليس boolean `isRead`

**ملفات Backend المرجعية:**
- `backend/src/modules/notifications/controllers/unified-notification.controller.ts` - جميع endpoints
- `backend/src/modules/notifications/services/notification.service.ts` - المنطق
- `backend/src/modules/notifications/schemas/unified-notification.schema.ts` - Schema
- `backend/src/modules/notifications/enums/notification.enums.ts` - جميع Enums

---

**التالي:** [خدمة الطلبات الهندسية (Services)](./15-services-service.md)


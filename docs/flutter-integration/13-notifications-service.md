# 🔔 خدمة الإشعارات (Notifications Service)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: أكتوبر 2025

خدمة الإشعارات توفر endpoints لإدارة الإشعارات وتسجيل الأجهزة مع دعم قنوات متعددة.

---

## 📋 جدول المحتويات

1. [قائمة الإشعارات](#1-قائمة-الإشعارات)
2. [تحديد كمقروء (متعدد)](#2-تحديد-كمقروء-متعدد)
3. [تحديد الكل كمقروء](#3-تحديد-الكل-كمقروء)
4. [عدد الإشعارات غير المقروءة](#4-عدد-الإشعارات-غير-المقروءة)
5. [Models في Flutter](#models-في-flutter)

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

## Firebase Cloud Messaging (FCM) Integration

### 1. إضافة Firebase للمشروع

في `pubspec.yaml`:
```yaml
dependencies:
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.6
```

### 2. تهيئة Firebase

```dart
// lib/main.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('Handling background message: ${message.messageId}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  
  runApp(MyApp());
}
```

### 3. طلب الأذونات وتسجيل الجهاز

```dart
class NotificationsService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final ApiClient _apiClient;

  NotificationsService(this._apiClient);

  Future<void> initialize() async {
    // طلب الأذونات
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('User granted permission');
      
      // الحصول على التوكن
      String? token = await _fcm.getToken();
      if (token != null) {
        await registerDevice(token);
      }

      // الاستماع لتحديثات التوكن
      _fcm.onTokenRefresh.listen(registerDevice);
      
      // الاستماع للإشعارات
      setupNotificationListeners();
    }
  }

  Future<void> registerDevice(String token) async {
    try {
      final deviceInfo = await getDeviceInfo();
      final registration = DeviceRegistration(
        deviceToken: token,
        platform: Platform.isAndroid ? 'ANDROID' : 'IOS',
        deviceId: deviceInfo.id,
        deviceName: deviceInfo.name,
      );

      await _apiClient.dio.post(
        '/devices/register',
        data: registration.toJson(),
      );
    } catch (e) {
      print('Error registering device: $e');
    }
  }

  void setupNotificationListeners() {
    // عند استلام إشعار والتطبيق مفتوح
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Got a message whilst in the foreground!');
      print('Message data: ${message.data}');

      if (message.notification != null) {
        _showLocalNotification(message);
      }
    });

    // عند النقر على الإشعار والتطبيق في الخلفية
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('Message clicked!');
      _handleNotificationClick(message);
    });

    // التحقق من الإشعار الذي فتح التطبيق
    _fcm.getInitialMessage().then((RemoteMessage? message) {
      if (message != null) {
        _handleNotificationClick(message);
      }
    });
  }

  void _handleNotificationClick(RemoteMessage message) {
    final data = message.data;
    
    if (data['orderId'] != null) {
      // الانتقال لصفحة الطلب
      // navigatorKey.currentState?.pushNamed('/order/${data['orderId']}');
    }
  }

  void _showLocalNotification(RemoteMessage message) {
    // عرض إشعار محلي باستخدام flutter_local_notifications
  }
}
```

### 4. استخدام الخدمة

راجع الـ Flutter code examples في الأقسام أعلاه لكل endpoint.

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
6. ✅ **توسيع كبير في الـ Enums**:
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


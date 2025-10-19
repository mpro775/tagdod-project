# 🔔 خدمة الإشعارات (Notifications Service)

خدمة الإشعارات توفر endpoints لإدارة الإشعارات وتسجيل الأجهزة مع دعم قنوات متعددة.

---

## 📋 جدول المحتويات

1. [قائمة الإشعارات](#1-قائمة-الإشعارات)
2. [تحديد كمقروء](#2-تحديد-كمقروء)
3. [تحديد الكل كمقروء](#3-تحديد-الكل-كمقروء)
4. [عدد الإشعارات غير المقروءة](#4-عدد-الإشعارات-غير-المقروءة)
5. [Models في Flutter](#models-في-flutter)

---

## 1. قائمة الإشعارات

يسترجع قائمة إشعارات المستخدم مع إمكانية الفلترة والترقيم.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/notifications/history`
- **Auth Required:** ✅ نعم
- **Cache:** ✅ نعم (5 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `limit` | `number` | ❌ | عدد العناصر (افتراضي: 20) |
| `offset` | `number` | ❌ | الإزاحة (افتراضي: 0) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "64notif123",
        "type": "ORDER_STATUS",
        "title": "تم شحن طلبك",
        "message": "طلب رقم ORD-2025-001234 في الطريق إليك",
        "messageEn": "Order #ORD-2025-001234 is on its way",
        "data": {
          "orderId": "order_123",
          "orderNumber": "ORD-2025-001234"
        },
        "channel": "push",
        "status": "sent",
        "recipientId": "64user123",
        "recipientEmail": "user@example.com",
        "recipientPhone": "+967123456789",
        "sentAt": "2025-01-15T14:30:00.000Z",
        "readAt": null,
        "errorMessage": null,
        "retryCount": 0,
        "scheduledFor": "2025-01-15T14:30:00.000Z",
        "createdBy": "64admin123",
        "isSystemGenerated": true,
        "createdAt": "2025-01-15T14:30:00.000Z",
        "updatedAt": "2025-01-15T14:30:00.000Z"
      }
    ],
    "total": 45
  },
  "requestId": "req_notif_001"
}
```

### كود Flutter

```dart
Future<PaginatedNotifications> getNotifications({
  int limit = 20,
  int offset = 0,
}) async {
  final response = await _dio.get('/notifications/history', queryParameters: {
    'limit': limit,
    'offset': offset,
  });

  final apiResponse = ApiResponse<PaginatedNotifications>.fromJson(
    response.data,
    (json) => PaginatedNotifications.fromJson(json),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. تحديد كمقروء

يحدد إشعار محدد كمقروء.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/notifications/:id/read`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "modified": true
  },
  "requestId": "req_notif_002"
}
```

### كود Flutter

```dart
Future<bool> markAsRead(String notificationId) async {
  final response = await _dio.post('/notifications/$notificationId/read');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['modified'] ?? false;
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
- **Endpoint:** `/notifications/read-all`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "modifiedCount": 5
  },
  "requestId": "req_notif_003"
}
```

### كود Flutter

```dart
Future<int> markAllAsRead() async {
  final response = await _dio.post('/notifications/read-all');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['modifiedCount'] ?? 0;
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
  "data": {
    "total": 5,
    "byType": {
      "LOW_STOCK": 1,
      "OUT_OF_STOCK": 0,
      "ORDER_STATUS": 2,
      "PAYMENT_FAILED": 0,
      "SYSTEM_ALERT": 1,
      "PROMOTION": 1
    },
    "byChannel": {
      "email": 2,
      "sms": 1,
      "push": 3,
      "dashboard": 5
    }
  },
  "requestId": "req_notif_004"
}
```

### كود Flutter

```dart
Future<UnreadCount> getUnreadCount() async {
  final response = await _dio.get('/notifications/unread-count');

  final apiResponse = ApiResponse<UnreadCount>.fromJson(
    response.data,
    (json) => UnreadCount.fromJson(json),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
  lowStock,
  outOfStock,
  orderStatus,
  paymentFailed,
  systemAlert,
  promotion,
}

enum NotificationStatus {
  pending,
  sent,
  failed,
  read,
}

enum NotificationChannel {
  email,
  sms,
  push,
  dashboard,
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
  final String? recipientId;
  final String? recipientEmail;
  final String? recipientPhone;
  final DateTime? sentAt;
  final DateTime? readAt;
  final String? errorMessage;
  final int retryCount;
  final DateTime? scheduledFor;
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
    this.recipientId,
    this.recipientEmail,
    this.recipientPhone,
    this.sentAt,
    this.readAt,
    this.errorMessage,
    required this.retryCount,
    this.scheduledFor,
    this.createdBy,
    required this.isSystemGenerated,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Notification.fromJson(Map<String, dynamic> json) {
    return Notification(
      id: json['_id'] ?? '',
      type: NotificationType.values.firstWhere(
        (e) => e.name.toUpperCase() == json['type'],
        orElse: () => NotificationType.systemAlert,
      ),
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      messageEn: json['messageEn'] ?? '',
      data: Map<String, dynamic>.from(json['data'] ?? {}),
      channel: NotificationChannel.values.firstWhere(
        (e) => e.name == json['channel'],
        orElse: () => NotificationChannel.dashboard,
      ),
      status: NotificationStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => NotificationStatus.pending,
      ),
      recipientId: json['recipientId'],
      recipientEmail: json['recipientEmail'],
      recipientPhone: json['recipientPhone'],
      sentAt: json['sentAt'] != null ? DateTime.parse(json['sentAt']) : null,
      readAt: json['readAt'] != null ? DateTime.parse(json['readAt']) : null,
      errorMessage: json['errorMessage'],
      retryCount: json['retryCount'] ?? 0,
      scheduledFor: json['scheduledFor'] != null ? DateTime.parse(json['scheduledFor']) : null,
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

  bool get isLowStock => type == NotificationType.lowStock;
  bool get isOutOfStock => type == NotificationType.outOfStock;
  bool get isOrderStatus => type == NotificationType.orderStatus;
  bool get isPaymentFailed => type == NotificationType.paymentFailed;
  bool get isSystemAlert => type == NotificationType.systemAlert;
  bool get isPromotion => type == NotificationType.promotion;
  
  bool get isPending => status == NotificationStatus.pending;
  bool get isSent => status == NotificationStatus.sent;
  bool get isFailed => status == NotificationStatus.failed;
  bool get isRead => status == NotificationStatus.read;
  bool get isUnread => !isRead;
  
  bool get isEmail => channel == NotificationChannel.email;
  bool get isSms => channel == NotificationChannel.sms;
  bool get isPush => channel == NotificationChannel.push;
  bool get isDashboard => channel == NotificationChannel.dashboard;
  
  bool get hasRecipient => recipientId != null;
  bool get hasEmail => recipientEmail != null && recipientEmail!.isNotEmpty;
  bool get hasPhone => recipientPhone != null && recipientPhone!.isNotEmpty;
  bool get hasError => errorMessage != null && errorMessage!.isNotEmpty;
  bool get hasRetries => retryCount > 0;
  bool get isScheduled => scheduledFor != null;
  bool get hasCreator => createdBy != null;
  bool get isSystemGenerated => isSystemGenerated;
  
  String? get orderId => data['orderId']?.toString();
  String? get orderNumber => data['orderNumber']?.toString();
  String? get productId => data['productId']?.toString();
  String? get userId => data['userId']?.toString();
  
  bool get hasOrderData => orderId != null || orderNumber != null;
  bool get hasProductData => productId != null;
  bool get hasUserData => userId != null;
  
  DateTime get displayDate => readAt ?? sentAt ?? createdAt;
  bool get isRecent => DateTime.now().difference(displayDate).inDays < 7;
  bool get isOld => DateTime.now().difference(displayDate).inDays > 30;
}

class PaginatedNotifications {
  final List<Notification> notifications;
  final int total;

  PaginatedNotifications({
    required this.notifications,
    required this.total,
  });

  factory PaginatedNotifications.fromJson(Map<String, dynamic> json) {
    return PaginatedNotifications(
      notifications: (json['notifications'] as List)
          .map((item) => Notification.fromJson(item))
          .toList(),
      total: json['total'] ?? 0,
    );
  }

  bool get hasNotifications => notifications.isNotEmpty;
  bool get isEmpty => notifications.isEmpty;
  int get count => notifications.length;
  List<Notification> get unreadNotifications => notifications.where((n) => n.isUnread).toList();
  List<Notification> get readNotifications => notifications.where((n) => n.isRead).toList();
  int get unreadCount => unreadNotifications.length;
  int get readCount => readNotifications.length;
}

class UnreadCount {
  final int total;
  final Map<String, int> byType;
  final Map<String, int> byChannel;

  UnreadCount({
    required this.total,
    required this.byType,
    required this.byChannel,
  });

  factory UnreadCount.fromJson(Map<String, dynamic> json) {
    return UnreadCount(
      total: json['total'] ?? 0,
      byType: Map<String, int>.from(json['byType'] ?? {}),
      byChannel: Map<String, int>.from(json['byChannel'] ?? {}),
    );
  }

  int getTypeCount(NotificationType type) => byType[type.name.toUpperCase()] ?? 0;
  int getChannelCount(NotificationChannel channel) => byChannel[channel.name] ?? 0;
  
  int get lowStockCount => getTypeCount(NotificationType.lowStock);
  int get outOfStockCount => getTypeCount(NotificationType.outOfStock);
  int get orderStatusCount => getTypeCount(NotificationType.orderStatus);
  int get paymentFailedCount => getTypeCount(NotificationType.paymentFailed);
  int get systemAlertCount => getTypeCount(NotificationType.systemAlert);
  int get promotionCount => getTypeCount(NotificationType.promotion);
  
  int get emailCount => getChannelCount(NotificationChannel.email);
  int get smsCount => getChannelCount(NotificationChannel.sms);
  int get pushCount => getChannelCount(NotificationChannel.push);
  int get dashboardCount => getChannelCount(NotificationChannel.dashboard);
  
  bool get hasUnread => total > 0;
  bool get hasLowStock => lowStockCount > 0;
  bool get hasOutOfStock => outOfStockCount > 0;
  bool get hasOrderStatus => orderStatusCount > 0;
  bool get hasPaymentFailed => paymentFailedCount > 0;
  bool get hasSystemAlert => systemAlertCount > 0;
  bool get hasPromotion => promotionCount > 0;
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

```dart
// في Repository
Future<List<Notification>> getNotifications({
  int page = 1,
  int limit = 20,
  String? channel,
}) async {
  final queryParams = {
    'page': page,
    'limit': limit,
    if (channel != null) 'channel': channel,
  };

  final response = await _dio.get(
    '/notifications',
    queryParameters: queryParams,
  );

  final apiResponse = ApiResponse<List<Notification>>.fromJson(
    response.data,
    (json) => ((json as Map<String, dynamic>)['data'] as List)
        .map((item) => Notification.fromJson(item))
        .toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}

Future<UnreadCount> getUnreadCount() async {
  final response = await _dio.get('/notifications/unread-count');

  final apiResponse = ApiResponse<UnreadCount>.fromJson(
    response.data,
    (json) => UnreadCount.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}

Future<void> markAsRead(List<String> ids) async {
  await _dio.post(
    '/notifications/read',
    data: {'ids': ids},
  );
}

Future<void> markAllAsRead({String? channel}) async {
  await _dio.post(
    '/notifications/read-all',
    data: {
      if (channel != null) 'channel': channel,
    },
  );
}
```

---

## 📝 ملاحظات مهمة

1. **أنواع الإشعارات:**
   - `LOW_STOCK`: تنبيه مخزون منخفض
   - `OUT_OF_STOCK`: تنبيه نفاد المخزون
   - `ORDER_STATUS`: إشعارات الطلبات
   - `PAYMENT_FAILED`: فشل الدفع
   - `SYSTEM_ALERT`: إشعارات النظام
   - `PROMOTION`: العروض والخصومات

2. **حالات الإشعارات:**
   - `pending`: في الانتظار
   - `sent`: تم الإرسال
   - `failed`: فشل الإرسال
   - `read`: مقروء

3. **قنوات الإشعارات:**
   - `email`: البريد الإلكتروني
   - `sms`: الرسائل النصية
   - `push`: الإشعارات الفورية
   - `dashboard`: لوحة التحكم

4. **البيانات الإضافية:**
   - `data`: بيانات إضافية (orderId, productId, userId)
   - `recipientId`: معرف المستلم
   - `recipientEmail`: بريد المستلم
   - `recipientPhone`: هاتف المستلم
   - `sentAt`: وقت الإرسال
   - `readAt`: وقت القراءة
   - `errorMessage`: رسالة الخطأ
   - `retryCount`: عدد المحاولات

5. **التحقق من الصحة:**
   - `isLowStock`: تنبيه مخزون منخفض
   - `isOutOfStock`: تنبيه نفاد المخزون
   - `isOrderStatus`: إشعار طلب
   - `isPaymentFailed`: فشل دفع
   - `isSystemAlert`: إشعار نظام
   - `isPromotion`: إشعار عرض

6. **الحالة:**
   - `isPending`: في الانتظار
   - `isSent`: تم الإرسال
   - `isFailed`: فشل الإرسال
   - `isRead`: مقروء
   - `isUnread`: غير مقروء

7. **القناة:**
   - `isEmail`: بريد إلكتروني
   - `isSms`: رسالة نصية
   - `isPush`: إشعار فوري
   - `isDashboard`: لوحة تحكم

8. **البيانات:**
   - `hasRecipient`: له مستلم
   - `hasEmail`: له بريد إلكتروني
   - `hasPhone`: له هاتف
   - `hasError`: له خطأ
   - `hasRetries`: له محاولات
   - `isScheduled`: مجدول
   - `hasCreator`: له منشئ
   - `isSystemGenerated`: منشأ تلقائياً

9. **البيانات الإضافية:**
   - `orderId`: معرف الطلب
   - `orderNumber`: رقم الطلب
   - `productId`: معرف المنتج
   - `userId`: معرف المستخدم
   - `hasOrderData`: له بيانات طلب
   - `hasProductData`: له بيانات منتج
   - `hasUserData`: له بيانات مستخدم

10. **التوقيت:**
    - `displayDate`: تاريخ العرض
    - `isRecent`: حديث (أقل من 7 أيام)
    - `isOld`: قديم (أكثر من 30 يوم)

11. **الصفحات:**
    - `PaginatedNotifications`: للنتائج مع الصفحات
    - `hasNotifications`: له إشعارات
    - `isEmpty`: فارغ
    - `unreadNotifications`: إشعارات غير مقروءة
    - `readNotifications`: إشعارات مقروءة
    - `unreadCount`: عدد غير مقروء
    - `readCount`: عدد مقروء

12. **العدد:**
    - `UnreadCount`: عدد الإشعارات غير المقروءة
    - `byType`: حسب النوع
    - `byChannel`: حسب القناة
    - `getTypeCount()`: عدد حسب النوع
    - `getChannelCount()`: عدد حسب القناة

13. **الاستخدام:**
    - استخدم `getMessage(locale)` للحصول على الرسالة حسب اللغة
    - استخدم `isLowStock`, `isOutOfStock`, `isOrderStatus` للتمييز
    - استخدم `isRead`, `isUnread` للتحقق من القراءة
    - استخدم `isEmail`, `isSms`, `isPush` للتمييز بين القنوات

14. **البيانات:**
    - استخدم `orderId`, `orderNumber` لبيانات الطلب
    - استخدم `productId` لبيانات المنتج
    - استخدم `userId` لبيانات المستخدم
    - استخدم `hasOrderData`, `hasProductData`, `hasUserData` للتحقق

15. **التوقيت:**
    - استخدم `displayDate` لعرض التاريخ
    - استخدم `isRecent` للإشعارات الحديثة
    - استخدم `isOld` للإشعارات القديمة
    - استخدم `sentAt`, `readAt` للتوقيتات المحددة

16. **التحسين:**
    - استخدم `unreadCount` لعرض العدد
    - استخدم `byType` للفلترة حسب النوع
    - استخدم `byChannel` للفلترة حسب القناة
    - استخدم `hasUnread` للتحقق من وجود إشعارات غير مقروءة

---

**التالي:** [خدمة الطلبات الهندسية (Services)](./15-services-service.md)


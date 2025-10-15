# 🔔 خدمة الإشعارات (Notifications Service)

خدمة الإشعارات توفر endpoints لإدارة الإشعارات وتسجيل الأجهزة.

---

## Endpoints

### 1. قائمة الإشعارات
- **GET** `/notifications?page=1&limit=20&channel=ORDER`
- **Auth:** ✅ Required
- **Query Parameters:**
  - `page`: رقم الصفحة (optional)
  - `limit`: عدد العناصر (optional)
  - `channel`: نوع الإشعار - `ORDER`, `PROMOTION`, `SYSTEM` (optional)

- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "notif_123",
      "userId": "user_456",
      "channel": "ORDER",
      "title": {
        "ar": "تم شحن طلبك",
        "en": "Your order has been shipped"
      },
      "body": {
        "ar": "طلب رقم ORD-2025-001234 في الطريق إليك",
        "en": "Order #ORD-2025-001234 is on its way"
      },
      "data": {
        "orderId": "order_123",
        "orderNumber": "ORD-2025-001234"
      },
      "isRead": false,
      "createdAt": "2025-10-15T14:30:00.000Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### 2. عدد الإشعارات غير المقروءة
- **GET** `/notifications/unread-count`
- **Auth:** ✅ Required
- **Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "byChannel": {
      "ORDER": 2,
      "PROMOTION": 3,
      "SYSTEM": 0
    }
  }
}
```

### 3. تحديد كمقروء
- **POST** `/notifications/read`
- **Auth:** ✅ Required
- **Body:**
```json
{
  "ids": ["notif_123", "notif_124"]
}
```

### 4. تحديد الكل كمقروء
- **POST** `/notifications/read-all`
- **Auth:** ✅ Required
- **Body:**
```json
{
  "channel": "ORDER"
}
```
> إذا لم يتم تحديد `channel`، سيتم تحديد جميع الإشعارات كمقروءة.

### 5. تسجيل جهاز للإشعارات (FCM)
- **POST** `/devices/register`
- **Auth:** ✅ Required
- **Body:**
```json
{
  "deviceToken": "fcm_token_here",
  "platform": "ANDROID",
  "deviceId": "device_abc123",
  "deviceName": "Samsung Galaxy S21"
}
```

- **Response:**
```json
{
  "success": true,
  "data": {
    "id": "device_reg_123"
  }
}
```

### 6. حذف تسجيل جهاز
- **DELETE** `/devices/:id`
- **Auth:** ✅ Required

---

## Models في Flutter

```dart
class Notification {
  final String id;
  final String userId;
  final String channel;
  final LocalizedString title;
  final LocalizedString body;
  final Map<String, dynamic>? data;
  final bool isRead;
  final DateTime createdAt;

  Notification({
    required this.id,
    required this.userId,
    required this.channel,
    required this.title,
    required this.body,
    this.data,
    required this.isRead,
    required this.createdAt,
  });

  factory Notification.fromJson(Map<String, dynamic> json) {
    return Notification(
      id: json['_id'],
      userId: json['userId'],
      channel: json['channel'],
      title: LocalizedString.fromJson(json['title']),
      body: LocalizedString.fromJson(json['body']),
      data: json['data'],
      isRead: json['isRead'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  bool get isOrder => channel == 'ORDER';
  bool get isPromotion => channel == 'PROMOTION';
  bool get isSystem => channel == 'SYSTEM';
}

class UnreadCount {
  final int total;
  final Map<String, int> byChannel;

  UnreadCount({
    required this.total,
    required this.byChannel,
  });

  factory UnreadCount.fromJson(Map<String, dynamic> json) {
    return UnreadCount(
      total: json['total'] ?? 0,
      byChannel: Map<String, int>.from(json['byChannel'] ?? {}),
    );
  }

  int getChannelCount(String channel) => byChannel[channel] ?? 0;
}

class DeviceRegistration {
  final String deviceToken;
  final String platform; // ANDROID, IOS
  final String deviceId;
  final String? deviceName;

  DeviceRegistration({
    required this.deviceToken,
    required this.platform,
    required this.deviceId,
    this.deviceName,
  });

  Map<String, dynamic> toJson() {
    return {
      'deviceToken': deviceToken,
      'platform': platform,
      'deviceId': deviceId,
      if (deviceName != null) 'deviceName': deviceName,
    };
  }
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

1. **FCM Token:**
   - احفظ التوكن عند كل تسجيل دخول
   - حدّث التوكن عند التغيير (`onTokenRefresh`)
   - احذف التوكن عند تسجيل الخروج

2. **أنواع الإشعارات:**
   - `ORDER`: إشعارات الطلبات
   - `PROMOTION`: العروض والخصومات
   - `SYSTEM`: إشعارات النظام

3. **معالجة الإشعارات:**
   - `onMessage`: التطبيق مفتوح
   - `onMessageOpenedApp`: التطبيق في الخلفية
   - `getInitialMessage`: التطبيق مغلق

4. **الأذونات:**
   - اطلب الأذونات عند أول استخدام
   - اشرح للمستخدم فائدة الإشعارات
   - احترم اختيار المستخدم

---

**التالي:** [خدمة الطلبات الهندسية (Services)](./15-services-service.md)


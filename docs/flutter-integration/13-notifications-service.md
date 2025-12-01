# 🔔 خدمة الإشعارات (Notifications Service)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: ديسمبر 2024  
> 🆕 **محدث**: مطابق تماماً للـ Backend - شرح مفصل للقنوات (IN_APP vs PUSH)

خدمة الإشعارات توفر endpoints لإدارة الإشعارات وتسجيل الأجهزة مع دعم قنوات متعددة.

---

## 🎯 فهم قنوات الإشعارات

### القنوات المتاحة

| القناة | الاستخدام | آلية الإرسال |
|--------|----------|-------------|
| `inApp` | المستخدم داخل التطبيق | WebSocket فقط |
| `push` | المستخدم خارج التطبيق | FCM (Firebase Cloud Messaging) |
| `dashboard` | الإداريين | WebSocket |
| `sms` | رسائل نصية | SMS Provider |
| `email` | بريد إلكتروني | SMTP |

### الفرق بين IN_APP و PUSH

```
┌─────────────────────────────────────────────────────────────────────┐
│                         IN_APP (inApp)                              │
│                                                                     │
│  المستخدم متصل بالتطبيق (WebSocket)                                  │
│                                                                     │
│  Backend                WebSocket                Flutter App        │
│    │                       │                        │               │
│    │──── notification:new ─┴────────────────────►│ │               │
│    │                                               │ │ يظهر فوراً   │
│    │                                               │ │ في التطبيق   │
│                                                                     │
│  ✅ فوري - لا يحتاج FCM Token                                        │
│  ✅ يعمل فقط إذا المستخدم متصل                                        │
│  ❌ لا يعمل إذا التطبيق مغلق                                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          PUSH (push)                                │
│                                                                     │
│  المستخدم خارج التطبيق (FCM)                                        │
│                                                                     │
│  Backend       FCM       Firebase      Device      Flutter App      │
│    │            │           │            │              │           │
│    │──Send──►│  │           │            │              │           │
│    │            │───────►│  │            │              │           │
│    │            │           │────────►│  │              │           │
│    │            │           │            │──────────►│  │           │
│    │            │           │            │              │ إشعار     │
│    │            │           │            │              │ notification│
│                                                                     │
│  ✅ يعمل حتى لو التطبيق مغلق                                        │
│  ✅ يظهر في شريط الإشعارات                                          │
│  ❗ يحتاج تسجيل FCM Token أولاً                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 السيناريو الكامل للإشعارات

### 1. تسجيل الجهاز (من Flutter) - مطلوب لـ PUSH فقط

```
المستخدم يفتح التطبيق
    ↓
Flutter يحصل على FCM Token من Firebase
    ↓
Flutter يرسل Token للـ Backend:
POST /notifications/devices/register
{
  "platform": "android",
  "token": "fcm_token_here",
  "userAgent": "Android 13",
  "appVersion": "1.0.0"
}
    ↓
Backend يحفظ Token في قاعدة البيانات مع userId
    ↓
الآن المستخدم مستعد لاستقبال Push Notifications
```

### 2. إرسال إشعار IN_APP (المستخدم داخل التطبيق)

```
النظام ينشئ إشعار بـ channel: "inApp":
POST /notifications/admin/create
{
  "type": "ORDER_CONFIRMED",
  "channel": "inApp",
  "recipientId": "user_id",
  "title": "تم تأكيد طلبك",
  "message": "طلبك رقم #123 تم تأكيده"
}
    ↓
Backend يحفظ الإشعار في قاعدة البيانات
    ↓
Backend يرسل عبر WebSocket:
this.webSocketService.sendToUser(recipientId, 'notification:new', {...})
    ↓
Flutter يستقبل الحدث (إذا متصل):
socket.on('notification:new', (data) => { ... })
    ↓
التطبيق يعرض الإشعار للمستخدم
```

### 3. إرسال إشعار PUSH (المستخدم خارج التطبيق)

```
النظام ينشئ إشعار بـ channel: "push":
POST /notifications/admin/create
{
  "type": "ORDER_CONFIRMED",
  "channel": "push",
  "recipientId": "user_id",
  "title": "تم تأكيد طلبك",
  "message": "طلبك رقم #123 تم تأكيده"
}
    ↓
Backend يحفظ الإشعار في قاعدة البيانات
    ↓
Backend يبحث عن Device Tokens النشطة للمستخدم:
DeviceToken.find({ userId, isActive: true })
    ↓
Backend يرسل لكل Token عبر FCM:
fcmAdapter.sendToDevice(token, notification)
    ↓
Firebase يرسل الإشعار للأجهزة
    ↓
الإشعار يظهر في شريط إشعارات الهاتف
    ↓
المستخدم ينقر → التطبيق يفتح
```

---

## 📋 جدول المحتويات

1. [قائمة الإشعارات](#1-قائمة-الإشعارات)
2. [تحديد كمقروء (متعدد)](#2-تحديد-كمقروء-متعدد)
3. [تحديد الكل كمقروء](#3-تحديد-الكل-كمقروء)
4. [عدد الإشعارات غير المقروءة](#4-عدد-الإشعارات-غير-المقروءة)
5. [إحصائيات الإشعارات](#5-إحصائيات-الإشعارات)
6. [تسجيل الجهاز للإشعارات](#6-تسجيل-الجهاز-للإشعارات)
7. [إلغاء تسجيل الجهاز](#7-إلغاء-تسجيل-الجهاز)
8. [الحصول على أجهزة المستخدم](#8-الحصول-على-أجهزة-المستخدم)
9. [WebSocket - الإشعارات الفورية](#9-websocket---الإشعارات-الفورية)
10. [Models في Flutter](#10-models-في-flutter)
11. [دليل التكامل الكامل مع Push Notifications](#11-دليل-التكامل-الكامل-مع-push-notifications)
12. [إرسال الإشعارات من لوحة التحكم](#12-إرسال-الإشعارات-من-لوحة-التحكم)
13. [Enums والثوابت](#13-enums-والثوابت)

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
  "notifications": [
    {
      "_id": "64notif123",
      "type": "ORDER_CONFIRMED",
      "title": "تم تأكيد طلبك",
      "message": "طلب رقم ORD-2025-001234 تم تأكيده",
      "messageEn": "Order #ORD-2025-001234 has been confirmed",
      "data": {
        "orderId": "order_123",
        "orderNumber": "ORD-2025-001234"
      },
      "channel": "inApp",
      "status": "sent",
      "priority": "medium",
      "category": "order",
      "recipientId": "64user123",
      "targetRoles": ["user"],
      "scheduledFor": "2025-01-15T14:30:00.000Z",
      "sentAt": "2025-01-15T14:30:00.000Z",
      "readAt": null,
      "trackingId": "notif_1234567890_abc123",
      "metadata": {},
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
  "hasPrevPage": false
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

  if (response.statusCode == 200) {
    return PaginatedNotifications.fromJson(response.data);
  } else {
    throw ApiException('Failed to load notifications');
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
  "markedCount": 3,
  "message": "3 notifications marked as read"
}
```

### كود Flutter

```dart
Future<int> markAsRead(List<String> notificationIds) async {
  final response = await _dio.post('/notifications/mark-read', data: {
    'notificationIds': notificationIds,
  });

  if (response.statusCode == 200) {
    return response.data['markedCount'] ?? 0;
  } else {
    throw ApiException('Failed to mark notifications as read');
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
  "markedCount": 15,
  "message": "15 notifications marked as read"
}
```

### كود Flutter

```dart
Future<int> markAllAsRead() async {
  final response = await _dio.post('/notifications/mark-all-read');

  if (response.statusCode == 200) {
    return response.data['markedCount'] ?? 0;
  } else {
    throw ApiException('Failed to mark all notifications as read');
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
    "count": 5
  }
}
```

### كود Flutter

```dart
Future<int> getUnreadCount() async {
  final response = await _dio.get('/notifications/unread-count');

  if (response.statusCode == 200) {
    return response.data['data']['count'] ?? 0;
  } else {
    throw ApiException('Failed to get unread count');
  }
}
```

---

## 5. إحصائيات الإشعارات

يسترجع إحصائيات مفصلة حول إشعارات المستخدم.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/notifications/stats`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "total": 150,
  "byType": {
    "ORDER_CONFIRMED": 50,
    "SERVICE_COMPLETED": 30,
    "PROMOTION_STARTED": 20
  },
  "byStatus": {
    "sent": 100,
    "read": 45,
    "pending": 5
  },
  "byChannel": {
    "inApp": 120,
    "push": 30
  },
  "byCategory": {
    "order": 60,
    "service": 40,
    "promotion": 30,
    "system": 20
  },
  "unreadCount": 5,
  "readRate": 30.67,
  "deliveryRate": 95.5
}
```

### كود Flutter

```dart
Future<NotificationStats> getStats() async {
  final response = await _dio.get('/notifications/stats');

  if (response.statusCode == 200) {
    return NotificationStats.fromJson(response.data);
  } else {
    throw ApiException('Failed to get notification stats');
  }
}
```

---

## 6. تسجيل الجهاز للإشعارات

تسجيل أو تحديث FCM Token للجهاز لاستقبال Push Notifications.

### ⚠️ مهم: هذا مطلوب فقط لـ PUSH notifications

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/notifications/devices/register`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "platform": "android",
  "token": "fcm_token_here...",
  "userAgent": "Android 13",
  "appVersion": "1.0.0"
}
```

| الحقل | النوع | مطلوب | الوصف |
|-------|------|-------|-------|
| `platform` | `string` | ✅ | المنصة: `"ios"`, `"android"`, أو `"web"` |
| `token` | `string` | ✅ | FCM Token (أقصى طول: 500 حرف) |
| `userAgent` | `string` | ❌ | معلومات الجهاز (أقصى طول: 500 حرف) |
| `appVersion` | `string` | ❌ | إصدار التطبيق (أقصى طول: 50 حرف) |

### Response - نجاح

```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "deviceToken": {
      "_id": "device_id_123",
      "userId": "user_id_456",
      "token": "fcm_token_here...",
      "platform": "android",
      "isActive": true,
      "lastUsedAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

**ملاحظة:** يتم إخفاء جزء من Token في الـ Response للأمان (أول 20 حرف فقط + ...).

### كود Flutter

```dart
Future<void> registerDevice(String fcmToken) async {
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
  
  final response = await _dio.post(
    '/notifications/devices/register',
    data: {
      'platform': platform,
      'token': fcmToken,
      'userAgent': userAgent,
      'appVersion': packageInfo.version,
    },
  );
  
  if (response.statusCode == 200 || response.statusCode == 201) {
    print('✅ Device registered successfully');
  }
}
```

### ملاحظات مهمة

1. **التسجيل التلقائي**: يتم استدعاء هذا الـ endpoint تلقائياً عند:
   - الحصول على FCM Token لأول مرة
   - تحديث FCM Token (عند `onTokenRefresh`)

2. **التحديث التلقائي**: إذا كان Token موجوداً لنفس المستخدم، يتم تحديثه بدلاً من إنشاء جديد

3. **دعم عدة أجهزة**: يمكن للمستخدم تسجيل عدة أجهزة (مثل هاتف + تابلت)

4. **تعطيل تلقائي**: عند تسجيل token جديد لنفس المستخدم والمنصة، يتم تعطيل الـ tokens القديمة

5. **Token واحد لكل منصة**: النظام يضمن وجود token نشط واحد فقط لكل منصة لكل مستخدم

---

## 7. إلغاء تسجيل الجهاز

تعطيل FCM Token للجهاز (لن يستقبل Push Notifications بعد الآن).

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/notifications/devices/unregister`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "token": "fcm_token_here..."
}
```

### Response - نجاح

```json
{
  "success": true,
  "message": "Device unregistered successfully"
}
```

### Response - Token غير موجود

```json
{
  "success": false,
  "message": "Device token not found"
}
```

### كود Flutter

```dart
Future<void> unregisterDevice(String fcmToken) async {
  final response = await _dio.post(
    '/notifications/devices/unregister',
    data: {
      'token': fcmToken,
    },
  );
  
  if (response.statusCode == 200) {
    print('✅ Device unregistered successfully');
  }
}
```

### متى تستخدم

- عند تسجيل خروج المستخدم
- عند حذف التطبيق
- عند رفض المستخدم أذونات الإشعارات

---

## 8. الحصول على أجهزة المستخدم

استرداد قائمة بجميع الأجهزة المسجلة للمستخدم.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/notifications/devices`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "_id": "device_id_1",
        "platform": "android",
        "userAgent": "Android 13",
        "appVersion": "1.0.0",
        "isActive": true,
        "lastUsedAt": "2025-01-15T10:30:00.000Z",
        "createdAt": "2025-01-10T08:00:00.000Z"
      },
      {
        "_id": "device_id_2",
        "platform": "ios",
        "userAgent": "iOS 17.0",
        "appVersion": "1.0.0",
        "isActive": true,
        "lastUsedAt": "2025-01-14T15:20:00.000Z",
        "createdAt": "2025-01-12T09:00:00.000Z"
      }
    ]
  }
}
```

### كود Flutter

```dart
Future<List<DeviceToken>> getUserDevices() async {
  final response = await _dio.get('/notifications/devices');
  
  if (response.statusCode == 200) {
    final devices = (response.data['data']['devices'] as List)
        .map((item) => DeviceToken.fromJson(item))
        .toList();
    return devices;
  } else {
    throw ApiException('Failed to get user devices');
  }
}
```

---

## 9. WebSocket - الإشعارات الفورية

يوفر النظام اتصال WebSocket في الوقت الفعلي لاستقبال إشعارات `inApp` فوراً.

### ⚠️ مهم: WebSocket مطلوب لإشعارات `inApp` فقط

### معلومات الاتصال

- **Namespace:** `/notifications`
- **URL:** `ws://your-api-url/notifications` أو `wss://your-api-url/notifications`
- **Auth Required:** ✅ نعم (JWT Token)
- **Reconnection:** ✅ تلقائي
- **Transports:** `['websocket', 'polling']`
- **Ping Timeout:** 60000ms
- **Ping Interval:** 25000ms

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

    // إشعار جديد (IN_APP notifications)
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

    // تأكيد تحديد كمقروء
    _socket!.on('marked-as-read', (data) {
      print('✅ Marked as read: $data');
    });

    // تأكيد تحديد الكل كمقروء
    _socket!.on('marked-all-as-read', (data) {
      print('✅ All marked as read: $data');
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

### الأحداث المتاحة (Events)

| الحدث | الوصف | البيانات |
|------|-------|---------|
| `connected` | اتصال ناجح | `{ success: true, userId: string, timestamp: string }` |
| `notification:new` | إشعار جديد | `{ id, title, message, messageEn, type, category, priority, data, createdAt, isRead }` |
| `unread-count` | عدد غير مقروء | `{ count: number }` |
| `marked-as-read` | تم تحديد كمقروء | `{ success: true, markedCount: number }` |
| `marked-all-as-read` | تم تحديد الكل كمقروء | `{ success: true, markedCount: number }` |
| `pong` | رد على ping | `{ pong: true, timestamp: string }` |

### الأوامر المتاحة (Commands)

| الأمر | الوصف | البيانات |
|------|-------|---------|
| `ping` | اختبار الاتصال | لا |
| `get-unread-count` | طلب عدد غير مقروء | لا |
| `mark-as-read` | تحديد كمقروء | `{ notificationIds: string[] }` |
| `mark-all-as-read` | تحديد الكل كمقروء | لا |

### استخدام الخدمة في التطبيق

```dart
// lib/main.dart
import 'services/notifications_websocket_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // تهيئة WebSocket للإشعارات
  final wsService = NotificationsWebSocketService();
  
  // إعداد Callbacks
  wsService.onNotificationReceived = (notification) {
    // عرض الإشعار في UI
    _showInAppNotification(notification);
  };
  
  wsService.onUnreadCountChanged = (count) {
    // تحديث Badge
    _updateUnreadBadge(count);
  };
  
  wsService.onConnected = () {
    print('✅ Connected to real-time notifications');
    // طلب عدد الإشعارات غير المقروءة
    wsService.getUnreadCount();
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

### ملاحظات مهمة

1. **Authentication**: يجب إرسال JWT Token في `authorization` header أو `auth.token`
2. **Reconnection**: Socket.IO يعيد الاتصال تلقائياً عند الانقطاع
3. **Fallback**: إذا فشل WebSocket، استخدم REST API كـ fallback
4. **Token Refresh**: عند تحديث Token، أعد الاتصال
5. **Background**: في الخلفية، استخدم Push Notifications بدلاً من WebSocket

---

## 10. Models في Flutter

### ملف: `lib/models/notification/notification_models.dart`

```dart
// ===== Enums =====

enum NotificationType {
  // Order related
  ORDER_CREATED,
  ORDER_CONFIRMED,
  ORDER_CANCELLED,
  ORDER_REFUNDED,
  ORDER_RATED,
  
  // Service related
  SERVICE_REQUEST_OPENED,
  NEW_ENGINEER_OFFER,
  OFFER_ACCEPTED,
  OFFER_REJECTED,
  OFFER_CANCELLED,
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
  COUPON_USED,
  
  // Account & Security
  ACCOUNT_VERIFIED,
  PASSWORD_CHANGED,
  LOGIN_ATTEMPT,
  NEW_USER_REGISTERED,
  
  // Support
  TICKET_CREATED,
  TICKET_UPDATED,
  TICKET_RESOLVED,
  SUPPORT_MESSAGE_RECEIVED,
  
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
  
  // Invoice
  INVOICE_CREATED,
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

enum DevicePlatform {
  ios,
  android,
  web,
}

// ===== Models =====

class AppNotification {
  final String id;
  final NotificationType type;
  final String title;
  final String message;
  final String messageEn;
  final Map<String, dynamic> data;
  final String? actionUrl;
  final NotificationChannel channel;
  final NotificationStatus status;
  final NotificationPriority priority;
  final NotificationCategory category;
  final List<String>? targetRoles;
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

  AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.messageEn,
    required this.data,
    this.actionUrl,
    required this.channel,
    required this.status,
    required this.priority,
    required this.category,
    this.targetRoles,
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

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['_id'] ?? '',
      type: _parseNotificationType(json['type']),
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      messageEn: json['messageEn'] ?? '',
      data: Map<String, dynamic>.from(json['data'] ?? {}),
      actionUrl: json['actionUrl'],
      channel: _parseChannel(json['channel']),
      status: _parseStatus(json['status']),
      priority: _parsePriority(json['priority']),
      category: _parseCategory(json['category']),
      targetRoles: json['targetRoles'] != null 
          ? List<String>.from(json['targetRoles'])
          : null,
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

  // Status checks
  bool get isRead => status == NotificationStatus.read;
  bool get isUnread => status != NotificationStatus.read;
  bool get isPending => status == NotificationStatus.pending;
  bool get isSent => status == NotificationStatus.sent;
  bool get isDelivered => status == NotificationStatus.delivered;
  bool get isFailed => status == NotificationStatus.failed;

  // Channel checks
  bool get isInApp => channel == NotificationChannel.inApp;
  bool get isPush => channel == NotificationChannel.push;
  bool get isDashboard => channel == NotificationChannel.dashboard;

  // Category checks
  bool get isOrderType => category == NotificationCategory.order;
  bool get isServiceType => category == NotificationCategory.service;
  bool get isProductType => category == NotificationCategory.product;
  bool get isPromotionType => category == NotificationCategory.promotion;
  bool get isSystemType => category == NotificationCategory.system;

  // Priority checks
  bool get isUrgent => priority == NotificationPriority.urgent;
  bool get isHighPriority => priority == NotificationPriority.high;

  // Data extraction
  String? get orderId => data['orderId']?.toString();
  String? get orderNumber => data['orderNumber']?.toString();
  String? get productId => data['productId']?.toString();
  String? get serviceId => data['serviceId']?.toString();
  String? get ticketId => data['ticketId']?.toString();

  // Timing
  DateTime get displayDate => readAt ?? deliveredAt ?? sentAt ?? createdAt;
  bool get isRecent => DateTime.now().difference(displayDate).inDays < 7;
  
  // Helper parsers
  static NotificationType _parseNotificationType(String? type) {
    if (type == null) return NotificationType.SYSTEM_ALERT;
    try {
      return NotificationType.values.firstWhere(
        (e) => e.name == type,
        orElse: () => NotificationType.SYSTEM_ALERT,
      );
    } catch (_) {
      return NotificationType.SYSTEM_ALERT;
    }
  }

  static NotificationChannel _parseChannel(String? channel) {
    switch (channel) {
      case 'inApp': return NotificationChannel.inApp;
      case 'push': return NotificationChannel.push;
      case 'sms': return NotificationChannel.sms;
      case 'email': return NotificationChannel.email;
      case 'dashboard': return NotificationChannel.dashboard;
      default: return NotificationChannel.inApp;
    }
  }

  static NotificationStatus _parseStatus(String? status) {
    switch (status) {
      case 'pending': return NotificationStatus.pending;
      case 'queued': return NotificationStatus.queued;
      case 'sending': return NotificationStatus.sending;
      case 'sent': return NotificationStatus.sent;
      case 'delivered': return NotificationStatus.delivered;
      case 'read': return NotificationStatus.read;
      case 'clicked': return NotificationStatus.clicked;
      case 'failed': return NotificationStatus.failed;
      case 'bounced': return NotificationStatus.bounced;
      case 'rejected': return NotificationStatus.rejected;
      case 'cancelled': return NotificationStatus.cancelled;
      default: return NotificationStatus.pending;
    }
  }

  static NotificationPriority _parsePriority(String? priority) {
    switch (priority) {
      case 'low': return NotificationPriority.low;
      case 'medium': return NotificationPriority.medium;
      case 'high': return NotificationPriority.high;
      case 'urgent': return NotificationPriority.urgent;
      default: return NotificationPriority.medium;
    }
  }

  static NotificationCategory _parseCategory(String? category) {
    switch (category) {
      case 'order': return NotificationCategory.order;
      case 'product': return NotificationCategory.product;
      case 'service': return NotificationCategory.service;
      case 'promotion': return NotificationCategory.promotion;
      case 'account': return NotificationCategory.account;
      case 'system': return NotificationCategory.system;
      case 'support': return NotificationCategory.support;
      case 'payment': return NotificationCategory.payment;
      case 'marketing': return NotificationCategory.marketing;
      default: return NotificationCategory.system;
    }
  }
}

class PaginatedNotifications {
  final List<AppNotification> notifications;
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
          .map((item) => AppNotification.fromJson(item))
          .toList(),
      total: json['total'] ?? 0,
      page: json['page'] ?? 1,
      limit: json['limit'] ?? 20,
      totalPages: json['totalPages'] ?? 0,
      hasNextPage: json['hasNextPage'] ?? false,
      hasPrevPage: json['hasPrevPage'] ?? false,
    );
  }

  bool get isEmpty => notifications.isEmpty;
  int get unreadCount => notifications.where((n) => n.isUnread).length;
}

class DeviceToken {
  final String id;
  final String platform;
  final String? userAgent;
  final String? appVersion;
  final bool isActive;
  final DateTime? lastUsedAt;
  final DateTime? createdAt;

  DeviceToken({
    required this.id,
    required this.platform,
    this.userAgent,
    this.appVersion,
    required this.isActive,
    this.lastUsedAt,
    this.createdAt,
  });

  factory DeviceToken.fromJson(Map<String, dynamic> json) {
    return DeviceToken(
      id: json['_id'] ?? '',
      platform: json['platform'] ?? 'unknown',
      userAgent: json['userAgent'],
      appVersion: json['appVersion'],
      isActive: json['isActive'] ?? false,
      lastUsedAt: json['lastUsedAt'] != null ? DateTime.parse(json['lastUsedAt']) : null,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }
}

class NotificationStats {
  final int total;
  final Map<String, int> byType;
  final Map<String, int> byStatus;
  final Map<String, int> byChannel;
  final Map<String, int> byCategory;
  final int unreadCount;
  final double readRate;
  final double deliveryRate;

  NotificationStats({
    required this.total,
    required this.byType,
    required this.byStatus,
    required this.byChannel,
    required this.byCategory,
    required this.unreadCount,
    required this.readRate,
    required this.deliveryRate,
  });

  factory NotificationStats.fromJson(Map<String, dynamic> json) {
    return NotificationStats(
      total: json['total'] ?? 0,
      byType: Map<String, int>.from(json['byType'] ?? {}),
      byStatus: Map<String, int>.from(json['byStatus'] ?? {}),
      byChannel: Map<String, int>.from(json['byChannel'] ?? {}),
      byCategory: Map<String, int>.from(json['byCategory'] ?? {}),
      unreadCount: json['unreadCount'] ?? 0,
      readRate: (json['readRate'] ?? 0).toDouble(),
      deliveryRate: (json['deliveryRate'] ?? 0).toDouble(),
    );
  }
}
```

---

## 11. دليل التكامل الكامل مع Push Notifications

### 📦 1. إعداد Dependencies

في `pubspec.yaml`:
```yaml
dependencies:
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.6
  flutter_local_notifications: ^16.3.0
  device_info_plus: ^9.1.0
  package_info_plus: ^5.0.1
  shared_preferences: ^2.2.2
  socket_io_client: ^2.0.3+1
```

### 🚀 2. تهيئة Firebase

#### Android:

1. حمّل ملف `google-services.json` من Firebase Console
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
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

### 🎯 3. خدمة الإشعارات الكاملة

```dart
// lib/services/notifications_service.dart
import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Handler للإشعارات في الخلفية (يجب أن يكون top-level function)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('Handling background message: ${message.messageId}');
}

class NotificationsService {
  static final NotificationsService _instance = NotificationsService._internal();
  factory NotificationsService() => _instance;
  NotificationsService._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = 
      FlutterLocalNotificationsPlugin();
  
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
    );
  }

  /// إعداد Token وتسجيله
  Future<void> _setupToken() async {
    try {
      // الحصول على Token الحالي
      _currentToken = await _fcm.getToken();
      
      if (_currentToken != null) {
        print('📱 FCM Token: ${_currentToken!.substring(0, 20)}...');
        
        // تسجيل الجهاز في Backend
        await _registerDeviceWithBackend(_currentToken!);
        
        // حفظ Token محلياً
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('fcm_token', _currentToken!);
      }
      
      // الاستماع لتحديثات Token
      _fcm.onTokenRefresh.listen((newToken) async {
        print('🔄 FCM Token refreshed');
        _currentToken = newToken;
        
        // تحديث Token في Backend
        await _registerDeviceWithBackend(newToken);
        
        // حفظ Token الجديد
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('fcm_token', newToken);
      });
    } catch (e) {
      print('❌ Error setting up token: $e');
    }
  }

  /// تسجيل الجهاز في Backend
  Future<void> _registerDeviceWithBackend(String token) async {
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
      
      // TODO: استدعاء API
      // await _apiClient.post('/notifications/devices/register', data: {...});
      
      print('✅ Device registered: $platform');
    } catch (e) {
      print('❌ Error registering device: $e');
    }
  }

  /// إلغاء تسجيل الجهاز
  Future<void> unregisterDevice() async {
    try {
      if (_currentToken == null) {
        final prefs = await SharedPreferences.getInstance();
        _currentToken = prefs.getString('fcm_token');
      }
      
      if (_currentToken != null) {
        // TODO: استدعاء API
        // await _apiClient.post('/notifications/devices/unregister', data: {...});
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('fcm_token');
        
        print('✅ Device unregistered');
      }
    } catch (e) {
      print('❌ Error unregistering device: $e');
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
    final notification = message.notification;
    if (notification == null) return;
    
    const androidDetails = AndroidNotificationDetails(
      'high_importance_channel',
      'High Importance Notifications',
      importance: Importance.high,
      priority: Priority.high,
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
      payload: message.data.toString(),
    );
  }

  void _onNotificationTapped(NotificationResponse response) {
    if (response.payload != null) {
      print('Notification tapped: ${response.payload}');
    }
  }

  void _handleNotificationTap(RemoteMessage message) {
    if (onNotificationTapped != null) {
      onNotificationTapped!(message.data);
    }
  }

  String? get currentToken => _currentToken;
  bool get isInitialized => _isInitialized;
}
```

### 📱 4. استخدام في main.dart

```dart
// lib/main.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'services/notifications_service.dart';
import 'services/notifications_websocket_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 1. تهيئة Firebase
  await Firebase.initializeApp();
  
  // 2. تسجيل Background Handler
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  
  // 3. تهيئة خدمة Push Notifications
  final pushService = NotificationsService();
  await pushService.initialize();
  
  pushService.onNotificationTapped = (data) {
    _handleNotificationNavigation(data);
  };
  
  // 4. تهيئة WebSocket للإشعارات IN_APP
  final wsService = NotificationsWebSocketService();
  wsService.onNotificationReceived = (notification) {
    _showInAppNotification(notification);
  };
  await wsService.connect();
  
  runApp(MyApp());
}

void _handleNotificationNavigation(Map<String, dynamic> data) {
  if (data['orderId'] != null) {
    // Navigate to order details
  } else if (data['productId'] != null) {
    // Navigate to product
  }
}

void _showInAppNotification(Map<String, dynamic> notification) {
  // Show in-app banner or snackbar
}
```

---

## 12. إرسال الإشعارات من لوحة التحكم

### Admin Endpoints

#### 1. إنشاء إشعار

```
POST /notifications/admin/create
```

**Request:**
```json
{
  "type": "ORDER_CONFIRMED",
  "title": "تم تأكيد طلبك",
  "message": "طلبك رقم #123 تم تأكيده بنجاح",
  "messageEn": "Your order #123 has been confirmed",
  "channel": "push",
  "recipientId": "user_id_here",
  "priority": "medium",
  "data": {
    "orderId": "order_123",
    "orderNumber": "123"
  }
}
```

**Response:**
```json
{
  "notification": { ... },
  "message": "Notification created successfully"
}
```

#### 2. إرسال إشعار موجود

```
POST /notifications/admin/notification/:id/send
```

#### 3. إرسال مجمع

```
POST /notifications/admin/bulk-send
```

**Request:**
```json
{
  "type": "PROMOTION_STARTED",
  "title": "عرض جديد",
  "message": "خصم 30% على جميع المنتجات",
  "messageEn": "30% off on all products",
  "channel": "push",
  "targetUserIds": ["user_1", "user_2", "user_3"],
  "priority": "high"
}
```

#### 4. التحقق من أجهزة مستخدم

```
GET /notifications/admin/users/:userId/devices
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "hasDevices": true,
    "deviceCount": 2,
    "devices": [...],
    "platforms": {
      "ios": 1,
      "android": 1,
      "web": 0
    }
  }
}
```

#### 5. التحقق من أجهزة عدة مستخدمين

```
POST /notifications/admin/users/devices/check
```

**Request:**
```json
{
  "userIds": ["user_1", "user_2", "user_3"]
}
```

#### 6. التحقق من حالة FCM

```
GET /notifications/admin/fcm-status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isConfigured": true,
    "status": "configured",
    "message": "FCM is configured and ready to send push notifications"
  }
}
```

---

## 13. Enums والثوابت

### NotificationType (35 نوع)

```typescript
// Order related
ORDER_CREATED, ORDER_CONFIRMED, ORDER_CANCELLED, ORDER_REFUNDED, ORDER_RATED

// Service related
SERVICE_REQUEST_OPENED, NEW_ENGINEER_OFFER, OFFER_ACCEPTED, OFFER_REJECTED,
OFFER_CANCELLED, SERVICE_STARTED, SERVICE_COMPLETED, SERVICE_RATED,
SERVICE_REQUEST_CANCELLED

// Product related
PRODUCT_BACK_IN_STOCK, PRODUCT_PRICE_DROP, LOW_STOCK, OUT_OF_STOCK

// Promotion related
PROMOTION_STARTED, PROMOTION_ENDING, COUPON_USED

// Account & Security
ACCOUNT_VERIFIED, PASSWORD_CHANGED, LOGIN_ATTEMPT, NEW_USER_REGISTERED

// Support
TICKET_CREATED, TICKET_UPDATED, TICKET_RESOLVED, SUPPORT_MESSAGE_RECEIVED

// System
SYSTEM_MAINTENANCE, NEW_FEATURE, SYSTEM_ALERT

// Marketing
WELCOME_NEW_USER, BIRTHDAY_GREETING, CART_ABANDONMENT

// Payment
PAYMENT_FAILED, PAYMENT_SUCCESS

// Invoice
INVOICE_CREATED
```

### NotificationStatus (11 حالة)

```typescript
pending    // في الانتظار
queued     // في الصف
sending    // جاري الإرسال
sent       // تم الإرسال
delivered  // تم التسليم
read       // مقروء
clicked    // تم النقر
failed     // فشل
bounced    // مرتد
rejected   // مرفوض
cancelled  // ملغي
```

### NotificationChannel (5 قنوات)

```typescript
inApp      // داخل التطبيق (WebSocket)
push       // Push Notification (FCM)
sms        // رسالة نصية
email      // بريد إلكتروني
dashboard  // لوحة التحكم (للإداريين)
```

### NotificationPriority (4 مستويات)

```typescript
low        // منخفضة
medium     // متوسطة (افتراضي)
high       // عالية
urgent     // عاجلة
```

### NotificationCategory (9 فئات)

```typescript
order      // طلبات
product    // منتجات
service    // خدمات
promotion  // عروض
account    // حساب
system     // نظام
support    // دعم
payment    // دفع
marketing  // تسويق
```

### DevicePlatform (3 منصات)

```typescript
ios        // iOS
android    // Android
web        // Web
```

---

## 📝 ملخص القنوات

| السيناريو | القناة | يحتاج FCM Token | يحتاج WebSocket |
|-----------|--------|-----------------|-----------------|
| المستخدم داخل التطبيق | `inApp` | ❌ | ✅ |
| المستخدم خارج التطبيق | `push` | ✅ | ❌ |
| إشعار للإداريين | `dashboard` | ❌ | ✅ |
| رسالة نصية | `sms` | ❌ | ❌ |
| بريد إلكتروني | `email` | ❌ | ❌ |

---

## 🔄 ملخص التغييرات عن الإصدار السابق

1. ✅ توضيح الفرق بين `inApp` و `push` بشكل مفصل
2. ✅ تحديث الـ Enums لتطابق Backend تماماً (35 نوع)
3. ✅ إضافة `targetRoles` في الـ Response
4. ✅ إضافة endpoint `/notifications/stats`
5. ✅ توضيح أن WebSocket مطلوب لـ `inApp` فقط
6. ✅ توضيح أن FCM Token مطلوب لـ `push` فقط
7. ✅ إضافة كود Flutter كامل للتكامل
8. ✅ تحديث Response schemas لتطابق Controller

---

**ملفات Backend المرجعية:**
- `backend/src/modules/notifications/controllers/unified-notification.controller.ts`
- `backend/src/modules/notifications/services/notification.service.ts`
- `backend/src/modules/notifications/gateways/notifications.gateway.ts`
- `backend/src/modules/notifications/adapters/notification.adapters.ts`
- `backend/src/modules/notifications/adapters/fcm.adapter.ts`
- `backend/src/modules/notifications/schemas/unified-notification.schema.ts`
- `backend/src/modules/notifications/schemas/device-token.schema.ts`
- `backend/src/modules/notifications/enums/notification.enums.ts`
- `backend/src/modules/notifications/dto/unified-notification.dto.ts`

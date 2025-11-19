# 🔌 WebSocket - الاتصال الفوري

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: نوفمبر 2025  
> 🆕 **محدث**: حل مشكلة المنفذ `:0` في URL

يوفر النظام اتصالات WebSocket في الوقت الفعلي للإشعارات ورسائل الدعم الفني باستخدام Socket.IO.

---

## 📋 جدول المحتويات

1. [نظرة عامة](#1-نظرة-عامة)
2. [إعدادات Dependencies](#2-إعدادات-dependencies)
3. [بناء URL بشكل صحيح](#3-بناء-url-بشكل-صحيح-مهم-جداً)
4. [خدمة الإشعارات (Notifications)](#4-خدمة-الإشعارات-notifications)
5. [خدمة رسائل الدعم (Support Messages)](#5-خدمة-رسائل-الدعم-support-messages)
6. [استخدام متعدد للخدمات](#6-استخدام-متعدد-للخدمات)
7. [استكشاف الأخطاء](#7-استكشاف-الأخطاء)

---

## 1. نظرة عامة

### Namespaces المتاحة

| Namespace | الوصف | Gateway |
|-----------|-------|---------|
| `/notifications` | الإشعارات الفورية | `NotificationsGateway` |
| `/support` | رسائل الدعم الفني | `SupportMessagesGateway` |

### الميزات

- ✅ **Authentication**: التحقق من JWT تلقائياً
- ✅ **Reconnection**: إعادة الاتصال التلقائي عند الانقطاع
- ✅ **Multi-device Support**: دعم عدة أجهزة لنفس المستخدم
- ✅ **Real-time Updates**: تحديثات فورية بدون polling
- ✅ **Typing Indicators**: مؤشرات الكتابة (للدعم الفني)
- ✅ **Room Management**: إدارة الغرف للمستخدمين والتذاكر

---

## 2. إعدادات Dependencies

### إضافة المكتبة

في `pubspec.yaml`:

```yaml
dependencies:
  socket_io_client: ^2.0.3+1
  shared_preferences: ^2.2.2
```

ثم قم بتثبيت:

```bash
flutter pub get
```

---

## 3. بناء URL بشكل صحيح (مهم جداً)

### ⚠️ المشكلة الشائعة

عند بناء URL للاتصال بـ WebSocket، قد تظهر هذه الأخطاء:

```
❌ WebSocket error: Connection to 'https://api.allawzi.net:0/socket.io/...' was not upgraded
```

**السبب:** المنفذ `:0` يُضاف بشكل خاطئ عند استخراج URL من `API_BASE_URL`.

### ✅ الحل الصحيح

**لا تستخدم المنفذ صراحة عند استخدام HTTPS:**

```dart
// ❌ خطأ - قد يسبب مشكلة :0
_socket = IO.io(
  'http://api.allawzi.net:3000/notifications',
  ...
);

// ✅ صحيح - بدون منفذ صريح للـ HTTPS
_socket = IO.io(
  'https://api.allawzi.net/notifications',
  ...
);
```

### دالة مساعدة لبناء URL

```dart
/// بناء URL للـ WebSocket بدون منفذ صريح
String buildWebSocketUrl(String namespace) {
  // احصل على API_BASE_URL من config أو environment
  final apiBaseUrl = 'https://api.allawzi.net/api/v1'; // أو من config
  final uri = Uri.parse(apiBaseUrl);
  
  // بناء URL بدون منفذ (HTTPS يستخدم 443 افتراضياً)
  if (uri.scheme == 'https') {
    return 'https://${uri.host}/$namespace';
  } else {
    // للـ HTTP، استخدم المنفذ المحدد أو 80 افتراضياً
    final port = uri.hasPort ? uri.port : 80;
    return 'http://${uri.host}:$port/$namespace';
  }
}

// الاستخدام:
final notificationsUrl = buildWebSocketUrl('notifications');
final supportUrl = buildWebSocketUrl('support');
```

### مثال كامل مع Config

```dart
// lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'https://api.allawzi.net/api/v1';
  
  static String getWebSocketUrl(String namespace) {
    final uri = Uri.parse(baseUrl);
    
    if (uri.scheme == 'https') {
      return 'https://${uri.host}/$namespace';
    } else {
      final port = uri.hasPort ? uri.port : 80;
      return 'http://${uri.host}:$port/$namespace';
    }
  }
  
  static String get notificationsWebSocketUrl => 
    getWebSocketUrl('notifications');
  
  static String get supportWebSocketUrl => 
    getWebSocketUrl('support');
}
```

---

## 4. خدمة الإشعارات (Notifications)

### معلومات الاتصال

- **Namespace:** `/notifications`
- **URL:** `https://api.allawzi.net/notifications`
- **Auth Required:** ✅ نعم (JWT Token)
- **Reconnection:** ✅ تلقائي

### Events المتاحة

| Event | الوصف | البيانات |
|-------|-------|---------|
| `connect` | اتصال ناجح | - |
| `connected` | مصادقة ناجحة | `{ userId, socketId }` |
| `notification:new` | إشعار جديد | `Notification` |
| `unread-count` | تحديث عدد غير المقروء | `{ count: number }` |
| `disconnect` | انقطاع الاتصال | `reason` |
| `connect_error` | خطأ في الاتصال | `error` |

### كود Flutter - خدمة WebSocket

```dart
// lib/services/notifications_websocket_service.dart
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

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

      // بناء URL بشكل صحيح
      final wsUrl = ApiConfig.notificationsWebSocketUrl;
      
      // إنشاء الاتصال
      _socket = IO.io(
        wsUrl, // ✅ URL صحيح بدون :0
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
  };
  
  wsService.onError = (error) {
    print('❌ WebSocket error: $error');
  };
  
  // الاتصال بعد تسجيل الدخول
  // await wsService.connect();
  
  runApp(MyApp());
}
```

### استخدام في Widget

```dart
// lib/widgets/notifications_badge.dart
class NotificationsBadge extends StatefulWidget {
  @override
  _NotificationsBadgeState createState() => _NotificationsBadgeState();
}

class _NotificationsBadgeState extends State<NotificationsBadge> {
  final _wsService = NotificationsWebSocketService();
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _setupWebSocket();
  }

  void _setupWebSocket() {
    _wsService.onUnreadCountChanged = (count) {
      setState(() {
        _unreadCount = count;
      });
    };
    
    _wsService.onNotificationReceived = (notification) {
      // عرض إشعار محلي
      _showLocalNotification(notification);
      // تحديث العدد
      _wsService.getUnreadCount();
    };
    
    _wsService.connect();
  }

  @override
  Widget build(BuildContext context) {
    return Badge(
      label: Text('$_unreadCount'),
      child: Icon(Icons.notifications),
    );
  }

  @override
  void dispose() {
    _wsService.disconnect();
    super.dispose();
  }
}
```

---

## 5. خدمة رسائل الدعم (Support Messages)

### معلومات الاتصال

- **Namespace:** `/support`
- **URL:** `https://api.allawzi.net/support`
- **Auth Required:** ✅ نعم (JWT Token)
- **Reconnection:** ✅ تلقائي

### Events المتاحة

| Event | الوصف | البيانات |
|-------|-------|---------|
| `connect` | اتصال ناجح | - |
| `connected` | مصادقة ناجحة | `{ userId, socketId }` |
| `message:new` | رسالة جديدة في التذكرة | `SupportMessage` |
| `support:new-message` | إشعار برسالة جديدة (لتذاكر أخرى) | `{ ticketId, message }` |
| `user-typing` | مؤشر الكتابة | `{ ticketId, userId, isTyping }` |
| `joined-ticket` | انضمام ناجح لتذكرة | `{ ticketId }` |
| `left-ticket` | مغادرة تذكرة | `{ ticketId }` |
| `disconnect` | انقطاع الاتصال | `reason` |
| `connect_error` | خطأ في الاتصال | `error` |

### كود Flutter - خدمة WebSocket

```dart
// lib/services/support_websocket_service.dart
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class SupportWebSocketService {
  static final SupportWebSocketService _instance = 
      SupportWebSocketService._internal();
  factory SupportWebSocketService() => _instance;
  SupportWebSocketService._internal();

  IO.Socket? _socket;
  bool _isConnected = false;
  String? _currentTicketId;
  
  // Callbacks
  Function(Map<String, dynamic>)? onMessageReceived;
  Function(Map<String, dynamic>)? onNewMessageNotification;
  Function(Map<String, dynamic>)? onUserTyping;
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

      // بناء URL بشكل صحيح
      final wsUrl = ApiConfig.supportWebSocketUrl;
      
      // إنشاء الاتصال
      _socket = IO.io(
        wsUrl, // ✅ URL صحيح بدون :0
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
      print('✅ Connected to support WebSocket');
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
      
      // إعادة الانضمام للتذكرة إذا كانت موجودة
      if (_currentTicketId != null) {
        joinTicket(_currentTicketId!);
      }
    });

    // رسالة جديدة في التذكرة
    _socket!.on('message:new', (data) {
      print('💬 New message received: $data');
      if (onMessageReceived != null) {
        onMessageReceived!(data as Map<String, dynamic>);
      }
    });

    // إشعار برسالة جديدة (للتذاكر الأخرى)
    _socket!.on('support:new-message', (data) {
      print('🔔 New message notification: $data');
      if (onNewMessageNotification != null) {
        onNewMessageNotification!(data as Map<String, dynamic>);
      }
    });

    // مؤشر الكتابة
    _socket!.on('user-typing', (data) {
      print('⌨️ User typing: $data');
      if (onUserTyping != null) {
        onUserTyping!(data as Map<String, dynamic>);
      }
    });

    // انضمام ناجح
    _socket!.on('joined-ticket', (data) {
      print('✅ Joined ticket: $data');
    });

    // مغادرة ناجحة
    _socket!.on('left-ticket', (data) {
      print('👋 Left ticket: $data');
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

  /// الانضمام لتذكرة
  void joinTicket(String ticketId) {
    _currentTicketId = ticketId;
    _socket?.emit('join-ticket', {'ticketId': ticketId});
    print('🔗 Joining ticket: $ticketId');
  }

  /// مغادرة تذكرة
  void leaveTicket(String ticketId) {
    if (_currentTicketId == ticketId) {
      _currentTicketId = null;
    }
    _socket?.emit('leave-ticket', {'ticketId': ticketId});
    print('👋 Leaving ticket: $ticketId');
  }

  /// إرسال مؤشر الكتابة
  void sendTyping(String ticketId, bool isTyping) {
    _socket?.emit('typing', {
      'ticketId': ticketId,
      'isTyping': isTyping,
    });
  }

  /// إرسال Ping
  void ping() {
    _socket?.emit('ping');
  }

  /// قطع الاتصال
  void disconnect() {
    if (_currentTicketId != null) {
      leaveTicket(_currentTicketId!);
    }
    _socket?.disconnect();
    _isConnected = false;
    print('🔌 WebSocket disconnected');
  }

  /// التحقق من حالة الاتصال
  bool get isConnected => _isConnected && (_socket?.connected ?? false);
  
  /// الحصول على التذكرة الحالية
  String? get currentTicketId => _currentTicketId;
}
```

### استخدام الخدمة في Widget

```dart
// lib/screens/support_ticket_details_screen.dart
class _SupportTicketDetailsScreenState extends State<SupportTicketDetailsScreen> {
  final _wsService = SupportWebSocketService();
  final _supportApi = SupportApi();
  
  List<SupportMessage> _messages = [];
  bool _isTyping = false;
  String? _typingUserId;

  @override
  void initState() {
    super.initState();
    _setupWebSocket();
    _loadMessages();
  }

  void _setupWebSocket() {
    // رسالة جديدة
    _wsService.onMessageReceived = (data) {
      setState(() {
        _messages.add(SupportMessage.fromJson(data));
      });
      
      // إعادة تحميل الرسائل للتأكد من الترتيب
      _loadMessages();
    };
    
    // مؤشر الكتابة
    _wsService.onUserTyping = (data) {
      if (data['ticketId'] == widget.ticketId) {
        setState(() {
          _isTyping = data['isTyping'] == true;
          _typingUserId = data['userId'];
        });
      }
    };
    
    // الاتصال والانضمام للتذكرة
    _wsService.connect().then((_) {
      _wsService.joinTicket(widget.ticketId);
    });
  }

  void _loadMessages() async {
    try {
      final messages = await _supportApi.getTicketMessages(widget.ticketId);
      setState(() {
        _messages = messages;
      });
    } catch (e) {
      print('Error loading messages: $e');
    }
  }

  void _sendMessage(String text) async {
    try {
      // إرسال الرسالة عبر REST API
      await _supportApi.sendMessage(
        ticketId: widget.ticketId,
        message: text,
      );
      // الرسالة ستصل عبر WebSocket تلقائياً
    } catch (e) {
      print('Error sending message: $e');
    }
  }

  void _onTypingChanged(bool isTyping) {
    _wsService.sendTyping(widget.ticketId, isTyping);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Support Ticket')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                return MessageBubble(message: _messages[index]);
              },
            ),
          ),
          if (_isTyping)
            Padding(
              padding: EdgeInsets.all(8.0),
              child: Text('User is typing...'),
            ),
          MessageInput(
            onSend: _sendMessage,
            onTypingChanged: _onTypingChanged,
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _wsService.leaveTicket(widget.ticketId);
    _wsService.disconnect();
    super.dispose();
  }
}
```

---

## 6. استخدام متعدد للخدمات

يمكنك استخدام كلا الخدمتين في نفس الوقت:

```dart
// lib/services/websocket_manager.dart
import 'notifications_websocket_service.dart';
import 'support_websocket_service.dart';

class WebSocketManager {
  final NotificationsWebSocketService _notificationsService;
  final SupportWebSocketService _supportService;

  WebSocketManager()
      : _notificationsService = NotificationsWebSocketService(),
        _supportService = SupportWebSocketService();

  /// الاتصال بجميع الخدمات
  Future<void> connectAll() async {
    await _notificationsService.connect();
    await _supportService.connect();
  }

  /// قطع الاتصال من جميع الخدمات
  void disconnectAll() {
    _notificationsService.disconnect();
    _supportService.disconnect();
  }

  NotificationsWebSocketService get notifications => _notificationsService;
  SupportWebSocketService get support => _supportService;
}
```

---

## 7. استكشاف الأخطاء

### الخطأ: `Connection to 'https://api.allawzi.net:0/socket.io/...' was not upgraded`

**السبب:** المنفذ `:0` يُضاف بشكل خاطئ.

**الحل:**
1. تأكد من استخدام دالة `buildWebSocketUrl()` أو `ApiConfig.getWebSocketUrl()`
2. لا تستخدم منفذ صريح مع HTTPS
3. تحقق من أن `API_BASE_URL` صحيح

```dart
// ❌ خطأ
final url = 'https://api.allawzi.net:443/notifications'; // لا حاجة للمنفذ

// ✅ صحيح
final url = 'https://api.allawzi.net/notifications';
```

### الخطأ: `Connection error` أو `401 Unauthorized`

**السبب:** Token غير صحيح أو منتهي الصلاحية.

**الحل:**
1. تحقق من وجود Token في `SharedPreferences`
2. تأكد من إرسال Token في `auth` و `extraHeaders`
3. قم بتحديث Token إذا انتهت صلاحيته

```dart
// تحقق من Token قبل الاتصال
final token = prefs.getString('access_token');
if (token == null) {
  // أعد توجيه المستخدم لتسجيل الدخول
  return;
}
```

### الخطأ: `CORS policy` (في Web فقط)

**السبب:** CORS غير مُعد بشكل صحيح في Backend.

**الحل:**
1. تأكد من إعداد `FRONTEND_URL` في Backend `.env`
2. تحقق من إعدادات CORS في WebSocket Gateway

### الخطأ: الاتصال لا يعمل بعد إعادة تشغيل التطبيق

**السبب:** Socket.IO قد لا يعيد الاتصال تلقائياً في بعض الحالات.

**الحل:**
```dart
// أعد الاتصال يدوياً عند فتح التطبيق
@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    _wsService.connect();
  });
}
```

### الخطأ: الرسائل لا تصل في الوقت الفعلي

**السبب:** لم يتم الانضمام للغرفة (Room) بشكل صحيح.

**الحل:**
1. للتذاكر: تأكد من استدعاء `joinTicket()` بعد الاتصال
2. للإشعارات: لا حاجة للانضمام، يتم الإرسال تلقائياً

```dart
// للدعم الفني
_wsService.connect().then((_) {
  _wsService.joinTicket(ticketId); // ✅ مهم جداً
});
```

### نصائح عامة

1. **استخدم Singleton Pattern** للخدمات لتجنب اتصالات متعددة
2. **قطع الاتصال** عند إغلاق الشاشة أو تسجيل الخروج
3. **تعامل مع الأخطاء** بشكل مناسب وأظهر رسائل واضحة
4. **راقب حالة الاتصال** وعرض مؤشر للمستخدم
5. **استخدم Fallback** إلى REST API إذا فشل WebSocket

---

## 📚 المراجع

- [خدمة الإشعارات](./13-notifications-service.md) - للمزيد من التفاصيل
- [خدمة الدعم](./16-support-service.md) - للمزيد من التفاصيل
- [Socket.IO Client Documentation](https://pub.dev/packages/socket_io_client)

---

**آخر تحديث:** نوفمبر 2025  
**النسخة:** 1.0.0


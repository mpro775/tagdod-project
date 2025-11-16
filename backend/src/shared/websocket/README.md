# WebSocket Real-Time Service

## نظرة عامة

نظام WebSocket احترافي يوفر اتصالاً في الوقت الفعلي للإشعارات والرسائل.

## الميزات

- ✅ **Authentication**: التحقق من JWT تلقائياً
- ✅ **Room Management**: إدارة الغرف للمستخدمين والتذاكر
- ✅ **Multi-device Support**: دعم عدة أجهزة لنفس المستخدم
- ✅ **Real-time Notifications**: إشعارات فورية
- ✅ **Real-time Messages**: رسائل فورية في التذاكر
- ✅ **Typing Indicators**: مؤشرات الكتابة
- ✅ **Connection Management**: إدارة الاتصالات والانقطاعات

## Namespaces

### 1. `/notifications` - للإشعارات
- **Gateway**: `NotificationsGateway`
- **Events**:
  - `notification:new` - إشعار جديد
  - `unread-count` - عدد الإشعارات غير المقروءة
  - `marked-as-read` - تم تحديد كمقروء
  - `marked-all-as-read` - تم تحديد الكل كمقروء

### 2. `/support` - للرسائل والدعم
- **Gateway**: `SupportMessagesGateway`
- **Events**:
  - `message:new` - رسالة جديدة في التذكرة
  - `support:new-message` - إشعار برسالة جديدة
  - `user-typing` - مؤشر الكتابة
  - `joined-ticket` - انضمام لتذكرة
  - `left-ticket` - مغادرة تذكرة

## الاستخدام من Frontend

### الاتصال بالإشعارات

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/notifications', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
});

socket.on('connect', () => {
  console.log('✅ Connected to notifications');
});

socket.on('connected', (data) => {
  console.log('✅ Authenticated:', data);
});

socket.on('notification:new', (notification) => {
  console.log('🔔 New notification:', notification);
  // عرض الإشعار في UI
});

socket.on('unread-count', (data) => {
  console.log('📊 Unread count:', data.count);
});

// طلب عدد الإشعارات غير المقروءة
socket.emit('get-unread-count');

// تحديد إشعار كمقروء
socket.emit('mark-as-read', { notificationIds: ['id1', 'id2'] });

// تحديد الكل كمقروء
socket.emit('mark-all-as-read');
```

### الاتصال بالرسائل

```typescript
const supportSocket = io('http://localhost:3000/support', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  },
  transports: ['websocket', 'polling'],
});

supportSocket.on('connect', () => {
  console.log('✅ Connected to support');
});

// الانضمام لتذكرة
supportSocket.emit('join-ticket', { ticketId: 'ticket123' });

// استقبال رسالة جديدة
supportSocket.on('message:new', (message) => {
  console.log('💬 New message:', message);
  // عرض الرسالة في UI
});

// مؤشر الكتابة
supportSocket.on('user-typing', (data) => {
  console.log(`${data.userName} is typing...`);
});

// إرسال مؤشر الكتابة
supportSocket.emit('typing', { 
  ticketId: 'ticket123', 
  isTyping: true 
});

// مغادرة التذكرة
supportSocket.emit('leave-ticket', { ticketId: 'ticket123' });
```

## API

### WebSocketService

```typescript
// إرسال لمستخدم محدد
webSocketService.sendToUser(userId, 'event', data);

// إرسال لعدة مستخدمين
webSocketService.sendToMultipleUsers(userIds, 'event', data);

// إرسال لتذكرة
webSocketService.sendToTicket(ticketId, 'event', data, excludeUserId?);

// Broadcast للجميع
webSocketService.broadcast('event', data, excludeUserId?);

// التحقق من حالة الاتصال
webSocketService.isUserOnline(userId);
webSocketService.getConnectionCount(userId);
webSocketService.getTotalConnections();
```

## الأمان

- جميع الاتصالات تتطلب JWT token صالح
- التحقق من الصلاحيات تلقائياً
- كل مستخدم في room خاص به
- الرسائل الداخلية (internal) لا تُرسل عبر WebSocket

## التكوين

يتم التكوين عبر متغيرات البيئة:

```env
FRONTEND_URL=http://localhost:3000  # للـ CORS
```

## Logging

جميع الأحداث يتم تسجيلها:
- الاتصالات والانقطاعات
- الأخطاء
- الإرسال والاستقبال


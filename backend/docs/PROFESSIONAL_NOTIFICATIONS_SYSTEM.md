# 🔔 نظام الإشعارات الاحترافي المتكامل

## 🎯 نظرة عامة شاملة

نظام إشعارات احترافي متعدد القنوات يدعم Push Notifications, SMS, Email, و In-App Notifications مع إدارة متقدمة للقوالب، تفضيلات المستخدمين، والجدولة الذكية.

## ✨ المميزات الرئيسية

### 📱 قنوات متعددة (Multi-Channel)
- **In-App Notifications**: إشعارات داخل التطبيق
- **Push Notifications**: إشعارات فورية للموبايل والويب
- **SMS**: رسائل نصية قصيرة
- **Email**: بريد إلكتروني مع دعم HTML

### 🎨 نظام قوالب متقدم
- قوالب قابلة للتخصيص لكل نوع إشعار
- دعم متعدد اللغات (عربي/إنجليزي)
- متغيرات ديناميكية (Placeholders)
- نظام أولويات
- شروط وتصنيفات

### ⚙️ تفضيلات المستخدم
- التحكم الكامل في أنواع الإشعارات
- Quiet Hours (ساعات الهدوء)
- تفضيلات لكل فئة وقناة
- حدود التردد
- لغة مفضلة

### 📊 تتبع وتحليلات
- تتبع حالة الإشعارات (Sent, Delivered, Read, Clicked)
- إحصائيات شاملة
- معدلات الفتح والنقر
- تحليل الأداء
- Logs مفصلة

### 🔗 Webhooks
- إشعارات عبر Webhooks للأحداث
- Retry mechanism ذكي
- Authentication متعدد
- Filters مخصصة

### ⏰ جدولة ذكية
- إرسال مجدول
- Delay configurations
- Batch sending
- Quiet hours respect

## 📁 البنية المعمارية

```
notifications/
├── schemas/
│   ├── notification.schema.ts              # الإشعارات الأساسية
│   ├── notification-log.schema.ts          # سجلات الإشعارات
│   ├── notification-template.schema.ts     # القوالب
│   ├── notification-preference.schema.ts   # التفضيلات
│   ├── notification-webhook.schema.ts      # Webhooks
│   └── device-token.schema.ts              # Device tokens
├── dto/
│   └── notifications.dto.ts                # جميع DTOs
├── services/
│   ├── notifications.service.ts            # الخدمة الرئيسية
│   ├── template.service.ts                 # إدارة القوالب
│   ├── preference.service.ts               # إدارة التفضيلات
│   └── webhook.service.ts                  # إدارة Webhooks
├── ports/
│   ├── push.port.ts                        # Push notifications
│   ├── sms.port.ts                         # SMS
│   └── email.port.ts                       # Email
├── controllers/
│   ├── notifications.controller.ts         # User endpoints
│   └── admin.notifications.controller.ts   # Admin endpoints
└── notifications.module.ts
```

## 🔌 API Endpoints

### للمستخدمين

#### 1. الحصول على الإشعارات
```http
GET /api/notifications
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - channel: inApp|push|sms|email
  - status: pending|sent|read|failed
  - unreadOnly: boolean
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "notification_id",
      "title": "طلبك قيد التوصيل",
      "body": "طلبك #ORD-2024-00123 في طريقه إليك",
      "channel": "inApp",
      "status": "sent",
      "actionUrl": "/orders/ORD-2024-00123",
      "imageUrl": "https://...",
      "sentAt": "2024-01-15T10:30:00Z",
      "readAt": null,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "unread": 12
  }
}
```

#### 2. عدد غير المقروء
```http
GET /api/notifications/unread-count
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 12,
    "byChannel": {
      "inApp": 8,
      "push": 0,
      "email": 4
    },
    "byCategory": {
      "order": 5,
      "promotion": 3,
      "system": 4
    }
  }
}
```

#### 3. تحديد كمقروء
```http
POST /api/notifications/mark-read
Content-Type: application/json

{
  "notificationIds": ["id1", "id2"]
}
```

#### 4. تحديد الكل كمقروء
```http
POST /api/notifications/mark-all-read
Content-Type: application/json

{
  "channel": "inApp"  // optional
}
```

#### 5. حذف إشعار
```http
DELETE /api/notifications/:id
```

#### 6. الحصول على التفضيلات
```http
GET /api/notifications/preferences
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enableNotifications": true,
    "enableInApp": true,
    "enablePush": true,
    "enableSms": false,
    "enableEmail": true,
    "quietHours": {
      "enabled": true,
      "startTime": "22:00",
      "endTime": "08:00",
      "timezone": "Asia/Riyadh"
    },
    "categoryPreferences": {
      "order": {
        "inApp": true,
        "push": true,
        "sms": false,
        "email": true
      },
      "promotion": {
        "inApp": true,
        "push": false,
        "sms": false,
        "email": false
      }
    }
  }
}
```

#### 7. تحديث التفضيلات
```http
PUT /api/notifications/preferences
Content-Type: application/json

{
  "enablePush": false,
  "quietHours": {
    "enabled": true,
    "startTime": "23:00",
    "endTime": "07:00"
  },
  "categoryPreferences": {
    "promotion": {
      "push": false,
      "email": false
    }
  }
}
```

#### 8. تسجيل جهاز (Device Token)
```http
POST /api/notifications/devices/register
Content-Type: application/json

{
  "platform": "ios",
  "token": "device_fcm_token_here",
  "deviceName": "iPhone 13 Pro",
  "appVersion": "1.0.0"
}
```

#### 9. إلغاء تسجيل جهاز
```http
DELETE /api/notifications/devices/:tokenId
```

### للأدمن

#### 1. إرسال إشعار مخصص
```http
POST /api/admin/notifications/send
Content-Type: application/json

{
  "targetUsers": ["user_id_1", "user_id_2"],
  "targetRoles": ["customer"],
  "templateKey": "custom.announcement",
  "channels": ["inApp", "push", "email"],
  "variables": {
    "title": "عرض خاص",
    "message": "خصم 30% على جميع المنتجات"
  },
  "priority": "high",
  "scheduleAt": "2024-01-20T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "job_123",
    "targetCount": 1500,
    "estimatedDelivery": "2024-01-20T10:00:00Z",
    "channels": ["inApp", "push", "email"]
  }
}
```

#### 2. إرسال جماعي (Broadcast)
```http
POST /api/admin/notifications/broadcast
Content-Type: application/json

{
  "templateKey": "promotion.flash_sale",
  "channels": ["inApp", "push"],
  "filters": {
    "roles": ["customer"],
    "hasOrders": true,
    "minOrderCount": 1
  },
  "variables": {
    "discount": "50",
    "endTime": "23:59"
  }
}
```

#### 3. إدارة القوالب

##### إنشاء قالب
```http
POST /api/admin/notifications/templates
Content-Type: application/json

{
  "key": "order.delivered",
  "name": "تم تسليم الطلب",
  "nameEn": "Order Delivered",
  "category": "order",
  "priority": "high",
  "enabledChannels": ["inApp", "push", "sms", "email"],
  "variables": ["orderNumber", "customerName", "deliveryAddress"],
  "inApp": {
    "titleAr": "تم تسليم طلبك",
    "titleEn": "Your Order Delivered",
    "bodyAr": "طلبك {{orderNumber}} تم تسليمه بنجاح",
    "bodyEn": "Your order {{orderNumber}} has been delivered",
    "actionUrl": "/orders/{{orderNumber}}"
  },
  "push": {
    "titleAr": "تم التسليم ✅",
    "titleEn": "Delivered ✅",
    "bodyAr": "طلبك {{orderNumber}} وصل بسلام",
    "bodyEn": "Your order {{orderNumber}} arrived safely"
  },
  "email": {
    "subjectAr": "تم تسليم طلبك {{orderNumber}}",
    "subjectEn": "Your order {{orderNumber}} has been delivered",
    "htmlAr": "<html>...</html>",
    "htmlEn": "<html>...</html>"
  }
}
```

##### الحصول على جميع القوالب
```http
GET /api/admin/notifications/templates
Query Parameters:
  - category: order|product|promotion|account|system
  - isActive: boolean
  - page: number
  - limit: number
```

##### تحديث قالب
```http
PUT /api/admin/notifications/templates/:key
```

##### حذف قالب
```http
DELETE /api/admin/notifications/templates/:key
```

#### 4. الإحصائيات والتقارير

##### إحصائيات عامة
```http
GET /api/admin/notifications/stats
Query Parameters:
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD
  - channel: inApp|push|sms|email
  - category: order|product|promotion
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalSent": 125000,
      "totalDelivered": 120000,
      "totalRead": 85000,
      "totalClicked": 35000,
      "totalFailed": 5000
    },
    "byChannel": {
      "inApp": {
        "sent": 50000,
        "read": 40000,
        "readRate": 80
      },
      "push": {
        "sent": 45000,
        "delivered": 43000,
        "deliveryRate": 95.6
      },
      "email": {
        "sent": 25000,
        "opened": 12000,
        "openRate": 48,
        "clicked": 5000,
        "clickRate": 20
      },
      "sms": {
        "sent": 5000,
        "delivered": 4900,
        "deliveryRate": 98
      }
    },
    "topTemplates": [
      {
        "key": "order.shipped",
        "sent": 25000,
        "readRate": 85,
        "clickRate": 45
      }
    ],
    "performance": {
      "averageDeliveryTime": 2.5,
      "averageReadTime": 15.3
    }
  }
}
```

##### إحصائيات قالب محدد
```http
GET /api/admin/notifications/templates/:key/stats
```

##### سجل الإشعارات
```http
GET /api/admin/notifications/logs
Query Parameters:
  - userId: string
  - channel: string
  - status: string
  - templateKey: string
  - startDate: string
  - endDate: string
  - page: number
  - limit: number
```

#### 5. إدارة Webhooks

##### إنشاء webhook
```http
POST /api/admin/notifications/webhooks
Content-Type: application/json

{
  "name": "Order Notifications Webhook",
  "url": "https://api.example.com/webhooks/notifications",
  "events": [
    "notification.sent",
    "notification.delivered",
    "notification.read"
  ],
  "authentication": {
    "type": "bearer",
    "token": "your_bearer_token"
  },
  "filters": {
    "channels": ["push", "email"],
    "templateKeys": ["order.created", "order.shipped"]
  }
}
```

##### قائمة Webhooks
```http
GET /api/admin/notifications/webhooks
```

##### تحديث webhook
```http
PUT /api/admin/notifications/webhooks/:id
```

##### حذف webhook
```http
DELETE /api/admin/notifications/webhooks/:id
```

##### اختبار webhook
```http
POST /api/admin/notifications/webhooks/:id/test
```

## 📊 Schemas & Data Models

### 1. NotificationLog Schema
```typescript
{
  userId: ObjectId,
  templateId: ObjectId,
  templateKey: string,
  channel: 'inApp' | 'push' | 'sms' | 'email',
  status: 'pending' | 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'clicked' | 'failed',
  
  title: string,
  body: string,
  data: object,
  actionUrl?: string,
  imageUrl?: string,
  
  recipientEmail?: string,
  recipientPhone?: string,
  deviceToken?: string,
  platform?: 'ios' | 'android' | 'web',
  
  scheduledAt?: Date,
  sentAt?: Date,
  deliveredAt?: Date,
  readAt?: Date,
  clickedAt?: Date,
  failedAt?: Date,
  
  errorMessage?: string,
  errorCode?: string,
  retryCount: number,
  
  trackingId?: string,
  externalId?: string,
  
  metadata: {
    provider?: string,
    cost?: number,
    campaign?: string
  },
  
  priority: 'low' | 'medium' | 'high' | 'urgent',
  groupId?: string,
  batchId?: string
}
```

### 2. NotificationTemplate Schema
```typescript
{
  key: string,                  // unique identifier
  name: string,
  nameEn: string,
  category: 'order' | 'product' | 'promotion' | 'account' | 'system',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  
  inApp?: {
    titleAr: string,
    titleEn: string,
    bodyAr: string,
    bodyEn: string,
    actionUrl?: string,
    icon?: string,
    image?: string
  },
  
  push?: {
    titleAr: string,
    titleEn: string,
    bodyAr: string,
    bodyEn: string,
    sound?: string,
    badge?: number
  },
  
  sms?: {
    messageAr: string,
    messageEn: string,
    senderId?: string
  },
  
  email?: {
    subjectAr: string,
    subjectEn: string,
    htmlAr: string,
    htmlEn: string
  },
  
  variables: string[],
  enabledChannels: string[],
  isActive: boolean,
  
  stats: {
    totalSent: number,
    totalRead: number,
    totalClicked: number
  }
}
```

### 3. NotificationPreference Schema
```typescript
{
  userId: ObjectId,
  
  enableNotifications: boolean,
  enableInApp: boolean,
  enablePush: boolean,
  enableSms: boolean,
  enableEmail: boolean,
  
  quietHours?: {
    enabled: boolean,
    startTime: string,
    endTime: string,
    timezone: string
  },
  
  categoryPreferences: {
    order?: { inApp, push, sms, email },
    product?: { inApp, push, sms, email },
    promotion?: { inApp, push, sms, email }
  },
  
  mutedTemplates: string[],
  priorityTemplates: string[],
  
  preferredLanguage: 'ar' | 'en',
  
  frequencyLimits?: {
    maxNotificationsPerDay?: number,
    maxEmailsPerWeek?: number
  }
}
```

## 🎨 نظام القوالب (Templates)

### قوالب جاهزة مسبقاً

#### الطلبات (Orders)
- `order.created` - إنشاء طلب جديد
- `order.confirmed` - تأكيد الطلب
- `order.processing` - قيد المعالجة
- `order.shipped` - تم الشحن
- `order.out_for_delivery` - في طريقه للتسليم
- `order.delivered` - تم التسليم
- `order.completed` - اكتمل الطلب
- `order.cancelled` - إلغاء الطلب
- `order.refunded` - استرداد المبلغ

#### المنتجات (Products)
- `product.back_in_stock` - عودة للمخزون
- `product.price_drop` - انخفاض السعر
- `product.low_stock` - مخزون منخفض
- `product.new_arrival` - منتجات جديدة

#### العروض (Promotions)
- `promotion.new` - عرض جديد
- `promotion.expiring_soon` - ينتهي قريباً
- `promotion.exclusive` - عرض حصري
- `promotion.flash_sale` - تخفيضات سريعة

#### الحساب (Account)
- `account.welcome` - ترحيب
- `account.verification` - تأكيد البريد
- `account.password_reset` - إعادة تعيين كلمة المرور
- `account.profile_updated` - تحديث الملف
- `account.suspicious_activity` - نشاط مشبوه

#### النظام (System)
- `system.maintenance` - صيانة
- `system.update` - تحديث
- `system.announcement` - إعلان

### متغيرات القوالب (Variables)

المتغيرات المتاحة في القوالب:

```typescript
// Order related
{
  orderNumber: "ORD-2024-00123",
  customerName: "أحمد محمد",
  totalAmount: "2500",
  currency: "YER",
  itemsCount: "5",
  deliveryAddress: "الرياض، المملكة العربية السعودية",
  trackingNumber: "TRACK-123456",
  estimatedDelivery: "2024-01-20"
}

// Product related
{
  productName: "Solar Panel 300W",
  productImage: "https://...",
  oldPrice: "3000",
  newPrice: "2500",
  discount: "500",
  discountPercentage: "17"
}

// User related
{
  userName: "أحمد محمد",
  userEmail: "ahmad@example.com",
  userPhone: "+966501234567"
}

// Coupon related
{
  couponCode: "SUMMER2024",
  couponDiscount: "30",
  couponExpiry: "2024-06-30"
}
```

### استخدام المتغيرات

في القوالب، استخدم `{{variableName}}` للإشارة للمتغيرات:

```
العنوان: "طلبك {{orderNumber}} قيد التوصيل"
النص: "عزيزي {{customerName}}، طلبك بقيمة {{totalAmount}} {{currency}} في الطريق إليك"
```

## ⚙️ التكوين والإعدادات

### Environment Variables

```env
# Firebase Cloud Messaging (Push)
FCM_SERVER_KEY=your_fcm_server_key
FCM_SENDER_ID=your_sender_id

# SMS Provider (Twilio/etc)
SMS_PROVIDER=twilio
SMS_ACCOUNT_SID=your_account_sid
SMS_AUTH_TOKEN=your_auth_token
SMS_FROM_NUMBER=+1234567890

# Email Provider (SendGrid/etc)
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your_sendgrid_api_key
EMAIL_FROM_NAME=Tagadodo
EMAIL_FROM_EMAIL=noreply@tagadodo.com

# Notification Settings
NOTIFICATIONS_ENABLED=true
NOTIFICATIONS_BATCH_SIZE=100
NOTIFICATIONS_RETRY_ATTEMPTS=3
NOTIFICATIONS_RETRY_DELAY=60000
```

### Module Configuration

```typescript
// notifications.module.ts
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationLog.name, schema: NotificationLogSchema },
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
      { name: NotificationPreference.name, schema: NotificationPreferenceSchema },
      { name: NotificationWebhook.name, schema: NotificationWebhookSchema },
      { name: DeviceToken.name, schema: DeviceTokenSchema },
    ]),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    CacheModule,
  ],
  controllers: [NotificationsController, AdminNotificationsController],
  providers: [
    NotificationsService,
    TemplateService,
    PreferenceService,
    WebhookService,
    PushNotificationPort,
    SmsPort,
    EmailPort,
  ],
  exports: [NotificationsService],
})
```

## 🚀 أمثلة الاستخدام

### في الكود (Service Layer)

#### 1. إرسال إشعار بسيط
```typescript
await this.notificationsService.send({
  userId: 'user_id',
  templateKey: 'order.created',
  channels: ['inApp', 'push'],
  variables: {
    orderNumber: 'ORD-2024-00123',
    customerName: 'أحمد محمد',
    totalAmount: '2500'
  }
});
```

#### 2. إرسال إشعار مجدول
```typescript
await this.notificationsService.sendScheduled({
  userId: 'user_id',
  templateKey: 'order.delivery_reminder',
  channels: ['push', 'sms'],
  variables: { orderNumber: 'ORD-2024-00123' },
  scheduleAt: new Date('2024-01-20T10:00:00Z')
});
```

#### 3. إرسال جماعي
```typescript
await this.notificationsService.sendBroadcast({
  templateKey: 'promotion.flash_sale',
  channels: ['push'],
  filters: {
    roles: ['customer'],
    hasOrders: true
  },
  variables: {
    discount: '50',
    endTime: '23:59'
  }
});
```

#### 4. إرسال لمجموعة مستخدمين
```typescript
await this.notificationsService.sendBulk({
  userIds: ['user1', 'user2', 'user3'],
  templateKey: 'product.back_in_stock',
  channels: ['inApp', 'email'],
  variables: {
    productName: 'Solar Panel 300W',
    productUrl: '/products/solar-panel-300w'
  }
});
```

## 📈 التتبع والإحصائيات

### Event Tracking

تتبع تلقائي للأحداث:
- `notification.created` - عند إنشاء الإشعار
- `notification.queued` - عند إضافته للطابور
- `notification.sending` - عند بدء الإرسال
- `notification.sent` - عند الإرسال بنجاح
- `notification.delivered` - عند التسليم (Push/SMS/Email)
- `notification.read` - عند القراءة
- `notification.clicked` - عند النقر
- `notification.failed` - عند الفشل
- `notification.bounced` - عند الارتداد (Email)

### Metrics & KPIs

المقاييس المتوفرة:
- **Delivery Rate**: نسبة التسليم
- **Open Rate**: نسبة الفتح
- **Click Rate**: نسبة النقر
- **Conversion Rate**: نسبة التحويل
- **Bounce Rate**: نسبة الارتداد
- **Average Read Time**: متوسط وقت القراءة
- **Average Response Time**: متوسط وقت الاستجابة

## 🔒 الأمان والخصوصية

### Data Protection
- تشفير البيانات الحساسة
- حذف تلقائي بعد 90 يوم
- Soft delete للسجلات الحساسة
- GDPR compliance

### Rate Limiting
```typescript
// Per user limits
maxNotificationsPerDay: 100,
maxEmailsPerWeek: 20,
maxSmsPerMonth: 10,
maxPushPerHour: 10
```

### Authentication & Authorization
- JWT authentication لجميع الـ endpoints
- Role-based access control
- Admin-only endpoints
- User-specific data isolation

## 🎯 أفضل الممارسات

### 1. استخدام القوالب
✅ **افعل**: استخدم القوالب المعرفة مسبقاً
❌ **لا تفعل**: لا ترسل محتوى مباشر

### 2. احترام تفضيلات المستخدم
✅ **افعل**: تحقق من التفضيلات قبل الإرسال
❌ **لا تفعل**: لا ترسل للمستخدمين الذين أوقفوا نوع معين

### 3. Quiet Hours
✅ **افعل**: احترم ساعات الهدوء
❌ **لا تفعل**: لا ترسل في الليل إلا للإشعارات الحرجة

### 4. التخصيص
✅ **افعل**: استخدم اسم المستخدم والبيانات الشخصية
❌ **لا تفعل**: لا ترسل رسائل عامة

### 5. التوقيت
✅ **افعل**: أرسل في الوقت المناسب
❌ **لا تفعل**: لا ترسل إشعارات غير ضرورية

## 🛠️ Troubleshooting

### مشاكل شائعة وحلولها

#### 1. الإشعارات لا تُرسل
```bash
# تحقق من الخدمة
GET /api/admin/notifications/health

# تحقق من الطابور
GET /api/admin/notifications/queue/status

# تحقق من التفضيلات
GET /api/notifications/preferences
```

#### 2. Push Notifications لا تعمل
- تحقق من FCM credentials
- تحقق من Device tokens
- تحقق من SSL certificates
- راجع console errors

#### 3. Email لا يصل
- تحقق من SMTP settings
- راجع spam folder
- تحقق من email template
- راجع provider logs

## 📚 المراجع والموارد

### الوثائق الخارجية
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Twilio SMS](https://www.twilio.com/docs/sms)
- [SendGrid Email](https://docs.sendgrid.com/)

### الأدوات
- [Postman Collection](./postman/notifications.json)
- [Template Editor](./tools/template-editor)
- [Test Console](./tools/test-console)

---

## 🎉 الخلاصة

نظام إشعارات احترافي شامل يدعم:
- ✅ قنوات متعددة (In-App, Push, SMS, Email)
- ✅ قوالب قابلة للتخصيص
- ✅ تفضيلات مستخدم متقدمة
- ✅ جدولة ذكية
- ✅ تتبع وإحصائيات شاملة
- ✅ Webhooks للتكامل
- ✅ أداء عالي وقابل للتوسع
- ✅ آمن ومتوافق مع GDPR

**النظام جاهز للاستخدام الفوري!** 🚀

---

**النسخة**: 1.0.0  
**الحالة**: ✅ Production Ready  
**آخر تحديث**: 2024-01-15


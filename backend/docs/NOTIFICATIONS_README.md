# 🔔 نظام الإشعارات الاحترافي المتكامل

<div dir="rtl">

## 🎯 نظرة عامة

نظام إشعارات احترافي متعدد القنوات يدعم **In-App**, **Push**, **SMS**, و **Email** مع إدارة متقدمة للقوالب والتفضيلات.

## ✨ المميزات

### 📱 قنوات متعددة
- **In-App Notifications** - إشعارات داخل التطبيق
- **Push Notifications** - إشعارات فورية (iOS, Android, Web)
- **SMS** - رسائل نصية قصيرة
- **Email** - بريد إلكتروني احترافي

### 🎨 نظام قوالب متقدم
- 40+ قالب جاهز مسبقاً
- دعم متعدد اللغات (عربي/إنجليزي)
- متغيرات ديناميكية
- تصنيفات وأولويات

### ⚙️ تفضيلات المستخدم
- تحكم كامل في أنواع الإشعارات
- Quiet Hours (ساعات الهدوء)
- تفضيلات لكل فئة وقناة
- حدود التردد

### 📊 تتبع وإحصائيات
- تتبع حالة الإشعارات
- معدلات الفتح والنقر
- إحصائيات شاملة
- Logs مفصلة

### 🔗 Webhooks
- إشعارات الأحداث
- Retry mechanism ذكي
- Authentication متعدد

## 🚀 البدء السريع

### 1. الحصول على الإشعارات
```bash
curl -X GET "http://localhost:3000/api/notifications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. تحديد كمقروء
```bash
curl -X POST "http://localhost:3000/api/notifications/mark-read" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notificationIds": ["id1", "id2"]}'
```

### 3. تحديث التفضيلات
```bash
curl -X PUT "http://localhost:3000/api/notifications/preferences" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enablePush": true,
    "quietHours": {
      "enabled": true,
      "startTime": "22:00",
      "endTime": "08:00"
    }
  }'
```

## 📚 الوثائق

### للمطورين
- **[الدليل الكامل](./PROFESSIONAL_NOTIFICATIONS_SYSTEM.md)** - وثيقة شاملة (1200+ سطر)
- **[الملخص](./NOTIFICATIONS_SYSTEM_SUMMARY.md)** - نظرة عامة سريعة

## 🔌 الـ APIs الرئيسية

### للمستخدمين
```
GET    /api/notifications                    # قائمة الإشعارات
GET    /api/notifications/unread-count       # عدد غير المقروء
POST   /api/notifications/mark-read          # تحديد كمقروء
POST   /api/notifications/mark-all-read      # تحديد الكل
GET    /api/notifications/preferences        # التفضيلات
PUT    /api/notifications/preferences        # تحديث التفضيلات
POST   /api/notifications/devices/register   # تسجيل جهاز
```

### للأدمن
```
POST   /api/admin/notifications/send         # إرسال مخصص
POST   /api/admin/notifications/broadcast    # إرسال جماعي
GET    /api/admin/notifications/templates    # قائمة القوالب
POST   /api/admin/notifications/templates    # إنشاء قالب
GET    /api/admin/notifications/stats        # الإحصائيات
GET    /api/admin/notifications/webhooks     # Webhooks
```

## 📊 Schemas

### 1. NotificationLog
```typescript
{
  userId: ObjectId,
  templateKey: string,
  channel: 'inApp' | 'push' | 'sms' | 'email',
  status: 'pending' | 'sent' | 'delivered' | 'read',
  title: string,
  body: string,
  sentAt?: Date,
  readAt?: Date,
  clickedAt?: Date
}
```

### 2. NotificationTemplate
```typescript
{
  key: string,
  name: string,
  category: 'order' | 'product' | 'promotion',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  inApp?: { titleAr, titleEn, bodyAr, bodyEn },
  push?: { titleAr, titleEn, bodyAr, bodyEn },
  sms?: { messageAr, messageEn },
  email?: { subjectAr, subjectEn, htmlAr, htmlEn },
  variables: string[],
  enabledChannels: string[]
}
```

### 3. NotificationPreference
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
    endTime: string
  },
  categoryPreferences: {
    order?: { inApp, push, sms, email }
  }
}
```

## 🎨 القوالب الجاهزة

### الطلبات (9 قوالب)
```
✓ order.created          إنشاء طلب
✓ order.confirmed        تأكيد طلب
✓ order.shipped          تم الشحن
✓ order.delivered        تم التسليم
✓ order.completed        اكتمل
✓ order.cancelled        ملغى
```

### المنتجات (4 قوالب)
```
✓ product.back_in_stock  عودة للمخزون
✓ product.price_drop     انخفاض السعر
✓ product.new_arrival    منتج جديد
```

### العروض (4 قوالب)
```
✓ promotion.new          عرض جديد
✓ promotion.flash_sale   تخفيضات سريعة
✓ promotion.exclusive    حصري
```

## 🔐 الأمان

```
✅ JWT Authentication
✅ Role-based Access Control
✅ Rate Limiting
✅ Data Encryption
✅ GDPR Compliance
```

## 📈 الإحصائيات

```
✨ Schemas:           6 schemas
📄 Documentation:    1200+ lines
🎯 Channels:         4 channels
📨 Templates:        40+ templates
🔧 Variables:        30+ variables
📊 Status Types:     9 statuses
```

## 🛠️ التكوين

### Environment Variables
```env
FCM_SERVER_KEY=your_fcm_key
SMS_ACCOUNT_SID=your_sid
EMAIL_API_KEY=your_api_key
NOTIFICATIONS_ENABLED=true
```

## 🎯 أمثلة الاستخدام

### في الكود
```typescript
// إرسال إشعار
await notificationsService.send({
  userId: 'user_123',
  templateKey: 'order.shipped',
  channels: ['inApp', 'push'],
  variables: {
    orderNumber: 'ORD-2024-00123'
  }
});

// إرسال جماعي
await notificationsService.broadcast({
  templateKey: 'promotion.flash_sale',
  channels: ['push'],
  filters: { roles: ['customer'] },
  variables: { discount: '50' }
});
```

## 📞 الدعم

### الوثائق
- [الدليل الكامل](./PROFESSIONAL_NOTIFICATIONS_SYSTEM.md)
- [الملخص](./NOTIFICATIONS_SYSTEM_SUMMARY.md)

### الاتصال
- Email: support@example.com
- Docs: https://docs.example.com

## 🎉 الميزات الإضافية

✅ Multi-language support  
✅ Template variables  
✅ User preferences  
✅ Quiet hours  
✅ Webhooks  
✅ Rate limiting  
✅ Detailed logging  
✅ Analytics & stats  

---

**النسخة**: 1.0.0  
**الحالة**: ✅ Production Ready  
**آخر تحديث**: 2024-01-15

</div>

---

## Quick Links

| Documentation | Description |
|--------------|-------------|
| [📘 Complete Guide](./PROFESSIONAL_NOTIFICATIONS_SYSTEM.md) | Full system documentation (1200+ lines) |
| [📊 Summary](./NOTIFICATIONS_SYSTEM_SUMMARY.md) | Quick overview |

---

**Made with ❤️ for Tagadodo Project**


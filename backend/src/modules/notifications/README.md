# وحدة الإشعارات (Notifications Module)

## نظرة عامة
وحدة الإشعارات مسؤولة عن إدارة جميع أنواع الإشعارات في نظام Tagadodo. تتيح هذه الوحدة إرسال وإدارة الإشعارات للمستخدمين عبر قنوات متعددة مثل الإشعارات داخل التطبيق، البريد الإلكتروني، والرسائل النصية.

## الميزات الرئيسية

### 🎯 قنوات الإشعارات
- **داخل التطبيق (In-App)**: إشعارات تظهر داخل التطبيق
- **إشعارات الدفع (Push)**: إشعارات تصل للجهاز مباشرة
- **الرسائل النصية (SMS)**: رسائل نصية للمستخدمين
- **البريد الإلكتروني (Email)**: إشعارات عبر البريد الإلكتروني

### 📊 إدارة شاملة
- **لوحة تحكم إدارية**: واجهة شاملة لإدارة الإشعارات
- **إحصائيات مفصلة**: تتبع أداء الإشعارات ومعدلات النجاح
- **قوالب جاهزة**: مجموعة شاملة من قوالب الإشعارات
- **فلترة وبحث**: إمكانيات متقدمة للبحث والتصفية

### 🔧 الوظائف المتقدمة
- **إرسال مجمع**: إرسال إشعارات لعدة مستخدمين دفعة واحدة
- **جدولة الإرسال**: إمكانية جدولة الإشعارات للإرسال لاحقاً
- **اختبار القوالب**: إمكانية اختبار القوالب قبل الاستخدام
- **تتبع الحالة**: مراقبة حالة كل إشعار من الإرسال حتى القراءة

## الهيكل التقني

### Backend APIs

#### Admin Endpoints
```
GET    /notifications/admin/list         # قائمة الإشعارات مع فلترة
POST   /notifications/admin/create       # إنشاء إشعار جديد
GET    /notifications/admin/:id          # تفاصيل إشعار محدد
PUT    /notifications/admin/:id          # تحديث إشعار
DELETE /notifications/admin/:id          # حذف إشعار
POST   /notifications/admin/bulk-send    # إرسال مجمع
GET    /notifications/admin/stats        # إحصائيات الإشعارات
POST   /notifications/admin/cleanup      # تنظيف الإشعارات القديمة
```

#### User Endpoints
```
GET    /notifications                    # قائمة إشعارات المستخدم
GET    /notifications/unread-count       # عدد الإشعارات غير المقروءة
POST   /notifications/mark-read          # تحديد إشعارات كمقروءة
POST   /notifications/mark-all-read      # تحديد جميع الإشعارات كمقروءة
GET    /notifications/stats              # إحصائيات المستخدم
```

### Frontend Pages

#### 1. صفحة إدارة الإشعارات (`NotificationsListPage`)
- عرض جميع الإشعارات في جدول تفاعلي
- فلترة حسب القناة والحالة والمستخدم
- إجراءات: عرض، تعديل، إرسال، حذف
- إحصائيات سريعة في أعلى الصفحة

#### 2. صفحة الإحصائيات (`NotificationsAnalyticsPage`)
- إحصائيات شاملة للأداء
- توزيع الإشعارات حسب القناة
- معدلات النجاح والفشل
- رسوم بيانية ومؤشرات الأداء

#### 3. صفحة القوالب (`NotificationTemplatesPage`)
- إدارة قوالب الإشعارات
- اختبار القوالب قبل الاستخدام
- تصنيف القوالب حسب النوع
- معاينة محتوى القوالب

## القوالب المتاحة

### طلبات المنتجات
- `ORDER_CONFIRMED`: تأكيد الطلب
- `ORDER_SHIPPED`: شحن الطلب
- `ORDER_DELIVERED`: تسليم الطلب
- `ORDER_CANCELLED`: إلغاء الطلب
- `ORDER_REFUNDED`: إرجاع المبلغ

### خدمات المهندسين
- `SERVICE_REQUEST_OPENED`: فتح طلب خدمة
- `NEW_ENGINEER_OFFER`: عرض مهندس جديد
- `OFFER_ACCEPTED`: قبول العرض
- `SERVICE_STARTED`: بدء الخدمة
- `SERVICE_COMPLETED`: اكتمال الخدمة
- `SERVICE_RATED`: تسجيل التقييم
- `SERVICE_REQUEST_CANCELLED`: إلغاء طلب الخدمة

### المنتجات
- `PRODUCT_BACK_IN_STOCK`: توفر المنتج
- `PRODUCT_PRICE_DROP`: انخفاض السعر
- `LOW_STOCK`: مخزون قليل
- `OUT_OF_STOCK`: نفد المخزون

### العروض الترويجية
- `PROMOTION_STARTED`: بدء عرض جديد
- `PROMOTION_ENDING`: انتهاء عرض قريباً

### الحساب والأمان
- `ACCOUNT_VERIFIED`: تأكيد الحساب
- `PASSWORD_CHANGED`: تغيير كلمة المرور
- `LOGIN_ATTEMPT`: محاولة تسجيل دخول

### الدعم الفني
- `TICKET_CREATED`: إنشاء تذكرة دعم
- `TICKET_UPDATED`: تحديث تذكرة دعم
- `TICKET_RESOLVED`: حل تذكرة دعم

### النظام
- `SYSTEM_MAINTENANCE`: صيانة النظام
- `NEW_FEATURE`: ميزة جديدة
- `SYSTEM_ALERT`: تنبيه نظام

### التسويق
- `WELCOME_NEW_USER`: ترحيب بالمستخدم الجديد
- `BIRTHDAY_GREETING`: تهنئة بعيد الميلاد
- `CART_ABANDONMENT`: تذكير بسلة التسوق

### الدفع
- `PAYMENT_FAILED`: فشل الدفع
- `PAYMENT_SUCCESS`: نجاح الدفع

## الاستخدام

### إرسال إشعار برمجياً
```typescript
// في أي خدمة أخرى
import { NotificationsService } from '../notifications/notifications.service';

constructor(private notificationsService: NotificationsService) {}

async confirmOrder(userId: string, orderId: string, amount: number) {
  // منطق تأكيد الطلب...
  
  // إرسال إشعار
  await this.notificationsService.emit(
    userId,
    'ORDER_CONFIRMED',
    {
      orderId,
      amount,
      currency: 'SAR'
    }
  );
}
```

### إنشاء إشعار إداري
```typescript
const notification = await notificationsService.adminCreate({
  title: 'إشعار مهم',
  body: 'هذا إشعار إداري للمستخدمين',
  channel: 'inapp',
  targetUsers: ['userId1', 'userId2'],
  link: '/important-announcement'
});
```

### إرسال إشعار مجمع
```typescript
const results = await notificationsService.adminBulkSend({
  title: 'عرض جديد',
  body: 'عرض خاص على جميع المنتجات',
  channel: 'push',
  targetUsers: allUserIds,
  templateKey: 'PROMOTION_STARTED',
  payload: {
    promotionName: 'عرض الصيف',
    discount: 30
  }
});
```

## التكوين

### متغيرات البيئة
```env
# إعدادات MongoDB
MONGO_URI=mongodb://localhost:27017/tagadodo

# إعدادات Redis للـ Cache
REDIS_URL=redis://localhost:6379

# إعدادات FCM للإشعارات الدفع (اختياري)
FCM_SERVER_KEY=your_fcm_server_key

# إعدادات SMS (اختياري)
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=your_sender_id
```

### تكوين FCM (Firebase Cloud Messaging)
```typescript
// في notifications.module.ts
providers: [
  { provide: PUSH_PORT, useClass: FCMAdapter }, // بدلاً من NullPushAdapter
]
```

### تكوين SMS
```typescript
// في notifications.module.ts
providers: [
  { provide: SMS_PORT, useClass: YourSMSAdapter }, // بدلاً من NullSmsAdapter
]
```

## الأمان

- جميع endpoints الإدارية محمية بـ `AdminGuard`
- التحقق من صحة البيانات باستخدام class-validator
- تشفير البيانات الحساسة
- تسجيل جميع العمليات الإدارية

## المراقبة والتحليل

### إحصائيات الأداء
- معدل نجاح الإرسال
- معدل الفشل حسب القناة
- عدد الإشعارات المرسلة يومياً
- عدد الإشعارات المقروءة

### تتبع الأخطاء
- تسجيل أخطاء الإرسال
- تتبع فشل الاتصال بالخدمات الخارجية
- مراقبة أداء قاعدة البيانات

## التطوير المستقبلي

### ميزات مخططة
- [ ] إشعارات مجدولة متقدمة
- [ ] تحليلات سلوك المستخدم
- [ ] إشعارات ذكية حسب التفضيلات
- [ ] دعم القنوات الإضافية (WhatsApp, Telegram)
- [ ] نظام A/B Testing للإشعارات
- [ ] إشعارات صوتية
- [ ] دعم الإشعارات التفاعلية

### تحسينات الأداء
- [ ] تحسين استعلامات قاعدة البيانات
- [ ] إضافة Redis للـ Caching
- [ ] معالجة الإشعارات بشكل متوازي
- [ ] ضغط البيانات المخزنة

## الدعم والمساهمة

للدعم التقني أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.

للمساهمة في التطوير، يرجى قراءة دليل المساهمة في المشروع.

## المكونات الرئيسية
- **خدمات الإشعارات**: مسؤولة عن إنشاء وإرسال وتتبع الإشعارات
- **وحدات التحكم**: توفر واجهات API لإدارة الإشعارات
- **نماذج البيانات (DTOs)**: تحدد هيكل بيانات الإشعارات
- **القوالب**: قوالب للإشعارات المختلفة

## أنواع الإشعارات
- إشعارات النظام
- إشعارات الطلبات
- إشعارات المنتجات
- إشعارات العروض والخصومات
- إشعارات المستخدم

## تفاصيل العمليات

### 1. إنشاء الإشعارات
تبدأ عملية الإشعارات عندما يحدث حدث معين في النظام (مثل إكمال طلب، تغيير حالة طلب، إضافة منتج جديد). يتم استدعاء خدمة الإشعارات مع المعلومات اللازمة لإنشاء الإشعار:
- نوع الإشعار
- المستلم/المستلمين
- البيانات المتعلقة بالإشعار
- مستوى الأولوية

### 2. معالجة الإشعارات
بعد إنشاء الإشعار، تقوم وحدة المعالجة بما يلي:
- تحديد قنوات الإرسال المناسبة (تطبيق، بريد إلكتروني، رسائل نصية)
- تجهيز محتوى الإشعار باستخدام القوالب المناسبة
- تطبيق قواعد التصفية والتخصيص حسب إعدادات المستخدم
- جدولة الإشعارات حسب الأولوية والتوقيت المناسب

### 3. إرسال الإشعارات
تتم عملية الإرسال عبر مزودي خدمات مختلفين:
- **إشعارات التطبيق**: تُخزن في قاعدة البيانات وتُعرض للمستخدم عند تسجيل الدخول
- **البريد الإلكتروني**: يتم إرسالها عبر خدمة SMTP
- **الرسائل النصية**: تُرسل عبر مزود خدمة SMS

### 4. تتبع وتحليل الإشعارات
يتم تتبع حالة كل إشعار:
- تم الإرسال
- تم التسليم
- تم الفتح/القراءة
- تم التفاعل معه

### 5. إدارة تفضيلات الإشعارات
يمكن للمستخدمين إدارة تفضيلات الإشعارات الخاصة بهم:
- تفعيل/تعطيل أنواع معينة من الإشعارات
- اختيار قنوات الإشعار المفضلة
- تحديد أوقات استلام الإشعارات

## التكامل
تتكامل وحدة الإشعارات مع وحدات أخرى في النظام مثل وحدة المستخدمين، الطلبات، والمنتجات لإرسال إشعارات مخصصة بناءً على أحداث محددة.

## الاستخدام
يمكن استخدام هذه الوحدة من خلال حقن خدمة الإشعارات في الوحدات الأخرى واستدعاء الدوال المناسبة لإرسال الإشعارات.

### مثال على استخدام خدمة الإشعارات

```typescript
// في وحدة الطلبات
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(private notificationsService: NotificationsService) {}

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    // تحديث حالة الطلب
    const order = await this.orderRepository.updateStatus(orderId, status);
    
    // إرسال إشعار للمستخدم
    await this.notificationsService.sendNotification({
      type: NotificationType.ORDER_STATUS_CHANGE,
      recipient: order.userId,
      data: {
        orderId: order.id,
        newStatus: status,
        orderNumber: order.orderNumber
      },
      priority: NotificationPriority.HIGH
    });
    
    return order;
  }
}

---

**Version:** 1.0.1
**Status:** ✅ Production Ready

**ملاحظة:** تم تحديث README ليعكس المسارات الفعلية وإضافة القوالب المفقودة.

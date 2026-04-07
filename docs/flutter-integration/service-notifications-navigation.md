# التنقل عند الضغط على إشعارات الخدمات

هذا الملف يشرح كيف يتعامل التطبيق (Flutter أو Web) مع إشعارات الخدمات بحيث يفتح شاشة الطلب الصحيح عند الضغط على الإشعار.

## الهدف

- دعم إشعارات الخدمة مثل `SERVICE_REQUEST_OPENED` و `NEW_ENGINEER_OFFER` و `SERVICE_STARTED` وغيرها.
- توحيد استخراج `serviceRequestId` من الحقول القادمة من الـ API.
- منع فشل التنقل عند اختلاف بسيط في الحقول (`serviceRequestId` vs `requestId`) أو الروابط (`/service-requests` vs `/services`).

## شكل الإشعار المتوقع من الـ API

ملاحظة: في الـ API ستصل القيم كسلاسل نصية عادية (بدون صيغة Mongo مثل `$oid`).

```json
{
  "_id": "69aa789bcd11cb8cfc529eda",
  "type": "SERVICE_REQUEST_OPENED",
  "title": "طلب خدمة جديد في مدينتك",
  "message": "طلب خدمة جديد: صيانة الكهرباء",
  "data": {
    "requestId": "69aa789acd11cb8cfc529ec2",
    "title": "صيانة الكهرباء",
    "city": "حضرموت",
    "serviceRequestId": "69aa789acd11cb8cfc529ec2"
  },
  "actionUrl": "/service-requests/69aa789acd11cb8cfc529ec2",
  "navigationType": "service_request",
  "navigationTarget": "69aa789acd11cb8cfc529ec2",
  "category": "service",
  "channel": "push",
  "status": "sent"
}
```

## قاعدة التنقل المعتمدة

عند الضغط على إشعار خدمة، اتبع الأولوية التالية لاستخراج معرّف الطلب:

1. `navigationType == "service_request"` مع `navigationTarget` صالح
2. `data.serviceRequestId`
3. `data.requestId`
4. `actionUrl` (إذا كانت تحتوي على ID)

ثم افتح مسار تفاصيل طلب الخدمة في التطبيق.

## المسار الداخلي المقترح داخل التطبيق

- المسار الأساسي الموصى به: `/service-requests/:id`
- للتوافق العكسي: إذا كان التطبيق يستخدم `/services/:id` يمكن التحويل داخليًا لنفس الشاشة.

## مثال Flutter (موصى به)

```dart
bool _looksLikeId(String? value) {
  if (value == null) return false;
  final v = value.trim();
  return v.isNotEmpty && v != 'undefined' && v != 'null' && v.length >= 12;
}

String? extractServiceRequestId(Map<String, dynamic> notification) {
  final navigationType = (notification['navigationType'] ?? '').toString();
  final navigationTarget = notification['navigationTarget']?.toString();
  final data = (notification['data'] is Map)
      ? Map<String, dynamic>.from(notification['data'] as Map)
      : <String, dynamic>{};

  if (navigationType == 'service_request' && _looksLikeId(navigationTarget)) {
    return navigationTarget!.trim();
  }

  final serviceRequestId = data['serviceRequestId']?.toString();
  if (_looksLikeId(serviceRequestId)) return serviceRequestId!.trim();

  final requestId = data['requestId']?.toString();
  if (_looksLikeId(requestId)) return requestId!.trim();

  final actionUrl = notification['actionUrl']?.toString() ?? '';
  final match = RegExp(r'/(service-requests|services)/([^/?#]+)').firstMatch(actionUrl);
  if (match != null && _looksLikeId(match.group(2))) {
    return match.group(2)!.trim();
  }

  return null;
}

String? resolveNotificationRoute(Map<String, dynamic> notification) {
  final type = (notification['type'] ?? '').toString();

  const serviceTypes = {
    'SERVICE_REQUEST_OPENED',
    'NEW_ENGINEER_OFFER',
    'OFFER_ACCEPTED',
    'OFFER_REJECTED',
    'OFFER_CANCELLED',
    'SERVICE_STARTED',
    'SERVICE_COMPLETED',
    'SERVICE_RATED',
    'SERVICE_REQUEST_CANCELLED',
  };

  if (serviceTypes.contains(type) ||
      (notification['category']?.toString() == 'service')) {
    final id = extractServiceRequestId(notification);
    if (id != null) return '/service-requests/$id';
    return '/service-requests';
  }

  return null;
}
```

## سلوك الضغط على الإشعار

- إذا وُجد route صالح: افتح صفحة التفاصيل مباشرة.
- إذا لا يوجد ID صالح: افتح قائمة طلبات الخدمات `/service-requests`.
- بعد الفتح، نفّذ `mark-read` للإشعار إن لم يكن مقروءًا.

## ملاحظات مهمة

- `navigationType` و `navigationTarget` هما المصدر الأساسي للتنقل.
- `data.serviceRequestId` و `data.requestId` يستخدمان كـ fallback للتوافق.
- لا تعتمد على `title` داخل `data` في التنقل، لأنه وصفي فقط.
- في Push Notifications (FCM)، قد تصل البيانات كسلاسل نصية؛ تأكد من التحويل قبل القراءة.

## Checklist سريع

- [ ] دعم `service_request` في مفسر التنقل.
- [ ] دعم جميع أنواع الخدمة المذكورة أعلاه.
- [ ] تطبيق fallback: `navigationTarget -> serviceRequestId -> requestId -> actionUrl`.
- [ ] توحيد المسار النهائي داخل التطبيق على `/service-requests/:id`.
- [ ] وضع fallback آمن إلى `/service-requests` عند فشل استخراج ID.

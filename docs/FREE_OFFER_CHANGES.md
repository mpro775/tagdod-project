# تعديل نظام العروض - السماح بالعروض المجانية

## الملخص
تم تعديل نظام العروض للسماح للمهندسين بإرسال عروض مجانية (بدون مبلغ)، خاصة لخدمات الاستشارة.

---

## التغييرات في API

### Endpoint: `POST /services/engineer/offers`

#### التغييرات في Request Body:

| الحقل | النوع | القديم | الجديد |
|-------|------|--------|--------|
| `amount` | number | **إجباري** | **اختياري** |
| `currency` | string | إجباري | اختياري |

#### Request Body الجديد:

```json
{
  "requestId": "string (required)",
  "amount": 0,           // اختياري - يمكن حذفه أو 0 للمجاني
  "currency": "YER",     // اختياري - الافتراضي YER
  "note": "string",      // اختياري
  "lat": 15.3695,        // required
  "lng": 44.2019         // required
}
```

#### أمثلة:

**1. عرض مدفوع:**
```json
{
  "requestId": "678abc123...",
  "amount": 5000,
  "currency": "YER",
  "note": "سأقوم بالإصلاح خلال ساعتين",
  "lat": 15.3695,
  "lng": 44.2019
}
```

**2. عرض مجاني (استشارة):**
```json
{
  "requestId": "678abc123...",
  "note": "استشارة مجانية - المشكلة بسيطة ويمكن حلها بسهولة",
  "lat": 15.3695,
  "lng": 44.2019
}
```

**3. عرض مجاني (amount = 0):**
```json
{
  "requestId": "678abc123...",
  "amount": 0,
  "note": "سأساعدك مجاناً",
  "lat": 15.3695,
  "lng": 44.2019
}
```

---

## التغييرات في Response

### Offer Object الجديد:

```json
{
  "_id": "offer123",
  "requestId": "req456",
  "engineerId": "eng789",
  "amount": 0,              // 0 للمجاني
  "currency": "YER",
  "note": "استشارة مجانية",
  "distanceKm": 2.5,
  "status": "OFFERED",
  "isFreeOffer": true,      // حقل جديد
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

---

## التعديلات المطلوبة في تطبيق Flutter

### 1. تعديل Model `ServiceOffer`

```dart
class ServiceOffer {
  final String id;
  final String requestId;
  final String engineerId;
  final String? engineerName;
  final String? engineerAvatar;
  final double? engineerRating;
  final double? price;           // أصبح nullable
  final String? currency;        // أصبح nullable
  final String? notes;
  final String? duration;
  final String? status;
  final bool? isFreeOffer;       // حقل جديد
  final DateTime createdAt;
  final DateTime? updatedAt;

  bool get isFree => isFreeOffer == true || (price == null || price == 0);
}
```

### 2. تعديل Request Body `CreateOfferBody`

```dart
class CreateOfferBody {
  final String requestId;
  final double? price;     // أصبح nullable
  final String? currency;  // أصبح nullable
  final String? notes;
  final double lat;
  final double lng;

  Map<String, dynamic> toJson() {
    final json = {
      'requestId': requestId,
      'lat': lat,
      'lng': lng,
    };
    
    // إضافة amount فقط إذا تم تحديده
    if (price != null) {
      json['amount'] = price;
      json['currency'] = currency ?? 'YER';
    }
    
    if (notes != null && notes!.isNotEmpty) {
      json['note'] = notes;
    }
    
    return json;
  }
}
```

### 3. تعديل شاشة إنشاء العرض

```dart
// في نموذج إنشاء العرض
TextFormField(
  decoration: InputDecoration(
    labelText: 'المبلغ (اختياري)',
    hintText: 'اتركه فارغ للعرض المجاني',
  ),
  keyboardType: TextInputType.number,
  validator: (value) {
    // ليس إجباري
    if (value == null || value.isEmpty) return null;
    final number = double.tryParse(value);
    if (number == null || number < 0) {
      return 'أدخل مبلغ صحيح';
    }
    return null;
  },
),

// إضافة خيار "عرض مجاني"
SwitchListTile(
  title: Text('عرض مجاني (استشارة)'),
  value: isFreeOffer,
  onChanged: (value) {
    setState(() {
      isFreeOffer = value;
      if (value) {
        priceController.clear();
      }
    });
  },
),
```

### 4. تعديل عرض قائمة العروض للعميل

```dart
Widget buildOfferCard(ServiceOffer offer) {
  return Card(
    child: ListTile(
      leading: CircleAvatar(
        child: Text(offer.engineerName?[0] ?? '?'),
      ),
      title: Text(offer.engineerName ?? 'مهندس'),
      subtitle: Text(
        offer.isFree 
          ? 'عرض مجاني' 
          : '${offer.price} ${offer.currency}',
      ),
      trailing: offer.isFreeOffer == true
        ? Chip(label: Text('مجاني'), backgroundColor: Colors.green[100])
        : null,
    ),
  );
}
```

### 5. تعديل شاشة تفاصيل العرض

```dart
// عند قبول عرض مجاني
if (offer.isFree) {
  // لا حاجة للدفع
  await acceptOffer(offer.id);
  showSuccessMessage('تم قبول العرض المجاني');
} else {
  // الانتقال لصفحة الدفع
  navigateToPayment(offer);
}
```

---

## ملاحظات مهمة

1. **العروض المجانية** تحمل `amount = 0` و `isFreeOffer = true`
2. **العملة** لم تعد مطلوبة للعروض المجانية
3. **المهندس** يمكنه تحديث العرض وإضافة مبلغ لاحقاً (قبل القبول)
4. **العميل** يرى وسم "مجاني" على العروض المجانية

---

## سيناريوهات الاستخدام

### سيناريو 1: استشارة مجانية
```
العميل: يطلب استشارة
المهندس: يرسل عرض بدون مبلغ + ملاحظة
العميل: يقبل العرض مباشرة (بدون دفع)
```

### سيناريو 2: عرض ثم تحديد سعر
```
المهندس: يرسل عرض مجاني + ملاحظة "أحتاج معاينة"
العميل: يقبل العرض
المهندس: بعد المعاينة يحدد السعر الفعلي
```

### سيناريو 3: عرض مدفوع عادي
```
المهندس: يرسل عرض بمبلغ 5000 YER
العميل: يقبل ويدفع
```

---

## تاريخ التعديل
- **التاريخ:** 2026-02-21
- **الإصدار:** v1.x

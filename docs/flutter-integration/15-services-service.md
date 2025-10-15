# 🔧 خدمة الطلبات الهندسية (Engineering Services)

خدمة الطلبات الهندسية توفر endpoints لطلب خدمات المهندسين.

---

## Endpoints

### 1. إنشاء طلب خدمة
- **POST** `/services/requests`
- **Auth:** ✅ Required
- **Body:**
```json
{
  "serviceType": "INSTALLATION",
  "title": "تركيب نظام طاقة شمسية",
  "description": "أحتاج تركيب نظام 10 كيلو واط",
  "location": {
    "city": "صنعاء",
    "district": "الحصبة",
    "address": "شارع الزبيري"
  },
  "preferredDate": "2025-10-20T10:00:00.000Z",
  "images": [
    "https://cdn.example.com/uploads/site-photo-1.jpg"
  ],
  "budget": {
    "min": 500000,
    "max": 1000000,
    "currency": "YER"
  }
}
```

- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "service_123",
    "requestNumber": "SRQ-2025-001",
    "userId": "user_456",
    "serviceType": "INSTALLATION",
    "title": "تركيب نظام طاقة شمسية",
    "status": "OPEN",
    "offersCount": 0,
    "createdAt": "2025-10-15T12:00:00.000Z"
  }
}
```

**أنواع الخدمات:**
- `INSTALLATION`: تركيب
- `MAINTENANCE`: صيانة
- `REPAIR`: إصلاح
- `CONSULTATION`: استشارة

### 2. طلباتي
- **GET** `/services/requests/my`
- **Auth:** ✅ Required
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "service_123",
      "requestNumber": "SRQ-2025-001",
      "serviceType": "INSTALLATION",
      "title": "تركيب نظام طاقة شمسية",
      "status": "OPEN",
      "offersCount": 3,
      "createdAt": "2025-10-15T12:00:00.000Z"
    }
  ]
}
```

**حالات الطلب:**
- `OPEN`: مفتوح للعروض
- `IN_PROGRESS`: جاري التنفيذ
- `COMPLETED`: مكتمل
- `CANCELLED`: ملغي

### 3. تفاصيل طلب
- **GET** `/services/requests/:id`
- **Auth:** ✅ Required
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "service_123",
    "requestNumber": "SRQ-2025-001",
    "userId": "user_456",
    "serviceType": "INSTALLATION",
    "title": "تركيب نظام طاقة شمسية",
    "description": "أحتاج تركيب نظام 10 كيلو واط",
    "location": {
      "city": "صنعاء",
      "district": "الحصبة",
      "address": "شارع الزبيري"
    },
    "preferredDate": "2025-10-20T10:00:00.000Z",
    "images": ["..."],
    "budget": {
      "min": 500000,
      "max": 1000000,
      "currency": "YER"
    },
    "status": "OPEN",
    "offersCount": 3,
    "createdAt": "2025-10-15T12:00:00.000Z"
  }
}
```

### 4. إلغاء طلب
- **POST** `/services/requests/:id/cancel`
- **Auth:** ✅ Required

### 5. العروض المقدمة على طلب
- **GET** `/services/requests/:id/offers`
- **Auth:** ✅ Required
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "offer_123",
      "serviceRequestId": "service_123",
      "engineerId": "eng_456",
      "engineer": {
        "name": "محمد أحمد",
        "rating": 4.8,
        "reviewsCount": 45,
        "completedJobs": 120
      },
      "price": 750000,
      "currency": "YER",
      "estimatedDuration": "3 days",
      "description": "سأقوم بتركيب النظام بأعلى جودة...",
      "warranty": "سنتان ضمان",
      "status": "PENDING",
      "createdAt": "2025-10-15T14:00:00.000Z"
    }
  ]
}
```

### 6. قبول عرض
- **POST** `/services/requests/:id/accept-offer`
- **Auth:** ✅ Required
- **Body:**
```json
{
  "offerId": "offer_123"
}
```

### 7. تقييم الخدمة
- **POST** `/services/requests/:id/rate`
- **Auth:** ✅ Required
- **Body:**
```json
{
  "score": 5,
  "comment": "خدمة ممتازة وجودة عالية"
}
```

---

## Models في Flutter

```dart
class ServiceRequest {
  final String id;
  final String requestNumber;
  final String userId;
  final String serviceType;
  final String title;
  final String description;
  final ServiceLocation location;
  final DateTime? preferredDate;
  final List<String> images;
  final ServiceBudget? budget;
  final String status;
  final int offersCount;
  final DateTime createdAt;

  ServiceRequest({
    required this.id,
    required this.requestNumber,
    required this.userId,
    required this.serviceType,
    required this.title,
    required this.description,
    required this.location,
    this.preferredDate,
    required this.images,
    this.budget,
    required this.status,
    required this.offersCount,
    required this.createdAt,
  });

  factory ServiceRequest.fromJson(Map<String, dynamic> json) {
    return ServiceRequest(
      id: json['_id'],
      requestNumber: json['requestNumber'],
      userId: json['userId'],
      serviceType: json['serviceType'],
      title: json['title'],
      description: json['description'],
      location: ServiceLocation.fromJson(json['location']),
      preferredDate: json['preferredDate'] != null
          ? DateTime.parse(json['preferredDate'])
          : null,
      images: List<String>.from(json['images'] ?? []),
      budget: json['budget'] != null
          ? ServiceBudget.fromJson(json['budget'])
          : null,
      status: json['status'],
      offersCount: json['offersCount'] ?? 0,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  bool get isOpen => status == 'OPEN';
  bool get isInProgress => status == 'IN_PROGRESS';
  bool get isCompleted => status == 'COMPLETED';
  bool get isCancelled => status == 'CANCELLED';
  bool get hasOffers => offersCount > 0;
}

class ServiceLocation {
  final String city;
  final String district;
  final String address;

  ServiceLocation({
    required this.city,
    required this.district,
    required this.address,
  });

  factory ServiceLocation.fromJson(Map<String, dynamic> json) {
    return ServiceLocation(
      city: json['city'],
      district: json['district'],
      address: json['address'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'city': city,
      'district': district,
      'address': address,
    };
  }
}

class ServiceBudget {
  final double min;
  final double max;
  final String currency;

  ServiceBudget({
    required this.min,
    required this.max,
    required this.currency,
  });

  factory ServiceBudget.fromJson(Map<String, dynamic> json) {
    return ServiceBudget(
      min: (json['min'] ?? 0).toDouble(),
      max: (json['max'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'min': min,
      'max': max,
      'currency': currency,
    };
  }
}

class ServiceOffer {
  final String id;
  final String serviceRequestId;
  final String engineerId;
  final EngineerInfo engineer;
  final double price;
  final String currency;
  final String estimatedDuration;
  final String description;
  final String? warranty;
  final String status;
  final DateTime createdAt;

  ServiceOffer({
    required this.id,
    required this.serviceRequestId,
    required this.engineerId,
    required this.engineer,
    required this.price,
    required this.currency,
    required this.estimatedDuration,
    required this.description,
    this.warranty,
    required this.status,
    required this.createdAt,
  });

  factory ServiceOffer.fromJson(Map<String, dynamic> json) {
    return ServiceOffer(
      id: json['_id'],
      serviceRequestId: json['serviceRequestId'],
      engineerId: json['engineerId'],
      engineer: EngineerInfo.fromJson(json['engineer']),
      price: (json['price'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
      estimatedDuration: json['estimatedDuration'],
      description: json['description'],
      warranty: json['warranty'],
      status: json['status'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  bool get isPending => status == 'PENDING';
  bool get isAccepted => status == 'ACCEPTED';
  bool get isRejected => status == 'REJECTED';
}

class EngineerInfo {
  final String name;
  final double rating;
  final int reviewsCount;
  final int completedJobs;

  EngineerInfo({
    required this.name,
    required this.rating,
    required this.reviewsCount,
    required this.completedJobs,
  });

  factory EngineerInfo.fromJson(Map<String, dynamic> json) {
    return EngineerInfo(
      name: json['name'],
      rating: (json['rating'] ?? 0).toDouble(),
      reviewsCount: json['reviewsCount'] ?? 0,
      completedJobs: json['completedJobs'] ?? 0,
    );
  }
}

class ServiceRating {
  final int score;
  final String comment;

  ServiceRating({
    required this.score,
    required this.comment,
  });

  Map<String, dynamic> toJson() {
    return {
      'score': score,
      'comment': comment,
    };
  }
}
```

---

## 📝 ملاحظات مهمة

1. **صلاحيات المهندس:**
   - يجب أن يكون المستخدم مسجل كمهندس
   - يحتاج موافقة الأدمن (`engineer_capable = true`)

2. **سير العمل:**
   - الزبون ينشئ طلب خدمة
   - المهندسون يقدمون عروضهم
   - الزبون يقبل أفضل عرض
   - بعد الإنجاز، الزبون يقيّم الخدمة

3. **الصور:**
   - استخدم `/upload` endpoint لرفع الصور أولاً
   - ثم أضف الروابط في `images` array

4. **الميزانية:**
   - اختيارية ولكن تساعد المهندسين
   - `min` و `max` لتحديد نطاق السعر

---

## ✅ تم الانتهاء

تم إنشاء جميع ملفات التوثيق بنجاح! 🎉

الملفات المنشأة:
- ✅ README.md (الفهرس الرئيسي)
- ✅ 01-response-structure.md (هيكل الاستجابة)
- ✅ 02-auth-service.md (المصادقة)
- ✅ 03-products-service.md (المنتجات)
- ✅ 04-cart-service.md (السلة)
- ✅ 05-checkout-service.md (الدفع والطلبات)
- ✅ 06-categories-service.md (التصنيفات)
- ✅ 07-favorites-service.md (المفضلات)
- ✅ 08-addresses-service.md (العناوين)
- ✅ 09-banners-service.md (البنرات)
- ✅ 10-brands-service.md (العلامات التجارية)
- ✅ 11-search-service.md (البحث)
- ✅ 12-coupons-service.md (الكوبونات)
- ✅ 13-pricing-service.md (التسعير)
- ✅ 14-notifications-service.md (الإشعارات)
- ✅ 15-services-service.md (الطلبات الهندسية)

**الموقع:** `docs/flutter-integration/`


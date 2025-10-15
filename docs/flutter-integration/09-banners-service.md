# 🎨 خدمة البنرات (Banners Service)

خدمة البنرات توفر endpoints لعرض البنرات الإعلانية.

---

## Endpoints

### 1. قائمة البنرات النشطة
- **GET** `/banners`
- **Auth:** ❌ No
- **Query:** `?location=HOME_SLIDER`
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "banner_123",
      "title": {"ar": "عرض خاص", "en": "Special Offer"},
      "description": {"ar": "خصم 20%", "en": "20% Discount"},
      "image": "https://cdn.example.com/banners/offer-1.jpg",
      "link": "/products?categoryId=64cat123",
      "linkType": "INTERNAL",
      "location": "HOME_SLIDER",
      "order": 1,
      "startDate": "2025-10-01T00:00:00.000Z",
      "endDate": "2025-10-31T23:59:59.000Z",
      "isActive": true,
      "viewCount": 1520,
      "clickCount": 245
    }
  ]
}
```

**Locations:** `HOME_SLIDER`, `HOME_BANNER_TOP`, `HOME_BANNER_MIDDLE`, `CATEGORY_TOP`

### 2. بنر محدد
- **GET** `/banners/:id`
- **Auth:** ❌ No

### 3. زيادة عداد المشاهدات
- **POST** `/banners/:id/view`
- **Auth:** ❌ No

### 4. زيادة عداد النقرات
- **POST** `/banners/:id/click`
- **Auth:** ❌ No

### 5. البنر مع تفاصيل العرض
- **GET** `/banners/:id/promotion`
- **Auth:** ❌ No

---

## Models في Flutter

```dart
class Banner {
  final String id;
  final LocalizedString title;
  final LocalizedString? description;
  final String image;
  final String? link;
  final String linkType; // INTERNAL, EXTERNAL, NONE
  final String location;
  final int order;
  final DateTime? startDate;
  final DateTime? endDate;
  final bool isActive;
  final int viewCount;
  final int clickCount;

  Banner({
    required this.id,
    required this.title,
    this.description,
    required this.image,
    this.link,
    required this.linkType,
    required this.location,
    required this.order,
    this.startDate,
    this.endDate,
    required this.isActive,
    required this.viewCount,
    required this.clickCount,
  });

  factory Banner.fromJson(Map<String, dynamic> json) {
    return Banner(
      id: json['_id'],
      title: LocalizedString.fromJson(json['title']),
      description: json['description'] != null
          ? LocalizedString.fromJson(json['description'])
          : null,
      image: json['image'],
      link: json['link'],
      linkType: json['linkType'] ?? 'NONE',
      location: json['location'],
      order: json['order'] ?? 0,
      startDate: json['startDate'] != null
          ? DateTime.parse(json['startDate'])
          : null,
      endDate: json['endDate'] != null
          ? DateTime.parse(json['endDate'])
          : null,
      isActive: json['isActive'] ?? true,
      viewCount: json['viewCount'] ?? 0,
      clickCount: json['clickCount'] ?? 0,
    );
  }

  bool get hasLink => link != null && link!.isNotEmpty;
  bool get isExpired => 
      endDate != null && endDate!.isBefore(DateTime.now());
}
```

---

**التالي:** [خدمة العلامات التجارية (Brands)](./10-brands-service.md)


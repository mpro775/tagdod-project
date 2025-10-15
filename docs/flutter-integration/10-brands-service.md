# 🏷️ خدمة العلامات التجارية (Brands Service)

خدمة البراندات توفر endpoints لعرض العلامات التجارية.

---

## Endpoints

### 1. قائمة البراندات
- **GET** `/brands`
- **Auth:** ❌ No
- **Query:** `?page=1&limit=20&search=Longi`
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "brand_123",
      "name": "Longi Solar",
      "slug": "longi-solar",
      "description": {"ar": "شركة رائدة في الطاقة الشمسية", "en": "Leading solar company"},
      "logo": "https://cdn.example.com/brands/longi-logo.png",
      "isActive": true,
      "productsCount": 45
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### 2. براند بالـ Slug
- **GET** `/brands/slug/:slug`
- **Auth:** ❌ No

### 3. براند بالـ ID
- **GET** `/brands/:id`
- **Auth:** ❌ No

---

## Models في Flutter

```dart
class Brand {
  final String id;
  final String name;
  final String slug;
  final LocalizedString? description;
  final String logo;
  final bool isActive;
  final int productsCount;

  Brand({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.logo,
    required this.isActive,
    required this.productsCount,
  });

  factory Brand.fromJson(Map<String, dynamic> json) {
    return Brand(
      id: json['_id'],
      name: json['name'],
      slug: json['slug'],
      description: json['description'] != null
          ? LocalizedString.fromJson(json['description'])
          : null,
      logo: json['logo'],
      isActive: json['isActive'] ?? true,
      productsCount: json['productsCount'] ?? 0,
    );
  }
}
```

---

**التالي:** [خدمة البحث (Search)](./11-search-service.md)


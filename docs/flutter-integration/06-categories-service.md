# 📂 خدمة التصنيفات (Categories Service)

خدمة التصنيفات توفر endpoints لعرض الفئات والتصنيفات.

---

## 📋 جدول المحتويات

1. [قائمة التصنيفات](#1-قائمة-التصنيفات)
2. [شجرة التصنيفات الكاملة](#2-شجرة-التصنيفات-الكاملة)
3. [تفاصيل تصنيف](#3-تفاصيل-تصنيف)
4. [التصنيفات المميزة](#4-التصنيفات-المميزة)
5. [Models في Flutter](#models-في-flutter)

---

## 1. قائمة التصنيفات

يسترجع قائمة التصنيفات مع إمكانية الفلترة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/categories`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (30 دقيقة)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `parentId` | `string` | ❌ | ID الفئة الأب (`null` للفئات الرئيسية) |
| `isFeatured` | `boolean` | ❌ | فقط المميزة (`true`/`false`) |

### مثال الطلب

```
GET /categories?parentId=null
GET /categories?parentId=64cat123
GET /categories?isFeatured=true
```

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
      "_id": "64cat123",
      "name": {
        "ar": "ألواح شمسية",
        "en": "Solar Panels"
      },
      "description": {
        "ar": "جميع أنواع الألواح الشمسية",
        "en": "All types of solar panels"
      },
      "slug": "solar-panels",
      "parentId": null,
      "icon": "https://cdn.example.com/icons/solar-panel.svg",
      "image": "https://cdn.example.com/categories/solar-panels.jpg",
      "isActive": true,
      "isFeatured": true,
      "order": 1,
      "productsCount": 45,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "_id": "64cat124",
      "name": {
        "ar": "بطاريات",
        "en": "Batteries"
      },
      "description": {
        "ar": "بطاريات الطاقة الشمسية",
        "en": "Solar energy batteries"
      },
      "slug": "batteries",
      "parentId": null,
      "icon": "https://cdn.example.com/icons/battery.svg",
      "image": "https://cdn.example.com/categories/batteries.jpg",
      "isActive": true,
      "isFeatured": true,
      "order": 2,
      "productsCount": 28,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-10T14:00:00.000Z"
    }
  ],
  "meta": null,
  "requestId": "req_cat_001"
}
```

### كود Flutter

```dart
Future<List<Category>> getCategories({
  String? parentId,
  bool? isFeatured,
}) async {
  final queryParams = <String, dynamic>{};
  if (parentId != null) {
    queryParams['parentId'] = parentId == 'root' ? 'null' : parentId;
  }
  if (isFeatured != null) {
    queryParams['isFeatured'] = isFeatured.toString();
  }

  final response = await _dio.get(
    '/categories',
    queryParameters: queryParams,
  );

  final apiResponse = ApiResponse<List<Category>>.fromJson(
    response.data,
    (json) => ((json as Map<String, dynamic>)['data'] as List)
        .map((item) => Category.fromJson(item))
        .toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. شجرة التصنيفات الكاملة

يسترجع جميع التصنيفات في شكل شجرة هرمية.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/categories/tree`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (ساعة واحدة)

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
      "_id": "64cat123",
      "name": {
        "ar": "ألواح شمسية",
        "en": "Solar Panels"
      },
      "slug": "solar-panels",
      "icon": "https://cdn.example.com/icons/solar-panel.svg",
      "isActive": true,
      "isFeatured": true,
      "children": [
        {
          "_id": "64cat125",
          "name": {
            "ar": "ألواح 550 واط",
            "en": "550W Panels"
          },
          "slug": "solar-panels-550w",
          "parentId": "64cat123",
          "isActive": true,
          "children": []
        },
        {
          "_id": "64cat126",
          "name": {
            "ar": "ألواح 450 واط",
            "en": "450W Panels"
          },
          "slug": "solar-panels-450w",
          "parentId": "64cat123",
          "isActive": true,
          "children": []
        }
      ]
    },
    {
      "_id": "64cat124",
      "name": {
        "ar": "بطاريات",
        "en": "Batteries"
      },
      "slug": "batteries",
      "icon": "https://cdn.example.com/icons/battery.svg",
      "isActive": true,
      "isFeatured": true,
      "children": []
    }
  ],
  "meta": null,
  "requestId": "req_cat_002"
}
```

### كود Flutter

```dart
Future<List<CategoryTree>> getCategoryTree() async {
  final response = await _dio.get('/categories/tree');

  final apiResponse = ApiResponse<List<CategoryTree>>.fromJson(
    response.data,
    (json) => ((json as Map<String, dynamic>)['data'] as List)
        .map((item) => CategoryTree.fromJson(item))
        .toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 3. تفاصيل تصنيف

يسترجع تفاصيل تصنيف محدد.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/categories/:id`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (30 دقيقة)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "64cat123",
    "name": {
      "ar": "ألواح شمسية",
      "en": "Solar Panels"
    },
    "description": {
      "ar": "جميع أنواع الألواح الشمسية عالية الكفاءة",
      "en": "All types of high-efficiency solar panels"
    },
    "slug": "solar-panels",
    "parentId": null,
    "icon": "https://cdn.example.com/icons/solar-panel.svg",
    "image": "https://cdn.example.com/categories/solar-panels.jpg",
    "isActive": true,
    "isFeatured": true,
    "order": 1,
    "productsCount": 45,
    "seo": {
      "title": "ألواح شمسية - أفضل الأسعار في اليمن",
      "description": "تسوق أفضل الألواح الشمسية...",
      "keywords": ["ألواح شمسية", "solar panels", "طاقة شمسية"]
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "meta": null,
  "requestId": "req_cat_003"
}
```

### كود Flutter

```dart
Future<Category> getCategory(String id) async {
  final response = await _dio.get('/categories/$id');

  final apiResponse = ApiResponse<Category>.fromJson(
    response.data,
    (json) => Category.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 4. التصنيفات المميزة

يسترجع التصنيفات المميزة فقط.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/categories/featured/list`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (30 دقيقة)

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
      "_id": "64cat123",
      "name": {
        "ar": "ألواح شمسية",
        "en": "Solar Panels"
      },
      "slug": "solar-panels",
      "icon": "https://cdn.example.com/icons/solar-panel.svg",
      "image": "https://cdn.example.com/categories/solar-panels.jpg",
      "isFeatured": true,
      "productsCount": 45
    }
  ],
  "meta": null,
  "requestId": "req_cat_004"
}
```

### كود Flutter

```dart
Future<List<Category>> getFeaturedCategories() async {
  final response = await _dio.get('/categories/featured/list');

  final apiResponse = ApiResponse<List<Category>>.fromJson(
    response.data,
    (json) => ((json as Map<String, dynamic>)['data'] as List)
        .map((item) => Category.fromJson(item))
        .toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## Models في Flutter

### ملف: `lib/models/category/category_models.dart`

```dart
class Category {
  final String id;
  final LocalizedString name;
  final LocalizedString? description;
  final String slug;
  final String? parentId;
  final String? icon;
  final String? image;
  final bool isActive;
  final bool isFeatured;
  final int order;
  final int productsCount;
  final CategorySEO? seo;
  final DateTime createdAt;
  final DateTime updatedAt;

  Category({
    required this.id,
    required this.name,
    this.description,
    required this.slug,
    this.parentId,
    this.icon,
    this.image,
    required this.isActive,
    required this.isFeatured,
    required this.order,
    required this.productsCount,
    this.seo,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['_id'],
      name: LocalizedString.fromJson(json['name']),
      description: json['description'] != null
          ? LocalizedString.fromJson(json['description'])
          : null,
      slug: json['slug'],
      parentId: json['parentId'],
      icon: json['icon'],
      image: json['image'],
      isActive: json['isActive'] ?? true,
      isFeatured: json['isFeatured'] ?? false,
      order: json['order'] ?? 0,
      productsCount: json['productsCount'] ?? 0,
      seo: json['seo'] != null ? CategorySEO.fromJson(json['seo']) : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  bool get isRootCategory => parentId == null;
  bool get hasProducts => productsCount > 0;
}

class CategoryTree {
  final String id;
  final LocalizedString name;
  final String slug;
  final String? icon;
  final String? parentId;
  final bool isActive;
  final bool isFeatured;
  final List<CategoryTree> children;

  CategoryTree({
    required this.id,
    required this.name,
    required this.slug,
    this.icon,
    this.parentId,
    required this.isActive,
    required this.isFeatured,
    required this.children,
  });

  factory CategoryTree.fromJson(Map<String, dynamic> json) {
    return CategoryTree(
      id: json['_id'],
      name: LocalizedString.fromJson(json['name']),
      slug: json['slug'],
      icon: json['icon'],
      parentId: json['parentId'],
      isActive: json['isActive'] ?? true,
      isFeatured: json['isFeatured'] ?? false,
      children: json['children'] != null
          ? (json['children'] as List)
              .map((item) => CategoryTree.fromJson(item))
              .toList()
          : [],
    );
  }

  bool get hasChildren => children.isNotEmpty;
  bool get isLeaf => children.isEmpty;
  int get totalChildren => children.length;

  // الحصول على جميع الأبناء بشكل مسطح
  List<CategoryTree> get flatChildren {
    final List<CategoryTree> flat = [];
    for (final child in children) {
      flat.add(child);
      flat.addAll(child.flatChildren);
    }
    return flat;
  }
}

class CategorySEO {
  final String title;
  final String description;
  final List<String> keywords;

  CategorySEO({
    required this.title,
    required this.description,
    required this.keywords,
  });

  factory CategorySEO.fromJson(Map<String, dynamic> json) {
    return CategorySEO(
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      keywords: List<String>.from(json['keywords'] ?? []),
    );
  }
}
```

---

## 📝 ملاحظات مهمة

1. **التصنيفات الهرمية:**
   - التصنيفات منظمة في شكل شجرة
   - `parentId = null` يعني تصنيف رئيسي
   - استخدم `/categories/tree` للحصول على الهيكل الكامل

2. **الصور والأيقونات:**
   - `icon`: أيقونة صغيرة (SVG أو PNG)
   - `image`: صورة كبيرة للتصنيف

3. **العرض في التطبيق:**
   - استخدم `order` للترتيب
   - اعرض `isFeatured` في الصفحة الرئيسية
   - اعرض `productsCount` لمعرفة عدد المنتجات

4. **Cache:**
   - جميع الـ endpoints مع cache طويل
   - يمكنك cache البيانات محلياً أيضاً

5. **التنقل:**
   - عند النقر على تصنيف رئيسي، اعرض الفئات الفرعية
   - استخدم `slug` في الـ URLs

---

**التالي:** [خدمة المفضلات (Favorites)](./07-favorites-service.md)


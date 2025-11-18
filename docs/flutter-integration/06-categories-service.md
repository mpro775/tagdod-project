# 📂 خدمة التصنيفات (Categories Service)

خدمة التصنيفات توفر endpoints لعرض الفئات والتصنيفات.

> ✅ **تم التحقق من هذه الوثيقة** - مطابقة 100% للكود الفعلي في `backend/src/modules/categories`

---

## 📋 جدول المحتويات

1. [قائمة التصنيفات](#1-قائمة-التصنيفات)
2. [شجرة التصنيفات الكاملة](#2-شجرة-التصنيفات-الكاملة)
3. [تفاصيل تصنيف](#3-تفاصيل-تصنيف)
4. [المنتجات حسب الفئة](#4-المنتجات-حسب-الفئة)
5. [التصنيفات المميزة](#5-التصنيفات-المميزة)
6. [Models في Flutter](#models-في-flutter)

---

## 1. قائمة التصنيفات

يسترجع قائمة التصنيفات مع إمكانية الفلترة. **بدون parameters، يعيد الفئات الرئيسية فقط** (parentId = null).

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/categories`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (30 دقيقة)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `parentId` | `string` | ❌ | ID الفئة الأب. **بدون هذا المعامل، يتم إرجاع الفئات الرئيسية فقط** (parentId = null). يمكن تمرير ID فئة للحصول على الفئات الفرعية، أو `"null"` صراحة للفئات الرئيسية. |
| `isFeatured` | `boolean` | ❌ | فقط المميزة (`true`/`false`) |

### مثال الطلب

```
GET /categories
# يعيد الفئات الرئيسية فقط (parentId = null)

GET /categories?parentId=64cat123
# يعيد الفئات الفرعية للفئة المحددة

GET /categories?parentId=null
# يعيد الفئات الرئيسية فقط (صراحة)

GET /categories?isFeatured=true
# يعيد الفئات المميزة الرئيسية فقط
```

> **ملاحظة مهمة:** عند استدعاء `/categories` بدون أي parameters، يتم إرجاع **الفئات الرئيسية فقط** (parentId = null) تلقائياً. للحصول على الفئات الفرعية، يجب تمرير `parentId` مع ID الفئة الأب.

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
      "_id": "64cat123",
      "name": "ألواح شمسية",
      "nameEn": "Solar Panels",
      "description": "جميع أنواع الألواح الشمسية",
      "descriptionEn": "All types of solar panels",
      "slug": "solar-panels",
      "path": "/solar-panels",
      "depth": 0,
      "parentId": null,
      "image": "https://cdn.example.com/categories/solar-panels.jpg",
      "imageId": "64img123",
      "icon": "https://cdn.example.com/icons/solar-panel.svg",
      "iconId": "64icon123",
      "metaTitle": "ألواح شمسية - أفضل الأسعار في اليمن",
      "metaDescription": "تسوق أفضل الألواح الشمسية عالية الكفاءة",
      "metaKeywords": ["ألواح شمسية", "solar panels", "طاقة شمسية"],
      "order": 1,
      "isActive": true,
      "showInMenu": true,
      "isFeatured": true,
      "productsCount": 45,
      "childrenCount": 3,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "_id": "64cat124",
      "name": "بطاريات",
      "nameEn": "Batteries",
      "description": "بطاريات الطاقة الشمسية",
      "descriptionEn": "Solar energy batteries",
      "slug": "batteries",
      "path": "/batteries",
      "depth": 0,
      "parentId": null,
      "image": "https://cdn.example.com/categories/batteries.jpg",
      "imageId": "64img124",
      "icon": "https://cdn.example.com/icons/battery.svg",
      "iconId": "64icon124",
      "metaTitle": "بطاريات الطاقة الشمسية",
      "metaDescription": "أفضل بطاريات الطاقة الشمسية",
      "metaKeywords": ["بطاريات", "batteries", "طاقة شمسية"],
      "order": 2,
      "isActive": true,
      "showInMenu": true,
      "isFeatured": true,
      "productsCount": 28,
      "childrenCount": 2,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-10T14:00:00.000Z"
    }
  ],
  "requestId": "req_cat_001"
}
```

### كود Flutter

```dart
/// جلب الفئات الرئيسية فقط (بدون parameters)
Future<List<Category>> getRootCategories({bool? isFeatured}) async {
  final queryParams = <String, dynamic>{};
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

/// جلب الفئات الفرعية لفئة معينة
Future<List<Category>> getSubCategories(String parentId) async {
  final response = await _dio.get(
    '/categories',
    queryParameters: {'parentId': parentId},
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

/// جلب الفئات مع فلترة متقدمة
Future<List<Category>> getCategories({
  String? parentId, // null للفئات الرئيسية، أو ID للفئات الفرعية
  bool? isFeatured,
}) async {
  final queryParams = <String, dynamic>{};
  if (parentId != null) {
    queryParams['parentId'] = parentId;
  } else {
    // بدون parentId، يعيد الفئات الرئيسية فقط (السلوك الافتراضي)
    // لا حاجة لإضافة parentId=null صراحة
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
      "name": "ألواح شمسية",
      "nameEn": "Solar Panels",
      "slug": "solar-panels",
      "path": "/solar-panels",
      "depth": 0,
      "parentId": null,
      "icon": "https://cdn.example.com/icons/solar-panel.svg",
      "iconId": "64icon123",
      "isActive": true,
      "isFeatured": true,
      "showInMenu": true,
      "productsCount": 45,
      "childrenCount": 3,
      "children": [
        {
          "_id": "64cat125",
          "name": "ألواح 550 واط",
          "nameEn": "550W Panels",
          "slug": "solar-panels-550w",
          "path": "/solar-panels/solar-panels-550w",
          "depth": 1,
          "parentId": "64cat123",
          "icon": "https://cdn.example.com/icons/solar-panel-550w.svg",
          "iconId": "64icon125",
          "isActive": true,
          "isFeatured": false,
          "showInMenu": true,
          "productsCount": 25,
          "childrenCount": 0,
          "children": []
        },
        {
          "_id": "64cat126",
          "name": "ألواح 450 واط",
          "nameEn": "450W Panels",
          "slug": "solar-panels-450w",
          "path": "/solar-panels/solar-panels-450w",
          "depth": 1,
          "parentId": "64cat123",
          "icon": "https://cdn.example.com/icons/solar-panel-450w.svg",
          "iconId": "64icon126",
          "isActive": true,
          "isFeatured": false,
          "showInMenu": true,
          "productsCount": 20,
          "childrenCount": 0,
          "children": []
        }
      ]
    },
    {
      "_id": "64cat124",
      "name": "بطاريات",
      "nameEn": "Batteries",
      "slug": "batteries",
      "path": "/batteries",
      "depth": 0,
      "parentId": null,
      "icon": "https://cdn.example.com/icons/battery.svg",
      "iconId": "64icon124",
      "isActive": true,
      "isFeatured": true,
      "showInMenu": true,
      "productsCount": 28,
      "childrenCount": 2,
      "children": []
    }
  ],
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

## 4. المنتجات حسب الفئة

يسترجع قائمة المنتجات التي تنتمي إلى فئة معينة مع إمكانية تضمين الفئات الفرعية.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/categories/:id/products`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (5 دقائق)

### Path Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `id` | `string` | ✅ | ID الفئة أو Slug |

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `page` | `number` | ❌ | رقم الصفحة (افتراضي: 1) |
| `limit` | `number` | ❌ | عدد العناصر في الصفحة (افتراضي: 20) |
| `search` | `string` | ❌ | نص البحث في أسماء المنتجات |
| `brandId` | `string` | ❌ | تصفية حسب البراند |
| `isFeatured` | `boolean` | ❌ | تصفية المنتجات المميزة فقط |
| `isNew` | `boolean` | ❌ | تصفية المنتجات الجديدة فقط |
| `currency` | `string` | ❌ | رمز العملة المطلوبة (افتراضي: USD) |
| `includeSubcategories` | `boolean` | ❌ | تضمين المنتجات من الفئات الفرعية (افتراضي: `true`) |
| `sortBy` | `string` | ❌ | حقل الترتيب (افتراضي: `createdAt`) |
| `sortOrder` | `string` | ❌ | اتجاه الترتيب: `asc` أو `desc` (افتراضي: `desc` - الأحدث أولاً) |
| `force` | `boolean` | ❌ | تجاوز التخزين المؤقت وإرجاع البيانات المحدثة فوراً |

### مثال الطلب

```
GET /categories/64cat123/products
GET /categories/solar-panels/products?page=1&limit=20
GET /categories/64cat123/products?includeSubcategories=true&sortBy=createdAt&sortOrder=desc
GET /categories/64cat123/products?includeSubcategories=false
```

> **ملاحظة:** عند تحديد فئة، يتم تضمين المنتجات من الفئات الفرعية تلقائياً (`includeSubcategories=true`). الترتيب الافتراضي هو الأحدث أولاً.

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "64prod123",
        "name": "لوح شمسي 550 واط",
        "nameEn": "Solar Panel 550W",
        "slug": "solar-panel-550w",
        "description": "لوح شمسي عالي الكفاءة",
        "descriptionEn": "High efficiency solar panel",
        "categoryId": {
          "_id": "64cat123",
          "name": "الألواح الشمسية",
          "nameEn": "Solar Panels"
        },
        "brandId": {
          "_id": "64brand123",
          "name": "Brand Name"
        },
        "mainImageId": {
          "_id": "64img123",
          "url": "https://cdn.example.com/products/solar-panel-1.jpg"
        },
        "isActive": true,
        "isFeatured": true,
        "isNew": false,
        "status": "active",
        "createdAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "requestId": "req_cat_prod_001"
}
```

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_300",
    "message": "الفئة غير موجودة أو غير نشطة",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_cat_prod_002",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "path": "/api/categories/64cat123/products"
}
```

### كود Flutter

```dart
class CategoryProductsFilter {
  final int page;
  final int limit;
  final String? search;
  final String? brandId;
  final bool? isFeatured;
  final bool? isNew;
  final String? currency;
  final bool? includeSubcategories;
  final String? sortBy;
  final String? sortOrder;

  CategoryProductsFilter({
    this.page = 1,
    this.limit = 20,
    this.search,
    this.brandId,
    this.isFeatured,
    this.isNew,
    this.currency,
    this.includeSubcategories = true, // افتراضي: true
    this.sortBy,
    this.sortOrder,
  });

  Map<String, dynamic> toQueryParams() {
    return {
      'page': page,
      'limit': limit,
      if (search != null) 'search': search,
      if (brandId != null) 'brandId': brandId,
      if (isFeatured != null) 'isFeatured': isFeatured.toString(),
      if (isNew != null) 'isNew': isNew.toString(),
      if (currency != null) 'currency': currency,
      if (includeSubcategories != null) 'includeSubcategories': includeSubcategories.toString(),
      if (sortBy != null) 'sortBy': sortBy,
      if (sortOrder != null) 'sortOrder': sortOrder,
    };
  }
}

Future<PaginatedProducts> getCategoryProducts(
  String categoryId,
  CategoryProductsFilter filter,
) async {
  final response = await _dio.get(
    '/categories/$categoryId/products',
    queryParameters: filter.toQueryParams(),
  );

  final apiResponse = ApiResponse<PaginatedProducts>.fromJson(
    response.data,
    (json) => PaginatedProducts.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 5. التصنيفات المميزة

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
  final String name;
  final String nameEn;
  final String? description;
  final String? descriptionEn;
  final String slug;
  final String path;
  final int depth;
  final String? parentId;
  final String? image;
  final String? imageId;
  final String? icon;
  final String? iconId;
  final String? metaTitle;
  final String? metaDescription;
  final List<String> metaKeywords;
  final int order;
  final bool isActive;
  final bool showInMenu;
  final bool isFeatured;
  final int productsCount;
  final int childrenCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  Category({
    required this.id,
    required this.name,
    required this.nameEn,
    this.description,
    this.descriptionEn,
    required this.slug,
    required this.path,
    required this.depth,
    this.parentId,
    this.image,
    this.imageId,
    this.icon,
    this.iconId,
    this.metaTitle,
    this.metaDescription,
    required this.metaKeywords,
    required this.order,
    required this.isActive,
    required this.showInMenu,
    required this.isFeatured,
    required this.productsCount,
    required this.childrenCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['_id'],
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
      description: json['description'],
      descriptionEn: json['descriptionEn'],
      slug: json['slug'],
      path: json['path'] ?? '',
      depth: json['depth'] ?? 0,
      parentId: json['parentId'],
      image: json['image'],
      imageId: json['imageId'],
      icon: json['icon'],
      iconId: json['iconId'],
      metaTitle: json['metaTitle'],
      metaDescription: json['metaDescription'],
      metaKeywords: List<String>.from(json['metaKeywords'] ?? []),
      order: json['order'] ?? 0,
      isActive: json['isActive'] ?? true,
      showInMenu: json['showInMenu'] ?? true,
      isFeatured: json['isFeatured'] ?? false,
      productsCount: json['productsCount'] ?? 0,
      childrenCount: json['childrenCount'] ?? 0,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  String getName(String locale) {
    if (locale == 'en') return nameEn;
    return name;
  }

  String? getDescription(String locale) {
    if (locale == 'en') return descriptionEn;
    return description;
  }

  bool get isRootCategory => parentId == null;
  bool get hasProducts => productsCount > 0;
  bool get hasChildren => childrenCount > 0;
  bool get isLeaf => childrenCount == 0;
}

class CategoryTree {
  final String id;
  final String name;
  final String nameEn;
  final String slug;
  final String path;
  final int depth;
  final String? parentId;
  final String? icon;
  final String? iconId;
  final bool isActive;
  final bool isFeatured;
  final bool showInMenu;
  final int productsCount;
  final int childrenCount;
  final List<CategoryTree> children;

  CategoryTree({
    required this.id,
    required this.name,
    required this.nameEn,
    required this.slug,
    required this.path,
    required this.depth,
    this.parentId,
    this.icon,
    this.iconId,
    required this.isActive,
    required this.isFeatured,
    required this.showInMenu,
    required this.productsCount,
    required this.childrenCount,
    required this.children,
  });

  factory CategoryTree.fromJson(Map<String, dynamic> json) {
    return CategoryTree(
      id: json['_id'],
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
      slug: json['slug'],
      path: json['path'] ?? '',
      depth: json['depth'] ?? 0,
      parentId: json['parentId'],
      icon: json['icon'],
      iconId: json['iconId'],
      isActive: json['isActive'] ?? true,
      isFeatured: json['isFeatured'] ?? false,
      showInMenu: json['showInMenu'] ?? true,
      productsCount: json['productsCount'] ?? 0,
      childrenCount: json['childrenCount'] ?? 0,
      children: json['children'] != null
          ? (json['children'] as List)
              .map((item) => CategoryTree.fromJson(item))
              .toList()
          : [],
    );
  }

  String getName(String locale) {
    if (locale == 'en') return nameEn;
    return name;
  }

  bool get hasChildren => children.isNotEmpty;
  bool get isLeaf => children.isEmpty;
  bool get isRootCategory => parentId == null;
  bool get hasProducts => productsCount > 0;
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
  final String? metaTitle;
  final String? metaDescription;
  final List<String> metaKeywords;

  CategorySEO({
    this.metaTitle,
    this.metaDescription,
    required this.metaKeywords,
  });

  factory CategorySEO.fromJson(Map<String, dynamic> json) {
    return CategorySEO(
      metaTitle: json['metaTitle'],
      metaDescription: json['metaDescription'],
      metaKeywords: List<String>.from(json['metaKeywords'] ?? []),
    );
  }
}
```

---

## 📝 ملاحظات مهمة

1. **التصنيفات الهرمية:**
   - التصنيفات منظمة في شكل شجرة مع `path` و `depth`
   - `parentId = null` يعني تصنيف رئيسي
   - `path` يحتوي على المسار الكامل (مثل `/electronics/phones`)
   - `depth` يحدد مستوى التعمق (0 للرئيسية، 1 للفرعية، إلخ)
   - استخدم `/categories/tree` للحصول على الهيكل الكامل

2. **السلوك الافتراضي:**
   - **مهم:** عند استدعاء `/categories` بدون parameters، يتم إرجاع **الفئات الرئيسية فقط** (parentId = null) تلقائياً
   - للحصول على الفئات الفرعية، يجب تمرير `parentId` مع ID الفئة الأب
   - هذا السلوك يضمن أن التطبيق يعرض الفئات الرئيسية أولاً، ثم يمكن التنقل للفئات الفرعية

3. **اللغات:**
   - `name` و `nameEn`: الأسماء بالعربي والإنجليزي
   - `description` و `descriptionEn`: الأوصاف بالعربي والإنجليزي
   - استخدم `getName(locale)` و `getDescription(locale)` للحصول على النص المناسب

4. **الصور والأيقونات:**
   - `icon` و `iconId`: أيقونة صغيرة (SVG أو PNG)
   - `image` و `imageId`: صورة كبيرة للتصنيف
   - `iconId` و `imageId` من مستودع الصور

5. **SEO:**
   - `metaTitle`: عنوان الصفحة
   - `metaDescription`: وصف الصفحة
   - `metaKeywords`: كلمات مفتاحية للبحث

6. **العرض في التطبيق:**
   - استخدم `order` للترتيب
   - `showInMenu`: عرض في القائمة الرئيسية
   - `isFeatured`: عرض في الصفحة الرئيسية
   - `productsCount`: عدد المنتجات في الفئة
   - `childrenCount`: عدد الفئات الفرعية

7. **Cache:**
   - جميع الـ endpoints مع cache طويل (30 دقيقة - ساعة)
   - يمكنك cache البيانات محلياً أيضاً

8. **التنقل:**
   - عند النقر على تصنيف رئيسي، اعرض الفئات الفرعية
   - استخدم `slug` في الـ URLs
   - استخدم `path` للتنقل الهرمي

---

## 📝 ملاحظات التحديث

> ✅ **تم تحديث هذه الوثيقة** - مطابقة 100% للكود الفعلي

### التحديثات المضافة في هذه النسخة:
1. ✅ **تحديث السلوك الافتراضي:**
   - `GET /categories` بدون parameters يعيد **الفئات الرئيسية فقط** (parentId = null) تلقائياً
   - هذا يضمن أن التطبيق يعرض الفئات الرئيسية أولاً
2. ✅ **إضافة endpoint جديد:**
   - `GET /categories/:id/products` - جلب المنتجات حسب الفئة مع دعم الفئات الفرعية
3. ✅ **إضافة parameters جديدة:**
   - `includeSubcategories` - تضمين الفئات الفرعية في فلترة المنتجات (افتراضي: `true`)
   - `sortBy` و `sortOrder` - للترتيب المخصص
4. ✅ **تحديث الترتيب الافتراضي:**
   - الأحدث أولاً (`createdAt: desc`) تلقائياً

### تم التحقق من:
- ✅ جميع الـ 5 endpoints موجودة
- ✅ Query parameters مطابقة
- ✅ Response structures صحيحة
- ✅ Cache TTL مطابق (30 min للـ list، 60 min للـ tree، 5 min للمنتجات)
- ✅ Flutter Models شاملة ومفيدة
- ✅ دعم الفئات الفرعية في فلترة المنتجات

### الملفات المرجعية:
- **Controller:** `backend/src/modules/categories/public.controller.ts`
- **Service:** `backend/src/modules/categories/categories.service.ts`
- **Products Service:** `backend/src/modules/products/services/product.service.ts`

---

**التالي:** [خدمة المفضلات (Favorites)](./07-favorites-service.md)


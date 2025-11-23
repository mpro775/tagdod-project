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
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "ألواح شمسية",
      "nameEn": "Solar Panels",
      "parent": null,
      "image": {
        "id": "64img123abc",
        "path": "media/category/solar-panels.png"
      },
      "isActive": true,
      "order": 1,
      "productsCount": 45
    },
    {
      "id": "64a1b2c3d4e5f6789abcdef1",
      "name": "بطاريات",
      "nameEn": "Batteries",
      "parent": null,
      "image": {
        "id": "64img124abc",
        "path": "media/category/batteries.png"
      },
      "isActive": true,
      "order": 2,
      "productsCount": 28
    }
  ],
  "requestId": "req_cat_001"
}
```

> **ملاحظة:** الـ response مبسط للعرض العام. الحقول المتاحة:
> - `id`: معرف الفئة
> - `name`: الاسم بالعربية
> - `nameEn`: الاسم بالإنجليزية
> - `parent`: كائن يحتوي على `id` فقط (أو `null` للفئات الرئيسية)
> - `image`: كائن يحتوي على `id` و `path` (أو `null`)
> - `isActive`: حالة الفئة
> - `order`: ترتيب العرض
> - `productsCount`: عدد المنتجات

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
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "ألواح شمسية",
      "nameEn": "Solar Panels",
      "parent": null,
      "image": {
        "id": "64img123abc",
        "path": "media/category/solar-panels.png"
      },
      "isActive": true,
      "order": 1,
      "productsCount": 45,
      "children": [
        {
          "id": "64a1b2c3d4e5f6789abcdef2",
          "name": "ألواح 550 واط",
          "nameEn": "550W Panels",
          "parent": {
            "id": "64a1b2c3d4e5f6789abcdef0"
          },
          "image": {
            "id": "64img125abc",
            "path": "media/category/solar-panels-550w.png"
          },
          "isActive": true,
          "order": 1,
          "productsCount": 25,
          "children": []
        },
        {
          "id": "64a1b2c3d4e5f6789abcdef3",
          "name": "ألواح 450 واط",
          "nameEn": "450W Panels",
          "parent": {
            "id": "64a1b2c3d4e5f6789abcdef0"
          },
          "image": {
            "id": "64img126abc",
            "path": "media/category/solar-panels-450w.png"
          },
          "isActive": true,
          "order": 2,
          "productsCount": 20,
          "children": []
        }
      ]
    },
    {
      "id": "64a1b2c3d4e5f6789abcdef1",
      "name": "بطاريات",
      "nameEn": "Batteries",
      "parent": null,
      "image": {
        "id": "64img124abc",
        "path": "media/category/batteries.png"
      },
      "isActive": true,
      "order": 2,
      "productsCount": 28,
      "children": []
    }
  ],
  "requestId": "req_cat_002"
}
```

> **ملاحظة:** البنية نفسها للقائمة العادية مع إضافة `children` array لكل فئة.

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
    "_id": "64a1b2c3d4e5f6789abcdef0",
    "name": "ألواح شمسية",
    "nameEn": "Solar Panels",
    "description": "جميع أنواع الألواح الشمسية عالية الكفاءة",
    "descriptionEn": "All types of high-efficiency solar panels",
    "slug": "solar-panels",
    "parentId": null,
    "imageId": {
      "_id": "64img123abc",
      "storedFilename": "media/category/solar-panels.png",
      "url": "https://cdn.example.com/media/category/solar-panels.png"
    },
    "metaTitle": "ألواح شمسية - أفضل الأسعار في اليمن",
    "metaDescription": "تسوق أفضل الألواح الشمسية عالية الكفاءة",
    "metaKeywords": ["ألواح شمسية", "solar panels", "طاقة شمسية"],
    "order": 1,
    "isActive": true,
    "isFeatured": true,
    "productsCount": 45,
    "childrenCount": 3,
    "children": [
      {
        "_id": "64a1b2c3d4e5f6789abcdef2",
        "name": "ألواح 550 واط",
        "nameEn": "550W Panels",
        "slug": "solar-panels-550w",
        "parentId": "64a1b2c3d4e5f6789abcdef0",
        "productsCount": 25
      }
    ],
    "breadcrumbs": [
      {
        "id": "64a1b2c3d4e5f6789abcdef0",
        "name": "ألواح شمسية",
        "nameEn": "Solar Panels",
        "slug": "solar-panels"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "requestId": "req_cat_003"
}
```

> **ملاحظة:** هذا الـ endpoint يعيد تفاصيل كاملة للفئة مع:
> - جميع الحقول من الـ schema
> - `children`: قائمة بالفئات الفرعية
> - `breadcrumbs`: مسار التنقل الهرمي
> - `imageId`: كائن كامل من Media Library (populated)

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
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "ألواح شمسية",
      "nameEn": "Solar Panels",
      "parent": null,
      "image": {
        "id": "64img123abc",
        "path": "media/category/solar-panels.png"
      },
      "isActive": true,
      "order": 1,
      "productsCount": 45
    }
  ],
  "requestId": "req_cat_004"
}
```

> **ملاحظة:** نفس بنية `/categories` لكن فقط الفئات المميزة (`isFeatured: true`).

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
  final String? image; // path أو URL للصورة
  final String? imageId; // ID الصورة من Media Library
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
  
  // للحصول على URL الصورة الكامل (إذا لزم الأمر)
  String? get imageUrl {
    if (image == null) return null;
    if (image!.startsWith('http')) return image;
    // بناء URL كامل من path
    return 'https://cdn.example.com/$image';
  }

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
    // للـ endpoints العامة (list, featured): id, name, nameEn, parent, image, isActive, order, productsCount
    // للـ endpoint التفاصيل (/:id): _id, name, nameEn, description, descriptionEn, slug, parentId, imageId, children, breadcrumbs, etc.
    
    // معالجة id (قد يكون 'id' أو '_id')
    final categoryId = json['id'] ?? json['_id'] ?? '';
    
    // معالجة parent (قد يكون object مع id أو string أو null)
    String? parentId;
    if (json['parent'] != null) {
      if (json['parent'] is Map) {
        parentId = json['parent']['id'];
      } else {
        parentId = json['parent'] as String?;
      }
    } else if (json['parentId'] != null) {
      parentId = json['parentId'] is String ? json['parentId'] : json['parentId'].toString();
    }
    
    // معالجة image (قد يكون object مع id و path أو string)
    String? imagePath;
    String? imageId;
    if (json['image'] != null) {
      if (json['image'] is Map) {
        imageId = json['image']['id'];
        imagePath = json['image']['path'];
      } else {
        imagePath = json['image'] as String?;
      }
    } else if (json['imageId'] != null) {
      if (json['imageId'] is Map) {
        imageId = json['imageId']['_id'] ?? json['imageId']['id'];
        imagePath = json['imageId']['storedFilename'] ?? json['imageId']['url'];
      } else {
        imageId = json['imageId'] as String?;
      }
    }
    
    return Category(
      id: categoryId,
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
      description: json['description'],
      descriptionEn: json['descriptionEn'],
      slug: json['slug'] ?? '',
      path: json['path'] ?? '',
      depth: json['depth'] ?? 0,
      parentId: parentId,
      image: imagePath,
      imageId: imageId,
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
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt']) 
          : DateTime.now(),
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
  final String? image; // path للصورة
  final String? imageId; // ID الصورة
  final String? icon;
  final String? iconId;
  final bool isActive;
  final bool isFeatured;
  final bool showInMenu;
  final int productsCount;
  final int childrenCount;
  final List<CategoryTree> children;
  
  // للحصول على URL الصورة الكامل (إذا لزم الأمر)
  String? get imageUrl {
    if (image == null) return null;
    if (image!.startsWith('http')) return image;
    return 'https://cdn.example.com/$image';
  }

  CategoryTree({
    required this.id,
    required this.name,
    required this.nameEn,
    required this.slug,
    required this.path,
    required this.depth,
    this.parentId,
    this.image,
    this.imageId,
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
    // معالجة id (قد يكون 'id' أو '_id')
    final categoryId = json['id'] ?? json['_id'] ?? '';
    
    // معالجة parent (قد يكون object مع id أو string أو null)
    String? parentId;
    if (json['parent'] != null) {
      if (json['parent'] is Map) {
        parentId = json['parent']['id'];
      } else {
        parentId = json['parent'] as String?;
      }
    } else if (json['parentId'] != null) {
      parentId = json['parentId'] is String ? json['parentId'] : json['parentId'].toString();
    }
    
    // معالجة image (قد يكون object مع id و path)
    String? imagePath;
    String? imageId;
    if (json['image'] != null && json['image'] is Map) {
      imageId = json['image']['id'];
      imagePath = json['image']['path'];
    }
    
    return CategoryTree(
      id: categoryId,
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
      slug: json['slug'] ?? '',
      path: json['path'] ?? '',
      depth: json['depth'] ?? 0,
      parentId: parentId,
      image: imagePath,
      imageId: imageId,
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

1. **بنية الـ Response المختلفة:**
   - **Endpoints العامة** (`/categories`, `/categories/tree`, `/categories/featured/list`):
     - تستخدم `id` (وليس `_id`)
     - `parent` هو كائن يحتوي على `id` فقط (أو `null`)
     - `image` هو كائن يحتوي على `id` و `path` (أو `null`)
     - بنية مبسطة للعرض العام
   - **Endpoint التفاصيل** (`/categories/:id`):
     - يستخدم `_id`
     - `parentId` هو string مباشر (أو `null`)
     - `imageId` هو كائن كامل من Media Library (populated)
     - يحتوي على `children` و `breadcrumbs`
     - بنية كاملة مع جميع التفاصيل

2. **التصنيفات الهرمية:**
   - التصنيفات منظمة في شكل شجرة مع `path` و `depth`
   - `parentId = null` يعني تصنيف رئيسي
   - `path` يحتوي على المسار الكامل (مثل `/electronics/phones`)
   - `depth` يحدد مستوى التعمق (0 للرئيسية، 1 للفرعية، إلخ)
   - استخدم `/categories/tree` للحصول على الهيكل الكامل

3. **السلوك الافتراضي:**
   - **مهم:** عند استدعاء `/categories` بدون parameters، يتم إرجاع **الفئات الرئيسية فقط** (parentId = null) تلقائياً
   - للحصول على الفئات الفرعية، يجب تمرير `parentId` مع ID الفئة الأب
   - هذا السلوك يضمن أن التطبيق يعرض الفئات الرئيسية أولاً، ثم يمكن التنقل للفئات الفرعية

4. **اللغات:**
   - `name` و `nameEn`: الأسماء بالعربي والإنجليزي
   - `description` و `descriptionEn`: الأوصاف بالعربي والإنجليزي
   - استخدم `getName(locale)` و `getDescription(locale)` للحصول على النص المناسب

5. **الصور والأيقونات:**
   - في الـ endpoints العامة (`/categories`, `/categories/tree`, `/categories/featured/list`):
     - `image`: كائن يحتوي على `id` و `path`
     - `path`: مسار الصورة النسبي (مثل `media/category/solar-panels.png`)
   - في endpoint التفاصيل (`/categories/:id`):
     - `imageId`: كائن كامل من Media Library (populated) يحتوي على `_id`, `storedFilename`, `url`
   - لبناء URL كامل: استخدم `path` مع base URL أو استخدم `url` من `imageId` في التفاصيل

6. **SEO:**
   - `metaTitle`: عنوان الصفحة
   - `metaDescription`: وصف الصفحة
   - `metaKeywords`: كلمات مفتاحية للبحث

7. **العرض في التطبيق:**
   - استخدم `order` للترتيب
   - `showInMenu`: عرض في القائمة الرئيسية
   - `isFeatured`: عرض في الصفحة الرئيسية
   - `productsCount`: عدد المنتجات في الفئة
   - `childrenCount`: عدد الفئات الفرعية

8. **Cache:**
   - جميع الـ endpoints مع cache طويل (30 دقيقة - ساعة)
   - يمكنك cache البيانات محلياً أيضاً

9. **التنقل:**
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
- ✅ Response structures صحيحة ومطابقة للكود الفعلي
- ✅ Cache TTL مطابق (30 min للـ list، 60 min للـ tree، 5 min للمنتجات)
- ✅ Flutter Models شاملة ومفيدة مع معالجة صحيحة للـ response structures المختلفة
- ✅ دعم الفئات الفرعية في فلترة المنتجات
- ✅ معالجة صحيحة لـ `id` vs `_id` و `parent` vs `parentId` و `image` structure

### الملفات المرجعية:
- **Controller:** `backend/src/modules/categories/public.controller.ts`
- **Service:** `backend/src/modules/categories/categories.service.ts`
- **Products Service:** `backend/src/modules/products/services/product.service.ts`

---

**التالي:** [خدمة المفضلات (Favorites)](./07-favorites-service.md)


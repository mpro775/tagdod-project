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

2. **اللغات:**
   - `name` و `nameEn`: الأسماء بالعربي والإنجليزي
   - `description` و `descriptionEn`: الأوصاف بالعربي والإنجليزي
   - استخدم `getName(locale)` و `getDescription(locale)` للحصول على النص المناسب

3. **الصور والأيقونات:**
   - `icon` و `iconId`: أيقونة صغيرة (SVG أو PNG)
   - `image` و `imageId`: صورة كبيرة للتصنيف
   - `iconId` و `imageId` من مستودع الصور

4. **SEO:**
   - `metaTitle`: عنوان الصفحة
   - `metaDescription`: وصف الصفحة
   - `metaKeywords`: كلمات مفتاحية للبحث

5. **العرض في التطبيق:**
   - استخدم `order` للترتيب
   - `showInMenu`: عرض في القائمة الرئيسية
   - `isFeatured`: عرض في الصفحة الرئيسية
   - `productsCount`: عدد المنتجات في الفئة
   - `childrenCount`: عدد الفئات الفرعية

6. **Cache:**
   - جميع الـ endpoints مع cache طويل (30 دقيقة - ساعة)
   - يمكنك cache البيانات محلياً أيضاً

7. **التنقل:**
   - عند النقر على تصنيف رئيسي، اعرض الفئات الفرعية
   - استخدم `slug` في الـ URLs
   - استخدم `path` للتنقل الهرمي

---

**التالي:** [خدمة المفضلات (Favorites)](./07-favorites-service.md)


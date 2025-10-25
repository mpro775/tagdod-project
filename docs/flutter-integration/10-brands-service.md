# 🏷️ خدمة العلامات التجارية (Brands Service)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: أكتوبر 2025

خدمة العلامات التجارية توفر endpoints لعرض العلامات التجارية مع دعم البحث والفلترة.

---

## 📋 جدول المحتويات

1. [قائمة العلامات التجارية](#1-قائمة-العلامات-التجارية)
2. [علامة تجارية بالـ Slug](#2-علامة-تجارية-بالـ-slug)
3. [علامة تجارية بالـ ID](#3-علامة-تجارية-بالـ-id)
4. [Models في Flutter](#models-في-flutter)

---

## 1. قائمة العلامات التجارية

يسترجع قائمة العلامات التجارية النشطة مع إمكانية البحث والفلترة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/brands`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (10 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `page` | `number` | ❌ | رقم الصفحة (افتراضي: 1) |
| `limit` | `number` | ❌ | عدد العناصر (افتراضي: 20) |
| `search` | `string` | ❌ | البحث في الاسم والوصف |
| `sortBy` | `string` | ❌ | ترتيب حسب (name, createdAt, sortOrder) |
| `sortOrder` | `string` | ❌ | اتجاه الترتيب (asc, desc) |

### Response - نجاح

```json
{
  "success": true,
  "brands": [
    {
      "_id": "64brand123",
      "name": "Longi Solar",
      "nameEn": "Longi Solar",
      "slug": "longi-solar",
      "image": "https://cdn.example.com/brands/longi-logo.png",
      "description": "شركة رائدة في الطاقة الشمسية",
      "descriptionEn": "Leading solar company",
      "isActive": true,
      "sortOrder": 1,
      "metadata": {
        "website": "https://www.longi.com",
        "country": "China",
        "founded": "2000"
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  },
  "requestId": "req_brand_001"
}
```

### كود Flutter

```dart
Future<PaginatedBrands> getBrands({
  int page = 1,
  int limit = 20,
  String? search,
  String sortBy = 'sortOrder',
  String sortOrder = 'asc',
}) async {
  final response = await _dio.get('/brands', queryParameters: {
    'page': page,
    'limit': limit,
    if (search != null) 'search': search,
    'sortBy': sortBy,
    'sortOrder': sortOrder,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return PaginatedBrands.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. علامة تجارية بالـ Slug

يسترجع علامة تجارية محددة باستخدام الـ slug.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/brands/slug/:slug`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (10 دقائق)

### Response - نجاح

```json
{
  "success": true,
  "_id": "64brand123",
  "name": "Longi Solar",
  "nameEn": "Longi Solar",
  "slug": "longi-solar",
  "image": "https://cdn.example.com/brands/longi-logo.png",
  "description": "شركة رائدة في الطاقة الشمسية",
  "descriptionEn": "Leading solar company",
  "isActive": true,
  "sortOrder": 1,
  "metadata": {
    "website": "https://www.longi.com",
    "country": "China",
    "founded": "2000"
  },
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z",
  "requestId": "req_brand_002"
}
```

**ملاحظة:** الـ response يعيد الـ brand object مباشرة (بدون `data` wrapper)، مع `success` و `requestId` كحقول إضافية.

### Errors

| Code | HTTP Status | الوصف |
|------|-------------|-------|
| `Brand not found` | 404 | العلامة التجارية غير موجودة |

### كود Flutter

```dart
Future<Brand> getBrandBySlug(String slug) async {
  final response = await _dio.get('/brands/slug/$slug');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return Brand.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 3. علامة تجارية بالـ ID

يسترجع علامة تجارية محددة باستخدام الـ ID.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/brands/:id`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (10 دقائق)

### Response - نجاح

```json
{
  "success": true,
  "_id": "64brand123",
  "name": "Longi Solar",
  "nameEn": "Longi Solar",
  "slug": "longi-solar",
  "image": "https://cdn.example.com/brands/longi-logo.png",
  "description": "شركة رائدة في الطاقة الشمسية",
  "descriptionEn": "Leading solar company",
  "isActive": true,
  "sortOrder": 1,
  "metadata": {
    "website": "https://www.longi.com",
    "country": "China",
    "founded": "2000"
  },
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z",
  "requestId": "req_brand_003"
}
```

**ملاحظة:** الـ response يعيد الـ brand object مباشرة (بدون `data` wrapper)، مع `success` و `requestId` كحقول إضافية.

### Errors

| Code | HTTP Status | الوصف |
|------|-------------|-------|
| `Brand not found` | 404 | العلامة التجارية غير موجودة |

### كود Flutter

```dart
Future<Brand> getBrandById(String id) async {
  final response = await _dio.get('/brands/$id');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return Brand.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## Models في Flutter

### ملف: `lib/models/brand/brand_models.dart`

```dart
class Brand {
  final String id;
  final String name;
  final String nameEn;
  final String slug;
  final String image;
  final String? description;
  final String? descriptionEn;
  final bool isActive;
  final int sortOrder;
  final Map<String, dynamic> metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  Brand({
    required this.id,
    required this.name,
    required this.nameEn,
    required this.slug,
    required this.image,
    this.description,
    this.descriptionEn,
    required this.isActive,
    required this.sortOrder,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Brand.fromJson(Map<String, dynamic> json) {
    return Brand(
      id: json['_id'],
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
      slug: json['slug'] ?? '',
      image: json['image'] ?? '',
      description: json['description'],
      descriptionEn: json['descriptionEn'],
      isActive: json['isActive'] ?? true,
      sortOrder: json['sortOrder'] ?? 0,
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
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

  bool get hasDescription => description != null && description!.isNotEmpty;
  bool get hasMetadata => metadata.isNotEmpty;
  String? get website => metadata['website']?.toString();
  String? get country => metadata['country']?.toString();
  String? get founded => metadata['founded']?.toString();
}

class PaginatedBrands {
  final List<Brand> brands;
  final PaginationMeta pagination;

  PaginatedBrands({
    required this.brands,
    required this.pagination,
  });

  factory PaginatedBrands.fromJson(Map<String, dynamic> json) {
    return PaginatedBrands(
      brands: ((json['brands'] as List)
          .map((item) => Brand.fromJson(item))
          .toList()),
      pagination: PaginationMeta.fromJson(json['pagination']),
    );
  }
}

class PaginationMeta {
  final int total;
  final int page;
  final int limit;
  final int totalPages;

  PaginationMeta({
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      total: json['total'] ?? 0,
      page: json['page'] ?? 1,
      limit: json['limit'] ?? 20,
      totalPages: json['totalPages'] ?? 0,
    );
  }

  bool get hasNextPage => page < totalPages;
  bool get hasPrevPage => page > 1;
  bool get isFirstPage => page == 1;
  bool get isLastPage => page == totalPages;
}
```

---

## 📝 ملاحظات مهمة

1. **اللغات:**
   - `name` و `nameEn`: الأسماء بالعربي والإنجليزي
   - `description` و `descriptionEn`: الأوصاف بالعربي والإنجليزي
   - استخدم `getName(locale)` و `getDescription(locale)` للحصول على النص المناسب

2. **البحث والفلترة:**
   - `search`: البحث في الاسم والوصف
   - `sortBy`: ترتيب حسب (name, createdAt, sortOrder)
   - `sortOrder`: اتجاه الترتيب (asc, desc)
   - `page` و `limit`: للصفحات

3. **البيانات الوصفية:**
   - `metadata`: معلومات إضافية (website, country, founded)
   - استخدم `hasMetadata` للتحقق من وجود بيانات وصفية
   - استخدم `website`, `country`, `founded` للحصول على معلومات محددة

4. **الترتيب:**
   - `sortOrder`: ترتيب العرض (الأقل أولاً)
   - `isActive`: العلامات التجارية النشطة فقط
   - استخدم `sortOrder` للترتيب المخصص

5. **العرض في التطبيق:**
   - اعرض `hasDescription` للعلامات التي لها وصف
   - اعرض `hasMetadata` للعلامات التي لها بيانات وصفية
   - استخدم `website` لروابط الموقع الرسمي
   - استخدم `country` و `founded` لمعلومات إضافية

6. **الصفحات:**
   - `PaginatedBrands`: للنتائج مع الصفحات
   - `PaginationMeta`: لمعلومات الصفحات
   - استخدم `hasNextPage` و `hasPrevPage` للتنقل
   - استخدم `isFirstPage` و `isLastPage` للتحقق

7. **Cache:**
   - جميع الـ endpoints مع cache لمدة 10 دقائق
   - يمكنك cache البيانات محلياً أيضاً
   - استخدم `search` parameter للبحث

8. **الأداء:**
   - جميع الـ endpoints لا تتطلب مصادقة
   - استخدم `getBrands()` للحصول على القائمة مع الفلترة
   - استخدم `getBrandBySlug()` للبحث بالـ slug
   - استخدم `getBrandById()` للبحث بالـ ID

9. **الاستخدام:**
   - اعرض العلامات التجارية في قوائم المنتجات
   - استخدم `slug` في الـ URLs
   - استخدم `image` لعرض شعار العلامة التجارية
   - استخدم `metadata` لمعلومات إضافية

10. **التحسين:**
    - استخدم `sortOrder` للترتيب المخصص
    - استخدم `search` للبحث السريع
    - استخدم `metadata` لمعلومات إضافية
    - استخدم `PaginatedBrands` للصفحات الكبيرة

---

## 🔄 Notes on Update

**التغييرات الرئيسية:**
1. ✅ تم تصحيح الـ list response - `{ brands: [...], pagination: {...} }` بدلاً من `{ data: [...] }`
2. ✅ تم تصحيح الـ single brand responses - الـ brand object مباشرة بدون `data` wrapper
3. ✅ تم تحديث `PaginatedBrands.fromJson` - `json['brands']` بدلاً من `json['data']`
4. ✅ تم تحديث جميع أكواد Flutter - استخدام `Map<String, dynamic>` للـ parsing الصحيح
5. ✅ تم إضافة error codes الفعلية (`Brand not found`)

**ملاحظات مهمة:**
- `image` يحتوي على رابط الصورة مباشرة (ليس `logoUrl`)
- `metadata` هو Object يحتوي على بيانات إضافية (website, country, founded)
- `description` و `descriptionEn` قد يكونان empty strings بشكل افتراضي

**ملفات Backend المرجعية:**
- `backend/src/modules/brands/brands.public.controller.ts` - جميع endpoints
- `backend/src/modules/brands/brands.service.ts` - المنطق والـ queries
- `backend/src/modules/brands/schemas/brand.schema.ts` - Brand Schema

---

**التالي:** [خدمة البحث (Search)](./11-search-service.md)


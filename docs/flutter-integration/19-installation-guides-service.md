# 📖 خدمة أدلة التركيب (Installation Guides Service)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: مايو 2026

خدمة أدلة التركيب توفر endpoints لعرض محتوى تعليمي عن طرق التركيب مع دعم **صور وفيديوهات متعددة** والبحث والفلترة والباجنيشن.

---

## 📋 جدول المحتويات

1. [قائمة أدلة التركيب (مع باجنيشن وفلترة)](#1-قائمة-أدلة-التركيب-مع-باجنيشن-وفلترة)
2. [تفاصيل دليل التركيب](#2-تفاصيل-دليل-التركيب)
3. [Models في Flutter](#models-في-flutter)

---

## 1. قائمة أدلة التركيب (مع باجنيشن وفلترة)

يسترجع قائمة أدلة التركيب النشطة مع دعم البحث والفلترة بالتاغ والباجنيشن.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/installation-guides/public`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (ينصح بـ 5 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `page` | `number` | ❌ | رقم الصفحة (افتراضي: `1`) |
| `limit` | `number` | ❌ | عدد العناصر في الصفحة (افتراضي: `20`، أقصى: `100`) |
| `search` | `string` | ❌ | نص البحث في العنوان (عربي/إنجليزي) والتاغ (عربي/إنجليزي) |
| `tag` | `string` | ❌ | فلترة حسب التاغ (عربي/إنجليزي) - بحث جزئي |

### مثال الطلب

```
GET /installation-guides/public
# يعيد أول 20 دليل تركيب نشط

GET /installation-guides/public?page=2&limit=10
# الصفحة الثانية بـ 10 عناصر

GET /installation-guides/public?search=لوح+شمسي
# البحث عن "لوح شمسي" في العناوين والتاغات

GET /installation-guides/public?tag=ألواح
# فلترة حسب التاغ "ألواح"

GET /installation-guides/public?search=تركيب&tag=ألواح&page=1&limit=10
# بحث + فلترة بالتاغ + باجنيشن
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "64a1b2c3d4e5f6789abcdef0",
        "titleAr": "طريقة تركيب الألواح الشمسية",
        "titleEn": "Solar Panel Installation Guide",
        "tagAr": "ألواح شمسية",
        "tagEn": "solar panels",
        "coverImageUrl": "https://cdn.example.com/media/solar-installation-cover.jpg",
        "isActive": true,
        "sortOrder": 1,
        "updatedAt": "2026-05-01T10:00:00.000Z"
      },
      {
        "id": "64a1b2c3d4e5f6789abcdef1",
        "titleAr": "طريقة تركيب البطاريات",
        "titleEn": "Battery Installation Guide",
        "tagAr": "بطاريات",
        "tagEn": "batteries",
        "coverImageUrl": "https://cdn.example.com/media/battery-installation-cover.jpg",
        "isActive": true,
        "sortOrder": 2,
        "updatedAt": "2026-04-28T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  },
  "requestId": "req_guide_001"
}
```

### Response - صفحة فارغة

```json
{
  "success": true,
  "data": {
    "data": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "pages": 0
    }
  },
  "requestId": "req_guide_002"
}
```

### كود Flutter

```dart
class InstallationGuidesFilter {
  final int page;
  final int limit;
  final String? search;
  final String? tag;

  InstallationGuidesFilter({
    this.page = 1,
    this.limit = 20,
    this.search,
    this.tag,
  });

  Map<String, dynamic> toQueryParams() {
    return {
      'page': page,
      'limit': limit,
      if (search != null) 'search': search,
      if (tag != null) 'tag': tag,
    };
  }
}

Future<PaginatedInstallationGuides> getInstallationGuides({
  InstallationGuidesFilter filter = const InstallationGuidesFilter(),
}) async {
  final response = await _dio.get(
    '/installation-guides/public',
    queryParameters: filter.toQueryParams(),
  );

  final apiResponse = ApiResponse<PaginatedInstallationGuides>.fromJson(
    response.data,
    (json) => PaginatedInstallationGuides.fromJson(
      (json as Map<String, dynamic>)['data'],
    ),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. تفاصيل دليل التركيب

يسترجع تفاصيل دليل تركيب محدد مع **الصور الإضافية** و**الفيديوهات الإضافية** والمنتجات المرتبطة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/installation-guides/public/:id`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (ينصح بـ 10 دقائق)

### Path Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `id` | `string` | ✅ | معرف دليل التركيب |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "titleAr": "طريقة تركيب الألواح الشمسية",
    "titleEn": "Solar Panel Installation Guide",
    "tagAr": "ألواح شمسية",
    "tagEn": "solar panels",
    "coverImageUrl": "https://cdn.example.com/media/solar-installation-cover.jpg",
    "isActive": true,
    "sortOrder": 1,
    "updatedAt": "2026-05-01T10:00:00.000Z",
    "descriptionAr": "شرح تفصيلي لخطوات تركيب الألواح الشمسية...",
    "descriptionEn": "Detailed step-by-step guide for solar panel installation...",
    "imageIds": [
      "64img201abc",
      "64img202abc",
      "64img203abc"
    ],
    "videoIds": [
      "bunny-video-id-1",
      "bunny-video-id-2"
    ],
    "imageUrls": [
      "https://cdn.example.com/media/step-1.jpg",
      "https://cdn.example.com/media/step-2.jpg",
      "https://cdn.example.com/media/step-3.jpg"
    ],
    "videos": [
      {
        "id": "main-bunny-video-id",
        "url": "https://iframe.mediadelivery.net/embed/library123/main-bunny-video-id",
        "embedUrl": "https://iframe.mediadelivery.net/embed/library123/main-bunny-video-id",
        "hlsUrl": "https://library123.b-cdn.net/main-bunny-video-id/playlist.m3u8",
        "mp4Url": "https://library123.b-cdn.net/main-bunny-video-id/play_720p.mp4",
        "thumbnailUrl": "https://library123.b-cdn.net/main-bunny-video-id/thumbnail.jpg",
        "status": "ready"
      },
      {
        "id": "bunny-video-id-1",
        "url": "https://iframe.mediadelivery.net/embed/library123/bunny-video-id-1",
        "embedUrl": "https://iframe.mediadelivery.net/embed/library123/bunny-video-id-1",
        "hlsUrl": "https://library123.b-cdn.net/bunny-video-id-1/playlist.m3u8",
        "mp4Url": "https://library123.b-cdn.net/bunny-video-id-1/play_720p.mp4",
        "thumbnailUrl": "https://library123.b-cdn.net/bunny-video-id-1/thumbnail.jpg",
        "status": "ready"
      },
      {
        "id": "bunny-video-id-2",
        "url": "https://iframe.mediadelivery.net/embed/library123/bunny-video-id-2",
        "embedUrl": "https://iframe.mediadelivery.net/embed/library123/bunny-video-id-2",
        "hlsUrl": "https://library123.b-cdn.net/bunny-video-id-2/playlist.m3u8",
        "mp4Url": "https://library123.b-cdn.net/bunny-video-id-2/play_720p.mp4",
        "thumbnailUrl": "https://library123.b-cdn.net/bunny-video-id-2/thumbnail.jpg",
        "status": "ready"
      }
    ],
    "video": {
      "id": "main-bunny-video-id",
      "url": "https://iframe.mediadelivery.net/embed/library123/main-bunny-video-id",
      "embedUrl": "https://iframe.mediadelivery.net/embed/library123/main-bunny-video-id",
      "hlsUrl": "https://library123.b-cdn.net/main-bunny-video-id/playlist.m3u8",
      "mp4Url": "https://library123.b-cdn.net/main-bunny-video-id/play_720p.mp4",
      "thumbnailUrl": "https://library123.b-cdn.net/main-bunny-video-id/thumbnail.jpg",
      "status": "ready"
    },
    "linkedProductIds": [
      "64prod123",
      "64prod456"
    ],
    "linkedProduct": {
      "id": "64prod123",
      "name": "لوح شمسي 550 واط",
      "nameEn": "Solar Panel 550W",
      "mainImageUrl": "https://cdn.example.com/products/solar-panel.jpg",
      "description": "لوح شمسي عالي الكفاءة",
      "descriptionEn": "High efficiency solar panel",
      "images": [
        "https://cdn.example.com/products/solar-panel-1.jpg",
        "https://cdn.example.com/products/solar-panel-2.jpg"
      ],
      "rating": 4.5,
      "price": {
        "USD": 150,
        "SAR": 562,
        "YER": 37500
      },
      "tags": ["ألواح شمسية", "solar"],
      "requiresVariantSelection": false,
      "isNew": false,
      "isFeatured": true,
      "hasVariants": false,
      "isAvailable": true,
      "stock": 50
    },
    "linkedProducts": [
      {
        "id": "64prod123",
        "name": "لوح شمسي 550 واط",
        "nameEn": "Solar Panel 550W",
        "mainImageUrl": "https://cdn.example.com/products/solar-panel.jpg",
        "rating": 4.5,
        "price": { "USD": 150 },
        "isAvailable": true,
        "stock": 50
      },
      {
        "id": "64prod456",
        "name": "بطارية ليثيوم 200Ah",
        "nameEn": "Lithium Battery 200Ah",
        "mainImageUrl": "https://cdn.example.com/products/battery.jpg",
        "rating": 4.8,
        "price": { "USD": 300 },
        "isAvailable": true,
        "stock": 25
      }
    ]
  },
  "requestId": "req_guide_003"
}
```

### Response - غير موجود

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Installation guide not found",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_guide_004"
}
```

> **ملاحظة:** الـ endpoint يرجع فقط أدلة التركيب النشطة (`isActive: true`). إذا كان الدليل غير نشط أو غير موجود، يرجع خطأ 404.

### كود Flutter

```dart
Future<InstallationGuideDetail> getInstallationGuide(String id) async {
  final response = await _dio.get('/installation-guides/public/$id');

  final apiResponse = ApiResponse<InstallationGuideDetail>.fromJson(
    response.data,
    (json) => InstallationGuideDetail.fromJson(
      (json as Map<String, dynamic>)['data'],
    ),
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

### ملف: `lib/models/installation_guide/installation_guide_models.dart`

```dart
/// حالة الفيديو
enum VideoStatus {
  processing,
  ready,
  failed;

  static VideoStatus fromString(String? value) {
    switch (value) {
      case 'ready':
        return VideoStatus.ready;
      case 'failed':
        return VideoStatus.failed;
      case 'processing':
      default:
        return VideoStatus.processing;
    }
  }
}

/// كائن الفيديو (من Bunny Stream)
class InstallationGuideVideo {
  final String id;
  final String url;
  final String? embedUrl;
  final String? hlsUrl;
  final String? mp4Url;
  final String? thumbnailUrl;
  final VideoStatus status;

  InstallationGuideVideo({
    required this.id,
    required this.url,
    this.embedUrl,
    this.hlsUrl,
    this.mp4Url,
    this.thumbnailUrl,
    required this.status,
  });

  factory InstallationGuideVideo.fromJson(Map<String, dynamic> json) {
    return InstallationGuideVideo(
      id: json['id'] ?? '',
      url: json['url'] ?? '',
      embedUrl: json['embedUrl'],
      hlsUrl: json['hlsUrl'],
      mp4Url: json['mp4Url'],
      thumbnailUrl: json['thumbnailUrl'],
      status: VideoStatus.fromString(json['status']),
    );
  }

  bool get isReady => status == VideoStatus.ready;
  bool get isProcessing => status == VideoStatus.processing;
  bool get isFailed => status == VideoStatus.failed;

  /// أفضل URL للتشغيل حسب الدعم
  String get playUrl => mp4Url ?? hlsUrl ?? url;
}

/// منتج مرتبط بدليل التركيب
class InstallationGuideLinkedProduct {
  final String id;
  final String name;
  final String nameEn;
  final String? mainImageUrl;
  final String? description;
  final String? descriptionEn;
  final List<String> images;
  final double rating;
  final Map<String, num>? price;
  final Map<String, dynamic>? pricingByCurrency;
  final List<String> tags;
  final bool requiresVariantSelection;
  final bool isNew;
  final bool isFeatured;
  final bool hasVariants;
  final bool isAvailable;
  final int stock;
  final int? minOrderQuantity;
  final int? maxOrderQuantity;

  InstallationGuideLinkedProduct({
    required this.id,
    required this.name,
    required this.nameEn,
    this.mainImageUrl,
    this.description,
    this.descriptionEn,
    required this.images,
    required this.rating,
    this.price,
    this.pricingByCurrency,
    required this.tags,
    required this.requiresVariantSelection,
    required this.isNew,
    required this.isFeatured,
    required this.hasVariants,
    required this.isAvailable,
    required this.stock,
    this.minOrderQuantity,
    this.maxOrderQuantity,
  });

  factory InstallationGuideLinkedProduct.fromJson(Map<String, dynamic> json) {
    return InstallationGuideLinkedProduct(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
      mainImageUrl: json['mainImageUrl'],
      description: json['description'],
      descriptionEn: json['descriptionEn'],
      images: List<String>.from(json['images'] ?? []),
      rating: (json['rating'] ?? 0).toDouble(),
      price: json['price'] != null
          ? Map<String, num>.from(json['price'])
          : null,
      pricingByCurrency: json['pricingByCurrency'] != null
          ? Map<String, dynamic>.from(json['pricingByCurrency'])
          : null,
      tags: List<String>.from(json['tags'] ?? []),
      requiresVariantSelection: json['requiresVariantSelection'] ?? false,
      isNew: json['isNew'] ?? false,
      isFeatured: json['isFeatured'] ?? false,
      hasVariants: json['hasVariants'] ?? false,
      isAvailable: json['isAvailable'] ?? false,
      stock: json['stock'] ?? 0,
      minOrderQuantity: json['minOrderQuantity'],
      maxOrderQuantity: json['maxOrderQuantity'],
    );
  }

  String getName(String locale) =>
      locale == 'en' ? nameEn : name;

  String? getDescription(String locale) =>
      locale == 'en' ? descriptionEn : description;
}

/// عنصر دليل التركيب في القائمة
class InstallationGuideListItem {
  final String id;
  final String titleAr;
  final String titleEn;
  final String tagAr;
  final String tagEn;
  final String? coverImageUrl;
  final bool isActive;
  final int sortOrder;
  final DateTime updatedAt;

  InstallationGuideListItem({
    required this.id,
    required this.titleAr,
    required this.titleEn,
    required this.tagAr,
    required this.tagEn,
    this.coverImageUrl,
    required this.isActive,
    required this.sortOrder,
    required this.updatedAt,
  });

  factory InstallationGuideListItem.fromJson(Map<String, dynamic> json) {
    return InstallationGuideListItem(
      id: json['id'] ?? '',
      titleAr: json['titleAr'] ?? '',
      titleEn: json['titleEn'] ?? '',
      tagAr: json['tagAr'] ?? '',
      tagEn: json['tagEn'] ?? '',
      coverImageUrl: json['coverImageUrl'],
      isActive: json['isActive'] ?? true,
      sortOrder: json['sortOrder'] ?? 0,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
    );
  }

  String getTitle(String locale) =>
      locale == 'en' ? titleEn : titleAr;

  String getTag(String locale) =>
      locale == 'en' ? tagEn : tagAr;
}

/// تفاصيل دليل التركيب الكاملة
class InstallationGuideDetail extends InstallationGuideListItem {
  final String descriptionAr;
  final String descriptionEn;
  final List<String> imageIds;
  final List<String> videoIds;
  final List<String> imageUrls;
  final List<InstallationGuideVideo> videos;
  final InstallationGuideVideo? video;
  final List<String> linkedProductIds;
  final InstallationGuideLinkedProduct? linkedProduct;
  final List<InstallationGuideLinkedProduct> linkedProducts;

  InstallationGuideDetail({
    required super.id,
    required super.titleAr,
    required super.titleEn,
    required super.tagAr,
    required super.tagEn,
    super.coverImageUrl,
    required super.isActive,
    required super.sortOrder,
    required super.updatedAt,
    required this.descriptionAr,
    required this.descriptionEn,
    required this.imageIds,
    required this.videoIds,
    required this.imageUrls,
    required this.videos,
    this.video,
    required this.linkedProductIds,
    this.linkedProduct,
    required this.linkedProducts,
  });

  factory InstallationGuideDetail.fromJson(Map<String, dynamic> json) {
    final listItem = InstallationGuideListItem.fromJson(json);

    return InstallationGuideDetail(
      id: listItem.id,
      titleAr: listItem.titleAr,
      titleEn: listItem.titleEn,
      tagAr: listItem.tagAr,
      tagEn: listItem.tagEn,
      coverImageUrl: listItem.coverImageUrl,
      isActive: listItem.isActive,
      sortOrder: listItem.sortOrder,
      updatedAt: listItem.updatedAt,
      descriptionAr: json['descriptionAr'] ?? '',
      descriptionEn: json['descriptionEn'] ?? '',
      imageIds: List<String>.from(json['imageIds'] ?? []),
      videoIds: List<String>.from(json['videoIds'] ?? []),
      imageUrls: List<String>.from(json['imageUrls'] ?? []),
      videos: (json['videos'] as List<dynamic>?)
              ?.map((v) => InstallationGuideVideo.fromJson(v))
              .toList() ??
          [],
      video: json['video'] != null
          ? InstallationGuideVideo.fromJson(json['video'])
          : null,
      linkedProductIds: List<String>.from(json['linkedProductIds'] ?? []),
      linkedProduct: json['linkedProduct'] != null
          ? InstallationGuideLinkedProduct.fromJson(json['linkedProduct'])
          : null,
      linkedProducts: (json['linkedProducts'] as List<dynamic>?)
              ?.map((p) => InstallationGuideLinkedProduct.fromJson(p))
              .toList() ??
          [],
    );
  }

  String getDescription(String locale) =>
      locale == 'en' ? descriptionEn : descriptionAr;

  bool get hasImages => imageUrls.isNotEmpty;
  bool get hasVideos => videos.isNotEmpty;
  bool get hasExtraVideos =>
      videos.length > 1; // أكثر من الفيديو الرئيسي
  bool get hasLinkedProducts => linkedProducts.isNotEmpty;
  int get totalMediaCount => imageUrls.length + videos.length;
}

/// استجابة الباجنيشن لأدلة التركيب
class PaginatedInstallationGuides {
  final List<InstallationGuideListItem> data;
  final PaginationInfo pagination;

  PaginatedInstallationGuides({
    required this.data,
    required this.pagination,
  });

  factory PaginatedInstallationGuides.fromJson(Map<String, dynamic> json) {
    return PaginatedInstallationGuides(
      data: (json['data'] as List<dynamic>)
          .map((item) => InstallationGuideListItem.fromJson(item))
          .toList(),
      pagination: PaginationInfo.fromJson(json['pagination']),
    );
  }

  bool get isEmpty => data.isEmpty;
  bool get hasMore => pagination.page < pagination.pages;
}

/// معلومات الباجنيشن
class PaginationInfo {
  final int page;
  final int limit;
  final int total;
  final int pages;

  PaginationInfo({
    required this.page,
    required this.limit,
    required this.total,
    required this.pages,
  });

  factory PaginationInfo.fromJson(Map<String, dynamic> json) {
    return PaginationInfo(
      page: json['page'] ?? 1,
      limit: json['limit'] ?? 20,
      total: json['total'] ?? 0,
      pages: json['pages'] ?? 0,
    );
  }
}
```

---

## Service في Flutter

### ملف: `lib/services/installation_guides_service.dart`

```dart
import 'package:dio/dio.dart';

class InstallationGuidesService {
  final Dio _dio;

  InstallationGuidesService(this._dio);

  /// جلب قائمة أدلة التركيب مع باجنيشن وفلترة
  Future<PaginatedInstallationGuides> getInstallationGuides({
    int page = 1,
    int limit = 20,
    String? search,
    String? tag,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search != null) 'search': search,
      if (tag != null) 'tag': tag,
    };

    final response = await _dio.get(
      '/installation-guides/public',
      queryParameters: queryParams,
    );

    final apiResponse = ApiResponse<PaginatedInstallationGuides>.fromJson(
      response.data,
      (json) => PaginatedInstallationGuides.fromJson(
        (json as Map<String, dynamic>)['data'],
      ),
    );

    if (apiResponse.isSuccess) {
      return apiResponse.data!;
    } else {
      throw ApiException(apiResponse.error!);
    }
  }

  /// جلب تفاصيل دليل تركيب
  Future<InstallationGuideDetail> getInstallationGuide(String id) async {
    final response = await _dio.get('/installation-guides/public/$id');

    final apiResponse = ApiResponse<InstallationGuideDetail>.fromJson(
      response.data,
      (json) => InstallationGuideDetail.fromJson(
        (json as Map<String, dynamic>)['data'],
      ),
    );

    if (apiResponse.isSuccess) {
      return apiResponse.data!;
    } else {
      throw ApiException(apiResponse.error!);
    }
  }
}
```

---

## 📝 ملاحظات مهمة

### 1. الصور والفيديوهات المتعددة

- **`coverImageUrl`**: صورة الغلاف الرئيسية (واحدة)
- **`imageUrls`**: مصفوفة URLs للصور الإضافية (قد تكون فارغة)
- **`imageIds`**: معرفات الصور الإضافية (تطابق `imageUrls` بالترتيب)
- **`video`**: الفيديو الرئيسي (كائن `InstallationGuideVideo` واحد)
- **`videos`**: جميع الفيديوهات بما فيها الرئيسي (مصفوفة مرتبة: الرئيسي أولاً)
- **`videoIds`**: معرفات الفيديوهات الإضافية فقط

> **مهم:** مصفوفة `videos` تتضمن الفيديو الرئيسي كأول عنصر، ثم الفيديوهات الإضافية بعده.

### 2. حالة الفيديو (VideoStatus)

| الحالة | الوصف |
|--------|-------|
| `processing` | الفيديو قيد المعالجة - لا يمكن تشغيله بعد |
| `ready` | الفيديو جاهز للتشغيل |
| `failed` | فشلت معالجة الفيديو |

- استخدم `video.isReady` قبل عرض مشغل الفيديو
- استخدم `video.isProcessing` لعرض مؤشر تحميل
- استخدم `video.playUrl` للحصول على أفضل URL للتشغيل

### 3. البحث والفلترة

- **`search`**: يبحث في `titleAr`, `titleEn`, `tagAr`, `tagEn` (بحث جزئي غير حساس لحالة الأحرف)
- **`tag`**: يفلتر حسب التاغ فقط (بحث جزئي في `tagAr` و `tagEn`)
- يمكن استخدام `search` و `tag` معاً
- يعيد فقط الأدلة النشطة (`isActive: true`)

### 4. الباجنيشن

- **الترتيب الافتراضي:** `sortOrder` تصاعدياً، ثم `createdAt` تنازلياً
- يعرض فقط أدلة التركيب النشطة
- استخدم `pagination.hasMore` للتحقق من وجود صفحات إضافية

### 5. المنتجات المرتبطة

- **`linkedProduct`**: أول منتج مرتبط (للتوافق الخلفي)
- **`linkedProducts`**: جميع المنتجات المرتبطة
- المنتج يحتوي على بيانات مسبقة التحميل (اسم، صورة، سعر، تقييم)
- المنتجات غير النشطة لا تظهر

### 6. اللغات

- جميع النصوص ثنائية اللغة (`Ar` و `En`)
- استخدم `getTitle(locale)` و `getTag(locale)` و `getDescription(locale)`
- مرر `'ar'` أو `'en'` حسب لغة المستخدم

### 7. Cache المقترح

| البيانات | مدة الـ Cache |
|----------|--------------|
| قائمة أدلة التركيب | 5 دقائق |
| تفاصيل دليل التركيب | 10 دقائق |
| الباجنيشن (العدد الإجمالي) | لا تحفظه - أعد طلبه دائماً |

### 8. أمثلة استخدام في واجهة Flutter

```dart
// صفحة قائمة أدلة التركيب مع بحث وفلترة
class InstallationGuidesPage extends StatefulWidget {
  @override
  State<InstallationGuidesPage> createState() =>
      _InstallationGuidesPageState();
}

class _InstallationGuidesPageState extends State<InstallationGuidesPage> {
  final _service = InstallationGuidesService(dio);
  int _currentPage = 1;
  String? _search;
  String? _tag;

  Future<PaginatedInstallationGuides> _fetchGuides() {
    return _service.getInstallationGuides(
      page: _currentPage,
      search: _search,
      tag: _tag,
    );
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<PaginatedInstallationGuides>(
      future: _fetchGuides(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final guides = snapshot.data?.data ?? [];
        final pagination = snapshot.data?.pagination;

        return ListView.builder(
          itemCount: guides.length,
          itemBuilder: (context, index) {
            final guide = guides[index];
            return ListTile(
              leading: guide.coverImageUrl != null
                  ? Image.network(guide.coverImageUrl!, width: 64, height: 64,
                      fit: BoxFit.cover)
                  : const Icon(Icons.menu_book),
              title: Text(guide.getTitle('ar')),
              subtitle: Text(guide.getTag('ar')),
              onTap: () => _navigateToDetail(guide.id),
            );
          },
        );
      },
    );
  }

  void _navigateToDetail(String id) {
    Navigator.pushNamed(context, '/installation-guides/$id');
  }
}
```

```dart
// صفحة تفاصيل دليل التركيب - عرض الصور والفيديوهات
class InstallationGuideDetailPage extends StatelessWidget {
  final String guideId;

  const InstallationGuideDetailPage({required this.guideId});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<InstallationGuideDetail>(
      future: InstallationGuidesService(dio).getInstallationGuide(guideId),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final guide = snapshot.data!;

        return SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // صورة الغلاف
              if (guide.coverImageUrl != null)
                Image.network(guide.coverImageUrl!, height: 200,
                    width: double.infinity, fit: BoxFit.cover),

              // العنوان والوصف
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(guide.getTitle('ar'),
                        style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 8),
                    Text(guide.getDescription('ar')),
                    const SizedBox(height: 16),

                    // الفيديو الرئيسي
                    if (guide.video != null && guide.video!.isReady)
                      _VideoPlayer(video: guide.video!),

                    // الفيديوهات الإضافية
                    if (guide.hasExtraVideos) ...[
                      const SizedBox(height: 16),
                      Text('فيديوهات إضافية',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      ...guide.videos.skip(1).map(
                          (v) => v.isReady ? _VideoPlayer(video: v) : const SizedBox()),
                    ],

                    // الصور الإضافية
                    if (guide.hasImages) ...[
                      const SizedBox(height: 16),
                      Text('صور الخطوات',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 120,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: guide.imageUrls.length,
                          itemBuilder: (context, index) {
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  guide.imageUrls[index],
                                  width: 120,
                                  height: 120,
                                  fit: BoxFit.cover,
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],

                    // المنتجات المرتبطة
                    if (guide.hasLinkedProducts) ...[
                      const SizedBox(height: 16),
                      Text('المنتجات المرتبطة',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      ...guide.linkedProducts.map((product) => ListTile(
                            leading: product.mainImageUrl != null
                                ? Image.network(product.mainImageUrl!,
                                    width: 48, height: 48, fit: BoxFit.cover)
                                : const Icon(Icons.inventory_2),
                            title: Text(product.getName('ar')),
                            subtitle: Text(
                              'السعر: ${product.price?['USD'] ?? '-'}\$'),
                          )),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
```

---

## 📝 ملاحظات التحديث

### التحديثات المضافة في هذه النسخة:
1. ✅ **دعم صور وفيديوهات متعددة:**
   - `imageIds` و `imageUrls`: مصفوفة الصور الإضافية
   - `videoIds` و `videos`: مصفوفة الفيديوهات الإضافية
   - `video`: الفيديو الرئيسي (للتوافق الخلفي)
2. ✅ **دعم الباجنيشن والبحث في الـ endpoint العام:**
   - `page` و `limit`: باجنيشن كامل
   - `search`: بحث في العناوين والتاغات
   - `tag`: فلترة حسب التاغ
3. ✅ **البنية الجديدة للاستجابة:**
   - الـ endpoint العام `/installation-guides/public` أصبح يرجع `{ data: [...], pagination: {...} }` بدلاً من array مباشر

### تم التحقق من:
- ✅ Endpoints مطابقة للكود الفعلي
- ✅ Response structures صحيحة
- ✅ Flutter Models شاملة مع `fromJson`
- ✅ دعم اللغتين العربية والإنجليزية
- ✅ معالجة الحالات (فيديو قيد المعالجة، صور فارغة، منتجات مرتبطة فارغة)

### الملفات المرجعية:
- **Schema:** `backend/src/modules/installation-guides/schemas/installation-guide.schema.ts`
- **Service:** `backend/src/modules/installation-guides/installation-guides.service.ts`
- **Public Controller:** `backend/src/modules/installation-guides/installation-guides.public.controller.ts`
- **DTO:** `backend/src/modules/installation-guides/dto/installation-guide.dto.ts`

---

**التالي:** [WebSocket - الاتصال الفوري](./websocket.md)

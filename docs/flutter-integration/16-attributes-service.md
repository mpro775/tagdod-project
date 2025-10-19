# 🏷️ خدمة الخصائص (Attributes Service)

خدمة الخصائص توفر endpoints لإدارة خصائص المنتجات والفلترة.

---

## 📋 جدول المحتويات

1. [قائمة الخصائص النشطة](#1-قائمة-الخصائص-النشطة)
2. [الخصائص القابلة للفلترة](#2-الخصائص-القابلة-للفلترة)
3. [تفاصيل خاصية](#3-تفاصيل-خاصية)
4. [Models في Flutter](#models-في-flutter)

---

## 1. قائمة الخصائص النشطة

يسترجع قائمة جميع الخصائص النشطة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/attributes`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (30 دقيقة)

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
      "_id": "64attr123",
      "name": "اللون",
      "nameEn": "Color",
      "slug": "color",
      "type": "select",
      "description": "لون المنتج",
      "order": 1,
      "isActive": true,
      "isFilterable": true,
      "isRequired": false,
      "showInFilters": true,
      "groupId": null,
      "usageCount": 45,
      "deletedAt": null,
      "deletedBy": null,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "requestId": "req_attr_001"
}
```

### كود Flutter

```dart
Future<List<Attribute>> getAttributes() async {
  final response = await _dio.get('/attributes');

  final apiResponse = ApiResponse<List<Attribute>>.fromJson(
    response.data,
    (json) => (json as List).map((item) => Attribute.fromJson(item)).toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. الخصائص القابلة للفلترة

يسترجع الخصائص القابلة للفلترة مع قيمها.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/attributes/filterable`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (30 دقيقة)

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
      "_id": "64attr123",
      "name": "اللون",
      "nameEn": "Color",
      "slug": "color",
      "type": "select",
      "description": "لون المنتج",
      "order": 1,
      "isActive": true,
      "isFilterable": true,
      "isRequired": false,
      "showInFilters": true,
      "groupId": null,
      "usageCount": 45,
      "deletedAt": null,
      "deletedBy": null,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "values": [
        {
          "_id": "64value123",
          "attributeId": "64attr123",
          "value": "أحمر",
          "valueEn": "Red",
          "slug": "red",
          "hexCode": "#FF0000",
          "imageUrl": null,
          "imageId": null,
          "description": "لون أحمر",
          "order": 1,
          "isActive": true,
          "usageCount": 12,
          "deletedAt": null,
          "deletedBy": null,
          "createdAt": "2025-01-15T10:00:00.000Z",
          "updatedAt": "2025-01-15T10:00:00.000Z"
        }
      ]
    }
  ],
  "requestId": "req_attr_002"
}
```

### كود Flutter

```dart
Future<List<AttributeWithValues>> getFilterableAttributes() async {
  final response = await _dio.get('/attributes/filterable');

  final apiResponse = ApiResponse<List<AttributeWithValues>>.fromJson(
    response.data,
    (json) => (json as List).map((item) => AttributeWithValues.fromJson(item)).toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 3. تفاصيل خاصية

يسترجع تفاصيل خاصية محددة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/attributes/:id`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (30 دقيقة)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "64attr123",
    "name": "اللون",
    "nameEn": "Color",
    "slug": "color",
    "type": "select",
    "description": "لون المنتج",
    "order": 1,
    "isActive": true,
    "isFilterable": true,
    "isRequired": false,
    "showInFilters": true,
    "groupId": null,
    "usageCount": 45,
    "deletedAt": null,
    "deletedBy": null,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "requestId": "req_attr_003"
}
```

### كود Flutter

```dart
Future<Attribute> getAttribute(String attributeId) async {
  final response = await _dio.get('/attributes/$attributeId');

  final apiResponse = ApiResponse<Attribute>.fromJson(
    response.data,
    (json) => Attribute.fromJson(json),
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

### ملف: `lib/models/attributes/attribute_models.dart`

```dart
enum AttributeType {
  select,
  multiselect,
  text,
  number,
  boolean,
}

class Attribute {
  final String id;
  final String name;
  final String nameEn;
  final String slug;
  final AttributeType type;
  final String? description;
  final int order;
  final bool isActive;
  final bool isFilterable;
  final bool isRequired;
  final bool showInFilters;
  final String? groupId;
  final int usageCount;
  final DateTime? deletedAt;
  final String? deletedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  Attribute({
    required this.id,
    required this.name,
    required this.nameEn,
    required this.slug,
    required this.type,
    this.description,
    required this.order,
    required this.isActive,
    required this.isFilterable,
    required this.isRequired,
    required this.showInFilters,
    this.groupId,
    required this.usageCount,
    this.deletedAt,
    this.deletedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Attribute.fromJson(Map<String, dynamic> json) {
    return Attribute(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
      slug: json['slug'] ?? '',
      type: AttributeType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => AttributeType.text,
      ),
      description: json['description'],
      order: json['order'] ?? 0,
      isActive: json['isActive'] ?? true,
      isFilterable: json['isFilterable'] ?? true,
      isRequired: json['isRequired'] ?? false,
      showInFilters: json['showInFilters'] ?? false,
      groupId: json['groupId'],
      usageCount: json['usageCount'] ?? 0,
      deletedAt: json['deletedAt'] != null ? DateTime.parse(json['deletedAt']) : null,
      deletedBy: json['deletedBy'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  String getName(String locale) {
    if (locale == 'en') return nameEn;
    return name;
  }

  bool get isSelect => type == AttributeType.select;
  bool get isMultiselect => type == AttributeType.multiselect;
  bool get isText => type == AttributeType.text;
  bool get isNumber => type == AttributeType.number;
  bool get isBoolean => type == AttributeType.boolean;
  
  bool get hasDescription => description != null && description!.isNotEmpty;
  bool get hasGroup => groupId != null && groupId!.isNotEmpty;
  bool get isDeleted => deletedAt != null;
  bool get hasUsage => usageCount > 0;
  
  bool get canBeFiltered => isActive && isFilterable;
  bool get shouldShowInFilters => isActive && isFilterable && showInFilters;
  bool get isRequired => isRequired;
  
  String get displayName => name;
  String get displayNameEn => nameEn;
  String get displaySlug => slug;
}

class AttributeValue {
  final String id;
  final String attributeId;
  final String value;
  final String? valueEn;
  final String slug;
  final String? hexCode;
  final String? imageUrl;
  final String? imageId;
  final String? description;
  final int order;
  final bool isActive;
  final int usageCount;
  final DateTime? deletedAt;
  final String? deletedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  AttributeValue({
    required this.id,
    required this.attributeId,
    required this.value,
    this.valueEn,
    required this.slug,
    this.hexCode,
    this.imageUrl,
    this.imageId,
    this.description,
    required this.order,
    required this.isActive,
    required this.usageCount,
    this.deletedAt,
    this.deletedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory AttributeValue.fromJson(Map<String, dynamic> json) {
    return AttributeValue(
      id: json['_id'] ?? '',
      attributeId: json['attributeId'] ?? '',
      value: json['value'] ?? '',
      valueEn: json['valueEn'],
      slug: json['slug'] ?? '',
      hexCode: json['hexCode'],
      imageUrl: json['imageUrl'],
      imageId: json['imageId'],
      description: json['description'],
      order: json['order'] ?? 0,
      isActive: json['isActive'] ?? true,
      usageCount: json['usageCount'] ?? 0,
      deletedAt: json['deletedAt'] != null ? DateTime.parse(json['deletedAt']) : null,
      deletedBy: json['deletedBy'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  String getValue(String locale) {
    if (locale == 'en' && valueEn != null) return valueEn!;
    return value;
  }

  bool get hasValueEn => valueEn != null && valueEn!.isNotEmpty;
  bool get hasHexCode => hexCode != null && hexCode!.isNotEmpty;
  bool get hasImage => imageUrl != null && imageUrl!.isNotEmpty;
  bool get hasImageId => imageId != null && imageId!.isNotEmpty;
  bool get hasDescription => description != null && description!.isNotEmpty;
  bool get isDeleted => deletedAt != null;
  bool get hasUsage => usageCount > 0;
  
  String get displayValue => value;
  String get displayValueEn => valueEn ?? value;
  String get displaySlug => slug;
  
  bool get isColor => hasHexCode;
  bool get hasImage => hasImage || hasImageId;
}

class AttributeWithValues extends Attribute {
  final List<AttributeValue> values;

  AttributeWithValues({
    required super.id,
    required super.name,
    required super.nameEn,
    required super.slug,
    required super.type,
    super.description,
    required super.order,
    required super.isActive,
    required super.isFilterable,
    required super.isRequired,
    required super.showInFilters,
    super.groupId,
    required super.usageCount,
    super.deletedAt,
    super.deletedBy,
    required super.createdAt,
    required super.updatedAt,
    required this.values,
  });

  factory AttributeWithValues.fromJson(Map<String, dynamic> json) {
    final attribute = Attribute.fromJson(json);
    return AttributeWithValues(
      id: attribute.id,
      name: attribute.name,
      nameEn: attribute.nameEn,
      slug: attribute.slug,
      type: attribute.type,
      description: attribute.description,
      order: attribute.order,
      isActive: attribute.isActive,
      isFilterable: attribute.isFilterable,
      isRequired: attribute.isRequired,
      showInFilters: attribute.showInFilters,
      groupId: attribute.groupId,
      usageCount: attribute.usageCount,
      deletedAt: attribute.deletedAt,
      deletedBy: attribute.deletedBy,
      createdAt: attribute.createdAt,
      updatedAt: attribute.updatedAt,
      values: (json['values'] as List?)
          ?.map((item) => AttributeValue.fromJson(item))
          .toList() ?? [],
    );
  }

  List<AttributeValue> get activeValues => values.where((v) => v.isActive).toList();
  List<AttributeValue> get sortedValues => activeValues..sort((a, b) => a.order.compareTo(b.order));
  bool get hasValues => values.isNotEmpty;
  bool get hasActiveValues => activeValues.isNotEmpty;
  
  List<AttributeValue> get colorValues => activeValues.where((v) => v.isColor).toList();
  List<AttributeValue> get imageValues => activeValues.where((v) => v.hasImage).toList();
  List<AttributeValue> get textValues => activeValues.where((v) => !v.isColor && !v.hasImage).toList();
}
```

---

## 📝 ملاحظات مهمة

1. **أنواع الخصائص:**
   - `select`: اختيار واحد (مثل: اللون)
   - `multiselect`: اختيار متعدد
   - `text`: نص حر
   - `number`: رقم
   - `boolean`: نعم/لا

2. **الخصائص النشطة:**
   - `isActive`: نشطة أم لا
   - `isFilterable`: قابلة للفلترة
   - `isRequired`: إلزامية
   - `showInFilters`: عرض في الفلاتر

3. **القيم:**
   - `value`: القيمة بالعربية
   - `valueEn`: القيمة بالإنجليزية
   - `hexCode`: كود اللون (للألوان)
   - `imageUrl`: صورة القيمة
   - `usageCount`: عدد الاستخدامات

4. **الفلترة:**
   - استخدم `/attributes/filterable` للحصول على الخصائص القابلة للفلترة
   - يتم ترتيب النتائج حسب `order`
   - يتم إخفاء الخصائص المحذوفة

5. **الاستخدام:**
   - استخدم `getName(locale)` للحصول على الاسم حسب اللغة
   - استخدم `getValue(locale)` للحصول على القيمة حسب اللغة
   - استخدم `canBeFiltered` للتحقق من إمكانية الفلترة
   - استخدم `shouldShowInFilters` للتحقق من العرض في الفلاتر

6. **الأداء:**
   - يتم تخزين النتائج لمدة 30 دقيقة
   - يتم ترتيب النتائج حسب `order`
   - يتم إخفاء العناصر المحذوفة

---

**التالي:** [خدمة التقييمات (Reviews)](./17-reviews-service.md)

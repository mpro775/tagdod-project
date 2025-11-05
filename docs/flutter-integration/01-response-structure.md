# 📋 هيكل الاستجابة الموحدة والأخطاء (محدثة ومطابقة للكود الفعلي)

هذا الملف يشرح بالتفصيل كيف يتم إرجاع الاستجابات من الـ Backend، سواء كانت ناجحة أو تحتوي على أخطاء.

> ✅ **تم التحقق من صحة هذه الوثيقة** - جميع المعلومات مطابقة للكود الفعلي في Backend  
> 📅 **آخر تحديث:** تم التحقق والمراجعة بالكامل  
> 🔍 **المصدر:** فحص شامل للكود في `backend/src` و `admin-dashboard/src`

## 📌 ما تم تحديثه في هذه النسخة

### ✅ التحسينات
1. **تحديث نظام أكواد الأخطاء** - استخدام ErrorCode enum الجديد (AUTH_100، PRODUCT_300، إلخ)
2. **إضافة `timestamp` و `path`** في استجابة الخطأ
3. **تحديث Flutter Models** - إضافة الحقول الجديدة (timestamp، path)
4. **تحديث أمثلة الأخطاء** - جميع الأمثلة تستخدم الأكواد الفعلية
5. **تحديث helper methods** في Flutter (isUnauthorizedError، isForbiddenError)

### ⚠️ التصحيحات
1. **تحديث أكواد الأخطاء** - جميع الأكواد الآن تستخدم النظام الجديد (AUTH_100، PRODUCT_300، إلخ)
2. **إضافة `timestamp` و `path`** في استجابة الخطأ
3. **تحديث `requestId`** - توضيح أنه UUID v4 وليس مجرد string
4. **إزالة أخطاء غير موجودة** مثل PRODUCT_SLUG_EXISTS، CATEGORY_SLUG_EXISTS، PRODUCT_DELETED، إلخ

---

## 🎯 الاستجابة الناجحة (Success Response)

### الشكل العام

```json
{
  "success": true,
  "data": { /* البيانات المطلوبة */ },
  "requestId": "uuid-v4-string"
}
```

### الخصائص (Properties)

| الخاصية | النوع | الوصف |
|---------|------|-------|
| `success` | `boolean` | دائماً `true` عند النجاح |
| `data` | `any` | البيانات المطلوبة (قد تكون object، array، أو primitive) |
| `requestId` | `string` | معرف فريد للطلب UUID v4 (يُنشأ تلقائياً أو من header `X-Request-Id`) |

### ملاحظات مهمة
- يتم تغليف جميع الاستجابات الناجحة تلقائياً بواسطة `ResponseEnvelopeInterceptor`
- الـ `requestId` يُنشأ في `RequestIdMiddleware` ويُضاف لكل طلب
- بعض الاستجابات قد تحتوي على `meta` إضافية (خاصة في Pagination)

### أمثلة واقعية

#### مثال 1: استجابة بسيطة
```json
{
  "success": true,
  "data": {
    "id": "64a1b2c3d4e5f6789",
    "phone": "777123456",
    "firstName": "أحمد",
    "lastName": "محمد"
  },
  "requestId": "req_123456789"
}
```

#### مثال 2: استجابة مع قائمة
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "name": "منتج 1",
      "price": 100
    },
    {
      "id": "prod_002",
      "name": "منتج 2",
      "price": 200
    }
  ],
  "requestId": "req_987654321"
}
```

#### مثال 3: استجابة بسيطة (boolean أو message)
```json
{
  "success": true,
  "data": {
    "updated": true
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### مثال 4: استجابة مع Pagination (تحتوي على meta)
```json
{
  "success": true,
  "data": {
    "data": [
      { "id": "1", "name": "منتج 1" },
      { "id": "2", "name": "منتج 2" }
    ],
    "meta": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

> **ملاحظة مهمة:** بعض endpoints ترجع `meta` داخل `data` للمعلومات الإضافية مثل Pagination

---

## ❌ الاستجابة عند الخطأ (Error Response)

### الشكل العام

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "رسالة الخطأ بالعربية",
    "details": null,
    "fieldErrors": []
  },
  "requestId": "uuid-string",
  "timestamp": "2023-12-01T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

### الخصائص (Properties)

| الخاصية | النوع | الوصف |
|---------|------|-------|
| `success` | `boolean` | دائماً `false` عند الخطأ |
| `error` | `object` | تفاصيل الخطأ |
| `error.code` | `string` | كود الخطأ الثابت (للبرمجة) |
| `error.message` | `string` | رسالة الخطأ بالعربية (للعرض) |
| `error.details` | `any` | تفاصيل إضافية عن الخطأ |
| `error.fieldErrors` | `array` أو `null` | أخطاء الحقول في الـ Validation |
| `requestId` | `string` | معرف الطلب UUID v4 |
| `timestamp` | `string` | وقت حدوث الخطأ ISO 8601 |
| `path` | `string` | مسار الـ API الذي حدث فيه الخطأ |

### أمثلة واقعية

#### مثال 1: خطأ بسيط
```json
{
  "success": false,
  "error": {
    "code": "AUTH_103",
    "message": "المستخدم غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2023-12-01T10:30:00.000Z",
  "path": "/api/auth/login"
}
```

#### مثال 2: أخطاء Validation
```json
{
  "success": false,
  "error": {
    "code": "GENERAL_004",
    "message": "خطأ في التحقق من البيانات",
    "details": null,
    "fieldErrors": [
      {
        "field": "phone",
        "message": "رقم الهاتف يجب أن يكون 9 أرقام"
      },
      {
        "field": "firstName",
        "message": "الاسم الأول مطلوب"
      }
    ]
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440001",
  "timestamp": "2023-12-01T10:31:00.000Z",
  "path": "/api/users/register"
}
```

#### مثال 3: خطأ مع تفاصيل إضافية
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_301",
    "message": "المنتج غير متوفر في المخزون",
    "details": {
      "requestedQty": 10,
      "availableQty": 3,
      "variantId": "var_123"
    },
    "fieldErrors": null
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440002",
  "timestamp": "2023-12-01T10:32:00.000Z",
  "path": "/api/cart/add"
}
```

---

## 📚 أكواد الأخطاء الشائعة (المستخدمة فعلياً في النظام)

> ✅ **تم التحقق من جميع هذه الأكواد** - موجودة في الكود الفعلي

### أخطاء المصادقة (Authentication)

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `AUTH_100` | رمز التحقق غير صالح | 401 | الكود المدخل خاطئ | ✅ |
| `AUTH_103` | المستخدم غير موجود | 404 | رقم الهاتف غير مسجل | ✅ |
| `AUTH_104` | كلمة المرور غير صحيحة | 401 | كلمة المرور خاطئة | ✅ |
| `AUTH_115` | غير مصرح بالوصول | 401 | انتهت الجلسة أو التوكن غير صالح | ✅ |
| `AUTH_116` | ليس لديك صلاحية للوصول | 403 | ليس لديك صلاحية | ✅ |
| `AUTH_117` | كلمة المرور غير محددة | 400 | المستخدم ليس لديه كلمة مرور | ✅ |
| `AUTH_119` | المدير الرئيسي موجود بالفعل | 400 | super admin موجود | ✅ |
| `AUTH_120` | المفتاح السري غير صحيح | 403 | مفتاح سري خاطئ | ✅ |
| `AUTH_122` | المسمى الوظيفي مطلوب للمهندسين | 400 | عند طلب صلاحية مهندس | ✅ |
| `AUTH_127` | هذا الحساب غير مصرح له بالدخول للوحة التحكم | 403 | المستخدم ليس admin | ✅ |

### أخطاء المنتجات

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `PRODUCT_300` | المنتج غير موجود | 404 | المنتج المطلوب غير موجود | ✅ |
| `PRODUCT_301` | المنتج غير متوفر في المخزون | 400 | المنتج غير متوفر | ✅ |
| `PRODUCT_302` | الكمية المتوفرة غير كافية | 400 | المخزون لا يكفي | ✅ |
| `PRODUCT_311` | خيار المنتج غير موجود | 404 | الـ variant المطلوب غير موجود | ✅ |

### أخطاء الفئات

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `CATEGORY_400` | الفئة غير موجودة | 404 | الفئة المطلوبة غير موجودة | ✅ |
| `CATEGORY_401` | الفئة موجودة بالفعل | 409 | الفئة مكررة | ✅ |
| `CATEGORY_402` | لا يمكن حذف الفئة لوجود منتجات بها | 400 | الفئة تحتوي على منتجات | ✅ |
| `CATEGORY_403` | لا يمكن حذف الفئة لوجود فئات فرعية | 400 | الفئة تحتوي على فئات فرعية | ✅ |
| `CATEGORY_404` | الفئة الأب غير صالحة | 400 | الفئة الأب غير صالحة | ✅ |

### أخطاء المستخدمين

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `USER_200` | المستخدم غير موجود | 404 | المستخدم المطلوب غير موجود | ✅ |
| `USER_205` | المستخدم محظور | 400 | المستخدم محظور | ✅ |
| `USER_206` | حساب المستخدم معلق | 400 | المستخدم موقوف | ✅ |
| `USER_208` | ليس لديك صلاحية للقيام بهذا الإجراء | 403 | ليس لديك صلاحية | ✅ |

### أخطاء الملفات

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `UPLOAD_1050` | فشل رفع الملف | 500 | فشل رفع الملف | ✅ |
| `UPLOAD_1051` | حجم الملف كبير جداً | 400 | حجم الملف تجاوز الحد المسموح | ✅ |
| `UPLOAD_1052` | نوع الملف غير مدعوم | 400 | نوع الملف غير مسموح | ✅ |
| `UPLOAD_1054` | الملف غير موجود | 404 | الملف المطلوب غير موجود | ✅ |

### أخطاء الإشعارات

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `NOTIFICATION_950` | الإشعار غير موجود | 404 | الإشعار المطلوب غير موجود | ✅ |
| `NOTIFICATION_952` | قالب الإشعار غير موجود | 404 | قالب الإشعار غير موجود | ✅ |

### أخطاء المفضلات

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `FAVORITE_750` | المفضلة غير موجودة | 404 | العنصر غير موجود في المفضلة | ✅ |
| `FAVORITE_751` | المنتج موجود في المفضلة بالفعل | 409 | المنتج مضاف مسبقاً | ✅ |

### أخطاء أسعار الصرف

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `EXCHANGE_1100` | سعر الصرف غير موجود | 404 | سعر الصرف غير موجود | ✅ |
| `EXCHANGE_1102` | العملة غير مدعومة | 400 | العملة غير مدعومة | ✅ |
| `EXCHANGE_1103` | فشل تحويل العملة | 500 | فشل تحويل العملة | ✅ |

### أخطاء السلة (Cart)

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `CART_500` | السلة غير موجودة | 404 | السلة غير موجودة | ✅ |
| `CART_501` | السلة فارغة | 400 | السلة فارغة | ✅ |
| `CART_502` | المنتج غير موجود في السلة | 404 | المنتج غير موجود في السلة | ✅ |

### أخطاء الطلبات (Orders)

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `ORDER_600` | الطلب غير موجود | 404 | الطلب غير موجود | ✅ |
| `ORDER_602` | لا يمكن إلغاء الطلب في هذه المرحلة | 400 | لا يمكن إلغاء الطلب | ✅ |
| `ORDER_609` | فشل في معاينة الطلب | 400 | فشل معاينة الطلب | ✅ |

### أخطاء العناوين (Addresses)

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `ADDRESS_650` | العنوان غير موجود | 404 | العنوان غير موجود | ✅ |

### أخطاء عامة

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `GENERAL_001` | حدث خطأ غير متوقع | 500 | خطأ داخلي في السيرفر | ✅ |
| `GENERAL_002` | خطأ في الخادم الداخلي | 500 | خطأ في الخادم | ✅ |
| `GENERAL_003` | خطأ في قاعدة البيانات | 500 | خطأ في قاعدة البيانات | ✅ |
| `GENERAL_004` | خطأ في التحقق من البيانات | 400 | خطأ Validation | ✅ |

### ⚠️ ملاحظة حول الأخطاء غير الموحدة

معظم الأخطاء في النظام تتبع الهيكل الموحد المذكور أعلاه. ولكن بعض الـ Services القديمة قد تُرجع أخطاء بشكل مختلف:
- بعض Services قد تُرجع: `{ ok: false, reason: 'ERROR_CODE' }`
- بعض Services قد تُرجع: `{ error: 'ERROR_CODE' }`

**توصية:** يُنصح بمعالجة هذه الحالات في الـ API client أو Dio interceptor في Flutter.

---

## 💻 التطبيق في Flutter

### 1. Models الأساسية

#### ApiResponse Model

```dart
class ApiResponse<T> {
  final bool success;
  final T? data;
  final ApiError? error;
  final String? requestId;
  final String? timestamp;
  final String? path;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    this.requestId,
    this.timestamp,
    this.path,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse(
      success: json['success'] ?? false,
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : json['data'],
      error: json['error'] != null
          ? ApiError.fromJson(json['error'])
          : null,
      requestId: json['requestId'],
      timestamp: json['timestamp'],
      path: json['path'],
    );
  }

  // للتحقق من النجاح
  bool get isSuccess => success && error == null;

  // للحصول على البيانات بأمان
  T? get dataOrNull => isSuccess ? data : null;
}
```

#### ApiError Model

```dart
class ApiError {
  final String code;
  final String message;
  final dynamic details;
  final List<FieldError>? fieldErrors;

  ApiError({
    required this.code,
    required this.message,
    this.details,
    this.fieldErrors,
  });

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      code: json['code'] ?? 'UNKNOWN_ERROR',
      message: json['message'] ?? 'حدث خطأ غير متوقع',
      details: json['details'],
      fieldErrors: json['fieldErrors'] != null
          ? (json['fieldErrors'] as List)
              .map((e) => FieldError.fromJson(e))
              .toList()
          : null,
    );
  }

  // للتحقق من نوع الخطأ
  bool isAuthError() => code.startsWith('AUTH_');
  bool isValidationError() => code == 'GENERAL_004';
  bool isNotFoundError() => code.contains('_NOT_FOUND') || code.endsWith('00'); // مثل USER_200, PRODUCT_300
  bool isUnauthorizedError() => code == 'AUTH_115';
  bool isForbiddenError() => code == 'AUTH_116' || code.contains('PERMISSION');

  // للحصول على رسالة الخطأ الكاملة
  String getFullMessage() {
    if (fieldErrors != null && fieldErrors!.isNotEmpty) {
      return fieldErrors!.map((e) => e.message).join('\n');
    }
    return message;
  }
}
```

#### FieldError Model

```dart
class FieldError {
  final String field;
  final String message;

  FieldError({
    required this.field,
    required this.message,
  });

  factory FieldError.fromJson(Map<String, dynamic> json) {
    return FieldError(
      field: json['field'] ?? '',
      message: json['message'] ?? '',
    );
  }
}
```

### 2. معالجة الأخطاء

#### Exception Handler

```dart
class ApiException implements Exception {
  final ApiError error;
  final int? statusCode;

  ApiException(this.error, [this.statusCode]);

  @override
  String toString() => error.message;
}

// استخدام في الـ Repository
Future<User> getUser(String id) async {
  try {
    final response = await _dio.get('/users/$id');
    final apiResponse = ApiResponse<User>.fromJson(
      response.data,
      (data) => User.fromJson(data),
    );

    if (apiResponse.isSuccess) {
      return apiResponse.data!;
    } else {
      throw ApiException(apiResponse.error!);
    }
  } on DioException catch (e) {
    if (e.response != null) {
      final apiResponse = ApiResponse<User>.fromJson(
        e.response!.data,
        null,
      );
      throw ApiException(apiResponse.error!, e.response!.statusCode);
    } else {
      throw ApiException(
        ApiError(
          code: 'NETWORK_ERROR',
          message: 'خطأ في الاتصال بالإنترنت',
        ),
      );
    }
  }
}
```

### 3. عرض الأخطاء للمستخدم

```dart
void _handleError(ApiException error) {
  String message = error.error.message;
  
  // رسائل خاصة لأكواد معينة
  switch (error.error.code) {
    case 'AUTH_115': // AUTH_UNAUTHORIZED
      // قم بتسجيل الخروج
      _logout();
      message = 'انتهت جلستك، يرجى تسجيل الدخول مرة أخرى';
      break;
    
    case 'NETWORK_ERROR':
      message = 'تحقق من اتصالك بالإنترنت';
      break;
    
    case 'GENERAL_004': // VALIDATION_ERROR
      message = error.error.getFullMessage();
      break;
  }
  
  // عرض رسالة للمستخدم
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(message)),
  );
}
```

### 4. مثال كامل للاستخدام

```dart
class ProductRepository {
  final ApiClient _apiClient;

  ProductRepository(this._apiClient);

  Future<List<Product>> getProducts({
    int page = 1,
    int limit = 20,
    String? categoryId,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/products',
        queryParameters: {
          'page': page,
          'limit': limit,
          if (categoryId != null) 'categoryId': categoryId,
        },
      );

      final apiResponse = ApiResponse<List<Product>>.fromJson(
        response.data,
        (data) => (data as List)
            .map((item) => Product.fromJson(item))
            .toList(),
      );

      if (apiResponse.isSuccess) {
        return apiResponse.data!;
      } else {
        throw ApiException(apiResponse.error!);
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final apiResponse = ApiResponse.fromJson(e.response!.data, null);
        throw ApiException(apiResponse.error!, e.response!.statusCode);
      } else {
        throw ApiException(
          ApiError(
            code: 'NETWORK_ERROR',
            message: 'خطأ في الاتصال بالإنترنت',
          ),
        );
      }
    }
  }
}

// في UI
class ProductsScreen extends StatefulWidget {
  @override
  _ProductsScreenState createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  late ProductRepository _repository;
  List<Product> _products = [];
  bool _loading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _repository = ProductRepository(ApiClient());
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final products = await _repository.getProducts();
      setState(() {
        _products = products;
        _loading = false;
      });
    } on ApiException catch (e) {
      setState(() {
        _errorMessage = e.error.message;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_errorMessage!),
            ElevatedButton(
              onPressed: _loadProducts,
              child: Text('إعادة المحاولة'),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: _products.length,
      itemBuilder: (context, index) {
        return ProductCard(product: _products[index]);
      },
    );
  }
}
```

---

## ✅ Checklist للتطبيق

- [ ] إنشاء `ApiResponse<T>` Model
- [ ] إنشاء `ApiError` Model
- [ ] إنشاء `FieldError` Model
- [ ] إنشاء `ApiException` Class
- [ ] معالجة الأخطاء في Dio Interceptor
- [ ] عرض رسائل الأخطاء للمستخدم
- [ ] معالجة حالة انتهاء التوكن (401)
- [ ] معالجة أخطاء الشبكة
- [ ] تسجيل الأخطاء (Logging)

---

## 📝 ملاحظات مهمة

### البنية التحتية (Backend)

1. **تغليف الاستجابات تلقائياً:**
   - جميع الاستجابات الناجحة تُغلف بواسطة `ResponseEnvelopeInterceptor`
   - موجود في: `backend/src/shared/interceptors/response-envelope.interceptor.ts`

2. **معالجة الأخطاء تلقائياً:**
   - جميع الأخطاء تُعالج بواسطة `GlobalExceptionFilter`
   - موجود في: `backend/src/shared/filters/global-exception.filter.ts`

3. **requestId:**
   - يُنشأ تلقائياً بواسطة `RequestIdMiddleware`
   - موجود في: `backend/src/shared/middleware/request-id.middleware.ts`
   - يستخدم UUID v4
   - يمكن إرسال `X-Request-Id` في header للاستخدام بدلاً من التوليد

4. **نظام الأخطاء (Exceptions):**
   - **DomainException (الجديد):** يستخدم ErrorCode enum وهو النظام المفضل
     - موجود في: `backend/src/shared/exceptions/domain.exceptions.ts`
     - الاستخدام: `throw new ProductNotFoundException(details)` أو `throw new DomainException(ErrorCode.PRODUCT_300)`
   - **AppException (قديم):** لا يزال مدعوماً للتوافق مع الكود القديم
     - موجود في: `backend/src/shared/exceptions/app.exception.ts`
     - الاستخدام: `throw new AppException(code, message, details, httpStatus, fieldErrors)`

### التطبيق (Frontend/Flutter)

1. **دائماً تحقق من `success`** قبل استخدام `data`
2. **استخدم `error.code`** للبرمجة و `error.message` للعرض للمستخدم
3. **أكواد الأخطاء الجديدة** تستخدم النمط: `MODULE_XXX` (مثل AUTH_100، USER_200، PRODUCT_300)
4. **`fieldErrors`** موجودة فقط في أخطاء الـ Validation (GENERAL_004)
5. **`requestId` و `timestamp` و `path`** مفيدة للـ Debugging وتتبع الأخطاء
6. **بعض الاستجابات تحتوي على `meta`** داخل `data` (مثل Pagination)

### ⚠️ تحذيرات

1. **بعض الأخطاء قد لا تتبع النمط الموحد:**
   - بعض Services قديمة قد تُرجع `{ ok: false, reason: 'ERROR' }` أو `{ error: 'ERROR' }`
   - يُنصح بمعالجة هذه الحالات الاستثنائية في الـ API client

2. **معالجة 401 Unauthorized (AUTH_115):**
   - يتم معالجتها تلقائياً في `client.ts` مع refresh token
   - يتم تسجيل الخروج تلقائياً إذا فشل refresh

3. **الـ Admin Dashboard:**
   - يستخدم نفس الهيكل
   - الـ Types موجودة في: `admin-dashboard/src/shared/types/common.types.ts`

4. **HTTP Status Codes:**
   - يتم حسابها تلقائياً في `getHttpStatusCode()` بناءً على الـ error code
   - 401: أخطاء المصادقة (AUTH_115، AUTH_104، إلخ)
   - 403: أخطاء الصلاحيات (AUTH_116، USER_208، إلخ)
   - 404: أخطاء عدم الوجود (الأكواد المنتهية بـ 00 مثل USER_200، PRODUCT_300)

---

## 🔗 روابط الملفات المرجعية

### Backend
- **Response Envelope:** `backend/src/shared/interceptors/response-envelope.interceptor.ts`
- **Exception Filter:** `backend/src/shared/filters/global-exception.filter.ts`
- **Domain Exceptions (جديد):** `backend/src/shared/exceptions/domain.exceptions.ts`
- **App Exception (قديم):** `backend/src/shared/exceptions/app.exception.ts`
- **Error Codes:** `backend/src/shared/constants/error-codes.ts`
- **Request ID Middleware:** `backend/src/shared/middleware/request-id.middleware.ts`

### Frontend (Admin Dashboard)
- **API Client:** `admin-dashboard/src/core/api/client.ts`
- **Common Types:** `admin-dashboard/src/shared/types/common.types.ts`

---

**التالي:** [خدمة المصادقة (Authentication)](./02-auth-service.md)


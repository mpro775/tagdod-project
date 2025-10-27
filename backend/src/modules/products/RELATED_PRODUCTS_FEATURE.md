# ميزة المنتجات الشبيهة (Related Products Feature)

## نظرة عامة

تم إضافة ميزة المنتجات الشبيهة التي تسمح للأدمن بإضافة منتجات مشابهة لكل منتج، والتي يمكن عرضها في صفحة تفاصيل المنتج في التطبيق.

## التغييرات المضافة

### 1. تعديلات قاعدة البيانات (Schema)

تم إضافة حقل جديد في `Product Schema`:

```typescript
@Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
relatedProducts!: string[]; // IDs of related/similar products
```

### 2. تحديثات DTOs

تم إضافة دعم `relatedProducts` في:
- `CreateProductDto`
- `UpdateProductDto`

```typescript
@IsOptional() @IsArray() @IsString({ each: true }) relatedProducts?: string[];
```

### 3. وظائف ProductService الجديدة

#### `updateRelatedProducts(productId, relatedProductIds)`
تحديث قائمة المنتجات الشبيهة بالكامل (استبدال)

**الميزات:**
- إزالة التكرارات تلقائياً
- منع إضافة المنتج لنفسه
- التحقق من وجود جميع المنتجات
- التحقق من أن المنتجات غير محذوفة

#### `addRelatedProduct(productId, relatedProductId)`
إضافة منتج شبيه واحد

**الميزات:**
- منع التكرار
- منع إضافة المنتج لنفسه
- التحقق من وجود المنتج

#### `removeRelatedProduct(productId, relatedProductId)`
إزالة منتج شبيه

#### `getRelatedProducts(productId, limit?)`
الحصول على قائمة المنتجات الشبيهة

**الفلترة:**
- فقط المنتجات النشطة (ACTIVE)
- فقط المنتجات غير المحذوفة
- فقط المنتجات المفعلة (isActive: true)

**الحد الأقصى:** 10 منتجات (قابل للتخصيص)

## API Endpoints

### 🔒 Admin Endpoints (يتطلب مصادقة Admin)

#### 1. الحصول على المنتجات الشبيهة
```
GET /admin/products/:id/related?limit=10
```

**الاستجابة:**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "لوحة شمسية 400W",
      "nameEn": "Solar Panel 400W",
      "description": "...",
      "categoryId": {...},
      "brandId": {...},
      "mainImageId": {...}
    }
  ]
}
```

#### 2. تحديث المنتجات الشبيهة (استبدال كامل)
```
PUT /admin/products/:id/related
Content-Type: application/json

{
  "relatedProductIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}
```

**الاستجابة:**
```json
{
  "product": {
    "_id": "507f1f77bcf86cd799439010",
    "name": "لوحة شمسية 300W",
    "relatedProducts": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439013"
    ]
  }
}
```

#### 3. إضافة منتج شبيه واحد
```
POST /admin/products/:id/related/:relatedId
```

**مثال:**
```
POST /admin/products/507f1f77bcf86cd799439010/related/507f1f77bcf86cd799439011
```

#### 4. إزالة منتج شبيه
```
DELETE /admin/products/:id/related/:relatedId
```

**مثال:**
```
DELETE /admin/products/507f1f77bcf86cd799439010/related/507f1f77bcf86cd799439011
```

### 🌐 Public Endpoints (للتطبيق)

#### الحصول على المنتجات الشبيهة
```
GET /products/:id/related?limit=10
```

**الاستخدام في التطبيق:**
- عرض المنتجات الشبيهة في صفحة تفاصيل المنتج
- قسم "منتجات قد تعجبك أيضاً"
- قسم "منتجات مشابهة"

**الاستجابة:**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "لوحة شمسية 400W",
      "nameEn": "Solar Panel 400W",
      "description": "...",
      "categoryId": {...},
      "brandId": {...},
      "mainImageId": {...},
      "isFeatured": true,
      "isNew": false
    }
  ],
  "count": 5
}
```

**ميزات:**
- Cache لمدة 10 دقائق
- فقط المنتجات النشطة والمفعلة
- Populate تلقائي للـ category, brand, mainImage

## طريقة الاستخدام في لوحة التحكم

### السيناريو 1: إضافة منتجات شبيهة عند إنشاء منتج جديد

```typescript
POST /admin/products
{
  "name": "لوحة شمسية 300W",
  "nameEn": "Solar Panel 300W",
  "description": "...",
  "descriptionEn": "...",
  "categoryId": "...",
  "relatedProducts": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

### السيناريو 2: تحديث منتج موجود مع إضافة منتجات شبيهة

```typescript
PATCH /admin/products/:id
{
  "relatedProducts": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}
```

### السيناريو 3: إدارة المنتجات الشبيهة بشكل تدريجي

```typescript
// إضافة منتج شبيه
POST /admin/products/507f1f77bcf86cd799439010/related/507f1f77bcf86cd799439011

// إضافة منتج شبيه آخر
POST /admin/products/507f1f77bcf86cd799439010/related/507f1f77bcf86cd799439012

// إزالة منتج شبيه
DELETE /admin/products/507f1f77bcf86cd799439010/related/507f1f77bcf86cd799439011
```

## التحقق من الصحة والأخطاء

### رسائل الخطأ المتوقعة

| رمز الخطأ | الرسالة | الوصف |
|----------|---------|-------|
| `PRODUCT_NOT_FOUND` | المنتج غير موجود | المنتج المطلوب غير موجود |
| `PRODUCT_DELETED` | المنتج محذوف | المنتج محذوف (soft delete) |
| `INVALID_OPERATION` | لا يمكن إضافة المنتج لنفسه | محاولة إضافة المنتج كمنتج شبيه لنفسه |
| `RELATED_PRODUCT_NOT_FOUND` | المنتج الشبيه غير موجود | المنتج المراد إضافته غير موجود |
| `INVALID_RELATED_PRODUCTS` | بعض المنتجات الشبيهة غير موجودة أو محذوفة | بعض IDs غير صالحة |

### قواعد التحقق

✅ **يُسمح:**
- إضافة حتى أي عدد من المنتجات الشبيهة
- المنتجات من نفس الفئة أو فئات مختلفة
- إضافة منتجات جديدة أو مميزة

❌ **لا يُسمح:**
- إضافة المنتج لنفسه
- إضافة منتجات محذوفة
- إضافة منتجات غير موجودة

## الأداء والتخزين المؤقت (Cache)

### Admin Endpoints
- ❌ بدون cache (للحصول على البيانات الفورية)

### Public Endpoints
- ✅ Cache لمدة 10 دقائق
- يتم تنظيف الـ cache تلقائياً عند:
  - إضافة منتج شبيه
  - حذف منتج شبيه
  - تحديث قائمة المنتجات الشبيهة

## اختبار الـ API

### اختبار باستخدام cURL

```bash
# 1. الحصول على المنتجات الشبيهة (Admin)
curl -X GET "http://localhost:3000/api/admin/products/PRODUCT_ID/related" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 2. تحديث المنتجات الشبيهة
curl -X PUT "http://localhost:3000/api/admin/products/PRODUCT_ID/related" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "relatedProductIds": ["ID1", "ID2", "ID3"]
  }'

# 3. إضافة منتج شبيه
curl -X POST "http://localhost:3000/api/admin/products/PRODUCT_ID/related/RELATED_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 4. إزالة منتج شبيه
curl -X DELETE "http://localhost:3000/api/admin/products/PRODUCT_ID/related/RELATED_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 5. الحصول على المنتجات الشبيهة (Public)
curl -X GET "http://localhost:3000/api/products/PRODUCT_ID/related?limit=5"
```

### اختبار باستخدام Postman

قم باستيراد المجموعة التالية:

```json
{
  "info": {
    "name": "Related Products API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Related Products (Admin)",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{admin_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/admin/products/{{product_id}}/related?limit=10",
          "host": ["{{base_url}}"],
          "path": ["admin", "products", "{{product_id}}", "related"],
          "query": [
            {
              "key": "limit",
              "value": "10"
            }
          ]
        }
      }
    },
    {
      "name": "Update Related Products",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{admin_token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"relatedProductIds\": [\"ID1\", \"ID2\", \"ID3\"]\n}"
        },
        "url": {
          "raw": "{{base_url}}/admin/products/{{product_id}}/related",
          "host": ["{{base_url}}"],
          "path": ["admin", "products", "{{product_id}}", "related"]
        }
      }
    },
    {
      "name": "Add Related Product",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{admin_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/admin/products/{{product_id}}/related/{{related_id}}",
          "host": ["{{base_url}}"],
          "path": ["admin", "products", "{{product_id}}", "related", "{{related_id}}"]
        }
      }
    },
    {
      "name": "Remove Related Product",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{admin_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/admin/products/{{product_id}}/related/{{related_id}}",
          "host": ["{{base_url}}"],
          "path": ["admin", "products", "{{product_id}}", "related", "{{related_id}}"]
        }
      }
    },
    {
      "name": "Get Related Products (Public)",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/products/{{product_id}}/related?limit=10",
          "host": ["{{base_url}}"],
          "path": ["products", "{{product_id}}", "related"],
          "query": [
            {
              "key": "limit",
              "value": "10"
            }
          ]
        }
      }
    }
  ]
}
```

## التكامل مع التطبيق (Flutter/Mobile)

### مثال على الاستخدام في Flutter

```dart
class ProductDetailsService {
  Future<List<Product>> getRelatedProducts(String productId, {int limit = 10}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/products/$productId/related?limit=$limit'),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((item) => Product.fromJson(item))
          .toList();
    } else {
      throw Exception('Failed to load related products');
    }
  }
}
```

### مثال على الواجهة (UI Widget)

```dart
class RelatedProductsSection extends StatelessWidget {
  final String productId;

  const RelatedProductsSection({required this.productId});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Product>>(
      future: ProductDetailsService().getRelatedProducts(productId),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: EdgeInsets.all(16),
                child: Text(
                  'منتجات مشابهة',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ),
              SizedBox(
                height: 250,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: snapshot.data!.length,
                  itemBuilder: (context, index) {
                    return ProductCard(product: snapshot.data![index]);
                  },
                ),
              ),
            ],
          );
        } else if (snapshot.hasError) {
          return SizedBox.shrink();
        }
        return CircularProgressIndicator();
      },
    );
  }
}
```

## ملاحظات مهمة

1. **الترتيب**: يتم الاحتفاظ بترتيب المنتجات الشبيهة كما تم إدخالها
2. **العدد المقترح**: يُنصح بعدم تجاوز 10-15 منتج شبيه لكل منتج
3. **التحديث التلقائي**: عند حذف منتج، يتم إزالته تلقائياً من قوائم المنتجات الشبيهة (لا - يحتاج تنفيذ يدوي)
4. **الفلترة**: يتم عرض المنتجات النشطة فقط في الـ Public API
5. **الأداء**: استخدام index على حقل `relatedProducts` يحسّن الأداء

## التطويرات المستقبلية المقترحة

- [ ] إضافة ترتيب تلقائي بناءً على المبيعات
- [ ] اقتراح منتجات شبيهة تلقائياً بناءً على الفئة
- [ ] إضافة وزن/أولوية لكل منتج شبيه
- [ ] تتبع النقرات على المنتجات الشبيهة (Analytics)
- [ ] واجهة إدارة بصرية في لوحة التحكم

---

**تم إنشاؤه في:** {{ current_date }}
**الإصدار:** 1.0.0
**الحالة:** ✅ جاهز للاستخدام


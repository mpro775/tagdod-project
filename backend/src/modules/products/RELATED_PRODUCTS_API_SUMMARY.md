# ملخص API للمنتجات الشبيهة

## 📋 جدول الـ Endpoints

| Method | Endpoint | النوع | الوصف |
|--------|----------|------|-------|
| GET | `/admin/products/:id/related` | 🔒 Admin | الحصول على المنتجات الشبيهة |
| PUT | `/admin/products/:id/related` | 🔒 Admin | تحديث المنتجات الشبيهة (استبدال كامل) |
| POST | `/admin/products/:id/related/:relatedId` | 🔒 Admin | إضافة منتج شبيه واحد |
| DELETE | `/admin/products/:id/related/:relatedId` | 🔒 Admin | إزالة منتج شبيه |
| GET | `/products/:id/related` | 🌐 Public | الحصول على المنتجات الشبيهة (للتطبيق) |

## 🔒 Admin Endpoints

### 1️⃣ GET /admin/products/:id/related
**الحصول على المنتجات الشبيهة**

```bash
curl -X GET "http://localhost:3000/api/admin/products/PRODUCT_ID/related?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "منتج شبيه 1",
      "nameEn": "Related Product 1",
      ...
    }
  ]
}
```

---

### 2️⃣ PUT /admin/products/:id/related
**تحديث المنتجات الشبيهة (استبدال كامل)**

```bash
curl -X PUT "http://localhost:3000/api/admin/products/PRODUCT_ID/related" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "relatedProductIds": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439013"
    ]
  }'
```

**Request Body:**
```json
{
  "relatedProductIds": ["id1", "id2", "id3"]
}
```

**Response:**
```json
{
  "product": {
    "_id": "507f1f77bcf86cd799439010",
    "name": "المنتج الأساسي",
    "relatedProducts": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439013"
    ],
    ...
  }
}
```

---

### 3️⃣ POST /admin/products/:id/related/:relatedId
**إضافة منتج شبيه واحد**

```bash
curl -X POST "http://localhost:3000/api/admin/products/PRODUCT_ID/related/RELATED_PRODUCT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "product": {
    "_id": "507f1f77bcf86cd799439010",
    "relatedProducts": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012"
    ],
    ...
  }
}
```

---

### 4️⃣ DELETE /admin/products/:id/related/:relatedId
**إزالة منتج شبيه**

```bash
curl -X DELETE "http://localhost:3000/api/admin/products/PRODUCT_ID/related/RELATED_PRODUCT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "product": {
    "_id": "507f1f77bcf86cd799439010",
    "relatedProducts": [
      "507f1f77bcf86cd799439011"
    ],
    ...
  }
}
```

---

## 🌐 Public Endpoints

### 5️⃣ GET /products/:id/related
**الحصول على المنتجات الشبيهة (للتطبيق)**

```bash
curl -X GET "http://localhost:3000/api/products/PRODUCT_ID/related?limit=10"
```

**Query Parameters:**
- `limit` (optional): عدد المنتجات (default: 10)

**Response:**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "لوحة شمسية 400W",
      "nameEn": "Solar Panel 400W",
      "description": "لوحة شمسية عالية الكفاءة",
      "descriptionEn": "High efficiency solar panel",
      "categoryId": {
        "_id": "...",
        "name": "الطاقة الشمسية"
      },
      "brandId": {
        "_id": "...",
        "name": "SolarTech"
      },
      "mainImageId": {
        "_id": "...",
        "url": "https://..."
      },
      "isFeatured": true,
      "isNew": false,
      "status": "active"
    }
  ],
  "count": 5
}
```

**ميزات:**
- ✅ Cache لمدة 10 دقائق
- ✅ فقط المنتجات النشطة (status: ACTIVE)
- ✅ فقط المنتجات المفعلة (isActive: true)
- ✅ Populated: categoryId, brandId, mainImageId

---

## ⚠️ أخطاء محتملة

| Status Code | Error Code | الرسالة | السبب |
|------------|-----------|---------|-------|
| 404 | PRODUCT_NOT_FOUND | المنتج غير موجود | المنتج غير موجود في قاعدة البيانات |
| 400 | PRODUCT_DELETED | المنتج محذوف | المنتج محذوف (soft delete) |
| 400 | INVALID_OPERATION | لا يمكن إضافة المنتج لنفسه | محاولة إضافة المنتج كمنتج شبيه لنفسه |
| 404 | RELATED_PRODUCT_NOT_FOUND | المنتج الشبيه غير موجود | المنتج المراد إضافته غير موجود |
| 400 | INVALID_RELATED_PRODUCTS | بعض المنتجات الشبيهة غير موجودة أو محذوفة | بعض IDs في القائمة غير صالحة |

---

## 🧪 أمثلة على الاستخدام

### مثال 1: إضافة منتجات شبيهة لمنتج جديد

```typescript
// الخطوة 1: إنشاء منتج مع منتجات شبيهة
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

### مثال 2: تحديث منتج موجود

```typescript
// الخطوة 1: تحديث المنتج
PATCH /admin/products/507f1f77bcf86cd799439010
{
  "relatedProducts": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}
```

### مثال 3: إدارة منتجات شبيهة بشكل تدريجي

```typescript
// الخطوة 1: إضافة منتج شبيه أول
POST /admin/products/507f1f77bcf86cd799439010/related/507f1f77bcf86cd799439011

// الخطوة 2: إضافة منتج شبيه ثاني
POST /admin/products/507f1f77bcf86cd799439010/related/507f1f77bcf86cd799439012

// الخطوة 3: إضافة منتج شبيه ثالث
POST /admin/products/507f1f77bcf86cd799439010/related/507f1f77bcf86cd799439013

// الخطوة 4: إزالة منتج شبيه
DELETE /admin/products/507f1f77bcf86cd799439010/related/507f1f77bcf86cd799439011
```

### مثال 4: استخدام في التطبيق (Flutter)

```dart
// في صفحة تفاصيل المنتج
class ProductDetailsPage extends StatelessWidget {
  final String productId;

  Future<List<Product>> _fetchRelatedProducts() async {
    final response = await http.get(
      Uri.parse('$baseUrl/products/$productId/related?limit=10'),
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['data'] as List)
          .map((item) => Product.fromJson(item))
          .toList();
    }
    return [];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            // معلومات المنتج الرئيسية
            ProductDetails(productId: productId),
            
            // المنتجات الشبيهة
            FutureBuilder<List<Product>>(
              future: _fetchRelatedProducts(),
              builder: (context, snapshot) {
                if (snapshot.hasData && snapshot.data!.isNotEmpty) {
                  return RelatedProductsSection(
                    products: snapshot.data!,
                  );
                }
                return SizedBox.shrink();
              },
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## ✅ Checklist للتطبيق

### للـ Backend
- [x] Schema تحديث
- [x] DTOs تحديث
- [x] Service methods إضافة
- [x] Admin endpoints إضافة
- [x] Public endpoints إضافة
- [x] Validation إضافة
- [x] Error handling إضافة
- [x] Cache تنفيذ

### للـ Frontend (Admin Dashboard)
- [ ] واجهة إدارة المنتجات الشبيهة
- [ ] Multi-select dropdown للمنتجات
- [ ] Drag & drop لترتيب المنتجات
- [ ] Preview للمنتجات الشبيهة
- [ ] API integration

### للـ Mobile App
- [ ] API Service تنفيذ
- [ ] Related Products Widget تصميم
- [ ] عرض في صفحة تفاصيل المنتج
- [ ] Loading states
- [ ] Error handling
- [ ] Analytics tracking

---

## 📝 ملاحظات

1. جميع الـ Admin endpoints تتطلب مصادقة (JWT Token)
2. الـ Public endpoint لا يتطلب مصادقة
3. يتم عرض المنتجات النشطة فقط في الـ Public API
4. Cache يتم تحديثه تلقائياً عند إضافة/حذف منتجات
5. يُنصح بعدم تجاوز 10-15 منتج شبيه لكل منتج

---

**الحالة:** ✅ جاهز للاستخدام
**آخر تحديث:** {{ current_date }}


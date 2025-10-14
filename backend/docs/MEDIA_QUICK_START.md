# البدء السريع - مستودع الصور

## 🚀 في 3 دقائق!

### 1. رفع صورة

```http
POST /admin/media/upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "file": <binary>,
  "name": "صورة منتج",
  "category": "product"
}
```

---

### 2. عرض الصور

```http
GET /admin/media?category=product&page=1&limit=24
Authorization: Bearer <admin_token>
```

---

### 3. البحث

```http
GET /admin/media?search=عروض
Authorization: Bearer <admin_token>
```

---

## 📊 الفئات

| الفئة | الاستخدام |
|------|-----------|
| `banner` | بانرات الصفحة الرئيسية |
| `product` | صور المنتجات |
| `category` | صور الفئات |
| `brand` | شعارات البراندات |
| `other` | أخرى |

---

## 🎯 كشف التكرار التلقائي

عند رفع صورة:
- ✅ إذا موجودة → يرجع الصورة الموجودة
- ✅ إذا جديدة → يرفعها إلى Bunny.net

**الفائدة:** لا تُرفع نفس الصورة مرتين!

---

## 🔍 البحث والفلترة

```http
# حسب الفئة
GET /admin/media?category=banner

# بحث نصي
GET /admin/media?search=iPhone

# الكل مع المحذوفة
GET /admin/media?includeDeleted=true

# ترتيب
GET /admin/media?sortBy=usageCount&sortOrder=desc
```

---

## 🔄 التكامل مع المنتجات

### عند إضافة منتج:

```typescript
// الخيار 1: من المستودع
1. GET /admin/media?category=product
2. اختيار صورة → استخدام media._id
3. POST /admin/products { imageId: "media123", image: "url" }

// الخيار 2: رفع جديد
1. POST /admin/media/upload { file, category: "product" }
2. POST /admin/products { imageId: "media456", image: "url" }
```

---

## ✅ العمليات الأساسية

| العملية | Endpoint | Method |
|---------|----------|--------|
| رفع | `/admin/media/upload` | POST |
| قائمة | `/admin/media` | GET |
| عرض | `/admin/media/:id` | GET |
| تحديث | `/admin/media/:id` | PATCH |
| حذف | `/admin/media/:id` | DELETE |
| استعادة | `/admin/media/:id/restore` | POST |
| إحصائيات | `/admin/media/stats/summary` | GET |

---

## 📖 للمزيد

👉 [`MEDIA_LIBRARY_SYSTEM.md`](./MEDIA_LIBRARY_SYSTEM.md) - الدليل الكامل

---

**جاهز للاستخدام! 🎨**


# Quick Start - نظام المفضلة

> ❤️ **دليل سريع للبدء بنظام المفضلة**

---

## 🚀 للزوار (بدون حساب)

### 1. إضافة للمفضلة

```http
POST /favorites/guest
Content-Type: application/json

{
  "deviceId": "device-abc-123",
  "productId": "prod_shirt_001"
}
```

### 2. عرض المفضلات

```http
GET /favorites/guest?deviceId=device-abc-123
```

### 3. إزالة من المفضلة

```http
DELETE /favorites/guest
Content-Type: application/json

{
  "deviceId": "device-abc-123",
  "productId": "prod_shirt_001"
}
```

---

## 🔐 للمستخدمين المسجلين

### 1. إضافة للمفضلة

```http
POST /favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "prod_shirt_001",
  "note": "هدية لأحمد",
  "tags": ["هدايا", "أولوية"]
}
```

### 2. عرض المفضلات

```http
GET /favorites
Authorization: Bearer <token>
```

### 3. إزالة من المفضلة

```http
DELETE /favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "prod_shirt_001"
}
```

---

## ✨ المزامنة التلقائية

عند التسجيل، فقط أرسل `deviceId`:

```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "+966500000000",
  "code": "123456",
  "deviceId": "device-abc-123"  ← المزامنة تحدث تلقائياً!
}
```

✅ **جميع المفضلات من deviceId تنتقل إلى الحساب الجديد!**

---

## 📊 للأدمن

### إحصائيات

```http
GET /admin/favorites/stats
Authorization: Bearer <admin_token>
```

### المنتجات الأكثر إضافة للمفضلة

```http
GET /admin/favorites/most-favorited?limit=10
Authorization: Bearer <admin_token>
```

---

## 💡 نصائح سريعة

### في React:

```typescript
// 1. توليد deviceId
const deviceId = localStorage.getItem('deviceId') || 
                 'device-' + crypto.randomUUID();

// 2. إضافة للمفضلة
const addToFavorites = async (productId) => {
  if (isLoggedIn) {
    await fetch('/favorites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId })
    });
  } else {
    await fetch('/favorites/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, productId })
    });
  }
};
```

---

## 📖 للتفاصيل الكاملة

اقرأ: [`PROFESSIONAL_FAVORITES_SYSTEM.md`](./PROFESSIONAL_FAVORITES_SYSTEM.md)

---

**❤️ بسيط، سريع، احترافي!**


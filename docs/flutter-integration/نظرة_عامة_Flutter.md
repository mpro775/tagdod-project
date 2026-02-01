# نظرة عامة على تكامل Flutter مع المنصة

> دليل مختصر لفريق تطوير Flutter لفهم بنية التوثيق وكيفية الربط مع الـ Backend API

---

## ما هو هذا التوثيق؟

هذا المجلد (`docs/flutter-integration`) يحتوي على **دليل شامل للتكامل** بين تطبيق Flutter ومنصة الطاقة الشمسية. كل ملف يوثق **خدمة API** معينة مع:

- Endpoints المطلوبة
- شكل الطلب والاستجابة (Request/Response)
- أمثلة كود Flutter جاهزة
- Models مُقترحة
- ملاحظات وتحذيرات مهمة

**جميع الوثائق مُتحقق منها** ومطابقة 100% للكود الفعلي في الـ Backend.

---

## من أين أبدأ؟

### للبدء السريع:

```
1. اقرأ README.md           ← نقطة البداية الرئيسية
2. اقرأ 01-response-structure.md   ← هيكل الاستجابة ومعالجة الأخطاء
3. اقرأ 02-auth-service.md  ← المصادقة (OTP، التوكنات)
4. ثم اختر الخدمة التي تحتاجها
```

### ترتيب القراءة المُوصى به:

| الترتيب | الملف | السبب |
|---------|-------|-------|
| 1 | [README.md](./README.md) | نظرة عامة، Base URL، Headers، أمثلة أولية |
| 2 | [01-response-structure.md](./01-response-structure.md) | **إجباري** – شكل الاستجابة الناجحة/الفاشلة، أكواد الأخطاء، معالجة في Flutter |
| 3 | [02-auth-service.md](./02-auth-service.md) | المصادقة – لا يمكن استخدام أي خدمة بدونها |
| 4 | باقي الخدمات | حسب احتياج التطبيق |

---

## هيكل الخدمات

### الخدمات الأساسية (يُنصح بدمجها أولاً)

| الملف | الخدمة | الوصف |
|-------|--------|-------|
| [02-auth-service.md](./02-auth-service.md) | المصادقة | OTP، كلمة المرور، JWT، تحديث الحساب |
| [03-products-service.md](./03-products-service.md) | المنتجات | قائمة، تفاصيل، فلاتر، ترتيب |
| [04-cart-service.md](./04-cart-service.md) | السلة | إضافة، تحديث، دمج السلة |
| [05-checkout-service.md](./05-checkout-service.md) | الدفع والطلبات | معاينة، تأكيد، إدارة الطلبات |
| [06-categories-service.md](./06-categories-service.md) | التصنيفات | شجرة، فئات مميزة |
| [07-favorites-service.md](./07-favorites-service.md) | المفضلة | إضافة، حذف، مزامنة |
| [08-addresses-service.md](./08-addresses-service.md) | العناوين | عناوين التوصيل، افتراضي |

### الخدمات المساعدة

| الملف | الخدمة | الوصف |
|-------|--------|-------|
| [09-banners-service.md](./09-banners-service.md) | البنرات | عرض، تتبع |
| [10-brands-service.md](./10-brands-service.md) | العلامات التجارية | قائمة، تفاصيل |
| [11-search-service.md](./11-search-service.md) | البحث | بحث شامل، اقتراحات |
| [12-coupons-service.md](./12-coupons-service.md) | الكوبونات | التحقق، أنواع الخصم |

### الإشعارات والتواصل الفوري

| الملف | الخدمة | الوصف |
|-------|--------|-------|
| [13-notifications-service.md](./13-notifications-service.md) | الإشعارات | قائمة، تسجيل أجهزة، IN_APP و PUSH |
| [websocket.md](./websocket.md) | WebSocket | إشعارات فورية، رسائل الدعم الفني |

### خدمات إضافية

| الملف | الخدمة | الوصف |
|-------|--------|-------|
| [14-service-requests.md](./14-service-requests.md) | الطلبات الهندسية | إنشاء طلب، عروض المهندسين |
| [15-engineer-offers.md](./15-engineer-offers.md) | عروض المهندسين | عرض، قبول، رفض |
| [15-policies-service.md](./15-policies-service.md) | السياسات | الشروط والأحكام |
| [16-local-payment-accounts.md](./16-local-payment-accounts.md) | الحسابات البنكية | عرض معلومات الدفع المحلي |
| [16-support-service.md](./16-support-service.md) | الدعم الفني | تذاكر، رسائل، تقييم، **إشعار Push عند رد الأدمن** |
| [17-biometric-auth.md](./17-biometric-auth.md) | البصمة | تسجيل الدخول بالبصمة |
| [18-engineer-profile-service.md](./18-engineer-profile-service.md) | بروفايل المهندس | إدارة، رصيد، عمولات |

### أدلة إضافية

| الملف | الوصف |
|-------|--------|
| [CITIES_INTEGRATION_GUIDE.md](./CITIES_INTEGRATION_GUIDE.md) | دليل تكامل المدن |

---

## معلومات تقنية أساسية

### Base URL

```
http://localhost:3000   (تطوير)
https://api.example.com (إنتاج)
```

### Headers المطلوبة

**عام:**
```http
Content-Type: application/json
```

**محمية (بعد تسجيل الدخول):**
```http
Content-Type: application/json
Authorization: Bearer {access_token}
```

### هيكل الاستجابة

**نجاح:**
```json
{
  "success": true,
  "data": { ... },
  "requestId": "uuid"
}
```

**فشل:**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_100",
    "message": "رسالة بالعربية",
    "fieldErrors": [...]
  },
  "requestId": "uuid"
}
```

> راجع [01-response-structure.md](./01-response-structure.md) لقائمة أكواد الأخطاء ومعالجتها في Flutter.

---

## WebSocket – الاتصال الفوري

للاستفادة من الإشعارات ورسائل الدعم الفني في الوقت الفعلي:

| Namespace | الاستخدام |
|-----------|-----------|
| `/notifications` | إشعارات فورية (طلب، منتج، دعم، إلخ) |
| `/support` | رسائل الدعم الفني الفورية |

**ملاحظة مهمة:** انتبه لبناء URL بدون منفذ خاطئ (`:0`). راجع [websocket.md](./websocket.md) للحل الصحيح.

---

## Dependencies مُقترحة لـ Flutter

```yaml
dependencies:
  dio: ^5.x              # HTTP client
  socket_io_client: ^2.x # WebSocket
  shared_preferences: ^2.x
  flutter_secure_storage: ^9.x  # لحفظ التوكن بأمان
```

---

## أفضل الممارسات

1. **ابدأ دائماً** بـ `01-response-structure.md` لفهم الأخطاء والاستجابات
2. **استخدم Dio Interceptors** لإضافة التوكن ومعالجة 401
3. **أنشئ Models** لكل استجابة بدلاً من التعامل مع JSON مباشرة
4. **تحقق من `success`** قبل استخدام `data`
5. **سجّل الأجهزة** في `/notifications/devices/register` لتفعيل Push
6. **استخدم HTTPS** في الإنتاج

---

## الدعم والمراجع

- **Checklists:** في مجلد `docs/checklist` توجد قوائم جاهزة للتحقق من التكامل
- **Backend:** الكود في `backend/src/modules/`
- **أكواد الأخطاء:** `backend/src/shared/constants/error-codes.ts`

---

**آخر تحديث:** فبراير 2025  
**النسخة:** 1.0

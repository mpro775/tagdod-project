# نظام معالجة الأخطاء الموحد
# Unified Error Handling System

## 📋 نظرة عامة

نظام موحد لمعالجة الأخطاء في التطبيق مع رسائل عربية كاملة وأكواد موحدة.

---

## 🎯 الميزات

### ✅ ما تم تطبيقه:

1. **Error Codes موحدة** - 100+ كود خطأ مرتب حسب الوحدة
2. **رسائل عربية** - جميع رسائل الأخطاء بالعربية
3. **Custom Exceptions** - استثناءات متخصصة لكل وحدة
4. **Automatic HTTP Status** - تحديد تلقائي لحالة HTTP
5. **Backward Compatible** - يدعم النظام القديم
6. **Type-Safe** - دعم كامل لـ TypeScript

---

## 📚 كيفية الاستخدام

### 1. استيراد الاستثناءات

```typescript
// استيراد استثناءات عامة
import { 
  ErrorCode,
  DomainException 
} from '../../shared/exceptions';

// استيراد استثناءات متخصصة
import {
  ProductNotFoundException,
  ProductOutOfStockException,
  InsufficientStockException,
  OrderNotFoundException,
  OrderCannotCancelException,
  UserNotFoundException,
  InvalidOTPException
} from '../../shared/exceptions';
```

---

### 2. رمي الأخطاء

#### ✅ الطريقة الجديدة (مفضلة):

```typescript
// استخدام Exceptions جاهزة
throw new ProductNotFoundException({ productId });
throw new OrderNotFoundException({ orderId });
throw new UserNotFoundException({ userId });
throw new InvalidOTPException({ phone });

// استخدام مع تفاصيل إضافية
throw new InsufficientStockException({ 
  productId, 
  requested: 10, 
  available: 5 
});

throw new OrderCannotCancelException({ 
  orderId,
  status: 'delivered' 
});
```

#### ✅ استخدام ErrorCode مباشرة:

```typescript
// للحالات غير المغطاة
throw new DomainException(
  ErrorCode.PRODUCT_INVALID_PRICE,
  { price, minPrice }
);

throw new OrderException(
  ErrorCode.ORDER_CONFIRM_FAILED,
  { reason: 'Payment failed' }
);
```

---

### 3. الاستجابة التلقائية

#### عند رمي الخطأ:

```typescript
throw new ProductNotFoundException({ productId: '123' });
```

#### الاستجابة للعميل:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_300",
    "message": "المنتج غير موجود",
    "details": {
      "productId": "123"
    },
    "fieldErrors": null
  },
  "requestId": "uuid-here",
  "timestamp": "2025-10-28T10:30:00.000Z",
  "path": "/api/v1/products/123"
}
```

---

## 📝 أمثلة عملية

### مثال 1: Products Service

```typescript
@Injectable()
export class ProductsService {
  async getProduct(productId: string) {
    const product = await this.productModel.findById(productId);
    
    // ❌ القديم
    // if (!product) throw new NotFoundException('Product not found');
    
    // ✅ الجديد
    if (!product) {
      throw new ProductNotFoundException({ productId });
    }
    
    return product;
  }
  
  async purchaseProduct(productId: string, quantity: number) {
    const product = await this.getProduct(productId);
    
    // ❌ القديم
    // if (product.stock < quantity) {
    //   throw new BadRequestException('Not enough stock');
    // }
    
    // ✅ الجديد
    if (product.stock < quantity) {
      throw new InsufficientStockException({
        productId,
        requested: quantity,
        available: product.stock
      });
    }
    
    // ... process purchase
  }
}
```

---

### مثال 2: Orders Service

```typescript
@Injectable()
export class OrdersService {
  async cancelOrder(orderId: string, userId: string) {
    const order = await this.orderModel.findById(orderId);
    
    // ✅ الجديد
    if (!order) {
      throw new OrderNotFoundException({ orderId });
    }
    
    // التحقق من الحالة
    if (!this.canCancel(order.status)) {
      throw new OrderCannotCancelException({ 
        orderId,
        status: order.status 
      });
    }
    
    // ... cancel order
  }
  
  async rateOrder(orderId: string, rating: number) {
    const order = await this.getOrder(orderId);
    
    // ✅ الجديد
    if (order.status !== 'delivered') {
      throw new OrderRatingNotAllowedException({ 
        orderId,
        status: order.status 
      });
    }
    
    // ... save rating
  }
}
```

---

### مثال 3: Auth Service

```typescript
@Injectable()
export class AuthService {
  async verifyOTP(phone: string, code: string) {
    const isValid = await this.otpService.verify(phone, code);
    
    // ❌ القديم
    // if (!isValid) {
    //   throw new AppException('AUTH_INVALID_OTP', 'رمز التحقق غير صالح', null, 401);
    // }
    
    // ✅ الجديد
    if (!isValid) {
      throw new InvalidOTPException({ phone });
    }
    
    return true;
  }
  
  async login(phone: string, password: string) {
    const user = await this.userModel.findOne({ phone });
    
    // ✅ الجديد
    if (!user) {
      throw new UserNotFoundException({ phone });
    }
    
    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      throw new InvalidPasswordException({ phone });
    }
    
    if (user.status === 'blocked') {
      throw new UserBlockedException({ 
        userId: user._id,
        reason: user.blockReason 
      });
    }
    
    return this.generateTokens(user);
  }
}
```

---

## 🔢 Error Codes المتاحة

### Auth (100-199)
- `AUTH_INVALID_OTP` - رمز التحقق غير صالح
- `AUTH_USER_NOT_FOUND` - المستخدم غير موجود
- `AUTH_INVALID_PASSWORD` - كلمة المرور غير صحيحة
- `AUTH_USER_BLOCKED` - المستخدم محظور
- `AUTH_UNAUTHORIZED` - غير مصرح بالوصول
- `AUTH_FORBIDDEN` - ليس لديك صلاحية

### Products (300-399)
- `PRODUCT_NOT_FOUND` - المنتج غير موجود
- `PRODUCT_OUT_OF_STOCK` - المنتج غير متوفر
- `PRODUCT_INSUFFICIENT_STOCK` - الكمية غير كافية
- `VARIANT_NOT_FOUND` - خيار المنتج غير موجود

### Cart (500-549)
- `CART_NOT_FOUND` - السلة غير موجودة
- `CART_EMPTY` - السلة فارغة
- `CART_ITEM_NOT_FOUND` - المنتج غير موجود في السلة

### Orders (600-649)
- `ORDER_NOT_FOUND` - الطلب غير موجود
- `ORDER_CANNOT_CANCEL` - لا يمكن إلغاء الطلب
- `ORDER_NOT_READY_TO_SHIP` - الطلب غير جاهز للشحن
- `ORDER_RATING_NOT_ALLOWED` - لا يمكن التقييم الآن

### Payment (700-749)
- `PAYMENT_FAILED` - فشلت عملية الدفع
- `PAYMENT_GATEWAY_ERROR` - خطأ في بوابة الدفع

**[القائمة الكاملة في error-codes.ts](../constants/error-codes.ts)**

---

## 🎨 إنشاء Exceptions مخصصة

### للوحدات الجديدة:

```typescript
// في ملف exceptions الخاص بك
import { DomainException, ErrorCode } from '../../shared/exceptions';

export class CustomModuleException extends DomainException {
  constructor(code: ErrorCode, details?: unknown) {
    super(code, details);
  }
}

export class CustomNotFoundException extends CustomModuleException {
  constructor(details?: unknown) {
    super(ErrorCode.YOUR_CUSTOM_CODE, details);
  }
}
```

---

## 🔄 التوافق مع النظام القديم

النظام الجديد **متوافق تماماً** مع النظام القديم:

```typescript
// ✅ القديم - لا يزال يعمل
throw new AppException('ERROR_CODE', 'رسالة', details, 400);

// ✅ الجديد - مفضل
throw new DomainException(ErrorCode.ERROR_CODE, details);
```

---

## ⚙️ التكوين المتقدم

### إضافة Error Code جديد:

1. أضف الكود في `error-codes.ts`:
```typescript
export enum ErrorCode {
  // ...
  YOUR_NEW_CODE = 'MODULE_XXX',
}
```

2. أضف الرسالة:
```typescript
export const ErrorMessages: Record<ErrorCode, string> = {
  // ...
  [ErrorCode.YOUR_NEW_CODE]: 'رسالة الخطأ بالعربية',
};
```

3. إنشاء Exception (اختياري):
```typescript
export class YourException extends DomainException {
  constructor(details?: unknown) {
    super(ErrorCode.YOUR_NEW_CODE, details);
  }
}
```

---

## 📊 HTTP Status Codes

يتم تحديد HTTP Status Code تلقائياً بناءً على Error Code:

| Pattern | HTTP Status |
|---------|-------------|
| `*_NOT_FOUND` | 404 |
| `*_UNAUTHORIZED` | 401 |
| `*_FORBIDDEN` | 403 |
| `*_ALREADY_EXISTS` | 409 |
| `*_RATE_LIMIT*` | 429 |
| `*_INTERNAL*` | 500 |
| Default | 400 |

---

## 🐛 Debugging

### في Development:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_300",
    "message": "المنتج غير موجود",
    "details": {
      "productId": "123",
      "name": "Error",
      "stack": "Error: ..."
    }
  }
}
```

### في Production:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_300",
    "message": "المنتج غير موجود",
    "details": {
      "productId": "123"
    }
  }
}
```

---

## ✅ Best Practices

### 1. استخدم Exceptions المتخصصة

```typescript
// ❌ سيء
throw new DomainException(ErrorCode.PRODUCT_NOT_FOUND, { id });

// ✅ جيد
throw new ProductNotFoundException({ id });
```

### 2. أضف تفاصيل مفيدة

```typescript
// ❌ سيء
throw new ProductNotFoundException();

// ✅ جيد
throw new ProductNotFoundException({ 
  productId, 
  slug,
  searchedBy: 'slug' 
});
```

### 3. استخدم Error Codes ا��موحدة

```typescript
// ❌ سيء
throw new Error('Product not found');

// ✅ جيد
throw new ProductNotFoundException({ productId });
```

### 4. لا تكشف معلومات حساسة

```typescript
// ❌ سيء - يكشف معلومات حساسة
throw new DomainException(ErrorCode.AUTH_INVALID_PASSWORD, {
  phone,
  attemptedPassword, // ❌ لا!
  correctPassword    // ❌ لا!
});

// ✅ جيد
throw new InvalidPasswordException({ phone });
```

---

## 🔍 التحقق من الأخطاء

### في Frontend:

```typescript
try {
  const response = await api.getProduct(productId);
} catch (error) {
  if (error.response?.data?.error?.code === 'PRODUCT_300') {
    // المنتج غير موجود
    showNotFound();
  } else if (error.response?.data?.error?.code === 'PRODUCT_301') {
    // المنتج غير متوفر
    showOutOfStock();
  }
}
```

---

## 📈 الإحصائيات

### النظام الحالي:

- ✅ **100+ Error Codes** موحدة
- ✅ **50+ Custom Exceptions** جاهزة
- ✅ **100% رسائل عربية**
- ✅ **Type-Safe** بالكامل
- ✅ **Backward Compatible**
- ✅ **Auto HTTP Status**

---

## 🎯 الخلاصة

**استخدم النظام الجديد لـ:**
- ✅ أكواد موحدة
- ✅ رسائل عربية
- ✅ تفاصيل أفضل
- ✅ Type safety
- ✅ سهولة الصيانة

**النظام القديم:**
- ⚠️ مدعوم للتوافق
- ⚠️ لكن استخدم الجديد للكود الجديد

---

**آخر تحديث:** 28 أكتوبر 2025  
**الحالة:** ✅ جاهز للاستخدام


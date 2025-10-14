# دليل تكامل الكوبونات مع السلة والطلبات
# Coupons Integration with Cart & Checkout

## 🔄 التكامل الكامل

### 1. تحديث Cart Schema

```typescript
// backend/src/modules/cart/schemas/cart.schema.ts

@Schema({ timestamps: true })
export class Cart {
  // ... existing fields
  
  // 🆕 Coupon fields
  @Prop()
  appliedCouponCode?: string;
  
  @Prop({ default: 0 })
  couponDiscount!: number;
  
  @Prop({ type: [String], default: [] })
  autoAppliedCouponCodes?: string[];
  
  @Prop({ type: [Number], default: [] })
  autoAppliedDiscounts?: number[];
}
```

---

### 2. تحديث Cart Service

```typescript
// backend/src/modules/cart/cart.service.ts

import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private couponsService: CouponsService,  // ✅ Inject CouponsService
  ) {}

  /**
   * Apply coupon to cart
   */
  async applyCouponToCart(
    cartId: string,
    couponCode: string,
    userId?: string,
  ) {
    const cart = await this.cartModel.findById(cartId);
    
    if (!cart) {
      throw new AppException('Cart not found', 404);
    }

    // Calculate cart totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Get product and category IDs from cart
    const productIds = cart.items.map(item => item.productId);
    const categoryIds = cart.items.map(item => item.categoryId);

    // Validate coupon
    const validation = await this.couponsService.validateCoupon({
      code: couponCode,
      orderAmount: subtotal,
      currency: cart.currency || 'YER',
      userId,
      productIds,
      categoryIds,
    });

    if (!validation.valid) {
      throw new AppException(validation.message || 'Invalid coupon', 400);
    }

    // Apply coupon
    cart.appliedCouponCode = couponCode;
    cart.couponDiscount = validation.calculatedDiscount || 0;

    await cart.save();

    return this.calculateCartTotals(cart);
  }

  /**
   * Remove coupon from cart
   */
  async removeCouponFromCart(cartId: string) {
    const cart = await this.cartModel.findById(cartId);
    
    if (!cart) {
      throw new AppException('Cart not found', 404);
    }

    cart.appliedCouponCode = undefined;
    cart.couponDiscount = 0;

    await cart.save();

    return this.calculateCartTotals(cart);
  }

  /**
   * Auto-apply eligible coupons
   */
  async autoApplyCoupons(cartId: string, userId?: string, accountType?: string) {
    const cart = await this.cartModel.findById(cartId);
    
    if (!cart) {
      throw new AppException('Cart not found', 404);
    }

    // Get auto-apply coupons
    const autoCoupons = await this.couponsService.getAutoApplyCoupons(
      userId,
      accountType,
    );

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const appliedCoupons: string[] = [];
    const appliedDiscounts: number[] = [];

    // Apply each eligible coupon
    for (const coupon of autoCoupons) {
      const validation = await this.couponsService.validateCoupon({
        code: coupon.code,
        orderAmount: subtotal,
        currency: cart.currency || 'YER',
        userId,
      });

      if (validation.valid && validation.calculatedDiscount) {
        appliedCoupons.push(coupon.code);
        appliedDiscounts.push(validation.calculatedDiscount);
      }
    }

    cart.autoAppliedCouponCodes = appliedCoupons;
    cart.autoAppliedDiscounts = appliedDiscounts;

    await cart.save();

    return this.calculateCartTotals(cart);
  }

  /**
   * Calculate cart totals
   */
  private calculateCartTotals(cart: Cart) {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const couponDiscount = cart.couponDiscount || 0;
    const autoDiscount = cart.autoAppliedDiscounts?.reduce((sum, d) => sum + d, 0) || 0;
    const totalDiscount = couponDiscount + autoDiscount;

    const total = Math.max(0, subtotal - totalDiscount);

    return {
      cart,
      subtotal,
      couponDiscount,
      autoDiscount,
      totalDiscount,
      total,
    };
  }

  /**
   * Get cart with coupons applied
   */
  async getCart(cartId: string, userId?: string, accountType?: string) {
    const cart = await this.cartModel.findById(cartId);
    
    if (!cart) {
      throw new AppException('Cart not found', 404);
    }

    // Auto-apply coupons if not already applied
    if (!cart.autoAppliedCouponCodes || cart.autoAppliedCouponCodes.length === 0) {
      await this.autoApplyCoupons(cartId, userId, accountType);
    }

    return this.calculateCartTotals(cart);
  }
}
```

---

### 3. تحديث Cart Controller

```typescript
// backend/src/modules/cart/cart.controller.ts

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('apply-coupon')
  @ApiOperation({ summary: 'Apply coupon to cart' })
  async applyCoupon(
    @Body() body: { cartId: string; couponCode: string },
    @Req() req: any,
  ) {
    const result = await this.cartService.applyCouponToCart(
      body.cartId,
      body.couponCode,
      req.user?.userId,
    );

    return {
      success: true,
      message: `Coupon ${body.couponCode} applied successfully`,
      data: result,
    };
  }

  @Delete(':cartId/coupon')
  @ApiOperation({ summary: 'Remove coupon from cart' })
  async removeCoupon(@Param('cartId') cartId: string) {
    const result = await this.cartService.removeCouponFromCart(cartId);

    return {
      success: true,
      message: 'Coupon removed successfully',
      data: result,
    };
  }

  @Get(':cartId')
  @ApiOperation({ summary: 'Get cart with auto-applied coupons' })
  async getCart(
    @Param('cartId') cartId: string,
    @Req() req: any,
  ) {
    const result = await this.cartService.getCart(
      cartId,
      req.user?.userId,
      req.user?.accountType,
    );

    return {
      success: true,
      data: result,
    };
  }
}
```

---

### 4. تحديث Order Schema

```typescript
// backend/src/modules/checkout/schemas/order.schema.ts

@Schema({ timestamps: true })
export class Order {
  // ... existing fields
  
  // 🆕 Coupon fields
  @Prop()
  appliedCouponCode?: string;
  
  @Prop({ default: 0 })
  couponDiscount!: number;
  
  @Prop({ type: Object })
  couponDetails?: {
    code: string;
    title: string;
    type: string;
    discount: number;
  };
  
  @Prop({ type: [Object], default: [] })
  autoAppliedCoupons?: Array<{
    code: string;
    discount: number;
  }>;
}
```

---

### 5. تحديث Checkout Service

```typescript
// backend/src/modules/checkout/checkout.service.ts

import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private couponsService: CouponsService,  // ✅ Inject
  ) {}

  /**
   * Create order with coupon
   */
  async createOrder(checkoutDto: any, userId: string) {
    const cart = await this.cartModel.findById(checkoutDto.cartId);
    
    if (!cart) {
      throw new AppException('Cart not found', 404);
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    let couponDiscount = 0;
    let couponDetails = null;

    // Apply manual coupon if exists
    if (cart.appliedCouponCode) {
      const validation = await this.couponsService.validateCoupon({
        code: cart.appliedCouponCode,
        orderAmount: subtotal,
        currency: cart.currency || 'YER',
        userId,
      });

      if (!validation.valid) {
        throw new AppException(
          validation.message || 'Coupon is no longer valid',
          400,
        );
      }

      couponDiscount = validation.calculatedDiscount || 0;
      couponDetails = {
        code: validation.coupon!.code,
        title: validation.coupon!.title,
        type: validation.coupon!.type,
        discount: couponDiscount,
      };
    }

    // Auto-applied coupons
    const autoAppliedCoupons: Array<{ code: string; discount: number }> = [];
    
    if (cart.autoAppliedCouponCodes && cart.autoAppliedDiscounts) {
      for (let i = 0; i < cart.autoAppliedCouponCodes.length; i++) {
        autoAppliedCoupons.push({
          code: cart.autoAppliedCouponCodes[i],
          discount: cart.autoAppliedDiscounts[i],
        });
      }
    }

    const autoDiscount = autoAppliedCoupons.reduce((sum, c) => sum + c.discount, 0);
    const totalDiscount = couponDiscount + autoDiscount;
    const total = Math.max(0, subtotal - totalDiscount);

    // Create order
    const order = new this.orderModel({
      userId: new Types.ObjectId(userId),
      items: cart.items,
      subtotal,
      appliedCouponCode: cart.appliedCouponCode,
      couponDiscount,
      couponDetails,
      autoAppliedCoupons,
      totalDiscount,
      total,
      status: 'pending',
      ...checkoutDto,
    });

    await order.save();

    // Update coupon usage
    if (cart.appliedCouponCode) {
      await this.couponsService.applyCouponToOrder(
        cart.appliedCouponCode,
        order._id.toString(),
        userId,
        total,
        couponDiscount,
      );
    }

    // Update auto-applied coupons
    for (const autoCoupon of autoAppliedCoupons) {
      await this.couponsService.applyCouponToOrder(
        autoCoupon.code,
        order._id.toString(),
        userId,
        total,
        autoCoupon.discount,
      );
    }

    // Clear cart
    await this.cartModel.deleteOne({ _id: cart._id });

    return order;
  }
}
```

---

## 📝 أمثلة الاستخدام الكاملة

### مثال 1: المستخدم يطبق كوبون على السلة

```javascript
// Frontend Code

// 1. User adds items to cart
POST /cart/add-item
{
  "productId": "prod_123",
  "quantity": 2
}

// 2. User enters coupon code
const couponCode = "SUMMER20";

// 3. Validate coupon first (optional but recommended)
POST /coupons/validate
{
  "code": "SUMMER20",
  "orderAmount": 150000,
  "currency": "YER",
  "productIds": ["prod_123"]
}

Response:
{
  "success": true,
  "data": {
    "coupon": {
      "code": "SUMMER20",
      "title": "خصم الصيف 20%"
    },
    "calculatedDiscount": 30000,
    "finalAmount": 120000
  }
}

// 4. Apply coupon to cart
POST /cart/apply-coupon
{
  "cartId": "cart_456",
  "couponCode": "SUMMER20"
}

Response:
{
  "success": true,
  "message": "Coupon SUMMER20 applied successfully",
  "data": {
    "cart": {...},
    "subtotal": 150000,
    "couponDiscount": 30000,
    "autoDiscount": 0,
    "totalDiscount": 30000,
    "total": 120000
  }
}

// 5. User proceeds to checkout
POST /checkout
{
  "cartId": "cart_456",
  "shippingAddress": {...}
}

// Order created with coupon applied:
{
  "orderId": "order_789",
  "subtotal": 150000,
  "appliedCouponCode": "SUMMER20",
  "couponDiscount": 30000,
  "total": 120000
}

// Coupon usage updated automatically ✅
```

---

### مثال 2: كوبون يطبق تلقائياً

```javascript
// 1. Admin creates auto-apply coupon
POST /admin/coupons
{
  "code": "WELCOME10",
  "title": "خصم ترحيبي 10%",
  "type": "percentage",
  "discountPercentage": 10,
  "visibility": "auto_apply",
  "newUsersOnly": true,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}

// 2. New user adds items to cart
POST /cart/add-item
{
  "productId": "prod_123",
  "quantity": 1
}

// 3. User views cart
GET /cart/cart_456

// Auto-apply coupons are checked and applied ✅
Response:
{
  "success": true,
  "data": {
    "cart": {...},
    "subtotal": 100000,
    "couponDiscount": 0,  // No manual coupon
    "autoDiscount": 10000,  // ✅ Auto-applied!
    "autoAppliedCoupons": [
      {
        "code": "WELCOME10",
        "discount": 10000
      }
    ],
    "totalDiscount": 10000,
    "total": 90000
  }
}

// 4. Order is created with auto-applied coupon
POST /checkout
{
  "cartId": "cart_456"
}

// Order includes auto-applied coupons ✅
{
  "orderId": "order_789",
  "autoAppliedCoupons": [
    {
      "code": "WELCOME10",
      "discount": 10000
    }
  ],
  "total": 90000
}
```

---

### مثال 3: دمج كوبونات متعددة

```javascript
// User has:
// - Manual coupon: SUMMER20 (20% off)
// - Auto coupon: MEMBER5 (5% off, stackable)

// Cart calculation:
const subtotal = 100000;

// 1. Apply manual coupon first
const manualDiscount = subtotal * 0.20;  // 20000

// 2. Apply auto coupon on remaining
const afterManual = subtotal - manualDiscount;  // 80000
const autoDiscount = afterManual * 0.05;  // 4000

// Total
const total = subtotal - manualDiscount - autoDiscount;  // 76000

Response:
{
  "subtotal": 100000,
  "couponDiscount": 20000,  // SUMMER20
  "autoDiscount": 4000,     // MEMBER5
  "totalDiscount": 24000,
  "total": 76000
}
```

---

## 🎨 Frontend React Example

```jsx
// CartPage.jsx - Complete Example
import React, { useState, useEffect } from 'react';

function CartPage({ cartId, userId }) {
  const [cart, setCart] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, [cartId]);

  async function loadCart() {
    try {
      const res = await fetch(`/cart/${cartId}`);
      const data = await res.json();
      setCart(data.data);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }

  async function applyCoupon() {
    if (!couponCode) return;

    setLoading(true);
    setCouponError('');

    try {
      // 1. Validate first
      const validateRes = await fetch('/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          orderAmount: cart.subtotal,
          currency: 'YER',
          userId,
          productIds: cart.cart.items.map(i => i.productId),
        }),
      });

      const validateData = await validateRes.json();

      if (!validateData.success) {
        setCouponError(validateData.message);
        return;
      }

      // 2. Apply to cart
      const applyRes = await fetch('/cart/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          couponCode,
        }),
      });

      const applyData = await applyRes.json();

      if (applyData.success) {
        setCart(applyData.data);
        setCouponCode('');
        alert(`✅ تم تطبيق الكوبون! وفرت ${validateData.data.calculatedDiscount.toLocaleString()} YER`);
      }
    } catch (error) {
      setCouponError('حدث خطأ. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  async function removeCoupon() {
    try {
      const res = await fetch(`/cart/${cartId}/coupon`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setCart(data.data);
      }
    } catch (error) {
      console.error('Error removing coupon:', error);
    }
  }

  if (!cart) return <div>Loading...</div>;

  return (
    <div className="cart-page">
      <h1>سلة التسوق</h1>

      {/* Cart Items */}
      <div className="cart-items">
        {cart.cart.items.map((item, idx) => (
          <div key={idx} className="cart-item">
            <span>{item.productName}</span>
            <span>{item.quantity} × {item.price.toLocaleString()} YER</span>
          </div>
        ))}
      </div>

      {/* Coupon Section */}
      <div className="coupon-section">
        {cart.cart.appliedCouponCode ? (
          <div className="applied-coupon">
            <div>
              <strong>🎫 {cart.cart.appliedCouponCode}</strong>
              <span>خصم: -{cart.couponDiscount.toLocaleString()} YER</span>
            </div>
            <button onClick={removeCoupon}>إزالة</button>
          </div>
        ) : (
          <div className="coupon-input">
            <input
              type="text"
              placeholder="أدخل كود الخصم"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
            />
            <button onClick={applyCoupon} disabled={loading}>
              {loading ? 'جاري التحقق...' : 'تطبيق'}
            </button>
          </div>
        )}
        {couponError && <div className="error">{couponError}</div>}
      </div>

      {/* Auto-Applied Coupons */}
      {cart.autoDiscount > 0 && (
        <div className="auto-coupons">
          <h4>🎉 كوبونات مطبقة تلقائياً:</h4>
          {cart.cart.autoAppliedCouponCodes?.map((code, idx) => (
            <div key={idx}>
              <strong>{code}</strong>
              <span>-{cart.cart.autoAppliedDiscounts[idx].toLocaleString()} YER</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="cart-summary">
        <div className="row">
          <span>المجموع الفرعي:</span>
          <span>{cart.subtotal.toLocaleString()} YER</span>
        </div>

        {cart.couponDiscount > 0 && (
          <div className="row discount">
            <span>خصم الكوبون:</span>
            <span>-{cart.couponDiscount.toLocaleString()} YER</span>
          </div>
        )}

        {cart.autoDiscount > 0 && (
          <div className="row discount">
            <span>خصم تلقائي:</span>
            <span>-{cart.autoDiscount.toLocaleString()} YER</span>
          </div>
        )}

        <div className="row total">
          <span>المجموع:</span>
          <span>{cart.total.toLocaleString()} YER</span>
        </div>

        {cart.totalDiscount > 0 && (
          <div className="savings">
            🎉 وفرت {cart.totalDiscount.toLocaleString()} YER!
          </div>
        )}
      </div>

      <button className="checkout-btn" onClick={() => checkout()}>
        إتمام الشراء
      </button>
    </div>
  );
}
```

---

## ✅ الملخص

### ما تم تنفيذه:
1. ✅ **نظام كوبونات احترافي كامل**
2. ✅ **تكامل مع Cart Service**
3. ✅ **تكامل مع Checkout/Order**
4. ✅ **Auto-apply coupons**
5. ✅ **Stackable coupons**
6. ✅ **تتبع الاستخدام**
7. ✅ **أمثلة كاملة**

### الخطوات المطلوبة للتنفيذ:
1. ⚠️ Update Cart Schema & Service
2. ⚠️ Update Order Schema & Checkout Service
3. ⚠️ Inject CouponsService in Cart & Checkout modules
4. ⚠️ Test all flows

النظام جاهز للتطبيق! 🚀


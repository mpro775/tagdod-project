# نظام الطلبات الاحترافي الشامل 📦
# Professional Orders System - Complete Guide

## 🎯 نظام طلبات احترافي مطلق

تم تصميم **نظام طلبات شامل ومرن** مع جميع المميزات الاحترافية.

---

## ✨ المميزات الاحترافية المنفذة

### 1️⃣ **Order Schema محسّن جداً** (100+ حقل)

```typescript
Order {
  // معلومات أساسية
  orderNumber: "ORD-2024-00001"    // رقم سهل للعميل
  userId: ObjectId
  accountType: "retail"            // retail/wholesale/engineer
  source: "web"                    // web/mobile/app
  
  // الحالة المتقدمة
  status: OrderStatus              // 16 حالة
  paymentStatus: PaymentStatus     // 7 حالات
  
  statusHistory: [{                // سجل كامل للحالات
    status: "processing",
    changedAt: Date,
    changedBy: ObjectId,
    changedByRole: "admin",
    notes: "تم البدء بالتجهيز"
  }]
  
  // عنوان التوصيل الكامل
  deliveryAddress: {
    addressId: ObjectId,
    recipientName: "أحمد محمد",
    recipientPhone: "773123456",
    line1: "شارع الستين",
    line2: "الدور 3، شقة 12",
    city: "صنعاء",
    region: "حي السبعين",
    country: "Yemen",
    coords: { lat, lng },
    notes: "الاتصال قبل الوصول"
  }
  
  // المنتجات المحسّنة
  items: [{
    productId, variantId, qty,
    basePrice: 100000,             // الأصلي
    discount: 20000,               // الخصم
    finalPrice: 80000,             // النهائي
    lineTotal: 160000,             // × الكمية
    appliedPromotionId,            // العرض المطبق
    
    snapshot: {                    // معلومات كاملة
      name: "iPhone 15 Pro",
      sku: "IP15PRO-256-BLK",
      slug: "iphone-15-pro",
      image: "https://...",
      brandId, brandName: "Apple",
      categoryId, categoryName: "Smartphones",
      attributes: { color: "Black", storage: "256GB" }
    },
    
    itemStatus: "fulfilled",       // حالة المنتج
    isReturned: false,
    returnQty: 0
  }]
  
  // الأسعار التفصيلية
  currency: "YER",
  subtotal: 200000,                // المجموع الأصلي
  itemsDiscount: 40000,            // خصم المنتجات
  
  appliedCouponCode: "SUMMER20",   // الكوبون
  couponDiscount: 32000,           // خصمه
  couponDetails: {
    code: "SUMMER20",
    title: "خصم الصيف 20%",
    type: "percentage",
    discountPercentage: 20
  },
  
  autoAppliedCoupons: [{           // كوبونات تلقائية
    code: "WELCOME10",
    discount: 12800
  }],
  autoDiscountsTotal: 12800,
  
  shippingCost: 5000,              // الشحن
  shippingDiscount: 0,
  
  tax: 0,
  taxRate: 0,
  
  totalDiscount: 84800,            // الخصم الكلي
  total: 120200,                   // المجموع النهائي
  
  // الدفع
  paymentMethod: "COD",
  paymentProvider: null,
  paymentIntentId: null,
  paymentTransactionId: null,
  paidAt: Date,
  
  // الشحن
  shippingMethod: "standard",
  shippingCompany: "DHL",
  trackingNumber: "DHL123456789",
  trackingUrl: "https://dhl.com/track/...",
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  deliveredAt: Date,
  
  // الإرجاع والاسترداد
  isRefunded: false,
  refundAmount: 0,
  refundReason: null,
  refundedAt: null,
  refundedBy: null,
  
  isReturned: false,
  returnReason: null,
  returnedAt: null,
  returnItems: [],
  
  // الملاحظات
  customerNotes: "يرجى التوصيل صباحاً",
  adminNotes: "عميل VIP",
  internalNotes: "تحقق من المخزون",
  
  // الفواتير
  invoiceNumber: "INV-2024-00001",
  invoiceUrl: "https://...",
  receiptUrl: "https://...",
  
  // التقييم
  rating: 5,
  review: "خدمة ممتازة!",
  ratedAt: Date,
  
  // Metadata
  metadata: {
    cartId, campaign, referrer,
    utmSource, utmMedium, utmCampaign,
    deviceInfo, ipAddress, userAgent
  },
  
  // التواريخ
  confirmedAt: Date,
  processingStartedAt: Date,
  shippedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancelledBy: ObjectId,
  cancellationReason: string,
  
  createdAt: Date,
  updatedAt: Date
}
```

**الإحصائيات:**
- 🆕 **70+ حقل جديد**
- 🆕 **3 enums جديدة**
- 🆕 **12 indexes محسّنة**

---

## 🔄 دورة حياة الطلب الكاملة

```
1. DRAFT                         → طلب مسودة
   ↓
2. PENDING_PAYMENT               → في انتظار الدفع
   ↓
3. CONFIRMED                     → مؤكد ومدفوع ✅
   ↓
4. PROCESSING                    → قيد التجهيز
   ↓
5. READY_TO_SHIP                 → جاهز للشحن
   ↓
6. SHIPPED                       → تم الشحن 🚚
   ↓
7. OUT_FOR_DELIVERY              → في الطريق للتوصيل
   ↓
8. DELIVERED                     → تم التسليم ✅
   ↓
9. COMPLETED                     → مكتمل (بعد فترة)

حالات خاصة:
- ON_HOLD                        → معلق (مشكلة)
- CANCELLED                      → ملغي
- PAYMENT_FAILED                 → فشل الدفع
- REFUNDED                       → مسترد
- PARTIALLY_REFUNDED             → مسترد جزئياً
- RETURNED                       → مرتجع
```

---

## 📝 API Endpoints الاحترافية

### Customer Endpoints

#### 1. Preview Checkout
```http
POST /checkout/preview
Authorization: Bearer {token}

Body:
{
  "currency": "YER",
  "couponCode": "SUMMER20"  // optional
}

Response:
{
  "success": true,
  "data": {
    "items": [...],
    "pricing": {
      "subtotal": 200000,
      "itemsDiscount": 40000,
      "couponDiscount": 32000,
      "shippingCost": 5000,
      "total": 133000
    },
    "savings": 72000,
    "estimatedDelivery": "2024-01-20"
  }
}
```

---

#### 2. Confirm Order
```http
POST /checkout/confirm
Authorization: Bearer {token}

Body:
{
  "deliveryAddressId": "addr_123",
  "paymentMethod": "COD",
  "shippingMethod": "standard",
  "customerNotes": "يرجى التوصيل صباحاً",
  "currency": "YER"
}

Response:
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_456",
    "orderNumber": "ORD-2024-00001",
    "status": "confirmed",
    "total": 133000,
    "estimatedDelivery": "2024-01-20"
  }
}
```

---

#### 3. My Orders
```http
GET /orders?status=confirmed&page=1&limit=10
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "orderNumber": "ORD-2024-00001",
      "status": "shipped",
      "total": 133000,
      "itemsCount": 3,
      "createdAt": "2024-01-15",
      "estimatedDelivery": "2024-01-20",
      "trackingNumber": "DHL123456789"
    }
  ],
  "pagination": {...}
}
```

---

#### 4. Order Details
```http
GET /orders/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "orderNumber": "ORD-2024-00001",
    "status": "shipped",
    "statusHistory": [
      {
        "status": "confirmed",
        "changedAt": "2024-01-15T10:00:00Z",
        "notes": "تم تأكيد الطلب والدفع"
      },
      {
        "status": "processing",
        "changedAt": "2024-01-15T14:00:00Z",
        "notes": "بدأ التجهيز"
      },
      {
        "status": "shipped",
        "changedAt": "2024-01-16T09:00:00Z",
        "notes": "تم الشحن عبر DHL"
      }
    ],
    
    "deliveryAddress": {
      "recipientName": "أحمد محمد",
      "recipientPhone": "773123456",
      "line1": "شارع الستين",
      "city": "صنعاء",
      ...
    },
    
    "items": [
      {
        "productId": "...",
        "qty": 2,
        "basePrice": 100000,
        "discount": 20000,
        "finalPrice": 80000,
        "lineTotal": 160000,
        "snapshot": {
          "name": "iPhone 15 Pro",
          "brandName": "Apple",
          "image": "...",
          ...
        }
      }
    ],
    
    "pricing": {
      "subtotal": 200000,
      "itemsDiscount": 40000,
      "couponCode": "SUMMER20",
      "couponDiscount": 32000,
      "shippingCost": 5000,
      "total": 133000
    },
    
    "shipping": {
      "method": "standard",
      "company": "DHL",
      "trackingNumber": "DHL123456789",
      "trackingUrl": "https://...",
      "estimatedDelivery": "2024-01-20"
    },
    
    "payment": {
      "method": "COD",
      "status": "paid",
      "paidAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

---

#### 5. Track Order
```http
GET /orders/:id/track
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "orderNumber": "ORD-2024-00001",
    "currentStatus": "shipped",
    "trackingNumber": "DHL123456789",
    "trackingUrl": "https://dhl.com/track/...",
    "estimatedDelivery": "2024-01-20",
    
    "timeline": [
      {
        "status": "confirmed",
        "title": "تم تأكيد الطلب",
        "description": "تم استلام طلبك بنجاح",
        "timestamp": "2024-01-15 10:00",
        "completed": true
      },
      {
        "status": "processing",
        "title": "قيد التجهيز",
        "description": "جاري تجهيز طلبك",
        "timestamp": "2024-01-15 14:00",
        "completed": true
      },
      {
        "status": "shipped",
        "title": "تم الشحن",
        "description": "طلبك في الطريق إليك",
        "timestamp": "2024-01-16 09:00",
        "completed": true
      },
      {
        "status": "out_for_delivery",
        "title": "جاري التوصيل",
        "description": "سيصلك اليوم",
        "timestamp": null,
        "completed": false
      },
      {
        "status": "delivered",
        "title": "تم التسليم",
        "description": "استلمت طلبك بنجاح",
        "timestamp": null,
        "completed": false
      }
    ]
  }
}
```

---

#### 6. Cancel Order
```http
POST /orders/:id/cancel
Authorization: Bearer {token}

Body:
{
  "reason": "تغيير رأيي في المنتج"
}

Response:
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "status": "cancelled",
    "refundAmount": 133000,
    "refundMethod": "wallet",
    "refundETA": "3-5 business days"
  }
}

Rules:
  ✅ يمكن الإلغاء في: confirmed, processing
  ❌ لا يمكن الإلغاء في: shipped, delivered
```

---

#### 7. Request Return
```http
POST /orders/:id/return
Authorization: Bearer {token}

Body:
{
  "items": [
    {
      "variantId": "var_123",
      "qty": 1,
      "reason": "المنتج لا يعمل بشكل صحيح"
    }
  ],
  "returnReason": "عطل في المنتج"
}

Response:
{
  "success": true,
  "message": "Return request submitted successfully",
  "data": {
    "returnRequestId": "ret_789",
    "status": "pending_approval",
    "items": [...],
    "refundAmount": 80000
  }
}

Rules:
  ✅ يمكن الإرجاع خلال 14 يوم من التسليم
  ✅ يجب أن يكون status = delivered أو completed
```

---

#### 8. Rate Order
```http
POST /orders/:id/rate
Authorization: Bearer {token}

Body:
{
  "rating": 5,
  "review": "خدمة ممتازة والمنتج وصل بحالة ممتازة!"
}

Response:
{
  "success": true,
  "message": "Thank you for your feedback!",
  "data": {
    "rating": 5,
    "review": "..."
  }
}
```

---

### Admin Endpoints

#### 1. List All Orders
```http
GET /admin/orders?status=processing&page=1&limit=20&search=ORD-2024
Authorization: Bearer {admin_token}

Query Parameters:
  - page, limit (pagination)
  - status (filter by status)
  - paymentStatus (filter by payment)
  - search (order number, customer name)
  - dateFrom, dateTo (date range)
  - minAmount, maxAmount (price range)
  - city (filter by city)
  - shippingMethod
  - sortBy, sortOrder

Response:
{
  "success": true,
  "data": [...orders],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "summary": {
    "totalValue": 15000000,
    "avgOrderValue": 100000
  }
}
```

---

#### 2. Update Order Status
```http
PATCH /admin/orders/:id/status
Authorization: Bearer {admin_token}

Body:
{
  "status": "processing",
  "notes": "تم البدء بتجهيز الطلب"
}

Response:
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "order": {...},
    "statusHistory": [...]
  }
}
```

---

#### 3. Ship Order
```http
POST /admin/orders/:id/ship
Authorization: Bearer {admin_token}

Body:
{
  "shippingCompany": "DHL",
  "trackingNumber": "DHL123456789",
  "estimatedDelivery": "2024-01-20",
  "notes": "تم الشحن بنجاح"
}

Response:
{
  "success": true,
  "message": "Order shipped successfully. Customer notified.",
  "data": {
    "status": "shipped",
    "trackingNumber": "DHL123456789",
    "trackingUrl": "https://...",
    "estimatedDelivery": "2024-01-20"
  }
}

Actions:
  ✅ Updates status to 'shipped'
  ✅ Adds tracking info
  ✅ Sends SMS/Email to customer with tracking
```

---

#### 4. Process Refund
```http
POST /admin/orders/:id/refund
Authorization: Bearer {admin_token}

Body:
{
  "amount": 80000,
  "reason": "عطل في المنتج",
  "refundMethod": "original",
  "items": [
    { "variantId": "var_123", "qty": 1 }
  ]
}

Response:
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "refundAmount": 80000,
    "refundMethod": "original",
    "refundStatus": "processing",
    "estimatedRefundDate": "2024-01-25"
  }
}

Actions:
  ✅ Updates order status
  ✅ Processes refund
  ✅ Restores inventory
  ✅ Notifies customer
```

---

#### 5. Add Admin Notes
```http
POST /admin/orders/:id/notes
Authorization: Bearer {admin_token}

Body:
{
  "adminNotes": "العميل طلب تغيير موعد التوصيل",
  "internalNotes": "تحقق من المخزون قبل الشحن"
}
```

---

#### 6. Get Order Analytics
```http
GET /admin/orders/analytics?period=7d
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "data": {
    "period": "Last 7 days",
    
    "summary": {
      "totalOrders": 245,
      "totalRevenue": 24500000,
      "avgOrderValue": 100000,
      "completedOrders": 180,
      "cancelledOrders": 15,
      "refundedOrders": 5
    },
    
    "byStatus": {
      "confirmed": 50,
      "processing": 35,
      "shipped": 80,
      "delivered": 180,
      "cancelled": 15
    },
    
    "byPaymentMethod": {
      "COD": 200,
      "ONLINE": 45
    },
    
    "byCity": {
      "صنعاء": 150,
      "عدن": 50,
      "تعز": 30
    },
    
    "conversionRate": "73.47%",
    "cancelRate": "6.12%",
    "returnRate": "2.04%",
    
    "topProducts": [
      { "name": "iPhone 15 Pro", "count": 45, "revenue": 4500000 }
    ],
    
    "dailyRevenue": [
      { "date": "2024-01-15", "orders": 35, "revenue": 3500000 }
    ]
  }
}
```

---

#### 7. Export Orders
```http
GET /admin/orders/export?format=csv&status=delivered&dateFrom=2024-01-01
Authorization: Bearer {admin_token}

Response: CSV/Excel file download
```

---

## 💻 Frontend Examples

### مثال 1: Checkout Page

```jsx
// CheckoutPage.jsx
import React, { useEffect, useState } from 'react';
import { useCart } from './CartContext';

function CheckoutPage() {
  const { cart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [customerNotes, setCustomerNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const token = getToken();

    // 1. Load addresses
    const addrsRes = await fetch('/addresses/active', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const addrsData = await addrsRes.json();
    setAddresses(addrsData.data);

    // Auto-select default
    const defaultAddr = addrsData.data.find(a => a.isDefault);
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr._id);
    }

    // 2. Load checkout preview
    const previewRes = await fetch('/checkout/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currency: 'YER',
        couponCode: cart.appliedCouponCode
      }),
    });
    const previewData = await previewRes.json();
    setPreview(previewData.data);
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      alert('⚠️ يرجى اختيار عنوان التوصيل');
      return;
    }

    try {
      const token = getToken();

      const res = await fetch('/checkout/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deliveryAddressId: selectedAddressId,
          paymentMethod,
          shippingMethod,
          customerNotes,
          currency: 'YER',
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ تم إنشاء الطلب بنجاح!\nرقم الطلب: ${data.data.orderNumber}`);
        window.location.href = `/orders/${data.data.orderId}`;
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      alert('❌ حدث خطأ في إنشاء الطلب');
      console.error(error);
    }
  }

  if (!preview) return <div>جاري التحميل...</div>;

  return (
    <div className="checkout-page">
      <h1>إتمام الطلب</h1>

      {/* Address Selection */}
      <section className="delivery-address">
        <h2>عنوان التوصيل</h2>
        {/* ... address selection UI ... */}
      </section>

      {/* Shipping Method */}
      <section className="shipping-method">
        <h2>طريقة الشحن</h2>
        <div className="shipping-options">
          <label className={shippingMethod === 'standard' ? 'selected' : ''}>
            <input
              type="radio"
              name="shipping"
              value="standard"
              checked={shippingMethod === 'standard'}
              onChange={(e) => setShippingMethod(e.target.value)}
            />
            <div>
              <strong>شحن عادي (3-5 أيام)</strong>
              <span>مجاني</span>
            </div>
          </label>

          <label className={shippingMethod === 'express' ? 'selected' : ''}>
            <input
              type="radio"
              name="shipping"
              value="express"
              checked={shippingMethod === 'express'}
              onChange={(e) => setShippingMethod(e.target.value)}
            />
            <div>
              <strong>شحن سريع (1-2 يوم)</strong>
              <span>10,000 YER</span>
            </div>
          </label>
        </div>
      </section>

      {/* Payment Method */}
      <section className="payment-method">
        <h2>طريقة الدفع</h2>
        <div className="payment-options">
          <label className={paymentMethod === 'COD' ? 'selected' : ''}>
            <input
              type="radio"
              name="payment"
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div>
              <strong>الدفع عند الاستلام</strong>
              <span>ادفع نقداً عند استلام الطلب</span>
            </div>
          </label>

          <label className={paymentMethod === 'ONLINE' ? 'selected' : ''}>
            <input
              type="radio"
              name="payment"
              value="ONLINE"
              checked={paymentMethod === 'ONLINE'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div>
              <strong>الدفع الإلكتروني</strong>
              <span>بطاقة ائتمان أو محفظة إلكترونية</span>
            </div>
          </label>
        </div>
      </section>

      {/* Customer Notes */}
      <section className="customer-notes">
        <h2>ملاحظات (اختياري)</h2>
        <textarea
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          placeholder="أي ملاحظات أو تعليمات خاصة بالتوصيل..."
          rows={3}
        />
      </section>

      {/* Order Summary */}
      <section className="order-summary">
        <h2>ملخص الطلب</h2>

        <div className="summary-row">
          <span>المجموع الفرعي:</span>
          <span>{preview.pricing.subtotal.toLocaleString()} YER</span>
        </div>

        {preview.pricing.itemsDiscount > 0 && (
          <div className="summary-row discount">
            <span>خصم المنتجات:</span>
            <span>-{preview.pricing.itemsDiscount.toLocaleString()} YER</span>
          </div>
        )}

        {preview.pricing.couponDiscount > 0 && (
          <div className="summary-row discount">
            <span>خصم الكوبون:</span>
            <span>-{preview.pricing.couponDiscount.toLocaleString()} YER</span>
          </div>
        )}

        {preview.pricing.shippingCost > 0 && (
          <div className="summary-row">
            <span>الشحن:</span>
            <span>{preview.pricing.shippingCost.toLocaleString()} YER</span>
          </div>
        )}

        <div className="summary-row total">
          <span>المجموع الكلي:</span>
          <span>{preview.pricing.total.toLocaleString()} YER</span>
        </div>

        {preview.savings > 0 && (
          <div className="savings-badge">
            🎉 وفرت {preview.savings.toLocaleString()} YER!
          </div>
        )}
      </section>

      {/* Place Order Button */}
      <button
        className="place-order-btn"
        onClick={handlePlaceOrder}
        disabled={!selectedAddressId}
      >
        تأكيد الطلب
      </button>
    </div>
  );
}
```

---

**النظام شامل! سأكمل بإنشاء CheckoutService الاحترافي...**


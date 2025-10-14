# أمثلة التكامل الكاملة - نظام العناوين
# Complete Integration Examples - Addresses System

## 🎯 كيفية التكامل مع Checkout و Services

---

## 1️⃣ تحديث Checkout Module

### الخطوة 1: Import AddressesModule

```typescript
// backend/src/modules/checkout/checkout.module.ts

import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [
    MongooseModule.forFeature([...]),
    AddressesModule,  // ✅ Import
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
```

---

### الخطوة 2: Update Checkout DTO

```typescript
// backend/src/modules/checkout/dto/checkout.dto.ts

import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: '65abc123def456789' })
  @IsString()
  cartId!: string;

  @ApiProperty({ 
    example: '65xyz789abc123456',
    description: 'ID of address to use for delivery'
  })
  @IsString()
  deliveryAddressId!: string;  // ✅ العنوان المختار

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}
```

---

### الخطوة 3: Update Order Schema

```typescript
// backend/src/modules/checkout/schemas/order.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: [Object], required: true })
  items!: Array<any>;

  @Prop({ required: true })
  subtotal!: number;

  @Prop({ default: 0 })
  discount!: number;

  @Prop({ default: 0 })
  shippingCost!: number;

  @Prop({ required: true })
  total!: number;

  // 🆕 Delivery Address (حفظ كامل العنوان في الطلب)
  @Prop({ type: Object, required: true })
  deliveryAddress!: {
    addressId: Types.ObjectId;      // للإشارة للعنوان الأصلي
    recipientName: string;
    recipientPhone: string;
    line1: string;
    line2?: string;
    city: string;
    region?: string;
    country: string;
    postalCode?: string;
    coords?: { lat: number; lng: number };
    notes?: string;
  };

  @Prop({ default: 'pending' })
  status!: string;

  @Prop()
  paymentMethod?: string;

  // ... other fields
}

export const OrderSchema = SchemaFactory.createForClass(Order);
```

---

### الخطوة 4: Update Checkout Service

```typescript
// backend/src/modules/checkout/checkout.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schemas/order.schema';
import { Cart } from '../cart/schemas/cart.schema';
import { AddressesService } from '../addresses/addresses.service';
import { AppException } from '../../shared/exceptions/app.exception';
import { CreateOrderDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private addressesService: AddressesService,  // ✅ Inject AddressesService
  ) {}

  async createOrder(dto: CreateOrderDto, userId: string) {
    try {
      // 1. Validate address ownership
      const isValidAddress = await this.addressesService.validateAddressOwnership(
        dto.deliveryAddressId,
        userId,
      );

      if (!isValidAddress) {
        throw new AppException(
          'العنوان المحدد غير صحيح أو لا ينتمي لك',
          400,
        );
      }

      // 2. Get full address details
      const deliveryAddress = await this.addressesService.getAddressById(
        dto.deliveryAddressId,
      );

      // 3. Get cart
      const cart = await this.cartModel.findOne({
        _id: dto.cartId,
        userId: new Types.ObjectId(userId),
      });

      if (!cart) {
        throw new AppException('السلة غير موجودة', 404);
      }

      if (!cart.items || cart.items.length === 0) {
        throw new AppException('السلة فارغة', 400);
      }

      // 4. Calculate totals (مع الكوبونات إن وُجدت)
      const subtotal = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const discount = cart.couponDiscount || 0;
      const shippingCost = 0; // يمكن حسابه حسب المدينة
      const total = subtotal - discount + shippingCost;

      // 5. Create order with full address details
      const order = new this.orderModel({
        userId: new Types.ObjectId(userId),
        items: cart.items,
        subtotal,
        discount,
        shippingCost,
        total,

        // 🆕 حفظ العنوان كاملاً في الطلب
        deliveryAddress: {
          addressId: deliveryAddress._id,
          recipientName: deliveryAddress.recipientName,
          recipientPhone: deliveryAddress.recipientPhone,
          line1: deliveryAddress.line1,
          line2: deliveryAddress.line2,
          city: deliveryAddress.city,
          region: deliveryAddress.region,
          country: deliveryAddress.country,
          postalCode: deliveryAddress.postalCode,
          coords: deliveryAddress.coords,
          notes: deliveryAddress.notes,
        },

        paymentMethod: dto.paymentMethod || 'cash_on_delivery',
        specialInstructions: dto.specialInstructions,
        status: 'pending',
        
        // Coupon details if applied
        appliedCouponCode: cart.appliedCouponCode,
        couponDiscount: cart.couponDiscount,
      });

      await order.save();

      // 6. Mark address as used
      await this.addressesService.markAsUsed(dto.deliveryAddressId, userId);

      // 7. Clear cart
      await this.cartModel.deleteOne({ _id: cart._id });

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Get user's orders
  async getUserOrders(userId: string) {
    return await this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  // Get order details
  async getOrderDetails(orderId: string, userId: string) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      userId: new Types.ObjectId(userId),
    });

    if (!order) {
      throw new AppException('الطلب غير موجود', 404);
    }

    return order;
  }
}
```

---

## 2️⃣ تحديث Services Module

### الخطوة 1: Import AddressesModule

```typescript
// backend/src/modules/services/services.module.ts

import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [
    MongooseModule.forFeature([...]),
    AddressesModule,  // ✅ Import
  ],
  controllers: [...],
  providers: [ServicesService],
})
export class ServicesModule {}
```

---

### الخطوة 2: Update Service Request DTO

```typescript
// backend/src/modules/services/dto/requests.dto.ts

import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceRequestDto {
  @ApiProperty({ example: 'installation' })
  @IsString()
  serviceType!: string;

  @ApiProperty({ 
    example: '65xyz789abc123456',
    description: 'ID of address where service is needed'
  })
  @IsString()
  serviceAddressId!: string;  // ✅ العنوان المختار

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  preferredDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  urgency?: 'low' | 'medium' | 'high';
}
```

---

### الخطوة 3: Update ServiceRequest Schema

```typescript
// backend/src/modules/services/schemas/service-request.schema.ts

@Schema({ timestamps: true })
export class ServiceRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId!: Types.ObjectId;

  @Prop({ required: true })
  serviceType!: string;

  // 🆕 Service Address (حفظ كامل العنوان في الطلب)
  @Prop({ type: Object, required: true })
  serviceAddress!: {
    addressId: Types.ObjectId;
    recipientName: string;
    recipientPhone: string;
    line1: string;
    line2?: string;
    city: string;
    region?: string;
    country: string;
    coords?: { lat: number; lng: number };
    notes?: string;
  };

  @Prop()
  preferredDate?: Date;

  @Prop()
  description?: string;

  @Prop({ default: 'pending' })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedEngineerId?: Types.ObjectId;

  // ... other fields
}

export const ServiceRequestSchema = SchemaFactory.createForClass(ServiceRequest);
```

---

### الخطوة 4: Update Services Service

```typescript
// backend/src/modules/services/services.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ServiceRequest } from './schemas/service-request.schema';
import { AddressesService } from '../addresses/addresses.service';
import { AppException } from '../../shared/exceptions/app.exception';
import { CreateServiceRequestDto } from './dto/requests.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceRequest.name) private serviceRequestModel: Model<ServiceRequest>,
    private addressesService: AddressesService,  // ✅ Inject
  ) {}

  async createServiceRequest(dto: CreateServiceRequestDto, userId: string) {
    try {
      // 1. Validate address ownership
      const isValidAddress = await this.addressesService.validateAddressOwnership(
        dto.serviceAddressId,
        userId,
      );

      if (!isValidAddress) {
        throw new AppException(
          'العنوان المحدد غير صحيح أو لا ينتمي لك',
          400,
        );
      }

      // 2. Get full address details
      const serviceAddress = await this.addressesService.getAddressById(
        dto.serviceAddressId,
      );

      // 3. Create service request
      const serviceRequest = new this.serviceRequestModel({
        customerId: new Types.ObjectId(userId),
        serviceType: dto.serviceType,

        // 🆕 حفظ العنوان كاملاً في طلب الخدمة
        serviceAddress: {
          addressId: serviceAddress._id,
          recipientName: serviceAddress.recipientName,
          recipientPhone: serviceAddress.recipientPhone,
          line1: serviceAddress.line1,
          line2: serviceAddress.line2,
          city: serviceAddress.city,
          region: serviceAddress.region,
          country: serviceAddress.country,
          coords: serviceAddress.coords,
          notes: serviceAddress.notes,
        },

        preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : undefined,
        description: dto.description,
        status: 'pending',
      });

      await serviceRequest.save();

      // 4. Mark address as used
      await this.addressesService.markAsUsed(dto.serviceAddressId, userId);

      return serviceRequest;
    } catch (error) {
      throw error;
    }
  }

  // Get customer's service requests
  async getCustomerRequests(userId: string) {
    return await this.serviceRequestModel
      .find({ customerId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  // Get service request details
  async getRequestDetails(requestId: string, userId: string) {
    const request = await this.serviceRequestModel.findOne({
      _id: requestId,
      customerId: new Types.ObjectId(userId),
    });

    if (!request) {
      throw new AppException('طلب الخدمة غير موجود', 404);
    }

    return request;
  }
}
```

---

## 📱 Frontend Examples - التكامل الكامل

### مثال 1: Checkout - اختيار العنوان

```jsx
// CheckoutPage.jsx - Full Example
import React, { useEffect, useState } from 'react';

function CheckoutPage({ cartId }) {
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  async function loadCheckoutData() {
    const token = localStorage.getItem('token');

    // 1. Load cart
    const cartRes = await fetch(`/cart/${cartId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const cartData = await cartRes.json();
    setCart(cartData.data);

    // 2. Load addresses
    const addressesRes = await fetch('/addresses/active', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const addressesData = await addressesRes.json();
    setAddresses(addressesData.data);

    // 3. Auto-select default address
    const defaultAddr = addressesData.data.find(a => a.isDefault);
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr._id);
    } else if (addressesData.data.length > 0) {
      setSelectedAddressId(addressesData.data[0]._id);
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      alert('⚠️ يرجى اختيار عنوان التوصيل');
      return;
    }

    if (addresses.length === 0) {
      alert('⚠️ يرجى إضافة عنوان أولاً');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cartId,
          deliveryAddressId: selectedAddressId,  // ✅ العنوان المختار
          paymentMethod: 'cash_on_delivery',
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ تم إنشاء الطلب بنجاح!');
        window.location.href = `/orders/${data.data._id}`;
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      alert('❌ حدث خطأ في إنشاء الطلب');
      console.error(error);
    }
  }

  if (!cart) return <div>جاري التحميل...</div>;

  return (
    <div className="checkout-page">
      <h1>إتمام الطلب</h1>

      {/* Address Selection Section */}
      <section className="delivery-address-section">
        <h2>عنوان التوصيل</h2>

        {addresses.length === 0 ? (
          <div className="no-addresses-warning">
            <p>⚠️ لا توجد عناوين محفوظة</p>
            <button onClick={() => setShowAddAddressForm(true)}>
              + إضافة عنوان الآن
            </button>
          </div>
        ) : (
          <>
            <div className="addresses-selection">
              {addresses.map(address => (
                <div
                  key={address._id}
                  className={`address-card ${selectedAddressId === address._id ? 'selected' : ''}`}
                  onClick={() => setSelectedAddressId(address._id)}
                >
                  <div className="radio-wrapper">
                    <input
                      type="radio"
                      name="delivery-address"
                      checked={selectedAddressId === address._id}
                      onChange={() => setSelectedAddressId(address._id)}
                    />
                  </div>

                  <div className="address-info">
                    <div className="header">
                      <strong>{address.label}</strong>
                      {address.isDefault && (
                        <span className="default-badge">افتراضي</span>
                      )}
                    </div>

                    <div className="recipient">
                      📞 {address.recipientName} - {address.recipientPhone}
                    </div>

                    <div className="location">
                      📍 {address.line1}
                      {address.line2 && <>, {address.line2}</>}
                      <br />
                      {address.city}, {address.region}
                    </div>

                    {address.notes && (
                      <div className="delivery-notes">
                        💬 {address.notes}
                      </div>
                    )}

                    {address.usageCount > 0 && (
                      <div className="usage-badge">
                        استخدم {address.usageCount} {address.usageCount === 1 ? 'مرة' : 'مرات'}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                className="add-new-address-btn"
                onClick={() => setShowAddAddressForm(true)}
              >
                + إضافة عنوان جديد
              </button>
            </div>
          </>
        )}
      </section>

      {/* Order Summary */}
      <section className="order-summary">
        <h2>ملخص الطلب</h2>

        <div className="items">
          <h3>المنتجات ({cart.cart.items.length})</h3>
          {cart.cart.items.map((item, idx) => (
            <div key={idx} className="item">
              <span>{item.productName}</span>
              <span>{item.quantity} × {item.price.toLocaleString()} YER</span>
            </div>
          ))}
        </div>

        <div className="totals">
          <div className="row">
            <span>المجموع الفرعي:</span>
            <span>{cart.subtotal.toLocaleString()} YER</span>
          </div>

          {cart.couponDiscount > 0 && (
            <div className="row discount">
              <span>الخصم:</span>
              <span>-{cart.couponDiscount.toLocaleString()} YER</span>
            </div>
          )}

          <div className="row total">
            <span>المجموع الكلي:</span>
            <span>{cart.total.toLocaleString()} YER</span>
          </div>
        </div>
      </section>

      {/* Place Order Button */}
      <button
        className="place-order-btn"
        onClick={handlePlaceOrder}
        disabled={!selectedAddressId || addresses.length === 0}
      >
        {addresses.length === 0 
          ? 'أضف عنوان أولاً' 
          : 'تأكيد الطلب والدفع عند الاستلام'}
      </button>

      {/* Add Address Form Modal */}
      {showAddAddressForm && (
        <AddAddressFormModal
          onClose={() => setShowAddAddressForm(false)}
          onSuccess={() => {
            setShowAddAddressForm(false);
            loadCheckoutData();
          }}
        />
      )}
    </div>
  );
}
```

---

### مثال 2: طلب خدمة مهندس مع العنوان

```jsx
// RequestServicePage.jsx
import React, { useEffect, useState } from 'react';

function RequestServicePage() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [serviceType, setServiceType] = useState('installation');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    const token = localStorage.getItem('token');

    const res = await fetch('/addresses/active', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setAddresses(data.data);

    // Auto-select default
    const defaultAddr = data.data.find(a => a.isDefault);
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr._id);
    }
  }

  async function submitRequest() {
    if (!selectedAddressId) {
      alert('⚠️ يرجى اختيار موقع الخدمة');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('/services/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceType,
          serviceAddressId: selectedAddressId,  // ✅ العنوان المختار
          preferredDate,
          description,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ تم إرسال طلب الخدمة بنجاح!');
        window.location.href = `/service-requests/${data.data._id}`;
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      alert('❌ حدث خطأ');
      console.error(error);
    }
  }

  return (
    <div className="request-service-page">
      <h1>طلب خدمة مهندس</h1>

      {/* Service Type */}
      <div className="form-group">
        <label>نوع الخدمة</label>
        <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
          <option value="installation">تركيب</option>
          <option value="maintenance">صيانة</option>
          <option value="repair">إصلاح</option>
          <option value="consultation">استشارة</option>
        </select>
      </div>

      {/* Address Selection */}
      <div className="form-group">
        <label>اختر موقع الخدمة *</label>

        {addresses.length === 0 ? (
          <div className="no-addresses">
            <p>لا توجد عناوين محفوظة</p>
            <button onClick={() => window.location.href = '/addresses/new'}>
              + إضافة عنوان
            </button>
          </div>
        ) : (
          <div className="addresses-selection">
            {addresses.map(address => (
              <label
                key={address._id}
                className={`address-option ${selectedAddressId === address._id ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="service-address"
                  value={address._id}
                  checked={selectedAddressId === address._id}
                  onChange={() => setSelectedAddressId(address._id)}
                />

                <div className="address-details">
                  <div className="label">
                    {address.label}
                    {address.isDefault && <span className="badge">افتراضي</span>}
                  </div>

                  <div className="recipient">
                    {address.recipientName} - {address.recipientPhone}
                  </div>

                  <div className="location">
                    {address.line1}, {address.city}
                  </div>
                </div>
              </label>
            ))}

            <button 
              className="add-address-btn"
              onClick={() => window.location.href = '/addresses/new?returnTo=request-service'}
            >
              + إضافة عنوان جديد
            </button>
          </div>
        )}
      </div>

      {/* Preferred Date */}
      <div className="form-group">
        <label>التاريخ المفضل (اختياري)</label>
        <input
          type="date"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Description */}
      <div className="form-group">
        <label>وصف المشكلة/الخدمة المطلوبة</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="اشرح المشكلة أو الخدمة المطلوبة بالتفصيل..."
          rows={5}
        />
      </div>

      {/* Submit Button */}
      <button
        className="submit-btn"
        onClick={submitRequest}
        disabled={!selectedAddressId}
      >
        {selectedAddressId ? 'إرسال الطلب' : 'اختر عنوان الخدمة أولاً'}
      </button>
    </div>
  );
}
```

---

### مثال 3: عرض تفاصيل الطلب مع العنوان

```jsx
// OrderDetailsPage.jsx
function OrderDetailsPage({ orderId }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    const token = localStorage.getItem('token');

    const res = await fetch(`/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setOrder(data.data);
  }

  if (!order) return <div>جاري التحميل...</div>;

  return (
    <div className="order-details-page">
      <h1>تفاصيل الطلب</h1>

      <div className="order-info">
        <div className="order-id">رقم الطلب: #{order._id}</div>
        <div className="order-status">
          الحالة: <span className={`status-${order.status}`}>{order.status}</span>
        </div>
      </div>

      {/* Delivery Address - Full Display */}
      <section className="delivery-address-card">
        <h2>📦 عنوان التوصيل</h2>

        <div className="address-content">
          <div className="recipient-info">
            <div className="name">
              <strong>{order.deliveryAddress.recipientName}</strong>
            </div>
            <div className="phone">
              📞 {order.deliveryAddress.recipientPhone}
            </div>
          </div>

          <div className="location-info">
            <div className="street">
              📍 {order.deliveryAddress.line1}
            </div>
            {order.deliveryAddress.line2 && (
              <div className="details">
                {order.deliveryAddress.line2}
              </div>
            )}
            <div className="city-region">
              {order.deliveryAddress.city}
              {order.deliveryAddress.region && `, ${order.deliveryAddress.region}`}
            </div>
            <div className="country">
              {order.deliveryAddress.country}
            </div>
          </div>

          {order.deliveryAddress.notes && (
            <div className="delivery-notes">
              <strong>ملاحظات التوصيل:</strong>
              <p>{order.deliveryAddress.notes}</p>
            </div>
          )}

          {order.deliveryAddress.coords && (
            <a
              href={`https://www.google.com/maps?q=${order.deliveryAddress.coords.lat},${order.deliveryAddress.coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="view-on-map-btn"
            >
              🗺️ عرض على الخريطة
            </a>
          )}
        </div>
      </section>

      {/* Order Items */}
      <section className="order-items">
        <h2>المنتجات</h2>
        {order.items.map((item, idx) => (
          <div key={idx} className="order-item">
            <span>{item.productName}</span>
            <span>{item.quantity} × {item.price.toLocaleString()} YER</span>
            <span>{(item.quantity * item.price).toLocaleString()} YER</span>
          </div>
        ))}
      </section>

      {/* Order Summary */}
      <section className="order-summary">
        <div className="row">
          <span>المجموع الفرعي:</span>
          <span>{order.subtotal.toLocaleString()} YER</span>
        </div>
        {order.discount > 0 && (
          <div className="row discount">
            <span>الخصم:</span>
            <span>-{order.discount.toLocaleString()} YER</span>
          </div>
        )}
        <div className="row total">
          <span>المجموع الكلي:</span>
          <span>{order.total.toLocaleString()} YER</span>
        </div>
      </section>
    </div>
  );
}
```

---

## 🎨 CSS Styles

```css
/* Address Selection Styles */
.addresses-selection {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
}

.address-card {
  display: flex;
  gap: 15px;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.address-card:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.address-card.selected {
  border-color: #4CAF50;
  background: #f0f8f0;
}

.address-info {
  flex: 1;
}

.address-info .header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.default-badge {
  background: #FF9800;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.recipient {
  color: #555;
  margin-bottom: 5px;
}

.location {
  color: #777;
  line-height: 1.5;
}

.delivery-notes {
  margin-top: 10px;
  padding: 10px;
  background: #fff3cd;
  border-radius: 5px;
  font-size: 14px;
}

.usage-badge {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}

.add-new-address-btn {
  padding: 15px;
  border: 2px dashed #4CAF50;
  background: white;
  color: #4CAF50;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}

.add-new-address-btn:hover {
  background: #f0f8f0;
}

/* No Addresses Warning */
.no-addresses-warning {
  padding: 30px;
  text-align: center;
  border: 2px dashed #ff9800;
  border-radius: 10px;
  background: #fff8e1;
}

.no-addresses-warning button {
  margin-top: 15px;
  padding: 12px 30px;
  background: #FF9800;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
```

---

## ✅ خطوات التطبيق النهائية

### في Checkout Module:
```typescript
// 1. checkout.module.ts
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [AddressesModule],  // ✅
})

// 2. checkout.service.ts
constructor(
  private addressesService: AddressesService,  // ✅
) {}

// 3. checkout.dto.ts
deliveryAddressId: string  // ✅

// 4. order.schema.ts
deliveryAddress: { ... }  // ✅
```

### في Services Module:
```typescript
// 1. services.module.ts
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [AddressesModule],  // ✅
})

// 2. services.service.ts
constructor(
  private addressesService: AddressesService,  // ✅
) {}

// 3. requests.dto.ts
serviceAddressId: string  // ✅

// 4. service-request.schema.ts
serviceAddress: { ... }  // ✅
```

---

**النظام كامل وجاهز! 🚀**


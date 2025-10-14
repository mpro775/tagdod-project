# نظام العناوين الاحترافي الكامل
# Complete Professional Addresses System

## ✅ تم التحديث بنجاح!

تم تحسين نظام العناوين ليصبح احترافي وكامل مع جميع المميزات المطلوبة.

---

## 🎯 المميزات الجديدة

### 1. **حقول احترافية إضافية** ✅

```typescript
Address {
  // معلومات أساسية
  label: string                 // تسمية (المنزل، المكتب، عند أمي)
  addressType: AddressType      // home/work/other
  
  // 🆕 معلومات المستلم
  recipientName: string         // اسم المستلم (مطلوب)
  recipientPhone: string        // رقم المستلم (مطلوب)
  
  // تفاصيل العنوان
  line1: string                 // العنوان الرئيسي (مطلوب)
  line2?: string                // تفاصيل إضافية
  city: string                  // المدينة (مطلوب)
  region?: string               // المنطقة/الحي
  country: string               // الدولة (افتراضي: Yemen)
  postalCode?: string           // الرمز البريدي
  
  // موقع جغرافي
  coords?: { lat, lng }         // الإحداثيات
  placeId?: string              // Google PlaceId
  
  // ملاحظات
  notes?: string                // تعليمات التسليم
  
  // 🆕 حالة العنوان
  isDefault: boolean            // العنوان الافتراضي
  isActive: boolean             // فعّال/غير فعّال
  
  // 🆕 Soft Delete
  deletedAt?: Date              // تاريخ الحذف
  deletedBy?: ObjectId          // من حذفه
  
  // 🆕 تتبع الاستخدام
  lastUsedAt?: Date             // آخر استخدام
  usageCount: number            // عدد مرات الاستخدام
}
```

---

## 📊 API Endpoints

### User Endpoints (محمية - تتطلب JWT)

#### 1. Get All Addresses
```http
GET /addresses
Authorization: Bearer {token}

Query Parameters:
  includeDeleted: boolean (optional)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "addr_123",
      "label": "المنزل",
      "addressType": "home",
      "recipientName": "أحمد محمد",
      "recipientPhone": "773123456",
      "line1": "شارع الستين، بجوار مطعم السلطان",
      "line2": "الدور الثالث، شقة 12",
      "city": "صنعاء",
      "region": "حي السبعين",
      "country": "Yemen",
      "isDefault": true,
      "isActive": true,
      "usageCount": 5,
      "lastUsedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 3
}
```

#### 2. Get Active Addresses Only
```http
GET /addresses/active
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [...addresses],
  "count": 2
}
```

#### 3. Get Default Address
```http
GET /addresses/default
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "_id": "addr_123",
    "label": "المنزل",
    "isDefault": true,
    ...
  }
}
```

#### 4. Get Address by ID
```http
GET /addresses/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {...address}
}
```

#### 5. Create New Address
```http
POST /addresses
Authorization: Bearer {token}

Body:
{
  "label": "المكتب",
  "addressType": "work",
  "recipientName": "أحمد محمد",
  "recipientPhone": "773123456",
  "line1": "شارع التحرير، مبنى التجارة",
  "line2": "الدور الخامس، مكتب 501",
  "city": "صنعاء",
  "region": "المدينة",
  "country": "Yemen",
  "notes": "الدخول من البوابة الخلفية",
  "isDefault": false
}

Response:
{
  "success": true,
  "message": "Address created successfully",
  "data": {...created address}
}

Note: 
  - إذا كان أول عنوان، سيصبح افتراضياً تلقائياً
  - إذا كان isDefault=true، العناوين الأخرى ستصبح غير افتراضية
```

#### 6. Update Address
```http
PATCH /addresses/:id
Authorization: Bearer {token}

Body:
{
  "recipientPhone": "771999888",
  "notes": "تعليمات جديدة"
}

Response:
{
  "success": true,
  "message": "Address updated successfully",
  "data": {...updated address}
}
```

#### 7. Delete Address
```http
DELETE /addresses/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Address deleted successfully",
  "data": { "deleted": true }
}

Notes:
  - Soft delete (يحفظ في قاعدة البيانات)
  - لا يمكن حذف العنوان الوحيد
  - إذا كان افتراضي، يصبح عنوان آخر افتراضي تلقائياً
```

#### 8. Set as Default
```http
POST /addresses/:id/set-default
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Default address set successfully",
  "data": {...address}
}
```

#### 9. Restore Deleted Address
```http
POST /addresses/:id/restore
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Address restored successfully",
  "data": {...address}
}
```

#### 10. Validate Address Ownership
```http
GET /addresses/validate/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": { "valid": true }
}
```

---

## 🔄 التكامل مع Checkout (طلب منتجات)

### Checkout DTO Update

```typescript
// backend/src/modules/checkout/dto/checkout.dto.ts

export class CreateOrderDto {
  @IsString()
  cartId!: string;
  
  // 🆕 Address Selection
  @IsString()
  @ApiProperty({ 
    example: '65abc123def456789',
    description: 'Address ID to use for delivery'
  })
  deliveryAddressId!: string;
  
  @IsOptional()
  @IsString()
  paymentMethod?: string;
  
  @IsOptional()
  @IsString()
  notes?: string;
}
```

### Checkout Service Integration

```typescript
// backend/src/modules/checkout/checkout.service.ts

import { AddressesService } from '../addresses/addresses.service';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private addressesService: AddressesService,  // ✅ Inject
  ) {}

  async createOrder(dto: CreateOrderDto, userId: string) {
    // 1. Validate address ownership
    const isValidAddress = await this.addressesService.validateAddressOwnership(
      dto.deliveryAddressId,
      userId,
    );

    if (!isValidAddress) {
      throw new AppException('Invalid delivery address', 400);
    }

    // 2. Get address details
    const deliveryAddress = await this.addressesService.getAddressById(
      dto.deliveryAddressId,
    );

    // 3. Get cart
    const cart = await this.cartModel.findById(dto.cartId);
    if (!cart) {
      throw new AppException('Cart not found', 404);
    }

    // 4. Create order with address details
    const order = new this.orderModel({
      userId: new Types.ObjectId(userId),
      items: cart.items,
      
      // 🆕 Delivery Address (saved in order)
      deliveryAddress: {
        addressId: deliveryAddress._id,
        recipientName: deliveryAddress.recipientName,
        recipientPhone: deliveryAddress.recipientPhone,
        line1: deliveryAddress.line1,
        line2: deliveryAddress.line2,
        city: deliveryAddress.city,
        region: deliveryAddress.region,
        country: deliveryAddress.country,
        coords: deliveryAddress.coords,
        notes: deliveryAddress.notes,
      },
      
      subtotal: cart.subtotal,
      total: cart.total,
      status: 'pending',
      ...dto,
    });

    await order.save();

    // 5. Mark address as used
    await this.addressesService.markAsUsed(dto.deliveryAddressId, userId);

    // 6. Clear cart
    await this.cartModel.deleteOne({ _id: cart._id });

    return order;
  }
}
```

### Order Schema Update

```typescript
// backend/src/modules/checkout/schemas/order.schema.ts

@Schema({ timestamps: true })
export class Order {
  // ... existing fields
  
  // 🆕 Delivery Address
  @Prop({ type: Object, required: true })
  deliveryAddress!: {
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
}
```

---

## 🔧 التكامل مع Services (طلب مهندس)

### Service Request DTO Update

```typescript
// backend/src/modules/services/dto/requests.dto.ts

export class CreateServiceRequestDto {
  @IsString()
  serviceType!: string;
  
  // 🆕 Address Selection
  @IsString()
  @ApiProperty({ 
    example: '65abc123def456789',
    description: 'Address ID for service location'
  })
  serviceAddressId!: string;
  
  @IsOptional()
  @IsString()
  preferredDate?: string;
  
  @IsOptional()
  @IsString()
  description?: string;
}
```

### Services Service Integration

```typescript
// backend/src/modules/services/services.service.ts

import { AddressesService } from '../addresses/addresses.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceRequest.name) private serviceRequestModel: Model<ServiceRequest>,
    private addressesService: AddressesService,  // ✅ Inject
  ) {}

  async createServiceRequest(dto: CreateServiceRequestDto, userId: string) {
    // 1. Validate address ownership
    const isValidAddress = await this.addressesService.validateAddressOwnership(
      dto.serviceAddressId,
      userId,
    );

    if (!isValidAddress) {
      throw new AppException('Invalid service address', 400);
    }

    // 2. Get address details
    const serviceAddress = await this.addressesService.getAddressById(
      dto.serviceAddressId,
    );

    // 3. Create service request
    const serviceRequest = new this.serviceRequestModel({
      userId: new Types.ObjectId(userId),
      serviceType: dto.serviceType,
      
      // 🆕 Service Address (saved in request)
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
      
      preferredDate: dto.preferredDate,
      description: dto.description,
      status: 'pending',
    });

    await serviceRequest.save();

    // 4. Mark address as used
    await this.addressesService.markAsUsed(dto.serviceAddressId, userId);

    return serviceRequest;
  }
}
```

---

## 💻 Frontend Integration - Complete Examples

### مثال 1: صفحة العناوين

```jsx
// AddressesPage.jsx
import React, { useEffect, useState } from 'react';

function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    const res = await fetch('/addresses/active', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setAddresses(data.data);
  }

  async function setAsDefault(addressId) {
    const res = await fetch(`/addresses/${addressId}/set-default`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (res.ok) {
      loadAddresses();
      alert('✅ تم تعيين العنوان الافتراضي');
    }
  }

  async function deleteAddress(addressId) {
    if (!confirm('هل تريد حذف هذا العنوان؟')) return;

    const res = await fetch(`/addresses/${addressId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const data = await res.json();

    if (data.success) {
      loadAddresses();
      alert('✅ تم حذف العنوان');
    } else {
      alert('❌ ' + data.message);
    }
  }

  return (
    <div className="addresses-page">
      <div className="header">
        <h1>عناويني</h1>
        <button onClick={() => setShowAddForm(true)}>
          + إضافة عنوان جديد
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="empty-state">
          <p>لا توجد عناوين. أضف عنوانك الأول!</p>
        </div>
      ) : (
        <div className="addresses-list">
          {addresses.map(address => (
            <div key={address._id} className="address-card">
              {address.isDefault && (
                <span className="default-badge">افتراضي</span>
              )}

              <div className="address-header">
                <h3>{address.label}</h3>
                <span className="type-badge">{address.addressType}</span>
              </div>

              <div className="address-details">
                <div className="recipient">
                  <strong>{address.recipientName}</strong>
                  <span>{address.recipientPhone}</span>
                </div>

                <div className="location">
                  <p>{address.line1}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p>{address.city}, {address.region}</p>
                  <p>{address.country}</p>
                </div>

                {address.notes && (
                  <div className="notes">
                    <strong>ملاحظات:</strong>
                    <p>{address.notes}</p>
                  </div>
                )}

                <div className="usage-info">
                  <span>استخدم {address.usageCount} مرات</span>
                  {address.lastUsedAt && (
                    <span>آخر استخدام: {new Date(address.lastUsedAt).toLocaleDateString('ar-YE')}</span>
                  )}
                </div>
              </div>

              <div className="address-actions">
                {!address.isDefault && (
                  <button onClick={() => setAsDefault(address._id)}>
                    تعيين كافتراضي
                  </button>
                )}
                <button onClick={() => editAddress(address)}>
                  تعديل
                </button>
                <button onClick={() => deleteAddress(address._id)} className="delete">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <AddAddressForm 
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            loadAddresses();
          }}
        />
      )}
    </div>
  );
}
```

---

### مثال 2: اختيار العنوان عند الطلب (Checkout)

```jsx
// CheckoutPage.jsx
import React, { useEffect, useState } from 'react';

function CheckoutPage({ cartId }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [cart, setCart] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // 1. Load addresses
    const addressesRes = await fetch('/addresses/active', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const addressesData = await addressesRes.json();
    setAddresses(addressesData.data);

    // 2. Set default address as selected
    const defaultAddress = addressesData.data.find(a => a.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress._id);
    }

    // 3. Load cart
    const cartRes = await fetch(`/cart/${cartId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const cartData = await cartRes.json();
    setCart(cartData.data);
  }

  async function placeOrder() {
    if (!selectedAddressId) {
      alert('يرجى اختيار عنوان التوصيل');
      return;
    }

    try {
      const res = await fetch('/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
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
      }
    } catch (error) {
      alert('❌ حدث خطأ في إنشاء الطلب');
    }
  }

  if (!cart || addresses.length === 0) return <div>Loading...</div>;

  return (
    <div className="checkout-page">
      <h1>إتمام الطلب</h1>

      {/* Address Selection */}
      <section className="address-selection">
        <h2>اختر عنوان التوصيل</h2>

        {addresses.length === 0 ? (
          <div className="no-addresses">
            <p>لا توجد عناوين محفوظة</p>
            <button onClick={() => window.location.href = '/addresses/new'}>
              + إضافة عنوان
            </button>
          </div>
        ) : (
          <div className="addresses-grid">
            {addresses.map(address => (
              <div
                key={address._id}
                className={`address-option ${selectedAddressId === address._id ? 'selected' : ''}`}
                onClick={() => setSelectedAddressId(address._id)}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === address._id}
                  onChange={() => setSelectedAddressId(address._id)}
                />

                <div className="address-content">
                  <div className="header">
                    <strong>{address.label}</strong>
                    {address.isDefault && <span className="badge">افتراضي</span>}
                  </div>

                  <div className="recipient">
                    {address.recipientName} - {address.recipientPhone}
                  </div>

                  <div className="location">
                    {address.line1}
                    {address.line2 && <>, {address.line2}</>}
                    <br />
                    {address.city}, {address.region}
                  </div>

                  {address.notes && (
                    <div className="notes">
                      ملاحظات: {address.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div 
              className="address-option add-new"
              onClick={() => window.location.href = '/addresses/new?returnTo=checkout'}
            >
              <div className="add-icon">+</div>
              <span>إضافة عنوان جديد</span>
            </div>
          </div>
        )}
      </section>

      {/* Order Summary */}
      <section className="order-summary">
        <h2>ملخص الطلب</h2>
        <div className="summary-row">
          <span>المجموع الفرعي:</span>
          <span>{cart.subtotal.toLocaleString()} YER</span>
        </div>
        {cart.couponDiscount > 0 && (
          <div className="summary-row discount">
            <span>الخصم:</span>
            <span>-{cart.couponDiscount.toLocaleString()} YER</span>
          </div>
        )}
        <div className="summary-row total">
          <span>المجموع الكلي:</span>
          <span>{cart.total.toLocaleString()} YER</span>
        </div>
      </section>

      {/* Place Order Button */}
      <button
        className="place-order-btn"
        onClick={placeOrder}
        disabled={!selectedAddressId}
      >
        تأكيد الطلب
      </button>
    </div>
  );
}
```

---

### مثال 3: طلب خدمة مهندس مع اختيار العنوان

```jsx
// RequestEngineerPage.jsx
import React, { useEffect, useState } from 'react';

function RequestEngineerPage() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [serviceType, setServiceType] = useState('installation');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    const res = await fetch('/addresses/active', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setAddresses(data.data);

    // Auto-select default
    const defaultAddr = data.data.find(a => a.isDefault);
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr._id);
    }
  }

  async function submitServiceRequest() {
    if (!selectedAddressId) {
      alert('يرجى اختيار عنوان الخدمة');
      return;
    }

    try {
      const res = await fetch('/services/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          serviceType,
          serviceAddressId: selectedAddressId,  // ✅ العنوان المختار
          description,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ تم إرسال طلب الخدمة بنجاح!');
        window.location.href = `/service-requests/${data.data._id}`;
      }
    } catch (error) {
      alert('❌ حدث خطأ');
    }
  }

  return (
    <div className="request-engineer-page">
      <h1>طلب خدمة مهندس</h1>

      {/* Service Type */}
      <div className="form-group">
        <label>نوع الخدمة</label>
        <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
          <option value="installation">تركيب</option>
          <option value="maintenance">صيانة</option>
          <option value="repair">إصلاح</option>
        </select>
      </div>

      {/* Address Selection */}
      <div className="form-group">
        <label>اختر موقع الخدمة</label>
        
        <div className="addresses-list">
          {addresses.map(address => (
            <div
              key={address._id}
              className={`address-card ${selectedAddressId === address._id ? 'selected' : ''}`}
              onClick={() => setSelectedAddressId(address._id)}
            >
              <input
                type="radio"
                name="address"
                checked={selectedAddressId === address._id}
                onChange={() => setSelectedAddressId(address._id)}
              />

              <div>
                <strong>{address.label}</strong>
                {address.isDefault && <span className="badge">افتراضي</span>}
                <p>{address.recipientName} - {address.recipientPhone}</p>
                <p>{address.line1}, {address.city}</p>
              </div>
            </div>
          ))}

          <button onClick={() => window.location.href = '/addresses/new'}>
            + إضافة عنوان جديد
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label>وصف المشكلة</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="اشرح المشكلة أو الخدمة المطلوبة..."
        />
      </div>

      {/* Submit */}
      <button
        className="submit-btn"
        onClick={submitServiceRequest}
        disabled={!selectedAddressId}
      >
        إرسال الطلب
      </button>
    </div>
  );
}
```

---

### مثال 4: نموذج إضافة عنوان جديد

```jsx
// AddAddressForm.jsx
import React, { useState } from 'react';

function AddAddressForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    label: '',
    addressType: 'home',
    recipientName: '',
    recipientPhone: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    country: 'Yemen',
    notes: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    try {
      const res = await fetch('/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ تم إضافة العنوان بنجاح!');
        onSuccess && onSuccess(data.data);
      } else {
        setErrors(data.errors || {});
      }
    } catch (error) {
      alert('❌ حدث خطأ');
    }
  }

  return (
    <div className="add-address-modal">
      <div className="modal-content">
        <h2>إضافة عنوان جديد</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>تسمية العنوان *</label>
            <input
              type="text"
              placeholder="مثل: المنزل، المكتب، عند أمي"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>نوع العنوان</label>
            <select
              value={formData.addressType}
              onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
            >
              <option value="home">المنزل</option>
              <option value="work">المكتب</option>
              <option value="other">آخر</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>اسم المستلم *</label>
              <input
                type="text"
                placeholder="أحمد محمد"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>رقم الهاتف *</label>
              <input
                type="tel"
                placeholder="773123456"
                value={formData.recipientPhone}
                onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>العنوان الرئيسي *</label>
            <input
              type="text"
              placeholder="شارع الستين، بجوار مطعم السلطان"
              value={formData.line1}
              onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>تفاصيل إضافية</label>
            <input
              type="text"
              placeholder="الدور الثالث، شقة 12"
              value={formData.line2}
              onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>المدينة *</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              >
                <option value="">اختر المدينة</option>
                <option value="صنعاء">صنعاء</option>
                <option value="عدن">عدن</option>
                <option value="تعز">تعز</option>
                <option value="الحديدة">الحديدة</option>
                <option value="إب">إب</option>
              </select>
            </div>

            <div className="form-group">
              <label>المنطقة/الحي</label>
              <input
                type="text"
                placeholder="حي السبعين"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>ملاحظات/تعليمات التسليم</label>
            <textarea
              placeholder="يرجى الاتصال قبل الوصول بـ 10 دقائق"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              تعيين كعنوان افتراضي
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose}>
              إلغاء
            </button>
            <button type="submit">
              حفظ العنوان
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### مثال 5: عرض العنوان في تفاصيل الطلب

```jsx
// OrderDetailsPage.jsx
function OrderDetailsPage({ orderId }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    const res = await fetch(`/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setOrder(data.data);
  }

  if (!order) return <div>Loading...</div>;

  return (
    <div className="order-details">
      <h1>تفاصيل الطلب #{order._id}</h1>

      {/* Delivery Address */}
      <section className="delivery-address-section">
        <h2>عنوان التوصيل</h2>
        <div className="address-box">
          <div className="recipient">
            <strong>{order.deliveryAddress.recipientName}</strong>
            <span>{order.deliveryAddress.recipientPhone}</span>
          </div>

          <div className="location">
            <p>{order.deliveryAddress.line1}</p>
            {order.deliveryAddress.line2 && <p>{order.deliveryAddress.line2}</p>}
            <p>{order.deliveryAddress.city}, {order.deliveryAddress.region}</p>
            <p>{order.deliveryAddress.country}</p>
          </div>

          {order.deliveryAddress.notes && (
            <div className="delivery-notes">
              <strong>ملاحظات:</strong>
              <p>{order.deliveryAddress.notes}</p>
            </div>
          )}

          {order.deliveryAddress.coords && (
            <a
              href={`https://maps.google.com/?q=${order.deliveryAddress.coords.lat},${order.deliveryAddress.coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="map-link"
            >
              📍 عرض على الخريطة
            </a>
          )}
        </div>
      </section>

      {/* Order Items */}
      <section className="order-items">
        <h2>المنتجات</h2>
        {/* ... */}
      </section>
    </div>
  );
}
```

---

## ✅ الملخص

### ما تم تحسينه:

#### 1. **Address Schema** ✅
- ✅ إضافة `recipientName` و `recipientPhone` (مطلوبة)
- ✅ إضافة `addressType` (home/work/other)
- ✅ إضافة `postalCode`
- ✅ إضافة `isActive` للتفعيل/الإيقاف
- ✅ Soft delete support (`deletedAt`, `deletedBy`)
- ✅ تتبع الاستخدام (`lastUsedAt`, `usageCount`)
- ✅ Indexes محسّنة للأداء

#### 2. **AddressesService** ✅
- ✅ منطق أفضل لـ create/update/delete
- ✅ العنوان الأول يصبح افتراضي تلقائياً
- ✅ منع حذف العنوان الوحيد
- ✅ عند حذف الافتراضي، يُعيّن آخر تلقائياً
- ✅ `markAsUsed()` - تتبع الاستخدام
- ✅ `validateAddressOwnership()` - التحقق من الملكية
- ✅ `getActiveAddresses()` - الفعّالة فقط
- ✅ `restore()` - استرجاع المحذوفة
- ✅ Error handling شامل

#### 3. **DTOs** ✅
- ✅ Validation كامل (MinLength, MaxLength, Matches)
- ✅ ApiProperty للتوثيق
- ✅ حقول مطلوبة واضحة
- ✅ `SelectAddressDto` للاستخدام في الطلبات

#### 4. **Controller** ✅
- ✅ Endpoints محسّنة
- ✅ Response format موحد
- ✅ ApiOperation للتوثيق
- ✅ `GET /addresses/active` - العناوين الفعّالة
- ✅ `POST /:id/set-default` - تعيين افتراضي
- ✅ `POST /:id/restore` - استرجاع محذوفة
- ✅ `GET /validate/:id` - التحقق من الملكية

---

## 🔗 التكامل مع الأنظمة الأخرى

### ✅ Checkout (طلب منتجات)
```typescript
CreateOrderDto {
  cartId: string
  deliveryAddressId: string  // ✅ العنوان المختار
  paymentMethod: string
}

// في Checkout Service:
1. التحقق من ملكية العنوان
2. جلب تفاصيل العنوان
3. حفظ العنوان كاملاً في الطلب
4. تحديث lastUsedAt و usageCount
```

### ✅ Services (طلب مهندس)
```typescript
CreateServiceRequestDto {
  serviceType: string
  serviceAddressId: string  // ✅ العنوان المختار
  description: string
}

// في Services Service:
1. التحقق من ملكية العنوان
2. جلب تفاصيل العنوان
3. حفظ العنوان في طلب الخدمة
4. تحديث الاستخدام
```

---

## 📱 سيناريو كامل

```
1️⃣ المستخدم يفتح صفحة العناوين
   GET /addresses/active
   → يرى 3 عناوين (المنزل ⭐, المكتب, عند الأم)

2️⃣ يضيف عنوان جديد "العمل"
   POST /addresses
   { label: "العمل", recipientName: "...", ... }
   → العنوان يُضاف بنجاح

3️⃣ يعيّن "العمل" كافتراضي
   POST /addresses/{id}/set-default
   → "العمل" يصبح افتراضي
   → "المنزل" يصبح غير افتراضي

4️⃣ يذهب للطلب (Checkout)
   GET /addresses/active
   → يرى 4 عناوين
   → "العمل" مختار افتراضياً ✅

5️⃣ يختار "المنزل" للتوصيل
   POST /checkout
   { deliveryAddressId: "home_addr_id", ... }
   
6️⃣ النظام:
   ✅ يتحقق أن العنوان ملك المستخدم
   ✅ يحفظ العنوان كاملاً في الطلب
   ✅ يحدث lastUsedAt و usageCount

7️⃣ المستخدم يشاهد تفاصيل الطلب
   → يرى عنوان التوصيل كاملاً ✅

8️⃣ يطلب خدمة مهندس
   POST /services/requests
   { serviceAddressId: "home_addr_id", ... }
   → نفس العملية ✅
```

---

## 📋 Checklist للتطبيق الكامل

### Backend ✅
- [✅] Address Schema enhanced
- [✅] AddressesService improved
- [✅] Controller updated
- [✅] DTOs with validation
- [✅] Soft delete support
- [✅] Usage tracking
- [✅] Default address logic

### Integration Required ⚠️
- [ ] Update Checkout DTO & Service
- [ ] Update Order Schema
- [ ] Update Services Request DTO & Service
- [ ] Update ServiceRequest Schema
- [ ] Export AddressesService in Module
- [ ] Import in Checkout & Services modules

---

النظام الآن احترافي وكامل! ✅


# Addresses System - نظام العناوين الاحترافي
# Professional Address Management System

## ✅ نظام كامل ومحسّن

تم تحديث وتحسين نظام العناوين ليصبح احترافي بالكامل مع جميع المميزات المطلوبة.

---

## 🎯 المميزات

### ✨ الحقول الاحترافية
- ✅ تسمية العنوان (label)
- ✅ نوع العنوان (home/work/other)
- ✅ **اسم المستلم** (recipientName) - مطلوب
- ✅ **رقم المستلم** (recipientPhone) - مطلوب
- ✅ العنوان الرئيسي (line1) - مطلوب
- ✅ تفاصيل إضافية (line2)
- ✅ المدينة (city) - مطلوب
- ✅ المنطقة/الحي (region)
- ✅ الدولة (country)
- ✅ الرمز البريدي (postalCode)
- ✅ الإحداثيات (coords)
- ✅ ملاحظات التوصيل (notes)
- ✅ عنوان افتراضي (isDefault)
- ✅ حالة التفعيل (isActive)
- ✅ تتبع الاستخدام (lastUsedAt, usageCount)
- ✅ Soft delete support

### ✨ المميزات الذكية
- ✅ **العنوان الأول يصبح افتراضي تلقائياً**
- ✅ **لا يمكن حذف العنوان الوحيد**
- ✅ **عند حذف الافتراضي، يُعيّن آخر تلقائياً**
- ✅ **عنوان واحد افتراضي فقط** (باقي العناوين تصبح غير افتراضية)
- ✅ **تتبع الاستخدام** (كم مرة استُخدم)
- ✅ **الترتيب الذكي** (افتراضي أولاً → الأحدث استخداماً → الأقدم إنشاءً)

---

## 📊 API Endpoints

### User Endpoints (محمية - JWT Required)

#### 1. Get All Addresses
```http
GET /addresses
Authorization: Bearer {token}

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
    },
    {
      "_id": "addr_456",
      "label": "المكتب",
      "addressType": "work",
      "recipientName": "أحمد محمد",
      "recipientPhone": "771999888",
      "line1": "شارع التحرير، مبنى التجارة",
      "city": "صنعاء",
      "isDefault": false,
      "usageCount": 2
    }
  ],
  "count": 2
}

Features:
  ✅ مرتبة: افتراضي أولاً → آخر استخدام → الأقدم
  ✅ يمكن إضافة ?includeDeleted=true لعرض المحذوفة
```

---

#### 2. Get Active Addresses Only
```http
GET /addresses/active
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [...active addresses],
  "count": 2
}

Note: فقط العناوين الفعّالة وغير المحذوفة
```

---

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

Logic:
  1. يبحث عن عنوان isDefault=true
  2. إذا لم يجد، يأخذ آخر استخدام
  3. إذا لم يجد، يأخذ الأول
  4. يعيّنه كافتراضي تلقائياً
```

---

#### 4. Get Address by ID
```http
GET /addresses/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {...address}
}

Error (404 if not found or doesn't belong to user)
```

---

#### 5. Create New Address
```http
POST /addresses
Authorization: Bearer {token}

Body:
{
  "label": "المكتب",
  "addressType": "work",
  "recipientName": "أحمد محمد علي",
  "recipientPhone": "773123456",
  "line1": "شارع التحرير، مبنى التجارة",
  "line2": "الدور الخامس، مكتب 501",
  "city": "صنعاء",
  "region": "المدينة",
  "country": "Yemen",
  "postalCode": "12345",
  "notes": "الدخول من البوابة الخلفية",
  "isDefault": false
}

Response:
{
  "success": true,
  "message": "Address created successfully",
  "data": {...created address}
}

Smart Logic:
  ✅ إذا كان أول عنوان → isDefault=true تلقائياً
  ✅ إذا isDefault=true → باقي العناوين تصبح false
```

---

#### 6. Update Address
```http
PATCH /addresses/:id
Authorization: Bearer {token}

Body:
{
  "recipientPhone": "771999888",
  "notes": "تعليمات جديدة",
  "isDefault": true
}

Response:
{
  "success": true,
  "message": "Address updated successfully",
  "data": {...updated address}
}
```

---

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

Smart Logic:
  ✅ Soft delete (يُحفظ في DB)
  ✅ لا يمكن حذف العنوان الوحيد
  ✅ إذا كان افتراضي → يُعيّن عنوان آخر كافتراضي تلقائياً
```

---

#### 8. Set as Default
```http
POST /addresses/:id/set-default
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Default address set successfully",
  "data": {...address with isDefault=true}
}

Logic:
  ✅ يعيّن هذا العنوان كافتراضي
  ✅ باقي العناوين تصبح isDefault=false
```

---

#### 9. Restore Deleted Address
```http
POST /addresses/:id/restore
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Address restored successfully",
  "data": {...restored address}
}
```

---

#### 10. Validate Address Ownership
```http
GET /addresses/validate/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": { "valid": true }
}

Use Case: للتحقق قبل استخدام العنوان في الطلب
```

---

## 🔗 Integration with Orders & Services

### في Checkout (طلب منتجات):

```typescript
// 1. Checkout DTO
CreateOrderDto {
  cartId: string
  deliveryAddressId: string  // ✅ المستخدم يختار العنوان
  paymentMethod: string
}

// 2. Order Schema
Order {
  deliveryAddress: {         // ✅ يُحفظ العنوان كاملاً
    addressId: ObjectId
    recipientName: string
    recipientPhone: string
    line1: string
    city: string
    ...
  }
}

// 3. في createOrder():
- التحقق من ملكية العنوان: validateAddressOwnership()
- جلب تفاصيل العنوان: getAddressById()
- حفظ العنوان كاملاً في الطلب
- تحديث استخدام العنوان: markAsUsed()
```

---

### في Services (طلب مهندس):

```typescript
// 1. Service Request DTO
CreateServiceRequestDto {
  serviceType: string
  serviceAddressId: string  // ✅ المستخدم يختار العنوان
  description: string
}

// 2. ServiceRequest Schema
ServiceRequest {
  serviceAddress: {          // ✅ يُحفظ العنوان كاملاً
    addressId: ObjectId
    recipientName: string
    recipientPhone: string
    line1: string
    city: string
    coords: { lat, lng }
    ...
  }
}

// 3. في createServiceRequest():
- التحقق من ملكية العنوان
- جلب تفاصيل العنوان
- حفظ العنوان في طلب الخدمة
- تحديث استخدام العنوان
```

---

## 💡 Best Practices

### 1. دائماً احفظ العنوان كاملاً في الطلب
```typescript
// ✅ صحيح
Order {
  deliveryAddress: {
    recipientName: "أحمد محمد",
    recipientPhone: "773123456",
    line1: "...",
    city: "...",
    ...  // جميع التفاصيل
  }
}

// ❌ خطأ
Order {
  deliveryAddressId: "addr_123"  // فقط ID
}

// لماذا؟
// - المستخدم قد يحذف/يعدل العنوان لاحقاً
// - الطلب يحتاج العنوان كما كان وقت الطلب
```

---

### 2. دائماً تحقق من ملكية العنوان
```typescript
// قبل استخدام العنوان في الطلب
const isValid = await addressesService.validateAddressOwnership(
  addressId,
  userId
);

if (!isValid) {
  throw new AppException('العنوان غير صحيح', 400);
}
```

---

### 3. حدّث استخدام العنوان
```typescript
// بعد استخدام العنوان في طلب
await addressesService.markAsUsed(addressId, userId);

// هذا يحدث:
// - lastUsedAt = now
// - usageCount += 1
```

---

### 4. الترتيب الذكي
```typescript
// العناوين تُرتب تلقائياً:
// 1. الافتراضي أولاً
// 2. الأحدث استخداماً
// 3. الأقدم إنشاءً

sort({ isDefault: -1, lastUsedAt: -1, createdAt: -1 })
```

---

## 📱 Frontend Tips

### 1. عرض قائمة العناوين في Checkout
```jsx
{addresses.map(address => (
  <div 
    key={address._id}
    className={selectedAddressId === address._id ? 'selected' : ''}
    onClick={() => setSelectedAddressId(address._id)}
  >
    {address.isDefault && <span>⭐ افتراضي</span>}
    <h3>{address.label}</h3>
    <p>{address.recipientName} - {address.recipientPhone}</p>
    <p>{address.line1}, {address.city}</p>
  </div>
))}
```

---

### 2. Auto-select Default Address
```jsx
useEffect(() => {
  const defaultAddr = addresses.find(a => a.isDefault);
  if (defaultAddr) {
    setSelectedAddressId(defaultAddr._id);
  }
}, [addresses]);
```

---

### 3. Validate Before Submit
```jsx
async function placeOrder() {
  if (!selectedAddressId) {
    alert('⚠️ يرجى اختيار عنوان التوصيل');
    return;
  }

  // ... proceed with order
}
```

---

### 4. Add New Address from Checkout
```jsx
<button onClick={() => {
  window.location.href = '/addresses/new?returnTo=checkout';
}}>
  + إضافة عنوان جديد
</button>
```

---

## 🔄 Complete User Flow

```
1. User opens Checkout page
   ↓
2. System loads addresses: GET /addresses/active
   ↓
3. Default address is auto-selected ✅
   ↓
4. User sees all their addresses
   ↓
5. User can:
   - Select different address ✅
   - Add new address ✅
   - Edit existing address ✅
   ↓
6. User clicks "Confirm Order"
   ↓
7. Backend validates address ownership ✅
   ↓
8. Backend saves full address in order ✅
   ↓
9. Backend updates address usage stats ✅
   ↓
10. Order created successfully ✅
```

---

## 🎯 Use Cases

### Use Case 1: أول عنوان للمستخدم
```javascript
POST /addresses
{
  "label": "المنزل",
  "recipientName": "أحمد محمد",
  ...
}

// النتيجة:
{
  "isDefault": true,  // ✅ تلقائياً
  ...
}
```

---

### Use Case 2: إضافة عنوان ثاني
```javascript
POST /addresses
{
  "label": "المكتب",
  "isDefault": false,  // غير افتراضي
  ...
}

// المستخدم الآن لديه:
// - المنزل (افتراضي) ⭐
// - المكتب
```

---

### Use Case 3: تغيير الافتراضي
```javascript
POST /addresses/addr_456/set-default

// النتيجة:
// - المنزل: isDefault=false
// - المكتب: isDefault=true ⭐
```

---

### Use Case 4: حذف عنوان
```javascript
DELETE /addresses/addr_123

// إذا كان العنوان الوحيد:
// ❌ Error: "Cannot delete your only address"

// إذا كان افتراضي وهناك عناوين أخرى:
// ✅ يُحذف
// ✅ عنوان آخر يصبح افتراضي تلقائياً
```

---

### Use Case 5: استخدام في الطلب
```javascript
POST /checkout
{
  "cartId": "cart_123",
  "deliveryAddressId": "addr_123"  // ✅
}

// البيك إند:
// 1. يتحقق أن addr_123 يخص المستخدم ✅
// 2. يجلب تفاصيل العنوان كاملة ✅
// 3. يحفظها في الطلب ✅
// 4. يحدث lastUsedAt و usageCount ✅

// Order:
{
  "deliveryAddress": {
    "addressId": "addr_123",
    "recipientName": "أحمد محمد",
    "recipientPhone": "773123456",
    "line1": "...",
    ...  // كل التفاصيل محفوظة
  }
}
```

---

## ✅ الملخص

### ما تم تحسينه:
1. ✅ **Schema محسّن** (15 حقل جديد)
2. ✅ **Service محسّن** (10 methods محسّنة)
3. ✅ **DTOs محسّنة** (validation كامل)
4. ✅ **Controller محسّن** (10 endpoints)
5. ✅ **منطق ذكي** (default auto-set, prevent delete only, etc.)
6. ✅ **Soft delete** (لا يُحذف نهائياً)
7. ✅ **Usage tracking** (تتبع الاستخدام)
8. ✅ **Error handling** (رسائل واضحة)
9. ✅ **Integration ready** (مع Checkout & Services)

### Features:
- ✅ إضافة عناوين متعددة
- ✅ تحديد عنوان افتراضي
- ✅ اختيار العنوان عند الطلب
- ✅ عرض العنوان في تفاصيل الطلب
- ✅ منع حذف العنوان الوحيد
- ✅ ترتيب ذكي للعناوين
- ✅ تتبع الاستخدام

---

## 📞 Next Steps

### للتطبيق الكامل:
1. ⚠️ Update Checkout Module (import AddressesModule)
2. ⚠️ Update Checkout DTO (add deliveryAddressId)
3. ⚠️ Update Order Schema (add deliveryAddress object)
4. ⚠️ Update Checkout Service (integrate with AddressesService)
5. ⚠️ Update Services Module (import AddressesModule)
6. ⚠️ Update Service Request DTO (add serviceAddressId)
7. ⚠️ Update ServiceRequest Schema (add serviceAddress object)
8. ⚠️ Update Services Service (integrate with AddressesService)

---

**النظام جاهز ومحسّن! 🎉**

راجع:
- `backend/ADDRESSES_SYSTEM_COMPLETE_GUIDE.md`
- `backend/ADDRESSES_INTEGRATION_EXAMPLES.md`


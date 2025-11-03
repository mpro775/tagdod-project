# نظام الدفع المحلي - دليل التنفيذ الكامل

## 📖 الفهرس

1. [نظرة عامة](#نظرة-عامة)
2. [المتطلبات](#المتطلبات)
3. [الهيكل الكامل](#الهيكل-الكامل)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [API Documentation](#api-documentation)
7. [Flow Charts](#flow-charts)
8. [Examples](#examples)
9. [Testing](#testing)

---

## 🎯 نظرة عامة

تم تنفيذ نظام شامل للدفع المحلي يدعم:
- ✅ إدارة حسابات البنوك والمحافظ المحلية
- ✅ دعم عدة حسابات لنفس البنك (كل حساب بعملة)
- ✅ عرض الحسابات مجمعة حسب اسم البنك
- ✅ مطابقة الدفع يدوياً من لوحة التحكم
- ✅ قبول/رفض تلقائي بناءً على المبلغ
- ✅ تتبع كامل لعملية المطابقة

---

## 📋 المتطلبات

### Backend
- NestJS
- MongoDB (Mongoose)
- System Settings Module
- Checkout Module

### Frontend
- React + TypeScript
- Material-UI
- React Query
- System Settings Feature
- Orders Feature

---

## 🏗️ الهيكل الكامل

### Backend Structure
```
backend/src/modules/
├── system-settings/
│   ├── schemas/
│   │   └── local-payment-account.schema.ts  ✨ جديد
│   ├── dto/
│   │   └── local-payment-account.dto.ts     ✨ جديد
│   ├── services/
│   │   └── local-payment-account.service.ts ✨ جديد
│   ├── system-settings.controller.ts        🔄 محدث
│   ├── system-settings.module.ts            🔄 محدث
│   └── README.md
│
└── checkout/
    ├── schemas/
    │   └── order.schema.ts                  🔄 محدث (حقول الدفع المحلي)
    ├── dto/
    │   └── order.dto.ts                     🔄 محدث (VerifyPaymentDto)
    ├── services/
    │   └── order.service.ts                 🔄 محدث (verifyLocalPayment)
    ├── controllers/
    │   └── admin-order.controller.ts        🔄 محدث (verify-payment endpoint)
    └── checkout.module.ts                   🔄 محدث (SystemSettingsModule)
```

### Frontend Structure
```
admin-dashboard/src/features/
├── system-settings/
│   ├── api/
│   │   └── systemSettingsApi.ts            🔄 محدث (localPaymentAccountsApi)
│   └── pages/
│       └── SystemSettingsPage.tsx           🔄 محدث (Tab جديد)
│
└── orders/
    ├── types/
    │   └── order.types.ts                   🔄 محدث (حقول الدفع المحلي)
    ├── api/
    │   └── ordersApi.ts                     🔄 محدث (verifyPayment)
    ├── hooks/
    │   └── useOrders.ts                     🔄 محدث (useVerifyPayment)
    └── pages/
        └── OrderDetailsPage.tsx             🔄 محدث (UI للمطابقة)
```

---

## 🔧 Backend Implementation

### 1. Schema: LocalPaymentAccount

**الملف:** `backend/src/modules/system-settings/schemas/local-payment-account.schema.ts`

```typescript
@Schema({ timestamps: true })
export class LocalPaymentAccount {
  providerName: string;        // اسم البنك (مثل: الكريمي)
  iconUrl?: string;            // رابط الأيقونة
  accountNumber: string;       // رقم الحساب
  type: 'bank' | 'wallet';    // النوع
  currency: 'YER' | 'SAR' | 'USD'; // العملة
  isActive: boolean;           // حالة التفعيل
  notes?: string;              // ملاحظات
  displayOrder: number;        // ترتيب العرض
}
```

**الفهارس:**
- `{ providerName: 1, currency: 1 }`
- `{ providerName: 1, isActive: 1 }`
- `{ isActive: 1, currency: 1 }`

### 2. Service: LocalPaymentAccountService

**الملف:** `backend/src/modules/system-settings/services/local-payment-account.service.ts`

**الوظائف الرئيسية:**

#### `findGrouped(activeOnly?: boolean)`
```typescript
// تجميع الحسابات حسب providerName
const grouped = new Map<string, GroupedPaymentAccountDto>();

accounts.forEach(account => {
  if (!grouped.has(account.providerName)) {
    grouped.set(account.providerName, {
      providerName: account.providerName,
      iconUrl: account.iconUrl,
      type: account.type,
      accounts: [],
    });
  }
  // إضافة الحساب للمجموعة
});
```

#### `findByCurrency(currency, activeOnly)`
```typescript
// فلترة حسب العملة ثم التجميع
const filter = { currency, isActive: activeOnly ? true : undefined };
const accounts = await this.accountModel.find(filter);
// ثم التجميع مثل findGrouped
```

### 3. Order Service: منطق الدفع المحلي

#### في `confirmCheckout()`:

```typescript
// التحقق من الحساب المحلي
if (dto.paymentMethod === PaymentMethod.BANK_TRANSFER && dto.localPaymentAccountId) {
  const account = await this.localPaymentAccountService.findById(dto.localPaymentAccountId);
  
  // التحقق من وجود الحساب وتفعيله
  if (!account || !account.isActive) {
    throw new DomainException(ErrorCode.VALIDATION_ERROR, {
      reason: 'invalid_payment_account'
    });
  }

  // التحقق من تطابق العملة
  if (account.currency !== dto.currency) {
    throw new DomainException(ErrorCode.VALIDATION_ERROR, {
      reason: 'currency_mismatch'
    });
  }

  // التحقق من وجود رقم الحوالة
  if (!dto.paymentReference) {
    throw new DomainException(ErrorCode.VALIDATION_ERROR, {
      reason: 'payment_reference_required'
    });
  }

  // حفظ معلومات الدفع المحلي
  order.localPaymentAccountId = new Types.ObjectId(dto.localPaymentAccountId);
  order.paymentReference = dto.paymentReference;
}
```

#### Method جديد: `verifyLocalPayment()`

```typescript
async verifyLocalPayment(orderId: string, dto: VerifyPaymentDto, adminId: string) {
  const order = await this.orderModel.findById(orderId);
  
  // التحقق من أن الطلب يستخدم الدفع المحلي
  if (!order.localPaymentAccountId) {
    throw new DomainException(ErrorCode.VALIDATION_ERROR, {
      reason: 'not_local_payment_order'
    });
  }

  // التحقق من العملة
  if (dto.verifiedCurrency !== order.currency) {
    throw new DomainException(ErrorCode.VALIDATION_ERROR, {
      reason: 'currency_mismatch'
    });
  }

  // مقارنة المبلغ
  const isAmountSufficient = dto.verifiedAmount >= order.total;

  // تحديث معلومات المطابقة
  order.verifiedPaymentAmount = dto.verifiedAmount;
  order.verifiedPaymentCurrency = dto.verifiedCurrency;
  order.paymentVerifiedAt = new Date();
  order.paymentVerifiedBy = new Types.ObjectId(adminId);
  order.paymentVerificationNotes = dto.notes;

  if (isAmountSufficient) {
    // قبول الدفع
    order.paymentStatus = PaymentStatus.PAID;
    order.paidAt = new Date();
    
    if (order.status === OrderStatus.PENDING_PAYMENT) {
      order.status = OrderStatus.CONFIRMED;
      order.confirmedAt = new Date();
    }
  } else {
    // رفض الدفع
    order.paymentStatus = PaymentStatus.FAILED;
  }

  // إضافة إلى سجل الحالات
  await this.addStatusHistory(order, ...);
  
  await order.save();
  return order;
}
```

---

## 🎨 Frontend Implementation

### 1. SystemSettingsPage

#### State Management:
```typescript
const [paymentAccounts, setPaymentAccounts] = useState<GroupedPaymentAccount[]>([]);
const [allAccounts, setAllAccounts] = useState<LocalPaymentAccount[]>([]);
const [accountDialogOpen, setAccountDialogOpen] = useState(false);
const [editingAccount, setEditingAccount] = useState<LocalPaymentAccount | null>(null);
```

#### Fetching:
```typescript
const fetchPaymentAccounts = async () => {
  const [grouped, all] = await Promise.all([
    localPaymentAccountsApi.getGroupedAccounts(),
    localPaymentAccountsApi.getAllAccounts(),
  ]);
  setPaymentAccounts(grouped);
  setAllAccounts(all);
};
```

#### Display:
- جدول يعرض الحسابات مجمعة
- لكل مجموعة: اسم البنك، النوع، الحسابات
- لكل حساب: العملة، رقم الحساب، حالة التفعيل
- أزرار تحرير وحذف

### 2. OrderDetailsPage

#### Conditional Rendering:
```typescript
{order.paymentMethod === PaymentMethod.BANK_TRANSFER && 
 order.localPaymentAccountId && (
  <Card>
    {/* معلومات الدفع المحلي */}
    {order.paymentStatus === PaymentStatus.PENDING && (
      <Button onClick={() => setVerifyPaymentDialog(true)}>
        مطابقة الدفع
      </Button>
    )}
  </Card>
)}
```

#### Verification Dialog:
- Input للمبلغ المطابق
- Select للعملة
- Textarea للملاحظات
- Alert ديناميكي يعرض النتيجة المتوقعة

---

## 📡 API Documentation

### System Settings - Payment Accounts

#### GET `/system-settings/payment-accounts`
جلب جميع الحسابات (Admin فقط)

**Query Parameters:**
- `activeOnly` (boolean, optional): عرض الحسابات المفعلة فقط

**Response:**
```json
{
  "data": [
    {
      "_id": "...",
      "providerName": "الكريمي",
      "iconUrl": "...",
      "accountNumber": "1234567890",
      "type": "bank",
      "currency": "YER",
      "isActive": true,
      "displayOrder": 0
    }
  ]
}
```

#### GET `/system-settings/payment-accounts/grouped`
جلب الحسابات مجمعة (Admin فقط)

**Query Parameters:**
- `activeOnly` (boolean, optional)

**Response:**
```json
{
  "data": [
    {
      "providerName": "الكريمي",
      "iconUrl": "...",
      "type": "bank",
      "accounts": [
        {
          "id": "...",
          "accountNumber": "1234567890",
          "currency": "YER",
          "isActive": true,
          "displayOrder": 0
        }
      ]
    }
  ]
}
```

#### GET `/system-settings/payment-accounts/public`
جلب الحسابات المتاحة للعملاء (Public)

**Query Parameters:**
- `currency` (string, optional): فلترة حسب العملة (YER/SAR/USD)

**Response:** نفس format `grouped`

#### POST `/system-settings/payment-accounts`
إنشاء حساب جديد (Admin فقط)

**Body:**
```json
{
  "providerName": "الكريمي",
  "iconUrl": "https://example.com/icon.png",
  "accountNumber": "1234567890",
  "type": "bank",
  "currency": "YER",
  "isActive": true,
  "displayOrder": 0,
  "notes": "ملاحظات"
}
```

#### PUT `/system-settings/payment-accounts/:id`
تحديث حساب (Admin فقط)

**Body:** نفس format الإنشاء (جميع الحقول اختيارية)

#### DELETE `/system-settings/payment-accounts/:id`
حذف حساب (Admin فقط)

### Orders - Payment Verification

#### POST `/admin/orders/:id/verify-payment`
مطابقة الدفع المحلي (Admin فقط)

**Body:**
```json
{
  "verifiedAmount": 50000,
  "verifiedCurrency": "YER",
  "notes": "تم التحقق من الحوالة"
}
```

**Response:**
```json
{
  "order": { ... },
  "message": "تم قبول الدفع بنجاح",
  "paymentStatus": "paid",
  "verifiedAmount": 50000,
  "orderAmount": 45000,
  "currency": "YER"
}
```

**الحالات:**
- `paymentStatus: "paid"` → المبلغ كافٍ
- `paymentStatus: "failed"` → المبلغ غير كافٍ

---

## 🔄 Flow Charts

### Flow 1: إنشاء طلب مع دفع محلي

```
[العميل]
    │
    ├─ يختار طريقة الدفع: BANK_TRANSFER
    │
    ├─ Frontend يجلب الحسابات: GET /payment-accounts/public?currency=YER
    │
    ├─ يختار حساب: الكريمي - YER
    │
    ├─ يدخل رقم الحوالة: REF123456
    │
    └─ POST /orders/checkout/confirm
            │
            ├─ Backend يتحقق:
            │   ├─ الحساب موجود ومفعل ✓
            │   ├─ العملة مطابقة ✓
            │   └─ رقم الحوالة موجود ✓
            │
            └─ حفظ الطلب:
                ├─ status: PENDING_PAYMENT
                ├─ paymentStatus: PENDING
                ├─ localPaymentAccountId: ...
                └─ paymentReference: REF123456
```

### Flow 2: مطابقة الدفع

```
[الإدارة]
    │
    ├─ تفتح تفاصيل الطلب
    │
    ├─ ترى قسم "معلومات الدفع المحلي"
    │   ├─ رقم الحوالة: REF123456
    │   └─ حالة: في انتظار المراجعة
    │
    ├─ تضغط "مطابقة الدفع"
    │
    ├─ تدخل:
    │   ├─ المبلغ: 50000
    │   ├─ العملة: YER
    │   └─ ملاحظات: "تم التحقق"
    │
    └─ POST /admin/orders/:id/verify-payment
            │
            ├─ Backend يتحقق:
            │   ├─ الطلب يستخدم دفع محلي ✓
            │   └─ العملة مطابقة ✓
            │
            ├─ مقارنة: 50000 >= 45000?
            │   │
            │   ├─ نعم → قبول:
            │   │   ├─ paymentStatus: PAID
            │   │   ├─ status: CONFIRMED
            │   │   ├─ verifiedPaymentAmount: 50000
            │   │   └─ paymentVerifiedAt: الآن
            │   │
            │   └─ لا → رفض:
            │       ├─ paymentStatus: FAILED
            │       └─ verifiedPaymentAmount: 50000
            │
            └─ Response → Frontend يحدّث العرض
```

---

## 💡 Examples

### Example 1: إضافة حسابات البنك الكريمي

```bash
# حساب 1 - ريال يمني
curl -X POST /system-settings/payment-accounts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerName": "الكريمي",
    "iconUrl": "https://example.com/al-kuraimi.png",
    "accountNumber": "1234567890",
    "type": "bank",
    "currency": "YER",
    "displayOrder": 0
  }'

# حساب 2 - ريال سعودي
curl -X POST /system-settings/payment-accounts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerName": "الكريمي",
    "iconUrl": "https://example.com/al-kuraimi.png",
    "accountNumber": "9876543210",
    "type": "bank",
    "currency": "SAR",
    "displayOrder": 1
  }'

# حساب 3 - دولار
curl -X POST /system-settings/payment-accounts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerName": "الكريمي",
    "iconUrl": "https://example.com/al-kuraimi.png",
    "accountNumber": "5555555555",
    "type": "bank",
    "currency": "USD",
    "displayOrder": 2
  }'
```

### Example 2: جلب الحسابات للعملاء

```bash
# جميع الحسابات
GET /system-settings/payment-accounts/public

# حسابات ريال يمني فقط
GET /system-settings/payment-accounts/public?currency=YER
```

**Response:**
```json
{
  "data": [
    {
      "providerName": "الكريمي",
      "iconUrl": "https://example.com/al-kuraimi.png",
      "type": "bank",
      "accounts": [
        {
          "id": "65abc123...",
          "accountNumber": "1234567890",
          "currency": "YER",
          "isActive": true,
          "displayOrder": 0
        },
        {
          "id": "65abc124...",
          "accountNumber": "9876543210",
          "currency": "SAR",
          "isActive": true,
          "displayOrder": 1
        }
      ]
    }
  ]
}
```

### Example 3: إنشاء طلب مع دفع محلي

```bash
POST /orders/checkout/confirm
{
  "deliveryAddressId": "65abc123...",
  "currency": "YER",
  "paymentMethod": "BANK_TRANSFER",
  "localPaymentAccountId": "65abc123...",
  "paymentReference": "REF123456789"
}
```

### Example 4: مطابقة الدفع

```bash
POST /admin/orders/65abc123.../verify-payment
{
  "verifiedAmount": 50000,
  "verifiedCurrency": "YER",
  "notes": "تم التحقق من الحوالة في البنك"
}
```

**Response (Success):**
```json
{
  "order": {
    "orderNumber": "ORD-2024-123456",
    "status": "confirmed",
    "paymentStatus": "paid",
    "verifiedPaymentAmount": 50000,
    "verifiedPaymentCurrency": "YER",
    "paymentVerifiedAt": "2024-01-15T10:30:00Z"
  },
  "message": "تم قبول الدفع بنجاح",
  "paymentStatus": "paid",
  "verifiedAmount": 50000,
  "orderAmount": 45000,
  "currency": "YER"
}
```

**Response (Failed):**
```json
{
  "order": {
    "paymentStatus": "failed",
    "verifiedPaymentAmount": 40000,
    ...
  },
  "message": "تم رفض الدفع - المبلغ غير كافٍ",
  "paymentStatus": "failed",
  "verifiedAmount": 40000,
  "orderAmount": 45000,
  "currency": "YER"
}
```

---

## ✅ Checklist

### Backend
- [x] Schema للحسابات المحلية
- [x] DTOs للحسابات
- [x] Service للحسابات مع التجميع
- [x] Controller endpoints
- [x] تحديث Order Schema
- [x] تحديث Order DTOs
- [x] منطق التحقق في confirmCheckout
- [x] method verifyLocalPayment
- [x] Admin endpoint للمطابقة
- [x] تحديث Modules

### Frontend
- [x] API functions للحسابات
- [x] Types للحسابات
- [x] Tab جديد في SystemSettings
- [x] جدول عرض الحسابات
- [x] Dialog إضافة/تعديل
- [x] تحديث Order types
- [x] API function للمطابقة
- [x] Hook للمطابقة
- [x] UI للمطابقة في OrderDetails
- [x] Dialog المطابقة

### Testing (Recommended)
- [ ] Unit tests للحسابات
- [ ] Unit tests للمطابقة
- [ ] Integration tests للـ flow الكامل
- [ ] E2E tests للـ UI

---

## 🐛 Troubleshooting

### مشكلة: الحسابات لا تظهر مجمعة
**الحل:** تأكد من استخدام `getGroupedAccounts()` وليس `getAllAccounts()`

### مشكلة: المطابقة لا تعمل
**الحل:** تأكد من:
- الطلب يستخدم `BANK_TRANSFER`
- `localPaymentAccountId` موجود
- العملة مطابقة

### مشكلة: Dialog المطابقة لا يفتح
**الحل:** تأكد من:
- `paymentStatus === PENDING`
- `localPaymentAccountId` موجود

---

## 📚 المراجع

- [System Settings README](./backend/src/modules/system-settings/README.md)
- [Checkout README](./backend/src/modules/checkout/README.md)
- [Backend Local Payment Docs](./backend/src/modules/system-settings/LOCAL_PAYMENT_ACCOUNTS.md)
- [Frontend Local Payment Docs](./admin-dashboard/src/features/system-settings/LOCAL_PAYMENT_ACCOUNTS.md)

---

**تاريخ الإنشاء:** 2024  
**المطور:** AI Assistant  
**الحالة:** ✅ مكتمل وجاهز للاستخدام


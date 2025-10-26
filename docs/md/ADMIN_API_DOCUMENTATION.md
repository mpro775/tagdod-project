# Admin API Documentation - نظام إدارة العناوين

> 🔐 **جميع المسارات محمية** - تتطلب JWT Token + صلاحيات Admin

---

## 📋 جدول المحتويات

1. [الإحصائيات والتحليلات](#الإحصائيات-والتحليلات)
2. [البحث والفلترة](#البحث-والفلترة)
3. [إدارة المستخدمين](#إدارة-المستخدمين)
4. [البحث الجغرافي](#البحث-الجغرافي)

---

## 🚀 Base URL

```
/admin/addresses
```

---

## 🔐 المصادقة والصلاحيات

### Headers المطلوبة:
```http
Authorization: Bearer {admin_jwt_token}
```

### الصلاحيات المطلوبة:
- `AdminPermission.ADDRESSES_READ`
- `AdminPermission.ADMIN_ACCESS`

### الأدوار المسموحة:
- `ADMIN`
- `SUPER_ADMIN`

---

## 📊 الإحصائيات والتحليلات

### 1. الإحصائيات الشاملة

```http
GET /admin/addresses/stats
```

**الوصف:** الحصول على نظرة شاملة عن جميع العناوين في النظام

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAddresses": 1250,
    "totalActiveAddresses": 1180,
    "totalDeletedAddresses": 70,
    "totalUsers": 450,
    "averagePerUser": 2.8
  }
}
```

**Use Case:** Dashboard الرئيسية - عرض إحصائيات سريعة

---

### 2. المدن الأكثر استخداماً

```http
GET /admin/addresses/top-cities?limit=10
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 10 | عدد المدن المراد عرضها |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "city": "صنعاء",
      "count": 450,
      "activeCount": 420,
      "defaultCount": 150,
      "totalUsage": 1250,
      "percentage": 36.5
    },
    {
      "city": "عدن",
      "count": 320,
      "activeCount": 305,
      "defaultCount": 110,
      "totalUsage": 890,
      "percentage": 25.9
    }
  ]
}
```

**Use Case:**
- تخطيط خدمات التوصيل
- تحديد المناطق ذات الطلب العالي
- رسم بياني للتوزيع الجغرافي

---

### 3. العناوين الأكثر استخداماً

```http
GET /admin/addresses/most-used?limit=10
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 10 | عدد العناوين |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "label": "المنزل",
      "line1": "شارع الستين، بجوار مطعم السلطان",
      "city": "صنعاء",
      "usageCount": 15,
      "lastUsedAt": "2024-01-20T10:30:00Z",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "أحمد محمد",
        "phone": "+967771234567"
      }
    }
  ]
}
```

**Use Case:**
- تحديد العملاء الأكثر نشاطاً
- تحليل أنماط الطلبات

---

### 4. العناوين المستخدمة مؤخراً

```http
GET /admin/addresses/recently-used?limit=20
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | عدد العناوين |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "label": "المكتب",
      "line1": "شارع التحرير، مبنى التجارة",
      "city": "صنعاء",
      "usageCount": 8,
      "lastUsedAt": "2024-01-25T14:20:00Z",
      "userId": {
        "_id": "...",
        "name": "سارة علي",
        "phone": "+967777654321"
      }
    }
  ]
}
```

**Use Case:** مراقبة النشاط الأخير

---

### 5. العناوين التي لم تستخدم أبداً

```http
GET /admin/addresses/never-used?limit=20
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | عدد العناوين |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "label": "عند أمي",
      "line1": "حي السبعين، شارع الجامعة",
      "city": "صنعاء",
      "createdAt": "2024-01-10T09:15:00Z",
      "userId": {
        "_id": "...",
        "name": "محمد حسن",
        "phone": "+967773456789"
      }
    }
  ]
}
```

**Use Case:** تنظيف البيانات غير المستخدمة

---

### 6. تحليلات الاستخدام

```http
GET /admin/addresses/usage-analytics?startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | تاريخ البداية (YYYY-MM-DD) |
| endDate | string | No | تاريخ النهاية (YYYY-MM-DD) |

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsage": 3500,
      "avgUsage": 2.8,
      "maxUsage": 25,
      "addressesUsed": 1050,
      "addressesNeverUsed": 130
    },
    "dailyTrend": [
      {
        "_id": "2024-01-15",
        "count": 45
      },
      {
        "_id": "2024-01-16",
        "count": 52
      }
    ]
  }
}
```

**Use Case:**
- تحليل الاتجاهات الزمنية
- رسم بياني للاستخدام اليومي
- تقارير الأداء

---

### 7. التحليل الجغرافي

```http
GET /admin/addresses/geographic-analytics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cityDistribution": [
      {
        "_id": "صنعاء",
        "count": 450,
        "coordinates": [
          { "lat": 15.3694, "lng": 44.191 },
          { "lat": 15.3700, "lng": 44.195 }
        ]
      }
    ],
    "coordinates": [
      {
        "lat": 15.3694,
        "lng": 44.191,
        "city": "صنعاء",
        "label": "المنزل"
      }
    ],
    "totalPoints": 1250
  }
}
```

**Use Case:**
- خريطة حرارية (Heatmap)
- تحليل التوزيع الجغرافي
- تخطيط مراكز التوزيع

---

## 🔍 البحث والفلترة

### 8. قائمة جميع العناوين مع فلترة متقدمة

```http
GET /admin/addresses/list
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| userId | string | - | معرف المستخدم |
| city | string | - | المدينة |
| label | string | - | التسمية |
| isDefault | boolean | - | افتراضي فقط |
| isActive | boolean | - | نشط فقط |
| includeDeleted | boolean | false | تضمين المحذوفة |
| search | string | - | بحث نصي |
| limit | number | 20 | عدد النتائج |
| page | number | 1 | رقم الصفحة |
| sortBy | string | createdAt | الترتيب حسب |
| sortOrder | string | desc | اتجاه الترتيب |

**sortBy Options:**
- `createdAt` - تاريخ الإنشاء
- `usageCount` - عدد الاستخدامات
- `lastUsedAt` - آخر استخدام

**sortOrder Options:**
- `asc` - تصاعدي
- `desc` - تنازلي

**مثال 1: البحث عن جميع العناوين في صنعاء**
```http
GET /admin/addresses/list?city=صنعاء&limit=50
```

**مثال 2: البحث في النص**
```http
GET /admin/addresses/list?search=شارع الستين
```

**مثال 3: العناوين الأكثر استخداماً**
```http
GET /admin/addresses/list?sortBy=usageCount&sortOrder=desc&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "label": "المنزل",
      "line1": "شارع الستين، بجوار مطعم السلطان",
      "city": "صنعاء",
      "coords": {
        "lat": 15.3694,
        "lng": 44.191
      },
      "notes": "يرجى الاتصال عند الوصول",
      "isDefault": true,
      "isActive": true,
      "usageCount": 5,
      "lastUsedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2023-12-01T08:00:00Z",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "أحمد محمد",
        "phone": "+967771234567",
        "email": "ahmed@example.com",
        "isActive": true,
        "createdAt": "2023-11-15T10:00:00Z"
      }
    }
  ],
  "pagination": {
    "total": 1250,
    "page": 1,
    "limit": 20,
    "pages": 63
  }
}
```

**Use Case:**
- صفحة إدارة العناوين في Dashboard
- البحث المتقدم
- تصدير البيانات

---

## 👥 إدارة المستخدمين

### 9. عناوين مستخدم محدد

```http
GET /admin/addresses/user/:userId?includeDeleted=false
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | معرف المستخدم |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| includeDeleted | boolean | false | تضمين المحذوفة |

**مثال:**
```http
GET /admin/addresses/user/507f1f77bcf86cd799439012
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "label": "المنزل",
      "line1": "شارع الستين، بجوار مطعم السلطان",
      "city": "صنعاء",
      "coords": { "lat": 15.3694, "lng": 44.191 },
      "isDefault": true,
      "isActive": true,
      "usageCount": 5,
      "lastUsedAt": "2024-01-15T10:30:00Z"
    },
    {
      "_id": "...",
      "label": "المكتب",
      "line1": "شارع التحرير، مبنى التجارة",
      "city": "صنعاء",
      "coords": { "lat": 15.3700, "lng": 44.195 },
      "isDefault": false,
      "isActive": true,
      "usageCount": 2
    }
  ],
  "count": 2
}
```

**Use Case:**
- صفحة تفاصيل المستخدم
- دعم العملاء
- حل مشاكل التوصيل

---

### 10. عدد عناوين مستخدم محدد

```http
GET /admin/addresses/user/:userId/count
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | معرف المستخدم |

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439012",
    "count": 3
  }
}
```

**Use Case:** معلومات سريعة عن المستخدم

---

## 🗺️ البحث الجغرافي

### 11. البحث عن عناوين قريبة

```http
GET /admin/addresses/nearby?lat=15.3694&lng=44.191&radius=10&limit=20
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| lat | number | ✅ Yes | - | خط العرض |
| lng | number | ✅ Yes | - | خط الطول |
| radius | number | No | 10 | نصف القطر (كم) |
| limit | number | No | 20 | عدد النتائج |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "label": "المنزل",
      "line1": "شارع الستين، بجوار مطعم السلطان",
      "city": "صنعاء",
      "coords": {
        "lat": 15.3694,
        "lng": 44.191
      },
      "userId": {
        "_id": "...",
        "name": "أحمد محمد",
        "phone": "+967771234567"
      }
    }
  ],
  "searchParams": {
    "lat": 15.3694,
    "lng": 44.191,
    "radiusKm": 10
  }
}
```

**Use Case:**
- تخطيط مسارات التوصيل
- تحديد مناطق الخدمة
- تحليل كثافة العناوين

---

## 📱 أمثلة للاستخدام في لوحة التحكم

### Dashboard الرئيسية

```typescript
// 1. عرض الإحصائيات الأساسية
const stats = await fetch('/admin/addresses/stats');

// Widget عرض سريع
<Card>
  <h3>📍 العناوين</h3>
  <p>الإجمالي: {stats.totalAddresses}</p>
  <p>المستخدمون: {stats.totalUsers}</p>
  <p>المتوسط: {stats.averagePerUser}</p>
</Card>
```

### صفحة تحليل المدن

```typescript
// 1. جلب أهم المدن
const cities = await fetch('/admin/addresses/top-cities?limit=10');

// 2. رسم بياني
<BarChart data={cities} xKey="city" yKey="count" />

// 3. جدول تفصيلي
<Table>
  {cities.map(city => (
    <tr>
      <td>{city.city}</td>
      <td>{city.count}</td>
      <td>{city.percentage}%</td>
      <td>{city.totalUsage}</td>
    </tr>
  ))}
</Table>
```

### صفحة الخريطة الحرارية

```typescript
// 1. جلب البيانات الجغرافية
const geoData = await fetch('/admin/addresses/geographic-analytics');

// 2. عرض على خريطة
<HeatMap 
  coordinates={geoData.coordinates}
  center={{ lat: 15.3694, lng: 44.191 }}
  zoom={12}
/>
```

### صفحة إدارة العناوين

```typescript
// 1. قائمة مع فلترة
const [filters, setFilters] = useState({
  city: '',
  search: '',
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

const addresses = await fetch(
  `/admin/addresses/list?${new URLSearchParams(filters)}`
);

// 2. جدول مع Pagination
<DataTable 
  data={addresses.data}
  pagination={addresses.pagination}
  onPageChange={(page) => setFilters({...filters, page})}
/>
```

### صفحة تفاصيل المستخدم

```typescript
// في صفحة المستخدم
const userId = "507f1f77bcf86cd799439012";

// 1. جلب عدد العناوين
const { count } = await fetch(`/admin/addresses/user/${userId}/count`);

// 2. جلب العناوين
const addresses = await fetch(`/admin/addresses/user/${userId}`);

// 3. عرض في Card
<Card>
  <h3>العناوين ({count})</h3>
  {addresses.data.map(addr => (
    <AddressCard 
      key={addr._id}
      address={addr}
      isDefault={addr.isDefault}
    />
  ))}
</Card>
```

---

## 🎯 Use Cases الشائعة

### 1. تحديد مناطق التوصيل ذات الطلب العالي
```http
GET /admin/addresses/top-cities?limit=20
```

### 2. تخطيط مسارات التوصيل
```http
GET /admin/addresses/nearby?lat=15.3694&lng=44.191&radius=5
```

### 3. تحليل سلوك العملاء
```http
GET /admin/addresses/usage-analytics?startDate=2024-01-01&endDate=2024-01-31
```

### 4. دعم عميل محدد
```http
GET /admin/addresses/user/507f1f77bcf86cd799439012
```

### 5. تحديد العناوين غير المستخدمة للتنظيف
```http
GET /admin/addresses/never-used?limit=100
```

### 6. البحث عن عناوين في منطقة محددة
```http
GET /admin/addresses/list?city=صنعاء&search=شارع الستين
```

---

## 🔒 الأمان

### الحماية المطبقة:

1. ✅ **JWT Authentication** - جميع المسارات محمية
2. ✅ **Role-Based Access** - Admin/Super Admin فقط
3. ✅ **Permission Checks** - `ADDRESSES_READ` مطلوب
4. ✅ **Admin Guard** - تحقق إضافي
5. ✅ **Logging** - تسجيل جميع العمليات

### مثال Header:
```http
GET /admin/addresses/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 الأداء

### Optimizations المطبقة:

1. ✅ **Indexes** - على userId, city, coords (2dsphere)
2. ✅ **Lean Queries** - لتقليل استهلاك الذاكرة
3. ✅ **Pagination** - تجنب تحميل كميات كبيرة
4. ✅ **Aggregation Pipeline** - للإحصائيات
5. ✅ **Populate** - جلب معلومات المستخدم فقط عند الحاجة

---

## 🎨 مثال واجهة لوحة التحكم

```
┌─────────────────────────────────────────────────────────────┐
│ 📍 لوحة تحكم العناوين                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 نظرة سريعة                                             │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │ الإجمالي │ النشطة  │ المحذوفة │ المستخدمون│            │
│  │  1,250   │  1,180   │    70    │    450   │            │
│  └──────────┴──────────┴──────────┴──────────┘            │
│                                                             │
│  🏙️ أهم المدن                                              │
│  ┌────────────────────────────────────┐                    │
│  │ 1. صنعاء    450 (36.5%)  ████████  │                    │
│  │ 2. عدن      320 (25.9%)  ██████    │                    │
│  │ 3. تعز      280 (22.7%)  █████     │                    │
│  └────────────────────────────────────┘                    │
│                                                             │
│  📈 تحليل الاستخدام                                        │
│  ┌────────────────────────────────────┐                    │
│  │ العناوين المستخدمة:      1,050     │                    │
│  │ العناوين غير المستخدمة:    130     │                    │
│  │ متوسط الاستخدام:           2.8     │                    │
│  │ الحد الأقصى:                25     │                    │
│  └────────────────────────────────────┘                    │
│                                                             │
│  🗺️ الخريطة الحرارية                                       │
│  [خريطة تفاعلية تعرض توزيع العناوين]                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ الملخص

تم إضافة **11 endpoint** جديد للأدمن:

### الإحصائيات (7):
1. ✅ `/stats` - إحصائيات شاملة
2. ✅ `/top-cities` - أهم المدن
3. ✅ `/most-used` - الأكثر استخداماً
4. ✅ `/recently-used` - المستخدمة مؤخراً
5. ✅ `/never-used` - غير المستخدمة
6. ✅ `/usage-analytics` - تحليل الاستخدام
7. ✅ `/geographic-analytics` - التحليل الجغرافي

### البحث والإدارة (4):
8. ✅ `/list` - قائمة مع فلترة متقدمة
9. ✅ `/user/:userId` - عناوين مستخدم
10. ✅ `/user/:userId/count` - عدد العناوين
11. ✅ `/nearby` - بحث جغرافي

---

**الحالة:** ✅ **جاهز للإنتاج**

**Version:** 1.0.0

**Last Updated:** يناير 2024


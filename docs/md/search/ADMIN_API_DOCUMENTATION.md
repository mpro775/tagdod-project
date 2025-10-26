
# Admin API Documentation - نظام إدارة البحث

> 🔍 **جميع المسارات محمية** - تتطلب JWT Token + صلاحيات Admin

---

## 📋 جدول المحتويات

1. [الإحصائيات والتحليلات](#الإحصائيات-والتحليلات)
2. [سجلات البحث](#سجلات-البحث)
3. [تحليل المحتوى](#تحليل-المحتوى)
4. [الأداء والنظام](#الأداء-والنظام)

---

## 🚀 Base URL

```
/admin/search
```

---

## 🔐 المصادقة والصلاحيات

### Headers المطلوبة:
```http
Authorization: Bearer {admin_jwt_token}
```

### الصلاحيات المطلوبة:
- `AdminPermission.ANALYTICS_READ` - للإحصائيات والتحليلات
- `AdminPermission.SYSTEM_MAINTENANCE` - لإدارة النظام
- `AdminPermission.ADMIN_ACCESS` - وصول عام للأدمن

### الأدوار المسموحة:
- `ADMIN`
- `SUPER_ADMIN`

---

## 📊 الإحصائيات والتحليلات

### 1. الإحصائيات الشاملة

```http
GET /admin/search/stats
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | تاريخ البداية (YYYY-MM-DD) |
| endDate | string | No | تاريخ النهاية (YYYY-MM-DD) |
| language | string | No | ar \| en |
| entityType | string | No | products \| categories \| brands \| all |

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSearches": 15420,
    "totalUniqueQueries": 3250,
    "averageResultsPerSearch": 8.5,
    "zeroResultSearches": 420,
    "zeroResultsPercentage": 2.7,
    "averageResponseTime": 125,
    "topLanguage": "ar",
    "topEntityType": "products"
  }
}
```

**Use Case:** Dashboard الرئيسية - نظرة شاملة على أداء البحث

---

### 2. الكلمات المفتاحية الأكثر بحثاً

```http
GET /admin/search/top-terms?limit=20
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | عدد النتائج |
| startDate | string | - | تاريخ البداية |
| endDate | string | - | تاريخ النهاية |
| language | string | - | ar \| en |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "query": "هاتف سامسونج",
      "count": 450,
      "hasResults": true,
      "averageResults": 12
    },
    {
      "query": "لاب توب",
      "count": 380,
      "hasResults": true,
      "averageResults": 25
    }
  ]
}
```

**Use Case:**
- فهم ما يبحث عنه العملاء
- تحسين المحتوى والمنتجات
- تطوير استراتيجية تسويقية

---

### 3. عمليات البحث بدون نتائج

```http
GET /admin/search/zero-results?limit=20&page=1
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | عدد النتائج |
| page | number | 1 | رقم الصفحة |
| startDate | string | - | تاريخ البداية |
| endDate | string | - | تاريخ النهاية |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "query": "ايفون 15 برو ماكس",
      "count": 45,
      "lastSearchedAt": "2024-01-25T10:30:00Z"
    },
    {
      "query": "شاحن سريع 100 وات",
      "count": 32,
      "lastSearchedAt": "2024-01-24T15:20:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

**Use Case:**
- تحديد المنتجات المطلوبة والمفقودة
- تحسين قاعدة البيانات
- إضافة منتجات جديدة بناءً على الطلب

---

### 4. اتجاهات البحث عبر الزمن

```http
GET /admin/search/trends?startDate=2024-01-01&endDate=2024-01-31&groupBy=day
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| startDate | string | - | تاريخ البداية |
| endDate | string | - | تاريخ النهاية |
| groupBy | string | day | day \| week \| month |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "count": 450,
      "uniqueQueries": 120
    },
    {
      "date": "2024-01-16",
      "count": 520,
      "uniqueQueries": 135
    }
  ]
}
```

**Use Case:**
- رسم بياني لاتجاهات البحث
- تحديد أوقات الذروة
- التخطيط للعروض والحملات

---

## 📋 سجلات البحث

### 5. سجلات عمليات البحث

```http
GET /admin/search/logs
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | نص البحث للفلترة |
| userId | string | No | معرف المستخدم |
| hasResults | boolean | No | وجود نتائج |
| startDate | string | No | تاريخ البداية |
| endDate | string | No | تاريخ النهاية |
| limit | number | No | عدد النتائج (default: 20) |
| page | number | No | رقم الصفحة (default: 1) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "log_123",
      "query": "هاتف سامسونج",
      "language": "ar",
      "entityType": "products",
      "resultsCount": 12,
      "hasResults": true,
      "userId": "user_456",
      "userIp": "192.168.1.100",
      "responseTime": 120,
      "createdAt": "2024-01-25T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 15420,
    "page": 1,
    "limit": 20,
    "pages": 771
  }
}
```

**Use Case:** تتبع ومراقبة عمليات البحث

---

## 🎯 تحليل المحتوى

### 6. المنتجات الأكثر ظهوراً في البحث

```http
GET /admin/search/most-searched-products?limit=20
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | عدد النتائج |
| startDate | string | - | تاريخ البداية |
| endDate | string | - | تاريخ النهاية |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "هاتف سامسونج جالاكسي",
      "nameEn": "Samsung Galaxy Phone",
      "mainImage": "https://...",
      "viewsCount": 1250,
      "rating": 4.5,
      "reviewsCount": 85,
      "isFeatured": true,
      "category": {
        "_id": "cat_123",
        "name": "الهواتف الذكية",
        "nameEn": "Smartphones"
      },
      "brand": {
        "_id": "brand_456",
        "name": "سامسونج",
        "nameEn": "Samsung"
      }
    }
  ]
}
```

**Use Case:**
- تحديد المنتجات الأكثر شعبية
- تحسين المخزون
- تخطيط العروض الترويجية

---

### 7. الفئات الأكثر بحثاً

```http
GET /admin/search/most-searched-categories?limit=10
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 10 | عدد النتائج |
| startDate | string | - | تاريخ البداية |
| endDate | string | - | تاريخ النهاية |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "cat_123",
      "name": "الهواتف الذكية",
      "nameEn": "Smartphones",
      "image": "https://...",
      "productsCount": 145,
      "isFeatured": true
    },
    {
      "_id": "cat_456",
      "name": "اللابتوبات",
      "nameEn": "Laptops",
      "image": "https://...",
      "productsCount": 89,
      "isFeatured": true
    }
  ]
}
```

**Use Case:** فهم الفئات المطلوبة

---

### 8. العلامات التجارية الأكثر بحثاً

```http
GET /admin/search/most-searched-brands?limit=10
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 10 | عدد النتائج |
| startDate | string | - | تاريخ البداية |
| endDate | string | - | تاريخ النهاية |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "brand_123",
      "name": "سامسونج",
      "nameEn": "Samsung",
      "image": "https://...",
      "productCount": 156
    },
    {
      "_id": "brand_456",
      "name": "أبل",
      "nameEn": "Apple",
      "image": "https://...",
      "productCount": 142
    }
  ]
}
```

**Use Case:** تحديد البراندات الأكثر شعبية

---

## ⚡ الأداء والنظام

### 9. مؤشرات أداء البحث

```http
GET /admin/search/performance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "indexedData": {
      "totalProducts": 1250,
      "activeProducts": 1180,
      "totalCategories": 45,
      "totalBrands": 32
    },
    "cacheStatus": {
      "searchCacheTTL": 300,
      "suggestionsCacheTTL": 1800,
      "facetsCacheTTL": 600
    },
    "systemHealth": "healthy"
  }
}
```

**Use Case:** مراقبة صحة نظام البحث

---

### 10. مسح ذاكرة التخزين المؤقت

```http
POST /admin/search/clear-cache
```

**Response:**
```json
{
  "success": true,
  "message": "Search caches cleared successfully"
}
```

**Use Case:**
- بعد تحديث المنتجات
- عند إضافة محتوى جديد
- لحل مشاكل الأداء

⚠️ **تحذير:** سيؤدي هذا لبطء مؤقت في البحث حتى يتم إعادة بناء الكاش

---

## 📱 أمثلة للاستخدام في لوحة التحكم

### Dashboard Widget للإحصائيات

```typescript
// عرض إحصائيات البحث في Dashboard
function SearchStatsWidget() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch('/admin/search/stats', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    .then(res => res.json())
    .then(data => setStats(data.data));
  }, []);
  
  return (
    <Card>
      <h3>🔍 إحصائيات البحث</h3>
      <div className="stats-grid">
        <div>
          <span>إجمالي عمليات البحث</span>
          <strong>{stats?.totalSearches}</strong>
        </div>
        <div>
          <span>استعلامات فريدة</span>
          <strong>{stats?.totalUniqueQueries}</strong>
        </div>
        <div>
          <span>بحث بدون نتائج</span>
          <strong className="warning">
            {stats?.zeroResultSearches} ({stats?.zeroResultsPercentage}%)
          </strong>
        </div>
        <div>
          <span>متوسط وقت الاستجابة</span>
          <strong>{stats?.averageResponseTime}ms</strong>
        </div>
      </div>
    </Card>
  );
}
```

### صفحة الكلمات المفتاحية الشائعة

```typescript
// عرض الكلمات الأكثر بحثاً
function TopSearchTermsPage() {
  const [terms, setTerms] = useState([]);
  
  useEffect(() => {
    fetch('/admin/search/top-terms?limit=50', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    .then(res => res.json())
    .then(data => setTerms(data.data));
  }, []);
  
  return (
    <div>
      <h2>📈 الكلمات المفتاحية الأكثر بحثاً</h2>
      
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>الكلمة</th>
            <th>عدد المرات</th>
            <th>متوسط النتائج</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {terms.map((term, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{term.query}</td>
              <td>{term.count}</td>
              <td>{term.averageResults}</td>
              <td>
                {term.hasResults ? 
                  <span className="success">✓ نتائج</span> : 
                  <span className="error">✗ بدون نتائج</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
```

### صفحة البحث بدون نتائج

```typescript
// تحليل عمليات البحث الفاشلة
function ZeroResultsAnalysis() {
  const [zeroResults, setZeroResults] = useState([]);
  
  useEffect(() => {
    fetch('/admin/search/zero-results?limit=100', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    .then(res => res.json())
    .then(data => setZeroResults(data.data));
  }, []);
  
  return (
    <div>
      <h2>⚠️ عمليات البحث بدون نتائج</h2>
      <p className="info">
        هذه الكلمات المفتاحية بحث عنها العملاء ولم يجدوا نتائج. 
        يمكنك إضافة منتجات تتوافق مع هذه الكلمات.
      </p>
      
      <div className="alert alert-warning">
        <strong>توصية:</strong> راجع هذه الكلمات وأضف منتجات مناسبة لها
      </div>
      
      {zeroResults.map((item, idx) => (
        <div key={idx} className="zero-result-card">
          <strong>{item.query}</strong>
          <span>{item.count} مرة</span>
          <span>آخر بحث: {new Date(item.lastSearchedAt).toLocaleDateString('ar')}</span>
          <button onClick={() => handleAddProduct(item.query)}>
            + إضافة منتج
          </button>
        </div>
      ))}
    </div>
  );
}
```

### رسم بياني للاتجاهات

```typescript
// اتجاهات البحث عبر الزمن
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

function SearchTrendsChart() {
  const [trends, setTrends] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  });
  
  useEffect(() => {
    const params = new URLSearchParams(dateRange);
    
    fetch(`/admin/search/trends?${params}&groupBy=day`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    .then(res => res.json())
    .then(data => setTrends(data.data));
  }, [dateRange]);
  
  return (
    <div>
      <h2>📊 اتجاهات البحث</h2>
      
      <div className="date-range">
        <input 
          type="date" 
          value={dateRange.startDate}
          onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
        />
        <span>إلى</span>
        <input 
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
        />
      </div>
      
      <LineChart width={800} height={400} data={trends}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="count" 
          stroke="#8884d8" 
          name="عمليات البحث"
        />
        <Line 
          type="monotone" 
          dataKey="uniqueQueries" 
          stroke="#82ca9d" 
          name="استعلامات فريدة"
        />
      </LineChart>
    </div>
  );
}
```

---

## 🎯 Use Cases الشائعة

### 1. تحسين المحتوى والمنتجات
```http
# احصل على البحث بدون نتائج
GET /admin/search/zero-results?limit=50

# احصل على الكلمات الأكثر بحثاً
GET /admin/search/top-terms?limit=20
```
→ استخدم هذه البيانات لإضافة منتجات جديدة

### 2. تحليل سلوك المستخدمين
```http
# اتجاهات البحث
GET /admin/search/trends?startDate=2024-01-01&groupBy=week

# المنتجات الأكثر شعبية
GET /admin/search/most-searched-products?limit=20
```
→ فهم ما يبحث عنه العملاء

### 3. تحسين الأداء
```http
# مراقبة الأداء
GET /admin/search/performance

# مسح الكاش عند الحاجة
POST /admin/search/clear-cache
```
→ الحفاظ على سرعة البحث

### 4. التخطيط التسويقي
```http
# المنتجات الأكثر ظهوراً
GET /admin/search/most-searched-products

# الفئات الأكثر بحثاً
GET /admin/search/most-searched-categories

# البراندات الشائعة
GET /admin/search/most-searched-brands
```
→ تخطيط الحملات الترويجية

---

## 🔒 الأمان

### الحماية المطبقة:

1. ✅ **JWT Authentication** - جميع المسارات محمية
2. ✅ **Role-Based Access** - Admin/Super Admin فقط
3. ✅ **Permission Checks** - `ANALYTICS_READ` مطلوب
4. ✅ **Admin Guard** - تحقق إضافي
5. ✅ **Logging** - تسجيل جميع العمليات

---

## 📊 الأداء

### Optimizations المطبقة:

1. ✅ **Caching** - نتائج البحث مخزنة مؤقتاً
2. ✅ **Indexes** - على Search Logs للأداء
3. ✅ **Aggregation Pipeline** - للإحصائيات
4. ✅ **Lean Queries** - تقليل استهلاك الذاكرة
5. ✅ **Pagination** - جميع القوائم paginated

---

## ✅ الملخص

تم إضافة **10 endpoints** جديد للأدمن:

### الإحصائيات (4):
1. ✅ `/stats` - إحصائيات شاملة
2. ✅ `/top-terms` - الكلمات الأكثر بحثاً
3. ✅ `/zero-results` - بحث بدون نتائج
4. ✅ `/trends` - اتجاهات البحث

### السجلات (1):
5. ✅ `/logs` - سجلات عمليات البحث

### تحليل المحتوى (3):
6. ✅ `/most-searched-products` - المنتجات الأكثر ظهوراً
7. ✅ `/most-searched-categories` - الفئات الأكثر بحثاً
8. ✅ `/most-searched-brands` - البراندات الشائعة

### النظام (2):
9. ✅ `/performance` - مؤشرات الأداء
10. ✅ `/clear-cache` - مسح الكاش

---

**الحالة:** ✅ **جاهز للإنتاج**

**Version:** 1.0.0

**Last Updated:** يناير 2024


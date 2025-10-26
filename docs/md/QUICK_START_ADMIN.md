# 🚀 دليل البدء السريع - Admin Addresses API

> دليل سريع للبدء باستخدام مسارات Admin للعناوين

---

## 🔑 المصادقة

جميع المسارات تتطلب:

```http
Authorization: Bearer {admin_jwt_token}
```

---

## 📊 أمثلة سريعة

### 1. عرض الإحصائيات في Dashboard

```typescript
// Frontend: Dashboard Component
import { useEffect, useState } from 'react';

function AddressesStatsWidget() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch('/admin/addresses/stats', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    })
    .then(res => res.json())
    .then(data => setStats(data.data));
  }, []);
  
  return (
    <div className="stats-card">
      <h3>📍 العناوين</h3>
      <div className="stats-grid">
        <div>
          <span>الإجمالي</span>
          <strong>{stats?.totalAddresses}</strong>
        </div>
        <div>
          <span>النشطة</span>
          <strong>{stats?.totalActiveAddresses}</strong>
        </div>
        <div>
          <span>المستخدمون</span>
          <strong>{stats?.totalUsers}</strong>
        </div>
        <div>
          <span>المتوسط</span>
          <strong>{stats?.averagePerUser}</strong>
        </div>
      </div>
    </div>
  );
}
```

---

### 2. رسم بياني للمدن

```typescript
// Frontend: Cities Chart
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

function TopCitiesChart() {
  const [cities, setCities] = useState([]);
  
  useEffect(() => {
    fetch('/admin/addresses/top-cities?limit=10', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    .then(res => res.json())
    .then(data => setCities(data.data));
  }, []);
  
  return (
    <div>
      <h3>🏙️ المدن الأكثر استخداماً</h3>
      <BarChart width={600} height={300} data={cities}>
        <XAxis dataKey="city" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </div>
  );
}
```

---

### 3. جدول العناوين مع بحث وفلترة

```typescript
// Frontend: Addresses Table
function AddressesTable() {
  const [addresses, setAddresses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    city: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  useEffect(() => {
    const params = new URLSearchParams(filters);
    
    fetch(`/admin/addresses/list?${params}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    .then(res => res.json())
    .then(data => {
      setAddresses(data.data);
      setPagination(data.pagination);
    });
  }, [filters]);
  
  return (
    <div>
      <div className="filters">
        <input 
          placeholder="بحث..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
        
        <select 
          value={filters.city}
          onChange={(e) => setFilters({...filters, city: e.target.value})}
        >
          <option value="">جميع المدن</option>
          <option value="صنعاء">صنعاء</option>
          <option value="عدن">عدن</option>
          <option value="تعز">تعز</option>
        </select>
        
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
        >
          <option value="createdAt">تاريخ الإنشاء</option>
          <option value="usageCount">عدد الاستخدام</option>
          <option value="lastUsedAt">آخر استخدام</option>
        </select>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>المستخدم</th>
            <th>التسمية</th>
            <th>العنوان</th>
            <th>المدينة</th>
            <th>الاستخدام</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {addresses.map(addr => (
            <tr key={addr._id}>
              <td>
                {addr.userId?.name}<br/>
                <small>{addr.userId?.phone}</small>
              </td>
              <td>
                {addr.label}
                {addr.isDefault && <span className="badge">افتراضي</span>}
              </td>
              <td>{addr.line1}</td>
              <td>{addr.city}</td>
              <td>{addr.usageCount} مرة</td>
              <td>
                <span className={addr.isActive ? 'active' : 'inactive'}>
                  {addr.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="pagination">
        <button 
          disabled={pagination.page === 1}
          onClick={() => setFilters({...filters, page: filters.page - 1})}
        >
          السابق
        </button>
        
        <span>صفحة {pagination.page} من {pagination.pages}</span>
        
        <button 
          disabled={pagination.page === pagination.pages}
          onClick={() => setFilters({...filters, page: filters.page + 1})}
        >
          التالي
        </button>
      </div>
    </div>
  );
}
```

---

### 4. عرض عناوين المستخدم في صفحته

```typescript
// Frontend: User Profile - Addresses Section
function UserAddresses({ userId }) {
  const [addresses, setAddresses] = useState([]);
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // جلب العدد
    fetch(`/admin/addresses/user/${userId}/count`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    .then(res => res.json())
    .then(data => setCount(data.data.count));
    
    // جلب العناوين
    fetch(`/admin/addresses/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    .then(res => res.json())
    .then(data => setAddresses(data.data));
  }, [userId]);
  
  return (
    <div className="user-addresses">
      <h3>العناوين ({count})</h3>
      
      {addresses.length === 0 ? (
        <p>لا توجد عناوين لهذا المستخدم</p>
      ) : (
        <div className="addresses-list">
          {addresses.map(addr => (
            <div key={addr._id} className="address-card">
              <div className="address-header">
                <strong>{addr.label}</strong>
                {addr.isDefault && <span className="badge-default">⭐ افتراضي</span>}
              </div>
              <p>{addr.line1}</p>
              <p>{addr.city}</p>
              {addr.notes && (
                <p className="notes">📝 {addr.notes}</p>
              )}
              <div className="address-meta">
                <small>استخدم {addr.usageCount} مرة</small>
                {addr.lastUsedAt && (
                  <small>آخر استخدام: {new Date(addr.lastUsedAt).toLocaleDateString('ar')}</small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 5. خريطة حرارية للتوزيع الجغرافي

```typescript
// Frontend: Heatmap Component
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

function AddressesHeatMap() {
  const [geoData, setGeoData] = useState(null);
  
  useEffect(() => {
    fetch('/admin/addresses/geographic-analytics', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    .then(res => res.json())
    .then(data => setGeoData(data.data));
  }, []);
  
  if (!geoData) return <div>جاري التحميل...</div>;
  
  return (
    <div>
      <h3>🗺️ التوزيع الجغرافي ({geoData.totalPoints} عنوان)</h3>
      
      <MapContainer 
        center={[15.3694, 44.191]} 
        zoom={10}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {geoData.coordinates.map((coord, idx) => (
          <CircleMarker
            key={idx}
            center={[coord.lat, coord.lng]}
            radius={5}
            fillColor="blue"
            color="blue"
          >
            <Popup>
              <strong>{coord.label}</strong><br/>
              {coord.city}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      <div className="cities-summary">
        <h4>توزيع المدن</h4>
        {geoData.cityDistribution.map(city => (
          <div key={city._id}>
            <span>{city._id}</span>
            <strong>{city.count} عنوان</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 6. تحليل الاستخدام مع رسم بياني زمني

```typescript
// Frontend: Usage Analytics
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

function UsageAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  });
  
  useEffect(() => {
    const params = new URLSearchParams(dateRange);
    
    fetch(`/admin/addresses/usage-analytics?${params}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    .then(res => res.json())
    .then(data => setAnalytics(data.data));
  }, [dateRange]);
  
  if (!analytics) return <div>جاري التحميل...</div>;
  
  return (
    <div>
      <h3>📈 تحليل الاستخدام</h3>
      
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
      
      <div className="stats-summary">
        <div>
          <span>إجمالي الاستخدام</span>
          <strong>{analytics.stats.totalUsage}</strong>
        </div>
        <div>
          <span>متوسط الاستخدام</span>
          <strong>{analytics.stats.avgUsage.toFixed(2)}</strong>
        </div>
        <div>
          <span>عناوين مستخدمة</span>
          <strong>{analytics.stats.addressesUsed}</strong>
        </div>
        <div>
          <span>عناوين غير مستخدمة</span>
          <strong>{analytics.stats.addressesNeverUsed}</strong>
        </div>
      </div>
      
      {analytics.dailyTrend.length > 0 && (
        <div>
          <h4>الاتجاه اليومي</h4>
          <LineChart width={600} height={300} data={analytics.dailyTrend}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 حالات استخدام شائعة

### البحث عن عناوين في منطقة محددة
```http
GET /admin/addresses/list?city=صنعاء&search=شارع الستين
```

### العناوين الأكثر استخداماً
```http
GET /admin/addresses/list?sortBy=usageCount&sortOrder=desc&limit=20
```

### العناوين التي لم تستخدم للتنظيف
```http
GET /admin/addresses/never-used?limit=100
```

### تحليل منطقة جغرافية
```http
GET /admin/addresses/nearby?lat=15.3694&lng=44.191&radius=5
```

---

## 📚 المراجع الكاملة

- **[التوثيق الكامل](./ADMIN_API_DOCUMENTATION.md)** - جميع Endpoints بالتفصيل
- **[ملخص التكامل](./ADMIN_INTEGRATION_SUMMARY.md)** - نظرة شاملة على النظام
- **[README](./README.md)** - الدليل الرئيسي

---

## ✅ جاهز للاستخدام!

يمكنك البدء فوراً باستخدام هذه الأمثلة في لوحة التحكم الخاصة بك.

**نصيحة:** استخدم أدوات مثل Postman أو Thunder Client لاختبار المسارات أولاً قبل التطبيق في Frontend.


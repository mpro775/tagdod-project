# Quick Start Guide - Brands & Banners
# دليل البداية السريعة - البراندات والبنرات

## 🚀 Getting Started / البداية السريعة

### 1. الأدمن يُنشئ براند

```bash
curl -X POST http://localhost:3000/admin/brands \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung",
    "image": "https://example.com/samsung-logo.png",
    "description": "Leading electronics brand",
    "isActive": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Brand created successfully",
  "data": {
    "_id": "65abc123def456789",
    "name": "Samsung",
    "slug": "samsung",
    "image": "https://example.com/samsung-logo.png",
    "description": "Leading electronics brand",
    "isActive": true,
    "sortOrder": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. الأدمن يُنشئ منتج مع براند

```bash
curl -X POST http://localhost:3000/admin/catalog/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung Galaxy S24",
    "categoryId": "65xyz789abc",
    "brandId": "65abc123def456789",
    "description": "Latest flagship smartphone",
    "images": [
      {"url": "https://example.com/s24.jpg", "sort": 0}
    ]
  }'
```

---

### 3. الأدمن يُنشئ بنر

```bash
curl -X POST http://localhost:3000/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Sale 2024",
    "description": "Up to 50% off on all products",
    "image": "https://example.com/summer-banner.jpg",
    "type": "image",
    "location": "home_top",
    "linkUrl": "/products?sale=true",
    "linkText": "Shop Now",
    "isActive": true,
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-08-31T23:59:59Z"
  }'
```

---

### 4. المستخدم يحصل على البراندات (بدون تسجيل)

```bash
curl http://localhost:3000/brands
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123def456789",
      "name": "Samsung",
      "slug": "samsung",
      "image": "https://example.com/samsung-logo.png",
      "description": "Leading electronics brand",
      "isActive": true,
      "sortOrder": 0
    },
    {
      "_id": "65def456ghi789012",
      "name": "Apple",
      "slug": "apple",
      "image": "https://example.com/apple-logo.png",
      "isActive": true,
      "sortOrder": 1
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 5. المستخدم يحصل على البنرات (بدون تسجيل)

```bash
curl http://localhost:3000/banners?location=home_top
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65ghi789jkl012345",
      "title": "Summer Sale 2024",
      "description": "Up to 50% off on all products",
      "image": "https://example.com/summer-banner.jpg",
      "type": "image",
      "location": "home_top",
      "linkUrl": "/products?sale=true",
      "linkText": "Shop Now",
      "sortOrder": 0,
      "viewCount": 1250,
      "clickCount": 145
    }
  ]
}
```

---

### 6. المستخدم يحصل على منتجات براند معين

```bash
# Get all Samsung products
curl http://localhost:3000/products?brandId=65abc123def456789

# Get Samsung smartphones only
curl http://localhost:3000/products?brandId=65abc123def456789&categoryId=65xyz789abc
```

---

### 7. المستخدم يحصل على الفئات المتاحة لبراند

```bash
curl http://localhost:3000/brands/65abc123def456789/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65xyz789abc",
      "name": "Smartphones",
      "slug": "smartphones",
      "path": "/electronics/smartphones",
      "depth": 1
    },
    {
      "_id": "65mno345pqr",
      "name": "Tablets",
      "slug": "tablets",
      "path": "/electronics/tablets",
      "depth": 1
    }
  ]
}
```

---

### 8. تتبع إحصائيات البنر

```bash
# Track view
curl -X POST http://localhost:3000/banners/65ghi789jkl012345/view

# Track click
curl -X POST http://localhost:3000/banners/65ghi789jkl012345/click
```

---

## 📱 Frontend Integration Examples / أمثلة التكامل

### React - Homepage with Brands and Banners

```jsx
import React, { useEffect, useState } from 'react';

function Homepage() {
  const [banners, setBanners] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    // Load banners
    fetch('/banners?location=home_top')
      .then(res => res.json())
      .then(data => setBanners(data.data));

    // Load brands
    fetch('/brands?limit=10')
      .then(res => res.json())
      .then(data => setBrands(data.data));
  }, []);

  return (
    <div>
      {/* Banners Section */}
      <div className="banners">
        {banners.map(banner => (
          <div key={banner._id} onClick={() => trackAndNavigate(banner)}>
            <img src={banner.image} alt={banner.title} />
            <h2>{banner.title}</h2>
            <button>{banner.linkText}</button>
          </div>
        ))}
      </div>

      {/* Brands Section */}
      <div className="brands">
        <h2>Shop by Brand</h2>
        {brands.map(brand => (
          <a key={brand._id} href={`/brands/${brand.slug}`}>
            <img src={brand.image} alt={brand.name} />
            <span>{brand.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

async function trackAndNavigate(banner) {
  await fetch(`/banners/${banner._id}/click`, { method: 'POST' });
  window.location.href = banner.linkUrl;
}
```

### React - Brand Page

```jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function BrandPage() {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadBrand();
  }, [slug]);

  async function loadBrand() {
    // Get brand
    const brandRes = await fetch(`/brands/slug/${slug}`);
    const brandData = await brandRes.json();
    setBrand(brandData.data);

    // Get categories
    const catsRes = await fetch(`/brands/${brandData.data._id}/categories`);
    const catsData = await catsRes.json();
    setCategories(catsData.data);

    // Get products
    loadProducts(brandData.data._id);
  }

  async function loadProducts(brandId, categoryId = null) {
    const url = categoryId 
      ? `/products?brandId=${brandId}&categoryId=${categoryId}`
      : `/products?brandId=${brandId}`;
    
    const res = await fetch(url);
    const data = await res.json();
    setProducts(data.data);
  }

  if (!brand) return <div>Loading...</div>;

  return (
    <div>
      {/* Brand Header */}
      <div className="brand-header">
        <img src={brand.image} alt={brand.name} />
        <h1>{brand.name}</h1>
        <p>{brand.description}</p>
      </div>

      {/* Category Filter */}
      <div className="filters">
        <button onClick={() => loadProducts(brand._id)}>All</button>
        {categories.map(cat => (
          <button 
            key={cat._id}
            onClick={() => {
              setSelectedCategory(cat._id);
              loadProducts(brand._id, cat._id);
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="products">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Common Use Cases / حالات الاستخدام الشائعة

### Use Case 1: Brand Landing Page
```
User clicks brand → Loads /brands/samsung
→ Shows brand info
→ Shows all Samsung products
→ Shows category filters (Smartphones, Tablets, etc.)
→ User can filter by category
```

### Use Case 2: Banner Campaign
```
Admin creates banner with date range
→ Banner shows only during campaign period
→ Users click banner
→ System tracks clicks and views
→ Admin analyzes performance (CTR)
```

### Use Case 3: Multi-filter Product Search
```
User wants: Samsung smartphones under $500
→ /products?brandId=XXX&categoryId=YYY&maxPrice=500
```

---

## ⚡ Performance Tips / نصائح الأداء

1. **Cache brands on frontend** (they rarely change)
2. **Lazy load banner images**
3. **Track banner views smartly** (once per session)
4. **Use CDN for images**
5. **Implement infinite scroll for products**

---

## 🔧 Admin Panel Integration / تكامل لوحة التحكم

### Admin Dashboard Should Include:

1. **Brands Management**
   - List all brands
   - Create/Edit/Delete brands
   - Toggle active status
   - Reorder brands (drag & drop)

2. **Banners Management**
   - List all banners by location
   - Create/Edit/Delete banners
   - Set date ranges
   - View analytics (views, clicks, CTR)
   - Toggle active status

3. **Products Management**
   - Assign brand when creating product
   - Bulk assign brands to products
   - Filter products by brand

---

## 📊 Analytics Dashboard Example

```jsx
function BannersAnalytics() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetch('/admin/banners')
      .then(res => res.json())
      .then(data => setBanners(data.data));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Banner</th>
          <th>Location</th>
          <th>Views</th>
          <th>Clicks</th>
          <th>CTR</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {banners.map(banner => (
          <tr key={banner._id}>
            <td>{banner.title}</td>
            <td>{banner.location}</td>
            <td>{banner.viewCount}</td>
            <td>{banner.clickCount}</td>
            <td>
              {banner.viewCount > 0 
                ? ((banner.clickCount / banner.viewCount) * 100).toFixed(2)
                : 0}%
            </td>
            <td>
              <span className={banner.isActive ? 'active' : 'inactive'}>
                {banner.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## ✅ Checklist for Launch / قائمة الإطلاق

- [ ] Create at least 5 brands
- [ ] Assign brands to existing products
- [ ] Create 3-5 homepage banners
- [ ] Set up banner rotation
- [ ] Test brand pages
- [ ] Test category filtering on brand pages
- [ ] Verify banner tracking works
- [ ] Check mobile responsiveness
- [ ] Test all admin endpoints
- [ ] Monitor performance metrics

---

## 🐛 Troubleshooting / حل المشاكل

### Problem: Products not showing on brand page
**Solution:** Make sure products have `brandId` set. Update existing products:
```bash
curl -X PATCH http://localhost:3000/admin/catalog/products/{productId} \
  -H "Authorization: Bearer TOKEN" \
  -d '{"brandId": "BRAND_ID"}'
```

### Problem: Banner not showing
**Check:**
1. `isActive` = true
2. Current date is between `startDate` and `endDate`
3. `location` parameter matches your query

### Problem: Categories not showing for brand
**Solution:** Make sure you have products with that brand in different categories

---

## 📞 Need Help? / تحتاج مساعدة؟

Check documentation:
- `/backend/src/modules/brands/README.md`
- `/backend/src/modules/banners/README.md`
- `/backend/BRANDS_BANNERS_INTEGRATION_GUIDE.md`

Or check API documentation at: `http://localhost:3000/api-docs`


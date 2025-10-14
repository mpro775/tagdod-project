# Brands & Banners Integration Guide
# دليل التكامل الشامل لأنظمة البراندات والبنرات

## نظرة عامة / Overview

تم إضافة نظامين جديدين إلى المشروع:
1. **نظام البراندات (Brands)**: لإدارة العلامات التجارية وربطها بالمنتجات
2. **نظام البنرات (Banners)**: لإدارة الإعلانات والعروض في مواقع مختلفة

---

## 📦 Structure / البنية

### Brands Module
```
backend/src/modules/brands/
├── schemas/
│   └── brand.schema.ts          # Brand database schema
├── dto/
│   └── brand.dto.ts             # DTOs for validation
├── brands.service.ts            # Business logic
├── brands.admin.controller.ts   # Admin endpoints
├── brands.public.controller.ts  # Public endpoints
├── brands.module.ts             # Module definition
└── README.md                    # Documentation
```

### Banners Module
```
backend/src/modules/banners/
├── schemas/
│   └── banner.schema.ts         # Banner database schema
├── dto/
│   └── banner.dto.ts            # DTOs for validation
├── banners.service.ts           # Business logic
├── banners.admin.controller.ts  # Admin endpoints
├── banners.public.controller.ts # Public endpoints
├── banners.module.ts            # Module definition
└── README.md                    # Documentation
```

---

## 🔗 Integration with Catalog / التكامل مع الكتالوج

### Product Schema Enhancement

الـ Product Schema يحتوي على حقل `brandId` يربط المنتج بالبراند:

```typescript
// backend/src/modules/catalog/schemas/product.schema.ts
@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Category', index: true }) 
  categoryId!: string;
  
  @Prop({ required: true }) 
  name!: string;
  
  @Prop() 
  brandId?: string;  // <-- Link to Brand
  
  // ... other fields
}
```

### Catalog Service Updates

تم تحديث `CatalogService` لدعم الفلترة حسب البراند:

```typescript
// List products with brand filter
async listProducts({ 
  page, 
  limit, 
  search, 
  categoryId, 
  brandId  // <-- New parameter
}: ListProductsParams) {
  const query: Record<string, unknown> = { status: 'Active' };
  
  if (categoryId) query.categoryId = new Types.ObjectId(categoryId);
  if (brandId) query.brandId = brandId;  // <-- Filter by brand
  if (search) query.$text = { $search: search };
  
  // ... fetch and return products
}

// Get categories for a specific brand
async getCategoriesForBrand(brandId: string) {
  // Returns all categories that have products with this brand
  // Useful for filtering products on brand page
}
```

---

## 🎯 Complete User Flow / سير العمل الكامل

### 1. Admin Creates a Brand (الأدمن يُنشئ براند)

```http
POST /admin/brands
Authorization: Bearer {admin_token}

{
  "name": "Samsung",
  "image": "https://cdn.example.com/samsung-logo.png",
  "description": "Leading electronics manufacturer",
  "isActive": true,
  "sortOrder": 1
}

Response:
{
  "success": true,
  "message": "Brand created successfully",
  "data": {
    "_id": "brand_abc123",
    "name": "Samsung",
    "slug": "samsung",
    ...
  }
}
```

### 2. Admin Creates Product with Brand (الأدمن يُنشئ منتج مع البراند)

```http
POST /admin/catalog/products
Authorization: Bearer {admin_token}

{
  "name": "Samsung Galaxy S24",
  "categoryId": "cat_xyz789",
  "brandId": "brand_abc123",  // <-- Assign brand
  "description": "Latest flagship smartphone",
  "images": [...],
  "specs": [...]
}
```

### 3. Admin Creates Banners (الأدمن يُنشئ بنرات)

```http
POST /admin/banners
Authorization: Bearer {admin_token}

{
  "title": "Samsung Galaxy S24 Launch",
  "description": "Pre-order now and get 20% off",
  "image": "https://cdn.example.com/s24-banner.jpg",
  "type": "image",
  "location": "home_top",
  "linkUrl": "/products?brandId=brand_abc123",  // Link to brand page
  "linkText": "Shop Now",
  "isActive": true
}
```

### 4. User Views Homepage (المستخدم يزور الصفحة الرئيسية)

#### Frontend Code Example:

```javascript
// HomePage.jsx
import React, { useEffect, useState } from 'react';

function HomePage() {
  const [topBanners, setTopBanners] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    // Load top banners
    fetch('/banners?location=home_top')
      .then(res => res.json())
      .then(data => setTopBanners(data.data));

    // Load featured brands
    fetch('/brands?limit=10&sortBy=sortOrder')
      .then(res => res.json())
      .then(data => setBrands(data.data));
  }, []);

  return (
    <div className="homepage">
      {/* Top Banners Carousel */}
      <BannerCarousel banners={topBanners} />
      
      {/* Featured Brands */}
      <BrandGrid brands={brands} />
      
      {/* Products Grid */}
      <ProductsSection />
    </div>
  );
}

// BannerCarousel component
function BannerCarousel({ banners }) {
  const handleBannerView = (banner) => {
    // Track view
    fetch(`/banners/${banner._id}/view`, { method: 'POST' });
  };

  const handleBannerClick = async (banner) => {
    // Track click
    await fetch(`/banners/${banner._id}/click`, { method: 'POST' });
    
    // Navigate to link
    window.location.href = banner.linkUrl;
  };

  return (
    <Carousel onSlideChange={handleBannerView}>
      {banners.map(banner => (
        <div key={banner._id} onClick={() => handleBannerClick(banner)}>
          <img src={banner.image} alt={banner.title} />
          <h2>{banner.title}</h2>
          <p>{banner.description}</p>
          <button>{banner.linkText}</button>
        </div>
      ))}
    </Carousel>
  );
}

// BrandGrid component
function BrandGrid({ brands }) {
  return (
    <div className="brands-grid">
      {brands.map(brand => (
        <a 
          key={brand._id} 
          href={`/brands/${brand.slug}`}
          className="brand-card"
        >
          <img src={brand.image} alt={brand.name} />
          <h3>{brand.name}</h3>
        </a>
      ))}
    </div>
  );
}
```

### 5. User Clicks on Brand (المستخدم يضغط على البراند)

#### Brand Page Frontend:

```javascript
// BrandPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function BrandPage() {
  const { brandSlug } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // 1. Get brand details
    fetch(`/brands/slug/${brandSlug}`)
      .then(res => res.json())
      .then(data => {
        setBrand(data.data);
        return data.data._id;
      })
      .then(brandId => {
        // 2. Get categories for this brand (for filtering)
        fetch(`/brands/${brandId}/categories`)
          .then(res => res.json())
          .then(data => setCategories(data.data));

        // 3. Load products for this brand
        loadProducts(brandId, null);
      });
  }, [brandSlug]);

  const loadProducts = (brandId, categoryId) => {
    const url = categoryId 
      ? `/products?brandId=${brandId}&categoryId=${categoryId}`
      : `/products?brandId=${brandId}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => setProducts(data.data));
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    loadProducts(brand._id, categoryId);
  };

  if (!brand) return <div>Loading...</div>;

  return (
    <div className="brand-page">
      {/* Brand Header */}
      <div className="brand-header">
        <img src={brand.image} alt={brand.name} />
        <h1>{brand.name}</h1>
        <p>{brand.description}</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button 
          onClick={() => handleCategoryFilter(null)}
          className={!selectedCategory ? 'active' : ''}
        >
          All Products
        </button>
        {categories.map(cat => (
          <button
            key={cat._id}
            onClick={() => handleCategoryFilter(cat._id)}
            className={selectedCategory === cat._id ? 'active' : ''}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### 6. Complete React Native Example (مثال كامل للتطبيق)

```javascript
// screens/BrandScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';

export default function BrandScreen({ route, navigation }) {
  const { brandId } = route.params;
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadBrandData();
  }, [brandId]);

  const loadBrandData = async () => {
    try {
      // Get brand info
      const brandRes = await fetch(`https://api.example.com/brands/${brandId}`);
      const brandData = await brandRes.json();
      setBrand(brandData.data);

      // Get categories
      const catsRes = await fetch(`https://api.example.com/brands/${brandId}/categories`);
      const catsData = await catsRes.json();
      setCategories(catsData.data);

      // Get products
      loadProducts(brandId, null);
    } catch (error) {
      console.error('Error loading brand:', error);
    }
  };

  const loadProducts = async (brandId, categoryId) => {
    try {
      const url = categoryId
        ? `https://api.example.com/products?brandId=${brandId}&categoryId=${categoryId}`
        : `https://api.example.com/products?brandId=${brandId}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  if (!brand) {
    return <View style={styles.loading}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Brand Header */}
      <View style={styles.header}>
        <Image source={{ uri: brand.image }} style={styles.brandLogo} />
        <Text style={styles.brandName}>{brand.name}</Text>
        <Text style={styles.brandDescription}>{brand.description}</Text>
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={[{ _id: null, name: 'All' }, ...categories]}
        keyExtractor={(item) => item._id || 'all'}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item._id && styles.categoryButtonActive
            ]}
            onPress={() => {
              setSelectedCategory(item._id);
              loadProducts(brandId, item._id);
            }}
          >
            <Text style={styles.categoryButtonText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        style={styles.categoryList}
      />

      {/* Products List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('Product', { productId: item._id })}
          >
            <Image 
              source={{ uri: item.images[0]?.url }} 
              style={styles.productImage} 
            />
            <Text style={styles.productName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  brandLogo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  brandDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  categoryList: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    padding: 10,
    margin: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
  },
  productCard: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  productName: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '500',
  },
});
```

---

## 🔐 API Access & Security / الوصول والحماية

### Admin Endpoints (Protected)
```
POST   /admin/brands          - Create brand
GET    /admin/brands          - List brands (with filters)
GET    /admin/brands/:id      - Get brand
PATCH  /admin/brands/:id      - Update brand
DELETE /admin/brands/:id      - Delete brand
PATCH  /admin/brands/:id/toggle-status

POST   /admin/banners         - Create banner
GET    /admin/banners         - List banners (with filters)
GET    /admin/banners/:id     - Get banner
PATCH  /admin/banners/:id     - Update banner
DELETE /admin/banners/:id     - Delete banner
PATCH  /admin/banners/:id/toggle-status
```

**Required:**
- JWT Token in Authorization header
- Role: ADMIN, SUPER_ADMIN, or MODERATOR

### Public Endpoints (No Auth Required)
```
GET /brands                    - List active brands
GET /brands/:id                - Get brand by ID
GET /brands/slug/:slug         - Get brand by slug
GET /brands/:brandId/categories - Get categories for brand

GET /banners                   - List active banners
GET /banners/:id               - Get banner by ID
POST /banners/:id/view         - Track banner view
POST /banners/:id/click        - Track banner click

GET /products?brandId=...      - Filter products by brand
GET /products?brandId=...&categoryId=... - Filter by brand & category
```

---

## 📊 Common Queries / الاستعلامات الشائعة

### 1. Get all products for a specific brand
```javascript
const products = await fetch('/products?brandId=abc123');
```

### 2. Get all products for a brand in a specific category
```javascript
const products = await fetch('/products?brandId=abc123&categoryId=xyz789');
```

### 3. Get all brands (active only)
```javascript
const brands = await fetch('/brands');
```

### 4. Get categories available in a brand
```javascript
const categories = await fetch('/brands/abc123/categories');
```

### 5. Get banners for home page
```javascript
const banners = await fetch('/banners?location=home_top');
```

### 6. Search products by brand and keyword
```javascript
const products = await fetch('/products?brandId=abc123&search=galaxy');
```

---

## 💡 Best Practices / أفضل الممارسات

### 1. Brand Management
- ✅ Always use high-quality brand logos
- ✅ Set appropriate sortOrder for featured brands
- ✅ Keep brand descriptions concise
- ✅ Use slugs for SEO-friendly URLs

### 2. Banner Management
- ✅ Optimize banner images (compress, use CDN)
- ✅ Set appropriate start/end dates for seasonal campaigns
- ✅ Monitor CTR and remove low-performing banners
- ✅ Don't overload pages with too many banners
- ✅ Use different locations strategically

### 3. Product-Brand Linking
- ✅ Always assign brandId when creating products
- ✅ Update products if brand is deleted
- ✅ Use brand filter to create brand-specific landing pages

### 4. Performance
- ✅ Cache brand and banner data on frontend
- ✅ Use lazy loading for images
- ✅ Implement pagination for large product lists
- ✅ Use CDN for static assets

---

## 🧪 Testing / الاختبار

### Test Scenarios

1. **Create Brand → Create Product → Filter by Brand**
2. **Create Banner with date range → Verify it shows/hides correctly**
3. **Click on Brand → See products → Filter by category**
4. **Track banner views and clicks**
5. **Admin toggles brand status → Verify products still visible**

---

## 🚀 Deployment Checklist / قائمة النشر

- [ ] Run migrations (if needed)
- [ ] Create indexes for performance
- [ ] Set up CDN for images
- [ ] Configure CORS for frontend
- [ ] Test all endpoints
- [ ] Create admin user accounts
- [ ] Upload initial brand data
- [ ] Create welcome banners
- [ ] Monitor performance

---

## 📞 Support / الدعم

For questions or issues, please refer to:
- `backend/src/modules/brands/README.md`
- `backend/src/modules/banners/README.md`
- API documentation (Swagger): `/api-docs`

---

## ✅ Summary / الخلاصة

تم إضافة نظامين متكاملين:
1. **البراندات**: لإدارة العلامات التجارية وربطها بالمنتجات
2. **البنرات**: لإدارة الإعلانات والعروض

**المميزات الرئيسية:**
- ✅ إدارة شاملة للأدمن
- ✅ واجهات عامة بدون حماية
- ✅ تكامل ذكي مع نظام المنتجات
- ✅ تصفية المنتجات حسب البراند والفئة
- ✅ تتبع إحصائيات البنرات
- ✅ دعم كامل للـ Pagination والفلترة
- ✅ توثيق شامل وأمثلة عملية

**الاستخدام في الواجهة:**
- عرض البراندات في الصفحة الرئيسية
- صفحة مخصصة لكل براند مع المنتجات والفلاتر
- بنرات ديناميكية في مواقع مختلفة
- تتبع التفاعل مع البنرات

**الأداء:**
- Caching للبيانات
- Indexes للبحث السريع
- Lean queries
- Pagination support


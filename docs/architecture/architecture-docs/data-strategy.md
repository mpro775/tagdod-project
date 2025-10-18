# 🗄️ استراتيجية البيانات - Data Strategy

## نظرة عامة
هذه الوثيقة توضح استراتيجية إدارة البيانات، النسخ الاحتياطي، والاسترجاع لنظام تاجا دودو المطبق فعلياً.

## ✅ الحالة الحالية
- **قاعدة البيانات**: MongoDB Atlas (Production)
- **التخزين المؤقت**: Redis Cloud (Production)
- **النسخ الاحتياطي**: مكتمل ومفعل
- **المراقبة**: مكتملة ومتطورة
- **الأداء**: محسن ومتسارع

---

## 📊 تصميم قاعدة البيانات

### MongoDB Collections Schema

#### 1. Users Collection

```typescript
{
  _id: ObjectId,
  phone: String (unique, indexed),
  name: String,
  email: String (optional),
  
  // Authentication
  password: String (hashed, optional),
  lastOtp: {
    code: String (hashed),
    expiresAt: Date,
    attempts: Number
  },
  
  // Roles & Permissions
  role: Enum ['customer', 'admin', 'super_admin', 'engineer', 'support'],
  permissions: [String],
  
  // Status
  isActive: Boolean,
  isVerified: Boolean,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
  
  // Indexes
  @index({ phone: 1 }, { unique: true })
  @index({ email: 1 }, { sparse: true })
  @index({ role: 1 })
  @index({ createdAt: -1 })
}
```

---

#### 2. Products Collection

```typescript
{
  _id: ObjectId,
  
  // Basic Info
  name: {
    ar: String,
    en: String
  },
  description: {
    ar: String,
    en: String
  },
  slug: {
    ar: String (unique, indexed),
    en: String (unique, indexed)
  },
  sku: String (unique, indexed),
  
  // Pricing
  price: Number,
  compareAtPrice: Number (optional),
  cost: Number,
  
  // Inventory
  stock: Number,
  lowStockThreshold: Number,
  trackInventory: Boolean,
  
  // Relations
  category: ObjectId (ref: categories, indexed),
  brand: ObjectId (ref: brands),
  attributes: [{
    attribute: ObjectId (ref: attributes),
    value: String
  }],
  
  // Images
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean,
    order: Number
  }],
  
  // Specifications
  specifications: [{
    name: { ar: String, en: String },
    value: { ar: String, en: String },
    order: Number
  }],
  
  // SEO
  seo: {
    title: { ar: String, en: String },
    description: { ar: String, en: String },
    keywords: [String]
  },
  
  // Status
  status: Enum ['draft', 'active', 'archived'],
  featured: Boolean,
  
  // Analytics
  views: Number,
  sales: Number,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  publishedAt: Date,
  
  // Indexes
  @index({ sku: 1 }, { unique: true })
  @index({ "slug.ar": 1 }, { unique: true })
  @index({ "slug.en": 1 }, { unique: true })
  @index({ category: 1, status: 1 })
  @index({ status: 1, featured: 1, createdAt: -1 })
  @index({ "name.ar": "text", "name.en": "text", "description.ar": "text" })
  @index({ price: 1 })
  @index({ stock: 1 })
}
```

---

#### 3. Orders Collection

```typescript
{
  _id: ObjectId,
  orderNumber: String (unique, auto-generated, indexed),
  
  // Customer
  user: ObjectId (ref: users, indexed),
  guest: {
    name: String,
    phone: String,
    email: String
  },
  
  // Items
  items: [{
    product: ObjectId (ref: products),
    name: String (snapshot),
    sku: String (snapshot),
    price: Number (snapshot),
    quantity: Number,
    subtotal: Number
  }],
  
  // Address
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    district: String,
    postalCode: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Pricing
  subtotal: Number,
  discount: Number,
  couponCode: String,
  tax: Number,
  shipping: Number,
  total: Number,
  
  // Payment
  payment: {
    method: Enum ['online', 'cash'],
    status: Enum ['pending', 'paid', 'failed', 'refunded'],
    transactionId: String,
    paidAt: Date,
    gateway: String,
    gatewayResponse: Object
  },
  
  // Status & Tracking
  status: Enum [
    'pending', 'payment_failed', 'paid', 'confirmed',
    'processing', 'shipped', 'out_for_delivery',
    'delivered', 'cancelled', 'refunded'
  ],
  trackingNumber: String,
  
  // Timeline
  statusHistory: [{
    status: String,
    timestamp: Date,
    note: String,
    by: ObjectId (ref: users)
  }],
  
  // Notes
  customerNotes: String,
  adminNotes: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  cancelledAt: Date,
  deliveredAt: Date,
  
  // Indexes
  @index({ orderNumber: 1 }, { unique: true })
  @index({ user: 1, createdAt: -1 })
  @index({ status: 1, createdAt: -1 })
  @index({ "payment.status": 1 })
  @index({ createdAt: -1 })
  @index({ "items.product": 1 })
}
```

---

#### 4. Cart Collection

```typescript
{
  _id: ObjectId,
  
  // Owner
  user: ObjectId (ref: users, indexed, sparse),
  sessionId: String (indexed, sparse),
  
  // Items
  items: [{
    product: ObjectId (ref: products),
    quantity: Number,
    price: Number (snapshot at time of add),
    subtotal: Number
  }],
  
  // Coupon
  coupon: {
    code: String,
    discount: Number,
    type: Enum ['percentage', 'fixed']
  },
  
  // Totals
  subtotal: Number,
  discount: Number,
  tax: Number,
  shipping: Number,
  total: Number,
  
  // Status
  status: Enum ['active', 'abandoned', 'converted'],
  orderId: ObjectId (ref: orders, optional),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date (TTL index),
  
  // Indexes
  @index({ user: 1 }, { sparse: true })
  @index({ sessionId: 1 }, { sparse: true })
  @index({ expiresAt: 1 }, { expireAfterSeconds: 0 })  // TTL index
  @index({ status: 1, updatedAt: 1 })
}
```

---

## 🔍 Indexing Strategy

### Performance Optimization

```javascript
// Users
db.users.createIndex({ phone: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { sparse: true });
db.users.createIndex({ role: 1, isActive: 1 });

// Products
db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ category: 1, status: 1 });
db.products.createIndex({ status: 1, featured: 1, createdAt: -1 });
db.products.createIndex({ 
  "name.ar": "text", 
  "name.en": "text", 
  "description.ar": "text" 
});

// Orders
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ user: 1, createdAt: -1 });
db.orders.createIndex({ status: 1, createdAt: -1 });
db.orders.createIndex({ "payment.status": 1, createdAt: -1 });

// Cart
db.cart.createIndex({ user: 1 }, { sparse: true });
db.cart.createIndex({ sessionId: 1 }, { sparse: true });
db.cart.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### Compound Indexes

```javascript
// للاستعلامات الشائعة
db.products.createIndex({ 
  category: 1, 
  status: 1, 
  price: 1 
});

db.orders.createIndex({ 
  user: 1, 
  status: 1, 
  createdAt: -1 
});
```

---

## 💾 Backup Strategy

### Automated Backups

```yaml
# استراتيجية النسخ الاحتياطي
Daily Backups:
  - Time: 3:00 AM UTC
  - Retention: 7 days
  - Type: Full backup
  
Weekly Backups:
  - Time: Sunday 3:00 AM UTC
  - Retention: 4 weeks
  - Type: Full backup
  
Monthly Backups:
  - Time: 1st of month, 3:00 AM UTC
  - Retention: 12 months
  - Type: Full backup
```

### MongoDB Atlas Backup

```javascript
// MongoDB Atlas يوفر:
- Continuous Backup (Point-in-Time Recovery)
- Automated Snapshots (كل 6 ساعات)
- Manual Snapshots (عند الطلب)
- Cross-region Replication
```

### Manual Backup Script

```bash
#!/bin/bash
# scripts/backup-db.sh

# Configuration
MONGO_URI="mongodb+srv://..."
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="tagadodo_backup_$DATE"

echo "🔄 Starting MongoDB backup..."

# Create backup directory
mkdir -p $BACKUP_DIR/$DATE

# Dump database
mongodump \
  --uri="$MONGO_URI" \
  --out="$BACKUP_DIR/$DATE" \
  --gzip

# Create tar archive
cd $BACKUP_DIR
tar -czf "$BACKUP_NAME.tar.gz" $DATE
rm -rf $DATE

# Upload to S3
aws s3 cp "$BACKUP_NAME.tar.gz" \
  s3://tagadodo-backups/mongodb/ \
  --storage-class STANDARD_IA

echo "✅ Backup completed: $BACKUP_NAME.tar.gz"

# Cleanup old local backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# Verify backup
if [ -f "$BACKUP_DIR/$BACKUP_NAME.tar.gz" ]; then
  SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
  echo "📦 Backup size: $SIZE"
else
  echo "❌ Backup failed!"
  exit 1
fi
```

---

## 🔄 Restore Strategy

### Point-in-Time Recovery

```bash
#!/bin/bash
# scripts/restore-db.sh

BACKUP_FILE=$1
MONGO_URI=$2

echo "⚠️  WARNING: This will restore the database!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Restore cancelled"
  exit 0
fi

echo "🔄 Starting restore..."

# Extract backup
tar -xzf $BACKUP_FILE

# Restore
mongorestore \
  --uri="$MONGO_URI" \
  --dir="./tagadodo" \
  --gzip \
  --drop  # Drop existing collections

echo "✅ Restore completed"
```

### MongoDB Atlas Point-in-Time Restore

```
1. اذهب إلى Atlas Console
2. Clusters > Backup
3. اختر النقطة الزمنية المطلوبة
4. Restore to new cluster (recommended)
5. Verify data
6. Switch DNS to new cluster
```

---

## 🔐 Data Security

### Encryption

```yaml
At Rest:
  - MongoDB Atlas: AES-256 encryption
  - Backups: Encrypted in S3
  
In Transit:
  - TLS 1.2+ for all connections
  - SSL certificates for MongoDB
  
Field-Level:
  - Sensitive fields encrypted (passwords, etc.)
  - Encryption keys in AWS KMS
```

### Access Control

```javascript
// MongoDB Users & Roles
{
  // Application user
  user: "app_user",
  roles: [
    { role: "readWrite", db: "tagadodo_prod" }
  ]
},
{
  // Read-only user (للـ analytics)
  user: "analytics_user",
  roles: [
    { role: "read", db: "tagadodo_prod" }
  ]
},
{
  // Backup user
  user: "backup_user",
  roles: [
    { role: "backup", db: "admin" },
    { role: "read", db: "tagadodo_prod" }
  ]
}
```

---

## 📈 Data Retention Policy

### Production Data

```yaml
User Data:
  Active Users: Forever
  Inactive Users (2+ years): Archive
  Deleted Accounts: 30 days, then permanent delete
  
Orders:
  All Orders: Forever (legal requirement)
  Order Analytics: Aggregated after 2 years
  
Products:
  Active: Forever
  Archived: Forever (for order history)
  
Cart:
  Active: 30 days (TTL)
  Abandoned: 7 days (TTL)
  
Logs:
  Application Logs: 30 days
  Access Logs: 90 days
  Audit Logs: 7 years (compliance)
  
Analytics Events:
  Raw Data: 90 days
  Aggregated: Forever
```

---

## 🧹 Data Cleanup Tasks

### Cron Jobs

```typescript
// Cleanup abandoned carts (يومياً)
@Cron('0 2 * * *')  // 2:00 AM
async cleanupCarts() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const result = await this.cartModel.deleteMany({
    status: 'abandoned',
    updatedAt: { $lt: thirtyDaysAgo }
  });
  
  this.logger.log(`Cleaned up ${result.deletedCount} carts`);
}

// Cleanup expired OTPs (كل ساعة)
@Cron('0 * * * *')
async cleanupExpiredOTPs() {
  await this.redis.eval(`
    local keys = redis.call('keys', 'otp:*')
    for i=1,#keys do
      if redis.call('ttl', keys[i]) <= 0 then
        redis.call('del', keys[i])
      end
    end
  `);
}

// Archive old analytics (شهرياً)
@Cron('0 3 1 * *')  // 1st day of month, 3:00 AM
async archiveAnalytics() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  // Aggregate and archive
  const oldEvents = await this.analyticsModel.find({
    createdAt: { $lt: ninetyDaysAgo }
  });
  
  // Create aggregated summary
  await this.createAggregatedSummary(oldEvents);
  
  // Delete old events
  await this.analyticsModel.deleteMany({
    createdAt: { $lt: ninetyDaysAgo }
  });
}
```

---

## 📊 Data Migration Strategy

### Migration Framework

```typescript
// migrations/migration.interface.ts
export interface Migration {
  name: string;
  version: number;
  up(): Promise<void>;
  down(): Promise<void>;
}

// migrations/001-add-user-status.ts
export class AddUserStatus implements Migration {
  name = 'AddUserStatus';
  version = 1;
  
  async up() {
    await db.collection('users').updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );
    
    await db.collection('users').createIndex({ status: 1 });
  }
  
  async down() {
    await db.collection('users').dropIndex({ status: 1 });
    await db.collection('users').updateMany(
      {},
      { $unset: { status: '' } }
    );
  }
}
```

---

## 🔍 Data Quality Monitoring

### Automated Checks

```typescript
// مراقبة جودة البيانات (يومياً)
@Cron('0 4 * * *')
async monitorDataQuality() {
  const checks = [];
  
  // 1. Products without images
  const productsNoImages = await this.productModel.countDocuments({
    status: 'active',
    $or: [
      { images: { $size: 0 } },
      { images: { $exists: false } }
    ]
  });
  checks.push({ metric: 'products_no_images', value: productsNoImages });
  
  // 2. Orders without payment info
  const ordersNoPayment = await this.orderModel.countDocuments({
    status: { $in: ['paid', 'confirmed'] },
    'payment.transactionId': { $exists: false }
  });
  checks.push({ metric: 'orders_no_payment', value: ordersNoPayment });
  
  // 3. Products with negative stock
  const negativeStock = await this.productModel.countDocuments({
    stock: { $lt: 0 }
  });
  checks.push({ metric: 'negative_stock', value: negativeStock });
  
  // Send alerts if issues found
  for (const check of checks) {
    if (check.value > 0) {
      await this.alertService.sendAlert({
        type: 'data_quality',
        message: `Found ${check.value} records with ${check.metric}`,
        severity: check.value > 10 ? 'high' : 'medium'
      });
    }
  }
}
```

---

## 📝 Best Practices

### 1. Data Modeling
```
✅ Embed when data is always accessed together
✅ Reference when data is large or updated frequently
✅ Denormalize for read-heavy operations
✅ Keep documents under 16MB
```

### 2. Query Optimization
```
✅ Use indexes for frequent queries
✅ Use projection to limit fields
✅ Use lean() for read-only queries
✅ Avoid $where and $regex when possible
```

### 3. Backup Best Practices
```
✅ Automated daily backups
✅ Test restore procedures regularly
✅ Store backups in multiple locations
✅ Encrypt backup files
✅ Monitor backup success/failure
```

### 4. Data Security
```
✅ Encrypt sensitive data
✅ Use TLS for connections
✅ Implement RBAC
✅ Audit data access
✅ Regular security audits
```

---

**آخر تحديث:** 14 أكتوبر 2025  
**المسؤول:** فريق البيانات



# System Settings Module

## نظرة عامة

نظام مركزي لإدارة جميع إعدادات النظام من لوحة التحكم بدون الحاجة لتعديل الكود.

## المميزات

### 1. إدارة الإعدادات
- **CRUD كامل**: إنشاء، قراءة، تحديث، حذف الإعدادات
- **Key-Value System**: نظام مفتاح-قيمة مرن
- **Categories**: تنظيم الإعدادات حسب الفئات
- **Type Safety**: دعم أنواع بيانات متعددة
- **Public/Private**: التحكم في الإعدادات العامة والخاصة

### 2. الفئات المدعومة
- **General**: إعدادات عامة (اسم الموقع، اللغة، إلخ)
- **Email**: إعدادات SMTP والبريد
- **Payment**: إعدادات طرق الدفع
- **Shipping**: إعدادات الشحن
- **Security**: إعدادات الأمان
- **Notifications**: إعدادات الإشعارات
- **SEO**: إعدادات تحسين محركات البحث
- **Advanced**: إعدادات متقدمة

### 3. أنواع البيانات
- String
- Number
- Boolean
- Object
- Array

### 4. الإعدادات الافتراضية
يتم تهيئة الإعدادات الأساسية تلقائياً عند بدء التشغيل:
- اسم الموقع ووصفه
- اللغة والعملة الافتراضية
- إعدادات الأمان
- إعدادات الشحن والدفع
- وأكثر...

### 5. التحديث الجماعي
تحديث عدة إعدادات دفعة واحدة بدلاً من تحديثها واحدة تلو الأخرى.

## API Endpoints

### Public Endpoints (بدون مصادقة)

#### الحصول على الإعدادات العامة
```
GET /system-settings/public?category=general
```
يُستخدم من قبل Frontend لتحميل الإعدادات العامة.

**Response:**
```json
{
  "site_name": "TagDoD",
  "site_description": "منصة خدمات الطاقة الشمسية",
  "default_language": "ar",
  "default_currency": "YER",
  "maintenance_mode": false
}
```

### Admin Endpoints (تتطلب مصادقة)

#### إنشاء إعداد جديد
```
POST /system-settings
{
  "key": "custom_setting",
  "value": "some value",
  "category": "general",
  "description": "وصف الإعداد",
  "isPublic": false
}
```

#### الحصول على جميع الإعدادات
```
GET /system-settings?category=email
```

#### الحصول على إعدادات فئة معينة
```
GET /system-settings/category/general
```

**Response:**
```json
{
  "site_name": "TagDoD",
  "site_description": "منصة خدمات الطاقة الشمسية",
  "default_language": "ar",
  "maintenance_mode": false
}
```

#### تحديث جماعي
```
PUT /system-settings/bulk
{
  "settings": {
    "site_name": "TagDoD Platform",
    "maintenance_mode": true,
    "session_timeout": 30
  }
}
```

**Response:**
```json
{
  "message": "تم تحديث الإعدادات بنجاح",
  "updated": 3
}
```

#### تحديث إعداد واحد
```
PUT /system-settings/:key
{
  "value": "new value",
  "description": "وصف محدث"
}
```

#### حذف إعداد
```
DELETE /system-settings/:key
```

## نموذج البيانات

```typescript
{
  key: string;              // site_name, smtp_host, etc.
  value: any;               // القيمة (حسب النوع)
  category: string;         // general, email, payment, etc.
  type: string;             // string, number, boolean, object, array
  description: string;      // وصف الإعداد
  isPublic: boolean;        // هل متاح للعموم؟
  updatedBy: string;        // آخر من قام بالتحديث
  createdAt: Date;
  updatedAt: Date;
}
```

## الاستخدام في الكود

### الحصول على إعداد
```typescript
const siteName = await systemSettingsService.getSettingValue('site_name', 'Default Name');
console.log(siteName); // "TagDoD"
```

### تحديث إعداد
```typescript
await systemSettingsService.updateSetting(
  'maintenance_mode',
  { value: true },
  userId
);
```

### الحصول على جميع إعدادات فئة
```typescript
const emailSettings = await systemSettingsService.getSettingsByCategory(SettingCategory.EMAIL);
console.log(emailSettings);
// {
//   smtp_host: 'smtp.gmail.com',
//   smtp_port: 587,
//   from_email: 'noreply@tagdod.com',
//   ...
// }
```

## في Frontend

### تحميل الإعدادات العامة
```typescript
// في بداية التطبيق
const settings = await fetch('/api/system-settings/public');
const data = await settings.json();

// استخدام الإعدادات
document.title = data.site_name;
```

### عرض وتحرير الإعدادات (Admin)
```typescript
// جلب جميع إعدادات البريد
const emailSettings = await fetch('/api/system-settings/category/email');
const settings = await emailSettings.json();

// تحديث
await fetch('/api/system-settings/smtp_host', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value: 'smtp.gmail.com' })
});
```

## الإعدادات الافتراضية

### General
- `site_name`: اسم الموقع
- `site_description`: وصف الموقع
- `default_language`: اللغة الافتراضية (ar/en)
- `default_currency`: العملة الافتراضية
- `maintenance_mode`: وضع الصيانة
- `timezone`: المنطقة الزمنية

### Email
- `smtp_host`: SMTP Host
- `smtp_port`: SMTP Port
- `smtp_user`: SMTP User
- `smtp_password`: SMTP Password (مشفر)
- `from_email`: بريد المرسل
- `from_name`: اسم المرسل

### Security
- `force_2fa`: إجبار المصادقة الثنائية
- `session_timeout`: مدة صلاحية الجلسة (دقائق)
- `max_login_attempts`: الحد الأقصى لمحاولات الدخول
- `lockout_duration`: مدة الحظر (دقائق)

### Payment
- `cod_enabled`: تفعيل الدفع عند الاستلام
- `card_enabled`: تفعيل البطاقات
- `stripe_public_key`: Stripe Public Key
- `stripe_secret_key`: Stripe Secret Key

### Shipping
- `free_shipping_enabled`: تفعيل الشحن المجاني
- `free_shipping_threshold`: الحد الأدنى للشحن المجاني
- `default_shipping_cost`: تكلفة الشحن الافتراضية

## الأمان

### حماية البيانات الحساسة
- كلمات المرور تُخزن مشفرة
- API Keys محمية
- الإعدادات الحساسة ليست عامة (`isPublic: false`)

### الصلاحيات
- Public endpoints: لا تتطلب مصادقة
- Admin endpoints: تتطلب JWT + Admin Role

## أفضل الممارسات

### التسمية
```
category.context.key

✅ Good:
- email.smtp.host
- payment.stripe.public_key
- security.session.timeout

❌ Bad:
- smtpHost
- stripeKey
- timeout
```

### القيم الافتراضية
دائماً قدم قيمة افتراضية عند استرجاع الإعداد:
```typescript
const timeout = await getSettingValue('session_timeout', 60);
```

### التحديث الجماعي
استخدم Bulk Update عند تحديث عدة إعدادات:
```typescript
await bulkUpdate({
  settings: {
    site_name: 'New Name',
    site_description: 'New Description',
    maintenance_mode: false
  }
}, userId);
```

## المستقبل

- [ ] Validation Rules للقيم
- [ ] Setting Groups
- [ ] Setting Templates
- [ ] Import/Export Settings
- [ ] Settings Backup & Restore
- [ ] Setting Change History
- [ ] Default Values per Environment
- [ ] Setting Dependencies
- [ ] Real-time Settings Sync
- [ ] Settings Documentation Generator


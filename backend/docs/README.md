# Tagadod API Documentation

## نظرة عامة

Tagadod API هو نظام إدارة متجر إلكتروني متكامل للمنتجات الشمسية مع دعم متعدد اللغات (العربية والإنجليزية) ونظام تحليلات متقدم.

## المميزات الرئيسية

### 🛒 إدارة المتجر
- **المنتجات:** إدارة شاملة للمنتجات مع المتغيرات والخصائص
- **الفئات:** تنظيم المنتجات في فئات هرمية
- **العلامات التجارية:** إدارة العلامات التجارية والشركات
- **المخزون:** تتبع المخزون والتنبيهات

### 🛍️ تجربة التسوق
- **السلة:** سلة تسوق متقدمة مع دعم الضيوف والمستخدمين
- **الطلبات:** نظام طلبات كامل مع تتبع الحالة
- **الدفع:** تكامل مع مزودي الدفع المختلفين
- **العناوين:** إدارة عناوين التسليم

### 👥 إدارة المستخدمين
- **المصادقة:** نظام مصادقة متقدم مع OTP
- **الأدوار:** نظام أدوار مرن (عميل، مهندس، تاجر، إدمن)
- **الملفات الشخصية:** إدارة شاملة للملفات الشخصية
- **المفضلة:** قائمة المفضلة للمستخدمين

### 📊 التحليلات
- **لوحة التحكم:** تحليلات شاملة للأداء
- **التقارير:** تقارير قابلة للتخصيص
- **المؤشرات:** مؤشرات الأداء الرئيسية (KPIs)
- **الاتجاهات:** تحليل الاتجاهات والأنماط

### 🔧 الخدمات
- **طلبات الخدمة:** نظام طلبات الخدمة للمهندسين
- **الدعم الفني:** نظام تذاكر الدعم
- **الإشعارات:** نظام إشعارات متعدد القنوات
- **التحويلات:** دعم العملات المتعددة

## التقنيات المستخدمة

### Backend
- **NestJS:** إطار عمل Node.js متقدم
- **MongoDB:** قاعدة بيانات NoSQL
- **JWT:** مصادقة آمنة
- **Swagger:** وثائق API تفاعلية
- **Redis:** تخزين مؤقت وسريع

### Frontend
- **React:** مكتبة واجهة المستخدم
- **TypeScript:** لغة برمجة قوية
- **Vite:** أداة بناء سريعة
- **Tailwind CSS:** إطار عمل CSS
- **i18n:** دعم متعدد اللغات

## البنية المعمارية

```
backend/
├── src/
│   ├── modules/           # وحدات التطبيق
│   │   ├── auth/         # المصادقة
│   │   ├── users/        # المستخدمين
│   │   ├── products/     # المنتجات
│   │   ├── cart/         # السلة
│   │   ├── checkout/     # الطلبات
│   │   ├── analytics/    # التحليلات
│   │   └── ...
│   ├── shared/           # المكونات المشتركة
│   │   ├── decorators/  # الـ decorators
│   │   ├── dto/         # الـ DTOs
│   │   ├── guards/      # الحماية
│   │   └── utils/       # الأدوات المساعدة
│   └── config/          # الإعدادات
├── docs/                # الوثائق
│   ├── api/            # ملفات OpenAPI
│   └── SWAGGER_GUIDE.md # دليل Swagger
└── templates/          # قوالب البريد الإلكتروني
```

## التثبيت والتشغيل

### متطلبات النظام
- Node.js 18+
- MongoDB 6+
- Redis 6+
- npm أو yarn

### التثبيت
```bash
# استنساخ المشروع
git clone <repository-url>
cd tagadodo-project

# تثبيت التبعيات
npm install

# إعداد متغيرات البيئة
cp .env.example .env
# تعديل ملف .env بالقيم المناسبة

# تشغيل قاعدة البيانات
# MongoDB و Redis

# تشغيل المشروع
npm run start:dev
```

### متغيرات البيئة
```env
# Database
MONGODB_URI=mongodb://localhost:27017/tagadodo
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# SMS
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-phone-number

# Payment
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## API Documentation

### Swagger UI
```
http://localhost:3000/api/docs
```

### OpenAPI Files
- **JSON:** `docs/api/openapi.json`
- **YAML:** `docs/api/openapi.yaml`
- **Postman:** `docs/api/postman-collection.json`

### Endpoints الرئيسية

#### Authentication
```
POST /auth/send-otp          # إرسال رمز التحقق
POST /auth/verify-otp        # التحقق من الرمز
GET  /auth/me               # الملف الشخصي
```

#### Products
```
GET  /products              # قائمة المنتجات
GET  /products/:id          # تفاصيل منتج
GET  /products/featured     # المنتجات المميزة
GET  /products/new          # المنتجات الجديدة
```

#### Cart
```
GET  /cart                  # عرض السلة
POST /cart/items            # إضافة منتج
PATCH /cart/items/:id       # تحديث الكمية
DELETE /cart/items/:id      # حذف منتج
```

#### Orders
```
POST /checkout/preview      # معاينة الطلب
POST /checkout/confirm      # تأكيد الطلب
GET  /orders               # قائمة الطلبات
GET  /orders/:id           # تفاصيل طلب
```

#### Analytics (Admin)
```
GET  /analytics/dashboard  # لوحة التحكم
GET  /analytics/revenue    # تحليل الإيرادات
GET  /analytics/users      # تحليل المستخدمين
GET  /analytics/products   # تحليل المنتجات
```

## الاختبار

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:cov
```

## النشر

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Docker
```bash
docker-compose up -d
```

## الأمان

### المصادقة
- JWT tokens آمنة
- OTP للتحقق
- Rate limiting
- CORS protection

### الحماية
- Helmet.js للأمان
- Input validation
- SQL injection protection
- XSS protection

## المراقبة

### Health Check
```
GET /health
```

### Metrics
```
GET /metrics
```

### Logs
- Console logging
- File logging
- Error tracking

## الدعم

### التوثيق
- [Swagger Guide](SWAGGER_GUIDE.md)
- [API Endpoints](SWAGGER_ENDPOINTS.md)
- [Architecture Guide](../docs/architecture/)

### المساعدة
- GitHub Issues
- Documentation
- Community Support

## المساهمة

### Guidelines
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

### Code Style
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Conventional commits

## الترخيص

MIT License - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الفريق

- **Backend Development:** NestJS, MongoDB, Redis
- **Frontend Development:** React, TypeScript, Tailwind
- **DevOps:** Docker, CI/CD, Monitoring
- **QA:** Testing, Documentation

---

**Tagadod API** - نظام إدارة متجر إلكتروني متكامل للمنتجات الشمسية 🚀
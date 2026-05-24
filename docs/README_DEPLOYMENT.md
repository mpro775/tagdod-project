# 🚀 مشروع Tagdod - دليل النشر الشامل

## 📋 نظرة عامة

مشروع Tagdod عبارة عن نظام متكامل يتكون من:

- **Backend API**: Node.js/NestJS
- **Admin Dashboard**: React/TypeScript (الموقع الرئيسي)
- **Redis**: Cache داخلي في Docker
- **MongoDB**: قاعدة بيانات خارجية

## 🌐 الدومينات

- **الموقع الرئيسي (Admin Dashboard)**: https://allawzi.net
- **API**: https://api.allawzi.net

## 📁 هيكل المشروع

```
tagdod-project/
├── backend/                    # Backend API
│   ├── Dockerfile
│   ├── .env.example
│   └── deploy.sh
├── admin-dashboard/           # Admin Dashboard
│   ├── Dockerfile
│   └── nginx.conf
├── nginx/                     # Nginx Reverse Proxy
│   ├── nginx.conf
│   ├── conf.d/
│   │   ├── yourdomain.com.conf
│   │   └── api.yourdomain.com.conf
│   └── ssl/
├── docker-compose.yml         # Docker Compose الموحد
├── deploy-all.sh             # سكريبت النشر الشامل
├── QUICK_START.md            # دليل البدء السريع
├── DOCKER_DEPLOYMENT_README.md  # دليل Docker
└── DEPLOYMENT_VPS.md         # دليل VPS الكامل
```

## 🚀 خيارات النشر

### خيار 1: نشر سريع (موصى به)

استخدم Docker Compose الموحد:

```bash
./deploy-all.sh
```

📖 **الدليل الكامل**: [QUICK_START.md](./QUICK_START.md)

### خيار 2: نشر يدوي كامل

للحصول على تحكم كامل في الإعداد:

📖 **الدليل الكامل**: [DEPLOYMENT_VPS.md](./DEPLOYMENT_VPS.md)

## 📚 الوثائق

| الملف                         | الوصف                                 |
| ----------------------------- | ------------------------------------- |
| `QUICK_START.md`              | دليل البدء السريع - للنشر الفوري      |
| `DOCKER_DEPLOYMENT_README.md` | دليل Docker الشامل مع جميع التفاصيل   |
| `DEPLOYMENT_VPS.md`           | دليل النشر الكامل على VPS بدون Docker |

## 🔧 متطلبات النشر

### متطلبات الخادم:

- **نظام التشغيل**: Ubuntu 22.04 LTS
- **RAM**: 4GB (الحد الأدنى 2GB)
- **CPU**: 2 cores (الحد الأدنى 1 core)
- **Storage**: 50GB SSD
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

### متطلبات خارجية:

- دومين: `allawzi.net` مُسجل
- MongoDB: خارجي (مثل MongoDB Atlas)

## ⚡ البدء السريع

```bash
# 1. استنساخ المشروع
git clone https://github.com/YOUR_USERNAME/tagdod-project.git
cd tagdod-project

# 2. إعداد متغيرات البيئة
cp backend/.env.example backend/.env
nano backend/.env

# 3. النشر
chmod +x deploy-all.sh
./deploy-all.sh

# 4. إعداد SSL (اختياري للإنتاج)
# راجع QUICK_START.md للتفاصيل
```

## 🔒 الأمان

- ✅ شهادات SSL من Let's Encrypt
- ✅ جدار حماية UFW
- ✅ Fail2Ban للحماية من الهجمات
- ✅ Nginx مع Security Headers
- ✅ Rate Limiting على API

## 📊 المراقبة

```bash
# عرض حالة الخدمات
docker-compose ps

# عرض السجلات
docker-compose logs -f

# مراقبة الموارد
docker stats
```

## 🛠️ الصيانة

### تحديث التطبيق:

```bash
git pull origin main
docker-compose up -d --build
```

### النسخ الاحتياطي:

```bash
# نسخ احتياطي للإعدادات
cp backend/.env /backup/env-backup-$(date +%Y%m%d).env

# نسخ احتياطي لـ MongoDB (إذا كان محلي)
mongodump --uri="$MONGO_URI" --out=/backup/mongodb-$(date +%Y%m%d)
```

## 🆘 استكشاف الأخطاء

### مشكلة: الخدمة لا تعمل

```bash
# فحص السجلات
docker-compose logs <service-name>

# إعادة تشغيل الخدمة
docker-compose restart <service-name>
```

### مشكلة: خطأ في الاتصال بـ MongoDB

```bash
# تحقق من MONGO_URI في .env
cat backend/.env | grep MONGO_URI

# اختبر الاتصال
docker-compose exec api node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected!')).catch(e => console.error(e))"
```

## 📞 الدعم

للمزيد من المساعدة، راجع الوثائق التفصيلية أو افتح issue على GitHub.

## 📄 الترخيص

حقوق النشر © 2025 Tagdod Project. جميع الحقوق محفوظة.

---

**جاهز للنشر؟ 🚀 ابدأ مع [QUICK_START.md](./QUICK_START.md)**

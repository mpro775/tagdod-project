# 🚀 نشر Tagdod باستخدام Docker الموحد

## 📋 نظرة عامة

هذا النظام يستخدم Docker Compose موحد لنشر جميع خدمات المشروع:

- **Backend API** مع Redis
- **Admin Dashboard** (لوحة الإدارة - الموقع الرئيسي)
- **Web App** (تطبيق الويب للعملاء)
- **Nginx Reverse Proxy** لتوجيه الطلبات

## 🏗️ هيكل المشروع

```
tagdod-project/
├── docker-compose.yml          # الملف الرئيسي للنشر
├── deploy-all.sh              # سكريبت النشر التلقائي
├── backend/                   # Backend API
│   ├── Dockerfile
│   └── .env
├── admin-dashboard/          # لوحة الإدارة (الموقع الرئيسي)
│   ├── Dockerfile
│   └── nginx.conf
├── tagadod-web/              # تطبيق الويب (العملاء)
│   ├── Dockerfile
│   └── nginx.conf
└── nginx/                    # إعدادات Nginx
    ├── nginx.conf
    ├── conf.d/
    │   ├── yourdomain.com.conf    # إعدادات allawzi.net
    │   └── api.yourdomain.com.conf # إعدادات api.allawzi.net
    └── ssl/
```

## 🚀 النشر السريع

### 1. تحضير البيئة

```bash
# تأكد من وجود ملف .env في backend
cp backend/.env.example backend/.env
# عدل المتغيرات حسب الحاجة
nano backend/.env
```

### 2. النشر التلقائي

```bash
# جعل السكريبت قابل للتنفيذ
chmod +x deploy-all.sh

# تشغيل النشر
./deploy-all.sh
```

### 3. النشر اليدوي

```bash
# بناء وتشغيل جميع الخدمات
docker-compose up -d --build

# عرض حالة الخدمات
docker-compose ps

# عرض السجلات
docker-compose logs -f
```

## 🔧 إدارة الخدمات

### إعادة تشغيل خدمة معينة

```bash
docker-compose restart api
docker-compose restart admin-dashboard
docker-compose restart web-app
docker-compose restart nginx-proxy
```

### تحديث خدمة مع إعادة البناء

```bash
# إعادة بناء وتشغيل API فقط
docker-compose up -d --build api

# إعادة بناء جميع الخدمات
docker-compose up -d --build
```

### عرض سجلات محددة

```bash
# سجلات API
docker-compose logs -f api

# سجلات جميع الخدمات
docker-compose logs -f
```

## 🌐 الوصول للخدمات

### داخل الخادم (للاختبار)

- **API**: http://localhost:3000
- **Admin Dashboard**: http://localhost:8081
- **Web App**: http://localhost:8082
- **Nginx Proxy**: http://localhost (أو المنفذ 80)

### عبر الإنترنت (بعد إعداد DNS)

- **لوحة الإدارة (الموقع الرئيسي)**: https://allawzi.net
- **تطبيق الويب (العملاء)**: https://app.allawzi.net
- **API**: https://api.allawzi.net

## 🔒 إعداد SSL

### 1. الحصول على شهادات Let's Encrypt

```bash
# تثبيت Certbot
sudo apt install certbot

# الحصول على شهادات
sudo certbot certonly --standalone -d allawzi.net -d www.allawzi.net
sudo certbot certonly --standalone -d api.allawzi.net
```

### 2. نسخ الشهادات

```bash
# نسخ الشهادات لـ Docker
sudo cp /etc/letsencrypt/live/allawzi.net/fullchain.pem nginx/ssl/allawzi.net.crt
sudo cp /etc/letsencrypt/live/allawzi.net/privkey.pem nginx/ssl/allawzi.net.key
sudo cp /etc/letsencrypt/live/api.allawzi.net/fullchain.pem nginx/ssl/api.allawzi.net.crt
sudo cp /etc/letsencrypt/live/api.allawzi.net/privkey.pem nginx/ssl/api.allawzi.net.key

# تعديل صلاحيات الملفات
sudo chmod 644 nginx/ssl/*.crt
sudo chmod 600 nginx/ssl/*.key
```

### 3. تفعيل HTTPS في إعدادات Nginx

قم بإلغاء التعليق من إعدادات SSL في ملفات:

- `nginx/conf.d/yourdomain.com.conf` (لـ allawzi.net)
- `nginx/conf.d/api.yourdomain.com.conf` (لـ api.allawzi.net)

### 4. إعادة تشغيل Nginx

```bash
docker-compose restart nginx-proxy
```

## 📊 مراقبة النظام

### فحص حالة الخدمات

```bash
# حالة جميع الحاويات
docker-compose ps

# استخدام الموارد
docker stats

# فحص صحة الخدمات
curl http://localhost:3000/health/live  # API
curl http://localhost:8081/health       # Admin Dashboard
curl http://localhost:8082/health       # Web App
```

### السجلات والتشخيص

```bash
# سجلات محددة
docker-compose logs api
docker-compose logs nginx-proxy

# سجلات متابعة
docker-compose logs -f

# فحص أخطاء Nginx
docker-compose exec nginx-proxy nginx -t
```

## 🔧 استكشاف الأخطاء

### مشكلة: خدمة لا تبدأ

```bash
# فحص سجلات الخدمة
docker-compose logs <service_name>

# إعادة تشغيل الخدمة
docker-compose restart <service_name>
```

### مشكلة: خطأ في البناء

```bash
# إعادة البناء مع حذف الـ cache
docker-compose build --no-cache <service_name>

# فحص مساحة القرص
df -h
```

### مشكلة: مشاكل في الشبكة

```bash
# فحص شبكة Docker
docker network ls
docker network inspect tagdodproject_tagdod-network

# إعادة إنشاء الشبكة
docker-compose down
docker-compose up -d
```

## 🛡️ الأمان

### فحوصات أمنية مهمة:

- ✅ استخدام صور Docker رسمية
- ✅ تشغيل الحاويات بصلاحيات محدودة
- ✅ إعدادات Nginx آمنة
- ✅ متغيرات البيئة للأسرار
- ✅ شهادات SSL للإنتاج

### نصائح أمنية إضافية:

- استخدم كلمات مرور قوية
- حدث النظام بانتظام
- راقب السجلات للأنشطة المشبوهة
- استخدم Fail2Ban للحماية من الهجمات

## 📝 ملاحظات مهمة

- **MongoDB**: خارجي وغير داخل Docker كما هو مطلوب
- **Redis**: داخل Docker للأداء الأمثل
- **النسخ الاحتياطي**: تأكد من نسخ `backend/.env` احتياطياً
- **DNS**: تأكد من تحديث سجلات DNS قبل النشر العام
- **SSL**: لا تنسَ إعداد الشهادات للإنتاج

---

🎉 **نظام النشر جاهز! اتبع الخطوات وستحصل على بيئة إنتاج احترافية وآمنة.**

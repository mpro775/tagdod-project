# 🚀 دليل البدء السريع - Tagdod

## 📋 المتطلبات

- خادم VPS مع Ubuntu 22.04
- دومين: `allawzi.net` مُعد للاستخدام
- MongoDB خارجي جاهز

## 🎯 النشر السريع

### 1. إعداد DNS

أضف هذه السجلات في لوحة تحكم الدومين:

```
Type: A, Name: @, Value: YOUR_VPS_IP
Type: A, Name: www, Value: YOUR_VPS_IP
Type: A, Name: api, Value: YOUR_VPS_IP
```

### 2. إعداد الخادم

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# تثبيت Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. استنساخ المشروع

```bash
git clone https://github.com/YOUR_USERNAME/tagdod-project.git
cd tagdod-project
```

### 4. إعداد متغيرات البيئة

```bash
# نسخ وتعديل ملف البيئة
cp backend/.env.example backend/.env
nano backend/.env
```

**تحديث المتغيرات المهمة:**

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tagdod_db
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secure-jwt-secret-here
FRONTEND_URL=https://allawzi.net
ADMIN_URL=https://allawzi.net
API_URL=https://api.allawzi.net
```

### 5. النشر التلقائي

```bash
chmod +x deploy-all.sh
./deploy-all.sh
```

### 6. إعداد SSL

```bash
# تثبيت Certbot
sudo apt install -y certbot

# الحصول على شهادات
sudo certbot certonly --standalone -d allawzi.net -d www.allawzi.net
sudo certbot certonly --standalone -d api.allawzi.net

# نسخ الشهادات
sudo cp /etc/letsencrypt/live/allawzi.net/fullchain.pem nginx/ssl/allawzi.net.crt
sudo cp /etc/letsencrypt/live/allawzi.net/privkey.pem nginx/ssl/allawzi.net.key
sudo cp /etc/letsencrypt/live/api.allawzi.net/fullchain.pem nginx/ssl/api.allawzi.net.crt
sudo cp /etc/letsencrypt/live/api.allawzi.net/privkey.pem nginx/ssl/api.allawzi.net.key

# تعديل الصلاحيات
sudo chmod 644 nginx/ssl/*.crt
sudo chmod 600 nginx/ssl/*.key
```

### 7. تفعيل HTTPS

في ملفات `nginx/conf.d/*.conf`، قم بإلغاء التعليق من إعدادات SSL:

```bash
# تحرير ملف allawzi.net
nano nginx/conf.d/yourdomain.com.conf

# تحرير ملف API
nano nginx/conf.d/api.yourdomain.com.conf
```

ابحث عن الأسطر التي تبدأ بـ `# ssl_certificate` وأزل علامة `#`.

### 8. إعادة تشغيل Nginx

```bash
docker-compose restart nginx-proxy
```

## ✅ اختبار النشر

```bash
# اختبار API
curl https://api.allawzi.net/api/health/live

# اختبار الموقع الرئيسي
curl -I https://allawzi.net
```

## 🔧 أوامر مفيدة

```bash
# عرض حالة الخدمات
docker-compose ps

# عرض السجلات
docker-compose logs -f

# إعادة تشغيل خدمة معينة
docker-compose restart api

# إيقاف جميع الخدمات
docker-compose down

# تحديث وإعادة البناء
docker-compose up -d --build
```

## 🌐 روابط المشروع

- **Admin Dashboard**: https://allawzi.net
- **API**: https://api.allawzi.net

## 📚 الوثائق الكاملة

للحصول على شرح تفصيلي، راجع:

- `DOCKER_DEPLOYMENT_README.md` - دليل Docker الشامل
- `DEPLOYMENT_VPS.md` - دليل النشر الكامل على VPS

---

**مبروك! 🎉 مشروعك الآن يعمل على الإنترنت!**

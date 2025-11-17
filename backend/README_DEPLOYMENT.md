# 📦 ملفات النشر على VPS

تم إنشاء الملفات التالية لدعم النشر على VPS:

## 📁 الملفات

### 1. `docker-compose.prod.yml`
ملف Docker Compose للإنتاج يحتوي على:
- **Redis**: داخل Docker مع persistence
- **API**: داخل Docker
- **Network**: شبكة Docker منفصلة
- **Health Checks**: فحوصات صحية للخدمات

### 2. `nginx.conf`
إعدادات Nginx للـ Reverse Proxy:
- HTTP to HTTPS redirect
- SSL/TLS configuration
- Rate limiting
- Security headers
- Proxy configuration

### 3. `deploy.sh`
سكريبت النشر التلقائي:
- التحقق من المتطلبات
- بناء Docker images
- تشغيل الخدمات
- التحقق من الحالة

### 4. `DEPLOYMENT_VPS.md`
دليل النشر الكامل بالعربية:
- إعداد VPS
- إعداد MongoDB
- إعداد Docker
- إعداد Nginx
- إعداد SSL
- استكشاف الأخطاء

### 5. `QUICK_START_VPS.md`
دليل النشر السريع:
- خطوات مختصرة
- أوامر أساسية
- مرجع سريع

## 🚀 البدء السريع

```bash
# 1. إعداد .env
cp env.example .env
nano .env

# 2. نشر
chmod +x deploy.sh
./deploy.sh

# 3. إعداد Nginx
sudo cp nginx.conf /etc/nginx/sites-available/tagdod-api
sudo ln -s /etc/nginx/sites-available/tagdod-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 4. SSL
sudo certbot --nginx -d api.allawzi.net
```

## 📚 للمزيد

راجع `DEPLOYMENT_VPS.md` للدليل الكامل.


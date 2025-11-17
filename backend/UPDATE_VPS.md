# 🔄 تحديث API على VPS بعد التعديلات

تم تعديل Threat Detection Middleware لاستثناء الـ headers الآمنة من Nginx و Postman.

## 📋 الخطوات لتطبيق التحديثات على VPS

### 1. رفع التغييرات إلى VPS

```bash
# على جهازك المحلي
cd backend
git add .
git commit -m "fix: exclude safe headers from threat detection"
git push

# على VPS
cd /opt/tagdod-api
git pull
```

### 2. إعادة بناء Docker Image

```bash
cd /opt/tagdod-api/backend

# إعادة بناء API container
docker-compose -f docker-compose.prod.yml build --no-cache api

# إعادة تشغيل الخدمات
docker-compose -f docker-compose.prod.yml up -d
```

### 3. التحقق من الحالة

```bash
# عرض حالة Containers
docker-compose -f docker-compose.prod.yml ps

# عرض Logs
docker-compose -f docker-compose.prod.yml logs -f api
```

### 4. اختبار API

```bash
# اختبار Health Check
curl https://api.allawzi.net/api/v1/health/live

# اختبار Products Endpoint
curl https://api.allawzi.net/api/v1/products/690dd8c2567068e48ce625d1
```

## ✅ ما تم تعديله

1. **Threat Detection Middleware**: استثناء الـ headers الآمنة من Nginx و Postman
2. **Swagger Config**: إضافة servers جديدة لـ api.allawzi.net

## 🔍 استكشاف الأخطاء

إذا واجهت مشاكل:

```bash
# عرض آخر 50 سطر من Logs
docker-compose -f docker-compose.prod.yml logs --tail=50 api

# إعادة تشغيل API
docker-compose -f docker-compose.prod.yml restart api

# التحقق من أن API يعمل محلياً
curl http://localhost:3000/api/v1/health/live
```

## 📝 ملاحظات

- Threat Detection لا يزال نشطاً لكنه يتجاهل الـ headers الآمنة
- يمكنك تعطيل Threat Detection بالكامل بإضافة `DISABLE_THREAT_DETECTION=true` في `.env`
- بعد التحديث، يجب أن تعمل الطلبات من Postman بدون مشاكل


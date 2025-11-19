# دليل سريع لإعداد WebSocket على VPS

## الخطوات السريعة (5 دقائق)

### 1. Backend - إضافة متغير البيئة

```bash
cd /path/to/backend
echo "FRONTEND_URL=https://admin.allawzi.net" >> .env
```

**استبدل `https://admin.allawzi.net` بـ URL لوحة الإدارة الفعلي**

### 2. Nginx - تحديث الإعدادات

```bash
# نسخ ملف nginx.conf المحدث
sudo cp backend/nginx.conf /etc/nginx/sites-available/tagdod-api.conf

# التحقق من الصحة
sudo nginx -t

# إعادة تحميل
sudo systemctl reload nginx
```

### 3. Frontend - إضافة متغير البيئة

```bash
cd /path/to/admin-dashboard
echo "VITE_API_BASE_URL=https://api.allawzi.net/api/v1" > .env
```

### 4. إعادة تشغيل الخدمات

```bash
# Backend (حسب طريقة التشغيل)
pm2 restart tagdod-api
# أو
docker-compose restart backend
# أو
sudo systemctl restart tagdod-api

# Frontend - إعادة البناء
cd admin-dashboard
npm run build
```

### 5. الاختبار

1. افتح `https://admin.allawzi.net`
2. افتح Console (F12)
3. سجل دخول
4. يجب أن ترى: `✅ Connected to notifications socket`

---

## الاختبار الكامل

### اختبار 1: إنشاء طلب جديد

من أي مستخدم، أنشئ طلب جديد. يجب أن يظهر إشعار فوراً في لوحة الإدارة.

### اختبار 2: التحقق من التنقل

اضغط على الإشعار. يجب أن ينتقل إلى صفحة تفاصيل الطلب.

---

## استكشاف الأخطاء

### الخطأ: "Connection error"

**الحل:**
1. تحقق من `FRONTEND_URL` في `.env` للـ Backend
2. تحقق من `VITE_API_BASE_URL` في `.env` للـ Frontend
3. تحقق من Nginx logs: `sudo tail -f /var/log/nginx/tagdod-api-error.log`

### الخطأ: "CORS policy"

**الحل:**
- تأكد أن `FRONTEND_URL` يطابق URL لوحة الإدارة بالضبط

### الإشعارات لا تظهر

**الحل:**
1. تحقق من أن المستخدم لديه دور `ADMIN` أو `SUPER_ADMIN`
2. تحقق من Backend logs
3. تحقق من Console في المتصفح

---

## الملفات المحدثة

- ✅ `backend/nginx.conf` - إضافة WebSocket support
- ✅ `backend/env.example` - إضافة FRONTEND_URL
- ✅ `backend/WEBSOCKET_SETUP_GUIDE.md` - دليل شامل
- ✅ `admin-dashboard/WEBSOCKET_TESTING.md` - دليل الاختبار
- ✅ `admin-dashboard/ENV_SETUP.md` - إعداد متغيرات البيئة

---

## الدعم

راجع `WEBSOCKET_SETUP_GUIDE.md` للدليل الكامل.


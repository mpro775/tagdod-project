# دليل إعداد WebSocket للإشعارات الفورية

## نظرة عامة

هذا الدليل يشرح كيفية إعداد نظام الإشعارات الفورية باستخدام WebSocket على VPS.

## المتطلبات

- NestJS Backend يعمل على المنفذ 3000
- Nginx كـ reverse proxy
- SSL Certificate (Let's Encrypt)
- Frontend (Admin Dashboard) يعمل على HTTPS

---

## 1. إعدادات Backend

### 1.1 متغيرات البيئة

أضف في ملف `.env` في مجلد `backend/`:

```bash
# Frontend URL for CORS and WebSocket
FRONTEND_URL=https://admin.allawzi.net
```

**ملاحظة:** استبدل `https://admin.allawzi.net` بـ URL لوحة الإدارة الفعلي.

### 1.2 التحقق من إعدادات WebSocket Gateway

تأكد أن `backend/src/modules/notifications/gateways/notifications.gateway.ts` يحتوي على:

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
  namespace: '/notifications',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
```

---

## 2. إعدادات Nginx

### 2.1 تحديث ملف nginx.conf

تم تحديث `backend/nginx.conf` لإضافة دعم WebSocket. تأكد من وجود:

```nginx
# WebSocket support for notifications
location /notifications {
    proxy_pass http://tagdod_api;
    proxy_http_version 1.1;
    
    # WebSocket specific headers
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket timeouts
    proxy_connect_timeout 7d;
    proxy_send_timeout 7d;
    proxy_read_timeout 7d;
    
    # Disable buffering
    proxy_buffering off;
}
```

### 2.2 تطبيق التغييرات على VPS

```bash
# 1. نسخ ملف nginx.conf إلى VPS
scp backend/nginx.conf user@your-vps:/etc/nginx/sites-available/tagdod-api.conf

# 2. التحقق من صحة الإعدادات
sudo nginx -t

# 3. إعادة تحميل nginx
sudo systemctl reload nginx
```

---

## 3. إعدادات Frontend

### 3.1 متغيرات البيئة

أنشئ ملف `.env` في مجلد `admin-dashboard/`:

```bash
VITE_API_BASE_URL=https://api.allawzi.net/api/v1
```

### 3.2 بناء المشروع

```bash
cd admin-dashboard
npm install
npm run build
```

---

## 4. خطوات التشغيل على VPS

### 4.1 Backend

```bash
# 1. الانتقال لمجلد Backend
cd /path/to/backend

# 2. التأكد من وجود .env مع FRONTEND_URL
cat .env | grep FRONTEND_URL

# 3. إعادة تشغيل Backend (حسب طريقة التشغيل)
# إذا كان يستخدم PM2:
pm2 restart tagdod-api

# إذا كان يستخدم Docker:
docker-compose restart backend

# إذا كان يستخدم systemd:
sudo systemctl restart tagdod-api
```

### 4.2 Nginx

```bash
# 1. التحقق من صحة الإعدادات
sudo nginx -t

# 2. إعادة تحميل nginx
sudo systemctl reload nginx

# 3. التحقق من حالة nginx
sudo systemctl status nginx
```

### 4.3 Frontend

```bash
# 1. بناء المشروع
cd /path/to/admin-dashboard
npm run build

# 2. نسخ الملفات إلى مجلد الويب
# (حسب إعداداتك - Apache, Nginx, etc.)
cp -r dist/* /var/www/admin-dashboard/
```

---

## 5. الاختبار

### 5.1 اختبار الاتصال من المتصفح

1. افتح لوحة الإدارة في المتصفح
2. افتح Developer Tools (F12)
3. اذهب إلى Console
4. سجل دخول كأدمن

**النتائج المتوقعة:**

```
✅ Connected to notifications socket
✅ Authenticated with notifications socket: { userId: "...", ... }
```

### 5.2 اختبار إرسال إشعار

**من Backend (Terminal):**

```bash
# إنشاء طلب جديد (سيؤدي لإرسال إشعار ORDER_CREATED)
curl -X POST https://api.allawzi.net/api/v1/checkout/confirm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryAddressId": "ADDRESS_ID",
    "currency": "YER",
    "paymentMethod": "COD"
  }'
```

**النتيجة المتوقعة:**
- ظهور إشعار في لوحة الإدارة فوراً
- تحديث العدد غير المقروء
- إمكانية الضغط على الإشعار والتنقل للطلب

### 5.3 اختبار أنواع الإشعارات المختلفة

| الحدث | كيفية الاختبار |
|------|----------------|
| **ORDER_CREATED** | إنشاء طلب جديد من أي مستخدم |
| **COUPON_USED** | استخدام كوبون عند إنشاء طلب |
| **ORDER_RATED** | تقييم طلب من قبل العميل |
| **INVOICE_CREATED** | إنشاء فاتورة PDF |
| **TICKET_CREATED** | إنشاء تذكرة دعم فني جديدة |
| **SUPPORT_MESSAGE_RECEIVED** | إرسال رسالة في تذكرة دعم فني |
| **SERVICE_REQUEST_OPENED** | إنشاء طلب خدمة جديد |
| **NEW_ENGINEER_OFFER** | تقديم عرض من مهندس |

### 5.4 اختبار WebSocket مباشرة

**استخدام wscat (اختياري):**

```bash
# تثبيت wscat
npm install -g wscat

# الاتصال بـ WebSocket
wscat -c "wss://api.allawzi.net/notifications" \
  -H "Authorization: Bearer YOUR_TOKEN"

# بعد الاتصال، أرسل:
{"event":"ping","data":{}}
```

**النتيجة المتوقعة:**
```
Connected (press CTRL+C to quit)
< {"event":"connected","data":{"userId":"..."}}
> {"event":"ping","data":{}}
< {"event":"pong","data":{"pong":true,"timestamp":"..."}}
```

---

## 6. استكشاف الأخطاء

### 6.1 WebSocket لا يتصل

**التحقق من:**

1. **Console في المتصفح:**
   ```
   ❌ Connection error: ...
   ```

2. **Nginx logs:**
   ```bash
   sudo tail -f /var/log/nginx/tagdod-api-error.log
   ```

3. **Backend logs:**
   ```bash
   # PM2
   pm2 logs tagdod-api
   
   # Docker
   docker logs tagdod-backend
   ```

**الحلول الشائعة:**

- تأكد من وجود `FRONTEND_URL` في `.env`
- تأكد من تحديث `nginx.conf` وإعادة تحميل nginx
- تأكد من أن SSL certificate صالح
- تأكد من أن Backend يعمل على المنفذ 3000

### 6.2 CORS Errors

**الخطأ:**
```
Access to XMLHttpRequest at 'wss://...' from origin '...' has been blocked by CORS policy
```

**الحل:**
- تأكد من `FRONTEND_URL` في `.env` يطابق URL لوحة الإدارة
- تأكد من أن `notifications.gateway.ts` يستخدم `process.env.FRONTEND_URL`

### 6.3 الإشعارات لا تظهر

**التحقق من:**

1. **Backend يرسل الإشعارات:**
   ```bash
   # تحقق من logs
   pm2 logs tagdod-api | grep "notification"
   ```

2. **WebSocket متصل:**
   - افتح Console في المتصفح
   - تحقق من رسالة "✅ Connected"

3. **المستخدم لديه صلاحيات:**
   - تأكد أن المستخدم لديه دور `ADMIN` أو `SUPER_ADMIN`

### 6.4 الإشعارات تظهر لكن التنقل لا يعمل

**التحقق من:**

1. **Routes في Frontend:**
   - تأكد من وجود routes للطلبات: `/orders/:id`
   - تأكد من وجود routes للخدمات: `/services/:id`
   - تأكد من وجود routes للدعم: `/support/:id`

2. **Console errors:**
   - افتح Console وتحقق من أي أخطاء JavaScript

---

## 7. مراقبة الأداء

### 7.1 مراقبة اتصالات WebSocket

```bash
# عدد الاتصالات النشطة
sudo netstat -an | grep :3000 | grep ESTABLISHED | wc -l

# مراقبة استخدام الذاكرة
pm2 monit
```

### 7.2 مراقبة Nginx

```bash
# مراقبة access logs
sudo tail -f /var/log/nginx/tagdod-api-access.log | grep notifications

# مراقبة error logs
sudo tail -f /var/log/nginx/tagdod-api-error.log
```

---

## 8. الأمان

### 8.1 تأمين WebSocket

- ✅ WebSocket محمي بـ JWT Authentication
- ✅ CORS محدود بـ `FRONTEND_URL`
- ✅ Rate limiting على مستوى Backend

### 8.2 توصيات إضافية

- استخدم HTTPS فقط (لا HTTP)
- راجع logs بانتظام
- حدّث SSL certificates قبل انتهاء صلاحيتها

---

## 9. الاختبار النهائي

### قائمة التحقق:

- [ ] Backend يعمل على المنفذ 3000
- [ ] Nginx يعمل ويوجه `/notifications` للـ Backend
- [ ] `FRONTEND_URL` موجود في `.env`
- [ ] `VITE_API_BASE_URL` موجود في `.env` للـ Frontend
- [ ] SSL certificate صالح
- [ ] WebSocket يتصل بنجاح (Console: "✅ Connected")
- [ ] الإشعارات تظهر عند إنشاء طلب جديد
- [ ] الضغط على الإشعار ينقل للصفحة الصحيحة
- [ ] العدد غير المقروء يتحدث فوراً

---

## 10. الدعم

إذا واجهت مشاكل:

1. راجع logs (Backend و Nginx)
2. تحقق من Console في المتصفح
3. تأكد من جميع المتغيرات البيئية
4. تأكد من تحديث جميع الملفات على VPS

---

**تاريخ آخر تحديث:** 2025-01-XX


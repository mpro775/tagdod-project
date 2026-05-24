# 🚀 دليل استخدام Nginx Proxy Manager

## 📋 نظرة عامة

Nginx Proxy Manager هو واجهة ويب سهلة الاستخدام لإدارة Nginx كـ Reverse Proxy مع إصدار شهادات SSL تلقائياً من Let's Encrypt.

## ✨ المزايا

✅ **واجهة ويب سهلة الاستخدام**  
✅ **إصدار شهادات SSL تلقائياً**  
✅ **تجديد الشهادات تلقائياً كل 90 يوم**  
✅ **إدارة النطاقات بنقرات قليلة**  
✅ **دعم Access Lists وحماية المسارات**  
✅ **Logs مباشرة من الواجهة**  
✅ **دعم WebSockets**  
✅ **Custom Locations**

---

## 🚀 خطوات التشغيل

### 1. **إيقاف الخدمات القديمة (إن وجدت)**

```bash
cd /home/deploy/tagdod-project
docker-compose down
```

### 2. **إزالة Nginx القديم (إن وجد)**

```bash
docker rm -f tagdod-nginx-proxy 2>/dev/null
```

### 3. **تشغيل الخدمات مع Nginx Proxy Manager**

```bash
docker-compose up -d
```

### 4. **التحقق من حالة الخدمات**

```bash
docker-compose ps
```

يجب أن ترى:
```
NAME                    IMAGE                                STATUS
nginx-proxy-manager     jc21/nginx-proxy-manager:latest     Up (healthy)
tagdod-api              tagdod-project-api                   Up (healthy)
tagdod-admin            tagdod-project-admin-dashboard       Up (healthy)
tagdod-redis            redis:7-alpine                       Up (healthy)
```

---

## 🔐 الوصول إلى لوحة التحكم

### **الرابط:**
```
http://YOUR_SERVER_IP:81
```

أو إذا كان لديك نطاق مؤقت:
```
http://allawzi.net:81
```

### **بيانات الدخول الافتراضية:**
- **Email:** `admin@example.com`
- **Password:** `changeme`

⚠️ **مهم:** سيطلب منك تغيير البريد وكلمة المرور فوراً بعد أول تسجيل دخول!

---

## 🎯 إعداد النطاقات والشهادات

### **الخطوة 1: إعداد API Backend**

1. انقر على **"Proxy Hosts"** من القائمة الجانبية
2. انقر على **"Add Proxy Host"**
3. املأ البيانات:

#### **تبويب Details:**
```
Domain Names:           api.allawzi.net
Scheme:                 http
Forward Hostname / IP:  api
Forward Port:           3000
```

✅ **Cache Assets**  
✅ **Block Common Exploits**  
✅ **Websockets Support**

#### **تبويب SSL:**
✅ **Request a new SSL Certificate**  
✅ **Force SSL**  
✅ **HTTP/2 Support**  
✅ **HSTS Enabled**  

**Email Address:** أدخل بريدك الإلكتروني  
✅ **I Agree to the Let's Encrypt Terms of Service**

4. انقر على **"Save"**

### **الخطوة 2: إعداد Admin Dashboard**

1. انقر على **"Add Proxy Host"** مرة أخرى
2. املأ البيانات:

#### **تبويب Details:**
```
Domain Names:           allawzi.net, www.allawzi.net
Scheme:                 http
Forward Hostname / IP:  admin-dashboard
Forward Port:           80
```

✅ **Cache Assets**  
✅ **Block Common Exploits**  

#### **تبويب SSL:**
نفس إعدادات الـ API

3. انقر على **"Save"**

---

## 🔒 إعدادات الأمان المتقدمة (اختياري)

### **1. حماية لوحة الإدارة بـ IP Whitelist**

إذا أردت حماية لوحة تحكم Nginx Proxy Manager نفسها:

1. اذهب إلى **"Access Lists"**
2. انقر على **"Add Access List"**
3. املأ البيانات:
   - **Name:** Admin Only
   - **Satisfy Any:** ✅
   - **Pass Auth:** ❌
4. في قسم **"Authorization"**:
   - انقر على **"Add IP/CIDR"**
   - أدخل IP الخاص بك (مثل: `41.32.xxx.xxx/32`)
5. **Save**

ثم ارجع إلى **Proxy Hosts** وحدد Host الخاص بالبورت 81 وطبق Access List عليه.

### **2. حماية مسارات معينة بـ Basic Auth**

مثلاً لحماية `/admin` في Dashboard:

1. اذهب إلى **"Access Lists"**
2. انقر على **"Add Access List"**
3. املأ البيانات:
   - **Name:** Admin Auth
4. في قسم **"Authorization"**:
   - **Username:** admin
   - **Password:** كلمة مرور قوية
5. **Save**

ثم في **Proxy Host** الخاص بالـ Dashboard:
- اذهب إلى تبويب **"Custom Locations"**
- أضف location جديد:
  ```
  Location: /admin
  Scheme: http
  Forward Hostname/IP: admin-dashboard
  Forward Port: 80
  Access List: Admin Auth
  ```

---

## 📊 مراقبة الخدمات

### **1. مشاهدة Logs مباشرة**

من لوحة Nginx Proxy Manager:
- اذهب إلى **Proxy Hosts**
- انقر على الـ 3 نقاط بجانب أي Host
- اختر **"View Logs"**

### **2. مراقبة حالة الخدمات**

```bash
# حالة جميع الخدمات
docker-compose ps

# Logs لـ Nginx Proxy Manager
docker-compose logs -f nginx-proxy-manager

# Logs للـ API
docker-compose logs -f api

# Logs للـ Admin Dashboard
docker-compose logs -f admin-dashboard
```

---

## 🔄 تجديد الشهادات

**تلقائي!** 🎉

Nginx Proxy Manager يجدد الشهادات تلقائياً قبل انتهاء صلاحيتها بـ 30 يوم.

للتحقق من تاريخ انتهاء الشهادة:
1. اذهب إلى **"SSL Certificates"**
2. ستجد قائمة بجميع الشهادات مع تواريخ الانتهاء

---

## 🛠️ استكشاف الأخطاء

### **المشكلة: لا يمكن الوصول إلى البورت 81**

**الحل:**
```bash
# تحقق من أن UFW يسمح بالبورت
sudo ufw allow 81/tcp
sudo ufw reload
```

### **المشكلة: فشل إصدار شهادة SSL**

**الأسباب المحتملة:**
1. النطاق لا يشير إلى IP السيرفر الصحيح
2. البورت 80 أو 443 مغلق في Firewall
3. تم تجاوز حد Let's Encrypt (5 شهادات في الساعة)

**الحل:**
```bash
# تحقق من DNS
nslookup api.allawzi.net

# تحقق من Firewall
sudo ufw status

# تحقق من Logs
docker-compose logs nginx-proxy-manager | grep -i error
```

### **المشكلة: الخدمات لا تتواصل مع بعضها**

**الحل:**
```bash
# تحقق من الشبكة
docker network inspect tagdod-project_tagdod-network

# أعد تشغيل الخدمات
docker-compose restart
```

---

## 🎨 إعدادات متقدمة

### **1. Custom Nginx Configuration**

في أي Proxy Host، اذهب إلى تبويب **"Advanced"** وأضف:

```nginx
# تحسين الأداء
client_max_body_size 100M;
proxy_connect_timeout 600s;
proxy_send_timeout 600s;
proxy_read_timeout 600s;

# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;

# CORS (إذا لزم الأمر للـ API)
add_header Access-Control-Allow-Origin "https://allawzi.net" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
```

### **2. Redirect www إلى non-www**

في Proxy Host الخاص بـ Dashboard:
- **Domain Names:** `allawzi.net www.allawzi.net`
- في **Advanced** أضف:

```nginx
if ($host = 'www.allawzi.net') {
    return 301 https://allawzi.net$request_uri;
}
```

### **3. Rate Limiting**

لحماية API من Abuse:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req zone=api_limit burst=20 nodelay;
```

---

## 📦 النسخ الاحتياطي

### **ما يجب نسخه احتياطياً:**

```bash
# بيانات Nginx Proxy Manager
docker run --rm \
  -v tagdod-project_npm-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/npm-backup.tar.gz -C /data .

# شهادات SSL
docker run --rm \
  -v tagdod-project_npm-letsencrypt:/letsencrypt \
  -v $(pwd):/backup \
  alpine tar czf /backup/letsencrypt-backup.tar.gz -C /letsencrypt .
```

### **استعادة النسخة الاحتياطية:**

```bash
# استعادة بيانات NPM
docker run --rm \
  -v tagdod-project_npm-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/npm-backup.tar.gz -C /data

# استعادة شهادات SSL
docker run --rm \
  -v tagdod-project_npm-letsencrypt:/letsencrypt \
  -v $(pwd):/backup \
  alpine tar xzf /backup/letsencrypt-backup.tar.gz -C /letsencrypt
```

---

## 📚 روابط مفيدة

- **الموقع الرسمي:** https://nginxproxymanager.com/
- **الوثائق:** https://nginxproxymanager.com/guide/
- **GitHub:** https://github.com/NginxProxyManager/nginx-proxy-manager
- **Let's Encrypt Rate Limits:** https://letsencrypt.org/docs/rate-limits/

---

## ✅ Checklist للإطلاق

- [ ] Nginx Proxy Manager يعمل على البورت 81
- [ ] تم تغيير بيانات المدير الافتراضية
- [ ] تم إعداد Proxy Host للـ API مع SSL
- [ ] تم إعداد Proxy Host للـ Dashboard مع SSL
- [ ] جميع النطاقات تعمل بـ HTTPS
- [ ] تم اختبار تجديد الشهادات التلقائي
- [ ] تم إعداد النسخ الاحتياطي الدوري
- [ ] تم تفعيل Access Lists للمسارات الحساسة (اختياري)
- [ ] تم تفعيل Rate Limiting للـ API (اختياري)

---

## 🎉 النتيجة النهائية

بعد اكتمال جميع الخطوات:

✅ `https://allawzi.net` → Admin Dashboard (مع SSL)  
✅ `https://api.allawzi.net` → API Backend (مع SSL)  
✅ `http://YOUR_SERVER_IP:81` → Nginx Proxy Manager Dashboard  
✅ تجديد تلقائي للشهادات كل 90 يوم  
✅ إدارة سهلة من واجهة ويب  

**مبروك! 🚀 نظامك الآن آمن ومحترف!**


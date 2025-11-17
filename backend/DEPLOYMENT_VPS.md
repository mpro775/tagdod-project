# 🚀 دليل النشر على VPS - Tagdod API

هذا الدليل يشرح كيفية نشر Tagdod API على VPS مع:
- **MongoDB**: خارج Docker (على VPS مباشرة أو MongoDB Atlas)
- **Redis**: داخل Docker
- **API**: داخل Docker
- **Nginx**: كـ Reverse Proxy
- **Domain**: api.allawzi.net

---

## 📋 المتطلبات الأساسية

### 1. متطلبات النظام
- Ubuntu 20.04+ أو Debian 11+
- Docker و Docker Compose مثبتين
- Nginx مثبت
- MongoDB مثبت على VPS أو MongoDB Atlas
- Domain name يشير إلى VPS IP (api.allawzi.net)

### 2. متطلبات الحساب
- حساب VPS مع صلاحيات sudo
- Domain name (api.allawzi.net)
- MongoDB connection string (إذا كنت تستخدم MongoDB Atlas)

---

## 🔧 الخطوة 1: إعداد VPS

### 1.1 تحديث النظام
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 تثبيت Docker
```bash
# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# إضافة المستخدم إلى مجموعة docker
sudo usermod -aG docker $USER

# تسجيل الخروج وإعادة الدخول لتطبيق التغييرات
exit
```

### 1.3 تثبيت Docker Compose
```bash
sudo apt install docker-compose-plugin -y
# أو
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 1.4 تثبيت Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 🗄️ الخطوة 2: إعداد MongoDB

### الخيار 1: MongoDB على VPS (محلي)

```bash
# تثبيت MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# تشغيل MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# إنشاء قاعدة بيانات
mongosh
> use tagadodo
> db.createUser({user: "tagdod_user", pwd: "YOUR_SECURE_PASSWORD", roles: [{role: "readWrite", db: "tagadodo"}]})
> exit
```

**Connection String:**
```
MONGO_URI=mongodb://tagdod_user:YOUR_SECURE_PASSWORD@localhost:27017/tagadodo?authSource=tagadodo
```

### الخيار 2: MongoDB Atlas (موصى به للإنتاج)

1. أنشئ حساب على [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. أنشئ Cluster جديد
3. أنشئ Database User
4. أضف IP VPS إلى Network Access List
5. احصل على Connection String

**Connection String:**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tagadodo?retryWrites=true&w=majority
```

---

## 📦 الخطوة 3: رفع الكود إلى VPS

### 3.1 رفع الملفات
```bash
# على جهازك المحلي
cd backend
scp -r . user@your-vps-ip:/opt/tagdod-api/

# أو استخدم Git
ssh user@your-vps-ip
cd /opt
git clone https://github.com/mpro775/tagdod-project.git tagdod-api
cd tagdod-api/backend
```

### 3.2 إعداد ملف .env
```bash
cd /opt/tagdod-api/backend
cp env.example .env
nano .env
```

**قم بتحديث القيم التالية:**
```env
NODE_ENV=production
PORT=3000

# MongoDB (اختر أحد الخيارين)
MONGO_URI=mongodb://tagdod_user:PASSWORD@localhost:27017/tagadodo?authSource=tagadodo
# أو
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tagadodo?retryWrites=true&w=majority

# Redis (سيتم تحديثه تلقائياً في Docker)
REDIS_URL=redis://redis:6379

# JWT Secrets (أنشئ قيم آمنة)
JWT_SECRET=YOUR_32_CHAR_SECRET_HERE
REFRESH_SECRET=YOUR_32_CHAR_SECRET_HERE

# CORS Origins
CORS_ORIGINS=https://api.allawzi.net,https://app.allawzi.net

# باقي الإعدادات...
```

**لإنشاء JWT Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🐳 الخطوة 4: نشر Docker Containers

### 4.1 تشغيل سكريبت النشر
```bash
cd /opt/tagdod-api/backend
chmod +x deploy.sh
./deploy.sh
```

### 4.2 التحقق من الحالة
```bash
# عرض الحالة
docker-compose -f docker-compose.prod.yml ps

# عرض الـ Logs
docker-compose -f docker-compose.prod.yml logs -f api
```

### 4.3 اختبار API محلياً
```bash
curl http://localhost:3000/health/live
```

---

## 🌐 الخطوة 5: إعداد Nginx

### 5.1 نسخ ملف Nginx Configuration
```bash
sudo cp /opt/tagdod-api/backend/nginx.conf /etc/nginx/sites-available/tagdod-api
sudo ln -s /etc/nginx/sites-available/tagdod-api /etc/nginx/sites-enabled/
```

### 5.2 تحديث Domain Name
```bash
sudo nano /etc/nginx/sites-available/tagdod-api
# تأكد من أن server_name هو api.allawzi.net
```

### 5.3 اختبار Configuration
```bash
sudo nginx -t
```

### 5.4 إعادة تحميل Nginx
```bash
sudo systemctl reload nginx
```

---

## 🔒 الخطوة 6: إعداد SSL Certificate

### 6.1 تثبيت Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 الحصول على Certificate
```bash
sudo certbot --nginx -d api.allawzi.net
```

### 6.3 تحديث Nginx Configuration
بعد الحصول على الـ Certificate، تأكد من تحديث مسارات SSL في `/etc/nginx/sites-available/tagdod-api`:

```nginx
ssl_certificate /etc/letsencrypt/live/api.allawzi.net/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/api.allawzi.net/privkey.pem;
```

### 6.4 إعادة تحميل Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 6.5 تجديد تلقائي للـ Certificate
```bash
sudo certbot renew --dry-run
```

---

## ✅ الخطوة 7: التحقق من النشر

### 7.1 اختبار Health Check
```bash
curl https://api.allawzi.net/health/live
```

### 7.2 اختبار API Documentation
افتح المتصفح:
```
https://api.allawzi.net/api/docs
```

### 7.3 اختبار API Endpoint
```bash
curl https://api.allawzi.net/api/v1/health
```

---

## 🔄 إدارة الخدمة

### عرض Logs
```bash
# جميع الـ Logs
docker-compose -f docker-compose.prod.yml logs -f

# API فقط
docker-compose -f docker-compose.prod.yml logs -f api

# Redis فقط
docker-compose -f docker-compose.prod.yml logs -f redis
```

### إعادة تشغيل الخدمة
```bash
docker-compose -f docker-compose.prod.yml restart api
```

### إيقاف الخدمة
```bash
docker-compose -f docker-compose.prod.yml down
```

### تحديث الكود
```bash
cd /opt/tagdod-api/backend
git pull
docker-compose -f docker-compose.prod.yml build --no-cache api
docker-compose -f docker-compose.prod.yml up -d
```

### عرض استخدام الموارد
```bash
docker stats
```

---

## 🛠️ استكشاف الأخطاء

### المشكلة: API لا يعمل
```bash
# تحقق من الـ Logs
docker-compose -f docker-compose.prod.yml logs api

# تحقق من الاتصال بـ Redis
docker exec -it tagdod-api node -e "const Redis = require('ioredis'); const r = new Redis('redis://redis:6379'); r.ping().then(console.log).catch(console.error);"

# تحقق من الاتصال بـ MongoDB
docker exec -it tagdod-api node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected')).catch(console.error);"
```

### المشكلة: Nginx لا يعمل
```bash
# تحقق من الـ Configuration
sudo nginx -t

# تحقق من الـ Logs
sudo tail -f /var/log/nginx/tagdod-api-error.log
```

### المشكلة: SSL Certificate لا يعمل
```bash
# تحقق من الـ Certificate
sudo certbot certificates

# تجديد الـ Certificate
sudo certbot renew
```

---

## 📊 Monitoring

### Health Checks
```bash
# Health Check Endpoint
curl https://api.allawzi.net/health/live
curl https://api.allawzi.net/health/ready
```

### Container Health
```bash
docker ps
docker stats
```

---

## 🔐 الأمان

### 1. Firewall
```bash
# تثبيت UFW
sudo apt install ufw -y

# فتح Ports المطلوبة
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# تفعيل Firewall
sudo ufw enable
```

### 2. تحديث النظام
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. MongoDB Security
- استخدم كلمات مرور قوية
- قيد الوصول بـ IP Whitelist
- استخدم MongoDB Atlas للإنتاج (موصى به)

---

## 📝 ملاحظات مهمة

1. **MongoDB خارج Docker**: تأكد من أن MongoDB يعمل على VPS أو MongoDB Atlas
2. **Redis داخل Docker**: Redis يعمل داخل Docker network باسم `redis`
3. **API داخل Docker**: API يعمل على Port 3000 داخل Docker
4. **Nginx Reverse Proxy**: يوجه الطلبات من api.allawzi.net إلى API
5. **SSL Certificate**: يجب تجديده كل 90 يوم (تلقائياً مع certbot)

---

## 🆘 الدعم

إذا واجهت أي مشاكل:
1. تحقق من الـ Logs
2. تحقق من الـ Configuration
3. تحقق من الاتصال بالخدمات الخارجية (MongoDB)
4. راجع هذا الدليل مرة أخرى

---

**تم النشر بنجاح! 🎉**


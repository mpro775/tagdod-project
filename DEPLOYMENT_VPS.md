# 🚀 دليل نشر مشروع Tagdod على VPS - شامل واحترافي

## 📋 نظرة عامة على المشروع

مشروع Tagdod يتكون من:

- **Backend API**: Node.js/NestJS مع Docker (Redis داخلي، MongoDB خارجي)
- **Admin Dashboard**: React/TypeScript لوحة إدارة (الموقع الرئيسي)

## 🎯 متطلبات الخادم

### مواصفات الحد الأدنى:

- **RAM**: 2GB
- **CPU**: 1 core
- **Storage**: 20GB SSD
- **OS**: Ubuntu 22.04 LTS أو Debian 12

### مواصفات موصى بها:

- **RAM**: 4GB+
- **CPU**: 2 cores+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS

---

## 📋 قائمة المراجعة قبل البدء

- [ ]  خادم VPS جاهز مع SSH access
- [ ]  دومين مسجل ومُعد للاستخدام
- [ ]  قاعدة بيانات MongoDB خارجية جاهزة
- [ ]  نسخة احتياطية من الكود الحالي
- [ ]  مفاتيح API المطلوبة (إن وجدت)

---

## 🔧 الخطوة 1: إعداد الخادم الأساسي

### 1.1 تحديث النظام وتثبيت الأدوات الأساسية

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت الأدوات الأساسية
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release ufw

# تثبيت Node.js 22 (للبناء المحلي)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت Docker و Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# تثبيت Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 1.2 إعداد المستخدم والأمان

```bash
# إنشاء مستخدم جديد (لا تستخدم root)
sudo adduser deploy
sudo usermod -aG sudo deploy
sudo usermod -aG docker deploy

# إعداد SSH للمستخدم الجديد
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys

# تعطيل تسجيل الدخول بـ root
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl reload sshd
```

### 1.3 إعداد جدار الحماية (UFW)

```bash
# إعداد جدار الحماية
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# التحقق من حالة جدار الحماية
sudo ufw status
```

### 1.4 إعداد Fail2Ban للحماية من الهجمات

```bash
# تثبيت Fail2Ban
sudo apt install -y fail2ban

# إنشاء إعدادات مخصصة
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
EOF

# إعادة تشغيل Fail2Ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

---

## 🌐 الخطوة 2: إعداد الدومين والـ DNS

### 2.1 إعداد DNS Records

في لوحة تحكم مزود الدومين (allawzi.net)، أضف هذه السجلات:

```
Type: A
Name: @
Value: YOUR_VPS_IP_ADDRESS
TTL: 300

Type: A
Name: www
Value: YOUR_VPS_IP_ADDRESS
TTL: 300

Type: A
Name: api
Value: YOUR_VPS_IP_ADDRESS
TTL: 300
```

### 2.2 التحقق من DNS Propagation

```bash
# تثبيت dnsutils
sudo apt install -y dnsutils

# التحقق من DNS
nslookup allawzi.net
nslookup api.allawzi.net
nslookup www.allawzi.net
```

---

## 🗄️ الخطوة 3: إعداد قاعدة البيانات MongoDB الخارجية

### 3.1 إعداد MongoDB Atlas (موصى به)

1. **إنشاء حساب MongoDB Atlas**: https://www.mongodb.com/atlas
2. **إنشاء Cluster جديد**
3. **إعداد Database User مع صلاحيات مناسبة**
4. **إضافة IP Address للخادم** (`YOUR_VPS_IP_ADDRESS/32`)
5. **الحصول على Connection String**

### 3.2 أو إعداد MongoDB على خادم منفصل

```bash
# على الخادم المنفصل لـ MongoDB
sudo apt install -y mongodb

# إعداد MongoDB للوصول عن بعد
sudo sed -i 's/bind_ip = 127.0.0.1/bind_ip = 0.0.0.0/' /etc/mongodb.conf

# إضافة مستخدم قاعدة البيانات
mongo
use admin
db.createUser({
  user: "tagdod_user",
  pwd: "SECURE_PASSWORD",
  roles: ["readWrite", "dbAdmin"]
})
```

### 3.3 الحصول على MONGO_URI

```
mongodb+srv://username:password@cluster.mongodb.net/tagdod_db?retryWrites=true&w=majority
```

أو للإعداد المحلي:

```
mongodb://username:password@MONGODB_SERVER_IP:27017/tagdod_db
```

---

## 🔧 الخطوة 4: تحضير الكود والبناء

### 4.1 استنساخ المشروع

```bash
# تسجيل الدخول كمستخدم deploy
su - deploy

# استنساخ المشروع
git clone https://github.com/YOUR_USERNAME/tagdod-project.git
cd tagdod-project

# إعداد الفرع المناسب
git checkout main  # أو الفرع المطلوب
```

### 4.2 إعداد متغيرات البيئة للـ Backend

```bash
cd backend

# نسخ ملف البيئة
cp .env.example .env

# تحرير متغيرات البيئة
nano .env
```

**محتوى ملف .env المطلوب:**

```env
# Environment
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tagdod_db?retryWrites=true&w=majority

# Redis (سيتم تحديثه تلقائياً بواسطة السكريبت)
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_EXPIRES_IN=24h

# Application
PORT=3000
API_PREFIX=api

# CORS
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com

# Email (إذا كان مطلوباً)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment Gateway (إذا كان مطلوباً)
STRIPE_SECRET_KEY=sk_live_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# File Upload
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
```

### 4.3 بناء التطبيق الأمامي

```bash
# بناء Admin Dashboard
cd ../admin-dashboard
npm install
npm run build
```

---

## 🐳 الخطوة 5: نشر الـ Backend مع Docker

### 5.1 تشغيل السكريبت التلقائي للنشر

```bash
cd ../backend

# جعل السكريبت قابل للتنفيذ
chmod +x deploy.sh

# تشغيل النشر
./deploy.sh
```

### 5.2 التحقق من النشر

```bash
# التحقق من الحاويات
docker ps

# عرض سجلات الحاويات
docker-compose -f docker-compose.prod.yml logs -f

# اختبار API
curl http://localhost:3000/health/live
```

---

## 🌐 الخطوة 6: إعداد Nginx

### 6.1 تثبيت وإعداد Nginx

```bash
# تثبيت Nginx
sudo apt install -y nginx

# إنشاء مجلدات للمواقع
sudo mkdir -p /var/www/html
sudo mkdir -p /var/www/admin
sudo mkdir -p /var/www/api

# تعيين الصلاحيات
sudo chown -R www-data:www-data /var/www
sudo chmod -R 755 /var/www
```

### 6.2 نسخ ملفات التطبيقات الأمامية

```bash
# نسخ Admin Dashboard (الموقع الرئيسي)
sudo cp -r ~/tagdod-project/admin-dashboard/dist/* /var/www/html/
```

### 6.3 إعداد إعدادات Nginx

```bash
# إنشاء إعدادات الموقع الرئيسي
sudo tee /etc/nginx/sites-available/allawzi.net > /dev/null <<EOF
# Upstream for API
upstream tagdod_api {
    server 127.0.0.1:3000;
}

# Main Site (Admin Dashboard)
server {
    listen 80;
    server_name allawzi.net www.allawzi.net;

    root /var/www/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    # Handle React Router
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy (for any API calls from landing page)
    location /api/ {
        proxy_pass http://tagdod_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# إنشاء إعدادات API
sudo tee /etc/nginx/sites-available/api.allawzi.net > /dev/null <<EOF
server {
    listen 80;
    server_name api.allawzi.net;

    # API proxy
    location / {
        proxy_pass http://tagdod_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Additional API headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;

        # CORS headers (adjust as needed)
        add_header 'Access-Control-Allow-Origin' 'https://allawzi.net' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }
}
EOF
```

### 6.4 تفعيل المواقع وتعطيل الموقع الافتراضي

```bash
# تفعيل المواقع
sudo ln -s /etc/nginx/sites-available/allawzi.net /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.allawzi.net /etc/nginx/sites-enabled/

# تعطيل الموقع الافتراضي
sudo unlink /etc/nginx/sites-enabled/default

# اختبار إعدادات Nginx
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔒 الخطوة 7: إعداد شهادات SSL مع Let's Encrypt

### 7.1 تثبيت Certbot

```bash
# تثبيت Certbot
sudo apt install -y snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# إنشاء رابط رمزي
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 7.2 الحصول على شهادات SSL

```bash
# الحصول على شهادة للموقع الرئيسي (Admin Dashboard)
sudo certbot --nginx -d allawzi.net -d www.allawzi.net

# الحصول على شهادة للـ API
sudo certbot --nginx -d api.allawzi.net
```

### 7.3 إعداد تجديد تلقائي للشهادات

```bash
# اختبار التجديد
sudo certbot renew --dry-run

# إعداد cron job للتجديد التلقائي (يتم تلقائياً مع certbot)
sudo crontab -l | grep certbot
```

---

## 🔍 الخطوة 8: الاختبار والتحقق

### 8.1 اختبار المواقع

```bash
# اختبار الموقع الرئيسي (Admin Dashboard)
curl -I https://allawzi.net

# اختبار API
curl -I https://api.allawzi.net/api/health/live
```

### 8.2 اختبار SSL

```bash
# اختبار شهادات SSL
openssl s_client -connect allawzi.net:443 -servername allawzi.net < /dev/null | openssl x509 -noout -dates

# اختبار SSL Labs
curl -s "https://www.ssllabs.com/ssltest/analyze.html?d=allawzi.net" | grep -i "rating"
```

### 8.3 اختبار الأداء

```bash
# تثبيت أدوات الاختبار
sudo apt install -y apache2-utils

# اختبار تحميل API
ab -n 100 -c 10 https://api.allawzi.net/api/health/live
```

---

## 📊 الخطوة 9: إعداد المراقبة والصيانة

### 9.1 إعداد Logrotate

```bash
# إعداد logrotate لسجلات Docker
sudo tee /etc/logrotate.d/docker > /dev/null <<EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
EOF
```

### 9.2 إعداد مراقبة النظام

```bash
# تثبيت htop و iotop
sudo apt install -y htop iotop ncdu

# مراقبة استخدام الموارد
htop

# مراقبة استخدام القرص
df -h

# مراقبة استخدام الذاكرة
free -h
```

### 9.3 إعداد نسخ احتياطي تلقائي

```bash
# إنشاء سكريبت النسخ الاحتياطي
sudo tee /usr/local/bin/tagdod-backup.sh > /dev/null <<EOF
#!/bin/bash

BACKUP_DIR="/var/backups/tagdod"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# نسخ احتياطي لقاعدة البيانات (إذا كانت محلية)
# mongodump --out \$BACKUP_DIR/mongodb_\$DATE

# نسخ احتياطي للإعدادات
cp -r ~/tagdod-project/backend/.env \$BACKUP_DIR/

# ضغط النسخة الاحتياطية
tar -czf \$BACKUP_DIR/backup_\$DATE.tar.gz -C \$BACKUP_DIR .

# حذف النسخ الاحتياطية القديمة (احتفظ بـ 7 أيام)
find \$BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: \$BACKUP_DIR/backup_\$DATE.tar.gz"
EOF

# جعل السكريبت قابل للتنفيذ
sudo chmod +x /usr/local/bin/tagdod-backup.sh

# إضافة إلى crontab (نسخ احتياطي يومي الساعة 2 صباحاً)
echo "0 2 * * * /usr/local/bin/tagdod-backup.sh" | sudo crontab -
```

---

## 🚀 الخطوة 10: الأوامر المفيدة للصيانة

### إدارة Docker

```bash
# عرض حالة الحاويات
docker ps

# عرض سجلات الحاويات
docker-compose -f ~/tagdod-project/backend/docker-compose.prod.yml logs -f

# إعادة تشغيل الخدمات
docker-compose -f ~/tagdod-project/backend/docker-compose.prod.yml restart

# تحديث التطبيق
cd ~/tagdod-project
git pull origin main
cd backend
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### إدارة Nginx

```bash
# اختبار الإعدادات
sudo nginx -t

# إعادة تحميل الإعدادات
sudo nginx -s reload

# عرض حالة Nginx
sudo systemctl status nginx
```

### مراقبة النظام

```bash
# مراقبة السجلات
sudo journalctl -u nginx -f
sudo journalctl -u docker -f

# مراقبة استخدام الموارد
htop
df -h
free -h
```

---

## 🆘 استكشاف الأخطاء الشائعة

### مشكلة: API لا يعمل

```bash
# التحقق من حالة الحاويات
docker ps

# عرض سجلات API
docker-compose -f ~/tagdod-project/backend/docker-compose.prod.yml logs api

# اختبار API محلياً
curl http://localhost:3000/health/live
```

### مشكلة: الموقع لا يحمل

```bash
# التحقق من Nginx
sudo nginx -t
sudo systemctl status nginx

# التحقق من ملفات الموقع
ls -la /var/www/html/
ls -la /var/www/admin/
```

### مشكلة: SSL لا يعمل

```bash
# التحقق من شهادات SSL
sudo certbot certificates

# تجديد الشهادات
sudo certbot renew
```

---

## 📞 الدعم والصيانة

### فحوصات يومية:

- [ ]  التحقق من حالة الخدمات: `docker ps`
- [ ]  التحقق من استخدام الموارد: `htop`
- [ ]  فحص السجلات: `docker-compose logs`

### فحوصات أسبوعية:

- [ ]  اختبار النسخ الاحتياطي
- [ ]  فحص شهادات SSL
- [ ]  تحديث النظام: `sudo apt update && sudo apt upgrade`

### فحوصات شهرية:

- [ ]  اختبار الأداء الكامل
- [ ]  مراجعة السجلات للأخطاء
- [ ]  تحديث التطبيقات

---

## 🎉 تهانينا!

تم نشر مشروع Tagdod بنجاح على VPS مع:

- ✅ شهادات SSL آمنة
- ✅ إعداد احترافي للنشر
- ✅ حماية متقدمة
- ✅ مراقبة وصيانة
- ✅ نسخ احتياطي تلقائي

**روابط المشروع:**

- الموقع الرئيسي (Admin Dashboard): https://allawzi.net
- API: https://api.allawzi.net

**تذكر:** احتفظ بنسخة احتياطية من ملفات الإعدادات والمفاتيح السرية في مكان آمن!

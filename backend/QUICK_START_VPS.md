# ⚡ دليل النشر السريع على VPS

## 📋 الخطوات السريعة

### 1. إعداد VPS
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# تثبيت Docker Compose
sudo apt install docker-compose-plugin -y

# تثبيت Nginx
sudo apt install nginx -y
```

### 2. إعداد MongoDB (اختر أحد الخيارين)

**الخيار أ: MongoDB Atlas (موصى به)**
- أنشئ حساب على [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- احصل على Connection String

**الخيار ب: MongoDB على VPS**
```bash
# تثبيت MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. رفع الكود
```bash
# على VPS
cd /opt
git clone YOUR_REPO_URL tagdod-api
cd tagdod-api/backend
```

### 4. إعداد .env
```bash
cp env.example .env
nano .env
```

**قم بتحديث:**
```env
NODE_ENV=production
MONGO_URI=your-mongodb-connection-string
REDIS_URL=redis://redis:6379
JWT_SECRET=your-32-char-secret
REFRESH_SECRET=your-32-char-secret
CORS_ORIGINS=https://api.allawzi.net
```

### 5. نشر Docker
```bash
chmod +x deploy.sh
./deploy.sh
```

### 6. إعداد Nginx
```bash
sudo cp nginx.conf /etc/nginx/sites-available/tagdod-api
sudo ln -s /etc/nginx/sites-available/tagdod-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. إعداد SSL
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.allawzi.net
```

### 8. التحقق
```bash
curl https://api.allawzi.net/health/live
```

---

## 🔧 أوامر مفيدة

```bash
# عرض Logs
docker-compose -f docker-compose.prod.yml logs -f api

# إعادة تشغيل
docker-compose -f docker-compose.prod.yml restart api

# تحديث الكود
git pull
docker-compose -f docker-compose.prod.yml build --no-cache api
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📚 للمزيد من التفاصيل

راجع `DEPLOYMENT_VPS.md` للدليل الكامل.


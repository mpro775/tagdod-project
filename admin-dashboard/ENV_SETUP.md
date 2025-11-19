# إعداد متغيرات البيئة للـ Frontend

## إنشاء ملف .env

أنشئ ملف `.env` في مجلد `admin-dashboard/` مع المحتوى التالي:

```bash
# Backend API Base URL
# For production VPS: https://api.allawzi.net/api/v1
# For local development: http://localhost:3000/api/v1
VITE_API_BASE_URL=https://api.allawzi.net/api/v1

# Application Configuration
VITE_APP_NAME=Tagadodo Admin
VITE_APP_VERSION=1.0.0
VITE_DEFAULT_LANGUAGE=ar
VITE_DEFAULT_THEME=light

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=false

# Timeouts
VITE_API_TIMEOUT=30000

# Pagination
VITE_DEFAULT_PAGE_SIZE=20
VITE_MAX_PAGE_SIZE=100

# File Upload
VITE_MAX_UPLOAD_SIZE=5242880
VITE_MAX_IMAGES_PER_PRODUCT=10
```

## ملاحظات مهمة

- جميع المتغيرات يجب أن تبدأ بـ `VITE_` لتعمل مع Vite
- بعد تغيير `.env`، يجب إعادة بناء المشروع: `npm run build`
- لا تضع ملف `.env` في Git (يجب أن يكون في `.gitignore`)


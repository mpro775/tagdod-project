# Staging Deployment Guide (API + Admin)

هذا الدليل يضيف بيئة اختبار (staging) على نفس الـ VPS بدون التأثير على بيئة الإنتاج الحالية.

## What Was Added

- `docker-compose.stg.yml` لتشغيل خدمات `api-stg` و `admin-dashboard-stg` مع `redis-stg` فقط.
- `admin-dashboard/Dockerfile.stg` لبناء نسخة Admin مرتبطة بـ API الخاص بالـ staging.
- `backend/.env.stg.example` قالب إعدادات البيئة الخاصة بالـ staging.

## Safety Design (No Production Impact)

- لا يوجد أي تعديل على `docker-compose.yml` الحالي للإنتاج.
- لا يوجد أي تعديل على `backend/.env` الحالي للإنتاج.
- جميع المنافذ مختلفة عن الإنتاج:
  - API staging: `127.0.0.1:3100`
  - Admin staging: `127.0.0.1:8181`
  - Redis staging: `127.0.0.1:6380`
- استخدم اسم مشروع Docker مختلف: `tagdod-stg`.

## 1) Prepare Staging Environment File

من جذر المشروع:

```bash
cp backend/.env.stg.example backend/.env.stg
nano backend/.env.stg
```

الحقول المهمة التي يجب تعبئتها أولًا:

- `MONGO_URI` (قاعدة بيانات staging منفصلة عن production)
- `JWT_SECRET`, `REFRESH_SECRET`, `SUPER_ADMIN_SECRET`
- `CORS_ORIGINS` (ضع دومين admin-staging)
- أي مفاتيح خارجية تحتاجها (SMTP/FCM/Twilio/Bunny/WAHA)

## 2) Build and Run Staging

إذا كان دومين API الاختباري هو `https://api-stg.allawzi.net/api/v1`:

```bash
docker compose -p tagdod-stg -f docker-compose.stg.yml up -d --build
```

إذا أردت endpoint مختلف للـ Admin build:

```bash
STG_ADMIN_API_BASE_URL=https://api-stg.allawzi.net/api/v1 docker compose -p tagdod-stg -f docker-compose.stg.yml up -d --build
```

## 3) Verify Containers and Health

```bash
docker compose -p tagdod-stg -f docker-compose.stg.yml ps
curl http://127.0.0.1:3100/health/live
curl http://127.0.0.1:8181/health
```

## 4) Configure Nginx Proxy Manager

أضف Proxy Hosts جديدة للـ staging فقط:

- `api-stg.your-domain.com` -> `127.0.0.1:3100`
- `stg-admin.your-domain.com` -> `127.0.0.1:8181`

ثم فعّل SSL (Let's Encrypt) لكل دومين.

بعدها:

- افتح `https://stg-admin.your-domain.com`
- تأكد أن الطلبات تذهب إلى `https://api-stg.your-domain.com/api/v1`

## 5) Useful Commands

### Show staging logs

```bash
docker compose -p tagdod-stg -f docker-compose.stg.yml logs -f
```

### Restart staging services

```bash
docker compose -p tagdod-stg -f docker-compose.stg.yml restart
```

### Stop staging only

```bash
docker compose -p tagdod-stg -f docker-compose.stg.yml down
```

### Stop staging and remove its volumes

```bash
docker compose -p tagdod-stg -f docker-compose.stg.yml down -v
```

## 6) Testing Checklist

- API live health works on staging domain.
- Admin login works against staging API.
- لا يوجد أي تغيير في روابط الإنتاج أو حاويات الإنتاج.
- قاعدة بيانات staging منفصلة تمامًا عن production.

## Notes

- لا تستخدم `deploy-all.sh` لتشغيل staging لأنه مخصص لبيئة الإنتاج الحالية.
- يفضّل إنشاء مستخدم Mongo مخصص للـ staging بصلاحيات محدودة.
- إذا كانت موارد VPS محدودة، راقب الاستهلاك عبر `docker stats`.

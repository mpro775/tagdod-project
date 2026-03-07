# -------- BUILD STAGE --------
FROM node:22-slim AS build

WORKDIR /app

# نسخ ملفات package
COPY package*.json ./

# تثبيت جميع dependencies
RUN npm install

# نسخ الكود المصدري
COPY . .

# بناء المشروع
RUN npm run build

# -------- RUNNER STAGE --------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# 1. تحديث الحزم وتثبيت الأدوات الأساسية + wget (مهم لتحميل مونجو)
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    tzdata \
    libvips-dev \
    chromium \
    chromium-sandbox \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libharfbuzz0b \
    libharfbuzz-icu0 \
    libicu-dev \
    fonts-noto-color-emoji \
    fonts-noto-hinted \
    fonts-noto-unhinted \
    && rm -rf /var/lib/apt/lists/*

# 2. 🔥 إضافة أدوات MongoDB Database Tools (mongodump/mongorestore) 🔥
# نستخدم نسخة Debian 12 لأن صورة node:22 مبنية عليها
RUN wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian12-x86_64-100.9.4.deb && \
    apt-get install -y ./mongodb-database-tools-debian12-x86_64-100.9.4.deb && \
    rm mongodb-database-tools-debian12-x86_64-100.9.4.deb

# تعيين متغيرات البيئة للـ Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# نسخ package.json و package-lock.json
COPY --from=build /app/package*.json ./

# تثبيت production dependencies فقط
RUN npm install --only=production && npm cache clean --force

# نسخ الملفات المبنية من مرحلة build
COPY --from=build /app/dist ./dist

# نسخ سكربتات الصيانة (repair:engineer-profiles وغيرها)
COPY --from=build /app/scripts ./scripts

# نسخ assets
RUN mkdir -p /app/assets
COPY --from=build /app/assets /app/assets

EXPOSE 3000

CMD ["node", "dist/main.js"]
# -------- BUILD STAGE --------
FROM node:20-slim AS build
WORKDIR /app

# sharp يحتاج libvips أثناء/بعد التثبيت
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# انسخ ملفات الديبندنسي أولاً
COPY package.json package-lock.json* ./

# ثبّت كل شيء (dependencies + devDependencies + optional)
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
    npm ci --no-audit --no-fund --include=optional; \
    else \
    npm install --no-audit --no-fund --include=optional; \
    fi

# انسخ السورس
COPY . .

# ابنِ NestJS
RUN npm run build

# -------- RUNNER STAGE --------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# sharp يعتمد على libvips في runtime
# تثبيت Chromium والمكتبات المطلوبة لـ Puppeteer
RUN apt-get update && apt-get install -y \
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
    && rm -rf /var/lib/apt/lists/*

# تعيين متغيرات البيئة للـ Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# انسخ كل شيء من build (بما فيها node_modules و dist)
COPY --from=build /app ./

EXPOSE 3000

# Healthcheck اختياري (لو عندك مسار جاهز)
# HEALTHCHECK CMD node -e "require('http').get('http://localhost:3000/health/live',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/main.js"]

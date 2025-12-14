# ... (الجزء الأول build كما هو بدون تغيير) ...

# -------- RUNNER STAGE --------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# أضفنا tzdata هنا لكي يفهم النظام التوقيت
RUN apt-get update && apt-get install -y \
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

# تعيين متغيرات البيئة للـ Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# انسخ كل شيء من build
COPY --from=build /app ./

# انسخ الخطوط
COPY assets/fonts /app/assets/fonts

EXPOSE 3000

CMD ["node", "dist/main.js"]
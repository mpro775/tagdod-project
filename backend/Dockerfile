# --- deps stage ---
FROM node:20-slim AS deps
WORKDIR /app

# أدوات بناء ومكتبات نظام مطلوبة لباكدجات native
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    pkg-config \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# لو عندك private registry انسخ .npmrc
# COPY .npmrc ./

# انسخ package.json أولاً
COPY package.json ./

# انسخ package-lock.json إن وجد (اختياري)
# ملاحظة: إذا كان package-lock.json غير موجود، سيتم استخدام npm install بدلاً من npm ci
# لإنشاء package-lock.json محلياً: npm install --package-lock-only
COPY package-lock.json* ./

# استخدم كاش npm لتسريع وإستقرار البناء
# استخدم npm ci إذا كان package-lock.json موجود، وإلا استخدم npm install
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
        npm ci --no-audit --no-fund --include=optional; \
    else \
        npm install --no-audit --no-fund --include=optional; \
    fi \
    && npm rebuild sharp

# --- build stage ---
FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runner stage ---
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install ALL dependencies needed for sharp at runtime
RUN apt-get update && apt-get install -y \
    libvips-dev \
    libglib2.0-0 \
    libglib2.0-dev \
    libexpat1 \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# لو تطبيقك يحتاج فقط prod deps:
# COPY package.json package-lock.json ./
# RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --no-audit --no-fund

# لو يعتمد وقت التشغيل على جميع الحزم (كما في حالتك):
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# Rebuild sharp in the final runtime environment to ensure compatibility
RUN npm rebuild sharp --verbose

HEALTHCHECK CMD node -e "require('http').get('http://localhost:3000/health/live',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
EXPOSE 3000
CMD ["node","dist/main.js"]

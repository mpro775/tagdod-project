# --- deps stage ---
FROM node:20-alpine AS deps
WORKDIR /app

# أدوات بناء ومكتبات نظام مطلوبة لباكدجات native
RUN apk add --no-cache python3 make g++ pkgconfig libc6-compat openssl

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
        npm ci --no-audit --no-fund; \
    else \
        npm install --no-audit --no-fund; \
    fi

# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runner stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# لو تطبيقك يحتاج فقط prod deps:
# COPY package.json package-lock.json ./
# RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --no-audit --no-fund

# لو يعتمد وقت التشغيل على جميع الحزم (كما في حالتك):
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

HEALTHCHECK CMD node -e "require('http').get('http://localhost:3000/health/live',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
EXPOSE 3000
CMD ["node","dist/main.js"]

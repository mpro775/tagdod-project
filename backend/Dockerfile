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
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# انسخ كل شيء من build (بما فيها node_modules و dist)
COPY --from=build /app ./

EXPOSE 3000

# Healthcheck اختياري (لو عندك مسار جاهز)
# HEALTHCHECK CMD node -e "require('http').get('http://localhost:3000/health/live',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/main.js"]

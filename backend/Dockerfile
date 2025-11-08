# --- deps stage (كل الديبندنسي + dev) ---
FROM node:20-slim AS deps
WORKDIR /app

# sharp يحتاج libvips في وقت التثبيت/التشغيل
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

# هنا مهم: نثبت كل شيء (بدون omit=dev)
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
    npm ci --no-audit --no-fund --include=optional; \
    else \
    npm install --no-audit --no-fund --include=optional; \
    fi

# --- build stage (يستخدم nest cli من devDependencies) ---
FROM node:20-slim AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# هنا nest موجود لأننا جايين من deps اللي فيها devDependencies
RUN npm run build

# --- runner stage (إنتاج فقط) ---
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# sharp يحتاج libvips في runtime
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# ننسخ node_modules كما هي من deps
COPY --from=deps /app/node_modules ./node_modules
# نزيل devDependencies بدون إعادة بناء sharp
RUN npm prune --omit=dev --no-audit --no-fund

# ننسخ السورس المبني فقط
COPY --from=build /app/dist ./dist
COPY package.json package-lock.json* ./

EXPOSE 3000

HEALTHCHECK CMD node -e "require('http').get('http://localhost:3000/health/live',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/main.js"]

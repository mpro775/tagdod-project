# --- deps stage ---
FROM node:20-slim AS deps
WORKDIR /app

# مكتبات كافية لـ sharp (عادة يكفي libvips-runtime، لكن نضمن)
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

# تثبيت dependencies للإنتاج فقط + optional (sharp يحتاجها)
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
        npm ci --omit=dev --no-audit --no-fund --include=optional; \
    else \
        npm install --omit=dev --no-audit --no-fund --include=optional; \
    fi

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

# sharp يحتاج libvips في runtime
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# ننسخ نفس node_modules المبنية في بيئة لينكس إلى الرن تايم مباشرة
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

EXPOSE 3000
HEALTHCHECK CMD node -e "require('http').get('http://localhost:3000/health/live',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "dist/main.js"]

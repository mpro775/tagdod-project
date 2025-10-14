# Solar Backend Starter (NestJS + Docker)

Backend scaffolding with unified errors & responses, linting, Docker dev setup, and baseline structure.

## Quick start
```bash
# 1) copy env
cp .env.example .env

# 2) start dev stack (api + mongo + redis + mailhog)
docker compose -f docker-compose.dev.yml up -d

# 3) install deps & run dev
pnpm install   # or npm install
pnpm start:dev
```

## Included
- NestJS skeleton (modules folders)
- Docker dev stack (Node API, Mongo (replica), Redis)
- Global Exception Filter (unified error shape)
- Response Envelope Interceptor (unified success shape)
- Request-Id middleware + pino logger
- ESLint + Prettier + Commitlint (Conventional commits)
- Env validation via Zod
- Example HealthController & Swagger bootstrap

## Response format
```json
{ "success": true, "data": { /* ... */ }, "meta": null, "requestId": "..." }
```
## Error format
```json
{
  "success": false,
  "error": { "code": "AUTH_INVALID_OTP", "message": "رمز التحقق غير صالح", "details": null, "fieldErrors": null },
  "requestId": "..."
}
```

# Migration Plan: Unified Marketing Module

## 🎯 Objective
Replace the separate `promotions`, `coupons`, `banners`, and `pricing` modules with a unified `marketing` module to eliminate duplication and improve maintainability.

## 📋 Migration Steps

### Phase 1: Setup New Module ✅
- [x] Create `marketing` module structure
- [x] Create unified schemas (PriceRule, Coupon, Banner)
- [x] Create unified DTOs
- [x] Create unified service
- [x] Create unified controllers
- [x] Create comprehensive README

### Phase 2: Update App Module
- [ ] Remove old module imports from `app.module.ts`
- [ ] Add new `MarketingModule` import
- [ ] Update route configurations

### Phase 3: Update Frontend
- [ ] Update API endpoints in frontend
- [ ] Update service calls
- [ ] Update types and interfaces
- [ ] Test all functionality

### Phase 4: Data Migration
- [ ] Create migration scripts for existing data
- [ ] Migrate price rules data
- [ ] Migrate coupons data
- [ ] Migrate banners data
- [ ] Verify data integrity

### Phase 5: Cleanup
- [ ] Delete old modules:
  - `backend/src/modules/promotions/`
  - `backend/src/modules/coupons/`
  - `backend/src/modules/banners/`
  - `backend/src/modules/pricing/`
- [ ] Update documentation
- [ ] Update tests

## 🔄 API Endpoint Changes

### Old → New Endpoints

#### Promotions
- `POST /admin/promotions/rules` → `POST /admin/marketing/price-rules`
- `GET /admin/promotions/rules` → `GET /admin/marketing/price-rules`
- `GET /admin/promotions/rules/:id` → `GET /admin/marketing/price-rules/:id`
- `PATCH /admin/promotions/rules/:id` → `PATCH /admin/marketing/price-rules/:id`
- `DELETE /admin/promotions/rules/:id` → `DELETE /admin/marketing/price-rules/:id`
- `POST /admin/promotions/rules/:id/toggle` → `POST /admin/marketing/price-rules/:id/toggle`
- `POST /admin/promotions/preview` → `POST /admin/marketing/price-rules/preview`
- `GET /pricing/variant` → `GET /marketing/pricing/variant`

#### Coupons
- `POST /admin/coupons` → `POST /admin/marketing/coupons`
- `GET /admin/coupons` → `GET /admin/marketing/coupons`
- `GET /admin/coupons/:id` → `GET /admin/marketing/coupons/:id`
- `PATCH /admin/coupons/:id` → `PATCH /admin/marketing/coupons/:id`
- `DELETE /admin/coupons/:id` → `DELETE /admin/marketing/coupons/:id`
- `POST /admin/coupons/validate` → `POST /admin/marketing/coupons/validate`

#### Banners
- `POST /admin/banners` → `POST /admin/marketing/banners`
- `GET /admin/banners` → `GET /admin/marketing/banners`
- `GET /admin/banners/:id` → `GET /admin/marketing/banners/:id`
- `PATCH /admin/banners/:id` → `PATCH /admin/marketing/banners/:id`
- `DELETE /admin/banners/:id` → `DELETE /admin/marketing/banners/:id`

## 🗂️ Files to Delete

### Backend
```
backend/src/modules/promotions/
backend/src/modules/coupons/
backend/src/modules/banners/
backend/src/modules/pricing/
```

### Frontend (if exists)
```
frontend/src/features/promotions/
frontend/src/features/coupons/
frontend/src/features/banners/
```

## ⚠️ Breaking Changes

1. **API Endpoints**: All endpoints have new paths under `/admin/marketing/`
2. **Response Format**: Some response formats may have changed
3. **Database**: Schema changes may require data migration
4. **Frontend**: All API calls need to be updated

## 🧪 Testing Checklist

- [ ] Create price rules
- [ ] Update price rules
- [ ] Delete price rules
- [ ] Toggle price rules
- [ ] Preview price rules
- [ ] Calculate effective prices
- [ ] Create coupons
- [ ] Validate coupons
- [ ] Update coupons
- [ ] Delete coupons
- [ ] Create banners
- [ ] Update banners
- [ ] Delete banners
- [ ] Get active banners
- [ ] Track banner views/clicks

## 📊 Benefits After Migration

1. **Reduced Code Duplication**: Single module instead of 4 separate modules
2. **Unified API**: Consistent endpoints and response formats
3. **Better Performance**: Shared resources and optimized queries
4. **Easier Maintenance**: Single codebase for all marketing features
5. **Better Analytics**: Combined statistics across all marketing channels
6. **Simplified Frontend**: Single service for all marketing operations

## 🚀 Rollback Plan

If issues arise, the old modules can be restored by:
1. Reverting the app.module.ts changes
2. Restoring the deleted module directories from git
3. Updating frontend to use old endpoints
4. Running database migrations to restore old schemas

# 🎨 Frontend Update Guide - Marketing Module

## 📋 Overview
This guide explains how to update the frontend to use the new unified MarketingModule instead of the separate promotions, coupons, and banners modules.

## 🔄 Migration Steps

### Step 1: Update Imports
Replace old imports with new unified ones:

```typescript
// OLD WAY ❌
import { promotionsApi } from '@/features/promotions/api/promotionsApi';
import { couponsApi } from '@/features/coupons/api/couponsApi';
import { bannersApi } from '@/features/banners/api/bannersApi';
import { usePromotions } from '@/features/promotions/hooks/usePromotions';
import { useCoupons } from '@/features/coupons/hooks/useCoupons';
import { useBanners } from '@/features/banners/hooks/useBanners';

// NEW WAY ✅
import { marketingApi } from '@/features/marketing/api/marketingApi';
import { 
  usePriceRules, 
  useCoupons, 
  useBanners,
  useCreatePriceRule,
  useCreateCoupon,
  useCreateBanner
} from '@/features/marketing/hooks/useMarketing';
```

### Step 2: Update API Calls
Replace old API calls with new unified ones:

```typescript
// OLD WAY ❌
const priceRules = await promotionsApi.list();
const coupons = await couponsApi.list();
const banners = await bannersApi.list();

// NEW WAY ✅
const priceRules = await marketingApi.listPriceRules();
const coupons = await marketingApi.listCoupons();
const banners = await marketingApi.listBanners();
```

### Step 3: Update Hooks Usage
Replace old hooks with new unified ones:

```typescript
// OLD WAY ❌
const { data: promotions } = usePromotions();
const { data: coupons } = useCoupons();
const { data: banners } = useBanners();

// NEW WAY ✅
const { data: priceRules } = usePriceRules();
const { data: coupons } = useCoupons();
const { data: banners } = useBanners();
```

### Step 4: Update Routes
Update your routing to use the new unified structure:

```typescript
// OLD ROUTES ❌
/admin/promotions/rules
/admin/coupons
/admin/banners

// NEW ROUTES ✅
/admin/marketing/price-rules
/admin/marketing/coupons
/admin/marketing/banners
```

## 🔗 API Endpoint Changes

### Price Rules (Promotions)
| Old Endpoint | New Endpoint |
|--------------|--------------|
| `POST /admin/promotions/rules` | `POST /admin/marketing/price-rules` |
| `GET /admin/promotions/rules` | `GET /admin/marketing/price-rules` |
| `GET /admin/promotions/rules/:id` | `GET /admin/marketing/price-rules/:id` |
| `PATCH /admin/promotions/rules/:id` | `PATCH /admin/marketing/price-rules/:id` |
| `DELETE /admin/promotions/rules/:id` | `DELETE /admin/marketing/price-rules/:id` |
| `POST /admin/promotions/rules/:id/toggle` | `POST /admin/marketing/price-rules/:id/toggle` |
| `POST /admin/promotions/preview` | `POST /admin/marketing/price-rules/preview` |

### Coupons
| Old Endpoint | New Endpoint |
|--------------|--------------|
| `POST /admin/coupons` | `POST /admin/marketing/coupons` |
| `GET /admin/coupons` | `GET /admin/marketing/coupons` |
| `GET /admin/coupons/:id` | `GET /admin/marketing/coupons/:id` |
| `PATCH /admin/coupons/:id` | `PATCH /admin/marketing/coupons/:id` |
| `DELETE /admin/coupons/:id` | `DELETE /admin/marketing/coupons/:id` |
| `PATCH /admin/coupons/:id/toggle-status` | `PATCH /admin/marketing/coupons/:id/toggle-status` |

### Banners
| Old Endpoint | New Endpoint |
|--------------|--------------|
| `POST /admin/banners` | `POST /admin/marketing/banners` |
| `GET /admin/banners` | `GET /admin/marketing/banners` |
| `GET /admin/banners/:id` | `GET /admin/marketing/banners/:id` |
| `PATCH /admin/banners/:id` | `PATCH /admin/marketing/banners/:id` |
| `DELETE /admin/banners/:id` | `DELETE /admin/marketing/banners/:id` |
| `PATCH /admin/banners/:id/toggle-status` | `PATCH /admin/marketing/banners/:id/toggle-status` |

## 🎯 New Features Available

### Enhanced Price Rules
- ✅ Usage limits tracking
- ✅ Metadata support (title, description, terms)
- ✅ Coupon code integration
- ✅ Statistics tracking
- ✅ Preview functionality

### Enhanced Coupons
- ✅ Analytics dashboard
- ✅ Usage history tracking
- ✅ Public/private visibility
- ✅ Auto-apply functionality
- ✅ Bulk generation

### Enhanced Banners
- ✅ Target audience support
- ✅ Click/view tracking
- ✅ Conversion tracking
- ✅ Location-based display
- ✅ A/B testing support

## 📱 Component Updates

### Dashboard Component
```typescript
import { MarketingDashboardPage } from '@/features/marketing/pages';

// Use the new unified dashboard
<MarketingDashboardPage />
```

### Price Rules Management
```typescript
import { 
  PriceRulesListPage, 
  CreatePriceRulePage 
} from '@/features/marketing/pages';

// Use the new unified pages
<PriceRulesListPage />
<CreatePriceRulePage />
```

## 🔧 Type Updates

### New Types Available
```typescript
import type {
  PriceRule,
  Coupon,
  Banner,
  CreatePriceRuleDto,
  UpdatePriceRuleDto,
  CreateCouponDto,
  UpdateCouponDto,
  CreateBannerDto,
  UpdateBannerDto,
  EffectivePriceResult,
  CouponAnalytics
} from '@/features/marketing/api/marketingApi';
```

## 🧪 Testing Updates

### Update Test Files
```typescript
// Update your test imports
import { marketingApi } from '@/features/marketing/api/marketingApi';
import { usePriceRules } from '@/features/marketing/hooks/useMarketing';

// Update test API calls
const priceRules = await marketingApi.listPriceRules();
const coupons = await marketingApi.listCoupons();
const banners = await marketingApi.listBanners();
```

## 📊 Benefits After Update

### Code Reduction
- **API Files**: 3 → 1 (67% reduction)
- **Hook Files**: 3 → 1 (67% reduction)
- **Type Files**: 3 → 1 (67% reduction)
- **Duplicate Code**: Eliminated

### Performance Improvements
- ✅ Shared query keys
- ✅ Optimized caching
- ✅ Reduced bundle size
- ✅ Faster load times

### Developer Experience
- ✅ Single import for all marketing features
- ✅ Consistent API patterns
- ✅ Better TypeScript support
- ✅ Unified error handling

## 🚨 Breaking Changes

### Removed Features
- ❌ Old promotions API endpoints
- ❌ Old coupons API endpoints  
- ❌ Old banners API endpoints
- ❌ Separate hook files

### New Requirements
- ✅ Update all imports
- ✅ Update API calls
- ✅ Update routing
- ✅ Update types

## 📝 Migration Checklist

- [ ] Update all imports to use new marketing module
- [ ] Replace old API calls with new unified ones
- [ ] Update hook usage throughout the application
- [ ] Update routing to use new endpoints
- [ ] Update types and interfaces
- [ ] Test all marketing functionality
- [ ] Update documentation
- [ ] Remove old feature folders

## 🎉 Success Criteria

The frontend update is successful when:
- ✅ All old imports are replaced
- ✅ All API calls use new endpoints
- ✅ All hooks use new unified ones
- ✅ All routes point to new paths
- ✅ All types are updated
- ✅ All tests pass
- ✅ All functionality works as expected

The unified MarketingModule provides a much cleaner and more maintainable frontend experience! 🚀

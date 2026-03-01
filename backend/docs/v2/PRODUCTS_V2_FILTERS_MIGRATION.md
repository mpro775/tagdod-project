# Products API v2 Migration Guide (Filters App)

This document explains how the filters app should consume the new products endpoints under `api/v2`.

## Goal

- Keep existing apps working on `v1` (legacy: `pricingByCurrency`).
- Move filters app to `v2` (modern: USD pricing in items + FX table at top level).

## Endpoints

### Legacy (unchanged)

- `GET /api/v1/products`
- `GET /api/v1/products/new/list`
- `GET /api/v1/products/featured/list`

### New (for filters app)

- `GET /api/v2/products`
- `GET /api/v2/products/new/list`
- `GET /api/v2/products/featured/list`

## Query Params in v2

Supported on `GET /api/v2/products`:

- `page`
- `limit`
- `search`
- `categoryId`
- `includeSubcategories`
- `brandId`
- `isFeatured`
- `isNew`
- `sortBy`
- `sortOrder`

Note: `currency` is not required in `v2` list endpoints because prices are returned in USD and conversion is done on client using `fx`.

## v2 Response Shape

Top-level `data` includes:

- `fx`: exchange table from USD
- `rounding`: decimals per currency
- `userDiscount`: merchant/user discount metadata
- `data`: product array
- `meta`: pagination info

Example (trimmed):

```json
{
  "success": true,
  "data": {
    "fx": {
      "base": "USD",
      "rates": { "YER": 535, "SAR": 3.8 },
      "version": "2025-12-24T17:11:56.741Z"
    },
    "rounding": {
      "USD": { "decimals": 2 },
      "SAR": { "decimals": 2 },
      "YER": { "decimals": 0 }
    },
    "userDiscount": {
      "isMerchant": false,
      "discountPercent": 0
    },
    "data": [
      {
        "_id": "...",
        "name": "...",
        "hasVariants": false,
        "pricing": {
          "basePriceUSD": 49.99,
          "discountPercent": 0,
          "discountAmountUSD": 0,
          "finalPriceUSD": 49.99
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 12,
      "total": 4,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

## Price Handling in Filters App

### 1) Read USD from item

- Simple product:
  - `pricing.finalPriceUSD` (fallback to `pricing.basePriceUSD`)
- Variant product:
  - list card price can use `pricing.minPriceUSD` (or show range with `minPriceUSD` and `maxPriceUSD`)

### 2) Convert to selected currency

- If selected currency is `USD`, use USD directly.
- Otherwise:
  - `converted = usd * fx.rates[selectedCurrency]`
  - round with `rounding[selectedCurrency].decimals`

### 3) Display

- Keep symbols and formatting in app UI layer.
- Do not expect `pricingByCurrency` in `v2`.

## Suggested Client Helper

```ts
type Currency = 'USD' | 'YER' | 'SAR'

function toCurrency(
  usd: number,
  currency: Currency,
  fx: { base: 'USD'; rates: Record<string, number> },
  rounding: Record<string, { decimals: number }>
): number {
  if (currency === 'USD') return usd
  const rate = fx?.rates?.[currency]
  if (!rate) return usd
  const decimals = rounding?.[currency]?.decimals ?? 2
  const value = usd * rate
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
```

## Migration Checklist (Filters App)

- Switch base URLs from `/api/v1/products*` to `/api/v2/products*`.
- Update product parser:
  - remove dependency on `pricingByCurrency` for these endpoints
  - read `fx`, `rounding`, and `pricing` (USD)
- Ensure list/new/featured all share the same v2 parser.
- Add fallback behavior if `fx` is missing (show USD without conversion).

## Backward Compatibility

- `v1` remains available for older clients.
- `v2` is additive and does not break existing integrations.

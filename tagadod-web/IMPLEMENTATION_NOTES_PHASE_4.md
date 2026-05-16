# Implementation Notes — Phase 4

## Completed

- Built shared Product Listing components in `src/features/products/listing/`.
- Added Products page `/products`.
- Improved Category products page (`ProductsByCategoryPage.tsx`).
- Improved Search page (`SearchPage.tsx`).
- Added desktop `FiltersSidebar`.
- Added `MobileFiltersDrawer`.
- Added `SortSelect` (inline in toolbar).
- Added `ViewModeToggle` (inline in toolbar).
- Added `ActiveFiltersChips`.
- Added `ProductResultsGrid` and `ProductResultsList`.
- Added `ProductListingHeader` with breadcrumbs, title, subtitle, results count, and category hero image.
- Added `ProductListingToolbar` with sort, view mode, filter button (mobile), results count, and clear filters.
- Added `ProductListingEmptyState` and `ProductListingErrorState`.
- Added query params support for filters, sort, view mode, and pagination.
- Added loading, empty, and error states.
- Added product listing translation keys (ar/en).
- All components use `ProductCard` and `ProductCardHorizontal` from Phase 3.
- Build successful with no TypeScript errors.

## API Capabilities Found

### Products endpoint (`/products`)

- Supports pagination: ✅ (`page`, `limit`)
- Supports sort: ❌ (not passed to API currently; UI supports it but API may not)
- Supports search: ✅ (via `/search` endpoint)
- Supports category: ✅ (`categoryId` param, via `/categories/:id/products`)
- Supports price: ✅ (`minPrice`, `maxPrice` params)
- Supports stock: ✅ (`inStock` param)
- Supports brand: ❌ (not supported by API)
- Supports attributes: ❌ (not supported by API)

### Search endpoint (`/search`)

- Supports pagination: ✅ (`page`, `limit`)
- Supports search query: ✅ (`q` param)
- Supports category filter: ✅ (`categoryId` param)

### Response shape

```
data.data: Product[]
data.meta: { page, limit, total, totalPages }
```

## Unsupported Filters

- Brand: Hidden (no API support)
- Attributes: Hidden (no API support)
- Offers: Hidden (no API support)
- Rating: Hidden (no API support)

## Decisions

- Hidden unsupported filters instead of showing fake controls.
- Used `ProductCard` from Phase 3 for grid mode.
- Used `ProductCardHorizontal` for list mode.
- Query params are the source of truth for filters and sort.
- `pageType` prop removed from `ProductListingPage` (not needed).
- `error` prop made optional (not used in UI currently).
- Mobile filter drawer uses draft state pattern (apply on confirm).
- Desktop sidebar always visible on `lg:` breakpoint.
- Pagination buttons shown only when `totalPages > 1`.
- View mode toggle hidden on mobile to save space.

## Modified Files

### New files created
- `src/features/products/listing/ProductListingPage.tsx`
- `src/features/products/listing/ProductListingToolbar.tsx`
- `src/features/products/listing/ProductListingHeader.tsx`
- `src/features/products/listing/FiltersSidebar.tsx`
- `src/features/products/listing/MobileFiltersDrawer.tsx`
- `src/features/products/listing/ActiveFiltersChips.tsx`
- `src/features/products/listing/FilterGroup.tsx`
- `src/features/products/listing/PriceFilter.tsx`
- `src/features/products/listing/StockFilter.tsx`
- `src/features/products/listing/CategoryFilter.tsx`
- `src/features/products/listing/BrandFilter.tsx`
- `src/features/products/listing/ProductResultsGrid.tsx`
- `src/features/products/listing/ProductResultsList.tsx`
- `src/features/products/listing/ProductListingEmptyState.tsx`
- `src/features/products/listing/ProductListingErrorState.tsx`
- `src/features/products/listing/productListing.types.ts`
- `src/features/products/listing/productListing.helpers.ts`
- `src/features/products/listing/index.ts`
- `src/features/products/ProductsPage.tsx`

### Modified files
- `src/features/categories/ProductsByCategoryPage.tsx` — Rebuilt to use `ProductListingPage`.
- `src/features/search/SearchPage.tsx` — Rebuilt to use `ProductListingPage`.
- `src/routes/index.tsx` — Added `/products` route and `ProductsPage` lazy import.
- `src/i18n/locales/ar.json` — Added `productListing` translation keys.
- `src/i18n/locales/en.json` — Added `productListing` translation keys.

## Pending for Phase 5

- Rebuild Product Details Page.
- Add professional gallery.
- Add purchase panel.
- Add product tabs.
- Add related products.
- Add mobile sticky add-to-cart.

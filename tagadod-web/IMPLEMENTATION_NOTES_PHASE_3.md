# Implementation Notes — Phase 3

## Completed

- Rebuilt ProductCard system with modular sub-components.
- Added `ProductCard` (grid variant) with hover actions, badges, price display, and add-to-cart.
- Added `ProductCardCompact` for small/horizontal-scroll use cases.
- Added `ProductCardHorizontal` for list views and search results.
- Added `ProductCardSkeleton` with grid/compact/horizontal variants.
- Added `ProductImage` with fallback placeholder, lazy loading, and hover zoom.
- Added `ProductPrice` with current price, compare-at price, and discount indication.
- Added `ProductBadges` for discount, featured, new, and out-of-stock states.
- Added `ProductActions` for favorite toggle and add-to-cart with variants support.
- Added `productCard.helpers.ts` for safe product data reading.
- Added `productCard.types.ts` for shared card types.
- Created backward-compatible wrapper in `components/shared/ProductCard.tsx` to support legacy `compact` prop.
- Updated all product listing pages to use the new card system:
  - `HomeProductSection`
  - `ProductsByCategoryPage`
  - `SearchPage`
  - `FavoritesPage`
  - `ProductPage` (related products via compact wrapper)
- Updated skeletons across pages to use `ProductCardSkeleton`.
- Added product card translation keys for Arabic and English.

## Product Data Mapping

- Product ID field: `product.id`
- Product name field: `product.name` (fallback `product.nameAr`)
- Product image field: `product.images[0]`
- Product price field: `product.price`
- Product compare/old price field: `product.originalPrice`
- Product stock field: `product.inStock`
- Product category field: `product.categoryName`
- Product brand field: Not present in current type — reserved for future
- Product featured field: `product.isFeatured`
- Product new field: `product.isNew`

## Decisions

- Quick View is only prepared as a placeholder and not implemented as a modal.
- Wishlist/Favorite button uses existing `useFavorites` hook.
- Out-of-stock products disable add-to-cart and show a gray badge.
- Missing images use a safe placeholder with `ImageOff` icon.
- The old `ProductCardShimmer` from `ShimmerBox.tsx` is kept for backward compatibility but no longer used in main pages.
- `compact` prop on `ProductCard` is handled by a backward-compatible wrapper that renders `ProductCardCompact`.
- Discount percentage is calculated client-side from `originalPrice` and `price`.

## Modified Files

- `src/components/ecommerce/product-card/ProductCard.tsx`
- `src/components/ecommerce/product-card/ProductCardCompact.tsx`
- `src/components/ecommerce/product-card/ProductCardHorizontal.tsx`
- `src/components/ecommerce/product-card/ProductCardSkeleton.tsx`
- `src/components/ecommerce/product-card/ProductImage.tsx`
- `src/components/ecommerce/product-card/ProductPrice.tsx`
- `src/components/ecommerce/product-card/ProductBadges.tsx`
- `src/components/ecommerce/product-card/ProductActions.tsx`
- `src/components/ecommerce/product-card/productCard.helpers.ts`
- `src/components/ecommerce/product-card/productCard.types.ts`
- `src/components/ecommerce/product-card/index.ts`
- `src/components/shared/ProductCard.tsx` (backward-compatible wrapper)
- `src/components/shared/index.ts`
- `src/features/home/components/HomeSkeleton.tsx`
- `src/features/categories/ProductsByCategoryPage.tsx`
- `src/features/search/SearchPage.tsx`
- `src/features/favorites/FavoritesPage.tsx`
- `src/i18n/locales/ar.json`
- `src/i18n/locales/en.json`

## Pending for Phase 4

- Build Product Listing Page.
- Add desktop filters sidebar.
- Add mobile filters drawer.
- Add sort and view mode toggle.
- Add query params support for filters.

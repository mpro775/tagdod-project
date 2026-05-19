# Implementation Notes — Phase 6

## Completed

- Rebuilt CartPage layout with two-column desktop / single-column mobile.
- Added desktop cart item rows (`CartItemRow`).
- Added mobile cart item cards (`CartItemCard`).
- Added `CartLayout` with responsive grid (2 cols on desktop, 1 on mobile).
- Added `CartItemsList` that switches between rows and cards based on screen size.
- Added `OrderSummary` with subtotal, discount, shipping note, total, coupon box, and checkout button.
- Added `CartQuantityControl` with increase/decrease, stock limits, and disabled states.
- Added `CartItemMeta` for variant labels and SKU display.
- Added `CartCouponBox` (hidden since coupons not yet supported by backend).
- Added `CartShippingEstimate` (hidden since shipping not yet calculated).
- Added `CartEmptyState` with browse products and browse categories CTAs.
- Added `CartLoadingState` with skeleton for items and summary.
- Added `CartErrorState` with retry and browse products CTAs.
- Added `CartMobileCheckoutBar` (mobile-only, above BottomNav, hidden on desktop).
- Added `cart.helpers.ts` with all data extraction and calculation functions.
- Added `cart.types.ts` with display and state types.
- Added comprehensive Arabic and English translation keys.
- Removed fixed bottom checkout bar from desktop.
- Added Breadcrumbs to cart page.
- Added item count in page header.

## Cart Store Mapping

- Cart items source: `useCartStore` (Zustand, localStorage-backed)
- Item ID field: `id` (format: `product:{productId}` or `variant:{variantId}`)
- Product ID field: `productId`
- Product name field: `product?.name` (fallback: `productId`)
- Product image field: `product?.images?.[0]`
- Variant field: `variantName`
- Unit price field: `price`
- Quantity field: `quantity`
- Stock field: `product?.quantity` or `product?.variants[].quantity`
- Currency field: `product?.currency` (uses `formatPrice` from currencyStore)
- Update quantity function: `useCartStore.updateQuantity(itemId, quantity)`
- Remove item function: `useCartStore.removeItem(itemId)`
- Clear cart function: `useCartStore.clearCart()`

## Checkout

- Checkout route: `/payment` (protected, requires authentication)
- Checkout disabled conditions:
  - Cart is empty
  - Any item is out of stock
  - Cart is currently updating
- Sync before checkout: `cartService.syncCart()` then navigate to `/payment`
- 401 on sync redirects to `/login` with return state

## Coupon Support

- Supported: No (backend not yet implemented)
- Implementation: `CartCouponBox` component exists but returns `null` when `couponSupported = false`
- Notes: Ready to enable when backend coupon API is available

## Shipping Support

- Supported: No (shipping calculated at checkout confirmation)
- Implementation: `CartShippingEstimate` component exists but returns `null` when `shippingSupported = false`
- Notes: OrderSummary shows "Shipping calculated at checkout" text

## Decisions

- Mobile checkout bar is mobile-only (`md:hidden`), positioned above BottomNav (`bottom-16`).
- No fixed checkout button on desktop; checkout button lives inside OrderSummary sidebar.
- Coupon box is hidden if coupons are not supported (no fake UI).
- Shipping cost is not faked; shown as "calculated at checkout" when unavailable.
- Quantity cannot go below 1 (decrease button disabled at qty=1).
- Quantity cannot exceed known stock (increase button disabled at stock limit).
- Desktop uses 2-column layout (items + sticky summary sidebar).
- Mobile uses single-column cards with sticky bottom checkout bar.
- Loading state uses skeleton placeholders, not spinners.
- Error state includes retry button and browse products link.
- Empty state includes both "Browse Products" and "Browse Categories" CTAs.
- Breadcrumbs use existing `Breadcrumbs` component from Phase 1.
- All price formatting uses `formatPrice` from currencyStore (respects selected currency).

## Modified Files

- `src/features/cart/CartPage.tsx` — Complete rebuild with new component architecture
- `src/features/cart/components/CartLayout.tsx` — New
- `src/features/cart/components/CartItemsList.tsx` — New
- `src/features/cart/components/CartItemRow.tsx` — New
- `src/features/cart/components/CartItemCard.tsx` — New
- `src/features/cart/components/CartQuantityControl.tsx` — New
- `src/features/cart/components/CartItemMeta.tsx` — New
- `src/features/cart/components/OrderSummary.tsx` — New
- `src/features/cart/components/CartCouponBox.tsx` — New
- `src/features/cart/components/CartShippingEstimate.tsx` — New
- `src/features/cart/components/CartEmptyState.tsx` — New
- `src/features/cart/components/CartLoadingState.tsx` — New
- `src/features/cart/components/CartErrorState.tsx` — New
- `src/features/cart/components/CartMobileCheckoutBar.tsx` — New
- `src/features/cart/components/cart.helpers.ts` — New
- `src/features/cart/components/cart.types.ts` — New
- `src/features/cart/components/index.ts` — New (barrel exports)
- `src/i18n/locales/ar.json` — Added cart translation keys
- `src/i18n/locales/en.json` — Added cart translation keys

## Pending for Phase 7

- SEO basics (meta tags, title).
- Static policy pages.
- Open Graph tags.
- Final responsive polish.
- Accessibility pass (full keyboard navigation, screen reader testing).
- Performance pass (memoization, image optimization).
- Analytics events (add to cart, remove from cart, checkout started).
- Backend coupon integration.
- Backend shipping calculation integration.

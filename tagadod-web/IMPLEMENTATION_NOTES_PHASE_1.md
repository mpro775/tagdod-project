# Implementation Notes — Phase 1

## Completed

- Created `Container.tsx` for unified content width across all store pages.
- Created `DesktopHeader.tsx` with Top Bar, Main Header (Logo, Search, Account, Favorites, Cart, Notifications), and Navigation Bar.
- Created `MobileHeader.tsx` with Logo, Search, Cart, and a mobile Drawer menu.
- Created `StoreFooter.tsx` with About, Quick Links, Customer Service, Policies, and Bottom Bar sections.
- Created `Breadcrumbs.tsx` as a reusable component supporting RTL.
- Created `StoreLayout.tsx` to replace the old mobile-app-like layout.
- Modified `BottomNavBar.tsx` to be mobile-only (`md:hidden`) and updated route links to `/categories` and `/cart`.
- Updated `AppShell.tsx` to act as a thin wrapper around `StoreLayout`, preserving backward compatibility.
- Updated `routes/index.tsx`:
  - Added professional routes `/cart` and `/categories`.
  - Added redirects: `/CartPage -> /cart`, `/allCategories -> /categories`.
- Updated `layout/index.ts` barrel exports to include all new layout components.
- Updated translation files (`ar.json`, `en.json`) with `layout` keys for header, footer, navigation, and search.
- Added `@` path alias support in `vite.config.ts` and `tsconfig.app.json`.
- Added a lightweight `cn()` utility in `src/utils/index.ts` for class name merging.

## Modified Files

- `src/components/layout/StoreLayout.tsx` (new)
- `src/components/layout/DesktopHeader.tsx` (new)
- `src/components/layout/MobileHeader.tsx` (new)
- `src/components/layout/StoreFooter.tsx` (new)
- `src/components/layout/Container.tsx` (new)
- `src/components/layout/Breadcrumbs.tsx` (new)
- `src/components/layout/BottomNavBar.tsx` (updated)
- `src/components/layout/AppShell.tsx` (updated)
- `src/components/layout/index.ts` (updated)
- `src/routes/index.tsx` (updated)
- `src/i18n/locales/ar.json` (updated)
- `src/i18n/locales/en.json` (updated)
- `src/utils/index.ts` (updated)
- `vite.config.ts` (updated)
- `tsconfig.app.json` (updated)

## Notes

- Old `AppBar` is no longer used as the desktop header. It is kept in the codebase but not rendered by `StoreLayout`.
- `BottomNavBar` is now strictly mobile-only via `md:hidden`.
- Old routes (`/CartPage`, `/allCategories`) are preserved with redirects to avoid breaking existing links or bookmarks.
- The `main` element in `StoreLayout` uses `pb-20 md:pb-0` so mobile content is not covered by the bottom nav, while desktop has no extra bottom padding.
- No existing API logic was changed.
- No existing page content was rebuilt (Home, Product, Cart, etc. remain as-is).

## Pending for Phase 2

- Rebuild HomePage as a professional storefront (hero section, featured banners, trust indicators).
- Replace mobile-like category strip on desktop with a proper mega menu or category grid.
- Add commercial hero section and trust/features section.
- Rebuild product cards for desktop storefront feel.
- Add professional desktop filters on category pages.

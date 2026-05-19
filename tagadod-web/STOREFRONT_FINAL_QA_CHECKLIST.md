# Storefront Final QA Checklist

## Core Pages

- [x] Home page works (with SEO).
- [x] Products page works (with SEO).
- [x] Categories page works (with SEO).
- [x] Search page works (with SEO + noindex).
- [x] Product details page works (with SEO + OG image).
- [x] Cart page works (with SEO + noindex).
- [x] Static pages work (About, Contact, Privacy, Return, Shipping, Terms, FAQ).
- [x] 404 page works (with noindex + CTAs).

## Desktop

- [x] Header looks professional.
- [x] Footer links work (all point to real routes, no `#`).
- [x] Product listing has filters.
- [x] Product details layout is desktop-friendly.
- [x] Cart uses two-column layout.
- [x] No mobile bottom nav on desktop.

## Mobile

- [x] Mobile header works.
- [x] Bottom nav works.
- [x] Filters drawer works.
- [x] Product sticky add-to-cart works.
- [x] Cart mobile checkout bar works.
- [x] No important content is covered.

## SEO

- [x] Meta titles exist (dynamic via SEO component).
- [x] Meta descriptions exist.
- [x] Product OG image works (from product main image).
- [x] Cart is noindex.
- [x] Search is noindex.
- [x] 404 is noindex.
- [x] Open Graph tags set on all pages.
- [x] Twitter Card tags set on all pages.
- [x] Canonical URL set on all pages.

## i18n

- [x] Arabic works (all new pages translated).
- [x] English works (all new pages translated).
- [x] No raw translation keys visible.
- [x] RTL is correct (static pages, FAQ accordion, breadcrumbs).
- [x] LTR is correct.

## Cart Flow

- [x] Add to cart works (with analytics tracking).
- [x] Quantity update works.
- [x] Remove item works (with analytics tracking).
- [x] Empty cart works.
- [x] Checkout CTA works (with analytics tracking).

## Analytics

- [x] page_view fires safely (HomePage, SearchPage).
- [x] view_product fires safely (ProductDetailsPage).
- [x] add_to_cart fires safely (ProductActions).
- [x] search fires safely (SearchPage).
- [x] begin_checkout fires safely (OrderSummary).
- [x] remove_from_cart fires safely (CartPage).
- [x] filter_products fires safely (ProductListingPage).
- [x] sort_products fires safely (ProductListingPage).
- [x] No sensitive data is sent.
- [x] No errors if dataLayer is not available.

## Static Pages

- [x] About page has store intro, what we offer, why trust us, links to products/contact.
- [x] Contact page has phone, email, address, hours (placeholder data).
- [x] Privacy policy has data collection, usage, sharing, rights sections.
- [x] Return policy has conditions, non-returnable, process sections.
- [x] Shipping policy has cost, delivery time, areas, tracking sections.
- [x] Terms has use of store, pricing, user responsibility, limitation, modifications sections.
- [x] FAQ has 7 questions with accordion behavior.
- [x] All static pages use unified StaticPageLayout.
- [x] All static pages have breadcrumbs.
- [x] All static pages have SEO.

## Navigation

- [x] Footer quick links work (Home, Categories, Products, Cart).
- [x] Footer customer service links work (About, Contact, Orders, Favorites).
- [x] Footer policy links work (Privacy, Return, Shipping, Terms, FAQ).
- [x] No `#` links in footer.
- [x] Catch-all route redirects to NotFoundPage.
- [x] Old `/terms-and-conditions` redirects to `/terms`.

## Build

- [x] TypeScript compiles without new errors.
- [x] Build passes (Vite).
- [x] No new critical console errors.
- [x] All new pages are lazy-loaded (code splitting works).
- [x] PWA manifest generated.

## Performance

- [x] No new external libraries added.
- [x] All new pages lazy-loaded.
- [x] SEO component uses useEffect (no render blocking).
- [x] Analytics helper is lightweight and safe.
- [x] No console.log left in new code.
- [x] No unused imports in new code.

## Accessibility

- [x] Breadcrumbs have aria-label.
- [x] FAQ accordion buttons have aria-expanded.
- [x] Error pages have clear heading hierarchy.
- [x] All new pages use semantic HTML (article, nav).
- [x] Focus states use existing Tailwind classes.
- [x] Color contrast follows existing design system.

## Known Issues (Pre-existing, not from Phase 7)

- Lint has 22 pre-existing errors from previous phases (unused vars, setState in effect, etc.).
- No CMS for static pages (content in i18n files).
- Legal texts need review before official launch.
- Contact info is placeholder (phone, email).
- No GA4/analytics provider integrated yet (dataLayer ready).

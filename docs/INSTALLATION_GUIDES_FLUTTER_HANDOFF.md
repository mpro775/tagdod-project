# Flutter Handoff: Installation Guides Feature

## Purpose
This document is for the Flutter developer to implement the **Installation Guides** user feature based on what is already implemented in backend and admin dashboard.

Scope in Flutter:
- Add entry in profile menu.
- Add list page for guides.
- Add details page for one guide.
- Consume public API contracts exactly as implemented.

Out of scope:
- Admin creation/editing screens (already done in admin-dashboard).

---

## Backend Contract (Implemented)

### Base URL
- API prefix uses Nest global prefix + URI versioning.
- Public endpoints are under:
  - `GET /api/v1/installation-guides/public`
  - `GET /api/v1/installation-guides/public/:id`

### Auth
- These two endpoints are public (no auth token required).

### Response Envelope
Successful responses are wrapped in:

```json
{
  "success": true,
  "data": ..., 
  "requestId": "..."
}
```

Error responses are wrapped in:

```json
{
  "success": false,
  "error": {
    "code": "HTTP_404",
    "message": "Installation guide not found",
    "details": { ... },
    "fieldErrors": null
  },
  "requestId": "...",
  "timestamp": "...",
  "path": "..."
}
```

---

## Endpoint 1: Public List

### Request
`GET /api/v1/installation-guides/public`

### Behavior
- Returns only guides with `isActive = true`.
- Sorted by:
  1. `sortOrder` ascending
  2. then `createdAt` descending
- No pagination in this endpoint (returns full active list).

### Actual `data` shape

```json
[
  {
    "id": "guide-id",
    "titleAr": "...",
    "titleEn": "...",
    "tagAr": "...",
    "tagEn": "...",
    "coverImageUrl": "https://...",
    "isActive": true,
    "sortOrder": 0,
    "updatedAt": "2026-04-20T...Z"
  }
]
```

Important:
- Flutter UI should use at least: `id`, titles, tags, `coverImageUrl`.
- Additional fields (`isActive`, `sortOrder`, `updatedAt`) can be ignored in UI if not needed.

---

## Endpoint 2: Public Detail

### Request
`GET /api/v1/installation-guides/public/:id`

### Behavior
- Returns 404 if:
  - guide id not found, or
  - guide exists but inactive.

### Actual `data` shape

```json
{
  "id": "guide-id",
  "titleAr": "...",
  "titleEn": "...",
  "tagAr": "...",
  "tagEn": "...",
  "descriptionAr": "...",
  "descriptionEn": "...",
  "coverImageUrl": "https://...",
  "video": {
    "id": "video-guid",
    "url": "https://...",
    "embedUrl": "https://...",
    "hlsUrl": "https://...",
    "mp4Url": "https://...",
    "thumbnailUrl": "https://...",
    "status": "processing"
  },
  "linkedProduct": {
    "id": "product-id",
    "name": "...",
    "nameEn": "...",
    "mainImageUrl": "https://..."
  }
}
```

Notes:
- `video` exists and contains at least: `id`, `url`, `status`.
- Optional video fields may be null/missing.
- `status` values: `processing | ready | failed`.
- `linkedProduct` can be `null`.
- Backend intentionally returns `linkedProduct = null` when linked product is not displayable (deleted/inactive/not active status).

---

## Flutter Implementation Plan

## 1) Feature structure
Create feature folder:

```text
lib/features/installation_guides/
  data/
    datasources/
    models/
    repositories/
  domain/
    entities/
    repositories/
    usecases/
  presentation/
    cubit/ (or bloc)
    pages/
    widgets/
```

## 2) Data layer
Implement remote datasource methods:
- `Future<List<InstallationGuideCardModel>> getPublicGuides()`
- `Future<InstallationGuideDetailModel> getGuideDetail(String id)`

Handle API envelope unwrapping:
- parse `success`
- map `data`
- throw typed exception on `success=false` or non-2xx.

## 3) Domain layer
Recommended use cases:
- `GetInstallationGuidesUseCase`
- `GetInstallationGuideDetailUseCase`

## 4) Presentation routes
Add route constants:
- `/installation-guides`
- `/installation-guides/:id`

## 5) Profile integration
In profile menu, add item:
- Arabic label: `طرق التركيب`
- English label: `Installation Guides`

On tap -> navigate to `/installation-guides`.

## 6) List page UX
Use endpoint: `GET /api/v1/installation-guides/public`

Card content:
- cover image
- localized title (`titleAr` or `titleEn` by locale)
- localized tag (`tagAr` or `tagEn`)

Required states:
- loading
- empty
- error + retry

On card tap -> open detail page by `id`.

## 7) Detail page UX
Use endpoint: `GET /api/v1/installation-guides/public/:id`

Display:
- localized title
- video section
- localized full description
- optional linked product card (show only if `linkedProduct != null`)

Linked product card:
- image (`mainImageUrl` if exists)
- localized name (`name`/`nameEn` by locale)
- on tap -> navigate to product details route (`/products/:id` in your app router style)

## 8) Video rendering strategy
Reuse existing video mechanism in app (preferred, no new player architecture).

Recommended source priority:
1. `hlsUrl`
2. `mp4Url`
3. `embedUrl`
4. `url` (fallback)

UI behavior by status:
- `processing`: show processing message + placeholder thumbnail.
- `ready`: show playable CTA.
- `failed`: show non-blocking error state.

---

## Localization Keys (add in ARB)
Minimum keys:
- `installationGuides`
- `installationGuidesTitle`
- `installationGuidesEmpty`
- `installationGuidesRetry`
- `installationGuideLinkedProduct`
- `installationGuideVideoProcessing`
- `installationGuideVideoFailed`

---

## Acceptance Checklist

- Profile shows `Installation Guides` entry.
- User can open list page and see active guides.
- User can open detail page from any card.
- Video section handles `processing/ready/failed` safely.
- Linked product card is hidden when `linkedProduct` is null.
- Linked product opens product details page.
- Loading/empty/error/retry states are implemented in both list and detail.
- Locale switching correctly changes title/tag/description fields.

---

## Quick QA Scenarios

1. Active guide with video + linked product: all sections appear.
2. Active guide with video and no linked product: product card hidden.
3. Inactive guide id direct-open: detail request returns 404 and UI handles gracefully.
4. API network failure: error + retry works.
5. Video status `processing`: no crash, graceful placeholder.

---

## Backend/Frontend Reference Files

Backend:
- `backend/src/modules/installation-guides/*`

Admin (already implemented):
- `admin-dashboard/src/features/installation-guides/*`

This handoff is aligned with current implemented backend contracts, not only the original execution plan.

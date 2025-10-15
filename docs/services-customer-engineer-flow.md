## تدفّق كامل: إنشاء طلب من العميل وتقديم عرض من المهندس

يوضح هذا المستند رحلة النظام كاملة من لحظة إنشاء العميل لطلب الخدمة، مرورًا بعرض المهندس وقبول العرض وبدء/إنهاء العمل، مع حالات الإلغاء والتقييم.

### 1) مخطط تدفّق شامل (Flowchart)
```mermaid
flowchart TD
  %% Nodes
  A[Customer: إنشاء طلب] -->|POST /services/requests| B[REQUEST OPEN]
  B --> C{هل يوجد عروض؟}
  C -- لا --> D[Engineer: Nearby GET /services/requests/nearby]
  D --> E[Engineer: يقدم عرض]
  E -->|POST /services/offers| F[REQUEST → OFFERS_COLLECTING]
  C -- نعم --> G[Customer: يستعرض العروض GET /services/requests/:id/offers]

  G --> H{قبول عرض؟}
  H -- نعم --> I[POST /services/requests/:id/accept-offer]
  I --> J[REQUEST → ASSIGNED + حفظ العرض المقبول]
  H -- لا --> G

  J --> K[Engineer: بدء العمل POST /services/requests/:id/start]
  K --> L[REQUEST → IN_PROGRESS]
  L --> M[Engineer: إنهاء POST /services/requests/:id/complete]
  M --> N[REQUEST → COMPLETED]
  N --> O[Customer: تقييم POST /services/requests/:id/rate]
  O --> P[REQUEST → RATED]

  %% Cancellation branches
  B --> Q{إلغاء من العميل؟}
  F --> Q
  L --> Q
  Q -- نعم --> R[POST /services/requests/:id/cancel]
  R --> S[REQUEST → CANCELLED + رفض العروض المفتوحة]
```

### 2) تسلسل زمني تفصيلي (Sequence Diagram)
```mermaid
sequenceDiagram
  participant C as Customer (App)
  participant E as Engineer (App)
  participant API as Services API
  participant DB as MongoDB

  Note over C: إنشاء طلب خدمة
  C->>API: POST /services/requests { title, type, addressId, images?, scheduledAt? }
  API->>DB: create(ServiceRequest: status=OPEN, location from Address)
  API-->>C: 201 { requestId, status=OPEN }

  Note over E: استكشاف الطلبات القريبة
  E->>API: GET /services/requests/nearby?lat&lng&radiusKm
  API->>DB: geo $near on location (2dsphere)
  API-->>E: 200 [requests]

  Note over E: تقديم العرض
  E->>API: POST /services/offers { requestId, amount, note, lat, lng }
  API->>DB: calculate distanceKm (Haversine), upsert EngineerOffer
  API->>DB: إذا كانت أول عرض → update request.status=OFFERS_COLLECTING
  API-->>E: 200 { offerId, distanceKm, status=OFFERED }

  Note over C: استعراض العروض وقبول أحدها
  C->>API: GET /services/requests/:id/offers
  API->>DB: find offers by requestId sort(distanceKm asc, amount asc)
  API-->>C: 200 [offers]
  C->>API: POST /services/requests/:id/accept-offer { offerId }
  API->>DB: set request.status=ASSIGNED, engineerId=offer.engineerId, acceptedOffer={amount,note}
  API->>DB: reject other offers for the request
  API-->>C: 200 { ok: true }

  Note over E: بدء ثم إنهاء العمل
  E->>API: POST /services/requests/:id/start
  API->>DB: verify engineerId match + status ASSIGNED → set IN_PROGRESS
  API-->>E: 200 { ok: true }
  E->>API: POST /services/requests/:id/complete
  API->>DB: status IN_PROGRESS → COMPLETED
  API-->>E: 200 { ok: true }

  Note over C: التقييم
  C->>API: POST /services/requests/:id/rate { score, comment? }
  API->>DB: verify status COMPLETED → set rating + status RATED
  API-->>C: 200 { ok: true }

  alt إلغاء من العميل
    C->>API: POST /services/requests/:id/cancel
    API->>DB: if status in [OPEN, OFFERS_COLLECTING] → set CANCELLED
    API->>DB: reject OFFERED offers for this request
    API-->>C: 200 { ok: true }
  else إلغاء إداري
    C-xAPI: 
    API->>API: POST /admin/services/requests/:id/cancel
    API->>DB: cancel unless in [COMPLETED,RATED,CANCELLED]
    API-->>API: { ok | error }
  end
```

### 3) حالات الطلب والعرض (State Reference)
- حالات الطلب: `OPEN → OFFERS_COLLECTING → ASSIGNED → IN_PROGRESS → COMPLETED → RATED` (مع `CANCELLED`).
- حالات العرض: `OFFERED → ACCEPTED` (وإلا تُرفض عند قبول عرض آخر أو الإلغاء).

### 4) قواعد العمل الرئيسية
- ترتيب العروض للعرض على العميل: الأقرب (`distanceKm`) ثم الأرخص (`amount`).
- منع المهندس من رؤية طلباته الخاصة.
- أول عرض يجعل الطلب ينتقل إلى `OFFERS_COLLECTING`.
- قبول عرض واحد يحدد `engineerId` ويرفض بقية العروض المفتوحة.
- بدء/إنهاء العمل مقيدان بمالك العرض المقبول وحالة الطلب الصحيحة.
- الإلغاء مسموح للعميل في حالتي `OPEN` و`OFFERS_COLLECTING` فقط.

### 5) ملاحظات تكامل
- حساب المسافة: دالة Haversine لتعبئة `distanceKm` عند إنشاء/تحديث العرض.
- البحث المكاني: `$near` مع فهرس `2dsphere` على `location` في `ServiceRequest`.
- إشعارات اختيارية عبر `NotificationsPort` لأحداث رئيسية (فتح الطلب، عرض جديد، قبول العرض، بدء/إنهاء، تقييم).



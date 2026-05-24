# Mobile Notifications Reliability Contract

This file is for the mobile app developer. The backend and admin dashboard now expose reliable notification delivery signals, but the mobile app must call the tracking endpoints below to close the loop.

## Scope

- Do not treat a push notification as fully delivered just because FCM accepted it.
- Always show important notifications from the in-app inbox sync, even if push delivery fails.
- Show only notifications visible from the backend response. The backend keeps the user-visible window to the latest 7 days.

## Device Token Lifecycle

Register or move the current FCM token after login, app start, token refresh, and user switch:

```http
POST /notifications/devices/register
Authorization: Bearer <user token>
Content-Type: application/json

{
  "token": "<fcm-token>",
  "platform": "android | ios | web",
  "appVersion": "<app-version>",
  "userAgent": "<device-info>"
}
```

Unregister on logout:

```http
POST /notifications/devices/unregister
Authorization: Bearer <user token>
Content-Type: application/json

{
  "token": "<fcm-token>"
}
```

The backend keeps tokens globally unique. If the same device token moves from user A to user B, it is reassigned to B so B will not receive A notifications.

## Expected Push Payload

All FCM `data` values are strings. Parse JSON strings only where needed, especially `navigationParams`.

```json
{
  "notificationId": "...",
  "trackingId": "...",
  "type": "SERVICE_REQUEST_OPENED",
  "category": "service",
  "priority": "high",
  "channel": "push",
  "recipientId": "...",
  "actionUrl": "/service-requests/...",
  "navigationType": "service_request",
  "navigationTarget": "...",
  "navigationParams": "{\"tab\":\"details\"}",
  "entityType": "service_request",
  "entityId": "...",
  "batchId": "...",
  "campaign": "...",
  "createdAt": "2026-05-25T00:00:00.000Z"
}
```

## Required Tracking Calls

When the app receives the push in foreground/background handler:

```http
POST /notifications/track/:trackingId/received
Content-Type: application/json

{
  "deviceToken": "<optional-current-fcm-token>"
}
```

When the user opens the notification:

```http
POST /notifications/track/:trackingId/open
```

When the user taps an action inside the notification/inbox item:

```http
POST /notifications/track/:trackingId/click
Content-Type: application/json

{
  "url": "<optional-action-url>",
  "buttonId": "<optional-button-id>"
}
```

## Inbox Sync

On app start, login, pull-to-refresh, and after network recovery:

```http
GET /notifications?limit=20&offset=0
Authorization: Bearer <user token>
```

Use this response as the source of truth for notification center content. Do not depend on local push history only.

## Navigation Rules

- `navigationType=service_request`: open the service request screen using `navigationTarget` or `serviceRequestId`.
- `navigationType=order`: open the order details screen using `navigationTarget` or `orderId`.
- `navigationType=product`: open product details using `navigationTarget` or `productId`.
- `navigationType=category`: open category using `navigationTarget` or `categoryId`.
- `navigationType=section`: open the named app section.
- `navigationType=external_url`: open `navigationTarget` only after app-side URL validation.
- `navigationType=none`: open the notification inbox item only.

## Manual Acceptance Checklist

- Online user receives WebSocket/in-app notification and sees it in the inbox.
- Offline user with a token receives push and sends `received`.
- User opens push and sends `open`.
- Notification tap opens the correct screen from payload navigation fields.
- User without token appears in admin as `NO_DEVICE_TOKEN`.
- Invalid token stops being active after FCM rejects it.
- After logout/login as another user, the device token belongs only to the current user.
- Notifications older than the backend-visible window do not appear in the inbox.

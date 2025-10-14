# Promotions Module

This module handles price rules and promotions for the e-commerce platform.

## Features

- **Price Rules Management**: Create, update, activate/deactivate price rules
- **Flexible Conditions**: Rules can be applied based on category, product, variant, brand, currency, quantity, and account type
- **Multiple Effects**: Support for percentage discount, fixed amount discount, special pricing, badges, and gift items
- **Priority System**: Rules are applied in priority order
- **Time-based Rules**: Rules have start and end dates
- **Effective Price Calculation**: Calculate final prices after applying applicable promotions

## API Endpoints

### Admin Endpoints (require authentication)

- `POST /admin/promotions/rules` - Create a new price rule
- `PATCH /admin/promotions/rules/:id` - Update a price rule
- `GET /admin/promotions/rules` - List all price rules
- `POST /admin/promotions/rules/:id/toggle` - Toggle rule active/inactive status
- `POST /admin/promotions/preview` - Preview rule effect on a variant

### Public Endpoints

- `GET /pricing/variant?variantId=&currency=&qty=&accountType=` - Get effective price for a variant

## Price Rule Schema

```typescript
{
  active: boolean,      // Default: true
  priority: number,     // Higher numbers = higher priority
  startAt: Date,        // Rule start date
  endAt: Date,          // Rule end date
  conditions: {
    categoryId?: string,
    productId?: string,
    variantId?: string,
    brandId?: string,
    currency?: string,
    minQty?: number,
    accountType?: string
  },
  effects: {
    percentOff?: number,    // Percentage discount (0-100)
    amountOff?: number,     // Fixed amount discount
    specialPrice?: number,  // Set specific price
    badge?: string,         // Display badge (e.g., "SALE", "HOT DEAL")
    giftSku?: string        // Include free gift
  }
}
```

## Usage Examples

### Create a 20% discount for all products in a category
```json
{
  "priority": 10,
  "startAt": "2024-01-01T00:00:00Z",
  "endAt": "2024-12-31T23:59:59Z",
  "conditions": {
    "categoryId": "category_id_here"
  },
  "effects": {
    "percentOff": 20,
    "badge": "خصم 20%"
  }
}
```

### Special price for wholesale customers
```json
{
  "priority": 50,
  "startAt": "2024-01-01T00:00:00Z",
  "endAt": "2024-12-31T23:59:59Z",
  "conditions": {
    "accountType": "wholesale",
    "minQty": 10
  },
  "effects": {
    "specialPrice": 15.99
  }
}
```

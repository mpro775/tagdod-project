# ملفات الإعداد والأمثلة الكاملة
# Complete Configuration Files and Examples

> 🔧 **ملفات الإعداد الكاملة والأمثلة الواقعية**

---

## 📦 ملفات Package.json

### package.json الكامل

```json
{
  "name": "tagadodo-admin-dashboard",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\""
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.26.0",
    "@mui/material": "^6.1.0",
    "@mui/icons-material": "^6.1.0",
    "@mui/x-data-grid": "^7.17.0",
    "@mui/x-date-pickers": "^7.17.0",
    "@emotion/react": "^11.13.0",
    "@emotion/styled": "^11.13.0",
    "@emotion/cache": "^11.13.0",
    "axios": "^1.7.0",
    "@tanstack/react-query": "^5.56.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0",
    "i18next": "^23.15.0",
    "react-i18next": "^15.0.0",
    "i18next-browser-languagedetector": "^8.0.0",
    "date-fns": "^3.6.0",
    "recharts": "^2.12.0",
    "react-hot-toast": "^2.4.1",
    "notistack": "^3.0.1",
    "react-dropzone": "^14.2.0",
    "stylis": "^4.3.0",
    "stylis-plugin-rtl": "^2.1.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^22.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "typescript": "^5.5.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.37.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

---

## ⚙️ ملفات التكوين

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/features/*": ["./src/features/*"],
      "@/store/*": ["./src/store/*"],
      "@/config/*": ["./src/config/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tsconfig.node.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/config': path.resolve(__dirname, './src/config'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
          ],
          'vendor-data': ['@tanstack/react-query', 'axios'],
          'vendor-forms': ['react-hook-form', 'zod'],
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### .eslintrc.json

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["react", "@typescript-eslint", "react-hooks", "react-refresh"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-debugger": "error",
    "prefer-const": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react-refresh/only-export-components": ["warn", { "allowConstantExport": true }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "ignorePatterns": ["dist", "node_modules", "*.config.ts", "*.config.js"]
}
```

### .prettierrc.json

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "jsxSingleQuote": false
}
```

### .env.example

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=Tagadodo Admin
VITE_APP_VERSION=1.0.0

# Default Language
VITE_DEFAULT_LANGUAGE=ar

# Default Theme
VITE_DEFAULT_THEME=light

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=false

# Upload Limits
VITE_MAX_UPLOAD_SIZE=5242880
VITE_MAX_IMAGES_PER_PRODUCT=10

# Pagination
VITE_DEFAULT_PAGE_SIZE=20
VITE_MAX_PAGE_SIZE=100
```

---

## 🎨 ملفات Types الكاملة

### src/shared/types/common.types.ts

```typescript
// Common Types

export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  requestId: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    fieldErrors?: FieldError[];
  };
  requestId: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams extends ListParams {
  [key: string]: any;
}

// Status Types
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

// Common Actions
export type Action = 'create' | 'read' | 'update' | 'delete';

// Language
export type Language = 'ar' | 'en';

// Direction
export type Direction = 'ltr' | 'rtl';

// Theme
export type ThemeMode = 'light' | 'dark';
```

### src/features/users/types/user.types.ts

```typescript
import { BaseEntity, ListParams } from '@/shared/types/common.types';

// User Role
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// User Status
export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

// User Interface
export interface User extends BaseEntity {
  phone: string;
  firstName: string;
  lastName?: string;
  email?: string;
  roles: UserRole[];
  permissions?: string[];
  status: UserStatus;
  isActive: boolean;
  
  // Capabilities
  capabilities?: {
    customer_capable: boolean;
    engineer_capable: boolean;
    wholesale_capable: boolean;
    wholesaleDiscount?: number;
  };
  
  // Engineer specific
  jobTitle?: string;
  
  // Timestamps
  suspendedAt?: Date;
  deletedAt?: Date;
  lastLoginAt?: Date;
}

// DTOs
export interface CreateUserDto {
  phone: string;
  firstName: string;
  lastName?: string;
  email?: string;
  password: string;
  roles: UserRole[];
  isActive?: boolean;
  
  // Optional capabilities
  capabilities?: {
    customer_capable?: boolean;
    engineer_capable?: boolean;
    wholesale_capable?: boolean;
    wholesaleDiscount?: number;
  };
  
  jobTitle?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: UserRole[];
  permissions?: string[];
  isActive?: boolean;
  
  capabilities?: {
    customer_capable?: boolean;
    engineer_capable?: boolean;
    wholesale_capable?: boolean;
    wholesaleDiscount?: number;
  };
  
  jobTitle?: string;
}

export interface ListUsersParams extends ListParams {
  status?: UserStatus;
  role?: UserRole;
  isActive?: boolean;
  includeDeleted?: boolean;
}

export interface SuspendUserDto {
  reason: string;
}

// User Statistics
export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  deleted: number;
  admins: number;
  engineers: number;
  wholesale: number;
}
```

### src/features/products/types/product.types.ts

```typescript
import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Product Interface
export interface Product extends BaseEntity {
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  descriptionEn: string;
  
  // Relations
  categoryId: string;
  brandId?: string;
  attributes: string[]; // Attribute IDs
  
  // Images
  images: ProductImage[];
  mainImage?: string;
  
  // Variants
  variants: ProductVariant[];
  
  // Status
  isActive: boolean;
  isFeatured: boolean;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  
  // Stats
  viewCount?: number;
  orderCount?: number;
  favoriteCount?: number;
  
  // Pricing (min/max from variants)
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductImage {
  url: string;
  alt?: string;
  sortOrder: number;
}

export interface ProductVariant extends BaseEntity {
  productId: string;
  sku: string;
  
  // Attributes
  attributes: {
    attributeId: string;
    valueId: string;
  }[];
  
  // Pricing
  basePrice: number;
  comparePrice?: number;
  costPrice?: number;
  
  // Inventory
  stock: number;
  lowStockThreshold?: number;
  
  // Status
  isActive: boolean;
  isDefault?: boolean;
  
  // Images (variant-specific)
  images?: string[];
  
  // Weight/Dimensions
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
}

// DTOs
export interface CreateProductDto {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  categoryId: string;
  brandId?: string;
  attributes: string[];
  images?: string[]; // Media IDs
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ListProductsParams extends ListParams {
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface CreateVariantDto {
  sku: string;
  attributes: {
    attributeId: string;
    valueId: string;
  }[];
  basePrice: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  isDefault?: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
}

export interface UpdateVariantDto extends Partial<CreateVariantDto> {}

export interface GenerateVariantsDto {
  defaultPrice: number;
  defaultStock: number;
}

// Product Stats
export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  outOfStock: number;
  lowStock: number;
}
```

### src/features/orders/types/order.types.ts

```typescript
import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Order Status
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// Payment Method
export enum PaymentMethod {
  COD = 'COD',
  CARD = 'card',
  WALLET = 'wallet',
}

// Order Interface
export interface Order extends BaseEntity {
  orderNumber: string;
  userId: string;
  
  // Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  
  // Items
  items: OrderItem[];
  
  // Pricing
  currency: string;
  subtotal: number;
  itemsDiscount: number;
  couponDiscount: number;
  shippingCost: number;
  tax: number;
  totalDiscount: number;
  total: number;
  
  // Coupon
  appliedCouponCode?: string;
  couponDetails?: {
    code: string;
    title: string;
    type: string;
  };
  
  // Delivery
  deliveryAddress: DeliveryAddress;
  shippingMethod: string;
  
  // Payment
  paymentMethod: PaymentMethod;
  paymentDetails?: any;
  paidAt?: Date;
  
  // Tracking
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  
  // Cancellation/Refund
  cancelledAt?: Date;
  cancellationReason?: string;
  refundedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
  
  // Notes
  customerNotes?: string;
  adminNotes?: string;
  
  // History
  statusHistory: StatusHistoryItem[];
  
  // Rating
  rating?: number;
  review?: string;
  reviewedAt?: Date;
  
  // Metadata
  metadata?: {
    cartId?: string;
    source?: string;
    ip?: string;
    userAgent?: string;
  };
}

export interface OrderItem {
  productId: string;
  variantId: string;
  qty: number;
  
  // Pricing
  basePrice: number;
  discount: number;
  finalPrice: number;
  lineTotal: number;
  currency: string;
  
  // Promotion
  appliedPromotionId?: string;
  
  // Snapshot
  snapshot: {
    name: string;
    nameEn?: string;
    sku: string;
    slug: string;
    image?: string;
    brandName?: string;
    categoryName?: string;
    attributes: Array<{
      name: string;
      value: string;
    }>;
  };
}

export interface DeliveryAddress {
  addressId: string;
  recipientName: string;
  recipientPhone: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
  coords?: {
    lat: number;
    lng: number;
  };
  notes?: string;
}

export interface StatusHistoryItem {
  status: OrderStatus;
  changedAt: Date;
  changedBy?: string;
  changedByRole?: string;
  notes?: string;
}

// DTOs
export interface UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
}

export interface ShipOrderDto {
  trackingNumber: string;
  shippingCompany: string;
  notes?: string;
}

export interface RefundOrderDto {
  amount: number;
  reason: string;
  notes?: string;
}

export interface CancelOrderDto {
  reason: string;
  notes?: string;
}

export interface AddAdminNotesDto {
  notes: string;
}

export interface ListOrdersParams extends ListParams {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  userId?: string;
  orderNumber?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Order Stats
export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
}

// Order Timeline
export interface OrderTimeline {
  status: OrderStatus;
  title: string;
  description?: string;
  timestamp: Date;
  icon: string;
  color: string;
}
```

---

## 🔧 ملفات الإعداد الإضافية

### src/config/constants.ts

```typescript
// Application Constants

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Tagadodo Admin';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

// Pagination
export const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20;
export const MAX_PAGE_SIZE = Number(import.meta.env.VITE_MAX_PAGE_SIZE) || 100;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Upload
export const MAX_UPLOAD_SIZE = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE) || 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_PRODUCT = Number(import.meta.env.VITE_MAX_IMAGES_PER_PRODUCT) || 10;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Date Format
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const TIME_FORMAT = 'HH:mm';

// Languages
export const DEFAULT_LANGUAGE = (import.meta.env.VITE_DEFAULT_LANGUAGE as 'ar' | 'en') || 'ar';
export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;

// Theme
export const DEFAULT_THEME = (import.meta.env.VITE_DEFAULT_THEME as 'light' | 'dark') || 'light';

// Feature Flags
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
export const ENABLE_PWA = import.meta.env.VITE_ENABLE_PWA === 'true';

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebar_state',
} as const;

// Query Keys
export const QUERY_KEYS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ATTRIBUTES: 'attributes',
  BRANDS: 'brands',
  BANNERS: 'banners',
  ORDERS: 'orders',
  COUPONS: 'coupons',
  MEDIA: 'media',
  ANALYTICS: 'analytics',
  DASHBOARD: 'dashboard',
} as const;

// Status Colors
export const STATUS_COLORS = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
  suspended: 'error',
  confirmed: 'info',
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'warning',
} as const;

// Role Colors
export const ROLE_COLORS = {
  super_admin: 'error',
  admin: 'warning',
  moderator: 'info',
  user: 'default',
} as const;
```

### src/config/routes.ts

```typescript
// Application Routes

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Users
  USERS: '/users',
  USER_DETAILS: '/users/:id',
  USER_CREATE: '/users/new',
  USER_EDIT: '/users/:id/edit',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_DETAILS: '/products/:id',
  PRODUCT_CREATE: '/products/new',
  PRODUCT_EDIT: '/products/:id/edit',
  PRODUCT_VARIANTS: '/products/:id/variants',
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_DETAILS: '/categories/:id',
  CATEGORY_CREATE: '/categories/new',
  CATEGORY_EDIT: '/categories/:id/edit',
  
  // Attributes
  ATTRIBUTES: '/attributes',
  ATTRIBUTE_DETAILS: '/attributes/:id',
  ATTRIBUTE_CREATE: '/attributes/new',
  ATTRIBUTE_EDIT: '/attributes/:id/edit',
  
  // Brands
  BRANDS: '/brands',
  BRAND_DETAILS: '/brands/:id',
  BRAND_CREATE: '/brands/new',
  BRAND_EDIT: '/brands/:id/edit',
  
  // Banners
  BANNERS: '/banners',
  BANNER_DETAILS: '/banners/:id',
  BANNER_CREATE: '/banners/new',
  BANNER_EDIT: '/banners/:id/edit',
  
  // Orders
  ORDERS: '/orders',
  ORDER_DETAILS: '/orders/:id',
  
  // Coupons
  COUPONS: '/coupons',
  COUPON_DETAILS: '/coupons/:id',
  COUPON_CREATE: '/coupons/new',
  COUPON_EDIT: '/coupons/:id/edit',
  
  // Media
  MEDIA: '/media',
  
  // Analytics
  ANALYTICS: '/analytics',
  REPORTS: '/reports',
  
  // Support
  SUPPORT: '/support',
  TICKET_DETAILS: '/support/:id',
  
  // Settings
  SETTINGS: '/settings',
  PROFILE: '/profile',
  
  // Misc
  NOT_FOUND: '/404',
} as const;

// Helper function to build route with params
export const buildRoute = (route: string, params: Record<string, string>): string => {
  let path = route;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  return path;
};

// Usage:
// buildRoute(ROUTES.USER_DETAILS, { id: '123' }) => '/users/123'
```

---

## 🎨 ملفات الثيمات الكاملة

### src/core/theme/colors.ts

```typescript
// Color Palette

export const colors = {
  // Primary
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#fff',
  },
  
  // Secondary
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#fff',
  },
  
  // Success
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#fff',
  },
  
  // Error
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#fff',
  },
  
  // Warning
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#fff',
  },
  
  // Info
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#fff',
  },
  
  // Grey
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};
```

### src/core/theme/typography.ts

```typescript
// Typography Configuration

export const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  
  fontSize: 14,
  
  h1: {
    fontSize: '2.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.6,
  },
  
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.75,
  },
  
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.57,
  },
  
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.43,
  },
  
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.75,
    textTransform: 'none' as const,
  },
  
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66,
  },
  
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 2.66,
    textTransform: 'uppercase' as const,
  },
};
```

---

## 🛠️ Utilities الكاملة

### src/shared/utils/formatters.ts

```typescript
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

/**
 * Format date
 */
export const formatDate = (
  date: Date | string,
  formatStr: string = 'yyyy-MM-dd',
  locale: 'ar' | 'en' = 'ar'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeObj = locale === 'ar' ? ar : enUS;
  return format(dateObj, formatStr, { locale: localeObj });
};

/**
 * Format currency
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'SAR',
  locale: 'ar' | 'en' = 'ar'
): string => {
  const localeStr = locale === 'ar' ? 'ar-SA' : 'en-US';
  
  return new Intl.NumberFormat(localeStr, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number
 */
export const formatNumber = (
  value: number,
  locale: 'ar' | 'en' = 'ar',
  options?: Intl.NumberFormatOptions
): string => {
  const localeStr = locale === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(localeStr, options).format(value);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as: +966 XX XXX XXXX
  if (cleaned.startsWith('966')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  // Format as: 0XX XXX XXXX
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength: number = 50, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Format time ago
 */
export const formatTimeAgo = (date: Date | string, locale: 'ar' | 'en' = 'ar'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (locale === 'ar') {
    if (seconds < 60) return 'الآن';
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
    if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`;
    return formatDate(dateObj, 'yyyy-MM-dd', 'ar');
  } else {
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return formatDate(dateObj, 'yyyy-MM-dd', 'en');
  }
};
```

### src/shared/utils/validators.ts

```typescript
/**
 * Validation utilities
 */

export const validators = {
  /**
   * Validate email
   */
  email: (value: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  },

  /**
   * Validate phone (Saudi format)
   */
  phone: (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    
    // Must start with 05 or 966
    return (
      (cleaned.startsWith('05') && cleaned.length === 10) ||
      (cleaned.startsWith('9665') && cleaned.length === 12)
    );
  },

  /**
   * Validate URL
   */
  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate password strength
   */
  password: (value: string): { valid: boolean; strength: 'weak' | 'medium' | 'strong' } => {
    const hasLowerCase = /[a-z]/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLongEnough = value.length >= 8;
    
    const score = [hasLowerCase, hasUpperCase, hasNumber, hasSpecial, isLongEnough].filter(
      Boolean
    ).length;
    
    if (score < 3) {
      return { valid: false, strength: 'weak' };
    } else if (score < 5) {
      return { valid: true, strength: 'medium' };
    } else {
      return { valid: true, strength: 'strong' };
    }
  },

  /**
   * Validate required field
   */
  required: (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  /**
   * Validate min length
   */
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  /**
   * Validate max length
   */
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  /**
   * Validate number range
   */
  numberRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  /**
   * Validate file size
   */
  fileSize: (file: File, maxSizeInBytes: number): boolean => {
    return file.size <= maxSizeInBytes;
  },

  /**
   * Validate file type
   */
  fileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },
};
```

---

## 📝 نصائح وأفضل الممارسات

### 1. Performance Tips

```typescript
// ✅ استخدم React.memo للمكونات الثقيلة
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// ✅ استخدم useMemo للحسابات الثقيلة
const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]);

// ✅ استخدم useCallback للـ callbacks
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);

// ✅ Lazy loading للصفحات
const UsersPage = lazy(() => import('./features/users/pages/UsersListPage'));

// ✅ Code splitting
const routes = [
  {
    path: '/users',
    component: lazy(() => import('./features/users')),
  },
];
```

### 2. React Query Best Practices

```typescript
// ✅ استخدم Query Keys بشكل صحيح
const { data } = useQuery(['users', { page, search }], fetchUsers);

// ✅ استخدم Optimistic Updates
const { mutate } = useMutation(updateUser, {
  onMutate: async (newUser) => {
    await queryClient.cancelQueries(['users', newUser.id]);
    const previous = queryClient.getQueryData(['users', newUser.id]);
    queryClient.setQueryData(['users', newUser.id], newUser);
    return { previous };
  },
  onError: (err, newUser, context) => {
    queryClient.setQueryData(['users', newUser.id], context.previous);
  },
});

// ✅ استخدم Infinite Queries للبيانات الكبيرة
const {
  data,
  fetchNextPage,
  hasNextPage,
} = useInfiniteQuery(
  ['products'],
  ({ pageParam = 1 }) => fetchProducts(pageParam),
  {
    getNextPageParam: (lastPage) => lastPage.nextPage,
  }
);
```

### 3. Form Validation with Zod

```typescript
// ✅ إنشاء schemas قابلة لإعادة الاستخدام
const userBaseSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
});

const createUserSchema = userBaseSchema.extend({
  password: z.string().min(8),
});

const updateUserSchema = userBaseSchema.partial();

// ✅ استخدام مع React Hook Form
const methods = useForm({
  resolver: zodResolver(createUserSchema),
});
```

---

**🎉 جاهز للتطوير!**

تم إنشاء جميع الملفات والإعدادات المطلوبة. الآن يمكنك البدء في التطوير مباشرة! 🚀


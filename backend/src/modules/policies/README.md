# Policies Module - نظام إدارة السياسات

## نظرة عامة

نظام متكامل لإدارة سياسات الموقع (الأحكام والشروط + سياسة الخصوصية) باللغتين العربية والإنجليزية.

## المميزات

- ✅ إدارة سياسة الأحكام والشروط
- ✅ إدارة سياسة الخصوصية
- ✅ دعم اللغتين (العربية والإنجليزية)
- ✅ محتوى HTML غني
- ✅ تفعيل/تعطيل السياسات
- ✅ Public API للجلب (بدون مصادقة)
- ✅ Admin API للإدارة (محمي)

## البنية

```
policies/
├── schemas/
│   └── policy.schema.ts          # Schema للسياسات
├── dto/
│   └── policy.dto.ts             # DTOs
├── policies.service.ts           # Business Logic
├── policies.admin.controller.ts  # Admin endpoints
├── policies.public.controller.ts # Public endpoints
├── policies.module.ts            # Module definition
└── README.md                     # التوثيق
```

## API Endpoints

### Public Endpoints (بدون مصادقة)

#### جلب الأحكام والشروط
```
GET /api/v1/policies/public/terms
```

#### جلب سياسة الخصوصية
```
GET /api/v1/policies/public/privacy
```

#### جلب سياسة حسب النوع
```
GET /api/v1/policies/public/:type
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "type": "terms",
  "titleAr": "الأحكام والشروط",
  "titleEn": "Terms and Conditions",
  "contentAr": "<p>المحتوى بالعربية...</p>",
  "contentEn": "<p>Content in English...</p>",
  "isActive": true,
  "lastUpdatedBy": "user-id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Admin Endpoints (تتطلب مصادقة)

#### جلب جميع السياسات
```
GET /api/v1/admin/policies
Authorization: Bearer {token}
```

#### جلب سياسة حسب النوع
```
GET /api/v1/admin/policies/:type
Authorization: Bearer {token}
```

#### تحديث سياسة
```
PUT /api/v1/admin/policies/:type
Authorization: Bearer {token}
Content-Type: application/json

{
  "titleAr": "الأحكام والشروط",
  "titleEn": "Terms and Conditions",
  "contentAr": "<p>المحتوى بالعربية...</p>",
  "contentEn": "<p>Content in English...</p>",
  "isActive": true
}
```

#### تفعيل/تعطيل سياسة
```
POST /api/v1/admin/policies/:type/toggle
Authorization: Bearer {token}
Content-Type: application/json

{
  "isActive": false
}
```

## نموذج البيانات

```typescript
{
  type: 'terms' | 'privacy',    // نوع السياسة
  titleAr: string,              // العنوان بالعربية
  titleEn: string,              // العنوان بالإنجليزية
  contentAr: string,            // المحتوى بالعربية (HTML)
  contentEn: string,            // المحتوى بالإنجليزية (HTML)
  isActive: boolean,            // نشط/غير نشط
  lastUpdatedBy: string,        // آخر من قام بالتحديث
  createdAt: Date,
  updatedAt: Date
}
```

## الأمان

- Public Endpoints: لا تحتاج مصادقة (للجلب فقط)
- Admin Endpoints: تتطلب JWT + AdminGuard
- HTML content يتم التحقق منه قبل الحفظ
- فقط Admin/Super Admin يمكنهم تعديل السياسات

## الاستخدام

### في Service آخر

```typescript
import { PoliciesService } from '../policies/policies.service';

@Injectable()
export class MyService {
  constructor(private policiesService: PoliciesService) {}

  async getTerms() {
    return this.policiesService.getPolicyByType(PolicyType.TERMS);
  }
}
```

### في Controller

```typescript
import { PoliciesPublicController } from './policies/policies.public.controller';

// استخدام الـ controller مباشرة أو استدعاء الـ service
```

## ملاحظات

- كل نوع سياسة (terms/privacy) يجب أن يكون فريداً
- عند جلب السياسات من Public API، يتم جلب فقط السياسات النشطة (isActive: true)
- Admin API يمكنه جلب جميع السياسات بغض النظر عن حالة isActive

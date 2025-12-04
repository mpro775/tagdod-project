# About Module (صفحة من نحن)

## الوصف
موديول لإدارة صفحة "من نحن" في التطبيق، يتضمن إدارة المحتوى من لوحة التحكم وعرضه للعامة.

## الأقسام المدعومة

1. **النظرة العامة** - العنوان والوصف الرئيسي
2. **الرؤية والرسالة** - رؤية ورسالة الشركة
3. **القيم** - قيم الشركة (قائمة)
4. **قصتنا** - نص مفصل عن تاريخ الشركة (HTML)
5. **فريق العمل** - أعضاء الفريق مع صورهم ومناصبهم
6. **الإحصائيات** - أرقام وإنجازات الشركة
7. **معلومات التواصل** - العنوان، الهاتف، البريد، روابط التواصل الاجتماعي

## API Endpoints

### Admin (تتطلب مصادقة)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/v1/admin/about` | جلب بيانات صفحة من نحن |
| POST | `/api/v1/admin/about` | إنشاء صفحة من نحن (مرة واحدة) |
| PUT | `/api/v1/admin/about` | تحديث صفحة من نحن |
| POST | `/api/v1/admin/about/toggle` | تفعيل/تعطيل الصفحة |

### Public (بدون مصادقة)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/v1/about/public` | جلب صفحة من نحن النشطة |

## الملفات

```
about/
├── about.module.ts           # تعريف الموديول
├── about.service.ts          # منطق الأعمال
├── about.admin.controller.ts # نقاط نهاية الأدمن
├── about.public.controller.ts # نقاط نهاية العامة
├── dto/
│   └── about.dto.ts          # DTOs للتحقق
├── schemas/
│   └── about.schema.ts       # مخطط MongoDB
└── README.md                 # هذا الملف
```

## مثال على البيانات

```json
{
  "titleAr": "من نحن",
  "titleEn": "About Us",
  "descriptionAr": "وصف الشركة بالعربية",
  "descriptionEn": "Company description in English",
  "visionAr": "رؤيتنا",
  "visionEn": "Our Vision",
  "missionAr": "رسالتنا",
  "missionEn": "Our Mission",
  "values": [
    {
      "titleAr": "الجودة",
      "titleEn": "Quality",
      "descriptionAr": "نلتزم بأعلى معايير الجودة",
      "descriptionEn": "We commit to the highest quality standards",
      "icon": "Star"
    }
  ],
  "stats": [
    {
      "labelAr": "سنوات الخبرة",
      "labelEn": "Years of Experience",
      "value": "10+",
      "icon": "Calendar"
    }
  ],
  "teamMembers": [
    {
      "nameAr": "أحمد محمد",
      "nameEn": "Ahmed Mohamed",
      "positionAr": "المدير التنفيذي",
      "positionEn": "CEO",
      "image": "https://...",
      "isVisible": true,
      "order": 1
    }
  ],
  "contactInfo": {
    "addressAr": "الرياض، المملكة العربية السعودية",
    "addressEn": "Riyadh, Saudi Arabia",
    "phone": "+966123456789",
    "email": "info@company.com",
    "socialLinks": {
      "facebook": "https://facebook.com/...",
      "twitter": "https://twitter.com/...",
      "instagram": "https://instagram.com/..."
    }
  },
  "isActive": true
}
```


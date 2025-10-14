# Attributes Module

> 🏷️ **نظام السمات العالمية (Global Attributes)**

## نظرة عامة

Module لإدارة السمات العالمية الموحدة:
- ✅ توحيد كامل للسمات
- ✅ أنواع متعددة (select, text, number)
- ✅ قيم موحدة
- ✅ فلترة قوية
- ✅ تتبع استخدام

---

## المفهوم

```
السمة (Attribute):
- الاسم: "اللون"
- النوع: select
- القيم: ["أحمر", "أزرق", "أخضر"]

الفوائد:
✅ توحيد - كل المنتجات تستخدم نفس "أحمر"
✅ فلترة - سهل جداً
✅ UI موحد - نفس الشكل لكل المنتجات
```

---

## Schemas

### 1. Attribute

```typescript
{
  name: "اللون",
  nameEn: "Color",
  type: "select",
  isFilterable: true,
  showInFilters: true
}
```

### 2. AttributeValue

```typescript
{
  attributeId: "attr_color",
  value: "أحمر",
  valueEn: "Red",
  hexCode: "#FF0000"
}
```

### 3. AttributeGroup (للتنظيم)

```typescript
{
  name: "المواصفات العامة",
  attributes: ["attr_color", "attr_size", ...]
}
```

---

## Endpoints

### Admin:
- CRUD للسمات
- CRUD للقيم
- Stats

### Public:
- List attributes
- Filterable attributes
- Get attribute

---

## مثال الاستخدام

```http
# إنشاء سمة
POST /admin/attributes
{
  "name": "اللون",
  "nameEn": "Color",
  "type": "select",
  "isFilterable": true
}

# إضافة قيم
POST /admin/attributes/{id}/values
{ "value": "أحمر", "hexCode": "#FF0000" }
```

---

**Status:** ✅ Complete  
**Version:** 1.0.0


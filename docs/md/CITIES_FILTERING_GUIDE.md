# دليل نظام فلترة الخدمات حسب المدن اليمنية

## نظرة عامة

تم إضافة نظام فلترة احترافي للخدمات بحيث يتم إظهار طلبات الخدمات للمهندسين في نفس المدينة فقط.

---

## 🏙️ المدن المدعومة

تم إضافة دعم لـ **22 مدينة يمنية**:

### المدن الرئيسية:
- 🏛️ **صنعاء** (المدينة الافتراضية)
- 🌊 **عدن**
- ⛰️ **تعز**
- 🏖️ **الحديدة**
- 🌄 **إب**
- 🏔️ **ذمار**

### مدن أخرى:
- المكلا، حجة، عمران، صعدة، سيئون، زنجبار، مأرب، البيضاء، لحج، أبين، شبوة، المحويت، حضرموت، الجوف، المهرة، سقطرى

---

## 📊 التغييرات في قاعدة البيانات

### 1. جدول المستخدمين (Users)

```typescript
class User {
  // ... الحقول الموجودة
  
  @Prop({ default: 'صنعاء' }) 
  city?: string; // المدينة (للمهندسين وطلبات الخدمات)
}
```

**الفوائد:**
- كل مهندس يُسجل في مدينة معينة
- القيمة الافتراضية: صنعاء
- يمكن تحديثها لاحقاً

---

### 2. جدول طلبات الخدمات (ServiceRequests)

```typescript
class ServiceRequest {
  // ... الحقول الموجودة
  
  @Prop({ required: true, default: 'صنعاء', index: true }) 
  city!: string; // المدينة اليمنية
}
```

**الفوائد:**
- كل طلب خدمة مرتبط بمدينة محددة
- إلزامي عند إنشاء الطلب
- مفهرس لتحسين الأداء

**الفهارس:**
```typescript
ServiceRequestSchema.index({ city: 1, status: 1 }); // فهرس للمدينة والحالة
ServiceRequestSchema.index({ city: 1, createdAt: -1 }); // فهرس للمدينة والتاريخ
```

---

## 🔧 التغييرات في الباك إند

### 1. Enum للمدن اليمنية

📄 `enums/yemeni-cities.enum.ts`

```typescript
export enum YemeniCity {
  SANAA = 'صنعاء',
  ADEN = 'عدن',
  TAIZ = 'تعز',
  // ... باقي المدن
}

export const YEMENI_CITIES = Object.values(YemeniCity);
export const DEFAULT_CITY = YemeniCity.SANAA;
```

---

### 2. تحديث DTOs

📄 `dto/requests.dto.ts`

```typescript
export class CreateServiceRequestDto {
  @IsString() @MaxLength(140) title!: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() description?: string;
  
  // حقل المدينة (جديد)
  @IsNotEmpty({ message: 'المدينة مطلوبة' })
  @IsString({ message: 'المدينة يجب أن تكون نصاً' })
  @IsIn(YEMENI_CITIES, { 
    message: 'المدينة يجب أن تكون من المدن اليمنية المدعومة' 
  })
  city: string = DEFAULT_CITY;
  
  @IsMongoId() addressId!: string;
  @IsOptional() @IsDateString() scheduledAt?: string;
}
```

**الفوائد:**
- Validation تلقائي
- قيمة افتراضية: صنعاء
- يرفض المدن غير المدعومة

---

### 3. تحديث Services Service

📄 `services.service.ts`

#### دالة `createRequest`:
```typescript
const doc = await this.requests.create({
  userId: new Types.ObjectId(userId),
  title: dto.title,
  type: dto.type,
  description: dto.description,
  images: dto.images || [],
  city: dto.city || 'صنعاء', // ✅ إضافة المدينة
  addressId: addr._id,
  location,
  status: 'OPEN',
  scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
  engineerId: null,
});
```

#### دالة `nearby` (الأهم):
```typescript
async nearby(engineerUserId: string, lat: number, lng: number, radiusKm: number) {
  const meters = radiusKm * 1000;
  
  // جلب مدينة المهندس ✅
  const engineer = await this.userModel.findById(engineerUserId).select('city').lean();
  const engineerCity = engineer?.city || 'صنعاء';
  
  this.logger.log(`Engineer ${engineerUserId} from city: ${engineerCity} searching for nearby requests`);
  
  const list = await this.requests
    .find({
      status: { $in: ['OPEN', 'OFFERS_COLLECTING'] },
      engineerId: null,
      city: engineerCity, // ✅ فلترة حسب المدينة
      userId: { $ne: new Types.ObjectId(engineerUserId) },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: meters,
        },
      },
    })
    .limit(100)
    .lean();
    
  this.logger.log(`Found ${list.length} nearby requests in city ${engineerCity}`);
  return list;
}
```

**النتيجة:**
- مهندس من صنعاء → يرى فقط طلبات صنعاء
- مهندس من عدن → يرى فقط طلبات عدن
- وهكذا...

---

## 🎨 التغييرات في الفرونت إند

### 1. Constants للمدن

📄 `shared/constants/yemeni-cities.ts`

```typescript
export const YEMENI_CITIES = [
  'صنعاء', 'عدن', 'تعز', // ...
] as const;

export const DEFAULT_CITY = 'صنعاء';

export const getCityEmoji = (city: string): string => {
  return CITY_EMOJI_MAP[city] || '🏙️';
};
```

---

### 2. Component لاختيار المدينة

📄 `shared/components/CitySelect/CitySelect.tsx`

```tsx
<CitySelect
  value={formData.city || 'صنعاء'}
  onChange={(city) => handleInputChange('city', city)}
  error={!!errors.city}
  helperText={errors.city}
  required
/>
```

**المميزات:**
- Dropdown جميل مع emoji لكل مدينة
- Validation مدمج
- القيمة الافتراضية: صنعاء
- يظهر فقط المدن اليمنية المدعومة

---

### 3. تحديث النماذج

#### نموذج طلب الخدمة:
```
┌────────────────────────────────────┐
│ عنوان الطلب                       │
│ [إصلاح لوح شمسي   ]               │
│                                    │
│ وصف الطلب                         │
│ [يحتاج صيانة...]                  │
│                                    │
│ نوع الخدمة        │  المدينة      │
│ [إصلاح ▼]         │ [🏛️ صنعاء ▼] │
│                                    │
└────────────────────────────────────┘
```

#### نموذج المهندس:
```
┌────────────────────────────────────┐
│ اسم المهندس       │  رقم الهاتف   │
│ [أحمد محمد   ]    │ [0501234567 ] │
│                                    │
│ التخصص            │  مدينة العمل   │
│ [طاقة شمسية ▼]   │ [🏛️ صنعاء ▼] │
│                                    │
└────────────────────────────────────┘
```

---

### 4. تحديث الجداول

#### صفحة طلبات الخدمات:
```
┌────────┬──────────┬───────┬───────────┬─────────┬────────┐
│ العنوان│  العميل  │ المدينة│  المهندس │ المبلغ  │ الحالة │
├────────┼──────────┼───────┼───────────┼─────────┼────────┤
│ إصلاح │ محمد أحمد│🏛️ صنعاء│ علي حسن  │ 500 $│ مكتمل  │
│ صيانة │ فاطمة   │🌊 عدن  │ غير مُعيَّن│    -    │ مفتوح  │
└────────┴──────────┴───────┴───────────┴─────────┴────────┘
```

#### صفحة المهندسين:
```
┌───────────┬─────────┬───────┬────────┬────────┬────────┐
│  المهندس  │ الطلبات │المدينة│التقييم │الإيرادات│الإجراء│
├───────────┼─────────┼───────┼────────┼────────┼────────┤
│علي حسن   │   45    │🏛️ صنعاء│  4.8  │15,000  │ عرض   │
│أحمد سالم │   32    │🌊 عدن  │  4.5  │12,000  │ عرض   │
└───────────┴─────────┴───────┴────────┴────────┴────────┘
```

---

## 🔄 آلية العمل

### عند إنشاء طلب خدمة:

```
العميل يملأ النموذج
       ↓
يختار المدينة (إلزامي)
       ↓
POST /services/customer/requests
{
  "title": "إصلاح لوح شمسي",
  "type": "REPAIR",
  "description": "يحتاج صيانة",
  "city": "صنعاء", ← المدينة
  "addressId": "addr123"
}
       ↓
يُحفظ الطلب مع المدينة
       ↓
فقط المهندسين من صنعاء سيرونه
```

---

### عند بحث المهندس عن طلبات:

```
المهندس يفتح قائمة الطلبات
       ↓
GET /services/engineer/requests/nearby
Query: { lat: 15.36, lng: 44.20, radiusKm: 10 }
       ↓
الباك إند:
1. يجلب مدينة المهندس من الـ DB
   engineerCity = "صنعاء"
2. يبحث عن طلبات:
   - في نفس المدينة (city: "صنعاء")
   - ضمن المسافة المحددة
   - الحالة: OPEN أو OFFERS_COLLECTING
       ↓
يعيد فقط الطلبات المطابقة
       ↓
المهندس يرى فقط طلبات مدينته
```

---

## 💡 أمثلة عملية

### مثال 1: مهندس من صنعاء
```
المهندس: علي حسن
المدينة: صنعاء

الطلبات التي سيراها:
✅ طلب 1: إصلاح لوح - صنعاء
✅ طلب 2: صيانة نظام - صنعاء
✅ طلب 3: تركيب بطارية - صنعاء

الطلبات التي لن يراها:
❌ طلب 4: إصلاح لوح - عدن
❌ طلب 5: صيانة نظام - تعز
```

### مثال 2: مهندس من عدن
```
المهندس: أحمد سالم
المدينة: عدن

الطلبات التي سيراها:
✅ طلب 1: تركيب نظام - عدن
✅ طلب 2: صيانة دورية - عدن

الطلبات التي لن يراها:
❌ طلب 3: إصلاح لوح - صنعاء
❌ طلب 4: صيانة نظام - تعز
```

---

## 🎯 الفوائد

### للعملاء:
- ✅ يحصلون على مهندسين من نفس المدينة
- ✅ أوقات استجابة أسرع
- ✅ تكاليف تنقل أقل

### للمهندسين:
- ✅ يرون فقط الطلبات القريبة منهم
- ✅ لا يضيعون وقتاً في طلبات بعيدة
- ✅ تركيز أفضل على منطقتهم

### للنظام:
- ✅ تحسين الأداء (فلترة أسرع)
- ✅ تجربة مستخدم أفضل
- ✅ إدارة أفضل للموارد

---

## 🔍 الفلترة والبحث

### API Endpoint للمهندسين:
```
GET /services/engineer/requests/nearby?lat=15.36&lng=44.20&radiusKm=10
```

**الفلترة تتم على:**
1. ✅ المدينة (city === engineerCity)
2. ✅ المسافة (location within radius)
3. ✅ الحالة (status: OPEN or OFFERS_COLLECTING)
4. ✅ عدم التعيين (engineerId: null)
5. ✅ ليس طلب المهندس نفسه

---

## 📱 واجهة المستخدم

### عند إنشاء طلب خدمة:

```typescript
// في ServiceForm.tsx
<CitySelect
  value={formData.city || 'صنعاء'}
  onChange={(city) => handleInputChange('city', city)}
  error={!!errors.city}
  helperText={errors.city}
  required
/>
```

**العرض:**
```
┌─────────────────────────┐
│ المدينة *               │
│ ┌─────────────────────┐ │
│ │ 🏛️ صنعاء    ▼     │ │
│ └─────────────────────┘ │
│                         │
│ القائمة:                │
│ • 🏛️ صنعاء              │
│ • 🌊 عدن                │
│ • ⛰️ تعز                │
│ • 🏖️ الحديدة            │
│ • ...                   │
└─────────────────────────┘
```

---

### في جدول الطلبات:

```typescript
{
  field: 'city',
  headerName: 'المدينة',
  width: 140,
  renderCell: (params) => (
    <Chip
      icon={<LocationCity />}
      label={`${getCityEmoji(params.value)} ${params.value}`}
      size="small"
      color="primary"
      variant="outlined"
    />
  ),
}
```

---

### في جدول المهندسين:

```typescript
{
  field: 'city',
  headerName: 'المدينة',
  minWidth: 130,
  flex: 0.9,
  renderCell: (params) => (
    <Chip
      icon={<LocationCity />}
      label={`${getCityEmoji(params.row.city)} ${params.row.city}`}
      size="small"
      color="primary"
      variant="outlined"
    />
  ),
}
```

---

## 🚀 Migration للبيانات الموجودة

إذا كان لديك بيانات موجودة بدون حقل `city`:

```javascript
// Migration Script
db.servicerequests.updateMany(
  { city: { $exists: false } },
  { $set: { city: 'صنعاء' } }
);

db.users.updateMany(
  { 
    city: { $exists: false },
    $or: [
      { engineer_capable: true },
      { roles: 'engineer' }
    ]
  },
  { $set: { city: 'صنعاء' } }
);
```

---

## 📊 الإحصائيات

يمكن الآن عمل إحصائيات متقدمة حسب المدينة:

```typescript
// عدد الطلبات لكل مدينة
await serviceRequestModel.aggregate([
  { $match: { deletedAt: null } },
  { $group: { _id: '$city', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

// عدد المهندسين لكل مدينة
await userModel.aggregate([
  { $match: { engineer_capable: true } },
  { $group: { _id: '$city', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

---

## ⚠️ ملاحظات مهمة

1. **القيمة الافتراضية:**
   - جميع الحقول الجديدة تأخذ "صنعاء" كقيمة افتراضية
   - يمكن تغييرها حسب الحاجة

2. **الفهرسة:**
   - تم إضافة فهارس لتحسين الأداء
   - الاستعلامات ستكون أسرع بكثير

3. **Validation:**
   - فقط المدن المدرجة في القائمة مقبولة
   - رسائل خطأ واضحة بالعربية

4. **المرونة:**
   - يمكن إضافة مدن جديدة بسهولة
   - يمكن تغيير المدينة الافتراضية

---

## ✅ الملفات المُحدّثة

### Backend:
1. ✅ `enums/yemeni-cities.enum.ts` (جديد)
2. ✅ `schemas/service-request.schema.ts` (محدث - city field)
3. ✅ `schemas/user.schema.ts` (محدث - city field)
4. ✅ `dto/requests.dto.ts` (محدث - city validation)
5. ✅ `services.service.ts` (محدث - nearby filtering)
6. ✅ `CITIES_FILTERING_GUIDE.md` (جديد - هذا الملف)

### Frontend:
1. ✅ `shared/constants/yemeni-cities.ts` (جديد)
2. ✅ `shared/components/CitySelect/CitySelect.tsx` (جديد)
3. ✅ `shared/components/CitySelect/index.ts` (جديد)
4. ✅ `features/services/components/ServiceForm.tsx` (محدث)
5. ✅ `features/services/pages/ServicesListPage.tsx` (محدث - عمود جديد)
6. ✅ `features/services/pages/EngineersManagementPage.tsx` (محدث - عمود جديد)

---

## 🎉 النتيجة النهائية

✅ **نظام فلترة ذكي** - مهندسو كل مدينة يرون طلبات مدينتهم فقط
✅ **تحسين الأداء** - فهرسة محسّنة للمدن
✅ **تجربة أفضل** - واجهة جميلة مع emoji
✅ **توفير التكاليف** - تقليل المسافات والوقت
✅ **قابل للتوسع** - سهل إضافة مدن جديدة

**الميزة الآن جاهزة ومفعّلة!** 🚀


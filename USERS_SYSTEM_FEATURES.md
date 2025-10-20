# مميزات نظام إدارة وتحليل المستخدمين الشامل

## مقدمة عن النظام

نظام متقدم لإدارة وتحليل بيانات المستخدمين يوفر رؤى عميقة حول سلوك العملاء وأدائهم في منصة خدمات الطاقة الشمسية. النظام يجمع بين إدارة المستخدمين، تحليل السلوك، نظام النقاط والتقييم، والتنبؤات الذكية لمساعدة الإدارة في اتخاذ قرارات استراتيجية مدروسة.

## قسم أنواع البيانات والحقول

### بنية بيانات المستخدمين الشاملة

#### 1. **بيانات المستخدم الأساسية**
```typescript
interface User {
  // البيانات الشخصية
  _id: string;
  phone: string;                    // رقم الهاتف الأساسي
  firstName?: string;              // الاسم الأول (اختياري)
  lastName?: string;               // الاسم الأخير (اختياري)

  // حالة الحساب
  status: UserStatus;              // active, suspended, pending, deleted
  roles: string[];                 // أدوار المستخدم

  // تواريخ مهمة
  createdAt: Date;                 // تاريخ إنشاء الحساب
  lastLogin?: Date;                // آخر تسجيل دخول

  // إعدادات إضافية
  preferences?: UserPreferences;   // تفضيلات المستخدم
  metadata?: Record<string, unknown>; // بيانات مخصصة
}
```

#### 2. **إحصائيات المستخدم التفصيلية**
```typescript
interface UserDetailedStats {
  // معرف المستخدم والبيانات الأساسية
  userId: string;
  userInfo: {
    phone: string;
    firstName?: string;
    lastName?: string;
    status: string;
    roles: string[];
    createdAt: Date;
    lastLogin?: Date;
  };

  // إحصائيات الطلبات
  orders: {
    total: number;                    // إجمالي الطلبات
    completed: number;                // المكتملة
    pending: number;                  // المعلقة
    cancelled: number;                // الملغية
    totalSpent: number;               // إجمالي المبلغ المنفق
    averageOrderValue: number;        // متوسط قيمة الطلب
    firstOrderDate?: Date;            // تاريخ أول طلب
    lastOrderDate?: Date;             // تاريخ آخر طلب
    favoriteCategories: Array<{       // الفئات المفضلة
      category: string;
      count: number;
      amount: number;
    }>;
  };

  // إحصائيات المفضلة
  favorites: {
    total: number;                    // إجمالي المفضلة
    categories: Array<{              // فئات المفضلة
      category: string;
      count: number;
    }>;
    recentFavorites: Array<{         // أحدث المفضلة المضافة
      productId: string;
      productName: string;
      addedAt: Date;
    }>;
  };

  // إحصائيات الدعم الفني
  support: {
    totalTickets: number;             // إجمالي تذاكر الدعم
    openTickets: number;              // التذاكر المفتوحة
    resolvedTickets: number;          // التذاكر المحلولة
    averageResponseTime?: number;     // متوسط وقت الاستجابة (بالدقائق)
  };

  // نظام النقاط والتقييم
  score: {
    loyaltyScore: number;           // نقاط الولاء (0-100)
    valueScore: number;             // نقاط القيمة المالية (0-100)
    activityScore: number;          // نقاط النشاط (0-100)
    supportScore: number;           // نقاط خدمة العملاء (0-100)
    overallScore: number;           // النقاط الإجمالية (0-100)
    rank: number;                   // الترتيب بين العملاء
  };

  // تحليل السلوك
  behavior: {
    preferredPaymentMethod: string;   // طريقة الدفع المفضلة
    averageOrderFrequency: number;    // متوسط تكرار الطلبات (بالأيام)
    seasonalPatterns: Array<{        // الأنماط الموسمية
      month: string;
      orders: number;
      amount: number;
    }>;
    productPreferences: Array<{     // تفضيلات المنتجات
      category: string;
      percentage: number;
    }>;
  };

  // التنبؤات والتوصيات
  predictions: {
    churnRisk: 'low' | 'medium' | 'high';    // مخاطر فقدان العميل
    nextPurchaseProbability: number;         // احتمالية الشراء القادم (0-1)
    estimatedLifetimeValue: number;          // القيمة المتوقعة للعميل
    recommendedActions: string[];           // التوصيات المقترحة
  };
}
```

## قسم نظام النقاط والتقييم

### خوارزميات التقييم المتعددة

#### 1. **نقاط الولاء (Loyalty Score)**
```typescript
// حساب نقاط الولاء بناءً على الطلبات
loyaltyScore = Math.min(100, (totalOrders * 10) + (completedOrders * 15))

// مثال:
totalOrders = 15, completedOrders = 13
loyaltyScore = Math.min(100, (15 * 10) + (13 * 15)) = Math.min(100, 345) = 100
```

#### 2. **نقاط القيمة المالية (Value Score)**
```typescript
// حساب نقاط القيمة بناءً على المبلغ المنفق
valueScore = Math.min(100, (totalSpent / 1000) * 10)

// مثال:
totalSpent = 5000 (5,000 ريال)
valueScore = Math.min(100, (5000 / 1000) * 10) = Math.min(100, 50) = 50
```

#### 3. **نقاط النشاط (Activity Score)**
```typescript
// حساب نقاط النشاط بناءً على التفاعل
activityScore = Math.min(100, (totalOrders * 5) + (noSupportTickets ? 20 : 0))

// مثال:
totalOrders = 8, hasNoSupportTickets = true
activityScore = Math.min(100, (8 * 5) + 20) = Math.min(100, 60) = 60
```

#### 4. **نقاط خدمة العملاء (Support Score)**
```typescript
// حساب نقاط الدعم بناءً على تذاكر الدعم
supportScore = Math.max(0, 100 - (totalTickets * 5))

// مثال:
totalTickets = 3
supportScore = Math.max(0, 100 - (3 * 5)) = Math.max(0, 85) = 85
```

#### 5. **النقاط الإجمالية والترتيب**
```typescript
// حساب النقاط الإجمالية
overallScore = (loyaltyScore + valueScore + activityScore + supportScore) / 4

// الترتيب حسب النقاط الإجمالية
rank = ترتيب المستخدم حسب overallScore مقارنة بباقي المستخدمين
```

## قسم تحليل السلوك والتنبؤات

### تحليل ذكي لسلوك المستخدمين

#### 1. **تحليل طرق الدفع المفضلة**
```typescript
// تحليل طرق الدفع الأكثر استخداماً
const paymentMethodStats = await orderModel.aggregate([
  { $match: { userId: userId } },
  { $group: {
    _id: '$paymentMethod',
    count: { $sum: 1 },
    totalAmount: { $sum: '$totalAmount' }
  }},
  { $sort: { totalAmount: -1 } }
]);

preferredPaymentMethod = paymentMethodStats[0]?._id || 'غير محدد';
```

#### 2. **تحليل التكرار الزمني للطلبات**
```typescript
// حساب متوسط الأيام بين الطلبات
const orderDates = orders.map(order => order.createdAt).sort();
const intervals = [];

for (let i = 1; i < orderDates.length; i++) {
  const diff = orderDates[i].getTime() - orderDates[i - 1].getTime();
  intervals.push(diff / (1000 * 60 * 60 * 24)); // تحويل إلى أيام
}

averageOrderFrequency = intervals.reduce((a, b) => a + b, 0) / intervals.length;
```

#### 3. **تحليل الأنماط الموسمية**
```typescript
// تحليل الطلبات حسب الشهر
const seasonalData = await orderModel.aggregate([
  { $match: { userId: userId } },
  {
    $group: {
      _id: { $month: '$createdAt' },
      orders: { $sum: 1 },
      amount: { $sum: '$totalAmount' }
    }
  },
  {
    $project: {
      month: {
        $switch: {
          branches: [
            { case: { $eq: ['$_id', 1] }, then: 'يناير' },
            { case: { $eq: ['$_id', 2] }, then: 'فبراير' },
            // ... باقي الأشهر
          ]
        }
      },
      orders: 1,
      amount: 1
    }
  }
]);
```

## قسم التنبؤات والتوصيات

### نماذج التنبؤ الذكية

#### 1. **تحليل مخاطر فقدان العميل (Churn Risk)**
```typescript
// تحليل مخاطر فقدان العميل
const daysSinceLastOrder = Math.floor(
  (new Date().getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
);

if (daysSinceLastOrder > 90) {
  churnRisk = 'high';      // مخاطر عالية
} else if (daysSinceLastOrder > 30) {
  churnRisk = 'medium';    // مخاطر متوسطة
} else {
  churnRisk = 'low';       // مخاطر منخفضة
}
```

#### 2. **احتمالية الشراء القادم**
```typescript
// حساب احتمالية الشراء بناءً على السلوك السابق
const predictionFactors = {
  orderFrequency: 1 / averageOrderFrequency,
  recentActivity: orders.filter(o => {
    const daysDiff = (new Date().getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30; // آخر 30 يوم
  }).length,
  averageOrderValue: averageOrderValue,
  loyaltyScore: overallScore
};

nextPurchaseProbability = Math.min(1,
  (predictionFactors.orderFrequency * 0.3) +
  (predictionFactors.recentActivity * 0.25) +
  (predictionFactors.averageOrderValue / 1000 * 0.25) +
  (predictionFactors.loyaltyScore / 100 * 0.2)
);
```

#### 3. **القيمة المتوقعة للعميل (CLV)**
```typescript
// حساب القيمة المتوقعة للعميل
const estimatedLifetimeValue = totalSpent * (1 / (1 - nextPurchaseProbability));

// مثال:
totalSpent = 2000
nextPurchaseProbability = 0.7
estimatedLifetimeValue = 2000 * (1 / (1 - 0.7)) = 2000 * (1 / 0.3) = 6666.67
```

## قسم شرائح العملاء

### تصنيف العملاء حسب القيمة والسلوك

#### 1. **شرائح العملاء الأساسية**
| الشريحة | الوصف | المعايير |
|---------|-------|----------|
| **VIP** | العملاء الأكثر قيمة | إجمالي الإنفاق > 10,000 ريال، نقاط > 90 |
| **Premium** | العملاء ذوي القيمة العالية | إجمالي الإنفاق > 5,000 ريال، نقاط > 80 |
| **Regular** | العملاء المنتظمون | إجمالي الإنفاق > 1,000 ريال، نقاط > 60 |
| **New** | العملاء الجدد | حساب جديد، طلبات قليلة |

#### 2. **ترتيب العملاء حسب النقاط**
```typescript
// ترتيب ديناميكي حسب النقاط الإجمالية
const rankings = await userModel.aggregate([
  {
    $lookup: {
      from: 'orders',
      localField: '_id',
      foreignField: 'userId',
      as: 'orders'
    }
  },
  {
    $addFields: {
      totalSpent: { $sum: '$orders.totalAmount' },
      totalOrders: { $size: '$orders' }
    }
  },
  {
    $project: {
      userId: '$_id',
      userInfo: {
        phone: '$phone',
        firstName: '$firstName',
        lastName: '$lastName'
      },
      totalSpent: 1,
      totalOrders: 1,
      score: overallScore // محسوب سابقاً
    }
  },
  { $sort: { score: -1 } },
  { $limit: 50 }
]);
```

## قسم التقارير والإحصائيات

### تقارير شاملة للإدارة

#### 1. **تقرير نظرة عامة على المستخدمين**
```typescript
interface OverallUserAnalytics {
  totalUsers: number;                    // إجمالي المستخدمين
  activeUsers: number;                   // المستخدمين النشطين
  newUsersThisMonth: number;             // المستخدمين الجدد هذا الشهر

  topSpenders: Array<{                  // أعلى العملاء إنفاقاً
    userId: string;
    totalSpent: number;
  }>;

  userGrowth: Array<{                   // نمو المستخدمين
    month: string;
    newUsers: number;
  }>;

  averageOrderValue: number;             // متوسط قيمة الطلب
  customerLifetimeValue: number;         // القيمة المتوقعة للعميل
}
```

#### 2. **تقرير شرائح العملاء**
```typescript
interface CustomerSegmentsReport {
  segments: {
    vip: number;                        // عدد عملاء VIP
    premium: number;                    // عدد عملاء Premium
    regular: number;                    // عدد عملاء Regular
    new: number;                        // عدد عملاء جدد
  };
  totalCustomers: number;               // إجمالي العملاء
  generatedAt: string;                  // تاريخ إنشاء التقرير
  recommendations: string[];             // توصيات لتحسين الشرائح
}
```

#### 3. **تقرير مخاطر فقدان العملاء**
```typescript
interface ChurnRiskAlert {
  alertType: 'churn_risk';
  customers: Array<{
    userId: string;
    userInfo: {
      phone: string;
      firstName?: string;
      lastName?: string;
    };
    churnRisk: 'low' | 'medium' | 'high';
    daysSinceLastOrder: number;
    totalSpent: number;
    recommendedActions: string[];
  }>;
  totalAtRisk: number;                  // إجمالي العملاء في خطر
  generatedAt: string;                  // تاريخ إنشاء التنبيه
}
```

## قسم واجهات برمجة التطبيقات

### APIs المتاحة والمفصلة

#### 1. **تحليل مستخدم واحد**
```http
GET /admin/user-analytics/user/{userId}

Response: UserDetailedStatsDto
```

#### 2. **ترتيب العملاء**
```http
GET /admin/user-analytics/rankings?limit=50

Response: CustomerRankingDto[]
```

#### 3. **الإحصائيات العامة**
```http
GET /admin/user-analytics/overview

Response: OverallUserAnalyticsDto
```

#### 4. **تقرير أفضل العملاء**
```http
GET /admin/user-analytics/reports/top-customers?period=month&metric=spending

Response: TopCustomersReport
```

#### 5. **تقرير شرائح العملاء**
```http
GET /admin/user-analytics/reports/customer-segments

Response: CustomerSegmentsReport
```

#### 6. **تنبيهات مخاطر فقدان العملاء**
```http
GET /admin/user-analytics/alerts/churn-risk

Response: ChurnRiskAlert
```

## قسم الأمان والحماية

### حماية شاملة لبيانات المستخدمين

#### 1. **حماية المصادقة**
- **JWT Authentication**: تشفير وحماية شاملة للجلسات
- **Role-based Access Control**: صلاحيات محددة لكل دور
- **Admin Guard**: حماية خاصة للـ APIs الإدارية

#### 2. **حماية البيانات**
- **Data Encryption**: تشفير البيانات الحساسة في قاعدة البيانات
- **GDPR Compliance**: الامتثال لقوانين حماية البيانات
- **Access Logging**: تسجيل جميع عمليات الوصول والتعديل
- **Data Validation**: التحقق من صحة جميع البيانات المدخلة

#### 3. **حماية الخصوصية**
- **PII Protection**: حماية المعلومات الشخصية المحددة
- **Data Minimization**: جمع الحد الأدنى من البيانات المطلوبة
- **Right to Access**: إمكانية تصدير وحذف البيانات
- **Consent Management**: إدارة موافقات المستخدمين

## قسم الأداء والتحسين

### تحسينات الأداء والسرعة

#### 1. **التخزين المؤقت الذكي**
```typescript
// استخدام Redis للتخزين المؤقت
const CACHE_TTL = {
  USER_STATS: 300,           // 5 دقائق لإحصائيات المستخدم
  RANKINGS: 600,             // 10 دقائق للترتيب
  OVERVIEW: 900,             // 15 دقيقة للنظرة العامة
  REPORTS: 1800              // 30 دقيقة للتقارير
};
```

#### 2. **فهارس قاعدة البيانات المحسنة**
```typescript
// فهارس محسّنة للأداء
UserSchema.index({ status: 1, createdAt: -1 });
UserSchema.index({ 'score.overallScore': -1 });
UserSchema.index({ phone: 1 }, { unique: true });
UserSchema.index({ createdAt: -1, status: 1 });
```

#### 3. **استعلامات محسّنة**
```typescript
// تجنب مشكلة N+1
const usersWithStats = await userModel.aggregate([
  {
    $lookup: {
      from: 'orders',
      let: { userId: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
        { $group: { _id: null, totalSpent: { $sum: '$totalAmount' } } }
      ],
      as: 'orderStats'
    }
  }
]);
```

## قسم التكامل والتطوير

### سهولة التكامل والتوسع

#### 1. **تكامل مع الأنظمة الأخرى**
```typescript
// تكامل مع نظام الطلبات
const getUserOrderStats = async (userId: string) => {
  return await orderModel.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalSpent: { $sum: '$totalAmount' }
      }
    }
  ]);
};

// تكامل مع نظام المفضلة
const getUserFavoriteStats = async (userId: string) => {
  return await favoriteModel.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$productCategory',
        count: { $sum: 1 }
      }
    }
  ]);
};
```

#### 2. **واجهات برمجة التطبيقات العامة**
```typescript
// APIs متاحة للمطورين
GET /api/users/{userId}/analytics      // إحصائيات مستخدم محدد
GET /api/users/analytics/rankings      // ترتيب العملاء
GET /api/users/analytics/overview      // نظرة عامة على المستخدمين
GET /api/users/analytics/reports/*     // التقارير المختلفة
GET /api/users/analytics/alerts/*      // التنبيهات والإشعارات
```

## قسم البيئات والاختبار

### دعم جميع البيئات

#### 1. **البيئة التطويرية**
- **التسجيل المفصل**: سجلات شاملة للتتبع والتشخيص
- **اختبار سهل**: إمكانية اختبار جميع السيناريوهات
- **مرونة في البيانات**: قبول بيانات اختبار متنوعة

#### 2. **البيئة الإنتاجية**
- **الأداء المحسن**: استعلامات محسّنة وفهارس فعالة
- **التخزين المؤقت**: تسريع الاستجابة مع Redis
- **المراقبة المستمرة**: تتبع الأداء والأخطاء في الوقت الفعلي

## الخلاصة

نظام إدارة وتحليل المستخدمين هذا يوفر **رؤية شاملة وعميقة** لبيانات وسلوك المستخدمين مع إمكانيات متقدمة للتحليل والتنبؤ.

### نقاط القوة:
- ✅ **تحليل شامل متعدد الأبعاد** لسلوك المستخدمين
- ✅ **نظام نقاط ذكي** يعكس الولاء والقيمة والنشاط
- ✅ **تصنيف ديناميكي للعملاء** حسب القيمة والسلوك
- ✅ **تنبؤات ذكية** لمخاطر فقدان العملاء واحتمالية الشراء
- ✅ **تقارير إدارية مفصلة** مع إحصائيات شاملة
- ✅ **حماية أمنية متقدمة** مع تشفير ورصد للتهديدات
- ✅ **قابلية التوسع** والتكامل مع أنظمة أخرى

### المميزات التقنية:
- 📊 **تحليل بيانات متقدم** مع MongoDB Aggregation Pipeline
- 🎯 **خوارزميات تقييم ذكية** متعددة الأبعاد
- 🔮 **نماذج تنبؤية** للسلوك والقيمة المستقبلية
- 📈 **تقارير تفاعلية** مع فلترة وترتيب ذكي
- 🔔 **تنبيهات فورية** للحالات الاستثنائية
- 🔒 **حماية شاملة** للبيانات والخصوصية
- ⚡ **أداء محسن** مع تخزين مؤقت وفهارس محسّنة
- 🔧 **مرونة في التخصيص** والتطوير المستقبلي

هذا النظام يضمن **فهم عميق وشامل** لعملاء منصة خدمات الطاقة الشمسية مع **أدوات قوية** للتحليل والتنبؤ تساعد في **اتخاذ قرارات استراتيجية مدروسة** و**تحسين تجربة العملاء**.

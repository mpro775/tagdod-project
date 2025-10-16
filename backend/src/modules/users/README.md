# نظام إدارة المستخدمين المتقدم

## نظرة عامة

نظام شامل لإدارة وتحليل بيانات المستخدمين يوفر رؤى عميقة حول سلوك العملاء وأدائهم في النظام.

## الميزات الرئيسية

### 1. تحليل تفصيلي للمستخدمين
- **معلومات أساسية**: بيانات المستخدم الأساسية وحالة الحساب
- **إحصائيات الطلبات**: تفاصيل كاملة عن طلبات العميل وأداءه الشرائي
- **المفضلة**: تحليل منتجات المفضلة والاهتمامات
- **خدمة العملاء**: تتبع تذاكر الدعم وأداء الخدمة

### 2. نظام النقاط والتقييم
- **نقاط الولاء**: بناءً على عدد الطلبات والتفاعل
- **نقاط القيمة**: حسب المبلغ المنفق
- **نقاط النشاط**: تفاعل المستخدم مع النظام
- **نقاط خدمة العملاء**: جودة الخدمة المقدمة
- **النقاط الإجمالية**: تقييم شامل للأداء

### 3. ترتيب العملاء
- ترتيب ديناميكي حسب القيمة والأداء
- تصنيف العملاء إلى شرائح (VIP, Premium, Regular, New)
- تتبع أفضل العملاء والمؤثرين

### 4. تحليل السلوك والتنبؤات
- **السلوك الشرائي**: أنماط الشراء وطرق الدفع المفضلة
- **التنبؤات**: مخاطر فقدان العميل واحتمالية الشراء القادم
- **التوصيات**: اقتراحات لتحسين العلاقة مع العميل

## API Endpoints

### تحليل المستخدمين

#### `GET /admin/user-analytics/user/:userId`
الحصول على تفاصيل وإحصائيات مستخدم واحد

```typescript
Response: UserDetailedStatsDto
{
  userId: string;
  userInfo: UserInfo;
  orders: OrderStats;
  favorites: FavoriteStats;
  support: SupportStats;
  score: UserScore;
  behavior: UserBehavior;
  predictions: UserPredictions;
}
```

#### `GET /admin/user-analytics/rankings?limit=50`
ترتيب العملاء حسب القيمة والأداء

```typescript
Response: CustomerRankingDto[]
[
  {
    userId: string;
    userInfo: { phone: string; firstName?: string; lastName?: string };
    totalSpent: number;
    totalOrders: number;
    rank: number;
    score: number;
  }
]
```

#### `GET /admin/user-analytics/overview`
الإحصائيات العامة للمستخدمين

```typescript
Response: OverallUserAnalyticsDto
{
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  topSpenders: Array<{ userId: string; totalSpent: number }>;
  userGrowth: Array<{ month: string; newUsers: number }>;
  averageOrderValue: number;
  customerLifetimeValue: number;
}
```

### التقارير المتقدمة

#### `GET /admin/user-analytics/reports/top-customers`
تقرير أفضل العملاء

```typescript
Query Parameters:
- period: string (all, month, quarter, year)
- metric: string (spending, orders, frequency)

Response: TopCustomersReport
```

#### `GET /admin/user-analytics/reports/customer-segments`
تقرير شرائح العملاء

```typescript
Response: CustomerSegmentsReport
{
  segments: {
    vip: number;
    premium: number;
    regular: number;
    new: number;
  };
  totalCustomers: number;
  generatedAt: string;
  recommendations: string[];
}
```

### التنبيهات

#### `GET /admin/user-analytics/alerts/churn-risk`
تنبيهات مخاطر فقدان العملاء

```typescript
Response: {
  alertType: 'churn_risk';
  customers: ChurnRiskAlert[];
  totalAtRisk: number;
  generatedAt: string;
}
```

## الخدمات (Services)

### UserAnalyticsService

خدمة رئيسية تتعامل مع جميع عمليات تحليل بيانات المستخدمين:

```typescript
class UserAnalyticsService {
  // الحصول على إحصائيات شاملة لمستخدم واحد
  async getUserDetailedStats(userId: string): Promise<UserStats>

  // الحصول على ترتيب العملاء حسب القيمة
  async getCustomerRankings(limit: number): Promise<CustomerRanking[]>

  // الحصول على إحصائيات عامة للمستخدمين
  async getOverallUserAnalytics(): Promise<OverallUserAnalytics>
}
```

## خوارزميات التقييم

### حساب نقاط الولاء
```typescript
loyaltyScore = Math.min(100, (totalOrders * 10) + (completedOrders * 15))
```

### حساب نقاط القيمة
```typescript
valueScore = Math.min(100, (totalSpent / 1000) * 10)
```

### حساب نقاط النشاط
```typescript
activityScore = Math.min(100, (totalOrders * 5) + (noSupportTickets ? 20 : 0))
```

### تحليل مخاطر فقدان العميل
```typescript
if (daysSinceLastOrder > 90) churnRisk = 'high'
else if (daysSinceLastOrder > 30) churnRisk = 'medium'
else churnRisk = 'low'
```

## الواجهة الأمامية (Frontend)

### المكونات الرئيسية

#### `UserAnalyticsPage`
الصفحة الرئيسية لعرض إحصائيات المستخدمين

#### `UserDetailsModal`
نافذة منبثقة لعرض تفاصيل مستخدم معين

#### `CustomerRankingTable`
جدول ترتيب العملاء مع إمكانية عرض التفاصيل

#### `UserStatsCard`
بطاقة عرض إحصائيات مع تصميم جذاب

### الـ Hooks المخصصة

#### `useUserAnalytics(userId)`
```typescript
const { userStats, loading, error, refetch } = useUserAnalytics(userId);
```

#### `useCustomerRankings(limit)`
```typescript
const { rankings, loading, error, refetch } = useCustomerRankings(50);
```

#### `useOverallAnalytics()`
```typescript
const { analytics, loading, error, refetch } = useOverallAnalytics();
```

## الاستخدام

### 1. إضافة إلى التطبيق الرئيسي

```typescript
// في app.module.ts
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // ... other modules
    UsersModule,
  ],
})
export class AppModule {}
```

### 2. استخدام في Controller

```typescript
import { UserAnalyticsService } from '../users/services/user-analytics.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly userAnalyticsService: UserAnalyticsService,
  ) {}

  @Get('user-stats/:userId')
  async getUserStats(@Param('userId') userId: string) {
    return this.userAnalyticsService.getUserDetailedStats(userId);
  }
}
```

### 3. استخدام في Frontend

```typescript
import { UserAnalyticsPage } from './features/users/pages/UserAnalyticsPage';

function App() {
  return (
    <div>
      <UserAnalyticsPage />
    </div>
  );
}
```

## الأمان والصلاحيات

- جميع الـ endpoints تتطلب صلاحيات Admin أو Super Admin
- استخدام JWT Authentication
- فحص الأدوار باستخدام RolesGuard

## الأداء والتحسين

- استخدام MongoDB Aggregation Pipeline للاستعلامات المعقدة
- فهرسة قاعدة البيانات للاستعلامات السريعة
- تجميع البيانات للتقارير الكبيرة
- تحسين الاستعلامات لتجنب N+1 Problem

## التطوير المستقبلي

### ميزات مخططة
- [ ] تحليل المشاعر من تقييمات العملاء
- [ ] تنبؤات الذكاء الاصطناعي للسلوك الشرائي
- [ ] توصيات منتجات مخصصة
- [ ] تحليل جغرافي للعملاء
- [ ] تكامل مع أنظمة CRM خارجية
- [ ] تقارير مخصصة قابلة للتخصيص
- [ ] تنبيهات ذكية للفرص المفقودة

### تحسينات الأداء
- [ ] Cache للبيانات المتكررة
- [ ] Background Jobs للتحليل الثقيل
- [ ] Real-time Updates للبيانات الحية
- [ ] Data Warehouse للتحليل المتقدم

## الدعم والمساهمة

للحصول على الدعم أو المساهمة في التطوير، يرجى:
1. إنشاء Issue في GitHub
2. تقديم Pull Request مع التغييرات
3. التأكد من اتباع معايير الكود المحددة
4. كتابة اختبارات للوظائف الجديدة

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.

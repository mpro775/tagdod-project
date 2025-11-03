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

## User Management APIs (إدارة المستخدمين)

### قائمة المستخدمين

```http
GET /admin/users?page=1&limit=20&status=active&role=user
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`: رقم الصفحة (افتراضي: 1)
- `limit`: عدد النتائج (افتراضي: 20)
- `status`: حالة المستخدم (active, suspended, pending, deleted)
- `role`: الدور (user, admin, super_admin, merchant, engineer)
- `search`: نص البحث (الاسم أو رقم الهاتف أو سبب الحذف إذا كان includeDeleted=true)
- `includeDeleted`: عرض الحسابات المحذوفة (افتراضي: false)

**Response:**
```json
{
  "data": [
    {
      "id": "user_123",
      "phone": "+966501234567",
      "firstName": "أحمد",
      "lastName": "محمد",
      "status": "active",
      "roles": ["user"],
      "createdAt": "2023-10-01T10:00:00Z",
      "lastLoginAt": "2024-01-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "totalPages": 63
  }
}
```

### تفاصيل مستخدم

```http
GET /admin/users/:id
Authorization: Bearer <admin_token>
```

### إنشاء أدمن جديد

```http
POST /admin/users/create-admin
Authorization: Bearer <super_admin_token>
```

```json
{
  "phone": "+966501234567",
  "firstName": "أحمد",
  "lastName": "الأدمن",
  "password": "secure_password_123",
  "roles": ["admin"],
  "permissions": ["users.read", "users.write"]
}
```

### إنشاء أدمن بدور محدد

```http
POST /admin/users/create-role-admin
Authorization: Bearer <super_admin_token>
```

```json
{
  "phone": "+966501234567",
  "firstName": "سارة",
  "lastName": "المدير",
  "password": "secure_password_123",
  "role": "admin"
}
```

### إنشاء مستخدم عادي

```http
POST /admin/users
Authorization: Bearer <admin_token>
```

```json
{
  "phone": "+966501234567",
  "firstName": "فاطمة",
  "lastName": "علي",
  "preferredCurrency": "SAR",
  "roles": ["user"]
}
```

### تحديث مستخدم

```http
PATCH /admin/users/:id
Authorization: Bearer <admin_token>
```

```json
{
  "firstName": "فاطمة",
  "lastName": "أحمد",
  "preferredCurrency": "USD",
  "status": "active"
}
```

### تعليق مستخدم

```http
POST /admin/users/:id/suspend
Authorization: Bearer <admin_token>
```

```json
{
  "reason": "انتهاك شروط الاستخدام",
  "duration": 30 // أيام (اختياري)
}
```

### تفعيل مستخدم

```http
POST /admin/users/:id/activate
Authorization: Bearer <admin_token>
```

### حذف مستخدم

```http
DELETE /admin/users/:id
Authorization: Bearer <admin_token>
```

**ملاحظة:** الحذف يكون Soft Delete ويمكن استعادة المستخدم لاحقاً.

### حذف الحساب من قبل المستخدم

```http
DELETE /auth/me
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "لا أستخدم التطبيق بعد الآن"
}
```

**Response:**
```json
{
  "deleted": true,
  "message": "تم حذف حسابك بنجاح"
}
```

**ملاحظات:**
- المستخدم يحذف حسابه بنفسه
- يجب إدخال السبب (reason) كحقل إلزامي (5-500 حرف)
- الحذف يكون Soft Delete (حالة DELETED + deletedAt + deletionReason)
- يتم حذف capabilities أيضاً

### الحسابات المحذوفة مع السبب

```http
GET /admin/users/deleted?page=1&limit=20&search=سبب
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`: رقم الصفحة (افتراضي: 1)
- `limit`: عدد النتائج (افتراضي: 20)
- `search`: نص البحث (الاسم، رقم الهاتف، أو سبب الحذف)
- `sortBy`: حقل الترتيب (افتراضي: deletedAt)
- `sortOrder`: اتجاه الترتيب (asc/desc، افتراضي: desc)

**Response:**
```json
{
  "deletedUsers": [
    {
      "id": "user_123",
      "phone": "+966501234567",
      "firstName": "أحمد",
      "lastName": "محمد",
      "deletionReason": "لا أستخدم التطبيق بعد الآن",
      "deletedAt": "2024-01-15T10:30:00Z",
      "deletedBy": "user_123",
      "createdAt": "2023-10-01T10:00:00Z",
      "status": "deleted"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**ملاحظات:**
- يعرض فقط الحسابات المحذوفة (Soft Delete)
- يظهر `deletionReason` (سبب الحذف) لكل حساب محذوف
- `deletedBy` يكون `null` إذا حذف المستخدم حسابه بنفسه
- يمكن البحث في سبب الحذف أيضاً
- الافتراضي الترتيب حسب تاريخ الحذف (الأحدث أولاً)

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

## ✅ حالة النظام

**نظام Users Module مكتمل بالكامل ويعمل كما هو موثق:**
- ✅ **User Analytics**: تحليل شامل لسلوك المستخدمين وإحصائياتهم
- ✅ **User Management**: إدارة كاملة للمستخدمين والأدمن
- ✅ **User Scoring**: نظام نقاط متقدم لتقييم العملاء
- ✅ **Customer Segmentation**: تصنيف العملاء وترتيبهم
- ✅ **Churn Risk Analysis**: تحليل مخاطر فقدان العملاء
- ✅ **Admin Controls**: تحكم شامل في المستخدمين والصلاحيات
- ✅ **Role-Based Access**: نظام أدوار وصلاحيات متدرج
- ✅ **Soft Delete**: إدارة آمنة لحذف المستخدمين
- ✅ جميع APIs مطبقة وتعمل (18 endpoint إجمالي)

**النظام جاهز للإنتاج ويوفر إدارة مستخدمين احترافية!**

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.

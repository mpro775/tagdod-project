# مخطط نظام إدارة المستخدمين المتقدم

## البنية العامة للنظام

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           نظام إدارة المستخدمين المتقدم                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (NestJS)      │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## البنية التفصيلية للـ Backend

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                Backend Architecture                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 Controllers                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐    ┌─────────────────────────┐                     │
│  │  UserAnalyticsController│    │  UsersAdminController   │                     │
│  │                         │    │                         │                     │
│  │  • getUserDetailedStats │    │  • listUsers            │                     │
│  │  • getCustomerRankings  │    │  • getUserById          │                     │
│  │  • getOverallAnalytics  │    │  • createUser           │                     │
│  │  • getTopCustomersReport│    │  • updateUser           │                     │
│  │  • getCustomerSegments  │    │  • deleteUser           │                     │
│  │  • getChurnRiskAlerts   │    │  • suspendUser          │                     │
│  └─────────────────────────┘    └─────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  Services                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐    ┌─────────────────────────┐                     │
│  │  UserAnalyticsService   │    │  UsersService           │                     │
│  │                         │    │                         │                     │
│  │  • getUserDetailedStats │    │  • CRUD Operations      │                     │
│  │  • getCustomerRankings  │    │  • User Management      │                     │
│  │  • getOverallAnalytics  │    │  • Permission Control   │                     │
│  │  • calculateUserScore   │    │  • Authentication       │                     │
│  │  • analyzeUserBehavior  │    │                         │                     │
│  │  • generatePredictions  │    │                         │                     │
│  └─────────────────────────┘    └─────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   Schemas                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │    User     │  │    Order    │  │  Favorite   │  │SupportTicket│           │
│  │             │  │             │  │             │  │             │           │
│  │ • phone     │  │ • userId    │  │ • userId    │  │ • userId    │           │
│  │ • firstName │  │ • status    │  │ • productId │  │ • status    │           │
│  │ • lastName  │  │ • items     │  │ • variantId │  │ • priority  │           │
│  │ • roles     │  │ • total     │  │ • note      │  │ • subject   │           │
│  │ • status    │  │ • currency  │  │ • tags      │  │ • messages  │           │
│  │ • createdAt │  │ • createdAt │  │ • createdAt │  │ • createdAt │           │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## البنية التفصيلية للـ Frontend

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                Frontend Architecture                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   Pages                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                          UserAnalyticsPage                                 │ │
│  │                                                                             │ │
│  │  • Overall Analytics Cards                                                 │ │
│  │  • Customer Rankings Table                                                 │ │
│  │  • Quick Stats Summary                                                     │ │
│  │  • User Details Modal                                                      │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 Components                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ UserStatsCard   │  │UserDetailsModal │  │CustomerRanking  │  │   Charts    │ │
│  │                 │  │                 │  │     Table       │  │             │ │
│  │ • title         │  │ • userInfo      │  │ • rankings      │  │ • Bar       │ │
│  │ • value         │  │ • orders        │  │ • userClick     │  │ • Line      │ │
│  │ • trend         │  │ • favorites     │  │ • loading       │  │ • Pie       │ │
│  │ • color         │  │ • support       │  │ • pagination    │  │ • Doughnut  │ │
│  │ • icon          │  │ • score         │  │                 │  │             │ │
│  │                 │  │ • behavior      │  │                 │  │             │ │
│  │                 │  │ • predictions   │  │                 │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    Hooks                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │useUserAnalytics │  │useCustomerRank  │  │useOverallAnalyt │                 │
│  │                 │  │    ings         │  │     ics         │                 │
│  │ • userStats     │  │ • rankings      │  │ • analytics     │                 │
│  │ • loading       │  │ • loading       │  │ • loading       │                 │
│  │ • error         │  │ • error         │  │ • error         │                 │
│  │ • refetch       │  │ • refetch       │  │ • refetch       │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    Types                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │ UserDetailedStats│  │CustomerRanking  │  │OverallAnalytics │                 │
│  │                 │  │                 │  │                 │                 │
│  │ • userInfo      │  │ • userId        │  │ • totalUsers    │                 │
│  │ • orders        │  │ • userInfo      │  │ • activeUsers   │                 │
│  │ • favorites     │  │ • totalSpent    │  │ • newUsers      │                 │
│  │ • support       │  │ • totalOrders   │  │ • topSpenders   │                 │
│  │ • score         │  │ • rank          │  │ • userGrowth    │                 │
│  │ • behavior      │  │ • score         │  │ • avgOrderValue │                 │
│  │ • predictions   │  │                 │  │ • lifetimeValue │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## تدفق البيانات (Data Flow)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                Data Flow                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

1. Frontend Request
   ┌─────────────┐
   │ User clicks │
   │ on user     │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ useUserAnal │
   │ ytics Hook  │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ HTTP Request│
   │ /admin/user │
   │ -analytics/ │
   └──────┬──────┘
          │
          ▼
2. Backend Processing
   ┌─────────────┐
   │ Controller  │
   │ receives    │
   │ request     │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Service     │
   │ processes   │
   │ business    │
   │ logic       │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Database    │
   │ queries     │
   │ & joins     │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Data        │
   │ aggregation │
   │ & analysis  │
   └──────┬──────┘
          │
          ▼
3. Response
   ┌─────────────┐
   │ Formatted   │
   │ response    │
   │ sent to     │
   │ frontend    │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Frontend    │
   │ updates     │
   │ UI with     │
   │ new data    │
   └─────────────┘
```

## خوارزميات التقييم والنقاط

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Scoring Algorithms                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                               Loyalty Score                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  loyaltyScore = Math.min(100, (totalOrders × 10) + (completedOrders × 15))     │
│                                                                                 │
│  Example:                                                                       │
│  • 5 total orders, 4 completed                                                  │
│  • Score = (5 × 10) + (4 × 15) = 50 + 60 = 110 → 100 (capped)                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                Value Score                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  valueScore = Math.min(100, (totalSpent ÷ 1000) × 10)                          │
│                                                                                 │
│  Example:                                                                       │
│  • Total spent: 5000 SAR                                                        │
│  • Score = (5000 ÷ 1000) × 10 = 5 × 10 = 50                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                               Activity Score                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  activityScore = Math.min(100, (totalOrders × 5) + (noSupportTickets ? 20 : 0))│
│                                                                                 │
│  Example:                                                                       │
│  • 8 orders, no support tickets                                                 │
│  • Score = (8 × 5) + 20 = 40 + 20 = 60                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                               Overall Score                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  overallScore = (loyaltyScore + valueScore + activityScore + supportScore) ÷ 4  │
│                                                                                 │
│  Example:                                                                       │
│  • Loyalty: 80, Value: 60, Activity: 70, Support: 90                           │
│  • Overall = (80 + 60 + 70 + 90) ÷ 4 = 300 ÷ 4 = 75                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## تحليل مخاطر فقدان العميل (Churn Risk Analysis)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Churn Risk Analysis                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                               Risk Categories                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  HIGH RISK:                                                                     │
│  • Days since last order > 90                                                   │
│  • No orders in last 3 months                                                   │
│  • Multiple support tickets                                                     │
│  • Declining order frequency                                                    │
│                                                                                 │
│  MEDIUM RISK:                                                                   │
│  • Days since last order: 30-90                                                 │
│  • Decreasing order value                                                       │
│  • Infrequent engagement                                                        │
│                                                                                 │
│  LOW RISK:                                                                      │
│  • Recent orders (within 30 days)                                               │
│  • Consistent purchasing pattern                                                │
│  • No support issues                                                            │
│  • High engagement                                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Predictive Factors                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. Time-based Factors:                                                         │
│     • Days since last order                                                     │
│     • Order frequency trend                                                     │
│     • Seasonal patterns                                                         │
│                                                                                 │
│  2. Value-based Factors:                                                        │
│     • Total lifetime value                                                      │
│     • Average order value                                                       │
│     • Spending trend                                                            │
│                                                                                 │
│  3. Engagement Factors:                                                         │
│     • Support ticket frequency                                                  │
│     • Favorites activity                                                        │
│     • Account activity                                                          │
│                                                                                 │
│  4. Behavioral Factors:                                                         │
│     • Payment method consistency                                                │
│     • Category preferences                                                      │
│     • Purchase patterns                                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## شرائح العملاء (Customer Segments)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             Customer Segments                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                               VIP Customers                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Criteria:                                                                      │
│  • Total spent ≥ 5,000 SAR                                                      │
│  • 10+ orders                                                                    │
│  • High loyalty score (≥ 80)                                                    │
│  • Low churn risk                                                                │
│                                                                                 │
│  Characteristics:                                                               │
│  • Premium service expectations                                                  │
│  • High lifetime value                                                          │
│  • Brand advocates                                                              │
│  • Referral potential                                                           │
│                                                                                 │
│  Actions:                                                                       │
│  • Dedicated account manager                                                     │
│  • Exclusive offers                                                              │
│  • Priority support                                                              │
│  • Early access to new products                                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Premium Customers                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Criteria:                                                                      │
│  • Total spent: 2,000 - 4,999 SAR                                              │
│  • 5-9 orders                                                                   │
│  • Good loyalty score (60-79)                                                   │
│  • Low-medium churn risk                                                        │
│                                                                                 │
│  Characteristics:                                                               │
│  • Regular purchasers                                                           │
│  • Price sensitive                                                              │
│  • Quality focused                                                              │
│                                                                                 │
│  Actions:                                                                       │
│  • Targeted promotions                                                          │
│  • Loyalty program benefits                                                     │
│  • Quality assurance                                                            │
│  • Upselling opportunities                                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Regular Customers                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Criteria:                                                                      │
│  • Total spent: 500 - 1,999 SAR                                                │
│  • 2-4 orders                                                                   │
│  • Average loyalty score (40-59)                                                │
│  • Medium churn risk                                                            │
│                                                                                 │
│  Characteristics:                                                               │
│  • Occasional buyers                                                            │
│  • Deal seekers                                                                 │
│  • Need engagement                                                              │
│                                                                                 │
│  Actions:                                                                       │
│  • Engagement campaigns                                                         │
│  • Discount offers                                                              │
│  • Product recommendations                                                      │
│  • Win-back campaigns                                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                               New Customers                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Criteria:                                                                      │
│  • Total spent < 500 SAR                                                        │
│  • 0-1 orders                                                                   │
│  • New account (< 90 days)                                                      │
│  • Unknown loyalty score                                                        │
│                                                                                 │
│  Characteristics:                                                               │
│  • First-time buyers                                                            │
│  • Need onboarding                                                              │
│  • High potential                                                               │
│  • Need nurturing                                                               │
│                                                                                 │
│  Actions:                                                                       │
│  • Welcome campaigns                                                            │
│  • Onboarding sequence                                                          │
│  • First purchase incentives                                                    │
│  • Education content                                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## API Security & Performance

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Security & Performance                               │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 Security                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Authentication:                                                                │
│  • JWT Bearer Token                                                             │
│  • Role-based access control (RBAC)                                            │
│  • Admin/Super Admin only endpoints                                            │
│                                                                                 │
│  Authorization:                                                                 │
│  • @UseGuards(JwtAuthGuard, RolesGuard)                                        │
│  • @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)                                │
│  • Permission-based data filtering                                              │
│                                                                                 │
│  Data Protection:                                                               │
│  • Input validation with class-validator                                       │
│  • Output sanitization                                                          │
│  • SQL injection prevention                                                     │
│  • Rate limiting                                                                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                Performance                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Database Optimization:                                                         │
│  • MongoDB aggregation pipelines                                                │
│  • Proper indexing strategy                                                     │
│  • Query optimization                                                           │
│  • Connection pooling                                                           │
│                                                                                 │
│  Caching Strategy:                                                              │
│  • Redis for frequently accessed data                                           │
│  • TTL-based cache invalidation                                                 │
│  • Background cache warming                                                     │
│                                                                                 │
│  API Optimization:                                                              │
│  • Pagination for large datasets                                                │
│  • Lazy loading for heavy operations                                            │
│  • Background processing for reports                                            │
│  • Response compression                                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Monitoring & Analytics

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Monitoring & Analytics                               │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Key Metrics                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  User Analytics:                                                                │
│  • Total users count                                                            │
│  • Active users (last 30 days)                                                 │
│  • New user registrations                                                       │
│  • User retention rate                                                          │
│                                                                                 │
│  Business Metrics:                                                              │
│  • Customer lifetime value (CLV)                                               │
│  • Average order value (AOV)                                                    │
│  • Order frequency                                                              │
│  • Revenue per user                                                             │
│                                                                                 │
│  Performance Metrics:                                                           │
│  • API response times                                                           │
│  • Database query performance                                                   │
│  • Cache hit rates                                                              │
│  • Error rates                                                                  │
│                                                                                 │
│  Engagement Metrics:                                                            │
│  • Feature usage rates                                                          │
│  • Support ticket volume                                                        │
│  • Favorites activity                                                           │
│  • User journey analysis                                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

هذا النظام يوفر رؤية شاملة ومتكاملة لإدارة المستخدمين مع تحليل عميق لسلوكهم وأدائهم، مما يساعد على اتخاذ قرارات مدروسة لتحسين تجربة العملاء وزيادة الإيرادات.

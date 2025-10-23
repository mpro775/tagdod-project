# نظام الدعم الفني - Support System

## نظرة عامة

نظام دعم فني متكامل ومتطابق 100% مع العمليات الإدارية في الباك إند، يوفر إدارة شاملة لتذاكر الدعم مع تتبع SLA والردود الجاهزة.

## الميزات الرئيسية

### ✅ إدارة التذاكر
- عرض جميع تذاكر الدعم مع فلترة متقدمة
- تفاصيل شاملة لكل تذكرة مع المحادثات
- تحديث حالة التذاكر والأولوية والفئة
- تتبع أوقات الاستجابة والحل

### ✅ تتبع SLA
- مراقبة التذاكر المتجاوزة لوقت الاستجابة المتفق عليه
- تنبيهات فورية للتذاكر العاجلة
- إحصائيات شاملة لأداء الدعم

### ✅ الردود الجاهزة
- مكتبة شاملة من الردود الجاهزة
- تصنيف حسب الفئة والوسوم
- اختصارات سريعة للوصول
- تتبع عدد مرات الاستخدام

### ✅ الإحصائيات والتقارير
- لوحة تحكم شاملة مع مؤشرات الأداء
- توزيع التذاكر حسب الفئة والأولوية
- متوسط أوقات الاستجابة والحل
- معدلات الامتثال لـ SLA

## البنية التقنية

### الملفات الرئيسية

```
support/
├── types/
│   └── support.types.ts          # أنواع البيانات المتطابقة مع الباك إند
├── api/
│   └── supportApi.ts             # API calls للعمليات الإدارية
├── hooks/
│   └── useSupport.ts             # React Query hooks
├── components/
│   ├── SupportTicketCard.tsx     # بطاقة عرض التذكرة
│   ├── SupportTicketFilters.tsx  # فلاتر البحث والتصفية
│   ├── SupportMessageBubble.tsx  # فقاعة الرسالة
│   ├── SupportStatsCards.tsx     # بطاقات الإحصائيات
│   ├── CannedResponseCard.tsx    # بطاقة الرد الجاهز
│   ├── SLAAlerter.tsx           # تنبيهات SLA
│   └── index.ts                 # تصدير المكونات
└── pages/
    ├── SupportTicketsListPage.tsx    # قائمة التذاكر
    ├── SupportTicketDetailsPage.tsx  # تفاصيل التذكرة
    ├── SupportStatsPage.tsx          # صفحة الإحصائيات
    └── CannedResponsesPage.tsx       # إدارة الردود الجاهزة
```

## API Endpoints المتطابقة

### إدارة التذاكر
- `GET /admin/support/tickets` - قائمة جميع التذاكر
- `GET /admin/support/tickets/:id` - تفاصيل تذكرة
- `PATCH /admin/support/tickets/:id` - تحديث التذكرة
- `GET /admin/support/tickets/:id/messages` - رسائل التذكرة
- `POST /admin/support/tickets/:id/messages` - إضافة رسالة

### إدارة SLA
- `GET /admin/support/sla/breached` - التذاكر المتجاوزة للـ SLA
- `POST /admin/support/sla/:id/check` - فحص حالة SLA

### الردود الجاهزة
- `GET /admin/support/canned-responses` - قائمة الردود الجاهزة
- `POST /admin/support/canned-responses` - إنشاء رد جاهز
- `PATCH /admin/support/canned-responses/:id` - تحديث رد جاهز
- `POST /admin/support/canned-responses/:id/use` - استخدام رد جاهز
- `GET /admin/support/canned-responses/shortcut/:shortcut` - البحث بالاختصار

### الإحصائيات
- `GET /admin/support/stats` - إحصائيات شاملة

## أنواع البيانات

### SupportTicket
```typescript
interface SupportTicket {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  assignedTo: string | null;
  attachments: string[];
  tags: string[];
  isArchived: boolean;
  
  // Timing
  firstResponseAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  
  // SLA
  slaHours: number;
  slaDueDate?: Date;
  slaBreached: boolean;
  
  // Rating
  rating?: number;
  feedback?: string;
  feedbackAt?: Date;
  
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

### SupportMessage
```typescript
interface SupportMessage {
  _id: string;
  ticketId: string;
  senderId: string;
  messageType: MessageType;
  content: string;
  attachments: string[];
  isInternal: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

### CannedResponse
```typescript
interface CannedResponse {
  _id: string;
  title: string;
  content: string;
  contentEn: string;
  category?: SupportCategory;
  tags: string[];
  isActive: boolean;
  usageCount: number;
  shortcut?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## المكونات الرئيسية

### SupportTicketCard
بطاقة عرض التذكرة مع:
- معلومات أساسية (العنوان، الفئة، الأولوية، الحالة)
- مؤشرات SLA والتقييمات
- إجراءات سريعة

### SupportTicketFilters
نظام فلترة متقدم مع:
- البحث النصي
- فلترة حسب الحالة والأولوية والفئة
- عرض الفلاتر النشطة

### SupportMessageBubble
عرض الرسائل مع:
- تمييز نوع الرسالة (عميل/دعم/نظام)
- دعم المرفقات
- تمييز الرسائل الداخلية

### SLAAlerter
تنبيهات SLA مع:
- عرض التذاكر المتجاوزة
- إحصائيات سريعة
- تصنيف حسب الأولوية

## الاستخدام

### عرض قائمة التذاكر
```typescript
import { SupportTicketsListPage } from '@/features/support/pages/SupportTicketsListPage';

// في التوجيه
<Route path="/support" element={<SupportTicketsListPage />} />
```

### عرض تفاصيل التذكرة
```typescript
import { SupportTicketDetailsPage } from '@/features/support/pages/SupportTicketDetailsPage';

// في التوجيه
<Route path="/support/:id" element={<SupportTicketDetailsPage />} />
```

### استخدام الـ Hooks
```typescript
import { 
  useSupportTickets, 
  useSupportStats, 
  useBreachedSLATickets 
} from '@/features/support/hooks/useSupport';

// في المكون
const { data: tickets, isLoading } = useSupportTickets({
  status: SupportStatus.OPEN,
  priority: SupportPriority.HIGH
});
```

## التصميم والواجهة

- **Material UI**: استخدام حصري لمكتبة MUI
- **تصميم متجاوب**: يعمل على جميع الأجهزة
- **ألوان متسقة**: نظام ألوان موحد مع التطبيق
- **تجربة مستخدم محسنة**: تحميل تدريجي، تنبيهات، معالجة أخطاء

## الأمان والصلاحيات

- جميع العمليات محمية بصلاحيات الإدارة
- التحقق من الهوية عبر JWT
- حماية من CSRF و XSS
- تسجيل العمليات الحساسة

## الأداء والتحسين

- **React Query**: إدارة حالة الخادم مع cache ذكي
- **Lazy Loading**: تحميل المكونات عند الحاجة
- **Pagination**: تقسيم البيانات لتحسين الأداء
- **Auto-refresh**: تحديث تلقائي للبيانات المهمة

## الدعم والصيانة

- كود TypeScript مع types صارمة
- معالجة شاملة للأخطاء
- رسائل خطأ واضحة للمستخدم
- تسجيل مفصل للأخطاء

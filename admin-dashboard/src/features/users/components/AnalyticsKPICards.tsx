import React from 'react';
import {
  AttachMoney,
  EmojiEvents,
  Groups,
  LocalActivity,
  PersonAddAlt1,
  ReceiptLong,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';
import type { OverallAnalytics } from '../hooks/useUserAnalytics';

interface AnalyticsKPICardsProps {
  analytics: OverallAnalytics | null;
  loading?: boolean;
  topCustomersCount?: number;
}

const formatNumber = (value: number) => value.toLocaleString('en-US');
const formatMoney = (value: number) =>
  value.toLocaleString('en-US', { maximumFractionDigits: 0 });

export const AnalyticsKPICards: React.FC<AnalyticsKPICardsProps> = ({
  analytics,
  loading = false,
  topCustomersCount,
}) => {
  const { t } = useTranslation(['users', 'common']);

  if (!analytics && !loading) return null;

  const kpis = [
    {
      title: t('users:analytics.kpi.totalUsers', 'إجمالي المستخدمين'),
      value: analytics ? formatNumber(analytics.totalUsers) : '-',
      icon: <Groups fontSize="small" />,
      tone: 'primary' as const,
    },
    {
      title: t('users:analytics.kpi.activeUsersLabel', 'النشطون'),
      value: analytics ? formatNumber(analytics.activeUsers) : '-',
      icon: <LocalActivity fontSize="small" />,
      tone: 'success' as const,
    },
    {
      title: t('users:analytics.kpi.newUsersThisMonth', 'الجدد هذا الشهر'),
      value: analytics ? formatNumber(analytics.newUsersThisMonth) : '-',
      icon: <PersonAddAlt1 fontSize="small" />,
      tone: 'info' as const,
    },
    {
      title: t('users:analytics.kpi.averageOrderShort', 'متوسط الطلب'),
      value: analytics ? formatMoney(analytics.averageOrderValue) : '-',
      unit: '$',
      icon: <ReceiptLong fontSize="small" />,
      tone: 'warning' as const,
    },
    {
      title: t('users:analytics.kpi.customerLifetimeValue', 'القيمة الدائمة للعميل'),
      value: analytics ? formatMoney(analytics.customerLifetimeValue) : '-',
      unit: '$',
      icon: <AttachMoney fontSize="small" />,
      tone: 'success' as const,
    },
    {
      title: t('users:analytics.kpi.topCustomers', 'أفضل العملاء'),
      value: analytics ? formatNumber(topCustomersCount ?? analytics.topSpenders.length) : '-',
      icon: <EmojiEvents fontSize="small" />,
      tone: 'secondary' as const,
    },
  ];

  return (
    <PageSummaryGrid columns={6} compact spacing={0.75}>
      {kpis.map((kpi) => (
        <StatCard
          key={kpi.title}
          compact
          loading={loading}
          title={kpi.title}
          value={kpi.value}
          unit={kpi.unit}
          icon={kpi.icon}
          tone={kpi.tone}
        />
      ))}
    </PageSummaryGrid>
  );
};

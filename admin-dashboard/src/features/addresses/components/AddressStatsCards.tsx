import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAddressStats } from '../hooks/useAddresses';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

export function AddressStatsCards() {
  const { t } = useTranslation('addresses');
  const { data: stats, isLoading } = useAddressStats();

  const cards = [
    {
      title: t('stats.totalAddresses', { defaultValue: 'عدد العناوين الكلي' }),
      value: stats?.totalAddresses || 0,
      icon: <LocationIcon fontSize="small" />,
      tone: 'primary' as const,
    },
    {
      title: t('stats.activeAddresses', { defaultValue: 'عدد العناوين النشطة' }),
      value: stats?.totalActiveAddresses || 0,
      icon: <ActiveIcon fontSize="small" />,
      tone: 'success' as const,
    },
    {
      title: t('stats.totalUsers', { defaultValue: 'عدد المستخدمين الكلي' }),
      value: stats?.totalUsers || 0,
      icon: <PeopleIcon fontSize="small" />,
      tone: 'info' as const,
    },
    {
      title: t('stats.averagePerUser', { defaultValue: 'متوسط العناوين لكل مستخدم' }),
      value: stats?.averagePerUser?.toFixed(1) || '0.0',
      icon: <TrendingIcon fontSize="small" />,
      tone: 'warning' as const,
    },
    {
      title: t('stats.deletedAddresses', { defaultValue: 'عدد العناوين المحذوفة' }),
      value: stats?.totalDeletedAddresses || 0,
      icon: <DeleteIcon fontSize="small" />,
      tone: 'error' as const,
    },
  ];

  return (
    <PageSummaryGrid columns={4}>
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={typeof card.value === 'number' ? card.value.toLocaleString('en-US') : card.value}
          icon={card.icon}
          tone={card.tone}
          loading={isLoading}
        />
      ))}
    </PageSummaryGrid>
  );
}
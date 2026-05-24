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
      title: t('stats.totalAddresses', 'إجمالي العناوين'),
      value: stats?.totalAddresses?.toLocaleString('en-US') || '0',
      icon: <LocationIcon fontSize="small" />,
      tone: 'primary' as const,
    },
    {
      title: t('stats.activeAddresses', 'النشطة'),
      value: stats?.totalActiveAddresses?.toLocaleString('en-US') || '0',
      icon: <ActiveIcon fontSize="small" />,
      tone: 'success' as const,
    },
    {
      title: t('stats.deletedAddresses', 'المحذوفة'),
      value: stats?.totalDeletedAddresses?.toLocaleString('en-US') || '0',
      icon: <DeleteIcon fontSize="small" />,
      tone: 'error' as const,
    },
    {
      title: t('stats.totalUsers', 'مستخدمون لديهم عناوين'),
      value: stats?.totalUsers?.toLocaleString('en-US') || '0',
      icon: <PeopleIcon fontSize="small" />,
      tone: 'info' as const,
    },
    {
      title: t('stats.averagePerUser', 'متوسط/مستخدم'),
      value: stats?.averagePerUser?.toFixed(1) || '0.0',
      icon: <TrendingIcon fontSize="small" />,
      tone: 'warning' as const,
    },
  ];

  return (
    <PageSummaryGrid columns={5} compact>
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          tone={card.tone}
          compact
          loading={isLoading}
        />
      ))}
    </PageSummaryGrid>
  );
}
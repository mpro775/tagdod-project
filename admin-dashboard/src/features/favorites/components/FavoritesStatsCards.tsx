import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupIcon from '@mui/icons-material/Group';
import SyncIcon from '@mui/icons-material/Sync';
import ArchiveIcon from '@mui/icons-material/Inventory';
import { useTranslation } from 'react-i18next';
import { useFavoritesStats } from '../hooks/useFavoritesAdmin';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

const formatNumber = (value: number | undefined) => (value ?? 0).toLocaleString('en-US');

export function FavoritesStatsCards() {
  const { data: stats, isLoading } = useFavoritesStats();
  const { t } = useTranslation('favorites');

  const cards = [
    {
      title: t('stats.total', 'إجمالي عناصر المفضلة'),
      value: formatNumber(stats?.total),
      icon: <FavoriteIcon fontSize="small" />,
      tone: 'error' as const,
    },
    {
      title: t('stats.totalUsers', 'مستخدمون لديهم مفضلة'),
      value: formatNumber(stats?.totalUsers),
      icon: <GroupIcon fontSize="small" />,
      tone: 'primary' as const,
    },
    {
      title: t('stats.totalSynced', 'سجلات مزامنة'),
      value: formatNumber(stats?.totalSynced),
      icon: <SyncIcon fontSize="small" />,
      tone: 'success' as const,
    },
    {
      title: t('stats.totalGuests', 'سجلات ضيوف'),
      value: formatNumber(stats?.totalGuests),
      icon: <ArchiveIcon fontSize="small" />,
      tone: 'warning' as const,
    },
  ];

  return (
    <PageSummaryGrid columns={4} compact>
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
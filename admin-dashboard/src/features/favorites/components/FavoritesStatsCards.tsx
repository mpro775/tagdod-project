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
      description: t('stats.totalDesc', 'مجموع جميع العناصر النشطة في قوائم المفضلة'),
    },
    {
      title: t('stats.totalUsers', 'مستخدمون لديهم مفضلة'),
      value: formatNumber(stats?.totalUsers),
      icon: <GroupIcon fontSize="small" />,
      tone: 'primary' as const,
      description: t('stats.totalUsersDesc', 'عدد الحسابات التي تحتوي على عنصر واحد على الأقل'),
    },
    {
      title: t('stats.totalSynced', 'عناصر تمت مزامنتها بنجاح'),
      value: formatNumber(stats?.totalSynced),
      icon: <SyncIcon fontSize="small" />,
      tone: 'success' as const,
      description: t('stats.totalSyncedDesc', 'عناصر تم نقلها من أجهزة سابقة إلى حسابات المستخدمين'),
    },
    {
      title: t('stats.totalGuests', 'سجلات قديمة غير مرتبطة'),
      value: formatNumber(stats?.totalGuests),
      icon: <ArchiveIcon fontSize="small" />,
      tone: 'warning' as const,
      description: t('stats.totalGuestsDesc', 'عناصر محفوظة مؤقتاً بانتظار المزامنة أو المراجعة'),
    },
  ];

  return (
    <PageSummaryGrid columns={4}>
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          tone={card.tone}
          description={card.description}
          loading={isLoading}
        />
      ))}
    </PageSummaryGrid>
  );
}
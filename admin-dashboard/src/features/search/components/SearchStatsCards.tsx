import {
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSearchStats } from '../hooks/useSearch';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

export function SearchStatsCards() {
  const { t } = useTranslation('search');
  const { data: stats, isLoading } = useSearchStats();

  const cards = [
    {
      title: t('stats.totalSearches'),
      value: (stats?.totalSearches || 0).toLocaleString('en-US'),
      icon: <SearchIcon fontSize="small" />,
      tone: 'primary' as const,
    },
    {
      title: t('stats.uniqueQueries'),
      value: (stats?.totalUniqueQueries || 0).toLocaleString('en-US'),
      icon: <TrendingIcon fontSize="small" />,
      tone: 'info' as const,
    },
    {
      title: t('stats.averageResponseTime'),
      value: `${stats?.averageResponseTime || 0} ms`,
      icon: <SpeedIcon fontSize="small" />,
      tone: 'success' as const,
    },
    {
      title: t('stats.zeroResultsPercentage'),
      value: `${stats?.zeroResultsPercentage?.toFixed(1) || 0}%`,
      icon: <ErrorIcon fontSize="small" />,
      tone: 'warning' as const,
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
          loading={isLoading}
        />
      ))}
    </PageSummaryGrid>
  );
}
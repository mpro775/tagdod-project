import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from '@mui/material';
import { Visibility, TrendingUp, Campaign, AdsClick } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBannersAnalytics } from '../hooks/useBanners';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

export const BannerStatsCards: React.FC = () => {
  const { t } = useTranslation('banners');
  const { data: analytics, isLoading, error } = useBannersAnalytics();

  if (error) {
    return <StatCard title={t('stats.totalBanners')} value="-" tone="error" />;
  }

  if (!analytics && !isLoading) {
    return null;
  }

  const {
    totalBanners = 0,
    activeBanners = 0,
    inactiveBanners = 0,
    totalViews = 0,
    totalClicks = 0,
    totalConversions = 0,
    averageCTR = 0,
    averageClickThroughRate = 0,
    averageConversionRate = 0,
  } = analytics || {};

  const activePercentage = totalBanners > 0 ? (activeBanners / totalBanners) * 100 : 0;
  const ctrPercentage = averageCTR || averageClickThroughRate || 0;
  const conversionPercentage = averageConversionRate || 0;

  const mainCards = [
    {
      title: t('stats.totalBanners'),
      value: isLoading ? '-' : totalBanners.toLocaleString(),
      icon: <Campaign fontSize="small" />,
      tone: 'primary' as const,
      description: t('stats.activeInactive', { active: activeBanners, inactive: inactiveBanners }),
    },
    {
      title: t('stats.totalViews'),
      value: isLoading ? '-' : totalViews.toLocaleString(),
      icon: <Visibility fontSize="small" />,
      tone: 'info' as const,
      description: t('stats.allBanners'),
    },
    {
      title: t('stats.totalClicks'),
      value: isLoading ? '-' : totalClicks.toLocaleString(),
      icon: <AdsClick fontSize="small" />,
      tone: 'success' as const,
      description: `CTR: ${ctrPercentage.toFixed(1)}%`,
    },
    {
      title: t('stats.totalConversions'),
      value: isLoading ? '-' : totalConversions.toLocaleString(),
      icon: <TrendingUp fontSize="small" />,
      tone: 'warning' as const,
      description: `${t('stats.conversionRateLabel', 'تحويل')}: ${conversionPercentage.toFixed(1)}%`,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      <PageSummaryGrid columns={4}>
        {mainCards.map((card) => (
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

      {!isLoading && analytics && (
        <PageSummaryGrid columns={2}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                {t('stats.statusChart')}
              </Typography>
              <Box mb={1.5}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">{t('stats.activeBanners')}</Typography>
                  <Typography variant="caption" color="text.secondary">{activePercentage.toFixed(1)}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={activePercentage}
                  color="success"
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="success.main">{activeBanners} {t('stats.active')}</Typography>
                <Typography variant="caption" color="text.secondary">{inactiveBanners} {t('stats.inactive')}</Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                {t('stats.performanceChart')}
              </Typography>
              <Box mb={1.5}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">{t('stats.clickRateLabel')}</Typography>
                  <Typography variant="caption" color="text.secondary">{ctrPercentage.toFixed(1)}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={ctrPercentage}
                  color="info"
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
              <Box mb={1.5}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">{t('stats.conversionRateLabel')}</Typography>
                  <Typography variant="caption" color="text.secondary">{conversionPercentage.toFixed(1)}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={conversionPercentage}
                  color="warning"
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            </CardContent>
          </Card>
        </PageSummaryGrid>
      )}
    </Box>
  );
};
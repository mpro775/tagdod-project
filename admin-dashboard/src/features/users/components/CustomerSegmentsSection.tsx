import React, { useMemo } from 'react';
import { alpha, Box, Stack, Typography, useTheme } from '@mui/material';
import { Campaign, Groups, TrendingUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { EmptyState, LoadingState, designRadius } from '@/shared/design-system';
import type { CustomerSegments } from '../hooks/useUserAnalytics';

type SegmentKey = 'vip' | 'premium' | 'regular' | 'new';
type SegmentFilter = SegmentKey | 'all' | 'nonEmpty';

interface CustomerSegmentsSectionProps {
  segments: CustomerSegments | null;
  loading?: boolean;
  searchValue?: string;
  segmentFilter?: SegmentFilter;
}

export const CustomerSegmentsSection: React.FC<CustomerSegmentsSectionProps> = ({
  segments,
  loading = false,
  searchValue = '',
  segmentFilter = 'all',
}) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();

  const segmentMeta = useMemo(
    () => ({
      vip: {
        label: t('users:analytics.segments.vip', 'عملاء VIP'),
        range: t('users:analytics.segments.range.vip', 'أكثر من 5,000 $'),
        color: theme.palette.error.main,
      },
      premium: {
        label: t('users:analytics.segments.premium', 'عملاء مميزون'),
        range: t('users:analytics.segments.range.premium', '2,000 - 5,000 $'),
        color: theme.palette.warning.main,
      },
      regular: {
        label: t('users:analytics.segments.regular', 'عملاء عاديون'),
        range: t('users:analytics.segments.range.regular', '500 - 2,000 $'),
        color: theme.palette.info.main,
      },
      new: {
        label: t('users:analytics.segments.new', 'عملاء جدد'),
        range: t('users:analytics.segments.range.new', 'أقل من 500 $'),
        color: theme.palette.success.main,
      },
    }),
    [t, theme.palette.error.main, theme.palette.info.main, theme.palette.success.main, theme.palette.warning.main]
  );

  if (loading && !segments) {
    return <LoadingState variant="skeleton" rows={4} title={t('common:loading', 'جاري التحميل...')} />;
  }

  if (!segments) {
    return (
      <EmptyState
        title={t('users:analytics.segments.emptyTitle', 'لا توجد شرائح عملاء')}
        description={t(
          'users:analytics.segments.emptyDescription',
          'سيظهر التوزيع عند توفر بيانات كافية عن إنفاق العملاء.'
        )}
        icon={<Groups />}
      />
    );
  }

  const totalCustomers = Math.max(segments.totalCustomers ?? 0, 0);
  const search = searchValue.trim().toLowerCase();
  const cards = (Object.keys(segmentMeta) as SegmentKey[])
    .map((key) => {
      const count = segments.segments[key] ?? 0;
      const percentage = totalCustomers > 0 ? (count / totalCustomers) * 100 : 0;

      return {
        key,
        count,
        percentage,
        ...segmentMeta[key],
      };
    })
    .filter((segment) => {
      const matchesSearch =
        !search ||
        segment.key.includes(search) ||
        segment.label.toLowerCase().includes(search) ||
        segment.range.toLowerCase().includes(search);
      const matchesFilter =
        segmentFilter === 'all' ||
        (segmentFilter === 'nonEmpty' && segment.count > 0) ||
        segmentFilter === segment.key;

      return matchesSearch && matchesFilter;
    });

  const apiRecommendations = segments.recommendations ?? [];
  const recommendations =
    apiRecommendations.length > 0
      ? apiRecommendations
      : [
          t('users:analytics.recommendations.premiumUpgrade', 'فرصة ترقية عملاء Premium بعرض ولاء موجّه.'),
          t('users:analytics.recommendations.inactiveCampaign', 'حملة استعادة للعملاء ذوي النشاط المنخفض.'),
        ];

  return (
    <Stack spacing={1.25}>
      <Box
        sx={{
          p: 1.25,
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.14 : 0.9),
          borderRadius: `${designRadius.md}px`,
          bgcolor: alpha(theme.palette.background.paper, 0.72),
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {t('users:analytics.segments.distribution', 'توزيع الشرائح')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('users:analytics.segments.totalCustomers', '{{count}} عميل', {
                count: totalCustomers,
              })}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              height: 10,
              overflow: 'hidden',
              borderRadius: 999,
              bgcolor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.05 : 0.16),
            }}
          >
            {(Object.keys(segmentMeta) as SegmentKey[]).map((key) => {
              const count = segments.segments[key] ?? 0;
              const width = totalCustomers > 0 ? (count / totalCustomers) * 100 : 0;

              return (
                <Box
                  key={key}
                  title={segmentMeta[key].label}
                  sx={{
                    width: `${width}%`,
                    minWidth: width > 0 ? 4 : 0,
                    bgcolor: segmentMeta[key].color,
                  }}
                />
              );
            })}
          </Box>
        </Stack>
      </Box>

      {cards.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 1,
          }}
        >
          {cards.map((segment) => (
            <Box
              key={segment.key}
              sx={{
                p: 1.25,
                border: '1px solid',
                borderColor: alpha(segment.color, 0.22),
                borderRadius: `${designRadius.md}px`,
                bgcolor: alpha(segment.color, theme.palette.mode === 'dark' ? 0.1 : 0.07),
                minHeight: 98,
              }}
            >
              <Stack spacing={0.75}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }} noWrap>
                  {segment.label}
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={0.75}>
                  <Typography sx={{ fontSize: 24, fontWeight: 800, color: segment.color }}>
                    {segment.count.toLocaleString('en-US')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {segment.percentage.toFixed(1)}%
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {t('users:analytics.segments.spendRange', 'نطاق الإنفاق')}: {segment.range}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>
      ) : (
        <EmptyState
          title={t('users:analytics.segments.noMatches', 'لا توجد شرائح مطابقة')}
          description={t('users:analytics.segments.adjustFilters', 'جرّب تغيير البحث أو الفلاتر الحالية.')}
          icon={<Groups />}
        />
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 1,
        }}
      >
        {recommendations.slice(0, 4).map((recommendation, index) => (
          <Box
            key={`${recommendation}-${index}`}
            sx={{
              p: 1.25,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.18),
              borderRadius: `${designRadius.md}px`,
              bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.05),
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  display: 'grid',
                  flexShrink: 0,
                  placeItems: 'center',
                  borderRadius: `${designRadius.sm}px`,
                  color: index % 2 === 0 ? 'primary.main' : 'success.main',
                  bgcolor: alpha(index % 2 === 0 ? theme.palette.primary.main : theme.palette.success.main, 0.12),
                }}
              >
                {index % 2 === 0 ? <TrendingUp fontSize="small" /> : <Campaign fontSize="small" />}
              </Box>
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {t('users:analytics.recommendations.action', 'توصية قابلة للتنفيذ')}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  {recommendation}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Box>

      {segments.generatedAt && (
        <Typography variant="caption" color="text.secondary">
          {t('users:analytics.generatedAt', 'تم التوليد')}: {new Date(segments.generatedAt).toLocaleString('ar-SA')}
        </Typography>
      )}
    </Stack>
  );
};

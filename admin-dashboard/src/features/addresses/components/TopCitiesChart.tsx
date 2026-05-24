import { Typography, Box, Skeleton, Stack, LinearProgress, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useTopCities } from '../hooks/useAddresses';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { SectionCard } from '@/shared/design-system';

const COLORS = ['#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'];

export function TopCitiesChart() {
  const { t } = useTranslation('addresses');
  const breakpoint = useBreakpoint();
  const theme = useTheme();
  const { data: citiesResponse, isLoading } = useTopCities(10);
  const cities = Array.isArray(citiesResponse)
    ? citiesResponse
    : Array.isArray((citiesResponse as any)?.data)
    ? (citiesResponse as any).data
    : [];

  if (isLoading) {
    return (
      <SectionCard title={t('chart.title', 'أكثر المدن')}>
        <Stack spacing={1.5}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" height={24} sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      </SectionCard>
    );
  }

  if (!cities || cities.length === 0) {
    return (
      <SectionCard title={t('chart.title', 'أكثر المدن')}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary" variant="body2">
            {t('chart.noData', 'لا يوجد بيانات')}
          </Typography>
        </Box>
      </SectionCard>
    );
  }

  const maxCount = Math.max(...cities.map((c: any) => c.count || 0), 1);

  return (
    <SectionCard title={t('chart.title', 'أكثر المدن مستخدمة للعناوين')}>
      <Stack spacing={1}>
        {cities.slice(0, 8).map((city: any, index: number) => (
          <Stack key={city.city || index} direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: COLORS[index % COLORS.length],
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" sx={{ minWidth: 80, flexShrink: 0 }} noWrap>
              {city.city}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(city.count / maxCount) * 100}
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: COLORS[index % COLORS.length],
                },
              }}
            />
            <Typography variant="caption" fontWeight="bold" sx={{ minWidth: 30, textAlign: 'center' }}>
              {city.count}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
              {city.percentage}%
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Box sx={{ mt: 2, height: breakpoint.isMobile ? 220 : 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={cities.slice(0, 6)}
            margin={{ top: 5, right: 10, left: 0, bottom: breakpoint.isMobile ? 60 : 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="city"
              angle={breakpoint.isMobile ? -45 : -30}
              textAnchor="end"
              height={breakpoint.isMobile ? 80 : 60}
              style={{ fontSize: breakpoint.isMobile ? '10px' : '11px' }}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis tick={{ fill: theme.palette.text.secondary }} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                fontSize: '0.8rem',
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {cities.slice(0, 6).map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </SectionCard>
  );
}
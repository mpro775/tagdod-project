import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useTopCities } from '../hooks/useAddresses';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

const COLORS = ['#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'];

export function TopCitiesChart() {
  const { t } = useTranslation('addresses');
  const breakpoint = useBreakpoint();
  const { data: citiesResponse, isLoading } = useTopCities(10);
  const cities = Array.isArray(citiesResponse)
    ? citiesResponse
    : Array.isArray((citiesResponse as any)?.data)
    ? (citiesResponse as any).data
    : [];

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('chart.title', { defaultValue: 'أكثر المدن مستخدمة للعناوين' })}
          </Typography>
          <Skeleton variant="rectangular" height={breakpoint.isMobile ? 300 : 400} />
        </CardContent>
      </Card>
    );
  }

  if (!cities || cities.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('chart.title', { defaultValue: 'أكثر المدن مستخدمة للعناوين' })}
          </Typography>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">{t('chart.noData', { defaultValue: 'لا يوجد بيانات' })}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {t('chart.title', { defaultValue: 'أكثر المدن مستخدمة للعناوين' })}
        </Typography>

        <ResponsiveContainer width="100%" height={breakpoint.isMobile ? 300 : 400}>
          <BarChart
            data={cities}
            margin={{
              top: breakpoint.isMobile ? 10 : 20,
              right: breakpoint.isMobile ? 10 : 30,
              left: breakpoint.isMobile ? 0 : 20,
              bottom: breakpoint.isMobile ? 80 : 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="city"
              angle={breakpoint.isMobile ? -60 : -45}
              textAnchor="end"
              height={breakpoint.isMobile ? 120 : 100}
              style={{ fontSize: breakpoint.isMobile ? '10px' : '12px' }}
            />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <Box
                      sx={{
                        bgcolor: 'background.paper',
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        boxShadow: 2,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {data.city}
                      </Typography>
                      <Typography variant="body2">
                        {t('chart.tooltip.addresses', { defaultValue: 'عدد العناوين', count: data.count })}
                      </Typography>
                      <Typography variant="body2">
                        {t('chart.tooltip.percentage', { defaultValue: 'النسبة المئوية', percentage: data.percentage })}
                      </Typography>
                      <Typography variant="body2">
                        {t('chart.tooltip.usage', { defaultValue: 'الاستخدام', usage: data.totalUsage })}
                      </Typography>
                    </Box>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#3f51b5">
              {cities.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <Box sx={{ mt: 3 }}>
          {cities.slice(0, 5).map((city: any, index: number) => (
            <Box
              key={city.city}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: COLORS[index],
                  }}
                />
                <Typography variant="body2">{city.city}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {city.count === 1
                    ? t('chart.legend.address', { defaultValue: 'عنوان', count: city.count })
                    : t('chart.legend.addresses', { defaultValue: 'عناوين', count: city.count })
                  }
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {city.percentage}%
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}


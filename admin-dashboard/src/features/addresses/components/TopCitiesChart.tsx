import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useTopCities } from '../hooks/useAddresses';

const COLORS = ['#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'];

export function TopCitiesChart() {
  const { t } = useTranslation();
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
            {t('addresses.chart.title', { defaultValue: 'أكثر المدن مستخدمة للعناوين' })}
          </Typography>
          <Skeleton variant="rectangular" height={400} />
        </CardContent>
      </Card>
    );
  }

  if (!cities || cities.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('addresses.chart.title', { defaultValue: 'أكثر المدن مستخدمة للعناوين' })}
          </Typography>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">{t('addresses.chart.noData', { defaultValue: 'لا يوجد بيانات' })}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          {t('addresses.chart.title', { defaultValue: 'أكثر المدن مستخدمة للعناوين' })}
        </Typography>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={cities} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="city"
              angle={-45}
              textAnchor="end"
              height={100}
              style={{ fontSize: '12px' }}
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
                        {t('addresses.chart.tooltip.addresses', { defaultValue: 'عدد العناوين', count: data.count })}
                      </Typography>
                      <Typography variant="body2">
                        {t('addresses.chart.tooltip.percentage', { defaultValue: 'النسبة المئوية', percentage: data.percentage })}
                      </Typography>
                      <Typography variant="body2">
                        {t('addresses.chart.tooltip.usage', { defaultValue: 'الاستخدام', usage: data.totalUsage })}
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
                    ? t('addresses.chart.legend.address', { defaultValue: 'عنوان', count: city.count })
                    : t('addresses.chart.legend.addresses', { defaultValue: 'عناوين',   count: city.count })
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


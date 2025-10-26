import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTopCities } from '../hooks/useAddresses';

const COLORS = ['#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'];

export function TopCitiesChart() {
  const { data: cities, isLoading } = useTopCities(10);

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            المدن الأكثر استخداماً
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
            المدن الأكثر استخداماً
          </Typography>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">لا توجد بيانات</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          🏙️ المدن الأكثر استخداماً
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
                        العناوين: {data.count}
                      </Typography>
                      <Typography variant="body2">
                        النسبة: {data.percentage}%
                      </Typography>
                      <Typography variant="body2">
                        الاستخدام: {data.totalUsage}
                      </Typography>
                    </Box>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#3f51b5">
              {cities.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <Box sx={{ mt: 3 }}>
          {cities.slice(0, 5).map((city, index) => (
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
                  {city.count} عنوان
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


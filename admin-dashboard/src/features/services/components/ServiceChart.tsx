import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Stack,
  Avatar,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Timeline,
  AttachMoney,
  Engineering,
  RequestQuote,
  Star,
} from '@mui/icons-material';

interface ServiceChartProps {
  title: string;
  data: any;
  type: 'line' | 'bar' | 'pie' | 'progress' | 'stats';
  loading?: boolean;
  height?: number;
  color?: string;
}

export const ServiceChart: React.FC<ServiceChartProps> = ({
  title,
  data,
  type,
  loading = false,
  height = 300,
  color = 'primary',
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Skeleton variant="rectangular" height={height} />
        </CardContent>
      </Card>
    );
  }

  const renderProgressChart = () => (
    <Box>
      {data.map((item: any, index: number) => (
        <Box key={index} mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight="medium">
              {item.label}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {item.value}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={item.value}
            color={item.color || 'primary'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      ))}
    </Box>
  );

  const renderStatsChart = () => (
    <Grid container spacing={2}>
      {data.map((item: any, index: number) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    {item.label}
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1 }}>
                    {item.value}
                  </Typography>
                  {item.change && (
                    <Box display="flex" alignItems="center" mt={1}>
                      {item.change > 0 ? (
                        <TrendingUp color="success" fontSize="small" />
                      ) : (
                        <TrendingDown color="error" fontSize="small" />
                      )}
                      <Typography
                        variant="body2"
                        color={item.change > 0 ? 'success.main' : 'error.main'}
                        ml={0.5}
                        fontWeight="medium"
                      >
                        {Math.abs(item.change)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: item.color || 'primary.main',
                    width: 56,
                    height: 56,
                    boxShadow: 2,
                  }}
                >
                  {item.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderTimelineChart = () => (
    <Box>
      {data.map((item: any, index: number) => (
        <Box key={index} mb={3}>
          <Box display="flex" alignItems="center" mb={1}>
            <Avatar sx={{ mr: 2, bgcolor: item.color || 'primary.main', width: 40, height: 40 }}>
              {item.icon}
            </Avatar>
            <Box flex={1}>
              <Typography variant="body1" fontWeight="medium">
                {item.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {item.description}
              </Typography>
            </Box>
            <Chip
              label={item.status}
              color={item.statusColor || 'default'}
              size="small"
            />
          </Box>
          <Box display="flex" alignItems="center" ml={6}>
            <Typography variant="caption" color="textSecondary">
              {item.date}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderPieChart = () => (
    <Box>
      <Grid container spacing={2}>
        {data.map((item: any, index: number) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: item.color || 'primary.main',
                  borderRadius: '50%',
                  mr: 2,
                }}
              />
              <Box flex={1}>
                <Typography variant="body2" fontWeight="medium">
                  {item.label}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {item.value} ({item.percentage}%)
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderLineChart = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.50',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'grey.300',
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <Assessment sx={{ fontSize: 48, color: 'text.secondary' }} />
          <Typography variant="body2" color="textSecondary">
            مخطط خطي - يتطلب مكتبة charts
          </Typography>
        </Stack>
      </Box>
    </Box>
  );

  const renderBarChart = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.50',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'grey.300',
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <Timeline sx={{ fontSize: 48, color: 'text.secondary' }} />
          <Typography variant="body2" color="textSecondary">
            مخطط أعمدة - يتطلب مكتبة charts
          </Typography>
        </Stack>
      </Box>
    </Box>
  );

  const renderChart = () => {
    switch (type) {
      case 'progress':
        return renderProgressChart();
      case 'stats':
        return renderStatsChart();
      case 'timeline':
        return renderTimelineChart();
      case 'pie':
        return renderPieChart();
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Chip
            label={type}
            color={color as any}
            size="small"
            variant="outlined"
          />
        </Box>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

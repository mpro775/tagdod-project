import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';

interface AnalyticsSkeletonProps {
  variant?: 'dashboard' | 'chart' | 'table' | 'card';
  count?: number;
}

export const AnalyticsSkeleton: React.FC<AnalyticsSkeletonProps> = ({
  variant = 'dashboard',
  count = 1,
}) => {
  const theme = useTheme();

  const renderDashboardSkeleton = () => (
    <Box>
      {/* Header Skeleton */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      </Box>

      {/* KPIs Skeleton */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={32} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="50%" height={16} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Skeleton */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={300} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={300} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderChartSkeleton = () => (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </CardContent>
    </Card>
  );

  const renderTableSkeleton = () => (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" height={40} />
        </Box>
        {[...Array(5)].map((_, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Skeleton variant="rectangular" height={60} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  const renderCardSkeleton = () => (
    <Grid container spacing={2}>
      {[...Array(count)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={32} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="50%" height={16} sx={{ mt: 1 }} />
              <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'dashboard':
        return renderDashboardSkeleton();
      case 'chart':
        return renderChartSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'card':
        return renderCardSkeleton();
      default:
        return renderDashboardSkeleton();
    }
  };

  return (
    <Box>
      {[...Array(count)].map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          {renderSkeleton()}
        </Box>
      ))}
    </Box>
  );
};

// Specialized skeleton components
export const DashboardSkeleton: React.FC = () => (
  <AnalyticsSkeleton variant="dashboard" />
);

export const ChartSkeleton: React.FC = () => (
  <AnalyticsSkeleton variant="chart" />
);

export const TableSkeleton: React.FC = () => (
  <AnalyticsSkeleton variant="table" />
);

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <AnalyticsSkeleton variant="card" count={count} />
);

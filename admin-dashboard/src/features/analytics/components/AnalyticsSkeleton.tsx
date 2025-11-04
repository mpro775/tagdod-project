import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Grid,
} from '@mui/material';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

interface AnalyticsSkeletonProps {
  variant?: 'dashboard' | 'chart' | 'table' | 'card';
  count?: number;
}

export const AnalyticsSkeleton: React.FC<AnalyticsSkeletonProps> = ({
  variant = 'dashboard',
  count = 1,
}) => {
  const { isMobile } = useBreakpoint();

  const renderDashboardSkeleton = () => (
    <Box>
      {/* Header Skeleton */}
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <Skeleton 
          variant="rectangular" 
          height={isMobile ? 100 : 120} 
          sx={{ borderRadius: 2 }} 
        />
      </Box>

      {/* KPIs Skeleton */}
      <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: isMobile ? 2 : 3 }}>
        {[...Array(6)].map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
            <Card>
              <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                <Skeleton 
                  variant="text" 
                  width="60%" 
                  height={isMobile ? 20 : 24} 
                />
                <Skeleton 
                  variant="text" 
                  width="40%" 
                  height={isMobile ? 28 : 32} 
                  sx={{ mt: 1 }} 
                />
                <Skeleton 
                  variant="text" 
                  width="50%" 
                  height={isMobile ? 14 : 16} 
                  sx={{ mt: 1 }} 
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Skeleton */}
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Skeleton 
                variant="text" 
                width="30%" 
                height={isMobile ? 20 : 24} 
                sx={{ mb: 2 }} 
              />
              <Skeleton variant="rectangular" height={isMobile ? 250 : 300} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Skeleton 
                variant="text" 
                width="40%" 
                height={isMobile ? 20 : 24} 
                sx={{ mb: 2 }} 
              />
              <Skeleton variant="rectangular" height={isMobile ? 250 : 300} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderChartSkeleton = () => (
    <Card>
      <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
        <Skeleton 
          variant="text" 
          width="40%" 
          height={isMobile ? 20 : 24} 
          sx={{ mb: 2 }} 
        />
        <Skeleton variant="rectangular" height={isMobile ? 250 : 300} />
      </CardContent>
    </Card>
  );

  const renderTableSkeleton = () => (
    <Card>
      <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
        <Skeleton 
          variant="text" 
          width="30%" 
          height={isMobile ? 20 : 24} 
          sx={{ mb: 2 }} 
        />
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" height={isMobile ? 35 : 40} />
        </Box>
        {[...Array(5)].map((_, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Skeleton variant="rectangular" height={isMobile ? 50 : 60} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  const renderCardSkeleton = () => (
    <Grid container spacing={isMobile ? 1.5 : 2}>
      {[...Array(count)].map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Skeleton 
                variant="text" 
                width="60%" 
                height={isMobile ? 20 : 24} 
              />
              <Skeleton 
                variant="text" 
                width="40%" 
                height={isMobile ? 28 : 32} 
                sx={{ mt: 1 }} 
              />
              <Skeleton 
                variant="text" 
                width="50%" 
                height={isMobile ? 14 : 16} 
                sx={{ mt: 1 }} 
              />
              <Skeleton 
                variant="rectangular" 
                height={isMobile ? 80 : 100} 
                sx={{ mt: 2 }} 
              />
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

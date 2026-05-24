import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Skeleton,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import { Star } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Product {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  trend: number | null;
}

interface CompactTopProductsProps {
  products?: any;
  isLoading?: boolean;
}

function calculateTrend(product: any): number | null {
  if (product.growthRate !== undefined && product.growthRate !== null) return product.growthRate;
  if (product.trend !== undefined && product.trend !== null) return product.trend;
  return null;
}

export const CompactTopProducts: React.FC<CompactTopProductsProps> = ({
  products,
  isLoading = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('dashboard');
  const currencyFormatter = React.useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    [],
  );

  if (isLoading) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.08),
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
            {t('topProducts.title', 'أفضل المنتجات مبيعاً')}
          </Typography>
          <Stack spacing={1.5}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={72} />
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const topProductsData = products?.topProducts || products?.productsByRevenue || [];
  const displayProducts: Product[] = topProductsData.length > 0
    ? topProductsData.slice(0, 5).map((p: any, index: number) => ({
        id: p.productId || p._id || `prod-${index}`,
        name: p.productName || p.name || t('topProducts.unknown', 'منتج'),
        sales: p.totalSold || p.unitsSold || p.sales || 0,
        revenue: p.totalRevenue || p.revenue || 0,
        trend: calculateTrend(p),
      }))
    : [];

  if (displayProducts.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.08),
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 2 }}>
            <Star sx={{ fontSize: 18, color: 'warning.main' }} />
            <Typography variant="subtitle1" fontWeight={800}>
              {t('topProducts.title', 'أفضل المنتجات مبيعاً')}
            </Typography>
          </Stack>
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('topProducts.empty', 'لا توجد بيانات متاحة')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const maxSales = Math.max(...displayProducts.map((p) => p.sales), 1);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.08),
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.5 }}>
          <Star sx={{ fontSize: 18, color: 'warning.main' }} />
          <Typography variant="subtitle1" fontWeight={800}>
            {t('topProducts.title', 'أفضل المنتجات مبيعاً')}
          </Typography>
        </Stack>

        <Stack spacing={1.25}>
          {displayProducts.map((product, index) => {
            const progressValue = (product.sales / maxSales) * 100;

            return (
              <Box
                key={product.id}
                sx={{
                  py: 1,
                  px: 1.25,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  transition: 'background .2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '50%',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#fff',
                      background:
                        index === 0
                          ? `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`
                          : index === 1
                            ? `linear-gradient(135deg, ${theme.palette.grey[500]}, ${theme.palette.grey[700]})`
                            : index === 2
                              ? `linear-gradient(135deg, ${theme.palette.error.light}, ${theme.palette.error.main})`
                              : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      flexShrink: 0,
                    }}
                  >
                    #{index + 1}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1, minWidth: 0 }}>
                        {product.name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t('topProducts.sales', '{{count}} مبيعة', { count: product.sales })}
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="success.main">
                          {currencyFormatter.format(product.revenue)}
                        </Typography>
                        {product.trend !== null && product.trend !== undefined && (
                          <Chip
                            label={`${product.trend > 0 ? '+' : ''}${product.trend}%`}
                            size="small"
                            color={product.trend >= 0 ? 'success' : 'error'}
                            sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }}
                          />
                        )}
                        {product.trend === null && (
                          <Chip
                            label={t('compact.stable', 'مستقر')}
                            size="small"
                            sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha(theme.palette.text.secondary, 0.08), color: 'text.secondary' }}
                          />
                        )}
                      </Stack>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={progressValue}
                      sx={{
                        height: 5,
                        borderRadius: 3,
                        mt: 0.75,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        },
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};
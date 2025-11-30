import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  TextField,
  Breadcrumbs,
  Link,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  TrendingUp,
  Inventory,
  Star,
  NewReleases,
  Refresh,
  Download,
  Home,
  ChevronRight,
  DateRange,
  Clear,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  useProductStats,
  useInventorySummary,
} from '../hooks/useProducts';

export const ProductsAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['products', 'common']);
  const { isMobile } = useBreakpoint();

  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useProductStats();
  const { data: inventorySummary, isLoading: loadingInventory } = useInventorySummary();

  const clearDateRange = () => {
    setDateRange({ start: '', end: '' });
  };

  const hasDateRange = dateRange.start || dateRange.end;

  const handleRefresh = () => {
    refetchStats();
  };

  const handleExportData = () => {
    alert(t('products:stats.exportSoon', 'ميزة التصدير ستكون متاحة قريباً'));
  };

  if (loadingStats) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<ChevronRight fontSize="small" />} 
        sx={{ mb: 2 }}
        aria-label="breadcrumb"
      >
        <Link
          color="inherit"
          href="/products"
          onClick={(e) => {
            e.preventDefault();
            navigate('/products');
          }}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          {t('products:list.title', 'المنتجات')}
        </Link>
        <Typography color="text.primary">
          {t('products:stats.title', 'إحصائيات المنتجات')}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box
          display="flex"
          flexDirection={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'stretch' : 'center'}
          gap={2}
          mb={2}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
          >
            {t('products:stats.backToProducts', 'العودة للمنتجات')}
          </Button>
          <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" sx={{ flex: 1 }}>
            {t('products:stats.title', 'إحصائيات المنتجات')}
          </Typography>
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={1}
            sx={{ width: isMobile ? '100%' : 'auto', ml: isMobile ? 0 : 'auto' }}
          >
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              fullWidth={isMobile}
              size={isMobile ? 'small' : 'medium'}
            >
              {t('common:actions.refresh', 'تحديث')}
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExportData}
              fullWidth={isMobile}
              size={isMobile ? 'small' : 'medium'}
            >
              {t('products:stats.export', 'تصدير البيانات')}
            </Button>
          </Stack>
        </Box>

        {/* Date Range Picker */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <DateRange sx={{ color: 'text.secondary' }} />
          <TextField
            label={t('products:stats.dateFrom', 'من تاريخ')}
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 180 } }}
          />
          <TextField
            label={t('products:stats.dateTo', 'إلى تاريخ')}
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 180 } }}
          />
          {hasDateRange && (
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={clearDateRange}
              size="small"
            >
              {t('common:actions.clear', 'مسح')}
            </Button>
          )}
        </Box>
      </Card>

      {/* Loading Indicator */}
      {loadingStats && (
        <LinearProgress sx={{ mb: 2 }} />
      )}

      {/* Overview Cards - 2 cards per row on mobile */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} flexDirection={isMobile ? 'column' : 'row'}>
                <Inventory color="primary" sx={{ fontSize: isMobile ? 32 : 40 }} />
                <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
                  <Typography variant={isMobile ? 'h5' : 'h4'} component="div">
                    {stats?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('products:stats.total', 'إجمالي المنتجات')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} flexDirection={isMobile ? 'column' : 'row'}>
                <TrendingUp color="success" sx={{ fontSize: isMobile ? 32 : 40 }} />
                <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
                  <Typography variant={isMobile ? 'h5' : 'h4'} component="div">
                    {stats?.active || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('products:stats.active', 'منتجات نشطة')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} flexDirection={isMobile ? 'column' : 'row'}>
                <Star color="warning" sx={{ fontSize: isMobile ? 32 : 40 }} />
                <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
                  <Typography variant={isMobile ? 'h5' : 'h4'} component="div">
                    {stats?.featured || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('products:stats.featured', 'منتجات مميزة')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} flexDirection={isMobile ? 'column' : 'row'}>
                <NewReleases color="info" sx={{ fontSize: isMobile ? 32 : 40 }} />
                <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
                  <Typography variant={isMobile ? 'h5' : 'h4'} component="div">
                    {stats?.new || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('products:stats.new', 'منتجات جديدة')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                {t('products:stats.byStatus', 'توزيع المنتجات حسب الحالة')}
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Typography variant="body1">{t('products:status.active', 'نشط')}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">{stats?.active || 0}</Typography>
                    <Chip label={t('products:status.active', 'نشط')} color="success" size="small" />
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Typography variant="body1">{t('products:status.draft', 'مسودة')}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">{stats?.draft || 0}</Typography>
                    <Chip label={t('products:status.draft', 'مسودة')} color="default" size="small" />
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Typography variant="body1">{t('products:status.archived', 'مؤرشف')}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">{stats?.archived || 0}</Typography>
                    <Chip label={t('products:status.archived', 'مؤرشف')} color="warning" size="small" />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                {t('products:stats.inventoryStats', 'إحصائيات المخزون')}
              </Typography>
              {loadingInventory ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Typography variant="body1">{t('products:stats.totalVariants', 'إجمالي المتغيرات')}</Typography>
                    <Typography variant="h6">{inventorySummary?.totalVariants || 0}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Typography variant="body1">{t('products:stats.inStock', 'متوفر في المخزون')}</Typography>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography variant="h6">{inventorySummary?.inStock || 0}</Typography>
                      {typeof inventorySummary?.inStockUnits === 'number' && (
                      <Chip label={`${inventorySummary?.inStockUnits} ${t('products:stats.unit', 'وحدة')}`} color="success" size="small" variant="outlined" />
                      )}
                      <Chip label={t('products:stats.available', 'متوفر')} color="success" size="small" />
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Typography variant="body1">{t('products:stats.lowStock', 'مخزون منخفض')}</Typography>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography variant="h6">{inventorySummary?.lowStock || 0}</Typography>
                      {typeof inventorySummary?.lowStockUnits === 'number' && (
                      <Chip label={`${inventorySummary?.lowStockUnits} ${t('products:stats.unit', 'وحدة')}`} color="warning" size="small" variant="outlined" />
                      )}
                      <Chip label={t('products:stats.low', 'منخفض')} color="warning" size="small" />
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Typography variant="body1">{t('products:stats.outOfStock', 'نفذ من المخزون')}</Typography>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography variant="h6">{inventorySummary?.outOfStock || 0}</Typography>
                      {typeof inventorySummary?.outOfStockUnits === 'number' && (
                      <Chip label={`${inventorySummary?.outOfStockUnits} ${t('products:stats.unit', 'وحدة')}`} color="error" size="small" variant="outlined" />
                      )}
                      <Chip label={t('products:stats.soldOut', 'نفذ')} color="error" size="small" />
                    </Box>
                  </Box>
                  {inventorySummary?.totalValue && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                      <Typography variant="body1">{t('products:stats.totalInventoryValue', 'إجمالي قيمة المخزون')}</Typography>
                      <Typography variant="h6" color="primary">
                        {inventorySummary.totalValue.toLocaleString()} $
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Variants per Product (if provided) */}
      {inventorySummary?.variantsPerProduct && inventorySummary.variantsPerProduct.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
              {t('products:stats.variantsPerProduct', 'إحصائيات المتغيرات لكل منتج')}
            </Typography>
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table size={isMobile ? 'small' : 'medium'}>
                <TableHead
                  sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? theme.palette.grey[800]
                        : theme.palette.grey[100],
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:stats.product', 'المنتج')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:stats.variantsCount', 'عدد المتغيرات')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:stats.totalUnits', 'إجمالي الوحدات')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventorySummary.variantsPerProduct.map((row) => (
                    <TableRow key={row.productId} hover>
                      <TableCell>{row.productName || row.productId}</TableCell>
                      <TableCell>
                        <Chip label={row.variantsCount} color="primary" size="small" />
                      </TableCell>
                      <TableCell>
                        {typeof row.totalUnits === 'number' ? (
                          <Chip label={row.totalUnits} color="success" size="small" variant="outlined" />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

    </Box>
  );
};

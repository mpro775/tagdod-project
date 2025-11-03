import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  TrendingUp,
  Inventory,
  Star,
  NewReleases,
  Refresh,
  Download,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  useProductStats,
  useInventorySummary,
  useLowStockVariants,
  useOutOfStockVariants,
} from '../hooks/useProducts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export const ProductsAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation(['products', 'common']);
  const { isMobile } = useBreakpoint();

  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useProductStats();
  const { data: inventorySummary, isLoading: loadingInventory } = useInventorySummary();
  const { data: lowStockVariantsResponse } = useLowStockVariants();
  const { data: outOfStockVariantsResponse } = useOutOfStockVariants();

  const lowStockVariants = Array.isArray(lowStockVariantsResponse)
    ? lowStockVariantsResponse
    : Array.isArray((lowStockVariantsResponse as any)?.data)
    ? (lowStockVariantsResponse as any).data
    : [];

  const outOfStockVariants = Array.isArray(outOfStockVariantsResponse)
    ? outOfStockVariantsResponse
    : Array.isArray((outOfStockVariantsResponse as any)?.data)
    ? (outOfStockVariantsResponse as any).data
    : [];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
      {/* Header */}
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'stretch' : 'center'}
        gap={2}
        mb={3}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          fullWidth={isMobile}
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
          >
            {t('common:actions.refresh', 'تحديث')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExportData}
            fullWidth={isMobile}
          >
            {t('products:stats.export', 'تصدير البيانات')}
          </Button>
        </Stack>
      </Box>

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

      {/* Detailed Analytics Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            allowScrollButtonsMobile
          >
            <Tab label={`${t('products:stats.lowStock', 'مخزون منخفض')} (${lowStockVariants.length})`} />
            <Tab label={`${t('products:stats.outOfStock', 'نفذ من المخزون')} (${outOfStockVariants.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {lowStockVariants && lowStockVariants.length > 0 ? (
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
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:variants.form.sku', 'SKU')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:stats.product', 'المنتج')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:stats.currentStock', 'المخزون الحالي')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:stats.minimumStock', 'الحد الأدنى')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:stats.price', 'السعر')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:stats.actions', 'الإجراءات')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockVariants.map((variant: any) => (
                    <TableRow key={variant.variantId || variant._id} hover>
                      <TableCell>{variant.variantName || variant.sku || '-'}</TableCell>
                      <TableCell>{variant.productName || variant.productId}</TableCell>
                      <TableCell>
                        <Chip
                          label={variant.currentStock ?? variant.stock ?? 0}
                          color={(variant.currentStock ?? variant.stock ?? 0) === 0 ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{variant.minStock ?? '-'}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Tooltip title={t('products:stats.viewDetails', 'عرض التفاصيل')}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/products/${variant.productId}`)}
                          >
                            <Inventory fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="success">{t('products:stats.noLowStock', 'لا توجد منتجات بمخزون منخفض حالياً')}</Alert>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {outOfStockVariants && outOfStockVariants.length > 0 ? (
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
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:variants.form.sku', 'SKU')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:stats.product', 'المنتج')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:stats.currentStock', 'المخزون')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:stats.minimumStock', 'الحد الأدنى')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:stats.price', 'السعر')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t('products:stats.actions', 'الإجراءات')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outOfStockVariants.map((variant: any) => (
                    <TableRow key={variant.variantId || variant._id} hover>
                      <TableCell>{variant.variantName || variant.sku || '-'}</TableCell>
                      <TableCell>{variant.productName || variant.productId}</TableCell>
                      <TableCell>
                        <Chip label="0" color="error" size="small" />
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Tooltip title={t('products:stats.viewDetails', 'عرض التفاصيل')}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/products/${variant.productId}`)}
                          >
                            <Inventory fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="success">{t('products:stats.allInStock', 'جميع المنتجات متوفرة في المخزون')}</Alert>
          )}
        </TabPanel>
      </Card>
    </Box>
  );
};

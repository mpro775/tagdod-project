import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Inventory, Warning, TrendingDown, TrendingUp, Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  useInventorySummary,
  useLowStockVariants,
  useOutOfStockVariants,
} from '../hooks/useProducts';
import type { Variant } from '../types/product.types';

interface InventoryDashboardProps {
  onVariantClick?: (variant: Variant) => void;
}

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
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ onVariantClick }) => {
  const { t } = useTranslation(['products', 'common']);
  const [activeTab, setActiveTab] = useState(0);
  const [lowStockThreshold] = useState(10);

  const {
    data: summary,
    isLoading: loadingSummary,
    refetch: refetchSummary,
  } = useInventorySummary();
  const {
    data: lowStockVariants,
    isLoading: loadingLowStock,
    refetch: refetchLowStock,
  } = useLowStockVariants(lowStockThreshold);
  const {
    data: outOfStockVariants,
    isLoading: loadingOutOfStock,
    refetch: refetchOutOfStock,
  } = useOutOfStockVariants();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    refetchSummary();
    refetchLowStock();
    refetchOutOfStock();
  };

  if (loadingSummary) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.25rem', sm: '2.125rem' } }}>
          {t('products:inventory.title', 'لوحة إدارة المخزون')}
        </Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          {t('common:actions.refresh', 'تحديث')}
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box display="flex" alignItems="center" gap={1.5} flexDirection={{ xs: 'column', sm: 'row' }}>
                <Inventory color="primary" sx={{ fontSize: { xs: 28, sm: 40 } }} />
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
                  <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    {summary?.totalVariants || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {t('products:inventory.totalVariants', 'إجمالي المتغيرات')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box display="flex" alignItems="center" gap={1.5} flexDirection={{ xs: 'column', sm: 'row' }}>
                <TrendingUp color="success" sx={{ fontSize: { xs: 28, sm: 40 } }} />
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
                  <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    {summary?.inStock || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {t('products:inventory.inStock', 'متوفر في المخزون')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box display="flex" alignItems="center" gap={1.5} flexDirection={{ xs: 'column', sm: 'row' }}>
                <Warning color="warning" sx={{ fontSize: { xs: 28, sm: 40 } }} />
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
                  <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    {summary?.lowStock || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {t('products:inventory.lowStock', 'مخزون منخفض')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box display="flex" alignItems="center" gap={1.5} flexDirection={{ xs: 'column', sm: 'row' }}>
                <TrendingDown color="error" sx={{ fontSize: { xs: 28, sm: 40 } }} />
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
                  <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    {summary?.outOfStock || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {t('products:inventory.outOfStock', 'نفذ من المخزون')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Total Value Card */}
      {summary?.totalValue && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Typography variant="h6">{t('products:inventory.totalValue', 'إجمالي قيمة المخزون:')}</Typography>
              <Chip
                label={`${summary.totalValue.toLocaleString()} $`}
                color="primary"
                size="medium"
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label={`${t('products:inventory.lowStockVariants', 'مخزون منخفض')} (${lowStockVariants?.length || 0})`} />
            <Tab label={`${t('products:inventory.outOfStockVariants', 'نفذ من المخزون')} (${outOfStockVariants?.length || 0})`} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {loadingLowStock ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : lowStockVariants && lowStockVariants.length > 0 ? (
            <Grid container spacing={2}>
              {lowStockVariants.map((item) => (
                <Grid size={{ xs: 6, sm: 6, md: 4 }} key={item.variantId}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                        <Typography variant="h6" sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' }, overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                          {item.variantName || item.sku || item.variantId}
                        </Typography>
                        <Chip label={t('products:inventory.lowStock', 'مخزون منخفض')} color="warning" size="small" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {t('products:inventory.product', 'المنتج')}: {item.productName || item.productId}
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap" mb={1.5}>
                        <Chip label={`${t('products:inventory.available', 'المتاح')}: ${item.currentStock}`} size="small" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }} />
                        <Chip label={`${t('products:inventory.minimum', 'الحد الأدنى')}: ${item.minStock}`} size="small" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }} />
                        <Chip label={`${t('products:inventory.shortage', 'النقص')}: ${item.difference}`} color="warning" size="small" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }} />
                      </Box>
                      <Box mt="auto" display="flex" gap={1} flexWrap="wrap">
                        <Button variant="outlined" size="small" onClick={() => onVariantClick && onVariantClick({ _id: item.variantId } as any)} sx={{ width: { xs: '100%', sm: 'auto' }, fontSize: { xs: '0.7rem', sm: '0.875rem' }, py: { xs: 0.5, sm: 1 } }}>{t('products:inventory.viewVariant', 'عرض المتغير')}</Button>
                        <Button variant="text" size="small" onClick={() => window.open(`/products/${item.productId}`, '_blank')} sx={{ width: { xs: '100%', sm: 'auto' }, fontSize: { xs: '0.7rem', sm: '0.875rem' }, py: { xs: 0.5, sm: 1 } }}>{t('products:inventory.viewProduct', 'عرض المنتج')}</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="success">{t('products:inventory.noLowStock', 'لا توجد منتجات بمخزون منخفض حالياً')}</Alert>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {loadingOutOfStock ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : outOfStockVariants && outOfStockVariants.length > 0 ? (
            <Grid container spacing={2}>
              {outOfStockVariants.map((item) => (
                <Grid size={{ xs: 6, sm: 6, md: 4 }} key={item.variantId}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                        <Typography variant="h6" sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' }, overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                          {item.variantName || item.sku || item.variantId}
                        </Typography>
                        <Chip label={t('products:inventory.outOfStock', 'نفذ من المخزون')} color="error" size="small" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {t('products:inventory.product', 'المنتج')}: {item.productName || item.productId}
                      </Typography>
                      <Box mt="auto" display="flex" gap={1} flexWrap="wrap">
                        <Button variant="outlined" size="small" onClick={() => onVariantClick && onVariantClick({ _id: item.variantId } as any)} sx={{ width: { xs: '100%', sm: 'auto' }, fontSize: { xs: '0.7rem', sm: '0.875rem' }, py: { xs: 0.5, sm: 1 } }}>{t('products:inventory.viewVariant', 'عرض المتغير')}</Button>
                        <Button variant="text" size="small" onClick={() => window.open(`/products/${item.productId}`, '_blank')} sx={{ width: { xs: '100%', sm: 'auto' }, fontSize: { xs: '0.7rem', sm: '0.875rem' }, py: { xs: 0.5, sm: 1 } }}>{t('products:inventory.viewProduct', 'عرض المنتج')}</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="success">{t('products:inventory.allProductsInStock', 'جميع المنتجات متوفرة في المخزون')}</Alert>
          )}
        </TabPanel>
      </Card>
    </Box>
  );
};

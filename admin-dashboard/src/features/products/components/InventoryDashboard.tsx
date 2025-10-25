import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Inventory, Warning, TrendingDown, TrendingUp, Refresh } from '@mui/icons-material';
import {
  useInventorySummary,
  useLowStockVariants,
  useOutOfStockVariants,
} from '../hooks/useProducts';
import { VariantCard } from './VariantCard';
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          لوحة إدارة المخزون
        </Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>
          تحديث
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Inventory color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {summary?.totalVariants || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المتغيرات
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {summary?.inStock || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    متوفر في المخزون
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Warning color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {summary?.lowStock || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    مخزون منخفض
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingDown color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {summary?.outOfStock || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    نفذ من المخزون
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
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6">إجمالي قيمة المخزون:</Typography>
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
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label={`مخزون منخفض (${lowStockVariants?.length || 0})`} />
            <Tab label={`نفذ من المخزون (${outOfStockVariants?.length || 0})`} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {loadingLowStock ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : lowStockVariants && lowStockVariants.length > 0 ? (
            <Grid container spacing={3}>
              {lowStockVariants.map((variant) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={variant._id}>
                  <VariantCard variant={variant} onView={onVariantClick} showActions={false} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="success">لا توجد منتجات بمخزون منخفض حالياً</Alert>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {loadingOutOfStock ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : outOfStockVariants && outOfStockVariants.length > 0 ? (
            <Grid container spacing={3}>
              {outOfStockVariants.map((variant) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={variant._id}>
                  <VariantCard variant={variant} onView={onVariantClick} showActions={false} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="success">جميع المنتجات متوفرة في المخزون</Alert>
          )}
        </TabPanel>
      </Card>
    </Box>
  );
};

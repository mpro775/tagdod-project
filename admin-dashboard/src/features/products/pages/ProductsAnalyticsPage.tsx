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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ProductsAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useProductStats();
  const { data: inventorySummary, isLoading: loadingInventory } = useInventorySummary();
  const { data: lowStockVariants } = useLowStockVariants();
  const { data: outOfStockVariants } = useOutOfStockVariants();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    refetchStats();
  };

  const handleExportData = () => {
    // This would implement data export functionality
    alert('ميزة التصدير ستكون متاحة قريباً');
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
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/products')}>
          العودة للمنتجات
        </Button>
        <Typography variant="h4" component="h1">
          إحصائيات المنتجات
        </Typography>
        <Box ml="auto" display="flex" gap={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>
            تحديث
          </Button>
          <Button variant="contained" startIcon={<Download />} onClick={handleExportData}>
            تصدير البيانات
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Inventory color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المنتجات
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
                    {stats?.active || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    منتجات نشطة
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
                <Star color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.featured || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    منتجات مميزة
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
                <NewReleases color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.new || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    منتجات جديدة
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
              <Typography variant="h6" gutterBottom>
                توزيع المنتجات حسب الحالة
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">نشط</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">{stats?.active || 0}</Typography>
                    <Chip label="نشط" color="success" size="small" />
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">مسودة</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">{stats?.draft || 0}</Typography>
                    <Chip label="مسودة" color="default" size="small" />
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">مؤرشف</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">{stats?.archived || 0}</Typography>
                    <Chip label="مؤرشف" color="warning" size="small" />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                إحصائيات المخزون
              </Typography>
              {loadingInventory ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">إجمالي المتغيرات</Typography>
                    <Typography variant="h6">{inventorySummary?.totalVariants || 0}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">متوفر في المخزون</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">{inventorySummary?.inStock || 0}</Typography>
                      <Chip label="متوفر" color="success" size="small" />
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">مخزون منخفض</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">{inventorySummary?.lowStock || 0}</Typography>
                      <Chip label="منخفض" color="warning" size="small" />
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">نفذ من المخزون</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">{inventorySummary?.outOfStock || 0}</Typography>
                      <Chip label="نفذ" color="error" size="small" />
                    </Box>
                  </Box>
                  {inventorySummary?.totalValue && (
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1">إجمالي قيمة المخزون</Typography>
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

      {/* Detailed Analytics Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label={`مخزون منخفض (${lowStockVariants?.length || 0})`} />
            <Tab label={`نفذ من المخزون (${outOfStockVariants?.length || 0})`} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {lowStockVariants && lowStockVariants.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead
                  sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? theme.palette.grey[800]
                        : theme.palette.grey[100],
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>المنتج</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>المخزون الحالي</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>الحد الأدنى</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>السعر</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockVariants.map((variant) => (
                    <TableRow key={variant._id}>
                      <TableCell>{variant.sku || '-'}</TableCell>
                      <TableCell>منتج {variant.productId}</TableCell>
                      <TableCell>
                        <Chip
                          label={variant.stock}
                          color={variant.stock === 0 ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{variant.minStock}</TableCell>
                      <TableCell>{variant.price} $</TableCell>
                      <TableCell>
                        <Tooltip title="عرض التفاصيل">
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
            <Alert severity="success">لا توجد منتجات بمخزون منخفض حالياً</Alert>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {outOfStockVariants && outOfStockVariants.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead
                  sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? theme.palette.grey[800]
                        : theme.palette.grey[100],
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>المنتج</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>المخزون</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>الحد الأدنى</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>السعر</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outOfStockVariants.map((variant) => (
                    <TableRow key={variant._id}>
                      <TableCell>{variant.sku || '-'}</TableCell>
                      <TableCell>منتج {variant.productId}</TableCell>
                      <TableCell>
                        <Chip label={variant.stock} color="error" size="small" />
                      </TableCell>
                      <TableCell>{variant.minStock}</TableCell>
                      <TableCell>{variant.price} $</TableCell>
                      <TableCell>
                        <Tooltip title="عرض التفاصيل">
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
            <Alert severity="success">جميع المنتجات متوفرة في المخزون</Alert>
          )}
        </TabPanel>
      </Card>
    </Box>
  );
};

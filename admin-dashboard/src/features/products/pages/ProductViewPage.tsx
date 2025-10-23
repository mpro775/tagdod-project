import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Inventory,
  AttachMoney,
  Visibility,
  Star,
  NewReleases,
  Archive,
  Unarchive,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useProductVariants } from '../hooks/useProducts';
import { formatDate } from '@/shared/utils/formatters';
import { VariantCard } from '../components/VariantCard';
import { StockManager } from '../components/StockManager';
import { PricingManager } from '../components/PricingManager';
import type { Variant } from '../types/product.types';

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
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ProductViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const { data: product, isLoading: loadingProduct } = useProduct(id!);
  const { data: variants, isLoading: loadingVariants } = useProductVariants(id!);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleVariantClick = (variant: Variant) => {
    setSelectedVariant(variant);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'default';
      case 'archived':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'draft':
        return 'مسودة';
      case 'archived':
        return 'مؤرشف';
      default:
        return status;
    }
  };

  if (loadingProduct) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box>
        <Alert severity="error">
          المنتج غير موجود أو تم حذفه
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
        >
          العودة للمنتجات
        </Button>
        <Typography variant="h4" component="h1">
          عرض المنتج
        </Typography>
        <Box ml="auto" display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/products/${id}/edit`)}
          >
            تعديل
          </Button>
          <Button
            variant="outlined"
            startIcon={<Inventory />}
            onClick={() => navigate(`/products/${id}/variants`)}
          >
            إدارة المتغيرات
          </Button>
        </Box>
      </Box>

      {/* Product Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Product Image */}
            <Grid item xs={12} md={4}>
              <Box
                component="img"
                src={product.mainImageId || '/placeholder-product.png'}
                alt={product.name}
                sx={{
                  width: '100%',
                  height: 300,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            </Grid>

            {/* Product Details */}
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {product.nameEn}
              </Typography>

              {/* Status and Badges */}
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={getStatusLabel(product.status)}
                  color={getStatusColor(product.status) as any}
                  variant="outlined"
                />
                {product.isFeatured && (
                  <Chip
                    label="مميز"
                    color="warning"
                    icon={<Star />}
                    variant="outlined"
                  />
                )}
                {product.isNew && (
                  <Chip
                    label="جديد"
                    color="success"
                    icon={<NewReleases />}
                    variant="outlined"
                  />
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Basic Info */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    رقم المنتج (SKU)
                  </Typography>
                  <Typography variant="body1">
                    {product.sku || 'غير محدد'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    الفئة
                  </Typography>
                  <Typography variant="body1">
                    {product.category?.name || 'غير محدد'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    العلامة التجارية
                  </Typography>
                  <Typography variant="body1">
                    {product.brand?.name || 'غير محدد'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    عدد المتغيرات
                  </Typography>
                  <Typography variant="body1">
                    {product.variantsCount || 0}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Statistics */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    عدد المشاهدات
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {product.viewsCount || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    عدد المبيعات
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {product.salesCount || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    عدد التقييمات
                  </Typography>
                  <Typography variant="h6">
                    {product.reviewsCount || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    متوسط التقييم
                  </Typography>
                  <Typography variant="h6">
                    {product.averageRating ? product.averageRating.toFixed(1) : '0.0'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Dates */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    تاريخ الإنشاء
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(product.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    آخر تحديث
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(product.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label={`الوصف`} />
            <Tab label={`المتغيرات (${variants?.length || 0})`} />
            <Tab label={`SEO`} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                الوصف بالعربية
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {product.description}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                English Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {product.descriptionEn}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {loadingVariants ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : variants && variants.length > 0 ? (
            <Grid container spacing={3}>
              {variants.map((variant) => (
                <Grid item xs={12} sm={6} md={4} key={variant._id}>
                  <VariantCard
                    variant={variant}
                    onView={handleVariantClick}
                    showActions={false}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              لا توجد متغيرات لهذا المنتج
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                معلومات SEO
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                عنوان الصفحة (Meta Title)
              </Typography>
              <Typography variant="body1">
                {product.metaTitle || 'غير محدد'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                وصف الصفحة (Meta Description)
              </Typography>
              <Typography variant="body1">
                {product.metaDescription || 'غير محدد'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                الكلمات المفتاحية
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {product.metaKeywords && product.metaKeywords.length > 0 ? (
                  product.metaKeywords.map((keyword, index) => (
                    <Chip key={index} label={keyword} size="small" />
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    لا توجد كلمات مفتاحية
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  );
};
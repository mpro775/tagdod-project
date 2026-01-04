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
  Rating,
  Stack,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Inventory,
  Star,
  NewReleases,
  Home,
  ChevronRight,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProduct, useProductVariants } from '../hooks/useProducts';
import { formatDate } from '@/shared/utils/formatters';
import { VariantCard } from '../components/VariantCard';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

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
      {value === index && <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export const ProductViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['products', 'common']);
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState(0);

  const { data: product, isLoading: loadingProduct } = useProduct(id!);
  const { data: variants, isLoading: loadingVariants } = useProductVariants(id!);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
    return t(`status.${status}`, status);
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
        <Alert severity="error">{t('view.productNotFound')}</Alert>
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
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

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
          onClick={() => navigate(-1)}
          fullWidth={isMobile}
        >
          {t('view.backToProducts')}
        </Button>
        <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" sx={{ flex: 1 }}>
          {t('view.title')}
        </Typography>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={1}
          sx={{ width: isMobile ? '100%' : 'auto', ml: isMobile ? 0 : 'auto' }}
        >
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/products/${id}`)}
            fullWidth={isMobile}
          >
            {t('view.edit')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Inventory />}
            onClick={() => navigate(`/products/${id}/variants`)}
            fullWidth={isMobile}
          >
            {t('view.manageVariants')}
          </Button>
        </Stack>
      </Box>

      {/* Product Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Product Image */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                component="img"
                src={(product as any).mainImageId?.url || '/placeholder-product.png'}
                alt={product.name}
                sx={{
                  width: '100%',
                  height: isMobile ? 250 : 300,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            </Grid>

            {/* Product Details */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
                {product.name}
              </Typography>
              <Typography variant={isMobile ? 'body1' : 'h6'} color="text.secondary" gutterBottom>
                {product.nameEn}
              </Typography>

              {/* Status and Badges */}
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip
                  label={getStatusLabel(product.status)}
                  color={getStatusColor(product.status) as any}
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                />
                {product.isFeatured && (
                  <Chip
                    label={t('badges.featured')}
                    color="warning"
                    icon={<Star />}
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                  />
                )}
                {product.isNew && (
                  <Chip
                    label={t('badges.new')}
                    color="success"
                    icon={<NewReleases />}
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                  />
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Basic Info */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('view.sku')}
                  </Typography>
                  <Typography variant="body1">
                    {product.sku || t('view.skuNotSpecified')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('view.price')}
                  </Typography>
                  <Typography variant="body1">
                    {product.basePriceUSD
                      ? `$${product.basePriceUSD.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : t('view.priceNotSpecified')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('view.stock')}
                  </Typography>
                  <Typography variant="body1">
                    {typeof product.stock === 'number'
                      ? product.stock.toLocaleString('ar-SA')
                      : t('view.stockNotSpecified')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('view.category')}
                  </Typography>
                  <Typography variant="body1">
                    {(product as any).categoryId?.name || t('view.skuNotSpecified')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('view.brand')}
                  </Typography>
                  <Typography variant="body1">
                    {(product as any).brandId?.name || t('view.skuNotSpecified')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('view.variantsCount')}
                  </Typography>
                  <Typography variant="body1">{product.variantsCount || 0}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Rating (manual vs real) */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('view.rating')}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Rating
                      value={
                        product.useManualRating
                          ? product.manualRating || 0
                          : product.averageRating || 0
                      }
                      precision={0.1}
                      readOnly
                      size={isMobile ? 'small' : 'medium'}
                    />
                    <Typography variant="body1" fontWeight="bold">
                      {(product.useManualRating
                        ? product.manualRating || 0
                        : product.averageRating || 0
                      ).toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.useManualRating
                        ? `${product.manualReviewsCount || 0} ${t('view.reviewsManual')}`
                        : `${product.reviewsCount || 0} ${t('view.reviewsReal')}`}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Statistics */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('view.viewsCount')}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {product.viewsCount || 0}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('view.salesCount')}
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {product.salesCount || 0}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('view.reviewsCount')}
                  </Typography>
                  <Typography variant="h6">{product.reviewsCount || 0}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('view.averageRating')}
                  </Typography>
                  <Typography variant="h6">
                    {product.averageRating ? product.averageRating.toFixed(1) : '0.0'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Dates */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('view.createdAt')}
                  </Typography>
                  <Typography variant="body1">{formatDate(product.createdAt)}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('view.updatedAt')}
                  </Typography>
                  <Typography variant="body1">{formatDate(product.updatedAt)}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            allowScrollButtonsMobile
          >
            <Tab label={t('view.tabs.description')} />
            <Tab label={`${t('view.tabs.variants')} (${variants?.length || 0})`} />
            <Tab label={t('view.tabs.seo')} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                {t('view.descriptionAr')}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {product.description}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                {t('view.descriptionEn')}
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
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={variant._id}>
                  <VariantCard variant={variant} showActions={false} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">{t('variants.empty')}</Alert>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                {t('view.seo.title')}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                {t('view.seo.metaTitle')}
              </Typography>
              <Typography variant="body1">
                {product.metaTitle || t('view.seo.notSpecified')}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                {t('view.seo.metaDescription')}
              </Typography>
              <Typography variant="body1">
                {product.metaDescription || t('view.seo.notSpecified')}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                {t('view.seo.keywords')}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                {product.metaKeywords && product.metaKeywords.length > 0 ? (
                  product.metaKeywords.map((keyword, index) => (
                    <Chip key={index} label={keyword} size="small" />
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    {t('view.seo.noKeywords')}
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

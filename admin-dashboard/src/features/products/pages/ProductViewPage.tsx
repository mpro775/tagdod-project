import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Inventory,
  Star,
  NewReleases,
  LocalOffer,
  TrendingUp,
  Visibility,
  ShoppingCart,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProduct, useProductVariants } from '../hooks/useProducts';
import { VariantCard } from '../components/VariantCard';
import { ProductImage } from '../components/ProductImage';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  PageShell,
  PageHeader,
  SectionCard,
  StatCard,
  PageSummaryGrid,
  StatusChip,
  LoadingState,
  EmptyState,
} from '@/shared/design-system';
import { ProductStatus } from '../types/product.types';

function TabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`product-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
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

  if (loadingProduct) {
    return (
      <PageShell spacing="compact" fullHeight>
        <PageHeader variant="compact" title={t('products:view.title', 'عرض المنتج')} />
        <LoadingState variant="skeleton" rows={6} />
      </PageShell>
    );
  }

  if (!product) {
    return (
      <PageShell spacing="compact" fullHeight>
        <PageHeader variant="compact" title={t('products:view.title', 'عرض المنتج')} />
        <EmptyState title={t('products:view.productNotFound', 'المنتج غير موجود')} />
      </PageShell>
    );
  }

  const primaryImage =
    (typeof product.mainImageId === 'object' ? product.mainImageId : undefined) ?? product.mainImage;
  const fallbackImages: Array<string | { url: string }> = [];
  if (product.mainImage && typeof product.mainImage === 'string') fallbackImages.push(product.mainImage);
  if (Array.isArray(product.imageIds) && product.imageIds.length > 0) {
    const withUrl = product.imageIds.find((img) => typeof img === 'object' && img !== null && typeof (img as any).url === 'string');
    if (withUrl) fallbackImages.push(withUrl as { url: string });
  }

  const categoryName = typeof product.categoryId === 'object' ? product.categoryId?.name : '-';
  const brandName = typeof product.brandId === 'object' ? product.brandId?.name : '-';
  const hasOffers = product.appliedPriceRules && product.appliedPriceRules.length > 0;
  const discountPercent = hasOffers ? product.appliedPriceRules?.[0]?.effects?.percentOff : undefined;

  return (
    <PageShell spacing="compact" fullHeight>
      <PageHeader
        variant="compact"
        title={product.name}
        description={product.nameEn}
        breadcrumbs={[
          { label: t('common:navigation.dashboard', 'لوحة التحكم'), to: '/dashboard' },
          { label: t('products:list.title', 'المنتجات'), to: '/products' },
          { label: product.name },
        ]}
        actions={[
          {
            label: t('products:actions.edit', 'تعديل'),
            icon: <Edit />,
            onClick: () => navigate(`/products/${id}`),
            variant: 'primary',
          },
          {
            label: t('products:view.manageVariants', 'المتغيرات'),
            icon: <Inventory />,
            onClick: () => navigate(`/products/${id}/variants`),
            variant: 'secondary',
          },
          {
            label: t('products:view.backToProducts', 'رجوع'),
            icon: <ArrowBack />,
            onClick: () => navigate(-1),
            variant: 'ghost',
          },
        ]}
      />

      <SectionCard>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'grey.50', borderRadius: 1, p: 1 }}>
              <ProductImage
                image={primaryImage}
                fallbackImages={fallbackImages}
                size={200}
              />
              <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 6, right: 6, flexWrap: 'wrap' }}>
                {hasOffers && (
                  <Chip icon={<LocalOffer sx={{ fontSize: 14 }} />} label={discountPercent ? `-${discountPercent}%` : t('products:badges.hasOffer')} color="error" size="small" />
                )}
                {product.isFeatured && <Chip icon={<Star sx={{ fontSize: 14 }} />} label={t('products:badges.featured')} color="warning" size="small" />}
                {product.isNew && <Chip icon={<NewReleases sx={{ fontSize: 14 }} />} label={t('products:badges.new')} color="info" size="small" />}
                {product.isBestseller && <Chip icon={<TrendingUp sx={{ fontSize: 14 }} />} label={t('products:badges.bestseller')} color="success" size="small" />}
              </Stack>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 8, md: 9 }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <StatusChip
                  label={t(`products:status.${product.status}`)}
                  status={product.status === ProductStatus.ACTIVE ? 'active' : product.status === ProductStatus.ARCHIVED ? 'archived' : 'draft'}
                />
                {product.sku && <Chip label={`SKU: ${product.sku}`} size="small" variant="outlined" />}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {categoryName} {brandName && brandName !== '-' ? `| ${brandName}` : ''}
              </Typography>
              {product.basePriceUSD !== undefined && product.basePriceUSD !== null && (
                <Typography variant="h6" fontWeight="bold">
                  ${product.basePriceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              )}
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  {t('products:view.stock', 'المخزون')}: {product.stock ?? '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('products:view.variantsCount', 'المتغيرات')}: {product.variantsCount || 0}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </SectionCard>

      <PageSummaryGrid columns={4} compact>
        <StatCard title={t('products:view.viewsCount', 'المشاهدات')} value={product.viewsCount || 0} icon={<Visibility fontSize="small" />} tone="info" compact />
        <StatCard title={t('products:view.salesCount', 'المبيعات')} value={product.salesCount || 0} icon={<ShoppingCart fontSize="small" />} tone="success" compact />
        <StatCard title={t('products:view.rating', 'التقييم')} value={product.useManualRating ? (product.manualRating || 0).toFixed(1) : (product.averageRating || 0).toFixed(1)} tone="warning" compact />
        <StatCard title={t('products:view.reviewsCount', 'التقييمات')} value={product.useManualRating ? (product.manualReviewsCount || 0) : (product.reviewsCount || 0)} tone="neutral" compact />
      </PageSummaryGrid>

      <SectionCard>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant={isMobile ? 'scrollable' : 'standard'} scrollButtons={isMobile ? 'auto' : false}>
          <Tab label={t('products:view.tabs.description', 'الوصف')} />
          <Tab label={`${t('products:view.tabs.variants', 'المتغيرات')} (${variants?.length || 0})`} />
          <Tab label={t('products:view.tabs.seo', 'SEO')} />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{t('products:view.descriptionAr', 'الوصف بالعربية')}</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{product.description || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{t('products:view.descriptionEn', 'الوصف بالإنجليزية')}</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{product.descriptionEn || '-'}</Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {loadingVariants ? (
            <LoadingState variant="skeleton" rows={3} />
          ) : variants && variants.length > 0 ? (
            <Grid container spacing={2}>
              {variants.map((variant) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={variant._id}>
                  <VariantCard variant={variant} showActions={false} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <EmptyState title={t('products:variants.empty', 'لا توجد متغيرات')} />
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">{t('products:view.seo.metaTitle', 'عنوان SEO')}</Typography>
              <Typography variant="body2">{product.metaTitle || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">{t('products:view.seo.metaDescription', 'وصف SEO')}</Typography>
              <Typography variant="body2">{product.metaDescription || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">{t('products:view.seo.keywords', 'الكلمات المفتاحية')}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                {product.metaKeywords && product.metaKeywords.length > 0 ? (
                  product.metaKeywords.map((kw, i) => <Chip key={i} label={kw} size="small" />)
                ) : <Typography variant="body2" color="text.secondary">-</Typography>}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </SectionCard>
    </PageShell>
  );
};
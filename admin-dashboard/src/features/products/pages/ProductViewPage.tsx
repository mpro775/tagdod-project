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
  Edit,
  Inventory,
  ArrowBack,
  Star,
  NewReleases,
  LocalOffer,
  TrendingUp,
  Visibility,
  ShoppingCart,
  AttachMoney,
  Inventory2,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProduct, useProductVariants } from '../hooks/useProducts';
import { ProductImage } from '../components/ProductImage';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  PageShell,
  PageHeader,
  PageSummaryGrid,
  StatCard,
  SectionCard,
  StatusChip,
  DetailsDrawer,
  LoadingState,
  EmptyState,
} from '@/shared/design-system';
import { ProductStatus } from '../types/product.types';
import type { Variant } from '../types/product.types';

function TabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`product-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const getColorValue = (colorName: string): string | null => {
  if (!colorName) return null;
  const colorMap: Record<string, string> = {
    'اسود': '#000000', 'أسود': '#000000',
    'ابيض': '#FFFFFF', 'أبيض': '#FFFFFF',
    'احمر': '#FF0000', 'أحمر': '#FF0000',
    'ازرق': '#0000FF', 'أزرق': '#0000FF',
    'اخضر': '#00FF00', 'أخضر': '#00FF00',
    'اصفر': '#FFFF00', 'أصفر': '#FFFF00',
    'برتقالي': '#FFA500', 'بنفسجي': '#800080',
    'وردي': '#FFC0CB', 'رمادي': '#808080',
    'بني': '#A52A2A',
    'black': '#000000', 'white': '#FFFFFF',
    'red': '#FF0000', 'blue': '#0000FF',
    'green': '#00FF00', 'yellow': '#FFFF00',
  };
  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || (normalized.startsWith('#') ? normalized : null);
};

export const ProductViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['products', 'common']);
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

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
    const withUrl = product.imageIds.find(
      (img) => typeof img === 'object' && img !== null && typeof (img as any).url === 'string'
    );
    if (withUrl) fallbackImages.push(withUrl as { url: string });
  }

  const categoryName = typeof product.categoryId === 'object' ? product.categoryId?.name : '-';
  const brandName = typeof product.brandId === 'object' ? product.brandId?.name : '-';
  const hasOffers = product.appliedPriceRules && product.appliedPriceRules.length > 0;
  const discountPercent = hasOffers ? product.appliedPriceRules?.[0]?.effects?.percentOff : undefined;

  const productStatus: 'active' | 'draft' | 'archived' | 'neutral' =
    product.status === ProductStatus.ACTIVE
      ? 'active'
      : product.status === ProductStatus.ARCHIVED
        ? 'archived'
        : product.status === ProductStatus.DRAFT
          ? 'draft'
          : 'neutral';

  const rating = product.useManualRating
    ? (product.manualRating || 0).toFixed(1)
    : (product.averageRating || 0).toFixed(1);

  const getStockStatus = (stock: number, minStock?: number): 'error' | 'warning' | 'success' => {
    if (stock === 0) return 'error';
    if (minStock != null && stock <= minStock) return 'warning';
    return 'success';
  };

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
            onClick: () => navigate(`/products/${id}/edit`),
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
        meta={
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
            <ProductImage image={primaryImage} fallbackImages={fallbackImages} size={48} />
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                <StatusChip
                  label={t(`products:status.${product.status}`, product.status)}
                  status={productStatus}
                />
                {product.sku && <Chip label={`SKU: ${product.sku}`} size="small" variant="outlined" />}
                {hasOffers && (
                  <Chip
                    icon={<LocalOffer sx={{ fontSize: 14 }} />}
                    label={discountPercent ? `-${discountPercent}%` : t('products:badges.hasOffer', 'عرض')}
                    color="error"
                    size="small"
                  />
                )}
                {product.isFeatured && (
                  <Chip icon={<Star sx={{ fontSize: 14 }} />} label={t('products:badges.featured', 'مميز')} color="warning" size="small" />
                )}
                {product.isNew && (
                  <Chip icon={<NewReleases sx={{ fontSize: 14 }} />} label={t('products:badges.new', 'جديد')} color="info" size="small" />
                )}
                {product.isBestseller && (
                  <Chip icon={<TrendingUp sx={{ fontSize: 14 }} />} label={t('products:badges.bestseller', 'الأكثر مبيعاً')} color="success" size="small" />
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {categoryName}{brandName && brandName !== '-' ? ` | ${brandName}` : ''}
                {product.basePriceUSD != null ? ` | $${product.basePriceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
              </Typography>
            </Stack>
          </Stack>
        }
      />

      <PageSummaryGrid columns={6} compact>
        <StatCard title={t('products:view.viewsCount', 'المشاهدات')} value={product.viewsCount || 0} icon={<Visibility fontSize="small" />} tone="info" compact />
        <StatCard title={t('products:view.salesCount', 'المبيعات')} value={product.salesCount || 0} icon={<ShoppingCart fontSize="small" />} tone="success" compact />
        <StatCard title={t('products:view.rating', 'التقييم')} value={rating} tone="warning" compact />
        <StatCard
          title={t('products:view.stock', 'المخزون')}
          value={product.stock ?? 0}
          tone={getStockStatus(product.stock ?? 0, product.minStock)}
          compact
        />
        {product.basePriceUSD != null && (
          <StatCard
            title={t('products:view.price', 'السعر')}
            value={`$${product.basePriceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<AttachMoney fontSize="small" />}
            tone="primary"
            compact
          />
        )}
        <StatCard title={t('products:view.variantsCount', 'المتغيرات')} value={product.variantsCount || 0} icon={<Inventory2 fontSize="small" />} tone="neutral" compact />
      </PageSummaryGrid>

      <SectionCard>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
        >
          <Tab label={t('products:view.tabs.overview', 'نظرة عامة')} />
          <Tab label={t('products:view.tabs.media', 'الصور')} />
          <Tab label={t('products:view.tabs.pricing', 'التسعير والمخزون')} />
          <Tab label={`${t('products:view.tabs.variants', 'المتغيرات')} (${variants?.length || 0})`} />
          <Tab label={t('products:view.tabs.seo', 'SEO')} />
          <Tab label={t('products:view.tabs.related', 'منتجات مرتبطة')} />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {t('products:view.descriptionAr', 'الوصف بالعربية')}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {product.description || '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {t('products:view.descriptionEn', 'الوصف بالإنجليزية')}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {product.descriptionEn || '-'}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t('products:view.mainImage', 'الصورة الرئيسية')}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <ProductImage image={primaryImage} fallbackImages={fallbackImages} size={200} />
            </Box>
            {product.images && product.images.length > 0 && (
              <>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t('products:view.additionalImages', 'صور إضافية')}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {product.images.map((img, idx) => (
                    <Box key={idx} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                      <Box component="img" src={img} alt={`Product ${idx + 1}`} sx={{ width: 100, height: 100, objectFit: 'cover' }} />
                    </Box>
                  ))}
                </Stack>
              </>
            )}
            {(!product.images || product.images.length === 0) && (
              <EmptyState
                title={t('products:view.noImages', 'لا توجد صور إضافية')}
                description={t('products:view.addImagesFromEdit', 'يمكنك إضافة الصور من صفحة تعديل المنتج')}
              />
            )}
          </Stack>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {t('products:view.pricing', 'التسعير')}
              </Typography>
              <Stack spacing={1}>
                {product.basePriceUSD != null && (
                  <Typography variant="body2">
                    {t('products:view.basePrice', 'السعر الأساسي')}: ${product.basePriceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                )}
                {product.compareAtPriceUSD != null && (
                  <Typography variant="body2">
                    {t('products:view.compareAtPrice', 'السعر قبل الخصم')}: ${product.compareAtPriceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                )}
                {product.costPriceUSD != null && (
                  <Typography variant="body2">
                    {t('products:view.costPrice', 'سعر التكلفة')}: ${product.costPriceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                )}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {t('products:view.stockInfo', 'معلومات المخزون')}
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  {t('products:view.stock', 'المخزون')}: {product.stock ?? '-'}
                </Typography>
                {product.minStock != null && (
                  <Typography variant="body2">
                    {t('products:view.minStock', 'الحد الأدنى')}: {product.minStock}
                  </Typography>
                )}
                {product.maxStock != null && (
                  <Typography variant="body2">
                    {t('products:view.maxStock', 'الحد الأقصى')}: {product.maxStock}
                  </Typography>
                )}
                <Typography variant="body2">
                  {t('products:view.trackStock', 'تتبع المخزون')}: {product.trackStock ? t('common:yes', 'نعم') : t('common:no', 'لا')}
                </Typography>
                <Typography variant="body2">
                  {t('products:view.allowBackorder', 'السماح بالطلب المسبق')}: {product.allowBackorder ? t('common:yes', 'نعم') : t('common:no', 'لا')}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {loadingVariants ? (
            <LoadingState variant="skeleton" rows={3} />
          ) : variants && variants.length > 0 ? (
            <Grid container spacing={2}>
              {variants.map((variant) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={variant._id}>
                  <Box
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      transition: 'border-color 0.2s',
                    }}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <ProductImage image={variant.imageId as any} size={48} />
                      <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight="bold" noWrap>
                          {variant.sku || t('products:variants.noSku', 'بدون SKU')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${variant.price ?? variant.basePriceUSD ?? 0} | {t('products:view.stock', 'المخزون')}: {variant.stock}
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          <StatusChip
                            label={
                              variant.stock === 0
                                ? t('products:variants.status.outOfStock', 'غير متوفر')
                                : variant.stock <= (variant.minStock || 0)
                                  ? t('products:variants.status.low', 'منخفض')
                                  : t('products:variants.status.available', 'متوفر')
                            }
                            status={
                              variant.stock === 0
                                ? 'error'
                                : variant.stock <= (variant.minStock || 0)
                                  ? 'warning'
                                  : 'success'
                            }
                            size="small"
                          />
                          {variant.attributeValues?.slice(0, 2).map((attr, idx) => (
                            <Chip
                              key={attr.valueId || `${attr.attributeId}-${idx}`}
                              label={`${attr.name}: ${attr.value}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: 10, height: 20 }}
                            />
                          ))}
                          {variant.attributeValues?.length > 2 && (
                            <Chip
                              label={`+${variant.attributeValues.length - 2}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: 10, height: 20 }}
                            />
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <EmptyState
              title={t('products:variants.empty', 'لا توجد متغيرات')}
              description={t('products:variants.emptyDescription', 'أضف متغيرات للمنتج من صفحة إدارة المتغيرات')}
              actionLabel={t('products:view.manageVariants', 'المتغيرات')}
              onAction={() => navigate(`/products/${id}/variants`)}
            />
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('products:view.seo.metaTitle', 'عنوان SEO')}
              </Typography>
              <Typography variant="body2">{product.metaTitle || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('products:view.seo.metaDescription', 'وصف SEO')}
              </Typography>
              <Typography variant="body2">{product.metaDescription || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('products:view.seo.keywords', 'الكلمات المفتاحية')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                {product.metaKeywords && product.metaKeywords.length > 0 ? (
                  product.metaKeywords.map((kw, i) => <Chip key={i} label={kw} size="small" />)
                ) : (
                  <Typography variant="body2" color="text.secondary">-</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          {product.relatedProducts && product.relatedProducts.length > 0 ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t('products:view.relatedProductsList', 'المنتجات المرتبطة')}
              </Typography>
              {product.relatedProducts.map((rpId) => (
                <Chip key={rpId} label={rpId} size="small" variant="outlined" />
              ))}
            </Stack>
          ) : (
            <EmptyState
              title={t('products:view.noRelatedProducts', 'لا توجد منتجات مرتبطة')}
              description={t('products:view.addRelatedProducts', 'يمكنك إضافة المنتجات المرتبطة من صفحة تعديل المنتج')}
            />
          )}
        </TabPanel>
      </SectionCard>

      <DetailsDrawer
        open={!!selectedVariant}
        onClose={() => setSelectedVariant(null)}
        title={selectedVariant?.sku || t('products:variants.variantDetails', 'تفاصيل المتغير')}
        description={
          selectedVariant
            ? `${t('products:view.stock', 'المخزون')}: ${selectedVariant.stock} | $${selectedVariant.price ?? selectedVariant.basePriceUSD ?? 0}`
            : undefined
        }
      >
        {selectedVariant && (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <StatusChip
                label={
                  selectedVariant.stock === 0
                    ? t('products:variants.status.outOfStock', 'غير متوفر')
                    : selectedVariant.stock <= (selectedVariant.minStock || 0)
                      ? t('products:variants.status.low', 'منخفض')
                      : t('products:variants.status.available', 'متوفر')
                }
                status={
                  selectedVariant.stock === 0
                    ? 'error'
                    : selectedVariant.stock <= (selectedVariant.minStock || 0)
                      ? 'warning'
                      : 'success'
                }
              />
              <StatusChip
                label={selectedVariant.isActive ? t('products:status.active', 'نشط') : t('products:status.inactive', 'غير نشط')}
                status={selectedVariant.isActive ? 'active' : 'inactive'}
              />
            </Stack>

            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {t('products:variants.form.sku', 'SKU')}
              </Typography>
              <Typography variant="body2">{selectedVariant.sku || '-'}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {t('products:variants.columns.price', 'السعر')}
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                ${selectedVariant.price ?? selectedVariant.basePriceUSD ?? 0}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {t('products:variants.columns.stock', 'المخزون')}
              </Typography>
              <Typography variant="body2">
                {selectedVariant.stock} {t('products:variants.unit', 'وحدة')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('products:variants.minimum', 'الحد الأدنى')}: {selectedVariant.minStock}
              </Typography>
            </Box>

            {selectedVariant.attributeValues && selectedVariant.attributeValues.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {t('products:variants.columns.attributes', 'السمات')}
                </Typography>
                <Stack spacing={0.5}>
                  {selectedVariant.attributeValues.map((attr, idx) => {
                    const isColorAttr = attr.name?.toLowerCase().includes('لون') || attr.name?.toLowerCase().includes('color');
                    const colorVal = isColorAttr ? getColorValue(attr.value || '') : null;
                    return (
                      <Stack key={attr.valueId || `${attr.attributeId}-${idx}`} direction="row" spacing={1} alignItems="center">
                        {isColorAttr && colorVal && (
                          <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: colorVal, border: '1px solid', borderColor: 'divider', flexShrink: 0 }} />
                        )}
                        <Typography variant="body2">
                          <strong>{attr.name}:</strong> {attr.value}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {t('products:variants.sales', 'المبيعات')}
              </Typography>
              <Typography variant="body2">{selectedVariant.salesCount}</Typography>
            </Box>
          </Stack>
        )}
      </DetailsDrawer>
    </PageShell>
  );
};
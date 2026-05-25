import { Stack, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SectionCard, StatusChip, LoadingState, EmptyState } from '@/shared/design-system';
import { designRadius } from '@/shared/design-system/tokens';
import {
  Inventory,
  WarningAmber,
  TrendingDown,
  ImageNotSupported,
  QrCode2,
  Category,
  Storefront,
  PriceCheck,
  Widgets,
} from '@mui/icons-material';
import type { ProductStats, InventorySummary } from '../../types/product.types';

interface ProductAnalyticsChartsProps {
  stats?: ProductStats;
  inventory?: InventorySummary;
  loadingStats?: boolean;
  loadingInventory?: boolean;
}

const AttentionItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  count: number;
  tone: 'error' | 'warning' | 'info' | 'neutral';
}> = ({ icon, label, count, tone }) => {
  const theme = useTheme();
  const toneColor =
    tone === 'neutral'
      ? theme.palette.text.secondary
      : theme.palette[tone].main;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        py: 0.75,
        px: 1.25,
        borderRadius: `${designRadius.md}px`,
        border: '1px solid',
        borderColor: alpha(toneColor, 0.2),
        bgcolor: alpha(toneColor, theme.palette.mode === 'dark' ? 0.06 : 0.04),
      }}
    >
      <Box sx={{ color: toneColor, display: 'flex', alignItems: 'center', '& .MuiSvgIcon-root': { fontSize: 16 } }}>
        {icon}
      </Box>
      <Typography variant="caption" sx={{ fontWeight: 600, flex: 1, fontSize: 12 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: toneColor, fontSize: 13 }}>
        {count}
      </Typography>
    </Stack>
  );
};

const StatusRow: React.FC<{
  label: string;
  count: number;
  total: number;
  chipStatus: 'active' | 'draft' | 'archived';
  chipLabel: string;
}> = ({ label, count, total, chipStatus, chipLabel }) => {
  const percent = total > 0 ? (count / total) * 100 : 0;
  const theme = useTheme();

  const statusToneMap: Record<string, string> = {
    active: theme.palette.success.main,
    draft: theme.palette.text.secondary,
    archived: theme.palette.warning.main,
  };
  const color = statusToneMap[chipStatus] || theme.palette.primary.main;

  return (
    <Stack spacing={0.75}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 16 }}>
            {count}
          </Typography>
          <StatusChip label={chipLabel} status={chipStatus} size="small" />
        </Stack>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(percent, 100)}
        sx={{
          height: 4,
          borderRadius: 2,
          bgcolor: alpha(color, 0.1),
          '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: color },
        }}
      />
    </Stack>
  );
};

export const ProductAnalyticsCharts: React.FC<ProductAnalyticsChartsProps> = ({
  stats,
  inventory,
  loadingStats = false,
  loadingInventory = false,
}) => {
  const { t } = useTranslation('products');

  const total = stats?.total ?? 0;

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SectionCard
            title={t('stats.byStatus', 'توزيع المنتجات حسب الحالة')}
            padding="sm"
          >
          {loadingStats ? (
            <LoadingState variant="linear" />
          ) : !stats ? (
            <EmptyState />
          ) : (
            <Stack spacing={2}>
              <StatusRow
                label={t('status.active', 'نشط')}
                count={stats.active}
                total={total}
                chipStatus="active"
                chipLabel={t('status.active', 'نشط')}
              />
              <StatusRow
                label={t('status.draft', 'مسودة')}
                count={stats.draft}
                total={total}
                chipStatus="draft"
                chipLabel={t('status.draft', 'مسودة')}
              />
              <StatusRow
                label={t('status.archived', 'مؤرشف')}
                count={stats.archived}
                total={total}
                chipStatus="archived"
                chipLabel={t('status.archived', 'مؤرشف')}
              />
            </Stack>
          )}
          </SectionCard>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SectionCard
            title={t('stats.inventoryStats', 'إحصائيات المخزون')}
            padding="sm"
          >
          {loadingInventory ? (
            <LoadingState variant="linear" />
          ) : !inventory ? (
            <EmptyState />
          ) : (
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Inventory sx={{ fontSize: 16, color: 'info.main' }} />
                  <Typography variant="body2">{t('stats.totalVariants', 'إجمالي المتغيرات')}</Typography>
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 16 }}>
                  {inventory.totalVariants}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={0.5}>
                <Typography variant="body2">{t('stats.inStock', 'متوفر في المخزون')}</Typography>
                <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                  <Typography variant="h6" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 16 }}>
                    {inventory.inStock}
                  </Typography>
                  {typeof inventory.inStockUnits === 'number' && (
                    <StatusChip
                      label={`${inventory.inStockUnits} ${t('stats.unit', 'وحدة')}`}
                      status="success"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={0.5}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <WarningAmber sx={{ fontSize: 16, color: 'warning.main' }} />
                  <Typography variant="body2">{t('stats.lowStock', 'مخزون منخفض')}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                  <Typography variant="h6" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 16 }}>
                    {inventory.lowStock}
                  </Typography>
                  {typeof inventory.lowStockUnits === 'number' && (
                    <StatusChip
                      label={`${inventory.lowStockUnits} ${t('stats.unit', 'وحدة')}`}
                      status="warning"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={0.5}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                  <Typography variant="body2">{t('stats.outOfStock', 'نفذ من المخزون')}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                  <Typography variant="h6" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 16 }}>
                    {inventory.outOfStock}
                  </Typography>
                  {typeof inventory.outOfStockUnits === 'number' && (
                    <StatusChip
                      label={`${inventory.outOfStockUnits} ${t('stats.unit', 'وحدة')}`}
                      status="error"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Stack>

              {inventory.totalValue > 0 && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {t('stats.totalInventoryValue', 'إجمالي قيمة المخزون')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontVariantNumeric: 'tabular-nums', fontSize: 16 }}>
                    ${inventory.totalValue.toLocaleString('en-US')}
                  </Typography>
                </Stack>
              )}
            </Stack>
          )}
          </SectionCard>
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SectionCard
            title={t('stats.attentionIndicators', 'مؤشرات الانتباه')}
            description={t('stats.attentionIndicatorsDesc', 'منتجات تحتاج إلى مراجعة')}
            padding="sm"
          >
          {loadingStats ? (
            <LoadingState variant="linear" />
          ) : !stats ? (
            <EmptyState />
          ) : (
            <Stack spacing={0.75}>
              <AttentionItem
                icon={<ImageNotSupported />}
                label={t('stats.withoutImage', 'بدون صورة')}
                count={stats.withoutImages ?? 0}
                tone="warning"
              />
              <AttentionItem
                icon={<QrCode2 />}
                label={t('stats.withoutSku', 'بدون SKU')}
                count={stats.withoutSku ?? 0}
                tone="warning"
              />
              <AttentionItem
                icon={<Category />}
                label={t('stats.withoutCategory', 'بدون تصنيف')}
                count={stats.withoutCategory ?? 0}
                tone="error"
              />
              <AttentionItem
                icon={<Storefront />}
                label={t('stats.withoutBrand', 'بدون علامة تجارية')}
                count={stats.withoutBrand ?? 0}
                tone="info"
              />
              <AttentionItem
                icon={<PriceCheck />}
                label={t('stats.withoutPrice', 'بدون سعر')}
                count={(stats as unknown as Record<string, number>).withoutPrice ?? 0}
                tone="error"
              />
              <AttentionItem
                icon={<Widgets />}
                label={t('stats.withoutVariants', 'بدون متغيرات')}
                count={stats.withoutVariants ?? 0}
                tone="neutral"
              />
            </Stack>
          )}
          </SectionCard>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SectionCard
            title={t('stats.variantsPerProduct', 'إحصائيات المتغيرات لكل منتج')}
            padding="sm"
          >
          {loadingInventory ? (
            <LoadingState variant="linear" />
          ) : !inventory?.variantsPerProduct || inventory.variantsPerProduct.length === 0 ? (
            <EmptyState
              title={t('stats.noVariantsData', 'لا توجد بيانات متغيرات')}
            />
          ) : (
            <TableContainer sx={{ maxHeight: 320 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                      {t('stats.product', 'المنتج')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="center">
                      {t('stats.variantsCount', 'عدد المتغيرات')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="center">
                      {t('stats.totalUnits', 'إجمالي الوحدات')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.variantsPerProduct.map((row) => (
                    <TableRow key={row.productId} hover>
                      <TableCell sx={{ fontSize: 12 }}>
                        {row.productName || row.productId}
                      </TableCell>
                      <TableCell align="center">
                        <StatusChip label={String(row.variantsCount)} status="info" size="small" />
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: 12 }}>
                        {typeof row.totalUnits === 'number' ? row.totalUnits.toLocaleString('en-US') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          </SectionCard>
        </Box>
      </Stack>
    </Stack>
  );
};
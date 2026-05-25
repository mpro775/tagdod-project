import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { Warning, TrendingDown, CheckCircle } from '@mui/icons-material';
import { SectionCard, StatusChip, LoadingState } from '@/shared/design-system';
import { useLowStockVariants, useOutOfStockVariants } from '../../hooks/useProducts';
import type { LowStockItem, OutOfStockItem } from '../../types/product.types';

interface InventoryAlertsSectionProps {
  onVariantClick?: (variantId: string, productId: string) => void;
}

export const InventoryAlertsSection: React.FC<InventoryAlertsSectionProps> = ({
  onVariantClick,
}) => {
  const { t } = useTranslation('products');

  const {
    data: lowStockVariants,
    isLoading: loadingLowStock,
  } = useLowStockVariants();
  const {
    data: outOfStockVariants,
    isLoading: loadingOutOfStock,
  } = useOutOfStockVariants();

  if (loadingLowStock && loadingOutOfStock) {
    return <LoadingState variant="skeleton" rows={2} />;
  }

  const lowStock = lowStockVariants ?? [];
  const outOfStock = outOfStockVariants ?? [];
  const hasAlerts = lowStock.length > 0 || outOfStock.length > 0;

  if (!hasAlerts) {
    return (
      <SectionCard
        title={t('inventory.alerts', 'تنبيهات المخزون')}
        description={t('inventory.allStockGood', 'جميع المنتجات متوفرة في المخزون')}
      >
        <Stack direction="row" spacing={1} alignItems="center" py={1}>
          <CheckCircle color="success" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {t('inventory.noAlerts', 'لا توجد تنبيهات حالياً')}
          </Typography>
        </Stack>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={t('inventory.alerts', 'تنبيهات المخزون')}
      description={t('inventory.alertsDescription', 'المنتجات التي تحتاج اهتمام فوري')}
    >
      <Stack spacing={2}>
        {outOfStock.length > 0 && (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TrendingDown color="error" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {t('inventory.outOfStockAlert', '{{count}} منتج نافذ من المخزون', { count: outOfStock.length })}
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              {outOfStock.slice(0, 5).map((item: OutOfStockItem) => (
                <AlertItem
                  key={item.variantId}
                  name={item.variantName || item.sku || item.variantId}
                  productName={item.productName || item.productId}
                  status="out"
                  onClick={() => onVariantClick?.(item.variantId, item.productId)}
                />
              ))}
              {outOfStock.length > 5 && (
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                  {t('inventory.andMore', '+{{count}} أخرى', { count: outOfStock.length - 5 })}
                </Typography>
              )}
            </Stack>
          </Stack>
        )}

        {lowStock.length > 0 && (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Warning color="warning" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {t('inventory.lowStockAlert', '{{count}} منتج بمخزون منخفض', { count: lowStock.length })}
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              {lowStock.slice(0, 5).map((item: LowStockItem) => (
                <AlertItem
                  key={item.variantId}
                  name={item.variantName || item.sku || item.variantId}
                  productName={item.productName || item.productId}
                  status="low"
                  detail={`${item.currentStock} / ${item.minStock}`}
                  onClick={() => onVariantClick?.(item.variantId, item.productId)}
                />
              ))}
              {lowStock.length > 5 && (
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                  {t('inventory.andMore', '+{{count}} أخرى', { count: lowStock.length - 5 })}
                </Typography>
              )}
            </Stack>
          </Stack>
        )}
      </Stack>
    </SectionCard>
  );
};

interface AlertItemProps {
  name: string;
  productName: string;
  status: 'low' | 'out';
  detail?: string;
  onClick?: () => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ name, productName, status, detail, onClick }) => {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        px: 1.5,
        py: 0.75,
        borderRadius: 1,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { bgcolor: 'action.hover' } : undefined,
      }}
      onClick={onClick}
    >
      <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
        {name}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        {productName}
      </Typography>
      {detail && (
        <Typography variant="caption" color="text.secondary" noWrap sx={{ flexShrink: 0 }}>
          {detail}
        </Typography>
      )}
      <StatusChip
        label={status === 'out' ? 'نفذ' : 'منخفض'}
        status={status === 'out' ? 'error' : 'warning'}
        size="small"
      />
    </Stack>
  );
};
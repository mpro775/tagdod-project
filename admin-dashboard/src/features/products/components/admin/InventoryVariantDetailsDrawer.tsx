import React, { useState } from 'react';
import { Stack, Box, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DetailsDrawer, FormActionBar } from '@/shared/design-system';
import { useProduct } from '../../hooks/useProducts';
import { VariantCard } from '../VariantCard';
import { StockManager } from '../StockManager';
import { PricingManager } from '../PricingManager';
import type { Variant } from '../../types/product.types';

interface InventoryVariantDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  variant: Variant | null;
  onStockUpdate?: (updatedVariant: Variant) => void;
}

export const InventoryVariantDetailsDrawer: React.FC<InventoryVariantDetailsDrawerProps> = ({
  open,
  onClose,
  variant,
  onStockUpdate,
}) => {
  const { t } = useTranslation(['products', 'common']);
  const [currentVariant, setCurrentVariant] = useState<Variant | null>(variant);

  React.useEffect(() => {
    setCurrentVariant(variant);
  }, [variant]);

  const { data: productData } = useProduct(currentVariant?.productId || '');

  const handleStockUpdate = (updatedVariant: Variant) => {
    setCurrentVariant(updatedVariant);
    onStockUpdate?.(updatedVariant);
  };

  if (!currentVariant) return null;

  const skuDisplay = currentVariant.sku || t('products:variants.noSku', 'بدون SKU');
  const productName = productData?.name || currentVariant.productId;

  return (
    <DetailsDrawer
      open={open}
      onClose={onClose}
      title={t('products:inventory.variantDetails', 'تفاصيل المتغير')}
      description={`${skuDisplay} — ${productName}`}
      actions={
        <FormActionBar
          onCancel={onClose}
          cancelLabel={t('common:actions.close', 'إغلاق')}
        />
      }
      width={520}
    >
      <Stack spacing={2.5}>
        <VariantCard
          variant={currentVariant}
          showActions={false}
        />

        <Divider />

        <Stack
          spacing={2}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          }}
        >
          <Box>
            <StockManager
              variant={currentVariant}
              onStockUpdate={handleStockUpdate}
            />
          </Box>
          <Box>
            <PricingManager
              variant={currentVariant}
              productId={currentVariant.productId}
            />
          </Box>
        </Stack>
      </Stack>
    </DetailsDrawer>
  );
};
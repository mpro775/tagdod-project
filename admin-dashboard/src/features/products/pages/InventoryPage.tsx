import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { InventoryDashboard } from '../components/InventoryDashboard';
import { VariantCard } from '../components/VariantCard';
import { StockManager } from '../components/StockManager';
import { PricingManager } from '../components/PricingManager';
import type { Variant } from '../types/product.types';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleVariantClick = (variant: Variant) => {
    setSelectedVariant(variant);
    setDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedVariant(null);
  };

  const handleStockUpdate = (updatedVariant: Variant) => {
    setSelectedVariant(updatedVariant);
  };

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
          إدارة المخزون
        </Typography>
      </Box>

      {/* Inventory Dashboard */}
      <InventoryDashboard onVariantClick={handleVariantClick} />

      {/* Variant Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          تفاصيل المتغير
          {selectedVariant && (
            <Typography variant="subtitle1" color="text.secondary">
              {selectedVariant.sku || 'بدون SKU'}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedVariant && (
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Variant Card */}
              <VariantCard
                variant={selectedVariant}
                showActions={false}
              />

              {/* Management Components */}
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                <StockManager
                  variant={selectedVariant}
                  onStockUpdate={handleStockUpdate}
                />
                <PricingManager
                  variant={selectedVariant}
                  productId={selectedVariant.productId}
                  onPriceUpdate={handleStockUpdate}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

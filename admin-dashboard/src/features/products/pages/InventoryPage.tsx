import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  useTheme,
  Breadcrumbs,
  Link,
  Alert,
} from '@mui/material';
import { ArrowBack, Home, ChevronRight, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { InventoryDashboard } from '../components/InventoryDashboard';
import { VariantCard } from '../components/VariantCard';
import { StockManager } from '../components/StockManager';
import { PricingManager } from '../components/PricingManager';
import type { Variant } from '../types/product.types';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation(['products', 'common']);
  const { isMobile } = useBreakpoint();
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
        <Typography color="text.primary">
          {t('products:inventory.title', 'إدارة المخزون')}
        </Typography>
      </Breadcrumbs>

      {/* Stock Alerts Banner */}
      <Alert 
        severity="info" 
        icon={<Warning />}
        sx={{ mb: 2 }}
        action={
          <Button 
            size="small" 
            onClick={() => navigate('/products/inventory')}
            sx={{ textDecoration: 'none' }}
          >
            {t('products:inventory.viewAll', 'عرض الكل')}
          </Button>
        }
      >
        {t('products:inventory.stockAlertsInfo', 'راقب المخزون المنخفض والمنتجات النافذة')}
      </Alert>

      {/* Header */}
      <Box 
        display="flex" 
        alignItems="center" 
        gap={2} 
        mb={3}
        flexDirection={isMobile ? 'column' : 'row'}
        sx={{ 
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          fullWidth={isMobile}
          sx={{
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.grey[800] 
              : theme.palette.background.paper,
            borderColor: theme.palette.mode === 'dark' 
              ? theme.palette.grey[700] 
              : theme.palette.divider,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[700] 
                : theme.palette.action.hover,
              borderColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[600] 
                : theme.palette.primary.main,
            },
          }}
        >
          {t('products:inventory.backToProducts', 'العودة للمنتجات')}
        </Button>
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          component="h1"
          sx={{ 
            flex: isMobile ? 'none' : 1,
            textAlign: isMobile ? 'center' : 'right',
            color: theme.palette.text.primary,
          }}
        >
          {t('products:inventory.title', 'إدارة المخزون')}
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
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.grey[900] 
              : theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.grey[800] 
              : theme.palette.grey[50],
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2,
          }}
        >
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            sx={{ 
              color: theme.palette.text.primary,
              mb: selectedVariant ? 1 : 0,
            }}
          >
            {t('products:inventory.variantDetails', 'تفاصيل المتغير')}
          </Typography>
          {selectedVariant && (
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: isMobile ? '0.875rem' : '1rem',
              }}
            >
              {selectedVariant.sku || t('products:variants.noSku', 'بدون SKU')}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.grey[900] 
              : theme.palette.background.paper,
            pt: 3,
          }}
        >
          {selectedVariant && (
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Variant Card */}
              <VariantCard
                variant={selectedVariant}
                showActions={false}
              />

              {/* Management Components */}
              <Box 
                display="grid" 
                gap={2}
                sx={{
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                }}
              >
                <StockManager
                  variant={selectedVariant}
                  onStockUpdate={handleStockUpdate}
                />
                <PricingManager
                  variant={selectedVariant}
                  productId={selectedVariant.productId}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.grey[800] 
              : theme.palette.grey[50],
            borderTop: `1px solid ${theme.palette.divider}`,
            pt: 2,
            px: 3,
            pb: 2,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0,
          }}
        >
          <Button 
            onClick={handleCloseDialog}
            variant="contained"
            fullWidth={isMobile}
            sx={{
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.primary.dark 
                : theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? theme.palette.primary.main 
                  : theme.palette.primary.dark,
              },
            }}
          >
            {t('common:actions.close', 'إغلاق')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import {
  AttachMoney,
  Edit,
  Save,
  Cancel,
  TrendingUp,
  TrendingDown,
  RemoveRedEye,
} from '@mui/icons-material';
import { useVariantPrice, useProductPriceRange } from '../hooks/useProducts';
import { useSimpleCurrency } from '@/shared/hooks/useSimpleCurrency';
import type { Variant } from '../types/product.types';

interface PricingManagerProps {
  variant: Variant;
  productId?: string;
}

export const PricingManager: React.FC<PricingManagerProps> = ({
  variant,
  productId,
}) => {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(variant.price.toString());
  const [compareAtPrice, setCompareAtPrice] = useState(variant.compareAtPrice?.toString() || '');
  const [costPrice, setCostPrice] = useState(variant.costPrice?.toString() || '');

  const { selectedCurrency } = useSimpleCurrency();
  const { data: priceInfo, isLoading: loadingPrice } = useVariantPrice(variant._id, selectedCurrency);
  const { data: priceRange } = useProductPriceRange(productId || '', selectedCurrency);

  const handleUpdatePrice = () => {
    // This would typically call an API to update the price
    // For now, we'll just close the dialog
    setOpen(false);
  };

  const getDiscountPercentage = () => {
    if (variant.compareAtPrice && variant.compareAtPrice > variant.price) {
      return Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100);
    }
    return 0;
  };

  const getProfitMargin = () => {
    if (variant.costPrice && variant.costPrice > 0) {
      return Math.round(((variant.price - variant.costPrice) / variant.costPrice) * 100);
    }
    return null;
  };

  const discountPercentage = getDiscountPercentage();
  const profitMargin = getProfitMargin();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <AttachMoney color="primary" />
          <Typography variant="h6" component="div">
            إدارة التسعير
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="body1">السعر الحالي:</Typography>
          <Chip
            label={loadingPrice ? 'جاري التحميل...' : priceInfo?.formatted || `${variant.price} $`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="body2" color="text.secondary">
              السعر الأصلي:
            </Typography>
            <Typography
              variant="body2"
              sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
            >
              {variant.compareAtPrice} $
            </Typography>
            <Chip
              label={`خصم ${discountPercentage}%`}
              color="error"
              size="small"
              icon={<TrendingDown />}
            />
          </Box>
        )}

        {variant.costPrice && (
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="body2" color="text.secondary">
              سعر التكلفة:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {variant.costPrice} $
            </Typography>
            {profitMargin !== null && (
              <Chip
                label={`ربح ${profitMargin}%`}
                color={profitMargin > 0 ? 'success' : 'error'}
                size="small"
                icon={<TrendingUp />}
              />
            )}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Price Range for Product */}
        {priceRange && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              نطاق الأسعار (المنتج)
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="body2">
                من {priceRange.min} $ إلى {priceRange.max} $
              </Typography>
              <Tooltip title="عرض جميع أسعار المتغيرات">
                <IconButton size="small">
                  <RemoveRedEye fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}

        <Button variant="contained" startIcon={<Edit />} onClick={() => setOpen(true)} fullWidth>
          تحديث الأسعار
        </Button>
      </CardContent>

      {/* Update Price Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تحديث الأسعار</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Alert severity="info" sx={{ mb: 2 }}>
              الأسعار بالدولار الأمريكي (USD)
            </Alert>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="السعر الأساسي *"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  helperText="السعر الذي يراه العملاء"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="السعر الأصلي (للعرض)"
                  type="number"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  helperText="السعر الأصلي قبل الخصم (اختياري)"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="سعر التكلفة"
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  helperText="تكلفة المنتج (لحساب الربحية)"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            </Grid>

            {price && !isNaN(Number(price)) && (
              <Alert severity="info">
                {compareAtPrice && Number(compareAtPrice) > Number(price) && (
                  <Box>
                    خصم:{' '}
                    {Math.round(
                      ((Number(compareAtPrice) - Number(price)) / Number(compareAtPrice)) * 100
                    )}
                    %
                  </Box>
                )}
                {costPrice && Number(costPrice) > 0 && (
                  <Box>
                    هامش الربح:{' '}
                    {Math.round(((Number(price) - Number(costPrice)) / Number(costPrice)) * 100)}%
                  </Box>
                )}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} startIcon={<Cancel />}>
            إلغاء
          </Button>
          <Button
            onClick={handleUpdatePrice}
            variant="contained"
            startIcon={<Save />}
            disabled={!price || isNaN(Number(price))}
          >
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

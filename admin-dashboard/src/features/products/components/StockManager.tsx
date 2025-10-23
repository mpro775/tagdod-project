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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Inventory,
  Edit,
  Add,
  Remove,
  Save,
  Cancel,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useUpdateStock, useCheckAvailability } from '../hooks/useProducts';
import type { Variant, StockUpdateRequest } from '../types/product.types';

interface StockManagerProps {
  variant: Variant;
  onStockUpdate?: (variant: Variant) => void;
}

export const StockManager: React.FC<StockManagerProps> = ({
  variant,
  onStockUpdate,
}) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [operation, setOperation] = useState<'add' | 'subtract' | 'set'>('set');
  const [reason, setReason] = useState('');
  const [checkQuantity, setCheckQuantity] = useState(1);

  const { mutate: updateStock, isPending } = useUpdateStock();
  const { data: availability, isLoading: checkingAvailability } = useCheckAvailability(
    variant._id,
    checkQuantity
  );

  const handleUpdateStock = () => {
    if (!quantity || isNaN(Number(quantity))) {
      return;
    }

    const stockData: StockUpdateRequest = {
      quantity: Number(quantity),
      operation,
      reason: reason || undefined,
    };

    updateStock(
      { variantId: variant._id, data: stockData },
      {
        onSuccess: (updatedVariant) => {
          onStockUpdate?.(updatedVariant);
          setOpen(false);
          setQuantity('');
          setReason('');
        },
      }
    );
  };

  const getStockStatus = () => {
    if (variant.stock === 0) {
      return { label: 'نفذ', color: 'error' as const, icon: <Warning /> };
    } else if (variant.stock <= variant.minStock) {
      return { label: 'مخزون منخفض', color: 'warning' as const, icon: <Warning /> };
    } else {
      return { label: 'متوفر', color: 'success' as const, icon: <CheckCircle /> };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Inventory color="primary" />
          <Typography variant="h6" component="div">
            إدارة المخزون
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="body1">المخزون الحالي:</Typography>
          <Chip
            label={`${variant.stock} وحدة`}
            color={stockStatus.color}
            icon={stockStatus.icon}
            variant="outlined"
          />
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="body2" color="text.secondary">
            الحد الأدنى:
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {variant.minStock} وحدة
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="body2" color="text.secondary">
            تتبع المخزون:
          </Typography>
          <Chip
            label={variant.trackInventory ? 'مفعل' : 'معطل'}
            color={variant.trackInventory ? 'success' : 'default'}
            size="small"
          />
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Typography variant="body2" color="text.secondary">
            السماح بالطلب المسبق:
          </Typography>
          <Chip
            label={variant.allowBackorder ? 'مسموح' : 'غير مسموح'}
            color={variant.allowBackorder ? 'success' : 'default'}
            size="small"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Availability Check */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            فحص التوفر
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            <TextField
              size="small"
              type="number"
              value={checkQuantity}
              onChange={(e) => setCheckQuantity(Number(e.target.value))}
              sx={{ width: 100 }}
              inputProps={{ min: 1 }}
            />
            <Typography variant="body2">وحدة</Typography>
            {checkingAvailability ? (
              <CircularProgress size={20} />
            ) : availability ? (
              <Chip
                label={availability.available ? 'متوفر' : 'غير متوفر'}
                color={availability.available ? 'success' : 'error'}
                size="small"
              />
            ) : null}
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => setOpen(true)}
          fullWidth
        >
          تحديث المخزون
        </Button>
      </CardContent>

      {/* Update Stock Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تحديث المخزون</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Alert severity="info" sx={{ mb: 2 }}>
              المخزون الحالي: {variant.stock} وحدة
            </Alert>

            <FormControl fullWidth>
              <InputLabel>نوع العملية</InputLabel>
              <Select
                value={operation}
                onChange={(e) => setOperation(e.target.value as any)}
                label="نوع العملية"
              >
                <MenuItem value="set">تعيين قيمة جديدة</MenuItem>
                <MenuItem value="add">إضافة</MenuItem>
                <MenuItem value="subtract">طرح</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="الكمية"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              helperText={
                operation === 'set'
                  ? 'أدخل الكمية الجديدة'
                  : operation === 'add'
                  ? 'أدخل الكمية المراد إضافتها'
                  : 'أدخل الكمية المراد طرحها'
              }
              inputProps={{ min: 0 }}
            />

            <TextField
              fullWidth
              label="السبب (اختياري)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              rows={2}
              placeholder="مثال: وصول شحنة جديدة، إرجاع منتج..."
            />

            {quantity && !isNaN(Number(quantity)) && (
              <Alert severity="info">
                {operation === 'set' && (
                  <>المخزون الجديد سيكون: {Number(quantity)} وحدة</>
                )}
                {operation === 'add' && (
                  <>المخزون الجديد سيكون: {variant.stock + Number(quantity)} وحدة</>
                )}
                {operation === 'subtract' && (
                  <>المخزون الجديد سيكون: {Math.max(0, variant.stock - Number(quantity))} وحدة</>
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
            onClick={handleUpdateStock}
            variant="contained"
            startIcon={isPending ? <CircularProgress size={20} /> : <Save />}
            disabled={isPending || !quantity || isNaN(Number(quantity))}
          >
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

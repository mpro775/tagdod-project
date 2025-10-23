import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Close, Person, LocationOn } from '@mui/icons-material';
import { Cart } from '../types/cart.types';
import { useConvertCartToOrder } from '../hooks/useCart';
import { formatCurrency } from '../api/cartApi';

interface ConvertToOrderDialogProps {
  cart: Cart | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export const ConvertToOrderDialog: React.FC<ConvertToOrderDialogProps> = ({
  cart,
  open,
  onClose,
  onSuccess,
}) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
  });

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'اليمن',
  });

  const [errors, setErrors] = useState<Partial<CustomerInfo & ShippingAddress>>({});

  const convertMutation = useConvertCartToOrder();

  // Initialize form with cart user data if available
  React.useEffect(() => {
    if (cart?.user) {
      setCustomerInfo({
        name: cart.user.name || '',
        email: cart.user.email || '',
        phone: cart.user.phone || '',
      });
    }
  }, [cart]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo & ShippingAddress> = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = 'اسم العميل مطلوب';
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    }

    if (!shippingAddress.street.trim()) {
      newErrors.street = 'عنوان الشارع مطلوب';
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = 'المدينة مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!cart || !validateForm()) {
      return;
    }

    try {
      await convertMutation.mutateAsync({
        cartId: cart._id,
        customerInfo,
        shippingAddress,
      });

      onSuccess();
      handleClose();
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleClose = () => {
    setCustomerInfo({ name: '', email: '', phone: '' });
    setShippingAddress({ street: '', city: '', state: '', postalCode: '', country: 'اليمن' });
    setErrors({});
    onClose();
  };

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleShippingAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!cart) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">تحويل السلة إلى طلب</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Cart Summary */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            ملخص السلة
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                عدد المنتجات
              </Typography>
              <Typography variant="body1">{cart.items?.length || 0} منتج</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                القيمة الإجمالية
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(cart.pricingSummary?.total || 0, cart.currency)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Customer Information */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
            معلومات العميل
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="اسم العميل"
                value={customerInfo.name}
                onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="البريد الإلكتروني"
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="رقم الهاتف"
                value={customerInfo.phone}
                onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                required
              />
            </Grid>
          </Grid>
        </Box>

        {/* Shipping Address */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
            عنوان الشحن
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="عنوان الشارع"
                value={shippingAddress.street}
                onChange={(e) => handleShippingAddressChange('street', e.target.value)}
                error={!!errors.street}
                helperText={errors.street}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="المدينة"
                value={shippingAddress.city}
                onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                error={!!errors.city}
                helperText={errors.city}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="المحافظة"
                value={shippingAddress.state}
                onChange={(e) => handleShippingAddressChange('state', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="الرمز البريدي"
                value={shippingAddress.postalCode}
                onChange={(e) => handleShippingAddressChange('postalCode', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>البلد</InputLabel>
                <Select
                  value={shippingAddress.country}
                  onChange={(e) => handleShippingAddressChange('country', e.target.value)}
                  label="البلد"
                >
                  <MenuItem value="اليمن">اليمن</MenuItem>
                  <MenuItem value="السعودية">السعودية</MenuItem>
                  <MenuItem value="الإمارات">الإمارات</MenuItem>
                  <MenuItem value="قطر">قطر</MenuItem>
                  <MenuItem value="الكويت">الكويت</MenuItem>
                  <MenuItem value="البحرين">البحرين</MenuItem>
                  <MenuItem value="عمان">عمان</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Error Alert */}
        {convertMutation.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {convertMutation.error.message}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={convertMutation.isPending}>
          إلغاء
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={convertMutation.isPending}
          startIcon={convertMutation.isPending ? <CircularProgress size={20} /> : null}
        >
          {convertMutation.isPending ? 'جاري التحويل...' : 'تحويل إلى طلب'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConvertToOrderDialog;

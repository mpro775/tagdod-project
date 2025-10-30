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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
    country: t('cart.dialogs.convertToOrder.defaultCountry'),
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
      newErrors.name = t('cart.validation.customerNameRequired');
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = t('cart.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = t('cart.validation.emailInvalid');
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = t('cart.validation.phoneRequired');
    }

    if (!shippingAddress.street.trim()) {
      newErrors.street = t('cart.validation.streetRequired');
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = t('cart.validation.cityRequired');
    }

    if (!shippingAddress.country.trim()) {
      newErrors.country = t('cart.validation.countryRequired');
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
    setShippingAddress({ street: '', city: '', state: '', postalCode: '', country: t('cart.dialogs.convertToOrder.defaultCountry') });
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
          <Typography variant="h6">{t('cart.dialogs.convertToOrder.title')}</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Cart Summary */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            {t('cart.dialogs.convertToOrder.cartSummary')}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                {t('cart.list.columns.itemsCount')}
              </Typography>
              <Typography variant="body1">
                {cart.items?.length === 1
                  ? t('cart.list.items.single')
                  : t('cart.list.items.count', { count: cart.items?.length || 0 })
                }
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                {t('cart.list.columns.totalValue')}
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
            {t('cart.dialogs.convertToOrder.customerInfo')}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('cart.dialogs.convertToOrder.fields.customerName')}
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
                label={t('cart.dialogs.convertToOrder.fields.email')}
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
                label={t('cart.dialogs.convertToOrder.fields.phone')}
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
            {t('cart.dialogs.convertToOrder.shippingAddress')}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('cart.dialogs.convertToOrder.fields.street')}
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
                label={t('cart.dialogs.convertToOrder.fields.city')}
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
                label={t('cart.dialogs.convertToOrder.fields.state')}
                value={shippingAddress.state}
                onChange={(e) => handleShippingAddressChange('state', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('cart.dialogs.convertToOrder.fields.postalCode')}
                value={shippingAddress.postalCode}
                onChange={(e) => handleShippingAddressChange('postalCode', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>{t('cart.dialogs.convertToOrder.fields.country')}</InputLabel>
                <Select
                  value={shippingAddress.country}
                  onChange={(e) => handleShippingAddressChange('country', e.target.value)}
                  label={t('cart.dialogs.convertToOrder.fields.country')}
                >
                  <MenuItem value={t('cart.dialogs.convertToOrder.defaultCountry')}>
                    {t('cart.dialogs.convertToOrder.defaultCountry')}
                  </MenuItem>
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
          {t('cart.actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={convertMutation.isPending}
          startIcon={convertMutation.isPending ? <CircularProgress size={20} /> : null}
        >
          {convertMutation.isPending ? t('cart.messages.loading') : t('cart.dialogs.convertToOrder.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConvertToOrderDialog;

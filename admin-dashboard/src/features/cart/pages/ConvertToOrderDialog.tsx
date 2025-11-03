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
  useTheme,
  Divider,
} from '@mui/material';
import { Close, Person, LocationOn } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
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
  const { t } = useTranslation('cart');
  const theme = useTheme();
  const { isMobile } = useBreakpoint();

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
  });

  // Get default country from translations
  const defaultCountry = t('dialogs.convertToOrder.defaultCountry');

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: defaultCountry,
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
    // Reset shipping address when dialog opens
    if (open && cart) {
      setShippingAddress({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: defaultCountry,
      });
    }
  }, [cart, open, defaultCountry]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo & ShippingAddress> = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = t('validation.customerNameRequired');
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = t('validation.emailInvalid');
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = t('validation.phoneRequired');
    }

    if (!shippingAddress.street.trim()) {
      newErrors.street = t('validation.streetRequired');
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = t('validation.cityRequired');
    }

    if (!shippingAddress.country.trim()) {
      newErrors.country = t('validation.countryRequired');
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
    setShippingAddress({ street: '', city: '', state: '', postalCode: '', country: defaultCountry });
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

  // Country options with translations
  const countries = React.useMemo(() => [
    { value: 'yemen', label: t('dialogs.convertToOrder.countries.yemen') },
    { value: 'saudi', label: t('dialogs.convertToOrder.countries.saudi') },
    { value: 'uae', label: t('dialogs.convertToOrder.countries.uae') },
    { value: 'qatar', label: t('dialogs.convertToOrder.countries.qatar') },
    { value: 'kuwait', label: t('dialogs.convertToOrder.countries.kuwait') },
    { value: 'bahrain', label: t('dialogs.convertToOrder.countries.bahrain') },
    { value: 'oman', label: t('dialogs.convertToOrder.countries.oman') },
  ], [t]);

  if (!cart) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          fontSize: { xs: '1.125rem', sm: '1.25rem' },
          color: 'text.primary',
          pb: 1,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                fontWeight: 'bold',
              }}
            >
              {t('dialogs.convertToOrder.title')}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClose} 
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent 
        dividers
        sx={{ 
          borderColor: 'divider',
          p: { xs: 2, sm: 3 },
        }}
      >
        {/* Cart Summary */}
        <Box mb={3}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 2,
            }}
          >
            {t('dialogs.convertToOrder.cartSummary')}
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                >
                  {t('list.columns.itemsCount')}
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    color: 'text.primary',
                    fontWeight: 'medium',
                  }}
                >
                  {cart.items?.length === 1
                    ? t('list.items.single')
                    : t('list.items.count', { count: cart.items?.length || 0 })
                  }
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                >
                  {t('list.columns.totalValue')}
                </Typography>
                <Typography 
                  variant="h6" 
                  color="primary.main"
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    fontWeight: 'bold',
                  }}
                >
                  {formatCurrency(cart.pricingSummary?.total || 0, cart.currency)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'divider' }} />

        {/* Customer Information */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Person sx={{ color: 'primary.main', fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
            <Typography 
              variant="h6"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 'bold',
                color: 'text.primary',
              }}
            >
              {t('dialogs.convertToOrder.customerInfo')}
            </Typography>
          </Box>
          <Grid container spacing={{ xs: 2, sm: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('dialogs.convertToOrder.fields.customerName')}
                value={customerInfo.name}
                onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('dialogs.convertToOrder.fields.email')}
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('dialogs.convertToOrder.fields.phone')}
                value={customerInfo.phone}
                onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                required
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'divider' }} />

        {/* Shipping Address */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <LocationOn sx={{ color: 'primary.main', fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
            <Typography 
              variant="h6"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 'bold',
                color: 'text.primary',
              }}
            >
              {t('dialogs.convertToOrder.shippingAddress')}
            </Typography>
          </Box>
          <Grid container spacing={{ xs: 2, sm: 2 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('dialogs.convertToOrder.fields.street')}
                value={shippingAddress.street}
                onChange={(e) => handleShippingAddressChange('street', e.target.value)}
                error={!!errors.street}
                helperText={errors.street}
                required
                multiline
                rows={isMobile ? 2 : 3}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('dialogs.convertToOrder.fields.city')}
                value={shippingAddress.city}
                onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                error={!!errors.city}
                helperText={errors.city}
                required
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('dialogs.convertToOrder.fields.state')}
                value={shippingAddress.state}
                onChange={(e) => handleShippingAddressChange('state', e.target.value)}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('dialogs.convertToOrder.fields.postalCode')}
                value={shippingAddress.postalCode}
                onChange={(e) => handleShippingAddressChange('postalCode', e.target.value)}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>{t('dialogs.convertToOrder.fields.country')}</InputLabel>
                <Select
                  value={shippingAddress.country}
                  onChange={(e) => handleShippingAddressChange('country', e.target.value)}
                  label={t('dialogs.convertToOrder.fields.country')}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                  }}
                >
                  {countries.map((country) => (
                    <MenuItem key={country.value} value={country.label}>
                      {country.label}
                    </MenuItem>
                  ))}
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

      <DialogActions
        sx={{ 
          p: { xs: 1.5, sm: 2, md: 3 },
          borderTop: 1,
          borderColor: 'divider',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Button 
          onClick={handleClose} 
          disabled={convertMutation.isPending}
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'large'}
          sx={{ 
            order: { xs: 2, sm: 1 },
            minWidth: { xs: '100%', sm: 'auto' },
          }}
        >
          {t('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={convertMutation.isPending}
          startIcon={convertMutation.isPending ? <CircularProgress size={20} /> : null}
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'large'}
          sx={{ 
            order: { xs: 1, sm: 2 },
            minWidth: { xs: '100%', sm: 'auto' },
          }}
        >
          {convertMutation.isPending ? t('messages.loading') : t('dialogs.convertToOrder.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConvertToOrderDialog;

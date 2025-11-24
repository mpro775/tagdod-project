import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  useTheme,
  Divider,
} from '@mui/material';
import { Close, Email } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { Cart } from '../types/cart.types';
import { useSendCartReminder } from '../hooks/useCart';
import { formatCurrency } from '../api/cartApi';

interface SendReminderDialogProps {
  cart: Cart | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ReminderType = 'first' | 'second' | 'final';

export const SendReminderDialog: React.FC<SendReminderDialogProps> = ({
  cart,
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('cart');
  const theme = useTheme();
  const { isMobile } = useBreakpoint();

  const reminderTypes = React.useMemo(
    () => [
      {
        value: 'first',
        label: t('dialogs.sendReminder.types.first'),
        description: t('dialogs.sendReminder.types.firstDesc'),
      },
      {
        value: 'second',
        label: t('dialogs.sendReminder.types.second'),
        description: t('dialogs.sendReminder.types.secondDesc'),
      },
      {
        value: 'final',
        label: t('dialogs.sendReminder.types.final'),
        description: t('dialogs.sendReminder.types.finalDesc'),
      },
    ],
    [t]
  );
  const [reminderType, setReminderType] = useState<ReminderType>('first');
  const [customMessage, setCustomMessage] = useState('');
  const [errors, setErrors] = useState<{ reminderType?: string; customMessage?: string }>({});

  const sendReminderMutation = useSendCartReminder();

  const validateForm = (): boolean => {
    const newErrors: { reminderType?: string; customMessage?: string } = {};

    if (!reminderType) {
      newErrors.reminderType = t('dialogs.sendReminder.types.required');
    }

    if (customMessage.length > 500) {
      newErrors.customMessage = t('dialogs.sendReminder.types.messageTooLong');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!cart || !validateForm()) {
      return;
    }

    try {
      await sendReminderMutation.mutateAsync({
        cartId: cart._id,
        reminderType,
        customMessage: customMessage.trim() || undefined,
      });

      onSuccess();
      handleClose();
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleClose = () => {
    setReminderType('first');
    setCustomMessage('');
    setErrors({});
    onClose();
  };

  const getRecommendedReminderType = (): ReminderType => {
    if (!cart) return 'first';

    const emailsSent = cart.abandonmentEmailsSent || 0;

    if (emailsSent === 0) return 'first';
    if (emailsSent === 1) return 'second';
    return 'final';
  };

  const getReminderPreview = () => {
    const type = reminderTypes.find((t) => t.value === reminderType);
    return type?.description || '';
  };

  const getCartAge = () => {
    if (!cart) return 0;
    const now = new Date();
    const lastActivity = new Date(cart.lastActivityAt || cart.updatedAt);
    return Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)); // hours
  };

  React.useEffect(() => {
    if (cart && open) {
      setReminderType(getRecommendedReminderType());
      setCustomMessage('');
      setErrors({});
    }
  }, [cart, open]);

  if (!cart) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
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
            <Email sx={{ color: 'primary.main', fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                fontWeight: 'bold',
              }}
            >
              {t('dialogs.sendReminder.title')}
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
        {/* Cart Information */}
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
            {t('dialogs.sendReminder.cartInfo')}
          </Typography>
          <Box
            display="flex"
            flexWrap="wrap"
            gap={1}
            mb={2}
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Chip
              label={t('dialogs.sendReminder.cartInfoItems', { count: cart.items?.length || 0 })}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            />
            <Chip
              label={formatCurrency(cart.pricingSummary?.total || 0, cart.currency)}
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            />
            <Chip
              label={t('dialogs.sendReminder.cartInfoAge', { hours: getCartAge() })}
              size="small"
              color="warning"
              variant="outlined"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            />
            {cart.abandonmentEmailsSent > 0 && (
              <Chip
                label={t('dialogs.sendReminder.cartInfoEmailsSent', {
                  count: cart.abandonmentEmailsSent,
                })}
                size="small"
                color="info"
                variant="outlined"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'divider' }} />

        {/* Customer Information */}
        <Box mb={3}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 1.5,
            }}
          >
            {t('dialogs.sendReminder.customerInfo')}
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
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
            >
              {cart.user?.email || cart.user?.phone || t('dialogs.sendReminder.noContactInfo')}
            </Typography>
            {cart.user?.name && (
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  color: 'text.primary',
                  fontWeight: 'medium',
                }}
              >
                {t('dialogs.sendReminder.customerName', { name: cart.user.name })}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'divider' }} />

        {/* Reminder Type Selection */}
        <Box mb={3}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 1.5,
            }}
          >
            {t('dialogs.sendReminder.type')}
          </Typography>
          <FormControl fullWidth error={!!errors.reminderType} size={isMobile ? 'small' : 'medium'}>
            <InputLabel>{t('dialogs.sendReminder.selectType')}</InputLabel>
            <Select
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value as ReminderType)}
              label={t('dialogs.sendReminder.selectType')}
              sx={{
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
              }}
            >
              {reminderTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {type.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                    >
                      {type.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.reminderType && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {errors.reminderType}
              </Typography>
            )}
          </FormControl>

          <Box mt={1.5}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            >
              {getReminderPreview()}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'divider' }} />

        {/* Custom Message */}
        <Box mb={3}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 1.5,
            }}
          >
            {t('dialogs.sendReminder.customMessage')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 3 : 4}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            error={!!errors.customMessage}
            helperText={
              errors.customMessage ||
              t('dialogs.sendReminder.charactersCount', { count: customMessage.length })
            }
            placeholder={t('dialogs.sendReminder.customMessagePlaceholder')}
            inputProps={{ maxLength: 500 }}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 3, borderColor: 'divider' }} />

        {/* Reminder Preview */}
        {reminderType && (
          <Box mb={3}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 1.5,
              }}
            >
              {t('dialogs.sendReminder.preview')}
            </Typography>
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 1 }}
              >
                <strong>{t('dialogs.sendReminder.subjectLabel')}:</strong>{' '}
                {t('dialogs.sendReminder.subject')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                {t('dialogs.sendReminder.greeting', {
                  name: cart.user?.name || t('dialogs.sendReminder.guest'),
                })}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  color: 'text.primary',
                }}
              >
                {t('dialogs.sendReminder.noticeMessage', {
                  itemsCount: cart.items?.length || 0,
                  total: formatCurrency(cart.pricingSummary?.total || 0, cart.currency),
                })}
              </Typography>
              {customMessage && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1.5,
                    fontStyle: 'italic',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    color: 'text.secondary',
                  }}
                >
                  {customMessage}
                </Typography>
              )}
              <Typography
                variant="body2"
                sx={{
                  mt: 1.5,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  color: 'text.primary',
                  fontWeight: 'medium',
                }}
              >
                {t('dialogs.sendReminder.callToAction')}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Error Alert */}
        {sendReminderMutation.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {sendReminderMutation.error.message}
          </Alert>
        )}

        {/* Coming Soon Notice */}
        <Alert
          severity="info"
          sx={{
            mb: 2,
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(33, 150, 243, 0.1)'
                : 'rgba(33, 150, 243, 0.08)',
            border: `1px solid ${
              theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)'
            }`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              color: 'text.primary',
            }}
          >
            {t('dialogs.sendReminder.comingSoon')}
          </Typography>
        </Alert>
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
          disabled={sendReminderMutation.isPending}
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
          disabled={true}
          startIcon={<Email />}
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'large'}
          sx={{
            order: { xs: 1, sm: 2 },
            minWidth: { xs: '100%', sm: 'auto' },
            opacity: 0.6,
            cursor: 'not-allowed',
          }}
        >
          {t('dialogs.sendReminder.send')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendReminderDialog;

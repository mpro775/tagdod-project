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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from '@mui/material';
import { Close, Email } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const reminderTypes = [
    {
      value: 'first',
      label: t('cart.dialogs.sendReminder.types.first', { defaultValue: 'التذكير الأول' }),
      description: t('cart.dialogs.sendReminder.types.firstDesc', {
        defaultValue: 'التذكير الأول هو التذكير الذي يرسل للعميل في البداية',
      }),
    },
    {
      value: 'second',
      label: t('cart.dialogs.sendReminder.types.second', { defaultValue: 'التذكير الثاني' }),
      description: t('cart.dialogs.sendReminder.types.secondDesc', {
        defaultValue: 'التذكير الثاني هو التذكير الذي يرسل للعميل بعد التذكير الأول',
      }),
    },
    {
      value: 'final',
      label: t('cart.dialogs.sendReminder.types.final', { defaultValue: 'التذكير الأخير' }),
      description: t('cart.dialogs.sendReminder.types.finalDesc', {
        defaultValue: 'التذكير الأخير هو التذكير الذي يرسل للعميل بعد التذكير الثاني',
      }),
    },
  ];
  const [reminderType, setReminderType] = useState<ReminderType>('first');
  const [customMessage, setCustomMessage] = useState('');
  const [errors, setErrors] = useState<{ reminderType?: string; customMessage?: string }>({});

  const sendReminderMutation = useSendCartReminder();

  const validateForm = (): boolean => {
    const newErrors: { reminderType?: string; customMessage?: string } = {};

    if (!reminderType) {
      newErrors.reminderType = t('cart.dialogs.sendReminder.types.required', {
        defaultValue: 'نوع التذكير مطلوب',
      });
    }

    if (customMessage.length > 500) {
      newErrors.customMessage = t('cart.dialogs.sendReminder.types.messageTooLong', {
        defaultValue: 'الرسالة طويلة جداً (الحد الأقصى 500 حرف)',
      });
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
    }
  }, [cart, open]);

  if (!cart) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
            {t('cart.dialogs.sendReminder.title', { defaultValue: 'إرسال تذكير للعميل' })}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Cart Information */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            {t('cart.dialogs.sendReminder.cartInfo', { defaultValue: 'معلومات السلة' })}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            <Chip
              label={`${cart.items?.length || 0} منتج`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={formatCurrency(cart.pricingSummary?.total || 0, cart.currency)}
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip label={`${getCartAge()} ساعة`} size="small" color="warning" variant="outlined" />
            {cart.abandonmentEmailsSent > 0 && (
              <Chip
                label={`${cart.abandonmentEmailsSent} إيميل مرسل`}
                size="small"
                color="info"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Customer Information */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            معلومات العميل
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {cart.user?.email || cart.user?.phone || 'لا يوجد معلومات اتصال متاحة'}
          </Typography>
          {cart.user?.name && <Typography variant="body2">الاسم: {cart.user.name}</Typography>}
        </Box>

        {/* Reminder Type Selection */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            {t('cart.dialogs.sendReminder.type', { defaultValue: 'نوع التذكير' })}
          </Typography>
          <FormControl fullWidth error={!!errors.reminderType}>
            <InputLabel>
              {t('cart.dialogs.sendReminder.selectType', { defaultValue: 'اختر نوع التذكير' })}
            </InputLabel>
            <Select
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value as ReminderType)}
              label={t('cart.dialogs.sendReminder.selectType', {
                defaultValue: 'اختر نوع التذكير',
              })}
            >
              {reminderTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box>
                    <Typography variant="body2">{type.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.reminderType && (
              <Typography variant="caption" color="error">
                {errors.reminderType}
              </Typography>
            )}
          </FormControl>

          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              {getReminderPreview()}
            </Typography>
          </Box>
        </Box>

        {/* Custom Message */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            {t('cart.dialogs.sendReminder.customMessage', {
              defaultValue: 'رسالة مخصصة (اختيارية)',
            })}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            error={!!errors.customMessage}
            helperText={errors.customMessage || `${customMessage.length}/500 حرف`}
            placeholder={t('cart.dialogs.sendReminder.customMessagePlaceholder', {
              defaultValue: 'أضف رسالة مخصصة للتذكير...',
            })}
            inputProps={{ maxLength: 500 }}
          />
        </Box>

        {/* Reminder Preview */}
        {reminderType && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              {t('cart.dialogs.sendReminder.preview', { defaultValue: 'معاينة التذكير' })}
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.300',
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('cart.dialogs.sendReminder.subject', {
                  defaultValue: 'الموضوع: تذكير - لديك منتجات في سلتك',
                })}
              </Typography>
              <Typography variant="body2">
                {t('cart.dialogs.sendReminder.greeting', { defaultValue: 'مرحباً {name},' })}{' '}
                {cart.user?.name ||
                  t('cart.dialogs.sendReminder.guest', { defaultValue: 'عزيزي العميل' })}
                ،
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                لاحظنا أن لديك {cart.items?.length || 0} منتج في سلتك بقيمة{' '}
                {formatCurrency(cart.pricingSummary?.total || 0, cart.currency)}.
              </Typography>
              {customMessage && (
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                  {customMessage}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1 }}>
                {t('cart.dialogs.sendReminder.callToAction', {
                  defaultValue: 'لا تفوت الفرصة! أكمل طلبك الآن.',
                })}
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
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={sendReminderMutation.isPending}>
          {t('cart.dialogs.sendReminder.cancel', { defaultValue: 'إلغاء' })}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={sendReminderMutation.isPending}
          startIcon={sendReminderMutation.isPending ? <CircularProgress size={20} /> : <Email />}
        >
          {sendReminderMutation.isPending
            ? t('cart.dialogs.sendReminder.sending', { defaultValue: 'جاري الإرسال...' })
            : t('cart.dialogs.sendReminder.send', { defaultValue: 'إرسال التذكير' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendReminderDialog;

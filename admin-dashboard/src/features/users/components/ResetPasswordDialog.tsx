import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, LockReset } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userPhone: string;
  userName?: string;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  open,
  onClose,
  userId,
  userPhone,
  userName,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const queryClient = useQueryClient();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: (password: string) => usersApi.resetPassword(userId, password),
    onSuccess: () => {
      toast.success(t('users:actions.resetPasswordSuccess', 'تم إعادة تعيين كلمة المرور بنجاح'));
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('users:actions.resetPasswordError', 'فشل إعادة تعيين كلمة المرور'));
    },
  });

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleSubmit = () => {
    setError('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setError(t('users:validation.passwordRequired', 'جميع الحقول مطلوبة'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('users:validation.passwordMinLength', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('users:validation.passwordMismatch', 'كلمتا المرور غير متطابقتين'));
      return;
    }

    resetPassword(newPassword);
  };

  const handleGeneratePassword = () => {
    // Generate secure random password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LockReset color="warning" />
          <Typography variant="h6">
            {t('users:actions.resetPassword', 'إعادة تعيين كلمة المرور')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* User Info */}
          <Alert severity="info" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              {t('users:labels.user', 'المستخدم')}: {userName || userPhone}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              {t('users:messages.resetPasswordWarning', 'سيتم إعادة تعيين كلمة المرور لهذا المستخدم. تأكد من إبلاغه بكلمة المرور الجديدة.')}
            </Typography>
          </Alert>

          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}

          {/* New Password */}
          <TextField
            fullWidth
            label={t('users:form.newPassword', 'كلمة المرور الجديدة')}
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isPending}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText={t('users:form.passwordHelp', 'يجب أن تكون 8 أحرف على الأقل')}
          />

          {/* Confirm Password */}
          <TextField
            fullWidth
            label={t('users:form.confirmPassword', 'تأكيد كلمة المرور')}
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Generate Password Button */}
          <Button
            variant="outlined"
            size="small"
            onClick={handleGeneratePassword}
            disabled={isPending}
            sx={{ alignSelf: 'flex-start' }}
          >
            {t('users:actions.generatePassword', 'توليد كلمة مرور عشوائية')}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={isPending}
        >
          {t('common:actions.cancel', 'إلغاء')}
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleSubmit}
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={20} /> : <LockReset />}
        >
          {isPending 
            ? t('common:loading', 'جاري التنفيذ...') 
            : t('users:actions.resetPassword', 'إعادة تعيين')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};


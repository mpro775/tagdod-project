import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export type ConfirmDialogType = 'warning' | 'error' | 'info' | 'question';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  type?: ConfirmDialogType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  cancelColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'inherit';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  type = 'question',
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  confirmColor,
  cancelColor = 'inherit',
  loading = false,
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const getIcon = () => {
    const getIconColor = (): 'error' | 'warning' | 'primary' => {
      if (type === 'error') return 'error';
      if (type === 'warning') return 'warning';
      return 'primary';
    };

    const iconProps = {
      sx: { fontSize: 48, mb: 2 },
      color: getIconColor(),
    };

    switch (type) {
      case 'error':
        return <ErrorIcon {...iconProps} />;
      case 'warning':
        return <WarningIcon {...iconProps} />;
      case 'info':
        return <InfoIcon {...iconProps} />;
      default:
        return <HelpIcon {...iconProps} />;
    }
  };

  const getConfirmColor = (): 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    if (confirmColor) return confirmColor;

    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      fullWidth
      fullScreen={fullScreen}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          pt: 3,
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {getIcon()}
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, textAlign: 'center' }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 2 }}>
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          color={cancelColor}
          sx={{ minWidth: { xs: '100%', sm: 100 } }}
        >
          {cancelText || t('actions.cancel', 'إلغاء')}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={getConfirmColor()}
          sx={{ minWidth: { xs: '100%', sm: 100 } }}
        >
          {confirmText || t('actions.confirm', 'تأكيد')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
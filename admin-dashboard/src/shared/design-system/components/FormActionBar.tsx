import type { ReactNode } from 'react';
import { Button, CircularProgress, Paper, Stack } from '@mui/material';
import { Save } from '@mui/icons-material';

export interface FormActionBarProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export function FormActionBar({
  onSubmit,
  onCancel,
  submitLabel = 'حفظ',
  cancelLabel = 'إلغاء',
  loading = false,
  disabled = false,
  children,
}: FormActionBarProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
        {children}
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
        )}
        {onSubmit && (
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={disabled || loading}
            startIcon={loading ? <CircularProgress color="inherit" size={16} /> : <Save />}
          >
            {loading ? 'جاري الحفظ...' : submitLabel}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default FormActionBar;

import { alpha, Chip, useTheme } from '@mui/material';

export type StatusChipStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'draft'
  | 'archived'
  | 'deleted'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

export interface StatusChipProps {
  label: string;
  status?: StatusChipStatus;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

const statusToTone: Record<StatusChipStatus, 'success' | 'warning' | 'error' | 'info' | 'neutral'> =
  {
    active: 'success',
    inactive: 'neutral',
    pending: 'warning',
    draft: 'neutral',
    archived: 'warning',
    deleted: 'error',
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info',
    neutral: 'neutral',
  };

export function StatusChip({
  label,
  status = 'neutral',
  size = 'small',
  variant = 'filled',
}: StatusChipProps) {
  const theme = useTheme();
  const tone = statusToTone[status];
  const toneColor = tone === 'neutral' ? theme.palette.text.secondary : theme.palette[tone].main;

  return (
    <Chip
      label={label}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 700,
        color: variant === 'filled' ? toneColor : undefined,
        bgcolor: variant === 'filled' ? alpha(toneColor, 0.1) : undefined,
        borderColor: alpha(toneColor, 0.35),
      }}
    />
  );
}

export default StatusChip;

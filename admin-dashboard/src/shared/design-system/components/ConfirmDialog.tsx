import BaseConfirmDialog from '@/shared/components/ConfirmDialog';
import type { ConfirmDialogProps, ConfirmDialogType } from '@/shared/components/ConfirmDialog';

export type { ConfirmDialogProps, ConfirmDialogType };

export function ConfirmDialog(props: ConfirmDialogProps) {
  return <BaseConfirmDialog {...props} />;
}

export default ConfirmDialog;

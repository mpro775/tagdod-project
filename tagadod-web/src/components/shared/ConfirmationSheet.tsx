import { BottomSheet } from './BottomSheet'
import { GlobalButton } from './GlobalButton'

interface ConfirmationSheetProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'danger'
  loading?: boolean
}

export function ConfirmationSheet({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'primary',
  loading,
}: ConfirmationSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title} showClose={false}>
      {message && <p className="text-sm text-tagadod-gray mb-6">{message}</p>}
      <div className="flex gap-3">
        <GlobalButton variant="ghost" onClick={onClose} className="border border-gray-300 dark:border-white/20">
          {cancelLabel}
        </GlobalButton>
        <GlobalButton
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </GlobalButton>
      </div>
    </BottomSheet>
  )
}

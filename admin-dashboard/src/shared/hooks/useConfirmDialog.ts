import { useState, useCallback } from 'react';
import { ConfirmDialogType } from '../components/ConfirmDialog';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  type?: ConfirmDialogType;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  cancelColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

export interface UseConfirmDialogReturn {
  confirmDialog: (options: ConfirmDialogOptions) => Promise<boolean>;
  isOpen: boolean;
  dialogProps: {
    open: boolean;
    title: string;
    message: string;
    type: ConfirmDialogType;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    cancelColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  };
}

export const useConfirmDialog = (): UseConfirmDialogReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogOptions, setDialogOptions] = useState<ConfirmDialogOptions & { type: ConfirmDialogType }>({
    title: '',
    message: '',
    type: 'question',
  });
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirmDialog = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogOptions({
        ...options,
        type: options.type || 'question',
      });
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
    setIsOpen(false);
    setLoading(false);
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
    setIsOpen(false);
    setLoading(false);
  }, [resolvePromise]);

  return {
    confirmDialog,
    isOpen,
    dialogProps: {
      open: isOpen,
      title: dialogOptions.title,
      message: dialogOptions.message,
      type: dialogOptions.type,
      confirmText: dialogOptions.confirmText,
      cancelText: dialogOptions.cancelText,
      confirmColor: dialogOptions.confirmColor,
      cancelColor: dialogOptions.cancelColor,
      loading,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  };
};

export default useConfirmDialog;


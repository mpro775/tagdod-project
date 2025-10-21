import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';

interface BulkGenerateDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (data: BulkGenerateData) => void;
}

interface BulkGenerateData {
  prefix: string;
  count: number;
  length: number;
  type: string;
  discountValue: number;
  validUntil: string;
}

export const BulkGenerateDialog: React.FC<BulkGenerateDialogProps> = ({
  open,
  onClose,
  onGenerate,
}) => {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<BulkGenerateData>({
    defaultValues: {
      prefix: 'COUPON',
      count: 10,
      length: 8,
      type: 'percentage',
      discountValue: 10,
      validUntil: '',
    },
  });

  const onSubmit = async (data: BulkGenerateData) => {
    setLoading(true);
    try {
      await onGenerate(data);
      reset();
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>إنشاء كوبونات مجمعة</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Controller
            name="prefix"
            control={control}
            rules={{ required: 'البادئة مطلوبة' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="بادئة الكود"
                fullWidth
                margin="normal"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="count"
            control={control}
            rules={{
              required: 'عدد الكوبونات مطلوب',
              min: { value: 1, message: 'يجب أن يكون العدد على الأقل 1' },
              max: { value: 1000, message: 'يجب ألا يزيد العدد عن 1000' },
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="عدد الكوبونات"
                type="number"
                fullWidth
                margin="normal"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="length"
            control={control}
            rules={{
              required: 'طول الكود مطلوب',
              min: { value: 4, message: 'يجب أن يكون الطول على الأقل 4' },
              max: { value: 20, message: 'يجب ألا يزيد الطول عن 20' },
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="طول الكود العشوائي"
                type="number"
                fullWidth
                margin="normal"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="type"
            control={control}
            rules={{ required: 'نوع الكوبون مطلوب' }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth margin="normal" error={!!fieldState.error}>
                <InputLabel>نوع الكوبون</InputLabel>
                <Select {...field} label="نوع الكوبون">
                  <MenuItem value="percentage">نسبة مئوية</MenuItem>
                  <MenuItem value="fixed_amount">مبلغ ثابت</MenuItem>
                  <MenuItem value="free_shipping">شحن مجاني</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="discountValue"
            control={control}
            rules={{
              required: 'قيمة الخصم مطلوبة',
              min: { value: 0, message: 'يجب أن تكون القيمة أكبر من أو تساوي 0' },
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="قيمة الخصم"
                type="number"
                fullWidth
                margin="normal"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="validUntil"
            control={control}
            rules={{ required: 'تاريخ الانتهاء مطلوب' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="تاريخ الانتهاء"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            سيتم إنشاء كوبونات بأكواد مثل: COUPON-ABC123DE
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'جاري الإنشاء...' : 'إنشاء'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

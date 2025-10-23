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
  Alert,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ContentCopy, CheckCircle } from '@mui/icons-material';
import { useBulkGenerateCoupons } from '@/features/marketing/hooks/useMarketing';

interface BulkGenerateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BulkGenerateData {
  prefix: string;
  count: number;
  length: number;
  type: string;
  discountValue: number;
  validUntil: string;
  name?: string;
  description?: string;
  minimumOrderAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
}

export const BulkGenerateDialog: React.FC<BulkGenerateDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [generatedCoupons, setGeneratedCoupons] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { mutate: bulkGenerate, isPending: loading } = useBulkGenerateCoupons();

  const { control, handleSubmit, reset, watch } = useForm<BulkGenerateData>({
    defaultValues: {
      prefix: 'COUPON',
      count: 10,
      length: 8,
      type: 'percentage',
      discountValue: 10,
      validUntil: '',
      name: '',
      description: '',
      minimumOrderAmount: 0,
      usageLimit: 0,
      usageLimitPerUser: 0,
    },
  });

  const steps = ['إعدادات أساسية', 'إعدادات متقدمة', 'مراجعة وتأكيد'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setGeneratedCoupons([]);
    setShowPreview(false);
    reset();
  };

  const onSubmit = async (data: BulkGenerateData) => {
    bulkGenerate(data, {
      onSuccess: (result) => {
        toast.success(`تم إنشاء ${result.generated} كوبون بنجاح`);
        setGeneratedCoupons(result.coupons.map((c) => c.code));
        setShowPreview(true);
        onSuccess();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'فشل في إنشاء الكوبونات');
      },
    });
  };

  const handleClose = () => {
    if (!loading) {
      handleReset();
      onClose();
    }
  };

  const handleCopyAll = () => {
    const allCodes = generatedCoupons.join('\n');
    navigator.clipboard.writeText(allCodes);
    toast.success('تم نسخ جميع أكواد الكوبونات');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('تم نسخ كود الكوبون');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">إنشاء كوبونات مجمعة</Typography>
          {showPreview && (
            <Chip
              icon={<CheckCircle />}
              label={`تم إنشاء ${generatedCoupons.length} كوبون`}
              color="success"
              variant="outlined"
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  الإعدادات الأساسية
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="prefix"
                  control={control}
                  rules={{ required: 'البادئة مطلوبة' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="بادئة الكود"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
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
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
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
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'نوع الكوبون مطلوب' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>نوع الكوبون</InputLabel>
                      <Select {...field} label="نوع الكوبون">
                        <MenuItem value="percentage">نسبة مئوية</MenuItem>
                        <MenuItem value="fixed_amount">مبلغ ثابت</MenuItem>
                        <MenuItem value="free_shipping">شحن مجاني</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
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
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
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
                      InputLabelProps={{ shrink: true }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  سيتم إنشاء كوبونات بأكواد مثل: {watch('prefix')}-ABC123DE
                </Alert>
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  الإعدادات المتقدمة
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <TextField {...field} label="اسم الكوبون" fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="minimumOrderAmount"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="الحد الأدنى للطلب" type="number" fullWidth />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="وصف الكوبون" multiline rows={3} fullWidth />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="usageLimit"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="الحد الأقصى للاستخدام" type="number" fullWidth />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="usageLimitPerUser"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="الحد الأقصى لكل مستخدم" type="number" fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  مراجعة وتأكيد
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          البادئة
                        </Typography>
                        <Typography variant="body1">{watch('prefix')}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          عدد الكوبونات
                        </Typography>
                        <Typography variant="body1">{watch('count')}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          نوع الكوبون
                        </Typography>
                        <Typography variant="body1">
                          {watch('type') === 'percentage'
                            ? 'نسبة مئوية'
                            : watch('type') === 'fixed_amount'
                            ? 'مبلغ ثابت'
                            : 'شحن مجاني'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          قيمة الخصم
                        </Typography>
                        <Typography variant="body1">
                          {watch('discountValue')} {watch('type') === 'percentage' ? '%' : 'ريال'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          تاريخ الانتهاء
                        </Typography>
                        <Typography variant="body1">{watch('validUntil')}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          الحد الأدنى للطلب
                        </Typography>
                        <Typography variant="body1">
                          {watch('minimumOrderAmount') || 'غير محدد'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Alert severity="warning">
                  <Typography variant="body2">
                    تأكد من صحة جميع البيانات قبل إنشاء الكوبونات. لا يمكن التراجع عن هذا الإجراء.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}

          {showPreview && generatedCoupons.length > 0 && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">الكوبونات المُنشأة</Typography>
                  <Button
                    startIcon={<ContentCopy />}
                    onClick={handleCopyAll}
                    variant="outlined"
                    size="small"
                  >
                    نسخ الكل
                  </Button>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={1}>
                      {generatedCoupons.map((code, index) => (
                        <Box
                          key={index}
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{
                            p: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                          >
                            {code}
                          </Typography>
                          <IconButton size="small" onClick={() => handleCopyCode(code)}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {showPreview ? 'إغلاق' : 'إلغاء'}
        </Button>
        {!showPreview && (
          <>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              السابق
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit(onSubmit)}
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'جاري الإنشاء...' : 'إنشاء الكوبونات'}
              </Button>
            ) : (
              <Button onClick={handleNext} variant="contained">
                التالي
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Avatar,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Close, Save, Image, Link as LinkIcon, Campaign } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { BANNER_LOCATION_OPTIONS, BANNER_PROMOTION_TYPE_OPTIONS } from '../types/banner.types';
import type {
  Banner,
  BannerPromotionType,
  CreateBannerDto,
  UpdateBannerDto,
} from '../types/banner.types';

interface BannerDialogProps {
  open: boolean;
  onClose: () => void;
  banner?: Banner;
  onSave: (data: CreateBannerDto | UpdateBannerDto) => void;
  isLoading?: boolean;
}

type BannerFormData = CreateBannerDto | UpdateBannerDto;

const formatDate = (dateString: string) => {
  return new Date(dateString).toISOString().split('T')[0];
};

export const BannerDialog: React.FC<BannerDialogProps> = ({
  open,
  onClose,
  banner,
  onSave,
  isLoading = false,
}) => {
  const isEditing = !!banner;
  const title = isEditing ? 'تعديل البانر' : 'إنشاء بانر جديد';

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<BannerFormData>({
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      altText: '',
      location: 'home_top' as any,
      promotionType: 'discount' as any,
      isActive: true,
      sortOrder: 0,
      startDate: '',
      endDate: '',
      displayDuration: 5000,
      targetAudiences: [],
      targetCategories: [],
      targetProducts: [],
    },
  });

  const watchedImageUrl = watch('imageUrl');
  const watchedIsActive = watch('isActive');

  useEffect(() => {
    if (banner && isEditing) {
      reset({
        title: banner.title,
        description: banner.description || '',
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl || '',
        altText: banner.altText || '',
        location: banner.location,
        promotionType: banner.promotionType || ('discount' as BannerPromotionType),
        isActive: banner.isActive,
        sortOrder: banner.sortOrder,
        startDate: banner.startDate ? formatDate(banner.startDate) : '',
        endDate: banner.endDate ? formatDate(banner.endDate) : '',
        displayDuration: banner.displayDuration || 5000,
        targetAudiences: banner.targetAudiences || [],
        targetCategories: banner.targetCategories || [],
        targetProducts: banner.targetProducts || [],
      });
    } else if (!isEditing) {
      reset({
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        altText: '',
        location: 'home_top' as any,
        promotionType: 'discount' as any,
        isActive: true,
        sortOrder: 0,
        startDate: '',
        endDate: '',
        displayDuration: 5000,
        targetAudiences: [],
        targetCategories: [],
        targetProducts: [],
      });
    }
  }, [banner, isEditing, reset]);

  const onSubmit = (data: BannerFormData) => {
    try {
      onSave(data);
    } catch (error) {
      toast.error('حدث خطأ في حفظ البيانات');
    }
  };

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm('هل تريد إلغاء التغييرات غير المحفوظة؟')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Campaign />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                المعلومات الأساسية
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'عنوان البانر مطلوب' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="عنوان البانر"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="location"
                control={control}
                rules={{ required: 'موقع العرض مطلوب' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.location}>
                    <InputLabel>موقع العرض</InputLabel>
                    <Select {...field} label="موقع العرض" disabled={isLoading}>
                      {BANNER_LOCATION_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="وصف البانر"
                    multiline
                    rows={3}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            {/* Image and Link */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                الصورة والرابط
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="imageUrl"
                control={control}
                rules={{
                  required: 'رابط الصورة مطلوب',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'يجب أن يكون رابط صورة صحيح',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="رابط الصورة"
                    error={!!errors.imageUrl}
                    helperText={errors.imageUrl?.message}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: <Image sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="linkUrl"
                control={control}
                rules={{
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'يجب أن يكون رابط صحيح',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="رابط التوجيه"
                    error={!!errors.linkUrl}
                    helperText={errors.linkUrl?.message || 'اتركه فارغاً إذا لم يكن هناك رابط'}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Image Preview */}
            {watchedImageUrl && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    معاينة الصورة:
                  </Typography>
                  <Avatar
                    src={watchedImageUrl}
                    alt="Banner preview"
                    variant="rounded"
                    sx={{
                      width: '100%',
                      maxWidth: 400,
                      height: 200,
                      mx: 'auto',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </Box>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Controller
                name="altText"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="نص بديل للصورة"
                    helperText="مهم لإمكانية الوصول"
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            {/* Settings */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                الإعدادات
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="promotionType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>نوع الترويج</InputLabel>
                    <Select {...field} label="نوع الترويج" disabled={isLoading}>
                      {BANNER_PROMOTION_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="sortOrder"
                control={control}
                rules={{
                  min: { value: 0, message: 'يجب أن يكون الترتيب أكبر من أو يساوي 0' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="ترتيب العرض"
                    type="number"
                    error={!!errors.sortOrder}
                    helperText={errors.sortOrder?.message || 'رقم أقل = أولوية أعلى'}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="displayDuration"
                control={control}
                rules={{
                  min: { value: 1000, message: 'يجب أن تكون المدة على الأقل 1000 مللي ثانية' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="مدة العرض (مللي ثانية)"
                    type="number"
                    error={!!errors.displayDuration}
                    helperText={
                      errors.displayDuration?.message || 'مدة عرض البانر في الشرائح المتحركة'
                    }
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      }
                      label={`${watchedIsActive ? 'نشط' : 'غير نشط'}`}
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Date Range */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                نطاق التاريخ
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="تاريخ البداية"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="تاريخ النهاية"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
          disabled={isLoading}
        >
          {isLoading ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

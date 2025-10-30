import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useCreateBanner, useUpdateBanner, useBanner } from '../hooks/useBanners';
import {
  BANNER_LOCATION_OPTIONS,
  BANNER_PROMOTION_TYPE_OPTIONS,
  BannerPromotionType,
} from '../types/banner.types';
import type { CreateBannerDto, UpdateBannerDto } from '../types/banner.types';

type BannerFormData = CreateBannerDto | UpdateBannerDto;

// Using the imported options from types

export const BannerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { t } = useTranslation('banners');

  const { data: banner, isLoading: loadingBanner } = useBanner(id!, {
    enabled: isEditing,
  });

  const { mutate: createBanner, isPending: creating } = useCreateBanner();
  const { mutate: updateBanner, isPending: updating } = useUpdateBanner();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BannerFormData>({
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      altText: '',
      location: BANNER_LOCATION_OPTIONS[0].value,
      promotionType: BannerPromotionType.DISCOUNT,
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

  const imageUrl = watch('imageUrl');

  useEffect(() => {
    if (banner && isEditing) {
      reset({
        title: banner.title,
        description: banner.description,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl,
        altText: banner.altText,
        location: banner.location,
        promotionType: banner.promotionType,
        isActive: banner.isActive,
        sortOrder: banner.sortOrder,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
        displayDuration: banner.displayDuration,
        targetAudiences: banner.targetAudiences,
        targetCategories: banner.targetCategories,
        targetProducts: banner.targetProducts,
      });
    }
  }, [banner, isEditing, reset]);

  const onSubmit = (data: BannerFormData) => {
    if (isEditing) {
      updateBanner(
        { id: id!, data },
        {
          onSuccess: () => {
            toast.success(t('messages.updated'));
            navigate('/banners');
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || t('messages.updateError'));
          },
        }
      );
    } else {
      createBanner(data as CreateBannerDto, {
        onSuccess: () => {
          toast.success(t('messages.created'));
          navigate('/banners');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error?.message || t('messages.createError'));
        },
      });
    }
  };

  if (loadingBanner) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/banners')}
          variant="outlined"
        >
          {t('back')}
        </Button>
        <Typography variant="h4" component="h1">
          {isEditing ? t('editBanner') : t('createBanner')}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {t('basicInfo')}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.title.label')}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.location.label')}
                    error={!!errors.location}
                    helperText={errors.location?.message}
                  />
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
                    multiline
                    rows={3}
                    fullWidth
                    label={t('form.description.label')}
                  />
              )}
              />
            </Grid>

            {/* Image and Link */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {t('imageAndLink')}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="imageUrl"
                control={control}
                rules={{
                  required: t('form.imageUrl.required'),
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: t('form.imageUrl.invalid'),
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.imageUrl.label')}
                    error={!!error}
                    helperText={error?.message || t('form.imageUrl.helper')}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="linkUrl"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.linkUrl.label')}
                    error={!!error}
                    helperText={error?.message || t('form.linkUrl.helper')}
                  />
                )}
              />
            </Grid>

            {imageUrl && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('form.imagePreview')}
                  </Typography>
                  <Box
                    component="img"
                    src={imageUrl}
                    alt="Banner preview"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      objectFit: 'contain',
                      borderRadius: 1,
                      boxShadow: 1,
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
                    label={t('form.altText.label')}
                    type="text"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            {/* Settings */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {t('settings')}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="promotionType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>{t('form.promotionType.label')}</InputLabel>
                    <Select
                      {...field}
                      label={t('form.promotionType.label')}
                      value={field.value || ''}
                    >
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
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.sortOrder.label')}
                    type="number"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="displayDuration"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.displayDuration.label')}
                    type="number"
                    InputProps={{ inputProps: { min: 1000 } }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={watch('isActive')}
                      onChange={(e) => setValue('isActive', e.target.checked)}
                    />
                  }
                  label={t('form.isActive.label')}
                />
              </Box>
            </Grid>

            {/* Date Range */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {t('dateRange')}
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
                    label={t('form.startDate.label')}
                    type="date"
                    InputLabelProps={{ shrink: true }}
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
                    label={t('form.endDate.label')}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            {/* Submit Button */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/banners')}
                  disabled={creating || updating}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={creating || updating ? <CircularProgress size={20} /> : <Save />}
                  disabled={creating || updating}
                >
                  {creating || updating ? t('saving') : t('save')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

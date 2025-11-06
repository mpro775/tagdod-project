import React, { useEffect, useState } from 'react';
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
  BannerLocation,
  BannerPromotionType,
} from '../types/banner.types';
import type { CreateBannerDto, UpdateBannerDto } from '../types/banner.types';
import { ImageField, MediaCategory } from '@/features/media';
import type { Media } from '@/features/media/types/media.types';

type BannerFormData = CreateBannerDto | UpdateBannerDto;

// Using the imported options from types

export const BannerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { t } = useTranslation('banners');

  // Location options with translations
  const locationOptions = [
    { value: BannerLocation.HOME_TOP },
    { value: BannerLocation.HOME_MIDDLE },
    { value: BannerLocation.HOME_BOTTOM },
    { value: BannerLocation.CATEGORY_TOP },
    { value: BannerLocation.PRODUCT_PAGE },
    { value: BannerLocation.CART_PAGE },
    { value: BannerLocation.CHECKOUT_PAGE },
    { value: BannerLocation.SIDEBAR },
    { value: BannerLocation.FOOTER },
  ];

  // Promotion type options with translations
  const promotionTypeOptions = [
    { value: BannerPromotionType.DISCOUNT },
    { value: BannerPromotionType.FREE_SHIPPING },
    { value: BannerPromotionType.NEW_ARRIVAL },
    { value: BannerPromotionType.SALE },
    { value: BannerPromotionType.SEASONAL },
    { value: BannerPromotionType.BRAND_PROMOTION },
  ];

  const { data: banner, isLoading: loadingBanner } = useBanner(id!, {
    enabled: isEditing,
  });

  const { mutate: createBanner, isPending: creating } = useCreateBanner();
  const { mutate: updateBanner, isPending: updating } = useUpdateBanner();

  const [selectedImage, setSelectedImage] = useState<Media | null>(null);

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
      imageId: '',
      linkUrl: '',
      altText: '',
      location: BannerLocation.HOME_TOP,
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

  useEffect(() => {
    if (banner && isEditing) {
      // Handle imageId - could be a Media object (populated) or string (ID)
      const imageId = typeof banner.imageId === 'string' 
        ? banner.imageId 
        : banner.imageId?._id || '';
      
      // If imageId is a Media object, set it for display
      if (banner.imageId && typeof banner.imageId === 'object') {
        setSelectedImage(banner.imageId);
      }

      reset({
        title: banner.title,
        description: banner.description,
        imageId: imageId,
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
    // Ensure imageId is set
    if (!data.imageId) {
      toast.error(t('form.imageUrl.required'));
      return;
    }

    // Prepare the data - only send imageId, not imageUrl
    const submitData = {
      ...data,
      imageId: data.imageId,
    };

    if (isEditing) {
      updateBanner(
        { id: id!, data: submitData },
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
      createBanner(submitData as CreateBannerDto, {
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
                  <FormControl fullWidth error={!!errors.location}>
                    <InputLabel>{t('form.location.label')}</InputLabel>
                    <Select {...field} label={t('form.location.label')}>
                      {locationOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {t(`form.location.${option.value}`)}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.location && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.location.message}
                      </Typography>
                    )}
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
                name="imageId"
                control={control}
                rules={{
                  required: t('form.imageUrl.required'),
                }}
                render={({ fieldState: { error } }) => (
                  <Box
                    sx={{
                      bgcolor: watch('imageId') ? 'background.paper' : 'grey.50',
                      border: 1,
                      borderColor: error ? 'error.main' : 'divider',
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <ImageField
                      label={t('form.imageUrl.label')}
                      value={selectedImage || undefined}
                      onChange={(media: Media | null) => {
                        setSelectedImage(media);
                        // استخراج ID من Media object
                        const mediaId = media?._id || '';
                        setValue('imageId', mediaId, { shouldValidate: true });
                      }}
                      category={MediaCategory.BANNER}
                      required
                      error={!!error}
                      helperText={error?.message || t('form.imageUrl.helper')}
                    />
                  </Box>
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
                      {promotionTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {t(`form.promotionType.${option.value}`)}
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

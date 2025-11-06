import React, { useEffect, useState } from 'react';
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
import { Close, Save, Link as LinkIcon, Campaign } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/shared/components';
import { BannerLocation, BannerPromotionType } from '../types/banner.types';
import type {
  Banner,
  CreateBannerDto,
  UpdateBannerDto,
} from '../types/banner.types';
import { ImageField, MediaCategory } from '@/features/media';
import type { Media } from '@/features/media/types/media.types';

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
  const { t } = useTranslation('banners');
  const { confirmDialog, dialogProps } = useConfirmDialog();
  const isEditing = !!banner;
  const title = isEditing ? t('editBanner') : t('createBanner');
  const titleId = `banner-dialog-title-${banner?._id || 'new'}`;
  const descriptionId = `banner-dialog-description-${banner?._id || 'new'}`;

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

  const [selectedImage, setSelectedImage] = useState<Media | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<BannerFormData>({
    defaultValues: {
      title: '',
      description: '',
      imageId: '',
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

  const watchedIsActive = watch('isActive');

  useEffect(() => {
    if (banner && isEditing) {
      // Handle imageId - could be a Media object (populated) or string (ID)
      const imageId = typeof banner.imageId === 'string' 
        ? banner.imageId 
        : banner.imageId?._id || '';
      
      // If imageId is a Media object, set it for display
      if (banner.imageId && typeof banner.imageId === 'object') {
        setSelectedImage(banner.imageId);
      } else {
        setSelectedImage(null);
      }

      reset({
        title: banner.title,
        description: banner.description || '',
        imageId: imageId,
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
      setSelectedImage(null);
      reset({
        title: '',
        description: '',
        imageId: '',
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

    try {
      onSave(submitData);
    } catch (error) {
      toast.error(t('messages.error'));
    }
  };

  const handleClose = async () => {
    if (isDirty) {
      const confirmed = await confirmDialog({
        title: t('messages.unsavedChanges', 'تغييرات غير محفوظة'),
        message: 'هل تريد إلغاء التغييرات غير المحفوظة؟',
        type: 'warning',
      });
      if (confirmed) {
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
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      PaperProps={{
        sx: { minHeight: '80vh' },
      }}
    >
      <DialogTitle id={titleId}>
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

      <DialogContent dividers id={descriptionId}>
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
                rules={{ required: t('form.title.required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.title.label')}
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
                rules={{ required: t('form.location.required') }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.location}>
                    <InputLabel>{t('form.location.label')}</InputLabel>
                    <Select {...field} label={t('form.location.label')} disabled={isLoading}>
                      {locationOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {t(`form.location.${option.value}`)}
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
                    label={t('form.description.label')}
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
                      value={selectedImage}
                      onChange={(media: Media | null) => {
                        setSelectedImage(media);
                        // استخراج ID من Media object
                        const mediaId = media?._id || media?.id || '';
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
                rules={{
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: t('form.linkUrl.invalid'),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.linkUrl.label')}
                    error={!!errors.linkUrl}
                    helperText={errors.linkUrl?.message || t('form.linkUrl.helper')}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
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
                    helperText={t('form.altText.helper')}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            {/* Settings */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
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
                    <Select {...field} label={t('form.promotionType.label')} disabled={isLoading}>
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
                rules={{
                  min: { value: 0, message: t('form.sortOrder.min') },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.sortOrder.label')}
                    type="number"
                    error={!!errors.sortOrder}
                    helperText={errors.sortOrder?.message || t('form.sortOrder.helper')}
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
                  min: { value: 1000, message: t('form.displayDuration.min') },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.displayDuration.label')}
                    type="number"
                    error={!!errors.displayDuration}
                    helperText={
                      errors.displayDuration?.message || t('form.displayDuration.helper')
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
                      label={`${watchedIsActive ? t('stats.active') : t('stats.inactive')}`}
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Date Range */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
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
                    label={t('form.endDate.label')}
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
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
          disabled={isLoading}
        >
          {isLoading ? t('saving') : t('save')}
        </Button>
      </DialogActions>

      {/* Confirm Dialog */}
      <ConfirmDialog {...dialogProps} />
    </Dialog>
  );
};

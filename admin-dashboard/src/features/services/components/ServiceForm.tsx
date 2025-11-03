import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { CitySelect } from '@/shared/components/CitySelect';

interface ServiceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  type: 'request' | 'engineer' | 'offer';
  title: string;
  initialData?: any;
  mode: 'create' | 'edit';
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  open,
  onClose,
  onSubmit,
  type,
  title,
  initialData = {},
  mode,
}) => {
  const { t } = useTranslation('services');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState<any>(initialData);
  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (type === 'request') {
      if (!formData.title) newErrors.title = t('validation.titleRequired');
      if (!formData.description) newErrors.description = t('validation.descriptionRequired');
      if (!formData.type) newErrors.type = t('validation.typeRequired');
    } else if (type === 'engineer') {
      if (!formData.engineerName) newErrors.engineerName = t('validation.engineerNameRequired');
      if (!formData.engineerPhone) newErrors.engineerPhone = t('validation.engineerPhoneRequired');
      if (!formData.city) newErrors.city = t('validation.cityRequired');
    } else if (type === 'offer') {
      if (!formData.amount) newErrors.amount = t('validation.amountRequired');
      if (!formData.engineerId) newErrors.engineerId = t('validation.engineerRequired');
      if (!formData.requestId) newErrors.requestId = t('validation.requestIdRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const renderRequestForm = () => (
    <Grid container spacing={isMobile ? 2 : 3}>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label={t('form.requestTitle')}
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={!!errors.title}
          helperText={errors.title}
          size={isMobile ? 'small' : 'medium'}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          multiline
          rows={isMobile ? 3 : 4}
          label={t('form.requestDescription')}
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          error={!!errors.description}
          helperText={errors.description}
          size={isMobile ? 'small' : 'medium'}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth error={!!errors.type} size={isMobile ? 'small' : 'medium'}>
          <InputLabel>{t('form.serviceType')}</InputLabel>
          <Select
            value={formData.type || ''}
            label={t('form.serviceType')}
            onChange={(e) => handleInputChange('type', e.target.value)}
          >
            <MenuItem value="INSTALLATION">{t('serviceTypes.installation')}</MenuItem>
            <MenuItem value="MAINTENANCE">{t('serviceTypes.maintenance')}</MenuItem>
            <MenuItem value="REPAIR">{t('serviceTypes.repair')}</MenuItem>
            <MenuItem value="CONSULTATION">{t('serviceTypes.consultation')}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CitySelect
          value={formData.city || 'صنعاء'}
          onChange={(city) => handleInputChange('city', city)}
          error={!!errors.city}
          helperText={errors.city}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label={t('form.location')}
          value={formData.location || ''}
          onChange={(e) => handleInputChange('location', e.target.value)}
          size={isMobile ? 'small' : 'medium'}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label={t('form.customerPhone')}
          value={formData.customerPhone || ''}
          onChange={(e) => handleInputChange('customerPhone', e.target.value)}
          size={isMobile ? 'small' : 'medium'}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label={t('form.customerEmail')}
          type="email"
          value={formData.customerEmail || ''}
          onChange={(e) => handleInputChange('customerEmail', e.target.value)}
          size={isMobile ? 'small' : 'medium'}
        />
      </Grid>
    </Grid>
  );

  const renderEngineerForm = () => (
    <Grid container spacing={isMobile ? 2 : 3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label={t('form.engineerName')}
          value={formData.engineerName || ''}
          onChange={(e) => handleInputChange('engineerName', e.target.value)}
          error={!!errors.engineerName}
          helperText={errors.engineerName}
          size={isMobile ? 'small' : 'medium'}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label={t('form.engineerPhone')}
          value={formData.engineerPhone || ''}
          onChange={(e) => handleInputChange('engineerPhone', e.target.value)}
          error={!!errors.engineerPhone}
          helperText={errors.engineerPhone}
          size={isMobile ? 'small' : 'medium'}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label={t('form.engineerEmail')}
          type="email"
          value={formData.engineerEmail || ''}
          onChange={(e) => handleInputChange('engineerEmail', e.target.value)}
          size={isMobile ? 'small' : 'medium'}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
          <InputLabel>{t('form.specialization')}</InputLabel>
          <Select
            value={formData.specialization || ''}
            label={t('form.specialization')}
            onChange={(e) => handleInputChange('specialization', e.target.value)}
          >
            <MenuItem value="SOLAR">{t('specializations.solar')}</MenuItem>
            <MenuItem value="ELECTRICAL">{t('specializations.electrical')}</MenuItem>
            <MenuItem value="PLUMBING">{t('specializations.plumbing')}</MenuItem>
            <MenuItem value="HVAC">{t('specializations.hvac')}</MenuItem>
            <MenuItem value="GENERAL">{t('specializations.general')}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CitySelect
          value={formData.city || 'صنعاء'}
          onChange={(city) => handleInputChange('city', city)}
          label={t('form.engineerCity')}
          required
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          multiline
          rows={isMobile ? 2 : 3}
          label={t('form.additionalNotes')}
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          size={isMobile ? 'small' : 'medium'}
        />
      </Grid>
    </Grid>
  );

  const renderOfferForm = () => (
    <Grid container spacing={isMobile ? 2 : 3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label={t('form.amount')}
          type="number"
          value={formData.amount || ''}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          error={!!errors.amount}
          helperText={errors.amount}
          size={isMobile ? 'small' : 'medium'}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label={t('form.distanceKm')}
          type="number"
          value={formData.distanceKm || ''}
          onChange={(e) => handleInputChange('distanceKm', e.target.value)}
          size={isMobile ? 'small' : 'medium'}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          multiline
          rows={isMobile ? 2 : 3}
          label={t('form.offerNotes')}
          value={formData.note || ''}
          onChange={(e) => handleInputChange('note', e.target.value)}
          size={isMobile ? 'small' : 'medium'}
        />
      </Grid>
    </Grid>
  );

  const renderForm = () => {
    switch (type) {
      case 'request':
        return renderRequestForm();
      case 'engineer':
        return renderEngineerForm();
      case 'offer':
        return renderOfferForm();
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.background.paper 
            : undefined,
        },
      }}
    >
      <DialogTitle>
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between"
          flexDirection={isMobile ? 'column' : 'row'}
          gap={isMobile ? 1 : 0}
        >
          <Typography 
            variant={isMobile ? 'h6' : 'h6'}
            sx={{
              fontSize: isMobile ? '1rem' : undefined,
            }}
          >
            {title}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={mode === 'create' ? t('form.createNew') : t('form.edit')}
              color={mode === 'create' ? 'success' : 'info'}
              size="small"
              sx={{
                fontSize: isMobile ? '0.7rem' : undefined,
              }}
            />
          </Stack>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: isMobile ? 2 : 3,
          '&.MuiDialogContent-root': {
            paddingTop: isMobile ? 2 : 3,
          },
        }}
      >
        {renderForm()}
      </DialogContent>
      <DialogActions
        sx={{
          padding: isMobile ? 2 : 3,
          flexDirection: isMobile ? 'column-reverse' : 'row',
          gap: isMobile ? 1 : 0,
          '& .MuiButton-root': {
            width: isMobile ? '100%' : 'auto',
            margin: isMobile ? '0 !important' : undefined,
          },
        }}
      >
        <Button 
          onClick={onClose} 
          startIcon={<Cancel />}
          size={isMobile ? 'medium' : 'medium'}
          variant={isMobile ? 'outlined' : 'text'}
        >
          {t('form.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          startIcon={<Save />}
          size={isMobile ? 'medium' : 'medium'}
        >
          {mode === 'create' ? t('form.create') : t('form.saveChanges')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

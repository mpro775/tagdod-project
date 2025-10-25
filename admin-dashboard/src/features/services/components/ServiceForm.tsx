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
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';

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
      if (!formData.title) newErrors.title = 'العنوان مطلوب';
      if (!formData.description) newErrors.description = 'الوصف مطلوب';
      if (!formData.type) newErrors.type = 'نوع الخدمة مطلوب';
    } else if (type === 'engineer') {
      if (!formData.engineerName) newErrors.engineerName = 'اسم المهندس مطلوب';
      if (!formData.engineerPhone) newErrors.engineerPhone = 'رقم الهاتف مطلوب';
    } else if (type === 'offer') {
      if (!formData.amount) newErrors.amount = 'المبلغ مطلوب';
      if (!formData.engineerId) newErrors.engineerId = 'المهندس مطلوب';
      if (!formData.requestId) newErrors.requestId = 'الطلب مطلوب';
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
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="عنوان الطلب"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={!!errors.title}
          helperText={errors.title}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="وصف الطلب"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          error={!!errors.description}
          helperText={errors.description}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth error={!!errors.type}>
          <InputLabel>نوع الخدمة</InputLabel>
          <Select
            value={formData.type || ''}
            label="نوع الخدمة"
            onChange={(e) => handleInputChange('type', e.target.value)}
          >
            <MenuItem value="INSTALLATION">تركيب</MenuItem>
            <MenuItem value="MAINTENANCE">صيانة</MenuItem>
            <MenuItem value="REPAIR">إصلاح</MenuItem>
            <MenuItem value="CONSULTATION">استشارة</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="الموقع"
          value={formData.location || ''}
          onChange={(e) => handleInputChange('location', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="رقم هاتف العميل"
          value={formData.customerPhone || ''}
          onChange={(e) => handleInputChange('customerPhone', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="البريد الإلكتروني"
          type="email"
          value={formData.customerEmail || ''}
          onChange={(e) => handleInputChange('customerEmail', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderEngineerForm = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="اسم المهندس"
          value={formData.engineerName || ''}
          onChange={(e) => handleInputChange('engineerName', e.target.value)}
          error={!!errors.engineerName}
          helperText={errors.engineerName}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="رقم الهاتف"
          value={formData.engineerPhone || ''}
          onChange={(e) => handleInputChange('engineerPhone', e.target.value)}
          error={!!errors.engineerPhone}
          helperText={errors.engineerPhone}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="البريد الإلكتروني"
          type="email"
          value={formData.engineerEmail || ''}
          onChange={(e) => handleInputChange('engineerEmail', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth>
          <InputLabel>التخصص</InputLabel>
          <Select
            value={formData.specialization || ''}
            label="التخصص"
            onChange={(e) => handleInputChange('specialization', e.target.value)}
          >
            <MenuItem value="SOLAR">طاقة شمسية</MenuItem>
            <MenuItem value="ELECTRICAL">كهرباء</MenuItem>
            <MenuItem value="PLUMBING">سباكة</MenuItem>
            <MenuItem value="HVAC">تكييف</MenuItem>
            <MenuItem value="GENERAL">عام</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="ملاحظات إضافية"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderOfferForm = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="المبلغ"
          type="number"
          value={formData.amount || ''}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          error={!!errors.amount}
          helperText={errors.amount}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="المسافة (كم)"
          type="number"
          value={formData.distanceKm || ''}
          onChange={(e) => handleInputChange('distanceKm', e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="ملاحظات العرض"
          value={formData.note || ''}
          onChange={(e) => handleInputChange('note', e.target.value)}
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={mode === 'create' ? 'إنشاء جديد' : 'تعديل'}
              color={mode === 'create' ? 'success' : 'info'}
              size="small"
            />
          </Stack>
        </Box>
      </DialogTitle>
      <DialogContent>{renderForm()}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<Cancel />}>
          إلغاء
        </Button>
        <Button onClick={handleSubmit} variant="contained" startIcon={<Save />}>
          {mode === 'create' ? 'إنشاء' : 'حفظ التغييرات'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

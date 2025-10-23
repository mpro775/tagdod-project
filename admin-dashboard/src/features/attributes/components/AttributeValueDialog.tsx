import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Chip,
  Stack,
} from '@mui/material';
import { Add, Edit, ColorLens, Image, Save, Cancel } from '@mui/icons-material';
import type { AttributeValue, AttributeValueFormData } from '../types/attribute.types';

interface AttributeValueDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AttributeValueFormData) => void;
  editingValue?: AttributeValue | null;
  isLoading?: boolean;
  attributeType?: string;
}

const AttributeValueDialog: React.FC<AttributeValueDialogProps> = ({
  open,
  onClose,
  onSave,
  editingValue,
  isLoading = false,
  attributeType = 'select',
}) => {
  const [formData, setFormData] = useState<AttributeValueFormData>({
    value: '',
    valueEn: '',
    hexCode: '',
    imageUrl: '',
    imageId: '',
    description: '',
    order: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingValue) {
      setFormData({
        value: editingValue.value,
        valueEn: editingValue.valueEn || '',
        hexCode: editingValue.hexCode || '',
        imageUrl: editingValue.imageUrl || '',
        imageId: editingValue.imageId || '',
        description: editingValue.description || '',
        order: editingValue.order,
        isActive: editingValue.isActive,
      });
    } else {
      setFormData({
        value: '',
        valueEn: '',
        hexCode: '',
        imageUrl: '',
        imageId: '',
        description: '',
        order: 0,
        isActive: true,
      });
    }
    setErrors({});
  }, [editingValue, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.value.trim()) {
      newErrors.value = 'القيمة مطلوبة';
    }

    if (formData.hexCode && !/^#[0-9A-Fa-f]{6}$/.test(formData.hexCode)) {
      newErrors.hexCode = 'كود اللون يجب أن يكون بصيغة HEX صحيحة (مثل #FF0000)';
    }

    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl)) {
      newErrors.imageUrl = 'رابط الصورة يجب أن يكون صحيحاً';
    }

    if (formData.order !== undefined && formData.order < 0) {
      newErrors.order = 'الترتيب يجب أن يكون أكبر من أو يساوي 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      value: '',
      valueEn: '',
      hexCode: '',
      imageUrl: '',
      imageId: '',
      description: '',
      order: 0,
      isActive: true,
    });
    setErrors({});
    onClose();
  };

  const isColorAttribute = attributeType === 'select' || attributeType === 'multiselect';
  const showImageFields = isColorAttribute;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {editingValue ? <Edit color="primary" /> : <Add color="primary" />}
          <Typography variant="h6">{editingValue ? 'تعديل القيمة' : 'إضافة قيمة جديدة'}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          {editingValue
            ? 'قم بتعديل معلومات القيمة حسب الحاجة.'
            : 'أدخل معلومات القيمة الجديدة. يمكنك إضافة كود لون أو صورة للقيمة.'}
        </Alert>

        <Grid container spacing={3}>
          {/* القيمة الأساسية */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="القيمة (عربي) *"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              error={!!errors.value}
              helperText={errors.value || 'الاسم الذي سيظهر للمستخدمين'}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Value (English)"
              value={formData.valueEn}
              onChange={(e) => setFormData({ ...formData, valueEn: e.target.value })}
              helperText="English name for the value"
            />
          </Grid>

          {/* كود اللون - للألوان فقط */}
          {isColorAttribute && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="كود اللون (Hex Code)"
                placeholder="#FF0000"
                value={formData.hexCode}
                onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                error={!!errors.hexCode}
                helperText={errors.hexCode || 'كود اللون بصيغة HEX (مثل #FF0000)'}
                InputProps={{
                  startAdornment: <ColorLens sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              {formData.hexCode && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">معاينة اللون:</Typography>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: formData.hexCode,
                      border: '1px solid #ddd',
                    }}
                  />
                  <Chip label={formData.hexCode} size="small" />
                </Box>
              )}
            </Grid>
          )}

          {/* الصورة */}
          {showImageFields && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="رابط الصورة"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  error={!!errors.imageUrl}
                  helperText={errors.imageUrl || 'رابط الصورة (اختياري)'}
                  InputProps={{
                    startAdornment: <Image sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="معرف الصورة"
                  placeholder="img_123456789"
                  value={formData.imageId}
                  onChange={(e) => setFormData({ ...formData, imageId: e.target.value })}
                  helperText="معرف الصورة في النظام (اختياري)"
                />
              </Grid>
            </>
          )}

          {/* الترتيب */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="الترتيب"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              error={!!errors.order}
              helperText={errors.order || 'ترتيب عرض القيمة (الأقل يظهر أولاً)'}
              inputProps={{ min: 0 }}
            />
          </Grid>

          {/* الوصف */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="الوصف"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              helperText="وصف إضافي للقيمة (اختياري)"
            />
          </Grid>

          {/* الحالة */}
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="نشط - القيمة متاحة للاستخدام"
            />
          </Grid>
        </Grid>

        {/* معاينة القيمة */}
        {formData.value && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              معاينة القيمة:
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              {formData.hexCode && (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: formData.hexCode,
                    border: '1px solid #ddd',
                  }}
                />
              )}
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {formData.value}
                </Typography>
                {formData.valueEn && (
                  <Typography variant="body2" color="text.secondary">
                    {formData.valueEn}
                  </Typography>
                )}
              </Box>
              <Chip
                label={formData.isActive ? 'نشط' : 'غير نشط'}
                color={formData.isActive ? 'success' : 'default'}
                size="small"
              />
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} startIcon={<Cancel />} disabled={isLoading}>
          إلغاء
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading || !formData.value.trim()}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
        >
          {editingValue ? 'تحديث' : 'إضافة'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttributeValueDialog;

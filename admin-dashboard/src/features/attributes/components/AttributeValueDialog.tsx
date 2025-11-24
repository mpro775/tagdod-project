import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { AttributeType, type AttributeValue, type AttributeValueFormData } from '../types/attribute.types';

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

interface AttributeValueDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AttributeValueFormData) => void;
  editingValue?: AttributeValue | null;
  isLoading?: boolean;
  attributeType?: AttributeType;
}

const AttributeValueDialog: React.FC<AttributeValueDialogProps> = ({
  open,
  onClose,
  onSave,
  editingValue,
  isLoading = false,
  attributeType = AttributeType.TEXT,
}) => {
  const { t } = useTranslation('attributes');
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

  const supportsVisualFields = attributeType === AttributeType.COLOR;
  const requiresHexCode = attributeType === AttributeType.COLOR;
  const showImageFields = supportsVisualFields;
  const validHexCode =
    formData.hexCode && HEX_COLOR_REGEX.test(formData.hexCode)
      ? formData.hexCode.toUpperCase()
      : undefined;
  const colorPickerValue = validHexCode ?? '#000000';

  useEffect(() => {
    if (editingValue) {
      setFormData({
        value: editingValue.value,
        valueEn: editingValue.valueEn || '',
        hexCode: editingValue.hexCode?.toUpperCase() || '',
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
      newErrors.value = t('validation.valueRequired');
    }

    if (formData.hexCode) {
      if (!HEX_COLOR_REGEX.test(formData.hexCode)) {
        newErrors.hexCode = t('validation.hexInvalid');
      }
    } else if (requiresHexCode) {
      newErrors.hexCode = t('validation.hexRequired');
    }

    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl)) {
      newErrors.imageUrl = t('validation.imageUrlInvalid');
    }

    if (formData.order !== undefined && formData.order < 0) {
      newErrors.order = t('validation.orderMin');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const payload: AttributeValueFormData = {
        ...formData,
        value: formData.value.trim(),
        valueEn: formData.valueEn?.trim() || undefined,
        hexCode: formData.hexCode ? formData.hexCode.trim().toUpperCase() : undefined,
        imageUrl: formData.imageUrl?.trim() || undefined,
        imageId: formData.imageId?.trim() || undefined,
        description: formData.description?.trim() || undefined,
      };

      onSave(payload);
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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEnforceFocus={false}
      PaperProps={{
        sx: { minHeight: '500px' },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {editingValue ? <Edit color="primary" /> : <Add color="primary" />}
          <Typography variant="h6">{editingValue ? t('valueDialog.editValue') : t('valueDialog.addValue')}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          {editingValue
            ? t('valueDialog.editDesc')
            : t('valueDialog.addDesc')}
        </Alert>

        <Grid container spacing={3}>
          {/* القيمة الأساسية */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('fields.valueAr')}
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              error={!!errors.value}
              helperText={errors.value || t('placeholders.valueAr')}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('fields.valueEn')}
              value={formData.valueEn}
              onChange={(e) => setFormData({ ...formData, valueEn: e.target.value })}
              helperText={t('placeholders.valueEn')}
            />
          </Grid>

          {/* كود اللون - للسمات التي تدعم الألوان */}
          {supportsVisualFields && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={requiresHexCode ? 1.5 : 1}>
                <TextField
                  fullWidth
                  label={`${t('fields.hexCode')}${requiresHexCode ? t('fields.hexCodeRequired').slice(-2) : ''}`}
                  placeholder={t('valueDialog.hexPlaceholder')}
                  value={formData.hexCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hexCode: e.target.value.toUpperCase() })
                  }
                  error={!!errors.hexCode}
                  helperText={
                    errors.hexCode ||
                    (requiresHexCode
                      ? t('valueDialog.hexRequired')
                      : t('valueDialog.hexOptional'))
                  }
                  required={requiresHexCode}
                  InputProps={{
                    startAdornment: <ColorLens sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />

                {requiresHexCode && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <input
                      type="color"
                      value={colorPickerValue}
                      onChange={(e) =>
                        setFormData({ ...formData, hexCode: e.target.value.toUpperCase() })
                      }
                      style={{
                        width: 48,
                        height: 32,
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        cursor: 'pointer',
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {t('valueDialog.colorPicker')}
                    </Typography>
                  </Box>
                )}

                {(validHexCode || requiresHexCode) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2">{t('valueDialog.colorPreview')}:</Typography>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: validHexCode || colorPickerValue,
                        border: '1px solid #ddd',
                      }}
                    />
                    <Chip
                      label={(validHexCode || t('valueDialog.chooseColor')).toString()}
                      color={validHexCode ? 'default' : 'warning'}
                      variant={validHexCode ? 'filled' : 'outlined'}
                      size="small"
                    />
                  </Box>
                )}
              </Stack>
            </Grid>
          )}

          {/* الصورة */}
          {showImageFields && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={t('fields.imageUrl')}
                  placeholder={t('valueDialog.imageUrlPlaceholder')}
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  error={!!errors.imageUrl}
                  helperText={errors.imageUrl || t('valueDialog.imageUrlHelper')}
                  InputProps={{
                    startAdornment: <Image sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={t('fields.imageId')}
                  placeholder={t('valueDialog.imageIdPlaceholder')}
                  value={formData.imageId}
                  onChange={(e) => setFormData({ ...formData, imageId: e.target.value })}
                  helperText={t('valueDialog.imageIdHelper')}
                />
              </Grid>
            </>
          )}

          {/* الترتيب */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label={t('fields.order')}
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              error={!!errors.order}
              helperText={errors.order || t('valueDialog.orderHelper')}
              inputProps={{ min: 0 }}
            />
          </Grid>

          {/* الوصف */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t('fields.description')}
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              helperText={t('valueDialog.descriptionHelper')}
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
              label={t('valueDialog.activeLabel')}
            />
          </Grid>
        </Grid>

        {/* معاينة القيمة */}
        {formData.value && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('valueDialog.valuePreview')}:
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
                label={formData.isActive ? t('status.active') : t('status.inactive')}
                color={formData.isActive ? 'success' : 'default'}
                size="small"
              />
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} startIcon={<Cancel />} disabled={isLoading}>
          {t('form.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading || !formData.value.trim()}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
        >
          {editingValue ? t('form.save') : t('form.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttributeValueDialog;

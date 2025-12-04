import React, { useState } from 'react';
import {
  Box,
  TextField,
  Stack,
  Typography,
  Paper,
  Button,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Edit, Delete, Star } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import type { ValueItem } from '../types/about.types';

interface AboutValuesSectionProps {
  values: ValueItem[];
  language: 'ar' | 'en';
  onChange: (values: ValueItem[]) => void;
  disabled?: boolean;
}

const emptyValue: ValueItem = {
  titleAr: '',
  titleEn: '',
  descriptionAr: '',
  descriptionEn: '',
  icon: '',
};

export const AboutValuesSection: React.FC<AboutValuesSectionProps> = ({
  values,
  language,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation('about');
  const { isMobile } = useBreakpoint();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentValue, setCurrentValue] = useState<ValueItem>(emptyValue);

  const isArabic = language === 'ar';

  const handleAdd = () => {
    setEditIndex(null);
    setCurrentValue(emptyValue);
    setDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setCurrentValue(values[index]);
    setDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const handleSave = () => {
    if (editIndex !== null) {
      const newValues = [...values];
      newValues[editIndex] = currentValue;
      onChange(newValues);
    } else {
      onChange([...values, currentValue]);
    }
    setDialogOpen(false);
    setCurrentValue(emptyValue);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setCurrentValue(emptyValue);
    setEditIndex(null);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {t('sections.values')} ({values.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          disabled={disabled}
          size={isMobile ? 'small' : 'medium'}
        >
          {t('actions.addValue')}
        </Button>
      </Stack>

      {values.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Star sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">
            {t('empty.values')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {values.map((value, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {isArabic ? value.titleAr : value.titleEn}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                    {isArabic ? value.descriptionAr : value.descriptionEn}
                  </Typography>
                  {value.icon && (
                    <Typography variant="caption" color="primary">
                      {t('fields.icon')}: {value.icon}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(index)}
                    disabled={disabled}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(index)}
                    disabled={disabled}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog for add/edit */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editIndex !== null ? t('dialogs.editValue') : t('dialogs.addValue')}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label={t('fields.titleAr')}
              value={currentValue.titleAr}
              onChange={(e) => setCurrentValue({ ...currentValue, titleAr: e.target.value })}
              dir="rtl"
            />
            <TextField
              fullWidth
              label={t('fields.titleEn')}
              value={currentValue.titleEn}
              onChange={(e) => setCurrentValue({ ...currentValue, titleEn: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label={t('fields.descriptionAr')}
              value={currentValue.descriptionAr || ''}
              onChange={(e) => setCurrentValue({ ...currentValue, descriptionAr: e.target.value })}
              dir="rtl"
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label={t('fields.descriptionEn')}
              value={currentValue.descriptionEn || ''}
              onChange={(e) => setCurrentValue({ ...currentValue, descriptionEn: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('fields.icon')}
              value={currentValue.icon || ''}
              onChange={(e) => setCurrentValue({ ...currentValue, icon: e.target.value })}
              helperText={t('helpers.icon')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('actions.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!currentValue.titleAr || !currentValue.titleEn}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


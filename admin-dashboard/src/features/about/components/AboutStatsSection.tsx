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
import { Add, Edit, Delete, TrendingUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import type { StatItem } from '../types/about.types';

interface AboutStatsSectionProps {
  stats: StatItem[];
  language: 'ar' | 'en';
  onChange: (stats: StatItem[]) => void;
  disabled?: boolean;
}

const emptyStat: StatItem = {
  labelAr: '',
  labelEn: '',
  value: '',
  icon: '',
};

export const AboutStatsSection: React.FC<AboutStatsSectionProps> = ({
  stats,
  language,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation('about');
  const { isMobile } = useBreakpoint();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentStat, setCurrentStat] = useState<StatItem>(emptyStat);

  const isArabic = language === 'ar';

  const handleAdd = () => {
    setEditIndex(null);
    setCurrentStat(emptyStat);
    setDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setCurrentStat(stats[index]);
    setDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    const newStats = stats.filter((_, i) => i !== index);
    onChange(newStats);
  };

  const handleSave = () => {
    if (editIndex !== null) {
      const newStats = [...stats];
      newStats[editIndex] = currentStat;
      onChange(newStats);
    } else {
      onChange([...stats, currentStat]);
    }
    setDialogOpen(false);
    setCurrentStat(emptyStat);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setCurrentStat(emptyStat);
    setEditIndex(null);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {t('sections.stats')} ({stats.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          disabled={disabled}
          size={isMobile ? 'small' : 'medium'}
        >
          {t('actions.addStat')}
        </Button>
      </Stack>

      {stats.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <TrendingUp sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">
            {t('empty.stats')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card sx={{ textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isArabic ? stat.labelAr : stat.labelEn}
                  </Typography>
                  {stat.icon && (
                    <Typography variant="caption" color="text.disabled">
                      {stat.icon}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
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
          {editIndex !== null ? t('dialogs.editStat') : t('dialogs.addStat')}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label={t('fields.value')}
              value={currentStat.value}
              onChange={(e) => setCurrentStat({ ...currentStat, value: e.target.value })}
              placeholder={t('placeholders.statValue')}
              helperText={t('helpers.statValue')}
            />
            <TextField
              fullWidth
              label={t('fields.labelAr')}
              value={currentStat.labelAr}
              onChange={(e) => setCurrentStat({ ...currentStat, labelAr: e.target.value })}
              dir="rtl"
            />
            <TextField
              fullWidth
              label={t('fields.labelEn')}
              value={currentStat.labelEn}
              onChange={(e) => setCurrentStat({ ...currentStat, labelEn: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('fields.icon')}
              value={currentStat.icon || ''}
              onChange={(e) => setCurrentStat({ ...currentStat, icon: e.target.value })}
              helperText={t('helpers.icon')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('actions.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!currentStat.value || !currentStat.labelAr || !currentStat.labelEn}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


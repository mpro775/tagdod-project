import React from 'react';
import { Box, TextField, MenuItem, FormControl, InputLabel, Select, Button, Stack } from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { ListProjectsParams, ProjectType, ProjectStatus } from '../types/project.types';

interface ProjectFiltersProps {
  filters: ListProjectsParams;
  onFiltersChange: (filters: ListProjectsParams) => void;
  onReset: () => void;
  loading?: boolean;
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({ filters, onFiltersChange, onReset, loading }) => {
  const { t } = useTranslation('projects');

  const handleChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('filters.search')}
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
        />
        <FormControl size="small" fullWidth>
          <InputLabel>{t('filters.type')}</InputLabel>
          <Select
            value={filters.type || ''}
            label={t('filters.type')}
            onChange={(e) => handleChange('type', e.target.value as ProjectType)}
          >
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="system">{t('types.system')}</MenuItem>
            <MenuItem value="contracting">{t('types.contracting')}</MenuItem>
            <MenuItem value="maintenance">{t('types.maintenance')}</MenuItem>
            <MenuItem value="installation">{t('types.installation')}</MenuItem>
            <MenuItem value="supply">{t('types.supply')}</MenuItem>
            <MenuItem value="partnership">{t('types.partnership')}</MenuItem>
            <MenuItem value="other">{t('types.other')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>{t('filters.status')}</InputLabel>
          <Select
            value={filters.status || ''}
            label={t('filters.status')}
            onChange={(e) => handleChange('status', e.target.value as ProjectStatus)}
          >
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="planned">{t('status.planned')}</MenuItem>
            <MenuItem value="in_progress">{t('status.in_progress')}</MenuItem>
            <MenuItem value="completed">{t('status.completed')}</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<Refresh />} onClick={onReset} disabled={loading}>
          {t('filters.reset')}
        </Button>
      </Stack>
    </Box>
  );
};

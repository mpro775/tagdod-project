import React from 'react';
import { Box, TextField, MenuItem, FormControl, InputLabel, Select, Button, Stack } from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { ListArticlesParams, ArticleType, ArticleStatus } from '../types/article.types';

interface ArticleFiltersProps { filters: ListArticlesParams; onFiltersChange: (filters: ListArticlesParams) => void; onReset: () => void; loading?: boolean; }

export const ArticleFilters: React.FC<ArticleFiltersProps> = ({ filters, onFiltersChange, onReset, loading }) => {
  const { t } = useTranslation('articles');
  const handleChange = (key: string, value: any) => { onFiltersChange({ ...filters, [key]: value, page: 1 }); };

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField fullWidth size="small" placeholder={t('filters.search')} value={filters.search || ''} onChange={(e) => handleChange('search', e.target.value)} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} />
        <FormControl size="small" fullWidth>
          <InputLabel>{t('filters.type')}</InputLabel>
          <Select value={filters.type || ''} label={t('filters.type')} onChange={(e) => handleChange('type', e.target.value as ArticleType)}>
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="news">{t('types.news')}</MenuItem>
            <MenuItem value="article">{t('types.article')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>{t('filters.status')}</InputLabel>
          <Select value={filters.status || ''} label={t('filters.status')} onChange={(e) => handleChange('status', e.target.value as ArticleStatus)}>
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="draft">{t('status.draft')}</MenuItem>
            <MenuItem value="published">{t('status.published')}</MenuItem>
            <MenuItem value="archived">{t('status.archived')}</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<Refresh />} onClick={onReset} disabled={loading}>{t('filters.reset')}</Button>
      </Stack>
    </Box>
  );
};

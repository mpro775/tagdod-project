import React from 'react';
import { Box, TextField, MenuItem, FormControl, InputLabel, Select, Button, Stack } from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { ListContactRequestsParams, RequestType, RequestStatus } from '../types/contact-request.types';

interface ContactRequestFiltersProps { filters: ListContactRequestsParams; onFiltersChange: (filters: ListContactRequestsParams) => void; onReset: () => void; loading?: boolean; }

export const ContactRequestFilters: React.FC<ContactRequestFiltersProps> = ({ filters, onFiltersChange, onReset, loading }) => {
  const { t } = useTranslation('contactRequests');
  const handleChange = (key: string, value: any) => { onFiltersChange({ ...filters, [key]: value, page: 1 }); };

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField fullWidth size="small" placeholder={t('filters.search')} value={filters.search || ''} onChange={(e) => handleChange('search', e.target.value)} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} />
        <FormControl size="small" fullWidth>
          <InputLabel>{t('filters.requestType')}</InputLabel>
          <Select value={filters.requestType || ''} label={t('filters.requestType')} onChange={(e) => handleChange('requestType', e.target.value as RequestType)}>
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="general">{t('requestTypes.general')}</MenuItem>
            <MenuItem value="technical_support">{t('requestTypes.technical_support')}</MenuItem>
            <MenuItem value="service_center">{t('requestTypes.service_center')}</MenuItem>
            <MenuItem value="maintenance">{t('requestTypes.maintenance')}</MenuItem>
            <MenuItem value="contracting">{t('requestTypes.contracting')}</MenuItem>
            <MenuItem value="partnership">{t('requestTypes.partnership')}</MenuItem>
            <MenuItem value="other">{t('requestTypes.other')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>{t('filters.status')}</InputLabel>
          <Select value={filters.status || ''} label={t('filters.status')} onChange={(e) => handleChange('status', e.target.value as RequestStatus)}>
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="new">{t('status.new')}</MenuItem>
            <MenuItem value="in_review">{t('status.in_review')}</MenuItem>
            <MenuItem value="contacted">{t('status.contacted')}</MenuItem>
            <MenuItem value="converted">{t('status.converted')}</MenuItem>
            <MenuItem value="closed">{t('status.closed')}</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<Refresh />} onClick={onReset} disabled={loading}>{t('filters.reset')}</Button>
      </Stack>
    </Box>
  );
};

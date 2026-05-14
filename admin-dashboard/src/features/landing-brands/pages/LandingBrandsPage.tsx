import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, TextField } from '@mui/material';
import { Storefront } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLandingBrands, useUpdateLandingBrand } from '../hooks/useLandingBrands';
import type { LandingBrand } from '../types/landing-brand.types';

export const LandingBrandsPage: React.FC = () => {
  const { t } = useTranslation('landingBrands');
  const [search, setSearch] = useState('');
  const { data: brandsResponse, isLoading } = useLandingBrands({ search });
  const updateMutation = useUpdateLandingBrand();
  const brands = brandsResponse?.data || [];

  const handleToggle = (brand: LandingBrand) => { updateMutation.mutate({ id: brand._id, data: { showOnLanding: !brand.showOnLanding } }); };
  const handleOrderChange = (brand: LandingBrand, value: number) => { updateMutation.mutate({ id: brand._id, data: { landingOrder: value } }); };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}><Storefront fontSize="large" color="primary" /><Typography variant="h4">{t('pageTitle')}</Typography></Box>
      <Typography variant="body2" color="text.secondary" mb={3}>{t('pageDescription')}</Typography>
      <Box mb={3}><TextField fullWidth size="small" placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} /></Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('table.columns.brand')}</TableCell>
              <TableCell align="center">{t('table.columns.showOnLanding')}</TableCell>
              <TableCell align="center">{t('table.columns.landingOrder')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (<TableRow><TableCell colSpan={3} align="center">جاري التحميل...</TableCell></TableRow>) : brands.length === 0 ? (<TableRow><TableCell colSpan={3} align="center">{t('messages.noBrands')}</TableCell></TableRow>) : brands.map((b) => (
              <TableRow key={b._id}>
                <TableCell><Box display="flex" alignItems="center" gap={2}>{b.image && <Box component="img" src={b.image} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'contain', bgcolor: 'grey.50' }} />}<Typography>{b.name}</Typography></Box></TableCell>
                <TableCell align="center"><Switch checked={b.showOnLanding} onChange={() => handleToggle(b)} disabled={updateMutation.isPending} /></TableCell>
                <TableCell align="center"><TextField type="number" size="small" value={b.landingOrder} onChange={(e) => handleOrderChange(b, parseInt(e.target.value) || 0)} sx={{ width: 80 }} disabled={updateMutation.isPending} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

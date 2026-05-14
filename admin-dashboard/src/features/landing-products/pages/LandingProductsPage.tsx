import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, TextField, IconButton, Tooltip } from '@mui/material';
import { Save, Store } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLandingProducts, useUpdateLandingProduct } from '../hooks/useLandingProducts';
import type { LandingProduct } from '../types/landing-product.types';

export const LandingProductsPage: React.FC = () => {
  const { t } = useTranslation('landingProducts');
  const [search, setSearch] = useState('');
  const { data: productsResponse, isLoading } = useLandingProducts({ search });
  const updateMutation = useUpdateLandingProduct();
  const products = productsResponse?.data || [];

  const handleToggle = (product: LandingProduct) => { updateMutation.mutate({ id: product._id, data: { showOnLanding: !product.showOnLanding } }); };
  const handleOrderChange = (product: LandingProduct, value: number) => { updateMutation.mutate({ id: product._id, data: { landingOrder: value } }); };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}><Store fontSize="large" color="primary" /><Typography variant="h4">{t('pageTitle')}</Typography></Box>
      <Typography variant="body2" color="text.secondary" mb={3}>{t('pageDescription')}</Typography>
      <Box mb={3}><TextField fullWidth size="small" placeholder={t('filters.search') || 'بحث...'} value={search} onChange={(e) => setSearch(e.target.value)} /></Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('table.columns.product')}</TableCell>
              <TableCell>{t('table.columns.brand')}</TableCell>
              <TableCell align="center">{t('table.columns.showOnLanding')}</TableCell>
              <TableCell align="center">{t('table.columns.landingOrder')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (<TableRow><TableCell colSpan={4} align="center">جاري التحميل...</TableCell></TableRow>) : products.length === 0 ? (<TableRow><TableCell colSpan={4} align="center">{t('messages.noProducts')}</TableCell></TableRow>) : products.map((p) => (
              <TableRow key={p._id}>
                <TableCell><Box display="flex" alignItems="center" gap={2}>{p.image && <Box component="img" src={p.image} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }} />}<Typography>{p.name}</Typography></Box></TableCell>
                <TableCell>{typeof p.brand === 'object' ? p.brand?.name : p.brand}</TableCell>
                <TableCell align="center"><Switch checked={p.showOnLanding} onChange={() => handleToggle(p)} disabled={updateMutation.isPending} /></TableCell>
                <TableCell align="center"><TextField type="number" size="small" value={p.landingOrder} onChange={(e) => handleOrderChange(p, parseInt(e.target.value) || 0)} sx={{ width: 80 }} disabled={updateMutation.isPending} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

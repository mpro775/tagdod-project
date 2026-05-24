import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, TextField } from '@mui/material';

import { useTranslation } from 'react-i18next';
import { PageShell, PageHeader, usePageTitle } from '@/shared/design-system';
import { useLandingProducts, useUpdateLandingProduct } from '../hooks/useLandingProducts';
import type { LandingProduct } from '../types/landing-product.types';

export const LandingProductsPage: React.FC = () => {
  const { t } = useTranslation('landingProducts');
  const pageTitle = t('pageTitle', 'منتجات صفحة الهبوط');
  usePageTitle(pageTitle);
  const [search, setSearch] = useState('');
  const { data: productsResponse, isLoading } = useLandingProducts({ search });
  const updateMutation = useUpdateLandingProduct();
  const products = productsResponse?.data || [];

  const handleToggle = (product: LandingProduct) => { updateMutation.mutate({ id: product._id, data: { showOnLanding: !product.showOnLanding } }); };
  const handleOrderChange = (product: LandingProduct, value: number) => { updateMutation.mutate({ id: product._id, data: { landingOrder: value } }); };

  return (
    <PageShell fullHeight>
      <PageHeader
        title={pageTitle}
        description="إدارة المنتجات المعروضة في صفحة الهبوط"
        breadcrumbs={[
          { label: 'لوحة التحكم', to: '/dashboard' },
          { label: pageTitle },
        ]}
      />
    <Box sx={{ p: 3 }}>
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
    </PageShell>
  );
};

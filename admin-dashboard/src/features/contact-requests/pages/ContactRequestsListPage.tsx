import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { ContactMail } from '@mui/icons-material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { ContactRequestFilters } from '../components/ContactRequestFilters';
import { ContactRequestCard } from '../components/ContactRequestCard';
import { useContactRequests, useDeleteContactRequest } from '../hooks/useContactRequests';
import { formatDate } from '@/shared/utils/formatters';
import type { ContactRequest, ListContactRequestsParams } from '../types/contact-request.types';

export const ContactRequestsListPage: React.FC = () => {
  const { t } = useTranslation('contactRequests');
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const [filters, setFilters] = useState<ListContactRequestsParams>({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const deleteMutation = useDeleteContactRequest();

  const { data: requestsResponse, isLoading } = useContactRequests(filters);
  const requests = requestsResponse?.data || [];

  const handleFiltersChange = (newFilters: ListContactRequestsParams) => { setFilters(newFilters); setPaginationModel({ page: 0, pageSize: newFilters.limit || 20 }); };
  const handleFiltersReset = () => { setFilters({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }); setPaginationModel({ page: 0, pageSize: 20 }); };
  const handlePaginationModelChange = (model: GridPaginationModel) => { setPaginationModel(model); setFilters((prev) => ({ ...prev, page: model.page + 1, limit: model.pageSize })); };
  const handleDelete = (request: ContactRequest) => { if (window.confirm(t('messages.deleteConfirm'))) { deleteMutation.mutate(request._id); } };

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('table.columns.name'), width: 150 },
    { field: 'phone', headerName: t('table.columns.phone'), width: 140 },
    { field: 'email', headerName: t('table.columns.email'), width: 180 },
    { field: 'requestType', headerName: t('table.columns.requestType'), width: 150, renderCell: (params) => params.row.requestType ? t(`requestTypes.${params.row.requestType}`) : '' },
    { field: 'subject', headerName: t('table.columns.subject'), width: 200 },
    { field: 'status', headerName: t('table.columns.status'), width: 120, renderCell: (params) => t(`status.${params.row.status}`) },
    { field: 'createdAt', headerName: t('table.columns.createdAt'), width: 140, valueFormatter: (value) => formatDate(value as Date) },
    { field: 'actions', headerName: t('table.columns.actions'), width: 120, sortable: false, renderCell: (params) => (<Box><Box component="span" sx={{ cursor: 'pointer', color: 'primary.main' }} onClick={() => navigate(`/website/contact-requests/${params.row._id}`)}>عرض</Box></Box>) },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box mb={3}><Box display="flex" alignItems="center" gap={2}><ContactMail fontSize={isMobile ? 'medium' : 'large'} color="primary" /><Typography variant="h4">{t('pageTitle')}</Typography></Box></Box>
      <ContactRequestFilters filters={filters} onFiltersChange={handleFiltersChange} onReset={handleFiltersReset} loading={isLoading} />
      {isMobile ? (
        <Grid container spacing={2}>
          {isLoading ? [...Array(6)].map((_, i) => (<Grid size={{ xs: 12 }} key={i}><Box sx={{ height: 200, borderRadius: 2, bgcolor: 'grey.100' }} /></Grid>)) : requests.length === 0 ? (<Grid size={{ xs: 12 }}><Box textAlign="center" py={8}><ContactMail sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} /><Typography variant="h6" color="text.secondary">{t('messages.noRequests')}</Typography></Box></Grid>) : requests.map((r) => (<Grid size={{ xs: 12 }} key={r._id}><ContactRequestCard request={r} onDelete={handleDelete} /></Grid>))}
        </Grid>
      ) : (
        <DataTable title={t('table.title')} columns={columns} rows={requests} loading={isLoading} paginationModel={paginationModel} onPaginationModelChange={handlePaginationModelChange} rowCount={requestsResponse?.meta?.total ?? 0} paginationMode="server" getRowId={(row) => row._id} height="calc(100vh - 350px)" />
      )}
    </Box>
  );
};

import React from 'react';
import { Box, Chip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useServices } from '../hooks/useServices';
import { formatDate } from '@/shared/utils/formatters';
import type { ServiceStatus } from '../types/service.types';

const statusColors: Record<ServiceStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  pending: 'warning',
  assigned: 'primary',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'error',
};

export const ServicesListPage: React.FC = () => {
  const { data: services = [], isLoading } = useServices({});

  const columns: GridColDef[] = [
    { field: 'type', headerName: 'النوع', width: 200 },
    { field: 'description', headerName: 'الوصف', width: 300 },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 140,
      renderCell: (params) => (
        <Chip label={params.row.status} color={statusColors[params.row.status as ServiceStatus]} size="small" />
      ),
    },
    { field: 'createdAt', headerName: 'تاريخ الطلب', width: 140, valueFormatter: (value) => formatDate(value as Date) },
  ];

  return (
    <Box>
      <DataTable
        title="طلبات الخدمات"
        columns={columns}
        rows={services}
        loading={isLoading}
        paginationModel={{ page: 0, pageSize: 20 }}
        onPaginationModelChange={() => {}}
        rowCount={services.length}
        height="calc(100vh - 200px)"
      />
    </Box>
  );
};


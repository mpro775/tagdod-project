import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip, Button, Typography } from '@mui/material';
import { Visibility, Analytics } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useSupportTickets } from '../hooks/useSupport';
import { formatDate } from '@/shared/utils/formatters';
import type { SupportTicket, SupportStatus, SupportPriority, SupportCategory } from '../types/support.types';

const statusLabels: Record<SupportStatus, string> = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  waiting_for_user: 'انتظار العميل',
  resolved: 'محلولة',
  closed: 'مغلقة',
};

const statusColors: Record<SupportStatus, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
  open: 'error',
  in_progress: 'primary',
  waiting_for_user: 'warning',
  resolved: 'success',
  closed: 'default',
};

const priorityLabels: Record<SupportPriority, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  urgent: 'عاجلة',
};

const categoryLabels: Record<SupportCategory, string> = {
  technical: 'تقني',
  billing: 'فواتير',
  products: 'منتجات',
  services: 'خدمات',
  account: 'حساب',
  other: 'أخرى',
};

export const SupportTicketsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });

  const { data, isLoading } = useSupportTickets({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'العنوان',
      width: 250,
    },
    {
      field: 'category',
      headerName: 'الفئة',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={categoryLabels[params.row.category as SupportCategory]}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'الأولوية',
      width: 120,
      renderCell: (params) => {
        const priority = params.row.priority as SupportPriority;
        return (
          <Chip
            label={priorityLabels[priority]}
            size="small"
            color={priority === 'urgent' ? 'error' : priority === 'high' ? 'warning' : 'default'}
          />
        );
      },
    },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={statusLabels[params.row.status as SupportStatus]}
          color={statusColors[params.row.status as SupportStatus]}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الإنشاء',
      width: 140,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'slaBreached',
      headerName: 'SLA',
      width: 100,
      renderCell: (params) =>
        params.row.slaBreached ? (
          <Chip label="متأخر" color="error" size="small" />
        ) : (
          <Chip label="ضمن الوقت" color="success" size="small" />
        ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 100,
      sortable: false,
      renderCell: (params) => {
        const ticket = params.row as SupportTicket;
        return (
          <Tooltip title="عرض التفاصيل">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/support/${ticket._id}`);
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          إدارة تذاكر الدعم
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Analytics />}
          onClick={() => navigate('/support/stats')}
        >
          عرض الإحصائيات
        </Button>
      </Box>
      <DataTable
        title="إدارة تذاكر الدعم"
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={data?.meta?.total || 0}
        onRowClick={(params) => {
          const row = params.row as SupportTicket;
          navigate(`/support/${row._id}`);
        }}
        height="calc(100vh - 200px)"
      />
    </Box>
  );
};


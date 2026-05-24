import React, { useMemo } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import type { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import type { CustomerRanking } from '../hooks/useUserAnalytics';

interface CustomerRankingsTableProps {
  rankings: CustomerRanking[];
  loading?: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  height?: number | string;
}

const formatMoney = (value: number) =>
  `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

const formatDate = (value?: string | Date) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('ar-SA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const getTierColor = (tier: string): 'error' | 'warning' | 'info' | 'success' | 'default' => {
  switch (tier?.toLowerCase()) {
    case 'vip':
      return 'error';
    case 'premium':
      return 'warning';
    case 'regular':
      return 'info';
    case 'new':
      return 'success';
    default:
      return 'default';
  }
};

export const CustomerRankingsTable: React.FC<CustomerRankingsTableProps> = ({
  rankings,
  loading = false,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  height = 560,
}) => {
  const { t } = useTranslation(['users', 'common']);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'rank',
        headerName: t('users:analytics.table.rank', 'الترتيب'),
        width: 92,
        align: 'center',
        headerAlign: 'center',
        sortable: true,
        renderCell: (params) => {
          const row = params.row as CustomerRanking;
          const rank = row.rank || 0;
          const isTopThree = rank > 0 && rank <= 3;

          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Chip
                label={`#${rank || '-'}`}
                size="small"
                color={isTopThree ? 'warning' : 'default'}
                variant={isTopThree ? 'filled' : 'outlined'}
                sx={{ minWidth: 44, fontWeight: 800 }}
              />
            </Box>
          );
        },
      },
      {
        field: 'name',
        headerName: t('users:analytics.table.customer', 'العميل'),
        flex: 1.4,
        minWidth: 220,
        sortable: true,
        renderCell: (params) => {
          const row = params.row as CustomerRanking;

          return (
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {row.name || t('users:analytics.unknown', 'غير معروف')}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {row.contact || row.userInfo?.phone || row.email || '-'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'tier',
        headerName: t('users:analytics.table.tier', 'الفئة'),
        width: 122,
        align: 'center',
        headerAlign: 'center',
        sortable: true,
        renderCell: (params) => {
          const tier = String((params.row as CustomerRanking).tier || 'new');

          return (
            <Chip
              label={t(`users:analytics.tiers.${tier.toLowerCase()}`, tier)}
              size="small"
              color={getTierColor(tier)}
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          );
        },
      },
      {
        field: 'totalSpent',
        headerName: t('users:analytics.table.totalSpent', 'إجمالي الإنفاق'),
        width: 148,
        align: 'right',
        headerAlign: 'right',
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }} noWrap>
            {formatMoney(Number(params.value ?? 0))}
          </Typography>
        ),
      },
      {
        field: 'orderCount',
        headerName: t('users:analytics.table.orderCount', 'عدد الطلبات'),
        width: 116,
        align: 'center',
        headerAlign: 'center',
        type: 'number',
      },
      {
        field: 'averageOrderValue',
        headerName: t('users:analytics.table.averageOrder', 'متوسط الطلب'),
        width: 140,
        align: 'right',
        headerAlign: 'right',
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {formatMoney(Number(params.value ?? 0))}
          </Typography>
        ),
      },
      {
        field: 'lastOrderDate',
        headerName: t('users:analytics.table.lastOrder', 'آخر طلب'),
        width: 138,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {formatDate(params.value as string | Date | undefined)}
          </Typography>
        ),
      },
      {
        field: 'score',
        headerName: t('users:analytics.table.score', 'النقاط/الشارة'),
        width: 130,
        align: 'center',
        headerAlign: 'center',
        sortable: true,
        renderCell: (params) => {
          const row = params.row as CustomerRanking;
          const score = row.score ?? row.points ?? row.badge;

          return score ? (
            <Chip label={String(score)} size="small" color="primary" variant="outlined" />
          ) : (
            <Typography variant="caption" color="text.secondary">
              -
            </Typography>
          );
        },
      },
    ],
    [t]
  );

  return (
    <DataTable
      columns={columns}
      rows={rankings}
      loading={loading}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      sortModel={sortModel}
      onSortModelChange={onSortModelChange}
      getRowId={(row) => {
        const customer = row as CustomerRanking;
        return customer.userId || `${customer.rank}-${customer.name}`;
      }}
      height={height}
      rowHeight={52}
      sx={{
        '& .MuiDataGrid-columnHeader': {
          minHeight: '42px !important',
        },
        '& .MuiDataGrid-row': {
          minHeight: '52px !important',
        },
      }}
    />
  );
};

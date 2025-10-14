import React from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, ToggleOn, ToggleOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { usePromotions, useDeletePromotion, useTogglePromotionStatus } from '../hooks/usePromotions';
import { formatDate } from '@/shared/utils/formatters';
import type { PriceRule } from '../types/promotion.types';

export const PromotionsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: promotions = [], isLoading, refetch } = usePromotions({});
  const { mutate: deletePromotion } = useDeletePromotion();
  const { mutate: toggleStatus } = useTogglePromotionStatus();

  const columns: GridColDef[] = [
    { field: 'metadata.title', headerName: 'العنوان', width: 200, valueGetter: (_v, row) => row.metadata?.title || 'بدون عنوان' },
    { field: 'priority', headerName: 'الأولوية', width: 100, align: 'center' },
    {
      field: 'effects',
      headerName: 'الخصم',
      width: 150,
      valueGetter: (_v, row) => {
        if (row.effects?.percentOff) return `${row.effects.percentOff}%`;
        if (row.effects?.amountOff) return `${row.effects.amountOff} ريال`;
        if (row.effects?.specialPrice) return `سعر خاص: ${row.effects.specialPrice}`;
        return '-';
      },
    },
    { field: 'stats.appliedCount', headerName: 'الاستخدامات', width: 120, align: 'center', valueGetter: (_v, row) => row.stats?.appliedCount || 0 },
    { field: 'startAt', headerName: 'البداية', width: 130, valueFormatter: (value) => formatDate(value as Date) },
    { field: 'endAt', headerName: 'النهاية', width: 130, valueFormatter: (value) => formatDate(value as Date) },
    {
      field: 'active',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params) => <Chip label={params.row.active ? 'نشط' : 'غير نشط'} color={params.row.active ? 'success' : 'default'} size="small" />,
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const promo = params.row as PriceRule;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="تعديل"><IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); navigate(`/promotions/${promo._id}`); }}><Edit fontSize="small" /></IconButton></Tooltip>
            <Tooltip title={promo.active ? 'تعطيل' : 'تفعيل'}><IconButton size="small" color={promo.active ? 'warning' : 'success'} onClick={(e) => { e.stopPropagation(); toggleStatus(promo._id, { onSuccess: () => refetch() }); }}>{promo.active ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}</IconButton></Tooltip>
            <Tooltip title="حذف"><IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); if (window.confirm('هل تريد حذف العرض؟')) deletePromotion(promo._id, { onSuccess: () => refetch() }); }}><Delete fontSize="small" /></IconButton></Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <DataTable
        title="إدارة العروض الترويجية"
        columns={columns}
        rows={promotions}
        loading={isLoading}
        paginationModel={{ page: 0, pageSize: 20 }}
        onPaginationModelChange={() => {}}
        rowCount={promotions.length}
        onAdd={() => navigate('/promotions/new')}
        addButtonText="إضافة عرض"
        height="calc(100vh - 200px)"
      />
    </Box>
  );
};


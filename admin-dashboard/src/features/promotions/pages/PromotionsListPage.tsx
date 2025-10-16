import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { Edit, ToggleOn, ToggleOff, Delete, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { usePriceRules, useTogglePriceRule, useDeletePriceRule } from '@/features/marketing/hooks/useMarketing';
import { formatDate } from '@/shared/utils/formatters';
import type { PriceRule } from '@/features/marketing/api/marketingApi';

export const PromotionsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: promotions = [], isLoading, refetch } = usePriceRules({});
  const { mutate: toggleStatus } = useTogglePriceRule();
  const { mutate: deletePromotion } = useDeletePriceRule();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; promotion: PriceRule | null }>({
    open: false,
    promotion: null,
  });

  const columns: GridColDef[] = [
    {
      field: 'metadata.title',
      headerName: 'العنوان',
      width: 200,
      valueGetter: (_v, row) => row.metadata?.title || 'بدون عنوان',
    },
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
    {
      field: 'stats.appliedCount',
      headerName: 'الاستخدامات',
      width: 100,
      align: 'center',
      valueGetter: (_v, row) => row.stats?.appliedCount || 0,
    },
    {
      field: 'stats.views',
      headerName: 'المشاهدات',
      width: 100,
      align: 'center',
      valueGetter: (_v, row) => row.stats?.views || 0,
    },
    {
      field: 'stats.savings',
      headerName: 'إجمالي التوفير',
      width: 120,
      align: 'center',
      valueGetter: (_v, row) => `${row.stats?.savings || 0} ريال`,
    },
    {
      field: 'startAt',
      headerName: 'البداية',
      width: 130,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'endAt',
      headerName: 'النهاية',
      width: 130,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'active',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.active ? 'نشط' : 'غير نشط'}
          color={params.row.active ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const promo = params.row as PriceRule;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="عرض التفاصيل">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/promotions/${promo._id}/view`);
                }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="تعديل">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/promotions/${promo._id}`);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={promo.active ? 'تعطيل' : 'تفعيل'}>
              <IconButton
                size="small"
                color={promo.active ? 'warning' : 'success'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStatus(promo._id, { onSuccess: () => refetch() });
                }}
              >
                {promo.active ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="حذف">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialog({ open: true, promotion: promo });
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const handleDeleteConfirm = () => {
    if (deleteDialog.promotion) {
      deletePromotion(deleteDialog.promotion._id, {
        onSuccess: () => {
          setDeleteDialog({ open: false, promotion: null });
          refetch();
        },
      });
    }
  };

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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, promotion: null })}
      >
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <DialogContentText>
            هل أنت متأكد من حذف العرض "{deleteDialog.promotion?.metadata?.title || 'بدون عنوان'}"؟
            <br />
            <strong>هذا الإجراء لا يمكن التراجع عنه.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, promotion: null })}
            color="primary"
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

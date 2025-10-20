import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip, Button } from '@mui/material';
import { Edit, Delete, ToggleOn, ToggleOff, Assessment, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useCoupons, useDeleteCoupon, useToggleCouponStatus } from '@/features/marketing/hooks/useMarketing';
import { BulkGenerateDialog } from '../components/BulkGenerateDialog';
import { formatDate } from '@/shared/utils/formatters';
import type { Coupon } from '@/features/marketing/api/marketingApi';

// Type definitions for coupon types
type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
type CouponStatus = 'active' | 'inactive' | 'expired' | 'exhausted';

const couponTypeLabels: Record<CouponType, string> = {
  percentage: 'نسبة مئوية',
  fixed_amount: 'مبلغ ثابت',
  free_shipping: 'شحن مجاني',
  buy_x_get_y: 'اشتر X احصل على Y',
  first_order: 'الطلب الأول',
};

const couponStatusColors: Record<
  CouponStatus,
  'default' | 'success' | 'error' | 'warning'
> = {
  active: 'success',
  inactive: 'default',
  expired: 'error',
  exhausted: 'warning',
};

export const CouponsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [bulkGenerateOpen, setBulkGenerateOpen] = useState(false);

  const { data, isLoading } = useCoupons({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });

  const { mutate: deleteCoupon } = useDeleteCoupon();
  const { mutate: toggleStatus } = useToggleCouponStatus();

  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: 'كود الكوبون',
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: 'primary.main',
          }}
        >
          {params.row.code}
        </Box>
      ),
    },
    {
      field: 'title',
      headerName: 'العنوان',
      width: 200,
    },
    {
      field: 'type',
      headerName: 'النوع',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={couponTypeLabels[params.row.type as CouponType]}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'discount',
      headerName: 'الخصم',
      width: 120,
      renderCell: (params) => {
        const coupon = params.row as Coupon;
        if (coupon.discountPercentage) {
          return `${coupon.discountPercentage}%`;
        }
        if (coupon.discountAmount) {
          return `${coupon.discountAmount} ${coupon.currency || ''}`;
        }
        if (coupon.type === 'free_shipping') {
          return 'شحن مجاني';
        }
        return '-';
      },
    },
    {
      field: 'currentUses',
      headerName: 'الاستخدامات',
      width: 120,
      renderCell: (params) => (
        <Box>
          {params.row.currentUses}
          {params.row.maxTotalUses && ` / ${params.row.maxTotalUses}`}
        </Box>
      ),
    },
    {
      field: 'dateRange',
      headerName: 'الفترة',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ fontSize: '0.85rem' }}>
          <Box>{formatDate(params.row.startDate)}</Box>
          <Box sx={{ color: 'text.secondary' }}>
            {formatDate(params.row.endDate)}
          </Box>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          color={couponStatusColors[params.row.status as CouponStatus]}
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
        const coupon = params.row as Coupon;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="تعديل">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/coupons/${coupon._id}`);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="الإحصائيات">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/coupons/${coupon._id}/analytics`);
                }}
              >
                <Assessment fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={coupon.status === 'active' ? 'تعطيل' : 'تفعيل'}>
              <IconButton
                size="small"
                color={coupon.status === 'active' ? 'warning' : 'success'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStatus(coupon._id);
                }}
              >
                {coupon.status === 'active' ? (
                  <ToggleOff fontSize="small" />
                ) : (
                  <ToggleOn fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="حذف">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`هل تريد حذف الكوبون "${coupon.code}"؟`)) {
                    deleteCoupon(coupon._id);
                  }
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

  return (
    <Box>
      <DataTable
        title="إدارة الكوبونات"
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={data?.meta?.total || 0}
        onAdd={() => navigate('/coupons/new')}
        addButtonText="إضافة كوبون"
        onRowClick={(params) => {
          const row = params.row as Coupon;
          navigate(`/coupons/${row._id}`);
        }}
        height="calc(100vh - 200px)"
        customActions={
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setBulkGenerateOpen(true)}
            sx={{ mr: 1 }}
          >
            توليد جماعي
          </Button>
        }
      />

      <BulkGenerateDialog
        open={bulkGenerateOpen}
        onClose={() => setBulkGenerateOpen(false)}
        onSuccess={() => {
          setBulkGenerateOpen(false);
          // Refresh the list
          window.location.reload();
        }}
      />
    </Box>
  );
};


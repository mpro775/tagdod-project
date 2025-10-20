import React, { useState } from 'react';
import { Box, Chip, Button, Typography, Grid } from '@mui/material';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { GridColDef } from '@mui/x-data-grid';
import { formatDate } from '../../../shared/utils/formatters';
import { usePublicCoupons } from '../../marketing/hooks/useMarketing';
import { formatCurrency } from '../../cart/api/cartApi';
import type { Coupon } from '../../marketing/api/marketingApi';

// Type definitions for coupon types
type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
type CouponStatus = 'active' | 'inactive' | 'expired' | 'exhausted';

const couponTypeLabels: Record<CouponType, string> = {
  percentage: 'نسبة مئوية',
  fixed_amount: 'مبلغ ثابت',
  free_shipping: 'شحن مجاني',
  buy_x_get_y: 'اشتر X احصل على Y',
};

const couponStatusColors: Record<CouponStatus, 'default' | 'success' | 'error' | 'warning'> = {
  active: 'success',
  inactive: 'default',
  expired: 'error',
  exhausted: 'warning',
};

export const PublicCouponsPage: React.FC = () => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });

  const { data, isLoading } = usePublicCoupons({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });

  const coupons = data?.data || [];
  const pagination = data?.pagination || { total: 0 };

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
            backgroundColor: '#f5f5f5',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.875rem',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'name',
      headerName: 'اسم الكوبون',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          {params.row.description && (
            <Typography variant="caption" color="text.secondary">
              {params.row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'النوع',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={couponTypeLabels[params.value as CouponType]}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'discountValue',
      headerName: 'قيمة الخصم',
      width: 120,
      renderCell: (params) => {
        const coupon = params.row as Coupon;
        if (coupon.type === 'percentage') {
          return <Typography>{params.value}%</Typography>;
        } else if (coupon.type === 'fixed_amount') {
          return <Typography>{formatCurrency(params.value)}</Typography>;
        } else if (coupon.type === 'free_shipping') {
          return <Typography>شحن مجاني</Typography>;
        } else if (coupon.type === 'buy_x_get_y') {
          return <Typography>اشتر {coupon.buyXQuantity} احصل على {coupon.getYQuantity}</Typography>;
        }
        return <Typography>{params.value}</Typography>;
      },
    },
    {
      field: 'minimumOrderAmount',
      headerName: 'الحد الأدنى',
      width: 120,
      renderCell: (params) => (
        <Typography>
          {params.value ? formatCurrency(params.value) : 'لا يوجد'}
        </Typography>
      ),
    },
    {
      field: 'usageLimit',
      headerName: 'الحد الأقصى للاستخدام',
      width: 120,
      renderCell: (params) => (
        <Typography>
          {params.value ? params.value : 'غير محدود'}
        </Typography>
      ),
    },
    {
      field: 'usedCount',
      headerName: 'المستخدم',
      width: 100,
      renderCell: (params) => (
        <Box textAlign="center">
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            مرة
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={couponStatusColors[params.value as CouponStatus] === 'success' ? 'نشط' :
                 couponStatusColors[params.value as CouponStatus] === 'default' ? 'غير نشط' :
                 couponStatusColors[params.value as CouponStatus] === 'error' ? 'منتهي' : 'مستهلك'}
          size="small"
          color={couponStatusColors[params.value as CouponStatus]}
        />
      ),
    },
    {
      field: 'validUntil',
      headerName: 'صالح حتى',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.value)}
        </Typography>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            الكوبونات العامة
          </Typography>
          <Typography variant="body2" color="text.secondary">
            عرض الكوبونات المتاحة للعملاء العامين
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader>
              <CardTitle>قائمة الكوبونات العامة</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                rows={coupons}
                columns={columns}
                loading={isLoading}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                totalRows={pagination.total || 0}
                pageSizeOptions={[10, 20, 50]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

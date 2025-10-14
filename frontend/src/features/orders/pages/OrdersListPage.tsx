import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useOrders } from '../hooks/useOrders';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';
import type { Order, OrderStatus, PaymentStatus } from '../types/order.types';

const orderStatusLabels: Record<OrderStatus, string> = {
  draft: 'مسودة',
  pending_payment: 'انتظار الدفع',
  confirmed: 'مؤكد',
  payment_failed: 'فشل الدفع',
  processing: 'قيد التجهيز',
  ready_to_ship: 'جاهز للشحن',
  shipped: 'تم الشحن',
  out_for_delivery: 'في الطريق',
  delivered: 'تم التسليم',
  completed: 'مكتمل',
  on_hold: 'معلق',
  cancelled: 'ملغي',
  refunded: 'مسترد',
  partially_refunded: 'مسترد جزئياً',
  returned: 'مرتجع',
};

const orderStatusColors: Record<
  OrderStatus,
  'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
> = {
  draft: 'default',
  pending_payment: 'warning',
  confirmed: 'info',
  payment_failed: 'error',
  processing: 'primary',
  ready_to_ship: 'secondary',
  shipped: 'info',
  out_for_delivery: 'primary',
  delivered: 'success',
  completed: 'success',
  on_hold: 'warning',
  cancelled: 'error',
  refunded: 'error',
  partially_refunded: 'warning',
  returned: 'error',
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'معلق',
  authorized: 'مصرح',
  paid: 'مدفوع',
  failed: 'فشل',
  refunded: 'مسترد',
  partially_refunded: 'مسترد جزئياً',
  cancelled: 'ملغي',
};

export const OrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });

  const { data, isLoading } = useOrders({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });

  const columns: GridColDef[] = [
    {
      field: 'orderNumber',
      headerName: 'رقم الطلب',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
          {params.row.orderNumber}
        </Box>
      ),
    },
    {
      field: 'customerName',
      headerName: 'العميل',
      width: 180,
      valueGetter: (_value, row) => row.deliveryAddress?.recipientName || 'غير محدد',
    },
    {
      field: 'items',
      headerName: 'المنتجات',
      width: 100,
      align: 'center',
      valueGetter: (_value, row) => row.items?.length || 0,
    },
    {
      field: 'total',
      headerName: 'المجموع',
      width: 130,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'bold' }}>
          {formatCurrency(params.row.total, params.row.currency)}
        </Box>
      ),
    },
    {
      field: 'paymentMethod',
      headerName: 'طريقة الدفع',
      width: 120,
      renderCell: (params) => {
        const labels: Record<string, string> = {
          COD: 'عند الاستلام',
          ONLINE: 'أونلاين',
          WALLET: 'محفظة',
          BANK_TRANSFER: 'تحويل بنكي',
        };
        return <Chip label={labels[params.row.paymentMethod] || params.row.paymentMethod} size="small" />;
      },
    },
    {
      field: 'paymentStatus',
      headerName: 'حالة الدفع',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={paymentStatusLabels[params.row.paymentStatus as PaymentStatus]}
          color={params.row.paymentStatus === 'paid' ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'حالة الطلب',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={orderStatusLabels[params.row.status as OrderStatus]}
          color={orderStatusColors[params.row.status as OrderStatus]}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الطلب',
      width: 140,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const order = params.row as Order;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="عرض التفاصيل">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/orders/${order._id}`);
                }}
              >
                <Visibility fontSize="small" />
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
        title="إدارة الطلبات"
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={data?.meta?.total || 0}
        onRowClick={(params) => {
          const row = params.row as Order;
          navigate(`/orders/${row._id}`);
        }}
        height="calc(100vh - 200px)"
      />
    </Box>
  );
};


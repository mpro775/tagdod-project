import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { ResponsiveListWrapper } from '@/shared/components/ResponsiveList';
import { OrderCard } from '@/shared/components/Cards';
import { useOrders } from '../hooks/useOrders';
import { formatDate } from '@/shared/utils/formatters';
import type { Order } from '../types/order.types';

export const OrdersListPageResponsive: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [search, setSearch] = useState('');
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' }
  ]);

  // API
  const { data, isLoading, error } = useOrders({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search,
    sortBy: sortModel[0]?.field || 'createdAt',
    sortOrder: sortModel[0]?.sort || 'desc',
  });

  // Actions
  const handleEdit = (order: Order) => {
    navigate(`/orders/${order._id}`);
  };

  const handleView = (order: Order) => {
    navigate(`/orders/${order._id}`);
  };

  const handleDelete = (order: Order) => {
    // TODO: Implement delete functionality
    console.log('Delete order:', order);
  };

  const handleUpdateStatus = (order: Order) => {
    // TODO: Implement status update
    console.log('Update status for order:', order);
  };

  // Columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: 'orderNumber',
      headerName: 'رقم الطلب',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>
          #{params.row.orderNumber}
        </Box>
      ),
    },
    {
      field: 'customer',
      headerName: 'العميل',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Box sx={{ fontWeight: 'medium' }}>
            {params.row.customer?.name || 'غير محدد'}
          </Box>
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {params.row.customer?.email}
          </Box>
        </Box>
      ),
    },
    {
      field: 'total',
      headerName: 'المجموع',
      minWidth: 100,
      flex: 0.7,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'medium', color: 'primary.main' }}>
          {new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
          }).format(params.row.total)}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'الحالة',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => {
        const statusMap: Record<string, { label: string; color: any }> = {
          pending: { label: 'في الانتظار', color: 'warning' },
          confirmed: { label: 'مؤكد', color: 'info' },
          processing: { label: 'قيد المعالجة', color: 'primary' },
          shipped: { label: 'تم الشحن', color: 'info' },
          delivered: { label: 'تم التسليم', color: 'success' },
          cancelled: { label: 'ملغي', color: 'error' },
          refunded: { label: 'مسترد', color: 'default' },
        };
        const status = statusMap[params.row.status] || { label: 'غير محدد', color: 'default' };
        return (
          <Box sx={{ 
            px: 1, 
            py: 0.5, 
            borderRadius: 1, 
            bgcolor: `${status.color}.light`,
            color: `${status.color}.main`,
            fontSize: '0.75rem',
            fontWeight: 'medium'
          }}>
            {status.label}
          </Box>
        );
      },
    },
    {
      field: 'paymentStatus',
      headerName: 'حالة الدفع',
      minWidth: 100,
      flex: 0.7,
      renderCell: (params) => {
        const paymentStatus = params.row.paymentStatus;
        const color = paymentStatus === 'paid' ? 'success' : 'warning';
        const label = paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع';
        return (
          <Box sx={{ 
            px: 1, 
            py: 0.5, 
            borderRadius: 1, 
            bgcolor: `${color}.light`,
            color: `${color}.main`,
            fontSize: '0.75rem',
            fontWeight: 'medium'
          }}>
            {label}
          </Box>
        );
      },
    },
    {
      field: 'items',
      headerName: 'العناصر',
      minWidth: 80,
      flex: 0.6,
      renderCell: (params) => (
        <Box sx={{ textAlign: 'center', fontWeight: 'medium' }}>
          {params.row.items?.length || 0}
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الطلب',
      minWidth: 120,
      flex: 0.8,
      valueFormatter: (value) => formatDate(value as Date),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        إدارة الطلبات
      </Typography>

      <ResponsiveListWrapper
        data={data?.data || []}
        loading={isLoading}
        error={error}
        columns={columns}
        CardComponent={OrderCard}
        getRowId={(order) => order._id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        showActions={true}
        cardBreakpoint="md"
        emptyMessage="لا يوجد طلبات"
        emptyDescription="لم يتم العثور على أي طلبات في النظام"
        errorMessage="حدث خطأ أثناء تحميل الطلبات"
        pagination={true}
        pageSize={20}
        pageSizeOptions={[10, 20, 50, 100]}
        cardContainerProps={{
          sx: { 
            px: { xs: 2, sm: 3 },
            py: 1
          }
        }}
        gridProps={{
          sx: { 
            height: 'calc(100vh - 200px)',
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
          }
        }}
      />
    </Box>
  );
};

export default OrdersListPageResponsive;

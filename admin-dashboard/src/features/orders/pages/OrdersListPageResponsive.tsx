import React, { useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { ResponsiveListWrapper } from '@/shared/components/ResponsiveList';
import { OrderCard } from '@/shared/components/Cards';
import { useOrders, useUpdateOrderStatus, useCancelOrder } from '../hooks/useOrders';
import { formatDate } from '@/shared/utils/formatters';
import type { Order } from '../types/order.types';
import { OrderStatus } from '../types/order.types';

export const OrdersListPageResponsive: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [paginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  const [search] = useState('');
  const [sortModel] = useState<GridSortModel>([
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

  // Mutations
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const cancelOrderMutation = useCancelOrder();

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    order: Order | null;
    action: 'cancel' | 'update_status' | null;
  }>({
    open: false,
    order: null,
    action: null,
  });

  // Status update form state
  const [statusUpdateData, setStatusUpdateData] = useState<{
    status: OrderStatus;
    notes: string;
  }>({
    status: OrderStatus.PENDING_PAYMENT,
    notes: '',
  });

  // Actions
  const handleEdit = (order: Order) => {
    navigate(`/orders/${order._id}`);
  };

  const handleView = (order: Order) => {
    navigate(`/orders/${order._id}`);
  };

  const handleDelete = (order: Order) => {
    setConfirmDialog({
      open: true,
      order,
      action: 'cancel',
    });
  };

  const handleUpdateStatus = (order: Order) => {
    setStatusUpdateData({
      status: order.status,
      notes: '',
    });
    setConfirmDialog({
      open: true,
      order,
      action: 'update_status',
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.order || !confirmDialog.action) return;

    const { order, action } = confirmDialog;

    if (action === 'cancel') {
      await cancelOrderMutation.mutateAsync({
        id: order._id,
        reason: 'تم إلغاء الطلب من قبل الإدارة',
      });
    } else if (action === 'update_status') {
      await updateOrderStatusMutation.mutateAsync({
        id: order._id,
        data: statusUpdateData,
      });
    }

    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setConfirmDialog({
      open: false,
      order: null,
      action: null,
    });
    setStatusUpdateData({
      status: OrderStatus.PENDING_PAYMENT,
      notes: '',
    });
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
        onUpdateStatus={handleUpdateStatus}
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

      {/* Cancel Order Dialog */}
      <Dialog
        open={confirmDialog.open && confirmDialog.action === 'cancel'}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          تأكيد إلغاء الطلب
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            هل أنت متأكد من إلغاء الطلب "{confirmDialog.order?.orderNumber}"؟
            لا يمكن التراجع عن هذا الإجراء وسيتم إشعار العميل.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            إلغاء
          </Button>
          <Button
            onClick={handleConfirmAction}
            color="error"
            variant="contained"
            disabled={cancelOrderMutation.isPending}
          >
            {cancelOrderMutation.isPending ? 'جاري الإلغاء...' : 'إلغاء الطلب'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={confirmDialog.open && confirmDialog.action === 'update_status'}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          تحديث حالة الطلب
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            تحديث حالة الطلب "{confirmDialog.order?.orderNumber}"
          </DialogContentText>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>الحالة الجديدة</InputLabel>
            <Select
              value={statusUpdateData.status}
              label="الحالة الجديدة"
              onChange={(e) => setStatusUpdateData(prev => ({
                ...prev,
                status: e.target.value as OrderStatus
              }))}
            >
              <MenuItem value={OrderStatus.PENDING_PAYMENT}>في انتظار الدفع</MenuItem>
              <MenuItem value={OrderStatus.CONFIRMED}>مؤكد</MenuItem>
              <MenuItem value={OrderStatus.PROCESSING}>قيد المعالجة</MenuItem>
              <MenuItem value={OrderStatus.SHIPPED}>تم الشحن</MenuItem>
              <MenuItem value={OrderStatus.DELIVERED}>تم التسليم</MenuItem>
              <MenuItem value={OrderStatus.CANCELLED}>ملغي</MenuItem>
              <MenuItem value={OrderStatus.ON_HOLD}>متوقف مؤقتاً</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="ملاحظات (اختياري)"
            placeholder="أدخل ملاحظات حول تحديث الحالة..."
            value={statusUpdateData.notes}
            onChange={(e) => setStatusUpdateData(prev => ({
              ...prev,
              notes: e.target.value
            }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            إلغاء
          </Button>
          <Button
            onClick={handleConfirmAction}
            color="primary"
            variant="contained"
            disabled={updateOrderStatusMutation.isPending}
          >
            {updateOrderStatusMutation.isPending ? 'جاري التحديث...' : 'تحديث الحالة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersListPageResponsive;

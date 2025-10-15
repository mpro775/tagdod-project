import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  ListOrdersParams,
  UpdateOrderStatusDto,
  ShipOrderDto,
  RefundOrderDto,
} from '../types/order.types';

const ORDERS_KEY = 'orders';

// List orders
export const useOrders = (params: ListOrdersParams) => {
  return useQuery({
    queryKey: [ORDERS_KEY, params],
    queryFn: () => ordersApi.list(params),
    placeholderData: (previousData) => previousData,
  });
};

// Get single order
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: [ORDERS_KEY, id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusDto }) =>
      ordersApi.updateStatus(id, data),
    onSuccess: () => {
      toast.success('تم تحديث حالة الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Ship order
export const useShipOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShipOrderDto }) => ordersApi.ship(id, data),
    onSuccess: () => {
      toast.success('تم شحن الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Confirm delivery
export const useConfirmDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.confirmDelivery(id),
    onSuccess: () => {
      toast.success('تم تأكيد التسليم بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Refund order
export const useRefundOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RefundOrderDto }) => ordersApi.refund(id, data),
    onSuccess: () => {
      toast.success('تم استرداد المبلغ بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => ordersApi.cancel(id, reason),
    onSuccess: () => {
      toast.success('تم إلغاء الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Update notes
export const useUpdateOrderNotes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      notes,
    }: {
      id: string;
      notes: { adminNotes?: string; internalNotes?: string };
    }) => ordersApi.updateNotes(id, notes),
    onSuccess: () => {
      toast.success('تم تحديث الملاحظات بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Get stats
export const useOrderStats = () => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'stats'],
    queryFn: () => ordersApi.getStats(),
  });
};

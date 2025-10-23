// Pages
export { OrdersListPage } from './pages/OrdersListPage';
export { OrderDetailsPage } from './pages/OrderDetailsPage';
export { OrderAnalyticsPage } from './pages/OrderAnalyticsPage';

// Components
export { OrderStatusChip, OrderTimeline, OrderSummary } from './components';

// Hooks
export {
  useOrders,
  useOrder,
  useUpdateOrderStatus,
  useShipOrder,
  useRefundOrder,
  useCancelOrder,
  useAddOrderNotes,
  useBulkUpdateOrderStatus,
  useOrderAnalytics,
  useRevenueAnalytics,
  usePerformanceAnalytics,
  useOrderTracking,
  useGenerateOrdersReport,
  useGenerateFinancialReport,
  useOrderStats,
} from './hooks/useOrders';

// API
export { ordersApi } from './api/ordersApi';

// Types
export type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingMethod,
  StatusHistoryEntry,
  DeliveryAddress,
  CouponDetails,
  ReturnInfo,
  RatingInfo,
  UpdateOrderStatusDto,
  ShipOrderDto,
  RefundOrderDto,
  CancelOrderDto,
  AddOrderNotesDto,
  BulkOrderUpdateDto,
  ListOrdersParams,
  OrderAnalyticsParams,
  OrderStats,
  OrderAnalytics,
  OrderTracking,
  RevenueAnalytics,
  PerformanceAnalytics,
} from './types/order.types';

import React, { useState } from 'react';
import { CartFilters } from '../components/CartFilters';
import { CartTable } from '../components/CartTable';
import { CartDetailsModal } from '../components/CartDetailsModal';
import {
  useCartList,
  useCartDetails,
  useSendCartReminder,
  useConvertCartToOrder,
} from '../hooks/useCart';
import { CartFilters as CartFiltersType } from '../types/cart.types';
import { Card, CardContent, Button } from '@mui/material';

export const CartManagementPage: React.FC = () => {
  const [filters, setFilters] = useState<CartFiltersType>({});
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { carts, loading, error, pagination, fetchCarts, refetch } = useCartList(filters);

  const { cart: selectedCart } = useCartDetails(selectedCartId || '');

  const sendReminderMutation = useSendCartReminder();
  const convertToOrderMutation = useConvertCartToOrder();

  const handleFiltersChange = (newFilters: CartFiltersType) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    fetchCarts(1, pagination.limit);
  };

  const handleResetFilters = () => {
    setFilters({});
    fetchCarts(1, pagination.limit);
  };

  const handleViewCart = (cartId: string) => {
    setSelectedCartId(cartId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCartId(null);
  };

  const handleSendReminder = (cartId: string) => {
    sendReminderMutation.mutate(cartId);
  };

  const handleConvertToOrder = (cartId: string) => {
    convertToOrderMutation.mutate(cartId);
  };

  const handlePageChange = (page: number) => {
    fetchCarts(page, pagination.limit);
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium">خطأ في تحميل السلال</p>
              <p className="text-sm mt-2">{error}</p>
              <Button onClick={() => refetch()} className="mt-4">
                إعادة المحاولة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة السلال</h1>
          <p className="text-gray-600 mt-1">إدارة وعرض جميع سلال التسوق في النظام</p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'جاري التحديث...' : 'تحديث'}
        </Button>
      </div>

      {/* Filters */}
      <CartFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        loading={loading}
      />

      {/* Cart Table */}
      <CartTable
        carts={carts}
        loading={loading}
        onViewCart={handleViewCart}
        onSendReminder={handleSendReminder}
        onConvertToOrder={handleConvertToOrder}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                عرض {(pagination.page - 1) * pagination.limit + 1} إلى{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} من{' '}
                {pagination.total} سلة
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  السابق
                </Button>
                <span className="px-3 py-1 text-sm font-medium">
                  صفحة {pagination.page} من {pagination.pages}
                </span>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || loading}
                >
                  التالي
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cart Details Modal */}
      <CartDetailsModal
        cart={selectedCart || null}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onSendReminder={handleSendReminder}
        onConvertToOrder={handleConvertToOrder}
      />
    </div>
  );
};

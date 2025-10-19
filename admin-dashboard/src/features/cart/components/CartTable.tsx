import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Cart, CartStatus } from '../types/cart.types';
import { formatCurrency, formatDate, formatCartStatus } from '../api/cartApi';

interface CartTableProps {
  carts: Cart[];
  loading?: boolean;
  // eslint-disable-next-line no-unused-vars
  onViewCart: (cartId: string) => void;
  // eslint-disable-next-line no-unused-vars
  onSendReminder?: (cartId: string) => void;
  // eslint-disable-next-line no-unused-vars
  onConvertToOrder?: (cartId: string) => void;
}

export const CartTable: React.FC<CartTableProps> = ({
  carts,
  loading = false,
  onViewCart,
  onSendReminder,
  onConvertToOrder,
}) => {
  const getStatusBadge = (status: CartStatus) => {
    const { label, color } = formatCartStatus(status);
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
        {label}
      </span>
    );
  };

  const getUserInfo = (cart: Cart) => {
    if (cart.user) {
      return (
        <div>
          <div className="font-medium text-gray-900">{cart.user.name}</div>
          <div className="text-sm text-gray-500">{cart.user.email}</div>
          {cart.user.phone && (
            <div className="text-sm text-gray-500">{cart.user.phone}</div>
          )}
        </div>
      );
    }
    
    if (cart.userId) {
      return (
        <div className="text-sm text-gray-500">
          معرف المستخدم: {cart.userId}
        </div>
      );
    }
    
    if (cart.deviceId) {
      return (
        <div className="text-sm text-gray-500">
          ضيف: {cart.deviceId.slice(0, 8)}...
        </div>
      );
    }
    
    return <span className="text-gray-400">غير محدد</span>;
  };

  const getCartValue = (cart: Cart) => {
    if (cart.pricingSummary?.total) {
      return formatCurrency(cart.pricingSummary.total, cart.pricingSummary.currency);
    }
    return 'غير محدد';
  };

  const getItemsCount = (cart: Cart) => {
    if (cart.pricingSummary?.itemsCount) {
      return cart.pricingSummary.itemsCount;
    }
    return cart.items?.length || 0;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (carts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            لا توجد سلال متاحة
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>قائمة السلال ({carts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  معرف السلة
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  المستخدم
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  الحالة
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  عدد العناصر
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  القيمة الإجمالية
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  تاريخ الإنشاء
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  آخر نشاط
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {carts.map((cart) => (
                <tr key={cart._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-mono text-sm text-gray-600">
                      {cart._id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getUserInfo(cart)}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(cart.status)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">
                      {getItemsCount(cart)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-left font-medium">
                    {getCartValue(cart)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {formatDate(cart.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {cart.lastActivityAt ? formatDate(cart.lastActivityAt) : 'غير محدد'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewCart(cart._id)}
                      >
                        عرض
                      </Button>
                      
                      {cart.status === CartStatus.ABANDONED && onSendReminder && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          onClick={() => onSendReminder(cart._id)}
                        >
                          تذكير
                        </Button>
                      )}
                      
                      {cart.status === CartStatus.ACTIVE && onConvertToOrder && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          onClick={() => onConvertToOrder(cart._id)}
                        >
                          تحويل
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

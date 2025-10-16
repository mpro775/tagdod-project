import React from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Cart, CartStatus } from '../types/cart.types';
import { formatCurrency, formatDate, formatCartStatus } from '../api/cartApi';

interface CartDetailsModalProps {
  cart: Cart | null;
  isOpen: boolean;
  onClose: () => void;
  onSendReminder?: (cartId: string) => void;
  onConvertToOrder?: (cartId: string) => void;
}

export const CartDetailsModal: React.FC<CartDetailsModalProps> = ({
  cart,
  isOpen,
  onClose,
  onSendReminder,
  onConvertToOrder,
}) => {
  if (!cart) return null;

  const getStatusBadge = (status: CartStatus) => {
    const { label, color } = formatCartStatus(status);
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`}>
        {label}
      </span>
    );
  };

  const getUserInfo = () => {
    if (cart.user) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">معلومات المستخدم</h4>
          <div className="space-y-1">
            <div><span className="font-medium">الاسم:</span> {cart.user.name}</div>
            <div><span className="font-medium">البريد الإلكتروني:</span> {cart.user.email}</div>
            {cart.user.phone && (
              <div><span className="font-medium">الهاتف:</span> {cart.user.phone}</div>
            )}
          </div>
        </div>
      );
    }
    
    if (cart.userId) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">معلومات المستخدم</h4>
          <div><span className="font-medium">معرف المستخدم:</span> {cart.userId}</div>
        </div>
      );
    }
    
    if (cart.deviceId) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">معلومات الضيف</h4>
          <div><span className="font-medium">معرف الجهاز:</span> {cart.deviceId}</div>
        </div>
      );
    }
    
    return null;
  };

  const getPricingSummary = () => {
    if (!cart.pricingSummary) return null;

    const { subtotal, total, itemsCount, currency, wholesaleDiscountAmount } = cart.pricingSummary;

    return (
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">ملخص التسعير</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>عدد العناصر:</span>
            <span className="font-medium">{itemsCount}</span>
          </div>
          <div className="flex justify-between">
            <span>المجموع الفرعي:</span>
            <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
          </div>
          {wholesaleDiscountAmount && wholesaleDiscountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>خصم التاجر:</span>
              <span className="font-medium">-{formatCurrency(wholesaleDiscountAmount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">الإجمالي:</span>
            <span className="font-bold text-lg">{formatCurrency(total, currency)}</span>
          </div>
        </div>
      </div>
    );
  };

  const getAbandonmentInfo = () => {
    if (cart.status !== CartStatus.ABANDONED && !cart.isAbandoned) return null;

    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">معلومات الهجر</h4>
        <div className="space-y-2">
          {cart.lastActivityAt && (
            <div className="flex justify-between">
              <span>آخر نشاط:</span>
              <span className="font-medium">{formatDate(cart.lastActivityAt)}</span>
            </div>
          )}
          {cart.abandonmentEmailsSent && (
            <div className="flex justify-between">
              <span>التذكيرات المرسلة:</span>
              <span className="font-medium">{cart.abandonmentEmailsSent}</span>
            </div>
          )}
          {cart.lastAbandonmentEmailAt && (
            <div className="flex justify-between">
              <span>آخر تذكير:</span>
              <span className="font-medium">{formatDate(cart.lastAbandonmentEmailAt)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getConversionInfo = () => {
    if (cart.status !== CartStatus.CONVERTED) return null;

    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">معلومات التحويل</h4>
        <div className="space-y-2">
          {cart.convertedToOrderId && (
            <div className="flex justify-between">
              <span>معرف الطلب:</span>
              <span className="font-medium font-mono">{cart.convertedToOrderId}</span>
            </div>
          )}
          {cart.convertedAt && (
            <div className="flex justify-between">
              <span>تاريخ التحويل:</span>
              <span className="font-medium">{formatDate(cart.convertedAt)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">تفاصيل السلة</h2>
          <div className="flex items-center space-x-3">
            {getStatusBadge(cart.status)}
            <span className="text-sm text-gray-500 font-mono">
              {cart._id}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Info */}
          {getUserInfo()}

          {/* Pricing Summary */}
          {getPricingSummary()}
        </div>

        {/* Abandonment Info */}
        {getAbandonmentInfo()}

        {/* Conversion Info */}
        {getConversionInfo()}

        {/* Cart Items */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">عناصر السلة</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            {cart.items && cart.items.length > 0 ? (
              <div className="space-y-3">
                {cart.items.map((item, index) => (
                  <div key={item._id || index} className="flex justify-between items-center p-3 bg-white rounded border">
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.variant?.name || `معرف المتغير: ${item.variantId}`}
                      </div>
                      {item.variant?.product && (
                        <div className="text-sm text-gray-500">
                          المنتج: {item.variant.product.name}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        أضيف في: {formatDate(item.addedAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-lg">{item.qty}</div>
                      <div className="text-sm text-gray-500">كمية</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                لا توجد عناصر في السلة
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
          
          {cart.status === CartStatus.ABANDONED && onSendReminder && (
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => onSendReminder(cart._id)}
            >
              إرسال تذكير
            </Button>
          )}
          
          {cart.status === CartStatus.ACTIVE && onConvertToOrder && (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => onConvertToOrder(cart._id)}
            >
              تحويل إلى طلب
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

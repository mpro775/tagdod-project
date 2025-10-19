import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { CartTable } from '../components/CartTable';
import { CartDetailsModal } from '../components/CartDetailsModal';
import { useAbandonedCarts } from '../hooks/useCart';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../api/cartApi';

export const AbandonedCartsPage: React.FC = () => {
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [hours, setHours] = useState(24);
  const [limit, setLimit] = useState(50);

  const {
    abandonedCarts,
    loading,
    error,
    stats,
    sendReminder,
    sendAllReminders,
    fetchAbandonedCarts,
  } = useAbandonedCarts(hours, limit);

  const handleViewCart = (cartId: string) => {
    setSelectedCartId(cartId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCartId(null);
  };

  const handleSendReminder = async (cartId: string) => {
    const success = await sendReminder(cartId);
    if (success) {
      toast.success('تم إرسال التذكير بنجاح');
    } else {
      toast.error('فشل في إرسال التذكير');
    }
  };

  const handleSendAllReminders = async () => {
    const success = await sendAllReminders();
    if (success) {
      toast.success(`تم إرسال ${stats.count} تذكير بنجاح`);
    } else {
      toast.error('فشل في إرسال التذكيرات');
    }
  };

  const handleHoursChange = (newHours: number) => {
    setHours(newHours);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium">خطأ في تحميل السلال المتروكة</p>
              <p className="text-sm mt-2">{error}</p>
              <Button
                onClick={fetchAbandonedCarts}
                className="mt-4"
              >
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
          <h1 className="text-2xl font-bold text-gray-900">السلال المتروكة</h1>
          <p className="text-gray-600 mt-1">
            متابعة وإدارة السلال التي تم هجرها من قبل العملاء
          </p>
        </div>
        <Button
          onClick={fetchAbandonedCarts}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'جاري التحديث...' : 'تحديث'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              السلال المتروكة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.count.toLocaleString('ar-SA')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              من أصل {stats.totalCarts} سلة إجمالية
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              القيمة المفقودة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalValue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              إجمالي قيمة السلال المتروكة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              معدل الهجر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.totalCarts > 0 ? ((stats.count / stats.totalCarts) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              نسبة السلال المتروكة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>تصفية السلال المتروكة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hours-select" className="block text-sm font-medium text-gray-700 mb-2">
                عدد الساعات غير النشطة
              </label>
              <select
                id="hours-select"
                value={hours}
                onChange={(e) => handleHoursChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>ساعة واحدة</option>
                <option value={6}>6 ساعات</option>
                <option value={12}>12 ساعة</option>
                <option value={24}>24 ساعة</option>
                <option value={48}>48 ساعة</option>
                <option value={72}>72 ساعة</option>
                <option value={168}>أسبوع</option>
              </select>
            </div>
            <div>
              <label htmlFor="limit-select" className="block text-sm font-medium text-gray-700 mb-2">
                عدد السلال المعروضة
              </label>
              <select
                id="limit-select"
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {stats.count > 0 && (
                <span>
                  تم العثور على {stats.count} سلة متروكة خلال آخر {hours} ساعة
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleSendAllReminders}
                disabled={loading || stats.count === 0}
                className="bg-orange-600 hover:bg-orange-700"
              >
                إرسال تذكيرات لجميع السلال
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cart Table */}
      <CartTable
        carts={abandonedCarts}
        loading={loading}
        onViewCart={handleViewCart}
        onSendReminder={handleSendReminder}
      />

      {/* Cart Details Modal */}
      <CartDetailsModal
        cart={abandonedCarts.find(cart => cart._id === selectedCartId) || null}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onSendReminder={handleSendReminder}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { CartFilters as CartFiltersType, CartStatus } from '../types/cart.types';
import { formatCartStatus } from '../api/cartApi';

interface CartFiltersProps {
  filters: CartFiltersType;
  onFiltersChange: (filters: CartFiltersType) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  loading?: boolean;
}

const statusOptions = [
  { value: CartStatus.ACTIVE, label: 'نشط' },
  { value: CartStatus.ABANDONED, label: 'متروك' },
  { value: CartStatus.CONVERTED, label: 'محول' },
  { value: CartStatus.EXPIRED, label: 'منتهي' },
];

export const CartFilters: React.FC<CartFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  loading = false,
}) => {
  const [localFilters, setLocalFilters] = useState<CartFiltersType>(filters);

  const handleFilterChange = (key: keyof CartFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleApply = () => {
    onApplyFilters();
  };

  const handleReset = () => {
    const resetFilters = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onResetFilters();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>تصفية السلال</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حالة السلة
            </label>
            <select
              value={localFilters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* User ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              معرف المستخدم
            </label>
            <input
              type="text"
              value={localFilters.userId || ''}
              onChange={(e) => handleFilterChange('userId', e.target.value || undefined)}
              placeholder="أدخل معرف المستخدم"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date From Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={localFilters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={localFilters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={loading}
          >
            إعادة تعيين
          </Button>
          <Button
            onClick={handleApply}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'جاري التحميل...' : 'تطبيق التصفية'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

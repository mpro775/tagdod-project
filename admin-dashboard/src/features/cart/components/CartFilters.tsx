import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { Button } from '@mui/material';
import { CartFilters as CartFiltersType, CartStatus } from '../types/cart.types';

interface CartFiltersProps {
  filters: CartFiltersType;
  // eslint-disable-next-line no-unused-vars
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
        <Typography variant="h6">تصفية السلال</Typography>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              حالة السلة
            </label>
            <select
              id="status-filter"
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
            <label
              htmlFor="user-id-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              معرف المستخدم
            </label>
            <input
              id="user-id-filter"
              type="text"
              value={localFilters.userId || ''}
              onChange={(e) => handleFilterChange('userId', e.target.value || undefined)}
              placeholder="أدخل معرف المستخدم"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date From Filter */}
          <div>
            <label
              htmlFor="date-from-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              من تاريخ
            </label>
            <input
              id="date-from-filter"
              type="date"
              value={localFilters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date To Filter */}
          <div>
            <label
              htmlFor="date-to-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              إلى تاريخ
            </label>
            <input
              id="date-to-filter"
              type="date"
              value={localFilters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button onClick={handleReset} variant="outlined" disabled={loading}>
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

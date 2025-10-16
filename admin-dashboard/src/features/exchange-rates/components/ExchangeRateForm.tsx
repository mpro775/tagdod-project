import React, { useState } from 'react';
import { Currency } from '../../../shared/types/currency.types';

interface ExchangeRateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    fromCurrency?: Currency;
    toCurrency?: Currency;
    rate?: number;
    effectiveDate?: string;
    expiryDate?: string;
    notes?: string;
  };
}

export const ExchangeRateForm: React.FC<ExchangeRateFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    fromCurrency: initialData?.fromCurrency || Currency.USD,
    toCurrency: initialData?.toCurrency || Currency.YER,
    rate: initialData?.rate || 0,
    effectiveDate: initialData?.effectiveDate || '',
    expiryDate: initialData?.expiryDate || '',
    notes: initialData?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.fromCurrency === formData.toCurrency) {
      setError('العملة المصدر والعملة الهدف يجب أن تكونا مختلفتين');
      return;
    }

    if (formData.rate <= 0) {
      setError('السعر يجب أن يكون أكبر من صفر');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/exchange-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromCurrency: formData.fromCurrency,
          toCurrency: formData.toCurrency,
          rate: formData.rate,
          effectiveDate: formData.effectiveDate || undefined,
          expiryDate: formData.expiryDate || undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create exchange rate');
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="exchange-rate-form">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              العملة المصدر
            </label>
            <select
              value={formData.fromCurrency}
              onChange={(e) => handleChange('fromCurrency', e.target.value as Currency)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value={Currency.USD}>USD - دولار أمريكي</option>
              <option value={Currency.YER}>YER - ريال يمني</option>
              <option value={Currency.SAR}>SAR - ريال سعودي</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              العملة الهدف
            </label>
            <select
              value={formData.toCurrency}
              onChange={(e) => handleChange('toCurrency', e.target.value as Currency)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value={Currency.USD}>USD - دولار أمريكي</option>
              <option value={Currency.YER}>YER - ريال يمني</option>
              <option value={Currency.SAR}>SAR - ريال سعودي</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            السعر
          </label>
          <input
            type="number"
            step="0.0001"
            min="0"
            value={formData.rate}
            onChange={(e) => handleChange('rate', parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="مثال: 250.5"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            كم وحدة من العملة الهدف تساوي 1 وحدة من العملة المصدر
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تاريخ البداية (اختياري)
            </label>
            <input
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => handleChange('effectiveDate', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تاريخ النهاية (اختياري)
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ملاحظات (اختياري)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ملاحظات إضافية حول سعر الصرف..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              إلغاء
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExchangeRateForm;

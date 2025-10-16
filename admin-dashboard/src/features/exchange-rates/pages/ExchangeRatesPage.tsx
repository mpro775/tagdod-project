import React, { useState } from 'react';
import ExchangeRatesList from '../components/ExchangeRatesList';
import ExchangeRateForm from '../components/ExchangeRateForm';

export const ExchangeRatesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSuccess = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="exchange-rates-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                إدارة أسعار الصرف
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                إدارة أسعار الصرف بين العملات المختلفة
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              إضافة سعر صرف
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  إضافة سعر صرف جديد
                </h3>
                <ExchangeRateForm
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </div>
            </div>
          </div>
        )}

        <ExchangeRatesList key={refreshKey} />
      </div>
    </div>
  );
};

export default ExchangeRatesPage;

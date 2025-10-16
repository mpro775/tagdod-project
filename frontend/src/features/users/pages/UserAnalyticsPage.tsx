import React, { useState } from 'react';
import { UserStatsCard } from '../components/UserStatsCard';
import { CustomerRankingTable } from '../components/CustomerRankingTable';
import { UserDetailsModal } from '../components/UserDetailsModal';
import { useOverallAnalytics, useCustomerRankings } from '../hooks/useUserAnalytics';

// Icons
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h9" />
  </svg>
);

const CurrencyDollarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-red-800">خطأ في تحميل البيانات</h3>
        <div className="mt-2 text-sm text-red-700">
          <p>{message}</p>
        </div>
        {onRetry && (
          <div className="mt-4">
            <button
              onClick={onRetry}
              className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              إعادة المحاولة
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export const UserAnalyticsPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    analytics: overallAnalytics,
    loading: overallLoading,
    error: overallError,
    refetch: refetchOverall,
  } = useOverallAnalytics();

  const {
    rankings,
    loading: rankingsLoading,
    error: rankingsError,
    refetch: refetchRankings,
  } = useCustomerRankings(50);

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  const handleRefresh = () => {
    refetchOverall();
    refetchRankings();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إحصائيات المستخدمين</h1>
              <p className="mt-1 text-sm text-gray-500">
                تحليل شامل لسلوك المستخدمين وأداء العملاء
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshIcon />
              <span className="mr-2">تحديث</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overall Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overallLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))
        ) : overallError ? (
          <div className="col-span-full">
            <ErrorMessage message={overallError} onRetry={refetchOverall} />
          </div>
        ) : overallAnalytics ? (
          <>
            <UserStatsCard
              title="إجمالي المستخدمين"
              value={overallAnalytics.totalUsers}
              subtitle={`${overallAnalytics.activeUsers} نشطين`}
              icon={<UsersIcon />}
              color="blue"
            />
            <UserStatsCard
              title="المستخدمين الجدد"
              value={overallAnalytics.newUsersThisMonth}
              subtitle="هذا الشهر"
              icon={<TrendingUpIcon />}
              color="green"
            />
            <UserStatsCard
              title="متوسط قيمة الطلب"
              value={`${overallAnalytics.averageOrderValue.toLocaleString()} ريال`}
              subtitle={`القيمة المتوقعة: ${overallAnalytics.customerLifetimeValue.toLocaleString()} ريال`}
              icon={<ShoppingCartIcon />}
              color="yellow"
            />
            <UserStatsCard
              title="إجمالي القيمة"
              value={`${overallAnalytics.topSpenders.reduce((sum, customer) => sum + customer.totalSpent, 0).toLocaleString()} ريال`}
              subtitle={`من أفضل ${overallAnalytics.topSpenders.length} عميل`}
              icon={<CurrencyDollarIcon />}
              color="purple"
            />
          </>
        ) : null}
      </div>

      {/* Customer Rankings Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">ترتيب العملاء</h2>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-500">
                آخر تحديث: {new Date().toLocaleString('ar-SA')}
              </span>
            </div>
          </div>
          
          {rankingsLoading ? (
            <LoadingSpinner />
          ) : rankingsError ? (
            <ErrorMessage message={rankingsError} onRetry={refetchRankings} />
          ) : (
            <CustomerRankingTable
              data={rankings}
              onUserClick={handleUserClick}
              loading={rankingsLoading}
            />
          )}
        </div>
      </div>

      {/* Quick Stats Summary */}
      {overallAnalytics && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ملخص سريع</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {overallAnalytics.totalUsers}
              </div>
              <div className="text-sm text-gray-600">إجمالي المستخدمين</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((overallAnalytics.activeUsers / overallAnalytics.totalUsers) * 100)}%
              </div>
              <div className="text-sm text-gray-600">نسبة المستخدمين النشطين</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {overallAnalytics.averageOrderValue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">متوسط قيمة الطلب (ريال)</div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default UserAnalyticsPage;

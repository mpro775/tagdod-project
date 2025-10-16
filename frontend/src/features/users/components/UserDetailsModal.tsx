import React from 'react';
import { UserDetailsModalProps } from '../types/user-analytics.types';
import { useUserAnalytics } from '../hooks/useUserAnalytics';
import { UserStatsCard } from './UserStatsCard';

// Icons
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">خطأ في تحميل البيانات</h3>
        <div className="mt-2 text-sm text-red-700">
          <p>{message}</p>
        </div>
      </div>
    </div>
  </div>
);

const ChurnRiskBadge = ({ risk }: { risk: 'low' | 'medium' | 'high' }) => {
  const getRiskColor = () => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskText = () => {
    switch (risk) {
      case 'low':
        return 'مخاطر منخفضة';
      case 'medium':
        return 'مخاطر متوسطة';
      case 'high':
        return 'مخاطر عالية';
      default:
        return 'غير محدد';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor()}`}>
      {getRiskText()}
    </span>
  );
};

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const { userStats, loading, error } = useUserAnalytics(userId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                تفاصيل المستخدم
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pb-4 sm:p-6">
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {userStats && !loading && (
              <div className="space-y-6">
                {/* User Info Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">معلومات المستخدم</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">الاسم</p>
                      <p className="font-medium">
                        {userStats.userInfo.firstName && userStats.userInfo.lastName
                          ? `${userStats.userInfo.firstName} ${userStats.userInfo.lastName}`
                          : userStats.userInfo.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">رقم الهاتف</p>
                      <p className="font-medium">{userStats.userInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">حالة الحساب</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userStats.userInfo.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userStats.userInfo.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
                      <p className="font-medium">
                        {new Date(userStats.userInfo.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">الأدوار</p>
                      <div className="flex flex-wrap gap-1">
                        {userStats.userInfo.roles.map((role, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">مخاطر فقدان العميل</p>
                      <ChurnRiskBadge risk={userStats.predictions.churnRisk} />
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <UserStatsCard
                    title="إجمالي الطلبات"
                    value={userStats.orders.total}
                    subtitle={`${userStats.orders.completed} مكتملة`}
                    color="blue"
                  />
                  <UserStatsCard
                    title="إجمالي الإنفاق"
                    value={`${userStats.orders.totalSpent.toLocaleString()} ريال`}
                    subtitle={`متوسط ${userStats.orders.averageOrderValue.toLocaleString()} ريال للطلب`}
                    color="green"
                  />
                  <UserStatsCard
                    title="المفضلة"
                    value={userStats.favorites.total}
                    subtitle={`${userStats.favorites.categories.length} فئة`}
                    color="yellow"
                  />
                  <UserStatsCard
                    title="النقاط الإجمالية"
                    value={Math.round(userStats.score.overallScore)}
                    subtitle={`الترتيب: ${userStats.score.rank}`}
                    color="purple"
                  />
                </div>

                {/* Detailed Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Orders Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الطلبات</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">الطلبات المعلقة:</span>
                        <span className="font-medium">{userStats.orders.pending}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الطلبات الملغية:</span>
                        <span className="font-medium">{userStats.orders.cancelled}</span>
                      </div>
                      {userStats.orders.firstOrderDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">أول طلب:</span>
                          <span className="font-medium">
                            {new Date(userStats.orders.firstOrderDate).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      )}
                      {userStats.orders.lastOrderDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">آخر طلب:</span>
                          <span className="font-medium">
                            {new Date(userStats.orders.lastOrderDate).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {userStats.orders.favoriteCategories.length > 0 && (
                      <div className="mt-4">
                        <h6 className="text-sm font-medium text-gray-900 mb-2">الفئات المفضلة</h6>
                        <div className="space-y-2">
                          {userStats.orders.favoriteCategories.slice(0, 3).map((category, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">{category.category}</span>
                              <span className="font-medium">
                                {category.count} طلب - {category.amount.toLocaleString()} ريال
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Favorites Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4">المفضلة</h5>
                    {userStats.favorites.recentFavorites.length > 0 ? (
                      <div className="space-y-2">
                        <h6 className="text-sm font-medium text-gray-900">آخر المفضلة</h6>
                        {userStats.favorites.recentFavorites.slice(0, 5).map((favorite, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600 truncate">{favorite.productName}</span>
                            <span className="text-gray-500">
                              {new Date(favorite.addedAt).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">لا توجد مفضلة</p>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                {userStats.predictions.recommendedActions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="text-lg font-semibold text-blue-900 mb-3">التوصيات المقترحة</h5>
                    <ul className="space-y-2">
                      {userStats.predictions.recommendedActions.map((action, index) => (
                        <li key={index} className="flex items-start text-sm text-blue-800">
                          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { CartStatsCard } from '../components/CartStatsCard';
import { useCartAnalytics, useCartStatistics, useConversionRates } from '../hooks/useCart';
import { formatCurrency } from '../api/cartApi';
import { 
  ShoppingCartIcon, 
  XCircleIcon, 
  CheckCircleIcon, 
  TrendingUpIcon,
  CurrencyDollarIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

export const CartAnalyticsPage: React.FC = () => {
  const [analyticsPeriod, setAnalyticsPeriod] = useState(30);
  const [conversionPeriod, setConversionPeriod] = useState(30);

  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useCartAnalytics(analyticsPeriod);

  const {
    statistics,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useCartStatistics();

  const {
    conversionRates,
    loading: conversionLoading,
    error: conversionError,
    refetch: refetchConversion,
  } = useConversionRates(conversionPeriod);

  const handleRefreshAll = () => {
    refetchAnalytics();
    refetchStats();
    refetchConversion();
  };

  if (analyticsError || statsError || conversionError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium">خطأ في تحميل التحليلات</p>
              <p className="text-sm mt-2">
                {analyticsError || statsError || conversionError}
              </p>
              <Button
                onClick={handleRefreshAll}
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
          <h1 className="text-2xl font-bold text-gray-900">تحليلات السلة</h1>
          <p className="text-gray-600 mt-1">
            تحليل شامل لأداء السلال ومعدلات التحويل
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={analyticsPeriod}
            onChange={(e) => setAnalyticsPeriod(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>آخر 7 أيام</option>
            <option value={30}>آخر 30 يوم</option>
            <option value={90}>آخر 90 يوم</option>
            <option value={365}>آخر سنة</option>
          </select>
          <Button
            onClick={handleRefreshAll}
            disabled={analyticsLoading || statsLoading || conversionLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {analyticsLoading || statsLoading || conversionLoading ? 'جاري التحديث...' : 'تحديث'}
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CartStatsCard
            title="إجمالي السلال"
            value={analytics.overview.totalCarts}
            icon={<ShoppingCartIcon className="h-5 w-5" />}
            color="blue"
          />
          <CartStatsCard
            title="السلال النشطة"
            value={analytics.overview.activeCarts}
            icon={<CubeIcon className="h-5 w-5" />}
            color="green"
          />
          <CartStatsCard
            title="السلال المتروكة"
            value={analytics.overview.abandonedCarts}
            icon={<XCircleIcon className="h-5 w-5" />}
            color="red"
          />
          <CartStatsCard
            title="السلال المحولة"
            value={analytics.overview.convertedCarts}
            icon={<CheckCircleIcon className="h-5 w-5" />}
            color="purple"
          />
        </div>
      )}

      {/* Performance Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CartStatsCard
            title="متوسط قيمة السلة"
            value={analytics.overview.avgCartValue}
            isCurrency
            icon={<CurrencyDollarIcon className="h-5 w-5" />}
            color="green"
          />
          <CartStatsCard
            title="متوسط العناصر"
            value={analytics.overview.avgItemsPerCart.toFixed(1)}
            icon={<CubeIcon className="h-5 w-5" />}
            color="blue"
          />
          <CartStatsCard
            title="معدل التحويل"
            value={`${analytics.overview.conversionRate.toFixed(1)}%`}
            icon={<TrendingUpIcon className="h-5 w-5" />}
            color="green"
          />
          <CartStatsCard
            title="معدل الهجر"
            value={`${analytics.overview.abandonmentRate.toFixed(1)}%`}
            icon={<XCircleIcon className="h-5 w-5" />}
            color="red"
          />
        </div>
      )}

      {/* Statistics Comparison */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">إجمالي:</span>
                  <span className="font-medium">{statistics.today.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">محولة:</span>
                  <span className="font-medium text-green-600">{statistics.today.converted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">متروكة:</span>
                  <span className="font-medium text-red-600">{statistics.today.abandoned}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">القيمة:</span>
                  <span className="font-bold">{formatCurrency(statistics.today.totalValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                أمس
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">إجمالي:</span>
                  <span className="font-medium">{statistics.yesterday.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">محولة:</span>
                  <span className="font-medium text-green-600">{statistics.yesterday.converted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">متروكة:</span>
                  <span className="font-medium text-red-600">{statistics.yesterday.abandoned}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">القيمة:</span>
                  <span className="font-bold">{formatCurrency(statistics.yesterday.totalValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                آخر أسبوع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">إجمالي:</span>
                  <span className="font-medium">{statistics.lastWeek.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">محولة:</span>
                  <span className="font-medium text-green-600">{statistics.lastWeek.converted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">متروكة:</span>
                  <span className="font-medium text-red-600">{statistics.lastWeek.abandoned}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">القيمة:</span>
                  <span className="font-bold">{formatCurrency(statistics.lastWeek.totalValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                إجمالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">إجمالي:</span>
                  <span className="font-medium">{statistics.allTime.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">محولة:</span>
                  <span className="font-medium text-green-600">{statistics.allTime.converted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">متروكة:</span>
                  <span className="font-medium text-red-600">{statistics.allTime.abandoned}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">القيمة:</span>
                  <span className="font-bold">{formatCurrency(statistics.allTime.totalValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Products */}
      {analytics?.insights.topProducts && analytics.insights.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>أكثر المنتجات في السلال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.insights.topProducts.map((product, index) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium">معرف المتغير: {product._id.slice(0, 8)}...</div>
                      <div className="text-sm text-gray-500">
                        في {product.cartCount} سلة
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{product.totalQuantity}</div>
                    <div className="text-sm text-gray-500">كمية إجمالية</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cart Value Distribution */}
      {analytics?.insights.cartValueDistribution && analytics.insights.cartValueDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>توزيع قيم السلال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.insights.cartValueDistribution.map((bucket, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-24 text-sm font-medium">
                      {bucket._id === '10000+' ? '10,000+' : `${bucket._id}`} ريال
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(bucket.count / Math.max(...analytics.insights.cartValueDistribution.map(b => b.count))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{bucket.count}</div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(bucket.totalValue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Rates */}
      {conversionRates && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>معدلات التحويل اليومية</CardTitle>
              <select
                value={conversionPeriod}
                onChange={(e) => setConversionPeriod(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>آخر 7 أيام</option>
                <option value={30}>آخر 30 يوم</option>
                <option value={90}>آخر 90 يوم</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-2xl font-bold text-green-600">
                {conversionRates.averageRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">متوسط معدل التحويل</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conversionRates.dailyRates.slice(-7).map((day, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium">
                    {new Date(day.date).toLocaleDateString('ar-SA')}
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {day.conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {day.convertedCarts} من {day.totalCarts} سلة
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

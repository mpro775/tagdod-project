import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { Button } from '@mui/material';
import { Select, MenuItem } from '@mui/material';

import {
  BarChart,
  TrendingUp,
  CalendarMonth as CalendarIcon,
  Download,
  Refresh as RefreshIcon,
  Shield,
  Warning as AlertTriangleIcon,
  Work as ActivityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { AuditStatsCards, AuditLogsTable } from '../components';
import { useAuditStats, useAuditLogs, useAuditExport } from '../hooks/useAudit';
import toast from 'react-hot-toast';

export const AuditAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [showSensitiveOnly, setShowSensitiveOnly] = useState(false);

  const {
    stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useAuditStats(dateRange.startDate, dateRange.endDate);

  const { logs, isLoading: logsLoading } = useAuditLogs({
    isSensitive: showSensitiveOnly || undefined,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    limit: 10,
  });

  const { exportLogs, isExporting } = useAuditExport();

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
    }

    setDateRange({
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    });
  };

  const handleExport = async () => {
    try {
      await exportLogs({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        isSensitive: showSensitiveOnly || undefined,
      });
    } catch (error) {
      toast.error('فشل في تصدير البيانات');
    }
  };

  const handleRefresh = () => {
    refetchStats();
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'today':
        return 'اليوم';
      case 'week':
        return 'آخر أسبوع';
      case 'month':
        return 'آخر شهر';
      case 'quarter':
        return 'آخر 3 أشهر';
      case 'year':
        return 'آخر سنة';
      default:
        return 'آخر أسبوع';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">تحليلات التدقيق</h1>
          <p className="text-muted-foreground">إحصائيات وتحليلات شاملة لسجلات التدقيق</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outlined" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshIcon className="h-4 w-4" />
            تحديث
          </Button>
          <Button
            variant="outlined"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'جاري التصدير...' : 'تصدير التقرير'}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <Typography variant="h6" className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              الفترة الزمنية
            </Typography>
          </CardHeader>
          <CardContent>
            <Select value={selectedPeriod} onChange={(e) => handlePeriodChange(e.target.value)}>
              <MenuItem value="today">اليوم</MenuItem>
              <MenuItem value="week">آخر أسبوع</MenuItem>
              <MenuItem value="month">آخر شهر</MenuItem>
              <MenuItem value="quarter">آخر 3 أشهر</MenuItem>
              <MenuItem value="year">آخر سنة</MenuItem>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Typography variant="h6" className="flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5" />
              نوع السجلات
            </Typography>
          </CardHeader>
          <CardContent>
            <Select
              value={showSensitiveOnly ? 'sensitive' : 'all'}
              onChange={(e) => setShowSensitiveOnly(e.target.value === 'sensitive')}
            >
              <MenuItem value="all">جميع السجلات</MenuItem>
              <MenuItem value="sensitive">العمليات الحساسة فقط</MenuItem>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Typography variant="h6" className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5" />
              ملخص الفترة
            </Typography>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">{getPeriodLabel(selectedPeriod)}</div>
            {dateRange.startDate && dateRange.endDate && (
              <div className="text-xs text-muted-foreground mt-1">
                {format(new Date(dateRange.startDate), 'dd/MM/yyyy', { locale: ar })} -{' '}
                {format(new Date(dateRange.endDate), 'dd/MM/yyyy', { locale: ar })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <AuditStatsCards stats={stats} isLoading={statsLoading} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Overview */}
        <Card>
          <CardHeader>
            <Typography variant="h6" className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              نظرة عامة على النشاط
            </Typography>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">إجمالي العمليات</span>
                  <span className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">العمليات الحساسة</span>
                  <span className="text-2xl font-bold text-red-600">
                    {stats.sensitiveLogs.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">تغييرات الصلاحيات</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {stats.permissionChanges.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">الإجراءات الإدارية</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {stats.adminActions.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ActivityIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">لا توجد بيانات</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  لا توجد إحصائيات متاحة للفترة المحددة
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Overview */}
        <Card>
          <CardHeader>
            <Typography variant="h6" className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              نظرة عامة على الأمان
            </Typography>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">أحداث المصادقة</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {stats.authEvents.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">تغييرات الأدوار</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {stats.roleChanges.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">قرارات القدرات</span>
                  <span className="text-2xl font-bold text-green-600">
                    {stats.capabilityDecisions.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">نسبة الحساسية</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {stats.totalLogs > 0
                      ? Math.round((stats.sensitiveLogs / stats.totalLogs) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">لا توجد بيانات</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  لا توجد إحصائيات أمان متاحة للفترة المحددة
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <Typography variant="h6" className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            النشاط الأخير
          </Typography>
        </CardHeader>
        <CardContent>
          <AuditLogsTable logs={logs} isLoading={logsLoading} onViewDetails={() => {}} />
        </CardContent>
      </Card>
    </div>
  );
};

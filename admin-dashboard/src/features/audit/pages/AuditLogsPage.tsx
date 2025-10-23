import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Download,
  RefreshCw,
  Search,
  Filter,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AuditFilters,
  AuditStatsCards,
  AuditLogsTable,
  AuditLogDetails,
} from '../components';
import {
  useAuditLogs,
  useAuditStats,
  useAuditActions,
  useAuditResources,
  useAuditExport,
  useAuditFilters,
} from '../hooks/useAudit';
import { AuditLog } from '../types/audit.types';

export const AuditLogsPage: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<string>('');

  const {
    filters,
    dateRange,
    updateFilters,
    updateDateRange,
    clearFilters,
    hasActiveFilters,
  } = useAuditFilters();

  const { logs, meta, isLoading, pagination, handlePageChange, handleLimitChange } =
    useAuditLogs(filters);

  const { stats, isLoading: statsLoading } = useAuditStats(
    dateRange.startDate,
    dateRange.endDate
  );

  const { actions } = useAuditActions();
  const { resources } = useAuditResources();
  const { exportLogs, isExporting } = useAuditExport();

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedLog(null);
  };

  const handleExport = async () => {
    try {
      await exportLogs(filters);
    } catch (error) {
      toast.error('فشل في تصدير البيانات');
    }
  };

  const handleQuickFilter = (filter: string) => {
    setQuickFilter(filter);
    switch (filter) {
      case 'sensitive':
        updateFilters({ isSensitive: true });
        break;
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        updateDateRange(today.toISOString(), new Date().toISOString());
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        updateDateRange(weekAgo.toISOString(), new Date().toISOString());
        break;
      case 'admin':
        updateFilters({ resource: 'admin' as any });
        break;
      case 'auth':
        updateFilters({ resource: 'auth' as any });
        break;
      default:
        clearFilters();
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.user?.name?.toLowerCase().includes(searchLower) ||
      log.performedByUser?.name?.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.resource.toLowerCase().includes(searchLower) ||
      log.reason?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">سجلات التدقيق</h1>
          <p className="text-muted-foreground">
            مراقبة وتتبع جميع العمليات في النظام
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'جاري التصدير...' : 'تصدير البيانات'}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <AuditStatsCards stats={stats} isLoading={statsLoading} />

      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={quickFilter === 'sensitive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('sensitive')}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              العمليات الحساسة
            </Button>
            <Button
              variant={quickFilter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('today')}
            >
              اليوم
            </Button>
            <Button
              variant={quickFilter === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('week')}
            >
              آخر أسبوع
            </Button>
            <Button
              variant={quickFilter === 'admin' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('admin')}
            >
              الإجراءات الإدارية
            </Button>
            <Button
              variant={quickFilter === 'auth' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('auth')}
            >
              أحداث المصادقة
            </Button>
            <Button
              variant={quickFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('all')}
            >
              عرض الكل
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              البحث
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="البحث في السجلات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Results Count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              النتائج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredLogs.length.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              من أصل {meta?.total.toLocaleString() || 0} سجل
            </p>
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        <Card>
          <CardHeader>
            <CardTitle>التحكم في الصفحات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Select
                value={pagination.limit.toString()}
                onValueChange={(value) => handleLimitChange(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 سجل</SelectItem>
                  <SelectItem value="50">50 سجل</SelectItem>
                  <SelectItem value="100">100 سجل</SelectItem>
                  <SelectItem value="200">200 سجل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <AuditFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        availableActions={actions}
        availableResources={resources}
      />

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجلات التدقيق</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogsTable
            logs={filteredLogs}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                عرض {((pagination.page - 1) * pagination.limit) + 1} إلى{' '}
                {Math.min(pagination.page * pagination.limit, meta.total)} من{' '}
                {meta.total} سجل
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  السابق
                </Button>
                <span className="text-sm">
                  صفحة {pagination.page} من {Math.ceil(meta.total / pagination.limit)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!meta.hasMore}
                >
                  التالي
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log Details Dialog */}
      <AuditLogDetails
        log={selectedLog}
        isOpen={showDetails}
        onClose={handleCloseDetails}
      />
    </div>
  );
};

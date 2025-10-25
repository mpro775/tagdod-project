import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Security as ShieldIcon,
  Warning as AlertTriangleIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { AuditFilters, AuditStatsCards, AuditLogsTable, AuditLogDetails } from '../components';
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

  const { filters, dateRange, updateFilters, updateDateRange, clearFilters, hasActiveFilters } =
    useAuditFilters();

  const { logs, meta, isLoading, pagination, handlePageChange, handleLimitChange } =
    useAuditLogs(filters);

  const { stats, isLoading: statsLoading } = useAuditStats(dateRange.startDate, dateRange.endDate);

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h3" fontWeight="bold">
            سجلات التدقيق
          </Typography>
          <Typography variant="body1" color="text.secondary">
            مراقبة وتتبع جميع العمليات في النظام
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleExport}
            disabled={isExporting}
            startIcon={<DownloadIcon />}
          >
            {isExporting ? 'جاري التصدير...' : 'تصدير البيانات'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            startIcon={<RefreshIcon />}
          >
            تحديث
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <AuditStatsCards stats={stats} isLoading={statsLoading} />

      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            فلاتر سريعة
          </Typography>
        </CardHeader>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant={quickFilter === 'sensitive' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleQuickFilter('sensitive')}
              startIcon={<AlertTriangleIcon />}
            >
              العمليات الحساسة
            </Button>
            <Button
              variant={quickFilter === 'today' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleQuickFilter('today')}
            >
              اليوم
            </Button>
            <Button
              variant={quickFilter === 'week' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleQuickFilter('week')}
            >
              آخر أسبوع
            </Button>
            <Button
              variant={quickFilter === 'admin' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleQuickFilter('admin')}
            >
              الإجراءات الإدارية
            </Button>
            <Button
              variant={quickFilter === 'auth' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleQuickFilter('auth')}
            >
              أحداث المصادقة
            </Button>
            <Button
              variant={quickFilter === 'all' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleQuickFilter('all')}
            >
              عرض الكل
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Grid container spacing={3}>
        {/* Search */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardHeader>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon />
                البحث
              </Typography>
            </CardHeader>
            <CardContent>
              <TextField
                placeholder="البحث في السجلات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Results Count */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardHeader>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldIcon />
                النتائج
              </Typography>
            </CardHeader>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {filteredLogs.length.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                من أصل {meta?.total.toLocaleString() || 0} سجل
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pagination Controls */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardHeader>
              <Typography variant="h6">التحكم في الصفحات</Typography>
            </CardHeader>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>عدد السجلات</InputLabel>
                <Select
                  value={pagination.limit.toString()}
                  onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                >
                  <MenuItem value="25">25 سجل</MenuItem>
                  <MenuItem value="50">50 سجل</MenuItem>
                  <MenuItem value="100">100 سجل</MenuItem>
                  <MenuItem value="200">200 سجل</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
          <Typography variant="h6">سجلات التدقيق</Typography>
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
          <CardContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                عرض {(pagination.page - 1) * pagination.limit + 1} إلى{' '}
                {Math.min(pagination.page * pagination.limit, meta.total)} من {meta.total} سجل
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  السابق
                </Button>
                <Typography variant="body2">
                  صفحة {pagination.page} من {Math.ceil(meta.total / pagination.limit)}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!meta.hasMore}
                >
                  التالي
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Log Details Dialog */}
      <AuditLogDetails log={selectedLog} isOpen={showDetails} onClose={handleCloseDetails} />
    </Box>
  );
};

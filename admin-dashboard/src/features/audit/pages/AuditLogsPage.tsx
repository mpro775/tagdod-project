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
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useMediaQuery, useTheme } from '@mui/material';
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
  const { t } = useTranslation('audit');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
      toast.error(t('messages.exportFailed'));
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
          >
            {t('audit.logs')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            {t('audit.subtitle')}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'stretch',
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Button
            variant="outlined"
            onClick={handleExport}
            disabled={isExporting}
            startIcon={<DownloadIcon />}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            sx={{ flex: { xs: 1, sm: 'none' }, minWidth: { xs: '100%', sm: 'auto' } }}
          >
            {isExporting ? t('messages.exporting') : t('buttons.exportData')}
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            startIcon={<RefreshIcon />}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            sx={{ flex: { xs: 1, sm: 'none' }, minWidth: { xs: '100%', sm: 'auto' } }}
          >
            {t('buttons.refresh')}
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
            {t('filters.quickFilters')}
          </Typography>
        </CardHeader>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              '& > button': {
                flex: { xs: '1 1 calc(50% - 8px)', sm: 'none' },
                minWidth: { xs: 'calc(50% - 8px)', sm: 'auto' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              },
            }}
          >
            <Button
              variant={quickFilter === 'sensitive' ? 'contained' : 'outlined'}
              size={isMobile ? 'small' : 'small'}
              onClick={() => handleQuickFilter('sensitive')}
              startIcon={<AlertTriangleIcon />}
            >
              {t('filters.sensitiveOperations')}
            </Button>
            <Button
              variant={quickFilter === 'today' ? 'contained' : 'outlined'}
              size={isMobile ? 'small' : 'small'}
              onClick={() => handleQuickFilter('today')}
            >
              {t('filters.today')}
            </Button>
            <Button
              variant={quickFilter === 'week' ? 'contained' : 'outlined'}
              size={isMobile ? 'small' : 'small'}
              onClick={() => handleQuickFilter('week')}
            >
              {t('filters.lastWeek')}
            </Button>
            <Button
              variant={quickFilter === 'admin' ? 'contained' : 'outlined'}
              size={isMobile ? 'small' : 'small'}
              onClick={() => handleQuickFilter('admin')}
            >
              {t('filters.adminActions')}
            </Button>
            <Button
              variant={quickFilter === 'auth' ? 'contained' : 'outlined'}
              size={isMobile ? 'small' : 'small'}
              onClick={() => handleQuickFilter('auth')}
            >
              {t('filters.authEvents')}
            </Button>
            <Button
              variant={quickFilter === 'all' ? 'contained' : 'outlined'}
              size={isMobile ? 'small' : 'small'}
              onClick={() => handleQuickFilter('all')}
            >
              {t('filters.showAll')}
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
                {t('filters.search')}    
              </Typography>
            </CardHeader>
            <CardContent>
              <TextField
                placeholder={t('filters.searchPlaceholder')}
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
                {t('filters.results')}
              </Typography>
            </CardHeader>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {filteredLogs.length.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('filters.resultsCount', {
                  count: meta?.total || 0,
                })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pagination Controls */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardHeader>
              <Typography variant="h6">{t('filters.pagination')}</Typography>
            </CardHeader>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>{t('filters.logsPerPage')}</InputLabel>
                <Select
                  value={pagination.limit.toString()}
                  onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                >
                  <MenuItem value="25">{t('filters.25Logs')}</MenuItem>
                  <MenuItem value="50">{t('filters.50Logs')}</MenuItem>
                  <MenuItem value="100">{t('filters.100Logs')}</MenuItem>
                  <MenuItem value="200">{t('filters.200Logs')}</MenuItem>
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
          <Typography variant="h6">{t('audit.logs')}</Typography>
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {t('audit.viewLogs', {
                  start: (pagination.page - 1) * pagination.limit + 1,
                  end: Math.min(pagination.page * pagination.limit, meta.total),
                  total: meta.total,
                })}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: { xs: 'space-between', sm: 'flex-end' },
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  fullWidth={isMobile}
                >
                  {t('audit.previous')}
                </Button>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    textAlign: { xs: 'center', sm: 'left' },
                    flex: { xs: '1 1 auto', sm: 'none' },
                  }}
                >
                  {t('audit.page', {
                    page: pagination.page,
                    total: Math.ceil(meta.total / pagination.limit),
                  })}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!meta.hasMore}
                  fullWidth={isMobile}
                >
                  {t('audit.next')}
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

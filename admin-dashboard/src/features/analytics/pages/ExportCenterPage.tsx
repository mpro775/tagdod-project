import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  CardActions,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  Alert,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  DataObject as CsvIcon,
  Code as JsonIcon,
  OpenInNew as OpenIcon,
  ContentCopy as CopyIcon,
  MoreVert as MoreIcon,
  InsertDriveFile as TotalFilesIcon,
  CheckCircle as AvailableIcon,
  Error as FailedIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PageShell, PageHeader, usePageTitle, StatCard, PageSummaryGrid } from '@/shared/design-system';

import { useExportedFiles } from '../hooks/useAnalytics';
import { ExportFile, ExportFileStatus, ExportFormat } from '../types/exports';
import { formatFileSize } from '../utils/exportMappers';
import { withAnalyticsErrorBoundary } from '../components/AnalyticsErrorBoundary';

const formatIcons: Record<string, React.ReactNode> = {
  pdf: <PdfIcon color="error" />,
  xlsx: <ExcelIcon color="success" />,
  csv: <CsvIcon color="primary" />,
  json: <JsonIcon color="warning" />,
};

const statusColors: Record<ExportFileStatus, 'success' | 'info' | 'error' | 'default'> = {
  available: 'success',
  processing: 'info',
  failed: 'error',
  expired: 'default',
};

const statusLabelsEn: Record<ExportFileStatus, string> = {
  available: 'Available',
  processing: 'Processing',
  failed: 'Failed',
  expired: 'Expired',
};

export const ExportCenterPage = withAnalyticsErrorBoundary(function ExportCenterPage() {
  const { t, i18n } = useTranslation('analytics');
  usePageTitle(t('analytics:exportCenter.title', 'مركز التصدير'));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFile, setSelectedFile] = useState<ExportFile | null>(null);

  const params = useMemo(
    () => ({
      page: page + 1,
      limit,
      search: search || undefined,
      format: (formatFilter !== 'all' ? formatFilter : undefined) as ExportFormat | undefined,
      status: (statusFilter !== 'all' ? statusFilter : undefined) as ExportFileStatus | undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
    }),
    [page, limit, search, formatFilter, statusFilter, categoryFilter]
  );

  const { data: exportsData, isLoading, isError, refetch } = useExportedFiles(params);

  const files = useMemo(() => exportsData?.data ?? [], [exportsData?.data]);
  const meta = exportsData?.meta;

  const getStatusLabel = (status: ExportFileStatus) => t(`exportCenter.status.${status}`, statusLabelsEn[status] || status);

  const stats = useMemo(() => {
    const totalFiles = meta?.total ?? files.length;
    const availableFiles = files.filter((f) => f.status === 'available').length;
    const failedFiles = files.filter((f) => f.status === 'failed').length;
    const totalSize = files.reduce((sum, f) => sum + (f.fileSize || 0), 0);
    return { totalFiles, availableFiles, failedFiles, totalSize };
  }, [files, meta]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, file: ExportFile) => {
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };

  const handleDownload = (file: ExportFile) => {
    if (file.fileUrl) {
      window.open(file.fileUrl, '_blank', 'noopener,noreferrer');
    }
    handleCloseMenu();
  };

  const handleCopyLink = async (file: ExportFile) => {
    if (file.fileUrl) {
      try {
        await navigator.clipboard.writeText(file.fileUrl);
        // toast is handled by the caller or we could use a local state
      } catch {
        // fallback
      }
    }
    handleCloseMenu();
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US');
    } catch {
      return date;
    }
  };

  const renderMobileCards = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {files.map((file, idx) => (
        <Card key={`${file.exportId ?? file.id ?? idx}`} variant="outlined">
          <CardContent sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {formatIcons[file.format] || <FileIcon />}
              <Typography variant="body2" sx={{ fontWeight: 'medium', flex: 1 }} noWrap>
                {file.fileName}
              </Typography>
              <Chip
                label={getStatusLabel((file.status as ExportFileStatus) || 'available')}
                size="small"
                color={statusColors[(file.status as ExportFileStatus) || 'available']}
              />
            </Box>
            {file.reportTitle && (
              <Typography variant="caption" color="text.secondary" display="block">
                {file.reportTitle}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(file.fileSize)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(file.exportedAt)}
              </Typography>
            </Box>
          </CardContent>
          <CardActions sx={{ pt: 0 }}>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(file)}
              disabled={!file.fileUrl || file.status === 'failed'}
            >
              {t('exportCenter.download', 'تحميل')}
            </Button>
            <IconButton size="small" onClick={(e) => handleOpenMenu(e, file)}>
              <MoreIcon />
            </IconButton>
          </CardActions>
        </Card>
      ))}
    </Box>
  );

  const renderDesktopTable = () => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('exportCenter.file', 'الملف')}</TableCell>
            <TableCell>{t('exportCenter.report', 'التقرير')}</TableCell>
            <TableCell>{t('exportCenter.format', 'الصيغة')}</TableCell>
            <TableCell>{t('exportCenter.size', 'الحجم')}</TableCell>
            <TableCell>{t('exportCenter.status', 'الحالة')}</TableCell>
            <TableCell>{t('exportCenter.date', 'تاريخ التصدير')}</TableCell>
            <TableCell align="center">{t('exportCenter.actions', 'إجراءات')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  {t('exportCenter.noData', 'لا توجد ملفات مصدرة')}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            files.map((file, idx) => (
              <TableRow key={`${file.exportId ?? file.id ?? idx}-${file.format}-${idx}`} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {formatIcons[file.format] || <FileIcon />}
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {file.fileName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    {file.reportTitle || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={file.format?.toUpperCase()}
                    size="small"
                    color={
                      file.format === 'pdf'
                        ? 'error'
                        : file.format === 'xlsx'
                        ? 'success'
                        : file.format === 'csv'
                        ? 'primary'
                        : 'warning'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    {formatFileSize(file.fileSize)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel((file.status as ExportFileStatus) || 'available')}
                    size="small"
                    color={statusColors[(file.status as ExportFileStatus) || 'available']}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {formatDate(file.exportedAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title={t('exportCenter.download', 'تحميل')}>
                      <span>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleDownload(file)}
                          disabled={!file.fileUrl || file.status === 'failed'}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={t('exportCenter.open', 'فتح')}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(file)}
                          disabled={!file.fileUrl || file.status === 'failed'}
                        >
                          <OpenIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={t('exportCenter.copyLink', 'نسخ الرابط')}>
                      <IconButton size="small" onClick={() => handleCopyLink(file)}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={(e) => handleOpenMenu(e, file)}>
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <PageShell fullHeight>
      <PageHeader
        title={t('analytics:exportCenter.title', 'مركز التصدير')}
        description={t('analytics:exportCenter.description', 'مركز تصدير البيانات والتقارير')}
        breadcrumbs={[{ label: 'لوحة التحكم', to: '/dashboard' }, { label: t('analytics:exportCenter.title', 'مركز التصدير') }]}
      />
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileIcon />
              {t('exportCenter.title', 'مركز التصدير')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {t('exportCenter.subtitle', 'جميع الملفات المصدرة من التقارير')}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setPage(0);
              refetch();
            }}
            sx={{ bgcolor: 'white', color: '#f5576c', '&:hover': { bgcolor: '#f3f4f6' } }}
          >
            {t('exportCenter.refresh', 'تحديث')}
          </Button>
        </Box>
      </Paper>

      {/* Stats */}
      <Box sx={{ mb: 3 }}>
        <PageSummaryGrid columns={4}>
          <StatCard
            title={t('exportCenter.totalFiles', 'إجمالي الملفات')}
            value={stats.totalFiles}
            icon={<TotalFilesIcon fontSize="small" />}
            tone="primary"
          />
          <StatCard
            title={t('exportCenter.availableFiles', 'الملفات المتاحة')}
            value={stats.availableFiles}
            icon={<AvailableIcon fontSize="small" />}
            tone="success"
          />
          <StatCard
            title={t('exportCenter.failedFiles', 'عمليات فاشلة')}
            value={stats.failedFiles}
            icon={<FailedIcon fontSize="small" />}
            tone="error"
          />
          <StatCard
            title={t('exportCenter.totalSize', 'الحجم الإجمالي')}
            value={formatFileSize(stats.totalSize)}
            icon={<StorageIcon fontSize="small" />}
            tone="info"
          />
        </PageSummaryGrid>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('exportCenter.searchPlaceholder', 'بحث في الملفات...')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('exportCenter.formatFilter', 'الصيغة')}</InputLabel>
              <Select
                value={formatFilter}
                label={t('exportCenter.formatFilter', 'الصيغة')}
                onChange={(e) => {
                  setFormatFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">{t('exportCenter.all', 'الكل')}</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="xlsx">Excel</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('exportCenter.statusFilter', 'الحالة')}</InputLabel>
              <Select
                value={statusFilter}
                label={t('exportCenter.statusFilter', 'الحالة')}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">{t('exportCenter.all', 'الكل')}</MenuItem>
                <MenuItem value="available">{getStatusLabel('available')}</MenuItem>
                <MenuItem value="processing">{getStatusLabel('processing')}</MenuItem>
                <MenuItem value="failed">{getStatusLabel('failed')}</MenuItem>
                <MenuItem value="expired">{getStatusLabel('expired')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Content */}
      <Paper sx={{ p: 2 }}>
        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('exportCenter.error', 'حدث خطأ أثناء تحميل الملفات')}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={isMobile ? 120 : 48} />
            ))}
          </Box>
        ) : files.length === 0 && !isError ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <FileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {t('exportCenter.empty.title', 'لا توجد ملفات مصدرة')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('exportCenter.empty.description', 'قم بتصدير تقرير أو بيانات لعرض الملفات هنا')}
            </Typography>
          </Box>
        ) : isMobile ? (
          renderMobileCards()
        ) : (
          renderDesktopTable()
        )}

        {meta && meta.totalPages > 1 && (
          <>
            <Divider sx={{ my: 2 }} />
            <TablePagination
              component="div"
              count={meta.total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(0);
              }}
              labelRowsPerPage={t('table.rowsPerPage', 'عدد الصفوف')}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} ${t('exportCenter.of', 'من')} ${count}`
              }
            />
          </>
        )}
      </Paper>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => selectedFile && handleDownload(selectedFile)}
          disabled={!selectedFile?.fileUrl || selectedFile?.status === 'failed'}
        >
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          {t('exportCenter.actions.download', 'تحميل')}
        </MenuItem>
        <MenuItem
          onClick={() => selectedFile && handleDownload(selectedFile)}
          disabled={!selectedFile?.fileUrl || selectedFile?.status === 'failed'}
        >
          <OpenIcon fontSize="small" sx={{ mr: 1 }} />
          {t('exportCenter.actions.open', 'فتح')}
        </MenuItem>
        <MenuItem onClick={() => selectedFile && handleCopyLink(selectedFile)}>
          <CopyIcon fontSize="small" sx={{ mr: 1 }} />
          {t('exportCenter.actions.copyLink', 'نسخ الرابط')}
        </MenuItem>
      </Menu>
    </Box>
    </PageShell>
  );
});

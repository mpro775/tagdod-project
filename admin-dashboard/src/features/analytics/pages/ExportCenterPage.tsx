import React, { useState } from 'react';
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
  Tabs,
  Tab,
  CircularProgress,
  Button,
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
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import { AdvancedReport } from '../types/analytics.types';

const formatIcons: Record<string, React.ReactNode> = {
  pdf: <PdfIcon color="error" />,
  xlsx: <ExcelIcon color="success" />,
  csv: <CsvIcon color="primary" />,
  json: <JsonIcon color="warning" />,
};

const formatLabels: Record<string, string> = {
  pdf: 'PDF',
  xlsx: 'Excel',
  csv: 'CSV',
  json: 'JSON',
};

export const ExportCenterPage: React.FC = () => {
  const { t } = useTranslation('analytics');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reports-exports', page, limit, search, formatFilter],
    queryFn: () =>
      analyticsApi.listAdvancedReports({
        page: page + 1,
        limit,
        search: search || undefined,
      }),
  });

  const allExports = (data?.data || [])
    .flatMap((report: AdvancedReport) =>
      (report.exports || []).map((exp) => ({
        ...exp,
        reportId: report.reportId,
        reportTitle: report.title,
        reportType: report.category,
      }))
    )
    .filter((exp) => formatFilter === 'all' || exp.format === formatFilter)
    .filter((exp) => !search || exp.fileName.toLowerCase().includes(search.toLowerCase()) || exp.reportTitle?.toLowerCase().includes(search.toLowerCase()));

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('ar-SA');
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
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
            onClick={() => refetch()}
            sx={{ bgcolor: 'white', color: '#f5576c', '&:hover': { bgcolor: '#f3f4f6' } }}
          >
            تحديث
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('exportCenter.search', 'بحث في الملفات...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Tabs
              value={formatFilter}
              onChange={(_, v) => setFormatFilter(v)}
            >
              <Tab label="الكل" value="all" />
              <Tab label="PDF" value="pdf" />
              <Tab label="Excel" value="xlsx" />
              <Tab label="CSV" value="csv" />
              <Tab label="JSON" value="json" />
            </Tabs>
          </Grid>
        </Grid>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('exportCenter.file', 'الملف')}</TableCell>
                  <TableCell>{t('exportCenter.report', 'التقرير')}</TableCell>
                  <TableCell>{t('exportCenter.format', 'الصيغة')}</TableCell>
                  <TableCell>{t('exportCenter.size', 'الحجم')}</TableCell>
                  <TableCell>{t('exportCenter.date', 'تاريخ التصدير')}</TableCell>
                  <TableCell align="center">{t('exportCenter.actions', 'إجراءات')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allExports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {t('exportCenter.noData', 'لا توجد ملفات مصدرة')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  allExports.map((exp, idx) => (
                    <TableRow key={`${exp.reportId}-${exp.format}-${idx}`} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {formatIcons[exp.format] || <FileIcon />}
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {exp.fileName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          {exp.reportTitle || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatLabels[exp.format] || exp.format}
                          size="small"
                          color={
                            exp.format === 'pdf'
                              ? 'error'
                              : exp.format === 'xlsx'
                              ? 'success'
                              : exp.format === 'csv'
                              ? 'primary'
                              : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          {formatFileSize(exp.fileSize)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {formatDate(exp.generatedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="تحميل">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleDownload(exp.fileUrl)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          component="div"
          count={allExports.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => { setLimit(Number(e.target.value)); setPage(0); }}
          labelRowsPerPage="عدد الصفوف"
        />
      </Paper>
    </Box>
  );
};

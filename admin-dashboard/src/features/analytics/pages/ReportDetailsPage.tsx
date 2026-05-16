import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Tabs,
  Tab,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Replay as ReplayIcon,
  Archive as ArchiveIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
  DataUsage as DataUsageIcon,
} from '@mui/icons-material';
import { useAdvancedReport, useArchiveReport, useExportReport } from '../hooks/useAnalytics';
import { ReportStatusBadge } from '../components/report/ReportStatusBadge';
import { DataQualityBadge } from '../components/report/DataQualityBadge';
import { ReportStatus, ReportExportEntry, ReportFormat } from '../types/analytics.types';
import { EmptyAnalyticsState } from '../components/EmptyAnalyticsState';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ReportDetailsPage: React.FC = () => {
  const { t } = useTranslation('analytics');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const reportId = id || '';
  const { data: report, isLoading, error, refetch } = useAdvancedReport(reportId);
  const archiveReport = useArchiveReport();
  const exportReport = useExportReport();

  const handleExport = async (format: string) => {
    if (!reportId) return;
    try {
      await exportReport.mutateAsync({
        reportId,
        data: { format: format as ReportFormat, includeCharts: true, includeRawData: false },
      });
      refetch();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleRegenerate = async () => {
    if (!reportId) return;
    try {
      await refetch();
    } catch (err) {
      console.error('Regeneration failed:', err);
    }
  };

  const handleArchive = async () => {
    if (!reportId) return;
    try {
      await archiveReport.mutateAsync(reportId);
      refetch();
    } catch (err) {
      console.error('Archive failed:', err);
    }
  };

  const formatDuration = (ms?: number): string => {
    if (!ms) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  if (error || !report) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyAnalyticsState
          title={t('reportDetails.notFound', 'تعذر العثور على التقرير')}
          description={t('reportDetails.notFoundDesc', 'التقرير المطلوب غير موجود أو تم حذفه.')}
          actionLabel={t('actions.backToReports', 'العودة للتقارير')}
          onAction={() => navigate('/analytics/reports')}
        />
      </Box>
    );
  }

  const exports = (report as any).exports || [];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/analytics/reports')}
              sx={{ mb: 1 }}
            >
              {t('actions.backToReports', 'العودة للتقارير')}
            </Button>
            <Typography variant="h4" component="h1" gutterBottom>
              {report.title || t('reportsManagement.untitled', 'تقرير بدون عنوان')}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <ReportStatusBadge status={(report.status as ReportStatus) || ReportStatus.COMPLETED} />
              <DataQualityBadge dataQuality={report.dataQuality} showDetails />
            </Stack>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title={t('actions.download', 'تحميل')}>
              <span>
                <IconButton
                  onClick={() => handleExport('pdf')}
                  disabled={report.status !== ReportStatus.COMPLETED}
                >
                  <DownloadIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('actions.regenerate', 'إعادة توليد')}>
              <IconButton onClick={handleRegenerate}>
                <ReplayIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={report.isArchived ? t('actions.unarchive', 'إلغاء الأرشفة') : t('actions.archive', 'أرشفة')}>
              <IconButton onClick={handleArchive}>
                <ArchiveIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarIcon color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('reportDetails.createdAt', 'Created')}
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={600}>
                {formatDate(report.generatedAt)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('reportDetails.createdBy', 'By')}
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={600}>
                {report.creatorName || 'Unknown'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TimerIcon color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('reportDetails.duration', 'Duration')}
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={600}>
                {formatDuration((report as any).generationDurationMs)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DataUsageIcon color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('reportDetails.summary', 'Records')}
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={600}>
                {report.summary?.totalRecords.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label={t('reportDetails.summary', 'Summary')} />
          <Tab label={t('reportDetails.insights', 'Insights')} />
          <Tab label={t('reportDetails.exports', 'Exports')} />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          {report.summary && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {t('reportDetails.totalValue', 'Total Value')}
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {report.summary.totalValue.toLocaleString()} {report.summary.currency}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {t('reportDetails.totalRecords', 'Total Records')}
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {report.summary.totalRecords.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {report.summary.growth !== undefined && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {t('reportDetails.growth', 'Growth')}
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={600}
                        color={report.summary.growth >= 0 ? 'success.main' : 'error.main'}
                      >
                        {report.summary.growth.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {report.dataQuality && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('dataQuality.title', 'Data Quality')}
              </Typography>
              <DataQualityBadge dataQuality={report.dataQuality} showDetails />
            </Box>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {report.insights && report.insights.length > 0 ? (
            <Stack spacing={2}>
              {report.insights.map((insight: string, index: number) => (
                <Alert key={index} severity="info" icon={<AssessmentIcon />}>
                  {insight}
                </Alert>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">{t('noData', 'No data available')}</Typography>
          )}

          {report.recommendations && report.recommendations.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('reportDetails.recommendations', 'Recommendations')}
              </Typography>
              <Stack spacing={2}>
                {report.recommendations.map((rec: string, index: number) => (
                  <Alert key={index} severity="success">
                    {rec}
                  </Alert>
                ))}
              </Stack>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {exports.length > 0 ? (
            <Stack spacing={2}>
              {exports.map((exp: ReportExportEntry, index: number) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {exp.fileName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {exp.format.toUpperCase()} - {formatDate(exp.generatedAt)}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        href={exp.fileUrl}
                        target="_blank"
                      >
                        {t('actions.download', 'Download')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Box>
              <Typography color="text.secondary" gutterBottom>
                {t('noData', 'No exports available')}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('pdf')}>
                  PDF
                </Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('xlsx')}>
                  Excel
                </Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('csv')}>
                  CSV
                </Button>
              </Stack>
            </Box>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

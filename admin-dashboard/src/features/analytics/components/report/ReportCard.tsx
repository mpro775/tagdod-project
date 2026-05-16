import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Replay as ReplayIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { AdvancedReport, ReportCategory, ReportStatus } from '../../types/analytics.types';
import { ReportStatusBadge } from './ReportStatusBadge';
import { DataQualityBadge } from './DataQualityBadge';

interface ReportCardProps {
  report: AdvancedReport;
  onView?: (reportId: string) => void;
  onDownload?: (reportId: string, format: string) => void;
  onArchive?: (reportId: string) => void;
  onDelete?: (reportId: string) => void;
  onRegenerate?: (reportId: string) => void;
}

const categoryColors: Record<ReportCategory, string> = {
  sales: '#2196f3',
  products: '#9c27b0',
  customers: '#4caf50',
  inventory: '#ff9800',
  financial: '#f44336',
  marketing: '#00bcd4',
};

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onView,
  onDownload,
  onArchive,
  onDelete,
  onRegenerate,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');

  const reportKey = report.reportId ?? report.id;
  if (!reportKey) {
    return null;
  }

  const formatDuration = (ms?: number): string => {
    if (!ms) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `4px solid ${categoryColors[report.category as ReportCategory] || theme.palette.primary.main}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon sx={{ color: categoryColors[report.category as ReportCategory], fontSize: 24 }} />
            <Typography variant="h6" component="h3" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              {report.title || t('reportsManagement.untitled', 'تقرير بدون عنوان')}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
          <ReportStatusBadge status={(report.status as ReportStatus) || ReportStatus.COMPLETED} />
          <DataQualityBadge dataQuality={report.dataQuality} />
          <Chip
            label={t(`reports.category.${report.category}`, report.category)}
            size="small"
            sx={{
              backgroundColor: `${categoryColors[report.category as ReportCategory]}20`,
              color: categoryColors[report.category as ReportCategory],
              fontWeight: 500,
            }}
          />
        </Stack>

        <Stack spacing={0.5} sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('reportDetails.createdAt', 'تاريخ الإنشاء')}: {formatDate(report.generatedAt)}
          </Typography>
          {report.creatorName && (
            <Typography variant="body2" color="text.secondary">
              {t('reportDetails.createdBy', 'بواسطة')}: {report.creatorName}
            </Typography>
          )}
          {report.generationDurationMs && (
            <Typography variant="body2" color="text.secondary">
              {t('reportDetails.duration', 'المدة')}: {formatDuration(report.generationDurationMs)}
            </Typography>
          )}
          {report.status === ReportStatus.FAILED && report.failureReason && (
            <Typography variant="body2" color="error">
              {t('reportDetails.failureReason', 'سبب الفشل')}: {report.failureReason}
            </Typography>
          )}
        </Stack>

        {report.summary && (
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('reportDetails.summary', 'الملخص')}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {(report.summary.totalRecords ?? 0).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {report.summary.currency || 'YER'}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {(report.summary.totalValue ?? 0).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, pt: 0, gap: 0.5 }}>
        <Tooltip title={t('actions.view', 'عرض')}>
          <span>
            <IconButton size="small" onClick={() => onView?.(reportKey)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t('actions.download', 'تحميل')}>
          <span>
            <IconButton
              size="small"
              onClick={() => onDownload?.(reportKey, 'pdf')}
              disabled={report.status !== ReportStatus.COMPLETED}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t('actions.regenerate', 'إعادة توليد')}>
          <span>
            <IconButton size="small" onClick={() => onRegenerate?.(reportKey)}>
              <ReplayIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={report.isArchived ? t('actions.unarchive', 'إلغاء الأرشفة') : t('actions.archive', 'أرشفة')}>
          <span>
            <IconButton size="small" onClick={() => onArchive?.(reportKey)}>
              <ArchiveIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t('actions.delete', 'حذف')}>
          <span>
            <IconButton size="small" color="error" onClick={() => onDelete?.(reportKey)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

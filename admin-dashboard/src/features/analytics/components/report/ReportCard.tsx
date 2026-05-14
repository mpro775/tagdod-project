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
        borderLeft: `4px solid ${categoryColors[report.category] || theme.palette.primary.main}`,
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
            <AssessmentIcon sx={{ color: categoryColors[report.category], fontSize: 24 }} />
            <Typography variant="h6" component="h3" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              {report.title}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
          <ReportStatusBadge status={report.status || ReportStatus.COMPLETED} />
          <DataQualityBadge dataQuality={report.dataQuality} />
          <Chip
            label={report.category}
            size="small"
            sx={{
              backgroundColor: `${categoryColors[report.category]}20`,
              color: categoryColors[report.category],
              fontWeight: 500,
            }}
          />
        </Stack>

        <Stack spacing={0.5} sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('reportDetails.createdAt', 'Created')}: {formatDate(report.generatedAt)}
          </Typography>
          {report.creatorName && (
            <Typography variant="body2" color="text.secondary">
              {t('reportDetails.createdBy', 'By')}: {report.creatorName}
            </Typography>
          )}
          {report.generationDurationMs && (
            <Typography variant="body2" color="text.secondary">
              {t('reportDetails.duration', 'Duration')}: {formatDuration(report.generationDurationMs)}
            </Typography>
          )}
          {report.status === ReportStatus.FAILED && report.failureReason && (
            <Typography variant="body2" color="error">
              {t('reportDetails.failureReason', 'Failure reason')}: {report.failureReason}
            </Typography>
          )}
        </Stack>

        {report.summary && (
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('reportDetails.summary', 'Summary')}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {report.summary.totalRecords.toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {report.summary.currency}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {report.summary.totalValue.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, pt: 0, gap: 0.5 }}>
        <Tooltip title={t('actions.view', 'View')}>
          <IconButton size="small" onClick={() => onView?.(report.reportId)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('actions.download', 'Download')}>
          <IconButton size="small" onClick={() => onDownload?.(report.reportId, 'pdf')}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('actions.regenerate', 'Regenerate')}>
          <IconButton size="small" onClick={() => onRegenerate?.(report.reportId)}>
            <ReplayIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={report.isArchived ? t('actions.unarchive', 'Unarchive') : t('actions.archive', 'Archive')}>
          <IconButton size="small" onClick={() => onArchive?.(report.reportId)}>
            <ArchiveIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('actions.delete', 'Delete')}>
          <IconButton size="small" color="error" onClick={() => onDelete?.(report.reportId)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

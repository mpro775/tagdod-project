import React from 'react';
import {
  Box,
  Chip,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Cancel, Download, Pause, PlayArrow, Replay } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { apiClient } from '@/core/api/client';
import { PageHeader } from '@/shared/design-system/components/PageHeader';
import { StatCard } from '@/shared/design-system/components/StatCard';
import { smsCampaignsApi } from '../api/smsCampaignsApi';
import {
  useSmsCampaign,
  useSmsCampaignAction,
  useSmsCampaignRecipients,
} from '../hooks/useSmsCampaigns';
import type { ListSmsRecipientsParams, SmsRecipientStatus } from '../types/smsCampaign.types';
import {
  campaignStatusLabels,
  recipientStatusLabels,
  targetLabels,
} from '../components/smsCampaignLabels';

const recipientStatuses: Array<{ value: SmsRecipientStatus | ''; label: string }> = [
  { value: '', label: 'كل الحالات' },
  { value: 'sent', label: 'ناجح' },
  { value: 'failed', label: 'فاشل' },
  { value: 'queued', label: 'قيد الانتظار' },
  { value: 'sending', label: 'قيد الإرسال' },
  { value: 'skipped', label: 'تم التخطي' },
];

export const SmsCampaignDetailsPage: React.FC = () => {
  const { id = '' } = useParams();
  const [recipientFilters, setRecipientFilters] = React.useState<ListSmsRecipientsParams>({
    page: 1,
    limit: 20,
  });
  const { data: campaign, isLoading } = useSmsCampaign(id);
  const { data: recipientsData } = useSmsCampaignRecipients(id, recipientFilters);
  const pause = useSmsCampaignAction('pause');
  const resume = useSmsCampaignAction('resume');
  const cancel = useSmsCampaignAction('cancel');
  const retryFailed = useSmsCampaignAction('retryFailed');

  const recipients = recipientsData?.recipients || [];
  const done = campaign ? campaign.sentCount + campaign.failedCount + campaign.skippedCount : 0;
  const progress = campaign?.validRecipients ? Math.round((done / campaign.validRecipients) * 100) : 0;

  const handleExport = async () => {
    const response = await apiClient.get(smsCampaignsApi.exportUrl(id), { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sms-campaign-${id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || !campaign) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <PageHeader
        title={campaign.title}
        description={`حملة ${targetLabels[campaign.target]} - ${campaignStatusLabels[campaign.status]}`}
        actions={[
          {
            label: 'إيقاف مؤقت',
            icon: <Pause />,
            onClick: () => pause.mutate(id),
            disabled: !['queued', 'sending'].includes(campaign.status),
          },
          {
            label: 'استكمال',
            icon: <PlayArrow />,
            onClick: () => resume.mutate(id),
            disabled: campaign.status !== 'paused',
          },
          {
            label: 'إلغاء',
            icon: <Cancel />,
            onClick: () => cancel.mutate(id),
            disabled: campaign.status === 'cancelled',
            variant: 'danger',
          },
          {
            label: 'إعادة الفاشلين',
            icon: <Replay />,
            onClick: () => retryFailed.mutate(id),
            disabled: campaign.failedCount === 0,
          },
          {
            label: 'CSV',
            icon: <Download />,
            onClick: handleExport,
          },
        ]}
      />

      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip label={campaignStatusLabels[campaign.status]} />
            <Typography variant="body2" color="text.secondary">
              التقدم {progress}%
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{campaign.message}</Typography>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
          gap: 2,
          mb: 2,
        }}
      >
        <StatCard title="صالحة" value={campaign.validRecipients} />
        <StatCard title="في الانتظار" value={campaign.queuedCount} />
        <StatCard title="تم الإرسال" value={campaign.sentCount} />
        <StatCard title="فشل" value={campaign.failedCount} />
        <StatCard title="تم التخطي" value={campaign.skippedCount} />
      </Box>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            label="بحث بالرقم أو الاسم"
            value={recipientFilters.q || ''}
            onChange={(e) => setRecipientFilters((prev) => ({ ...prev, q: e.target.value, page: 1 }))}
            size="small"
            fullWidth
          />
          <TextField
            label="حالة المستلم"
            value={recipientFilters.status || ''}
            onChange={(e) =>
              setRecipientFilters((prev) => ({
                ...prev,
                status: (e.target.value || undefined) as SmsRecipientStatus,
                page: 1,
              }))
            }
            size="small"
            select
            sx={{ minWidth: 190 }}
          >
            {recipientStatuses.map((status) => (
              <MenuItem key={status.value || 'all'} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الاسم</TableCell>
              <TableCell>الرقم</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>المحاولات</TableCell>
              <TableCell>معرف المزود</TableCell>
              <TableCell>الخطأ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipients.map((recipient) => (
              <TableRow key={recipient._id} hover>
                <TableCell>{recipient.userName || '-'}</TableCell>
                <TableCell>{recipient.normalizedPhone}</TableCell>
                <TableCell>
                  <Chip label={recipientStatusLabels[recipient.status]} size="small" />
                </TableCell>
                <TableCell>{recipient.attempts}</TableCell>
                <TableCell>{recipient.providerMessageId || '-'}</TableCell>
                <TableCell>{recipient.errorMessage || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

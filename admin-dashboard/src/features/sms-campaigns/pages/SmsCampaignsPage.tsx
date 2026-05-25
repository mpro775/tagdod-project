import React from 'react';
import {
  Box,
  Button,
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
import { Add, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/design-system/components/PageHeader';
import { StatCard } from '@/shared/design-system/components/StatCard';
import type { ListSmsCampaignsParams, SmsCampaignStatus } from '../types/smsCampaign.types';
import { useSmsCampaigns } from '../hooks/useSmsCampaigns';
import { SmsCampaignCreateDrawer } from '../components/SmsCampaignCreateDrawer';
import { campaignStatusLabels, targetLabels } from '../components/smsCampaignLabels';

const statuses: Array<{ value: SmsCampaignStatus | ''; label: string }> = [
  { value: '', label: 'كل الحالات' },
  { value: 'queued', label: 'في الطابور' },
  { value: 'sending', label: 'قيد الإرسال' },
  { value: 'paused', label: 'متوقفة' },
  { value: 'completed', label: 'مكتملة' },
  { value: 'failed', label: 'فشلت جزئياً' },
  { value: 'cancelled', label: 'ملغاة' },
];

export const SmsCampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<ListSmsCampaignsParams>({
    page: 1,
    limit: 20,
  });
  const { data, isLoading } = useSmsCampaigns(filters);
  const campaigns = data?.campaigns || [];
  const stats = data?.stats;

  const updateFilter = (patch: Partial<ListSmsCampaignsParams>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));

  return (
    <Box>
      <PageHeader
        title="حملات SMS"
        description="إرسال رسائل نصية جماعية عبر مزود الأوائل مع تتبع حالة كل مستلم"
        actions={[
          {
            label: 'إنشاء حملة SMS',
            icon: <Add />,
            onClick: () => setDrawerOpen(true),
            variant: 'primary',
          },
        ]}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 2,
        }}
      >
        <StatCard title="إجمالي الحملات" value={stats?.total ?? 0} />
        <StatCard title="قيد الإرسال" value={stats?.sending ?? 0} />
        <StatCard title="مكتملة" value={stats?.completed ?? 0} />
        <StatCard title="فاشلة/متوقفة" value={stats?.failedOrStopped ?? 0} />
      </Box>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            label="بحث"
            value={filters.q || ''}
            onChange={(e) => updateFilter({ q: e.target.value })}
            size="small"
            fullWidth
          />
          <TextField
            label="الحالة"
            value={filters.status || ''}
            onChange={(e) => updateFilter({ status: (e.target.value || undefined) as SmsCampaignStatus })}
            size="small"
            select
            sx={{ minWidth: 180 }}
          >
            {statuses.map((status) => (
              <MenuItem key={status.value || 'all'} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="من"
            type="date"
            value={filters.from || ''}
            onChange={(e) => updateFilter({ from: e.target.value || undefined })}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="إلى"
            type="date"
            value={filters.to || ''}
            onChange={(e) => updateFilter({ to: e.target.value || undefined })}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Stack>
      </Paper>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>العنوان</TableCell>
              <TableCell>الجمهور</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>المستلمين</TableCell>
              <TableCell>تم الإرسال</TableCell>
              <TableCell>فشل</TableCell>
              <TableCell>التقدم</TableCell>
              <TableCell>تاريخ الإنشاء</TableCell>
              <TableCell align="right">إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((campaign) => {
              const done = campaign.sentCount + campaign.failedCount + campaign.skippedCount;
              const progress = campaign.validRecipients
                ? Math.round((done / campaign.validRecipients) * 100)
                : 0;
              return (
                <TableRow key={campaign._id} hover>
                  <TableCell>
                    <Typography fontWeight={700}>{campaign.title}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 280 }}>
                      {campaign.message}
                    </Typography>
                  </TableCell>
                  <TableCell>{targetLabels[campaign.target]}</TableCell>
                  <TableCell>
                    <Chip label={campaignStatusLabels[campaign.status]} size="small" />
                  </TableCell>
                  <TableCell>{campaign.validRecipients}</TableCell>
                  <TableCell>{campaign.sentCount}</TableCell>
                  <TableCell>{campaign.failedCount}</TableCell>
                  <TableCell>{progress}%</TableCell>
                  <TableCell>{new Date(campaign.createdAt).toLocaleString('ar')}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/sms-campaigns/${campaign._id}`)}
                    >
                      التفاصيل
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {campaigns.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    لا توجد حملات SMS حتى الآن
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <SmsCampaignCreateDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
};

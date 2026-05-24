import React from 'react';
import { alpha, Box, Button, Chip, Stack, Typography, useTheme } from '@mui/material';
import { ContentCopy, OpenInNew, WarningAmber } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { EmptyState, LoadingState, designRadius } from '@/shared/design-system';
import type { ChurnRiskAlert, ChurnRiskSummary } from '../hooks/useUserAnalytics';

interface ChurnRiskAlertsProps {
  alerts: ChurnRiskAlert[];
  summary?: ChurnRiskSummary;
  loading?: boolean;
}

const formatMoney = (value: number) =>
  `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })} $`;

const getRiskColor = (risk: string): 'error' | 'warning' | 'success' | 'default' => {
  switch (risk) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

export const ChurnRiskAlerts: React.FC<ChurnRiskAlertsProps> = ({
  alerts,
  summary,
  loading = false,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const navigate = useNavigate();

  const computedSummary =
    summary ??
    alerts.reduce(
      (acc, alert) => ({
        ...acc,
        totalAtRisk: acc.totalAtRisk + 1,
        [alert.churnRisk]: acc[alert.churnRisk] + 1,
      }),
      { totalAtRisk: 0, high: 0, medium: 0, low: 0 } as ChurnRiskSummary
    );

  if (loading && alerts.length === 0) {
    return <LoadingState variant="skeleton" rows={5} title={t('common:loading', 'جاري التحميل...')} />;
  }

  if (alerts.length === 0) {
    return (
      <Stack spacing={1.25}>
        <RiskSummaryStrip summary={computedSummary} />
        <EmptyState
          title={t('users:analytics.noAlerts', 'لا توجد تنبيهات حالياً')}
          description={t(
            'users:analytics.churnRisk.emptyDescription',
            'لا يوجد عملاء ضمن نطاق مخاطر التوقف وفق البيانات الحالية.'
          )}
          icon={<WarningAmber />}
        />
      </Stack>
    );
  }

  const handleCopyAction = async (action: string) => {
    if (!action || typeof navigator === 'undefined' || !navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(action);
      toast.success(t('users:analytics.churnRisk.actionCopied', 'تم نسخ التوصية'));
    } catch {
      toast.error(t('users:analytics.churnRisk.copyFailed', 'تعذر نسخ التوصية'));
    }
  };

  return (
    <Stack spacing={1.25}>
      <RiskSummaryStrip summary={computedSummary} />

      <Stack spacing={0.75}>
        {alerts.map((alert) => {
          const riskColor = getRiskColor(alert.churnRisk);
          const paletteTone = riskColor === 'default' ? 'warning' : riskColor;

          return (
            <Box
              key={alert.userId}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: 'minmax(0, 1.3fr) 116px 124px minmax(0, 1fr) 190px',
                },
                gap: { xs: 1, lg: 1.25 },
                alignItems: { xs: 'stretch', lg: 'center' },
                p: 1,
                border: '1px solid',
                borderColor: alpha(theme.palette[paletteTone].main, 0.22),
                borderRadius: `${designRadius.md}px`,
                bgcolor: alpha(
                  theme.palette[paletteTone].main,
                  theme.palette.mode === 'dark' ? 0.08 : 0.05
                ),
              }}
            >
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                <Chip
                  label={t(`users:analytics.churnRisk.${alert.churnRisk}`, alert.churnRisk)}
                  size="small"
                  color={getRiskColor(alert.churnRisk)}
                  sx={{ fontWeight: 800 }}
                />
                <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                  {alert.name || t('users:analytics.unknown', 'غير معروف')}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" noWrap>
                {alert.contact || alert.email || '-'}
              </Typography>
            </Stack>

            <Stack spacing={0.2}>
              <Typography variant="caption" color="text.secondary">
                {t('users:analytics.churnRisk.lastOrderShort', 'آخر طلب')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {t('users:analytics.churnRisk.daysAgo', '{{days}} يوم', {
                  days: alert.lastOrderDays.toLocaleString('en-US'),
                })}
              </Typography>
            </Stack>

            <Stack spacing={0.2}>
              <Typography variant="caption" color="text.secondary">
                {t('users:analytics.churnRisk.totalSpent', 'إجمالي الإنفاق')}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                {formatMoney(alert.totalSpent)}
              </Typography>
            </Stack>

            <Stack spacing={0.2} sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {t('users:analytics.churnRisk.reason', 'سبب الخطورة')}
              </Typography>
              <Typography variant="body2" noWrap title={alert.riskReason || undefined}>
                {alert.riskReason || '-'}
              </Typography>
              {alert.recommendedAction && (
                <Typography variant="caption" color="text.secondary" noWrap title={alert.recommendedAction}>
                  {alert.recommendedAction}
                </Typography>
              )}
            </Stack>

            <Stack direction="row" spacing={0.75} justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<OpenInNew fontSize="small" />}
                onClick={() => navigate(`/users/${alert.userId}`)}
                disabled={!alert.userId}
              >
                {t('users:analytics.churnRisk.viewUser', 'عرض المستخدم')}
              </Button>
              {alert.recommendedAction && typeof navigator !== 'undefined' && navigator.clipboard && (
                <Button
                  size="small"
                  variant="text"
                  startIcon={<ContentCopy fontSize="small" />}
                  onClick={() => handleCopyAction(alert.recommendedAction)}
                >
                  {t('users:analytics.churnRisk.copyAction', 'نسخ التوصية')}
                </Button>
              )}
            </Stack>
            </Box>
          );
        })}
      </Stack>

      {summary?.generatedAt && (
        <Typography variant="caption" color="text.secondary">
          {t('users:analytics.generatedAt', 'تم التوليد')}: {new Date(summary.generatedAt).toLocaleString('ar-SA')}
        </Typography>
      )}
    </Stack>
  );
};

function RiskSummaryStrip({ summary }: { summary: ChurnRiskSummary }) {
  const { t } = useTranslation(['users']);

  const items = [
    {
      label: t('users:analytics.churnRisk.highRisk', 'عالي الخطورة'),
      value: summary.high,
      tone: 'error' as const,
    },
    {
      label: t('users:analytics.churnRisk.mediumRisk', 'متوسط'),
      value: summary.medium,
      tone: 'warning' as const,
    },
    {
      label: t('users:analytics.churnRisk.lowRisk', 'منخفض'),
      value: summary.low,
      tone: 'success' as const,
    },
    {
      label: t('users:analytics.churnRisk.totalAtRisk', 'إجمالي المعرضين للخطر'),
      value: summary.totalAtRisk,
      tone: 'primary' as const,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 0.75,
      }}
    >
      {items.map((item) => (
        <SummaryItem key={item.label} label={item.label} value={item.value} tone={item.tone} />
      ))}
    </Box>
  );
}

function SummaryItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'primary' | 'success' | 'warning' | 'error';
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 1,
        minHeight: 62,
        border: '1px solid',
        borderColor: alpha(theme.palette[tone].main, 0.22),
        borderRadius: `${designRadius.md}px`,
        bgcolor: alpha(theme.palette[tone].main, theme.palette.mode === 'dark' ? 0.08 : 0.05),
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }} noWrap>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 22, fontWeight: 800, color: theme.palette[tone].main }}>
        {value.toLocaleString('en-US')}
      </Typography>
    </Box>
  );
}

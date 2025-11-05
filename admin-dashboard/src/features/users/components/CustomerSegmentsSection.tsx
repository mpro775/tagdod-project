import React from 'react';
import { Grid, Card, CardContent, Typography, Alert, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CustomerSegments {
  segments: {
    vip: number;
    premium: number;
    regular: number;
    new: number;
  };
  totalCustomers: number;
  generatedAt: string;
  recommendations: string[];
}

interface CustomerSegmentsSectionProps {
  segments: CustomerSegments | null;
  loading?: boolean;
}

export const CustomerSegmentsSection: React.FC<CustomerSegmentsSectionProps> = ({
  segments,
  loading = false,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();

  if (loading || !segments) {
    return null;
  }

  const segmentCards = [
    {
      key: 'vip',
      value: segments.segments.vip,
      label: t('users:analytics.segments.vip', 'عملاء VIP'),
      range: t('users:analytics.segments.range.vip', 'أكثر من 5,000 $'),
      bgColor: theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.1)' : '#fef2f2',
      textColor: 'error.main',
    },
    {
      key: 'premium',
      value: segments.segments.premium,
      label: t('users:analytics.segments.premium', 'عملاء مميزون'),
      range: t('users:analytics.segments.range.premium', '2,000 - 5,000 $'),
      bgColor: theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.1)' : '#fffbeb',
      textColor: 'warning.main',
    },
    {
      key: 'regular',
      value: segments.segments.regular,
      label: t('users:analytics.segments.regular', 'عملاء عاديون'),
      range: t('users:analytics.segments.range.regular', '500 - 2,000 $'),
      bgColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.1)' : '#eff6ff',
      textColor: 'info.main',
    },
    {
      key: 'new',
      value: segments.segments.new,
      label: t('users:analytics.segments.new', 'عملاء جدد'),
      range: t('users:analytics.segments.range.new', 'أقل من 500 $'),
      bgColor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.1)' : '#f0fdf4',
      textColor: 'success.main',
    },
  ];

  return (
    <>
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        {segmentCards.map((segment) => (
          <Grid size={{ xs: 6, sm: 6, md: 3 }} key={segment.key}>
            <Card
              sx={{
                bgcolor: segment.bgColor,
                backgroundImage: 'none',
                boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
                height: '100%',
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: segment.textColor,
                    fontWeight: 'bold',
                    fontSize: { xs: '1.25rem', sm: '2rem' },
                    mb: { xs: 0.5, sm: 1 },
                  }}
                >
                  {segment.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 'medium',
                    fontSize: { xs: '0.75rem', sm: '0.9375rem' },
                    mb: { xs: 0.25, sm: 0.5 },
                  }}
                >
                  {segment.label}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                >
                  {segment.range}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {segments.recommendations.length > 0 && (
        <Card
          sx={{
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem' },
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              {t('users:analytics.recommendations.title', 'توصيات')}
            </Typography>
            {segments.recommendations.map((rec, index) => (
              <Alert
                key={index}
                severity="info"
                sx={{
                  mb: 1,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : undefined,
                }}
              >
                {rec}
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};


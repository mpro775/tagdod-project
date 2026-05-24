import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  alpha,
  useTheme,
  Stack,
} from '@mui/material';
import {
  ShoppingCart,
  Inventory,
  SupportAgent,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export interface AttentionActionItem {
  id: string;
  title: string;
  count: number;
  description: string;
  linkTo: string;
  tone: 'warning' | 'error' | 'info' | 'success';
}

interface CompactAttentionCenterProps {
  items: AttentionActionItem[];
  isLoading?: boolean;
}

const toneConfig: Record<
  AttentionActionItem['tone'],
  { icon: React.ReactNode; colorKey: string }
> = {
  warning: { icon: <ShoppingCart sx={{ fontSize: 18 }} />, colorKey: 'warning' },
  error: { icon: <Inventory sx={{ fontSize: 18 }} />, colorKey: 'error' },
  info: { icon: <SupportAgent sx={{ fontSize: 18 }} />, colorKey: 'info' },
  success: { icon: <CheckCircle sx={{ fontSize: 18 }} />, colorKey: 'success' },
};

export const CompactAttentionCenter: React.FC<CompactAttentionCenterProps> = ({
  items,
  isLoading = false,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');

  const allItems: AttentionActionItem[] = items.length > 0
    ? items
    : [
        { id: 'abandoned-carts', title: t('attention.abandonedCarts', 'سلات متروكة'), count: 0, description: t('attention.noCriticalItems', 'لا توجد عناصر حرجة'), linkTo: '/carts', tone: 'success' },
        { id: 'pending-orders', title: t('attention.pendingOrders', 'طلبات معلقة'), count: 0, description: t('attention.noPendingOrders', 'لا توجد طلبات معلقة'), linkTo: '/orders', tone: 'success' },
        { id: 'open-tickets', title: t('attention.openTickets', 'تذاكر دعم'), count: 0, description: t('attention.allGood', 'كل شيء جيد'), linkTo: '/support', tone: 'success' },
        { id: 'low-stock', title: t('attention.lowStock', 'مخزون منخفض'), count: 0, description: t('attention.stockStable', 'المخزون مستقر'), linkTo: '/products/inventory', tone: 'success' },
      ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.08),
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Warning sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" fontWeight={700}>
            {t('attention.title', 'ما يحتاج انتباهك الآن')}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 1.5,
          }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={68} />
              ))
            : allItems.map((item) => {
                const config = toneConfig[item.tone];
                const color: string =
                  (theme.palette[config.colorKey as keyof typeof theme.palette] as any)?.main ??
                  theme.palette.text.secondary;

                return (
                  <Box
                    key={item.id}
                    onClick={() => navigate(item.linkTo)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      p: 1.25,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: alpha(color, 0.14),
                      bgcolor: alpha(color, 0.04),
                      cursor: 'pointer',
                      transition: 'border-color .2s ease, transform .2s ease',
                      minHeight: 64,
                      '&:hover': {
                        borderColor: alpha(color, 0.3),
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 1,
                        color: color,
                        bgcolor: alpha(color, 0.12),
                        flexShrink: 0,
                      }}
                    >
                      {config.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={0.75} alignItems="baseline">
                        <Typography variant="subtitle2" fontWeight={800} noWrap>
                          {item.count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {item.title}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        {item.description}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {t('compact.follow', 'متابعة')}
                    </Typography>
                  </Box>
                );
              })}
        </Box>
      </CardContent>
    </Card>
  );
};
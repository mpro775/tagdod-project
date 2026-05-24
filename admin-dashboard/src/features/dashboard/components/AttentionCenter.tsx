import React from 'react';
import { alpha, Box, Card, CardContent, Stack, Typography, useTheme, Skeleton } from '@mui/material';
import { Warning, ShoppingCart, Inventory, SupportAgent, ErrorOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SectionCard, EmptyState } from '@/shared/design-system';

export interface AttentionItem {
  id: string;
  type: 'pending_order' | 'low_stock' | 'abandoned_cart' | 'open_ticket' | 'system_alert';
  title: string;
  description?: string;
  count?: number;
  linkTo?: string;
  tone?: 'warning' | 'error' | 'info';
}

export interface AttentionCenterProps {
  items?: AttentionItem[];
  isLoading?: boolean;
  maxItems?: number;
}

const typeToIcon: Record<AttentionItem['type'], React.ReactNode> = {
  pending_order: <ShoppingCart sx={{ fontSize: 20 }} />,
  low_stock: <Inventory sx={{ fontSize: 20 }} />,
  abandoned_cart: <ShoppingCart sx={{ fontSize: 20 }} />,
  open_ticket: <SupportAgent sx={{ fontSize: 20 }} />,
  system_alert: <ErrorOutline sx={{ fontSize: 20 }} />,
};

export function AttentionCenter({ items = [], isLoading = false, maxItems = 5 }: AttentionCenterProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');

  if (isLoading) {
    return (
      <SectionCard
        title={t('attention.title', 'ما يحتاج انتباهك الآن')}
        description={t('attention.description', 'عناصر تحتاج متابعة')}
      >
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
        </Stack>
      </SectionCard>
    );
  }

  const visibleItems = items.slice(0, maxItems);

  if (visibleItems.length === 0) {
    return (
      <SectionCard
        title={t('attention.title', 'ما يحتاج انتباهك الآن')}
        description={t('attention.description', 'عناصر تحتاج متابعة')}
      >
        <EmptyState
          icon={<Warning sx={{ fontSize: 40 }} />}
          title={t('attention.empty', 'كل شيء على ما يرام')}
          description={t('attention.emptyDesc', 'لا توجد عناصر تحتاج انتباهك حالياً')}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={t('attention.title', 'ما يحتاج انتباهك الآن')}
      description={t('attention.description', 'عناصر تحتاج متابعة')}
    >
      <Stack spacing={1}>
        {visibleItems.map((item) => {
          const color = item.tone === 'error'
            ? theme.palette.error.main
            : item.tone === 'warning'
              ? theme.palette.warning.main
              : theme.palette.info.main;
          const bgColor = item.tone === 'error'
            ? alpha(theme.palette.error.main, 0.06)
            : item.tone === 'warning'
              ? alpha(theme.palette.warning.main, 0.06)
              : alpha(theme.palette.info.main, 0.06);

          return (
            <Card
              key={item.id}
              elevation={0}
              onClick={item.linkTo ? () => navigate(item.linkTo!) : undefined}
              sx={{
                border: '1px solid',
                borderColor: alpha(color, 0.2),
                borderRadius: 2,
                cursor: item.linkTo ? 'pointer' : 'default',
                bgcolor: bgColor,
                transition: theme.transitions.create(['border-color', 'box-shadow', 'transform']),
                '&:hover': item.linkTo
                  ? {
                      borderColor: alpha(color, 0.4),
                      boxShadow: theme.palette.mode === 'dark' ? `0 2px 8px ${alpha(color, 0.2)}` : `0 2px 8px ${alpha(color, 0.15)}`,
                      transform: 'translateY(-1px)',
                    }
                  : {},
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 1.5,
                      color: color,
                      bgcolor: alpha(color, 0.12),
                      flexShrink: 0,
                    }}
                  >
                    {typeToIcon[item.type]}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {item.title}
                      {item.count !== undefined && item.count > 0 && (
                        <Box component="span" sx={{ color, fontWeight: 800, mr: 0.5 }}>
                          {' '}({item.count})
                        </Box>
                      )}
                    </Typography>
                    {item.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                        {item.description}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </SectionCard>
  );
}
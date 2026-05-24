import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add,
  ShoppingCart,
  Inventory,
  Assessment,
  DeleteSweep,
  SupportAgent,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const QuickActionsPanel: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();

  const actions = [
    {
      key: 'addProduct',
      icon: <Add sx={{ fontSize: 20 }} />,
      label: t('quickActions.addProduct', 'إضافة منتج'),
      linkTo: '/products/new',
      color: theme.palette.primary.main,
    },
    {
      key: 'orders',
      icon: <ShoppingCart sx={{ fontSize: 20 }} />,
      label: t('quickActions.orders', 'الطلبات'),
      linkTo: '/orders',
      color: theme.palette.success.main,
    },
    {
      key: 'carts',
      icon: <DeleteSweep sx={{ fontSize: 20 }} />,
      label: t('quickActions.carts', 'السلات المتروكة'),
      linkTo: '/carts',
      color: theme.palette.warning.main,
    },
    {
      key: 'inventory',
      icon: <Inventory sx={{ fontSize: 20 }} />,
      label: t('quickActions.inventory', 'إدارة المخزون'),
      linkTo: '/products/inventory',
      color: theme.palette.error.main,
    },
    {
      key: 'reports',
      icon: <Assessment sx={{ fontSize: 20 }} />,
      label: t('quickActions.reports', 'مركز التقارير'),
      linkTo: '/analytics/reports',
      color: theme.palette.info.main,
    },
    {
      key: 'support',
      icon: <SupportAgent sx={{ fontSize: 20 }} />,
      label: t('quickActions.support', 'الدعم الفني'),
      linkTo: '/support',
      color: theme.palette.secondary.main,
    },
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
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
          {t('quickActions.title', 'إجراءات سريعة')}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(3, minmax(0, 1fr))',
              md: 'repeat(6, minmax(0, 1fr))',
            },
            gap: 1.25,
          }}
        >
          {actions.map((action) => (
            <Box
              key={action.key}
              onClick={() => navigate(action.linkTo)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                p: { xs: 1.25, sm: 1.5 },
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: alpha(action.color, 0.14),
                bgcolor: alpha(action.color, 0.04),
                cursor: 'pointer',
                transition: 'border-color .2s ease, transform .2s ease, background .2s ease',
                '&:hover': {
                  borderColor: alpha(action.color, 0.34),
                  transform: 'translateY(-2px)',
                  bgcolor: alpha(action.color, 0.08),
                },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 1.5,
                  color: action.color,
                  bgcolor: alpha(action.color, 0.12),
                }}
              >
                {action.icon}
              </Box>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ textAlign: 'center', lineHeight: 1.2 }}
                noWrap
              >
                {action.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
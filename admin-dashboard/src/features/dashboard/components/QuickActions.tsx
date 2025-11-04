import React from 'react';
import { Card, CardContent, Typography, Box, Button, alpha, useTheme, Grid } from '@mui/material';
import { 
  Add, 
  Inventory, 
  LocalOffer, 
  Category,
  Assessment,
  ShoppingCart
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
}

export const QuickActions: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(['dashboard']);
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      icon: <Add />,
      label: t('quickActions.addProduct', 'إضافة منتج'),
      color: theme.palette.primary.main,
      onClick: () => navigate('/products/new'),
    },
    {
      icon: <ShoppingCart />,
      label: t('quickActions.orders', 'الطلبات'),
      color: theme.palette.success.main,
      onClick: () => navigate('/orders'),
    },
    {
      icon: <LocalOffer />,
      label: t('quickActions.discount', 'كوبون خصم'),
      color: theme.palette.warning.main,
      onClick: () => navigate('/coupons/new'),
    },
    {
      icon: <Category />,
      label: t('quickActions.newCategory', 'فئة جديدة'),
      color: theme.palette.info.main,
      onClick: () => navigate('/categories/new'),
    },
    {
      icon: <Inventory />,
      label: t('quickActions.inventory', 'إدارة المخزون'),
      color: theme.palette.error.main,
      onClick: () => navigate('/products/inventory'),
    },
    {
      icon: <Assessment />,
      label: t('quickActions.reports', 'التقارير'),
      color: theme.palette.secondary.main,
      onClick: () => navigate('/analytics/reports'),
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {t('quickActions.title', 'إجراءات سريعة')}
        </Typography>

        <Grid container spacing={1.5} sx={{ mt: 2 }}>
          {actions.map((action, index) => (
            <Grid size={{ xs: 6, sm: 12 }} key={index}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={action.icon}
                onClick={action.onClick}
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.5,
                  px: 2,
                  borderColor: alpha(action.color, 0.3),
                  color: action.color,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: action.color,
                    bgcolor: alpha(action.color, 0.08),
                    transform: 'translateX(-4px)',
                  },
                }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};


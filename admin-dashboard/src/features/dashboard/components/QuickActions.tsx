import React from 'react';
import { Card, CardContent, Typography, Box, Button, alpha, useTheme } from '@mui/material';
import { 
  Add, 
  Inventory, 
  LocalOffer, 
  Category,
  Assessment,
  ShoppingCart
} from '@mui/icons-material';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
}

export const QuickActions: React.FC = () => {
  const theme = useTheme();

  const actions: QuickAction[] = [
    {
      icon: <Add />,
      label: 'إضافة منتج',
      color: theme.palette.primary.main,
    },
    {
      icon: <ShoppingCart />,
      label: 'الطلبات',
      color: theme.palette.success.main,
    },
    {
      icon: <LocalOffer />,
      label: 'كوبون خصم',
      color: theme.palette.warning.main,
    },
    {
      icon: <Category />,
      label: 'فئة جديدة',
      color: theme.palette.info.main,
    },
    {
      icon: <Inventory />,
      label: 'إدارة المخزون',
      color: theme.palette.error.main,
    },
    {
      icon: <Assessment />,
      label: 'التقارير',
      color: theme.palette.secondary.main,
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          إجراءات سريعة
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
          {actions.map((action, index) => (
            <Button
              key={index}
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
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};


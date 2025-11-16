import React, { useState } from 'react';
import {
  Fab,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
  Box,
  Paper,
  ClickAwayListener,
} from '@mui/material';
import {
  Add,
  Inventory,
  LocalOffer,
  Category,
  Assessment,
  ShoppingCart,
  Close,
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
  const [open, setOpen] = useState(false);

  const actions: QuickAction[] = [
    {
      icon: <Add />,
      label: t('quickActions.addProduct', 'إضافة منتج'),
      color: theme.palette.primary.main,
      onClick: () => {
        navigate('/products/new');
        setOpen(false);
      },
    },
    {
      icon: <ShoppingCart />,
      label: t('quickActions.orders', 'الطلبات'),
      color: theme.palette.success.main,
      onClick: () => {
        navigate('/orders');
        setOpen(false);
      },
    },
    {
      icon: <LocalOffer />,
      label: t('quickActions.discount', 'كوبون خصم'),
      color: theme.palette.warning.main,
      onClick: () => {
        navigate('/coupons/new');
        setOpen(false);
      },
    },
    {
      icon: <Category />,
      label: t('quickActions.newCategory', 'فئة جديدة'),
      color: theme.palette.info.main,
      onClick: () => {
        navigate('/categories/new');
        setOpen(false);
      },
    },
    {
      icon: <Inventory />,
      label: t('quickActions.inventory', 'إدارة المخزون'),
      color: theme.palette.error.main,
      onClick: () => {
        navigate('/products/inventory');
        setOpen(false);
      },
    },
    {
      icon: <Assessment />,
      label: t('quickActions.reports', 'التقارير'),
      color: theme.palette.secondary.main,
      onClick: () => {
        navigate('/analytics/reports');
        setOpen(false);
      },
    },
  ];

  const handleClick = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label={t('quickActions.title', 'إجراءات سريعة')}
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
          boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {open ? <Close /> : <Add />}
      </Fab>

      {open && (
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            elevation={8}
            sx={{
              position: 'fixed',
              bottom: 100,
              right: 32,
              zIndex: 999,
              minWidth: 240,
              maxWidth: 300,
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
              animation: 'slideUp 0.3s ease-out',
              '@keyframes slideUp': {
                from: {
                  opacity: 0,
                  transform: 'translateY(20px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            <Box
              sx={{
                p: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                {t('quickActions.title', 'إجراءات سريعة')}
              </Box>
            </Box>
            {actions.map((action, index) => (
              <MenuItem
                key={index}
                onClick={action.onClick}
                sx={{
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha(action.color, 0.08),
                    transform: 'translateX(-4px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: action.color,
                    minWidth: 40,
                  }}
                >
                  {action.icon}
                </ListItemIcon>
                <ListItemText
                  primary={action.label}
                  primaryTypographyProps={{
                    sx: {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    },
                  }}
                />
              </MenuItem>
            ))}
          </Paper>
        </ClickAwayListener>
      )}
    </>
  );
};


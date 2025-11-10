import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  LocalShipping,
  Error,
  Warning,
  Info,
  Person,
  AdminPanelSettings,
  Settings,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/shared/utils/formatters';
import type { Order, OrderStatus } from '../types/order.types';

interface OrderTimelineProps {
  order: Order;
  showHistory?: boolean;
}

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'delivered':
    case 'completed':
      return <CheckCircle color="success" />;
    case 'shipped':
      return <LocalShipping color="info" />;
    case 'processing':
      return <Schedule color="primary" />;
    case 'cancelled':
    case 'refunded':
    case 'returned':
      return <Error color="error" />;
    case 'on_hold':
      return <Warning color="warning" />;
    default:
      return <Info color="info" />;
  }
};

const getStatusLabel = (status: OrderStatus, t: (key: string, opts?: any) => string) => {
  return t(`statusLabels.${status}`);
};

const getRoleIcon = (role: 'customer' | 'admin' | 'system') => {
  switch (role) {
    case 'customer':
      return <Person color="primary" />;
    case 'admin':
      return <AdminPanelSettings color="secondary" />;
    case 'system':
      return <Settings color="info" />;
  }
};

const getRoleLabel = (role: 'customer' | 'admin' | 'system', t: (key: string) => string) => {
  return t(`orders.timeline.roles.${role}`);
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order, showHistory = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();
  
  const getOrderTimeline = () => {
    const timeline = [
      {
        label: t('orders.statusLabels.pending_payment'),
        date: order.createdAt,
        completed: true,
        icon: getStatusIcon('pending_payment' as OrderStatus),
        status: 'pending_payment' as OrderStatus,
      },
      {
        label: t('orders.statusLabels.confirmed'),
        date: order.confirmedAt,
        completed: !!order.confirmedAt,
        icon: getStatusIcon('confirmed' as OrderStatus),
        status: 'confirmed' as OrderStatus,
      },
      {
        label: t('orders.statusLabels.processing'),
        date: order.processingStartedAt,
        completed: !!order.processingStartedAt,
        icon: getStatusIcon('processing' as OrderStatus),
        status: 'processing' as OrderStatus,
      },
      {
        label: t('orders.statusLabels.shipped'),
        date: order.shippedAt,
        completed: !!order.shippedAt,
        icon: getStatusIcon('shipped' as OrderStatus),
        status: 'shipped' as OrderStatus,
      },
      {
        label: t('orders.statusLabels.delivered'),
        date: order.deliveredAt,
        completed: !!order.deliveredAt,
        icon: getStatusIcon('delivered' as OrderStatus),
        status: 'delivered' as OrderStatus,
      },
      {
        label: t('orders.statusLabels.completed'),
        date: order.completedAt,
        completed: !!order.completedAt,
        icon: getStatusIcon('completed' as OrderStatus),
        status: 'completed' as OrderStatus,
      },
    ];

    return timeline;
  };

  const getCurrentStep = () => {
    const timeline = getOrderTimeline();
    const currentIndex = timeline.findIndex(
      (step) => step.completed && step.status === order.status
    );
    return currentIndex >= 0 ? currentIndex : 0;
  };

  const getStatusHistory = () => {
    if (!showHistory || !order.statusHistory || order.statusHistory.length === 0) {
      return null;
    }

    return order.statusHistory
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .slice(0, 10); // Show last 10 status changes
  };

  const statusHistory = getStatusHistory();

  return (
    <Box>
      {/* Main Timeline */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          bgcolor: 'background.paper',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            color: 'text.primary',
            fontWeight: 'bold',
          }}
        >
          {t('orders.details.timeline')}
        </Typography>
        {isMobile ? (
          // Mobile: Vertical Stepper with compact layout
          <Stepper activeStep={getCurrentStep()} orientation="vertical">
            {getOrderTimeline().map((step, index) => (
              <Step key={index}>
                <StepLabel
                  icon={step.icon}
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: step.completed ? 'success.main' : 'text.secondary',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                    '& .MuiStepIcon-root': {
                      width: { xs: 28, sm: 32 },
                      height: { xs: 28, sm: 32 },
                    },
                  }}
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  {step.date && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {formatDate(step.date)}
                    </Typography>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        ) : isTablet ? (
          // Tablet: Vertical Stepper with standard layout
          <Stepper activeStep={getCurrentStep()} orientation="vertical">
            {getOrderTimeline().map((step, index) => (
              <Step key={index}>
                <StepLabel
                  icon={step.icon}
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: step.completed ? 'success.main' : 'text.secondary',
                    },
                  }}
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  {step.date && (
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(step.date)}
                    </Typography>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        ) : (
          // Desktop: Horizontal Stepper
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Stepper activeStep={getCurrentStep()} orientation="horizontal">
              {getOrderTimeline().map((step, index) => (
                <Step key={index}>
                  <StepLabel
                    icon={step.icon}
                    sx={{
                      '& .MuiStepLabel-label': {
                        color: step.completed ? 'success.main' : 'text.secondary',
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {step.label}
                      </Typography>
                      {step.date && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {formatDate(step.date)}
                        </Typography>
                      )}
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}
      </Paper>

      {/* Status History */}
      {statusHistory && (
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: 'background.paper',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              color: 'text.primary',
              fontWeight: 'bold',
            }}
          >
            {t('orders.details.history')}
          </Typography>
          <List sx={{ p: 0 }}>
            {statusHistory.map((entry, index) => (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1.5, sm: 2 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: { xs: 36, sm: 40 },
                      mb: { xs: 1, sm: 0 },
                    }}
                  >
                    {getStatusIcon(entry.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 0.5, sm: 1 }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        sx={{ width: '100%' }}
                      >
                        <Typography
                          variant={isMobile ? 'body2' : 'body1'}
                          sx={{ fontWeight: 'bold', color: 'text.primary' }}
                        >
                          {getStatusLabel(entry.status, t)}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          sx={{
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          }}
                        >
                          {getRoleIcon(entry.changedByRole)}
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            }}
                          >
                            {getRoleLabel(entry.changedByRole, t)}
                          </Typography>
                        </Stack>
                      </Stack>
                    }
                    secondary={
                      <Box sx={{ mt: { xs: 0.5, sm: 1 } }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
                          {formatDate(entry.changedAt)}
                        </Typography>
                        {entry.notes && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 1,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              p: 1,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.text.secondary, 0.05),
                              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                          >
                            {entry.notes}
                          </Typography>
                        )}
                      </Box>
                    }
                    primaryTypographyProps={{
                      sx: { color: 'text.primary' },
                    }}
                    secondaryTypographyProps={{
                      sx: { color: 'text.secondary' },
                    }}
                  />
                </ListItem>
                {index < statusHistory.length - 1 && (
                  <Divider
                    sx={{
                      mx: { xs: 1, sm: 2 },
                      bgcolor: alpha(theme.palette.divider, 0.1),
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

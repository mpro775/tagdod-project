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
  Error,
  Warning,
  Info,
  Person,
  AdminPanelSettings,
  Settings,
  Replay,
  Paid,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/shared/utils/formatters';
import type { Order } from '../types/order.types';
import { OrderStatus } from '../types/order.types';

interface OrderTimelineProps {
  order: Order;
  showHistory?: boolean;
}

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircle color="success" />;
    case 'processing':
      return <Schedule color="primary" />;
    case 'on_hold':
      return <Warning color="warning" />;
    case 'returned':
      return <Replay color="info" />;
    case 'refunded':
      return <Paid color="success" />;
    case 'cancelled':
      return <Error color="error" />;
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
  return t(`timeline.roles.${role}`);
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order, showHistory = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation('orders');
  const statusHistory = React.useMemo(
    () =>
      Array.isArray(order.statusHistory)
        ? [...order.statusHistory].sort(
            (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
          )
        : [],
    [order.statusHistory],
  );

  const findStatusChangeDate = React.useCallback(
    (status: OrderStatus): Date | undefined => {
      const entry = [...statusHistory].reverse().find((item) => item.status === status);
      return entry ? new Date(entry.changedAt) : undefined;
    },
    [statusHistory],
  );

  const getStatusDate = (status: OrderStatus): Date | undefined => {
    switch (status) {
      case 'pending_payment':
        return order.createdAt ? new Date(order.createdAt) : undefined;
      case 'confirmed':
        return order.confirmedAt ? new Date(order.confirmedAt) : findStatusChangeDate(status);
      case 'processing':
        return order.processingStartedAt
          ? new Date(order.processingStartedAt)
          : findStatusChangeDate(status);
      case 'completed':
        return order.completedAt ? new Date(order.completedAt) : findStatusChangeDate(status);
      case 'on_hold':
        return findStatusChangeDate(status);
      case 'cancelled':
        return order.cancelledAt ? new Date(order.cancelledAt) : findStatusChangeDate(status);
      case 'returned':
        return order.returnInfo?.returnedAt
          ? new Date(order.returnInfo.returnedAt)
          : findStatusChangeDate(status);
      case 'refunded':
        return order.returnInfo?.refundedAt
          ? new Date(order.returnInfo.refundedAt)
          : findStatusChangeDate(status);
      default:
        return undefined;
    }
  };

  const statusProgressMap: Record<OrderStatus, number> = {
    pending_payment: 0,
    confirmed: 1,
    processing: 2,
    completed: 3,
    on_hold: 2,
    cancelled: 2,
    returned: 3,
    refunded: 3,
  };

  const baseStatuses: OrderStatus[] = [
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.COMPLETED,
  ];
  
  const getOrderTimeline = () => {
    const currentProgress = statusProgressMap[order.status] ?? 0;

    const timeline = baseStatuses.map((status, index) => {
      const date = getStatusDate(status);
      return {
        label: t(`statusLabels.${status}`),
        date,
        completed: index <= currentProgress && (!!date || currentProgress > index),
        icon: getStatusIcon(status),
        status,
      };
    });

    const exceptionalStatuses: OrderStatus[] = [
      OrderStatus.ON_HOLD,
      OrderStatus.CANCELLED,
      OrderStatus.RETURNED,
      OrderStatus.REFUNDED,
    ];

    if (exceptionalStatuses.includes(order.status)) {
      const status = order.status;
      timeline.push({
        label: t(`statusLabels.${status}`),
        date: getStatusDate(status),
        completed: true,
        icon: getStatusIcon(status),
        status,
      });
    }

    return timeline;
  };

  const getCurrentStep = () => {
    const timeline = getOrderTimeline();
    const currentIndex = timeline.findIndex((step) => step.status === order.status);
    if (currentIndex >= 0) {
      return currentIndex;
    }

    const lastCompletedIndex = timeline.reduce(
      (acc, step, index) => (step.completed ? index : acc),
      0,
    );

    return lastCompletedIndex;
  };

  const getStatusHistory = () => {
    if (!showHistory || statusHistory.length === 0) {
      return null;
    }

    return [...statusHistory]
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .slice(0, 10);
  };

  const recentStatusHistory = getStatusHistory();

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
          {t('details.timeline')}
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
      {recentStatusHistory && (
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
            {t('details.history')}
          </Typography>
          <List sx={{ p: 0 }}>
            {recentStatusHistory.map((entry, index) => (
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

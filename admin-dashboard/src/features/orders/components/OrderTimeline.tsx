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
    case 'out_for_delivery':
      return <LocalShipping color="info" />;
    case 'processing':
    case 'ready_to_ship':
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
  return t(`orders.statusLabels.${status}`);
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
  const { t } = useTranslation();
  const getOrderTimeline = () => {
    const timeline = [
      {
        label: t('orders.statusLabels.draft'),
        date: order.createdAt,
        completed: true,
        icon: getStatusIcon('draft' as OrderStatus),
        status: 'draft' as OrderStatus,
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('orders.details.timeline', { defaultValue: 'تاريخ تغيير الحالات' })}
        </Typography>
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
      </Paper>

      {/* Status History */}
      {statusHistory && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
              {t('orders.details.statusHistory', { defaultValue: 'تاريخ تغيير الحالات' })}    
          </Typography>
          <List>
            {statusHistory.map((entry, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>{getStatusIcon(entry.status)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {getStatusLabel(entry.status, t)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {getRoleIcon(entry.changedByRole)}
                          <Typography variant="caption" color="text.secondary">
                            {getRoleLabel(entry.changedByRole, t)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(entry.changedAt)}
                        </Typography>
                        {entry.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {entry.notes}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < statusHistory.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { Warning, Error, CheckCircle, Schedule, Refresh } from '@mui/icons-material';
import { SupportTicket, SupportPriority } from '../types/support.types';
import { format } from 'date-fns';

interface SLAAlerterProps {
  tickets: SupportTicket[];
  onRefresh?: () => void;
  onTicketClick?: (ticket: SupportTicket) => void;
}

const getPriorityColor = (priority: SupportPriority): 'error' | 'warning' | 'info' | 'default' => {
  switch (priority) {
    case SupportPriority.URGENT:
      return 'error';
    case SupportPriority.HIGH:
      return 'warning';
    case SupportPriority.MEDIUM:
      return 'info';
    case SupportPriority.LOW:
      return 'default';
    default:
      return 'default';
  }
};

const getPriorityLabel = (priority: SupportPriority): string => {
  switch (priority) {
    case SupportPriority.LOW:
      return 'منخفضة';
    case SupportPriority.MEDIUM:
      return 'متوسطة';
    case SupportPriority.HIGH:
      return 'عالية';
    case SupportPriority.URGENT:
      return 'عاجلة';
    default:
      return 'غير محدد';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'open':
      return 'مفتوحة';
    case 'in_progress':
      return 'قيد المعالجة';
    case 'waiting_for_user':
      return 'في انتظار المستخدم';
    case 'resolved':
      return 'محلولة';
    case 'closed':
      return 'مغلقة';
    default:
      return 'غير محدد';
  }
};

export const SLAAlerter: React.FC<SLAAlerterProps> = ({ tickets, onRefresh, onTicketClick }) => {
  const criticalTickets = tickets.filter((ticket) => ticket.priority === SupportPriority.URGENT);
  const highPriorityTickets = tickets.filter((ticket) => ticket.priority === SupportPriority.HIGH);
  const totalBreached = tickets.length;
  const criticalCount = criticalTickets.length;

  if (totalBreached === 0) {
    return (
      <Card>
        <CardContent>
          <Alert severity="success" icon={<CheckCircle />}>
            <AlertTitle>ممتاز!</AlertTitle>
            لا توجد تذاكر متجاوزة لوقت الاستجابة المتفق عليه (SLA)
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      {/* تنبيه عام */}
      <Alert
        severity={criticalCount > 0 ? 'error' : 'warning'}
        icon={<Warning />}
        action={
          onRefresh && (
            <Button color="inherit" size="small" onClick={onRefresh}>
              <Refresh sx={{ mr: 1 }} />
              تحديث
            </Button>
          )
        }
      >
        <AlertTitle>تنبيه: {totalBreached} تذكرة متجاوزة لوقت الاستجابة المتفق عليه</AlertTitle>
        {criticalCount > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {criticalCount} تذكرة عاجلة تحتاج لاهتمام فوري!
          </Typography>
        )}
      </Alert>

      {/* إحصائيات سريعة */}
      <Grid container spacing={2}>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Error color="error" />
                <Typography variant="h6" color="error.main">
                  {totalBreached}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                إجمالي المتجاوزة
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Error color="error" />
                <Typography variant="h6" color="error.main">
                  {criticalCount}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                عاجلة
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Warning color="warning" />
                <Typography variant="h6" color="warning.main">
                  {highPriorityTickets.length}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                أولوية عالية
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Schedule color="info" />
                <Typography variant="h6" color="info.main">
                  {tickets.filter((t) => t.status === 'open').length}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                مفتوحة
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* قائمة التذاكر المتجاوزة */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            التذاكر المتجاوزة لوقت الاستجابة المتفق عليه
          </Typography>

          <Stack spacing={2}>
            {tickets.slice(0, 10).map((ticket) => (
              <Box
                key={ticket._id}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: getPriorityColor(ticket.priority) + '.main',
                  borderRadius: 1,
                  cursor: onTicketClick ? 'pointer' : 'default',
                  '&:hover': onTicketClick
                    ? {
                        bgcolor: 'action.hover',
                      }
                    : {},
                }}
                onClick={() => onTicketClick?.(ticket)}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {ticket.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {ticket.description.length > 100
                        ? ticket.description.substring(0, 100) + '...'
                        : ticket.description}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        label={getPriorityLabel(ticket.priority)}
                        color={getPriorityColor(ticket.priority)}
                        size="small"
                      />
                      <Chip label={getStatusLabel(ticket.status)} size="small" variant="outlined" />
                    </Stack>
                  </Box>

                  <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                    <Typography variant="caption" color="text.secondary">
                      انتهاء SLA:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {ticket.slaDueDate
                        ? format(new Date(ticket.slaDueDate), 'dd/MM HH:mm')
                        : 'غير محدد'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      تم الإنشاء: {format(new Date(ticket.createdAt), 'dd/MM HH:mm')}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}

            {tickets.length > 10 && (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                وعرض {tickets.length - 10} تذكرة أخرى...
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default SLAAlerter;

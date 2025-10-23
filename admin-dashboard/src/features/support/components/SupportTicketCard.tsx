import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Box,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Support,
  Person,
  Schedule,
  Warning,
  CheckCircle,
  Pending,
  Assignment,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { SupportTicket, SupportStatus, SupportPriority, SupportCategory } from '../types/support.types';

interface SupportTicketCardProps {
  ticket: SupportTicket;
  onClick?: (ticket: SupportTicket) => void;
  showUser?: boolean;
}

const getStatusColor = (status: SupportStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case SupportStatus.OPEN:
      return 'default';
    case SupportStatus.IN_PROGRESS:
      return 'primary';
    case SupportStatus.WAITING_FOR_USER:
      return 'warning';
    case SupportStatus.RESOLVED:
      return 'success';
    case SupportStatus.CLOSED:
      return 'secondary';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: SupportStatus) => {
  switch (status) {
    case SupportStatus.OPEN:
      return <Support />;
    case SupportStatus.IN_PROGRESS:
      return <Assignment />;
    case SupportStatus.WAITING_FOR_USER:
      return <Pending />;
    case SupportStatus.RESOLVED:
      return <CheckCircle />;
    case SupportStatus.CLOSED:
      return <CheckCircle />;
    default:
      return <Support />;
  }
};

const getPriorityColor = (priority: SupportPriority): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (priority) {
    case SupportPriority.LOW:
      return 'default';
    case SupportPriority.MEDIUM:
      return 'info';
    case SupportPriority.HIGH:
      return 'warning';
    case SupportPriority.URGENT:
      return 'error';
    default:
      return 'default';
  }
};

const getCategoryLabel = (category: SupportCategory): string => {
  switch (category) {
    case SupportCategory.TECHNICAL:
      return 'تقني';
    case SupportCategory.BILLING:
      return 'الفواتير';
    case SupportCategory.PRODUCTS:
      return 'المنتجات';
    case SupportCategory.SERVICES:
      return 'الخدمات';
    case SupportCategory.ACCOUNT:
      return 'الحساب';
    case SupportCategory.OTHER:
      return 'أخرى';
    default:
      return 'غير محدد';
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

const getStatusLabel = (status: SupportStatus): string => {
  switch (status) {
    case SupportStatus.OPEN:
      return 'مفتوحة';
    case SupportStatus.IN_PROGRESS:
      return 'قيد المعالجة';
    case SupportStatus.WAITING_FOR_USER:
      return 'في انتظار المستخدم';
    case SupportStatus.RESOLVED:
      return 'محلولة';
    case SupportStatus.CLOSED:
      return 'مغلقة';
    default:
      return 'غير محدد';
  }
};

export const SupportTicketCard: React.FC<SupportTicketCardProps> = ({
  ticket,
  onClick,
  showUser = true,
}) => {
  const handleClick = () => {
    onClick?.(ticket);
  };

  const isSLABreached = ticket.slaBreached;
  const hasRating = ticket.rating !== undefined;

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        } : {},
        border: isSLABreached ? '2px solid' : '1px solid',
        borderColor: isSLABreached ? 'error.main' : 'divider',
        position: 'relative',
      }}
      onClick={handleClick}
    >
      {isSLABreached && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
          }}
        >
          <Tooltip title="تم تجاوز وقت الاستجابة المتفق عليه (SLA)">
            <Badge color="error" variant="dot">
              <Warning color="error" />
            </Badge>
          </Tooltip>
        </Box>
      )}

      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {getStatusIcon(ticket.status)}
          </Avatar>
        }
        title={
          <Typography variant="h6" component="div" noWrap>
            {ticket.title}
          </Typography>
        }
        subheader={
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={getStatusLabel(ticket.status)}
              color={getStatusColor(ticket.status)}
              size="small"
              icon={getStatusIcon(ticket.status)}
            />
            <Chip
              label={getPriorityLabel(ticket.priority)}
              color={getPriorityColor(ticket.priority)}
              size="small"
              variant="outlined"
            />
          </Stack>
        }
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            {hasRating && (
              <Tooltip title={`تقييم: ${ticket.rating}/5`}>
                <Chip
                  label={`⭐ ${ticket.rating}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              </Tooltip>
            )}
            {ticket.attachments.length > 0 && (
              <Tooltip title={`${ticket.attachments.length} مرفق`}>
                <IconButton size="small">
                  <Assignment />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        }
      />

      <CardContent>
        <Stack spacing={2}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {ticket.description}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={getCategoryLabel(ticket.category)}
              size="small"
              variant="outlined"
            />
            {ticket.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                color="secondary"
              />
            ))}
            {ticket.tags.length > 3 && (
              <Chip
                label={`+${ticket.tags.length - 3}`}
                size="small"
                variant="outlined"
                color="secondary"
              />
            )}
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Schedule fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}
              </Typography>
            </Stack>

            {showUser && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Person fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  المستخدم
                </Typography>
              </Stack>
            )}
          </Stack>

          {ticket.slaDueDate && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Schedule fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                انتهاء SLA: {format(new Date(ticket.slaDueDate), 'dd/MM/yyyy HH:mm')}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SupportTicketCard;

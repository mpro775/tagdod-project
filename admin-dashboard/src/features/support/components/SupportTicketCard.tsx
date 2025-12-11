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
  Message,
  AdminPanelSettings,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import {
  SupportTicket,
  SupportStatus,
  SupportPriority,
  SupportCategory,
  MessageType,
} from '../types/support.types';

interface SupportTicketCardProps {
  ticket: SupportTicket;
  onClick?: (ticket: SupportTicket) => void;
  showUser?: boolean;
}

const getStatusColor = (
  status: SupportStatus
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
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

const getPriorityColor = (
  priority: SupportPriority
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
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

const getCategoryLabel = (category: SupportCategory, t: any): string => {
  return t(`category.${category}`, 'غير محدد');
};

const getPriorityLabel = (priority: SupportPriority, t: any): string => {
  return t(`priority.${priority}`, 'غير محدد');
};

const getStatusLabel = (status: SupportStatus, t: any): string => {
  return t(`status.${status}`, 'غير محدد');
};

export const SupportTicketCard: React.FC<SupportTicketCardProps> = ({
  ticket,
  onClick,
  showUser = true,
}) => {
  const { t } = useTranslation('support');
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
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: 3,
            }
          : {},
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
          <Tooltip title={t('messages.slaBreachTooltip')}>
            <Badge color="error" variant="dot">
              <Warning color="error" />
            </Badge>
          </Tooltip>
        </Box>
      )}

      <CardHeader
        avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{getStatusIcon(ticket.status)}</Avatar>}
        title={
          <Typography variant="h6" component="div" noWrap>
            {ticket.title}
          </Typography>
        }
        subheader={
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={getStatusLabel(ticket.status, t)}
              color={getStatusColor(ticket.status)}
              size="small"
              icon={getStatusIcon(ticket.status)}
            />
            <Chip
              label={getPriorityLabel(ticket.priority, t)}
              color={getPriorityColor(ticket.priority)}
              size="small"
              variant="outlined"
            />
          </Stack>
        }
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            {hasRating && (
              <Tooltip title={`${t('labels.rating')}: ${ticket.rating}/5`}>
                <Chip
                  label={`⭐ ${ticket.rating}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              </Tooltip>
            )}
            {ticket.attachments.length > 0 && (
              <Tooltip title={`${ticket.attachments.length} ${t('labels.attachments')}`}>
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
          {/* آخر رسالة في المحادثة */}
          {ticket.lastMessage && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: (theme) =>
                  ticket.lastMessage?.messageType === MessageType.ADMIN_REPLY
                    ? theme.palette.mode === 'dark'
                      ? 'success.dark'
                      : 'success.light'
                    : theme.palette.mode === 'dark'
                    ? 'grey.800'
                    : 'grey.100',
                border: '1px solid',
                borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300'),
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor:
                      ticket.lastMessage.messageType === MessageType.ADMIN_REPLY
                        ? 'success.main'
                        : 'primary.main',
                  }}
                >
                  {ticket.lastMessage.messageType === MessageType.ADMIN_REPLY ? (
                    <AdminPanelSettings sx={{ fontSize: 14 }} />
                  ) : (
                    <Person sx={{ fontSize: 14 }} />
                  )}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={0.5}
                  >
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                      {ticket.lastMessage.messageType === MessageType.ADMIN_REPLY
                        ? ticket.lastMessage.sender?.name || t('labels.support')
                        : ticket.lastMessage.sender?.name || t('labels.customer')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(ticket.lastMessage.createdAt), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {ticket.lastMessage.content}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* وصف التذكرة (فقط إذا لم تكن هناك رسالة أخيرة) */}
          {!ticket.lastMessage && (
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
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={getCategoryLabel(ticket.category, t)} size="small" variant="outlined" />
            {ticket.tags.slice(0, 3).map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" color="secondary" />
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

            {showUser && ticket.user && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Person fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {ticket.user.name || ticket.user.phone || t('labels.user')}
                </Typography>
              </Stack>
            )}
          </Stack>

          {ticket.slaDueDate && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Schedule fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {t('labels.slaDueDate')}: {format(new Date(ticket.slaDueDate), 'dd/MM/yyyy HH:mm')}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SupportTicketCard;

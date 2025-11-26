import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  Typography,
  Stack,
  Grid,
  Paper,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from '@mui/material';
import { Visibility, ExpandMore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { Notification } from '../types/notification.types';
import { formatDate } from '@/shared/utils/formatters';
import { getChannelIcon } from './notificationHelpers';
import { NotificationStatusChip } from './NotificationStatusChip';
import { NotificationChannelChip } from './NotificationChannelChip';
import { NotificationPriorityChip } from './NotificationPriorityChip';
import { NotificationCategoryChip } from './NotificationCategoryChip';

interface NotificationViewDialogProps {
  open: boolean;
  onClose: () => void;
  notification: Notification | null;
}

export const NotificationViewDialog: React.FC<NotificationViewDialogProps> = ({
  open,
  onClose,
  notification,
}) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const theme = useTheme();

  if (!notification) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      aria-labelledby="notification-view-dialog-title"
    >
      <DialogTitle
        id="notification-view-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: isMobile ? '1.125rem' : undefined,
        }}
      >
        <Visibility />
        {t('dialogs.viewTitle')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Header Info */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              {getChannelIcon(notification.channel)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {notification.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <NotificationChannelChip channel={notification.channel} />
                <NotificationStatusChip status={notification.status} />
                <NotificationPriorityChip priority={notification.priority} />
                <NotificationCategoryChip category={notification.category} />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Content */}
          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
            >
              {t('dialogs.content')}
            </Typography>
            <Paper
              sx={{
                p: isMobile ? 1.5 : 2,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
              }}
            >
              <Typography
                variant="body1"
                sx={{ whiteSpace: 'pre-wrap', fontSize: isMobile ? '0.875rem' : undefined }}
              >
                {notification.message}
              </Typography>
            </Paper>
          </Box>

          {/* User Info */}
          {notification.user && (
            <Box>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
              >
                {t('dialogs.user')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 1 : 2,
                  p: isMobile ? 1.5 : 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                  borderRadius: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'secondary.main',
                    width: isMobile ? 40 : 56,
                    height: isMobile ? 40 : 56,
                  }}
                >
                  {notification.user.name?.charAt(0) || notification.user.email?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
                  >
                    {notification.user.name || notification.user.email}
                  </Typography>
                  {notification.user.email && notification.user.name && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                    >
                      {notification.user.email}
                    </Typography>
                  )}
                  {notification.user.phone && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                    >
                      {notification.user.phone}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}

          {/* Timestamps */}
          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
            >
              {t('dialogs.dates')}
            </Typography>
            <Grid container spacing={isMobile ? 1.5 : 2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    {t('dialogs.createdAt')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                    {formatDate(notification.createdAt)}
                  </Typography>
                </Box>
              </Grid>
              {notification.sentAt && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isMobile ? 1.5 : 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                    >
                      {t('dialogs.sentAt')}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                      {formatDate(notification.sentAt)}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {notification.readAt && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: isMobile ? 1.5 : 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                    >
                      {t('dialogs.readAt')}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                      {formatDate(notification.readAt)}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Action URL */}
          {notification.actionUrl && (
            <Box>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
              >
                {t('dialogs.actionUrl')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  wordBreak: 'break-all',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                  p: 1,
                  borderRadius: 1,
                  fontSize: isMobile ? '0.75rem' : undefined,
                }}
              >
                {notification.actionUrl}
              </Typography>
            </Box>
          )}

          {/* Error Information */}
          {notification.errorMessage && (
            <Alert severity="error" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('fields.errorMessage')}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                {notification.errorMessage}
              </Typography>
              {notification.errorCode && (
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: 1, fontSize: isMobile ? '0.7rem' : undefined }}
                >
                  {t('fields.errorCode')} {notification.errorCode}
                </Typography>
              )}
            </Alert>
          )}

          {/* Metadata */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                  {t('dialogs.errorInfo')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre
                  style={{
                    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
                    padding: isMobile ? '8px' : '12px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: isMobile ? '10px' : '12px',
                    fontFamily: 'monospace',
                    color: theme.palette.text.primary,
                  }}
                >
                  {JSON.stringify(notification.metadata, null, 2)}
                </pre>
              </AccordionDetails>
            </Accordion>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
        <Button onClick={onClose} size={isMobile ? 'small' : 'medium'} aria-label={t('dialogs.close')}>
          {t('dialogs.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


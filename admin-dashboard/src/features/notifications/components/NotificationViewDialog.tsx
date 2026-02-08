import React, { useState, useMemo } from 'react';
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
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  ExpandMore,
  CheckCircle,
  Error,
  Schedule,
  Search,
  Group,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { Notification, NotificationStatus } from '../types/notification.types';
import { formatDate } from '@/shared/utils/formatters';
import { getChannelIcon } from './notificationHelpers';
import { NotificationStatusChip } from './NotificationStatusChip';
import { NotificationChannelChip } from './NotificationChannelChip';
import { NotificationPriorityChip } from './NotificationPriorityChip';
import { NotificationCategoryChip } from './NotificationCategoryChip';
import { useNotificationDeliveryDetails, useBatchDeliveryDetails } from '../hooks/useNotifications';
import { isBatchRow } from './notificationHelpers';

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
  const [searchQuery, setSearchQuery] = useState('');

  // جلب تفاصيل الإرسال (حسب batch أو إشعار فردي)
  const singleDetails = useNotificationDeliveryDetails(
    notification?.batchId ? '' : notification?._id || ''
  );
  const batchDetails = useBatchDeliveryDetails(notification?.batchId || '');

  const deliveryDetails = notification?.batchId ? batchDetails.data : singleDetails.data;
  const isLoadingDetails = notification?.batchId ? batchDetails.isLoading : singleDetails.isLoading;
  const deliveryError = notification?.batchId ? batchDetails.error : singleDetails.error;

  // فلترة السجلات حسب البحث
  const filteredLogs = useMemo(() => {
    if (!deliveryDetails?.logs) return [];
    if (!searchQuery.trim()) return deliveryDetails.logs;

    const query = searchQuery.toLowerCase();
    return deliveryDetails.logs.filter(
      (log) =>
        log.userName?.toLowerCase().includes(query) ||
        log.userEmail?.toLowerCase().includes(query) ||
        log.errorMessage?.toLowerCase().includes(query)
    );
  }, [deliveryDetails?.logs, searchQuery]);

  if (!notification) return null;

  const isBatch = isBatchRow(notification);
  const recipientsCount = deliveryDetails?.summary?.total ?? notification.recipientCount ?? 0;

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

          {/* User Info / Batch Info */}
          {isBatch ? (
            <Box>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
              >
                {t('dialogs.batchRecipients')}
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
                  <Group />
                </Avatar>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
                  >
                    {t('dialogs.batchForRecipients', {
                      count: recipientsCount,
                      defaultValue: `دفعة لـ ${recipientsCount} مستلم`,
                    })}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    {t('dialogs.viewRecipientsBelow', {
                      defaultValue: 'يمكن عرض قائمة المستلمين في قسم تفاصيل الإرسال أدناه',
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            notification.user && (
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
                    bgcolor:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
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
            )
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
                    bgcolor:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
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
                      bgcolor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
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
                    <Typography
                      variant="body1"
                      sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
                    >
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
                      bgcolor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
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
                    <Typography
                      variant="body1"
                      sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
                    >
                      {formatDate(notification.readAt)}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Batch ID */}
          {notification.batchId && (
            <Box>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
              >
                {t('dialogs.batchIdLabel')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  wordBreak: 'break-all',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                  p: 1,
                  borderRadius: 1,
                  fontSize: isMobile ? '0.75rem' : undefined,
                  fontFamily: 'monospace',
                }}
              >
                {notification.batchId}
              </Typography>
            </Box>
          )}

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
                <Typography
                  variant="subtitle1"
                  sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
                >
                  {t('dialogs.errorInfo')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre
                  style={{
                    background:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
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

          {/* Delivery Details */}
          <Accordion defaultExpanded={!!deliveryDetails?.logs.length}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
              >
                {t('dialogs.deliveryDetails', 'تفاصيل الإرسال')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {isLoadingDetails ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : deliveryError ? (
                <Alert severity="error">
                  {t('messages.loadingError', 'حدث خطأ أثناء تحميل التفاصيل')}
                </Alert>
              ) : deliveryDetails ? (
                <Stack spacing={3}>
                  {/* Summary Cards */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Typography
                            variant="h4"
                            color="text.secondary"
                            sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }}
                          >
                            {deliveryDetails.summary.total}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                          >
                            {t('dialogs.total', 'إجمالي')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Typography variant="h4" sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>
                            {deliveryDetails.summary.sent}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                          >
                            {t('dialogs.sent', 'نجح')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Typography variant="h4" sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>
                            {deliveryDetails.summary.failed}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                          >
                            {t('dialogs.failed', 'فشل')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Typography variant="h4" sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>
                            {deliveryDetails.summary.pending}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                          >
                            {t('dialogs.pending', 'قيد الانتظار')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Search */}
                  {deliveryDetails.logs.length > 0 && (
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={t('dialogs.searchUsers', 'البحث في المستخدمين...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}

                  {/* Logs Table */}
                  {filteredLogs.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size={isMobile ? 'small' : 'medium'}>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontSize: isMobile ? '0.75rem' : undefined,
                                fontWeight: 'bold',
                              }}
                            >
                              {t('dialogs.user', 'المستخدم')}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: isMobile ? '0.75rem' : undefined,
                                fontWeight: 'bold',
                              }}
                            >
                              {t('dialogs.status', 'الحالة')}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: isMobile ? '0.75rem' : undefined,
                                fontWeight: 'bold',
                              }}
                            >
                              {t('dialogs.channel', 'القناة')}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: isMobile ? '0.75rem' : undefined,
                                fontWeight: 'bold',
                              }}
                            >
                              {t('dialogs.time', 'الوقت')}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: isMobile ? '0.75rem' : undefined,
                                fontWeight: 'bold',
                              }}
                            >
                              {t('dialogs.error', 'الخطأ')}
                            </TableCell>
                            {!isMobile && (
                              <TableCell
                                sx={{
                                  fontSize: isMobile ? '0.75rem' : undefined,
                                  fontWeight: 'bold',
                                }}
                              >
                                {t('dialogs.device', 'الجهاز')}
                              </TableCell>
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredLogs.map((log) => (
                            <TableRow key={log._id} hover>
                              <TableCell>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 'medium',
                                      fontSize: isMobile ? '0.75rem' : undefined,
                                    }}
                                  >
                                    {log.userName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                                  >
                                    {log.userEmail}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                {log.status === NotificationStatus.SENT ? (
                                  <Chip
                                    icon={<CheckCircle />}
                                    label={t('dialogs.sent', 'نجح')}
                                    color="success"
                                    size="small"
                                    sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                                  />
                                ) : log.status === NotificationStatus.FAILED ? (
                                  <Chip
                                    icon={<Error />}
                                    label={t('dialogs.failed', 'فشل')}
                                    color="error"
                                    size="small"
                                    sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                                  />
                                ) : (
                                  <Chip
                                    icon={<Schedule />}
                                    label={t('dialogs.pending', 'قيد الانتظار')}
                                    color="warning"
                                    size="small"
                                    sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                <NotificationChannelChip channel={log.channel} />
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                                >
                                  {log.sentAt
                                    ? formatDate(log.sentAt)
                                    : log.failedAt
                                    ? formatDate(log.failedAt)
                                    : formatDate(log.createdAt)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {log.errorMessage ? (
                                  <Tooltip title={log.errorMessage}>
                                    <Typography
                                      variant="caption"
                                      color="error"
                                      sx={{
                                        fontSize: isMobile ? '0.7rem' : undefined,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: 'block',
                                        maxWidth: isMobile ? 100 : 200,
                                      }}
                                    >
                                      {log.errorCode || log.errorMessage}
                                    </Typography>
                                  </Tooltip>
                                ) : (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                                  >
                                    -
                                  </Typography>
                                )}
                              </TableCell>
                              {!isMobile && (
                                <TableCell>
                                  {log.deviceToken ? (
                                    <Box>
                                      <Typography
                                        variant="caption"
                                        sx={{ fontSize: '0.7rem', display: 'block' }}
                                      >
                                        {log.platform || 'Unknown'}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                          fontSize: '0.65rem',
                                          fontFamily: 'monospace',
                                          wordBreak: 'break-all',
                                          display: 'block',
                                          maxWidth: 150,
                                        }}
                                      >
                                        {log.deviceToken.substring(0, 20)}...
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ fontSize: '0.7rem' }}
                                    >
                                      -
                                    </Typography>
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : deliveryDetails.logs.length === 0 ? (
                    <Alert severity="info">
                      {t('dialogs.noDeliveryLogs', 'لا توجد سجلات إرسال لهذا الإشعار')}
                    </Alert>
                  ) : (
                    <Alert severity="info">
                      {t('dialogs.noMatchingLogs', 'لا توجد نتائج مطابقة للبحث')}
                    </Alert>
                  )}
                </Stack>
              ) : null}
            </AccordionDetails>
          </Accordion>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
        <Button
          onClick={onClose}
          size={isMobile ? 'small' : 'medium'}
          aria-label={t('dialogs.close')}
        >
          {t('dialogs.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

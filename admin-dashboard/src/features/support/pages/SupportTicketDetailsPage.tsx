import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AlertTitle,
} from '@mui/material';
import { ArrowBack, Send, Warning, Refresh } from '@mui/icons-material';
import {
  useSupportTicket,
  useTicketMessages,
  useAddMessageToTicket,
  useUpdateSupportTicket,
  useCheckSLAStatus,
} from '../hooks/useSupport';
import { SupportMessageBubble } from '../components';
import { format } from 'date-fns';
import { SupportStatus, SupportPriority, SupportCategory } from '../types/support.types';

export const SupportTicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SupportStatus | ''>('');
  const [priority, setPriority] = useState<SupportPriority | ''>('');
  const [category, setCategory] = useState<SupportCategory | ''>('');

  const { data: ticket, isLoading, error } = useSupportTicket(id!);
  const { data: messagesData, isLoading: messagesLoading } = useTicketMessages(id!);
  const { mutate: addMessage, isPending: isSending } = useAddMessageToTicket();
  const { mutate: updateTicket } = useUpdateSupportTicket();
  const { mutate: checkSLA } = useCheckSLAStatus();

  const handleSendMessage = () => {
    if (!message.trim() || !id) return;
    addMessage(
      { ticketId: id, data: { content: message.trim() } },
      { onSuccess: () => setMessage('') }
    );
  };

  const handleUpdateTicket = () => {
    if (!id) return;
    const updates: any = {};
    if (status) updates.status = status as SupportStatus;
    if (priority) updates.priority = priority as SupportPriority;
    if (category) updates.category = category as SupportCategory;

    if (Object.keys(updates).length > 0) {
      updateTicket({ id, data: updates });
      setStatus('');
      setPriority('');
      setCategory('');
    }
  };

  const handleCheckSLA = () => {
    if (id) {
      checkSLA(id);
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

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid component="div" size={{ xs: 12, lg: 8 }}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid component="div" size={{ xs: 12, lg: 4 }}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error || !ticket) {
    return (
      <Box>
        <Alert severity="error">حدث خطأ في تحميل التذكرة. يرجى المحاولة مرة أخرى.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <IconButton onClick={() => navigate('/support')}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight="bold">
              {ticket.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip label={getStatusLabel(ticket.status)} color="primary" variant="outlined" />
            <Chip
              label={getPriorityLabel(ticket.priority)}
              color={ticket.priority === SupportPriority.URGENT ? 'error' : 'default'}
              variant="outlined"
            />
            {ticket.slaBreached && (
              <Chip label="متجاوزة SLA" color="error" icon={<Warning />} />
            )}
          </Stack>
        </Stack>

        {/* Quick Actions */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>تغيير الحالة</InputLabel>
            <Select
              value={status}
              label="تغيير الحالة"
              onChange={(e) => setStatus(e.target.value as SupportStatus)}
            >
              <MenuItem value="">-- اختر --</MenuItem>
              {Object.values(SupportStatus).map((s) => (
                <MenuItem key={s} value={s}>
                  {getStatusLabel(s)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>تغيير الأولوية</InputLabel>
            <Select
              value={priority}
              label="تغيير الأولوية"
              onChange={(e) => setPriority(e.target.value as SupportPriority)}
            >
              <MenuItem value="">-- اختر --</MenuItem>
              {Object.values(SupportPriority).map((p) => (
                <MenuItem key={p} value={p}>
                  {getPriorityLabel(p)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>تغيير الفئة</InputLabel>
            <Select
              value={category}
              label="تغيير الفئة"
              onChange={(e) => setCategory(e.target.value as SupportCategory)}
            >
              <MenuItem value="">-- اختر --</MenuItem>
              {Object.values(SupportCategory).map((c) => (
                <MenuItem key={c} value={c}>
                  {getCategoryLabel(c)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={handleUpdateTicket}
            disabled={!status && !priority && !category}
          >
            تطبيق التغييرات
          </Button>

          <Button variant="outlined" startIcon={<Refresh />} onClick={handleCheckSLA}>
            فحص SLA
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Messages */}
        <Grid component="div" size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, height: 'calc(100vh - 400px)', overflow: 'auto' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">المحادثة</Typography>
              <Typography variant="body2" color="text.secondary">
                {messagesData?.data?.length || 0} رسالة
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            {/* Messages List */}
            <Box sx={{ mb: 3 }}>
              {messagesLoading ? (
                <Stack spacing={2}>
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} variant="rectangular" height={80} />
                  ))}
                </Stack>
              ) : messagesData?.data && messagesData.data.length > 0 ? (
                <Stack spacing={2}>
                  {messagesData.data.map((msg) => (
                    <SupportMessageBubble
                      key={msg._id}
                      message={msg}
                      isCurrentUser={msg.messageType === 'admin_reply'}
                      showSenderInfo={true}
                    />
                  ))}
                </Stack>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    لا توجد رسائل بعد
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Send Message */}
            <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="اكتب رسالتك..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                variant="contained"
                startIcon={isSending ? <CircularProgress size={20} /> : <Send />}
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                sx={{ minWidth: 100, height: 'fit-content' }}
              >
                إرسال
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Ticket Info */}
        <Grid component="div" size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            {/* Ticket Details */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  تفاصيل التذكرة
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      الفئة
                    </Typography>
                    <Typography variant="body2">
                      {getCategoryLabel(ticket.category)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      الحالة
                    </Typography>
                    <Typography variant="body2">{getStatusLabel(ticket.status)}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      الأولوية
                    </Typography>
                    <Typography variant="body2">
                      {getPriorityLabel(ticket.priority)}
                    </Typography>
                  </Box>

                  {ticket.slaDueDate && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        انتهاء SLA
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(ticket.slaDueDate), 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    </Box>
                  )}

                  {ticket.rating && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        التقييم
                      </Typography>
                      <Typography variant="body2">⭐ {ticket.rating}/5</Typography>
                      {ticket.feedback && (
                        <Typography variant="caption" color="text.secondary">
                          {ticket.feedback}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* SLA Status */}
            {ticket.slaBreached && (
              <Alert severity="error" icon={<Warning />}>
                <AlertTitle>تنبيه SLA</AlertTitle>
                هذه التذكرة متجاوزة لوقت الاستجابة المتفق عليه
              </Alert>
            )}

            {/* Ticket Description */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  وصف المشكلة
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {ticket.description}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

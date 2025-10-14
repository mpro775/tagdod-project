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
  Avatar,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { useSupportTicket, useTicketMessages, useAddMessage, useUpdateTicket } from '../hooks/useSupport';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { formatDate } from '@/shared/utils/formatters';
import { SupportStatus, SupportPriority } from '../types/support.types';

export const SupportTicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SupportStatus | ''>('');
  const [priority, setPriority] = useState<SupportPriority | ''>('');

  const { data: ticket, isLoading } = useSupportTicket(id!);
  const { data: messagesData } = useTicketMessages(id!);
  const { mutate: addMessage, isPending: isSending } = useAddMessage();
  const { mutate: updateTicket } = useUpdateTicket();

  const handleSendMessage = () => {
    if (!message.trim() || !id) return;
    addMessage(
      { ticketId: id, data: { message: message.trim() } },
      { onSuccess: () => setMessage('') }
    );
  };

  const handleUpdateStatus = () => {
    if (!id || !status) return;
    updateTicket({ id, data: { status: status as SupportStatus } });
  };

  const handleUpdatePriority = () => {
    if (!id || !priority) return;
    updateTicket({ id, data: { priority: priority as SupportPriority } });
  };

  if (isLoading || !ticket) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/support')}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight="bold">
              {ticket.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(ticket.createdAt!)}
            </Typography>
          </Box>
          <Chip label={ticket.status} color="primary" />
          <Chip label={ticket.priority} color={ticket.priority === 'urgent' ? 'error' : 'default'} />
        </Box>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <FormSelect
            name="status"
            label="تغيير الحالة"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as SupportStatus);
              setTimeout(() => handleUpdateStatus(), 100);
            }}
            options={[
              { value: '', label: '-- اختر --' },
              { value: SupportStatus.OPEN, label: 'مفتوحة' },
              { value: SupportStatus.IN_PROGRESS, label: 'قيد المعالجة' },
              { value: SupportStatus.WAITING_FOR_USER, label: 'انتظار العميل' },
              { value: SupportStatus.RESOLVED, label: 'محلولة' },
              { value: SupportStatus.CLOSED, label: 'مغلقة' },
            ]}
          />
          <FormSelect
            name="priority"
            label="تغيير الأولوية"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as SupportPriority);
              setTimeout(() => handleUpdatePriority(), 100);
            }}
            options={[
              { value: '', label: '-- اختر --' },
              { value: SupportPriority.LOW, label: 'منخفضة' },
              { value: SupportPriority.MEDIUM, label: 'متوسطة' },
              { value: SupportPriority.HIGH, label: 'عالية' },
              { value: SupportPriority.URGENT, label: 'عاجلة' },
            ]}
          />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Messages */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, height: 'calc(100vh - 400px)', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              المحادثة
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Messages List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {messagesData?.data?.map((msg) => (
                <Card
                  key={msg._id}
                  sx={{
                    alignSelf: msg.isAdminReply ? 'flex-start' : 'flex-end',
                    maxWidth: '70%',
                    bgcolor: msg.isAdminReply ? 'primary.light' : 'grey.100',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {msg.isAdminReply ? 'A' : 'U'}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(msg.createdAt!)}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{msg.message}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Send Message */}
            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
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
                sx={{ minWidth: 100 }}
              >
                إرسال
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Ticket Info */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                معلومات التذكرة
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    الفئة
                  </Typography>
                  <Typography variant="body2">{ticket.category}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    الحالة
                  </Typography>
                  <Typography variant="body2">{ticket.status}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    الأولوية
                  </Typography>
                  <Typography variant="body2">{ticket.priority}</Typography>
                </Box>

                {ticket.slaBreached && (
                  <Box>
                    <Chip label="تأخر عن SLA" color="error" size="small" />
                  </Box>
                )}

                {ticket.rating && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      التقييم
                    </Typography>
                    <Typography variant="body2">⭐ {ticket.rating}/5</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};


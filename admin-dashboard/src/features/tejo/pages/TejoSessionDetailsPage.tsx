import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { tejoApi } from '../api/tejoApi';
import type { TejoSession, TejoSessionMessage } from '../types/tejo.types';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  active: 'success',
  resolved: 'info',
  escalation_suggested: 'warning',
  escalated: 'error',
  closed: 'default',
};

const statusLabels: Record<string, string> = {
  active: 'نشطة',
  resolved: 'محسولة',
  escalation_suggested: 'اقتراح تصعيد',
  escalated: 'مُصعدة',
  closed: 'مغلقة',
};

export function TejoSessionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<TejoSession | null>(null);
  const [messages, setMessages] = useState<TejoSessionMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [sessionRes, messagesRes] = await Promise.all([
          tejoApi.getSessionById(id),
          tejoApi.getSessionMessages(id, 1, 100),
        ]);
        setSession(sessionRes);
        setMessages(messagesRes.messages);
      } catch (error) {
        console.error('Failed to load session details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return (
      <Box p={3}>
        <Typography>لم يتم العثور على الجلسة</Typography>
      </Box>
    );
  }

  const formatUserName = (): string => {
    if (typeof session.userId === 'object' && session.userId !== null) {
      const user = session.userId as { firstName?: string; lastName?: string; email?: string };
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'مجهول';
    }
    return 'مجهول';
  };

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Tooltip title="رجوع">
          <IconButton onClick={() => navigate('/support/tejo/sessions')}>
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">تفاصيل جلسة تيجو</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 6, sm: 6, md: 4 }} >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                معلومات الجلسة
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                <Grid size={{ xs: 6, sm: 6, md: 6 }} >
                  <Typography color="textSecondary" variant="body2">
                    المستخدم
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 6 }} >
                  <Typography variant="body2">{formatUserName()}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 6 }} >
                  <Typography color="textSecondary" variant="body2">
                    القناة
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 6 }} >
                  <Typography variant="body2">{session.channel}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 6 }} >
                  <Typography color="textSecondary" variant="body2">
                    الحالة
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 6 }} >
                  <Chip
                    label={statusLabels[session.status] || session.status}
                    color={statusColors[session.status] || 'default'}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 6 }} >
                  <Typography color="textSecondary" variant="body2">
                    عدد الرسائل
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 6 }} >
                  <Typography variant="body2">{session.messageCount}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 6 }} >
                  <Typography color="textSecondary" variant="body2">
                    تصعيد
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 6 }} >
                  {session.handoffTriggered ? (
                    <Chip label="مُصعد" color="error" size="small" />
                  ) : session.handoffSuggested ? (
                    <Chip label="مقترح" color="warning" size="small" />
                  ) : (
                    <Typography variant="body2">لا</Typography>
                  )}
                </Grid>
                  <Grid size={{ xs: 6, sm: 6, md: 6 }} >
                  <Typography color="textSecondary" variant="body2">
                    تاريخ الإنشاء
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 6 }} >
                  <Typography variant="body2">
                    {new Date(session.createdAt).toLocaleString('ar')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 8 }} >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                المحادثة
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List sx={{ maxHeight: '600px', overflow: 'auto' }}>
                {messages.map((msg) => (
                  <ListItem
                    key={msg._id}
                    sx={{
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      flexDirection: 'column',
                      alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        bgcolor: msg.role === 'user' ? 'primary.light' : 'grey.100',
                        color: msg.role === 'user' ? 'white' : 'text.primary',
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: msg.role === 'user' ? 'primary.dark' : 'grey.500',
                            fontSize: 12,
                          }}
                        >
                          {msg.role === 'user' ? 'م' : 'ت'}
                        </Avatar>
                        <Typography variant="caption" fontWeight="bold">
                          {msg.role === 'user' ? 'المستخدم' : 'تيجو'}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{msg.content}</Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7 }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString('ar', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Paper>
                  </ListItem>
                ))}
                {messages.length === 0 && (
                  <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                    لا توجد رسائل
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

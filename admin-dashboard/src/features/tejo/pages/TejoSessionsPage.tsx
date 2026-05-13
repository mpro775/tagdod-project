import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Visibility,} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tejoApi } from '../api/tejoApi';
import type { TejoSession, TejoSessionStats } from '../types/tejo.types';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  active: 'success',
  resolved: 'info',
  escalation_suggested: 'warning',
  escalated: 'error',
  closed: 'default',
};

const statusLabels: Record<string, string> = {
  active: 'نشطة',
  resolved: 'محلولة',
  escalation_suggested: 'اقتراح تصعيد',
  escalated: 'مُصعدة',
  closed: 'مغلقة',
};

const channelLabels: Record<string, string> = {
  web: 'ويب',
  whatsapp: 'واتساب',
  messenger: 'ماسنجر',
  instagram: 'انستغرام',
  mobile: 'موبايل',
};

export function TejoSessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<TejoSession[]>([]);
  const [stats, setStats] = useState<TejoSessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        tejoApi.getSessions(page + 1, limit, statusFilter || undefined, channelFilter || undefined),
        tejoApi.getSessionStats(),
      ]);
      setSessions(sessionsRes.sessions);
      setTotal(sessionsRes.total);
      setStats(statsRes);
    } catch (error) {
      console.error('Failed to load Tejo sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, limit, statusFilter, channelFilter]);

  const formatUserName = (session: TejoSession): string => {
    if (typeof session.userId === 'object' && session.userId !== null) {
      const user = session.userId as { firstName?: string; lastName?: string; email?: string };
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'مجهول';
    }
    return 'مجهول';
  };

  const formatTicketTitle = (session: TejoSession): string => {
    if (typeof session.supportTicketId === 'object' && session.supportTicketId !== null) {
      return (session.supportTicketId as { title?: string }).title || '-';
    }
    return '-';
  };

  if (loading && sessions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        محادثات تيجو
      </Typography>

      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid  size={{ xs: 6, sm: 6, md: 2.4 }} >
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  إجمالي المحادثات
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  نشطة
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.active}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 2.4 }} >
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  اقتراح تصعيد
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.escalationSuggested}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 2.4 }} >
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  مُصعدة
                </Typography>
                <Typography variant="h4" color="error.main">
                  {stats.escalated}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 2.4 }} >
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  نسبة التصعيد
                </Typography>
                <Typography variant="h4">
                  {stats.total > 0 ? ((stats.escalated / stats.total) * 100).toFixed(1) : 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 6, md: 3 }} >
              <TextField
                select
                label="تصفية حسب الحالة"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                fullWidth
                size="small"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="active">نشطة</MenuItem>
                <MenuItem value="escalation_suggested">اقتراح تصعيد</MenuItem>
                <MenuItem value="escalated">مُصعدة</MenuItem>
                <MenuItem value="resolved">محسولة</MenuItem>
                <MenuItem value="closed">مغلقة</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }} >
              <TextField
                select
                label="تصفية حسب القناة"
                value={channelFilter}
                onChange={(e) => {
                  setChannelFilter(e.target.value);
                  setPage(0);
                }}
                fullWidth
                size="small"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="web">ويب</MenuItem>
                <MenuItem value="whatsapp">واتساب</MenuItem>
                <MenuItem value="mobile">موبايل</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>المستخدم</TableCell>
              <TableCell>القناة</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>عدد الرسائل</TableCell>
              <TableCell>تصعيد</TableCell>
              <TableCell>التذكرة</TableCell>
              <TableCell>آخر نشاط</TableCell>
              <TableCell>إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session._id}>
                <TableCell>{formatUserName(session)}</TableCell>
                <TableCell>{channelLabels[session.channel] || session.channel}</TableCell>
                <TableCell>
                  <Chip
                    label={statusLabels[session.status] || session.status}
                    color={statusColors[session.status] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{session.messageCount}</TableCell>
                <TableCell>
                  {session.handoffTriggered ? (
                    <Chip label="مُصعد" color="error" size="small" />
                  ) : session.handoffSuggested ? (
                    <Chip label="مقترح" color="warning" size="small" />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{formatTicketTitle(session)}</TableCell>
                <TableCell>
                  {session.lastMessageAt
                    ? new Date(session.lastMessageAt).toLocaleDateString('ar')
                    : new Date(session.createdAt).toLocaleDateString('ar')}
                </TableCell>
                <TableCell>
                  <Tooltip title="عرض المحادثة">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/support/tejo/sessions/${session._id}`)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  لا توجد محادثات
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(0);
          }}
          labelRowsPerPage="صفوف لكل صفحة"
        />
      </TableContainer>
    </Box>
  );
}

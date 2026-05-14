import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, MenuItem, Button, Chip, CircularProgress, Divider } from '@mui/material';
import { ArrowBack, Save, ContactMail } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useContactRequest, useUpdateContactRequestStatus, useAddContactRequestNote } from '../hooks/useContactRequests';
import { formatDate } from '@/shared/utils/formatters';
import type { RequestStatus } from '../types/contact-request.types';

const STATUSES: RequestStatus[] = ['new', 'in_review', 'contacted', 'converted', 'closed'];

export const ContactRequestDetailsPage: React.FC = () => {
  const { t } = useTranslation('contactRequests');
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: request, isLoading } = useContactRequest(id || '');
  const updateStatus = useUpdateContactRequestStatus();
  const addNote = useAddContactRequestNote();
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<RequestStatus>('new');

  useEffect(() => { if (request) { setStatus(request.status); } }, [request]);

  const handleStatusChange = async () => { if (id) { await updateStatus.mutateAsync({ id, data: { status } }); } };
  const handleAddNote = async () => { if (id && note.trim()) { await addNote.mutateAsync({ id, data: { notes: note } }); setNote(''); } };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (!request) return <Box sx={{ p: 3 }}><Typography>الطلب غير موجود</Typography></Box>;

  const statusColors: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = { new: 'error', in_review: 'warning', contacted: 'info', converted: 'success', closed: 'default' };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}><Button startIcon={<ArrowBack />} onClick={() => navigate('/website/contact-requests')}>رجوع</Button><Typography variant="h4">{t('details.title')}</Typography></Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">{request.name}</Typography>
              <Chip label={t(`status.${request.status}`)} color={statusColors[request.status]} />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2" color="text.secondary">الهاتف</Typography><Typography>{request.phone}</Typography></Grid>
              <Grid size={{ xs: 12, md: 6 }}>{request.email && (<><Typography variant="body2" color="text.secondary">البريد الإلكتروني</Typography><Typography>{request.email}</Typography></>)}</Grid>
              <Grid size={{ xs: 12, md: 6 }}>{request.city && (<><Typography variant="body2" color="text.secondary">المدينة</Typography><Typography>{request.city}</Typography></>)}</Grid>
              <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2" color="text.secondary">نوع الطلب</Typography><Typography>{t(`requestTypes.${request.requestType}`)}</Typography></Grid>
              <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2" color="text.secondary">المصدر</Typography><Typography>{request.source}</Typography></Grid>
              <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2" color="text.secondary">تاريخ الإرسال</Typography><Typography>{formatDate(request.createdAt)}</Typography></Grid>
            </Grid>
            {request.subject && (<Box mt={2}><Typography variant="body2" color="text.secondary">الموضوع</Typography><Typography fontWeight="medium">{request.subject}</Typography></Box>)}
            <Box mt={2}><Typography variant="body2" color="text.secondary">الرسالة</Typography><Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{request.message}</Typography></Box>
            {request.notes && (<Box mt={2}><Typography variant="body2" color="text.secondary">ملاحظات</Typography><Typography sx={{ mt: 1, whiteSpace: 'pre-wrap', bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>{request.notes}</Typography></Box>)}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>{t('details.updateStatus')}</Typography>
            <TextField fullWidth select value={status} onChange={(e) => setStatus(e.target.value as RequestStatus)} margin="normal" size="small">
              {STATUSES.map((s) => (<MenuItem key={s} value={s}>{t(`status.${s}`)}</MenuItem>))}
            </TextField>
            <Button fullWidth variant="contained" startIcon={<Save />} onClick={handleStatusChange} disabled={updateStatus.isPending || status === request.status} sx={{ mt: 2 }}>تحديث</Button>
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>{t('details.addNote')}</Typography>
            <TextField fullWidth multiline rows={3} value={note} onChange={(e) => setNote(e.target.value)} margin="normal" size="small" placeholder="أضف ملاحظة داخلية..." />
            <Button fullWidth variant="contained" onClick={handleAddNote} disabled={addNote.isPending || !note.trim()} sx={{ mt: 2 }}>{t('actions.addNote')}</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

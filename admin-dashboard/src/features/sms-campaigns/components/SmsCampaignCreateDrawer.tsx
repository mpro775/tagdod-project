import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormLabel,
  LinearProgress,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Calculate, PlayArrow, Preview, Send, Sms } from '@mui/icons-material';
import type { SmsCampaignPreview, SmsCampaignTarget } from '../types/smsCampaign.types';
import { calculateSmsSegments } from '../utils/smsSegments';
import { targetLabels } from './smsCampaignLabels';
import {
  useCreateSmsCampaign,
  usePreviewSmsCampaign,
  useSendTestSms,
} from '../hooks/useSmsCampaigns';

interface Props {
  open: boolean;
  onClose: () => void;
}

const targetOptions: SmsCampaignTarget[] = [
  'all',
  'customers',
  'engineers',
  'merchants',
  'admins',
  'custom',
];

export const SmsCampaignCreateDrawer: React.FC<Props> = ({ open, onClose }) => {
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [target, setTarget] = React.useState<SmsCampaignTarget>('customers');
  const [city, setCity] = React.useState('');
  const [customUserIdsText, setCustomUserIdsText] = React.useState('');
  const [preview, setPreview] = React.useState<SmsCampaignPreview | null>(null);
  const [testDialogOpen, setTestDialogOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [testPhone, setTestPhone] = React.useState('');

  const previewMutation = usePreviewSmsCampaign();
  const sendTestMutation = useSendTestSms();
  const createMutation = useCreateSmsCampaign();
  const segments = calculateSmsSegments(message);
  const customUserIds = customUserIdsText
    .split(/[\s,]+/)
    .map((id) => id.trim())
    .filter(Boolean);

  const payload = {
    message,
    target,
    filters: city ? { city } : undefined,
    customUserIds: target === 'custom' ? customUserIds : undefined,
  };

  const handlePreview = async () => {
    const result = await previewMutation.mutateAsync(payload);
    setPreview(result);
  };

  const handleSendTest = async () => {
    await sendTestMutation.mutateAsync({ phone: testPhone, message });
    setTestDialogOpen(false);
  };

  const handleCreate = async () => {
    await createMutation.mutateAsync({ ...payload, title, confirmSend: true });
    setConfirmOpen(false);
    onClose();
    setTitle('');
    setMessage('');
    setPreview(null);
  };

  const canPreview = message.trim().length > 0 && (target !== 'custom' || customUserIds.length > 0);
  const canCreate = title.trim().length >= 2 && preview && preview.validRecipients > 0;

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', md: 560 } } }}>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
            <Sms color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={800}>
                إنشاء حملة SMS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                رسالة جماعية عبر مزود الأوائل مع تتبع لكل مستلم
              </Typography>
            </Box>
          </Stack>

          {(previewMutation.isPending || createMutation.isPending) && <LinearProgress sx={{ mb: 2 }} />}

          <Stack spacing={2.25}>
            <TextField label="عنوان الحملة" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
            <TextField
              label="نص الرسالة"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setPreview(null);
              }}
              fullWidth
              multiline
              minRows={5}
              inputProps={{ maxLength: 1000 }}
            />
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                الأحرف: {segments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                الترميز: {segments.encoding}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                الأجزاء: {segments.segments}
              </Typography>
            </Stack>
            {segments.length > 500 && <Alert severity="warning">الرسالة أطول من الحد الافتراضي للحملات.</Alert>}

            <Divider />

            <FormControl>
              <FormLabel>الجمهور</FormLabel>
              <RadioGroup
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value as SmsCampaignTarget);
                  setPreview(null);
                }}
              >
                {targetOptions.map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={targetLabels[option]} />
                ))}
              </RadioGroup>
            </FormControl>

            <TextField
              label="فلتر المدينة"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPreview(null);
              }}
              fullWidth
              select
            >
              <MenuItem value="">كل المدن</MenuItem>
              {['صنعاء', 'عدن', 'تعز', 'إب', 'الحديدة', 'حضرموت'].map((item) => (
                <MenuItem value={item} key={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>

            {target === 'custom' && (
              <TextField
                label="معرفات المستخدمين"
                value={customUserIdsText}
                onChange={(e) => {
                  setCustomUserIdsText(e.target.value);
                  setPreview(null);
                }}
                helperText="افصل المعرفات بفاصلة أو سطر جديد"
                fullWidth
                multiline
                minRows={3}
              />
            )}

            <Button
              variant="outlined"
              startIcon={<Preview />}
              onClick={handlePreview}
              disabled={!canPreview || previewMutation.isPending}
            >
              معاينة الجمهور
            </Button>

            {preview && (
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                <Stack spacing={1}>
                  <Typography fontWeight={800}>نتيجة المعاينة</Typography>
                  <Typography variant="body2">مطابقون: {preview.totalMatchedUsers}</Typography>
                  <Typography variant="body2">أرقام صالحة: {preview.validRecipients}</Typography>
                  <Typography variant="body2">أرقام غير صالحة: {preview.invalidRecipients}</Typography>
                  <Typography variant="body2">أرقام مكررة: {preview.duplicatePhones}</Typography>
                  <Typography variant="body2">أجزاء الرسالة لكل مستخدم: {preview.segmentsPerMessage}</Typography>
                  <Typography variant="body2">إجمالي SMS Parts المتوقع: {preview.estimatedTotalSmsParts}</Typography>
                </Stack>
              </Box>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<Send />}
                onClick={() => setTestDialogOpen(true)}
                disabled={!message.trim()}
                fullWidth
              >
                إرسال رسالة اختبار
              </Button>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => setConfirmOpen(true)}
                disabled={!canCreate || createMutation.isPending}
                fullWidth
              >
                بدء الحملة
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>

      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>إرسال رسالة اختبار</DialogTitle>
        <DialogContent>
          <TextField
            label="رقم الهاتف"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>إلغاء</Button>
          <Button startIcon={<Calculate />} onClick={handleSendTest} disabled={!testPhone || sendTestMutation.isPending}>
            إرسال
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>تأكيد إرسال حملة SMS</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 1 }}>
            سيتم إرسال الرسالة إلى {preview?.validRecipients ?? 0} رقم. إجمالي أجزاء SMS المتوقع:{' '}
            {preview?.estimatedTotalSmsParts ?? 0}. لا يمكن التراجع عن الرسائل التي تم إرسالها فعلاً.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>إلغاء</Button>
          <Button color="warning" variant="contained" onClick={handleCreate} disabled={createMutation.isPending}>
            نعم، ابدأ الإرسال
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

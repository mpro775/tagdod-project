import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Divider,
  Link,
  Paper,
} from '@mui/material';
import { CheckCircle, Cancel, Description, Store, Person } from '@mui/icons-material';
import { useVerificationDetails, useApproveVerification, useRejectVerification } from '../hooks/useUsers';
import type { VerificationRequest } from '../types/user.types';

interface VerificationRequestDialogProps {
  open: boolean;
  onClose: () => void;
  request: VerificationRequest | null;
}

export const VerificationRequestDialog: React.FC<VerificationRequestDialogProps> = ({
  open,
  onClose,
  request,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data: details, isLoading: loadingDetails } = useVerificationDetails(
    request?.id || ''
  );

  const approveMutation = useApproveVerification();
  const rejectMutation = useRejectVerification();

  const handleApprove = () => {
    if (request?.id) {
      approveMutation.mutate(request.id, {
        onSuccess: () => {
          onClose();
          setShowRejectForm(false);
          setRejectReason('');
        },
      });
    }
  };

  const handleReject = () => {
    if (request?.id) {
      rejectMutation.mutate(
        {
          userId: request.id,
          data: rejectReason ? { reason: rejectReason } : undefined,
        },
        {
          onSuccess: () => {
            onClose();
            setShowRejectForm(false);
            setRejectReason('');
          },
        }
      );
    }
  };

  const isLoading = loadingDetails || approveMutation.isPending || rejectMutation.isPending;
  const verificationData = details || request;

  const isEngineer = verificationData?.verificationType === 'engineer';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          {isEngineer ? (
            <Person color="primary" />
          ) : (
            <Store color="primary" />
          )}
          <Typography variant="h6">
            {isEngineer ? 'مراجعة طلب تحقق مهندس' : 'مراجعة طلب تحقق تاجر'}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* معلومات المستخدم */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                معلومات المستخدم
              </Typography>
              <Stack spacing={1} mt={1}>
                <Typography>
                  <strong>الاسم:</strong> {verificationData?.firstName} {verificationData?.lastName}
                </Typography>
                <Typography>
                  <strong>رقم الهاتف:</strong> {verificationData?.phone}
                </Typography>
                {isEngineer && details?.jobTitle && (
                  <Typography>
                    <strong>المسمى الوظيفي:</strong> {details.jobTitle}
                  </Typography>
                )}
                <Chip
                  label={isEngineer ? 'مهندس' : 'تاجر'}
                  color={isEngineer ? 'primary' : 'secondary'}
                  size="small"
                />
              </Stack>
            </Paper>

            {/* الملفات المرفوعة */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                الوثائق المرفوعة
              </Typography>
              <Stack spacing={2} mt={1}>
                {isEngineer ? (
                  verificationData?.cvFileUrl ? (
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <Description color="primary" />
                        <Typography variant="body2" fontWeight="medium">
                          السيرة الذاتية
                        </Typography>
                      </Stack>
                      <Link
                        href={verificationData.cvFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
                      >
                        <Button variant="outlined" size="small" startIcon={<Description />}>
                          عرض السيرة الذاتية
                        </Button>
                      </Link>
                    </Box>
                  ) : (
                    <Typography color="error">لا يوجد ملف سيرة ذاتية</Typography>
                  )
                ) : (
                  <>
                    {verificationData?.storePhotoUrl && (
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                          <Store color="primary" />
                          <Typography variant="body2" fontWeight="medium">
                            صورة المحل
                          </Typography>
                        </Stack>
                        <Box
                          component="img"
                          src={verificationData.storePhotoUrl}
                          alt="صورة المحل"
                          sx={{
                            maxWidth: '100%',
                            maxHeight: 300,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                        <Link
                          href={verificationData.storePhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ display: 'block', mt: 1 }}
                        >
                          <Button variant="outlined" size="small">
                            فتح الصورة في نافذة جديدة
                          </Button>
                        </Link>
                      </Box>
                    )}
                    {verificationData?.storeName && (
                      <Typography>
                        <strong>اسم المحل:</strong> {verificationData.storeName}
                      </Typography>
                    )}
                  </>
                )}
              </Stack>
            </Paper>

            {/* الملاحظات */}
            {verificationData?.verificationNote && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  ملاحظات المستخدم
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                  {verificationData.verificationNote}
                </Typography>
              </Paper>
            )}

            {/* نموذج الرفض */}
            {showRejectForm && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(211, 47, 47, 0.1)' }}>
                <Typography variant="subtitle2" gutterBottom color="error">
                  سبب الرفض (اختياري)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="أدخل سبب الرفض (اختياري)..."
                  sx={{ mt: 1 }}
                />
              </Paper>
            )}

            <Divider />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          إلغاء
        </Button>
        {!showRejectForm ? (
          <>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => setShowRejectForm(true)}
              disabled={isLoading}
            >
              رفض
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleApprove}
              disabled={isLoading}
            >
              موافقة
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => {
                setShowRejectForm(false);
                setRejectReason('');
              }}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Cancel />}
              onClick={handleReject}
              disabled={isLoading}
            >
              تأكيد الرفض
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};


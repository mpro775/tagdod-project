import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Box,
  Grid,
  Paper,
  Alert,
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  Person as UserIcon,
  Security as ShieldIcon,
  Warning as AlertTriangleIcon,
  VpnKey as KeyIcon,
  Storage as DatabaseIcon,
  Monitor as MonitorIcon,
  Language as GlobeIcon,
  Description as FileTextIcon,
  Timeline as ActivityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  AuditLog,
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_LABELS,
  AUDIT_ACTION_SEVERITY,
} from '../types/audit.types';

interface AuditLogDetailsProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogDetails: React.FC<AuditLogDetailsProps> = ({ log, isOpen, onClose }) => {
  if (!log) return null;

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ar });
    } catch {
      return timestamp;
    }
  };

  const formatJsonData = (data: any) => {
    if (!data) return null;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' },
      }}
    >
      <DialogContent sx={{ overflow: 'auto' }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldIcon />
          تفاصيل سجل التدقيق
        </DialogTitle>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ActivityIcon />
                المعلومات الأساسية
              </Typography>
            </CardHeader>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ClockIcon color="action" />
                    <Typography variant="body2" fontWeight="medium">
                      الوقت:
                    </Typography>
                  </Box>
                  <Typography variant="body2">{formatTimestamp(log.timestamp)}</Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <KeyIcon color="action" />
                    <Typography variant="body2" fontWeight="medium">
                      نوع العملية:
                    </Typography>
                  </Box>
                  <Chip
                    label={AUDIT_ACTION_LABELS[log.action]}
                    color="primary"
                    variant="outlined"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DatabaseIcon color="action" />
                    <Typography variant="body2" fontWeight="medium">
                      نوع المورد:
                    </Typography>
                  </Box>
                  <Chip
                    label={AUDIT_RESOURCE_LABELS[log.resource]}
                    color="secondary"
                    variant="outlined"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AlertTriangleIcon color="action" />
                    <Typography variant="body2" fontWeight="medium">
                      مستوى الخطورة:
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      AUDIT_ACTION_SEVERITY[log.action] === 'critical'
                        ? 'حرج'
                        : AUDIT_ACTION_SEVERITY[log.action] === 'high'
                        ? 'عالي'
                        : AUDIT_ACTION_SEVERITY[log.action] === 'medium'
                        ? 'متوسط'
                        : 'منخفض'
                    }
                    color={
                      AUDIT_ACTION_SEVERITY[log.action] === 'critical'
                        ? 'error'
                        : AUDIT_ACTION_SEVERITY[log.action] === 'high'
                        ? 'warning'
                        : AUDIT_ACTION_SEVERITY[log.action] === 'medium'
                        ? 'info'
                        : 'default'
                    }
                    variant="filled"
                  />
                </Grid>
              </Grid>

              {log.resourceId && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    معرف المورد:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="body2" fontFamily="monospace">
                      {log.resourceId}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {log.reason && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    السبب:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="body2">{log.reason}</Typography>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UserIcon />
                معلومات المستخدم
              </Typography>
            </CardHeader>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    المستخدم المتأثر:
                  </Typography>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {log.user?.name || 'غير معروف'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {log.user?.email}
                    </Typography>
                    {log.user?.phone && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {log.user.phone}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {log.performedByUser && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                      من قام بالعملية:
                    </Typography>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {log.performedByUser.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {log.performedByUser.email}
                      </Typography>
                      {log.performedByUser.phone && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {log.performedByUser.phone}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Technical Information */}
          <Card>
            <CardHeader>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MonitorIcon />
                المعلومات التقنية
              </Typography>
            </CardHeader>
            <CardContent>
              <Grid container spacing={2}>
                {log.ipAddress && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <GlobeIcon color="action" />
                      <Typography variant="body2" fontWeight="medium">
                        عنوان IP:
                      </Typography>
                    </Box>
                    <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {log.ipAddress}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {log.sessionId && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                      معرف الجلسة:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {log.sessionId}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>

              {log.userAgent && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    متصفح المستخدم:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {log.userAgent}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Data Changes */}
          {(log.oldValues || log.newValues) && (
            <Card>
              <CardHeader>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileTextIcon />
                  تغييرات البيانات
                </Typography>
              </CardHeader>
              <CardContent>
                {log.oldValues && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                      القيم القديمة:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.100', overflow: 'auto' }}>
                      <Typography variant="caption" component="pre" fontFamily="monospace">
                        {formatJsonData(log.oldValues)}
                      </Typography>
                    </Paper>
                  </Box>
                )}

                {log.newValues && (
                  <Box>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                      القيم الجديدة:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.100', overflow: 'auto' }}>
                      <Typography variant="caption" component="pre" fontFamily="monospace">
                        {formatJsonData(log.newValues)}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {log.metadata && (
            <Card>
              <CardHeader>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DatabaseIcon />
                  البيانات الإضافية
                </Typography>
              </CardHeader>
              <CardContent>
                <Paper sx={{ p: 2, bgcolor: 'grey.100', overflow: 'auto' }}>
                  <Typography variant="caption" component="pre" fontFamily="monospace">
                    {formatJsonData(log.metadata)}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          )}

          {/* Sensitivity Warning */}
          {log.isSensitive && (
            <Alert
              severity="warning"
              icon={<AlertTriangleIcon />}
              sx={{
                border: '1px solid',
                borderColor: 'error.main',
                bgcolor: 'error.light',
                color: 'error.dark',
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                تحذير: عملية حساسة
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                هذه العملية تحتوي على معلومات حساسة وتتطلب مراجعة إضافية.
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

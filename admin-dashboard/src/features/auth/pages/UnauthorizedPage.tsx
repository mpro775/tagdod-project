import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Security, Home, ArrowBack, ContactSupport } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCreateSupportTicket } from '@/features/support/hooks/useSupport';
import { SupportCategory, SupportPriority } from '@/features/support/types/support.types';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Support ticket dialog state
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [supportTicket, setSupportTicket] = useState({
    title: '',
    description: '',
    category: SupportCategory.ACCOUNT,
    priority: SupportPriority.MEDIUM,
  });

  // API hook
  const createSupportTicket = useCreateSupportTicket();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleContactAdmin = () => {
    setContactDialogOpen(true);
  };

  const handleCloseContactDialog = () => {
    setContactDialogOpen(false);
    setSupportTicket({
      title: '',
      description: '',
      category: SupportCategory.ACCOUNT,
      priority: SupportPriority.MEDIUM,
    });
  };

  const handleSubmitSupportTicket = async () => {
    if (!supportTicket.title.trim() || !supportTicket.description.trim()) {
      alert('يرجى ملء العنوان والوصف');
      return;
    }

    try {
      await createSupportTicket.mutateAsync({
        ...supportTicket,
        metadata: {
          userId: user?._id,
          userName: user ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
          userEmail: user?.email,
          userRoles: user?.roles,
          accessAttempt: {
            path: location.pathname,
            timestamp: new Date().toISOString(),
          },
        },
      });

      handleCloseContactDialog();
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 3,
        backgroundColor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 6,
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Security
          sx={{
            fontSize: 80,
            color: 'error.main',
            mb: 3,
          }}
        />

        <Typography variant="h4" component="h1" gutterBottom color="error">
          الوصول غير مسموح
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          عذراً، ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة
        </Typography>

        {user && (
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>المستخدم الحالي:</strong> {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.email}
            </Typography>
            <Typography variant="body2">
              <strong>الأدوار:</strong> {user.roles?.join(', ') || 'غير محدد'}
            </Typography>
            {user.permissions && (
              <Typography variant="body2">
                <strong>الصلاحيات:</strong> {user.permissions.join(', ')}
              </Typography>
            )}
          </Alert>
        )}

        <Alert severity="warning" sx={{ mb: 4, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>سبب الرفض:</strong>
          </Typography>
          <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>قد تحتاج إلى صلاحيات إدارية أعلى</li>
            <li>قد تكون الصفحة مخصصة لأدوار معينة فقط</li>
            <li>قد تكون جلسة المستخدم منتهية الصلاحية</li>
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleGoHome}
            size="large"
          >
            العودة للرئيسية
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            size="large"
          >
            العودة للصفحة السابقة
          </Button>

          <Button
            variant="text"
            startIcon={<ContactSupport />}
            onClick={handleContactAdmin}
            size="large"
          >
            التواصل مع الإدارة
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مدير النظام
        </Typography>
      </Paper>

      {/* Contact Admin Dialog */}
      <Dialog
        open={contactDialogOpen}
        onClose={handleCloseContactDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ContactSupport color="primary" />
            <Typography variant="h6">التواصل مع الإدارة</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            يرجى وصف المشكلة التي تواجهها. سيتم إرسال هذا الطلب إلى فريق الدعم الفني.
          </Typography>

          <TextField
            fullWidth
            label="عنوان المشكلة *"
            placeholder="مثال: لا أستطيع الوصول إلى صفحة المنتجات"
            value={supportTicket.title}
            onChange={(e) => setSupportTicket(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="وصف المشكلة *"
            placeholder="يرجى وصف المشكلة بالتفصيل..."
            value={supportTicket.description}
            onChange={(e) => setSupportTicket(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>تصنيف المشكلة</InputLabel>
              <Select
                value={supportTicket.category}
                label="تصنيف المشكلة"
                onChange={(e) => setSupportTicket(prev => ({
                  ...prev,
                  category: e.target.value as SupportCategory
                }))}
              >
                <MenuItem value={SupportCategory.ACCOUNT}>حساب المستخدم</MenuItem>
                <MenuItem value={SupportCategory.TECHNICAL}>مشاكل فنية</MenuItem>
                <MenuItem value={SupportCategory.PRODUCTS}>المنتجات</MenuItem>
                <MenuItem value={SupportCategory.BILLING}>الفوترة والدفع</MenuItem>
                <MenuItem value={SupportCategory.SERVICES}>الخدمات</MenuItem>
                <MenuItem value={SupportCategory.OTHER}>أخرى</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>أولوية المشكلة</InputLabel>
              <Select
                value={supportTicket.priority}
                label="أولوية المشكلة"
                onChange={(e) => setSupportTicket(prev => ({
                  ...prev,
                  priority: e.target.value as SupportPriority
                }))}
              >
                <MenuItem value={SupportPriority.LOW}>منخفضة</MenuItem>
                <MenuItem value={SupportPriority.MEDIUM}>متوسطة</MenuItem>
                <MenuItem value={SupportPriority.HIGH}>عالية</MenuItem>
                <MenuItem value={SupportPriority.URGENT}>عاجلة</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {user && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                سيتم تضمين معلومات حسابك (الاسم والبريد الإلكتروني) مع الطلب لمساعدة فريق الدعم.
              </Typography>
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseContactDialog} color="inherit">
            إلغاء
          </Button>
          <Button
            onClick={handleSubmitSupportTicket}
            variant="contained"
            disabled={createSupportTicket.isPending}
            startIcon={createSupportTicket.isPending ? <CircularProgress size={16} /> : null}
          >
            {createSupportTicket.isPending ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnauthorizedPage;
import React from 'react';
import { Box, Typography, Button, Alert, Paper } from '@mui/material';
import { Security, Home, ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleContactAdmin = () => {
    // TODO: Implement contact admin functionality
    console.log('Contact admin requested');
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
              <strong>المستخدم الحالي:</strong> {user.name || user.email}
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
    </Box>
  );
};

export default UnauthorizedPage;
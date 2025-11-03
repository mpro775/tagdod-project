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
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Security, Home, ArrowBack, ContactSupport } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useCreateSupportTicket } from '@/features/support/hooks/useSupport';
import { SupportCategory, SupportPriority } from '@/features/support/types/support.types';
import toast from 'react-hot-toast';

const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
      toast.error(t('unauthorized.contactDialog.fillRequired'));
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
          p: { xs: 3, sm: 4, md: 6 },
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Security
          sx={{
            fontSize: { xs: 60, sm: 80 },
            color: 'error.main',
            mb: { xs: 2, sm: 3 },
          }}
        />

        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          color="error"
          sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}
        >
          {t('unauthorized.title')}
        </Typography>

        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          {t('unauthorized.description')}
        </Typography>

        {user && (
          <Alert severity="info" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
              <strong>{t('unauthorized.currentUser')}:</strong> {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.email}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
              <strong>{t('unauthorized.roles')}:</strong> {user.roles?.join(', ') || t('unauthorized.notSpecified')}
            </Typography>
            {user.permissions && (
              <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                <strong>{t('unauthorized.permissions')}:</strong> {user.permissions.join(', ')}
              </Typography>
            )}
          </Alert>
        )}

        <Alert severity="warning" sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'left' }}>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
            <strong>{t('unauthorized.rejectionReasons')}:</strong>
          </Typography>
          <Typography 
            variant="body2" 
            component="ul" 
            sx={{ 
              mt: 1, 
              pl: 2,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            }}
          >
            <li>{t('unauthorized.reason1')}</li>
            <li>{t('unauthorized.reason2')}</li>
            <li>{t('unauthorized.reason3')}</li>
          </Typography>
        </Alert>

        <Box 
          sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 }, 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleGoHome}
            size={isMobile ? 'medium' : 'large'}
            fullWidth={isMobile}
          >
            {t('unauthorized.goHome')}
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            size={isMobile ? 'medium' : 'large'}
            fullWidth={isMobile}
          >
            {t('unauthorized.goBack')}
          </Button>

          <Button
            variant="text"
            startIcon={<ContactSupport />}
            onClick={handleContactAdmin}
            size={isMobile ? 'medium' : 'large'}
            fullWidth={isMobile}
          >
            {t('unauthorized.contactAdmin')}
          </Button>
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mt: { xs: 3, sm: 4 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            px: { xs: 2, sm: 0 },
          }}
        >
          {t('unauthorized.errorNote')}
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
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {t('unauthorized.contactDialog.title')}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            }}
          >
            {t('unauthorized.contactDialog.description')}
          </Typography>

          <TextField
            fullWidth
            label={t('unauthorized.contactDialog.problemTitle')}
            placeholder={t('unauthorized.contactDialog.problemTitlePlaceholder')}
            value={supportTicket.title}
            onChange={(e) => setSupportTicket(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
            size={isMobile ? 'small' : 'medium'}
          />

          <TextField
            fullWidth
            multiline
            rows={isMobile ? 3 : 4}
            label={t('unauthorized.contactDialog.problemDescription')}
            placeholder={t('unauthorized.contactDialog.problemDescriptionPlaceholder')}
            value={supportTicket.description}
            onChange={(e) => setSupportTicket(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
            size={isMobile ? 'small' : 'medium'}
          />

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
              <InputLabel>{t('unauthorized.contactDialog.problemCategory')}</InputLabel>
              <Select
                value={supportTicket.category}
                label={t('unauthorized.contactDialog.problemCategory')}
                onChange={(e) => setSupportTicket(prev => ({
                  ...prev,
                  category: e.target.value as SupportCategory
                }))}
              >
                <MenuItem value={SupportCategory.ACCOUNT}>{t('unauthorized.categories.account')}</MenuItem>
                <MenuItem value={SupportCategory.TECHNICAL}>{t('unauthorized.categories.technical')}</MenuItem>
                <MenuItem value={SupportCategory.PRODUCTS}>{t('unauthorized.categories.products')}</MenuItem>
                <MenuItem value={SupportCategory.BILLING}>{t('unauthorized.categories.billing')}</MenuItem>
                <MenuItem value={SupportCategory.SERVICES}>{t('unauthorized.categories.services')}</MenuItem>
                <MenuItem value={SupportCategory.OTHER}>{t('unauthorized.categories.other')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
              <InputLabel>{t('unauthorized.contactDialog.priority')}</InputLabel>
              <Select
                value={supportTicket.priority}
                label={t('unauthorized.contactDialog.priority')}
                onChange={(e) => setSupportTicket(prev => ({
                  ...prev,
                  priority: e.target.value as SupportPriority
                }))}
              >
                <MenuItem value={SupportPriority.LOW}>{t('unauthorized.priorities.low')}</MenuItem>
                <MenuItem value={SupportPriority.MEDIUM}>{t('unauthorized.priorities.medium')}</MenuItem>
                <MenuItem value={SupportPriority.HIGH}>{t('unauthorized.priorities.high')}</MenuItem>
                <MenuItem value={SupportPriority.URGENT}>{t('unauthorized.priorities.urgent')}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {user && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                {t('unauthorized.contactDialog.accountInfo')}
              </Typography>
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Button 
            onClick={handleCloseContactDialog} 
            color="inherit"
            size={isMobile ? 'medium' : 'large'}
          >
            {t('unauthorized.contactDialog.cancel')}
          </Button>
          <Button
            onClick={handleSubmitSupportTicket}
            variant="contained"
            disabled={createSupportTicket.isPending}
            startIcon={createSupportTicket.isPending ? <CircularProgress size={16} /> : null}
            size={isMobile ? 'medium' : 'large'}
          >
            {createSupportTicket.isPending 
              ? t('unauthorized.contactDialog.sending') 
              : t('unauthorized.contactDialog.send')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnauthorizedPage;
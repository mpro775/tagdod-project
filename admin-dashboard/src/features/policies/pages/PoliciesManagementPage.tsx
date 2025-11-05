import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  TextField,
  Stack,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Divider,
  Chip,
} from '@mui/material';
import {
  Save,
  Visibility,
  Description,
  Security,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { PolicyEditor } from '../components/PolicyEditor';
import { PolicyPreview } from '../components/PolicyPreview';
import { usePolicy, useUpdatePolicy, useTogglePolicy } from '../hooks/usePolicies';
import { PolicyType } from '../types/policy.types';

export const PoliciesManagementPage: React.FC = () => {
  const { t } = useTranslation('policies');
  const theme = useTheme();
  const { isMobile, isTablet } = useBreakpoint();

  const [policyTab, setPolicyTab] = useState(0); // Terms or Privacy
  const [languageTab, setLanguageTab] = useState(0); // Arabic or English
  const [previewOpen, setPreviewOpen] = useState(false);

  const currentPolicyType = policyTab === 0 ? PolicyType.TERMS : PolicyType.PRIVACY;

  const { data: policy, isLoading, error, refetch } = usePolicy(currentPolicyType);
  const updateMutation = useUpdatePolicy();
  const toggleMutation = useTogglePolicy();

  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    contentAr: '',
    contentEn: '',
    isActive: true,
  });

  useEffect(() => {
    if (policy) {
      setFormData({
        titleAr: policy.titleAr || '',
        titleEn: policy.titleEn || '',
        contentAr: policy.contentAr || '',
        contentEn: policy.contentEn || '',
        isActive: policy.isActive,
      });
    }
  }, [policy]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        type: currentPolicyType,
        data: formData,
      });
      refetch();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleToggle = async (isActive: boolean) => {
    try {
      await toggleMutation.mutateAsync({
        type: currentPolicyType,
        data: { isActive },
      });
      setFormData((prev) => ({ ...prev, isActive }));
      refetch();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: { xs: 300, md: 400 },
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography color="error" variant={isMobile ? 'body2' : 'body1'}>
          {t('errors.loadFailed')}
        </Typography>
      </Box>
    );
  }

  if (!policy) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant={isMobile ? 'body2' : 'body1'} color="text.secondary">
          {t('errors.notFound')}
        </Typography>
      </Box>
    );
  }

  const currentTitle = languageTab === 0 ? formData.titleAr : formData.titleEn;
  const currentContent = languageTab === 0 ? formData.contentAr : formData.contentEn;
  const currentLanguage = languageTab === 0 ? 'ar' : 'en';

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography
          variant={isMobile ? 'h5' : isTablet ? 'h4' : 'h4'}
          fontWeight="bold"
          gutterBottom
          sx={{ color: theme.palette.text.primary }}
        >
          {t('title')}
        </Typography>
        <Typography
          variant={isMobile ? 'body2' : 'body2'}
          color="text.secondary"
          sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
        >
          {t('subtitle')}
        </Typography>
      </Box>

      {/* Policy Type Tabs */}
      <Paper
        elevation={0}
        sx={{
          mb: { xs: 2, md: 3 },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={policyTab}
          onChange={(_, newValue) => {
            setPolicyTab(newValue);
            setLanguageTab(0);
          }}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              minHeight: isMobile ? 64 : 48,
              fontSize: isMobile ? '0.875rem' : undefined,
              '& .MuiSvgIcon-root': {
                fontSize: isMobile ? '1.25rem' : undefined,
              },
            },
          }}
        >
          <Tab
            icon={<Description />}
            iconPosition={isMobile ? 'top' : 'start'}
            label={t('tabs.terms')}
          />
          <Tab
            icon={<Security />}
            iconPosition={isMobile ? 'top' : 'start'}
            label={t('tabs.privacy')}
          />
        </Tabs>
      </Paper>

      {/* Main Content */}
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5, md: 4 },
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Status and Actions */}
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={2}
          sx={{ mb: { xs: 2, md: 3 } }}
          justifyContent="space-between"
          alignItems={isMobile ? 'stretch' : 'center'}
        >
          <Box sx={{ width: isMobile ? '100%' : 'auto' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleToggle(e.target.checked)}
                  disabled={toggleMutation.isPending}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.success.main,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: theme.palette.success.main,
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography
                    variant={isMobile ? 'body2' : 'body1'}
                    fontWeight="medium"
                    sx={{ color: theme.palette.text.primary }}
                  >
                    {t('status.active')}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                  >
                    {formData.isActive ? t('status.activeDesc') : t('status.inactiveDesc')}
                  </Typography>
                </Box>
              }
              sx={{ m: 0 }}
            />
            {formData.isActive && (
              <Chip
                label={t('status.published')}
                color="success"
                size={isMobile ? 'small' : 'small'}
                sx={{
                  ml: { xs: 1, md: 2 },
                  mt: { xs: 1, md: 0 },
                  fontSize: isMobile ? '0.7rem' : undefined,
                  height: isMobile ? '20px' : undefined,
                }}
              />
            )}
          </Box>

          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={isMobile ? 1.5 : 2}
            sx={{ width: isMobile ? '100%' : 'auto' }}
          >
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={handlePreview}
              disabled={!currentContent.trim()}
              fullWidth={isMobile}
              size={isMobile ? 'medium' : 'medium'}
              sx={{
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              {t('actions.preview')}
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={updateMutation.isPending}
              fullWidth={isMobile}
              size={isMobile ? 'medium' : 'medium'}
            >
              {updateMutation.isPending ? t('actions.saving') : t('actions.save')}
            </Button>
          </Stack>
        </Stack>

        <Divider
          sx={{
            mb: { xs: 2, md: 3 },
            borderColor: theme.palette.divider,
          }}
        />

        {/* Language Tabs */}
        <Paper
          elevation={0}
          sx={{
            mb: { xs: 2, md: 3 },
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs
            value={languageTab}
            onChange={(_, newValue) => setLanguageTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontSize: isMobile ? '0.875rem' : undefined,
                minHeight: isMobile ? 48 : 48,
              },
            }}
          >
            <Tab label={t('language.arabic')} />
            <Tab label={t('language.english')} />
          </Tabs>
        </Paper>

        {/* Form Content */}
        <Stack spacing={{ xs: 2, md: 3 }}>
          {/* Title */}
          <TextField
            fullWidth
            label={t('form.title')}
            value={currentTitle}
            onChange={(e) => {
              if (languageTab === 0) {
                setFormData((prev) => ({ ...prev, titleAr: e.target.value }));
              } else {
                setFormData((prev) => ({ ...prev, titleEn: e.target.value }));
              }
            }}
            placeholder={
              languageTab === 0 ? t('form.titleArPlaceholder') : t('form.titleEnPlaceholder')
            }
            size={isMobile ? 'small' : 'medium'}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
                '& fieldset': {
                  borderColor: theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.text.secondary,
                '&.Mui-focused': {
                  color: theme.palette.primary.main,
                },
              },
            }}
          />

          {/* Content Editor */}
          <PolicyEditor
            value={currentContent}
            onChange={(value) => {
              if (languageTab === 0) {
                setFormData((prev) => ({ ...prev, contentAr: value }));
              } else {
                setFormData((prev) => ({ ...prev, contentEn: value }));
              }
            }}
            label={t('form.content')}
            placeholder={
              languageTab === 0
                ? t('form.contentArPlaceholder')
                : t('form.contentEnPlaceholder')
            }
            minHeight={isMobile ? 300 : isTablet ? 350 : 400}
          />
        </Stack>
      </Paper>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            ...(isMobile && {
              height: '100%',
              maxHeight: '100%',
            }),
          },
        }}
      >
        <DialogTitle
          sx={{
            color: theme.palette.text.primary,
            fontSize: isMobile ? '1.125rem' : undefined,
            pb: { xs: 1, md: 2 },
          }}
        >
          {t('preview.title')}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            bgcolor: theme.palette.background.paper,
            borderColor: theme.palette.divider,
            p: { xs: 2, md: 3 },
          }}
        >
          <PolicyPreview
            title={currentTitle}
            content={currentContent}
            language={currentLanguage}
          />
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 1.5, md: 2 },
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            onClick={() => setPreviewOpen(false)}
            variant={isMobile ? 'text' : 'outlined'}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'medium'}
            sx={{
              ...(isMobile && {
                color: theme.palette.text.primary,
              }),
            }}
          >
            {t('preview.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

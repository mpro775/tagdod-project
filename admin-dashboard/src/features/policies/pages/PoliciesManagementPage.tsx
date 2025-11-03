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
  useMediaQuery,
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
import { toast } from 'react-hot-toast';
import { PolicyEditor } from '../components/PolicyEditor';
import { PolicyPreview } from '../components/PolicyPreview';
import { usePolicy, useUpdatePolicy, useTogglePolicy } from '../hooks/usePolicies';
import { PolicyType } from '../types/policy.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`policy-tabpanel-${index}`}
      aria-labelledby={`policy-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const PoliciesManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          {t('policies.errors.loadFailed', 'فشل تحميل السياسة')}
        </Typography>
      </Box>
    );
  }

  if (!policy) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>
          {t('policies.errors.notFound', 'السياسة غير موجودة')}
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
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" gutterBottom>
          {t('policies.title', 'إدارة السياسات')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('policies.subtitle', 'إدارة سياسة الأحكام والشروط وسياسة الخصوصية')}
        </Typography>
      </Box>

      {/* Policy Type Tabs */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
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
        >
          <Tab
            icon={<Description />}
            iconPosition={isMobile ? 'top' : 'start'}
            label={t('policies.tabs.terms', 'الأحكام والشروط')}
          />
          <Tab
            icon={<Security />}
            iconPosition={isMobile ? 'top' : 'start'}
            label={t('policies.tabs.privacy', 'سياسة الخصوصية')}
          />
        </Tabs>
      </Paper>

      {/* Main Content */}
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: 'background.paper' }}>
        {/* Status and Actions */}
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={2}
          sx={{ mb: 3 }}
          justifyContent="space-between"
          alignItems={isMobile ? 'stretch' : 'center'}
        >
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleToggle(e.target.checked)}
                  disabled={toggleMutation.isPending}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {t('policies.status.active', 'نشط')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.isActive
                      ? t('policies.status.activeDesc', 'السياسة نشطة ومتاحة للعموم')
                      : t('policies.status.inactiveDesc', 'السياسة غير نشطة')}
                  </Typography>
                </Box>
              }
            />
            {formData.isActive && (
              <Chip
                label={t('policies.status.published', 'منشور')}
                color="success"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={handlePreview}
              disabled={!currentContent.trim()}
            >
              {t('policies.actions.preview', 'معاينة')}
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending
                ? t('policies.actions.saving', 'جاري الحفظ...')
                : t('policies.actions.save', 'حفظ')}
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Language Tabs */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs
            value={languageTab}
            onChange={(_, newValue) => setLanguageTab(newValue)}
            variant="fullWidth"
          >
            <Tab label={t('policies.language.arabic', 'العربية')} />
            <Tab label={t('policies.language.english', 'English')} />
          </Tabs>
        </Paper>

        {/* Form Content */}
        <Stack spacing={3}>
          {/* Title */}
          <TextField
            fullWidth
            label={t('policies.form.title', 'العنوان')}
            value={currentTitle}
            onChange={(e) => {
              if (languageTab === 0) {
                setFormData((prev) => ({ ...prev, titleAr: e.target.value }));
              } else {
                setFormData((prev) => ({ ...prev, titleEn: e.target.value }));
              }
            }}
            placeholder={
              languageTab === 0
                ? t('policies.form.titleArPlaceholder', 'أدخل العنوان بالعربية')
                : t('policies.form.titleEnPlaceholder', 'Enter title in English')
            }
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
            label={t('policies.form.content', 'المحتوى')}
            placeholder={
              languageTab === 0
                ? t('policies.form.contentArPlaceholder', 'أدخل المحتوى بالعربية...')
                : t('policies.form.contentEnPlaceholder', 'Enter content in English...')
            }
            minHeight={400}
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
      >
        <DialogTitle>
          {t('policies.preview.title', 'معاينة السياسة')}
        </DialogTitle>
        <DialogContent dividers>
          <PolicyPreview
            title={currentTitle}
            content={currentContent}
            language={currentLanguage}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            {t('policies.preview.close', 'إغلاق')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

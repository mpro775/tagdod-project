import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Stack,
  FormControlLabel,
  Switch,
  TextField,
  Grid,
  useTheme,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PageShell, PageHeader, usePageTitle } from '@/shared/design-system';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  useLandingSettings,
  useUpdateLandingSettings,
  useCreateLandingSettings,
  useToggleLandingPublish,
} from '../hooks/useLandingSettings';
import type { LandingSettings } from '../types/landing-settings.types';

const getEmptyFormState = (): LandingSettings => ({
  heroTitleAr: '',
  heroTitleEn: '',
  heroSubtitleAr: '',
  heroSubtitleEn: '',
  heroImage: '',
  heroVideo: '',
  primaryCtaTextAr: '',
  primaryCtaTextEn: '',
  primaryCtaUrl: '',
  secondaryCtaTextAr: '',
  secondaryCtaTextEn: '',
  secondaryCtaUrl: '',
  appStoreUrl: '',
  playStoreUrl: '',
  enableAboutSection: true,
  enableStatsSection: true,
  enableFeaturesSection: true,
  enableProductsSection: true,
  enableProjectsSection: true,
  enableBrandsSection: true,
  enableArticlesSection: true,
  enableContactSection: true,
  enableServiceCenterSection: true,
  sectionOrder: [],
  isPublished: false,
});

export const LandingSettingsPage: React.FC = () => {
  const { t } = useTranslation('landingSettings');
  const pageTitle = t('title', 'إعدادات صفحة الهبوط');
  usePageTitle(pageTitle);
  const theme = useTheme();
  const { isMobile } = useBreakpoint();

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<LandingSettings>(getEmptyFormState());

  const { data: settings, isLoading, refetch } = useLandingSettings();
  const updateMutation = useUpdateLandingSettings();
  const createMutation = useCreateLandingSettings();
  const toggleMutation = useToggleLandingPublish();

  const isSaving = updateMutation.isPending || createMutation.isPending;
  const hasSettings = Boolean(settings);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    } else {
      setFormData(getEmptyFormState());
    }
  }, [settings]);

  const handleFieldChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (hasSettings) {
        await updateMutation.mutateAsync(formData);
      } else {
        await createMutation.mutateAsync(formData);
      }
      refetch();
    } catch {
      // Error handled by hook
    }
  };

  const handleTogglePublish = async () => {
    try {
      await toggleMutation.mutateAsync();
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const tabs = [
    { label: t('tabs.hero') },
    { label: t('tabs.cta') },
    { label: t('tabs.sections') },
    { label: t('tabs.app') },
  ];

  return (
    <PageShell fullHeight>
      <PageHeader
        title={pageTitle}
        description="إعدادات صفحة الهبوط"
        breadcrumbs={[
          { label: 'لوحة التحكم', to: '/dashboard' },
          { label: pageTitle },
        ]}
      />
    <Box sx={{ p: { xs: 2, sm: 3, md: 3 } }}>

      <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublished}
                  onChange={() => handleTogglePublish()}
                  disabled={toggleMutation.isPending}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: theme.palette.success.main },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: theme.palette.success.main },
                  }}
                />
              }
              label={
                <Typography variant="body1" fontWeight="medium">
                  {formData.isPublished ? t('status.published') : t('status.draft')}
                </Typography>
              }
            />
          </Box>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={isSaving} fullWidth={isMobile}>
            {isSaving ? t('actions.saving') : t('actions.save')}
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant={isMobile ? 'scrollable' : 'standard'} scrollButtons="auto">
          {tabs.map((tab, i) => (
            <Tab key={i} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label={t('hero.titleAr')} value={formData.heroTitleAr || ''} onChange={(e) => handleFieldChange('heroTitleAr', e.target.value)} margin="normal" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label={t('hero.titleEn')} value={formData.heroTitleEn || ''} onChange={(e) => handleFieldChange('heroTitleEn', e.target.value)} margin="normal" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label={t('hero.subtitleAr')} value={formData.heroSubtitleAr || ''} onChange={(e) => handleFieldChange('heroSubtitleAr', e.target.value)} margin="normal" multiline rows={2} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label={t('hero.subtitleEn')} value={formData.heroSubtitleEn || ''} onChange={(e) => handleFieldChange('heroSubtitleEn', e.target.value)} margin="normal" multiline rows={2} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label={t('hero.image')} value={formData.heroImage || ''} onChange={(e) => handleFieldChange('heroImage', e.target.value)} margin="normal" placeholder="https://..." />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label={t('hero.video')} value={formData.heroVideo || ''} onChange={(e) => handleFieldChange('heroVideo', e.target.value)} margin="normal" placeholder="https://..." />
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label={t('cta.primaryTextAr')} value={formData.primaryCtaTextAr || ''} onChange={(e) => handleFieldChange('primaryCtaTextAr', e.target.value)} margin="normal" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label={t('cta.primaryUrl')} value={formData.primaryCtaUrl || ''} onChange={(e) => handleFieldChange('primaryCtaUrl', e.target.value)} margin="normal" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label={t('cta.secondaryTextAr')} value={formData.secondaryCtaTextAr || ''} onChange={(e) => handleFieldChange('secondaryCtaTextAr', e.target.value)} margin="normal" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label={t('cta.secondaryUrl')} value={formData.secondaryCtaUrl || ''} onChange={(e) => handleFieldChange('secondaryCtaUrl', e.target.value)} margin="normal" />
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={2}>
            {[
              { key: 'enableAboutSection', label: t('sections.about') },
              { key: 'enableStatsSection', label: t('sections.stats') },
              { key: 'enableFeaturesSection', label: t('sections.features') },
              { key: 'enableProductsSection', label: t('sections.products') },
              { key: 'enableProjectsSection', label: t('sections.projects') },
              { key: 'enableBrandsSection', label: t('sections.brands') },
              { key: 'enableArticlesSection', label: t('sections.articles') },
              { key: 'enableContactSection', label: t('sections.contact') },
              { key: 'enableServiceCenterSection', label: t('sections.serviceCenter') },
            ].map(({ key, label }) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
                <FormControlLabel
                  control={
                    <Switch checked={formData[key as keyof LandingSettings] as boolean} onChange={(e) => handleFieldChange(key, e.target.checked)} />
                  }
                  label={label}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label={t('app.appStoreUrl')} value={formData.appStoreUrl || ''} onChange={(e) => handleFieldChange('appStoreUrl', e.target.value)} margin="normal" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label={t('app.playStoreUrl')} value={formData.playStoreUrl || ''} onChange={(e) => handleFieldChange('playStoreUrl', e.target.value)} margin="normal" />
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
    </PageShell>
  );
};

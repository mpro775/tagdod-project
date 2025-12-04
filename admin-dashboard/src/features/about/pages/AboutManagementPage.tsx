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
  Chip,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Save,
  Info,
  Star,
  People,
  TrendingUp,
  ContactMail,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  AboutGeneralSection,
  AboutValuesSection,
  AboutStatsSection,
  AboutTeamSection,
  AboutContactSection,
} from '../components';
import { useAbout, useCreateAbout, useUpdateAbout, useToggleAbout } from '../hooks/useAbout';
import type { ValueItem, StatItem, TeamMember, ContactInfo } from '../types/about.types';

interface AboutFormState {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  heroImage: string;
  visionAr: string;
  visionEn: string;
  missionAr: string;
  missionEn: string;
  storyAr: string;
  storyEn: string;
  values: ValueItem[];
  teamMembers: TeamMember[];
  stats: StatItem[];
  contactInfo: ContactInfo;
  isActive: boolean;
}

const getEmptyFormState = (): AboutFormState => ({
  titleAr: '',
  titleEn: '',
  descriptionAr: '',
  descriptionEn: '',
  heroImage: '',
  visionAr: '',
  visionEn: '',
  missionAr: '',
  missionEn: '',
  storyAr: '',
  storyEn: '',
  values: [],
  teamMembers: [],
  stats: [],
  contactInfo: {
    addressAr: '',
    addressEn: '',
    phone: '',
    email: '',
    workingHoursAr: '',
    workingHoursEn: '',
    socialLinks: {},
  },
  isActive: true,
});

export const AboutManagementPage: React.FC = () => {
  const { t } = useTranslation('about');
  const theme = useTheme();
  const { isMobile, isTablet } = useBreakpoint();

  const [activeTab, setActiveTab] = useState(0);
  const [languageTab, setLanguageTab] = useState(0);
  const [formData, setFormData] = useState<AboutFormState>(getEmptyFormState);

  const { data: about, isLoading, error, refetch } = useAbout();
  const createMutation = useCreateAbout();
  const updateMutation = useUpdateAbout();
  const toggleMutation = useToggleAbout();

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isNewAbout = about === null;
  const hasAbout = Boolean(about);

  const currentLanguage = languageTab === 0 ? 'ar' : 'en';

  // Populate form when data loads
  useEffect(() => {
    if (about) {
      setFormData({
        titleAr: about.titleAr || '',
        titleEn: about.titleEn || '',
        descriptionAr: about.descriptionAr || '',
        descriptionEn: about.descriptionEn || '',
        heroImage: about.heroImage || '',
        visionAr: about.visionAr || '',
        visionEn: about.visionEn || '',
        missionAr: about.missionAr || '',
        missionEn: about.missionEn || '',
        storyAr: about.storyAr || '',
        storyEn: about.storyEn || '',
        values: about.values || [],
        teamMembers: about.teamMembers || [],
        stats: about.stats || [],
        contactInfo: about.contactInfo || getEmptyFormState().contactInfo,
        isActive: about.isActive,
      });
    } else if (about === null) {
      setFormData(getEmptyFormState());
    }
  }, [about]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleValuesChange = (values: ValueItem[]) => {
    setFormData((prev) => ({ ...prev, values }));
  };

  const handleStatsChange = (stats: StatItem[]) => {
    setFormData((prev) => ({ ...prev, stats }));
  };

  const handleTeamChange = (teamMembers: TeamMember[]) => {
    setFormData((prev) => ({ ...prev, teamMembers }));
  };

  const handleContactChange = (contactInfo: ContactInfo) => {
    setFormData((prev) => ({ ...prev, contactInfo }));
  };

  const handleSave = async () => {
    try {
      if (hasAbout) {
        await updateMutation.mutateAsync(formData);
      } else {
        await createMutation.mutateAsync(formData);
      }
      await refetch();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleToggle = async (isActive: boolean) => {
    try {
      if (!hasAbout) {
        setFormData((prev) => ({ ...prev, isActive }));
        return;
      }
      await toggleMutation.mutateAsync({ isActive });
      setFormData((prev) => ({ ...prev, isActive }));
      refetch();
    } catch (error) {
      // Error is handled by the hook
    }
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
          {t('messages.loadError')}
        </Typography>
      </Box>
    );
  }

  const tabs = [
    { icon: <Info />, label: t('tabs.general') },
    { icon: <Star />, label: t('tabs.values') },
    { icon: <People />, label: t('tabs.team') },
    { icon: <TrendingUp />, label: t('tabs.stats') },
    { icon: <ContactMail />, label: t('tabs.contact') },
  ];

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

      {/* Status and Actions */}
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          mb: { xs: 2, md: 3 },
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {isNewAbout && (
          <Alert
            severity="info"
            sx={{
              mb: { xs: 2, md: 3 },
              border: `1px solid ${theme.palette.info.light}`,
            }}
          >
            <Typography variant={isMobile ? 'body2' : 'body1'} fontWeight={500}>
              {t('empty.title')}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              {t('empty.description')}
            </Typography>
          </Alert>
        )}

        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={2}
          justifyContent="space-between"
          alignItems={isMobile ? 'stretch' : 'center'}
        >
          <Box sx={{ width: isMobile ? '100%' : 'auto' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleToggle(e.target.checked)}
                  disabled={toggleMutation.isPending || isSaving}
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
                    {isNewAbout
                      ? t('status.notCreated')
                      : formData.isActive
                      ? t('status.active')
                      : t('status.inactive')}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                  >
                    {isNewAbout
                      ? t('status.notCreatedDesc')
                      : formData.isActive
                      ? t('status.activeDesc')
                      : t('status.inactiveDesc')}
                  </Typography>
                </Box>
              }
              sx={{ m: 0 }}
            />
            {hasAbout && (
              <Chip
                label={formData.isActive ? t('status.published') : t('status.draft')}
                color={formData.isActive ? 'success' : 'warning'}
                size="small"
                sx={{
                  ml: { xs: 1, md: 2 },
                  mt: { xs: 1, md: 0 },
                  fontSize: isMobile ? '0.7rem' : undefined,
                  height: isMobile ? '20px' : undefined,
                }}
              />
            )}
          </Box>

          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={isSaving}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'medium'}
          >
            {isSaving ? t('actions.saving') : t('actions.save')}
          </Button>
        </Stack>
      </Paper>

      {/* Main Tabs */}
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
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              minHeight: isMobile ? 64 : 48,
              fontSize: isMobile ? '0.75rem' : undefined,
              '& .MuiSvgIcon-root': {
                fontSize: isMobile ? '1.25rem' : undefined,
              },
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              iconPosition={isMobile ? 'top' : 'start'}
              label={tab.label}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Language Tabs (for General tab only) */}
      {activeTab === 0 && (
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
      )}

      {/* Tab Content */}
      <Box sx={{ minHeight: 400 }}>
        {activeTab === 0 && (
          <AboutGeneralSection
            data={formData}
            language={currentLanguage}
            onChange={handleFieldChange}
            disabled={isSaving}
          />
        )}

        {activeTab === 1 && (
          <AboutValuesSection
            values={formData.values}
            language={currentLanguage}
            onChange={handleValuesChange}
            disabled={isSaving}
          />
        )}

        {activeTab === 2 && (
          <AboutTeamSection
            teamMembers={formData.teamMembers}
            language={currentLanguage}
            onChange={handleTeamChange}
            disabled={isSaving}
          />
        )}

        {activeTab === 3 && (
          <AboutStatsSection
            stats={formData.stats}
            language={currentLanguage}
            onChange={handleStatsChange}
            disabled={isSaving}
          />
        )}

        {activeTab === 4 && (
          <AboutContactSection
            contactInfo={formData.contactInfo}
            onChange={handleContactChange}
            disabled={isSaving}
          />
        )}
      </Box>
    </Box>
  );
};


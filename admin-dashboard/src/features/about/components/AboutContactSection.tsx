import React from 'react';
import { TextField, Stack, Typography, Paper, Grid, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import type { ContactInfo, SocialLinks } from '../types/about.types';

interface AboutContactSectionProps {
  contactInfo: ContactInfo | undefined;
  onChange: (contactInfo: ContactInfo) => void;
  disabled?: boolean;
}

export const AboutContactSection: React.FC<AboutContactSectionProps> = ({
  contactInfo,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation('about');
  const { isMobile } = useBreakpoint();

  const data: ContactInfo = contactInfo || {
    addressAr: '',
    addressEn: '',
    phone: '',
    email: '',
    workingHoursAr: '',
    workingHoursEn: '',
    socialLinks: {},
  };

  const handleFieldChange = (field: keyof ContactInfo, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleSocialChange = (field: keyof SocialLinks, value: string) => {
    onChange({
      ...data,
      socialLinks: {
        ...data.socialLinks,
        [field]: value,
      },
    });
  };

  return (
    <Stack spacing={3}>
      {/* معلومات الاتصال الأساسية */}
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" gutterBottom>
          {t('sections.contactBasic')}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label={t('fields.addressAr')}
              value={data.addressAr || ''}
              onChange={(e) => handleFieldChange('addressAr', e.target.value)}
              disabled={disabled}
              dir="rtl"
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label={t('fields.addressEn')}
              value={data.addressEn || ''}
              onChange={(e) => handleFieldChange('addressEn', e.target.value)}
              disabled={disabled}
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('fields.phone')}
              value={data.phone || ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              disabled={disabled}
              placeholder="+966xxxxxxxxx"
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('fields.email')}
              type="email"
              value={data.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              disabled={disabled}
              placeholder="info@example.com"
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('fields.workingHoursAr')}
              value={data.workingHoursAr || ''}
              onChange={(e) => handleFieldChange('workingHoursAr', e.target.value)}
              disabled={disabled}
              dir="rtl"
              placeholder={t('placeholders.workingHoursAr')}
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('fields.workingHoursEn')}
              value={data.workingHoursEn || ''}
              onChange={(e) => handleFieldChange('workingHoursEn', e.target.value)}
              disabled={disabled}
              placeholder={t('placeholders.workingHoursEn')}
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* روابط التواصل الاجتماعي */}
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" gutterBottom>
          {t('sections.socialLinks')}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Facebook"
              value={data.socialLinks?.facebook || ''}
              onChange={(e) => handleSocialChange('facebook', e.target.value)}
              disabled={disabled}
              placeholder="https://facebook.com/..."
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Twitter / X"
              value={data.socialLinks?.twitter || ''}
              onChange={(e) => handleSocialChange('twitter', e.target.value)}
              disabled={disabled}
              placeholder="https://twitter.com/..."
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Instagram"
              value={data.socialLinks?.instagram || ''}
              onChange={(e) => handleSocialChange('instagram', e.target.value)}
              disabled={disabled}
              placeholder="https://instagram.com/..."
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="LinkedIn"
              value={data.socialLinks?.linkedin || ''}
              onChange={(e) => handleSocialChange('linkedin', e.target.value)}
              disabled={disabled}
              placeholder="https://linkedin.com/company/..."
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="YouTube"
              value={data.socialLinks?.youtube || ''}
              onChange={(e) => handleSocialChange('youtube', e.target.value)}
              disabled={disabled}
              placeholder="https://youtube.com/..."
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="WhatsApp"
              value={data.socialLinks?.whatsapp || ''}
              onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
              disabled={disabled}
              placeholder="+966xxxxxxxxx"
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="TikTok"
              value={data.socialLinks?.tiktok || ''}
              onChange={(e) => handleSocialChange('tiktok', e.target.value)}
              disabled={disabled}
              placeholder="https://tiktok.com/@..."
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
};

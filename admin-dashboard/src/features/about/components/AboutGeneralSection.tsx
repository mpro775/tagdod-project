import React from 'react';
import {
  TextField,
  Stack,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import type { About } from '../types/about.types';

interface AboutGeneralSectionProps {
  data: Partial<About>;
  language: 'ar' | 'en';
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export const AboutGeneralSection: React.FC<AboutGeneralSectionProps> = ({
  data,
  language,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation('about');
  const { isMobile } = useBreakpoint();

  const isArabic = language === 'ar';

  return (
    <Stack spacing={3}>
      {/* النظرة العامة */}
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" gutterBottom>
          {t('sections.overview')}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Stack spacing={2}>
          <TextField
            fullWidth
            label={t('fields.title')}
            value={isArabic ? data.titleAr || '' : data.titleEn || ''}
            onChange={(e) => onChange(isArabic ? 'titleAr' : 'titleEn', e.target.value)}
            placeholder={isArabic ? t('placeholders.titleAr') : t('placeholders.titleEn')}
            size={isMobile ? 'small' : 'medium'}
            disabled={disabled}
            dir={isArabic ? 'rtl' : 'ltr'}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('fields.description')}
            value={isArabic ? data.descriptionAr || '' : data.descriptionEn || ''}
            onChange={(e) => onChange(isArabic ? 'descriptionAr' : 'descriptionEn', e.target.value)}
            placeholder={isArabic ? t('placeholders.descriptionAr') : t('placeholders.descriptionEn')}
            size={isMobile ? 'small' : 'medium'}
            disabled={disabled}
            dir={isArabic ? 'rtl' : 'ltr'}
          />

          <TextField
            fullWidth
            label={t('fields.heroImage')}
            value={data.heroImage || ''}
            onChange={(e) => onChange('heroImage', e.target.value)}
            placeholder={t('placeholders.heroImage')}
            size={isMobile ? 'small' : 'medium'}
            disabled={disabled}
            helperText={t('helpers.heroImage')}
          />
        </Stack>
      </Paper>

      {/* الرؤية */}
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" gutterBottom>
          {t('sections.vision')}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <TextField
          fullWidth
          multiline
          rows={3}
          label={t('fields.vision')}
          value={isArabic ? data.visionAr || '' : data.visionEn || ''}
          onChange={(e) => onChange(isArabic ? 'visionAr' : 'visionEn', e.target.value)}
          placeholder={isArabic ? t('placeholders.visionAr') : t('placeholders.visionEn')}
          size={isMobile ? 'small' : 'medium'}
          disabled={disabled}
          dir={isArabic ? 'rtl' : 'ltr'}
        />
      </Paper>

      {/* الرسالة */}
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" gutterBottom>
          {t('sections.mission')}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <TextField
          fullWidth
          multiline
          rows={3}
          label={t('fields.mission')}
          value={isArabic ? data.missionAr || '' : data.missionEn || ''}
          onChange={(e) => onChange(isArabic ? 'missionAr' : 'missionEn', e.target.value)}
          placeholder={isArabic ? t('placeholders.missionAr') : t('placeholders.missionEn')}
          size={isMobile ? 'small' : 'medium'}
          disabled={disabled}
          dir={isArabic ? 'rtl' : 'ltr'}
        />
      </Paper>

      {/* قصتنا */}
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" gutterBottom>
          {t('sections.story')}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <TextField
          fullWidth
          multiline
          rows={6}
          label={t('fields.story')}
          value={isArabic ? data.storyAr || '' : data.storyEn || ''}
          onChange={(e) => onChange(isArabic ? 'storyAr' : 'storyEn', e.target.value)}
          placeholder={isArabic ? t('placeholders.storyAr') : t('placeholders.storyEn')}
          size={isMobile ? 'small' : 'medium'}
          disabled={disabled}
          dir={isArabic ? 'rtl' : 'ltr'}
          helperText={t('helpers.story')}
        />
      </Paper>
    </Stack>
  );
};


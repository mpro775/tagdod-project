import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Link,
  Divider,
} from '@mui/material';
import {
  Work,
  School,
  Language,
  Download,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { EngineerProfileAdmin } from '@/features/users/types/user.types';

interface EngineerProfileInfoProps {
  profile: EngineerProfileAdmin;
}

export const EngineerProfileInfo: React.FC<EngineerProfileInfoProps> = ({ profile }) => {
  const { t } = useTranslation(['services', 'common']);

  return (
    <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('services:engineers.profileInfo', 'معلومات البروفايل')}
        </Typography>

        {/* Bio */}
        {profile.bio && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('services:engineers.bio', 'النبذة')}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {profile.bio}
            </Typography>
          </Box>
        )}

        {/* CV */}
        {profile.cvFileUrl && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('services:engineers.cv', 'السيرة الذاتية')}
            </Typography>
            <Link
              href={profile.cvFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
              }}
            >
              <Download fontSize="small" />
              <Typography variant="body2">{t('common:actions.download', 'تحميل')}</Typography>
            </Link>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Specialties */}
        {profile.specialties && profile.specialties.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Work fontSize="small" color="primary" />
              <Typography variant="subtitle2" color="text.secondary">
                {t('services:engineers.specialties', 'التخصصات')}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {profile.specialties.map((specialty, index) => (
                <Chip key={index} label={specialty} size="small" color="primary" variant="outlined" />
              ))}
            </Stack>
          </Box>
        )}

        {/* Years of Experience */}
        {profile.yearsOfExperience !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('services:engineers.yearsOfExperience', 'سنوات الخبرة')}
            </Typography>
            <Typography variant="body2">{profile.yearsOfExperience} {t('common:years', 'سنة')}</Typography>
          </Box>
        )}

        {/* Certifications */}
        {profile.certifications && profile.certifications.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <School fontSize="small" color="primary" />
              <Typography variant="subtitle2" color="text.secondary">
                {t('services:engineers.certifications', 'الشهادات')}
              </Typography>
            </Box>
            <Stack direction="column" spacing={0.5}>
              {profile.certifications.map((cert, index) => (
                <Typography key={index} variant="body2" sx={{ pl: 2 }}>
                  • {cert}
                </Typography>
              ))}
            </Stack>
          </Box>
        )}

        {/* Languages */}
        {profile.languages && profile.languages.length > 0 && (
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Language fontSize="small" color="primary" />
              <Typography variant="subtitle2" color="text.secondary">
                {t('services:engineers.languages', 'اللغات')}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {profile.languages.map((lang, index) => (
                <Chip key={index} label={lang} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};


import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Link,
  Button,
  useTheme,
  Paper,
} from '@mui/material';
import { Description, Store, Note } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { User } from '../types/user.types';
import { UserRole } from '../types/user.types';

interface VerificationFilesSectionProps {
  user: User;
}

export const VerificationFilesSection: React.FC<VerificationFilesSectionProps> = ({ user }) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();

  const hasEngineerFile = !!user.cvFileUrl;
  const hasMerchantFile = !!user.storePhotoUrl;
  const hasVerificationNote = !!user.verificationNote;
  const isEngineer =
    user.roles?.includes(UserRole.ENGINEER) ||
    user.capabilities?.engineer_capable ||
    user.capabilities?.engineer_status !== 'none';
  const isMerchant =
    user.roles?.includes(UserRole.MERCHANT) ||
    user.capabilities?.merchant_capable ||
    user.capabilities?.merchant_status !== 'none';

  // لا نعرض القسم إذا لم تكن هناك ملفات أو ملاحظات
  if (!hasEngineerFile && !hasMerchantFile && !hasVerificationNote) {
    return null;
  }

  return (
    <Grid size={{ xs: 12 }}>
      <Card
        sx={{
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 2,
            }}
          >
            {t('users:form.sections.verificationFiles', 'ملفات التحقق')}
          </Typography>

          <Stack spacing={3}>
            {/* ملف السيرة الذاتية للمهندس */}
            {isEngineer && hasEngineerFile && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Description color="primary" />
                    <Typography variant="subtitle2" fontWeight="medium">
                      {t('users:verification.cvFile', 'السيرة الذاتية للمهندس')}
                    </Typography>
                  </Stack>
                  <Box>
                    <Link
                      href={user.cvFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: 'none' }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Description />}
                        sx={{ mt: 1 }}
                      >
                        {t('users:verification.viewCv', 'عرض السيرة الذاتية')}
                      </Button>
                    </Link>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* صورة المحل للتاجر */}
            {isMerchant && hasMerchantFile && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Store color="primary" />
                    <Typography variant="subtitle2" fontWeight="medium">
                      {t('users:verification.storePhoto', 'صورة المحل')}
                    </Typography>
                  </Stack>
                  {user.storeName && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>{t('users:verification.storeName', 'اسم المحل:')}</strong>{' '}
                      {user.storeName}
                    </Typography>
                  )}
                  <Box>
                    <Box
                      component="img"
                      src={user.storePhotoUrl}
                      alt={t('users:verification.storePhoto', 'صورة المحل')}
                      sx={{
                        maxWidth: '100%',
                        maxHeight: 300,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 1,
                      }}
                    />
                    <Link
                      href={user.storePhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: 'none' }}
                    >
                      <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                        {t('users:verification.openImage', 'فتح الصورة في نافذة جديدة')}
                      </Button>
                    </Link>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* ملاحظة التحقق */}
            {hasVerificationNote && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Note color="primary" />
                    <Typography variant="subtitle2" fontWeight="medium">
                      {t('users:verification.note', 'ملاحظة التحقق')}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      whiteSpace: 'pre-wrap',
                      color: 'text.secondary',
                    }}
                  >
                    {user.verificationNote}
                  </Typography>
                </Stack>
              </Paper>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
};

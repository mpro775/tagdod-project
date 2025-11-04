import React from 'react';
import { Grid, Card, CardContent, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { YEMEN_CITIES } from '@/shared/constants/yemen-cities';
import { UserRole } from '../types/user.types';
import type { UserFormData } from '../schemas/userFormSchema';

interface UserBasicInfoSectionProps {
  isEditMode: boolean;
  primaryRole: UserRole;
  isAdminRole: boolean;
}

export const UserBasicInfoSection: React.FC<UserBasicInfoSectionProps> = ({
  isEditMode,
  primaryRole,
  isAdminRole,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            {t('users:form.sections.basicInfo', 'المعلومات الأساسية')}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormInput
                name="phone"
                label={t('users:form.fields.phone', 'رقم الهاتف *')}
                placeholder={t('users:form.placeholders.phone', '+967XXXXXXXXX')}
                disabled={isEditMode}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormInput
                name="firstName"
                label={t('users:form.fields.firstName', 'الاسم الأول')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormInput
                name="lastName"
                label={t('users:form.fields.lastName', 'الاسم الأخير')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormSelect
                name="gender"
                label={t('users:form.fields.gender', 'الجنس')}
                options={[
                  { value: 'male', label: t('users:form.gender.male', 'ذكر') },
                  { value: 'female', label: t('users:form.gender.female', 'أنثى') },
                  { value: 'other', label: t('users:form.gender.other', 'آخر') },
                ]}
              />
            </Grid>

            {/* المدينة - لجميع المستخدمين عدا الأدمن */}
            {!isAdminRole && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect
                  name="city"
                  label={t('users:form.fields.city', 'المدينة')}
                  options={YEMEN_CITIES}
                  helperText={
                    primaryRole === UserRole.ENGINEER
                      ? t('users:form.helpers.city.engineer', 'المدينة التي يعمل فيها المهندس')
                      : t('users:form.helpers.city.user', 'مدينة المستخدم')
                  }
                />
              </Grid>
            )}

            {!isEditMode && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormInput
                  name="password"
                  label={t('users:form.fields.password', 'كلمة المرور')}
                  type="password"
                  placeholder={t('users:form.placeholders.password', '8 أحرف على الأقل (اختياري)')}
                  helperText={t(
                    'users:form.helpers.password',
                    'إذا لم تُحدد، سيتم إنشاء كلمة مرور تلقائياً'
                  )}
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};


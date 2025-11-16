import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Grid,
  Alert,
  Avatar,
  Chip,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Save,
  Edit,
  Cancel,
  Person,
  Phone,
  Email,
  Badge,
  Security,
  AdminPanelSettings,
  Work,
  LocationOn,
  Refresh,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل').max(50, 'الاسم الأول يجب أن يكون أقل من 50 حرف'),
  lastName: z.string().min(2, 'الاسم الأخير يجب أن يكون حرفين على الأقل').max(50, 'الاسم الأخير يجب أن يكون أقل من 50 حرف').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
  jobTitle: z.string().max(100, 'المسمى الوظيفي يجب أن يكون أقل من 100 حرف').optional().or(z.literal('')),
  city: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'auth']);
  const { user, refreshProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'male',
      jobTitle: '',
      city: '',
    },
  });

  const { handleSubmit, reset, watch } = methods;
  const watchedValues = watch();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await authApi.getProfile();
      setProfileData(data);
      
      const formData: ProfileFormData = {
        firstName: data.user?.firstName || '',
        lastName: data.user?.lastName || '',
        gender: (data.user?.gender as 'male' | 'female' | 'other') || 'male',
        jobTitle: data.user?.jobTitle || '',
        city: data.user?.city || '',
      };
      
      reset(formData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل في تحميل بيانات الملف الشخصي';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const updateData: any = {};
      if (data.firstName) updateData.firstName = data.firstName;
      if (data.lastName) updateData.lastName = data.lastName;
      if (data.gender) updateData.gender = data.gender;
      if (data.jobTitle) updateData.jobTitle = data.jobTitle;
      if (data.city) updateData.city = data.city;

      await authApi.updateProfile(updateData);
      
      await refreshProfile();
      await loadProfile();
      
      setIsEditing(false);
      toast.success(t('common.profile_updated', 'تم تحديث الملف الشخصي بنجاح'));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل في تحديث الملف الشخصي';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      const formData: ProfileFormData = {
        firstName: profileData.user?.firstName || '',
        lastName: profileData.user?.lastName || '',
        gender: (profileData.user?.gender as 'male' | 'female' | 'other') || 'male',
        jobTitle: profileData.user?.jobTitle || '',
        city: profileData.user?.city || '',
      };
      reset(formData);
    }
    setIsEditing(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const profileUser = profileData?.user || user;
  const capabilities = profileData?.capabilities || {};

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          {t('common.profile', 'الملف الشخصي')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={loadProfile} color="primary" title={t('common.refresh', 'تحديث')}>
            <Refresh />
          </IconButton>
          {!isEditing && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
            >
              {t('common.edit', 'تعديل')}
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Profile Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: 'primary.main',
                        fontSize: '3rem',
                        mb: 2,
                      }}
                    >
                      {profileUser?.firstName?.[0]?.toUpperCase() || 'A'}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {profileUser?.firstName || ''} {profileUser?.lastName || ''}
                    </Typography>
                    {profileUser?.isAdmin && (
                      <Chip
                        icon={<AdminPanelSettings />}
                        label={t('common.admin', 'أدمن')}
                        color="primary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Roles */}
                  {profileUser?.roles && profileUser.roles.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {t('common.roles', 'الأدوار')}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {profileUser.roles.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            color={role.includes('admin') ? 'primary' : 'default'}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Capabilities */}
                  {(capabilities.engineer_capable || capabilities.merchant_capable || capabilities.admin_capable) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {t('common.capabilities', 'القدرات')}
                      </Typography>
                      <Stack direction="column" spacing={1}>
                        {capabilities.engineer_capable && (
                          <Chip
                            icon={<Work />}
                            label={t('common.engineer', 'مهندس')}
                            size="small"
                            color={capabilities.engineer_status === 'approved' ? 'success' : 'default'}
                          />
                        )}
                        {capabilities.merchant_capable && (
                          <Chip
                            icon={<Badge />}
                            label={t('common.merchant', 'تاجر')}
                            size="small"
                            color={capabilities.merchant_status === 'approved' ? 'success' : 'default'}
                          />
                        )}
                        {capabilities.admin_capable && (
                          <Chip
                            icon={<AdminPanelSettings />}
                            label={t('common.admin', 'أدمن')}
                            size="small"
                            color={capabilities.admin_status === 'approved' ? 'success' : 'default'}
                          />
                        )}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Form Card */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                    {t('common.personal_info', 'المعلومات الشخصية')}
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Phone (Read-only) */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('common.phone', 'رقم الهاتف')}
                        value={profileUser?.phone || ''}
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        disabled
                        variant="outlined"
                      />
                    </Grid>

                    {/* First Name */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('common.first_name', 'الاسم الأول')}
                        {...methods.register('firstName')}
                        error={!!methods.formState.errors.firstName}
                        helperText={methods.formState.errors.firstName?.message}
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        disabled={!isEditing}
                        required
                      />
                    </Grid>

                    {/* Last Name */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('common.last_name', 'الاسم الأخير')}
                        {...methods.register('lastName')}
                        error={!!methods.formState.errors.lastName}
                        helperText={methods.formState.errors.lastName?.message}
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        disabled={!isEditing}
                      />
                    </Grid>

                    {/* Gender */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label={t('common.gender', 'الجنس')}
                        {...methods.register('gender')}
                        error={!!methods.formState.errors.gender}
                        helperText={methods.formState.errors.gender?.message}
                        disabled={!isEditing}
                      >
                        <MenuItem value="male">{t('common.male', 'ذكر')}</MenuItem>
                        <MenuItem value="female">{t('common.female', 'أنثى')}</MenuItem>
                        <MenuItem value="other">{t('common.other', 'آخر')}</MenuItem>
                      </TextField>
                    </Grid>

                    {/* Job Title */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('common.job_title', 'المسمى الوظيفي')}
                        {...methods.register('jobTitle')}
                        error={!!methods.formState.errors.jobTitle}
                        helperText={methods.formState.errors.jobTitle?.message}
                        InputProps={{
                          startAdornment: <Work sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        disabled={!isEditing}
                      />
                    </Grid>

                    {/* City */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('common.city', 'المدينة')}
                        {...methods.register('city')}
                        error={!!methods.formState.errors.city}
                        helperText={methods.formState.errors.city?.message}
                        InputProps={{
                          startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        disabled={!isEditing}
                      />
                    </Grid>
                  </Grid>

                  {/* Action Buttons */}
                  {isEditing && (
                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        {t('common.cancel', 'إلغاء')}
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            {t('common.saving', 'جاري الحفظ...')}
                          </>
                        ) : (
                          t('common.save', 'حفظ')
                        )}
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Permissions Card */}
              {profileUser?.permissions && profileUser.permissions.length > 0 && (
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                      <Security sx={{ verticalAlign: 'middle', mr: 1 }} />
                      {t('common.permissions', 'الصلاحيات')}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {profileUser.permissions.map((permission) => (
                        <Chip
                          key={permission}
                          label={permission}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </Box>
  );
};


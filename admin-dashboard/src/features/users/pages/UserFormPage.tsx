import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Grid,
  Alert,
  useTheme,
  Chip,
} from '@mui/material';
import { Save, Cancel, AdminPanelSettings, LockReset, VerifiedUser, Store } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useUser, useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { UserRole, UserStatus, CapabilityStatus } from '../types/user.types';
import { useAuthStore } from '@/store/authStore';
import { createUserFormSchema, type UserFormData } from '../schemas/userFormSchema';
import { UserBasicInfoSection } from '../components/UserBasicInfoSection';
import { UserRolePermissionsSection } from '../components/UserRolePermissionsSection';
import { EngineerInfoSection } from '../components/EngineerInfoSection';
import { MerchantInfoSection } from '../components/MerchantInfoSection';
import { ResetPasswordDialog } from '../components/ResetPasswordDialog';
import { StatusControlDialog } from '../components/StatusControlDialog';
import { mapCityToArabic } from '@/shared/utils/cityMapper';
import '../styles/responsive-users.css';

export const UserFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const { hasPermission } = useAuthStore();
  const isEditMode = id !== 'new' && !!id;
  const [primaryRole, setPrimaryRole] = React.useState<UserRole>(UserRole.USER);
  
  // Dialog states
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [engineerStatusOpen, setEngineerStatusOpen] = useState(false);
  const [merchantStatusOpen, setMerchantStatusOpen] = useState(false);

  // Form
  const schema = createUserFormSchema(t);
  const methods = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: '',
      firstName: '',
      lastName: '',
      gender: 'male',
      jobTitle: '',
      city: t('users:form.defaultCity', 'صنعاء'),
      password: '',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      roles: [UserRole.USER],
      permissions: [],
      merchantDiscountPercent: undefined,
    },
  });

  // Check if selected role requires admin permissions
  const isAdminRole = () => {
    return primaryRole === UserRole.ADMIN || primaryRole === UserRole.SUPER_ADMIN;
  };

  // Can create super admin
  const canCreateSuperAdmin = hasPermission('super_admin:access');

  // Helper to get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case CapabilityStatus.APPROVED:
        return 'success';
      case CapabilityStatus.PENDING:
        return 'warning';
      case CapabilityStatus.REJECTED:
        return 'error';
      case CapabilityStatus.UNVERIFIED:
        return 'info';
      default:
        return 'default';
    }
  };

  // Helper to get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case CapabilityStatus.APPROVED:
        return t('users:status.approved', 'موافق عليه');
      case CapabilityStatus.PENDING:
        return t('users:status.pending', 'قيد المراجعة');
      case CapabilityStatus.REJECTED:
        return t('users:status.rejected', 'مرفوض');
      case CapabilityStatus.UNVERIFIED:
        return t('users:status.unverified', 'لم يتم التحقق');
      case CapabilityStatus.NONE:
        return t('users:status.none', 'غير مفعل');
      default:
        return status;
    }
  };

  // Handle primary role change
  const handlePrimaryRoleChange = (role: UserRole) => {
    setPrimaryRole(role);
    methods.setValue('role', role);
    methods.setValue('roles', [role]);

    // Clear permissions for non-admin roles
    if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
      methods.setValue('permissions', []);
    }
  };

  // API
  const { data: user, isLoading } = useUser(id!);
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const userCapabilities = user?.capabilities;

  // Load user data in edit mode
  useEffect(() => {
    if (isEditMode && user) {
      const userPrimaryRole = user.roles?.[0] || UserRole.USER;
      setPrimaryRole(userPrimaryRole as UserRole);

      const formData: UserFormData = {
        phone: user.phone || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender || 'male',
        jobTitle: user.jobTitle || '',
        city: mapCityToArabic(user.city),
        password: '',
        role: userPrimaryRole,
        status: user.status || UserStatus.ACTIVE,
        roles: user.roles || [UserRole.USER],
        permissions: user.permissions || [],
        merchantDiscountPercent:
          userCapabilities?.merchant_discount_percent ?? undefined,
      };

      methods.reset(formData);
    }
  }, [user, isEditMode, methods, t]);

  // Submit
  const onSubmit = (data: UserFormData) => {
    const userData: Record<string, any> = {
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      gender: data.gender || undefined,
      jobTitle: data.jobTitle || undefined,
      city: mapCityToArabic(data.city),
      password: data.password || undefined,
      roles: data.roles,
      permissions: data.permissions || [],
      status: data.status,
    };

    // Send phone only when creating
    if (!isEditMode) {
      userData.phone = data.phone;
    }

    // Handle capabilities based on user type
    const currentPrimaryRole = data.roles[0];
    if (currentPrimaryRole === UserRole.ENGINEER) {
      userData.capabilityRequest = 'engineer';
    } else if (currentPrimaryRole === UserRole.MERCHANT) {
      userData.capabilityRequest = 'merchant';
      if (
        data.merchantDiscountPercent !== undefined &&
        data.merchantDiscountPercent !== null
      ) {
        // Convert to number if it's a string
        userData.merchantDiscountPercent =
          typeof data.merchantDiscountPercent === 'string'
            ? parseFloat(data.merchantDiscountPercent)
            : data.merchantDiscountPercent;
      }
    }

    if (isEditMode) {
      updateUser(
        { id: id!, data: userData },
        {
          onSuccess: () => {
            // الانتقال بعد تأخير قصير للسماح برؤية Toast
            setTimeout(() => {
              navigate('/users');
            }, 1500);
          },
        }
      );
    } else {
      createUser(
        { ...userData, phone: userData.phone as string },
        {
          onSuccess: () => {
            // الانتقال بعد تأخير قصير للسماح برؤية Toast
            setTimeout(() => {
              navigate('/users');
            }, 1500);
          },
        }
      );
    }
  };

  if (isEditMode && isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        sx={{
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        bgcolor: 'background.default',
        minHeight: '100vh',
        pb: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: { xs: 2, sm: 3 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <AdminPanelSettings
              sx={{
                mr: 1,
                color: 'primary.main',
                fontSize: { xs: 28, sm: 32 },
              }}
            />
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                color: 'text.primary',
              }}
            >
              {isEditMode
                ? t('users:form.title.edit', 'تعديل المستخدم')
                : t('users:form.title.create', 'إضافة مستخدم أو أدمن جديد')}
            </Typography>
          </Box>
        </Box>

        <Alert
          severity="info"
          sx={{
            mb: { xs: 2, sm: 3 },
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(33, 150, 243, 0.1)'
                : undefined,
          }}
        >
          {t(
            'users:form.description',
            'يمكنك إنشاء أي نوع من المستخدمين: مستخدم عادي، مهندس، تاجر، أدمن، أو سوبر أدمن - كل ذلك من نموذج واحد موحد'
          )}
        </Alert>

        <Divider sx={{ my: { xs: 2, sm: 3 } }} />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Basic Information */}
              <UserBasicInfoSection
                isEditMode={isEditMode}
                primaryRole={primaryRole}
                isAdminRole={isAdminRole()}
              />

              {/* Roles and Permissions */}
              <Grid size={{ xs: 12 }}>
                <UserRolePermissionsSection
                  primaryRole={primaryRole}
                  onPrimaryRoleChange={handlePrimaryRoleChange}
                  isAdminRole={isAdminRole()}
                  canCreateSuperAdmin={canCreateSuperAdmin}
                />
              </Grid>

              {/* Job Title - Only for engineers */}
              {primaryRole === UserRole.ENGINEER && <EngineerInfoSection />}

              {/* Discount - Only for merchants */}
              {primaryRole === UserRole.MERCHANT && <MerchantInfoSection />}

              {/* Status Control Section - Only in Edit Mode */}
              {isEditMode && user && (
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: { xs: 2, sm: 3 } }} />
                  <Typography variant="h6" gutterBottom>
                    {t('users:sections.statusControl', 'إدارة الحالات والصلاحيات')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {/* Reset Password Button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<LockReset />}
                        onClick={() => setResetPasswordOpen(true)}
                        size="small"
                      >
                        {t('users:actions.resetPassword', 'إعادة تعيين كلمة المرور')}
                      </Button>
                    </Box>

                    {/* Engineer Status Control */}
                    {(userCapabilities?.engineer_capable ||
                      (userCapabilities?.engineer_status ?? CapabilityStatus.NONE) !== CapabilityStatus.NONE) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<VerifiedUser />}
                          onClick={() => setEngineerStatusOpen(true)}
                          size="small"
                        >
                          {t('users:actions.manageEngineerStatus', 'إدارة حالة المهندس')}
                        </Button>
                        <Chip
                          label={getStatusLabel(userCapabilities?.engineer_status || CapabilityStatus.NONE)}
                          color={getStatusColor(userCapabilities?.engineer_status || CapabilityStatus.NONE)}
                          size="small"
                        />
                      </Box>
                    )}

                    {/* Merchant Status Control */}
                    {(userCapabilities?.merchant_capable ||
                      (userCapabilities?.merchant_status ?? CapabilityStatus.NONE) !== CapabilityStatus.NONE) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<Store />}
                          onClick={() => setMerchantStatusOpen(true)}
                          size="small"
                        >
                          {t('users:actions.manageMerchantStatus', 'إدارة حالة التاجر')}
                        </Button>
                        <Chip
                          label={getStatusLabel(userCapabilities?.merchant_status || CapabilityStatus.NONE)}
                          color={getStatusColor(userCapabilities?.merchant_status || CapabilityStatus.NONE)}
                          size="small"
                        />
                        {userCapabilities?.merchant_discount_percent &&
                          userCapabilities.merchant_discount_percent > 0 && (
                          <Chip
                            label={`${userCapabilities.merchant_discount_percent}% ${t('users:labels.discount', 'خصم')}`}
                            color="success"
                            size="small"
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                </Grid>
              )}

              {/* Action Buttons */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                <Box
                  display="flex"
                  gap={2}
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={
                      isCreating || isUpdating ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <Save />
                      )
                    }
                    disabled={isCreating || isUpdating}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: { xs: 'auto', sm: 120 },
                      py: { xs: 1.5, sm: 1 },
                    }}
                  >
                    {isCreating || isUpdating
                      ? t('common:loading', 'جاري الحفظ...')
                      : t('common:actions.save', 'حفظ')}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/users')}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: { xs: 'auto', sm: 120 },
                      py: { xs: 1.5, sm: 1 },
                    }}
                  >
                    {t('common:actions.cancel', 'إلغاء')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </Paper>

      {/* Dialogs */}
      {isEditMode && user && (
        <>
          <ResetPasswordDialog
            open={resetPasswordOpen}
            onClose={() => setResetPasswordOpen(false)}
            userId={id!}
            userPhone={user.phone}
            userName={user.firstName || user.phone}
          />

          <StatusControlDialog
            open={engineerStatusOpen}
            onClose={() => setEngineerStatusOpen(false)}
            userId={id!}
            userName={user.firstName || user.phone}
            type="engineer"
            currentStatus={userCapabilities?.engineer_status || CapabilityStatus.NONE}
          />

          <StatusControlDialog
            open={merchantStatusOpen}
            onClose={() => setMerchantStatusOpen(false)}
            userId={id!}
            userName={user.firstName || user.phone}
            type="merchant"
            currentStatus={userCapabilities?.merchant_status || CapabilityStatus.NONE}
            currentDiscountPercent={userCapabilities?.merchant_discount_percent}
          />
        </>
      )}
    </Box>
  );
};

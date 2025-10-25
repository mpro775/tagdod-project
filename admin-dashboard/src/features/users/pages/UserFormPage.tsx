import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Paper, Typography, Button, Grid, Divider, CircularProgress } from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { useUser, useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { UserRole, UserStatus } from '../types/user.types';
import { UserRoleManager } from '../components/UserRoleManager';
import { UserCapabilitiesManager } from '../components/UserCapabilitiesManager';
import '../styles/responsive-users.css';

// Validation Schema
const userSchema = z.object({
  phone: z
    .string()
    .min(9, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل')
    .max(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأكثر')
    .regex(/^[0-9]+$/, 'رقم الهاتف يجب أن يحتوي على أرقام فقط'),
  firstName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional().or(z.literal('')),
  jobTitle: z.string().optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .optional()
    .or(z.literal('')),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus),
  roles: z.array(z.nativeEnum(UserRole)).min(1, 'يجب تحديد دور واحد على الأقل'),
  permissions: z.array(z.string()).optional(),
  wholesaleDiscountPercent: z.number().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;

  // Form
  const methods = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      phone: '',
      firstName: '',
      lastName: '',
      gender: 'male', // ذكر كاختيار افتراضي
      jobTitle: '',
      password: '',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      roles: [UserRole.USER],
      permissions: [],
      wholesaleDiscountPercent: undefined,
    },
  });

  // API
  const { data: user, isLoading } = useUser(id!);
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  // Debug: Log user data when it changes
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('🔄 User data changed:', user);
    // eslint-disable-next-line no-console
    console.log('🔄 Is loading:', isLoading);
    // eslint-disable-next-line no-console
    console.log('🔄 Is edit mode:', isEditMode);
  }, [user, isLoading, isEditMode]);

  // Load user data in edit mode
  useEffect(() => {
    if (isEditMode && user) {
      // eslint-disable-next-line no-console
      console.log('🔍 Loading user data:', user);
      // eslint-disable-next-line no-console
      console.log('📱 Phone:', user.phone);
      // eslint-disable-next-line no-console
      console.log('👤 First Name:', user.firstName);
      // eslint-disable-next-line no-console
      console.log('👤 Last Name:', user.lastName);
      // eslint-disable-next-line no-console
      console.log('🔑 Roles:', user.roles);
      // eslint-disable-next-line no-console
      console.log('📊 Status:', user.status);
      // eslint-disable-next-line no-console
      console.log('💼 Capabilities:', user.capabilities);

      const formData = {
        phone: user.phone || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender || 'male',
        jobTitle: user.jobTitle || '',
        password: '', // لا نحمل كلمة المرور في وضع التعديل
        role: user.roles?.[0] || UserRole.USER, // نأخذ الدور الأول فقط
        status: user.status || UserStatus.ACTIVE,
        roles: user.roles || [UserRole.USER],
        permissions: user.permissions || [],
        wholesaleDiscountPercent: user.capabilities?.wholesale_discount_percent || undefined,
      };

      // eslint-disable-next-line no-console
      console.log('📝 Form data to reset:', formData);
      methods.reset(formData);
    }
  }, [user, isEditMode, methods]);

  // Submit
  const onSubmit = (data: UserFormData) => {
    // eslint-disable-next-line no-console
    console.log('📤 User form data before submit:', data);

    const userData: Record<string, any> = {
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      gender: data.gender || undefined,
      jobTitle: data.jobTitle || undefined,
      password: data.password || undefined,
      roles: data.roles, // نرسل الأدوار كمصفوفة كما يتوقع الـ backend
      permissions: data.permissions || [],
      status: data.status,
    };

    // إرسال رقم الهاتف فقط عند الإنشاء (الباك لا يقبل phone في التحديث)
    if (!isEditMode) {
      userData.phone = data.phone;
    }

    // ربط القدرات حسب نوع المستخدم
    const primaryRole = data.roles[0];
    if (primaryRole === UserRole.ENGINEER) {
      userData.capabilityRequest = 'engineer';
    } else if (primaryRole === UserRole.MERCHANT) {
      userData.capabilityRequest = 'wholesale';
      if (data.wholesaleDiscountPercent !== undefined) {
        // Already transformed to number by zod
        userData.wholesaleDiscountPercent = data.wholesaleDiscountPercent;
      }
    }

    // eslint-disable-next-line no-console
    console.log('📤 User data to send:', userData);

    if (isEditMode) {
      updateUser(
        { id: id!, data: userData },
        {
          onSuccess: () => {
            navigate('/users');
          },
        }
      );
    } else {
      createUser(
        { ...userData, phone: userData.phone as string },
        {
          onSuccess: () => {
            navigate('/users');
          },
        }
      );
    }
  };

  if (isEditMode && isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          {isEditMode ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
        </Typography>

        <Divider sx={{ my: { xs: 2, sm: 3 } }} />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* الأدوار والصلاحيات - في الأعلى */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                  }}
                >
                  الأدوار والصلاحيات
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect
                  name="role"
                  label="الدور الرئيسي *"
                  options={[
                    { value: UserRole.USER, label: 'مستخدم' },
                    { value: UserRole.ENGINEER, label: 'مهندس' },
                    { value: UserRole.MERCHANT, label: 'تاجر' },
                    { value: UserRole.ADMIN, label: 'مدير' },
                    { value: UserRole.SUPER_ADMIN, label: 'مدير عام' },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect
                  name="status"
                  label="الحالة *"
                  options={[
                    { value: UserStatus.ACTIVE, label: 'نشط' },
                    { value: UserStatus.PENDING, label: 'قيد الانتظار' },
                    { value: UserStatus.SUSPENDED, label: 'معلق' },
                  ]}
                />
              </Grid>

              {/* إدارة الأدوار والصلاحيات */}
              <Grid size={{ xs: 12 }}>
                <UserRoleManager
                  roles={methods.watch('roles') || []}
                  permissions={methods.watch('permissions') || []}
                  onRolesChange={(roles) => methods.setValue('roles', roles)}
                  onPermissionsChange={(permissions) =>
                    methods.setValue('permissions', permissions)
                  }
                />
              </Grid>

              {/* إدارة القدرات */}
              <Grid size={{ xs: 12 }}>
                <UserCapabilitiesManager
                  role={methods.watch('role') || UserRole.USER}
                  capabilities={user?.capabilities}
                  onCapabilitiesChange={() => {
                    // يمكن إضافة منطق لتحديث القدرات هنا
                  }}
                />
              </Grid>

              {/* معلومات أساسية */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    mt: { xs: 1, sm: 2 },
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                  }}
                >
                  المعلومات الأساسية
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormInput
                  name="phone"
                  label="رقم الهاتف *"
                  placeholder="05XXXXXXXX"
                  disabled={isEditMode}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormInput name="firstName" label="الاسم الأول" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormInput name="lastName" label="الاسم الأخير" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect
                  name="gender"
                  label="الجنس"
                  options={[
                    { value: 'male', label: 'ذكر' },
                    { value: 'female', label: 'أنثى' },
                    { value: 'other', label: 'آخر' },
                  ]}
                />
              </Grid>

              {/* المسمى الوظيفي يظهر فقط للمهندس */}
              {(methods.watch('role') === UserRole.ENGINEER ||
                methods.watch('roles')?.includes(UserRole.ENGINEER)) && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="jobTitle"
                    label="المسمى الوظيفي"
                    placeholder="مهندس كهربائي، ميكانيكي، إلخ..."
                  />
                </Grid>
              )}

              {!isEditMode && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="password"
                    label="كلمة المرور"
                    type="password"
                    placeholder="8 أحرف على الأقل"
                  />
                </Grid>
              )}

              {/* نسبة الخصم للتاجر */}
              {(methods.watch('role') === UserRole.MERCHANT ||
                methods.watch('roles')?.includes(UserRole.MERCHANT)) && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="wholesaleDiscountPercent"
                    label="نسبة خصم الجملة (%)"
                    type="number"
                    placeholder="0-100"
                  />
                </Grid>
              )}

              {/* الأزرار */}
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
                    startIcon={isCreating || isUpdating ? <CircularProgress size={20} /> : <Save />}
                    disabled={isCreating || isUpdating}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: { xs: 'auto', sm: 120 },
                    }}
                  >
                    حفظ
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/users')}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: { xs: 'auto', sm: 120 },
                    }}
                  >
                    إلغاء
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </Paper>
    </Box>
  );
};

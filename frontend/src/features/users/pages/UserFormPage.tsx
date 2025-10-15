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
import type { CreateUserDto } from '../types/user.types';
import '../styles/responsive-users.css';

// Validation Schema
const userSchema = z.object({
  phone: z.string()
    .min(9, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل')
    .max(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأكثر')
    .regex(/^[0-9]+$/, 'رقم الهاتف يجب أن يحتوي على أرقام فقط'),
  firstName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional().or(z.literal('')),
  jobTitle: z.string().optional().or(z.literal('')),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').optional().or(z.literal('')),
  role: z.nativeEnum(UserRole, { required_error: 'يجب اختيار دور' }),
  status: z.nativeEnum(UserStatus),
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
      gender: '',
      jobTitle: '',
      password: '',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    },
  });

  // API
  const { data: user, isLoading } = useUser(id!);
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  // Load user data in edit mode
  useEffect(() => {
    if (isEditMode && user) {
      methods.reset({
        phone: user.phone || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender || '',
        jobTitle: user.jobTitle || '',
        password: '', // لا نحمل كلمة المرور في وضع التعديل
        role: user.roles?.[0] || UserRole.USER, // نأخذ الدور الأول فقط
        status: user.status || UserStatus.ACTIVE,
      });
    }
  }, [user, isEditMode, methods]);

  // Submit
  const onSubmit = (data: UserFormData) => {
    const userData: CreateUserDto = {
      phone: data.phone,
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      gender: data.gender || undefined,
      jobTitle: data.jobTitle || undefined,
      password: data.password || undefined,
      roles: [data.role], // نرسل الدور كمصفوفة كما يتوقع الـ backend
      status: data.status,
    };

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
      createUser(userData, {
        onSuccess: () => {
          navigate('/users');
        },
      });
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
              {/* معلومات أساسية */}
              <Grid size={{ xs: 12 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
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

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormInput name="jobTitle" label="المسمى الوظيفي" />
              </Grid>

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

              {/* الأدوار والصلاحيات */}
              <Grid size={{ xs: 12 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    mt: { xs: 1, sm: 2 },
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  الأدوار والصلاحيات
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect
                  name="role"
                  label="الدور *"
                  options={[
                    { value: UserRole.USER, label: 'مستخدم' },
                    { value: UserRole.MODERATOR, label: 'مشرف' },
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
                      minWidth: { xs: 'auto', sm: 120 }
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
                      minWidth: { xs: 'auto', sm: 120 }
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

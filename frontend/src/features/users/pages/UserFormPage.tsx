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

// Validation Schema
const userSchema = z.object({
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  firstName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').optional(),
  lastName: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  jobTitle: z.string().optional(),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').optional(),
  roles: z.array(z.nativeEnum(UserRole)).min(1, 'يجب اختيار دور واحد على الأقل'),
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
      roles: [UserRole.USER],
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
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        jobTitle: user.jobTitle,
        roles: user.roles || [UserRole.USER],
        status: user.status,
      });
    }
  }, [user, isEditMode, methods]);

  // Submit
  const onSubmit = (data: UserFormData) => {
    const userData: CreateUserDto = {
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      jobTitle: data.jobTitle,
      password: data.password,
      roles: data.roles,
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
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {isEditMode ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* معلومات أساسية */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  المعلومات الأساسية
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput
                  name="phone"
                  label="رقم الهاتف *"
                  placeholder="05XXXXXXXX"
                  disabled={isEditMode}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="firstName" label="الاسم الأول" />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="lastName" label="الاسم الأخير" />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="jobTitle" label="المسمى الوظيفي" />
              </Grid>

              {!isEditMode && (
                <Grid size={{ xs: 12, md: 6 }}>
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
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  الأدوار والصلاحيات
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                  name="roles"
                  label="الدور *"
                  options={[
                    { value: UserRole.USER, label: 'مستخدم' },
                    { value: UserRole.MODERATOR, label: 'مشرف' },
                    { value: UserRole.ADMIN, label: 'مدير' },
                    { value: UserRole.SUPER_ADMIN, label: 'مدير عام' },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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
                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isCreating || isUpdating ? <CircularProgress size={20} /> : <Save />}
                    disabled={isCreating || isUpdating}
                  >
                    حفظ
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/users')}
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

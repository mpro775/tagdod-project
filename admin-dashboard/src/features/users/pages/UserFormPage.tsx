import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Chip, 
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { Save, Cancel, AdminPanelSettings } from '@mui/icons-material';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { useUser, useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { UserRole, UserStatus } from '../types/user.types';
import { PermissionSelector } from '../components/PermissionSelector';
import { PERMISSION_GROUPS } from '@/shared/constants/permissions';
import { YEMEN_CITIES } from '@/shared/constants/yemen-cities';
import { useAuthStore } from '@/store/authStore';
import '../styles/responsive-users.css';

// Validation Schema
const userSchema = z.object({
  phone: z
    .string()
    .min(9, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل')
    .max(15, 'رقم الهاتف يجب أن يكون 15 رقم على الأكثر')
    .regex(/^[0-9+\-\s]+$/, 'رقم الهاتف يجب أن يحتوي على أرقام فقط'),
  firstName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional().or(z.literal('')),
  jobTitle: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .optional()
    .or(z.literal('')),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus),
  roles: z.array(z.nativeEnum(UserRole)).min(1, 'يجب تحديد دور واحد على الأقل'),
  permissions: z.array(z.string()).optional(),
  wholesaleDiscountPercent: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(num) ? undefined : num;
    },
    z.number().min(0, 'النسبة يجب أن تكون 0 أو أكثر').max(100, 'النسبة يجب أن تكون 100 أو أقل').optional()
  ),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const isEditMode = id !== 'new' && !!id;
  const [primaryRole, setPrimaryRole] = React.useState<UserRole>(UserRole.USER);

  // Form
  const methods = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      phone: '',
      firstName: '',
      lastName: '',
      gender: 'male',
      jobTitle: '',
      city: 'صنعاء', // المدينة الافتراضية
      password: '',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      roles: [UserRole.USER],
      permissions: [],
      wholesaleDiscountPercent: undefined,
    },
  });

  // Role display names with descriptions
  const getRoleDisplayName = (role: UserRole | string) => {
    const roleNames: Record<string, string> = {
      [UserRole.USER]: 'مستخدم',
      [UserRole.ENGINEER]: 'مهندس',
      [UserRole.MERCHANT]: 'تاجر (يحصل على تخفيض)',
      [UserRole.ADMIN]: 'مدير (أدمن)',
      [UserRole.SUPER_ADMIN]: 'مدير عام (سوبر أدمن)',
    };
    return roleNames[role] || role;
  };

  // Check if selected role requires admin permissions
  const isAdminRole = () => {
    return primaryRole === UserRole.ADMIN || primaryRole === UserRole.SUPER_ADMIN;
  };

  // Can create super admin
  const canCreateSuperAdmin = hasPermission('super_admin:access');

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

  // Apply permission preset
  const applyPermissionPreset = (presetKey: keyof typeof PERMISSION_GROUPS) => {
    const presetPermissions = Array.from(PERMISSION_GROUPS[presetKey]);
    methods.setValue('permissions', presetPermissions);
  };

  // API
  const { data: user, isLoading } = useUser(id!);
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  // Load user data in edit mode
  useEffect(() => {
    if (isEditMode && user) {
      const userPrimaryRole = user.roles?.[0] || UserRole.USER;
      setPrimaryRole(userPrimaryRole as UserRole);

      const formData = {
        phone: user.phone || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender || 'male',
        jobTitle: user.jobTitle || '',
        city: user.city || 'صنعاء',
        password: '',
        role: userPrimaryRole,
        status: user.status || UserStatus.ACTIVE,
        roles: user.roles || [UserRole.USER],
        permissions: user.permissions || [],
        wholesaleDiscountPercent: user.capabilities?.wholesale_discount_percent || undefined,
      };

      methods.reset(formData);
    }
  }, [user, isEditMode, methods]);

  // Submit
  const onSubmit = (data: UserFormData) => {
    const userData: Record<string, any> = {
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      gender: data.gender || undefined,
      jobTitle: data.jobTitle || undefined,
      city: data.city || 'صنعاء',
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
    const primaryRole = data.roles[0];
    if (primaryRole === UserRole.ENGINEER) {
      userData.capabilityRequest = 'engineer';
    } else if (primaryRole === UserRole.MERCHANT) {
      userData.capabilityRequest = 'wholesale';
      if (data.wholesaleDiscountPercent !== undefined && data.wholesaleDiscountPercent !== null) {
        // Convert to number if it's a string
        userData.wholesaleDiscountPercent = typeof data.wholesaleDiscountPercent === 'string' 
          ? parseFloat(data.wholesaleDiscountPercent) 
          : data.wholesaleDiscountPercent;
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
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AdminPanelSettings sx={{ mr: 1, color: 'primary.main', fontSize: { xs: 28, sm: 32 } }} />
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
            {isEditMode ? 'تعديل المستخدم' : 'إضافة مستخدم أو أدمن جديد'}
        </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          يمكنك إنشاء أي نوع من المستخدمين: مستخدم عادي، مهندس، تاجر، أدمن، أو سوبر أدمن - كل ذلك من نموذج واحد موحد
        </Alert>

        <Divider sx={{ my: { xs: 2, sm: 3 } }} />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Basic Information */}
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  المعلومات الأساسية
                </Typography>
                    <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormInput
                  name="phone"
                  label="رقم الهاتف *"
                          placeholder="+967XXXXXXXXX"
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

                      {/* المدينة - لجميع المستخدمين عدا الأدمن */}
                      {!isAdminRole() && (
                <Grid size={{ xs: 12, sm: 6 }}>
                          <FormSelect
                            name="city"
                            label="المدينة"
                            options={YEMEN_CITIES}
                            helperText={
                              primaryRole === UserRole.ENGINEER 
                                ? "المدينة التي يعمل فيها المهندس" 
                                : "مدينة المستخدم"
                            }
                  />
                </Grid>
              )}

              {!isEditMode && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormInput
                    name="password"
                    label="كلمة المرور"
                    type="password"
                            placeholder="8 أحرف على الأقل (اختياري)"
                            helperText="إذا لم تُحدد، سيتم إنشاء كلمة مرور تلقائياً"
                          />
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Roles and Permissions */}
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      الأدوار والصلاحيات
                    </Typography>

                    <FormSelect
                      name="role"
                      label="الدور الرئيسي *"
                      value={primaryRole}
                      onChange={(e) => handlePrimaryRoleChange(e.target.value as UserRole)}
                      options={[
                        { value: UserRole.USER, label: getRoleDisplayName(UserRole.USER) },
                        { value: UserRole.ENGINEER, label: getRoleDisplayName(UserRole.ENGINEER) },
                        { value: UserRole.MERCHANT, label: getRoleDisplayName(UserRole.MERCHANT) },
                        { value: UserRole.ADMIN, label: getRoleDisplayName(UserRole.ADMIN) },
                        ...(canCreateSuperAdmin ? [{ value: UserRole.SUPER_ADMIN, label: getRoleDisplayName(UserRole.SUPER_ADMIN) }] : []),
                      ]}
                    />
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        الدور المحدد:
                      </Typography>
                      <Chip
                        label={getRoleDisplayName(primaryRole)}
                        color={
                          primaryRole === UserRole.SUPER_ADMIN ? 'error' :
                          primaryRole === UserRole.ADMIN ? 'primary' :
                          primaryRole === UserRole.MERCHANT ? 'success' :
                          primaryRole === UserRole.ENGINEER ? 'warning' :
                          'default'
                        }
                        size="medium"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <FormSelect
                        name="status"
                        label="الحالة *"
                        options={[
                          { value: UserStatus.ACTIVE, label: 'نشط' },
                          { value: UserStatus.PENDING, label: 'قيد الانتظار' },
                          { value: UserStatus.SUSPENDED, label: 'معلق' },
                        ]}
                      />
                    </Box>

                    {/* Permission Presets - Only for admin roles */}
                    {isAdminRole() && (
                      <Box sx={{ mt: 3 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                          قوالب الصلاحيات الجاهزة
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          اختر قالباً جاهزاً أو قم بتخصيص الصلاحيات يدوياً في الأسفل
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => applyPermissionPreset('PRODUCT_MANAGER')}
                          >
                            مدير المنتجات
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => applyPermissionPreset('SALES_MANAGER')}
                          >
                            مدير المبيعات
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => applyPermissionPreset('SUPPORT_MANAGER')}
                          >
                            مدير الدعم
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => applyPermissionPreset('MARKETING_MANAGER')}
                          >
                            مدير التسويق
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => applyPermissionPreset('CONTENT_MANAGER')}
                          >
                            مدير المحتوى
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => applyPermissionPreset('VIEW_ONLY_ADMIN')}
                          >
                            قراءة فقط
                          </Button>
                          {canCreateSuperAdmin && primaryRole === UserRole.SUPER_ADMIN && (
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => applyPermissionPreset('FULL_ADMIN')}
                            >
                              جميع الصلاحيات
                            </Button>
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Custom Permission Selector - Only for admin roles */}
                    {isAdminRole() && (
                      <Box sx={{ mt: 3 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          تخصيص الصلاحيات
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          حدد الصلاحيات التي سيملكها هذا الأدمن في النظام
                        </Typography>
                        <PermissionSelector
                          selectedPermissions={methods.watch('permissions') || []}
                          onChange={(permissions) => methods.setValue('permissions', permissions)}
                        />
                      </Box>
                    )}

                    {/* Info for non-admin roles */}
                    {!isAdminRole() && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <strong>القدرات تُحدد تلقائياً:</strong> الدور المحدد ({getRoleDisplayName(primaryRole)}) لا يحتاج إلى صلاحيات إدارية.
                        {primaryRole === UserRole.MERCHANT && (
                          <Box sx={{ mt: 1 }}>
                            • سيحصل تلقائياً على قدرة "تاجر جملة" (wholesale_capable)
                            <br />
                            • يمكنك تحديد نسبة التخفيض الخاصة به أدناه
                          </Box>
                        )}
                        {primaryRole === UserRole.ENGINEER && (
                          <Box sx={{ mt: 1 }}>
                            • سيحصل تلقائياً على قدرة "مهندس" (engineer_capable)
                            <br />
                            • ستحتاج طلبات القدرة إلى موافقة من الإدارة
                          </Box>
                        )}
                        {primaryRole === UserRole.USER && (
                          <Box sx={{ mt: 1 }}>
                            • سيحصل تلقائياً على قدرة "عميل" (customer_capable)
                          </Box>
                        )}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Job Title - Only for engineers */}
              {primaryRole === UserRole.ENGINEER && (
                <Grid size={{ xs: 12 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        معلومات المهندس
                      </Typography>
                      <FormInput
                        name="jobTitle"
                        label="المسمى الوظيفي / التخصص"
                        placeholder="مهندس كهربائي، ميكانيكي، طاقة شمسية..."
                        helperText="تخصص المهندس ومجال خبرته"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Discount - Only for merchants */}
              {primaryRole === UserRole.MERCHANT && (
                <Grid size={{ xs: 12 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        معلومات التاجر
                      </Typography>
                  <FormInput
                    name="wholesaleDiscountPercent"
                    label="نسبة التخفيض للتاجر (%)"
                    type="number"
                    placeholder="0-100"
                    helperText="النسبة المئوية للتخفيض الذي سيحصل عليه التاجر على جميع المنتجات"
                  />
                    </CardContent>
                  </Card>
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
                    startIcon={isCreating || isUpdating ? <CircularProgress size={20} /> : <Save />}
                    disabled={isCreating || isUpdating}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: { xs: 'auto', sm: 120 },
                    }}
                  >
                    {isCreating || isUpdating ? 'جاري الحفظ...' : 'حفظ'}
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

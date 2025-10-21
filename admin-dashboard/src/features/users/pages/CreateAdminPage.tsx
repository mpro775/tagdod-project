import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import { Save, Cancel, Security, AdminPanelSettings } from '@mui/icons-material';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { FormCheckboxGroup } from '@/shared/components/Form/FormCheckboxGroup';
import { adminApi, CreateAdminDto } from '../api/adminApi';
import { PERMISSIONS, PERMISSION_GROUPS } from '@/shared/constants/permissions';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

// Validation Schema
const createAdminSchema = z.object({
  phone: z.string()
    .min(9, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل')
    .max(15, 'رقم الهاتف يجب أن يكون 15 رقم على الأكثر')
    .regex(/^[0-9+\-\s]+$/, 'رقم الهاتف غير صحيح'),
  firstName: z.string().min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل'),
  lastName: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  roles: z.array(z.string()).min(1, 'يجب اختيار دور واحد على الأقل'),
  permissions: z.array(z.string()).min(1, 'يجب اختيار صلاحية واحدة على الأقل'),
  temporaryPassword: z.string().optional(),
  activateImmediately: z.boolean().default(true),
  description: z.string().optional(),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

export const CreateAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);

  const methods = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      phone: '',
      firstName: '',
      lastName: '',
      gender: undefined,
      roles: ['admin'],
      permissions: [PERMISSIONS.ADMIN_ACCESS],
      temporaryPassword: '',
      activateImmediately: true,
      description: '',
    },
  });

  const { handleSubmit, watch, setValue, formState: { errors } } = methods;

  // Check if user can create super admin
  const canCreateSuperAdmin = hasPermission(PERMISSIONS.SUPER_ADMIN_ACCESS);

  // Permission categories for better organization
  const permissionCategories = {
    users: {
      title: 'إدارة المستخدمين',
      permissions: [
        PERMISSIONS.USERS_READ,
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.USERS_UPDATE,
        PERMISSIONS.USERS_DELETE,
        PERMISSIONS.USERS_SUSPEND,
        PERMISSIONS.USERS_ACTIVATE,
        PERMISSIONS.USERS_RESTORE,
      ],
    },
    products: {
      title: 'إدارة المنتجات',
      permissions: [
        PERMISSIONS.PRODUCTS_READ,
        PERMISSIONS.PRODUCTS_CREATE,
        PERMISSIONS.PRODUCTS_UPDATE,
        PERMISSIONS.PRODUCTS_DELETE,
      ],
    },
    orders: {
      title: 'إدارة الطلبات',
      permissions: [
        PERMISSIONS.ORDERS_READ,
        PERMISSIONS.ORDERS_UPDATE,
        PERMISSIONS.ORDERS_CANCEL,
        PERMISSIONS.ORDERS_REFUND,
      ],
    },
    marketing: {
      title: 'التسويق والعروض',
      permissions: [
        PERMISSIONS.MARKETING_READ,
        PERMISSIONS.MARKETING_CREATE,
        PERMISSIONS.MARKETING_UPDATE,
        PERMISSIONS.MARKETING_DELETE,
        PERMISSIONS.CARTS_SEND_REMINDERS,
      ],
    },
    analytics: {
      title: 'التحليلات والتقارير',
      permissions: [
        PERMISSIONS.ANALYTICS_READ,
        PERMISSIONS.REPORTS_GENERATE,
        PERMISSIONS.ANALYTICS_EXPORT,
      ],
    },
    support: {
      title: 'الدعم الفني',
      permissions: [
        PERMISSIONS.SUPPORT_READ,
        PERMISSIONS.SUPPORT_UPDATE,
        PERMISSIONS.SUPPORT_ASSIGN,
      ],
    },
    system: {
      title: 'النظام والإعدادات',
      permissions: [
        PERMISSIONS.SETTINGS_READ,
        PERMISSIONS.SETTINGS_UPDATE,
        PERMISSIONS.EXCHANGE_RATES_READ,
        PERMISSIONS.EXCHANGE_RATES_UPDATE,
        PERMISSIONS.SYSTEM_LOGS,
      ],
    },
  };

  // Handle permission selection
  const handlePermissionChange = (permissions: string[]) => {
    setSelectedPermissions(permissions);
    setValue('permissions', permissions);
  };

  // Apply permission preset
  const applyPermissionPreset = (presetKey: keyof typeof PERMISSION_GROUPS) => {
    const presetPermissions = PERMISSION_GROUPS[presetKey];
    setSelectedPermissions(presetPermissions);
    setValue('permissions', presetPermissions);
  };

  const onSubmit = async (data: CreateAdminFormData) => {
    try {
      setIsSubmitting(true);

      const adminData: CreateAdminDto = {
        ...data,
        roles: data.roles,
        permissions: selectedPermissions,
      };

      const response = await adminApi.createAdmin(adminData);

      toast.success('تم إنشاء الأدمن بنجاح!');

      // Show login credentials if temporary password was generated
      if (response.data.temporaryPassword) {
        toast.success(
          `معلومات تسجيل الدخول:\nرقم الهاتف: ${response.data.phone}\nكلمة المرور: ${response.data.temporaryPassword}`,
          { duration: 10000 }
        );
      }

      navigate('/users');
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error?.response?.data?.message || 'حدث خطأ أثناء إنشاء الأدمن');
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedRoles = watch('roles');

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AdminPanelSettings sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight="bold">
            إنشاء أدمن جديد
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    المعلومات الأساسية
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormInput
                        name="phone"
                        label="رقم الهاتف"
                        placeholder="+966501234567"
                        required
                        {...methods}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormSelect
                        name="gender"
                        label="الجنس"
                        options={[
                          { value: 'male', label: 'ذكر' },
                          { value: 'female', label: 'أنثى' },
                          { value: 'other', label: 'أخرى' },
                        ]}
                        {...methods}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormInput
                        name="firstName"
                        label="الاسم الأول"
                        required
                        {...methods}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormInput
                        name="lastName"
                        label="الاسم الأخير"
                        {...methods}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Roles */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    الأدوار
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label="أدمن"
                      color={watchedRoles.includes('admin') ? 'primary' : 'default'}
                      onClick={() => {
                        const newRoles = watchedRoles.includes('admin')
                          ? watchedRoles.filter(r => r !== 'admin')
                          : [...watchedRoles, 'admin'];
                        setValue('roles', newRoles);
                      }}
                    />
                    {canCreateSuperAdmin && (
                      <Chip
                        label="سوبر أدمن"
                        color={watchedRoles.includes('super_admin') ? 'error' : 'default'}
                        onClick={() => {
                          const newRoles = watchedRoles.includes('super_admin')
                            ? watchedRoles.filter(r => r !== 'super_admin')
                            : [...watchedRoles, 'super_admin'];
                          setValue('roles', newRoles);
                        }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Permission Presets */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    قوالب الصلاحيات الجاهزة
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
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
                    {canCreateSuperAdmin && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => applyPermissionPreset('FULL_ADMIN')}
                      >
                        الأدمن الكامل
                      </Button>
                    )}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    الصلاحيات المحددة: {selectedPermissions.length} صلاحية
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Permissions */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Security sx={{ mr: 1 }} />
                    الصلاحيات المخصصة
                  </Typography>

                  {Object.entries(permissionCategories).map(([categoryKey, category]) => (
                    <Box key={categoryKey} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        {category.title}
                      </Typography>
                      <FormCheckboxGroup
                        name={`permissions-${categoryKey}`}
                        options={category.permissions.map(perm => ({
                          value: perm,
                          label: perm.split('.').pop()?.replace('_', ' ') || perm,
                        }))}
                        value={selectedPermissions.filter(p => category.permissions.includes(p))}
                        onChange={(values) => {
                          const newPermissions = selectedPermissions.filter(
                            p => !category.permissions.includes(p)
                          ).concat(values);
                          handlePermissionChange(newPermissions);
                        }}
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Additional Settings */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    إعدادات إضافية
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormInput
                        name="temporaryPassword"
                        label="كلمة مرور مؤقتة"
                        type="password"
                        helperText="إذا لم يتم تحديدها، سيتم إنشاء كلمة مرور تلقائياً"
                        {...methods}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={watch('activateImmediately')}
                            onChange={(e) => setValue('activateImmediately', e.target.checked)}
                          />
                        }
                        label="تفعيل الحساب فوراً"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormInput
                        name="description"
                        label="وصف الدور والمسؤوليات"
                        multiline
                        rows={3}
                        {...methods}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/users')}
                  disabled={isSubmitting}
                  startIcon={<Cancel />}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={<Save />}
                >
                  {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الأدمن'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            يرجى تصحيح الأخطاء في النموذج
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

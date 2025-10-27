import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
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
import { AxiosError } from 'axios';

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
  activateImmediately: z.boolean().optional(),
  description: z.string().optional(),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

export const CreateAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([PERMISSIONS.ADMIN_ACCESS]);
  const [primaryRole, setPrimaryRole] = React.useState<string>('admin');

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

  // Role display names with descriptions
  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'admin': 'أدمن (مدير)',
      'super_admin': 'سوبر أدمن (مدير عام)',
      'user': 'مستخدم',
      'customer': 'عميل',
      'wholesale': 'تاجر (يحصل على تخفيض)',
    };
    return roleNames[role] || role;
  };

  // Check if selected role requires admin permissions
  const isAdminRole = () => {
    return primaryRole === 'admin' || primaryRole === 'super_admin';
  };

  // Handle primary role change
  const handlePrimaryRoleChange = (role: string) => {
    setPrimaryRole(role);
    setValue('roles', [role]);
    
    // Set default permissions based on role
    if (role === 'admin' || role === 'super_admin') {
      if (role === 'super_admin') {
        const allPermissions = Object.values(PERMISSIONS);
        setSelectedPermissions(allPermissions);
        setValue('permissions', allPermissions);
      } else {
        setSelectedPermissions([PERMISSIONS.ADMIN_ACCESS]);
        setValue('permissions', [PERMISSIONS.ADMIN_ACCESS]);
      }
    } else {
      // For non-admin roles, clear permissions
      setSelectedPermissions([]);
      setValue('permissions', []);
    }
  };

  // Permission categories for better organization
  const permissionCategories: Record<string, { title: string; permissions: string[] }> = {
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
        PERMISSIONS.PRODUCTS_PUBLISH,
        PERMISSIONS.PRODUCTS_UNPUBLISH,
      ],
    },
    categories: {
      title: 'إدارة الفئات',
      permissions: [
        PERMISSIONS.CATEGORIES_READ,
        PERMISSIONS.CATEGORIES_CREATE,
        PERMISSIONS.CATEGORIES_UPDATE,
        PERMISSIONS.CATEGORIES_DELETE,
      ],
    },
    brands: {
      title: 'إدارة العلامات التجارية',
      permissions: [
        PERMISSIONS.BRANDS_READ,
        PERMISSIONS.BRANDS_CREATE,
        PERMISSIONS.BRANDS_UPDATE,
        PERMISSIONS.BRANDS_DELETE,
      ],
    },
    attributes: {
      title: 'إدارة الخصائص',
      permissions: [
        PERMISSIONS.ATTRIBUTES_READ,
        PERMISSIONS.ATTRIBUTES_CREATE,
        PERMISSIONS.ATTRIBUTES_UPDATE,
        PERMISSIONS.ATTRIBUTES_DELETE,
      ],
    },
    orders: {
      title: 'إدارة الطلبات',
      permissions: [
        PERMISSIONS.ORDERS_READ,
        PERMISSIONS.ORDERS_UPDATE,
        PERMISSIONS.ORDERS_CANCEL,
        PERMISSIONS.ORDERS_REFUND,
        PERMISSIONS.ORDERS_STATUS_UPDATE,
      ],
    },
    carts: {
      title: 'إدارة السلة',
      permissions: [
        PERMISSIONS.CARTS_READ,
        PERMISSIONS.CARTS_UPDATE,
        PERMISSIONS.CARTS_DELETE,
        PERMISSIONS.CARTS_SEND_REMINDERS,
        PERMISSIONS.CARTS_CONVERT_TO_ORDER,
        PERMISSIONS.CARTS_BULK_ACTIONS,
      ],
    },
    services: {
      title: 'إدارة الخدمات',
      permissions: [
        PERMISSIONS.SERVICES_READ,
        PERMISSIONS.SERVICES_UPDATE,
        PERMISSIONS.SERVICES_CANCEL,
        PERMISSIONS.SERVICES_ASSIGN,
      ],
    },
    marketing: {
      title: 'التسويق والعروض',
      permissions: [
        PERMISSIONS.MARKETING_READ,
        PERMISSIONS.MARKETING_CREATE,
        PERMISSIONS.MARKETING_UPDATE,
        PERMISSIONS.MARKETING_DELETE,
        PERMISSIONS.MARKETING_PUBLISH,
        PERMISSIONS.MARKETING_ANALYZE,
      ],
    },
    support: {
      title: 'الدعم الفني',
      permissions: [
        PERMISSIONS.SUPPORT_READ,
        PERMISSIONS.SUPPORT_UPDATE,
        PERMISSIONS.SUPPORT_ASSIGN,
        PERMISSIONS.SUPPORT_CLOSE,
      ],
    },
    analytics: {
      title: 'التحليلات والتقارير',
      permissions: [
        PERMISSIONS.ANALYTICS_READ,
        PERMISSIONS.ANALYTICS_EXPORT,
        PERMISSIONS.REPORTS_GENERATE,
        PERMISSIONS.REPORTS_SCHEDULE,
      ],
    },
    media: {
      title: 'إدارة الوسائط والرفع',
      permissions: [
        PERMISSIONS.MEDIA_MANAGE,
        PERMISSIONS.MEDIA_DELETE,
        PERMISSIONS.UPLOAD_MANAGE,
        PERMISSIONS.UPLOAD_DELETE,
      ],
    },
    notifications: {
      title: 'إدارة الإشعارات',
      permissions: [
        PERMISSIONS.NOTIFICATIONS_READ,
        PERMISSIONS.NOTIFICATIONS_CREATE,
        PERMISSIONS.NOTIFICATIONS_UPDATE,
        PERMISSIONS.NOTIFICATIONS_DELETE,
        PERMISSIONS.NOTIFICATIONS_SEND,
        PERMISSIONS.NOTIFICATIONS_MANAGE,
      ],
    },
    audit: {
      title: 'التدقيق والمراجعة',
      permissions: [
        PERMISSIONS.AUDIT_READ,
        PERMISSIONS.AUDIT_MANAGE,
      ],
    },
    capabilities: {
      title: 'إدارة القدرات',
      permissions: [
        PERMISSIONS.CAPABILITIES_READ,
        PERMISSIONS.CAPABILITIES_UPDATE,
        PERMISSIONS.CAPABILITIES_APPROVE,
        PERMISSIONS.CAPABILITIES_REJECT,
      ],
    },
    roles: {
      title: 'إدارة الأدوار',
      permissions: [
        PERMISSIONS.ROLES_READ,
        PERMISSIONS.ROLES_CREATE,
        PERMISSIONS.ROLES_UPDATE,
        PERMISSIONS.ROLES_DELETE,
        PERMISSIONS.ROLES_ASSIGN,
        PERMISSIONS.ROLES_REVOKE,
      ],
    },
    addresses: {
      title: 'إدارة العناوين',
      permissions: [
        PERMISSIONS.ADDRESSES_READ,
        PERMISSIONS.ADDRESSES_MANAGE,
        PERMISSIONS.ADDRESSES_ANALYTICS,
      ],
    },
    favorites: {
      title: 'إدارة المفضلات',
      permissions: [
        PERMISSIONS.FAVORITES_READ,
        PERMISSIONS.FAVORITES_MANAGE,
      ],
    },
    system: {
      title: 'النظام والإعدادات',
      permissions: [
        PERMISSIONS.SETTINGS_READ,
        PERMISSIONS.SETTINGS_UPDATE,
        PERMISSIONS.EXCHANGE_RATES_READ,
        PERMISSIONS.EXCHANGE_RATES_UPDATE,
        PERMISSIONS.SYSTEM_MAINTENANCE,
        PERMISSIONS.SYSTEM_BACKUP,
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
    setSelectedPermissions(Array.from(presetPermissions));
    setValue('permissions', Array.from(presetPermissions));
  };

  const onSubmit = async (data: CreateAdminFormData) => {
    try {
      setIsSubmitting(true);

      // For non-admin roles, ensure permissions array is empty or only has basic permissions
      const finalPermissions = isAdminRole() ? selectedPermissions : [];

      const adminData: CreateAdminDto = {
        ...data,
        roles: data.roles,
        permissions: finalPermissions.length > 0 ? finalPermissions : [PERMISSIONS.ADMIN_ACCESS],
      };

      const response = await adminApi.createAdmin(adminData);

      toast.success('تم إنشاء الأدمن بنجاح!');

      // Show login credentials if temporary password was generated
      if (response.temporaryPassword) {
        toast.success(
          `معلومات تسجيل الدخول:\nرقم الهاتف: ${response.phone}\nكلمة المرور: ${response.temporaryPassword}`,
          { duration: 10000 }
        );
      }

      navigate('/users');
    } catch (error: unknown) {
      toast.error((error as AxiosError<{ message: string }>)?.response?.data?.message || 'حدث خطأ أثناء إنشاء الأدمن');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AdminPanelSettings sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight="bold">
            إنشاء أدمن جديد
          </Typography>
        </Box>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid component="div" size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    المعلومات الأساسية
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid component="div" size={{ xs: 12, md: 6 }}>
                      <FormInput
                        name="phone"
                        label="رقم الهاتف"
                        placeholder="+966501234567"
                        required
                        {...methods}
                      />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, md: 6 }}>
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
                    <Grid component="div" size={{ xs: 12, md: 6 }}>
                      <FormInput
                        name="firstName"
                        label="الاسم الأول"
                        required
                        {...methods}
                      />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, md: 6 }}>
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

            {/* Primary Role Selection */}
            <Grid component="div" size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    الدور الرئيسي
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <FormSelect
                      name="primaryRole"
                      label="اختر الدور الرئيسي"
                      value={primaryRole}
                      onChange={(e) => handlePrimaryRoleChange(String(e.target.value))}
                      options={[
                        { value: 'admin', label: getRoleDisplayName('admin') },
                        ...(canCreateSuperAdmin ? [{ value: 'super_admin', label: getRoleDisplayName('super_admin') }] : []),
                        { value: 'user', label: getRoleDisplayName('user') },
                        { value: 'customer', label: getRoleDisplayName('customer') },
                        { value: 'wholesale', label: getRoleDisplayName('wholesale') },
                      ]}
                      required
                      {...methods}
                    />
                  </Box>
                  
                  {/* Display selected role with chip */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      الدور المحدد:
                    </Typography>
                    <Chip
                      label={getRoleDisplayName(primaryRole)}
                      color={primaryRole === 'super_admin' ? 'error' : primaryRole === 'admin' ? 'primary' : 'default'}
                      size="medium"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  {/* Warning for non-admin roles */}
                  {!isAdminRole() && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      الدور المحدد ({getRoleDisplayName(primaryRole)}) لا يحتاج إلى صلاحيات إدارية. 
                      لن تظهر خيارات الصلاحيات المخصصة.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Permission Presets - Only show for admin roles */}
            {isAdminRole() && (
              <Grid component="div" size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      قوالب الصلاحيات الجاهزة
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      اختر قالباً جاهزاً أو قم بتخصيص الصلاحيات يدوياً في الأسفل
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
                      {canCreateSuperAdmin && primaryRole === 'super_admin' && (
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
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      الصلاحيات المحددة: {selectedPermissions.length} صلاحية
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Permissions - Only show for admin roles */}
            {isAdminRole() && (
              <Grid component="div" size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Security sx={{ mr: 1 }} />
                      الصلاحيات المخصصة
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      يمكنك تخصيص الصلاحيات حسب احتياجاتك، أو اختيار قالب جاهز من الأعلى
                    </Alert>

                    {Object.entries(permissionCategories).map(([categoryKey, category]) => (
                      <Box key={categoryKey} sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                          {category.title}
                        </Typography>
                        <FormCheckboxGroup
                          name={`permissions-${categoryKey}`}
                          control={methods.control}
                          options={category.permissions.map(perm => ({
                            value: perm,
                            label: perm.split('.').pop()?.replace('_', ' ') || perm,
                          }))}
                          value={selectedPermissions.filter((p: string) => category.permissions.includes(p))}
                          onChange={(values) => {
                            const newPermissions = selectedPermissions.filter(
                              (p: string) => !category.permissions.includes(p)
                            ).concat(values);
                            handlePermissionChange(newPermissions);
                          }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Additional Settings */}
            <Grid component="div" size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    إعدادات إضافية
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid component="div" size={{ xs: 12, md: 6 }}>
                      <FormInput
                        name="temporaryPassword"
                        label="كلمة مرور مؤقتة"
                        type="password"
                        helperText="إذا لم يتم تحديدها، سيتم إنشاء كلمة مرور تلقائياً"
                        {...methods}
                      />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, md: 6 }}>
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
                        <Grid component="div" size={{ xs: 12 }}>
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
            <Grid component="div" size={{ xs: 12 }}>
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
        </FormProvider>

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            يرجى تصحيح الأخطاء في النموذج
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

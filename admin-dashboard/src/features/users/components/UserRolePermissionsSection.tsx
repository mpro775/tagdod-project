import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Divider,
  Alert,
  useTheme,
} from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { PermissionSelector } from './PermissionSelector';
import { PERMISSION_GROUPS } from '@/shared/constants/permissions';
import { UserRole, UserStatus } from '../types/user.types';
import type { UserFormData } from '../schemas/userFormSchema';

interface UserRolePermissionsSectionProps {
  primaryRole: UserRole;
  onPrimaryRoleChange: (role: UserRole) => void;
  isAdminRole: boolean;
  canCreateSuperAdmin: boolean;
}

export const UserRolePermissionsSection: React.FC<UserRolePermissionsSectionProps> = ({
  primaryRole,
  onPrimaryRoleChange,
  isAdminRole,
  canCreateSuperAdmin,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const methods = useFormContext<UserFormData>();

  const getRoleDisplayName = (role: UserRole | string) => {
    const roleNames: Record<string, string> = {
      [UserRole.USER]: t('users:roles.user', 'مستخدم'),
      [UserRole.ENGINEER]: t('users:roles.engineer', 'مهندس'),
      [UserRole.MERCHANT]: t('users:roles.merchant', 'تاجر (يحصل على تخفيض)'),
      [UserRole.ADMIN]: t('users:roles.admin', 'مدير (أدمن)'),
      [UserRole.SUPER_ADMIN]: t('users:roles.super_admin', 'مدير عام (سوبر أدمن)'),
    };
    return roleNames[role] || role;
  };

  const applyPermissionPreset = (presetKey: keyof typeof PERMISSION_GROUPS) => {
    const presetPermissions = Array.from(PERMISSION_GROUPS[presetKey]);
    methods.setValue('permissions', presetPermissions);
  };

  const roleColorMap: Record<UserRole, 'error' | 'primary' | 'success' | 'warning' | 'default'> = {
    [UserRole.SUPER_ADMIN]: 'error',
    [UserRole.ADMIN]: 'primary',
    [UserRole.MERCHANT]: 'success',
    [UserRole.ENGINEER]: 'warning',
    [UserRole.USER]: 'default',
  };

  return (
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
          {t('users:form.sections.rolesPermissions', 'الأدوار والصلاحيات')}
        </Typography>

        <FormSelect
          name="role"
          label={t('users:form.fields.primaryRole', 'الدور الرئيسي *')}
          value={primaryRole}
          onChange={(e) => onPrimaryRoleChange(e.target.value as UserRole)}
          options={[
            { value: UserRole.USER, label: getRoleDisplayName(UserRole.USER) },
            { value: UserRole.ENGINEER, label: getRoleDisplayName(UserRole.ENGINEER) },
            { value: UserRole.MERCHANT, label: getRoleDisplayName(UserRole.MERCHANT) },
            { value: UserRole.ADMIN, label: getRoleDisplayName(UserRole.ADMIN) },
            ...(canCreateSuperAdmin
              ? [{ value: UserRole.SUPER_ADMIN, label: getRoleDisplayName(UserRole.SUPER_ADMIN) }]
              : []),
          ]}
        />

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('users:form.selectedRole', 'الدور المحدد:')}
          </Typography>
          <Chip
            label={getRoleDisplayName(primaryRole)}
            color={roleColorMap[primaryRole]}
            size="medium"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <FormSelect
            name="status"
            label={t('users:form.fields.status', 'الحالة *')}
            options={[
              { value: UserStatus.ACTIVE, label: t('users:status.active', 'نشط') },
              {
                value: UserStatus.PENDING,
                label: t('users:status.pending', 'قيد الانتظار'),
              },
              {
                value: UserStatus.SUSPENDED,
                label: t('users:status.suspended', 'معلق'),
              },
            ]}
          />
        </Box>

        {/* Permission Presets - Only for admin roles */}
        {isAdminRole && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="text.primary">
              {t('users:form.permissionPresets.title', 'قوالب الصلاحيات الجاهزة')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t(
                'users:form.permissionPresets.description',
                'اختر قالباً جاهزاً أو قم بتخصيص الصلاحيات يدوياً في الأسفل'
              )}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => applyPermissionPreset('PRODUCT_MANAGER')}
              >
                {t('users:form.permissionPresets.productManager', 'مدير المنتجات')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => applyPermissionPreset('SALES_MANAGER')}
              >
                {t('users:form.permissionPresets.salesManager', 'مدير المبيعات')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => applyPermissionPreset('SUPPORT_MANAGER')}
              >
                {t('users:form.permissionPresets.supportManager', 'مدير الدعم')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => applyPermissionPreset('MARKETING_MANAGER')}
              >
                {t('users:form.permissionPresets.marketingManager', 'مدير التسويق')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => applyPermissionPreset('CONTENT_MANAGER')}
              >
                {t('users:form.permissionPresets.contentManager', 'مدير المحتوى')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => applyPermissionPreset('VIEW_ONLY_ADMIN')}
              >
                {t('users:form.permissionPresets.viewOnly', 'قراءة فقط')}
              </Button>
              {canCreateSuperAdmin && primaryRole === UserRole.SUPER_ADMIN && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => applyPermissionPreset('FULL_ADMIN')}
                >
                  {t('users:form.permissionPresets.fullAdmin', 'جميع الصلاحيات')}
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Custom Permission Selector - Only for admin roles */}
        {isAdminRole && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="text.primary">
              {t('users:form.customPermissions.title', 'تخصيص الصلاحيات')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t(
                'users:form.customPermissions.description',
                'حدد الصلاحيات التي سيملكها هذا الأدمن في النظام'
              )}
            </Typography>
            <PermissionSelector
              selectedPermissions={methods.watch('permissions') || []}
              onChange={(permissions) => methods.setValue('permissions', permissions)}
            />
          </Box>
        )}

        {/* Info for non-admin roles */}
        {!isAdminRole && (
          <Alert
            severity="info"
            sx={{
              mt: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : undefined,
            }}
          >
            <strong>
              {t(
                'users:form.capabilities.autoAssigned',
                'القدرات تُحدد تلقائياً:'
              )}
            </strong>{' '}
            {t('users:form.capabilities.autoAssignedDesc', 'الدور المحدد ({role}) لا يحتاج إلى صلاحيات إدارية.', {
              role: getRoleDisplayName(primaryRole),
            })}
            {primaryRole === UserRole.MERCHANT && (
              <Box sx={{ mt: 1 }}>
                • {t('users:form.capabilities.merchant.capable', 'سيحصل تلقائياً على قدرة "تاجر" (merchant_capable)')}
                <br />
                • {t('users:form.capabilities.merchant.discount', 'يمكنك تحديد نسبة التخفيض الخاصة به أدناه')}
              </Box>
            )}
            {primaryRole === UserRole.ENGINEER && (
              <Box sx={{ mt: 1 }}>
                • {t('users:form.capabilities.engineer.capable', 'سيحصل تلقائياً على قدرة "مهندس" (engineer_capable)')}
                <br />
                • {t('users:form.capabilities.engineer.approval', 'ستحتاج طلبات القدرة إلى موافقة من الإدارة')}
              </Box>
            )}
            {primaryRole === UserRole.USER && (
              <Box sx={{ mt: 1 }}>
                • {t('users:form.capabilities.user.capable', 'سيحصل تلقائياً على قدرة "عميل" (customer_capable)')}
              </Box>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};


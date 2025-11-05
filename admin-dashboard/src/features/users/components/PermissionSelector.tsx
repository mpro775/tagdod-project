import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Chip,
  Stack,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ExpandMore, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { useTranslation } from 'react-i18next';

interface PermissionCategory {
  title: string;
  description: string;
  permissions: {
    key: string;
    label: string;
    value: string;
    description?: string;
  }[];
}

// This will be generated inside component with translations
const getPermissionCategories = (t: any): PermissionCategory[] => [
  {
    title: t('users:permissions.categories.users.title', 'المستخدمون'),
    description: t('users:permissions.categories.users.description', 'إدارة المستخدمين والحسابات'),
    permissions: [
      {
        key: 'USERS_READ',
        label: t('users:permissions.actions.read', 'عرض'),
        value: PERMISSIONS.USERS_READ,
        description: t('users:permissions.descriptions.users.read', 'عرض قائمة المستخدمين'),
      },
      {
        key: 'USERS_CREATE',
        label: t('users:permissions.actions.create', 'إنشاء'),
        value: PERMISSIONS.USERS_CREATE,
        description: t('users:permissions.descriptions.users.create', 'إنشاء مستخدمين جدد'),
      },
      {
        key: 'USERS_UPDATE',
        label: t('users:permissions.actions.update', 'تعديل'),
        value: PERMISSIONS.USERS_UPDATE,
        description: t('users:permissions.descriptions.users.update', 'تعديل بيانات المستخدمين'),
      },
      {
        key: 'USERS_DELETE',
        label: t('users:permissions.actions.delete', 'حذف'),
        value: PERMISSIONS.USERS_DELETE,
        description: t('users:permissions.descriptions.users.delete', 'حذف المستخدمين'),
      },
      {
        key: 'USERS_SUSPEND',
        label: t('users:permissions.actions.suspend', 'تعليق'),
        value: PERMISSIONS.USERS_SUSPEND,
        description: t('users:permissions.descriptions.users.suspend', 'تعليق الحسابات'),
      },
      {
        key: 'USERS_ACTIVATE',
        label: t('users:permissions.actions.activate', 'تفعيل'),
        value: PERMISSIONS.USERS_ACTIVATE,
        description: t('users:permissions.descriptions.users.activate', 'تفعيل الحسابات المعلقة'),
      },
      {
        key: 'USERS_RESTORE',
        label: t('users:permissions.actions.restore', 'استرجاع'),
        value: PERMISSIONS.USERS_RESTORE,
        description: t('users:permissions.descriptions.users.restore', 'استرجاع المستخدمين المحذوفين'),
      },
    ],
  },
  {
    title: t('users:permissions.categories.roles.title', 'الأدوار والصلاحيات'),
    description: t('users:permissions.categories.roles.description', 'إدارة أدوار النظام والصلاحيات'),
    permissions: [
      { key: 'ROLES_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.ROLES_READ },
      { key: 'ROLES_CREATE', label: t('users:permissions.actions.create', 'إنشاء'), value: PERMISSIONS.ROLES_CREATE },
      { key: 'ROLES_UPDATE', label: t('users:permissions.actions.update', 'تعديل'), value: PERMISSIONS.ROLES_UPDATE },
      { key: 'ROLES_DELETE', label: t('users:permissions.actions.delete', 'حذف'), value: PERMISSIONS.ROLES_DELETE },
      { key: 'ROLES_ASSIGN', label: t('users:permissions.actions.assign', 'إسناد'), value: PERMISSIONS.ROLES_ASSIGN },
      { key: 'ROLES_REVOKE', label: t('users:permissions.actions.revoke', 'إلغاء'), value: PERMISSIONS.ROLES_REVOKE },
    ],
  },
  {
    title: t('users:permissions.categories.products.title', 'المنتجات'),
    description: t('users:permissions.categories.products.description', 'إدارة المنتجات والكتالوج'),
    permissions: [
      { key: 'PRODUCTS_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.PRODUCTS_READ },
      { key: 'PRODUCTS_CREATE', label: t('users:permissions.actions.create', 'إنشاء'), value: PERMISSIONS.PRODUCTS_CREATE },
      { key: 'PRODUCTS_UPDATE', label: t('users:permissions.actions.update', 'تعديل'), value: PERMISSIONS.PRODUCTS_UPDATE },
      { key: 'PRODUCTS_DELETE', label: t('users:permissions.actions.delete', 'حذف'), value: PERMISSIONS.PRODUCTS_DELETE },
      { key: 'PRODUCTS_PUBLISH', label: t('users:permissions.actions.publish', 'نشر'), value: PERMISSIONS.PRODUCTS_PUBLISH },
      { key: 'PRODUCTS_UNPUBLISH', label: t('users:permissions.actions.unpublish', 'إلغاء النشر'), value: PERMISSIONS.PRODUCTS_UNPUBLISH },
    ],
  },
  {
    title: t('users:permissions.categories.categories.title', 'الفئات'),
    description: t('users:permissions.categories.categories.description', 'إدارة فئات المنتجات'),
    permissions: [
      { key: 'CATEGORIES_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.CATEGORIES_READ },
      { key: 'CATEGORIES_CREATE', label: t('users:permissions.actions.create', 'إنشاء'), value: PERMISSIONS.CATEGORIES_CREATE },
      { key: 'CATEGORIES_UPDATE', label: t('users:permissions.actions.update', 'تعديل'), value: PERMISSIONS.CATEGORIES_UPDATE },
      { key: 'CATEGORIES_DELETE', label: t('users:permissions.actions.delete', 'حذف'), value: PERMISSIONS.CATEGORIES_DELETE },
    ],
  },
  {
    title: t('users:permissions.categories.brands.title', 'العلامات التجارية'),
    description: t('users:permissions.categories.brands.description', 'إدارة العلامات التجارية للمنتجات'),
    permissions: [
      { key: 'BRANDS_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.BRANDS_READ },
      { key: 'BRANDS_CREATE', label: t('users:permissions.actions.create', 'إنشاء'), value: PERMISSIONS.BRANDS_CREATE },
      { key: 'BRANDS_UPDATE', label: t('users:permissions.actions.update', 'تعديل'), value: PERMISSIONS.BRANDS_UPDATE },
      { key: 'BRANDS_DELETE', label: t('users:permissions.actions.delete', 'حذف'), value: PERMISSIONS.BRANDS_DELETE },
    ],
  },
  {
    title: t('users:permissions.categories.attributes.title', 'الخصائص'),
    description: t('users:permissions.categories.attributes.description', 'إدارة خصائص ومواصفات المنتجات'),
    permissions: [
      { key: 'ATTRIBUTES_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.ATTRIBUTES_READ },
      { key: 'ATTRIBUTES_CREATE', label: t('users:permissions.actions.create', 'إنشاء'), value: PERMISSIONS.ATTRIBUTES_CREATE },
      { key: 'ATTRIBUTES_UPDATE', label: t('users:permissions.actions.update', 'تعديل'), value: PERMISSIONS.ATTRIBUTES_UPDATE },
      { key: 'ATTRIBUTES_DELETE', label: t('users:permissions.actions.delete', 'حذف'), value: PERMISSIONS.ATTRIBUTES_DELETE },
    ],
  },
  {
    title: t('users:permissions.categories.orders.title', 'الطلبات'),
    description: t('users:permissions.categories.orders.description', 'إدارة طلبات العملاء'),
    permissions: [
      { key: 'ORDERS_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.ORDERS_READ },
      { key: 'ORDERS_UPDATE', label: t('users:permissions.actions.update', 'تعديل'), value: PERMISSIONS.ORDERS_UPDATE },
      { key: 'ORDERS_CANCEL', label: t('users:permissions.actions.cancel', 'إلغاء'), value: PERMISSIONS.ORDERS_CANCEL },
      { key: 'ORDERS_REFUND', label: t('users:permissions.actions.refund', 'استرداد'), value: PERMISSIONS.ORDERS_REFUND },
      { key: 'ORDERS_STATUS_UPDATE', label: t('users:permissions.actions.statusUpdate', 'تحديث الحالة'), value: PERMISSIONS.ORDERS_STATUS_UPDATE },
    ],
  },
  {
    title: t('users:permissions.categories.carts.title', 'سلة التسوق'),
    description: t('users:permissions.categories.carts.description', 'إدارة سلات العملاء والتخلي عن الشراء'),
    permissions: [
      { key: 'CARTS_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.CARTS_READ },
      { key: 'CARTS_UPDATE', label: t('users:permissions.actions.update', 'تعديل'), value: PERMISSIONS.CARTS_UPDATE },
      { key: 'CARTS_DELETE', label: t('users:permissions.actions.delete', 'حذف'), value: PERMISSIONS.CARTS_DELETE },
      { key: 'CARTS_CONVERT_TO_ORDER', label: t('users:permissions.actions.convertToOrder', 'تحويل لطلب'), value: PERMISSIONS.CARTS_CONVERT_TO_ORDER },
      { key: 'CARTS_SEND_REMINDERS', label: t('users:permissions.actions.sendReminders', 'إرسال تذكيرات'), value: PERMISSIONS.CARTS_SEND_REMINDERS },
      { key: 'CARTS_BULK_ACTIONS', label: t('users:permissions.actions.bulkActions', 'عمليات جماعية'), value: PERMISSIONS.CARTS_BULK_ACTIONS },
    ],
  },
  {
    title: t('users:permissions.categories.services.title', 'الخدمات'),
    description: t('users:permissions.categories.services.description', 'إدارة طلبات الخدمات والمهندسين'),
    permissions: [
      { key: 'SERVICES_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.SERVICES_READ },
      { key: 'SERVICES_UPDATE', label: t('users:permissions.actions.update', 'تعديل'), value: PERMISSIONS.SERVICES_UPDATE },
      { key: 'SERVICES_CANCEL', label: t('users:permissions.actions.cancel', 'إلغاء'), value: PERMISSIONS.SERVICES_CANCEL },
      { key: 'SERVICES_ASSIGN', label: t('users:permissions.actions.assign', 'إسناد'), value: PERMISSIONS.SERVICES_ASSIGN },
    ],
  },
  {
    title: t('users:permissions.categories.support.title', 'الدعم الفني'),
    description: t('users:permissions.categories.support.description', 'إدارة تذاكر الدعم الفني'),
    permissions: [
      { key: 'SUPPORT_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.SUPPORT_READ },
      { key: 'SUPPORT_UPDATE', label: t('users:permissions.actions.update', 'تعديل'), value: PERMISSIONS.SUPPORT_UPDATE },
      { key: 'SUPPORT_ASSIGN', label: t('users:permissions.actions.assign', 'إسناد'), value: PERMISSIONS.SUPPORT_ASSIGN },
      { key: 'SUPPORT_CLOSE', label: t('users:permissions.actions.close', 'إغلاق'), value: PERMISSIONS.SUPPORT_CLOSE },
    ],
  },
  {
    title: t('users:permissions.categories.marketing.title', 'التسويق والعروض'),
    description: t('users:permissions.categories.marketing.description', 'إدارة الحملات التسويقية والكوبونات'),
    permissions: [
      { key: 'MARKETING_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.MARKETING_READ },
      { key: 'MARKETING_CREATE', label: t('users:permissions.actions.create', 'إنشاء'), value: PERMISSIONS.MARKETING_CREATE },
      { key: 'MARKETING_UPDATE', label: t('users:permissions.actions.update', 'تعديل'), value: PERMISSIONS.MARKETING_UPDATE },
      { key: 'MARKETING_DELETE', label: t('users:permissions.actions.delete', 'حذف'), value: PERMISSIONS.MARKETING_DELETE },
      { key: 'MARKETING_PUBLISH', label: t('users:permissions.actions.publish', 'نشر'), value: PERMISSIONS.MARKETING_PUBLISH },
      { key: 'MARKETING_ANALYZE', label: t('users:permissions.actions.analyze', 'تحليل'), value: PERMISSIONS.MARKETING_ANALYZE },
    ],
  },
  {
    title: t('users:permissions.categories.analytics.title', 'التحليلات والتقارير'),
    description: t('users:permissions.categories.analytics.description', 'عرض وتصدير البيانات والتقارير'),
    permissions: [
      { key: 'ANALYTICS_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.ANALYTICS_READ },
      { key: 'ANALYTICS_EXPORT', label: t('users:permissions.actions.export', 'تصدير'), value: PERMISSIONS.ANALYTICS_EXPORT },
      { key: 'REPORTS_GENERATE', label: t('users:permissions.actions.generateReports', 'إنشاء تقارير'), value: PERMISSIONS.REPORTS_GENERATE },
      { key: 'REPORTS_SCHEDULE', label: t('users:permissions.actions.scheduleReports', 'جدولة تقارير'), value: PERMISSIONS.REPORTS_SCHEDULE },
    ],
  },
  {
    title: t('users:permissions.categories.media.title', 'الوسائط والرفع'),
    description: t('users:permissions.categories.media.description', 'إدارة الملفات والصور'),
    permissions: [
      { key: 'MEDIA_MANAGE', label: t('users:permissions.actions.manageMedia', 'إدارة وسائط'), value: PERMISSIONS.MEDIA_MANAGE },
      { key: 'MEDIA_DELETE', label: t('users:permissions.actions.deleteMedia', 'حذف وسائط'), value: PERMISSIONS.MEDIA_DELETE },
      { key: 'UPLOAD_MANAGE', label: t('users:permissions.actions.manageUpload', 'إدارة رفع'), value: PERMISSIONS.UPLOAD_MANAGE },
      { key: 'UPLOAD_DELETE', label: t('users:permissions.actions.deleteUpload', 'حذف مرفوعات'), value: PERMISSIONS.UPLOAD_DELETE },
    ],
  },
  {
    title: t('users:permissions.categories.notifications.title', 'الإشعارات'),
    description: t('users:permissions.categories.notifications.description', 'إدارة إشعارات النظام'),
    permissions: [
      { key: 'NOTIFICATIONS_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.NOTIFICATIONS_READ },
      { key: 'NOTIFICATIONS_CREATE', label: t('users:permissions.actions.create', 'إنشاء'), value: PERMISSIONS.NOTIFICATIONS_CREATE },
      { key: 'NOTIFICATIONS_UPDATE', label: t('users:permissions.actions.update', 'تعديل'), value: PERMISSIONS.NOTIFICATIONS_UPDATE },
      { key: 'NOTIFICATIONS_DELETE', label: t('users:permissions.actions.delete', 'حذف'), value: PERMISSIONS.NOTIFICATIONS_DELETE },
      { key: 'NOTIFICATIONS_SEND', label: t('users:permissions.actions.send', 'إرسال'), value: PERMISSIONS.NOTIFICATIONS_SEND },
      { key: 'NOTIFICATIONS_MANAGE', label: t('users:permissions.actions.manageFull', 'إدارة كاملة'), value: PERMISSIONS.NOTIFICATIONS_MANAGE },
    ],
  },
  {
    title: t('users:permissions.categories.capabilities.title', 'القدرات والقبول'),
    description: t('users:permissions.categories.capabilities.description', 'الموافقة على قدرات المهندسين والتجار'),
    permissions: [
      { key: 'CAPABILITIES_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.CAPABILITIES_READ },
      { key: 'CAPABILITIES_UPDATE', label: t('users:permissions.actions.update', 'تعديل'), value: PERMISSIONS.CAPABILITIES_UPDATE },
      { key: 'CAPABILITIES_APPROVE', label: t('users:permissions.actions.approve', 'قبول'), value: PERMISSIONS.CAPABILITIES_APPROVE },
      { key: 'CAPABILITIES_REJECT', label: t('users:permissions.actions.reject', 'رفض'), value: PERMISSIONS.CAPABILITIES_REJECT },
    ],
  },
  {
    title: t('users:permissions.categories.favorites.title', 'المفضلات'),
    description: t('users:permissions.categories.favorites.description', 'إدارة مفضلات المستخدمين'),
    permissions: [
      { key: 'FAVORITES_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.FAVORITES_READ },
      { key: 'FAVORITES_MANAGE', label: t('users:permissions.actions.manage', 'إدارة'), value: PERMISSIONS.FAVORITES_MANAGE },
    ],
  },
  {
    title: t('users:permissions.categories.addresses.title', 'العناوين'),
    description: t('users:permissions.categories.addresses.description', 'إدارة عناوين العملاء'),
    permissions: [
      { key: 'ADDRESSES_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.ADDRESSES_READ },
      { key: 'ADDRESSES_MANAGE', label: t('users:permissions.actions.manage', 'إدارة'), value: PERMISSIONS.ADDRESSES_MANAGE },
      { key: 'ADDRESSES_ANALYTICS', label: t('users:permissions.actions.analytics', 'تحليلات'), value: PERMISSIONS.ADDRESSES_ANALYTICS },
    ],
  },
  {
    title: t('users:permissions.categories.exchangeRates.title', 'أسعار الصرف'),
    description: t('users:permissions.categories.exchangeRates.description', 'إدارة أسعار العملات'),
    permissions: [
      { key: 'EXCHANGE_RATES_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.EXCHANGE_RATES_READ },
      { key: 'EXCHANGE_RATES_UPDATE', label: t('users:permissions.actions.update', 'تحديث'), value: PERMISSIONS.EXCHANGE_RATES_UPDATE },
      { key: 'EXCHANGE_RATES_MANUAL_UPDATE', label: t('users:permissions.actions.manualUpdate', 'تحديث يدوي'), value: PERMISSIONS.EXCHANGE_RATES_MANUAL_UPDATE },
    ],
  },
  {
    title: t('users:permissions.categories.audit.title', 'التدقيق والمراجعة'),
    description: t('users:permissions.categories.audit.description', 'عرض سجلات النظام والتدقيق'),
    permissions: [
      { key: 'AUDIT_READ', label: t('users:permissions.actions.read', 'عرض'), value: PERMISSIONS.AUDIT_READ },
      { key: 'AUDIT_MANAGE', label: t('users:permissions.actions.manage', 'إدارة'), value: PERMISSIONS.AUDIT_MANAGE },
      { key: 'AUDIT_DELETE', label: t('users:permissions.actions.delete', 'حذف'), value: PERMISSIONS.AUDIT_DELETE },
    ],
  },
  {
    title: t('users:permissions.categories.settings.title', 'إعدادات النظام'),
    description: t('users:permissions.categories.settings.description', 'إدارة إعدادات وصيانة النظام'),
    permissions: [
      { key: 'SETTINGS_READ', label: t('users:permissions.actions.readSettings', 'عرض إعدادات'), value: PERMISSIONS.SETTINGS_READ },
      { key: 'SETTINGS_UPDATE', label: t('users:permissions.actions.updateSettings', 'تعديل إعدادات'), value: PERMISSIONS.SETTINGS_UPDATE },
      { key: 'SYSTEM_MAINTENANCE', label: t('users:permissions.actions.systemMaintenance', 'صيانة النظام'), value: PERMISSIONS.SYSTEM_MAINTENANCE },
      { key: 'SYSTEM_BACKUP', label: t('users:permissions.actions.systemBackup', 'نسخ احتياطي'), value: PERMISSIONS.SYSTEM_BACKUP },
      { key: 'SYSTEM_LOGS', label: t('users:permissions.actions.systemLogs', 'سجلات النظام'), value: PERMISSIONS.SYSTEM_LOGS },
    ],
  },
];

interface PermissionSelectorProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  selectedPermissions,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedCategory, setExpandedCategory] = useState<string | false>(false);

  const PERMISSION_CATEGORIES: PermissionCategory[] = getPermissionCategories(t);

  const handleCategoryToggle = (categoryIndex: string) => {
    setExpandedCategory(expandedCategory === categoryIndex ? false : categoryIndex);
  };

  const handlePermissionToggle = (permissionValue: string) => {
    const isSelected = selectedPermissions.includes(permissionValue);

    if (isSelected) {
      onChange(selectedPermissions.filter((p) => p !== permissionValue));
    } else {
      onChange([...selectedPermissions, permissionValue]);
    }
  };

  const handleCategorySelectAll = (category: PermissionCategory) => {
    const categoryPermissionValues = category.permissions.map((p) => p.value);
    const allSelected = categoryPermissionValues.every((p) =>
      selectedPermissions.includes(p)
    );

    if (allSelected) {
      // Deselect all from this category
      onChange(selectedPermissions.filter((p) => !categoryPermissionValues.includes(p)));
    } else {
      // Select all from this category
      const newPermissions = [...selectedPermissions];
      categoryPermissionValues.forEach((p) => {
        if (!newPermissions.includes(p)) {
          newPermissions.push(p);
        }
      });
      onChange(newPermissions);
    }
  };

  const isCategoryFullySelected = (category: PermissionCategory) => {
    return category.permissions.every((p) => selectedPermissions.includes(p.value));
  };

  const isCategoryPartiallySelected = (category: PermissionCategory) => {
    const selectedCount = category.permissions.filter((p) =>
      selectedPermissions.includes(p.value)
    ).length;
    return selectedCount > 0 && selectedCount < category.permissions.length;
  };

  const totalPermissions = PERMISSION_CATEGORIES.reduce(
    (sum, cat) => sum + cat.permissions.length,
    0
  );

  return (
    <Box>
      <Alert
        severity="info"
        sx={{
          mb: 2,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : undefined,
        }}
      >
        <Typography
          variant="body2"
          fontWeight="bold"
          gutterBottom
          sx={{
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            color: 'text.primary',
          }}
        >
          {t('users:permissions.selectedCount', '{{selected}} صلاحية محددة من {{total}} صلاحية', {
            selected: selectedPermissions.length,
            total: totalPermissions,
          })}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.8125rem' },
            color: 'text.secondary',
          }}
        >
          {t(
            'users:permissions.description',
            'اختر الصلاحيات المناسبة للأدمن. يمكنك تحديد/إلغاء تحديد فئات كاملة أو صلاحيات فردية.'
          )}
        </Typography>
      </Alert>

      {PERMISSION_CATEGORIES.map((category, index) => {
        const fullySelected = isCategoryFullySelected(category);
        const partiallySelected = isCategoryPartiallySelected(category);

        return (
          <Accordion
            key={index}
            expanded={expandedCategory === `panel${index}`}
            onChange={() => handleCategoryToggle(`panel${index}`)}
            disabled={disabled}
            sx={{
              mb: 1,
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              boxShadow: theme.palette.mode === 'dark' ? 1 : 0,
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  my: { xs: 1, sm: 1.5 },
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 0 },
                }}
              >
                <Box sx={{ flex: 1, width: '100%' }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      color: 'text.primary',
                      mb: 0.5,
                    }}
                  >
                    {category.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    {category.description}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'space-between', sm: 'flex-end' },
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Chip
                    size="small"
                    label={`${category.permissions.filter((p) => selectedPermissions.includes(p.value)).length}/${category.permissions.length}`}
                    color={fullySelected ? 'primary' : partiallySelected ? 'warning' : 'default'}
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      height: { xs: 22, sm: 24 },
                    }}
                  />
                  <Box
                    component="div"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!disabled) {
                        handleCategorySelectAll(category);
                      }
                    }}
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 0.5, sm: 0.75 },
                      minWidth: { xs: 'auto', sm: 100 },
                      flex: { xs: 1, sm: 'none' },
                      borderRadius: 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${fullySelected ? theme.palette.primary.main : 'transparent'}`,
                      bgcolor: fullySelected 
                        ? 'transparent' 
                        : disabled 
                          ? theme.palette.action.disabledBackground
                          : theme.palette.primary.main,
                      color: fullySelected
                        ? theme.palette.primary.main
                        : disabled
                          ? theme.palette.action.disabled
                          : theme.palette.primary.contrastText,
                      '&:hover': {
                        bgcolor: disabled
                          ? theme.palette.action.disabledBackground
                          : fullySelected
                            ? theme.palette.primary.light + '20'
                            : theme.palette.primary.dark,
                        opacity: disabled ? 1 : 0.9,
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {fullySelected
                      ? t('users:permissions.deselectAll', 'إلغاء الكل')
                      : t('users:permissions.selectAll', 'تحديد الكل')}
                  </Box>
                </Stack>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: { xs: 1, sm: 1.5 },
                }}
              >
                {category.permissions.map((permission) => (
                  <FormControlLabel
                    key={permission.key}
                    control={
                      <Checkbox
                        checked={selectedPermissions.includes(permission.value)}
                        onChange={() => handlePermissionToggle(permission.value)}
                        disabled={disabled}
                        icon={<RadioButtonUnchecked />}
                        checkedIcon={<CheckCircle />}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                          color: theme.palette.mode === 'dark' ? 'text.secondary' : undefined,
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                            color: 'text.primary',
                          }}
                        >
                          {permission.label}
                        </Typography>
                        {permission.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              mt: 0.25,
                            }}
                          >
                            {permission.description}
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{
                      m: 0,
                      alignItems: 'flex-start',
                      '& .MuiFormControlLabel-label': {
                        flex: 1,
                      },
                    }}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

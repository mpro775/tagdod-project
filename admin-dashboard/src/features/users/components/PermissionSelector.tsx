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
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { ExpandMore, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { PERMISSIONS } from '@/shared/constants/permissions';

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

// تنظيم الصلاحيات في فئات
const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    title: 'المستخدمون',
    description: 'إدارة المستخدمين والحسابات',
    permissions: [
      { key: 'USERS_READ', label: 'عرض', value: PERMISSIONS.USERS_READ, description: 'عرض قائمة المستخدمين' },
      { key: 'USERS_CREATE', label: 'إنشاء', value: PERMISSIONS.USERS_CREATE, description: 'إنشاء مستخدمين جدد' },
      { key: 'USERS_UPDATE', label: 'تعديل', value: PERMISSIONS.USERS_UPDATE, description: 'تعديل بيانات المستخدمين' },
      { key: 'USERS_DELETE', label: 'حذف', value: PERMISSIONS.USERS_DELETE, description: 'حذف المستخدمين' },
      { key: 'USERS_SUSPEND', label: 'تعليق', value: PERMISSIONS.USERS_SUSPEND, description: 'تعليق الحسابات' },
      { key: 'USERS_ACTIVATE', label: 'تفعيل', value: PERMISSIONS.USERS_ACTIVATE, description: 'تفعيل الحسابات المعلقة' },
      { key: 'USERS_RESTORE', label: 'استرجاع', value: PERMISSIONS.USERS_RESTORE, description: 'استرجاع المستخدمين المحذوفين' },
    ],
  },
  {
    title: 'الأدوار والصلاحيات',
    description: 'إدارة أدوار النظام والصلاحيات',
    permissions: [
      { key: 'ROLES_READ', label: 'عرض', value: PERMISSIONS.ROLES_READ },
      { key: 'ROLES_CREATE', label: 'إنشاء', value: PERMISSIONS.ROLES_CREATE },
      { key: 'ROLES_UPDATE', label: 'تعديل', value: PERMISSIONS.ROLES_UPDATE },
      { key: 'ROLES_DELETE', label: 'حذف', value: PERMISSIONS.ROLES_DELETE },
      { key: 'ROLES_ASSIGN', label: 'إسناد', value: PERMISSIONS.ROLES_ASSIGN },
      { key: 'ROLES_REVOKE', label: 'إلغاء', value: PERMISSIONS.ROLES_REVOKE },
    ],
  },
  {
    title: 'المنتجات',
    description: 'إدارة المنتجات والكتالوج',
    permissions: [
      { key: 'PRODUCTS_READ', label: 'عرض', value: PERMISSIONS.PRODUCTS_READ },
      { key: 'PRODUCTS_CREATE', label: 'إنشاء', value: PERMISSIONS.PRODUCTS_CREATE },
      { key: 'PRODUCTS_UPDATE', label: 'تعديل', value: PERMISSIONS.PRODUCTS_UPDATE },
      { key: 'PRODUCTS_DELETE', label: 'حذف', value: PERMISSIONS.PRODUCTS_DELETE },
      { key: 'PRODUCTS_PUBLISH', label: 'نشر', value: PERMISSIONS.PRODUCTS_PUBLISH },
      { key: 'PRODUCTS_UNPUBLISH', label: 'إلغاء النشر', value: PERMISSIONS.PRODUCTS_UNPUBLISH },
    ],
  },
  {
    title: 'الفئات',
    description: 'إدارة فئات المنتجات',
    permissions: [
      { key: 'CATEGORIES_READ', label: 'عرض', value: PERMISSIONS.CATEGORIES_READ },
      { key: 'CATEGORIES_CREATE', label: 'إنشاء', value: PERMISSIONS.CATEGORIES_CREATE },
      { key: 'CATEGORIES_UPDATE', label: 'تعديل', value: PERMISSIONS.CATEGORIES_UPDATE },
      { key: 'CATEGORIES_DELETE', label: 'حذف', value: PERMISSIONS.CATEGORIES_DELETE },
    ],
  },
  {
    title: 'العلامات التجارية',
    description: 'إدارة العلامات التجارية للمنتجات',
    permissions: [
      { key: 'BRANDS_READ', label: 'عرض', value: PERMISSIONS.BRANDS_READ },
      { key: 'BRANDS_CREATE', label: 'إنشاء', value: PERMISSIONS.BRANDS_CREATE },
      { key: 'BRANDS_UPDATE', label: 'تعديل', value: PERMISSIONS.BRANDS_UPDATE },
      { key: 'BRANDS_DELETE', label: 'حذف', value: PERMISSIONS.BRANDS_DELETE },
    ],
  },
  {
    title: 'الخصائص',
    description: 'إدارة خصائص ومواصفات المنتجات',
    permissions: [
      { key: 'ATTRIBUTES_READ', label: 'عرض', value: PERMISSIONS.ATTRIBUTES_READ },
      { key: 'ATTRIBUTES_CREATE', label: 'إنشاء', value: PERMISSIONS.ATTRIBUTES_CREATE },
      { key: 'ATTRIBUTES_UPDATE', label: 'تعديل', value: PERMISSIONS.ATTRIBUTES_UPDATE },
      { key: 'ATTRIBUTES_DELETE', label: 'حذف', value: PERMISSIONS.ATTRIBUTES_DELETE },
    ],
  },
  {
    title: 'الطلبات',
    description: 'إدارة طلبات العملاء',
    permissions: [
      { key: 'ORDERS_READ', label: 'عرض', value: PERMISSIONS.ORDERS_READ },
      { key: 'ORDERS_UPDATE', label: 'تعديل', value: PERMISSIONS.ORDERS_UPDATE },
      { key: 'ORDERS_CANCEL', label: 'إلغاء', value: PERMISSIONS.ORDERS_CANCEL },
      { key: 'ORDERS_REFUND', label: 'استرداد', value: PERMISSIONS.ORDERS_REFUND },
      { key: 'ORDERS_STATUS_UPDATE', label: 'تحديث الحالة', value: PERMISSIONS.ORDERS_STATUS_UPDATE },
    ],
  },
  {
    title: 'سلة التسوق',
    description: 'إدارة سلات العملاء والتخلي عن الشراء',
    permissions: [
      { key: 'CARTS_READ', label: 'عرض', value: PERMISSIONS.CARTS_READ },
      { key: 'CARTS_UPDATE', label: 'تعديل', value: PERMISSIONS.CARTS_UPDATE },
      { key: 'CARTS_DELETE', label: 'حذف', value: PERMISSIONS.CARTS_DELETE },
      { key: 'CARTS_CONVERT_TO_ORDER', label: 'تحويل لطلب', value: PERMISSIONS.CARTS_CONVERT_TO_ORDER },
      { key: 'CARTS_SEND_REMINDERS', label: 'إرسال تذكيرات', value: PERMISSIONS.CARTS_SEND_REMINDERS },
      { key: 'CARTS_BULK_ACTIONS', label: 'عمليات جماعية', value: PERMISSIONS.CARTS_BULK_ACTIONS },
    ],
  },
  {
    title: 'الخدمات',
    description: 'إدارة طلبات الخدمات والمهندسين',
    permissions: [
      { key: 'SERVICES_READ', label: 'عرض', value: PERMISSIONS.SERVICES_READ },
      { key: 'SERVICES_UPDATE', label: 'تعديل', value: PERMISSIONS.SERVICES_UPDATE },
      { key: 'SERVICES_CANCEL', label: 'إلغاء', value: PERMISSIONS.SERVICES_CANCEL },
      { key: 'SERVICES_ASSIGN', label: 'إسناد', value: PERMISSIONS.SERVICES_ASSIGN },
    ],
  },
  {
    title: 'الدعم الفني',
    description: 'إدارة تذاكر الدعم الفني',
    permissions: [
      { key: 'SUPPORT_READ', label: 'عرض', value: PERMISSIONS.SUPPORT_READ },
      { key: 'SUPPORT_UPDATE', label: 'تعديل', value: PERMISSIONS.SUPPORT_UPDATE },
      { key: 'SUPPORT_ASSIGN', label: 'إسناد', value: PERMISSIONS.SUPPORT_ASSIGN },
      { key: 'SUPPORT_CLOSE', label: 'إغلاق', value: PERMISSIONS.SUPPORT_CLOSE },
    ],
  },
  {
    title: 'التسويق والعروض',
    description: 'إدارة الحملات التسويقية والكوبونات',
    permissions: [
      { key: 'MARKETING_READ', label: 'عرض', value: PERMISSIONS.MARKETING_READ },
      { key: 'MARKETING_CREATE', label: 'إنشاء', value: PERMISSIONS.MARKETING_CREATE },
      { key: 'MARKETING_UPDATE', label: 'تعديل', value: PERMISSIONS.MARKETING_UPDATE },
      { key: 'MARKETING_DELETE', label: 'حذف', value: PERMISSIONS.MARKETING_DELETE },
      { key: 'MARKETING_PUBLISH', label: 'نشر', value: PERMISSIONS.MARKETING_PUBLISH },
      { key: 'MARKETING_ANALYZE', label: 'تحليل', value: PERMISSIONS.MARKETING_ANALYZE },
    ],
  },
  {
    title: 'التحليلات والتقارير',
    description: 'عرض وتصدير البيانات والتقارير',
    permissions: [
      { key: 'ANALYTICS_READ', label: 'عرض', value: PERMISSIONS.ANALYTICS_READ },
      { key: 'ANALYTICS_EXPORT', label: 'تصدير', value: PERMISSIONS.ANALYTICS_EXPORT },
      { key: 'REPORTS_GENERATE', label: 'إنشاء تقارير', value: PERMISSIONS.REPORTS_GENERATE },
      { key: 'REPORTS_SCHEDULE', label: 'جدولة تقارير', value: PERMISSIONS.REPORTS_SCHEDULE },
    ],
  },
  {
    title: 'الوسائط والرفع',
    description: 'إدارة الملفات والصور',
    permissions: [
      { key: 'MEDIA_MANAGE', label: 'إدارة وسائط', value: PERMISSIONS.MEDIA_MANAGE },
      { key: 'MEDIA_DELETE', label: 'حذف وسائط', value: PERMISSIONS.MEDIA_DELETE },
      { key: 'UPLOAD_MANAGE', label: 'إدارة رفع', value: PERMISSIONS.UPLOAD_MANAGE },
      { key: 'UPLOAD_DELETE', label: 'حذف مرفوعات', value: PERMISSIONS.UPLOAD_DELETE },
    ],
  },
  {
    title: 'الإشعارات',
    description: 'إدارة إشعارات النظام',
    permissions: [
      { key: 'NOTIFICATIONS_READ', label: 'عرض', value: PERMISSIONS.NOTIFICATIONS_READ },
      { key: 'NOTIFICATIONS_CREATE', label: 'إنشاء', value: PERMISSIONS.NOTIFICATIONS_CREATE },
      { key: 'NOTIFICATIONS_UPDATE', label: 'تعديل', value: PERMISSIONS.NOTIFICATIONS_UPDATE },
      { key: 'NOTIFICATIONS_DELETE', label: 'حذف', value: PERMISSIONS.NOTIFICATIONS_DELETE },
      { key: 'NOTIFICATIONS_SEND', label: 'إرسال', value: PERMISSIONS.NOTIFICATIONS_SEND },
      { key: 'NOTIFICATIONS_MANAGE', label: 'إدارة كاملة', value: PERMISSIONS.NOTIFICATIONS_MANAGE },
    ],
  },
  {
    title: 'القدرات والقبول',
    description: 'الموافقة على قدرات المهندسين والتجار',
    permissions: [
      { key: 'CAPABILITIES_READ', label: 'عرض', value: PERMISSIONS.CAPABILITIES_READ },
      { key: 'CAPABILITIES_UPDATE', label: 'تعديل', value: PERMISSIONS.CAPABILITIES_UPDATE },
      { key: 'CAPABILITIES_APPROVE', label: 'قبول', value: PERMISSIONS.CAPABILITIES_APPROVE },
      { key: 'CAPABILITIES_REJECT', label: 'رفض', value: PERMISSIONS.CAPABILITIES_REJECT },
    ],
  },
  {
    title: 'المفضلات',
    description: 'إدارة مفضلات المستخدمين',
    permissions: [
      { key: 'FAVORITES_READ', label: 'عرض', value: PERMISSIONS.FAVORITES_READ },
      { key: 'FAVORITES_MANAGE', label: 'إدارة', value: PERMISSIONS.FAVORITES_MANAGE },
    ],
  },
  {
    title: 'العناوين',
    description: 'إدارة عناوين العملاء',
    permissions: [
      { key: 'ADDRESSES_READ', label: 'عرض', value: PERMISSIONS.ADDRESSES_READ },
      { key: 'ADDRESSES_MANAGE', label: 'إدارة', value: PERMISSIONS.ADDRESSES_MANAGE },
      { key: 'ADDRESSES_ANALYTICS', label: 'تحليلات', value: PERMISSIONS.ADDRESSES_ANALYTICS },
    ],
  },
  {
    title: 'أسعار الصرف',
    description: 'إدارة أسعار العملات',
    permissions: [
      { key: 'EXCHANGE_RATES_READ', label: 'عرض', value: PERMISSIONS.EXCHANGE_RATES_READ },
      { key: 'EXCHANGE_RATES_UPDATE', label: 'تحديث', value: PERMISSIONS.EXCHANGE_RATES_UPDATE },
      { key: 'EXCHANGE_RATES_MANUAL_UPDATE', label: 'تحديث يدوي', value: PERMISSIONS.EXCHANGE_RATES_MANUAL_UPDATE },
    ],
  },
  {
    title: 'التدقيق والمراجعة',
    description: 'عرض سجلات النظام والتدقيق',
    permissions: [
      { key: 'AUDIT_READ', label: 'عرض', value: PERMISSIONS.AUDIT_READ },
      { key: 'AUDIT_MANAGE', label: 'إدارة', value: PERMISSIONS.AUDIT_MANAGE },
      { key: 'AUDIT_DELETE', label: 'حذف', value: PERMISSIONS.AUDIT_DELETE },
    ],
  },
  {
    title: 'إعدادات النظام',
    description: 'إدارة إعدادات وصيانة النظام',
    permissions: [
      { key: 'SETTINGS_READ', label: 'عرض إعدادات', value: PERMISSIONS.SETTINGS_READ },
      { key: 'SETTINGS_UPDATE', label: 'تعديل إعدادات', value: PERMISSIONS.SETTINGS_UPDATE },
      { key: 'SYSTEM_MAINTENANCE', label: 'صيانة النظام', value: PERMISSIONS.SYSTEM_MAINTENANCE },
      { key: 'SYSTEM_BACKUP', label: 'نسخ احتياطي', value: PERMISSIONS.SYSTEM_BACKUP },
      { key: 'SYSTEM_LOGS', label: 'سجلات النظام', value: PERMISSIONS.SYSTEM_LOGS },
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
  const [expandedCategory, setExpandedCategory] = useState<string | false>(false);

  const handleCategoryToggle = (categoryIndex: string) => {
    setExpandedCategory(expandedCategory === categoryIndex ? false : categoryIndex);
  };

  const handlePermissionToggle = (permissionValue: string) => {
    const isSelected = selectedPermissions.includes(permissionValue);
    
    if (isSelected) {
      onChange(selectedPermissions.filter(p => p !== permissionValue));
    } else {
      onChange([...selectedPermissions, permissionValue]);
    }
  };

  const handleCategorySelectAll = (category: PermissionCategory) => {
    const categoryPermissionValues = category.permissions.map(p => p.value);
    const allSelected = categoryPermissionValues.every(p => selectedPermissions.includes(p));

    if (allSelected) {
      // Deselect all from this category
      onChange(selectedPermissions.filter(p => !categoryPermissionValues.includes(p)));
    } else {
      // Select all from this category
      const newPermissions = [...selectedPermissions];
      categoryPermissionValues.forEach(p => {
        if (!newPermissions.includes(p)) {
          newPermissions.push(p);
        }
      });
      onChange(newPermissions);
    }
  };

  const isCategoryFullySelected = (category: PermissionCategory) => {
    return category.permissions.every(p => selectedPermissions.includes(p.value));
  };

  const isCategoryPartiallySelected = (category: PermissionCategory) => {
    const selectedCount = category.permissions.filter(p => selectedPermissions.includes(p.value)).length;
    return selectedCount > 0 && selectedCount < category.permissions.length;
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          {selectedPermissions.length} صلاحية محددة من {PERMISSION_CATEGORIES.reduce((sum, cat) => sum + cat.permissions.length, 0)} صلاحية
        </Typography>
        <Typography variant="caption">
          اختر الصلاحيات المناسبة للأدمن. يمكنك تحديد/إلغاء تحديد فئات كاملة أو صلاحيات فردية.
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
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {category.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {category.description}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={`${category.permissions.filter(p => selectedPermissions.includes(p.value)).length}/${category.permissions.length}`}
                    color={fullySelected ? 'primary' : partiallySelected ? 'warning' : 'default'}
                  />
                  <Button
                    size="small"
                    variant={fullySelected ? 'outlined' : 'contained'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategorySelectAll(category);
                    }}
                    disabled={disabled}
                  >
                    {fullySelected ? 'إلغاء الكل' : 'تحديد الكل'}
                  </Button>
                </Stack>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1 }}>
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
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">{permission.label}</Typography>
                        {permission.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {permission.description}
                          </Typography>
                        )}
                      </Box>
                    }
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


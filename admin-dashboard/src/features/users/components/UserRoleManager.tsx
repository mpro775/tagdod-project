import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { UserRole, UserStatus } from '../types/user.types';

interface UserRoleManagerProps {
  roles: UserRole[];
  permissions: string[];
  onRolesChange: (roles: UserRole[]) => void;
  onPermissionsChange: (permissions: string[]) => void;
  disabled?: boolean;
}

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.USER]: 'مستخدم',
  [UserRole.ADMIN]: 'مدير',
  [UserRole.SUPER_ADMIN]: 'مدير عام',
  [UserRole.MERCHANT]: 'تاجر',
  [UserRole.ENGINEER]: 'مهندس',
};

const ROLE_COLORS: Record<UserRole, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [UserRole.USER]: 'default',
  [UserRole.ADMIN]: 'warning',
  [UserRole.SUPER_ADMIN]: 'error',
  [UserRole.MERCHANT]: 'info',
  [UserRole.ENGINEER]: 'success',
};

const PERMISSION_GROUPS = {
  users: {
    title: 'إدارة المستخدمين',
    permissions: [
      'users.read',
      'users.create',
      'users.update',
      'users.delete',
      'users.suspend',
      'users.activate',
      'users.restore',
    ],
  },
  products: {
    title: 'إدارة المنتجات',
    permissions: [
      'products.read',
      'products.create',
      'products.update',
      'products.delete',
      'products.publish',
      'products.unpublish',
    ],
  },
  orders: {
    title: 'إدارة الطلبات',
    permissions: [
      'orders.read',
      'orders.update',
      'orders.cancel',
      'orders.refund',
      'orders.status_update',
    ],
  },
  marketing: {
    title: 'التسويق والعروض',
    permissions: [
      'marketing.read',
      'marketing.create',
      'marketing.update',
      'marketing.delete',
      'carts.send_reminders',
    ],
  },
  analytics: {
    title: 'التحليلات والتقارير',
    permissions: [
      'analytics.read',
      'reports.generate',
      'analytics.export',
    ],
  },
  support: {
    title: 'الدعم الفني',
    permissions: [
      'support.read',
      'support.update',
      'support.assign',
    ],
  },
  system: {
    title: 'النظام والإعدادات',
    permissions: [
      'settings.read',
      'settings.update',
      'exchange_rates.read',
      'exchange_rates.update',
      'system.logs',
    ],
  },
};

export const UserRoleManager: React.FC<UserRoleManagerProps> = ({
  roles,
  permissions,
  onRolesChange,
  onPermissionsChange,
  disabled = false,
}) => {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [selectedPermission, setSelectedPermission] = useState<string>('');

  const handleAddRole = () => {
    if (selectedRole && !roles.includes(selectedRole as UserRole)) {
      onRolesChange([...roles, selectedRole as UserRole]);
      setSelectedRole('');
      setRoleDialogOpen(false);
    }
  };

  const handleRemoveRole = (roleToRemove: UserRole) => {
    onRolesChange(roles.filter(role => role !== roleToRemove));
  };

  const handleAddPermission = () => {
    if (selectedPermission && !permissions.includes(selectedPermission)) {
      onPermissionsChange([...permissions, selectedPermission]);
      setSelectedPermission('');
      setPermissionDialogOpen(false);
    }
  };

  const handleRemovePermission = (permissionToRemove: string) => {
    onPermissionsChange(permissions.filter(permission => permission !== permissionToRemove));
  };

  const handlePermissionGroupToggle = (groupPermissions: string[]) => {
    const hasAllPermissions = groupPermissions.every(perm => permissions.includes(perm));
    
    if (hasAllPermissions) {
      // إزالة جميع صلاحيات المجموعة
      onPermissionsChange(permissions.filter(perm => !groupPermissions.includes(perm)));
    } else {
      // إضافة جميع صلاحيات المجموعة
      const newPermissions = [...permissions];
      groupPermissions.forEach(perm => {
        if (!newPermissions.includes(perm)) {
          newPermissions.push(perm);
        }
      });
      onPermissionsChange(newPermissions);
    }
  };

  return (
    <Box>
      {/* الأدوار */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              الأدوار
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {roles.map((role) => (
              <Chip
                key={role}
                label={ROLE_LABELS[role]}
                color={ROLE_COLORS[role]}
                onDelete={!disabled ? () => handleRemoveRole(role) : undefined}
                deleteIcon={<DeleteIcon />}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>

          {!disabled && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setRoleDialogOpen(true)}
              size="small"
            >
              إضافة دور
            </Button>
          )}
        </CardContent>
      </Card>

      {/* الصلاحيات */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SecurityIcon sx={{ mr: 1, color: 'secondary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              الصلاحيات المخصصة
            </Typography>
          </Box>

          {/* مجموعات الصلاحيات */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
              const hasAllPermissions = group.permissions.every(perm => permissions.includes(perm));
              const hasSomePermissions = group.permissions.some(perm => permissions.includes(perm));
              
              return (
                <Grid item xs={12} sm={6} md={4} key={groupKey}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: disabled ? 'default' : 'pointer',
                      borderColor: hasAllPermissions ? 'primary.main' : hasSomePermissions ? 'warning.main' : 'grey.300',
                      '&:hover': disabled ? {} : { borderColor: 'primary.main' }
                    }}
                    onClick={!disabled ? () => handlePermissionGroupToggle(group.permissions) : undefined}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                        {group.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.permissions.filter(perm => permissions.includes(perm)).length} / {group.permissions.length} صلاحية
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* الصلاحيات المحددة */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {permissions.map((permission) => (
              <Chip
                key={permission}
                label={permission}
                variant="outlined"
                onDelete={!disabled ? () => handleRemovePermission(permission) : undefined}
                deleteIcon={<DeleteIcon />}
                size="small"
                sx={{ mb: 1 }}
              />
            ))}
          </Box>

          {!disabled && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setPermissionDialogOpen(true)}
              size="small"
            >
              إضافة صلاحية مخصصة
            </Button>
          )}
        </CardContent>
      </Card>

      {/* حوار إضافة دور */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة دور جديد</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>اختر الدور</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              label="اختر الدور"
            >
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <MenuItem key={role} value={role} disabled={roles.includes(role as UserRole)}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handleAddRole} variant="contained" disabled={!selectedRole}>
            إضافة
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار إضافة صلاحية */}
      <Dialog open={permissionDialogOpen} onClose={() => setPermissionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة صلاحية مخصصة</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>اختر الصلاحية</InputLabel>
            <Select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              label="اختر الصلاحية"
            >
              {Object.values(PERMISSION_GROUPS).flatMap(group => 
                group.permissions.map(permission => (
                  <MenuItem key={permission} value={permission} disabled={permissions.includes(permission)}>
                    {permission}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handleAddPermission} variant="contained" disabled={!selectedPermission}>
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

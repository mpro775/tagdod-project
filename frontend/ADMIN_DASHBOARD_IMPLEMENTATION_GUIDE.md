# دليل تنفيذ لوحة التحكم - الجزء الثاني
# Admin Dashboard Implementation Guide - Part 2

> 📘 **استكمال الخطة الشاملة - المكونات التفصيلية وخطة التنفيذ**

---

## 📦 المكونات المشتركة التفصيلية

### 1. DataTable Component

```typescript
// src/shared/components/DataTable/DataTable.tsx

import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridSortModel,
  GridFilterModel,
} from '@mui/x-data-grid';
import { Box, Paper } from '@mui/material';
import { DataTableToolbar } from './DataTableToolbar';
import { DataTablePagination } from './DataTablePagination';

export interface DataTableProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  loading?: boolean;
  
  // Pagination
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  
  // Sorting
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  
  // Filtering
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
  
  // Selection
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selection: string[]) => void;
  
  // Toolbar
  title?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
  
  // Height
  height?: number | string;
  
  // Row actions
  onRowClick?: (row: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  loading = false,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  sortModel,
  onSortModelChange,
  filterModel,
  onFilterModelChange,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  title,
  searchPlaceholder,
  onSearch,
  actions,
  height = 600,
  onRowClick,
}) => {
  return (
    <Paper sx={{ width: '100%', height }}>
      {(title || onSearch || actions) && (
        <DataTableToolbar
          title={title}
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
          actions={actions}
        />
      )}
      
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        
        // Pagination
        paginationMode="server"
        page={page}
        pageSize={pageSize}
        rowCount={totalRows}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        rowsPerPageOptions={[10, 20, 50, 100]}
        
        // Sorting
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        
        // Filtering
        filterMode="server"
        filterModel={filterModel}
        onFilterModelChange={onFilterModelChange}
        
        // Selection
        checkboxSelection={selectable}
        selectionModel={selectedRows}
        onSelectionModelChange={onSelectionChange}
        
        // Row click
        onRowClick={(params) => onRowClick?.(params.row)}
        
        // Style
        disableSelectionOnClick
        autoHeight={false}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            cursor: onRowClick ? 'pointer' : 'default',
          },
        }}
      />
    </Paper>
  );
};
```

### 2. Form Components

```typescript
// src/shared/components/Form/FormInput.tsx

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface FormInputProps extends Omit<TextFieldProps, 'name'> {
  name: string;
  label: string;
  rules?: any;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  rules,
  ...textFieldProps
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...textFieldProps}
          label={label}
          error={!!error}
          helperText={error?.message}
          fullWidth
        />
      )}
    />
  );
};
```

```typescript
// src/shared/components/Form/FormSelect.tsx

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectProps,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps extends Omit<SelectProps, 'name'> {
  name: string;
  label: string;
  options: Option[];
  rules?: any;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  name,
  label,
  options,
  rules,
  ...selectProps
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error}>
          <InputLabel>{label}</InputLabel>
          <Select
            {...field}
            {...selectProps}
            label={label}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};
```

```typescript
// src/shared/components/Form/FormMultiLanguage.tsx

import React from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { FormInput } from './FormInput';
import { useTranslation } from 'react-i18next';

interface FormMultiLanguageProps {
  baseName: string;
  label: string;
  type?: 'text' | 'textarea';
  required?: boolean;
}

export const FormMultiLanguage: React.FC<FormMultiLanguageProps> = ({
  baseName,
  label,
  type = 'text',
  required = false,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label} {required && '*'}
      </Typography>
      
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
        <Tab label="🇸🇦 العربية" />
        <Tab label="🇬🇧 English" />
      </Tabs>
      
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <FormInput
            name={baseName}
            label={`${label} (عربي)`}
            multiline={type === 'textarea'}
            rows={type === 'textarea' ? 4 : undefined}
            rules={{ required: required ? t('validation.required') : false }}
          />
        )}
        
        {activeTab === 1 && (
          <FormInput
            name={`${baseName}En`}
            label={`${label} (English)`}
            multiline={type === 'textarea'}
            rows={type === 'textarea' ? 4 : undefined}
            rules={{ required: required ? t('validation.required') : false }}
          />
        )}
      </Box>
    </Box>
  );
};
```

```typescript
// src/shared/components/Form/FormImageUpload.tsx

import React, { useState } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { Upload, Delete, Image as ImageIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { Controller, useFormContext } from 'react-hook-form';
import { useMediaUpload } from '@/features/media/hooks/useMediaUpload';

interface FormImageUploadProps {
  name: string;
  label: string;
  multiple?: boolean;
  maxSize?: number; // بالبايتات
  accept?: string[];
}

export const FormImageUpload: React.FC<FormImageUploadProps> = ({
  name,
  label,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = ['image/*'],
}) => {
  const { control, setValue } = useFormContext();
  const { mutateAsync: uploadMedia, isLoading } = useMediaUpload();
  const [preview, setPreview] = useState<string[]>([]);

  const onDrop = async (acceptedFiles: File[]) => {
    try {
      // رفع الملفات
      const uploadedFiles = await Promise.all(
        acceptedFiles.map((file) => uploadMedia({ file, type: 'image' }))
      );
      
      // تحديث القيمة في الـ form
      if (multiple) {
        setValue(name, uploadedFiles.map(f => f._id));
      } else {
        setValue(name, uploadedFiles[0]?._id);
      }
      
      // تحديث المعاينة
      const urls = uploadedFiles.map(f => f.url);
      setPreview(multiple ? urls : [urls[0]]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    maxSize,
    multiple,
    disabled: isLoading,
  });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          
          {/* منطقة الرفع */}
          {preview.length === 0 && (
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: error ? 'error.main' : 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'action.hover' : 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <input {...getInputProps()} />
              <Upload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {isDragActive
                  ? 'اسحب الملفات هنا'
                  : 'اسحب الملفات هنا أو انقر للاختيار'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                الحد الأقصى: {(maxSize / 1024 / 1024).toFixed(0)} ميجابايت
              </Typography>
            </Box>
          )}
          
          {/* معاينة الصور */}
          {preview.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {preview.map((url, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 150,
                    height: 150,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={url}
                    alt={`Preview ${index}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newPreview = preview.filter((_, i) => i !== index);
                      setPreview(newPreview);
                      setValue(name, multiple ? newPreview.map(p => p) : null);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              
              {multiple && (
                <Button
                  {...getRootProps()}
                  variant="outlined"
                  sx={{
                    width: 150,
                    height: 150,
                    borderStyle: 'dashed',
                  }}
                >
                  <input {...getInputProps()} />
                  <Upload />
                </Button>
              )}
            </Box>
          )}
          
          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              {error.message}
            </Typography>
          )}
        </Box>
      )}
    />
  );
};
```

### 3. Layout Components

```typescript
// src/shared/components/Layout/MainLayout.tsx

import React, { useState } from 'react';
import { Box, useMediaQuery, Theme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useSidebarStore } from '@/store/sidebarStore';

const DRAWER_WIDTH = 280;

export const MainLayout: React.FC = () => {
  const { isOpen, toggle } = useSidebarStore();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        width={DRAWER_WIDTH}
        open={isOpen}
        onClose={toggle}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: '100%',
            md: `calc(100% - ${isOpen ? DRAWER_WIDTH : 0}px)`,
          },
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Header onMenuClick={toggle} />
        
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
```

```typescript
// src/shared/components/Layout/Sidebar.tsx

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
} from '@mui/material';
import {
  Dashboard,
  People,
  Inventory,
  Category,
  LocalOffer,
  ShoppingCart,
  Settings,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  roles?: string[];
}

interface SidebarProps {
  width: number;
  open: boolean;
  onClose: () => void;
  variant: 'permanent' | 'temporary';
}

export const Sidebar: React.FC<SidebarProps> = ({
  width,
  open,
  onClose,
  variant,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuthStore();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  // قائمة العناصر
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: t('navigation.dashboard'),
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      id: 'users',
      label: t('navigation.users'),
      icon: <People />,
      path: '/users',
      roles: ['admin', 'super_admin'],
    },
    {
      id: 'catalog',
      label: t('navigation.catalog'),
      icon: <Inventory />,
      children: [
        {
          id: 'products',
          label: t('navigation.products'),
          path: '/products',
        },
        {
          id: 'categories',
          label: t('navigation.categories'),
          path: '/categories',
        },
        {
          id: 'attributes',
          label: t('navigation.attributes'),
          path: '/attributes',
        },
        {
          id: 'brands',
          label: t('navigation.brands'),
          path: '/brands',
        },
      ],
    },
    {
      id: 'sales',
      label: t('navigation.sales'),
      icon: <ShoppingCart />,
      children: [
        {
          id: 'orders',
          label: t('navigation.orders'),
          path: '/orders',
        },
        {
          id: 'coupons',
          label: t('navigation.coupons'),
          path: '/coupons',
        },
      ],
    },
    {
      id: 'settings',
      label: t('navigation.settings'),
      icon: <Settings />,
      path: '/settings',
    },
  ];

  // التحقق من الصلاحيات
  const hasAccess = (item: MenuItem) => {
    if (!item.roles || item.roles.length === 0) return true;
    return hasRole(item.roles);
  };

  // توسيع/إغلاق العنصر
  const handleToggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // التنقل
  const handleNavigate = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  // رسم العنصر
  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    if (!hasAccess(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = item.path && location.pathname.startsWith(item.path);

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            selected={isActive}
            onClick={() => {
              if (hasChildren) {
                handleToggleExpand(item.id);
              } else if (item.path) {
                handleNavigate(item.path);
              }
            }}
            sx={{
              pl: 2 + depth * 2,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
            }}
          >
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText primary={item.label} />
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Title */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          {t('app.name')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('app.slogan')}
        </Typography>
      </Box>

      <Divider />

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        <List>{menuItems.map((item) => renderMenuItem(item))}</List>
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 Tagadodo
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
```

### 4. Dialog Components

```typescript
// src/shared/components/Dialog/ConfirmDialog.tsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'info' | 'warning' | 'error';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  severity = 'warning',
}) => {
  const { t } = useTranslation();

  const colorMap = {
    info: 'primary',
    warning: 'warning',
    error: 'error',
  };

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>
          {cancelText || t('common:actions.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          color={colorMap[severity]}
          variant="contained"
          autoFocus
        >
          {confirmText || t('common:actions.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Custom Hook للاستخدام
export const useConfirm = () => {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    onConfirm: () => void;
  } | null>(null);

  const confirm = (
    title: string,
    message: string,
    severity: 'info' | 'warning' | 'error' = 'warning'
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        title,
        message,
        severity,
        onConfirm: () => {
          setDialogState(null);
          resolve(true);
        },
      });
    });
  };

  const ConfirmDialogComponent = dialogState ? (
    <ConfirmDialog
      {...dialogState}
      onCancel={() => setDialogState(null)}
    />
  ) : null;

  return { confirm, ConfirmDialogComponent };
};
```

---

## 📄 الصفحات والموديولات التفصيلية

### 1. Users Module - مثال كامل

#### Users List Page

```typescript
// src/features/users/pages/UsersListPage.tsx

import React, { useState } from 'react';
import { Box, Button, Chip } from '@mui/material';
import { Add, Edit, Delete, Block, CheckCircle } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable';
import { useUsers, useDeleteUser, useSuspendUser } from '../hooks/useUsers';
import { useConfirm } from '@/shared/components/Dialog';
import { formatDate } from '@/shared/utils/formatters';
import type { User } from '../types/user.types';

export const UsersListPage: React.FC = () => {
  const { t } = useTranslation(['users', 'common']);
  const navigate = useNavigate();
  const { confirm, ConfirmDialogComponent } = useConfirm();

  // State
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // API
  const { data, isLoading, refetch } = useUsers({
    page: page + 1,
    limit: pageSize,
    search,
    sortBy,
    sortOrder,
  });

  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: suspendUser } = useSuspendUser();

  // Actions
  const handleDelete = async (user: User) => {
    const confirmed = await confirm(
      t('users:deleteConfirm.title'),
      t('users:deleteConfirm.message', { name: user.firstName }),
      'error'
    );

    if (confirmed) {
      deleteUser(user._id);
    }
  };

  const handleSuspend = async (user: User) => {
    const action = user.status === 'suspended' ? 'activate' : 'suspend';
    const confirmed = await confirm(
      t(`users:${action}Confirm.title`),
      t(`users:${action}Confirm.message`, { name: user.firstName }),
      'warning'
    );

    if (confirmed) {
      suspendUser({
        id: user._id,
        reason: action === 'suspend' ? 'Admin action' : undefined,
      });
    }
  };

  // Columns
  const columns: GridColDef[] = [
    {
      field: 'firstName',
      headerName: t('users:fields.name'),
      width: 200,
      renderCell: (params) => (
        <Box>
          <div>{`${params.row.firstName} ${params.row.lastName || ''}`}</div>
          <div style={{ fontSize: '0.75rem', color: 'gray' }}>
            {params.row.email}
          </div>
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: t('users:fields.phone'),
      width: 150,
    },
    {
      field: 'roles',
      headerName: t('users:fields.role'),
      width: 120,
      renderCell: (params) => {
        const role = params.row.roles?.[0] || 'user';
        const colorMap: Record<string, any> = {
          super_admin: 'error',
          admin: 'warning',
          moderator: 'info',
          user: 'default',
        };
        return <Chip label={role} color={colorMap[role]} size="small" />;
      },
    },
    {
      field: 'status',
      headerName: t('users:fields.status'),
      width: 120,
      renderCell: (params) => {
        const statusMap: Record<string, any> = {
          active: { label: t('users:status.active'), color: 'success' },
          suspended: { label: t('users:status.suspended'), color: 'error' },
          pending: { label: t('users:status.pending'), color: 'warning' },
        };
        const status = statusMap[params.row.status];
        return <Chip label={status.label} color={status.color} size="small" />;
      },
    },
    {
      field: 'createdAt',
      headerName: t('users:fields.createdAt'),
      width: 150,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'actions',
      headerName: t('common:actions.title'),
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            size="small"
            startIcon={<Edit />}
            onClick={() => navigate(`/users/${params.row._id}`)}
          >
            {t('common:actions.edit')}
          </Button>
          <Button
            size="small"
            color={params.row.status === 'suspended' ? 'success' : 'warning'}
            startIcon={
              params.row.status === 'suspended' ? <CheckCircle /> : <Block />
            }
            onClick={() => handleSuspend(params.row)}
          >
            {params.row.status === 'suspended'
              ? t('common:actions.activate')
              : t('common:actions.suspend')}
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<Delete />}
            onClick={() => handleDelete(params.row)}
          >
            {t('common:actions.delete')}
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <DataTable
        title={t('users:title')}
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        totalRows={data?.meta?.total || 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchPlaceholder={t('users:searchPlaceholder')}
        onSearch={setSearch}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/users/new')}
          >
            {t('users:actions.addUser')}
          </Button>
        }
        onRowClick={(row) => navigate(`/users/${row._id}`)}
      />

      {ConfirmDialogComponent}
    </Box>
  );
};
```

#### User Form Page

```typescript
// src/features/users/pages/UserFormPage.tsx

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
  Grid,
  Divider,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect, FormCheckbox } from '@/shared/components/Form';
import { useUser, useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { PageLoader } from '@/shared/components/Loading';
import type { CreateUserDto } from '../types/user.types';

// Validation Schema
const userSchema = z.object({
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  firstName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  lastName: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  roles: z.array(z.string()).min(1, 'يجب اختيار دور واحد على الأقل'),
  isActive: z.boolean(),
});

export const UserFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['users', 'common']);
  const isEditMode = !!id;

  // Form
  const methods = useForm<CreateUserDto>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      phone: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roles: ['user'],
      isActive: true,
    },
  });

  // API
  const { data: user, isLoading } = useUser(id!);
  const { mutate: createUser, isLoading: isCreating } = useCreateUser();
  const { mutate: updateUser, isLoading: isUpdating } = useUpdateUser();

  // Load user data in edit mode
  useEffect(() => {
    if (isEditMode && user) {
      methods.reset({
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles || ['user'],
        isActive: user.status === 'active',
      });
    }
  }, [user, isEditMode, methods]);

  // Submit
  const onSubmit = (data: CreateUserDto) => {
    if (isEditMode) {
      updateUser(
        { id: id!, data },
        {
          onSuccess: () => {
            navigate('/users');
          },
        }
      );
    } else {
      createUser(data, {
        onSuccess: () => {
          navigate('/users');
        },
      });
    }
  };

  if (isEditMode && isLoading) {
    return <PageLoader />;
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEditMode ? t('users:edit.title') : t('users:create.title')}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* معلومات أساسية */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('users:sections.basicInfo')}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  name="firstName"
                  label={t('users:fields.firstName')}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  name="lastName"
                  label={t('users:fields.lastName')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  name="phone"
                  label={t('users:fields.phone')}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormInput
                  name="email"
                  label={t('users:fields.email')}
                  type="email"
                />
              </Grid>

              {!isEditMode && (
                <Grid item xs={12} md={6}>
                  <FormInput
                    name="password"
                    label={t('users:fields.password')}
                    type="password"
                    required
                  />
                </Grid>
              )}

              {/* الأدوار والصلاحيات */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  {t('users:sections.rolesPermissions')}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormSelect
                  name="roles"
                  label={t('users:fields.role')}
                  options={[
                    { value: 'user', label: t('users:roles.user') },
                    { value: 'moderator', label: t('users:roles.moderator') },
                    { value: 'admin', label: t('users:roles.admin') },
                    {
                      value: 'super_admin',
                      label: t('users:roles.super_admin'),
                    },
                  ]}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormCheckbox
                  name="isActive"
                  label={t('users:fields.isActive')}
                />
              </Grid>

              {/* الأزرار */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={isCreating || isUpdating}
                  >
                    {t('common:actions.save')}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/users')}
                  >
                    {t('common:actions.cancel')}
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
```

#### Custom Hooks

```typescript
// src/features/users/hooks/useUsers.ts

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { usersApi } from '../api/usersApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import { toast } from 'react-hot-toast';
import type {
  ListUsersParams,
  CreateUserDto,
  UpdateUserDto,
} from '../types/user.types';

// List users
export const useUsers = (params: ListUsersParams) => {
  return useQuery(['users', params], () => usersApi.list(params), {
    keepPreviousData: true,
    onError: ErrorHandler.showError,
  });
};

// Get single user
export const useUser = (id: string) => {
  return useQuery(['users', id], () => usersApi.getById(id), {
    enabled: !!id,
    onError: ErrorHandler.showError,
  });
};

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation((data: CreateUserDto) => usersApi.create(data), {
    onSuccess: () => {
      toast.success('تم إنشاء المستخدم بنجاح');
      queryClient.invalidateQueries('users');
    },
    onError: ErrorHandler.showError,
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersApi.update(id, data),
    {
      onSuccess: (_, variables) => {
        toast.success('تم تحديث المستخدم بنجاح');
        queryClient.invalidateQueries(['users', variables.id]);
        queryClient.invalidateQueries('users');
      },
      onError: ErrorHandler.showError,
    }
  );
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation((id: string) => usersApi.delete(id), {
    onSuccess: () => {
      toast.success('تم حذف المستخدم بنجاح');
      queryClient.invalidateQueries('users');
    },
    onError: ErrorHandler.showError,
  });
};

// Suspend user
export const useSuspendUser = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, reason }: { id: string; reason?: string }) =>
      usersApi.suspend(id, reason),
    {
      onSuccess: () => {
        toast.success('تم تحديث حالة المستخدم بنجاح');
        queryClient.invalidateQueries('users');
      },
      onError: ErrorHandler.showError,
    }
  );
};
```

#### API Service

```typescript
// src/features/users/api/usersApi.ts

import { apiClient } from '@/core/api/client';
import type {
  User,
  ListUsersParams,
  CreateUserDto,
  UpdateUserDto,
  ApiResponse,
  PaginatedResponse,
} from '../types/user.types';

export const usersApi = {
  /**
   * Get list of users
   */
  list: async (params: ListUsersParams): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get('/admin/users', { params });
    return data;
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<User>>(
      `/admin/users/${id}`
    );
    return data.data;
  },

  /**
   * Create new user
   */
  create: async (userData: CreateUserDto): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>(
      '/admin/users',
      userData
    );
    return data.data;
  },

  /**
   * Update user
   */
  update: async (id: string, userData: UpdateUserDto): Promise<User> => {
    const { data } = await apiClient.patch<ApiResponse<User>>(
      `/admin/users/${id}`,
      userData
    );
    return data.data;
  },

  /**
   * Delete user
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  /**
   * Suspend user
   */
  suspend: async (id: string, reason?: string): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>(
      `/admin/users/${id}/suspend`,
      { reason }
    );
    return data.data;
  },

  /**
   * Activate user
   */
  activate: async (id: string): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>(
      `/admin/users/${id}/activate`
    );
    return data.data;
  },

  /**
   * Get user statistics
   */
  getStats: async (): Promise<any> => {
    const { data } = await apiClient.get('/admin/users/stats/summary');
    return data.data;
  },
};
```

---

## 🗓️ خطة التنفيذ المرحلية

### المرحلة 1: الإعداد الأساسي (أسبوع 1) ✅

**المهام:**
1. ✅ إنشاء المشروع بـ Vite + React + TypeScript
2. ✅ تثبيت المكتبات الأساسية
3. ✅ إعداد ESLint + Prettier
4. ✅ إنشاء هيكل المجلدات
5. ✅ إعداد Git و GitHub
6. ✅ إعداد متغيرات البيئة

**التسليمات:**
- ✅ مشروع جاهز للتطوير
- ✅ معايير كتابة محددة
- ✅ بيئة تطوير كاملة

---

### المرحلة 2: Core Systems (أسبوع 2-3) 🔄

**المهام:**
1. ✅ نظام المصادقة (Auth System)
   - Token Service
   - Auth Store
   - Login Page
   - Protected Routes

2. ✅ نظام الـ API (API Layer)
   - API Client
   - Interceptors
   - Error Handling

3. ✅ نظام اللغات (i18n System)
   - i18next Setup
   - Language Store
   - Translation Files
   - RTL Support

4. ✅ نظام الثيمات (Theme System)
   - Light/Dark Themes
   - Theme Store
   - Theme Provider
   - MUI Configuration

5. ✅ Layout System
   - Main Layout
   - Sidebar
   - Header
   - Footer

**التسليمات:**
- ✅ نظام مصادقة كامل
- ✅ API Layer جاهز
- ✅ دعم لغتين
- ✅ Layout جاهز

---

### المرحلة 3: المكونات المشتركة (أسبوع 4) 🔄

**المهام:**
1. DataTable Component
2. Form Components (Input, Select, Checkbox, etc.)
3. Dialog Components
4. Loading Components
5. Empty State Components
6. Status Components

**التسليمات:**
- مكتبة مكونات قابلة لإعادة الاستخدام

---

### المرحلة 4: Dashboard & Auth (أسبوع 5) 📊

**المهام:**
1. Dashboard Page
   - Stats Cards
   - Charts
   - Recent Activities

2. Auth Pages
   - Login
   - Forgot Password
   - Reset Password

**التسليمات:**
- لوحة معلومات كاملة
- نظام تسجيل دخول

---

### المرحلة 5: Users Management (أسبوع 6) 👥

**المهام:**
1. Users List Page
2. User Details Page
3. User Form Page
4. User Filters
5. User Actions (Suspend, Delete, etc.)

**التسليمات:**
- نظام إدارة مستخدمين كامل

---

### المرحلة 6: Products Management (أسبوع 7-8) 📦

**المهام:**
1. Products List Page
2. Product Details Page
3. Product Form Page
4. Variants Management
5. Image Gallery
6. Attribute Selector

**التسليمات:**
- نظام إدارة منتجات متكامل

---

### المرحلة 7: Categories & Attributes (أسبوع 9) 🗂️

**المهام:**
1. Categories Management
   - Tree View
   - CRUD Operations

2. Attributes Management
   - Attributes List
   - Attribute Values
   - Attribute Groups

**التسليمات:**
- نظام فئات وسمات كامل

---

### المرحلة 8: Brands & Banners (أسبوع 10) 🏷️

**المهام:**
1. Brands Management
2. Banners Management
3. Banner Analytics

**التسليمات:**
- إدارة البراندات والبنرات

---

### المرحلة 9: Orders & Coupons (أسبوع 11-12) 🛒

**المهام:**
1. Orders Management
   - Orders List
   - Order Details
   - Order Status Management
   - Order Actions

2. Coupons Management
   - Coupons List
   - Coupon Form
   - Coupon Analytics

**التسليمات:**
- نظام طلبات وكوبونات

---

### المرحلة 10: Media Library (أسبوع 13) 🖼️

**المهام:**
1. Media Grid
2. Media Upload
3. Media Filters
4. Media Selector
5. Media Details

**التسليمات:**
- مستودع صور متكامل

---

### المرحلة 11: Analytics & Reports (أسبوع 14) 📈

**المهام:**
1. Sales Analytics
2. Products Analytics
3. Users Analytics
4. Custom Reports

**التسليمات:**
- نظام تحليلات شامل

---

### المرحلة 12: Support & Notifications (أسبوع 15) 💬

**المهام:**
1. Support Tickets
2. Ticket Messages
3. Notifications System

**التسليمات:**
- نظام دعم وإشعارات

---

### المرحلة 13: Testing & Optimization (أسبوع 16) ✅

**المهام:**
1. Unit Tests
2. Integration Tests
3. Performance Optimization
4. SEO Optimization
5. Accessibility

**التسليمات:**
- تطبيق محسّن ومختبر

---

### المرحلة 14: Deployment & Documentation (أسبوع 17) 🚀

**المهام:**
1. Production Build
2. Deployment Setup
3. Documentation
4. Training Materials

**التسليمات:**
- تطبيق جاهز للإنتاج
- توثيق كامل

---

## 📊 Timeline Chart

```
الأسبوع  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17
─────────────────────────────────────────────────────────────
Setup    ██
Core        ████
Shared          ██
Dashboard          ██
Users                 ██
Products                 ████
Cat/Attr                     ██
Brands                          ██
Orders                             ████
Media                                  ██
Analytics                                 ██
Support                                      ██
Testing                                         ██
Deploy                                             ██
```

---

## 📚 التوثيق والمراجع

### وثائق المشروع المطلوبة

#### 1. README.md
```markdown
# Tagadodo Admin Dashboard

لوحة تحكم إدارية احترافية لمنصة تقدودو

## التقنيات المستخدمة
- React 19
- TypeScript
- Material-UI v6
- React Query
- Zustand
- i18next

## البدء السريع

### المتطلبات
- Node.js >= 20
- npm >= 10

### التثبيت
\`\`\`bash
npm install
\`\`\`

### التشغيل
\`\`\`bash
npm run dev
\`\`\`

### Build للإنتاج
\`\`\`bash
npm run build
\`\`\`

## البنية المعمارية
راجع [ARCHITECTURE.md](./ARCHITECTURE.md)

## المساهمة
راجع [CONTRIBUTING.md](./CONTRIBUTING.md)

## الترخيص
MIT License
```

#### 2. ARCHITECTURE.md
- شرح البنية المعمارية
- التدفق العام
- الأنماط المستخدمة

#### 3. DEVELOPMENT.md
- معايير الكتابة
- Git Workflow
- Pull Request Guidelines

#### 4. API_INTEGRATION.md
- كيفية التكامل مع Backend
- أمثلة الـ API Calls
- معالجة الأخطاء

---

## 🎯 Checklist الجودة

### Performance
- [ ] Code Splitting
- [ ] Lazy Loading للصفحات
- [ ] Image Optimization
- [ ] Caching Strategy
- [ ] Bundle Size < 500KB

### Accessibility
- [ ] ARIA Labels
- [ ] Keyboard Navigation
- [ ] Screen Reader Support
- [ ] Color Contrast
- [ ] Focus Management

### SEO
- [ ] Meta Tags
- [ ] Open Graph
- [ ] Sitemap
- [ ] robots.txt

### Security
- [ ] XSS Protection
- [ ] CSRF Protection
- [ ] Input Validation
- [ ] Secure Headers
- [ ] Token Management

### Testing
- [ ] Unit Tests > 80%
- [ ] Integration Tests
- [ ] E2E Tests
- [ ] Performance Tests

---

## 📞 الدعم والمساعدة

### الموارد
- 📘 [Backend Documentation](../backend/README.md)
- 🎨 [MUI Documentation](https://mui.com)
- ⚛️ [React Documentation](https://react.dev)
- 📖 [TypeScript Documentation](https://www.typescriptlang.org)

### اتصل بنا
- Email: support@tagadodo.com
- Slack: #tagadodo-dev

---

**🎉 مشروع من الدرجة العالمية - جاهز للتنفيذ!**

**التاريخ:** 14 أكتوبر 2025  
**الإصدار:** 1.0.0  
**المؤلف:** فريق تقدودو التقني


import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import { Edit, Delete, Restore, AddCircle, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import {
  useAttributes,
  useDeleteAttribute,
  useRestoreAttribute,
  useAttributeStats,
} from '../hooks/useAttributes';
import { formatDate } from '@/shared/utils/formatters';
import { AttributeStatsCards } from '../components/AttributeStatsCards';
import AttributeFilters from '../components/AttributeFilters';
import type { Attribute, AttributeType, ListAttributesParams } from '../types/attribute.types';

const attributeTypeLabels: Record<AttributeType, string> = {
  select: 'اختيار واحد',
  multiselect: 'اختيار متعدد',
  text: 'نص',
  number: 'رقم',
  boolean: 'نعم/لا',
};

const attributeTypeColors: Record<
  AttributeType,
  'primary' | 'secondary' | 'info' | 'warning' | 'success'
> = {
  select: 'primary',
  multiselect: 'secondary',
  text: 'info',
  number: 'warning',
  boolean: 'success',
};

export const AttributesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ListAttributesParams>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const { data: attributesResponse, isLoading, refetch } = useAttributes(filters);
  const { data: stats, isLoading: statsLoading } = useAttributeStats();
  const { mutate: deleteAttribute } = useDeleteAttribute();
  const { mutate: restoreAttribute } = useRestoreAttribute();

  const attributes = attributesResponse?.data || [];

  const handleFiltersChange = (newFilters: ListAttributesParams) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelete = (id: string, name: string) => {
    deleteAttribute(id, {
      onSuccess: () => {
        showSnackbar(`تم حذف السمة "${name}" بنجاح`, 'success');
        refetch();
      },
      onError: (error) => {
        showSnackbar(
          `فشل في حذف السمة: ${error instanceof Error ? error.message : 'حدث خطأ غير معروف'}`,
          'error'
        );
      },
    });
  };

  const handleRestore = (id: string, name: string) => {
    restoreAttribute(id, {
      onSuccess: () => {
        showSnackbar(`تم استعادة السمة "${name}" بنجاح`, 'success');
        refetch();
      },
      onError: (error) => {
        showSnackbar(
          `فشل في استعادة السمة: ${error instanceof Error ? error.message : 'حدث خطأ غير معروف'}`,
          'error'
        );
      },
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'السمة',
      width: 250,
      renderCell: (params) => (
        <Box>
          <Box sx={{ fontWeight: 'medium' }}>{params.row.name}</Box>
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{params.row.nameEn}</Box>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'النوع',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={attributeTypeLabels[params.row.type as AttributeType]}
          color={attributeTypeColors[params.row.type as AttributeType]}
          size="small"
        />
      ),
    },
    {
      field: 'usageCount',
      headerName: 'الاستخدام',
      width: 100,
      align: 'center',
    },
    {
      field: 'isFilterable',
      headerName: 'قابل للفلترة',
      width: 120,
      renderCell: (params) =>
        params.row.isFilterable ? (
          <Chip label="نعم" color="success" size="small" />
        ) : (
          <Chip label="لا" color="default" size="small" />
        ),
    },
    {
      field: 'isRequired',
      headerName: 'إلزامي',
      width: 100,
      renderCell: (params) =>
        params.row.isRequired ? <Chip label="نعم" color="error" size="small" /> : null,
    },
    {
      field: 'isActive',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'نشط' : 'غير نشط'}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الإنشاء',
      width: 140,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const attr = params.row as Attribute;
        const isDeleted = !!attr.deletedAt;

        if (isDeleted) {
          return (
            <Tooltip title="استعادة">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestore(attr._id, attr.name);
                }}
              >
                <Restore fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        }

        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="تعديل">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/attributes/${attr._id}`);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="إدارة القيم">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/attributes/${attr._id}/values`);
                }}
              >
                <AddCircle fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="حذف">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`هل تريد حذف السمة "${attr.name}"؟`)) {
                    handleDelete(attr._id, attr.name);
                  }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              إدارة السمات
            </Typography>
            <Typography variant="body1" color="text.secondary">
              إدارة وتنظيم سمات المنتجات في النظام
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/attributes/new')}
            size="large"
          >
            إضافة سمة جديدة
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ mb: 4 }}>
        <AttributeStatsCards stats={stats} isLoading={statsLoading} />
      </Box>

      {/* Filters */}
      <AttributeFilters
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        initialFilters={filters}
      />

      {/* Data Table */}
      <Paper sx={{ height: 'calc(100vh - 400px)' }}>
        <DataTable
          title=""
          columns={columns}
          rows={attributes}
          loading={isLoading}
          paginationModel={{ page: 0, pageSize: 25 }}
          onPaginationModelChange={() => {}}
          onAdd={() => navigate('/attributes/new')}
          addButtonText="إضافة سمة جديدة"
          onRowClick={(params) => {
            const row = params.row as Attribute;
            navigate(`/attributes/${row._id}`);
          }}
          height="100%"
          getRowId={(row) => (row as Attribute)._id}
        />
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

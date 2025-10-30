import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const getAttributeTypeLabels = (t: (key: string) => string): Record<AttributeType, string> => ({
  select: t('typeLabels.select'),
  multiselect: t('typeLabels.multiselect'),
  text: t('typeLabels.text'),
  number: t('typeLabels.number'),
  boolean: t('typeLabels.boolean'),
  color: t('typeLabels.color'),
});

const attributeTypeColors: Record<
  AttributeType,
  'default' | 'primary' | 'secondary' | 'info' | 'warning' | 'success'
> = {
  select: 'primary',
  multiselect: 'secondary',
  text: 'default',
  number: 'warning',
  boolean: 'success',
  color: 'info',
};

export const AttributesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('attributes');
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
        showSnackbar(t('messages.deleteSuccess', { item: t('messages.attribute') }), 'success');
        refetch();
      },
      onError: (error) => {
        showSnackbar(
          t('messages.deleteError', {
            item: t('messages.attribute'),
            error: error instanceof Error ? error.message : t('messages.unknownError')
          }),
          'error'
        );
      },
    });
  };

  const handleRestore = (id: string, name: string) => {
    restoreAttribute(id, {
      onSuccess: () => {
        showSnackbar(t('messages.restoreSuccess', { item: t('messages.attribute') }), 'success');
        refetch();
      },
      onError: (error) => {
        showSnackbar(
          t('messages.restoreError', {
            item: t('messages.attribute'),
            error: error instanceof Error ? error.message : t('messages.unknownError')
          }),
          'error'
        );
      },
    });
  };

  const attributeTypeLabels = getAttributeTypeLabels(t);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('fields.name'),
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
      headerName: t('fields.type'),
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
      headerName: t('fields.usage'),
      width: 100,
      align: 'center',
    },
    {
      field: 'isFilterable',
      headerName: t('fields.filterable'),
      width: 120,
      renderCell: (params) =>
        params.row.isFilterable ? (
          <Chip label={t('common.yes')} color="success" size="small" />
        ) : (
          <Chip label={t('common.no')} color="default" size="small" />
        ),
    },
    {
      field: 'isRequired',
      headerName: t('fields.required'),
      width: 100,
      renderCell: (params) =>
        params.row.isRequired ? <Chip label={t('common.yes')} color="error" size="small" /> : null,
    },
    {
      field: 'isActive',
      headerName: t('fields.status'),
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? t('status.active') : t('status.inactive')}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: t('fields.createdAt'),
      width: 140,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: t('fields.actions'),
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const attr = params.row as Attribute;
        const isDeleted = !!attr.deletedAt;

        if (isDeleted) {
          return (
            <Tooltip title={t('tooltips.restore')}>
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
            <Tooltip title={t('tooltips.edit')}>
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

            <Tooltip title={t('tooltips.manageValues')}>
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

            <Tooltip title={t('tooltips.delete')}>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(t('messages.deleteConfirm', { name: attr.name }))) {
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
              {t('attributes.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('attributes.subtitle')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/attributes/new')}
            size="large"
          >
            {t('attributes.addNew')}
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
          addButtonText={t('attributes.addNew')}
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

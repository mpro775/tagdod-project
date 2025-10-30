import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Grid,
  Chip,
  Card,
  CardContent,
  Stack,
  Alert,
  Skeleton,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Delete,
  Edit,
  ColorLens,
  Image,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  useAttribute,
  useAttributeValues,
  useCreateAttributeValue,
  useDeleteAttributeValue,
  useUpdateAttributeValue,
} from '../hooks/useAttributes';
import AttributeValueDialog from '../components/AttributeValueDialog';
import type { AttributeValue, AttributeValueFormData } from '../types/attribute.types';

export const AttributeValuesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('attributes');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<AttributeValue | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const { data: attribute, isLoading: loadingAttr } = useAttribute(id!);
  const { data: values = [], isLoading: loadingValues, refetch } = useAttributeValues(id!);
  const { mutate: createValue, isPending: isCreating } = useCreateAttributeValue();
  const { mutate: updateValue, isPending: isUpdating } = useUpdateAttributeValue();
  const { mutate: deleteValue } = useDeleteAttributeValue();

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = (data: AttributeValueFormData) => {
    if (!id) return;

    if (editingValue) {
      // Update existing value - UpdateDto يحتوي على isActive
      updateValue(
        { id: editingValue._id, data },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingValue(null);
            showSnackbar(t('messages.updateSuccess', { item: t('messages.value') }), 'success');
            refetch();
          },
          onError: (error) => {
            showSnackbar(
              t('messages.updateError', {
                item: t('messages.value'),
                error: error instanceof Error ? error.message : t('messages.unknownError')
              }),
              'error'
            );
          },
        }
      );
    } else {
      // Create new value - CreateDto لا يحتوي على isActive
      const { isActive, ...createData } = data;
      createValue(
        { attributeId: id, data: createData },
        {
          onSuccess: () => {
            setDialogOpen(false);
            showSnackbar(t('messages.createSuccess', { item: t('messages.value') }), 'success');
            refetch();
          },
          onError: (error) => {
            showSnackbar(
              t('messages.createError', {
                item: t('messages.value'),
                error: error instanceof Error ? error.message : t('messages.unknownError')
              }),
              'error'
            );
          },
        }
      );
    }
  };

  const handleEdit = (value: AttributeValue) => {
    setEditingValue(value);
    setDialogOpen(true);
  };

  const handleDelete = (valueId: string, valueName: string) => {
    deleteValue(valueId, {
      onSuccess: () => {
        showSnackbar(t('messages.deleteSuccess', { item: t('messages.value') }), 'success');
        refetch();
      },
      onError: (error) => {
        showSnackbar(
          t('messages.deleteError', {
            item: t('messages.value'),
            error: error instanceof Error ? error.message : t('messages.unknownError')
          }),
          'error'
        );
      },
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingValue(null);
  };

  const columns: GridColDef[] = [
    {
      field: 'value',
      headerName: t('fields.valueAr'),
      width: 350,
      renderCell: (params) => {
        const value = params.row as AttributeValue;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
            {/* الصورة أو اللون */}
            {value.imageUrl ? (
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                <Box
                  component="img"
                  src={value.imageUrl}
                  alt={value.value}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </Box>
            ) : value.hexCode ? (
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  bgcolor: value.hexCode,
                  border: '2px solid',
                  borderColor: 'grey.300',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
            ) : null}
            
            {/* معلومات القيمة */}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                {value.value}
              </Typography>
              {value.valueEn && (
                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                  {value.valueEn}
                </Typography>
              )}
              {value.hexCode && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    {value.hexCode}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'description',
      headerName: t('fields.description'),
      width: 200,
      renderCell: (params) => {
        const value = params.row as AttributeValue;
        return value.description ? (
          <Tooltip title={value.description}>
            <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
              {value.description}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
            -
          </Typography>
        );
      },
    },
    {
      field: 'order',
      headerName: t('fields.order'),
      width: 80,
      align: 'center',
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
      field: 'usageCount',
      headerName: t('fields.usage'),
      width: 90,
      align: 'center',
      renderCell: (params) => (
        <Chip label={params.row.usageCount || 0} variant="outlined" size="small" />
      ),
    },
    {
      field: 'actions',
      headerName: t('fields.actions'),
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const value = params.row as AttributeValue;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title={t('tooltips.edit')}>
              <IconButton size="small" color="primary" onClick={() => handleEdit(value)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('tooltips.delete')}>
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  if (window.confirm(t('messages.deleteValueConfirm', { name: value.value }))) {
                    handleDelete(value._id, value.value);
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

  if (loadingAttr) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate('/attributes')} size="large">
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('attributes.manageAttributeValues', { name: attribute?.name })}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {attribute?.nameEn}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Chip label={`${t('fields.type')}: ${attribute?.type}`} color="primary" size="small" />
            <Chip label={`${t('stats.totalValues')}: ${values.length}`} color="info" size="small" />
            {attribute?.isFilterable && <Chip label={t('fields.filterable')} color="success" size="small" />}
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          size="large"
        >
          {t('attributes.addValue')}
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{t('stats.totalValues')}</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {values.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">{t('stats.activeValues')}</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {values.filter((v) => v.isActive).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ColorLens color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">{t('stats.valuesWithColors')}</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="info.main">
                {values.filter((v) => v.hexCode).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Image color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">{t('stats.valuesWithImages')}</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                {values.filter((v) => v.imageUrl).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Table */}
      <Paper sx={{ height: 'calc(100vh - 400px)' }}>
        <DataGrid
          rows={values}
          columns={columns}
          loading={loadingValues}
          getRowId={(row) => row._id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          rowHeight={70}
          sx={{
            height: '100%',
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
              cursor: 'pointer',
            },
          }}
        />
      </Paper>

      {/* Value Dialog */}
      <AttributeValueDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        editingValue={editingValue}
        isLoading={isCreating || isUpdating}
        attributeType={attribute?.type}
      />

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

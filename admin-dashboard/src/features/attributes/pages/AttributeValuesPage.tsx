import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      // Update existing value
      updateValue(
        { id: editingValue._id, data },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingValue(null);
            showSnackbar('تم تحديث القيمة بنجاح', 'success');
            refetch();
          },
          onError: (error) => {
            showSnackbar(
              `فشل في تحديث القيمة: ${
                error instanceof Error ? error.message : 'حدث خطأ غير معروف'
              }`,
              'error'
            );
          },
        }
      );
    } else {
      // Create new value
      createValue(
        { attributeId: id, data },
        {
          onSuccess: () => {
            setDialogOpen(false);
            showSnackbar('تم إضافة القيمة بنجاح', 'success');
            refetch();
          },
          onError: (error) => {
            showSnackbar(
              `فشل في إضافة القيمة: ${
                error instanceof Error ? error.message : 'حدث خطأ غير معروف'
              }`,
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
        showSnackbar(`تم حذف القيمة "${valueName}" بنجاح`, 'success');
        refetch();
      },
      onError: (error) => {
        showSnackbar(
          `فشل في حذف القيمة: ${error instanceof Error ? error.message : 'حدث خطأ غير معروف'}`,
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
      headerName: 'القيمة',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.row.hexCode && (
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: params.row.hexCode,
                border: '1px solid #ddd',
              }}
            />
          )}
          <Box>
            <Box sx={{ fontWeight: 'medium' }}>{params.row.value}</Box>
            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{params.row.valueEn}</Box>
          </Box>
        </Box>
      ),
    },
    {
      field: 'hexCode',
      headerName: 'كود اللون',
      width: 120,
      renderCell: (params) =>
        params.row.hexCode ? <Chip label={params.row.hexCode} size="small" /> : null,
    },
    {
      field: 'order',
      headerName: 'الترتيب',
      width: 100,
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
      field: 'usageCount',
      headerName: 'الاستخدام',
      width: 100,
      align: 'center',
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const value = params.row as AttributeValue;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="تعديل">
              <IconButton size="small" color="primary" onClick={() => handleEdit(value)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="حذف">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  if (window.confirm(`هل تريد حذف القيمة "${value.value}"؟`)) {
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
            إدارة قيم السمة: {attribute?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {attribute?.nameEn}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Chip label={`النوع: ${attribute?.type}`} color="primary" size="small" />
            <Chip label={`القيم: ${values.length}`} color="info" size="small" />
            {attribute?.isFilterable && <Chip label="قابل للفلترة" color="success" size="small" />}
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          size="large"
        >
          إضافة قيمة جديدة
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">إجمالي القيم</Typography>
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
                <Typography variant="h6">القيم النشطة</Typography>
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
                <Typography variant="h6">مع ألوان</Typography>
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
                <Typography variant="h6">مع صور</Typography>
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
          sx={{ height: '100%' }}
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

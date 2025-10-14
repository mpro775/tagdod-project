import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Add, Delete } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  useAttribute,
  useAttributeValues,
  useCreateAttributeValue,
  useDeleteAttributeValue,
} from '../hooks/useAttributes';
import type { AttributeValue, CreateAttributeValueDto } from '../types/attribute.types';

export const AttributeValuesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAttributeValueDto>({
    value: '',
    valueEn: '',
    hexCode: '',
    order: 0,
    isActive: true,
  });

  const { data: attribute, isLoading: loadingAttr } = useAttribute(id!);
  const { data: values = [], isLoading: loadingValues, refetch } = useAttributeValues(id!);
  const { mutate: createValue, isPending: isCreating } = useCreateAttributeValue();
  const { mutate: deleteValue } = useDeleteAttributeValue();

  const handleSave = () => {
    if (!id || !formData.value) return;

    createValue(
      { attributeId: id, data: formData },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setFormData({ value: '', valueEn: '', hexCode: '', order: 0, isActive: true });
          refetch();
        },
      }
    );
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
            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {params.row.valueEn}
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      field: 'hexCode',
      headerName: 'كود اللون',
      width: 120,
      renderCell: (params) =>
        params.row.hexCode ? (
          <Chip label={params.row.hexCode} size="small" />
        ) : null,
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
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const value = params.row as AttributeValue;
        return (
          <Box display="flex" gap={0.5}>
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                if (window.confirm(`هل تريد حذف القيمة "${value.value}"؟`)) {
                  deleteValue(value._id, { onSuccess: () => refetch() });
                }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  if (loadingAttr) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/attributes')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              إدارة قيم السمة: {attribute?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {attribute?.nameEn}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            إضافة قيمة
          </Button>
        </Box>

        <DataGrid
          rows={values}
          columns={columns}
          loading={loadingValues}
          getRowId={(row) => row._id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          sx={{ height: 'calc(100vh - 300px)' }}
        />
      </Paper>

      {/* Add Value Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة قيمة جديدة</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="القيمة (عربي) *"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Value (English)"
                value={formData.valueEn}
                onChange={(e) => setFormData({ ...formData, valueEn: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="كود اللون (Hex Code)"
                placeholder="#FF0000"
                value={formData.hexCode}
                onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="الترتيب"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.value || isCreating}
            startIcon={isCreating ? <CircularProgress size={20} /> : <Add />}
          >
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


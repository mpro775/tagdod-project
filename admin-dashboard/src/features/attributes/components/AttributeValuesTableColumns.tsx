import { Box, Typography, Chip, IconButton, Tooltip, Stack } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { StatusChip } from '@/shared/design-system';
import type { AttributeValue } from '../types/attribute.types';

export const AttributeValuesTableColumns = (
  t: (key: string) => string,
  onEdit: (value: AttributeValue) => void,
  onDelete: (value: AttributeValue) => void,
): GridColDef[] => [
  {
    field: 'value',
    headerName: t('fields.valueAr'),
    width: 300,
    renderCell: (params) => {
      const value = params.row as AttributeValue;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
          {value.imageUrl ? (
            <Box sx={{ width: 40, height: 40, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
              <Box component="img" src={value.imageUrl} alt={value.value} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          ) : value.hexCode ? (
            <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: value.hexCode, border: '2px solid', borderColor: 'divider', flexShrink: 0 }} />
          ) : null}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>{value.value}</Typography>
            {value.valueEn && <Typography variant="caption" color="text.secondary" noWrap display="block">{value.valueEn}</Typography>}
          </Box>
        </Box>
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
    width: 110,
    renderCell: (params) => (
      <StatusChip label={params.row.isActive ? t('status.active') : t('status.inactive')} status={params.row.isActive ? 'active' : 'inactive'} size="small" />
    ),
  },
  {
    field: 'usageCount',
    headerName: t('fields.usage'),
    width: 90,
    align: 'center',
    renderCell: (params) => <Chip label={params.row.usageCount || 0} variant="outlined" size="small" />,
  },
  {
    field: 'actions',
    headerName: t('fields.actions'),
    width: 120,
    sortable: false,
    renderCell: (params) => {
      const value = params.row as AttributeValue;
      return (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title={t('tooltips.edit')}>
            <IconButton size="small" color="primary" onClick={() => onEdit(value)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('tooltips.delete')}>
            <IconButton size="small" color="error" onClick={() => onDelete(value)} disabled={(value.usageCount || 0) > 0}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      );
    },
  },
];
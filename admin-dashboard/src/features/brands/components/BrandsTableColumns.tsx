import { Box, Typography, Chip, Stack, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, ToggleOn, ToggleOff } from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { StatusChip } from '@/shared/design-system';
import { formatDate } from '@/shared/utils/formatters';
import type { Brand } from '../types/brand.types';

export const BrandsTableColumns = (
  t: (key: string, opts?: any) => string,
  onEdit: (brand: Brand) => void,
  onDelete: (brand: Brand) => void,
  onToggleStatus: (brand: Brand) => void,
  isToggling?: boolean,
): GridColDef[] => [
  {
    field: 'name',
    headerName: t('table.columns.brand'),
    width: 300,
    renderCell: (params) => {
      const brand = params.row as Brand;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Box component="img" src={brand.image} alt={brand.name} sx={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', p: 0.5 }} onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23999"%3E?%3C/text%3E%3C/svg%3E'; }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>{brand.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: '0.7rem' }}>{brand.slug}</Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    field: 'description',
    headerName: t('table.columns.description'),
    width: 200,
    renderCell: (params) => {
      const brand = params.row as Brand;
      return (
        <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {brand.description || brand.descriptionEn || t('messages.noDescription')}
        </Typography>
      );
    },
  },
  {
    field: 'sortOrder',
    headerName: t('table.columns.sortOrder'),
    width: 120,
    align: 'center',
    renderCell: (params) => <Chip label={params.row.sortOrder} size="small" color="primary" variant="outlined" />,
  },
  {
    field: 'isActive',
    headerName: t('table.columns.status'),
    width: 120,
    renderCell: (params) => (
      <StatusChip
        label={params.row.isActive ? t('status.active') : t('status.inactive')}
        status={params.row.isActive ? 'active' : 'inactive'}
        size="small"
      />
    ),
  },
  {
    field: 'createdAt',
    headerName: t('table.columns.createdAt'),
    width: 150,
    valueFormatter: (value) => formatDate(value as Date),
  },
  {
    field: 'actions',
    headerName: t('table.columns.actions'),
    width: 160,
    sortable: false,
    renderCell: (params) => {
      const brand = params.row as Brand;
      return (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title={t('tooltips.edit')}>
            <IconButton size="small" color="primary" onClick={() => onEdit(brand)} disabled={isToggling}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={brand.isActive ? t('tooltips.deactivate') : t('tooltips.activate')}>
            <IconButton size="small" color={brand.isActive ? 'warning' : 'success'} onClick={() => onToggleStatus(brand)} disabled={isToggling}>
              {brand.isActive ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={t('tooltips.delete')}>
            <IconButton size="small" color="error" onClick={() => onDelete(brand)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      );
    },
  },
];
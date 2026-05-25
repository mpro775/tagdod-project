import { Box, Typography, Chip, IconButton, Tooltip, Stack } from '@mui/material';
import { Edit, Delete, Restore, Refresh } from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { StatusChip } from '@/shared/design-system';
import { formatDate } from '@/shared/utils/formatters';
import { CategoryImage } from './CategoryImage';
import type { Category } from '../types/category.types';

export const CategoriesTableColumns = (
  t: (key: string) => string,
  onEdit: (category: Category) => void,
  onDelete: (category: Category, permanent?: boolean) => void,
  onRestore: (category: Category) => void,
  onUpdateStats: (category: Category) => void,
): GridColDef[] => [
  {
    field: 'name',
    headerName: t('fields.category'),
    flex: 1.5,
    minWidth: 300,
    renderCell: (params) => {
      const category = params.row as Category;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
          <CategoryImage image={category.imageId} size={40} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {category.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {category.nameEn}
            </Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    field: 'parentId',
    headerName: t('fields.type'),
    width: 120,
    align: 'center',
    renderCell: (params) => (
      <Chip
        label={params.row.parentId ? t('types.sub') : t('types.main')}
        size="small"
        color={params.row.parentId ? 'info' : 'primary'}
        variant="outlined"
      />
    ),
  },
  {
    field: 'productsCount',
    headerName: t('fields.products'),
    width: 100,
    align: 'center',
    renderCell: (params) => (
      <Chip
        label={params.row.productsCount || 0}
        size="small"
        color={params.row.productsCount > 0 ? 'success' : 'default'}
        variant={params.row.productsCount > 0 ? 'filled' : 'outlined'}
      />
    ),
  },
  {
    field: 'isActive',
    headerName: t('fields.status'),
    width: 110,
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
    headerName: t('fields.createdAt'),
    width: 150,
    valueFormatter: (value) => {
      if (!value) return '-';
      return formatDate(typeof value === 'string' ? new Date(value) : value, 'yyyy-MM-dd HH:mm:ss', 'en');
    },
  },
  {
    field: 'actions',
    headerName: t('fields.actions'),
    width: 160,
    sortable: false,
    renderCell: (params) => {
      const category = params.row as Category;
      const isDeleted = !!category.deletedAt;
      return (
        <Stack direction="row" spacing={0.25}>
          {isDeleted ? (
            <>
              <Tooltip title={t('tooltips.restore')}>
                <IconButton size="small" color="primary" onClick={() => onRestore(category)}>
                  <Restore fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('tooltips.permanentDelete')}>
                <IconButton size="small" color="error" onClick={() => onDelete(category, true)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title={t('tooltips.edit')}>
                <IconButton size="small" color="primary" onClick={() => onEdit(category)}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('tooltips.updateStats')}>
                <IconButton size="small" color="info" onClick={() => onUpdateStats(category)}>
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('tooltips.delete')}>
                <IconButton size="small" color="error" onClick={() => onDelete(category)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      );
    },
  },
];
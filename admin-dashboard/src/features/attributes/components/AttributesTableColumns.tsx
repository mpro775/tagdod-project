import { Box, Typography, Chip, IconButton, Tooltip, Stack } from '@mui/material';
import { Edit, Delete, Restore, AddCircle } from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { StatusChip } from '@/shared/design-system';
import { formatDate } from '@/shared/utils/formatters';
import type { Attribute, AttributeType } from '../types/attribute.types';

export const AttributesTableColumns = (
  t: (key: string) => string,
  attributeTypeLabels: Record<AttributeType, string>,
  onEdit: (attr: Attribute) => void,
  onDelete: (attr: Attribute) => void,
  onRestore: (attr: Attribute) => void,
  onManageValues: (attr: Attribute) => void,
): GridColDef[] => [
  {
    field: 'name',
    headerName: t('fields.name'),
    minWidth: 200,
    flex: 1.5,
    renderCell: (params) => (
      <Box sx={{ py: 1 }}>
        <Typography variant="body2" fontWeight={600}>{params.row.name}</Typography>
        <Typography variant="caption" color="text.secondary" display="block">{params.row.nameEn}</Typography>
      </Box>
    ),
  },
  {
    field: 'type',
    headerName: t('fields.type'),
    minWidth: 130,
    flex: 0.8,
    renderCell: (params) => (
      <Chip label={String(attributeTypeLabels[params.row.type as AttributeType])} color={params.row.type === 'color' ? 'info' : 'default'} size="small" />
    ),
  },
  {
    field: 'usageCount',
    headerName: t('fields.usage'),
    minWidth: 100,
    flex: 0.6,
    align: 'center',
    renderCell: (params) => <Typography variant="body2">{params.value || 0}</Typography>,
  },
  {
    field: 'isFilterable',
    headerName: t('fields.filterable'),
    minWidth: 110,
    flex: 0.7,
    align: 'center',
    renderCell: (params) => <StatusChip label={params.row.isFilterable ? t('common:yes') : t('common:no')} status={params.row.isFilterable ? 'active' : 'neutral'} size="small" />,
  },
  {
    field: 'isActive',
    headerName: t('fields.status'),
    minWidth: 100,
    flex: 0.7,
    renderCell: (params) => <StatusChip label={params.row.isActive ? t('status.active') : t('status.inactive')} status={params.row.isActive ? 'active' : 'inactive'} size="small" />,
  },
  {
    field: 'createdAt',
    headerName: t('fields.createdAt'),
    minWidth: 140,
    flex: 0.8,
    valueFormatter: (value) => formatDate(value as Date),
  },
  {
    field: 'actions',
    headerName: t('fields.actions'),
    minWidth: 180,
    flex: 1,
    sortable: false,
    renderCell: (params) => {
      const attr = params.row as Attribute;
      const isDeleted = !!attr.deletedAt;
      return (
        <Stack direction="row" spacing={0.25}>
          {isDeleted ? (
            <Tooltip title={t('tooltips.restore')}>
              <IconButton size="small" color="primary" onClick={() => onRestore(attr)}>
                <Restore fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title={t('tooltips.edit')}>
                <IconButton size="small" color="primary" onClick={() => onEdit(attr)}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('tooltips.manageValues')}>
                <IconButton size="small" color="info" onClick={() => onManageValues(attr)}>
                  <AddCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('tooltips.delete')}>
                <IconButton size="small" color="error" onClick={() => onDelete(attr)}>
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
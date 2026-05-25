import React from 'react';
import { Card, CardContent, Stack, Typography, Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, Restore, AddCircle } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { StatusChip } from '@/shared/design-system';
import type { Attribute, AttributeType } from '../types/attribute.types';

interface AttributeAdminCardProps {
  attribute: Attribute;
  attributeTypeLabels: Record<AttributeType, string>;
  onEdit: (attribute: Attribute) => void;
  onDelete: (attribute: Attribute) => void;
  onRestore?: (attribute: Attribute) => void;
  onManageValues: (attribute: Attribute) => void;
}

export const AttributeAdminCard: React.FC<AttributeAdminCardProps> = ({
  attribute,
  attributeTypeLabels,
  onEdit,
  onDelete,
  onRestore,
  onManageValues,
}) => {
  const { t } = useTranslation('attributes');
  const isDeleted = !!attribute.deletedAt;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
        opacity: isDeleted ? 0.7 : 1,
        borderLeft: attribute.isActive ? '4px solid' : 'none',
        borderLeftColor: attribute.isActive ? 'success.main' : 'transparent',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ fontSize: '0.875rem' }}>
                {attribute.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {attribute.nameEn}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <StatusChip
              label={attribute.isActive ? t('status.active') : t('status.inactive')}
              status={attribute.isActive ? 'active' : 'inactive'}
              size="small"
            />
            <Chip
              label={attributeTypeLabels[attribute.type]}
              size="small"
              color={attribute.type === 'color' ? 'info' : 'default'}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            {attribute.isFilterable && (
              <Chip label={t('fields.filterable')} size="small" color="success" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            )}
          </Stack>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Chip label={`${t('fields.usage')}: ${attribute.usageCount || 0}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            <Chip label={`${t('fields.order')}: ${attribute.order}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
          </Stack>

          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            {isDeleted ? (
              onRestore && (
                <Tooltip title={t('tooltips.restore')}>
                  <IconButton size="small" color="primary" onClick={() => onRestore(attribute)}>
                    <Restore fontSize="small" />
                  </IconButton>
                </Tooltip>
              )
            ) : (
              <>
                <Tooltip title={t('tooltips.edit')}>
                  <IconButton size="small" color="primary" onClick={() => onEdit(attribute)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('tooltips.manageValues')}>
                  <IconButton size="small" color="info" onClick={() => onManageValues(attribute)}>
                    <AddCircle fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('tooltips.delete')}>
                  <IconButton size="small" color="error" onClick={() => onDelete(attribute)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
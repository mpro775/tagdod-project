import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Edit,
  Delete,
  Restore,
  AddCircle,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/shared/utils/formatters';
import type { Attribute, AttributeType } from '../types/attribute.types';

interface AttributeCardProps {
  attribute: Attribute;
  attributeTypeLabels: Record<AttributeType, string>;
  attributeTypeColors: Record<AttributeType, 'default' | 'primary' | 'secondary' | 'info' | 'warning' | 'success'>;
  onEdit: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  onManageValues: () => void;
}

export const AttributeCard: React.FC<AttributeCardProps> = ({
  attribute,
  attributeTypeLabels,
  attributeTypeColors,
  onEdit,
  onDelete,
  onRestore,
  onManageValues,
}) => {
  const { t } = useTranslation(['attributes', 'common']);
  const isDeleted = !!attribute.deletedAt;

  return (
    <Card
      sx={{
        mb: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
        borderLeft: attribute.isActive ? '4px solid' : 'none',
        borderLeftColor: attribute.isActive ? 'success.main' : 'transparent',
        opacity: isDeleted ? 0.7 : 1,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-of-type': { pb: { xs: 2, sm: 2.5 } } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, mb: 0.5 }}>
              {attribute.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {attribute.nameEn}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {isDeleted ? (
              <Tooltip title={t('tooltips.restore')}>
                <IconButton size="small" color="primary" onClick={onRestore}>
                  <Restore fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <>
                <Tooltip title={t('tooltips.edit')}>
                  <IconButton size="small" color="primary" onClick={onEdit}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('tooltips.manageValues')}>
                  <IconButton size="small" color="info" onClick={onManageValues}>
                    <AddCircle fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('tooltips.delete')}>
                  <IconButton size="small" color="error" onClick={onDelete}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Details Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
            gap: { xs: 1.5, sm: 2 },
            mb: 1.5,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, display: 'block', mb: 0.5 }}>
              {t('fields.type')}
            </Typography>
            <Chip
              label={attributeTypeLabels[attribute.type]}
              size="small"
              color={attributeTypeColors[attribute.type]}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: 24 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, display: 'block', mb: 0.5 }}>
              {t('fields.usage')}
            </Typography>
            <Chip
              label={attribute.usageCount || 0}
              size="small"
              variant="outlined"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: 24 }}
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 2', sm: 'auto' } }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, display: 'block', mb: 0.5 }}>
              {t('fields.status')}
            </Typography>
            <Chip
              label={attribute.isActive ? t('status.active') : t('status.inactive')}
              size="small"
              color={attribute.isActive ? 'success' : 'default'}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: 24 }}
            />
          </Box>
        </Box>

        {/* Additional Info */}
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
          {attribute.isFilterable && (
            <Chip
              label={`${t('fields.filterable')}: ${t('yes', { ns: 'common' })}`}
              size="small"
              color="success"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: 20 }}
            />
          )}
          {attribute.isRequired && (
            <Chip
              label={`${t('fields.required')}: ${t('yes', { ns: 'common' })}`}
              size="small"
              color="error"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, height: 20 }}
            />
          )}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            {formatDate(new Date(attribute.createdAt))}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};


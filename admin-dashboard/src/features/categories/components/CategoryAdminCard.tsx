import React from 'react';
import { Card, CardContent, Stack, Typography, Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, Restore, Refresh, Star } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { StatusChip } from '@/shared/design-system';
import type { Category } from '../types/category.types';
import { CategoryImage } from './CategoryImage';

interface CategoryAdminCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category, permanent?: boolean) => void;
  onRestore: (category: Category) => void;
  onUpdateStats: (category: Category) => void;
}

export const CategoryAdminCard: React.FC<CategoryAdminCardProps> = ({
  category,
  onEdit,
  onDelete,
  onRestore,
  onUpdateStats,
}) => {
  const { t } = useTranslation('categories');
  const isDeleted = !!category.deletedAt;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 4,
          borderColor: 'primary.main',
        },
        opacity: isDeleted ? 0.7 : 1,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <CategoryImage image={category.imageId} size={48} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  noWrap
                  sx={{ fontSize: '0.875rem' }}
                >
                  {category.name}
                </Typography>
                {category.isFeatured && (
                  <Star sx={{ fontSize: 14, color: 'warning.main' }} />
                )}
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                display="block"
                sx={{ fontSize: '0.75rem' }}
              >
                {category.nameEn}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <StatusChip
              label={category.isActive ? t('status.active') : t('status.inactive')}
              status={category.isActive ? 'active' : 'inactive'}
              size="small"
            />
            <Chip
              label={category.parentId ? t('types.sub') : t('types.main')}
              size="small"
              color={category.parentId ? 'info' : 'primary'}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Stack>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Chip
              label={`${t('fields.products')}: ${category.productsCount || 0}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            <Chip
              label={`${t('fields.subcategories')}: ${category.childrenCount || 0}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Stack>

          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
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
        </Stack>
      </CardContent>
    </Card>
  );
};
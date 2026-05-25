import React from 'react';
import { Card, CardContent, Stack, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, ToggleOn, ToggleOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Brand } from '../types/brand.types';

interface BrandAdminCardProps {
  brand: Brand;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
  onToggleStatus: (brand: Brand) => void;
  isToggling?: boolean;
}

export const BrandAdminCard: React.FC<BrandAdminCardProps> = ({
  brand,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling = false,
}) => {
  const { t } = useTranslation('brands');

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
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.5}>
<Box
            sx={{
              height: { xs: 80, sm: 100 },
              bgcolor: 'grey.50',
              borderRadius: 1,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              p: 1.5,
            }}
          >
            <Box
              component="img"
              src={brand.image}
              alt={brand.name}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 1,
              }}
              onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23999"%3E?%3C/text%3E%3C/svg%3E'; }}
            />
          </Box>

          <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ fontSize: '0.875rem' }}>
            {brand.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: '0.75rem' }}>
            {brand.nameEn}
          </Typography>

          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
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
        </Stack>
      </CardContent>
    </Card>
  );
};
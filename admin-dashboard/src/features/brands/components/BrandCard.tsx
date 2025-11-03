import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Edit,
  Delete,
  ToggleOn,
  ToggleOff,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Brand } from '../types/brand.types';

interface BrandCardProps {
  brand: Brand;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
  onToggleStatus: (brand: Brand) => void;
}

export const BrandCard: React.FC<BrandCardProps> = ({
  brand,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const { t } = useTranslation('brands');
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        bgcolor: 'background.paper',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark' ? 8 : 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Brand Image */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 120, sm: 140 },
          bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <path d="M9 9h6v6H9z"/>
                </svg>
              `;
            }
          }}
        />
        <Chip
          label={brand.isActive ? t('status.active') : t('status.inactive')}
          color={brand.isActive ? 'success' : 'default'}
          size="small"
          icon={brand.isActive ? <Visibility /> : <VisibilityOff />}
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            height: { xs: 20, sm: 24 },
          }}
        />
      </Box>

      <CardContent sx={{ flex: 1, p: { xs: 1, sm: 1.5 }, pb: { xs: 0.5, sm: 1 } }}>
        {/* Brand Name */}
        <Typography
          variant="subtitle1"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            mb: 0.5,
            lineHeight: 1.3,
          }}
          noWrap
        >
          {brand.name}
        </Typography>

        {/* English Name */}
        {brand.nameEn && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
              mb: 1,
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {brand.nameEn}
          </Typography>
        )}

        {/* Sort Order */}
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <Chip
            label={brand.sortOrder}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ 
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              height: { xs: 20, sm: 22 },
            }}
          />
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          p: { xs: 0.75, sm: 1 },
          pt: 0,
          justifyContent: 'center',
          gap: 0.5,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Tooltip title={t('tooltips.edit')}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onEdit(brand)}
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            <Edit fontSize="inherit" />
          </IconButton>
        </Tooltip>

        <Tooltip title={brand.isActive ? t('tooltips.deactivate') : t('tooltips.activate')}>
          <IconButton
            size="small"
            color={brand.isActive ? 'warning' : 'success'}
            onClick={() => onToggleStatus(brand)}
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            {brand.isActive ? <ToggleOff fontSize="inherit" /> : <ToggleOn fontSize="inherit" />}
          </IconButton>
        </Tooltip>

        <Tooltip title={t('tooltips.delete')}>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(brand)}
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            <Delete fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};


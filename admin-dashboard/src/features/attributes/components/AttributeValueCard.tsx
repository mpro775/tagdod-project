import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/shared/utils/formatters';
import type { AttributeValue } from '../types/attribute.types';

interface AttributeValueCardProps {
  value: AttributeValue;
  onEdit: () => void;
  onDelete: () => void;
}

export const AttributeValueCard: React.FC<AttributeValueCardProps> = ({
  value,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation('attributes');

  return (
    <Card
      sx={{
        mb: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
        borderLeft: value.isActive ? '4px solid' : 'none',
        borderLeftColor: value.isActive ? 'success.main' : 'transparent',
        opacity: value.deletedAt ? 0.7 : 1,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-of-type': { pb: { xs: 2, sm: 2.5 } } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Image or Color Preview */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              {value.imageUrl ? (
                <Box
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    backgroundColor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <Box
                    component="img"
                    src={value.imageUrl}
                    alt={value.value}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </Box>
              ) : value.hexCode ? (
                <Box
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    borderRadius: 1.5,
                    bgcolor: value.hexCode,
                    border: '2px solid',
                    borderColor: 'grey.300',
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                />
              ) : null}
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    fontSize: { xs: '0.95rem', sm: '1.1rem' }, 
                    mb: 0.5,
                    wordBreak: 'break-word',
                  }}
                >
                  {value.value}
                </Typography>
                {value.valueEn && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      wordBreak: 'break-word',
                    }}
                  >
                    {value.valueEn}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Description */}
            {value.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  mb: 1.5,
                  wordBreak: 'break-word',
                }}
              >
                {value.description}
              </Typography>
            )}

            {/* Hex Code if exists */}
            {value.hexCode && (
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    bgcolor: 'grey.100',
                    px: 1,
                    py: 0.5,
                    borderRadius: 0.5,
                    display: 'inline-block',
                  }}
                >
                  {value.hexCode}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 0.5, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Tooltip title={t('tooltips.edit')}>
              <IconButton size="small" color="primary" onClick={onEdit}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip 
              title={
                (value.usageCount || 0) > 0
                  ? (value.usageCount === 1
                      ? t('tooltips.deleteDisabled', { count: value.usageCount })
                      : t('tooltips.deleteDisabledPlural', { count: value.usageCount }))
                  : t('tooltips.delete')
              }
            >
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={(value.usageCount || 0) > 0}
                  onClick={onDelete}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Footer Info */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 2 }, alignItems: 'center' }}>
          <Chip
            label={value.isActive ? t('status.active') : t('status.inactive')}
            size="small"
            color={value.isActive ? 'success' : 'default'}
            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: 24 }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              {t('fields.order')}:
            </Typography>
            <Chip
              label={value.order}
              size="small"
              variant="outlined"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: 24, minWidth: 32 }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              {t('fields.usage')}:
            </Typography>
            <Chip
              label={value.usageCount || 0}
              size="small"
              variant="outlined"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: 24, minWidth: 32 }}
            />
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              ml: 'auto',
            }}
          >
            {formatDate(new Date(value.createdAt))}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};


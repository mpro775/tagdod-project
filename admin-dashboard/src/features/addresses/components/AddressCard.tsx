import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/shared/utils/formatters';
import type { Address } from '../types/address.types';

interface AddressCardProps {
  address: Address;
  onClick?: () => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({ address, onClick }) => {
  const { t } = useTranslation('addresses');

  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 2,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        } : {},
        borderLeft: address.isDefault ? '4px solid' : 'none',
        borderLeftColor: address.isDefault ? 'primary.main' : 'transparent',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <LocationIcon color="primary" sx={{ fontSize: 20 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                {address.label}
              </Typography>
              {address.isDefault && (
                <Chip
                  label={t('list.status.default', { defaultValue: 'افتراضي' })}
                  size="small"
                  color="primary"
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
              )}
              {address.deletedAt && (
                <Chip
                  label={t('list.status.deleted', { defaultValue: 'محذوف' })}
                  size="small"
                  color="error"
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {address.line1}
            </Typography>
            {address.notes && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                📝 {address.notes}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* User Info */}
        <Stack spacing={1.5} sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {t('list.columns.user', { defaultValue: 'المستخدم' })}
              </Typography>
              <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {address.userId?.name || '-'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {t('list.columns.phone', { defaultValue: 'الهاتف' })}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {address.userId?.phone || '-'}
              </Typography>
            </Box>
          </Box>
        </Stack>

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
              {t('list.columns.city', { defaultValue: 'المدينة' })}
            </Typography>
            <Chip
              label={address.city}
              size="small"
              variant="outlined"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: 24 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, display: 'block', mb: 0.5 }}>
              {t('list.columns.usage', { defaultValue: 'الاستخدام' })}
            </Typography>
            <Chip
              label={address.usageCount || 0}
              size="small"
              variant="outlined"
              color={address.usageCount > 5 ? 'success' : 'default'}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: 24 }}
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 2', sm: 'auto' } }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, display: 'block', mb: 0.5 }}>
              {t('list.columns.status', { defaultValue: 'الحالة' })}
            </Typography>
            <Chip
              label={
                address.isActive
                  ? t('list.status.active', { defaultValue: 'نشط' })
                  : t('list.status.inactive', { defaultValue: 'غير نشط' })
              }
              size="small"
              color={address.isActive ? 'success' : 'default'}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: 24 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              {formatDate(new Date(address.createdAt))}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};


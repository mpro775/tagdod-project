import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Star,
  Visibility,
  Phone,
  Email,
  Edit,
  Block,
  LocationCity,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatNumber, formatCurrency } from '@/shared/utils/formatters';
import { getCityEmoji } from '@/shared/constants/yemeni-cities';

interface EngineerCardProps {
  engineer: any;
  onView?: (engineer: any) => void;
  onEdit?: (engineer: any) => void;
  onToggleStatus?: (engineer: any) => void;
}

export const EngineerCard: React.FC<EngineerCardProps> = ({
  engineer,
  onView,
  onEdit,
  onToggleStatus,
}) => {
  const { t } = useTranslation(['services', 'common']);
  const theme = useTheme();

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'warning';
    return 'error';
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'error';
  };

  return (
    <Card
      sx={{
        mb: 2,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark' ? 4 : 2,
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease',
        },
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" flex={1}>
            <Avatar
              sx={{
                mr: 2,
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
              }}
            >
              {engineer.engineerName?.charAt(0) || '?'}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight="medium" noWrap>
                {engineer.engineerName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {engineer.engineerPhone}
              </Typography>
              {engineer.specialization && (
                <Box mt={0.5}>
                  <Chip
                    label={engineer.specialization}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Stack direction="row" spacing={0.5}>
            {onView && (
              <Tooltip title={t('common:actions.view')}>
                <IconButton size="small" onClick={() => onView(engineer)} color="primary">
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title={t('common:actions.edit')}>
                <IconButton size="small" onClick={() => onEdit(engineer)} color="info">
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onToggleStatus && (
              <Tooltip title={engineer.isActive ? t('services:engineers.suspend') : t('services:engineers.activate')}>
                <IconButton
                  size="small"
                  onClick={() => onToggleStatus(engineer)}
                  color={engineer.isActive ? 'warning' : 'success'}
                >
                  <Block fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* Stats Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            mb: 2,
          }}
        >
          {/* Total Requests */}
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('services:engineers.totalRequests')}
            </Typography>
            <Typography variant="h6" color="primary">
              {formatNumber(engineer.totalRequests)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatNumber(engineer.completedRequests)} {t('services:engineers.completed')}
            </Typography>
          </Box>

          {/* Rating */}
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('services:engineers.rating')}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Star sx={{ color: 'warning.main', fontSize: '1rem' }} />
              <Chip
                label={engineer.averageRating?.toFixed(1) || '0.0'}
                color={getRatingColor(engineer.averageRating || 0) as any}
                size="small"
              />
            </Box>
          </Box>

          {/* Revenue */}
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('services:engineers.revenue')}
            </Typography>
            <Typography variant="h6" color="success.main">
              {formatCurrency(engineer.totalRevenue)}
            </Typography>
          </Box>

          {/* Status */}
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('services:engineers.status')}
            </Typography>
            <Chip
              label={engineer.isActive ? t('common:status.active') : t('common:status.inactive')}
              color={engineer.isActive ? 'success' : 'default'}
              size="small"
              icon={engineer.isActive ? <CheckCircle /> : <Cancel />}
            />
          </Box>
        </Box>

        {/* Completion Rate */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              {t('services:engineers.completionRate')}
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {engineer.completionRate?.toFixed(1) || 0}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={engineer.completionRate || 0}
            color={getCompletionRateColor(engineer.completionRate || 0) as any}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* City */}
        {engineer.city && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <LocationCity sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Chip
              label={`${getCityEmoji(engineer.city)} ${engineer.city}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

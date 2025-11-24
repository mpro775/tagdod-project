import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  Stack,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Edit,
  Delete,
  ToggleOn,
  ToggleOff,
  Visibility,
  AdsClick,
  TrendingUp,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Banner } from '../types/banner.types';

// Helper function to get image URL from banner
const getBannerImageUrl = (banner: Banner): string => {
  // If imageId is a Media object (populated), use its URL
  if (banner.imageId && typeof banner.imageId === 'object') {
    return banner.imageId.url;
  }
  // Fallback to imageUrl for backward compatibility
  if (banner.imageUrl) {
    return banner.imageUrl;
  }
  // Return empty string if no image
  return '';
};

interface BannerCardProps {
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  onToggleStatus: (banner: Banner) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const calculateCTR = (views: number, clicks: number) => {
  if (views === 0) return 0;
  return ((clicks / views) * 100).toFixed(1);
};

const calculateConversionRate = (clicks: number, conversions: number) => {
  if (clicks === 0) return 0;
  return ((conversions / clicks) * 100).toFixed(1);
};

export const BannerCard: React.FC<BannerCardProps> = ({
  banner,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const { t } = useTranslation('banners');
  const theme = useTheme();

  const getLocationLabel = (location: string) => {
    return t(`form.location.${location}`, { defaultValue: location });
  };

  const getPromotionTypeLabel = (type: string) => {
    return t(`form.promotionType.${type}`, { defaultValue: type });
  };
  
  const ctr = calculateCTR(banner.viewCount, banner.clickCount);
  const conversionRate = calculateConversionRate(banner.clickCount, banner.conversionCount);

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
      {/* Banner Image */}
      <CardMedia
        component="img"
        height="180"
        image={getBannerImageUrl(banner)}
        alt={banner.altText || banner.title}
        sx={{
          objectFit: 'cover',
          backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
        }}
        onError={(e) => {
          // Hide image if it fails to load
          e.currentTarget.style.display = 'none';
        }}
      />

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Title and Status */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box flex={1}>
            <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom noWrap>
              {banner.title}
            </Typography>
            {banner.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 1,
                }}
              >
                {banner.description}
              </Typography>
            )}
          </Box>
          <Chip
            label={banner.isActive ? t('stats.active') : t('stats.inactive')}
            color={banner.isActive ? 'success' : 'default'}
            size="small"
            sx={{ ml: 1, flexShrink: 0 }}
          />
        </Box>

        {/* Location and Promotion Type */}
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
          <Chip
            label={getLocationLabel(banner.location)}
            size="small"
            color="primary"
            variant="outlined"
          />
          {banner.promotionType && (
            <Chip
              label={getPromotionTypeLabel(banner.promotionType)}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Statistics */}
        <Box mb={1.5}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold" mb={1} display="block">
            {t('table.stats')}
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={0.5}>
              <Visibility fontSize="small" color="action" />
              <Typography variant="caption">{banner.viewCount.toLocaleString()}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <AdsClick fontSize="small" color="action" />
              <Typography variant="caption">{banner.clickCount.toLocaleString()}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <TrendingUp fontSize="small" color="action" />
              <Typography variant="caption">{banner.conversionCount.toLocaleString()}</Typography>
            </Box>
          </Stack>
          <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
            {t('table.ctr', { rate: ctr })} | {t('table.conversion', { rate: conversionRate })}
          </Typography>
        </Box>

        {/* Link URL */}
        {banner.linkUrl && (
          <Box mb={1.5}>
            <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
              <LinkIcon fontSize="small" color="action" />
              <Typography
                variant="caption"
                component="a"
                href={banner.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                {t('table.redirectLink')}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Date Range */}
        {(banner.startDate || banner.endDate) && (
          <Box mb={1}>
            <Typography variant="caption" color="text.secondary" display="block">
              {banner.startDate && (
                <Typography variant="caption" component="span" display="block">
                  {t('table.from')}: {formatDate(banner.startDate)}
                </Typography>
              )}
              {banner.endDate && (
                <Typography variant="caption" component="span" display="block">
                  {t('table.to')}: {formatDate(banner.endDate)}
                </Typography>
              )}
            </Typography>
          </Box>
        )}

        {/* Sort Order */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {t('table.sortOrder')}: <strong>{banner.sortOrder}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(banner.createdAt)}
          </Typography>
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 1.5 }}>
        <Tooltip title={t('actions.edit')}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onEdit(banner)}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={banner.isActive ? t('actions.toggleOff') : t('actions.toggleOn')}>
          <IconButton
            size="small"
            color={banner.isActive ? 'warning' : 'success'}
            onClick={() => onToggleStatus(banner)}
          >
            {banner.isActive ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title={t('actions.delete')}>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(banner)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};


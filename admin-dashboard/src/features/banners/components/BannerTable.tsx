import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Avatar,
  Link,
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
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
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

interface BannerTableProps {
  banners: Banner[];
  isLoading: boolean;
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  onToggleStatus: (banner: Banner) => void;
  paginationModel: { page: number; pageSize: number };
  onPaginationModelChange: (model: { page: number; pageSize: number }) => void;
  rowCount: number;
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

export const BannerTable: React.FC<BannerTableProps> = ({
  banners,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  paginationModel,
  onPaginationModelChange,
}) => {
  const { t } = useTranslation('banners');

  const getLocationLabel = (location: string) => {
    return t(`form.location.${location}`, { defaultValue: location });
  };

  const getPromotionTypeLabel = (type: string) => {
    return t(`form.promotionType.${type}`, { defaultValue: type });
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: t('table.banner'),
      width: 350,
      flex: 0.3,
      minWidth: 300,
      renderCell: (params) => {
        const banner = params.row as Banner;
        return (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1, width: '100%' }}>
            <Avatar
              src={getBannerImageUrl(banner)}
              alt={banner.altText || banner.title}
              variant="rounded"
              sx={{ width: 60, height: 40, flexShrink: 0 }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="body2" 
                fontWeight="bold" 
                sx={{ 
                  wordBreak: 'break-word',
                  mb: banner.description ? 0.5 : 0
                }}
              >
                {banner.title}
              </Typography>
              {banner.description && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    display: 'block',
                    wordBreak: 'break-word',
                    mb: banner.linkUrl ? 0.5 : 0
                  }}
                >
                  {banner.description}
                </Typography>
              )}
              {banner.linkUrl && (
                <Box display="flex" alignItems="center" gap={0.5} mt={0.5} sx={{ flexWrap: 'wrap' }}>
                  <LinkIcon fontSize="small" color="action" />
                  <Link
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="caption"
                    color="primary"
                    sx={{ 
                      textDecoration: 'none',
                      wordBreak: 'break-all',
                      maxWidth: '100%'
                    }}
                  >
                    {t('table.redirectLink')}
                  </Link>
                </Box>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'location',
      headerName: t('table.location'),
      width: 140,
      flex: 0.15,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={getLocationLabel(params.value)}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
        />
      ),
    },
    {
      field: 'promotionType',
      headerName: t('table.promotionType'),
      width: 140,
      flex: 0.15,
      minWidth: 120,
      renderCell: (params) => {
        if (!params.value) return '-';
        return (
          <Chip
            label={getPromotionTypeLabel(params.value)}
            size="small"
            color="secondary"
            variant="outlined"
            sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
          />
        );
      },
    },
    {
      field: 'stats',
      headerName: t('table.stats'),
      width: 180,
      flex: 0.2,
      minWidth: 160,
      renderCell: (params) => {
        const banner = params.row as Banner;
        const ctr = calculateCTR(banner.viewCount, banner.clickCount);
        const conversionRate = calculateConversionRate(banner.clickCount, banner.conversionCount);
        
        return (
          <Box sx={{ py: 0.5, width: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Visibility fontSize="small" color="action" />
              <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>
                {banner.viewCount.toLocaleString()}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <AdsClick fontSize="small" color="action" />
              <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>
                {banner.clickCount.toLocaleString()}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <TrendingUp fontSize="small" color="action" />
              <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>
                {banner.conversionCount.toLocaleString()}
              </Typography>
            </Box>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                display: 'block',
                wordBreak: 'break-word',
                lineHeight: 1.4
              }}
            >
              CTR: {ctr}% | تحويل: {conversionRate}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'isActive',
      headerName: t('table.status'),
      width: 110,
      flex: 0.1,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? t('stats.active') : t('stats.inactive')}
          color={params.value ? 'success' : 'default'}
          size="small"
          sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
        />
      ),
    },
    {
      field: 'sortOrder',
      headerName: t('table.sortOrder'),
      width: 100,
      flex: 0.1,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'dateRange',
      headerName: t('table.dateRange'),
      width: 180,
      flex: 0.18,
      minWidth: 160,
      renderCell: (params) => {
        const banner = params.row as Banner;
        return (
          <Box sx={{ py: 0.5, width: '100%' }}>
            {banner.startDate && (
              <Typography 
                variant="caption" 
                display="block"
                sx={{ wordBreak: 'break-word', mb: 0.5 }}
              >
                {t('table.from')}: {formatDate(banner.startDate)}
              </Typography>
            )}
            {banner.endDate && (
              <Typography 
                variant="caption" 
                display="block"
                sx={{ wordBreak: 'break-word' }}
              >
                {t('table.to')}: {formatDate(banner.endDate)}
              </Typography>
            )}
            {!banner.startDate && !banner.endDate && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ wordBreak: 'break-word' }}
              >
                {t('table.noTimeConstraints')}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: t('table.createdAt'),
      width: 130,
      flex: 0.12,
      minWidth: 120,
      renderCell: (params) => (
        <Typography 
          variant="caption"
          sx={{ wordBreak: 'break-word' }}
        >
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: t('table.actions'),
      width: 140,
      flex: 0.12,
      minWidth: 130,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const banner = params.row as Banner;
        return (
          <Box display="flex" gap={0.5} justifyContent="center" sx={{ flexWrap: 'wrap' }}>
            <Tooltip title={t('actions.edit')}>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(banner);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={banner.isActive ? t('actions.toggleOff') : t('actions.toggleOn')}>
              <IconButton
                size="small"
                color={banner.isActive ? 'warning' : 'success'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(banner);
                }}
              >
                {banner.isActive ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Tooltip title={t('actions.delete')}>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(banner);
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={banners}
      loading={isLoading}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      height="calc(100vh - 300px)"
      getRowId={(row) => (row as Banner)._id}
      getRowHeight={() => 'auto'}
      sx={{
        '& .MuiDataGrid-cell': {
          py: 1,
          display: 'flex',
          alignItems: 'flex-start',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
        },
        '& .MuiDataGrid-row': {
          maxHeight: 'none !important',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        },
        '& .MuiDataGrid-cellContent': {
          whiteSpace: 'normal',
          wordBreak: 'break-word',
        },
      }}
    />
  );
};

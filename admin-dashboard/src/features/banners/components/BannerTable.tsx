import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Avatar,
  Link,
  Skeleton,
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
import { BANNER_LOCATION_OPTIONS, BANNER_PROMOTION_TYPE_OPTIONS } from '../types/banner.types';
import type { Banner } from '../types/banner.types';

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

const getLocationLabel = (location: string) => {
  return BANNER_LOCATION_OPTIONS.find(opt => opt.value === location)?.label || location;
};

const getPromotionTypeLabel = (type: string) => {
  return BANNER_PROMOTION_TYPE_OPTIONS.find(opt => opt.value === type)?.label || type;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ar-SA', {
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
  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'البانر',
      width: 300,
      renderCell: (params) => {
        const banner = params.row as Banner;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
            <Avatar
              src={banner.imageUrl}
              alt={banner.title}
              variant="rounded"
              sx={{ width: 60, height: 40 }}
            />
            <Box>
              <Typography variant="body2" fontWeight="bold" noWrap>
                {banner.title}
              </Typography>
              {banner.description && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {banner.description}
                </Typography>
              )}
              {banner.linkUrl && (
                <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                  <LinkIcon fontSize="small" color="action" />
                  <Link
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="caption"
                    color="primary"
                    sx={{ textDecoration: 'none' }}
                  >
                    رابط التوجيه
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
      headerName: 'الموقع',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={getLocationLabel(params.value)}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'promotionType',
      headerName: 'نوع الترويج',
      width: 150,
      renderCell: (params) => {
        if (!params.value) return '-';
        return (
          <Chip
            label={getPromotionTypeLabel(params.value)}
            size="small"
            color="secondary"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'stats',
      headerName: 'الإحصائيات',
      width: 200,
      renderCell: (params) => {
        const banner = params.row as Banner;
        const ctr = calculateCTR(banner.viewCount, banner.clickCount);
        const conversionRate = calculateConversionRate(banner.clickCount, banner.conversionCount);
        
        return (
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Visibility fontSize="small" color="action" />
              <Typography variant="caption">{banner.viewCount.toLocaleString()}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <AdsClick fontSize="small" color="action" />
              <Typography variant="caption">{banner.clickCount.toLocaleString()}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUp fontSize="small" color="action" />
              <Typography variant="caption">{banner.conversionCount.toLocaleString()}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              CTR: {ctr}% | تحويل: {conversionRate}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'isActive',
      headerName: 'الحالة',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'نشط' : 'غير نشط'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'sortOrder',
      headerName: 'الترتيب',
      width: 100,
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'dateRange',
      headerName: 'نطاق التاريخ',
      width: 200,
      renderCell: (params) => {
        const banner = params.row as Banner;
        return (
          <Box>
            {banner.startDate && (
              <Typography variant="caption" display="block">
                من: {formatDate(banner.startDate)}
              </Typography>
            )}
            {banner.endDate && (
              <Typography variant="caption" display="block">
                إلى: {formatDate(banner.endDate)}
              </Typography>
            )}
            {!banner.startDate && !banner.endDate && (
              <Typography variant="caption" color="text.secondary">
                بدون قيود زمنية
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الإنشاء',
      width: 150,
      renderCell: (params) => (
        <Typography variant="caption">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const banner = params.row as Banner;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="تعديل">
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
            
            <Tooltip title={banner.isActive ? 'تعطيل' : 'تفعيل'}>
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
            
            <Tooltip title="حذف">
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

  const LoadingSkeleton = () => (
    <Box>
      {[...Array(5)].map((_, index) => (
        <Box key={index} display="flex" alignItems="center" p={2} borderBottom="1px solid #e0e0e0">
          <Skeleton variant="rectangular" width={60} height={40} sx={{ mr: 2 }} />
          <Box flex={1}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
          <Skeleton variant="rectangular" width={80} height={24} sx={{ mr: 2 }} />
          <Skeleton variant="rectangular" width={60} height={24} sx={{ mr: 2 }} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      ))}
    </Box>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <DataTable
      columns={columns}
      rows={banners}
      loading={isLoading}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      height="calc(100vh - 300px)"
      getRowId={(row) => (row as Banner)._id}
    />
  );
};

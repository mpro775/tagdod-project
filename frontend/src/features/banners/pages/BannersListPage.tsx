import React from 'react';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { Edit, Delete, ToggleOn, ToggleOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useBanners, useDeleteBanner, useToggleBannerStatus } from '../hooks/useBanners';
import type { Banner } from '../types/banner.types';

export const BannersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: banners = [], isLoading, refetch } = useBanners({});
  const { mutate: deleteBanner } = useDeleteBanner();
  const { mutate: toggleStatus } = useToggleBannerStatus();

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'العنوان',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src={params.row.image}
            sx={{ width: 50, height: 30, objectFit: 'cover', borderRadius: 1 }}
          />
          <Typography variant="body2">{params.row.title}</Typography>
        </Box>
      ),
    },
    { field: 'location', headerName: 'الموقع', width: 150 },
    { field: 'type', headerName: 'النوع', width: 100 },
    { field: 'clickCount', headerName: 'النقرات', width: 100, align: 'center' },
    { field: 'viewCount', headerName: 'المشاهدات', width: 100, align: 'center' },
    {
      field: 'isActive',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'نشط' : 'غير نشط'}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
        />
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
                  navigate(`/banners/${banner._id}`);
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
                  toggleStatus(banner._id, { onSuccess: () => refetch() });
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
                  if (window.confirm(`هل تريد حذف "${banner.title}"؟`))
                    deleteBanner(banner._id, { onSuccess: () => refetch() });
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
    <Box>
      <DataTable
        title="إدارة البانرات"
        columns={columns}
        rows={banners}
        loading={isLoading}
        paginationModel={{ page: 0, pageSize: 20 }}
        onPaginationModelChange={() => {}}
        rowCount={banners.length}
        onAdd={() => navigate('/banners/new')}
        addButtonText="إضافة بانر"
        height="calc(100vh - 200px)"
      />
    </Box>
  );
};

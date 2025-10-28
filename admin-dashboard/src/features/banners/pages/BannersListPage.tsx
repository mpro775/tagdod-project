import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { Add, Analytics, Campaign } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BannerStatsCards } from '../components/BannerStatsCards';
import { BannerFilters } from '../components/BannerFilters';
import { BannerTable } from '../components/BannerTable';
import { BannerDialog } from '../components/BannerDialog';
import {
  useBanners,
  useDeleteBanner,
  useToggleBannerStatus,
  useCreateBanner,
  useUpdateBanner,
} from '../hooks/useBanners';
import type {
  Banner,
  CreateBannerDto,
  UpdateBannerDto,
  ListBannersDto,
} from '../types/banner.types';

export const BannersListPage: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [filters, setFilters] = useState<ListBannersDto>({
    page: 1,
    limit: 20,
    sortBy: 'sortOrder',
    sortOrder: 'asc',
  });
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | undefined>();

  // API hooks
  const { data: bannersData, isLoading, refetch } = useBanners(filters);
  const { mutate: createBanner, isPending: creating } = useCreateBanner();
  const { mutate: updateBanner, isPending: updating } = useUpdateBanner();
  const { mutate: deleteBanner, isPending: deleting } = useDeleteBanner();
  const { mutate: toggleStatus } = useToggleBannerStatus();

  const banners = bannersData?.banners || [];
  const pagination = bannersData?.pagination;

  // Event handlers
  const handleFiltersChange = (newFilters: ListBannersDto) => {
    setFilters(newFilters);
    setPaginationModel({ page: 0, pageSize: newFilters.limit || 20 });
  };

  const handleResetFilters = () => {
    const resetFilters: ListBannersDto = {
      page: 1,
      limit: 20,
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    };
    setFilters(resetFilters);
    setPaginationModel({ page: 0, pageSize: 20 });
  };

  const handlePaginationModelChange = (model: { page: number; pageSize: number }) => {
    setPaginationModel(model);
    setFilters((prev) => ({
      ...prev,
      page: model.page + 1,
      limit: model.pageSize,
    }));
  };

  const handleAddBanner = () => {
    setEditingBanner(undefined);
    setDialogOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setDialogOpen(true);
  };

  const handleDeleteBanner = (banner: Banner) => {
    setBannerToDelete(banner);
    setDeleteConfirmOpen(true);
  };

  const handleToggleStatus = (banner: Banner) => {
    toggleStatus(banner._id, {
      onSuccess: () => {
        refetch();
        toast.success(banner.isActive ? 'تم تعطيل البانر' : 'تم تفعيل البانر');
      },
    });
  };

  const handleSaveBanner = (data: CreateBannerDto | UpdateBannerDto) => {
    if (editingBanner) {
      updateBanner(
        { id: editingBanner._id, data: data as UpdateBannerDto },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingBanner(undefined);
            refetch();
          },
        }
      );
    } else {
      createBanner(data as CreateBannerDto, {
        onSuccess: () => {
          setDialogOpen(false);
          refetch();
        },
      });
    }
  };

  const handleConfirmDelete = () => {
    if (bannerToDelete) {
      deleteBanner(bannerToDelete._id, {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setBannerToDelete(undefined);
          refetch();
        },
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setBannerToDelete(undefined);
  };

  const handleViewAnalytics = () => {
    navigate('/banners/analytics');
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Campaign fontSize="large" color="primary" />
          <Typography variant="h4" component="h1">
            إدارة البانرات
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<Analytics />} onClick={handleViewAnalytics}>
            الإحصائيات
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleAddBanner}>
            إضافة بانر
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <BannerStatsCards />

      {/* Filters */}
      <BannerFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        isLoading={isLoading}
      />

      {/* Banners Table */}
      <BannerTable
        banners={banners}
        isLoading={isLoading}
        onEdit={handleEditBanner}
        onDelete={handleDeleteBanner}
        onToggleStatus={handleToggleStatus}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        rowCount={pagination?.total || 0}
      />

      {/* Banner Dialog */}
      <BannerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        banner={editingBanner}
        onSave={handleSaveBanner}
        isLoading={creating || updating}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete} maxWidth="sm" fullWidth>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            هل أنت متأكد من حذف البانر "{bannerToDelete?.title}"؟
            <br />
            <strong>هذا الإجراء لا يمكن التراجع عنه.</strong>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>
            إلغاء
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'جاري الحذف...' : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

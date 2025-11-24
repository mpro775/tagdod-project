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
  Grid,
  Pagination,
  Stack,
} from '@mui/material';
import { Add, Campaign } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { BannerStatsCards } from '../components/BannerStatsCards';
import { BannerFilters } from '../components/BannerFilters';
import { BannerCard } from '../components/BannerCard';
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
  const { t } = useTranslation('banners');
  const { isMobile } = useBreakpoint();

  // State management
  const [filters, setFilters] = useState<ListBannersDto>({
    page: 1,
    limit: 20,
    sortBy: 'sortOrder',
    sortOrder: 'asc',
  });
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
  };

  const handleResetFilters = () => {
    const resetFilters: ListBannersDto = {
      page: 1,
      limit: 20,
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    };
    setFilters(resetFilters);
  };

  const handlePaginationChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
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
        toast.success(
          t('messages.toggled', {
            action: banner.isActive ? t('messages.deactivated') : t('messages.activated'),
          })
        );
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

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          gap={2}
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Campaign fontSize={isMobile ? 'medium' : 'large'} color="primary" />
            <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {t('pageTitle')}
            </Typography>
          </Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddBanner}
              fullWidth={isMobile}
              size={isMobile ? 'medium' : 'large'}
            >
              {t('addBanner')}
            </Button>
          </Stack>
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

      {/* Banners Cards */}
      <Box>
        {isLoading ? (
          <Grid container spacing={2}>
            {[...Array(6)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                <Box
                  sx={{
                    height: 400,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        ) : banners.length === 0 ? (
          <Box
            textAlign="center"
            py={8}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Campaign sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('noBanners')}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {t('noBannersDescription')}
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleAddBanner}>
              {t('addBanner')}
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {banners.map((banner) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={banner._id}>
                  <BannerCard
                    banner={banner}
                    onEdit={handleEditBanner}
                    onDelete={handleDeleteBanner}
                    onToggleStatus={handleToggleStatus}
                  />
                </Grid>
              ))}
            </Grid>
            {pagination && pagination.pages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={pagination.pages}
                  page={filters.page || 1}
                  onChange={(_, page) => {
                    handlePaginationChange(page);
                  }}
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Banner Dialog */}
      <BannerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        banner={editingBanner}
        onSave={handleSaveBanner}
        isLoading={creating || updating}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{t('confirmDelete')}</DialogTitle>
        <DialogContent id="delete-dialog-description">
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('deleteConfirmation', { title: bannerToDelete?.title })}
            <br />
            <strong>{t('deleteWarning')}</strong>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? t('deleting') : t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

import React, { useState } from 'react';
import { 
  Box, 
  Stack,
  Paper as MuiPaper,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, Restore, Info } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useDeletedUsers } from '../hooks/useUsers';
import type { DeletedUser } from '../types/user.types';
import { useRestoreUser } from '../hooks/useUsers';
import { formatDate } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';
import '../styles/responsive-users.css';

export const DeletedUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // State
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: isMobile ? 10 : 20,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'deletedAt', sort: 'desc' }]);
  const [searchQuery, setSearchQuery] = useState('');

  // API
  const { data, isLoading, refetch } = useDeletedUsers({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: searchQuery || undefined,
    sortBy: sortModel[0]?.field || 'deletedAt',
    sortOrder: sortModel[0]?.sort || 'desc',
  });

  const restoreUserMutation = useRestoreUser();

  // Handle restore
  const handleRestore = (user: DeletedUser) => {
    if (window.confirm(t('users:deleted.confirmRestore', 'هل أنت متأكد من استعادة هذا الحساب؟'))) {
      restoreUserMutation.mutate(user.id, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  // Table Columns
  const columns = React.useMemo(() => [
    {
      field: 'phone',
      headerName: t('users:list.columns.phone', 'رقم الهاتف'),
      minWidth: 120,
      flex: 0.9,
      renderCell: (params: any) => (
        <Box
          sx={{
            fontWeight: 'medium',
            fontSize: { xs: '0.7rem', sm: '0.875rem' },
            color: 'text.primary',
          }}
        >
          {params.row.phone}
        </Box>
      ),
    },
    {
      field: 'name',
      headerName: t('users:list.columns.name', 'الاسم'),
      minWidth: 130,
      flex: 1.2,
      renderCell: (params: any) => {
        const fullName = `${params.row.firstName || ''} ${params.row.lastName || ''}`.trim();
        return (
          <Box
            sx={{
              fontWeight: 'medium',
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
            }}
          >
            {fullName || t('common:notProvided', 'غير متوفر')}
          </Box>
        );
      },
    },
    {
      field: 'deletionReason',
      headerName: t('users:deleted.deletionReason', 'سبب الحذف'),
      minWidth: 200,
      flex: 2,
      renderCell: (params: any) => (
        <Tooltip title={params.row.deletionReason} arrow>
          <Box
            sx={{
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Info sx={{ fontSize: '0.875rem', color: 'text.disabled' }} />
            {params.row.deletionReason}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: 'deletedAt',
      headerName: t('users:deleted.deletedAt', 'تاريخ الحذف'),
      minWidth: 150,
      flex: 1,
      renderCell: (params: any) => (
        <Box
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.875rem' },
            color: 'text.secondary',
          }}
        >
          {formatDate(params.row.deletedAt)}
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: t('users:list.columns.createdAt', 'تاريخ الإنشاء'),
      minWidth: 150,
      flex: 1,
      renderCell: (params: any) => (
        <Box
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.875rem' },
            color: 'text.secondary',
          }}
        >
          {formatDate(params.row.createdAt)}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: t('common:actions', 'الإجراءات'),
      minWidth: 120,
      flex: 0.8,
      sortable: false,
      renderCell: (params: any) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('users:deleted.restore', 'استعادة')}>
            <IconButton
              size="small"
              onClick={() => handleRestore(params.row)}
              disabled={restoreUserMutation.isPending}
              color="primary"
              sx={{
                '&:hover': {
                  bgcolor: 'primary.lighter',
                },
              }}
            >
              <Restore fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [t, restoreUserMutation.isPending, handleRestore]);

  // Calculate table height responsively
  const tableHeight = React.useMemo(() => {
    if (isSmallScreen) return 'calc(100vh - 320px)';
    if (isMobile) return 'calc(100vh - 300px)';
    return 'calc(100vh - 280px)';
  }, [isMobile, isSmallScreen]);

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'background.default',
        minHeight: '100vh',
        pb: { xs: 2, sm: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, px: { xs: 1, sm: 0 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          {t('users:deleted.title', 'الحسابات المحذوفة')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          }}
        >
          {t('users:deleted.description', 'عرض جميع الحسابات المحذوفة مع أسباب الحذف')}
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 2, px: { xs: 1, sm: 0 } }}>
        <MuiPaper
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
          }}
        >
          <TextField
            fullWidth
            placeholder={t('users:deleted.searchPlaceholder', 'ابحث بالاسم، رقم الهاتف، أو سبب الحذف...')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPaginationModel((prev) => ({ ...prev, page: 0 }));
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.default',
              },
            }}
          />
        </MuiPaper>
      </Box>

      {/* Stats Info */}
      {data && (
        <Box sx={{ mb: 2, px: { xs: 1, sm: 0 } }}>
          <Chip
            label={t('users:deleted.totalCount', `إجمالي: ${data.meta.total} حساب محذوف`, {
              count: data.meta.total,
            })}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>
      )}

      {/* Desktop View - Table */}
      <Box
        sx={{
          mb: 2,
          display: { xs: 'none', md: 'block' },
          px: { xs: 1, sm: 0 },
        }}
      >
        <DataTable
          title={t('users:deleted.title', 'الحسابات المحذوفة')}
          columns={columns}
          rows={data?.data || []}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          rowCount={data?.meta.total || 0}
          pageSizeOptions={[10, 20, 50, 100]}
          sx={{
            height: tableHeight,
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
          }}
        />
      </Box>

      {/* Mobile View - Cards */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          px: { xs: 1, sm: 0 },
        }}
      >
        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>{t('common:loading', 'جاري التحميل...')}</Typography>
          </Box>
        ) : data?.data && data.data.length > 0 ? (
          <Stack spacing={2}>
            {data.data.map((user) => (
              <MuiPaper
                key={user.id}
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  backgroundImage: 'none',
                }}
              >
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {user.firstName || user.lastName
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                          : t('common:notProvided', 'غير متوفر')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {user.phone}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRestore(user)}
                      disabled={restoreUserMutation.isPending}
                      color="primary"
                    >
                      <Restore />
                    </IconButton>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {t('users:deleted.deletionReason', 'سبب الحذف')}:
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {user.deletionReason}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {t('users:deleted.deletedAt', 'تاريخ الحذف')}: {formatDate(user.deletedAt)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {t('users:list.columns.createdAt', 'تاريخ الإنشاء')}: {formatDate(user.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              </MuiPaper>
            ))}
          </Stack>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {t('users:deleted.noResults', 'لا توجد حسابات محذوفة')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};


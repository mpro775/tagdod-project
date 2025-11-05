import React, { useState } from 'react';
import { 
  Box, 
  Stack,
  Paper as MuiPaper,
  TextField,
  InputAdornment,
  useTheme,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, Restore, Info } from '@mui/icons-material';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useDeletedUsers } from '../hooks/useUsers';
import type { DeletedUser } from '../types/user.types';
import { useRestoreUser } from '../hooks/useUsers';
import { formatDate } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import '../styles/responsive-users.css';

export const DeletedUsersPage: React.FC = () => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const { isMobile, isTablet, isXs } = useBreakpoint();

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
    if (window.confirm(t('users:deleted.confirmRestore'))) {
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
      headerName: t('common:actions.title', 'الإجراءات'),
      minWidth: 120,
      flex: 0.8,
      sortable: false,
      renderCell: (params: any) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('users:deleted.restore')}>
            <IconButton
              size="small"
              onClick={() => handleRestore(params.row)}
              disabled={restoreUserMutation.isPending}
              color="primary"
              sx={{
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.04)',
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
    if (isXs) return 'calc(100vh - 320px)';
    if (isMobile) return 'calc(100vh - 300px)';
    return 'calc(100vh - 280px)';
  }, [isMobile, isXs]);

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
      <Box sx={{ mb: { xs: 2, md: 3 }, px: { xs: 1, sm: 0 } }}>
        <Typography
          variant={isMobile ? 'h5' : isTablet ? 'h4' : 'h4'}
          sx={{
            fontWeight: 600,
            mb: 1,
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
            color: theme.palette.text.primary,
          }}
        >
          {t('users:deleted.title')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          }}
        >
          {t('users:deleted.description')}
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: { xs: 1.5, md: 2 }, px: { xs: 1, sm: 0 } }}>
        <MuiPaper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 2 },
            bgcolor: theme.palette.background.paper,
            backgroundImage: 'none',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
          }}
        >
          <TextField
            fullWidth
            placeholder={t('users:deleted.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPaginationModel((prev) => ({ ...prev, page: 0 }));
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: theme.palette.background.default,
                '& fieldset': {
                  borderColor: theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiInputBase-input': {
                color: theme.palette.text.primary,
              },
            }}
          />
        </MuiPaper>
      </Box>

      {/* Stats Info */}
      {data && (
        <Box sx={{ mb: { xs: 1.5, md: 2 }, px: { xs: 1, sm: 0 } }}>
          <Chip
            label={t('users:deleted.totalCount', { count: data.meta.total })}
            color="primary"
            variant="outlined"
            size={isMobile ? 'small' : 'medium'}
            sx={{
              fontWeight: 500,
              fontSize: isMobile ? '0.75rem' : undefined,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
              },
            }}
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
        <Box
          sx={{
            height: tableHeight,
            '& .MuiDataGrid-root': {
              border: 'none',
              bgcolor: theme.palette.background.paper,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.divider}`,
              color: theme.palette.text.primary,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.02)',
              borderBottom: `1px solid ${theme.palette.divider}`,
              color: theme.palette.text.primary,
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${theme.palette.divider}`,
              color: theme.palette.text.secondary,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.02)',
            },
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
            height={tableHeight}
          />
        </Box>
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
            <Typography color={theme.palette.text.secondary}>
              {t('common:loading')}
            </Typography>
          </Box>
        ) : data?.data && data.data.length > 0 ? (
          <Stack spacing={{ xs: 1.5, md: 2 }}>
            {data.data.map((user) => (
              <MuiPaper
                key={user.id}
                elevation={0}
                sx={{
                  p: { xs: 1.5, md: 2 },
                  bgcolor: theme.palette.background.paper,
                  backgroundImage: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                }}
              >
                <Stack spacing={{ xs: 1, md: 1.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant={isMobile ? 'body1' : 'subtitle1'}
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          fontSize: isMobile ? '0.875rem' : undefined,
                        }}
                      >
                        {user.firstName || user.lastName
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                          : t('common:notProvided')}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          mt: 0.5,
                          fontSize: isMobile ? '0.75rem' : undefined,
                        }}
                      >
                        {user.phone}
                      </Typography>
                    </Box>
                    <IconButton
                      size={isMobile ? 'small' : 'medium'}
                      onClick={() => handleRestore(user)}
                      disabled={restoreUserMutation.isPending}
                      color="primary"
                      sx={{
                        '&:hover': {
                          backgroundColor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.1)'
                              : 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <Restore fontSize={isMobile ? 'small' : 'medium'} />
                    </IconButton>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                        display: 'block',
                        mb: 0.5,
                        fontSize: isMobile ? '0.7rem' : undefined,
                      }}
                    >
                      {t('users:deleted.deletionReason')}:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.primary,
                        fontSize: isMobile ? '0.75rem' : undefined,
                      }}
                    >
                      {user.deletionReason}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: { xs: 1, md: 2 },
                      flexWrap: 'wrap',
                      pt: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: isMobile ? '0.7rem' : undefined,
                      }}
                    >
                      {t('users:deleted.deletedAt')}: {formatDate(user.deletedAt)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: isMobile ? '0.7rem' : undefined,
                      }}
                    >
                      {t('users:list.columns.createdAt')}: {formatDate(user.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              </MuiPaper>
            ))}
          </Stack>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography
              variant={isMobile ? 'body2' : 'body1'}
              sx={{ color: theme.palette.text.secondary }}
            >
              {t('users:deleted.noResults')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};


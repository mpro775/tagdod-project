import {
  Box,
  Typography,
  Tab,
  Tabs,
  Chip,
  Pagination,
  Skeleton,
  Stack,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Close as CloseIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { AddressStatsCards } from '../components/AddressStatsCards';
import { TopCitiesChart } from '../components/TopCitiesChart';
import { AddressCard } from '../components/AddressCard';
import { useAddressList } from '../hooks/useAddresses';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { formatDate } from '@/shared/utils/formatters';
import type { Address } from '../types/address.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`addresses-tabpanel-${index}`}
      aria-labelledby={`addresses-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function AddressesDashboardPage() {
  const { t } = useTranslation('addresses');
  const breakpoint = useBreakpoint();
  const [currentTab, setCurrentTab] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  // Listen to window resize
  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleOpenDetails = useCallback((address: Address) => {
    setSelectedAddress(address);
    setDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedAddress(null);
  }, []);

  // Fetch addresses data
  const { data, isLoading } = useAddressList({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: searchQuery || undefined,
    sortBy: (sortModel[0]?.field as 'createdAt' | 'usageCount' | 'lastUsedAt') || 'createdAt',
    sortOrder: (sortModel[0]?.sort as 'asc' | 'desc') || 'desc',
    includeDeleted: showDeleted || undefined,
    deletedOnly: showDeleted || undefined,
  });

  // Define columns
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'userId',
      headerName: t('list.columns.user', { defaultValue: 'المستخدم' }),
      minWidth: 200,
      flex: 1.2,
      renderCell: (params) => {
        const address = params.row as Address;
        return (
          <Box sx={{ py: 1 }}>
            <Typography 
              variant="body2" 
              fontWeight="medium" 
              sx={{ 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {address.userId?.name || '-'}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {address.userId?.phone || '-'}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'label',
      headerName: t('list.columns.label', { defaultValue: 'التسمية' }),
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => {
        const address = params.row as Address;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
            <Typography 
              variant="body2"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {address.label}
            </Typography>
            {address.isDefault && (
              <Chip 
                label={String(t('list.status.default', { defaultValue: 'افتراضي' }))} 
                size="small" 
                color="primary"
                sx={{ flexShrink: 0 }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'line1',
      headerName: t('list.columns.address', { defaultValue: 'العنوان' }),
      minWidth: 300,
      flex: 2,
      renderCell: (params) => {
        const address = params.row as Address;
        return (
          <Box sx={{ py: 1, width: '100%' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
              title={address.line1}
            >
              {address.line1}
            </Typography>
            {address.notes && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ 
                  display: 'block', 
                  mt: 0.5,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={address.notes}
              >
                {address.notes}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'city',
      headerName: t('list.columns.city', { defaultValue: 'المدينة' }),
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => {
        const address = params.row as Address;
        return (
          <Box sx={{ py: 1 }}>
            <Typography variant="body2">
              {address.city || '-'}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'usageCount',
      headerName: t('list.columns.usage', { defaultValue: 'الاستخدام' }),
      minWidth: 100,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const address = params.row as Address;
        return (
          <Chip
            label={address.usageCount || 0}
            size="small"
            variant="outlined"
            color={address.usageCount > 5 ? 'success' : 'default'}
          />
        );
      },
    },
    {
      field: 'isActive',
      headerName: t('list.columns.status', { defaultValue: 'الحالة' }),
      minWidth: 120,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const address = params.row as Address;
        if (address.deletedAt) {
          return (
            <Chip
              label={String(t('list.status.deleted', { defaultValue: 'محذوف' }))}
              size="small"
              color="error"
              variant="filled"
            />
          );
        }
        const statusLabel = address.isActive
          ? String(t('list.status.active', { defaultValue: 'نشط' }))
          : String(t('list.status.inactive', { defaultValue: 'غير نشط' }));
        return (
          <Chip
            label={statusLabel}
            size="small"
            color={address.isActive ? 'success' : 'default'}
          />
        );
      },
    },
    {
      field: 'createdAt',
      headerName: t('list.columns.createdAt', { defaultValue: 'تاريخ الإنشاء' }),
      minWidth: 140,
      flex: 0.8,
      valueFormatter: (value) => formatDate(value as Date),
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {params.formattedValue || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: t('list.columns.actions', { defaultValue: 'الإجراءات' }),
      sortable: false,
      filterable: false,
      minWidth: 120,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const address = params.row as Address;
        return (
          <Tooltip title={t('list.actions.viewDetails', { defaultValue: 'عرض التفاصيل' })}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityIcon fontSize="small" />}
              onClick={(event) => {
                event.stopPropagation();
                handleOpenDetails(address);
              }}
              sx={{ minWidth: 'auto' }}
            >
              {t('list.actions.view', { defaultValue: 'عرض' })}
            </Button>
          </Tooltip>
        );
      },
    },
  ], [handleOpenDetails, t]);

  // Calculate total pages for mobile pagination
  const totalPages = data?.pagination ? Math.ceil(data.pagination.total / paginationModel.pageSize) : 0;

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pb: { xs: 2, sm: 3 } }}>
      {/* Header - Responsive */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, mt: { xs: 1, sm: 2 } }}>
        <Typography
          variant={breakpoint.isMobile ? 'h5' : 'h4'}
          component="h1"
          gutterBottom
          fontWeight="bold"
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}
        >
          {t('navigation.title', { defaultValue: '📍 إدارة العناوين' })}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {t('navigation.subtitle', { defaultValue: 'نظرة شاملة على عناوين المستخدمين والتحليلات الجغرافية' })}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <AddressStatsCards />
      </Box>

      {/* Tabs - Responsive with Scroll */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: { xs: 2, sm: 3 },
          overflowX: 'auto',
          '& .MuiTabs-root': {
            minWidth: 'fit-content',
          },
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant={breakpoint.isMobile ? 'scrollable' : 'standard'}
          scrollButtons={breakpoint.isMobile ? 'auto' : false}
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              fontSize: { xs: '0.875rem', sm: '1rem' },
              minHeight: { xs: 48, sm: 72 },
              px: { xs: 2, sm: 3 },
            },
          }}
        >
          <Tab label={t('tabs.statistics', { defaultValue: '📊 الإحصائيات' })} />
          <Tab label={t('tabs.list', { defaultValue: '📋 قائمة العناوين' })} />
        </Tabs>
      </Box>

      {/* Tab 1: Statistics */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid size={{ xs: 12 }}>
            <TopCitiesChart />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Address List */}
      <TabPanel value={currentTab} index={1}>
        {/* Desktop View - Table */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 2,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={showDeleted}
                  onChange={(_, checked) => {
                    setShowDeleted(checked);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  }}
                  color="primary"
                />
              }
              label={t('list.filters.showDeleted', { defaultValue: 'إظهار المحذوفة' })}
            />
          </Box>
          <DataTable
            columns={columns}
            rows={data?.data || []}
            loading={isLoading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            searchPlaceholder={t('list.search.placeholder', { defaultValue: 'ابحث عن عنوان...' })}
            onSearch={(query) => {
              setSearchQuery(query);
              setPaginationModel((prev) => ({ ...prev, page: 0 }));
            }}
            getRowId={(row: any) => row._id}
            height={screenSize < 600 ? 'calc(100vh - 140px)' : 'calc(100vh - 180px)'}
            getRowHeight={() => 'auto'}
            onRowClick={(params) => handleOpenDetails(params.row as Address)}
            sx={{
              '& .MuiDataGrid-cell': {
                py: 1,
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: (theme: { palette: { mode: string } }) => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.02)',
                },
              },
            }}
          />
        </Box>

        {/* Mobile/Tablet View - Cards */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          {/* Search Bar for Mobile */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder={t('list.search.placeholder', { defaultValue: 'ابحث عن عنوان...' })}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: { xs: '16px', sm: '14px' }, // Prevents zoom on iOS
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showDeleted}
                  onChange={(_, checked) => {
                    setShowDeleted(checked);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  }}
                  color="primary"
                  size="small"
                />
              }
              label={t('list.filters.showDeleted', { defaultValue: 'إظهار المحذوفة' })}
            />
          </Box>

          {/* Loading State */}
          {isLoading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              ))}
            </Stack>
          ) : data?.data && data.data.length > 0 ? (
            <>
              <Stack spacing={2}>
                {data.data.map((address: Address) => (
                <AddressCard key={address._id} address={address} />
                ))}
              </Stack>

              {/* Mobile Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={paginationModel.page + 1}
                    onChange={(_, page) => {
                      setPaginationModel((prev) => ({ ...prev, page: page - 1 }));
                    }}
                    color="primary"
                    size={breakpoint.isXs ? 'small' : 'medium'}
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('list.noResults', { defaultValue: 'لا توجد نتائج' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? t('list.noResultsForSearch', { defaultValue: 'لم يتم العثور على عناوين تطابق البحث' })
                  : t('list.noAddresses', { defaultValue: 'لا توجد عناوين متاحة' })}
              </Typography>
            </Box>
          )}
        </Box>
      </TabPanel>

      <Dialog
        open={detailsOpen && !!selectedAddress}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
        aria-labelledby="address-details-dialog-title"
      >
        <DialogTitle
          id="address-details-dialog-title"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          {t('details.title', { defaultValue: 'تفاصيل العنوان' })}
          <IconButton onClick={handleCloseDetails} aria-label={t('details.close', { defaultValue: 'إغلاق' })}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: (theme) => theme.palette.background.default }}>
          {selectedAddress && <AddressCard address={selectedAddress} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
}


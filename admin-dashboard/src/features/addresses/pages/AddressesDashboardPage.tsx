import { Box, Typography, Tab, Tabs, Chip, Pagination, Skeleton, Stack, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useState, useMemo, useEffect } from 'react';
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

  // Listen to window resize
  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Fetch addresses data
  const { data, isLoading } = useAddressList({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: searchQuery || undefined,
    sortBy: (sortModel[0]?.field as 'createdAt' | 'usageCount' | 'lastUsedAt') || 'createdAt',
    sortOrder: (sortModel[0]?.sort as 'asc' | 'desc') || 'desc',
  });

  // Define columns
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'userId',
      headerName: t('list.columns.user', { defaultValue: 'المستخدم' }),
      minWidth: 180,
      flex: 1.2,
      renderCell: (params) => {
        const address = params.row as Address;
        return (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {address.userId?.name || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
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
      flex: 1,
      renderCell: (params) => {
        const address = params.row as Address;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {address.label}
            {address.isDefault && (
              <Chip 
                label={t('list.status.default', { defaultValue: 'افتراضي' })} 
                size="small" 
                color="primary" 
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'line1',
      headerName: t('list.columns.address', { defaultValue: 'العنوان' }),
      minWidth: 200,
      flex: 1.5,
      renderCell: (params) => {
        const address = params.row as Address;
        return (
          <Box>
            <Typography variant="body2">{address.line1}</Typography>
            {address.notes && (
              <Typography variant="caption" color="text.secondary">
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
      flex: 0.8,
    },
    {
      field: 'usageCount',
      headerName: t('list.columns.usage', { defaultValue: 'الاستخدام' }),
      minWidth: 100,
      flex: 0.8,
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
      minWidth: 100,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const address = params.row as Address;
        return (
          <Chip
            label={
              address.isActive
                ? t('list.status.active', { defaultValue: 'نشط' })
                : t('list.status.inactive', { defaultValue: 'غير نشط' })
            }
            size="small"
            color={address.isActive ? 'success' : 'default'}
          />
        );
      },
    },
    {
      field: 'createdAt',
      headerName: t('list.columns.createdAt', { defaultValue: 'تاريخ الإنشاء' }),
      minWidth: 130,
      flex: 1,
      valueFormatter: (value) => formatDate(value as Date),
    },
  ], [t]);

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
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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
    </Box>
  );
}


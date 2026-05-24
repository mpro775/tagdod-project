import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Tab,
  Tabs,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Refresh,
  LocationOn,
  People,
  CheckCircle,
  Delete,
  TrendingUp,
  Visibility as VisibilityIcon,
  Map as MapIcon,
  BarChart as BarChartIcon,
  List as ListIcon,
  StarOutline,
} from '@mui/icons-material';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useMediaQuery, useTheme } from '@mui/material';
import { PageShell } from '@/shared/design-system/components/PageShell';
import { PageHeader } from '@/shared/design-system/components/PageHeader';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';
import { DataToolbar } from '@/shared/design-system/components/DataToolbar';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { EmptyState } from '@/shared/design-system/components/EmptyState';
import { RowActionsMenu, type RowAction } from '@/shared/design-system/components/RowActionsMenu';
import { DetailsDrawer } from '@/shared/design-system/components/DetailsDrawer';
import { TopCitiesChart } from '../components/TopCitiesChart';
import { AddressMap } from '../components/AddressMap';
import { AddressCard } from '../components/AddressCard';
import {
  useAddressList,
  useAddressStats,
  useMostUsedAddresses,
  useNeverUsedAddresses,
} from '../hooks/useAddresses';
import { formatDate } from '@/shared/utils/formatters';
import type { Address } from '../types/address.types';

export function AddressesDashboardPage() {
  const { t } = useTranslation('addresses');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedTab, setSelectedTab] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const handleOpenDetails = useCallback((address: Address) => {
    setSelectedAddress(address);
    setDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedAddress(null);
  }, []);

  const { data, isLoading } = useAddressList({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: searchQuery || undefined,
    sortBy: (sortModel[0]?.field as 'createdAt' | 'usageCount' | 'lastUsedAt') || 'createdAt',
    sortOrder: (sortModel[0]?.sort as 'asc' | 'desc') || 'desc',
    includeDeleted: showDeleted || undefined,
    deletedOnly: showDeleted || undefined,
  });

  const { data: stats, isLoading: statsLoading } = useAddressStats();
  const { data: mostUsedData, isLoading: mostUsedLoading } = useMostUsedAddresses(20);
  const { data: neverUsedData, isLoading: neverUsedLoading } = useNeverUsedAddresses(20);

  const kpiCards = [
    {
      title: t('stats.totalAddresses', 'إجمالي العناوين'),
      value: stats?.totalAddresses?.toLocaleString('en-US') ?? '0',
      icon: <LocationOn fontSize="small" />,
      tone: 'primary' as const,
    },
    {
      title: t('stats.activeAddresses', 'النشطة'),
      value: stats?.totalActiveAddresses?.toLocaleString('en-US') ?? '0',
      icon: <CheckCircle fontSize="small" />,
      tone: 'success' as const,
    },
    {
      title: t('stats.deletedAddresses', 'المحذوفة'),
      value: stats?.totalDeletedAddresses?.toLocaleString('en-US') ?? '0',
      icon: <Delete fontSize="small" />,
      tone: 'error' as const,
    },
    {
      title: t('stats.totalUsers', 'مستخدمون لديهم عناوين'),
      value: stats?.totalUsers?.toLocaleString('en-US') ?? '0',
      icon: <People fontSize="small" />,
      tone: 'info' as const,
    },
    {
      title: t('stats.averagePerUser', 'متوسط/مستخدم'),
      value: stats?.averagePerUser?.toFixed(1) ?? '0.0',
      icon: <TrendingUp fontSize="small" />,
      tone: 'warning' as const,
    },
  ];

  const addressColumns: GridColDef[] = useMemo(
    () => [
      {
        field: 'userId',
        headerName: t('list.columns.user', 'المستخدم'),
        minWidth: 160,
        flex: 1.2,
        renderCell: (params: any) => {
          const address = params.row as Address;
          return (
            <Box sx={{ py: 0.5 }}>
              <Typography variant="body2" fontWeight="medium" noWrap>
                {address.userId?.name || '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {address.userId?.phone || '-'}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'label',
        headerName: t('list.columns.label', 'التسمية'),
        minWidth: 120,
        flex: 0.8,
        renderCell: (params: any) => {
          const address = params.row as Address;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" noWrap>{address.label}</Typography>
              {address.isDefault && (
                <Chip label={t('list.status.default', 'افتراضي')} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
              )}
            </Box>
          );
        },
      },
      {
        field: 'line1',
        headerName: t('list.columns.address', 'العنوان'),
        minWidth: 200,
        flex: 1.5,
        renderCell: (params: any) => {
          const address = params.row as Address;
          return (
            <Tooltip title={address.line1} arrow>
              <Typography variant="body2" noWrap sx={{ maxWidth: '100%' }}>
                {address.line1}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        field: 'city',
        headerName: t('list.columns.city', 'المدينة'),
        minWidth: 100,
        flex: 0.6,
        renderCell: (params: any) => {
          const address = params.row as Address;
          return <Chip label={address.city || '-'} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />;
        },
      },
      {
        field: 'usageCount',
        headerName: t('list.columns.usage', 'الاستخدام'),
        minWidth: 80,
        flex: 0.5,
        align: 'center',
        renderCell: (params: any) => {
          const address = params.row as Address;
          return (
            <Chip
              label={address.usageCount || 0}
              size="small"
              variant="outlined"
              color={address.usageCount > 5 ? 'success' : 'default'}
              sx={{ fontSize: '0.7rem' }}
            />
          );
        },
      },
      {
        field: 'isActive',
        headerName: t('list.columns.status', 'الحالة'),
        minWidth: 90,
        flex: 0.5,
        align: 'center',
        renderCell: (params: any) => {
          const address = params.row as Address;
          if (address.deletedAt) {
            return <Chip label={t('list.status.deleted', 'محذوف')} size="small" color="error" />;
          }
          return (
            <Chip
              label={address.isActive ? t('list.status.active', 'نشط') : t('list.status.inactive', 'غير نشط')}
              size="small"
              color={address.isActive ? 'success' : 'default'}
            />
          );
        },
      },
      {
        field: 'actions',
        headerName: t('list.columns.actions', 'الإجراءات'),
        minWidth: 80,
        flex: 0.5,
        sortable: false,
        renderCell: (params: any) => {
          const address = params.row as Address;
          const actions: RowAction[] = [
            {
              label: t('list.actions.viewDetails', 'عرض التفاصيل'),
              icon: <VisibilityIcon fontSize="small" />,
              onClick: () => handleOpenDetails(address),
            },
          ];
          return <RowActionsMenu actions={actions} menuId={`address-actions-${address._id}`} />;
        },
      },
    ],
    [handleOpenDetails, t]
  );

  const mostUsedColumns: GridColDef[] = useMemo(
    () => [
      {
        field: 'label',
        headerName: t('list.columns.label', 'العنوان'),
        minWidth: 160,
        flex: 1.2,
      },
      {
        field: 'city',
        headerName: t('list.columns.city', 'المدينة'),
        minWidth: 100,
        flex: 0.7,
        renderCell: (params: any) => <Chip label={params.row.city || '-'} size="small" variant="outlined" />,
      },
      {
        field: 'usageCount',
        headerName: t('list.columns.usage', 'الاستخدام'),
        minWidth: 90,
        flex: 0.6,
        align: 'center',
        renderCell: (params: any) => (
          <Typography variant="body2" fontWeight="bold">
            {params.row.usageCount || 0}
          </Typography>
        ),
      },
      {
        field: 'lastUsedAt',
        headerName: t('list.columns.lastUsed', 'آخر استخدام'),
        minWidth: 130,
        flex: 0.8,
        renderCell: (params: any) => (
          <Typography variant="body2" color="text.secondary">
            {params.row.lastUsedAt ? formatDate(params.row.lastUsedAt) : '-'}
          </Typography>
        ),
      },
    ],
    [t]
  );

  const neverUsedColumns: GridColDef[] = useMemo(
    () => [
      {
        field: 'label',
        headerName: t('list.columns.label', 'العنوان'),
        minWidth: 160,
        flex: 1.2,
      },
      {
        field: 'city',
        headerName: t('list.columns.city', 'المدينة'),
        minWidth: 100,
        flex: 0.7,
        renderCell: (params: any) => <Chip label={params.row.city || '-'} size="small" variant="outlined" />,
      },
      {
        field: 'createdAt',
        headerName: t('list.columns.createdAt', 'تاريخ الإنشاء'),
        minWidth: 130,
        flex: 0.8,
        renderCell: (params: any) => (
          <Typography variant="body2" color="text.secondary">
            {formatDate(params.row.createdAt)}
          </Typography>
        ),
      },
    ],
    [t]
  );

  const tabs = [
    { key: 'list', label: t('tabs.list', 'قائمة العناوين'), icon: <ListIcon sx={{ fontSize: 18 }} /> },
    { key: 'cities', label: t('tabs.cities', 'أكثر المدن'), icon: <BarChartIcon sx={{ fontSize: 18 }} /> },
    { key: 'mostUsed', label: t('tabs.mostUsed', 'الأكثر استخداماً'), icon: <StarOutline sx={{ fontSize: 18 }} /> },
    { key: 'neverUsed', label: t('tabs.neverUsed', 'غير المستخدمة'), icon: <Delete sx={{ fontSize: 18 }} /> },
    { key: 'map', label: t('tabs.map', 'الخريطة'), icon: <MapIcon sx={{ fontSize: 18 }} /> },
  ];

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return (
          <>
            <DataToolbar
              searchValue={searchQuery}
              searchPlaceholder={t('list.search.placeholder', 'ابحث عن عنوان...')}
              onSearchChange={(value) => {
                setSearchQuery(value);
                setPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              filters={
                <Chip
                  label={showDeleted ? t('list.filters.hideDeleted', 'إخفاء المحذوفة') : t('list.filters.showDeleted', 'إظهار المحذوفة')}
                  size="small"
                  variant={showDeleted ? 'filled' : 'outlined'}
                  color={showDeleted ? 'error' : 'default'}
                  onClick={() => {
                    setShowDeleted(!showDeleted);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  }}
                  sx={{ cursor: 'pointer' }}
                />
              }
              compact
            />
            {data?.data && data.data.length > 0 ? (
              <DataTable
                columns={addressColumns}
                rows={data.data}
                loading={isLoading}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                rowCount={data?.pagination?.total}
                paginationMode="server"
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                getRowId={(row: any) => row._id}
                height="calc(100vh - 440px)"
                density="compact"
              />
            ) : !isLoading ? (
              <EmptyState
                title={t('list.noAddresses', 'لا توجد عناوين')}
                description={t('list.noAddressesDescription', 'لا توجد عناوين مطابقة للبحث')}
                icon={<LocationOn sx={{ fontSize: 48 }} />}
              />
            ) : null}
          </>
        );

      case 1:
        return <TopCitiesChart />;

      case 2:
        return (
          <>
            {mostUsedData && mostUsedData.length > 0 ? (
              <DataTable
                columns={mostUsedColumns}
                rows={mostUsedData}
                loading={mostUsedLoading}
                paginationModel={{ page: 0, pageSize: 50 }}
                onPaginationModelChange={() => {}}
                paginationMode="client"
                getRowId={(row: any) => row._id}
                height="calc(100vh - 380px)"
                density="compact"
              />
            ) : !mostUsedLoading ? (
              <EmptyState
                title={t('list.noAddresses', 'لا توجد عناوين')}
                description={t('mostUsed.empty', 'لا توجد بيانات عن العناوين الأكثر استخداماً')}
                icon={<StarOutline sx={{ fontSize: 48 }} />}
              />
            ) : null}
          </>
        );

      case 3:
        return (
          <>
            {neverUsedData && neverUsedData.length > 0 ? (
              <DataTable
                columns={neverUsedColumns}
                rows={neverUsedData}
                loading={neverUsedLoading}
                paginationModel={{ page: 0, pageSize: 50 }}
                onPaginationModelChange={() => {}}
                paginationMode="client"
                getRowId={(row: any) => row._id}
                height="calc(100vh - 380px)"
                density="compact"
              />
            ) : !neverUsedLoading ? (
              <EmptyState
                title={t('neverUsed.empty', 'لا توجد عناوين غير مستخدمة')}
                description={t('neverUsed.emptyDescription', 'عناوين لم تُستخدم في الطلبات بعد')}
                icon={<Delete sx={{ fontSize: 48 }} />}
              />
            ) : null}
          </>
        );

      case 4:
        return selectedAddress ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 'calc(100vh - 380px)' }}>
            <AddressMap address={selectedAddress} />
          </Box>
        ) : (
          <EmptyState
            title={t('map.noAddress', 'اختر عنواناً لعرضه على الخريطة')}
            description={t('map.selectAddress', 'انتقل لتبويب قائمة العناوين واختر عرض التفاصيل')}
            icon={<MapIcon sx={{ fontSize: 48 }} />}
          />
        );

      default:
        return null;
    }
  };

  return (
    <PageShell spacing="compact">
      <PageHeader
        variant="compact"
        title={t('navigation.title', 'إدارة العناوين')}
        description={t('navigation.subtitle', 'تحليل العناوين والمدن والاستخدام الجغرافي')}
        actions={[
          {
            label: t('common:actions.refresh', 'تحديث'),
            icon: <Refresh fontSize="small" />,
            onClick: () => {},
            variant: 'secondary',
          },
        ]}
      />

      <PageSummaryGrid columns={5} compact>
        {kpiCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
            compact
            loading={statsLoading}
          />
        ))}
      </PageSummaryGrid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          allowScrollButtonsMobile={isMobile}
          sx={{
            '& .MuiTab-root': {
              minHeight: 44,
              px: 1.5,
              fontSize: '0.8rem',
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
            />
          ))}
        </Tabs>
      </Box>

      {renderTabContent()}

      <DetailsDrawer
        open={detailsOpen && !!selectedAddress}
        onClose={handleCloseDetails}
        title={t('details.title', 'تفاصيل العنوان')}
      >
        {selectedAddress && (
          <Stack spacing={2}>
            <AddressCard address={selectedAddress} />
            <AddressMap address={selectedAddress} />
          </Stack>
        )}
      </DetailsDrawer>
    </PageShell>
  );
}
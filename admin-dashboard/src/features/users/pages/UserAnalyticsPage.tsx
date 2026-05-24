import React, { useEffect, useMemo, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Assessment,
  Clear,
  EmojiEvents,
  Refresh,
  Timeline,
  WarningAmber,
} from '@mui/icons-material';
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import {
  DataToolbar,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  PageShell,
  designRadius,
  usePageTitle,
  type DataToolbarFilter,
} from '@/shared/design-system';
import { AnalyticsKPICards } from '../components/AnalyticsKPICards';
import { ChurnRiskAlerts } from '../components/ChurnRiskAlerts';
import { CustomerRankingsTable } from '../components/CustomerRankingsTable';
import { CustomerSegmentsSection } from '../components/CustomerSegmentsSection';
import { TopCustomersCards } from '../components/TopCustomersCards';
import {
  useUserAnalytics,
  type ChurnRiskAlert,
  type CustomerRanking,
} from '../hooks/useUserAnalytics';

type CustomerSortKey = 'totalSpent' | 'orderCount' | 'averageOrderValue' | 'lastOrderDate';
type TierFilter = 'all' | 'vip' | 'premium' | 'regular' | 'new';
type SegmentFilter = 'all' | 'nonEmpty' | 'vip' | 'premium' | 'regular' | 'new';
type RiskFilter = 'all' | ChurnRiskAlert['churnRisk'];
type RiskDaysFilter = 'all' | '30' | '60' | '90';
type RiskSortKey = 'risk' | 'lastOrderDays' | 'totalSpent';

interface CustomerFilters {
  search: string;
  tier: TierFilter;
  sortBy: CustomerSortKey;
}

interface SegmentFilters {
  search: string;
  segment: SegmentFilter;
}

interface RiskFilters {
  search: string;
  risk: RiskFilter;
  minDays: RiskDaysFilter;
  sortBy: RiskSortKey;
}

const defaultCustomerFilters: CustomerFilters = {
  search: '',
  tier: 'all',
  sortBy: 'totalSpent',
};

const defaultSegmentFilters: SegmentFilters = {
  search: '',
  segment: 'all',
};

const defaultRiskFilters: RiskFilters = {
  search: '',
  risk: 'all',
  minDays: 'all',
  sortBy: 'risk',
};

const searchText = (value: string | number | undefined | null) =>
  String(value ?? '').trim().toLowerCase();

const getCustomerSearchBlob = (customer: CustomerRanking) =>
  [
    customer.name,
    customer.contact,
    customer.email,
    customer.userInfo?.phone,
    customer.tier,
  ]
    .map(searchText)
    .join(' ');

const getLastOrderTime = (value?: string | Date) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const getRiskWeight = (risk: ChurnRiskAlert['churnRisk']) => {
  if (risk === 'high') return 3;
  if (risk === 'medium') return 2;
  return 1;
};

const sortCustomers = (customers: CustomerRanking[], sortBy: CustomerSortKey) =>
  [...customers].sort((a, b) => {
    if (sortBy === 'lastOrderDate') {
      return getLastOrderTime(b.lastOrderDate) - getLastOrderTime(a.lastOrderDate);
    }

    return Number(b[sortBy] ?? 0) - Number(a[sortBy] ?? 0);
  });

const filterCustomers = (customers: CustomerRanking[], filters: CustomerFilters) => {
  const query = searchText(filters.search);

  return sortCustomers(
    customers.filter((customer) => {
      const matchesSearch = !query || getCustomerSearchBlob(customer).includes(query);
      const matchesTier = filters.tier === 'all' || customer.tier?.toLowerCase() === filters.tier;

      return matchesSearch && matchesTier;
    }),
    filters.sortBy
  );
};

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);

export const UserAnalyticsPage: React.FC = () => {
  const { t } = useTranslation(['users', 'common']);
  usePageTitle(t('users:analytics.title', 'تحليلات المستخدمين والعملاء'));

  const [selectedTab, setSelectedTab] = useState(0);
  const [lastRefreshAt, setLastRefreshAt] = useState<Date>(() => new Date());
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [rankingFilters, setRankingFilters] = useState<CustomerFilters>(defaultCustomerFilters);
  const [topFilters, setTopFilters] = useState<CustomerFilters>(defaultCustomerFilters);
  const [segmentFilters, setSegmentFilters] = useState<SegmentFilters>(defaultSegmentFilters);
  const [riskFilters, setRiskFilters] = useState<RiskFilters>(defaultRiskFilters);

  const {
    loadingStates,
    errors,
    overallAnalytics,
    customerRankings,
    customerSegments,
    churnRiskAlerts,
    churnRiskSummary,
    fetchOverallAnalytics,
    fetchCustomerRankings,
    fetchCustomerSegments,
    fetchChurnRiskAlerts,
  } = useUserAnalytics();

  useEffect(() => {
    let mounted = true;

    void Promise.all([
      fetchOverallAnalytics(),
      fetchCustomerRankings(),
      fetchCustomerSegments(),
      fetchChurnRiskAlerts(),
    ]).finally(() => {
      if (mounted) setLastRefreshAt(new Date());
    });

    return () => {
      mounted = false;
    };
  }, [
    fetchChurnRiskAlerts,
    fetchCustomerRankings,
    fetchCustomerSegments,
    fetchOverallAnalytics,
  ]);

  useEffect(() => {
    setPaginationModel((prev) => (prev.page === 0 ? prev : { ...prev, page: 0 }));
  }, [rankingFilters.search, rankingFilters.sortBy, rankingFilters.tier]);

  const rankingRows = useMemo(
    () => filterCustomers(customerRankings, rankingFilters),
    [customerRankings, rankingFilters]
  );

  const topCustomers = useMemo(
    () =>
      filterCustomers(customerRankings, topFilters)
        .slice(0, 10)
        .map((customer, index) => ({ ...customer, rank: index + 1 })),
    [customerRankings, topFilters]
  );

  const riskRows = useMemo(() => {
    const query = searchText(riskFilters.search);
    const minDays = riskFilters.minDays === 'all' ? 0 : Number(riskFilters.minDays);

    return [...churnRiskAlerts]
      .filter((alert) => {
        const matchesSearch =
          !query ||
          [
            alert.name,
            alert.contact,
            alert.email,
            alert.riskReason,
            alert.recommendedAction,
          ]
            .map(searchText)
            .join(' ')
            .includes(query);
        const matchesRisk = riskFilters.risk === 'all' || alert.churnRisk === riskFilters.risk;
        const matchesDays = riskFilters.minDays === 'all' || alert.lastOrderDays >= minDays;

        return matchesSearch && matchesRisk && matchesDays;
      })
      .sort((a, b) => {
        if (riskFilters.sortBy === 'lastOrderDays') return b.lastOrderDays - a.lastOrderDays;
        if (riskFilters.sortBy === 'totalSpent') return b.totalSpent - a.totalSpent;
        return getRiskWeight(b.churnRisk) - getRiskWeight(a.churnRisk);
      });
  }, [churnRiskAlerts, riskFilters]);

  const selectedRefreshLoading =
    loadingStates.overview ||
    (selectedTab <= 1 && loadingStates.rankings) ||
    (selectedTab === 2 && loadingStates.segments) ||
    (selectedTab === 3 && loadingStates.churnRisk);

  const tabCounts = {
    rankings: customerRankings.length,
    topCustomers: Math.min(customerRankings.length, 10),
    segments: customerSegments ? Object.keys(customerSegments.segments).length : 4,
    churnRisk: churnRiskSummary.totalAtRisk || churnRiskAlerts.length,
  };

  const handleRefresh = async () => {
    const tasks = [fetchOverallAnalytics()];

    if (selectedTab === 0 || selectedTab === 1) tasks.push(fetchCustomerRankings());
    if (selectedTab === 2) tasks.push(fetchCustomerSegments());
    if (selectedTab === 3) tasks.push(fetchChurnRiskAlerts());

    await Promise.all(tasks);
    setLastRefreshAt(new Date());
  };

  return (
    <PageShell spacing="compact" fullHeight>
      <PageHeader
        variant="compact"
        title={t('users:analytics.title', 'تحليلات المستخدمين والعملاء')}
        description={t(
          'users:analytics.subtitle',
          'قراءة مركزة لسلوك العملاء، الإنفاق، الشرائح، ومخاطر التوقف.'
        )}
        meta={
          <Typography variant="caption" color="text.secondary">
            {t('users:analytics.meta.lastUpdated', 'آخر تحديث')}: {formatDateTime(lastRefreshAt)}
            {' | '}
            {t('users:analytics.meta.scope', 'نطاق التحليل: المستخدمون أصحاب الطلبات')}
          </Typography>
        }
        actions={[
          {
            label: t('common:actions.refresh', 'تحديث'),
            icon: <Refresh fontSize="small" />,
            onClick: handleRefresh,
            loading: selectedRefreshLoading,
            variant: 'secondary',
          },
        ]}
      />

      <AnalyticsKPICards
        analytics={overallAnalytics}
        loading={loadingStates.overview && !overallAnalytics}
        topCustomersCount={tabCounts.topCustomers}
      />

      <AnalyticsTabs
        value={selectedTab}
        onChange={setSelectedTab}
        counts={tabCounts}
      />

      <Box
        role="tabpanel"
        sx={{
          minWidth: 0,
          '& > *': { minWidth: 0 },
        }}
      >
        {selectedTab === 0 && (
          <Stack spacing={1}>
            <CustomerToolbar
              filters={rankingFilters}
              onFiltersChange={setRankingFilters}
              onClear={() => setRankingFilters(defaultCustomerFilters)}
              count={rankingRows.length}
              context="rankings"
            />
            {renderRankingsContent({
              loading: loadingStates.rankings,
              error: errors.rankings,
              rows: rankingRows,
              hasSourceRows: customerRankings.length > 0,
              paginationModel,
              setPaginationModel,
              sortModel,
              setSortModel,
              onRetry: fetchCustomerRankings,
              t,
            })}
          </Stack>
        )}

        {selectedTab === 1 && (
          <Stack spacing={1}>
            <CustomerToolbar
              filters={topFilters}
              onFiltersChange={setTopFilters}
              onClear={() => setTopFilters(defaultCustomerFilters)}
              count={topCustomers.length}
              context="topCustomers"
            />
            {renderTopCustomersContent({
              loading: loadingStates.rankings,
              error: errors.rankings,
              rows: topCustomers,
              hasSourceRows: customerRankings.length > 0,
              onRetry: fetchCustomerRankings,
              t,
            })}
          </Stack>
        )}

        {selectedTab === 2 && (
          <Stack spacing={1}>
            <SegmentsToolbar
              filters={segmentFilters}
              onFiltersChange={setSegmentFilters}
              onClear={() => setSegmentFilters(defaultSegmentFilters)}
              count={tabCounts.segments}
            />
            {renderSegmentsContent({
              loading: loadingStates.segments,
              error: errors.segments,
              segments: customerSegments,
              filters: segmentFilters,
              onRetry: fetchCustomerSegments,
              t,
            })}
          </Stack>
        )}

        {selectedTab === 3 && (
          <Stack spacing={1}>
            <RiskToolbar
              filters={riskFilters}
              onFiltersChange={setRiskFilters}
              onClear={() => setRiskFilters(defaultRiskFilters)}
              count={riskRows.length}
            />
            {renderRiskContent({
              loading: loadingStates.churnRisk,
              error: errors.churnRisk,
              rows: riskRows,
              hasSourceRows: churnRiskAlerts.length > 0,
              summary: churnRiskSummary,
              onRetry: fetchChurnRiskAlerts,
              t,
            })}
          </Stack>
        )}
      </Box>
    </PageShell>
  );
};

function AnalyticsTabs({
  value,
  onChange,
  counts,
}: {
  value: number;
  onChange: (value: number) => void;
  counts: {
    rankings: number;
    topCustomers: number;
    segments: number;
    churnRisk: number;
  };
}) {
  const { t } = useTranslation(['users']);
  const theme = useTheme();

  const tabs = [
    {
      label: t('users:analytics.tabs.rankings', 'ترتيب العملاء'),
      count: counts.rankings,
      icon: <EmojiEvents fontSize="small" />,
    },
    {
      label: t('users:analytics.tabs.topCustomers', 'أفضل العملاء'),
      count: counts.topCustomers,
      icon: <Assessment fontSize="small" />,
    },
    {
      label: t('users:analytics.tabs.segments', 'شرائح العملاء'),
      count: counts.segments,
      icon: <Timeline fontSize="small" />,
    },
    {
      label: t('users:analytics.tabs.alerts', 'تنبيهات المخاطر'),
      count: counts.churnRisk,
      icon: <WarningAmber fontSize="small" />,
    },
  ];

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.16 : 0.85),
        borderRadius: `${designRadius.md}px`,
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.64 : 0.9),
        overflowX: 'auto',
      }}
    >
      <Tabs
        value={value}
        onChange={(_event, nextValue) => onChange(nextValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          minHeight: 42,
          px: 0.5,
          '& .MuiTabs-indicator': {
            height: 2,
            borderRadius: 999,
          },
          '& .MuiTab-root': {
            minHeight: 42,
            px: { xs: 1, sm: 1.5 },
            py: 0.75,
            textTransform: 'none',
            fontWeight: 800,
            color: 'text.secondary',
          },
        }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={tab.label}
            icon={tab.icon}
            iconPosition="start"
            label={<TabLabel label={tab.label} count={tab.count} active={value === index} />}
          />
        ))}
      </Tabs>
    </Box>
  );
}

function TabLabel({
  label,
  count,
  active,
}: {
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Typography component="span" variant="body2" sx={{ fontWeight: 800 }}>
        {label}
      </Typography>
      <Chip
        component="span"
        label={count.toLocaleString('en-US')}
        size="small"
        color={active ? 'primary' : 'default'}
        variant={active ? 'filled' : 'outlined'}
        sx={{ height: 20, minWidth: 30, '& .MuiChip-label': { px: 0.75, fontSize: 11, fontWeight: 800 } }}
      />
    </Stack>
  );
}

function CustomerToolbar({
  filters,
  onFiltersChange,
  onClear,
  count,
  context,
}: {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  onClear: () => void;
  count: number;
  context: 'rankings' | 'topCustomers';
}) {
  const { t } = useTranslation(['users', 'common']);
  const hasFilters =
    Boolean(filters.search) || filters.tier !== 'all' || filters.sortBy !== 'totalSpent';
  const title =
    context === 'rankings'
      ? t('users:analytics.toolbar.rankingsCount', '{{count}} نتيجة', { count })
      : t('users:analytics.toolbar.topCount', '{{count}} عميل', { count });

  const activeFilters: DataToolbarFilter[] = [
    filters.search
      ? {
          label: t('users:analytics.toolbar.search', 'بحث'),
          value: filters.search,
          onDelete: () => onFiltersChange({ ...filters, search: '' }),
        }
      : null,
    filters.tier !== 'all'
      ? {
          label: t('users:analytics.table.tier', 'الفئة'),
          value: t(`users:analytics.tiers.${filters.tier}`, filters.tier),
          onDelete: () => onFiltersChange({ ...filters, tier: 'all' }),
        }
      : null,
  ].filter(Boolean) as DataToolbarFilter[];

  return (
    <DataToolbar
      compact
      searchValue={filters.search}
      searchPlaceholder={t('users:analytics.search', 'بحث بالاسم أو الهاتف...')}
      onSearchChange={(search) => onFiltersChange({ ...filters, search })}
      filters={
        <>
          <TierSelect
            value={filters.tier}
            onChange={(tier) => onFiltersChange({ ...filters, tier })}
          />
          <CustomerSortSelect
            value={filters.sortBy}
            onChange={(sortBy) => onFiltersChange({ ...filters, sortBy })}
          />
        </>
      }
      activeFilters={activeFilters}
      actions={
        <ToolbarActions
          countLabel={title}
          hasFilters={hasFilters}
          onClear={onClear}
        />
      }
    />
  );
}

function TierSelect({
  value,
  onChange,
}: {
  value: TierFilter;
  onChange: (value: TierFilter) => void;
}) {
  const { t } = useTranslation(['users']);

  return (
    <FormControl size="small" sx={{ minWidth: 132 }}>
      <InputLabel>{t('users:analytics.table.tier', 'الفئة')}</InputLabel>
      <Select
        value={value}
        label={t('users:analytics.table.tier', 'الفئة')}
        onChange={(event) => onChange(event.target.value as TierFilter)}
      >
        <MenuItem value="all">{t('users:analytics.filters.allTiers', 'كل الفئات')}</MenuItem>
        <MenuItem value="vip">{t('users:analytics.tiers.vip', 'VIP')}</MenuItem>
        <MenuItem value="premium">{t('users:analytics.tiers.premium', 'Premium')}</MenuItem>
        <MenuItem value="regular">{t('users:analytics.tiers.regular', 'Regular')}</MenuItem>
        <MenuItem value="new">{t('users:analytics.tiers.new', 'New')}</MenuItem>
      </Select>
    </FormControl>
  );
}

function CustomerSortSelect({
  value,
  onChange,
}: {
  value: CustomerSortKey;
  onChange: (value: CustomerSortKey) => void;
}) {
  const { t } = useTranslation(['users']);

  return (
    <FormControl size="small" sx={{ minWidth: 188 }}>
      <InputLabel>{t('users:analytics.toolbar.sortBy', 'ترتيب حسب')}</InputLabel>
      <Select
        value={value}
        label={t('users:analytics.toolbar.sortBy', 'ترتيب حسب')}
        onChange={(event) => onChange(event.target.value as CustomerSortKey)}
      >
        <MenuItem value="totalSpent">{t('users:analytics.table.totalSpent', 'إجمالي الإنفاق')}</MenuItem>
        <MenuItem value="orderCount">{t('users:analytics.table.orderCount', 'عدد الطلبات')}</MenuItem>
        <MenuItem value="averageOrderValue">{t('users:analytics.table.averageOrder', 'متوسط الطلب')}</MenuItem>
        <MenuItem value="lastOrderDate">{t('users:analytics.table.lastOrder', 'آخر طلب')}</MenuItem>
      </Select>
    </FormControl>
  );
}

function SegmentsToolbar({
  filters,
  onFiltersChange,
  onClear,
  count,
}: {
  filters: SegmentFilters;
  onFiltersChange: (filters: SegmentFilters) => void;
  onClear: () => void;
  count: number;
}) {
  const { t } = useTranslation(['users']);
  const hasFilters = Boolean(filters.search) || filters.segment !== 'all';
  const activeFilters: DataToolbarFilter[] = [
    filters.search
      ? {
          label: t('users:analytics.toolbar.search', 'بحث'),
          value: filters.search,
          onDelete: () => onFiltersChange({ ...filters, search: '' }),
        }
      : null,
    filters.segment !== 'all'
      ? {
          label: t('users:analytics.segments.distribution', 'الشريحة'),
          value: getSegmentLabel(filters.segment, t),
          onDelete: () => onFiltersChange({ ...filters, segment: 'all' }),
        }
      : null,
  ].filter(Boolean) as DataToolbarFilter[];

  return (
    <DataToolbar
      compact
      searchValue={filters.search}
      searchPlaceholder={t('users:analytics.segments.search', 'بحث في الشرائح...')}
      onSearchChange={(search) => onFiltersChange({ ...filters, search })}
      filters={
        <FormControl size="small" sx={{ minWidth: 168 }}>
          <InputLabel>{t('users:analytics.segments.view', 'عرض')}</InputLabel>
          <Select
            value={filters.segment}
            label={t('users:analytics.segments.view', 'عرض')}
            onChange={(event) =>
              onFiltersChange({ ...filters, segment: event.target.value as SegmentFilter })
            }
          >
            <MenuItem value="all">{t('users:analytics.segments.all', 'كل الشرائح')}</MenuItem>
            <MenuItem value="nonEmpty">{t('users:analytics.segments.nonEmpty', 'الشرائح النشطة')}</MenuItem>
            <MenuItem value="vip">{t('users:analytics.segments.vip', 'عملاء VIP')}</MenuItem>
            <MenuItem value="premium">{t('users:analytics.segments.premium', 'عملاء مميزون')}</MenuItem>
            <MenuItem value="regular">{t('users:analytics.segments.regular', 'عملاء عاديون')}</MenuItem>
            <MenuItem value="new">{t('users:analytics.segments.new', 'عملاء جدد')}</MenuItem>
          </Select>
        </FormControl>
      }
      activeFilters={activeFilters}
      actions={
        <ToolbarActions
          countLabel={t('users:analytics.toolbar.segmentsCount', '{{count}} شرائح', { count })}
          hasFilters={hasFilters}
          onClear={onClear}
        />
      }
    />
  );
}

function RiskToolbar({
  filters,
  onFiltersChange,
  onClear,
  count,
}: {
  filters: RiskFilters;
  onFiltersChange: (filters: RiskFilters) => void;
  onClear: () => void;
  count: number;
}) {
  const { t } = useTranslation(['users']);
  const hasFilters =
    Boolean(filters.search) ||
    filters.risk !== 'all' ||
    filters.minDays !== 'all' ||
    filters.sortBy !== 'risk';
  const activeFilters: DataToolbarFilter[] = [
    filters.search
      ? {
          label: t('users:analytics.toolbar.search', 'بحث'),
          value: filters.search,
          onDelete: () => onFiltersChange({ ...filters, search: '' }),
        }
      : null,
    filters.risk !== 'all'
      ? {
          label: t('users:analytics.churnRisk.riskLevel', 'مستوى الخطورة'),
          value: t(`users:analytics.churnRisk.${filters.risk}`, filters.risk),
          onDelete: () => onFiltersChange({ ...filters, risk: 'all' }),
        }
      : null,
    filters.minDays !== 'all'
      ? {
          label: t('users:analytics.churnRisk.lastOrderShort', 'آخر طلب'),
          value: t('users:analytics.churnRisk.moreThanDays', 'أكثر من {{days}} يوم', {
            days: filters.minDays,
          }),
          onDelete: () => onFiltersChange({ ...filters, minDays: 'all' }),
        }
      : null,
  ].filter(Boolean) as DataToolbarFilter[];

  return (
    <DataToolbar
      compact
      searchValue={filters.search}
      searchPlaceholder={t('users:analytics.churnRisk.search', 'بحث بالاسم أو الهاتف أو التوصية...')}
      onSearchChange={(search) => onFiltersChange({ ...filters, search })}
      filters={
        <>
          <FormControl size="small" sx={{ minWidth: 146 }}>
            <InputLabel>{t('users:analytics.churnRisk.riskLevel', 'مستوى الخطورة')}</InputLabel>
            <Select
              value={filters.risk}
              label={t('users:analytics.churnRisk.riskLevel', 'مستوى الخطورة')}
              onChange={(event) =>
                onFiltersChange({ ...filters, risk: event.target.value as RiskFilter })
              }
            >
              <MenuItem value="all">{t('users:analytics.filters.all', 'الكل')}</MenuItem>
              <MenuItem value="high">{t('users:analytics.churnRisk.high', 'High')}</MenuItem>
              <MenuItem value="medium">{t('users:analytics.churnRisk.medium', 'Medium')}</MenuItem>
              <MenuItem value="low">{t('users:analytics.churnRisk.low', 'Low')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 168 }}>
            <InputLabel>{t('users:analytics.churnRisk.lastOrderFilter', 'آخر طلب منذ')}</InputLabel>
            <Select
              value={filters.minDays}
              label={t('users:analytics.churnRisk.lastOrderFilter', 'آخر طلب منذ')}
              onChange={(event) =>
                onFiltersChange({ ...filters, minDays: event.target.value as RiskDaysFilter })
              }
            >
              <MenuItem value="all">{t('users:analytics.filters.all', 'الكل')}</MenuItem>
              <MenuItem value="30">{t('users:analytics.churnRisk.moreThanDays', 'أكثر من 30 يوم', { days: 30 })}</MenuItem>
              <MenuItem value="60">{t('users:analytics.churnRisk.moreThanDays', 'أكثر من 60 يوم', { days: 60 })}</MenuItem>
              <MenuItem value="90">{t('users:analytics.churnRisk.moreThanDays', 'أكثر من 90 يوم', { days: 90 })}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 172 }}>
            <InputLabel>{t('users:analytics.toolbar.sortBy', 'ترتيب حسب')}</InputLabel>
            <Select
              value={filters.sortBy}
              label={t('users:analytics.toolbar.sortBy', 'ترتيب حسب')}
              onChange={(event) =>
                onFiltersChange({ ...filters, sortBy: event.target.value as RiskSortKey })
              }
            >
              <MenuItem value="risk">{t('users:analytics.churnRisk.sortRisk', 'الأعلى خطورة')}</MenuItem>
              <MenuItem value="lastOrderDays">{t('users:analytics.churnRisk.sortLastOrder', 'الأطول انقطاعاً')}</MenuItem>
              <MenuItem value="totalSpent">{t('users:analytics.table.totalSpent', 'إجمالي الإنفاق')}</MenuItem>
            </Select>
          </FormControl>
        </>
      }
      activeFilters={activeFilters}
      actions={
        <ToolbarActions
          countLabel={t('users:analytics.toolbar.riskCount', '{{count}} عميل', { count })}
          hasFilters={hasFilters}
          onClear={onClear}
        />
      }
    />
  );
}

function ToolbarActions({
  countLabel,
  hasFilters,
  onClear,
}: {
  countLabel: string;
  hasFilters: boolean;
  onClear: () => void;
}) {
  const { t } = useTranslation(['common']);

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="flex-end" flexWrap="wrap" useFlexGap>
      <Chip label={countLabel} size="small" color="primary" variant="outlined" />
      {hasFilters && (
        <Button size="small" variant="text" startIcon={<Clear fontSize="small" />} onClick={onClear}>
          {t('common:actions.clear', 'مسح')}
        </Button>
      )}
    </Stack>
  );
}

function getSegmentLabel(segment: SegmentFilter, t: (key: string, fallback: string) => string) {
  const labels: Record<SegmentFilter, string> = {
    all: t('users:analytics.segments.all', 'كل الشرائح'),
    nonEmpty: t('users:analytics.segments.nonEmpty', 'الشرائح النشطة'),
    vip: t('users:analytics.segments.vip', 'عملاء VIP'),
    premium: t('users:analytics.segments.premium', 'عملاء مميزون'),
    regular: t('users:analytics.segments.regular', 'عملاء عاديون'),
    new: t('users:analytics.segments.new', 'عملاء جدد'),
  };

  return labels[segment];
}

function renderRankingsContent({
  loading,
  error,
  rows,
  hasSourceRows,
  paginationModel,
  setPaginationModel,
  sortModel,
  setSortModel,
  onRetry,
  t,
}: {
  loading: boolean;
  error: string | null;
  rows: CustomerRanking[];
  hasSourceRows: boolean;
  paginationModel: GridPaginationModel;
  setPaginationModel: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  setSortModel: (model: GridSortModel) => void;
  onRetry: () => Promise<void>;
  t: (key: string, fallback: string) => string;
}) {
  if (loading && !hasSourceRows) {
    return <LoadingState variant="skeleton" rows={7} title={t('common:loading', 'جاري التحميل...')} />;
  }

  if (error && !hasSourceRows) {
    return <ErrorState description={error} onRetry={() => void onRetry()} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={t('users:analytics.noData', 'لا توجد بيانات متاحة')}
        description={t('users:analytics.noMatchingCustomers', 'لا توجد نتائج مطابقة للبحث أو الفلاتر الحالية.')}
      />
    );
  }

  return (
    <CustomerRankingsTable
      rankings={rows}
      loading={loading}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      sortModel={sortModel}
      onSortModelChange={setSortModel}
      height={560}
    />
  );
}

function renderTopCustomersContent({
  loading,
  error,
  rows,
  hasSourceRows,
  onRetry,
  t,
}: {
  loading: boolean;
  error: string | null;
  rows: CustomerRanking[];
  hasSourceRows: boolean;
  onRetry: () => Promise<void>;
  t: (key: string, fallback: string) => string;
}) {
  if (loading && !hasSourceRows) {
    return <LoadingState variant="skeleton" rows={5} title={t('common:loading', 'جاري التحميل...')} />;
  }

  if (error && !hasSourceRows) {
    return <ErrorState description={error} onRetry={() => void onRetry()} />;
  }

  return <TopCustomersCards customers={rows} loading={loading} limit={10} />;
}

function renderSegmentsContent({
  loading,
  error,
  segments,
  filters,
  onRetry,
  t,
}: {
  loading: boolean;
  error: string | null;
  segments: ReturnType<typeof useUserAnalytics>['customerSegments'];
  filters: SegmentFilters;
  onRetry: () => Promise<void>;
  t: (key: string, fallback: string) => string;
}) {
  if (loading && !segments) {
    return <LoadingState variant="skeleton" rows={4} title={t('common:loading', 'جاري التحميل...')} />;
  }

  if (error && !segments) {
    return <ErrorState description={error} onRetry={() => void onRetry()} />;
  }

  return (
    <CustomerSegmentsSection
      segments={segments}
      loading={loading}
      searchValue={filters.search}
      segmentFilter={filters.segment}
    />
  );
}

function renderRiskContent({
  loading,
  error,
  rows,
  hasSourceRows,
  summary,
  onRetry,
  t,
}: {
  loading: boolean;
  error: string | null;
  rows: ChurnRiskAlert[];
  hasSourceRows: boolean;
  summary: ReturnType<typeof useUserAnalytics>['churnRiskSummary'];
  onRetry: () => Promise<void>;
  t: (key: string, fallback: string) => string;
}) {
  if (loading && !hasSourceRows) {
    return <LoadingState variant="skeleton" rows={5} title={t('common:loading', 'جاري التحميل...')} />;
  }

  if (error && !hasSourceRows) {
    return <ErrorState description={error} onRetry={() => void onRetry()} />;
  }

  return <ChurnRiskAlerts alerts={rows} summary={summary} loading={loading} />;
}

export default UserAnalyticsPage;

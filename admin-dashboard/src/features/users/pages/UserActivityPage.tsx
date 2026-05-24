import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  OnlinePrediction,
  Today,
  Schedule,
  DateRange,
  PersonOff,
  Login,
  Refresh,
} from '@mui/icons-material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/shared/design-system/components/PageShell';
import { PageHeader } from '@/shared/design-system/components/PageHeader';
import { DataToolbar } from '@/shared/design-system/components/DataToolbar';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { EmptyState } from '@/shared/design-system/components/EmptyState';
import { ActivityKPICards } from '../components/ActivityKPICards';
import {
  useUserActivity,
  ActiveUser,
  InactiveUser,
  NeverLoggedInUser,
} from '../hooks/useUserActivity';

interface ActivityTab {
  key: string;
  label: string;
  icon: React.ReactElement;
}

export const UserActivityPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(['users', 'common']);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedTab, setSelectedTab] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const {
    loading,
    activityStats,
    activeUsers,
    inactiveUsers,
    neverLoggedInUsers,
    fetchActivityStats,
    fetchActiveUsersNow,
    fetchRecentlyActiveUsers,
    fetchInactiveUsers,
    fetchNeverLoggedInUsers,
  } = useUserActivity();

  useEffect(() => {
    fetchActivityStats();
  }, [fetchActivityStats]);

  useEffect(() => {
    const page = paginationModel.page + 1;
    const limit = paginationModel.pageSize;
    switch (selectedTab) {
      case 0:
        fetchActiveUsersNow(15, page, limit);
        break;
      case 1:
        fetchRecentlyActiveUsers(1, page, limit);
        break;
      case 2:
        fetchRecentlyActiveUsers(7, page, limit);
        break;
      case 3:
        fetchRecentlyActiveUsers(30, page, limit);
        break;
      case 4:
        fetchInactiveUsers(30, page, limit);
        break;
      case 5:
        fetchNeverLoggedInUsers(page, limit);
        break;
    }
  }, [selectedTab, paginationModel, fetchActiveUsersNow, fetchRecentlyActiveUsers, fetchInactiveUsers, fetchNeverLoggedInUsers]);

  const handleRefresh = useCallback(() => {
    fetchActivityStats();
    const page = paginationModel.page + 1;
    const limit = paginationModel.pageSize;
    switch (selectedTab) {
      case 0: fetchActiveUsersNow(15, page, limit); break;
      case 1: fetchRecentlyActiveUsers(1, page, limit); break;
      case 2: fetchRecentlyActiveUsers(7, page, limit); break;
      case 3: fetchRecentlyActiveUsers(30, page, limit); break;
      case 4: fetchInactiveUsers(30, page, limit); break;
      case 5: fetchNeverLoggedInUsers(page, limit); break;
    }
  }, [selectedTab, paginationModel, fetchActivityStats, fetchActiveUsersNow, fetchRecentlyActiveUsers, fetchInactiveUsers, fetchNeverLoggedInUsers]);

  const activityTabs: ActivityTab[] = [
    { key: 'online', label: t('users:activity.tabs.activeNow', 'نشطون الآن'), icon: <OnlinePrediction sx={{ fontSize: 18 }} /> },
    { key: 'today', label: t('users:activity.tabs.activeToday', 'اليوم'), icon: <Today sx={{ fontSize: 18 }} /> },
    { key: 'week', label: t('users:activity.tabs.activeThisWeek', 'الأسبوع'), icon: <Schedule sx={{ fontSize: 18 }} /> },
    { key: 'month', label: t('users:activity.tabs.activeThisMonth', 'الشهر'), icon: <DateRange sx={{ fontSize: 18 }} /> },
    { key: 'inactive', label: t('users:activity.tabs.inactive', 'غير نشطين'), icon: <PersonOff sx={{ fontSize: 18 }} /> },
    { key: 'never', label: t('users:activity.tabs.neverLoggedIn', 'لم يدخلوا'), icon: <Login sx={{ fontSize: 18 }} /> },
  ];

  const getRoleColor = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'default' => {
    switch (role) {
      case 'admin':
      case 'super_admin': return 'error';
      case 'engineer': return 'warning';
      case 'merchant': return 'success';
      default: return 'default';
    }
  };

  const filterData = <T extends { phone: string; firstName?: string; lastName?: string }>(data: T[] | undefined): T[] => {
    if (!data || !searchQuery) return data || [];
    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.phone.toLowerCase().includes(query) ||
        item.firstName?.toLowerCase().includes(query) ||
        item.lastName?.toLowerCase().includes(query)
    );
  };

  const activeUsersColumns: GridColDef[] = useMemo(
    () => [
      {
        field: 'phone',
        headerName: t('users:activity.table.phone', 'رقم الهاتف'),
        width: 140,
      },
      {
        field: 'name',
        headerName: t('users:activity.table.name', 'الاسم'),
        width: 160,
        valueGetter: (_value: any, row: ActiveUser) =>
          [row.firstName, row.lastName].filter(Boolean).join(' ') || '-',
      },
      {
        field: 'roles',
        headerName: t('users:activity.table.roles', 'الأدوار'),
        width: 160,
        renderCell: (params: any) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {(params.value as string[] || []).map((role: string) => (
              <Chip
                key={role}
                label={t(`users:roles.${role}`, role)}
                size="small"
                color={getRoleColor(role)}
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            ))}
          </Box>
        ),
      },
      {
        field: 'lastActivityAt',
        headerName: t('users:activity.table.lastActivity', 'آخر نشاط'),
        width: 160,
        valueFormatter: (value: any) => {
          if (!value) return '-';
          return new Date(value as string).toLocaleString('ar-SA');
        },
      },
      {
        field: 'minutesSinceActivity',
        headerName: t('users:activity.table.minutesAgo', 'منذ (دقيقة)'),
        width: 110,
        align: 'center',
        renderCell: (params: any) => (
          <Chip
            label={params.value}
            size="small"
            color={(params.value as number) < 5 ? 'success' : (params.value as number) < 10 ? 'warning' : 'default'}
            sx={{ fontSize: '0.7rem' }}
          />
        ),
      },
    ],
    [t]
  );

  const inactiveUsersColumns: GridColDef[] = useMemo(
    () => [
      {
        field: 'phone',
        headerName: t('users:activity.table.phone', 'رقم الهاتف'),
        width: 140,
      },
      {
        field: 'name',
        headerName: t('users:activity.table.name', 'الاسم'),
        width: 160,
        valueGetter: (_value: any, row: InactiveUser) =>
          [row.firstName, row.lastName].filter(Boolean).join(' ') || '-',
      },
      {
        field: 'roles',
        headerName: t('users:activity.table.roles', 'الأدوار'),
        width: 160,
        renderCell: (params: any) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {(params.value as string[] || []).map((role: string) => (
              <Chip key={role} label={t(`users:roles.${role}`, role)} size="small" color={getRoleColor(role)} sx={{ fontSize: '0.7rem', height: 22 }} />
            ))}
          </Box>
        ),
      },
      {
        field: 'lastActivityAt',
        headerName: t('users:activity.table.lastActivity', 'آخر نشاط'),
        width: 160,
        valueFormatter: (value: any) => {
          if (!value) return '-';
          return new Date(value as string).toLocaleString('ar-SA');
        },
      },
      {
        field: 'daysSinceActivity',
        headerName: t('users:activity.table.daysAgo', 'منذ (يوم)'),
        width: 110,
        align: 'center',
        renderCell: (params: any) => (
          <Chip label={params.value} size="small" color={(params.value as number) > 60 ? 'error' : (params.value as number) > 45 ? 'warning' : 'default'} sx={{ fontSize: '0.7rem' }} />
        ),
      },
    ],
    [t]
  );

  const neverLoggedInColumns: GridColDef[] = useMemo(
    () => [
      {
        field: 'phone',
        headerName: t('users:activity.table.phone', 'رقم الهاتف'),
        width: 140,
      },
      {
        field: 'name',
        headerName: t('users:activity.table.name', 'الاسم'),
        width: 160,
        valueGetter: (_value: any, row: NeverLoggedInUser) =>
          [row.firstName, row.lastName].filter(Boolean).join(' ') || '-',
      },
      {
        field: 'roles',
        headerName: t('users:activity.table.roles', 'الأدوار'),
        width: 160,
        renderCell: (params: any) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {(params.value as string[] || []).map((role: string) => (
              <Chip key={role} label={t(`users:roles.${role}`, role)} size="small" color={getRoleColor(role)} sx={{ fontSize: '0.7rem', height: 22 }} />
            ))}
          </Box>
        ),
      },
      {
        field: 'createdAt',
        headerName: t('users:activity.table.registeredAt', 'تاريخ التسجيل'),
        width: 160,
        valueFormatter: (value: any) => {
          if (!value) return '-';
          return new Date(value as string).toLocaleDateString('ar-SA');
        },
      },
      {
        field: 'daysSinceRegistration',
        headerName: t('users:activity.table.daysSinceRegistration', 'منذ التسجيل'),
        width: 110,
        align: 'center',
        renderCell: (params: any) => (
          <Chip label={params.value} size="small" color={(params.value as number) > 30 ? 'error' : (params.value as number) > 7 ? 'warning' : 'default'} sx={{ fontSize: '0.7rem' }} />
        ),
      },
    ],
    [t]
  );

  const getTabData = () => {
    switch (selectedTab) {
      case 0:
      case 1:
      case 2:
      case 3:
        return { columns: activeUsersColumns, data: activeUsers, emptyMsg: t('users:activity.noActiveUsersPeriod', 'لا يوجد مستخدمين نشطين في الفترة المحددة'), emptyIcon: <OnlinePrediction sx={{ fontSize: 48 }} /> };
      case 4:
        return { columns: inactiveUsersColumns, data: inactiveUsers, emptyMsg: t('users:activity.noInactiveUsers', 'لا توجد حسابات غير نشطة ضمن الفترة المحددة'), emptyIcon: <PersonOff sx={{ fontSize: 48 }} /> };
      case 5:
        return { columns: neverLoggedInColumns, data: neverLoggedInUsers, emptyMsg: t('users:activity.noNeverLoggedInUsers', 'كل المستخدمين سجلوا الدخول مرة واحدة على الأقل'), emptyIcon: <Login sx={{ fontSize: 48 }} /> };
      default:
        return { columns: activeUsersColumns, data: activeUsers, emptyMsg: '', emptyIcon: <OnlinePrediction sx={{ fontSize: 48 }} /> };
    }
  };

  const tabData = getTabData();
  const tabRows = filterData(tabData.data?.data as any);

  const emptyStateMessages: Record<string, string> = {
    online: 'لا يوجد مستخدمون نشطون الآن',
    today: 'لا يوجد مستخدمون نشطون اليوم',
    week: 'لا يوجد مستخدمون نشطون هذا الأسبوع',
    month: 'لا يوجد مستخدمون نشطون هذا الشهر',
    inactive: 'لا توجد حسابات غير نشطة ضمن الفترة المحددة',
    never: 'كل المستخدمين سجلوا الدخول مرة واحدة على الأقل',
  };

  return (
    <PageShell spacing="compact">
      <PageHeader
        variant="compact"
        title={t('users:activity.title', 'تتبع نشاط المستخدمين')}
        description={t('users:activity.subtitle', 'متابعة المستخدمين النشطين وغير النشطين في التطبيق')}
        actions={[
          {
            label: t('common:actions.refresh', 'تحديث'),
            icon: <Refresh fontSize="small" />,
            onClick: handleRefresh,
            variant: 'secondary',
          },
        ]}
      />

      <ActivityKPICards stats={activityStats} />

      <DataToolbar
        searchValue={searchQuery}
        searchPlaceholder={t('users:activity.search', 'بحث في النتائج الحالية...')}
        onSearchChange={setSearchQuery}
        compact
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => {
            setSelectedTab(newValue);
            setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
          }}
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
          {activityTabs.map((tab) => (
            <Tab
              key={tab.key}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              sx={{ fontSize: '0.8rem' }}
            />
          ))}
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : tabRows.length > 0 ? (
        <DataTable
          columns={tabData.columns}
          rows={tabRows}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode={tabData.data?.meta ? 'server' : 'client'}
          rowCount={tabData.data?.meta?.total || tabRows.length}
          getRowId={(row: any) => row.userId || row._id || row.id}
          height="calc(100vh - 460px)"
          density="compact"
        />
      ) : (
        <EmptyState
          title={emptyStateMessages[activityTabs[selectedTab]?.key] || tabData.emptyMsg}
          icon={tabData.emptyIcon}
        />
      )}
    </PageShell>
  );
};

export default UserActivityPage;
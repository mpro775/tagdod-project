import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
  Paper,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  OnlinePrediction,
  PersonOff,
  Login,
  Refresh,
  Search,
} from '@mui/icons-material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { ActivityKPICards } from '../components/ActivityKPICards';
import {
  useUserActivity,
  ActiveUser,
  InactiveUser,
  NeverLoggedInUser,
} from '../hooks/useUserActivity';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: { xs: 1.5, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export const UserActivityPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(['users', 'common']);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTab, setSelectedTab] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
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
        fetchInactiveUsers(30, page, limit);
        break;
      case 2:
        fetchNeverLoggedInUsers(page, limit);
        break;
    }
  }, [selectedTab, paginationModel, fetchActiveUsersNow, fetchInactiveUsers, fetchNeverLoggedInUsers]);

  const handleRefresh = () => {
    fetchActivityStats();
    const page = paginationModel.page + 1;
    const limit = paginationModel.pageSize;
    switch (selectedTab) {
      case 0:
        fetchActiveUsersNow(15, page, limit);
        break;
      case 1:
        fetchInactiveUsers(30, page, limit);
        break;
      case 2:
        fetchNeverLoggedInUsers(page, limit);
        break;
    }
  };

  const getRoleColor = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'default' => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return 'error';
      case 'engineer':
        return 'warning';
      case 'merchant':
        return 'success';
      default:
        return 'default';
    }
  };

  const activeUsersColumns: GridColDef[] = useMemo(
    () => [
      {
        field: 'phone',
        headerName: t('users:activity.table.phone', 'رقم الهاتف'),
        width: 150,
      },
      {
        field: 'name',
        headerName: t('users:activity.table.name', 'الاسم'),
        width: 180,
        valueGetter: (_value, row: ActiveUser) =>
          [row.firstName, row.lastName].filter(Boolean).join(' ') || '-',
      },
      {
        field: 'roles',
        headerName: t('users:activity.table.roles', 'الأدوار'),
        width: 200,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {(params.value as string[] || []).map((role) => (
              <Chip
                key={role}
                label={t(`users:roles.${role}`, role)}
                size="small"
                color={getRoleColor(role)}
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        ),
      },
      {
        field: 'lastActivityAt',
        headerName: t('users:activity.table.lastActivity', 'آخر نشاط'),
        width: 180,
        valueFormatter: (value) => {
          if (!value) return '-';
          return new Date(value as string).toLocaleString('ar-SA');
        },
      },
      {
        field: 'minutesSinceActivity',
        headerName: t('users:activity.table.minutesAgo', 'منذ (دقيقة)'),
        width: 120,
        align: 'center',
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={(params.value as number) < 5 ? 'success' : (params.value as number) < 10 ? 'warning' : 'default'}
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
        width: 150,
      },
      {
        field: 'name',
        headerName: t('users:activity.table.name', 'الاسم'),
        width: 180,
        valueGetter: (_value, row: InactiveUser) =>
          [row.firstName, row.lastName].filter(Boolean).join(' ') || '-',
      },
      {
        field: 'roles',
        headerName: t('users:activity.table.roles', 'الأدوار'),
        width: 200,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {(params.value as string[] || []).map((role) => (
              <Chip
                key={role}
                label={t(`users:roles.${role}`, role)}
                size="small"
                color={getRoleColor(role)}
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        ),
      },
      {
        field: 'lastActivityAt',
        headerName: t('users:activity.table.lastActivity', 'آخر نشاط'),
        width: 180,
        valueFormatter: (value) => {
          if (!value) return '-';
          return new Date(value as string).toLocaleString('ar-SA');
        },
      },
      {
        field: 'daysSinceActivity',
        headerName: t('users:activity.table.daysAgo', 'منذ (يوم)'),
        width: 120,
        align: 'center',
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={(params.value as number) > 60 ? 'error' : (params.value as number) > 45 ? 'warning' : 'default'}
          />
        ),
      },
      {
        field: 'createdAt',
        headerName: t('users:activity.table.registeredAt', 'تاريخ التسجيل'),
        width: 150,
        valueFormatter: (value) => {
          if (!value) return '-';
          return new Date(value as string).toLocaleDateString('ar-SA');
        },
      },
    ],
    [t]
  );

  const neverLoggedInColumns: GridColDef[] = useMemo(
    () => [
      {
        field: 'phone',
        headerName: t('users:activity.table.phone', 'رقم الهاتف'),
        width: 150,
      },
      {
        field: 'name',
        headerName: t('users:activity.table.name', 'الاسم'),
        width: 180,
        valueGetter: (_value, row: NeverLoggedInUser) =>
          [row.firstName, row.lastName].filter(Boolean).join(' ') || '-',
      },
      {
        field: 'roles',
        headerName: t('users:activity.table.roles', 'الأدوار'),
        width: 200,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {(params.value as string[] || []).map((role) => (
              <Chip
                key={role}
                label={t(`users:roles.${role}`, role)}
                size="small"
                color={getRoleColor(role)}
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        ),
      },
      {
        field: 'createdAt',
        headerName: t('users:activity.table.registeredAt', 'تاريخ التسجيل'),
        width: 180,
        valueFormatter: (value) => {
          if (!value) return '-';
          return new Date(value as string).toLocaleString('ar-SA');
        },
      },
      {
        field: 'daysSinceRegistration',
        headerName: t('users:activity.table.daysSinceRegistration', 'منذ التسجيل (يوم)'),
        width: 150,
        align: 'center',
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={(params.value as number) > 30 ? 'error' : (params.value as number) > 7 ? 'warning' : 'default'}
          />
        ),
      },
    ],
    [t]
  );

  const filterData = <T extends { phone: string; firstName?: string; lastName?: string }>(
    data: T[] | undefined
  ): T[] => {
    if (!data || !searchQuery) return data || [];
    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.phone.toLowerCase().includes(query) ||
        item.firstName?.toLowerCase().includes(query) ||
        item.lastName?.toLowerCase().includes(query)
    );
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 1.5, sm: 3 },
        px: { xs: 1, sm: 3 },
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          mb: { xs: 2, sm: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: { xs: '1.25rem', sm: '2rem' },
              color: 'text.primary',
              mb: { xs: 0.5, sm: 1 },
            }}
          >
            {t('users:activity.title', 'تتبع نشاط المستخدمين')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '1rem' } }}
          >
            {t(
              'users:activity.subtitle',
              'متابعة المستخدمين النشطين وغير النشطين في التطبيق'
            )}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
          fullWidth={isMobile}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            minWidth: { xs: '100%', sm: 120 },
          }}
        >
          {t('common:actions.refresh', 'تحديث')}
        </Button>
      </Box>

      <ActivityKPICards stats={activityStats} />

      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: { xs: 2, sm: 3 },
          bgcolor: 'background.paper',
          backgroundImage: 'none',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder={t('users:activity.search', 'بحث برقم الهاتف أو الاسم...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper
        sx={{
          mb: { xs: 2, sm: 3 },
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
        }}
      >
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
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              minHeight: { xs: 48, sm: 64 },
              px: { xs: 1, sm: 3 },
            },
          }}
        >
          <Tab
            icon={<OnlinePrediction />}
            label={t('users:activity.tabs.activeNow', 'نشطين الآن')}
            iconPosition="start"
          />
          <Tab
            icon={<PersonOff />}
            label={t('users:activity.tabs.inactive', 'غير نشطين')}
            iconPosition="start"
          />
          <Tab
            icon={<Login />}
            label={t('users:activity.tabs.neverLoggedIn', 'لم يدخلوا أبداً')}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      <TabPanel value={selectedTab} index={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : activeUsers?.data && activeUsers.data.length > 0 ? (
          <DataTable
            columns={activeUsersColumns}
            rows={filterData(activeUsers.data)}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            getRowId={(row) => (row as ActiveUser).userId}
            height={500}
            searchPlaceholder={t('users:activity.search', 'بحث...')}
            onSearch={() => {}}
          />
        ) : (
          <Alert severity="info">
            {t('users:activity.noActiveUsers', 'لا يوجد مستخدمين نشطين حالياً')}
          </Alert>
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : inactiveUsers?.data && inactiveUsers.data.length > 0 ? (
          <DataTable
            columns={inactiveUsersColumns}
            rows={filterData(inactiveUsers.data)}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            getRowId={(row) => (row as InactiveUser).userId}
            height={500}
            searchPlaceholder={t('users:activity.search', 'بحث...')}
            onSearch={() => {}}
          />
        ) : (
          <Alert severity="success">
            {t('users:activity.noInactiveUsers', 'جميع المستخدمين نشطين!')}
          </Alert>
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : neverLoggedInUsers?.data && neverLoggedInUsers.data.length > 0 ? (
          <DataTable
            columns={neverLoggedInColumns}
            rows={filterData(neverLoggedInUsers.data)}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            getRowId={(row) => (row as NeverLoggedInUser).userId}
            height={500}
            searchPlaceholder={t('users:activity.search', 'بحث...')}
            onSearch={() => {}}
          />
        ) : (
          <Alert severity="success">
            {t('users:activity.noNeverLoggedInUsers', 'جميع المستخدمين دخلوا التطبيق!')}
          </Alert>
        )}
      </TabPanel>
    </Container>
  );
};

export default UserActivityPage;

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Skeleton,
  Stack,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Analytics,
  Refresh,
  Support,
  Email,
  CheckCircle,
  Pending,
  Error as ErrorIcon,
} from '@mui/icons-material';
import {
  PageShell,
  PageHeader,
  PageSummaryGrid,
  StatCard,
  EmptyState,
  ErrorState,
  usePageTitle,
} from '@/shared/design-system';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  SupportTicketCard, 
  SupportTicketFilters, 
  SLAAlerter,
} from '../components';
import { 
  useSupportTickets, 
  useBreachedSLATickets,
  useSupportStats,
  useUnreadSupportCount,
} from '../hooks/useSupport';
import type { 
  SupportTicket, 
  ListTicketsParams,
} from '../types/support.types';

export const SupportTicketsListPage: React.FC = () => {
  const { t } = useTranslation('support');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [filters, setFilters] = useState<ListTicketsParams>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const pageTitle = t('support:header.title', 'الدعم الفني');
  usePageTitle(pageTitle);

  const { data: statsData } = useSupportStats();
  const { data: unreadData } = useUnreadSupportCount();
  const unreadCount = unreadData?.unreadTicketsCount ?? 0;

  const { data, isLoading, error, refetch } = useSupportTickets({
    ...filters,
    page: currentPage,
    limit: pageSize,
  });

  const { data: breachedSLA, refetch: refetchSLA } = useBreachedSLATickets();

  const handleFiltersChange = (newFilters: ListTicketsParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetch();
    refetchSLA();
  };

  const handleTicketClick = (ticket: SupportTicket) => {
    navigate(`/support/${ticket._id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderSkeletons = () => (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {[...Array(isMobile ? 4 : isTablet ? 6 : 8)].map((_, index) => (
<Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} key={index} sx={{ minWidth: 0 }}>
           <Skeleton
            variant="rectangular" 
            height={isMobile ? 180 : 200}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <PageShell fullHeight>
      <PageHeader
        title={pageTitle}
        description={t('support:header.description', 'إدارة ومتابعة تذاكر الدعم الفني')}
        actions={[
          {
            label: t('actions.viewStats', 'الإحصائيات'),
            icon: <Analytics />,
            onClick: () => navigate('/support/stats'),
          },
          {
            label: t('labels.refresh', 'تحديث'),
            icon: <Refresh />,
            onClick: handleRefresh,
            loading: isLoading,
          },
        ]}
        breadcrumbs={[
          { label: 'لوحة التحكم', to: '/dashboard' },
          { label: pageTitle },
        ]}
      />

      <PageSummaryGrid>
        <StatCard
          title={t('support:stats.totalTickets', 'إجمالي التذاكر')}
          value={statsData?.total ?? data?.meta?.total ?? 0}
          icon={<Email />}
          tone="primary"
        />
        <StatCard
          title={t('support:stats.openTickets', 'تذاكر مفتوحة')}
          value={statsData?.open ?? unreadCount ?? 0}
          icon={<Pending />}
          tone="warning"
        />
        <StatCard
          title={t('support:stats.closedTickets', 'تذاكر مغلقة')}
          value={statsData?.closed ?? 0}
          icon={<CheckCircle />}
          tone="success"
        />
        <StatCard
          title={t('support:stats.slaBreached', 'مخالفة SLA')}
          value={breachedSLA?.tickets?.length ?? 0}
          icon={<ErrorIcon />}
          tone="error"
        />
      </PageSummaryGrid>

      {/* SLA Alerts */}
      {breachedSLA && breachedSLA.tickets && breachedSLA.tickets.length > 0 && (
        <Box mb={{ xs: 2, sm: 3 }}>
          <SLAAlerter
            tickets={breachedSLA.tickets}
            onRefresh={refetchSLA}
            onTicketClick={handleTicketClick}
          />
        </Box>
      )}

      {/* Filters */}
      <SupportTicketFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Results Summary */}
      {data?.data && (
        <Paper 
          sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            mb: { xs: 2, sm: 3 },
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={{ xs: 1.5, sm: 0 }}
          >
            <Typography 
              variant={isMobile ? 'body2' : 'body1'}
              sx={{ color: 'text.primary' }}
            >
              {t('pagination.showing', { 
                count: Array.isArray(data.data) ? data.data.length : 0, 
                total: data.meta?.total || 0 
              })}
            </Typography>
            {Object.entries(filters as any).filter(([, value]) => value).length > 0 && (
              <Stack 
                direction="row" 
                spacing={1} 
                flexWrap="wrap" 
                useFlexGap
                sx={{ gap: 0.5 }}
              >
                {Object.entries(filters as any)
                  .filter(([, value]) => value)
                  .map(([key, value]) => (
                    <Chip
                      key={key}
                      label={`${key}: ${value}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: 'divider',
                        color: 'text.secondary',
                        '& .MuiChip-label': {
                          fontSize: isMobile ? '0.7rem' : '0.75rem',
                        },
                      }}
                    />
                  ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      )}

      {/* Error State */}
      {error && (
        <ErrorState
          title={t('messages.errorLoadingTickets', 'حدث خطأ أثناء تحميل التذاكر')}
          onRetry={handleRefresh}
        />
      )}

      {/* Tickets Grid */}
      {isLoading ? (
        renderSkeletons()
      ) : data?.data && Array.isArray(data.data) && data.data.length > 0 ? (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {data.data.map((ticket) => (
            <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} key={ticket._id} sx={{ minWidth: 0 }}>
              <SupportTicketCard
                ticket={ticket}
                onClick={handleTicketClick}
                showUser={true}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          icon={<Support />}
          title={t('messages.noTickets')}
          description={t('messages.noTicketsDesc')}
        />
      )}

      {/* Pagination */}
      {data?.meta && data.meta.total > pageSize && (
        <Box 
          mt={{ xs: 2, sm: 3 }} 
          display="flex" 
          justifyContent="center"
          sx={{ overflowX: 'auto', pb: 1 }}
        >
          <Stack 
            direction="row" 
            spacing={{ xs: 0.5, sm: 1 }}
            sx={{ 
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              justifyContent: 'center',
              gap: { xs: 0.5, sm: 0 },
            }}
          >
            {Array.from({ length: Math.ceil(data.meta.total / pageSize) }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'contained' : 'outlined'}
                onClick={() => handlePageChange(i + 1)}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  minWidth: { xs: 36, sm: 40 },
                  height: { xs: 32, sm: 36 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  ...(currentPage === i + 1 ? {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  } : {
                    color: 'text.primary',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }),
                }}
              >
                {i + 1}
              </Button>
            ))}
          </Stack>
        </Box>
      )}
    </PageShell>
  );
};


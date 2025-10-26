import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Skeleton,
  Alert,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import { 
  Analytics, 
  Refresh,
  Support,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  SupportTicketCard, 
  SupportTicketFilters, 
  SLAAlerter,
} from '../components';
import { 
  useSupportTickets, 
  useBreachedSLATickets,
} from '../hooks/useSupport';
import type { 
  SupportTicket, 
  ListTicketsParams,
} from '../types/support.types';

export const SupportTicketsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ListTicketsParams>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

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
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Skeleton variant="rectangular" height={200} />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          إدارة تذاكر الدعم
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Analytics />}
            onClick={() => navigate('/support/stats')}
          >
            عرض الإحصائيات
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            تحديث
          </Button>
        </Stack>
      </Stack>

      {/* SLA Alerts */}
      {breachedSLA?.data && breachedSLA.data.tickets.length > 0 && (
        <Box mb={3}>
          <SLAAlerter
            tickets={breachedSLA.data.tickets}
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
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1">
              عرض {Array.isArray(data.data) ? data.data.length : 0} من أصل {data.meta?.total || 0} تذكرة
            </Typography>
            <Stack direction="row" spacing={1}>
              {Object.entries(filters as any)
                .filter(([, value]) => value)
                .map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          حدث خطأ في تحميل التذاكر. يرجى المحاولة مرة أخرى.
        </Alert>
      )}

      {/* Tickets Grid */}
      {isLoading ? (
        renderSkeletons()
      ) : data?.data && Array.isArray(data.data) && data.data.length > 0 ? (
        <Grid container spacing={3}>
          {data.data.map((ticket) => (
            <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} key={ticket._id}>
              <SupportTicketCard
                ticket={ticket}
                onClick={handleTicketClick}
                showUser={true}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Support sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            لا توجد تذاكر
          </Typography>
          <Typography variant="body2" color="text.secondary">
            لم يتم العثور على أي تذاكر تطابق المعايير المحددة
          </Typography>
        </Paper>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.total > pageSize && (
        <Box mt={3} display="flex" justifyContent="center">
          <Stack direction="row" spacing={1}>
            {Array.from({ length: Math.ceil(data.meta.total / pageSize) }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'contained' : 'outlined'}
                onClick={() => handlePageChange(i + 1)}
                size="small"
              >
                {i + 1}
              </Button>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};


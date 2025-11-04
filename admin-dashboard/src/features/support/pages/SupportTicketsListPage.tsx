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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Analytics,
  Refresh,
  Support,
} from '@mui/icons-material';
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
        <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} key={index}>
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
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 2, sm: 0 }}
        mb={{ xs: 2, sm: 3 }}
      >
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          fontWeight="bold"
          sx={{ color: 'text.primary' }}
        >
          {t('titles.supportManagement')}
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={1.5}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant="outlined"
            startIcon={<Analytics />}
            onClick={() => navigate('/support/stats')}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            {t('actions.viewStats')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            {t('labels.refresh')}
          </Button>
        </Stack>
      </Stack>

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
        <Alert 
          severity="error" 
          sx={{ 
            mb: { xs: 2, sm: 3 },
            backgroundColor: 'error.light',
            color: 'error.contrastText',
          }}
        >
          {t('messages.errorLoadingTickets')}
        </Alert>
      )}

      {/* Tickets Grid */}
      {isLoading ? (
        renderSkeletons()
      ) : data?.data && Array.isArray(data.data) && data.data.length > 0 ? (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
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
        <Paper 
          sx={{ 
            p: { xs: 3, sm: 4 }, 
            textAlign: 'center',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Support 
            sx={{ 
              fontSize: { xs: 48, sm: 64 }, 
              color: 'text.secondary', 
              mb: 2 
            }} 
          />
          <Typography 
            variant={isMobile ? 'subtitle1' : 'h6'} 
            color="text.secondary" 
            gutterBottom
            sx={{ fontWeight: 'medium' }}
          >
            {t('messages.noTickets')}
          </Typography>
          <Typography 
            variant={isMobile ? 'caption' : 'body2'} 
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {t('messages.noTicketsDesc')}
          </Typography>
        </Paper>
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
    </Box>
  );
};


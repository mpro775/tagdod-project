import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  useTheme,
} from '@mui/material';
import {
  Person,
  Store,
  Description,
  Visibility,
  Refresh,
} from '@mui/icons-material';
import { usePendingVerifications } from '../hooks/useUsers';
import { VerificationRequestDialog } from '../components/VerificationRequestDialog';
import type { VerificationRequest } from '../types/user.types';
import { formatDate } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

export const VerificationRequestsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(['users', 'common']);
  const { isMobile, isTablet } = useBreakpoint();
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: requestsData, isLoading, error, refetch } = usePendingVerifications();
  const requests = requestsData || [];

  const handleViewDetails = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
    // Refresh data after dialog closes (in case of approve/reject)
    setTimeout(() => {
      refetch();
    }, 500);
  };

  const getVerificationTypeLabel = (type: 'engineer' | 'merchant') => {
    return type === 'engineer' ? t('users:verification.engineer') : t('users:verification.merchant');
  };

  const getVerificationTypeIcon = (type: 'engineer' | 'merchant') => {
    return type === 'engineer' ? <Person /> : <Store />;
  };

  const getVerificationTypeColor = (type: 'engineer' | 'merchant') => {
    return type === 'engineer' ? 'primary' : 'secondary';
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={{ xs: 300, md: 400 }}
        sx={{ bgcolor: theme.palette.background.default }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={{ xs: 2, md: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size={isMobile ? 'small' : 'medium'}
              onClick={() => refetch()}
              sx={{
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              {t('users:verification.retry')}
            </Button>
          }
          sx={{
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {t('users:verification.errorLoading')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: { xs: 2, md: 3 },
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      >
        <Stack
          direction={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'stretch' : 'center'}
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography
              variant={isMobile ? 'h5' : isTablet ? 'h4' : 'h4'}
              gutterBottom
              sx={{
                color: theme.palette.text.primary,
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                mb: 1,
              }}
            >
              {t('users:verification.title')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {t('users:verification.description')}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
            sx={{
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            {t('users:verification.refresh')}
          </Button>
        </Stack>
      </Paper>

      {/* Statistics */}
      {requests && requests.length > 0 && (
        <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    mb: 0.5,
                  }}
                >
                  {requests.length}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                >
                  {t('users:verification.totalRequests')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    mb: 0.5,
                  }}
                >
                  {requests.filter((r) => r.verificationType === 'engineer').length}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                >
                  {t('users:verification.engineerRequests')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  sx={{
                    color: theme.palette.secondary.main,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    mb: 0.5,
                  }}
                >
                  {requests.filter((r) => r.verificationType === 'merchant').length}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                >
                  {t('users:verification.merchantRequests')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Requests List */}
      {!requests || requests.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            textAlign: 'center',
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
          }}
        >
          <Typography
            variant={isMobile ? 'h6' : 'h6'}
            color="text.secondary"
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', md: '1.25rem' },
              color: theme.palette.text.secondary,
            }}
          >
            {t('users:verification.noRequests')}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
          >
            {t('users:verification.noRequestsDescription')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 1.5, md: 2 }}>
          {requests.map((request) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={request.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, md: 2 } }}>
                  <Stack spacing={{ xs: 1.5, md: 2 }}>
                    {/* Header */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Chip
                        icon={getVerificationTypeIcon(request.verificationType)}
                        label={getVerificationTypeLabel(request.verificationType)}
                        color={getVerificationTypeColor(request.verificationType) as any}
                        size={isMobile ? 'small' : 'small'}
                        sx={{
                          fontSize: { xs: '0.7rem', md: '0.75rem' },
                          height: { xs: '24px', md: '28px' },
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                      >
                        {request.createdAt
                          ? formatDate(request.createdAt)
                          : t('users:verification.notAvailable')}
                      </Typography>
                    </Stack>

                    {/* User Info */}
                    <Box>
                      <Typography
                        variant={isMobile ? 'body1' : 'h6'}
                        gutterBottom
                        sx={{
                          color: theme.palette.text.primary,
                          fontSize: { xs: '0.875rem', md: '1.125rem' },
                          fontWeight: 600,
                        }}
                      >
                        {request.firstName || request.lastName
                          ? `${request.firstName || ''} ${request.lastName || ''}`.trim()
                          : t('users:verification.notAvailable')}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                      >
                        {request.phone || t('users:verification.notAvailable')}
                      </Typography>
                    </Box>

                    {/* Store Name (for merchants) */}
                    {request.verificationType === 'merchant' && request.storeName && (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                          sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                        >
                          {t('users:verification.storeName')}:
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          sx={{
                            color: theme.palette.text.primary,
                            fontSize: { xs: '0.875rem', md: '1rem' },
                          }}
                        >
                          {request.storeName}
                        </Typography>
                      </Box>
                    )}

                    {/* File Status */}
                    <Box>
                      {request.verificationType === 'engineer' ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Description
                            fontSize={isMobile ? 'small' : 'small'}
                            sx={{
                              color: request.cvFileUrl
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: request.cvFileUrl
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                              fontSize: { xs: '0.75rem', md: '0.875rem' },
                            }}
                          >
                            {request.cvFileUrl
                              ? t('users:verification.cvUploaded')
                              : t('users:verification.cvNotUploaded')}
                          </Typography>
                        </Stack>
                      ) : (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Store
                            fontSize={isMobile ? 'small' : 'small'}
                            sx={{
                              color: request.storePhotoUrl
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: request.storePhotoUrl
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                              fontSize: { xs: '0.75rem', md: '0.875rem' },
                            }}
                          >
                            {request.storePhotoUrl
                              ? t('users:verification.storePhotoUploaded')
                              : t('users:verification.storePhotoNotUploaded')}
                          </Typography>
                        </Stack>
                      )}
                    </Box>

                    {/* Note Preview */}
                    {request.verificationNote && (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {request.verificationNote}
                        </Typography>
                      </Box>
                    )}

                    {/* Actions */}
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(request)}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        mt: 'auto',
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                      }}
                    >
                      {t('users:verification.viewDetails')}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog */}
      <VerificationRequestDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        request={selectedRequest}
      />
    </Box>
  );
};


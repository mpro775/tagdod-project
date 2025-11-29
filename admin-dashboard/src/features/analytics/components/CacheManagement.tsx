import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardPadding } from '../utils/responsive';
import {
  DeleteSweep as DeleteSweepIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useClearCache } from '../hooks/useAnalytics';

interface CacheManagementProps {
  onCacheCleared?: () => void;
}

export const CacheManagement: React.FC<CacheManagementProps> = ({ onCacheCleared }) => {
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const [openDialog, setOpenDialog] = useState(false);
  const clearCache = useClearCache();

  const handleClearCache = async () => {
    try {
      await clearCache.mutateAsync();
      setOpenDialog(false);
      if (onCacheCleared) {
        onCacheCleared();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  return (
    <>
      <Card>
        <CardContent sx={{ p: cardPadding }}>
          <Stack
            direction={breakpoint.isMobile ? 'column' : 'row'}
            spacing={breakpoint.isMobile ? 1.5 : 0}
            sx={{
              justifyContent: 'space-between',
              alignItems: breakpoint.isMobile ? 'flex-start' : 'center',
              gap: breakpoint.isMobile ? 1.5 : 2,
            }}
          >
            <Box>
              <Typography
                variant={breakpoint.isXs ? 'h6' : 'h5'}
                component="h2"
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1.125rem' : undefined }}
              >
                {t('cacheManagement.title')}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
              >
                {t('cacheManagement.description')}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<DeleteSweepIcon sx={{ fontSize: breakpoint.isXs ? 18 : undefined }} />}
              onClick={() => setOpenDialog(true)}
              disabled={clearCache.isPending}
              size={breakpoint.isXs ? 'medium' : 'medium'}
              fullWidth={breakpoint.isMobile}
              sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
            >
              {clearCache.isPending
                ? t('cacheManagement.clearing')
                : t('cacheManagement.clearCache')}
            </Button>
          </Stack>

          {clearCache.isSuccess && (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ mt: 2 }}
              onClose={() => clearCache.reset()}
            >
              <Typography
                variant="body2"
                sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
              >
                {t('cacheManagement.success')}
              </Typography>
            </Alert>
          )}

          {clearCache.isError && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => clearCache.reset()}>
              <Typography
                variant="body2"
                sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
              >
                {t('cacheManagement.error')}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={breakpoint.isXs}
      >
        <DialogTitle sx={{ fontSize: breakpoint.isXs ? '1.125rem' : undefined }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <WarningIcon color="warning" />
            <Typography
              variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
              sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
            >
              {t('cacheManagement.confirmTitle')}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}>
            {t('cacheManagement.confirmMessage')}
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
            >
              {t('cacheManagement.warning')}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button
            onClick={() => setOpenDialog(false)}
            size={breakpoint.isXs ? 'medium' : 'medium'}
            sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
          >
            {t('cacheManagement.cancel')}
          </Button>
          <Button
            onClick={handleClearCache}
            variant="contained"
            color="warning"
            disabled={clearCache.isPending}
            startIcon={<DeleteSweepIcon />}
            size={breakpoint.isXs ? 'medium' : 'medium'}
            sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
          >
            {clearCache.isPending ? t('cacheManagement.clearing') : t('cacheManagement.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Paper,
  Divider,
  Typography,
} from '@mui/material';
import {
  Search,
  Add,
  Send,
  Analytics,
  Refresh,
  Delete,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useTheme } from '@mui/material/styles';
import { ListNotificationsParams } from '../types/notification.types';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationCategory,
  NotificationPriority,
} from '../types/notification.types';

interface NotificationFiltersProps {
  filters: ListNotificationsParams;
  onFilterChange: (field: keyof ListNotificationsParams, value: any) => void;
  onCreateClick: () => void;
  onBulkSendClick: () => void;
  onTestClick: () => void;
  onRefresh: () => void;
  selectedCount: number;
  onBulkDelete: () => void;
  isCreating?: boolean;
  isBulkSending?: boolean;
  isTesting?: boolean;
  isLoading?: boolean;
  isDeleting?: boolean;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filters,
  onFilterChange,
  onCreateClick,
  onBulkSendClick,
  onTestClick,
  onRefresh,
  selectedCount,
  onBulkDelete,
  isCreating = false,
  isBulkSending = false,
  isTesting = false,
  isLoading = false,
  isDeleting = false,
}) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: isMobile ? 1.5 : 2,
        mb: isMobile ? 1.5 : 2,
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: isMobile ? 1.5 : 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          mb: isMobile ? 1.5 : 2,
        }}
      >
        <TextField
          size="small"
          placeholder={t('filters.search')}
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ minWidth: isMobile ? '100%' : 250, flex: isMobile ? '1 1 100%' : undefined }}
          aria-label={t('filters.search')}
        />

        <FormControl
          size="small"
          sx={{ minWidth: isMobile ? '100%' : 150, flex: isMobile ? '1 1 100%' : undefined }}
        >
          <InputLabel>{t('filters.channel')}</InputLabel>
          <Select
            value={filters.channel || ''}
            onChange={(e) => onFilterChange('channel', e.target.value || undefined)}
            label={t('filters.channel')}
            aria-label={t('filters.channel')}
          >
            <MenuItem value="">{t('filters.all')}</MenuItem>
            <MenuItem value={NotificationChannel.IN_APP}>{t('channels.IN_APP')}</MenuItem>
            <MenuItem value={NotificationChannel.PUSH}>{t('channels.PUSH')}</MenuItem>
            <MenuItem value={NotificationChannel.SMS}>{t('channels.SMS')}</MenuItem>
            <MenuItem value={NotificationChannel.EMAIL}>{t('channels.EMAIL')}</MenuItem>
            <MenuItem value={NotificationChannel.DASHBOARD}>{t('channels.DASHBOARD')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{ minWidth: isMobile ? '100%' : 150, flex: isMobile ? '1 1 100%' : undefined }}
        >
          <InputLabel>{t('filters.status')}</InputLabel>
          <Select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value || undefined)}
            label={t('filters.status')}
            aria-label={t('filters.status')}
          >
            <MenuItem value="">{t('filters.all')}</MenuItem>
            <MenuItem value={NotificationStatus.SENT}>{t('statuses.sent')}</MenuItem>
            <MenuItem value={NotificationStatus.DELIVERED}>{t('statuses.delivered')}</MenuItem>
            <MenuItem value={NotificationStatus.READ}>{t('statuses.read')}</MenuItem>
            <MenuItem value={NotificationStatus.CLICKED}>{t('statuses.clicked')}</MenuItem>
            <MenuItem value={NotificationStatus.FAILED}>{t('statuses.failed')}</MenuItem>
            <MenuItem value={NotificationStatus.QUEUED}>{t('statuses.queued')}</MenuItem>
            <MenuItem value={NotificationStatus.PENDING}>{t('statuses.pending')}</MenuItem>
            <MenuItem value={NotificationStatus.CANCELLED}>{t('statuses.cancelled')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{ minWidth: isMobile ? '100%' : 150, flex: isMobile ? '1 1 100%' : undefined }}
        >
          <InputLabel>{t('filters.category')}</InputLabel>
          <Select
            value={filters.category || ''}
            onChange={(e) => onFilterChange('category', e.target.value || undefined)}
            label={t('filters.category')}
            aria-label={t('filters.category')}
          >
            <MenuItem value="">{t('filters.all')}</MenuItem>
            <MenuItem value={NotificationCategory.ORDER}>{t('categories.ORDER')}</MenuItem>
            <MenuItem value={NotificationCategory.PRODUCT}>{t('categories.PRODUCT')}</MenuItem>
            <MenuItem value={NotificationCategory.SERVICE}>{t('categories.SERVICE')}</MenuItem>
            <MenuItem value={NotificationCategory.PROMOTION}>{t('categories.PROMOTION')}</MenuItem>
            <MenuItem value={NotificationCategory.ACCOUNT}>{t('categories.ACCOUNT')}</MenuItem>
            <MenuItem value={NotificationCategory.SYSTEM}>{t('categories.SYSTEM')}</MenuItem>
            <MenuItem value={NotificationCategory.SUPPORT}>{t('categories.SUPPORT')}</MenuItem>
            <MenuItem value={NotificationCategory.PAYMENT}>{t('categories.PAYMENT')}</MenuItem>
            <MenuItem value={NotificationCategory.MARKETING}>{t('categories.MARKETING')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{ minWidth: isMobile ? '100%' : 150, flex: isMobile ? '1 1 100%' : undefined }}
        >
          <InputLabel>{t('filters.priority')}</InputLabel>
          <Select
            value={filters.priority || ''}
            onChange={(e) => onFilterChange('priority', e.target.value || undefined)}
            label={t('filters.priority')}
            aria-label={t('filters.priority')}
          >
            <MenuItem value="">{t('filters.all')}</MenuItem>
            <MenuItem value={NotificationPriority.URGENT}>{t('priorities.urgent')}</MenuItem>
            <MenuItem value={NotificationPriority.HIGH}>{t('priorities.high')}</MenuItem>
            <MenuItem value={NotificationPriority.MEDIUM}>{t('priorities.medium')}</MenuItem>
            <MenuItem value={NotificationPriority.LOW}>{t('priorities.low')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateClick}
          disabled={isCreating}
          size={isMobile ? 'small' : 'medium'}
          fullWidth={isMobile}
          aria-label={t('actions.add')}
        >
          {t('actions.add')}
        </Button>

        <Button
          variant="outlined"
          startIcon={<Send />}
          onClick={onBulkSendClick}
          disabled={isBulkSending}
          size={isMobile ? 'small' : 'medium'}
          fullWidth={isMobile}
          aria-label={t('actions.bulkSend')}
        >
          {t('actions.bulkSend')}
        </Button>

        <Button
          variant="outlined"
          startIcon={<Analytics />}
          onClick={onTestClick}
          disabled={isTesting}
          size={isMobile ? 'small' : 'medium'}
          fullWidth={isMobile}
          aria-label={t('actions.testTemplate')}
        >
          {t('actions.testTemplate')}
        </Button>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={onRefresh}
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
          fullWidth={isMobile}
          aria-label={t('actions.refresh')}
        >
          {t('actions.refresh')}
        </Button>

        {selectedCount > 0 && (
          <>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: isMobile ? 'none' : 'block' }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
            >
              {selectedCount} {t('actions.selected')}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={onBulkDelete}
              disabled={isDeleting}
              size={isMobile ? 'small' : 'medium'}
              fullWidth={isMobile}
              aria-label={t('actions.bulkDelete')}
            >
              {t('actions.bulkDelete')}
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
};


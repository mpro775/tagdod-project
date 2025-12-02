import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Stack,
  Grid,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  BulkSendNotificationDto,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationCategory,
} from '../types/notification.types';
import { getNotificationTypeLabel } from './notificationHelpers';
import { NotificationUserSelector } from './NotificationUserSelector';

interface BulkSendFormProps {
  onSave: (data: BulkSendNotificationDto) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const BulkSendForm: React.FC<BulkSendFormProps> = ({ onSave, onCancel, isLoading }) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<BulkSendNotificationDto>({
    type: NotificationType.ORDER_CONFIRMED,
    title: '',
    message: '',
    messageEn: '',
    channel: NotificationChannel.IN_APP,
    priority: NotificationPriority.MEDIUM,
    category: NotificationCategory.ORDER,
    templateKey: '',
    targetUserIds: [],
    actionUrl: '',
    data: {},
  });

  // Update formData when selectedUserIds changes
  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      targetUserIds: selectedUserIds,
    }));
  }, [selectedUserIds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      return;
    }
    onSave({
      ...formData,
      targetUserIds: selectedUserIds,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        <Alert severity="info" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
          {t('forms.bulkSendInfo')}
        </Alert>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('forms.type')}</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value as NotificationType }))
                }
                label={t('forms.type')}
                disabled={isLoading}
                size={isMobile ? 'small' : 'medium'}
                aria-label={t('forms.type')}
              >
                {Object.values(NotificationType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {getNotificationTypeLabel(type, t)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('forms.channel')}</InputLabel>
              <Select
                value={formData.channel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    channel: e.target.value as NotificationChannel,
                  }))
                }
                label={t('forms.channel')}
                disabled={isLoading}
                size={isMobile ? 'small' : 'medium'}
                aria-label={t('forms.channel')}
              >
                <MenuItem value={NotificationChannel.IN_APP}>{t('channels.IN_APP')}</MenuItem>
                <MenuItem value={NotificationChannel.PUSH}>{t('channels.PUSH')}</MenuItem>
                <MenuItem value={NotificationChannel.SMS}>{t('channels.SMS')}</MenuItem>
                <MenuItem value={NotificationChannel.EMAIL}>{t('channels.EMAIL')}</MenuItem>
                <MenuItem value={NotificationChannel.DASHBOARD}>{t('channels.DASHBOARD')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label={t('forms.title')}
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          required
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
          aria-label={t('forms.title')}
        />

        <TextField
          fullWidth
          label={t('forms.message')}
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          multiline
          rows={isMobile ? 3 : 4}
          required
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
          aria-label={t('forms.message')}
        />

        <TextField
          fullWidth
          label={t('forms.messageEn')}
          value={formData.messageEn}
          onChange={(e) => setFormData((prev) => ({ ...prev, messageEn: e.target.value }))}
          multiline
          rows={isMobile ? 3 : 4}
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
          aria-label={t('forms.messageEn')}
        />

        <NotificationUserSelector
          selectedUserIds={selectedUserIds}
          onUserIdsChange={setSelectedUserIds}
          disabled={isLoading}
        />

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-end',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          <Button
            onClick={onCancel}
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
            aria-label={t('templates.actions.cancel')}
          >
            {t('templates.actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || selectedUserIds.length === 0}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
            aria-label={t('forms.sendBulk')}
          >
            {isLoading ? t('forms.sending') : t('forms.sendBulk')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

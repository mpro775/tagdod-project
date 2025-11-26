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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { Notification, UpdateNotificationDto, NotificationPriority } from '../types/notification.types';

interface NotificationEditFormProps {
  notification: Notification;
  onSave: (data: UpdateNotificationDto) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const NotificationEditForm: React.FC<NotificationEditFormProps> = ({
  notification,
  onSave,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [formData, setFormData] = useState({
    title: notification.title || '',
    message: notification.message || '',
    messageEn: notification.messageEn || '',
    actionUrl: notification.actionUrl || '',
    priority: notification.priority || NotificationPriority.MEDIUM,
    status: notification.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
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
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('forms.priority')}</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as NotificationPriority,
                  }))
                }
                label={t('forms.priority')}
                disabled={isLoading}
                size={isMobile ? 'small' : 'medium'}
                aria-label={t('forms.priority')}
              >
                <MenuItem value={NotificationPriority.LOW}>{t('priorities.low')}</MenuItem>
                <MenuItem value={NotificationPriority.MEDIUM}>{t('priorities.medium')}</MenuItem>
                <MenuItem value={NotificationPriority.HIGH}>{t('priorities.high')}</MenuItem>
                <MenuItem value={NotificationPriority.URGENT}>{t('priorities.urgent')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

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

        <TextField
          fullWidth
          label={t('forms.actionUrl')}
          value={formData.actionUrl}
          onChange={(e) => setFormData((prev) => ({ ...prev, actionUrl: e.target.value }))}
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
          aria-label={t('forms.actionUrl')}
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
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
            aria-label={t('forms.save')}
          >
            {isLoading ? t('forms.saving') : t('forms.save')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};


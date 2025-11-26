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
import {
  CreateNotificationDto,
  NotificationTemplate,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationCategory,
} from '../types/notification.types';
import { getCategoryLabel } from './notificationHelpers';
import { NotificationUserSelector } from './NotificationUserSelector';

interface NotificationCreateFormProps {
  templates: NotificationTemplate[];
  onSave: (data: CreateNotificationDto) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const NotificationCreateForm: React.FC<NotificationCreateFormProps> = ({
  templates,
  onSave,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateNotificationDto>({
    type: NotificationType.ORDER_CONFIRMED,
    title: '',
    message: '',
    messageEn: '',
    channel: NotificationChannel.IN_APP,
    priority: NotificationPriority.MEDIUM,
    category: NotificationCategory.ORDER,
    templateKey: '',
    recipientId: '',
    recipientEmail: '',
    recipientPhone: '',
    actionUrl: '',
    data: {},
  });

  const handleTemplateChange = (templateKey: string) => {
    const template = templates.find((t) => t.key === templateKey);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        templateKey,
        title: template.title,
        message: template.message,
        messageEn: template.messageEn,
        category: template.category,
      }));
    }
  };

  const handleUserIdsChange = (userIds: string[]) => {
    setSelectedUserIds(userIds);
    setFormData((prev) => ({ ...prev, recipientId: userIds.join(',') }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        {templates.length > 0 && (
          <FormControl fullWidth>
            <InputLabel>{t('forms.template')}</InputLabel>
            <Select
              value={formData.templateKey}
              onChange={(e) => handleTemplateChange(e.target.value)}
              label={t('forms.template')}
              disabled={isLoading}
              size={isMobile ? 'small' : 'medium'}
              aria-label={t('forms.template')}
            >
              <MenuItem value="">{t('forms.noTemplate')}</MenuItem>
              {templates.map((template) => (
                <MenuItem key={template.key} value={template.key}>
                  {template.name} - {template.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

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
                    {type}
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

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('forms.category')}</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as NotificationCategory,
                  }))
                }
                label={t('forms.category')}
                disabled={isLoading}
                size={isMobile ? 'small' : 'medium'}
                aria-label={t('forms.category')}
              >
                {Object.values(NotificationCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {getCategoryLabel(category, t)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

        <TextField
          fullWidth
          label={t('forms.actionUrl')}
          value={formData.actionUrl}
          onChange={(e) => setFormData((prev) => ({ ...prev, actionUrl: e.target.value }))}
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
          aria-label={t('forms.actionUrl')}
        />

        <NotificationUserSelector
          selectedUserIds={selectedUserIds}
          onUserIdsChange={handleUserIdsChange}
          disabled={isLoading}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('forms.recipientEmail')}
              value={formData.recipientEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, recipientEmail: e.target.value }))}
              type="email"
              disabled={isLoading}
              size={isMobile ? 'small' : 'medium'}
              helperText={t('forms.recipientEmailHelper', 'اختياري - للبريد الإلكتروني')}
              aria-label={t('forms.recipientEmail')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('forms.recipientPhone')}
              value={formData.recipientPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, recipientPhone: e.target.value }))}
              disabled={isLoading}
              size={isMobile ? 'small' : 'medium'}
              helperText={t('forms.recipientPhoneHelper', 'اختياري - للرسائل النصية')}
              aria-label={t('forms.recipientPhone')}
            />
          </Grid>
        </Grid>

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
            aria-label={t('forms.create')}
          >
            {isLoading ? t('forms.creating') : t('forms.create')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};


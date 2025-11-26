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
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { NotificationTemplate } from '../types/notification.types';

interface TestNotificationFormProps {
  templates: NotificationTemplate[];
  onTest: (userId: string, templateKey: string, payload: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const TestNotificationForm: React.FC<TestNotificationFormProps> = ({
  templates,
  onTest,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [formData, setFormData] = useState({
    userId: '',
    templateKey: '',
    payload: {} as Record<string, unknown>,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTest(formData.userId, formData.templateKey, formData.payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        <Alert severity="warning" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
          {t('forms.testWarning')}
        </Alert>

        <TextField
          fullWidth
          label={t('forms.userId')}
          value={formData.userId}
          onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
          required
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
          aria-label={t('forms.userId')}
        />

        <FormControl fullWidth required>
          <InputLabel>{t('forms.template')}</InputLabel>
          <Select
            value={formData.templateKey}
            onChange={(e) => setFormData((prev) => ({ ...prev, templateKey: e.target.value }))}
            label={t('forms.template')}
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            aria-label={t('forms.template')}
          >
            {templates.map((template) => (
              <MenuItem key={template.key} value={template.key}>
                {template.name} - {template.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label={t('forms.testData')}
          value={JSON.stringify(formData.payload, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setFormData((prev) => ({ ...prev, payload: parsed }));
            } catch {
              // Invalid JSON, keep the text but don't update payload
            }
          }}
          multiline
          rows={isMobile ? 4 : 6}
          disabled={isLoading}
          helperText={t('forms.testDataHelper')}
          size={isMobile ? 'small' : 'medium'}
          aria-label={t('forms.testData')}
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
            aria-label={t('templates.actions.sendTest')}
          >
            {isLoading ? t('forms.sending') : t('templates.actions.sendTest')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};


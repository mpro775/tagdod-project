import React, { useState, useMemo, useEffect } from 'react';
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
  Autocomplete,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';
import { Person, Visibility } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useUsers } from '@/features/users/hooks/useUsers';
import { UserStatus } from '@/features/users/types/user.types';
import type { User } from '@/features/users/types/user.types';
import { NotificationTemplate } from '../types/notification.types';

/**
 * Extract variable names from template body (e.g. {{orderId}} -> orderId)
 */
const extractVariables = (body: string): string[] => {
  if (!body || typeof body !== 'string') return [];
  const matches = body.match(/\{\{\s*(\w+)\s*\}\}/g);
  if (!matches) return [];
  const vars = matches.map((m) => m.replace(/\{\{|\}\}|\s/g, ''));
  return [...new Set(vars)];
};

/**
 * Default values for common template variables
 */
const DEFAULT_VARIABLE_VALUES: Record<string, string> = {
  orderId: 'TEST-123',
  amount: '150',
  currency: 'USD',
  requestId: 'REQ-456',
  engineerName: 'أحمد محمد',
  customerName: 'مستخدم تجريبي',
};

interface TestNotificationFormProps {
  templates: NotificationTemplate[];
  onTest: (userId: string, templateKey: string, payload: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading: boolean;
  /** Pre-selected template key (e.g. when opened from template card) */
  initialTemplateKey?: string;
}

export const TestNotificationForm: React.FC<TestNotificationFormProps> = ({
  templates,
  onTest,
  onCancel,
  isLoading,
  initialTemplateKey = '',
}) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const theme = useTheme();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [templateKey, setTemplateKey] = useState(initialTemplateKey);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialTemplateKey) {
      setTemplateKey(initialTemplateKey);
      const tpl = templates.find(
        (t) => t.key === initialTemplateKey || t.id === initialTemplateKey
      );
      if (tpl) {
        const vars = Array.isArray(tpl.variables)
          ? tpl.variables
          : extractVariables(tpl.body || tpl.message || tpl.description || '');
        const initial: Record<string, string> = {};
        for (const v of vars) {
          initial[v] =
            ((tpl.exampleData as Record<string, unknown>)?.[v] as string) ||
            DEFAULT_VARIABLE_VALUES[v] ||
            '';
        }
        setVariableValues(initial);
      }
    }
  }, [initialTemplateKey, templates]);

  const { data: usersData, isLoading: usersLoading } = useUsers({
    limit: 50,
    page: 1,
    status: UserStatus.ACTIVE,
  });

  const allUsers = usersData?.data || [];

  const selectedTemplate = useMemo(
    () => templates.find((tpl) => tpl.key === templateKey),
    [templates, templateKey]
  );

  const templateVariables = useMemo(() => {
    if (!selectedTemplate) return [];
    const body = selectedTemplate.body || selectedTemplate.message || '';
    return extractVariables(body);
  }, [selectedTemplate]);

  const payload = useMemo(() => {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(variableValues)) {
      if (value !== undefined && value !== '') {
        result[key] = value;
      }
    }
    return result;
  }, [variableValues]);

  const previewBody = useMemo(() => {
    if (!selectedTemplate) return '';
    const body =
      selectedTemplate.body || selectedTemplate.message || selectedTemplate.description || '';
    return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, varName) => {
      const val = variableValues[varName];
      return val !== undefined && val !== ''
        ? String(val)
        : t('templates.testDialog.variablePlaceholder');
    });
  }, [selectedTemplate, variableValues, t]);

  const handleTemplateChange = (key: string) => {
    setTemplateKey(key);
    const tpl = templates.find((t) => (t.key || t.id) === key);
    if (tpl) {
      const vars = Array.isArray(tpl.variables)
        ? tpl.variables
        : extractVariables(tpl.body || tpl.message || tpl.description || '');
      const initial: Record<string, string> = {};
      for (const v of vars) {
        initial[v] =
          ((tpl.exampleData as Record<string, unknown>)?.[v] as string) ||
          DEFAULT_VARIABLE_VALUES[v] ||
          '';
      }
      setVariableValues(initial);
    } else {
      setVariableValues({});
    }
  };

  const handleVariableChange = (varName: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [varName]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = selectedUser?._id;
    if (userId && templateKey) {
      onTest(userId, templateKey, payload);
    }
  };

  const getUserDisplayName = (user: User) =>
    user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.phone || user._id;

  const canSubmit = !!selectedUser?._id && !!templateKey && !isLoading;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        <Alert severity="warning" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
          {t('forms.testWarning')}
        </Alert>

        {/* User selector */}
        <Autocomplete
          value={selectedUser}
          onChange={(_, newValue) => setSelectedUser(newValue)}
          options={allUsers}
          getOptionLabel={(option) =>
            typeof option === 'string' ? option : getUserDisplayName(option)
          }
          loading={usersLoading}
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('templates.testDialog.selectUser')}
              placeholder={t('templates.testDialog.searchUser')}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
          noOptionsText={t('forms.noUsersFound')}
        />

        {/* Template selector */}
        <FormControl fullWidth required>
          <InputLabel>{t('forms.template')}</InputLabel>
          <Select
            value={templateKey}
            onChange={(e) => handleTemplateChange(e.target.value)}
            label={t('forms.template')}
            disabled={isLoading || templates.length === 0}
            size={isMobile ? 'small' : 'medium'}
            aria-label={t('forms.template')}
          >
            {templates.map((template) => {
              const k = template.key || template.id;
              return (
                <MenuItem key={k} value={k}>
                  {template.name || template.title} - {template.title || template.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {/* Dynamic variable fields */}
        {templateVariables.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              {t('templates.testDialog.templateVariables')}
            </Typography>
            <Stack spacing={2}>
              {templateVariables.map((varName) => (
                <TextField
                  key={varName}
                  fullWidth
                  size="small"
                  label={t('templates.testDialog.variableLabel', { name: varName })}
                  value={variableValues[varName] ?? ''}
                  onChange={(e) => handleVariableChange(varName, e.target.value)}
                  placeholder={t('templates.testDialog.variablePlaceholder')}
                  disabled={isLoading}
                  helperText={
                    selectedTemplate?.variables &&
                    !Array.isArray(selectedTemplate.variables) &&
                    selectedTemplate.variables[varName]?.description
                      ? String(
                          (selectedTemplate.variables as Record<string, { description?: string }>)[
                            varName
                          ].description
                        )
                      : undefined
                  }
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Preview */}
        {selectedTemplate && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Visibility fontSize="small" color="action" />
              <Typography variant="subtitle2" fontWeight={600}>
                {t('templates.testDialog.previewTitle')}
              </Typography>
            </Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {selectedTemplate.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {previewBody}
            </Typography>
          </Paper>
        )}

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
            disabled={!canSubmit}
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

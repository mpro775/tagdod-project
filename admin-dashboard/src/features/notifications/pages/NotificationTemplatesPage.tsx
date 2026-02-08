import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  useTheme,
  Stack,
} from '@mui/material';
import { Add, Edit, Send, Code } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  useNotificationTemplates,
  useTestNotification,
  useCreateTemplate,
  useUpdateTemplate,
} from '../hooks/useNotifications';
import { NotificationTemplate } from '../types/notification.types';
import { NotificationCategory } from '../types/notification.types';
import { TestNotificationForm } from '../components/TestNotificationForm';

interface EditFormData {
  key: string;
  title: string;
  body: string;
}

const DEFAULT_EDIT_FORM: EditFormData = {
  key: '',
  title: '',
  body: '',
};

export const NotificationTemplatesPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>(DEFAULT_EDIT_FORM);

  const { data: templates = [], isLoading } = useNotificationTemplates();
  const { mutate: testNotification, isPending: isTesting } = useTestNotification();
  const { mutate: createTemplate, isPending: isCreating } = useCreateTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplate();

  useEffect(() => {
    if (editDialogOpen) {
      if (selectedTemplate) {
        setEditFormData({
          key: selectedTemplate.key,
          title: selectedTemplate.title || '',
          body: selectedTemplate.body || selectedTemplate.message || '',
        });
      } else {
        setEditFormData(DEFAULT_EDIT_FORM);
      }
    }
  }, [editDialogOpen, selectedTemplate]);

  const handleOpenCreate = () => {
    setSelectedTemplate(null);
    setEditDialogOpen(true);
  };

  const handleOpenEdit = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setEditDialogOpen(true);
  };

  const handleTestTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setTestDialogOpen(true);
  };

  const handleTest = (userId: string, templateKey: string, payload: Record<string, unknown>) => {
    testNotification(
      { userId, templateKey, payload },
      {
        onSuccess: () => {
          setTestDialogOpen(false);
          setSelectedTemplate(null);
        },
      }
    );
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTemplate) {
      updateTemplate(
        {
          key: selectedTemplate.key,
          data: {
            title: editFormData.title,
            message: editFormData.body,
            messageEn: editFormData.body,
          },
        },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setSelectedTemplate(null);
            setEditFormData(DEFAULT_EDIT_FORM);
          },
        }
      );
    } else {
      createTemplate(
        {
          name: editFormData.key,
          key: editFormData.key,
          title: editFormData.title,
          message: editFormData.body,
          messageEn: editFormData.body || '',
          channels: {
            inApp: true,
            push: false,
            sms: false,
            email: false,
          },
          type: 'ORDER_CONFIRMED',
          category: NotificationCategory.ORDER,
        },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setSelectedTemplate(null);
            setEditFormData(DEFAULT_EDIT_FORM);
          },
        }
      );
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedTemplate(null);
    setEditFormData(DEFAULT_EDIT_FORM);
  };

  const getTemplateDescription = (key: string | undefined) => {
    if (!key || typeof key !== 'string') return t('templates.descriptions.custom');
    const translationKey = `templates.descriptions.${key}`;
    const translated = t(translationKey);
    return translated !== translationKey ? translated : t('templates.descriptions.custom');
  };

  const getTemplateCategory = (key: string | undefined) => {
    if (!key || typeof key !== 'string') return 'general';
    if (key.includes('ORDER')) return 'orders';
    if (key.includes('SERVICE')) return 'services';
    return 'general';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'orders':
        return 'primary';
      case 'services':
        return 'success';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: isMobile ? 1.5 : 3 }}>
        <Typography variant={isMobile ? 'body1' : 'h6'}>{t('templates.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1.5 : 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          mb: isMobile ? 2 : 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0,
        }}
      >
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          sx={{ fontSize: isMobile ? '1.5rem' : undefined }}
        >
          {t('templates.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
          size={isMobile ? 'small' : 'medium'}
          fullWidth={isMobile}
        >
          {t('templates.addNew')}
        </Button>
      </Box>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: isMobile ? 2 : 3, fontSize: isMobile ? '0.875rem' : undefined }}
      >
        {t('templates.description')}
      </Typography>

      {templates.length > 0 ? (
        <Grid container spacing={isMobile ? 1.5 : 2}>
          {templates.map((template, index) => (
            <Grid
              key={template.key ?? template._id ?? `template-${index}`}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor:
                    theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
                }}
              >
                <CardContent sx={{ p: isMobile ? 1.5 : 2, flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: isMobile ? 1.5 : 2,
                      gap: 1,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant={isMobile ? 'subtitle1' : 'h6'}
                        gutterBottom
                        sx={{
                          fontSize: isMobile ? '1rem' : undefined,
                          fontWeight: 600,
                          wordBreak: 'break-word',
                        }}
                      >
                        {template.title}
                      </Typography>
                      <Chip
                        label={t(`templates.categories.${getTemplateCategory(template.key)}`)}
                        size="small"
                        color={getCategoryColor(getTemplateCategory(template.key)) as any}
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <Tooltip title={t('templates.actions.test')}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleTestTemplate(template)}
                        >
                          <Send fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('templates.actions.edit')}>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleOpenEdit(template)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: isMobile ? 1.5 : 2,
                      fontSize: isMobile ? '0.8rem' : undefined,
                    }}
                  >
                    {getTemplateDescription(template.key)}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 'medium',
                      fontSize: isMobile ? '0.8rem' : undefined,
                    }}
                  >
                    {t('templates.content')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      bgcolor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.100',
                      p: isMobile ? 0.75 : 1,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                  >
                    {template.body}
                  </Typography>

                  {template.hasLink && (
                    <Chip
                      label={t('templates.hasLink')}
                      size="small"
                      color="info"
                      sx={{ mt: 1 }}
                      icon={<Code fontSize="small" />}
                    />
                  )}

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 1,
                      fontSize: isMobile ? '0.7rem' : undefined,
                      wordBreak: 'break-all',
                    }}
                  >
                    {t('templates.key')}: {template.key}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 1 }}>
          {t('templates.noTemplates')}
        </Alert>
      )}

      {/* Test Template Dialog - uses improved TestNotificationForm */}
      <Dialog
        open={testDialogOpen}
        onClose={() => {
          setTestDialogOpen(false);
          setSelectedTemplate(null);
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.125rem' : undefined }}>
          {t('templates.testDialog.title')}
        </DialogTitle>
        <DialogContent>
          <TestNotificationForm
            templates={templates}
            onTest={handleTest}
            onCancel={() => {
              setTestDialogOpen(false);
              setSelectedTemplate(null);
            }}
            isLoading={isTesting}
            initialTemplateKey={selectedTemplate?.key || ''}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <Box component="form" onSubmit={handleSaveTemplate}>
          <DialogTitle sx={{ fontSize: isMobile ? '1.125rem' : undefined }}>
            {selectedTemplate
              ? t('templates.editDialog.editTitle')
              : t('templates.editDialog.createTitle')}
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2, fontSize: isMobile ? '0.875rem' : undefined }}>
              {t('templates.editDialog.warning')}
            </Alert>

            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label={t('templates.editDialog.keyLabel')}
                value={editFormData.key}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, key: e.target.value }))}
                placeholder={t('templates.editDialog.keyPlaceholder')}
                disabled={!!selectedTemplate}
                helperText={t('templates.editDialog.keyHelper')}
                size={isMobile ? 'small' : 'medium'}
              />

              <TextField
                fullWidth
                label={t('templates.editDialog.titleLabel')}
                value={editFormData.title}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder={t('templates.editDialog.titlePlaceholder')}
                helperText={t('templates.editDialog.titleHelper')}
                size={isMobile ? 'small' : 'medium'}
              />

              <TextField
                fullWidth
                label={t('templates.editDialog.bodyLabel')}
                value={editFormData.body}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, body: e.target.value }))}
                placeholder={t('templates.editDialog.bodyPlaceholder')}
                multiline
                rows={isMobile ? 3 : 4}
                helperText={t('templates.editDialog.bodyHelper')}
                size={isMobile ? 'small' : 'medium'}
              />

              <Alert severity="info" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                {t('templates.editDialog.availableVariables')}
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
            <Button
              type="button"
              onClick={handleCloseEditDialog}
              size={isMobile ? 'small' : 'medium'}
            >
              {t('templates.actions.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                isCreating ||
                isUpdating ||
                !editFormData.key?.trim() ||
                !editFormData.title?.trim() ||
                !editFormData.body?.trim()
              }
              size={isMobile ? 'small' : 'medium'}
            >
              {isCreating || isUpdating
                ? t('forms.saving')
                : selectedTemplate
                ? t('templates.actions.update')
                : t('templates.actions.create')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

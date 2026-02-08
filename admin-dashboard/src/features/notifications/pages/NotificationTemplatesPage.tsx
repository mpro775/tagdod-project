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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
import { NotificationTemplate, NotificationType } from '../types/notification.types';
import { TestNotificationForm } from '../components/TestNotificationForm';
import { translateApiValidationErrors } from '../utils/apiErrorTranslations';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const KEY_MAX = 100;
const TITLE_MAX = 200;
const MESSAGE_MAX = 1000;

interface EditFormData {
  key: string;
  title: string;
  message: string;
  messageEn: string;
  type: string;
}

const DEFAULT_EDIT_FORM: EditFormData = {
  key: '',
  title: '',
  message: '',
  messageEn: '',
  type: NotificationType.ORDER_CONFIRMED,
};

export const NotificationTemplatesPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>(DEFAULT_EDIT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: templates = [], isLoading } = useNotificationTemplates();
  const { mutate: testNotification, isPending: isTesting } = useTestNotification();
  const { mutate: createTemplate, isPending: isCreating } = useCreateTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplate();

  useEffect(() => {
    if (editDialogOpen) {
      setFormErrors({});
      if (selectedTemplate) {
        setEditFormData({
          key: selectedTemplate.key || selectedTemplate.id || '',
          title: selectedTemplate.title || selectedTemplate.name || '',
          message:
            selectedTemplate.message || selectedTemplate.body || selectedTemplate.description || '',
          messageEn: selectedTemplate.messageEn || selectedTemplate.description || '',
          type: selectedTemplate.type || NotificationType.ORDER_CONFIRMED,
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

  const validateForm = (): boolean => {
    const err: Record<string, string> = {};
    const key = editFormData.key.trim();
    const title = editFormData.title.trim();
    const message = editFormData.message.trim();
    const messageEn = editFormData.messageEn.trim();

    if (!key) err.key = t('templates.validation.keyRequired');
    else if (key.length > KEY_MAX) err.key = t('templates.validation.keyMax', { max: KEY_MAX });

    if (!title) err.title = t('templates.validation.titleRequired');
    else if (title.length > TITLE_MAX)
      err.title = t('templates.validation.titleMax', { max: TITLE_MAX });

    if (!message) err.message = t('templates.validation.messageRequired');
    else if (message.length > MESSAGE_MAX)
      err.message = t('templates.validation.messageMax', { max: MESSAGE_MAX });

    if (!messageEn) err.messageEn = t('templates.validation.messageEnRequired');
    else if (messageEn.length > MESSAGE_MAX)
      err.messageEn = t('templates.validation.messageEnMax', { max: MESSAGE_MAX });

    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (selectedTemplate) {
      updateTemplate(
        {
          key: selectedTemplate.key || selectedTemplate.id || '',
          data: {
            title: editFormData.title,
            message: editFormData.message,
            messageEn: editFormData.messageEn,
            type: editFormData.type,
          },
        },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setSelectedTemplate(null);
            setEditFormData(DEFAULT_EDIT_FORM);
          },
          onError: (err) => {
            if (err instanceof AxiosError) {
              const msg = err.response?.data?.error?.message;
              toast.error(translateApiValidationErrors(msg || ''));
            } else {
              toast.error('حدث خطأ عند تحديث القالب');
            }
          },
        }
      );
    } else {
      createTemplate(
        {
          key: editFormData.key,
          title: editFormData.title,
          message: editFormData.message,
          messageEn: editFormData.messageEn,
          type: editFormData.type,
        },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setSelectedTemplate(null);
            setEditFormData(DEFAULT_EDIT_FORM);
          },
          onError: (err) => {
            if (err instanceof AxiosError) {
              const msg = err.response?.data?.error?.message;
              toast.error(translateApiValidationErrors(msg || ''));
            } else {
              toast.error('حدث خطأ عند إنشاء القالب');
            }
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

  const getTemplateDescription = (template: NotificationTemplate) => {
    const desc = template.description || template.body || template.message;
    if (desc) return desc;
    const key = template.key || template.id;
    if (!key || typeof key !== 'string') return t('templates.descriptions.custom');
    const translationKey = `templates.descriptions.${key}`;
    const translated = t(translationKey);
    return translated !== translationKey ? translated : t('templates.descriptions.custom');
  };

  const getTemplateCategory = (template: NotificationTemplate) => {
    const cat = template.category;
    if (typeof cat === 'string') {
      if (cat === 'order') return 'order';
      if (cat === 'payment') return 'payment';
      if (cat === 'shipping') return 'shipping';
      if (cat === 'support') return 'support';
    }
    return cat || 'order';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'order':
        return 'primary';
      case 'payment':
        return 'success';
      case 'shipping':
        return 'info';
      case 'support':
        return 'warning';
      default:
        return 'default';
    }
  };

  const TEMPLATE_CATEGORIES = [
    { value: 'order', label: t('templates.categories.order') },
    { value: 'payment', label: t('templates.categories.payment') },
    { value: 'shipping', label: t('templates.categories.shipping') },
    { value: 'support', label: t('templates.categories.support') },
  ];

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
                        {template.name || template.title}
                      </Typography>
                      <Chip
                        label={
                          TEMPLATE_CATEGORIES.find((c) => c.value === getTemplateCategory(template))
                            ?.label || getTemplateCategory(template)
                        }
                        size="small"
                        color={getCategoryColor(getTemplateCategory(template)) as any}
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
                    {getTemplateDescription(template)}
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
                    {t('templates.key')}: {template.key || template.id}
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

            {Object.keys(formErrors).length > 0 && (
              <Alert severity="error" sx={{ mb: 2, fontSize: isMobile ? '0.875rem' : undefined }}>
                {Object.values(formErrors).map((err, i) => (
                  <Typography key={i} component="div" variant="body2">
                    • {err}
                  </Typography>
                ))}
              </Alert>
            )}

            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label={t('templates.editDialog.keyLabel')}
                value={editFormData.key}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    key: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                  }))
                }
                placeholder={t('templates.editDialog.keyPlaceholder')}
                disabled={!!selectedTemplate}
                helperText={
                  formErrors.key ||
                  `${t('templates.editDialog.keyHelper')} (${KEY_MAX} ${t(
                    'templates.validation.charsMax'
                  )})`
                }
                error={!!formErrors.key}
                inputProps={{ maxLength: KEY_MAX }}
                size={isMobile ? 'small' : 'medium'}
              />

              <TextField
                fullWidth
                label={t('templates.editDialog.titleLabel')}
                value={editFormData.title}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder={t('templates.editDialog.titlePlaceholder')}
                helperText={formErrors.title || `${editFormData.title.length}/${TITLE_MAX}`}
                error={!!formErrors.title}
                inputProps={{ maxLength: TITLE_MAX }}
                size={isMobile ? 'small' : 'medium'}
              />

              <TextField
                fullWidth
                label={t('templates.editDialog.bodyLabel')}
                value={editFormData.message}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, message: e.target.value }))}
                placeholder={t('templates.editDialog.bodyPlaceholder')}
                multiline
                rows={isMobile ? 3 : 4}
                helperText={
                  formErrors.message ||
                  `${t('templates.editDialog.bodyHelper')} (${MESSAGE_MAX} ${t(
                    'templates.validation.charsMax'
                  )})`
                }
                error={!!formErrors.message}
                inputProps={{ maxLength: MESSAGE_MAX }}
                size={isMobile ? 'small' : 'medium'}
              />

              <TextField
                fullWidth
                label={t('templates.editDialog.bodyEnLabel')}
                value={editFormData.messageEn}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, messageEn: e.target.value }))
                }
                placeholder={t('templates.editDialog.bodyEnPlaceholder')}
                multiline
                rows={isMobile ? 2 : 3}
                helperText={
                  formErrors.messageEn || `${editFormData.messageEn.length}/${MESSAGE_MAX}`
                }
                error={!!formErrors.messageEn}
                inputProps={{ maxLength: MESSAGE_MAX }}
                size={isMobile ? 'small' : 'medium'}
              />

              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>{t('templates.editDialog.typeLabel')}</InputLabel>
                <Select
                  value={editFormData.type}
                  label={t('templates.editDialog.typeLabel')}
                  onChange={(e: { target: { value: string } }) =>
                    setEditFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  {Object.values(NotificationType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {t(`types.${type}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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
                !editFormData.message?.trim() ||
                !editFormData.messageEn?.trim()
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

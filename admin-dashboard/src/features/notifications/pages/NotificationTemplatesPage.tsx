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
  FormGroup,
  FormControlLabel,
  Checkbox,
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

const NAME_MAX = 100;
const KEY_MAX = 100;
const TITLE_MAX = 200;
const MESSAGE_MAX = 1000;
const DESCRIPTION_MAX = 1000;

/** API category values - must match backend enum */
const API_CATEGORIES = [
  'order',
  'product',
  'service',
  'promotion',
  'account',
  'system',
  'support',
  'payment',
  'marketing',
] as const;

const DEFAULT_CHANNELS = {
  inApp: true,
  push: true,
  sms: false,
  email: false,
};

interface EditFormData {
  key: string;
  name: string;
  title: string;
  message: string;
  messageEn: string;
  type: string;
  category: string;
  description: string;
  channels: {
    inApp: boolean;
    push: boolean;
    sms: boolean;
    email: boolean;
  };
}

const DEFAULT_EDIT_FORM: EditFormData = {
  key: '',
  name: '',
  title: '',
  message: '',
  messageEn: '',
  type: NotificationType.SUPPORT_MESSAGE_RECEIVED,
  category: 'support',
  description: '',
  channels: { ...DEFAULT_CHANNELS },
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
        const ch = selectedTemplate.channels as any;
        setEditFormData({
          key: selectedTemplate.key || selectedTemplate.id || '',
          name: selectedTemplate.name || selectedTemplate.title || '',
          title: selectedTemplate.title || selectedTemplate.name || '',
          message: selectedTemplate.message || selectedTemplate.body || '',
          messageEn: selectedTemplate.messageEn || selectedTemplate.body || '',
          type: (selectedTemplate.type as string) || NotificationType.SUPPORT_MESSAGE_RECEIVED,
          category: (selectedTemplate.category as string) || 'support',
          description: selectedTemplate.description || '',
          channels: {
            inApp: ch?.inApp ?? true,
            push: ch?.push ?? true,
            sms: ch?.sms ?? false,
            email: ch?.email ?? false,
          },
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
    const name = editFormData.name.trim();
    const key = editFormData.key.trim();
    const title = editFormData.title.trim();
    const message = editFormData.message.trim();
    const messageEn = editFormData.messageEn.trim();

    if (!selectedTemplate && !key) err.key = t('templates.validation.keyRequired');
    else if (key.length > KEY_MAX) err.key = t('templates.validation.keyMax', { max: KEY_MAX });

    if (!name) err.name = t('templates.validation.nameRequired');
    else if (name.length > NAME_MAX)
      err.name = t('templates.validation.nameMax', { max: NAME_MAX });

    if (!selectedTemplate && !title) err.title = t('templates.validation.titleRequired');
    else if (title.length > TITLE_MAX)
      err.title = t('templates.validation.titleMax', { max: TITLE_MAX });

    if (!message) err.message = t('templates.validation.messageRequired');
    else if (message.length > MESSAGE_MAX)
      err.message = t('templates.validation.messageMax', { max: MESSAGE_MAX });

    if (!messageEn) err.messageEn = t('templates.validation.messageEnRequired');
    else if (messageEn.length > MESSAGE_MAX)
      err.messageEn = t('templates.validation.messageEnMax', { max: MESSAGE_MAX });

    if (!editFormData.category) err.category = t('templates.validation.categoryRequired');

    if (editFormData.description.length > DESCRIPTION_MAX)
      err.description = t('templates.validation.descriptionMax', { max: DESCRIPTION_MAX });

    const hasChannel =
      editFormData.channels.inApp ||
      editFormData.channels.push ||
      editFormData.channels.sms ||
      editFormData.channels.email;
    if (!hasChannel) err.channels = t('templates.validation.channelsRequired');

    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const templateKey = selectedTemplate?.key || selectedTemplate?.id || editFormData.key;

    if (selectedTemplate) {
      updateTemplate(
        {
          key: templateKey,
          data: {
            name: editFormData.name,
            title: editFormData.title,
            message: editFormData.message,
            messageEn: editFormData.messageEn,
            category: editFormData.category,
            description: editFormData.description || undefined,
            channels: editFormData.channels,
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
          key: editFormData.key.trim(),
          name: editFormData.name,
          title: editFormData.title,
          message: editFormData.message,
          messageEn: editFormData.messageEn,
          type: editFormData.type,
          category: editFormData.category,
          channels: editFormData.channels,
          description: editFormData.description || undefined,
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
    if (typeof cat === 'string' && API_CATEGORIES.includes(cat as any)) return cat;
    return (cat as string) || 'order';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'order':
        return 'primary';
      case 'payment':
        return 'success';
      case 'product':
      case 'service':
        return 'info';
      case 'support':
        return 'warning';
      case 'promotion':
      case 'marketing':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const CATEGORY_LABELS: Record<string, string> = {
    order: t('templates.categories.order'),
    product: t('templates.categories.product'),
    service: t('templates.categories.service'),
    promotion: t('templates.categories.promotion'),
    account: t('templates.categories.account'),
    system: t('templates.categories.system'),
    support: t('templates.categories.support'),
    payment: t('templates.categories.payment'),
    marketing: t('templates.categories.marketing'),
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
                        {template.name || template.title}
                      </Typography>
                      <Chip
                        label={
                          CATEGORY_LABELS[getTemplateCategory(template)] ||
                          getTemplateCategory(template)
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
                    {template.body || template.message}
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
            initialTemplateKey={selectedTemplate?.key || selectedTemplate?.id || ''}
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
              {!selectedTemplate && (
                <TextField
                  fullWidth
                  label={t('templates.editDialog.keyLabel')}
                  value={editFormData.key}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      key: e.target.value.replace(/\s/g, '-').toLowerCase(),
                    }))
                  }
                  placeholder={t('templates.editDialog.keyPlaceholder')}
                  helperText={formErrors.key || (t('templates.editDialog.keyHelper') as string)}
                  error={!!formErrors.key}
                  inputProps={{ maxLength: KEY_MAX }}
                  size={isMobile ? 'small' : 'medium'}
                />
              )}

              <TextField
                fullWidth
                label={t('templates.editDialog.nameLabel')}
                value={editFormData.name}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={t('templates.editDialog.namePlaceholder')}
                helperText={
                  formErrors.name ||
                  `${editFormData.name.length}/${NAME_MAX} ${t('templates.validation.charsMax')}`
                }
                error={!!formErrors.name}
                inputProps={{ maxLength: NAME_MAX }}
                size={isMobile ? 'small' : 'medium'}
              />

              <TextField
                fullWidth
                label={t('templates.editDialog.titleLabel')}
                value={editFormData.title}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder={t('templates.editDialog.titlePlaceholder')}
                helperText={
                  formErrors.title ||
                  `${editFormData.title.length}/${TITLE_MAX} ${t('templates.validation.charsMax')}`
                }
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
                helperText={
                  formErrors.message ||
                  `${editFormData.message.length}/${MESSAGE_MAX} ${t(
                    'templates.validation.charsMax'
                  )}`
                }
                error={!!formErrors.message}
                multiline
                rows={2}
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
                helperText={
                  formErrors.messageEn ||
                  `${editFormData.messageEn.length}/${MESSAGE_MAX} ${t(
                    'templates.validation.charsMax'
                  )}`
                }
                error={!!formErrors.messageEn}
                multiline
                rows={2}
                inputProps={{ maxLength: MESSAGE_MAX }}
                size={isMobile ? 'small' : 'medium'}
              />

              {!selectedTemplate && (
                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>{t('templates.editDialog.typeLabel')}</InputLabel>
                  <Select
                    value={editFormData.type}
                    label={t('templates.editDialog.typeLabel')}
                    onChange={(e: { target: { value: string } }) =>
                      setEditFormData((prev) => ({ ...prev, type: e.target.value }))
                    }
                  >
                    {Object.values(NotificationType).map((typeVal) => (
                      <MenuItem key={typeVal} value={typeVal}>
                        {typeVal}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>{t('templates.editDialog.categoryLabel')}</InputLabel>
                <Select
                  value={editFormData.category}
                  label={t('templates.editDialog.categoryLabel')}
                  onChange={(e: { target: { value: string } }) =>
                    setEditFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                >
                  {API_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat] || cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl component="fieldset" error={!!formErrors.channels}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t('filters.channel')}
                </Typography>
                {formErrors.channels && (
                  <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
                    {formErrors.channels}
                  </Typography>
                )}
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editFormData.channels.inApp}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            channels: { ...prev.channels, inApp: e.target.checked },
                          }))
                        }
                      />
                    }
                    label={t('analytics.channels.inapp')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editFormData.channels.push}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            channels: { ...prev.channels, push: e.target.checked },
                          }))
                        }
                      />
                    }
                    label={t('analytics.channels.push')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editFormData.channels.sms}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            channels: { ...prev.channels, sms: e.target.checked },
                          }))
                        }
                      />
                    }
                    label={t('analytics.channels.sms')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editFormData.channels.email}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            channels: { ...prev.channels, email: e.target.checked },
                          }))
                        }
                      />
                    }
                    label={t('analytics.channels.email')}
                  />
                </FormGroup>
              </FormControl>

              <TextField
                fullWidth
                label={t('templates.editDialog.descriptionLabel')}
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder={t('templates.editDialog.descriptionPlaceholder')}
                multiline
                rows={isMobile ? 3 : 4}
                helperText={
                  formErrors.description ||
                  `${editFormData.description.length}/${DESCRIPTION_MAX} ${t(
                    'templates.validation.charsMax'
                  )}`
                }
                error={!!formErrors.description}
                inputProps={{ maxLength: DESCRIPTION_MAX }}
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
                !editFormData.name?.trim() ||
                !editFormData.title?.trim() ||
                !editFormData.message?.trim() ||
                !editFormData.messageEn?.trim() ||
                !editFormData.category?.trim() ||
                (!selectedTemplate && !editFormData.key?.trim()) ||
                !(
                  editFormData.channels.inApp ||
                  editFormData.channels.push ||
                  editFormData.channels.sms ||
                  editFormData.channels.email
                )
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

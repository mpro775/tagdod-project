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
import { NotificationTemplate } from '../types/notification.types';
import { TestNotificationForm } from '../components/TestNotificationForm';
import { translateApiValidationErrors } from '../utils/apiErrorTranslations';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const NAME_MAX = 100;
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

interface EditFormData {
  name: string;
  category: string;
  description: string;
}

const DEFAULT_EDIT_FORM: EditFormData = {
  name: '',
  category: 'order',
  description: '',
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
          name: selectedTemplate.name || selectedTemplate.title || '',
          category: (selectedTemplate.category as string) || 'order',
          description:
            selectedTemplate.description || selectedTemplate.body || selectedTemplate.message || '',
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

    if (!name) err.name = t('templates.validation.nameRequired');
    else if (name.length > NAME_MAX)
      err.name = t('templates.validation.nameMax', { max: NAME_MAX });

    if (!editFormData.category) err.category = t('templates.validation.categoryRequired');

    if (editFormData.description.length > DESCRIPTION_MAX)
      err.description = t('templates.validation.descriptionMax', { max: DESCRIPTION_MAX });

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
            name: editFormData.name,
            category: editFormData.category,
            description: editFormData.description,
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
          name: editFormData.name,
          category: editFormData.category,
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
                !editFormData.category?.trim()
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

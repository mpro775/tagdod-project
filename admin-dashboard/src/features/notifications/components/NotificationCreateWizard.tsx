import React, { useState, useEffect } from 'react';
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
  Typography,
  Stepper,
  Step,
  StepLabel,
  Collapse,
} from '@mui/material';
import { Navigation, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  CreateNotificationDto,
  NotificationTemplate,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationCategory,
  NotificationNavigationType,
  NOTIFICATION_NAVIGATION_TYPE_OPTIONS,
} from '../types/notification.types';
import { getCategoryLabel, getNotificationTypeLabel } from './notificationHelpers';
import { NotificationUserSelector } from './NotificationUserSelector';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { productsApi } from '@/features/products/api/productsApi';
import { ordersApi } from '@/features/orders/api/ordersApi';

interface NotificationCreateWizardProps {
  templates: NotificationTemplate[];
  onSave: (data: CreateNotificationDto) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const STEPS = ['step1', 'step2', 'step3', 'step4'];

export const NotificationCreateWizard: React.FC<NotificationCreateWizardProps> = ({
  templates,
  onSave,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [activeStep, setActiveStep] = useState(0);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
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
    navigationType: NotificationNavigationType.NONE,
    navigationTarget: '',
    navigationParams: {},
    data: {},
  });

  const { data: categories = [] } = useCategories({ isActive: true });
  const [products, setProducts] = useState<Array<{ _id: string; name: string }>>([]);
  const [orders, setOrders] = useState<Array<{ _id: string; orderNumber?: string }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (formData.navigationType === NotificationNavigationType.PRODUCT) loadProducts();
  }, [formData.navigationType]);

  useEffect(() => {
    if (formData.navigationType === NotificationNavigationType.ORDER) loadOrders();
  }, [formData.navigationType]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productsApi.list({ page: 1, limit: 100, status: 'active' as any });
      const productsData = Array.isArray(response.data) ? response.data : [];
      setProducts(productsData.map((p: any) => ({ _id: p._id, name: p.name || p.nameAr || '' })));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await ordersApi.list({ page: 1, limit: 100 });
      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(
        ordersData.map((o: any) => ({
          _id: o._id,
          orderNumber: o.orderNumber || o._id,
        }))
      );
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleTemplateChange = (templateKey: string) => {
    const template = templates.find((tmpl) => (tmpl.key || tmpl.id) === templateKey);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        templateKey,
        title: template.title || template.name,
        message: template.message || template.body || template.description || '',
        messageEn: template.messageEn || '',
        category: template.category as NotificationCategory,
      }));
    }
  };

  const handleUserIdsChange = (userIds: string[]) => {
    setSelectedUserIds(userIds);
    setFormData((prev) => ({ ...prev, recipientId: userIds.join(',') }));
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const canProceedStep2 = !!formData.title?.trim() && !!formData.message?.trim();
  const canProceedStep3 = selectedUserIds.length > 0;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stepper
        activeStep={activeStep}
        sx={{ mb: 3 }}
        orientation={isMobile ? 'vertical' : 'horizontal'}
      >
        {STEPS.map((key, index) => (
          <Step key={key} completed={activeStep > index}>
            <StepLabel>{t(`wizard.${key}`)}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 1: Template & Type */}
      {activeStep === 0 && (
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
                  <MenuItem value={NotificationChannel.DASHBOARD}>
                    {t('channels.DASHBOARD')}
                  </MenuItem>
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
        </Stack>
      )}

      {/* Step 2: Content */}
      {activeStep === 1 && (
        <Stack spacing={3}>
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
        </Stack>
      )}

      {/* Step 3: Recipients */}
      {activeStep === 2 && (
        <Stack spacing={3}>
          <NotificationUserSelector
            selectedUserIds={selectedUserIds}
            onUserIdsChange={handleUserIdsChange}
            disabled={isLoading}
          />
        </Stack>
      )}

      {/* Step 4: Advanced Options */}
      {activeStep === 3 && (
        <Stack spacing={3}>
          <Button
            variant="text"
            onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
            startIcon={advancedOptionsOpen ? <ExpandLess /> : <ExpandMore />}
            sx={{ justifyContent: 'flex-start' }}
          >
            <Navigation sx={{ mr: 1 }} />
            {t('wizard.advancedOptions')}
          </Button>

          <Collapse in={advancedOptionsOpen}>
            <Stack spacing={3} sx={{ pl: 2, borderLeft: 2, borderColor: 'divider' }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t('forms.navigationType', 'نوع التنقل')}</InputLabel>
                    <Select
                      value={formData.navigationType || NotificationNavigationType.NONE}
                      onChange={(e) => {
                        const newType = e.target.value as NotificationNavigationType;
                        setFormData((prev) => {
                          const {
                            categoryId,
                            productId,
                            orderId,
                            section,
                            externalUrl,
                            serviceRequestId,
                            ...restData
                          } = (prev.data || {}) as Record<string, unknown>;
                          return {
                            ...prev,
                            navigationType: newType,
                            navigationTarget: '',
                            data: restData,
                          };
                        });
                      }}
                      label={t('forms.navigationType', 'نوع التنقل')}
                      disabled={isLoading}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      {NOTIFICATION_NAVIGATION_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {formData.navigationType &&
                  formData.navigationType !== NotificationNavigationType.NONE && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      {formData.navigationType === NotificationNavigationType.CATEGORY && (
                        <FormControl fullWidth>
                          <InputLabel>{t('forms.navigationTarget', 'الفئة')}</InputLabel>
                          <Select
                            value={formData.navigationTarget || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                navigationTarget: value,
                                data: { ...prev.data, categoryId: value },
                              }));
                            }}
                            label={t('forms.navigationTarget', 'الفئة')}
                            disabled={isLoading}
                            size={isMobile ? 'small' : 'medium'}
                          >
                            {categories.map((cat) => (
                              <MenuItem key={cat._id} value={cat._id}>
                                {cat.name} {cat.nameEn ? `(${cat.nameEn})` : ''}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      {formData.navigationType === NotificationNavigationType.PRODUCT && (
                        <FormControl fullWidth>
                          <InputLabel>{t('forms.navigationTarget', 'المنتج')}</InputLabel>
                          <Select
                            value={formData.navigationTarget || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                navigationTarget: value,
                                data: { ...prev.data, productId: value },
                              }));
                            }}
                            label={t('forms.navigationTarget', 'المنتج')}
                            disabled={isLoading || loadingProducts}
                            size={isMobile ? 'small' : 'medium'}
                          >
                            {products.map((prod) => (
                              <MenuItem key={prod._id} value={prod._id}>
                                {prod.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      {formData.navigationType === NotificationNavigationType.ORDER && (
                        <FormControl fullWidth>
                          <InputLabel>{t('forms.navigationTarget', 'الطلب')}</InputLabel>
                          <Select
                            value={formData.navigationTarget || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                navigationTarget: value,
                                data: { ...prev.data, orderId: value },
                              }));
                            }}
                            label={t('forms.navigationTarget', 'الطلب')}
                            disabled={isLoading || loadingOrders}
                            size={isMobile ? 'small' : 'medium'}
                          >
                            {orders.map((order) => (
                              <MenuItem key={order._id} value={order._id}>
                                {order.orderNumber || order._id}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      {formData.navigationType === NotificationNavigationType.SECTION && (
                        <TextField
                          fullWidth
                          label={t('forms.navigationTarget', 'اسم القسم')}
                          value={formData.navigationTarget || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              navigationTarget: value,
                              data: { ...prev.data, section: value },
                            }));
                          }}
                          placeholder="products, categories, cart, etc."
                          disabled={isLoading}
                          size={isMobile ? 'small' : 'medium'}
                          helperText={t('forms.navigationTargetHelper', 'اسم القسم في التطبيق')}
                        />
                      )}

                      {formData.navigationType === NotificationNavigationType.EXTERNAL_URL && (
                        <TextField
                          fullWidth
                          label={t('forms.navigationTarget', 'الرابط الخارجي')}
                          value={formData.navigationTarget || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              navigationTarget: value,
                              data: { ...prev.data, externalUrl: value },
                            }));
                          }}
                          placeholder="https://example.com"
                          disabled={isLoading}
                          size={isMobile ? 'small' : 'medium'}
                          helperText={t('forms.navigationTargetHelper', 'رابط خارجي')}
                        />
                      )}

                      {formData.navigationType === NotificationNavigationType.SERVICE_REQUEST && (
                        <TextField
                          fullWidth
                          label={t('forms.navigationTarget', 'معرّف طلب الخدمة')}
                          value={formData.navigationTarget || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              navigationTarget: value,
                              data: { ...prev.data, serviceRequestId: value },
                            }));
                          }}
                          placeholder="6123456789abcdef01234567"
                          disabled={isLoading}
                          size={isMobile ? 'small' : 'medium'}
                          helperText={t(
                            'forms.serviceRequestIdHelper',
                            'معرّف طلب الخدمة (ObjectId)'
                          )}
                        />
                      )}
                    </Grid>
                  )}
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('forms.recipientEmail')}
                    value={formData.recipientEmail}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, recipientEmail: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, recipientPhone: e.target.value }))
                    }
                    disabled={isLoading}
                    size={isMobile ? 'small' : 'medium'}
                    helperText={t('forms.recipientPhoneHelper', 'اختياري - للرسائل النصية')}
                    aria-label={t('forms.recipientPhone')}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Collapse>

          {!advancedOptionsOpen && (
            <Typography variant="body2" color="text.secondary">
              {t('wizard.advancedOptionsHint')}
            </Typography>
          )}
        </Stack>
      )}

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 3,
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={activeStep === 0 ? onCancel : handleBack}
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            aria-label={activeStep === 0 ? t('templates.actions.cancel') : t('wizard.back')}
          >
            {activeStep === 0 ? t('templates.actions.cancel') : t('wizard.back')}
          </Button>
          {activeStep < 3 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                isLoading ||
                (activeStep === 1 && !canProceedStep2) ||
                (activeStep === 2 && !canProceedStep3)
              }
              size={isMobile ? 'small' : 'medium'}
              aria-label={t('wizard.next')}
            >
              {t('wizard.next')}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              size={isMobile ? 'small' : 'medium'}
              aria-label={t('forms.create')}
            >
              {isLoading ? t('forms.creating') : t('forms.create')}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

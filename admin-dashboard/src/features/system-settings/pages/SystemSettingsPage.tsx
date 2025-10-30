import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import {
  Settings,
  Save,
  Email,
  CreditCard,
  LocalShipping,
  Security,
  Notifications,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { systemSettingsApi } from '../api/systemSettingsApi';
import type { SystemSetting } from '../api/systemSettingsApi';
import { toast } from 'react-hot-toast';

export function SystemSettingsPage() {
  const { t } = useTranslation('systemSettings');
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const allSettings = await systemSettingsApi.getAllSettings();

      const settingsMap: Record<string, any> = {};
      allSettings.forEach((setting: SystemSetting) => {
        settingsMap[setting.key] = setting.value;
      });

      setSettings(settingsMap);
    } catch {
      toast.error(t('messages.loadFailed', { defaultValue: 'فشل تحميل البيانات' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      await systemSettingsApi.bulkUpdate(settings);
      toast.success(t('messages.saved', { defaultValue: 'تم حفظ البيانات' }));
    } catch {
      toast.error(t('messages.saveFailed', { defaultValue: 'فشل حفظ البيانات' }));
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          {t('messages.loading', { defaultValue: 'جاري تحميل البيانات' })}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('systemSettings.title', { defaultValue: 'الإعدادات' })}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('systemSettings.subtitle', { defaultValue: 'الإعدادات العامة للنظام' } )}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<Settings />} iconPosition="start" label={t('tabs.general', { defaultValue: 'عام' }  )} />
          <Tab icon={<Email />} iconPosition="start" label={t('tabs.email', { defaultValue: 'البريد' })} />
          <Tab icon={<CreditCard />} iconPosition="start" label={t('tabs.payment', { defaultValue: 'الدفع' })} />
          <Tab icon={<LocalShipping />} iconPosition="start" label={t('tabs.shipping', { defaultValue: 'الشحن' })} />
          <Tab icon={<Security />} iconPosition="start" label={t('tabs.security', { defaultValue: 'الأمان' })} />
          <Tab icon={<Notifications />} iconPosition="start" label={t('tabs.notifications', { defaultValue: 'الإشعارات' })} />
        </Tabs>
      </Box>

        {/* General Settings */}
        {activeTab === 0 && (
          <Card>
            <CardHeader>
              <Typography variant="h6" fontWeight="bold">
                {t('sections.general.title', { defaultValue: 'الإعدادات العامة' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('sections.general.subtitle', { defaultValue: 'الإعدادات العامة للنظام' })}
              </Typography>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label={t('sections.general.siteName', { defaultValue: 'اسم الموقع' })}
                  value={settings.site_name || ''}
                  onChange={(e) => updateSetting('site_name', e.target.value)}
                  placeholder={t('placeholders.siteName')}
                  fullWidth
                />

                <TextField
                  label={t('sections.general.siteDescription', { defaultValue: 'وصف الموقع' })}
                  value={settings.site_description || ''}
                  onChange={(e) => updateSetting('site_description', e.target.value)}
                  placeholder={t('placeholders.siteDescription')}
                  fullWidth
                />

                <Grid container spacing={2}>
                  <Grid component="div" size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t('sections.general.defaultLanguage', { defaultValue: 'اللغة الافتراضية' })}
                      value={settings.default_language || ''}
                      onChange={(e) => updateSetting('default_language', e.target.value)}
                      placeholder={t('placeholders.defaultLanguage')}
                      fullWidth
                    />
                  </Grid>

                  <Grid component="div" size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t('sections.general.defaultCurrency', { defaultValue: 'العملة الافتراضية' })}
                      value={settings.default_currency || ''}
                      onChange={(e) => updateSetting('default_currency', e.target.value)}
                      placeholder={t('placeholders.defaultCurrency')}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <TextField
                  label={t('sections.general.timezone', { defaultValue: 'الوقت المنطقي' })}
                  value={settings.timezone || ''}
                  onChange={(e) => updateSetting('timezone', e.target.value)}
                  placeholder={t('placeholders.timezone')}
                  fullWidth
                />

                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.maintenance_mode || false}
                        onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">{t('sections.general.maintenanceMode', { defaultValue: 'الصيانة' })}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('sections.general.maintenanceModeDesc', { defaultValue: 'الصيانة المنطقية' })}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {settings.maintenance_mode && (
                  <TextField
                    label={t('sections.general.maintenanceMessage', { defaultValue: 'رسالة الصيانة' } )}
                    value={settings.maintenance_message || ''}
                    onChange={(e) => updateSetting('maintenance_message', e.target.value)}
                    placeholder={t('placeholders.maintenanceMessage')}
                    fullWidth
                  />
                )}

                <Divider />

                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={<Save />}
                >
                  {t('buttons.save', { defaultValue: 'حفظ' })}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Email Settings */}
        {activeTab === 1 && (
          <Card>
            <CardHeader>
              <Typography variant="h6" fontWeight="bold">
                {t('sections.email.title', { defaultValue: 'الإعدادات البريدية' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('sections.email.subtitle', { defaultValue: 'الإعدادات البريدية للنظام' })}
              </Typography>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Grid container spacing={2}>
                  <Grid component="div" size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t('sections.email.smtpHost', { defaultValue: 'SMTP Host' })}
                      value={settings.smtp_host || ''}
                      onChange={(e) => updateSetting('smtp_host', e.target.value)}
                      placeholder="smtp.gmail.com"
                      fullWidth
                    />
                  </Grid>

                  <Grid component="div" size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t('sections.email.smtpPort', { defaultValue: 'SMTP Port' })}
                      type="number"
                      value={settings.smtp_port || ''}
                      onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                      placeholder="587"
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <TextField
                  label={t('sections.email.smtpUser', { defaultValue: 'SMTP User' })}
                  value={settings.smtp_user || ''}
                  onChange={(e) => updateSetting('smtp_user', e.target.value)}
                  placeholder="user@example.com"
                  fullWidth
                />

                <TextField
                  label={t('sections.email.smtpPassword', { defaultValue: 'SMTP Password' })}
                  type="password"
                  value={settings.smtp_password || ''}
                  onChange={(e) => updateSetting('smtp_password', e.target.value)}
                  placeholder="••••••••"
                  fullWidth
                />

                <Grid container spacing={2}>
                  <Grid component="div" size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t('sections.email.fromEmail', { defaultValue: 'بريد المرسل' })}
                      value={settings.from_email || ''}
                      onChange={(e) => updateSetting('from_email', e.target.value)}
                      placeholder="noreply@tagdod.com"
                      fullWidth
                    />
                  </Grid>

                  <Grid component="div" size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t('sections.email.fromName', { defaultValue: 'اسم المرسل' })}
                      value={settings.from_name || ''}
                      onChange={(e) => updateSetting('from_name', e.target.value)}
                      placeholder="TagDoD"
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.smtp_secure || false}
                        onChange={(e) => updateSetting('smtp_secure', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">{t('sections.email.smtpSecure', { defaultValue: 'SMTP Secure (TLS)' })}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('sections.email.smtpSecureDesc', { defaultValue: 'استخدام اتصال آمن' })}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Divider />

                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={<Save />}
                >
                  {t('buttons.save', { defaultValue: 'حفظ' }    )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Payment Settings */}
        {activeTab === 2 && (
          <Card>
            <CardHeader>
              <Typography variant="h6" fontWeight="bold">
                {t('sections.payment.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('sections.payment.subtitle')}
              </Typography>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.cod_enabled || false}
                        onChange={(e) => updateSetting('cod_enabled', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">الدفع عند الاستلام (COD)</Typography>
                        <Typography variant="body2" color="text.secondary">
                          تفعيل خيار الدفع عند الاستلام
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.card_enabled || false}
                        onChange={(e) => updateSetting('card_enabled', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">الدفع بالبطاقات</Typography>
                        <Typography variant="body2" color="text.secondary">
                          تفعيل الدفع بالبطاقات الائتمانية
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {settings.card_enabled && (
                  <>
                    <TextField
                      label="Stripe Public Key"
                      value={settings.stripe_public_key || ''}
                      onChange={(e) => updateSetting('stripe_public_key', e.target.value)}
                      placeholder="pk_..."
                      fullWidth
                    />

                    <TextField
                      label="Stripe Secret Key"
                      type="password"
                      value={settings.stripe_secret_key || ''}
                      onChange={(e) => updateSetting('stripe_secret_key', e.target.value)}
                      placeholder="sk_..."
                      fullWidth
                    />
                  </>
                )}

                <TextField
                  label="رسوم الدفع (%)"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  value={settings.payment_fee_percentage || ''}
                  onChange={(e) => updateSetting('payment_fee_percentage', parseFloat(e.target.value))}
                  placeholder="2.5"
                  fullWidth
                />

                <Divider />

                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={<Save />}
                >
                  {t('buttons.save', { defaultValue: 'حفظ' }    )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Shipping Settings */}
        {activeTab === 3 && (
          <Card>
            <CardHeader>
              <Typography variant="h6" fontWeight="bold">
                {t('sections.shipping.title', { defaultValue: 'الإعدادات الشحنية' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('sections.shipping.subtitle', { defaultValue: 'الإعدادات الشحنية للنظام' })}
              </Typography>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.free_shipping_enabled || false}
                        onChange={(e) => updateSetting('free_shipping_enabled', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">{t('sections.shipping.freeShipping', { defaultValue: 'الشحن المجاني' })}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('sections.shipping.freeShippingDesc', { defaultValue: 'تفعيل الشحن المجاني' })}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {settings.free_shipping_enabled && (
                  <TextField
                    label={t('sections.shipping.freeShippingThreshold', { defaultValue: 'الحد الأدنى للشحن المجاني (دولار)' })}
                    type="number"
                    value={settings.free_shipping_threshold || ''}
                    onChange={(e) => updateSetting('free_shipping_threshold', parseInt(e.target.value))}
                    placeholder="100000"
                    fullWidth
                  />
                )}

                <TextField
                  label={t('sections.shipping.defaultShippingCost', { defaultValue: 'تكلفة الشحن الافتراضية (دولار)' })}
                  type="number"
                  value={settings.default_shipping_cost || ''}
                  onChange={(e) => updateSetting('default_shipping_cost', parseInt(e.target.value))}
                  placeholder="5000"
                  fullWidth
                />

                <TextField
                  label={t('sections.shipping.estimatedDeliveryDays', { defaultValue: 'مدة التوصيل المتوقعة (أيام)' })}
                  type="number"
                  value={settings.estimated_delivery_days || ''}
                  onChange={(e) => updateSetting('estimated_delivery_days', parseInt(e.target.value))}
                  placeholder="3"
                  fullWidth
                />

                <Divider />

                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={<Save />}
                >
                  {t('buttons.save', { defaultValue: 'حفظ' }    )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === 4 && (
          <Card>
            <CardHeader>
              <Typography variant="h6" fontWeight="bold">
                {t('sections.security.title', { defaultValue: 'الإعدادات الأمنية' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('sections.security.subtitle', { defaultValue: 'الإعدادات الأمنية للنظام' })}
              </Typography>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.force_2fa || false}
                        onChange={(e) => updateSetting('force_2fa', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">{t('sections.security.2fa', { defaultValue: 'المصادقة الثنائية (2FA)' })}     </Typography>
                        <Typography variant="body2" color="text.secondary">
                          إجبار المصادقة الثنائية لجميع المستخدمين
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <TextField
                  label="مدة صلاحية الجلسة (دقائق)"
                  type="number"
                  value={settings.session_timeout || ''}
                  onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                  placeholder="60"
                  fullWidth
                />

                <TextField
                  label="الحد الأقصى لمحاولات الدخول"
                  type="number"
                  value={settings.max_login_attempts || ''}
                  onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
                  placeholder="5"
                  fullWidth
                />

                <TextField
                  label="مدة الحظر بعد الفشل (دقائق)"
                  type="number"
                  value={settings.lockout_duration || ''}
                  onChange={(e) => updateSetting('lockout_duration', parseInt(e.target.value))}
                  placeholder="15"
                  fullWidth
                />

                <Divider />

                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={<Save />}
                >
                  {t('buttons.save', { defaultValue: 'حفظ' }    )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Notifications Settings */}
        {activeTab === 5 && (
          <Card>
            <CardHeader>
              <Typography variant="h6" fontWeight="bold">
                {t('sections.notifications.title', { defaultValue: 'الإعدادات الإشعارية' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('sections.notifications.subtitle', { defaultValue: 'الإعدادات الإشعارية للنظام' })}
              </Typography>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.email_notifications_enabled || false}
                        onChange={(e) => updateSetting('email_notifications_enabled', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">{t('sections.notifications.emailNotifications', { defaultValue: 'إشعارات البريد الإلكتروني' })}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('sections.notifications.emailNotificationsDesc', { defaultValue: 'تفعيل الإشعارات عبر البريد' })}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.sms_notifications_enabled || false}
                        onChange={(e) => updateSetting('sms_notifications_enabled', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">{t('sections.notifications.smsNotifications', { defaultValue: 'إشعارات SMS' })}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('sections.notifications.smsNotificationsDesc', { defaultValue: 'تفعيل الإشعارات عبر الرسائل النصية' })}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.push_notifications_enabled || false}
                        onChange={(e) => updateSetting('push_notifications_enabled', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">{t('sections.notifications.pushNotifications', { defaultValue: 'إشعارات Push' })}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('sections.notifications.pushNotificationsDesc', { defaultValue: 'تفعيل الإشعارات الفورية' })}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notify_new_orders || false}
                        onChange={(e) => updateSetting('notify_new_orders', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">{t('sections.notifications.newOrdersNotification', { defaultValue: 'إشعار الطلبات الجديدة' })}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('sections.notifications.newOrdersNotificationDesc', { defaultValue: 'إشعار عند استلام طلب جديد' })}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notify_low_stock || false}
                        onChange={(e) => updateSetting('notify_low_stock', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">{t('sections.notifications.lowStockNotification', { defaultValue: 'إشعار المخزون المنخفض' })} </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('sections.notifications.lowStockNotificationDesc', { defaultValue: 'إشعار عند انخفاض المخزون' })}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Divider />

                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={<Save />}
                >
                  {t('buttons.save', { defaultValue: 'حفظ' }      )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
    </Box>
  );
}

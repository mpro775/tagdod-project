import { useState, useEffect } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
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
  Stack,
  Paper,
} from '@mui/material';
import {
  Settings,
  Save,
  Email,
  CreditCard,
  LocalShipping,
  Security,
  Notifications,
  AccountBalance,
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { systemSettingsApi, localPaymentAccountsApi } from '../api/systemSettingsApi';
import type {
  SystemSetting,
  LocalPaymentAccount,
  GroupedPaymentAccount,
  CreatePaymentAccountDto,
  MediaReference,
} from '../api/systemSettingsApi';
import { toast } from 'react-hot-toast';
import { alpha } from '@mui/material/styles';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/shared/components';
import { MediaPicker } from '@/features/media/components/MediaPicker';
import type { Media } from '@/features/media/types/media.types';
import { MediaCategory, MediaType } from '@/features/media/types/media.types';

export function SystemSettingsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation('systemSettings');
  const { confirmDialog, dialogProps } = useConfirmDialog();
  
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Payment Accounts State
  const [paymentAccounts, setPaymentAccounts] = useState<GroupedPaymentAccount[]>([]);
  const [allAccounts, setAllAccounts] = useState<LocalPaymentAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<LocalPaymentAccount | null>(null);
  const [accountForm, setAccountForm] = useState<CreatePaymentAccountDto>({
    providerName: '',
    iconMediaId: null,
    accountNumber: '',
    type: 'bank',
    currency: 'YER',
    isActive: true,
    displayOrder: 0,
  });
  const [selectedIcon, setSelectedIcon] = useState<MediaReference | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

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
      toast.error(t('messages.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 3) {
      fetchPaymentAccounts();
    }
  }, [activeTab]);

  const fetchPaymentAccounts = async () => {
    try {
      setAccountsLoading(true);
      const [grouped, all] = await Promise.all([
        localPaymentAccountsApi.getGroupedAccounts(),
        localPaymentAccountsApi.getAllAccounts(),
      ]);
      setPaymentAccounts(grouped);
      setAllAccounts(all);
    } catch {
      toast.error(t('sections.localPaymentAccounts.loadFailed'));
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleOpenAccountDialog = (account?: LocalPaymentAccount) => {
    if (account) {
      setEditingAccount(account);
      const iconRef = account.icon ?? (account.iconMediaId ? {
        id: account.iconMediaId,
        url: '',
        name: account.providerName,
      } : null);
      setAccountForm({
        providerName: account.providerName,
        iconMediaId: account.icon?.id ?? account.iconMediaId ?? null,
        accountNumber: account.accountNumber,
        type: account.type,
        currency: account.currency,
        isActive: account.isActive,
        notes: account.notes,
        displayOrder: account.displayOrder,
      });
      setSelectedIcon(iconRef);
    } else {
      setEditingAccount(null);
      setAccountForm({
        providerName: '',
        iconMediaId: null,
        accountNumber: '',
        type: 'bank',
        currency: 'YER',
        isActive: true,
        displayOrder: 0,
      });
      setSelectedIcon(null);
    }
    setAccountDialogOpen(true);
  };

  const handleCloseAccountDialog = () => {
    setAccountDialogOpen(false);
    setEditingAccount(null);
    setSelectedIcon(null);
    setIconPickerOpen(false);
  };

  const handleIconSelect = (media: Media | Media[]) => {
    const selected = Array.isArray(media) ? media[0] : media;
    if (!selected) return;

    const reference: MediaReference = {
      id: selected._id,
      url: selected.url,
      name: selected.name,
    };

    setSelectedIcon(reference);
    setAccountForm((prev) => ({
      ...prev,
      iconMediaId: reference.id,
    }));
  };

  const handleRemoveIcon = () => {
    setSelectedIcon(null);
    setAccountForm((prev) => ({
      ...prev,
      iconMediaId: null,
    }));
  };

  const handleSaveAccount = async () => {
    try {
      if (editingAccount) {
        await localPaymentAccountsApi.updateAccount(editingAccount._id, accountForm);
        toast.success(t('sections.localPaymentAccounts.accountUpdated'));
      } else {
        await localPaymentAccountsApi.createAccount(accountForm);
        toast.success(t('sections.localPaymentAccounts.accountAdded'));
      }
      handleCloseAccountDialog();
      fetchPaymentAccounts();
    } catch {
      toast.error(t('sections.localPaymentAccounts.saveFailed'));
    }
  };

  const handleDeleteAccount = async (id: string) => {
    const confirmed = await confirmDialog({
      title: t('sections.localPaymentAccounts.deleteTitle', 'تأكيد الحذف'),
      message: t('sections.localPaymentAccounts.deleteConfirm'),
      type: 'warning',
      confirmColor: 'error',
    });
    if (!confirmed) return;
    
    try {
      await localPaymentAccountsApi.deleteAccount(id);
      toast.success(t('sections.localPaymentAccounts.accountDeleted'));
      fetchPaymentAccounts();
    } catch {
      toast.error(t('sections.localPaymentAccounts.deleteFailed'));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await systemSettingsApi.bulkUpdate(settings);
      toast.success(t('messages.saved'));
    } catch {
      toast.error(t('messages.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          {t('messages.loading')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" gutterBottom>
          {t('systemSettings.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('systemSettings.subtitle')}
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderBottom: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)} 
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-scrollButtons': {
              color: 'text.secondary',
            },
          }}
        >
          <Tab 
            icon={<Settings />} 
            iconPosition={isMobile ? 'top' : 'start'} 
            label={t('tabs.general')}
            sx={{ minHeight: isMobile ? 72 : 48 }}
          />
          <Tab 
            icon={<Email />} 
            iconPosition={isMobile ? 'top' : 'start'} 
            label={t('tabs.email')}
            sx={{ minHeight: isMobile ? 72 : 48 }}
          />
          <Tab 
            icon={<CreditCard />} 
            iconPosition={isMobile ? 'top' : 'start'} 
            label={t('tabs.payment')}
            sx={{ minHeight: isMobile ? 72 : 48 }}
          />
          <Tab 
            icon={<AccountBalance />} 
            iconPosition={isMobile ? 'top' : 'start'} 
            label={t('tabs.localPaymentAccounts')}
            sx={{ minHeight: isMobile ? 72 : 48 }}
          />
          <Tab 
            icon={<LocalShipping />} 
            iconPosition={isMobile ? 'top' : 'start'} 
            label={t('tabs.shipping')}
            sx={{ minHeight: isMobile ? 72 : 48 }}
          />
          <Tab 
            icon={<Security />} 
            iconPosition={isMobile ? 'top' : 'start'} 
            label={t('tabs.security')}
            sx={{ minHeight: isMobile ? 72 : 48 }}
          />
          <Tab 
            icon={<Notifications />} 
            iconPosition={isMobile ? 'top' : 'start'} 
            label={t('tabs.notifications')}
            sx={{ minHeight: isMobile ? 72 : 48 }}
          />
        </Tabs>
      </Paper>

      {/* General Settings */}
      {activeTab === 0 && (
        <Card sx={{ bgcolor: 'background.paper' }}>
          <CardHeader>
            <Typography variant="h6" fontWeight="bold">
              {t('sections.general.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('sections.general.subtitle')}
            </Typography>
          </CardHeader>
          <CardContent>
            <Stack spacing={3}>
              <TextField
                label={t('sections.general.siteName')}
                value={settings.site_name || ''}
                onChange={(e) => updateSetting('site_name', e.target.value)}
                placeholder={t('placeholders.siteName')}
                fullWidth
              />

              <TextField
                label={t('sections.general.siteDescription')}
                value={settings.site_description || ''}
                onChange={(e) => updateSetting('site_description', e.target.value)}
                placeholder={t('placeholders.siteDescription')}
                fullWidth
                multiline
                rows={2}
              />

              <Grid container spacing={2}>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={t('sections.general.defaultLanguage')}
                    value={settings.default_language || ''}
                    onChange={(e) => updateSetting('default_language', e.target.value)}
                    placeholder={t('placeholders.defaultLanguage')}
                    fullWidth
                  />
                </Grid>

                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={t('sections.general.defaultCurrency')}
                    value={settings.default_currency || ''}
                    onChange={(e) => updateSetting('default_currency', e.target.value)}
                    placeholder={t('placeholders.defaultCurrency')}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <TextField
                label={t('sections.general.timezone')}
                value={settings.timezone || ''}
                onChange={(e) => updateSetting('timezone', e.target.value)}
                placeholder={t('placeholders.timezone')}
                fullWidth
              />

              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenance_mode || false}
                      onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {t('sections.general.maintenanceMode')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('sections.general.maintenanceModeDesc')}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              {settings.maintenance_mode && (
                <TextField
                  label={t('sections.general.maintenanceMessage')}
                  value={settings.maintenance_message || ''}
                  onChange={(e) => updateSetting('maintenance_message', e.target.value)}
                  placeholder={t('placeholders.maintenanceMessage')}
                  fullWidth
                  multiline
                  rows={2}
                />
              )}

              <Divider />

              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={<Save />}
                fullWidth={isMobile}
                size="large"
              >
                {saving ? t('messages.saving') : t('buttons.save')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Email Settings */}
      {activeTab === 1 && (
        <Card sx={{ bgcolor: 'background.paper' }}>
          <CardHeader>
            <Typography variant="h6" fontWeight="bold">
              {t('sections.email.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('sections.email.subtitle')}
            </Typography>
          </CardHeader>
          <CardContent>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={t('sections.email.smtpHost')}
                    value={settings.smtp_host || ''}
                    onChange={(e) => updateSetting('smtp_host', e.target.value)}
                    placeholder={t('placeholders.smtpHost')}
                    fullWidth
                  />
                </Grid>

                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={t('sections.email.smtpPort')}
                    type="number"
                    value={settings.smtp_port || ''}
                    onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                    placeholder={t('placeholders.smtpPort')}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <TextField
                label={t('sections.email.smtpUser')}
                value={settings.smtp_user || ''}
                onChange={(e) => updateSetting('smtp_user', e.target.value)}
                placeholder={t('placeholders.smtpUser')}
                fullWidth
              />

              <TextField
                label={t('sections.email.smtpPassword')}
                type="password"
                value={settings.smtp_password || ''}
                onChange={(e) => updateSetting('smtp_password', e.target.value)}
                placeholder={t('placeholders.smtpPassword')}
                fullWidth
              />

              <Grid container spacing={2}>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={t('sections.email.fromEmail')}
                    value={settings.from_email || ''}
                    onChange={(e) => updateSetting('from_email', e.target.value)}
                    placeholder={t('placeholders.fromEmail')}
                    fullWidth
                  />
                </Grid>

                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={t('sections.email.fromName')}
                    value={settings.from_name || ''}
                    onChange={(e) => updateSetting('from_name', e.target.value)}
                    placeholder={t('placeholders.fromName')}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smtp_secure || false}
                      onChange={(e) => updateSetting('smtp_secure', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {t('sections.email.smtpSecure')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('sections.email.smtpSecureDesc')}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <Divider />

              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={<Save />}
                fullWidth={isMobile}
                size="large"
              >
                {saving ? t('messages.saving') : t('buttons.save')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Payment Settings */}
      {activeTab === 2 && (
        <Card sx={{ bgcolor: 'background.paper' }}>
          <CardHeader>
            <Typography variant="h6" fontWeight="bold">
              {t('sections.payment.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('sections.payment.subtitle')}
            </Typography>
          </CardHeader>
          <CardContent>
            <Stack spacing={3}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.cod_enabled || false}
                      onChange={(e) => updateSetting('cod_enabled', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {t('sections.payment.codEnabled')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('sections.payment.codEnabledDesc')}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.card_enabled || false}
                      onChange={(e) => updateSetting('card_enabled', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {t('sections.payment.cardEnabled')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('sections.payment.cardEnabledDesc')}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              {settings.card_enabled && (
                <Stack spacing={2}>
                  <TextField
                    label={t('sections.payment.stripePublicKey')}
                    value={settings.stripe_public_key || ''}
                    onChange={(e) => updateSetting('stripe_public_key', e.target.value)}
                    placeholder={t('placeholders.stripePublicKey')}
                    fullWidth
                  />

                  <TextField
                    label={t('sections.payment.stripeSecretKey')}
                    type="password"
                    value={settings.stripe_secret_key || ''}
                    onChange={(e) => updateSetting('stripe_secret_key', e.target.value)}
                    placeholder={t('placeholders.stripeSecretKey')}
                    fullWidth
                  />
                </Stack>
              )}

              <TextField
                label={t('sections.payment.paymentFeePercentage')}
                type="number"
                inputProps={{ step: '0.01' }}
                value={settings.payment_fee_percentage || ''}
                onChange={(e) => updateSetting('payment_fee_percentage', parseFloat(e.target.value))}
                placeholder={t('placeholders.paymentFeePercentage')}
                fullWidth
              />

              <Divider />

              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={<Save />}
                fullWidth={isMobile}
                size="large"
              >
                {saving ? t('messages.saving') : t('buttons.save')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Shipping Settings */}
      {activeTab === 4 && (
        <Card sx={{ bgcolor: 'background.paper' }}>
          <CardHeader>
            <Typography variant="h6" fontWeight="bold">
              {t('sections.shipping.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('sections.shipping.subtitle')}
            </Typography>
          </CardHeader>
          <CardContent>
            <Stack spacing={3}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.free_shipping_enabled || false}
                      onChange={(e) => updateSetting('free_shipping_enabled', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {t('sections.shipping.freeShippingEnabled')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('sections.shipping.freeShippingEnabledDesc')}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              {settings.free_shipping_enabled && (
                <TextField
                  label={t('sections.shipping.freeShippingThreshold')}
                  type="number"
                  value={settings.free_shipping_threshold || ''}
                  onChange={(e) => updateSetting('free_shipping_threshold', parseInt(e.target.value))}
                  placeholder={t('placeholders.freeShippingThreshold')}
                  fullWidth
                />
              )}

              <TextField
                label={t('sections.shipping.defaultShippingCost')}
                type="number"
                value={settings.default_shipping_cost || ''}
                onChange={(e) => updateSetting('default_shipping_cost', parseInt(e.target.value))}
                placeholder={t('placeholders.defaultShippingCost')}
                fullWidth
              />

              <TextField
                label={t('sections.shipping.estimatedDeliveryDays')}
                type="number"
                value={settings.estimated_delivery_days || ''}
                onChange={(e) => updateSetting('estimated_delivery_days', parseInt(e.target.value))}
                placeholder={t('placeholders.estimatedDeliveryDays')}
                fullWidth
              />

              <Divider />

              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={<Save />}
                fullWidth={isMobile}
                size="large"
              >
                {saving ? t('messages.saving') : t('buttons.save')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Security Settings */}
      {activeTab === 5 && (
        <Card sx={{ bgcolor: 'background.paper' }}>
          <CardHeader>
            <Typography variant="h6" fontWeight="bold">
              {t('sections.security.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('sections.security.subtitle')}
            </Typography>
          </CardHeader>
          <CardContent>
            <Stack spacing={3}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.force_2fa || false}
                      onChange={(e) => updateSetting('force_2fa', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {t('sections.security.force2FA')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('sections.security.force2FADesc')}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <TextField
                label={t('sections.security.sessionTimeout')}
                type="number"
                value={settings.session_timeout || ''}
                onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                placeholder={t('placeholders.sessionTimeout')}
                fullWidth
              />

              <TextField
                label={t('sections.security.maxLoginAttempts')}
                type="number"
                value={settings.max_login_attempts || ''}
                onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
                placeholder={t('placeholders.maxLoginAttempts')}
                fullWidth
              />

              <TextField
                label={t('sections.security.lockoutDuration')}
                type="number"
                value={settings.lockout_duration || ''}
                onChange={(e) => updateSetting('lockout_duration', parseInt(e.target.value))}
                placeholder={t('placeholders.lockoutDuration')}
                fullWidth
              />

              <Divider />

              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={<Save />}
                fullWidth={isMobile}
                size="large"
              >
                {saving ? t('messages.saving') : t('buttons.save')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Payment Accounts */}
      {activeTab === 3 && (
        <Card sx={{ bgcolor: 'background.paper' }}>
          <CardHeader
            title={t('sections.localPaymentAccounts.title')}
            subheader={t('sections.localPaymentAccounts.subtitle')}
            action={
              !isMobile && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenAccountDialog()}
                >
                  {t('sections.localPaymentAccounts.addAccount')}
                </Button>
              )
            }
          />
          {isMobile && (
            <Box sx={{ px: 2, pb: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Add />}
                onClick={() => handleOpenAccountDialog()}
              >
                {t('sections.localPaymentAccounts.addAccount')}
              </Button>
            </Box>
          )}
          <CardContent>
            {accountsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : paymentAccounts.length === 0 ? (
              <Alert severity="info">{t('sections.localPaymentAccounts.noAccounts')}</Alert>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ minWidth: 150 }}>{t('sections.localPaymentAccounts.providerName')}</TableCell>
                        <TableCell>{t('sections.localPaymentAccounts.type')}</TableCell>
                        {!isMobile && <TableCell>{t('sections.localPaymentAccounts.accounts')}</TableCell>}
                        <TableCell align="right" sx={{ minWidth: isMobile ? 100 : 120 }}>
                          {t('sections.localPaymentAccounts.actions')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paymentAccounts.map((group) => (
                        <TableRow key={group.providerName}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {group.icon?.url && (
                                <Avatar src={group.icon.url} sx={{ width: 32, height: 32 }} />
                              )}
                              <Typography variant="body1" fontWeight="medium">
                                {group.providerName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={t(`sections.localPaymentAccounts.${group.type}`)}
                              color={group.type === 'bank' ? 'primary' : 'secondary'}
                              size="small"
                            />
                          </TableCell>
                          {!isMobile && (
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {group.accounts.map((account) => (
                                  <Box key={account.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      label={account.currency}
                                      size="small"
                                      variant="outlined"
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                      {account.accountNumber}
                                    </Typography>
                                    {!account.isActive && (
                                      <Chip 
                                        label={t('sections.localPaymentAccounts.inactive')} 
                                        size="small" 
                                        color="error" 
                                      />
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            </TableCell>
                          )}
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {group.accounts.map((account) => {
                                const fullAccount = allAccounts.find((a) => a._id === account.id);
                                if (!fullAccount) return null;
                                return (
                                  <Box key={account.id} sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenAccountDialog(fullAccount)}
                                      color="primary"
                                    >
                                      <Edit />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteAccount(account.id)}
                                      color="error"
                                    >
                                      <Delete />
                                    </IconButton>
                                  </Box>
                                );
                              })}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notifications Settings */}
      {activeTab === 6 && (
        <Card sx={{ bgcolor: 'background.paper' }}>
          <CardHeader>
            <Typography variant="h6" fontWeight="bold">
              {t('sections.notifications.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('sections.notifications.subtitle')}
            </Typography>
          </CardHeader>
          <CardContent>
            <Stack spacing={3}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email_notifications_enabled || false}
                      onChange={(e) => updateSetting('email_notifications_enabled', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {t('sections.notifications.emailNotificationsEnabled')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('sections.notifications.emailNotificationsEnabledDesc')}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.sms_notifications_enabled || false}
                      onChange={(e) => updateSetting('sms_notifications_enabled', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {t('sections.notifications.smsNotificationsEnabled')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('sections.notifications.smsNotificationsEnabledDesc')}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.push_notifications_enabled || false}
                      onChange={(e) => updateSetting('push_notifications_enabled', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {t('sections.notifications.pushNotificationsEnabled')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('sections.notifications.pushNotificationsEnabledDesc')}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notify_new_orders || false}
                      onChange={(e) => updateSetting('notify_new_orders', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {t('sections.notifications.notifyNewOrders')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('sections.notifications.notifyNewOrdersDesc')}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notify_low_stock || false}
                      onChange={(e) => updateSetting('notify_low_stock', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {t('sections.notifications.notifyLowStock')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('sections.notifications.notifyLowStockDesc')}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <Divider />

              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={<Save />}
                fullWidth={isMobile}
                size="large"
              >
                {saving ? t('messages.saving') : t('buttons.save')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Account Dialog */}
      <Dialog 
        open={accountDialogOpen} 
        onClose={handleCloseAccountDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingAccount ? t('sections.localPaymentAccounts.editAccount') : t('sections.localPaymentAccounts.addAccount')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <TextField
              label={t('sections.localPaymentAccounts.providerNameLabel')}
              value={accountForm.providerName}
              onChange={(e) => setAccountForm({ ...accountForm, providerName: e.target.value })}
              fullWidth
              required
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2">
                {t('sections.localPaymentAccounts.iconLabel')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 2,
                }}
              >
                <Avatar
                  src={selectedIcon?.url}
                  sx={{ width: 56, height: 56 }}
                >
                  {!selectedIcon && accountForm.providerName?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setIconPickerOpen(true)}
                    size="small"
                  >
                    {selectedIcon
                      ? t('sections.localPaymentAccounts.changeIcon')
                      : t('sections.localPaymentAccounts.selectIcon')}
                  </Button>
                  {selectedIcon && (
                    <Button
                      variant="text"
                      color="error"
                      onClick={handleRemoveIcon}
                      size="small"
                    >
                      {t('sections.localPaymentAccounts.removeIcon')}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>

            <FormControl fullWidth>
              <InputLabel>{t('sections.localPaymentAccounts.type')}</InputLabel>
              <Select
                value={accountForm.type}
                onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value as 'bank' | 'wallet' })}
                label={t('sections.localPaymentAccounts.type')}
              >
                <MenuItem value="bank">{t('sections.localPaymentAccounts.bank')}</MenuItem>
                <MenuItem value="wallet">{t('sections.localPaymentAccounts.wallet')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t('sections.localPaymentAccounts.accountNumber')}
              value={accountForm.accountNumber}
              onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel>{t('sections.localPaymentAccounts.currency')}</InputLabel>
              <Select
                value={accountForm.currency}
                onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value as 'YER' | 'SAR' | 'USD' })}
                label={t('sections.localPaymentAccounts.currency')}
              >
                <MenuItem value="YER">{t('sections.localPaymentAccounts.currencyYER')}</MenuItem>
                <MenuItem value="SAR">{t('sections.localPaymentAccounts.currencySAR')}</MenuItem>
                <MenuItem value="USD">{t('sections.localPaymentAccounts.currencyUSD')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t('sections.localPaymentAccounts.displayOrder')}
              type="number"
              value={accountForm.displayOrder || 0}
              onChange={(e) => setAccountForm({ ...accountForm, displayOrder: parseInt(e.target.value) || 0 })}
              fullWidth
            />

            <TextField
              label={t('sections.localPaymentAccounts.notesLabel')}
              value={accountForm.notes || ''}
              onChange={(e) => setAccountForm({ ...accountForm, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={accountForm.isActive ?? true}
                  onChange={(e) => setAccountForm({ ...accountForm, isActive: e.target.checked })}
                />
              }
              label={t('sections.localPaymentAccounts.isActive')}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseAccountDialog} fullWidth={isMobile}>
            {t('buttons.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAccount}
            disabled={!accountForm.providerName || !accountForm.accountNumber}
            fullWidth={isMobile}
          >
            {editingAccount ? t('buttons.save') : t('buttons.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog {...dialogProps} />
      <MediaPicker
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={handleIconSelect}
        acceptTypes={[MediaType.IMAGE]}
        category={MediaCategory.OTHER}
        showFilters={false}
        title={t('sections.localPaymentAccounts.iconPickerTitle')}
      />
    </Box>
  );
}

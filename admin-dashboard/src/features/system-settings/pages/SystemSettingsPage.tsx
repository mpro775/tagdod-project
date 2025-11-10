import { useState, useEffect, useMemo } from 'react';
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
  Checkbox,
  FormGroup,
  FormHelperText,
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
import { useTranslation } from 'react-i18next';
import { systemSettingsApi, localPaymentAccountsApi } from '../api/systemSettingsApi';
import type {
  SystemSetting,
  LocalPaymentAccount,
  GroupedPaymentAccount,
  CreatePaymentAccountDto,
  MediaReference,
  CurrencyCode,
  PaymentAccountNumberingMode,
  ProviderAccountInput,
  PaymentAccountType,
} from '../api/systemSettingsApi';
import { toast } from 'react-hot-toast';
import { alpha } from '@mui/material/styles';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/shared/components';
import { MediaPicker } from '@/features/media/components/MediaPicker';
import type { Media } from '@/features/media/types/media.types';
import { MediaCategory, MediaType } from '@/features/media/types/media.types';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import type {
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
  GridSortModel,
  GridValidRowModel,
} from '@mui/x-data-grid';

const CURRENCY_OPTIONS: CurrencyCode[] = ['YER', 'SAR', 'USD'];

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
  type PaymentProviderForm = Omit<CreatePaymentAccountDto, 'accounts' | 'supportedCurrencies'> & {
    numberingMode: PaymentAccountNumberingMode;
    supportedCurrencies: CurrencyCode[];
    accounts: ProviderAccountInput[];
  };

type PaymentProviderRow = GridValidRowModel & {
  id: string;
  providerName: string;
  type: PaymentAccountType;
  numberingMode: PaymentAccountNumberingMode;
  sharedAccountNumber?: string;
  supportedCurrencies: CurrencyCode[];
  accounts: GroupedPaymentAccount['accounts'];
  icon?: MediaReference;
  isActive: boolean;
  displayOrder: number;
  notes?: string;
  provider?: LocalPaymentAccount;
};

  const createDefaultForm = (): PaymentProviderForm => ({
    providerName: '',
    iconMediaId: null,
    type: 'bank',
    numberingMode: 'shared',
    sharedAccountNumber: '',
    supportedCurrencies: ['YER'],
    accounts: [],
    isActive: true,
    notes: '',
    displayOrder: 0,
  });
  const [accountForm, setAccountForm] = useState<PaymentProviderForm>(createDefaultForm());
  const [selectedIcon, setSelectedIcon] = useState<MediaReference | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleOpenAccountDialog = (provider?: LocalPaymentAccount) => {
    if (provider) {
      setEditingAccount(provider);
      const iconRef: MediaReference | null =
        provider.icon ??
        (provider.iconMediaId
          ? {
              id: provider.iconMediaId,
              url: '',
              name: provider.providerName,
            }
          : null);
      setAccountForm({
        providerName: provider.providerName,
        iconMediaId: provider.iconMediaId ?? null,
        type: provider.type,
        numberingMode: provider.numberingMode,
        sharedAccountNumber: provider.sharedAccountNumber ?? '',
        supportedCurrencies: provider.supportedCurrencies.length
          ? provider.supportedCurrencies
          : ['YER'],
        accounts: provider.accounts.map((item) => ({
          id: item.id,
          currency: item.currency,
          accountNumber: item.accountNumber,
          isActive: item.isActive,
          displayOrder: item.displayOrder,
          notes: item.notes,
        })),
        isActive: provider.isActive,
        notes: provider.notes,
        displayOrder: provider.displayOrder,
      });
      setSelectedIcon(iconRef);
    } else {
      setEditingAccount(null);
      setAccountForm(createDefaultForm());
      setSelectedIcon(null);
    }
    setAccountDialogOpen(true);
  };

  const handleCloseAccountDialog = () => {
    setAccountDialogOpen(false);
    setEditingAccount(null);
    setSelectedIcon(null);
    setIconPickerOpen(false);
    setAccountForm(createDefaultForm());
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

  const createEmptyAccountRow = (currency: CurrencyCode): ProviderAccountInput => ({
    currency,
    accountNumber: '',
    isActive: true,
    displayOrder: 0,
    notes: '',
  });

  const getAvailableCurrencies = (ignoreIndex?: number): CurrencyCode[] => {
    const used = accountForm.accounts
      .filter((_, idx) => idx !== ignoreIndex)
      .map((item) => item.currency);
    const baseList =
      accountForm.numberingMode === 'shared'
        ? accountForm.supportedCurrencies
        : CURRENCY_OPTIONS;
    return baseList.filter((currency) => !used.includes(currency));
  };

  const handleAddAccountRow = () => {
    const available = getAvailableCurrencies();
    if (!available.length) {
      return;
    }
    setAccountForm((prev) => ({
      ...prev,
      accounts: [...prev.accounts, createEmptyAccountRow(available[0])],
    }));
  };

  const handleUpdateAccountRow = (
    index: number,
    updates: Partial<ProviderAccountInput>,
  ) => {
    setAccountForm((prev) => {
      const next = [...prev.accounts];
      next[index] = { ...next[index], ...updates };
      return { ...prev, accounts: next };
    });
  };

  const handleRemoveAccountRow = (index: number) => {
    setAccountForm((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((_, idx) => idx !== index),
    }));
  };

  const handleNumberingModeChange = (mode: PaymentAccountNumberingMode) => {
    setAccountForm((prev) => {
      const accounts =
        mode === 'per_currency' && prev.accounts.length === 0
          ? [createEmptyAccountRow('YER')]
          : prev.accounts;
      return {
        ...prev,
        numberingMode: mode,
        sharedAccountNumber: mode === 'shared' ? (prev.sharedAccountNumber ?? '') : undefined,
        supportedCurrencies:
          mode === 'shared'
            ? prev.supportedCurrencies.length
              ? prev.supportedCurrencies
              : ['YER']
            : prev.supportedCurrencies,
        accounts,
      };
    });
  };

  const toggleSupportedCurrency = (currency: CurrencyCode) => {
    setAccountForm((prev) => {
      const exists = prev.supportedCurrencies.includes(currency);
      if (exists && prev.supportedCurrencies.length === 1) {
        return prev;
      }
      const nextSupported = exists
        ? prev.supportedCurrencies.filter((item) => item !== currency)
        : [...prev.supportedCurrencies, currency];
      if (!nextSupported.length) {
        return prev;
      }
      const nextAccounts =
        prev.numberingMode === 'shared'
          ? prev.accounts.filter((account) =>
              nextSupported.includes(account.currency),
            )
          : prev.accounts;
      return {
        ...prev,
        supportedCurrencies: nextSupported,
        accounts: nextAccounts,
      };
    });
  };

  const providerRows: PaymentProviderRow[] = useMemo(() => {
    return paymentAccounts.map((group) => {
      const provider = allAccounts.find((item) => item._id === group.providerId);
      const providerId = group.providerId ?? provider?._id ?? group.providerName;
      return {
        id: providerId,
        providerName: group.providerName,
        type: group.type,
        numberingMode: group.numberingMode,
        sharedAccountNumber: group.sharedAccountNumber,
        supportedCurrencies: group.supportedCurrencies,
        accounts: group.accounts,
        icon: group.icon ?? provider?.icon,
        isActive: provider?.isActive ?? true,
        displayOrder: provider?.displayOrder ?? 0,
        notes: provider?.notes,
        provider,
      };
    });
  }, [paymentAccounts, allAccounts]);

  const normalizedSearchQuery = useMemo(
    () => searchQuery.trim().toLowerCase(),
    [searchQuery],
  );

  const filteredRows = useMemo(() => {
    if (!normalizedSearchQuery) {
      return providerRows;
    }

    return providerRows.filter((row) => {
      const haystack = [
        row.providerName,
        row.sharedAccountNumber ?? '',
        row.supportedCurrencies.join(' '),
        row.accounts.map((account) => account.accountNumber).join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedSearchQuery);
    });
  }, [normalizedSearchQuery, providerRows]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const isSharedMode = accountForm.numberingMode === 'shared';
  const isPerCurrencyMode = accountForm.numberingMode === 'per_currency';
  const hasSharedRequirements =
    !isSharedMode ||
    (Boolean(accountForm.sharedAccountNumber && accountForm.sharedAccountNumber.trim().length) &&
      accountForm.supportedCurrencies.length > 0);
  const hasPerCurrencyRequirements =
    !isPerCurrencyMode ||
    (accountForm.accounts.length > 0 &&
      accountForm.accounts.every((account) => account.accountNumber.trim().length > 0));
  const isSaveDisabled =
    !accountForm.providerName.trim() || !hasSharedRequirements || !hasPerCurrencyRequirements;

  const normalizeAccountsForPayload = (): ProviderAccountInput[] => {
    return accountForm.accounts
      .map((account) => ({
        ...account,
        accountNumber: account.accountNumber.trim(),
        notes: account.notes?.trim() || undefined,
        displayOrder: Number.isFinite(account.displayOrder)
          ? account.displayOrder ?? 0
          : 0,
        isActive: account.isActive ?? true,
      }))
      .filter((account) => account.accountNumber.length > 0);
  };

  const buildPayload = (): CreatePaymentAccountDto => {
    const payload: CreatePaymentAccountDto = {
      providerName: accountForm.providerName.trim(),
      iconMediaId: accountForm.iconMediaId ?? null,
      type: accountForm.type,
      numberingMode: accountForm.numberingMode,
      isActive: accountForm.isActive,
      notes: accountForm.notes?.trim() || undefined,
      displayOrder: accountForm.displayOrder ?? 0,
    };

    const accounts = normalizeAccountsForPayload();

    if (accountForm.numberingMode === 'shared') {
      payload.sharedAccountNumber = accountForm.sharedAccountNumber?.trim();
      payload.supportedCurrencies = accountForm.supportedCurrencies;
      if (accounts.length) {
        payload.accounts = accounts;
      }
    } else {
      payload.accounts = accounts;
    }

    return payload;
  };

  const validateAccountForm = (): boolean => {
    if (!accountForm.providerName.trim()) {
      toast.error(t('sections.localPaymentAccounts.validation.providerName', 'الرجاء إدخال اسم المزود'));
      return false;
    }

    if (accountForm.numberingMode === 'shared') {
      if (!accountForm.sharedAccountNumber || !accountForm.sharedAccountNumber.trim().length) {
        toast.error(t('sections.localPaymentAccounts.validation.sharedAccountNumber', 'يجب إدخال رقم الحساب المشترك'));
        return false;
      }
      if (!accountForm.supportedCurrencies.length) {
        toast.error(t('sections.localPaymentAccounts.validation.supportedCurrencies', 'اختر عملة واحدة على الأقل'));
        return false;
      }
    } else {
      if (!accountForm.accounts.length) {
        toast.error(t('sections.localPaymentAccounts.validation.accountsRequired', 'أضف حسابًا واحدًا على الأقل'));
        return false;
      }
      const missingAccountNumber = accountForm.accounts.some(
        (account) => !account.accountNumber.trim().length,
      );
      if (missingAccountNumber) {
        toast.error(t('sections.localPaymentAccounts.validation.accountNumberRequired', 'جميع الحسابات يجب أن تحتوي رقم حساب'));
        return false;
      }
    }

    return true;
  };

  const handleSaveAccount = async () => {
    try {
      if (!validateAccountForm()) {
        return;
      }

      const payload = buildPayload();

      if (editingAccount) {
        await localPaymentAccountsApi.updateAccount(editingAccount._id, payload);
        toast.success(t('sections.localPaymentAccounts.accountUpdated'));
      } else {
        await localPaymentAccountsApi.createAccount(payload);
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

  const columns: GridColDef<PaymentProviderRow>[] = useMemo(
    () => [
      {
        field: 'providerName',
        headerName: t('sections.localPaymentAccounts.providerName'),
        flex: 1.4,
        minWidth: 220,
        renderCell: (params: GridRenderCellParams<PaymentProviderRow>) => {
          const row = params.row;
          const providerIconUrl = row.icon?.url ?? row.provider?.icon?.url ?? '';
          const fallbackInitial = row.providerName ? row.providerName.charAt(0).toUpperCase() : '?';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {providerIconUrl ? (
                <Avatar src={providerIconUrl} sx={{ width: 36, height: 36 }} />
              ) : (
                <Avatar sx={{ width: 36, height: 36 }}>{fallbackInitial}</Avatar>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {row.providerName}
                </Typography>
                {!row.isActive && (
                  <Chip
                    label={t('sections.localPaymentAccounts.inactive')}
                    size="small"
                    color="error"
                    sx={{ width: 'fit-content' }}
                  />
                )}
              </Box>
            </Box>
          );
        },
      },
      {
        field: 'type',
        headerName: t('sections.localPaymentAccounts.type'),
        width: 140,
        renderCell: (params: GridRenderCellParams<PaymentProviderRow, PaymentAccountType>) => (
          <Chip
            label={t(`sections.localPaymentAccounts.${params.value}`)}
            color={params.value === 'bank' ? 'primary' : 'secondary'}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        ),
      },
      {
        field: 'numberingMode',
        headerName: t('sections.localPaymentAccounts.numberingModeLabel', 'وضع الترقيم'),
        width: 190,
        renderCell: (params: GridRenderCellParams<PaymentProviderRow>) => (
          <Chip
            label={
              params.value === 'shared'
                ? t('sections.localPaymentAccounts.numberingModeShared', 'حساب مشترك')
                : t('sections.localPaymentAccounts.numberingModePerCurrency', 'حساب لكل عملة')
            }
            color={params.value === 'shared' ? 'secondary' : 'primary'}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        ),
      },
      {
        field: 'accounts',
        headerName: t('sections.localPaymentAccounts.accounts'),
        flex: 1.8,
        minWidth: 320,
        sortable: false,
        renderCell: (params: GridRenderCellParams<PaymentProviderRow>) => {
          const row = params.row;
          return (
            <Stack spacing={0.75} sx={{ py: 1 }}>
              {row.numberingMode === 'shared' && row.sharedAccountNumber && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={t('sections.localPaymentAccounts.sharedAccountLabel', 'رقم مشترك')}
                    size="small"
                    color="primary"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {row.sharedAccountNumber}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                    {row.supportedCurrencies.map((currency) => (
                      <Chip
                        key={`${row.id}-${currency}`}
                        label={currency}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
              {row.accounts.map((account) => (
                <Box
                  key={account.id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
                >
                  <Chip label={account.currency} size="small" variant="outlined" />
                  <Typography variant="body2" color="text.secondary">
                    {account.accountNumber}
                  </Typography>
                  {row.numberingMode === 'shared' && (
                    <Chip
                      label={t('sections.localPaymentAccounts.overrideLabel', 'تخصيص')}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {!account.isActive && (
                    <Chip
                      label={t('sections.localPaymentAccounts.inactive')}
                      size="small"
                      color="error"
                    />
                  )}
                  {account.notes && (
                    <Typography variant="caption" color="text.secondary">
                      {account.notes}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          );
        },
      },
      {
        field: 'displayOrder',
        headerName: t('sections.localPaymentAccounts.displayOrder'),
        width: 140,
        valueGetter: ({ row }) => ((row as PaymentProviderRow | undefined)?.displayOrder ?? 0),
      },
      {
        field: 'actions',
        headerName: t('sections.localPaymentAccounts.actions'),
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<PaymentProviderRow>) => {
          const row = params.row;
          const provider = row.provider ?? allAccounts.find((item) => item._id === row.id);
          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                color="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  if (provider) {
                    handleOpenAccountDialog(provider);
                  }
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={async (event) => {
                  event.stopPropagation();
                  await handleDeleteAccount(row.id);
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          );
        },
      },
    ],
    [allAccounts, handleDeleteAccount, handleOpenAccountDialog, t],
  );

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
          <CardContent sx={{ pt: 0 }}>
            {!accountsLoading && filteredRows.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {providerRows.length === 0
                  ? t('sections.localPaymentAccounts.noAccounts')
                  : t('sections.localPaymentAccounts.noResults', 'لم يتم العثور على نتائج مطابقة.')}
              </Alert>
            )}
            <DataTable
              columns={columns}
              rows={filteredRows}
              loading={accountsLoading}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              sortModel={sortModel}
              onSortModelChange={setSortModel}
              searchPlaceholder={t('sections.localPaymentAccounts.searchPlaceholder', 'ابحث عن مزود...')}
              onSearch={handleSearch}
              getRowId={(row) => (row as PaymentProviderRow).id}
              height={filteredRows.length === 0 ? 420 : 520}
              rowHeight={isMobile ? 132 : 108}
            />
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

            <FormControl fullWidth>
              <InputLabel>{t('sections.localPaymentAccounts.numberingModeLabel', 'وضع الترقيم')}</InputLabel>
              <Select
                value={accountForm.numberingMode}
                onChange={(e) => handleNumberingModeChange(e.target.value as PaymentAccountNumberingMode)}
                label={t('sections.localPaymentAccounts.numberingModeLabel', 'وضع الترقيم')}
              >
                <MenuItem value="shared">
                  {t('sections.localPaymentAccounts.numberingModeShared', 'حساب مشترك')}
                </MenuItem>
                <MenuItem value="per_currency">
                  {t('sections.localPaymentAccounts.numberingModePerCurrency', 'حساب لكل عملة')}
                </MenuItem>
              </Select>
            </FormControl>

            {accountForm.numberingMode === 'shared' && (
              <Stack spacing={2}>
                <TextField
                  label={t('sections.localPaymentAccounts.sharedAccountNumberLabel', 'رقم الحساب المشترك')}
                  value={accountForm.sharedAccountNumber ?? ''}
                  onChange={(e) => setAccountForm({ ...accountForm, sharedAccountNumber: e.target.value })}
                  fullWidth
                  required
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t('sections.localPaymentAccounts.supportedCurrenciesLabel', 'العملات المدعومة')}
                  </Typography>
                  <FormGroup row>
                    {CURRENCY_OPTIONS.map((currency) => (
                      <FormControlLabel
                        key={currency}
                        control={
                          <Checkbox
                            checked={accountForm.supportedCurrencies.includes(currency)}
                            onChange={() => toggleSupportedCurrency(currency)}
                          />
                        }
                        label={t(`sections.localPaymentAccounts.currency${currency}`)}
                      />
                    ))}
                  </FormGroup>
                  {accountForm.supportedCurrencies.length === 0 && (
                    <FormHelperText error>
                      {t('sections.localPaymentAccounts.validation.supportedCurrencies', 'اختر عملة واحدة على الأقل')}
                    </FormHelperText>
                  )}
                </Box>
              </Stack>
            )}

            <Divider />

            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography variant="subtitle2">
                  {accountForm.numberingMode === 'shared'
                    ? t('sections.localPaymentAccounts.currencyOverridesTitle', 'تخصيص حسابات العملات')
                    : t('sections.localPaymentAccounts.currencyAccountsTitle', 'حسابات لكل عملة')}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddAccountRow}
                  disabled={getAvailableCurrencies().length === 0}
                >
                  {t('sections.localPaymentAccounts.addCurrencyAccount', 'إضافة حساب للعملة')}
                </Button>
              </Box>

              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                {accountForm.accounts.length === 0 ? (
                  <Alert severity="info">
                    {accountForm.numberingMode === 'shared'
                      ? t('sections.localPaymentAccounts.noOverridesHint', 'لا توجد تخصيصات حالية للعمولات المحددة.')
                      : t('sections.localPaymentAccounts.noAccountsHint', 'أضف حساباً واحداً على الأقل لكل عملة مطلوبة.')}
                  </Alert>
                ) : (
                  accountForm.accounts.map((account, index) => {
                    const availableCurrencies = [account.currency, ...getAvailableCurrencies(index)];
                    const uniqueCurrencies = Array.from(new Set(availableCurrencies));
                    const disableRemoval =
                      accountForm.numberingMode === 'per_currency' && accountForm.accounts.length <= 1;
                    return (
                      <Paper
                        key={account.id || `${index}-${account.currency}`}
                        variant="outlined"
                        sx={{ p: 2 }}
                      >
                        <Grid container spacing={2}>
                          <Grid component="div" size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                              <InputLabel>{t('sections.localPaymentAccounts.currency')}</InputLabel>
                              <Select
                                value={account.currency}
                                label={t('sections.localPaymentAccounts.currency')}
                                onChange={(e) =>
                                  handleUpdateAccountRow(index, {
                                    currency: e.target.value as CurrencyCode,
                                  })
                                }
                              >
                                {uniqueCurrencies.map((currency) => (
                                  <MenuItem key={currency} value={currency}>
                                    {t(`sections.localPaymentAccounts.currency${currency}`)}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid component="div" size={{ xs: 12, sm: 8 }}>
                            <TextField
                              label={t('sections.localPaymentAccounts.accountNumber')}
                              value={account.accountNumber}
                              onChange={(e) =>
                                handleUpdateAccountRow(index, { accountNumber: e.target.value })
                              }
                              required={accountForm.numberingMode === 'per_currency'}
                              fullWidth
                            />
                          </Grid>
                          <Grid component="div" size={{ xs: 12, sm: 4 }}>
                            <TextField
                              label={t('sections.localPaymentAccounts.displayOrder')}
                              type="number"
                              value={account.displayOrder ?? 0}
                              onChange={(e) =>
                                handleUpdateAccountRow(index, {
                                  displayOrder: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              fullWidth
                            />
                          </Grid>
                          <Grid component="div" size={{ xs: 12, sm: 8 }}>
                            <TextField
                              label={t('sections.localPaymentAccounts.notesLabel')}
                              value={account.notes ?? ''}
                              onChange={(e) =>
                                handleUpdateAccountRow(index, { notes: e.target.value })
                              }
                              fullWidth
                              multiline
                              rows={2}
                            />
                          </Grid>
                        </Grid>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                            mt: 1.5,
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Switch
                                checked={account.isActive ?? true}
                                onChange={(e) =>
                                  handleUpdateAccountRow(index, { isActive: e.target.checked })
                                }
                              />
                            }
                            label={t('sections.localPaymentAccounts.isActive')}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveAccountRow(index)}
                            disabled={disableRemoval}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Paper>
                    );
                  })
                )}
              </Stack>
            </Box>

            <Divider />

            <TextField
              label={t('sections.localPaymentAccounts.displayOrder')}
              type="number"
              value={accountForm.displayOrder ?? 0}
              onChange={(e) => setAccountForm({ ...accountForm, displayOrder: parseInt(e.target.value, 10) || 0 })}
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
            disabled={isSaveDisabled}
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

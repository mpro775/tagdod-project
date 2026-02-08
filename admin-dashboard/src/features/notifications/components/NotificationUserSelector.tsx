import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Grid,
  Typography,
  Button,
  ButtonGroup,
  Autocomplete,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Search, UploadFile, Person } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useUsers } from '@/features/users/hooks/useUsers';
import { UserRole, UserStatus } from '@/features/users/types/user.types';
import type { User } from '@/features/users/types/user.types';

interface NotificationUserSelectorProps {
  selectedUserIds: string[];
  onUserIdsChange: (userIds: string[]) => void;
  disabled?: boolean;
}

/**
 * Parse comma or space separated string into trimmed non-empty values
 */
const parseCommaSeparated = (value: string): string[] => {
  return value
    .split(/[,،\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

/**
 * Parse CSV file content - extract first column of each row
 */
const parseCsvFirstColumn = (text: string): string[] => {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const values: string[] = [];
  for (const line of lines) {
    const match = line.match(/^["']?([^,"']+)["']?/);
    if (match) {
      const val = match[1].trim();
      if (val) values.push(val);
    }
  }
  return [...new Set(values)];
};

/**
 * Resolve value (ID or phone) to user ID from users list
 */
const resolveToUserIds = (values: string[], users: User[]): string[] => {
  const userIds: string[] = [];
  for (const val of values) {
    const user = users.find(
      (u) =>
        u._id === val || u.phone === val || u.phone?.replace(/\D/g, '') === val.replace(/\D/g, '')
    );
    if (user) {
      userIds.push(user._id);
    } else if (/^[a-fA-F0-9]{24}$/.test(val)) {
      userIds.push(val);
    }
  }
  return [...new Set(userIds)];
};

export const NotificationUserSelector: React.FC<NotificationUserSelectorProps> = ({
  selectedUserIds,
  onUserIdsChange,
  disabled = false,
}) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [userSearch, setUserSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [quickSelectIntent, setQuickSelectIntent] = useState<
    'all' | 'merchant' | 'engineer' | null
  >(null);
  const [manualInputValue, setManualInputValue] = useState('');
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: usersData, isLoading: usersLoading } = useUsers({
    search: userSearch || undefined,
    role: selectedRole || undefined,
    limit: 100,
    page: 1,
    status: UserStatus.ACTIVE,
  });

  const allUsers = usersData?.data || [];

  const selectedUsers = useMemo(() => {
    return allUsers.filter((u) => selectedUserIds.includes(u._id));
  }, [allUsers, selectedUserIds]);

  const getUserDisplayName = (user: User) =>
    user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.phone || user._id;

  useEffect(() => {
    if (!quickSelectIntent || usersLoading) return;
    const roleMatch =
      (quickSelectIntent === 'all' && selectedRole === '') ||
      (quickSelectIntent === 'merchant' && selectedRole === UserRole.MERCHANT) ||
      (quickSelectIntent === 'engineer' && selectedRole === UserRole.ENGINEER);
    if (roleMatch && allUsers.length > 0) {
      const ids = allUsers.map((u) => u._id);
      onUserIdsChange([...new Set([...selectedUserIds, ...ids])]);
      setQuickSelectIntent(null);
    }
  }, [quickSelectIntent, selectedRole, allUsers, usersLoading]);

  const handleQuickSelect = (role: '' | UserRole.MERCHANT | UserRole.ENGINEER) => {
    if (disabled || usersLoading) return;
    setSelectedRole(role);
    setQuickSelectIntent(
      role === '' ? 'all' : role === UserRole.MERCHANT ? 'merchant' : 'engineer'
    );
  };

  const handleAutocompleteChange = (_: unknown, newValue: User[]) => {
    const ids = newValue.map((u) => u._id);
    const orphanIds = selectedUserIds.filter((id) => !allUsers.some((u) => u._id === id));
    onUserIdsChange([...new Set([...ids, ...orphanIds])]);
  };

  const handleManualInputApply = () => {
    if (!manualInputValue.trim()) return;
    const values = parseCommaSeparated(manualInputValue);
    const resolved = resolveToUserIds(values, allUsers);
    const manualIds = values.filter((v) => /^[a-fA-F0-9]{24}$/.test(v) && !resolved.includes(v));
    const newIds = [...new Set([...selectedUserIds, ...resolved, ...manualIds])];
    onUserIdsChange(newIds);
    setManualInputValue('');
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result);
        const values = parseCsvFirstColumn(text);
        const resolved = resolveToUserIds(values, allUsers);
        const manualIds = values.filter(
          (v) => /^[a-fA-F0-9]{24}$/.test(v) && !resolved.includes(v)
        );
        const newIds = [...new Set([...selectedUserIds, ...resolved, ...manualIds])];
        onUserIdsChange(newIds);
        if (newIds.length > selectedUserIds.length) {
          setCsvError(null);
        }
      } catch {
        setCsvError(t('forms.csvUploadError'));
      }
    };
    reader.onerror = () => setCsvError(t('forms.csvUploadError'));
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  return (
    <Box>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
          {t('forms.selectRecipients', 'اختر المستلمين')}
        </Typography>
      </Box>

      {usersData && usersData.meta.total > 100 && (
        <Alert severity="info" sx={{ mb: 2, fontSize: isMobile ? '0.875rem' : undefined }}>
          {t('forms.usersLimitInfo')}
        </Alert>
      )}

      {/* Search and role filter - shown first to filter options */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('forms.searchUsers', 'ابحث عن المستخدمين...')}
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            disabled={disabled || usersLoading}
            aria-label={t('forms.searchUsers')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small" disabled={disabled || usersLoading}>
            <InputLabel>{t('forms.filterByRole', 'فلترة حسب الدور')}</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole | '')}
              label={t('forms.filterByRole', 'فلترة حسب الدور')}
              aria-label={t('forms.filterByRole', 'فلترة حسب الدور')}
            >
              <MenuItem value="">{t('filters.all', 'الكل')}</MenuItem>
              <MenuItem value={UserRole.USER}>{t('forms.roleUser', 'مستخدم')}</MenuItem>
              <MenuItem value={UserRole.MERCHANT}>{t('forms.roleMerchant', 'تاجر')}</MenuItem>
              <MenuItem value={UserRole.ENGINEER}>{t('forms.roleEngineer', 'مهندس')}</MenuItem>
              <MenuItem value={UserRole.ADMIN}>{t('forms.roleAdmin', 'مدير')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Quick selection buttons */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {t('forms.filterByRole', 'اختيار سريع')}
        </Typography>
        <ButtonGroup
          variant="outlined"
          size="small"
          fullWidth={isMobile}
          disabled={disabled || usersLoading}
        >
          <Button
            onClick={() => handleQuickSelect('')}
            startIcon={<Person />}
            sx={{ flex: isMobile ? 1 : undefined }}
          >
            {t('forms.quickSelectAll')}
          </Button>
          <Button
            onClick={() => handleQuickSelect(UserRole.MERCHANT)}
            sx={{ flex: isMobile ? 1 : undefined }}
          >
            {t('forms.quickSelectMerchants')}
          </Button>
          <Button
            onClick={() => handleQuickSelect(UserRole.ENGINEER)}
            sx={{ flex: isMobile ? 1 : undefined }}
          >
            {t('forms.quickSelectEngineers')}
          </Button>
        </ButtonGroup>
      </Box>

      {/* Autocomplete for search & select */}
      <Box sx={{ mb: 2 }}>
        <Autocomplete
          multiple
          options={allUsers}
          value={selectedUsers}
          onChange={handleAutocompleteChange}
          getOptionLabel={(option) =>
            typeof option === 'string' ? option : getUserDisplayName(option)
          }
          filterSelectedOptions
          loading={usersLoading}
          disabled={disabled}
          size={isMobile ? 'small' : 'medium'}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('forms.recipientId', 'المستلمون')}
              placeholder={t('forms.searchUsers', 'ابحث عن المستخدمين...')}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <Search sx={{ mr: 1, color: 'text.secondary' }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option._id}
                label={getUserDisplayName(option)}
                size="small"
              />
            ))
          }
          noOptionsText={t('forms.noUsersFound')}
        />
      </Box>

      {/* Manual input */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label={t('forms.manualInput')}
          placeholder={t('forms.manualInputPlaceholder')}
          value={manualInputValue}
          onChange={(e) => setManualInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleManualInputApply()}
          helperText={t('forms.manualInputHelper')}
          disabled={disabled}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={handleManualInputApply}
                  disabled={!manualInputValue.trim() || disabled}
                >
                  {t('forms.addRecipients', 'إضافة')}
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* CSV upload */}
      <Box sx={{ mb: 2 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleCsvUpload}
          style={{ display: 'none' }}
        />
        <Button
          variant="outlined"
          size="small"
          startIcon={<UploadFile />}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          fullWidth={isMobile}
        >
          {t('forms.uploadCsv')}
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {t('forms.uploadCsvHelper')}
        </Typography>
        {csvError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {csvError}
          </Alert>
        )}
      </Box>

      {selectedUserIds.length > 0 && (
        <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={`${selectedUserIds.length} ${t('forms.selected', 'محدد')}`}
            size="small"
            color="primary"
            onDelete={() => onUserIdsChange([])}
          />
        </Box>
      )}
    </Box>
  );
};

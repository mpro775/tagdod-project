import React, { useState, useRef } from 'react';
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
  CircularProgress,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Paper,
} from '@mui/material';
import { Search, UploadFile, Person } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useUsers } from '@/features/users/hooks/useUsers';
import { usersApi } from '@/features/users/api/usersApi';
import { UserRole, UserStatus } from '@/features/users/types/user.types';
import type { User } from '@/features/users/types/user.types';

interface NotificationUserSelectorProps {
  selectedUserIds: string[];
  onUserIdsChange: (userIds: string[]) => void;
  disabled?: boolean;
}

const PAGE_SIZE = 50;

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
  const [verificationStatus, setVerificationStatus] = useState<'all' | 'verified' | 'unverified'>(
    'all'
  );
  const [page, setPage] = useState(1);
  const [selectAllLoading, setSelectAllLoading] = useState(false);
  const [manualInputValue, setManualInputValue] = useState('');
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: usersData, isLoading: usersLoading } = useUsers({
    search: userSearch || undefined,
    role: selectedRole || undefined,
    verificationStatus:
      (selectedRole === UserRole.MERCHANT || selectedRole === UserRole.ENGINEER) &&
      verificationStatus !== 'all'
        ? verificationStatus
        : undefined,
    limit: PAGE_SIZE,
    page,
    status: UserStatus.ACTIVE,
  });

  const allUsers = usersData?.data || [];
  const total = usersData?.meta?.total ?? 0;
  const totalPages = usersData?.meta?.totalPages ?? 1;

  const getUserDisplayName = (user: User) =>
    user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.phone || user._id;

  const handleSelectAllMatching = async (role: '' | UserRole.MERCHANT | UserRole.ENGINEER) => {
    if (disabled || selectAllLoading) return;
    setSelectAllLoading(true);
    try {
      const ids = await usersApi.listIds({
        search: userSearch || undefined,
        role: role || undefined,
        verificationStatus:
          (role === UserRole.MERCHANT || role === UserRole.ENGINEER) && verificationStatus !== 'all'
            ? verificationStatus
            : undefined,
        status: UserStatus.ACTIVE,
      });
      onUserIdsChange(ids);
    } catch {
      // Error handled by global error handler
    } finally {
      setSelectAllLoading(false);
    }
  };

  const handleSelectPage = () => {
    const pageIds = allUsers.map((u) => u._id);
    const newIds = [...new Set([...selectedUserIds, ...pageIds])];
    onUserIdsChange(newIds);
  };

  const handleDeselectPage = () => {
    const pageIds = new Set(allUsers.map((u) => u._id));
    const newIds = selectedUserIds.filter((id) => !pageIds.has(id));
    onUserIdsChange(newIds);
  };

  const handleRowToggle = (userId: string, checked: boolean) => {
    if (checked) {
      onUserIdsChange([...new Set([...selectedUserIds, userId])]);
    } else {
      onUserIdsChange(selectedUserIds.filter((id) => id !== userId));
    }
  };

  const allPageSelected =
    allUsers.length > 0 && allUsers.every((u) => selectedUserIds.includes(u._id));
  const somePageSelected = allUsers.some((u) => selectedUserIds.includes(u._id));

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

  const showVerificationFilter =
    selectedRole === UserRole.MERCHANT || selectedRole === UserRole.ENGINEER;

  return (
    <Box>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
          {t('forms.selectRecipients', 'اختر المستلمين')}
        </Typography>
      </Box>

      {/* Search and filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('forms.searchUsers', 'ابحث عن المستخدمين...')}
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              setPage(1);
            }}
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
              onChange={(e) => {
                setSelectedRole(e.target.value as UserRole | '');
                setPage(1);
              }}
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
        {showVerificationFilter && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" disabled={disabled || usersLoading}>
              <InputLabel>{t('forms.verificationStatus', 'حالة التوثيق')}</InputLabel>
              <Select
                value={verificationStatus}
                onChange={(e) => {
                  setVerificationStatus(e.target.value as 'all' | 'verified' | 'unverified');
                  setPage(1);
                }}
                label={t('forms.verificationStatus', 'حالة التوثيق')}
                aria-label={t('forms.verificationStatus', 'حالة التوثيق')}
              >
                <MenuItem value="all">{t('filters.all', 'الكل')}</MenuItem>
                <MenuItem value="verified">{t('forms.verifiedOnly', 'موثقون فقط')}</MenuItem>
                <MenuItem value="unverified">{t('forms.unverifiedOnly', 'غير موثقين')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>

      {/* Quick selection buttons - Select All (fetches all IDs) */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {t('forms.quickSelectHint', 'اختيار سريع')}
        </Typography>
        <ButtonGroup
          variant="outlined"
          size="small"
          fullWidth={isMobile}
          disabled={disabled || selectAllLoading}
        >
          <Button
            onClick={() => handleSelectAllMatching('')}
            startIcon={selectAllLoading ? <CircularProgress size={16} /> : <Person />}
            sx={{ flex: isMobile ? 1 : undefined }}
          >
            {t('forms.quickSelectAll')}
          </Button>
          <Button
            onClick={() => handleSelectAllMatching(UserRole.MERCHANT)}
            sx={{ flex: isMobile ? 1 : undefined }}
          >
            {t('forms.quickSelectMerchants')}
          </Button>
          <Button
            onClick={() => handleSelectAllMatching(UserRole.ENGINEER)}
            sx={{ flex: isMobile ? 1 : undefined }}
          >
            {t('forms.quickSelectEngineers')}
          </Button>
        </ButtonGroup>
      </Box>

      {/* User table with checkboxes */}
      <Box sx={{ mb: 2 }}>
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 320 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={somePageSelected && !allPageSelected}
                    checked={allPageSelected}
                    onChange={(_, checked) => (checked ? handleSelectPage() : handleDeselectPage())}
                    disabled={disabled || usersLoading || allUsers.length === 0}
                    aria-label={t('forms.selectAllInPage', 'تحديد الصفحة الحالية')}
                  />
                </TableCell>
                <TableCell>{t('forms.users', 'مستخدم')}</TableCell>
                <TableCell>{t('forms.recipientPhone', 'رقم الهاتف')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : allUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">{t('forms.noUsersFound')}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                allUsers.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUserIds.includes(user._id)}
                        onChange={(_, checked) => handleRowToggle(user._id, checked)}
                        disabled={disabled}
                      />
                    </TableCell>
                    <TableCell>{getUserDisplayName(user)}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {total > 0 && (
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('forms.pageInfo', 'صفحة {{page}} من {{totalPages}} - إجمالي {{total}} مستخدم', {
                page,
                totalPages,
                total,
              })}
            </Typography>
            <TablePagination
              component="div"
              count={total}
              page={page - 1}
              onPageChange={(_, newPage) => setPage(newPage + 1)}
              rowsPerPage={PAGE_SIZE}
              rowsPerPageOptions={[PAGE_SIZE]}
              labelDisplayedRows={() => ''}
            />
          </Box>
        )}
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

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { UserRole, UserStatus } from '../types/user.types';
import { useTranslation } from 'react-i18next';
import { DataToolbar, type DataToolbarFilter } from '@/shared/design-system';

interface UsersFilterProps {
  filters: {
    search: string;
    status?: UserStatus;
    role?: UserRole;
    verificationStatus?: 'all' | 'verified' | 'unverified' | 'pending' | 'rejected';
    includeDeleted?: boolean;
  };
  onFiltersChange: (filters: {
    search: string;
    status?: UserStatus;
    role?: UserRole;
    verificationStatus?: 'all' | 'verified' | 'unverified' | 'pending' | 'rejected';
    includeDeleted?: boolean;
  }) => void;
  onClearFilters: () => void;
  actions?: React.ReactNode;
}

export const UsersFilter: React.FC<UsersFilterProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  actions,
}) => {
  const { t } = useTranslation(['users', 'common']);

  const STATUS_LABELS: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: t('users:status.active', 'نشط'),
    [UserStatus.SUSPENDED]: t('users:status.suspended', 'معلق'),
    [UserStatus.PENDING]: t('users:status.pending', 'قيد الانتظار'),
    [UserStatus.DELETED]: t('users:status.deleted', 'محذوف'),
  };

  const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.USER]: t('users:roles.user', 'مستخدم'),
    [UserRole.ADMIN]: t('users:roles.admin', 'مدير'),
    [UserRole.SUPER_ADMIN]: t('users:roles.super_admin', 'مدير عام'),
    [UserRole.MERCHANT]: t('users:roles.merchant', 'تاجر'),
    [UserRole.ENGINEER]: t('users:roles.engineer', 'مهندس'),
  };

  const VERIFICATION_LABELS: Record<
    'all' | 'verified' | 'unverified' | 'pending' | 'rejected',
    string
  > = {
    all: t('users:filter.allVerification', 'الكل'),
    verified: t('users:filter.verifiedOnly', 'موثقون فقط'),
    unverified: t('users:filter.unverifiedOnly', 'غير موثقين'),
    pending: t('users:filter.pendingOnly', 'قيد الانتظار'),
    rejected: t('users:filter.rejectedOnly', 'مرفوض'),
  };

  const handleFilterChange = (key: string, value: any) => {
    const updates = {
      ...filters,
      [key]: value,
    };
    if (key === 'role' && value !== UserRole.MERCHANT && value !== UserRole.ENGINEER) {
      updates.verificationStatus = undefined;
    }
    onFiltersChange(updates);
  };

  const showVerificationFilter =
    filters.role === UserRole.MERCHANT || filters.role === UserRole.ENGINEER;

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.role ||
    filters.includeDeleted ||
    (showVerificationFilter && filters.verificationStatus && filters.verificationStatus !== 'all');

  const activeFilters: DataToolbarFilter[] = [];

  if (filters.search) {
    activeFilters.push({
      label: t('users:filter.search', 'بحث'),
      value: filters.search.length > 20 ? filters.search.substring(0, 20) + '...' : filters.search,
      onDelete: () => handleFilterChange('search', ''),
    });
  }
  if (filters.status) {
    activeFilters.push({
      label: t('users:filter.statusLabel', 'حالة'),
      value: STATUS_LABELS[filters.status],
      onDelete: () => handleFilterChange('status', undefined),
    });
  }
  if (filters.role) {
    activeFilters.push({
      label: t('users:filter.roleLabel', 'دور'),
      value: ROLE_LABELS[filters.role],
      onDelete: () => handleFilterChange('role', undefined),
    });
  }
  if (showVerificationFilter && filters.verificationStatus && filters.verificationStatus !== 'all') {
    activeFilters.push({
      label: t('users:filter.verificationLabel', 'توثيق'),
      value: VERIFICATION_LABELS[filters.verificationStatus],
      onDelete: () => handleFilterChange('verificationStatus', undefined),
    });
  }
  if (filters.includeDeleted) {
    activeFilters.push({
      label: t('users:filter.includeDeleted', 'محذوفين'),
      value: 'نعم',
      onDelete: () => handleFilterChange('includeDeleted', false),
    });
  }

  const filterControls = (
    <>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>{t('users:filter.status', 'الحالة')}</InputLabel>
        <Select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
          label={t('users:filter.status', 'الحالة')}
        >
          <MenuItem value="">{t('users:filter.allStatuses', 'جميع الحالات')}</MenuItem>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <MenuItem key={status} value={status}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>{t('users:filter.role', 'الدور')}</InputLabel>
        <Select
          value={filters.role || ''}
          onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
          label={t('users:filter.role', 'الدور')}
        >
          <MenuItem value="">{t('users:filter.allRoles', 'جميع الأدوار')}</MenuItem>
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <MenuItem key={role} value={role}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {showVerificationFilter && (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('users:filter.verificationStatus', 'حالة التوثيق')}</InputLabel>
          <Select
            value={filters.verificationStatus || 'all'}
            onChange={(e) =>
              handleFilterChange('verificationStatus', e.target.value === 'all' ? undefined : e.target.value)
            }
            label={t('users:filter.verificationStatus', 'حالة التوثيق')}
          >
            <MenuItem value="all">{VERIFICATION_LABELS.all}</MenuItem>
            <MenuItem value="verified">{VERIFICATION_LABELS.verified}</MenuItem>
            <MenuItem value="unverified">{VERIFICATION_LABELS.unverified}</MenuItem>
            <MenuItem value="pending">{VERIFICATION_LABELS.pending}</MenuItem>
            <MenuItem value="rejected">{VERIFICATION_LABELS.rejected}</MenuItem>
          </Select>
        </FormControl>
      )}
      {hasActiveFilters && (
        <Button
          variant="text"
          size="small"
          onClick={onClearFilters}
          startIcon={<ClearIcon />}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {t('users:filter.clearFilters', 'مسح الفلاتر')}
        </Button>
      )}
    </>
  );

  return (
    <DataToolbar
      searchValue={filters.search}
      searchPlaceholder={t('users:filter.searchPlaceholder', 'رقم الهاتف، الاسم...')}
      onSearchChange={(value) => handleFilterChange('search', value)}
      filters={filterControls}
      activeFilters={activeFilters}
      actions={actions}
    />
  );
};
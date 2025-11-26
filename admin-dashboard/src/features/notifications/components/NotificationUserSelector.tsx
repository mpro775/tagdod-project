import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  ListSubheader,
  Chip,
  Alert,
  Grid,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useUsers } from '@/features/users/hooks/useUsers';
import { UserRole, UserStatus } from '@/features/users/types/user.types';

interface NotificationUserSelectorProps {
  selectedUserIds: string[];
  onUserIdsChange: (userIds: string[]) => void;
  disabled?: boolean;
}

export const NotificationUserSelector: React.FC<NotificationUserSelectorProps> = ({
  selectedUserIds,
  onUserIdsChange,
  disabled = false,
}) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [userSearch, setUserSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');

  const { data: usersData, isLoading: usersLoading } = useUsers({
    search: userSearch || undefined,
    role: selectedRole || undefined,
    limit: 100,
    page: 1,
    status: UserStatus.ACTIVE,
  });

  const allUsers = usersData?.data || [];

  const usersByRole = useMemo(() => {
    const grouped: Record<string, typeof allUsers> = {
      [UserRole.USER]: [],
      [UserRole.MERCHANT]: [],
      [UserRole.ENGINEER]: [],
      [UserRole.ADMIN]: [],
      [UserRole.SUPER_ADMIN]: [],
    };

    allUsers.forEach((user) => {
      user.roles?.forEach((role) => {
        if (grouped[role]) {
          grouped[role].push(user);
        }
      });
      if (!user.roles || user.roles.length === 0) {
        grouped[UserRole.USER].push(user);
      }
    });

    return grouped;
  }, [allUsers]);

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      [UserRole.USER]: t('forms.roleUser', 'مستخدم'),
      [UserRole.MERCHANT]: t('forms.roleMerchant', 'تاجر'),
      [UserRole.ENGINEER]: t('forms.roleEngineer', 'مهندس'),
      [UserRole.ADMIN]: t('forms.roleAdmin', 'مدير'),
      [UserRole.SUPER_ADMIN]: t('forms.roleSuperAdmin', 'مدير عام'),
    };
    return labels[role] || role;
  };

  const handleUserChange = (event: any) => {
    const value = event.target.value;
    if (value.includes('all') && value.length === 1) {
      const allUserIds = allUsers.map((u) => u._id);
      onUserIdsChange(allUserIds);
    } else {
      const filteredValue = value.filter((v: string) => v !== 'all');
      onUserIdsChange(filteredValue);
    }
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
          {t(
            'forms.usersLimitInfo',
            'يتم عرض أول 100 مستخدم. استخدم البحث والفلترة للعثور على المستخدمين المطلوبين.'
          )}
        </Alert>
      )}

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
            aria-label={t('forms.searchUsers', 'ابحث عن المستخدمين...')}
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

      <FormControl
        fullWidth
        disabled={disabled || usersLoading}
        size={isMobile ? 'small' : 'medium'}
      >
        <InputLabel>{t('forms.recipientId', 'المستلمون')}</InputLabel>
        <Select
          multiple
          value={selectedUserIds}
          onChange={handleUserChange}
          input={<OutlinedInput label={t('forms.recipientId', 'المستلمون')} />}
          renderValue={(selected) => {
            if (selected.length === 0) {
              return t('placeholders.selectUser', 'اختر المستخدمين');
            }
            if (selected.length === allUsers.length && allUsers.length > 0) {
              return t('forms.allUsers', 'جميع المستخدمين');
            }
            return `${selected.length} ${t('forms.selected', 'محدد')}`;
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 400,
              },
            },
          }}
          aria-label={t('forms.recipientId', 'المستلمون')}
        >
          {allUsers.length > 0 && (
            <MenuItem value="all">
              <Checkbox checked={selectedUserIds.length === allUsers.length && allUsers.length > 0} />
              <ListItemText
                primary={t('forms.selectAll', 'تحديد الكل')}
                secondary={`${allUsers.length} ${t('forms.users', 'مستخدم')}`}
              />
            </MenuItem>
          )}

          {Object.entries(usersByRole)
            .filter(([, users]) => users.length > 0)
            .flatMap(([role, users]) => [
              <ListSubheader
                key={`header-${role}`}
                sx={{
                  bgcolor: 'grey.100',
                  fontWeight: 'medium',
                  fontSize: '0.875rem',
                  lineHeight: '2.5',
                }}
              >
                {getRoleLabel(role as UserRole)} ({users.length})
              </ListSubheader>,
              ...users.map((user) => {
                const userName =
                  user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.phone || user._id;
                return (
                  <MenuItem key={user._id} value={user._id} sx={{ pl: 4 }}>
                    <Checkbox checked={selectedUserIds.indexOf(user._id) > -1} />
                    <ListItemText primary={userName} secondary={user.phone} />
                  </MenuItem>
                );
              }),
            ])}

          {allUsers.length === 0 && !usersLoading && (
            <MenuItem disabled>
              <ListItemText primary={t('forms.noUsersFound', 'لا يوجد مستخدمون')} />
            </MenuItem>
          )}
        </Select>
      </FormControl>

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


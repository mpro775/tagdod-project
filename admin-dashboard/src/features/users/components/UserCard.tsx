import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  Grid,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Engineering as EngineeringIcon,
  Store as StoreIcon,
  AdminPanelSettings as AdminIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { User, UserStatus, UserRole, getPrimaryRole } from '../types/user.types';
import { formatDate } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore?: (user: User) => void;
  onStatusToggle?: (user: User, checked: boolean) => void;
  showActions?: boolean;
}

const STATUS_ICONS: Record<UserStatus, React.ReactNode> = {
  [UserStatus.ACTIVE]: <CheckCircleIcon color="success" />,
  [UserStatus.SUSPENDED]: <BlockIcon color="error" />,
  [UserStatus.PENDING]: <ScheduleIcon color="warning" />,
  [UserStatus.DELETED]: <DeleteIcon color="error" />,
};

const STATUS_COLORS: Record<UserStatus, 'success' | 'error' | 'warning' | 'default'> = {
  [UserStatus.ACTIVE]: 'success',
  [UserStatus.SUSPENDED]: 'error',
  [UserStatus.PENDING]: 'warning',
  [UserStatus.DELETED]: 'default',
};

const ROLE_COLORS: Record<
  UserRole,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  [UserRole.USER]: 'default',
  [UserRole.ADMIN]: 'warning',
  [UserRole.SUPER_ADMIN]: 'error',
  [UserRole.MERCHANT]: 'info',
  [UserRole.ENGINEER]: 'success',
};

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onRestore,
  onStatusToggle,
  showActions = true,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const isDeleted = !!user.deletedAt;
  const fullName =
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    t('users:card.unknown', 'غير محدد');
  const primaryRole = getPrimaryRole(user.roles);

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

  const getCapabilityIcons = () => {
    const icons = [];
    if (user.capabilities?.engineer_capable) {
      icons.push(
        <EngineeringIcon
          key="engineer"
          color="success"
          sx={{ fontSize: { xs: 16, sm: 20 } }}
        />
      );
    }
    if (user.capabilities?.merchant_capable) {
      icons.push(
        <StoreIcon key="merchant" color="info" sx={{ fontSize: { xs: 16, sm: 20 } }} />
      );
    }
    if (user.capabilities?.admin_capable) {
      icons.push(
        <AdminIcon key="admin" color="warning" sx={{ fontSize: { xs: 16, sm: 20 } }} />
      );
    }
    return icons;
  };

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'dark' ? 4 : 3,
        },
        opacity: isDeleted ? 0.7 : 1,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, width: '100%' }}>
            <Avatar
              sx={{
                mr: { xs: 1, sm: 2 },
                bgcolor: 'primary.main',
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              {fullName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                noWrap
                sx={{
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  color: 'text.primary',
                }}
              >
                {fullName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <PhoneIcon
                  sx={{
                    mr: 0.5,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    color: 'text.secondary',
                  }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                  noWrap
                >
                  {user.phone}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {React.cloneElement(STATUS_ICONS[user.status] as React.ReactElement, {
              sx: { fontSize: { xs: 20, sm: 24 } },
            } as any)}
          </Box>
        </Box>

        {/* Status and Role */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={STATUS_LABELS[user.status]}
            color={STATUS_COLORS[user.status]}
            size="small"
            sx={{
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              height: { xs: 22, sm: 24 },
            }}
          />
          <Chip
            label={ROLE_LABELS[primaryRole]}
            color={ROLE_COLORS[primaryRole]}
            size="small"
            variant="outlined"
            sx={{
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              height: { xs: 22, sm: 24 },
            }}
          />
        </Box>

        {/* Capabilities */}
        {user.capabilities && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              {t('users:card.capabilities', 'القدرات:')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <PersonIcon
                color="primary"
                sx={{ fontSize: { xs: 16, sm: 20 } }}
              />
              {getCapabilityIcons()}
            </Box>
          </Box>
        )}

        {/* Additional Info */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {user.jobTitle && (
            <Grid component="div" size={{ xs: 12 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                <strong>{t('users:card.jobTitle', 'الوظيفة:')}</strong> {user.jobTitle}
              </Typography>
            </Grid>
          )}
          {((user.capabilities?.merchant_discount_percent &&
            user.capabilities.merchant_discount_percent > 0) ||
            (user as any).merchant_discount_percent > 0) && (
              <Grid component="div" size={{ xs: 12 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  <strong>{t('users:card.merchantDiscount', 'خصم التاجر:')}</strong>{' '}
                  {user.capabilities?.merchant_discount_percent ??
                    (user as any).merchant_discount_percent}
                  %
                </Typography>
              </Grid>
            )}
          <Grid component="div" size={{ xs: 12 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              <strong>{t('users:card.createdAt', 'تاريخ الإنشاء:')}</strong>{' '}
              {formatDate(user.createdAt)}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

        {/* Actions */}
        {showActions && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1.5, sm: 1 },
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
              {isDeleted ? (
                onRestore && (
                  <Tooltip title={t('users:actions.restore', 'استعادة')}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onRestore(user)}
                      sx={{
                        p: { xs: 0.75, sm: 1 },
                      }}
                    >
                      <RestoreIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              ) : (
                <>
                  <Tooltip title={t('users:actions.edit', 'تعديل')}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(user)}
                      sx={{
                        p: { xs: 0.75, sm: 1 },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('users:actions.delete', 'حذف')}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(user)}
                      sx={{
                        p: { xs: 0.75, sm: 1 },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>

            {onStatusToggle && !isDeleted && (
              <Chip
                label={
                  user.status === UserStatus.ACTIVE
                    ? t('users:status.active', 'نشط')
                    : t('users:status.suspended', 'موقوف')
                }
                color={user.status === UserStatus.ACTIVE ? 'success' : 'error'}
                size="small"
                clickable
                onClick={() => onStatusToggle(user, user.status !== UserStatus.ACTIVE)}
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  height: { xs: 24, sm: 28 },
                  width: { xs: '100%', sm: 'auto' },
                }}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

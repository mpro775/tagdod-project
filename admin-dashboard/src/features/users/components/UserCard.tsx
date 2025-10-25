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
import { User, UserStatus, UserRole } from '../types/user.types';
import { formatDate } from '@/shared/utils/formatters';

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

const STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'نشط',
  [UserStatus.SUSPENDED]: 'معلق',
  [UserStatus.PENDING]: 'قيد الانتظار',
  [UserStatus.DELETED]: 'محذوف',
};

const STATUS_COLORS: Record<UserStatus, 'success' | 'error' | 'warning' | 'default'> = {
  [UserStatus.ACTIVE]: 'success',
  [UserStatus.SUSPENDED]: 'error',
  [UserStatus.PENDING]: 'warning',
  [UserStatus.DELETED]: 'default',
};

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.USER]: 'مستخدم',
  [UserRole.ADMIN]: 'مدير',
  [UserRole.SUPER_ADMIN]: 'مدير عام',
  [UserRole.MERCHANT]: 'تاجر',
  [UserRole.ENGINEER]: 'مهندس',
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
  const isDeleted = !!user.deletedAt;
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'غير محدد';
  const primaryRole = user.roles?.[0] || UserRole.USER;

  const getCapabilityIcons = () => {
    const icons = [];
    if (user.capabilities?.engineer_capable) {
      icons.push(<EngineeringIcon key="engineer" color="success" />);
    }
    if (user.capabilities?.wholesale_capable) {
      icons.push(<StoreIcon key="wholesale" color="info" />);
    }
    if (user.capabilities?.admin_capable) {
      icons.push(<AdminIcon key="admin" color="warning" />);
    }
    return icons;
  };

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
        opacity: isDeleted ? 0.7 : 1,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {fullName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <PhoneIcon sx={{ mr: 0.5, fontSize: '0.875rem', color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {user.phone}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>{STATUS_ICONS[user.status]}</Box>
        </Box>

        {/* Status and Role */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={STATUS_LABELS[user.status]}
            color={STATUS_COLORS[user.status]}
            size="small"
          />
          <Chip
            label={ROLE_LABELS[primaryRole]}
            color={ROLE_COLORS[primaryRole]}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Capabilities */}
        {user.capabilities && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              القدرات:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <PersonIcon color="primary" />
              {getCapabilityIcons()}
            </Box>
          </Box>
        )}

        {/* Additional Info */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {user.jobTitle && (
            <Grid component="div" size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>الوظيفة:</strong> {user.jobTitle}
              </Typography>
            </Grid>
          )}
          {user.capabilities?.wholesale_discount_percent &&
            user.capabilities.wholesale_discount_percent > 0 && (
              <Grid component="div" size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>خصم الجملة:</strong> {user.capabilities.wholesale_discount_percent}%
                </Typography>
              </Grid>
            )}
          <Grid component="div" size={{ xs: 12 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>تاريخ الإنشاء:</strong> {formatDate(user.createdAt)}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Actions */}
        {showActions && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isDeleted ? (
                onRestore && (
                  <Tooltip title="استعادة">
                    <IconButton size="small" color="primary" onClick={() => onRestore(user)}>
                      <RestoreIcon />
                    </IconButton>
                  </Tooltip>
                )
              ) : (
                <>
                  <Tooltip title="تعديل">
                    <IconButton size="small" color="primary" onClick={() => onEdit(user)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="حذف">
                    <IconButton size="small" color="error" onClick={() => onDelete(user)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>

            {onStatusToggle && !isDeleted && (
              <Chip
                label={user.status === UserStatus.ACTIVE ? 'نشط' : 'موقوف'}
                color={user.status === UserStatus.ACTIVE ? 'success' : 'error'}
                size="small"
                clickable
                onClick={() => onStatusToggle(user, user.status !== UserStatus.ACTIVE)}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

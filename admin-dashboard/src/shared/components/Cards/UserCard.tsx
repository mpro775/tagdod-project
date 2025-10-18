import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Phone,
  Person,
} from '@mui/icons-material';
import { User } from '@/features/users/types/user.types';
import { ROLE_COLORS } from '@/config/constants';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  showActions?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  showActions = true,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: (user: User) => void) => {
    action(user);
    handleMenuClose();
  };

  const getRoleColor = (role: string) => {
    return ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 'default';
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        {/* Header with Avatar and Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{ width: 56, height: 56, mr: 2 }}
          >
            {(user.firstName || user.lastName)?.charAt(0) || user.phone.charAt(0)}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" noWrap>
              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'غير محدد'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user.phone}
            </Typography>
          </Box>

          {showActions && (
            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{ ml: 1 }}
            >
              <MoreVert />
            </IconButton>
          )}
        </Box>

        {/* User Info */}
        <Box sx={{ mb: 2 }}>
          {user.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {user.phone}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {user.roles?.join(', ') || 'بدون دور'}
            </Typography>
          </Box>

          {user.updatedAt && (
            <Typography variant="body2" color="text.secondary">
              آخر تحديث: {formatDate(user.updatedAt)}
            </Typography>
          )}
        </Box>

        {/* Roles */}
        {user.roles && user.roles.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {user.roles.map((role) => (
              <Chip
                key={role}
                label={role}
                size="small"
                color={getRoleColor(role) as any}
                variant="outlined"
              />
            ))}
          </Box>
        )}

        {/* Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Chip
            label={user.status === 'active' ? 'نشط' : user.status === 'suspended' ? 'موقوف' : 'قيد الانتظار'}
            color={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'error' : 'warning'}
            size="small"
          />
          
          <Typography variant="caption" color="text.secondary">
            {formatDate(user.createdAt)}
          </Typography>
        </Box>
      </CardContent>

      {showActions && (
        <CardActions>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={() => handleAction(onView || (() => {}))}
          >
            عرض
          </Button>
          <Button
            size="small"
            startIcon={<Edit />}
            onClick={() => handleAction(onEdit || (() => {}))}
          >
            تعديل
          </Button>
          {onToggleStatus && (
            <Button
              size="small"
              color={user.status === 'active' ? 'warning' : 'success'}
              onClick={() => handleAction(onToggleStatus)}
            >
              {user.status === 'active' ? 'إيقاف' : 'تفعيل'}
            </Button>
          )}
        </CardActions>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {onView && (
          <MenuItem onClick={() => handleAction(onView)}>
            <Visibility sx={{ mr: 1 }} fontSize="small" />
            عرض التفاصيل
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={() => handleAction(onEdit)}>
            <Edit sx={{ mr: 1 }} fontSize="small" />
            تعديل
          </MenuItem>
        )}
        {onToggleStatus && (
          <MenuItem onClick={() => handleAction(onToggleStatus)}>
            <Chip
              label={user.status === 'active' ? 'إيقاف' : 'تفعيل'}
              color={user.status === 'active' ? 'warning' : 'success'}
              size="small"
              sx={{ mr: 1 }}
            />
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem 
            onClick={() => handleAction(onDelete)}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} fontSize="small" />
            حذف
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default UserCard;

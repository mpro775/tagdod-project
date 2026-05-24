import React, { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Switch, Tooltip } from '@mui/material';
import { MoreVert, Edit, Delete, Restore, PowerSettingsNew } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { User } from '../types/user.types';

interface UserRowActionsProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
  onStatusToggle: (user: User, checked: boolean) => void;
}

export const UserRowActions: React.FC<UserRowActionsProps> = ({
  user,
  onEdit,
  onDelete,
  onRestore,
  onStatusToggle,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDeleted = !!user.deletedAt;

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    handleClose();
    action();
  };

  if (isDeleted) {
    return (
      <Box>
        <Tooltip title={t('users:actions.restore', 'استعادة')}>
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              onRestore(user);
            }}
          >
            <Restore fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box>
      <Tooltip title={t('users:actions.toggleStatus', 'تفعيل/إيقاف')}>
        <Switch
          checked={user.status === 'active'}
          onChange={(e) => {
            e.stopPropagation();
            onStatusToggle(user, e.target.checked);
          }}
          size="small"
          color={user.status === 'active' ? 'success' : 'default'}
          sx={{ m: 0, '& .MuiSwitch-switchBase.Mui-checked': { color: 'success.main' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'success.main' } }}
          onClick={(e) => e.stopPropagation()}
        />
      </Tooltip>
      <IconButton size="small" onClick={handleOpen}>
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            sx: { minWidth: 160 },
          },
        }}
      >
        <MenuItem onClick={() => handleAction(() => onEdit(user))}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>{t('users:actions.edit', 'تعديل')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onStatusToggle(user, user.status !== 'active'))}>
          <ListItemIcon><PowerSettingsNew fontSize="small" /></ListItemIcon>
          <ListItemText>{user.status === 'active' ? t('users:actions.deactivate', 'إيقاف') : t('users:actions.activate', 'تفعيل')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onDelete(user))} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{t('users:actions.delete', 'حذف')}</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserRowActions;
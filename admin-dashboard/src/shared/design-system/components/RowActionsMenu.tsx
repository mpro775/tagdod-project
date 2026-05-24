import { useState, type ReactNode } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { MoreVert } from '@mui/icons-material';

export interface RowAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface RowActionsMenuProps {
  actions: RowAction[];
  menuId?: string;
}

export function RowActionsMenu({ actions, menuId }: RowActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const visibleActions = actions.filter((a) => !a.disabled);
  if (visibleActions.length === 0) return null;

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
        aria-label="إجراءات"
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              '& .MuiMenuItem-root': {
                py: 0.75,
                px: 1.5,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {actions.map((action, index) => {
          if (action.divider) {
            return <Divider key={`divider-${index}`} />;
          }
          return (
            <MenuItem
              key={action.label}
              onClick={() => {
                handleClose();
                action.onClick();
              }}
              disabled={action.disabled}
              sx={{
                ...(action.danger && {
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.light',
                    color: 'error.dark',
                  },
                }),
              }}
            >
              {action.icon && <ListItemIcon sx={{ minWidth: 32, ...(action.danger && { color: 'error.main' }) }}>{action.icon}</ListItemIcon>}
              <ListItemText primary={action.label} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

export default RowActionsMenu;
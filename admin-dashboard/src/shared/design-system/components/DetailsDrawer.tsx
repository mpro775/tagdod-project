import type { ReactNode } from 'react';
import { Box, Divider, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';

export interface DetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  width?: number;
}

export function DetailsDrawer({
  open,
  onClose,
  title,
  description,
  actions,
  children,
  width = 440,
}: DetailsDrawerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Drawer
      anchor={theme.direction === 'rtl' ? 'left' : 'right'}
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          zIndex: isMobile ? theme.zIndex.drawer + 3 : theme.zIndex.drawer,
        },
      }}
      PaperProps={{
        sx: {
          width: isMobile ? '100vw' : width,
          maxWidth: '100vw',
        },
      }}
    >
      <Stack sx={{ height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} p={2.5}>
          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }} noWrap>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Stack>
          <IconButton onClick={onClose} aria-label="إغلاق" sx={{ flexShrink: 0 }}>
            <Close />
          </IconButton>
        </Stack>
        <Divider />
        <Box sx={{ p: 2.5, flex: 1, overflow: 'auto' }}>{children}</Box>
        {actions && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>{actions}</Box>
          </>
        )}
      </Stack>
    </Drawer>
  );
}

export default DetailsDrawer;
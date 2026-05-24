import type { ReactNode } from 'react';
import { Box, Container, Stack } from '@mui/material';

export interface PageShellProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | false;
  spacing?: 'compact' | 'normal' | 'relaxed';
  fullHeight?: boolean;
}

const spacingMap = {
  compact: 1.25,
  normal: 2,
  relaxed: 3,
} as const;

export function PageShell({
  children,
  maxWidth = false,
  spacing = 'normal',
  fullHeight = false,
}: PageShellProps) {
  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        minHeight: fullHeight ? 'calc(100vh - 96px)' : undefined,
        overflowX: 'hidden',
      }}
    >
      <Container maxWidth={maxWidth} disableGutters={maxWidth === false}>
        <Stack spacing={spacingMap[spacing]}>{children}</Stack>
      </Container>
    </Box>
  );
}

export default PageShell;
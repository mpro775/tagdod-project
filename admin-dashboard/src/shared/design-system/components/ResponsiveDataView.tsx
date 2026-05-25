import type { ReactNode } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';

export interface ResponsiveDataViewProps<T> {
  rows: T[];
  columns?: any[];
  renderCard: (item: T, index: number) => ReactNode;
  renderTable?: (rows: T[]) => ReactNode;
  cardBreakpoint?: 'xs' | 'sm' | 'md';
  viewMode?: 'auto' | 'table' | 'grid';
  loading?: boolean;
  error?: any;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  errorTitle?: string;
  onRetry?: () => void;
  gridProps?: {
    columns?: number;
    spacing?: number;
  };
  cardContainerSx?: object;
  getRowId?: (row: T) => string | number;
}

export function ResponsiveDataView<T extends Record<string, any>>({
  rows,
  renderCard,
  renderTable,
  cardBreakpoint = 'sm',
  viewMode = 'auto',
  loading = false,
  error,
  emptyTitle = 'لا توجد بيانات حتى الآن',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  errorTitle = 'لم نتمكن من تحميل البيانات',
  onRetry,
  gridProps,
  cardContainerSx,
  getRowId,
}: ResponsiveDataViewProps<T>) {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const isXsOnly = useMediaQuery(theme.breakpoints.only('xs'));
  const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));

  let showCardLayout: boolean;
  if (viewMode === 'grid') {
    showCardLayout = true;
  } else if (viewMode === 'table') {
    showCardLayout = false;
  } else {
    switch (cardBreakpoint) {
      case 'xs':
        showCardLayout = isXsOnly;
        break;
      case 'md':
        showCardLayout = isBelowMd;
        break;
      default:
        showCardLayout = isMobile;
        break;
    }
  }

  if (loading) {
    return <LoadingState variant="skeleton" rows={4} />;
  }

  if (error) {
    return <ErrorState title={errorTitle} onRetry={onRetry} />;
  }

  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  const gridColumns = gridProps?.columns ?? 2;
  const gridSpacing = gridProps?.spacing ?? 2;

  if (showCardLayout) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: `repeat(${gridColumns}, minmax(0, 1fr))`,
          },
          gap: gridSpacing,
          width: '100%',
          ...cardContainerSx,
        }}
      >
        {rows.map((item, index) => {
          const key = getRowId ? String(getRowId(item)) : String(index);
          return (
            <Box key={key} sx={{ minWidth: 0 }}>
              {renderCard(item, index)}
            </Box>
          );
        })}
      </Box>
    );
  }

  if (renderTable) {
    return <Box sx={{ width: '100%', overflowX: 'auto', minWidth: 0 }}>{renderTable(rows)}</Box>;
  }

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        لا يمكن عرض البيانات في هذا العرض
      </Typography>
    </Box>
  );
}

export default ResponsiveDataView;
import { Children, type ReactNode } from 'react';
import { Box } from '@mui/material';

export interface PageSummaryGridProps {
  children: ReactNode;
  columns?: number;
  spacing?: number;
}

export function PageSummaryGrid({
  children,
  columns = 4,
  spacing = 2.5,
}: PageSummaryGridProps) {
  const childArray = Children.toArray(children);

  const getGridCols = (cols: number) => {
    if (cols <= 2) return { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' };
    if (cols === 3) return { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' };
    return { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: `repeat(${cols}, minmax(0, 1fr))` };
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: getGridCols(columns),
        gap: spacing,
        width: '100%',
      }}
    >
      {childArray.map((child, index) => (
        <Box key={index} sx={{ minWidth: 0 }}>
          {child}
        </Box>
      ))}
    </Box>
  );
}

export default PageSummaryGrid;
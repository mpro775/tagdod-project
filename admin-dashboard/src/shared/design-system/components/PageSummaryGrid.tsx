import { Children, type ReactNode } from 'react';
import { Box } from '@mui/material';

export interface PageSummaryGridProps {
  children: ReactNode;
  columns?: number;
  spacing?: number;
  dense?: boolean;
}

export function PageSummaryGrid({
  children,
  columns = 4,
  spacing,
  dense = false,
}: PageSummaryGridProps) {
  const childArray = Children.toArray(children);
  const effectiveSpacing = spacing ?? (dense ? 1.25 : 1.75);

  const getResponsiveCols = (cols: number) => {
    if (cols <= 2) return { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' };
    if (cols === 3) return { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' };
    return {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      md: childArray.length > 4 ? 'repeat(3, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
      lg: `repeat(${cols}, minmax(0, 1fr))`,
    };
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: getResponsiveCols(columns),
        gap: effectiveSpacing,
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
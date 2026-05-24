import { Children, type ReactNode } from 'react';
import { Box } from '@mui/material';

export interface PageSummaryGridProps {
  children: ReactNode;
  columns?: number;
  spacing?: number;
  dense?: boolean;
  compact?: boolean;
}

export function PageSummaryGrid({
  children,
  columns = 4,
  spacing,
  dense = false,
  compact = false,
}: PageSummaryGridProps) {
  const childArray = Children.toArray(children);
  const effectiveSpacing = spacing ?? (compact ? 0.75 : dense ? 1.25 : 1.75);

  const getResponsiveCols = (cols: number) => {
    if (compact) {
      return {
        xs: 'repeat(2, minmax(0, 1fr))',
        sm: 'repeat(3, minmax(0, 1fr))',
        md: 'repeat(4, minmax(0, 1fr))',
        lg: `repeat(min(${cols}, ${childArray.length}), minmax(0, 1fr))`,
      };
    }
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
import { Children, type ReactNode } from 'react';
import { Grid } from '@mui/material';

export interface PageSummaryGridProps {
  children: ReactNode;
  columns?: number;
  spacing?: number;
}

const getColumnSize = (columns: number) => {
  if (columns === 2) return { xs: 6, sm: 6, md: 6 };
  if (columns === 3) return { xs: 6, sm: 4, md: 4 };
  return { xs: 6, sm: 6, md: 3 };
};

export function PageSummaryGrid({
  children,
  columns = 4,
  spacing = 2.5,
}: PageSummaryGridProps) {
  const childArray = Children.toArray(children);
  const colSize = getColumnSize(columns);

  return (
    <Grid container spacing={spacing}>
      {childArray.map((child, index) => (
        <Grid
          key={index}
          size={columns <= 4 ? colSize : { xs: 6, sm: 4, md: Math.max(2, Math.floor(12 / columns)) }}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
}

export default PageSummaryGrid;
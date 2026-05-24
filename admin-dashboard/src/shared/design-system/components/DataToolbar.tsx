import type { ReactNode } from 'react';
import { Box, Chip, InputAdornment, Paper, Stack, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';
import { designRadius } from '../tokens';

export interface DataToolbarFilter {
  label: string;
  value?: string | number | boolean | null;
  onDelete?: () => void;
}

export interface DataToolbarProps {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  activeFilters?: DataToolbarFilter[];
  actions?: ReactNode;
}

export function DataToolbar({
  searchValue,
  searchPlaceholder = 'بحث...',
  onSearchChange,
  filters,
  activeFilters = [],
  actions,
}: DataToolbarProps) {
  const visibleActiveFilters = activeFilters.filter(
    (filter) => filter.value !== undefined && filter.value !== null && filter.value !== ''
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${designRadius.lg}px`,
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ minWidth: 0, flex: 1 }}
          >
            {onSearchChange && (
              <TextField
                size="small"
                value={searchValue ?? ''}
                placeholder={searchPlaceholder}
                onChange={(event) => onSearchChange(event.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 280 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            {filters}
          </Stack>
          {actions && <Box>{actions}</Box>}
        </Stack>

        {visibleActiveFilters.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {visibleActiveFilters.map((filter) => (
              <Chip
                key={`${filter.label}-${String(filter.value)}`}
                label={`${filter.label}: ${String(filter.value)}`}
                size="small"
                variant="outlined"
                onDelete={filter.onDelete}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default DataToolbar;

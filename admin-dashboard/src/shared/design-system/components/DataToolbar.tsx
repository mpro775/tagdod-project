import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Chip,
  Drawer,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  Theme,
  IconButton,
} from '@mui/material';
import { FilterList, Search, Close } from '@mui/icons-material';
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
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const visibleActiveFilters = activeFilters.filter(
    (filter) => filter.value !== undefined && filter.value !== null && filter.value !== ''
  );

  const filterCount = visibleActiveFilters.length;

  const filterContent = (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
        الفلاتر
      </Typography>
      {filters}
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
  );

  if (isMobile) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: `${designRadius.lg}px`,
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {onSearchChange && (
                <TextField
                  size="small"
                  fullWidth
                  value={searchValue ?? ''}
                  placeholder={searchPlaceholder}
                  onChange={(event) => onSearchChange(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Box>
            {filters && (
              <IconButton
                onClick={() => setFilterDrawerOpen(true)}
                aria-label="فتح الفلاتر"
                color={filterCount > 0 ? 'primary' : 'default'}
              >
                <Badge badgeContent={filterCount} color="primary" max={9}>
                  <FilterList />
                </Badge>
              </IconButton>
            )}
            {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
          </Stack>

          {filterCount > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {visibleActiveFilters.slice(0, 3).map((filter) => (
                <Chip
                  key={`${filter.label}-${String(filter.value)}`}
                  label={`${filter.label}: ${String(filter.value)}`}
                  size="small"
                  variant="outlined"
                  onDelete={filter.onDelete}
                />
              ))}
              {filterCount > 3 && (
                <Chip
                  label={`+${filterCount - 3}`}
                  size="small"
                  variant="outlined"
                  onClick={() => setFilterDrawerOpen(true)}
                />
              )}
            </Stack>
          )}
        </Stack>

        <Drawer
          anchor="bottom"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          slotProps={{
            paper: {
              sx: {
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                maxHeight: '80vh',
              },
            },
          }}
        >
          <Stack sx={{ p: 2 }} spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                الفلاتر
              </Typography>
              <IconButton onClick={() => setFilterDrawerOpen(false)} aria-label="إغلاق">
                <Close />
              </IconButton>
            </Stack>
            {filterContent}
            <Button
              variant="contained"
              fullWidth
              onClick={() => setFilterDrawerOpen(false)}
            >
              تطبيق
            </Button>
          </Stack>
        </Drawer>
      </Paper>
    );
  }

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
          {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
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
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import {
  Search,
  GetApp,
  TableChart,
  ViewModule,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardPadding, getCardSpacing } from '../utils/responsive';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  // eslint-disable-next-line no-unused-vars
  format?: (value: any) => string | React.ReactNode;
  sortable?: boolean;
}

interface AnalyticsDataTableProps {
  title?: string;
  columns: Column[];
  data: any[];
  loading?: boolean;
  totalCount?: number;
  pageSize?: number;
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  actions?: Array<{
    icon: React.ReactNode;
    label: string;
    // eslint-disable-next-line no-unused-vars
    onClick: (row: any) => void;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  }>;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
  // eslint-disable-next-line no-unused-vars
  onRowClick?: (row: any) => void;
}

export const AnalyticsDataTable: React.FC<AnalyticsDataTableProps> = ({
  title,
  columns,
  data,
  loading = false,
  totalCount = data.length,
  pageSize = 10,
  searchable = true,
  filterable = true,
  exportable = true,
  actions = [],
  filters = [],
  onRowClick,
}) => {
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const cardSpacing = getCardSpacing(breakpoint);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(breakpoint.isXs ? 'cards' : 'table');

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value,
    }));
    setPage(0);
  };

  const handleExport = () => {
    // Export data to CSV
    if (filteredData.length === 0) {
      alert(t('table.exportNoData'));
      return;
    }

    try {
      // Prepare CSV header
      const headers = columns.map(col => col.label).join(',');
      
      // Prepare CSV rows
      const rows = filteredData.map(row => {
        return columns.map(col => {
          const value = row[col.id];
          // Handle different value types
          if (value === null || value === undefined) {
            return '';
          }
          // Format the value if format function exists
          const formattedValue = col.format && typeof col.format === 'function' 
            ? String(col.format(value)).replace(/<[^>]*>/g, '') // Remove HTML tags
            : String(value);
          
          // Escape commas and quotes in CSV
          const escapedValue = formattedValue.includes(',') || formattedValue.includes('"')
            ? `"${formattedValue.replace(/"/g, '""')}"`
            : formattedValue;
          
          return escapedValue;
        }).join(',');
      });

      // Combine headers and rows
      const csvContent = [headers, ...rows].join('\n');

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error exporting data:', error);
      alert(t('table.exportError'));
    }
  };

  // Filter and search data
  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row => String(row[key]) === value);
      }
    });

    return result;
  }, [data, searchTerm, activeFilters]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!orderBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, orderBy, order]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, page, rowsPerPage]);

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: 'table' | 'cards' | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Render card view
  const renderCardView = () => (
    <Box>
      {paginatedData.length === 0 ? (
        <Typography 
          variant="body2" 
          color="text.secondary"
          textAlign="center"
          sx={{ py: breakpoint.isXs ? 3 : 4, fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
        >
          {t('table.noData')}
        </Typography>
      ) : (
        <Stack spacing={cardSpacing}>
          {paginatedData.map((row, index) => (
            <Card 
              key={index}
              sx={{ 
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:hover': onRowClick ? {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                } : {},
              }}
              onClick={() => onRowClick?.(row)}
            >
              <CardContent sx={{ p: cardPadding }}>
                <Stack spacing={1}>
                  {columns.map((column) => (
                    <Box key={column.id}>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: breakpoint.isXs ? '0.6875rem' : undefined,
                          fontWeight: 600,
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        {column.label}
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          fontSize: breakpoint.isXs ? '0.8125rem' : undefined,
                          wordBreak: 'break-word',
                        }}
                      >
                        {column.format ? column.format(row[column.id]) : row[column.id]}
                      </Typography>
                    </Box>
                  ))}
                  {actions.length > 0 && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {actions.map((action, actionIndex) => (
                          <Tooltip key={actionIndex} title={action.label}>
                            <IconButton
                              size={breakpoint.isXs ? 'small' : 'medium'}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                              color={action.color}
                            >
                              {action.icon}
                            </IconButton>
                          </Tooltip>
                        ))}
                      </Stack>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );

  return (
    <Card>
      <CardContent sx={{ p: cardPadding }}>
        {/* Header */}
        <Stack
          direction={breakpoint.isMobile ? 'column' : 'row'}
          spacing={breakpoint.isMobile ? 1.5 : 0}
          sx={{
            justifyContent: 'space-between',
            alignItems: breakpoint.isMobile ? 'flex-start' : 'center',
            mb: 2,
          }}
        >
          <Typography 
            variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
            sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
          >
            {title || t('table.title')}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {breakpoint.isMobile && (
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size={breakpoint.isXs ? 'small' : 'medium'}
                aria-label="view mode"
              >
                <ToggleButton value="table" aria-label="table view">
                  <TableChart fontSize={breakpoint.isXs ? 'small' : 'medium'} />
                </ToggleButton>
                <ToggleButton value="cards" aria-label="cards view">
                  <ViewModule fontSize={breakpoint.isXs ? 'small' : 'medium'} />
                </ToggleButton>
              </ToggleButtonGroup>
            )}
            {exportable && (
              <Tooltip title={t('table.export')}>
                <IconButton 
                  onClick={handleExport} 
                  color="primary"
                  size={breakpoint.isXs ? 'medium' : 'small'}
                >
                  <GetApp fontSize={breakpoint.isXs ? 'small' : 'medium'} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* Search and Filters */}
        {(searchable || filterable) && (
          <Stack
            direction={breakpoint.isMobile ? 'column' : 'row'}
            spacing={breakpoint.isMobile ? cardSpacing : 2}
            sx={{ mb: 2 }}
          >
            {searchable && (
              <TextField
                size={breakpoint.isXs ? 'medium' : 'small'}
                placeholder={t('table.search')}
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ minWidth: breakpoint.isMobile ? '100%' : 200 }}
                fullWidth={breakpoint.isMobile}
              />
            )}

            {filterable && filters.map((filter) => (
              <FormControl 
                key={filter.key} 
                size={breakpoint.isXs ? 'medium' : 'small'} 
                sx={{ minWidth: breakpoint.isMobile ? '100%' : 150 }}
                fullWidth={breakpoint.isMobile}
              >
                <InputLabel>{filter.label}</InputLabel>
                <Select
                  value={activeFilters[filter.key] || ''}
                  label={filter.label}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                >
                  <MenuItem value="">
                    <em>{t('table.all')}</em>
                  </MenuItem>
                  {filter.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Stack>
        )}

        {/* Table or Card View */}
        {loading ? (
          <Box sx={{ py: breakpoint.isXs ? 3 : 4, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
            >
              {t('table.loading')}
            </Typography>
          </Box>
        ) : viewMode === 'cards' && breakpoint.isMobile ? (
          renderCardView()
        ) : (
          <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
            <Table size={breakpoint.isXs ? 'small' : 'medium'}>
              <TableHead
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[800]
                      : theme.palette.grey[100],
                }}
              >
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ 
                        minWidth: breakpoint.isXs ? undefined : column.minWidth,
                        whiteSpace: breakpoint.isXs ? 'nowrap' : 'normal',
                      }}
                      sortDirection={orderBy === column.id ? order : false}
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'text.primary',
                        fontSize: breakpoint.isXs ? '0.75rem' : undefined,
                        px: breakpoint.isXs ? 1 : 2,
                      }}
                    >
                      {column.sortable ? (
                        <TableSortLabel
                          active={orderBy === column.id}
                          direction={orderBy === column.id ? order : 'asc'}
                          onClick={() => handleSort(column.id)}
                          sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell 
                      align="center" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'text.primary',
                        fontSize: breakpoint.isXs ? '0.75rem' : undefined,
                        px: breakpoint.isXs ? 1 : 2,
                      }}
                    >
                      {t('table.actions')}
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length + (actions.length > 0 ? 1 : 0)} 
                      align="center"
                      sx={{ py: breakpoint.isXs ? 2 : 3 }}
                    >
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                      >
                        {t('table.noData')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        cursor: onRowClick ? 'pointer' : 'default',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map((column) => (
                        <TableCell 
                          key={column.id} 
                          align={column.align}
                          sx={{ 
                            fontSize: breakpoint.isXs ? '0.8125rem' : undefined,
                            px: breakpoint.isXs ? 1 : 2,
                            whiteSpace: breakpoint.isXs ? 'nowrap' : 'normal',
                          }}
                        >
                          {column.format ? column.format(row[column.id]) : row[column.id]}
                        </TableCell>
                      ))}
                      {actions.length > 0 && (
                        <TableCell 
                          align="center"
                          sx={{ px: breakpoint.isXs ? 1 : 2 }}
                        >
                          <Stack 
                            direction="row" 
                            spacing={0.5}
                            sx={{ 
                              justifyContent: 'center',
                              flexWrap: 'wrap',
                            }}
                          >
                            {actions.map((action, actionIndex) => (
                              <Tooltip key={actionIndex} title={action.label}>
                                <IconButton
                                  size={breakpoint.isXs ? 'small' : 'medium'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(row);
                                  }}
                                  color={action.color}
                                >
                                  {action.icon}
                                </IconButton>
                              </Tooltip>
                            ))}
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('table.rowsPerPage')}
          labelDisplayedRows={({ from, to, count }) =>
            count !== -1 
              ? t('table.displayedRows', { from, to, count })
              : t('table.displayedRowsMore', { from, to })
          }
          sx={{
            '& .MuiTablePagination-selectLabel': {
              fontSize: breakpoint.isXs ? '0.75rem' : undefined,
            },
            '& .MuiTablePagination-displayedRows': {
              fontSize: breakpoint.isXs ? '0.75rem' : undefined,
            },
            '& .MuiTablePagination-select': {
              fontSize: breakpoint.isXs ? '0.75rem' : undefined,
            },
            flexWrap: breakpoint.isXs ? 'wrap' : 'nowrap',
          }}
        />
      </CardContent>
    </Card>
  );
};

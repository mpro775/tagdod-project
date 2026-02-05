import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridSortModel,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { Box, Paper, TextField, InputAdornment, Button } from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import './DataTable.css';

export interface DataTableProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  loading?: boolean;

  // Pagination
  paginationModel: GridPaginationModel;
  // eslint-disable-next-line no-unused-vars
  onPaginationModelChange: (model: GridPaginationModel) => void;
  // Server-side pagination support
  rowCount?: number; // Total number of rows (for server-side pagination)
  paginationMode?: 'client' | 'server'; // Default: 'client'

  // Sorting
  sortModel?: GridSortModel;
  // eslint-disable-next-line no-unused-vars
  onSortModelChange?: (model: GridSortModel) => void;
  sortingMode?: 'client' | 'server'; // Default: 'client'

  // Selection
  selectable?: boolean;
  // eslint-disable-next-line no-unused-vars
  onRowSelectionModelChange?: (selection: string[]) => void;

  // Toolbar
  title?: string;
  searchPlaceholder?: string;
  // eslint-disable-next-line no-unused-vars
  onSearch?: (query: string) => void;
  onAdd?: () => void;
  addButtonText?: string;

  // Height
  height?: number | string;
  rowHeight?: number | 'auto' | ((params: { id: string | number }) => number | 'auto');
  getRowHeight?: (params: { id: string | number }) => number | 'auto';

  // Row actions
  // eslint-disable-next-line no-unused-vars
  onRowClick?: (params: { row: unknown }) => void;

  // Row ID
  // eslint-disable-next-line no-unused-vars
  getRowId?: (row: unknown) => string | number;

  // Custom styles
  sx?: object;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  loading = false,
  paginationModel,
  onPaginationModelChange,
  rowCount,
  paginationMode = 'client',
  sortModel,
  onSortModelChange,
  sortingMode = 'client',
  selectable = false,
  onRowSelectionModelChange,
  title,
  searchPlaceholder,
  onSearch,
  onAdd,
  addButtonText = 'إضافة',
  height = 600,
  rowHeight,
  getRowHeight,
  onRowClick,
  getRowId,
  sx,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  // Calculate actual height - ensure it's a valid value
  const actualHeight = typeof height === 'string' && height === '100%' 
    ? '100%' 
    : typeof height === 'number' 
      ? `${height}px` 
      : height || '600px';

  return (
    <Paper sx={{ width: '100%', height: actualHeight, display: 'flex', flexDirection: 'column', minHeight: typeof height === 'string' && height === '100%' ? 600 : undefined }}>
      {/* Toolbar */}
      {(title || onSearch || onAdd) && (
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 2, sm: 0 },
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flex: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' }
          }}>
            {title && (
              <Box sx={{ 
                fontSize: { xs: 16, sm: 18 }, 
                fontWeight: 'bold',
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                {title}
              </Box>
            )}
            {onSearch && (
              <TextField
                size="small"
                placeholder={searchPlaceholder || 'بحث...'}
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ 
                  minWidth: { xs: '100%', sm: 250, md: 300 },
                  width: { xs: '100%', sm: 'auto' }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Box>

          {onAdd && (
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={onAdd}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                minWidth: { xs: 'auto', sm: 120 }
              }}
            >
              {addButtonText}
            </Button>
          )}
        </Box>
      )}

      {/* Data Execution Grid */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', height: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          // Row ID
          getRowId={getRowId}
          // Row height - use getRowHeight if provided, otherwise use rowHeight
          {...(getRowHeight 
            ? { getRowHeight } 
            : rowHeight && typeof rowHeight !== 'function'
              ? { rowHeight: rowHeight === 'auto' ? undefined : rowHeight }
              : {})}
          // Pagination
          paginationMode={paginationMode}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          rowCount={rowCount ?? rows.length}
          pageSizeOptions={[10, 20, 30, 50, 75, 100]}
          // Sorting
          sortingMode={sortingMode}
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
          // Selection
          checkboxSelection={selectable}
          onRowSelectionModelChange={(selection) => {
            onRowSelectionModelChange?.(selection as unknown as string[]);
          }}
          // Row click
          onRowClick={onRowClick}
          // Style
          disableRowSelectionOnClick
          autoHeight={false}
          sx={{
            flex: 1,
            border: 'none',
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            '& .MuiDataGrid-root': {
              height: '100%',
              width: '100%',
              border: 'none',
            },
            '& .MuiDataGrid-main': {
              height: '100%',
              width: '100%',
            },
            '& .MuiDataGrid-virtualScroller': {
              width: '100%',
            },
            '& .MuiDataGrid-virtualScrollerContent': {
              width: '100%',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              cursor: onRowClick ? 'pointer' : 'default',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? theme.palette.grey[800] 
                  : theme.palette.grey[100],
              width: '100%',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
              color: 'text.primary',
            },
            '& .MuiDataGrid-cell': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              padding: { xs: '8px', sm: '12px 16px' },
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 'normal',
              '& > *': {
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            },
            '& .MuiDataGrid-row': {
              minHeight: '72px !important',
              maxHeight: 'none !important',
            },
            '& .MuiDataGrid-columnHeader': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              padding: { xs: '4px 8px', sm: '8px 16px' },
            },
            // Use :first-of-type instead of :first-child for SSR safety
            '& .MuiDataGrid-row:first-of-type': {
              borderTop: 'none',
            },
            '& .MuiDataGrid-cell:first-of-type': {
              borderLeft: 'none',
            },
            '& .MuiDataGrid-columnHeader:first-of-type': {
              borderLeft: 'none',
            },
            '& .MuiDataGrid-footerContainer:first-of-type': {
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            },
            // Additional overrides for any MUI internal :first-child usage
            '& .MuiDataGrid-main > div:first-of-type': {
              overflow: 'auto',
            },
            '& .MuiDataGrid-columnHeaders:first-of-type': {
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-virtualScrollerContent:first-of-type': {
              minHeight: '100%',
            },
            ...sx,
          }}
        // Responsive settings
        disableColumnMenu={false}
        disableColumnFilter={false}
        disableColumnSelector={false}
        />
      </Box>
    </Paper>
  );
};

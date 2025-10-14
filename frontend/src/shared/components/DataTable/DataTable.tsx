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

export interface DataTableProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  loading?: boolean;

  // Pagination
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  rowCount: number;

  // Sorting
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;

  // Selection
  selectable?: boolean;
  onRowSelectionModelChange?: (selection: string[]) => void;

  // Toolbar
  title?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onAdd?: () => void;
  addButtonText?: string;

  // Height
  height?: number | string;

  // Row actions
  onRowClick?: (params: { row: unknown }) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  loading = false,
  paginationModel,
  onPaginationModelChange,
  rowCount,
  sortModel,
  onSortModelChange,
  selectable = false,
  onRowSelectionModelChange,
  title,
  searchPlaceholder,
  onSearch,
  onAdd,
  addButtonText = 'إضافة',
  height = 600,
  onRowClick,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <Paper sx={{ width: '100%', height }}>
      {/* Toolbar */}
      {(title || onSearch || onAdd) && (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {title && (
              <Box sx={{ fontSize: 18, fontWeight: 'bold' }}>{title}</Box>
            )}
            {onSearch && (
              <TextField
                size="small"
                placeholder={searchPlaceholder || 'بحث...'}
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ minWidth: 300 }}
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
            <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
              {addButtonText}
            </Button>
          )}
        </Box>
      )}

      {/* Data Grid */}
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        // Pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        rowCount={rowCount}
        pageSizeOptions={[10, 20, 50, 100]}
        // Sorting
        sortingMode="server"
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
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            cursor: onRowClick ? 'pointer' : 'default',
          },
        }}
      />
    </Paper>
  );
};


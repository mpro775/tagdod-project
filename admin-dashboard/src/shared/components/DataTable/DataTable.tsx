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
  // eslint-disable-next-line no-unused-vars
  onPaginationModelChange: (model: GridPaginationModel) => void;

  // Sorting
  sortModel?: GridSortModel;
  // eslint-disable-next-line no-unused-vars
  onSortModelChange?: (model: GridSortModel) => void;

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

  // Row actions
  // eslint-disable-next-line no-unused-vars
  onRowClick?: (params: { row: unknown }) => void;

  // Row ID
  // eslint-disable-next-line no-unused-vars
  getRowId?: (row: unknown) => string | number;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  loading = false,
  paginationModel,
  onPaginationModelChange,
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
  getRowId,
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

      {/* Data Grid */}
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        // Row ID
        getRowId={getRowId}
        // Pagination
        paginationMode="client"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[5, 10, 20, 50]}
        // Sorting
        sortingMode="client"
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
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'background.paper',
          },
          '& .MuiDataGrid-cell': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '4px 8px', sm: '8px 16px' },
          },
          '& .MuiDataGrid-columnHeader': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '4px 8px', sm: '8px 16px' },
          },
        }}
        // Responsive settings
        autoHeight={false}
        disableColumnMenu={false}
        disableColumnFilter={false}
        disableColumnSelector={false}
      />
    </Paper>
  );
};

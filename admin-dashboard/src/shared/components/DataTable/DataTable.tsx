import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridSortModel,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { Box, Paper, TextField, InputAdornment, Button, Pagination, Typography } from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import './DataTable.css';

export interface DataTableProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  loading?: boolean;

  paginationModel: GridPaginationModel;
  // eslint-disable-next-line no-unused-vars
  onPaginationModelChange: (model: GridPaginationModel) => void;
  rowCount?: number;
  paginationMode?: 'client' | 'server';
  customPagination?: boolean;

  sortModel?: GridSortModel;
  // eslint-disable-next-line no-unused-vars
  onSortModelChange?: (model: GridSortModel) => void;
  sortingMode?: 'client' | 'server';

  selectable?: boolean;
  // eslint-disable-next-line no-unused-vars
  onRowSelectionModelChange?: (selection: string[]) => void;

  title?: string;
  searchPlaceholder?: string;
  // eslint-disable-next-line no-unused-vars
  onSearch?: (query: string) => void;
  onAdd?: () => void;
  addButtonText?: string;

  height?: number | string;
  rowHeight?: number | 'auto' | ((params: { id: string | number }) => number | 'auto');
  getRowHeight?: (params: { id: string | number }) => number | 'auto';

  // eslint-disable-next-line no-unused-vars
  onRowClick?: (params: { row: unknown }) => void;

  // eslint-disable-next-line no-unused-vars
  getRowId?: (row: unknown) => string | number;

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
  customPagination = false,
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

  const actualHeight = typeof height === 'string' && height === '100%'
    ? '100%'
    : typeof height === 'number'
      ? `${height}px`
      : height || '600px';

  const totalRows = paginationMode === 'server' ? (rowCount ?? 0) : rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / Math.max(1, paginationModel.pageSize)));

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: actualHeight,
        display: 'flex',
        flexDirection: 'column',
        minHeight: typeof height === 'string' && height === '100%' ? 600 : undefined,
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {(title || onSearch || onAdd) && (
        <Box
          sx={{
            p: { xs: 1, sm: 1.5 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 1.5, sm: 1 },
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.02)'
                : 'rgba(248,250,252,0.9)',
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
                fontSize: { xs: 15, sm: 16 },
                fontWeight: 700,
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
                  minWidth: { xs: '100%', sm: 220 },
                  width: { xs: '100%', sm: 'auto' }
                }}
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

          {onAdd && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={onAdd}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                minWidth: { xs: 'auto', sm: 100 }
              }}
            >
              {addButtonText}
            </Button>
          )}
        </Box>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', height: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={getRowId}
          columnHeaderHeight={48}
          rowHeight={typeof rowHeight === 'number' ? rowHeight : 56}
          {...(getRowHeight ? { getRowHeight } : {})}
          paginationMode={paginationMode}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          rowCount={rowCount ?? rows.length}
          pageSizeOptions={[10, 20, 30, 50, 75, 100]}
          hideFooterPagination={customPagination}
          sortingMode={sortingMode}
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
          checkboxSelection={selectable}
          onRowSelectionModelChange={(selection) => {
            onRowSelectionModelChange?.(selection as unknown as string[]);
          }}
          onRowClick={onRowClick}
          disableRowSelectionOnClick
          autoHeight={false}
          density="compact"
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
                  ? theme.palette.grey[900]
                  : theme.palette.grey[50],
              width: '100%',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: 'text.primary',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.8125rem',
              padding: '0 12px',
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
              minHeight: '56px !important',
              maxHeight: 'none !important',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              transition: 'background-color 0.15s ease',
              '&:nth-of-type(even)': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.015)'
                    : 'rgba(248,250,252,0.4)',
              },
              '&:hover': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(37,99,235,0.04)',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'inset 3px 0 0 rgba(96,165,250,0.85)'
                    : 'inset 3px 0 0 rgba(37,99,235,0.65)',
              },
            },
            '& .MuiDataGrid-columnHeader': {
              fontSize: '0.8125rem',
              padding: '0 12px',
            },
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
        disableColumnMenu={false}
        disableColumnFilter={false}
        disableColumnSelector={false}
        />
      </Box>

      {customPagination && totalRows > 0 && (
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: 1,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {Math.min(paginationModel.page + 1, totalPages)} / {totalPages}
          </Typography>
          <Pagination
            count={totalPages}
            page={Math.min(paginationModel.page + 1, totalPages)}
            onChange={(_event, page) =>
              onPaginationModelChange({
                ...paginationModel,
                page: Math.max(0, page - 1),
              })
            }
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
            size="small"
          />
        </Box>
      )}
    </Paper>
  );
};
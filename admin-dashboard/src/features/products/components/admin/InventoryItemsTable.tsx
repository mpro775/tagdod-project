import {
  Stack,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from '@mui/x-data-grid';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { StatusChip, designRadius } from '@/shared/design-system';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  product: string;
  productId: string;
  stock: number;
  minStock: number;
  price: number;
  status: 'available' | 'low' | 'out';
  updatedAt?: string;
  isVariant: boolean;
}

interface InventoryItemsTableProps {
  rows: InventoryItem[];
  loading?: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  rowCount?: number;
  onView: (item: InventoryItem) => void;
}

export const InventoryItemsTable: React.FC<InventoryItemsTableProps> = ({
  rows,
  loading = false,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  rowCount,
  onView,
}) => {
  const { t } = useTranslation('products');

  const getStatusLabel = (status: InventoryItem['status']) => {
    switch (status) {
      case 'available':
        return t('inventory.status.available', 'متوفر');
      case 'low':
        return t('inventory.status.low', 'منخفض');
      case 'out':
        return t('inventory.status.out', 'نفذ');
    }
  };

  const getStatusTone = (status: InventoryItem['status']): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'available':
        return 'success';
      case 'low':
        return 'warning';
      case 'out':
        return 'error';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('inventory.columns.name', 'الاسم'),
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <Stack spacing={0}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.value}
          </Typography>
          {params.row.isVariant && (
            <Typography variant="caption" color="text.secondary">
              {t('inventory.variant', 'متغير')}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      field: 'sku',
      headerName: 'SKU',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }} noWrap>
          {params.value || '—'}
        </Typography>
      ),
    },
    {
      field: 'product',
      headerName: t('inventory.columns.product', 'المنتج'),
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'stock',
      headerName: t('inventory.columns.stock', 'المخزون'),
      width: 100,
      type: 'number',
      renderCell: (params) => {
        const value = params.value as number;
        const minStock = params.row.minStock as number;
        const color = value === 0 ? 'error.main' : value <= minStock ? 'warning.main' : 'text.primary';
        return (
          <Typography variant="body2" fontWeight={600} color={color}>
            {value.toLocaleString('en-US')}
          </Typography>
        );
      },
    },
    {
      field: 'minStock',
      headerName: t('inventory.columns.minStock', 'الحد الأدنى'),
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {(params.value as number).toLocaleString('en-US')}
        </Typography>
      ),
    },
    {
      field: 'price',
      headerName: t('inventory.columns.price', 'السعر'),
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2">
          ${(params.value as number).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: t('inventory.columns.status', 'الحالة'),
      width: 120,
      renderCell: (params) => {
        const status = params.value as InventoryItem['status'];
        return (
          <StatusChip
            label={getStatusLabel(status)}
            status={getStatusTone(status)}
            size="small"
          />
        );
      },
      sortComparator: (a: string, b: string) => {
        const order: Record<string, number> = { available: 0, low: 1, out: 2 };
        return (order[a] ?? 0) - (order[b] ?? 0);
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title={t('inventory.viewDetails', 'عرض التفاصيل')}>
          <IconButton size="small" onClick={() => onView(params.row as InventoryItem)}>
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto',
        minWidth: 0,
        '& .MuiDataGrid-root': {
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: `${designRadius.lg}px`,
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        rowCount={rowCount ?? rows.length}
        paginationMode={rowCount && rowCount > rows.length ? 'server' : 'client'}
        sortingMode="client"
        pageSizeOptions={[10, 20, 50]}
        getRowId={(row) => (row as InventoryItem).id}
        disableRowSelectionOnClick
        density="compact"
        sx={{
          '& .MuiDataGrid-columnHeader': {
            fontWeight: 700,
            fontSize: '0.8rem',
          },
        }}
      />
    </Box>
  );
};
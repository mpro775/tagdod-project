import {
  Avatar,
  Typography,
  Box,
  Chip,
  Alert,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import PercentIcon from '@mui/icons-material/Percent';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useState, useMemo } from 'react';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import type { MostFavoritedProduct } from '../types/favorites.types';
import { useFavoritesStats, useMostFavoritedProducts } from '../hooks/useFavoritesAdmin';

interface MostFavoritedProductsTableProps {
  limit?: number;
}

const getProductName = (product: MostFavoritedProduct['product']) =>
  product?.nameAr || product?.name || product?.nameEn || product?._id;

export function MostFavoritedProductsTable({ limit }: MostFavoritedProductsTableProps) {
  const { data: stats } = useFavoritesStats();
  // Use a large limit to fetch all products for client-side pagination
  const { data, isLoading } = useMostFavoritedProducts(limit ?? 1000);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const products = data?.data ?? [];
  const totalFavorites = stats?.total ?? data?.meta?.total ?? 0;

  // All hooks must be called before any conditional returns
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'rank',
        headerName: '#',
        width: 80,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id);
          const rank = paginationModel.page * paginationModel.pageSize + rowIndex + 1;
          return (
            <Typography variant="body2" fontWeight="bold">
              {rank}
            </Typography>
          );
        },
      },
      {
        field: 'product',
        headerName: 'المنتج',
        flex: 1,
        minWidth: 300,
        renderCell: (params) => {
          const item = params.row as MostFavoritedProduct;
          const name = getProductName(item.product) ?? item.productId;
          const mainImageId = item.product?.mainImageId;
          const imageUrl = typeof mainImageId === 'object' && mainImageId !== null 
            ? mainImageId.url 
            : undefined;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
              <Avatar
                src={imageUrl}
                alt={name || 'product'}
                sx={{ width: 48, height: 48, borderRadius: 2 }}
                variant={imageUrl ? 'rounded' : 'circular'}
              >
                <StarIcon />
              </Avatar>
              <Typography variant="subtitle1" fontWeight={600}>
                {name}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'count',
        headerName: 'عدد الإضافات',
        width: 150,
        align: 'center',
        headerAlign: 'center',
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body1" fontWeight="medium">
            {params.value.toLocaleString('en-US')}
          </Typography>
        ),
      },
      {
        field: 'percentage',
        headerName: 'نسبة المساهمة',
        width: 180,
        align: 'center',
        headerAlign: 'center',
        valueGetter: (_value, row: MostFavoritedProduct) => {
          return totalFavorites > 0 ? Math.round((row.count / totalFavorites) * 1000) / 10 : 0;
        },
        renderCell: (params) => {
          const percentage = params.value as number;
          return (
            <Chip
              icon={<PercentIcon sx={{ fontSize: '1rem !important' }} />}
              label={`${percentage.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}
              color={percentage > 15 ? 'success' : percentage > 5 ? 'primary' : 'default'}
              variant="outlined"
            />
          );
        },
      },
    ],
    [paginationModel, totalFavorites]
  );

  // Show empty state only if data is loaded and empty
  if (!isLoading && (!data || !data.data || products.length === 0)) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          لا توجد بيانات متاحة حالياً
        </Typography>
        <Typography variant="body2">
          سيظهر هنا أكثر المنتجات التي يضيفها المستخدمون إلى قوائم المفضلة بمجرد توفر البيانات.
        </Typography>
      </Alert>
    );
  }

  return (
    <DataTable
      title="المنتجات الأكثر إضافة للمفضلة"
      columns={columns}
      rows={products}
      loading={isLoading}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      rowCount={products.length}
      paginationMode="client"
      sortModel={sortModel}
      onSortModelChange={setSortModel}
      getRowId={(row) => (row as MostFavoritedProduct).productId}
      height={600}
    />
  );
}



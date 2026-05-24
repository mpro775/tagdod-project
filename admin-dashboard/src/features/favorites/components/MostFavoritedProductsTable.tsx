import {
  Avatar,
  Typography,
  Box,
  Chip,
  Alert,
  Stack,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import PercentIcon from '@mui/icons-material/Percent';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useState, useMemo } from 'react';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { SectionCard } from '@/shared/design-system/components/SectionCard';
import type { MostFavoritedProduct } from '../types/favorites.types';
import { useFavoritesStats, useMostFavoritedProducts } from '../hooks/useFavoritesAdmin';

interface MostFavoritedProductsTableProps {
  limit?: number;
}

const getProductName = (product: MostFavoritedProduct['product']) =>
  product?.nameAr || product?.name || product?.nameEn || product?._id;

export function MostFavoritedProductsTable({ limit }: MostFavoritedProductsTableProps) {
  const { data: stats } = useFavoritesStats();
  const { data, isLoading } = useMostFavoritedProducts(limit ?? 1000);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const products = data?.data ?? [];
  const totalFavorites = stats?.total ?? data?.meta?.total ?? 0;

  const top3 = products.slice(0, 3);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'rank',
        headerName: '#',
        width: 70,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id);
          const rank = paginationModel.page * paginationModel.pageSize + rowIndex + 1;
          return (
            <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {rank <= 3 ? <EmojiEventsIcon sx={{ fontSize: 16, mr: 0.5, color: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32' }} /> : null}
              {rank}
            </Typography>
          );
        },
      },
      {
        field: 'product',
        headerName: 'المنتج',
        flex: 1,
        minWidth: 240,
        renderCell: (params) => {
          const item = params.row as MostFavoritedProduct;
          const name = getProductName(item.product) ?? item.productId;
          const mainImageId = item.product?.mainImageId;
          const imageUrl = typeof mainImageId === 'object' && mainImageId !== null
            ? mainImageId.url
            : undefined;
          return (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
              <Avatar
                src={imageUrl}
                alt={name || 'product'}
                sx={{ width: 36, height: 36, borderRadius: 1 }}
                variant={imageUrl ? 'rounded' : 'circular'}
              >
                <StarIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" fontWeight="medium" noWrap>
                  {name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {item.productId}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        field: 'count',
        headerName: 'عدد الإضافات',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight="medium">
            {params.value.toLocaleString('en-US')}
          </Typography>
        ),
      },
      {
        field: 'percentage',
        headerName: 'نسبة المساهمة',
        width: 130,
        align: 'center',
        headerAlign: 'center',
        valueGetter: (_value: any, row: MostFavoritedProduct) => {
          return totalFavorites > 0 ? Math.round((row.count / totalFavorites) * 1000) / 10 : 0;
        },
        renderCell: (params) => {
          const percentage = params.value as number;
          return (
            <Chip
              icon={<PercentIcon sx={{ fontSize: '0.9rem !important' }} />}
              label={`${percentage.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}
              color={percentage > 15 ? 'success' : percentage > 5 ? 'primary' : 'default'}
              variant="outlined"
              size="small"
            />
          );
        },
      },
    ],
    [paginationModel, totalFavorites]
  );

  if (!isLoading && (!data || !data.data || products.length === 0)) {
    return (
      <SectionCard title="المنتجات الأكثر إضافة للمفضلة">
        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            لا توجد بيانات متاحة حالياً
          </Typography>
          <Typography variant="caption" color="text.secondary">
            سيظهر هنا أكثر المنتجات التي يضيفها المستخدمون إلى قوائم المفضلة بمجرد توفر البيانات.
          </Typography>
        </Alert>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="المنتجات الأكثر إضافة للمفضلة">
      {top3.length > 0 && (
        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          {top3.map((item: MostFavoritedProduct, index: number) => {
            const name = getProductName(item.product) ?? item.productId;
            const mainImageId = item.product?.mainImageId;
            const imageUrl = typeof mainImageId === 'object' && mainImageId !== null ? mainImageId.url : undefined;
            const rank = index + 1;
            return (
              <Box
                key={item.productId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: rank === 1 ? 'warning.main' : rank === 2 ? 'grey.400' : rank === 3 ? '#CD7F32' : 'divider',
                  bgcolor: rank === 1 ? 'warning.50' : 'transparent',
                  flex: '1 1 200px',
                  minWidth: 180,
                }}
              >
                <EmojiEventsIcon sx={{ fontSize: 18, color: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32' }} />
                <Avatar src={imageUrl} sx={{ width: 28, height: 28 }} variant={imageUrl ? 'rounded' : 'circular'}>
                  <StarIcon sx={{ fontSize: 14 }} />
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" fontWeight="bold" noWrap>{name}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                    {item.count.toLocaleString('en-US')} إضافة
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
      <DataTable
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
        height={400}
        density="compact"
      />
    </SectionCard>
  );
}
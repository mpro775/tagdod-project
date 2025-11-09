import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Typography,
  Box,
  Skeleton,
  Chip,
  Stack,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import PercentIcon from '@mui/icons-material/Percent';
import type { MostFavoritedProduct } from '../types/favorites.types';
import { useFavoritesStats, useMostFavoritedProducts } from '../hooks/useFavoritesAdmin';

interface MostFavoritedProductsTableProps {
  limit?: number;
}

const getProductName = (product: MostFavoritedProduct['product']) =>
  product?.nameAr || product?.name || product?.nameEn || product?._id;

export function MostFavoritedProductsTable({ limit = 10 }: MostFavoritedProductsTableProps) {
  const { data: stats } = useFavoritesStats();
  const { data, isLoading } = useMostFavoritedProducts(limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader
          title="المنتجات الأكثر إضافة للمفضلة"
          subheader="عرض لأكثر المنتجات شعبية بين المستخدمين"
        />
        <CardContent>
          <Stack spacing={2}>
            {[1, 2, 3, 4, 5].map((row) => (
              <Skeleton key={row} variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const totalFavorites = stats?.total ?? data?.reduce((acc, item) => acc + item.count, 0) ?? 0;

  return (
    <Card>
      <CardHeader
        title="المنتجات الأكثر إضافة للمفضلة"
        subheader="استخدم النتائج لتنسيق الحملات التسويقية وتحديث المخزون"
      />
      <CardContent sx={{ px: 0 }}>
        {data && data.length > 0 ? (
          <Table
            sx={{
              minWidth: 600,
              '& th': { fontWeight: 600 },
              '& td, & th': { direction: 'rtl' },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell align="right">#</TableCell>
                <TableCell>المنتج</TableCell>
                <TableCell align="center">عدد الإضافات</TableCell>
                <TableCell align="center">نسبة المساهمة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => {
                const name = getProductName(item.product) ?? item.productId;
                const percentage =
                  totalFavorites > 0 ? Math.round((item.count / totalFavorites) * 1000) / 10 : 0;
                const imageUrl = item.product?.mainImageId?.url;

                return (
                  <TableRow key={item.productId} hover>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={imageUrl}
                          alt={name || 'product'}
                          sx={{ width: 48, height: 48, borderRadius: 2 }}
                          variant={imageUrl ? 'rounded' : 'circular'}
                        >
                          <StarIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {name}
                          </Typography>
                          {item.product?.slug && (
                            <Chip
                              size="small"
                              label={item.product.slug}
                              sx={{ mt: 0.5, maxWidth: 'fit-content' }}
                              color="default"
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight="medium">
                        {item.count.toLocaleString('ar-SA')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<PercentIcon sx={{ fontSize: '1rem !important' }} />}
                        label={`${percentage.toLocaleString('ar-SA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}
                        color={percentage > 15 ? 'success' : percentage > 5 ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              px: 3,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              لا توجد بيانات متاحة حالياً
            </Typography>
            <Typography variant="body2" color="text.secondary">
              سيظهر هنا أكثر المنتجات التي يضيفها المستخدمون إلى قوائم المفضلة بمجرد توفر البيانات.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}



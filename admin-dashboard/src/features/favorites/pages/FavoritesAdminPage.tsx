import {
  Box,
  Typography,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Refresh,
  Star,
  Sync,
  Shield,
  TrendingUp,
} from '@mui/icons-material';
import { PageShell } from '@/shared/design-system/components/PageShell';
import { PageHeader } from '@/shared/design-system/components/PageHeader';
import { PageSummaryGrid } from '@/shared/design-system';
import { SectionCard } from '@/shared/design-system/components/SectionCard';
import { FavoritesStatsCards } from '../components/FavoritesStatsCards';
import { MostFavoritedProductsTable } from '../components/MostFavoritedProductsTable';
import { useFavoritesStats } from '../hooks/useFavoritesAdmin';

const formatNumber = (value?: number) => (value ?? 0).toLocaleString('en-US');

export function FavoritesAdminPage() {
  const { data: stats } = useFavoritesStats();

  const topProduct = stats && (stats as any).topProduct
    ? (stats as any).topProduct
    : null;

  const insightCards = [
    {
      title: 'فرصة تسويقية',
      description: 'المنتجات الأعلى في المفضلة مناسبة للعروض أو الحملات التسويقية.',
      icon: <TrendingUp color="success" />,
    },
    {
      title: 'جودة البيانات',
      description: 'راقب سجلات الضيوف أو العناصر غير المتزامنة لتحسين جودة البيانات.',
      icon: <Shield color="primary" />,
    },
    {
      title: 'حالة المزامنة',
      description: `${formatNumber(stats?.totalSynced)} عنصر تمت مزامنته من الجلسات السابقة.`,
      icon: <Sync color="info" />,
    },
  ];

  return (
    <PageShell spacing="compact">
      <PageHeader
        variant="compact"
        title="تحليلات المفضلة"
        description="متابعة المنتجات الأكثر حفظاً وسلوك المستخدمين في المفضلة"
        actions={[
          {
            label: 'تحديث',
            icon: <Refresh fontSize="small" />,
            onClick: () => {},
            variant: 'secondary',
          },
        ]}
      />

      <FavoritesStatsCards />

      {topProduct && (
        <SectionCard title="أكثر منتج تمت إضافته للمفضلة">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={topProduct.image || undefined}
              variant="rounded"
              sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
            >
              <Star />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {topProduct.name || 'منتج'}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  {formatNumber(topProduct.count)} إضافة
                </Typography>
                {topProduct.percentage && (
                  <Typography variant="body2" color="primary">
                    {topProduct.percentage}% من الإجمالي
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </SectionCard>
      )}

      <MostFavoritedProductsTable />

      <PageSummaryGrid columns={3} compact>
        {insightCards.map((card) => (
          <SectionCard key={card.title} title="">
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box sx={{ mt: 0.25 }}>{card.icon}</Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {card.description}
                </Typography>
              </Box>
            </Stack>
          </SectionCard>
        ))}
      </PageSummaryGrid>
    </PageShell>
  );
}
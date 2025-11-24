import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { Grid } from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import SyncIcon from '@mui/icons-material/Sync';
import ShieldIcon from '@mui/icons-material/Shield';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useMemo } from 'react';
import { FavoritesStatsCards } from '../components/FavoritesStatsCards';
import { MostFavoritedProductsTable } from '../components/MostFavoritedProductsTable';
import { useFavoritesStats } from '../hooks/useFavoritesAdmin';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

const formatNumber = (value?: number) => (value ?? 0).toLocaleString('en-US');

export function FavoritesAdminPage() {
  const breakpoint = useBreakpoint();
  const { data: stats } = useFavoritesStats();

  const insights = useMemo(
    () => [
      {
        icon: <FavoriteBorderIcon color="error" />,
        primary: 'أفضل المنتجات أداءً في المفضلة',
        secondary:
          'يمكنك استخدام قائمة المنتجات الأكثر تفضيلاً لتنسيق العروض وتسليط الضوء عليها في الحملات التسويقية.',
      },
      {
        icon: <SyncIcon color="success" />,
        primary: `عناصر تمت مزامنتها (${formatNumber(stats?.totalSynced)})`,
        secondary:
          'تظهر هنا العناصر التي تم تحويلها من جلسات الأجهزة السابقة إلى حسابات المستخدمين بعد تسجيل الدخول.',
      },
      {
        icon: <ShieldIcon color="primary" />,
        primary: 'سجلات قديمة غير مرتبطة',
        secondary:
          'تابع العناصر غير المرتبطة بأي حساب للتأكد من مزامنتها أو تنظيفها بشكل دوري لتحسين جودة البيانات.',
      },
    ],
    [stats?.totalSynced]
  );

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, pb: { xs: 3, sm: 4 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, mt: { xs: 1, sm: 2 } }}>
        <Typography
          variant={breakpoint.isMobile ? 'h5' : 'h4'}
          component="h1"
          fontWeight="bold"
          gutterBottom
        >
          إدارة المفضلات
        </Typography>
        <Typography variant="body2" color="text.secondary">
          لوحة تحكم تركز على سلوك المستخدمين المسجلين داخل قوائم المفضلة، بما في ذلك التحليلات
          السريعة والمنتجات الأكثر شعبية.
        </Typography>
      </Box>

      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <FavoritesStatsCards />
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <MostFavoritedProductsTable />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: '100%',
              bgcolor: 'background.paper',
              backgroundImage: 'none',
            }}
          >
            <CardHeader
              avatar={<InsightsIcon color="primary" />}
              title="مؤشرات سريعة"
              subheader="نصائح عملية للتعامل مع بيانات المفضلات"
            />
            <Divider />
            <CardContent sx={{ pt: 0 }}>
              <List sx={{ py: 0 }}>
                {insights.map((item, index) => (
                  <ListItem key={index} alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 42 }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={600}>
                          {item.primary}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                          {item.secondary}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

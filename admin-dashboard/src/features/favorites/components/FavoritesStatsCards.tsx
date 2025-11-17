import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import { Grid } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupIcon from '@mui/icons-material/Group';
import SyncIcon from '@mui/icons-material/Sync';
import ArchiveIcon from '@mui/icons-material/Inventory';
import type { FavoritesStats } from '../types/favorites.types';
import { useFavoritesStats } from '../hooks/useFavoritesAdmin';

const formatNumber = (value: number | undefined) =>
  (value ?? 0).toLocaleString('en-US');

interface StatCard {
  title: string;
  description: string;
  value: number;
  icon: React.ReactNode;
  accentColor: string;
}

const buildCards = (stats?: FavoritesStats): StatCard[] => [
  {
    title: 'إجمالي عناصر المفضلة',
    description: 'مجموع جميع العناصر النشطة في قوائم المفضلة',
    value: stats?.total ?? 0,
    icon: <FavoriteIcon sx={{ fontSize: 40, color: 'error.main' }} />,
    accentColor: '#f06292',
  },
  {
    title: 'مستخدمون لديهم مفضلة',
    description: 'عدد الحسابات التي تحتوي على عنصر واحد على الأقل',
    value: stats?.totalUsers ?? 0,
    icon: <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    accentColor: '#64b5f6',
  },
  {
    title: 'عناصر تمت مزامنتها بنجاح',
    description: 'عناصر تم نقلها من أجهزة سابقة إلى حسابات المستخدمين',
    value: stats?.totalSynced ?? 0,
    icon: <SyncIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    accentColor: '#81c784',
  },
  {
    title: 'سجلات قديمة غير مرتبطة',
    description: 'عناصر محفوظة مؤقتاً بانتظار المزامنة أو المراجعة',
    value: stats?.totalGuests ?? 0,
    icon: <ArchiveIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
    accentColor: '#ffd54f',
  },
];

export function FavoritesStatsCards() {
  const { data: stats, isLoading } = useFavoritesStats();

  if (isLoading) {
    return (
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                bgcolor: 'background.paper',
                backgroundImage: 'none',
              }}
            >
              <CardContent>
                <Skeleton variant="rectangular" height={120} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {buildCards(stats).map((card, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s ease',
              },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                height: '4px',
                bgcolor: card.accentColor,
              }}
            />
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  {formatNumber(card.value)}
                </Typography>
                {card.icon}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}



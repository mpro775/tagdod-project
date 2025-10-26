import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { Grid } from '@mui/material';
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useAddressStats } from '../hooks/useAddresses';

export function AddressStatsCards() {
  const { data: stats, isLoading } = useAddressStats();

  const cards = [
    {
      title: 'إجمالي العناوين',
      value: stats?.totalAddresses || 0,
      icon: <LocationIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#3f51b5',
    },
    {
      title: 'العناوين النشطة',
      value: stats?.totalActiveAddresses || 0,
      icon: <ActiveIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: '#4caf50',
    },
    {
      title: 'المستخدمون',
      value: stats?.totalUsers || 0,
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: '#2196f3',
    },
    {
      title: 'متوسط لكل مستخدم',
      value: stats?.averagePerUser?.toFixed(1) || '0.0',
      icon: <TrendingIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: '#ff9800',
    },
    {
      title: 'المحذوفة',
      value: stats?.totalDeletedAddresses || 0,
      icon: <DeleteIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      color: '#f44336',
    },
  ];

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={100} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={index}>
          <Card
            sx={{
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
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
                bgcolor: card.color,
              }}
            />
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                {card.icon}
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold" gutterBottom>
                {card.value.toLocaleString('ar')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}


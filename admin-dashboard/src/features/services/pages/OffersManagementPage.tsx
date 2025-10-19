import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  RequestQuote,

  LocationOn,
  AttachMoney,
  Search,
  FilterList,
} from '@mui/icons-material';
import { useOffers, useOffersStatistics } from '../hooks/useServices';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';

const statusColors = {
  OFFERED: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
} as const;

const statusLabels = {
  OFFERED: 'مُقدم',
  ACCEPTED: 'مقبول',
  REJECTED: 'مرفوض',
  CANCELLED: 'ملغي',
} as const;

export const OffersManagementPage: React.FC = () => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  const { data: offersData, isLoading: isOffersLoading } = useOffers(filters);
  const { data: statistics, isLoading: isStatisticsLoading } = useOffersStatistics();

  const offers = offersData?.data || [];
  const isLoading = isOffersLoading || isStatisticsLoading;

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: keyof typeof statusColors) => statusColors[status];
  const getStatusLabel = (status: keyof typeof statusLabels) => statusLabels[status];

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          إدارة العروض
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  // إحصائيات من الباك ايند
  const totalOffers = statistics?.totalOffers || 0;
  const acceptedOffers = statistics?.acceptedOffers || 0;
  const pendingOffers = statistics?.pendingOffers || 0;
  const totalValue = statistics?.totalValue || 0;
  const averageOffer = statistics?.averageOffer || 0;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          إدارة العروض
        </Typography>
      </Box>

      {/* إحصائيات سريعة */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid  size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    إجمالي العروض
                  </Typography>
                  <Typography variant="h4">
                    {totalOffers}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <RequestQuote />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid  size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    العروض المقبولة
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {acceptedOffers}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <RequestQuote />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid  size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    العروض المعلقة
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {pendingOffers}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <RequestQuote />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid  size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    إجمالي قيمة العروض
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {formatCurrency(totalValue)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid  size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    متوسط قيمة العرض
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    {formatCurrency(averageOffer)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* الفلاتر */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            فلاتر البحث
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid  size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="البحث"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            
            <Grid  size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>حالة العرض</InputLabel>
                <Select
                  value={filters.status}
                  label="حالة العرض"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">جميع الحالات</MenuItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
              <Grid  size={{ xs: 12, sm: 6, md: 4 }}>
              <Button
                variant="contained"
                startIcon={<FilterList />}
                fullWidth
              >
                تطبيق الفلاتر
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* جدول العروض */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            قائمة العروض
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>العرض</TableCell>
                  <TableCell>المهندس</TableCell>
                  <TableCell>الطلب</TableCell>
                  <TableCell>المبلغ</TableCell>
                  <TableCell>المسافة</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>التاريخ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(offer.amount)}
                        </Typography>
                        {offer.note && (
                          <Typography variant="caption" color="textSecondary">
                            {offer.note.length > 50 
                              ? `${offer.note.substring(0, 50)}...` 
                              : offer.note
                            }
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 32, height: 32 }}>
                          {offer.engineer?.firstName?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {offer.engineer?.firstName} {offer.engineer?.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {offer.engineer?.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {offer.request?.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {offer.request?.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="success.main">
                        {formatCurrency(offer.amount)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <LocationOn sx={{ mr: 0.5, fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {offer.distanceKm ? `${offer.distanceKm} كم` : '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={getStatusLabel(offer.status as keyof typeof statusLabels)}
                        color={getStatusColor(offer.status as keyof typeof statusColors)}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(offer.createdAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

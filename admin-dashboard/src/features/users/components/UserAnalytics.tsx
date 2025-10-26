import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
  Engineering as EngineeringIcon,
} from '@mui/icons-material';
import { UserStats } from '../types/user.types';

interface UserAnalyticsProps {
  stats: UserStats;
  loading?: boolean;
  onDateRangeChange?: (range: string) => void;
}

interface AnalyticsData {
  period: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  deletedUsers: number;
  admins: number;
  engineers: number;
  merchants: number;
  growthRate: number;
  retentionRate: number;
  topRoles: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  userActivity: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
  }>;
}

const PERIOD_OPTIONS = [
  { value: '7d', label: 'آخر 7 أيام' },
  { value: '30d', label: 'آخر 30 يوم' },
  { value: '90d', label: 'آخر 90 يوم' },
  { value: '1y', label: 'آخر سنة' },
];

export const UserAnalytics: React.FC<UserAnalyticsProps> = ({ stats, onDateRangeChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Mock analytics data - in real app, this would come from API
  const analyticsData: AnalyticsData = {
    period: selectedPeriod,
    totalUsers: stats.total,
    newUsers: Math.floor(stats.total * 0.1), // 10% of total
    activeUsers: stats.active,
    suspendedUsers: stats.suspended,
    deletedUsers: stats.deleted,
    admins: stats.admins,
    engineers: stats.engineers,
    merchants: stats.merchants,
    growthRate: 15.5, // 15.5% growth
    retentionRate: 87.3, // 87.3% retention
    topRoles: [
      {
        role: 'مستخدم',
        count: stats.total - stats.admins - stats.engineers - stats.merchants,
        percentage: 65,
      },
      { role: 'مهندس', count: stats.engineers, percentage: 20 },
      { role: 'تاجر', count: stats.merchants, percentage: 10 },
      { role: 'مدير', count: stats.admins, percentage: 5 },
    ],
    userActivity: [
      { date: '2024-01-01', newUsers: 5, activeUsers: 120 },
      { date: '2024-01-02', newUsers: 3, activeUsers: 118 },
      { date: '2024-01-03', newUsers: 7, activeUsers: 125 },
      { date: '2024-01-04', newUsers: 4, activeUsers: 122 },
      { date: '2024-01-05', newUsers: 6, activeUsers: 128 },
    ],
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    onDateRangeChange?.(period);
  };

  const getGrowthIcon = (rate: number) => {
    return rate >= 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />;
  };

  const getGrowthColor = (rate: number) => {
    return rate >= 0 ? 'success' : 'error';
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
          >
            <Typography variant="h6" fontWeight="bold">
              تحليلات المستخدمين
            </Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>الفترة الزمنية</InputLabel>
              <Select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                label="الفترة الزمنية"
              >
                {PERIOD_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Key Metrics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PeopleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      {analyticsData.totalUsers.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المستخدمين
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getGrowthIcon(analyticsData.growthRate)}
                    <Typography
                      variant="body2"
                      color={`${getGrowthColor(analyticsData.growthRate)}.main`}
                      sx={{ ml: 0.5 }}
                    >
                      +{analyticsData.growthRate}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonAddIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      {analyticsData.newUsers.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    مستخدمين جدد
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUpIcon color="success" />
                    <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                      +{analyticsData.newUsers}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AdminIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      {analyticsData.admins.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    المديرين
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {((analyticsData.admins / analyticsData.totalUsers) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EngineeringIcon color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      {analyticsData.engineers.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    المهندسين
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {((analyticsData.engineers / analyticsData.totalUsers) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* User Roles Distribution */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                توزيع الأدوار
              </Typography>
              <Grid container spacing={2}>
                {analyticsData.topRoles.map((role, index) => (
                  <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                          {role.count}
                        </Avatar>
                        <Typography variant="body2" fontWeight="bold">
                          {role.role}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={role.percentage}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {role.count} مستخدم ({role.percentage}%)
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </Box>
  );
};

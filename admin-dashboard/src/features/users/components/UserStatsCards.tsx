import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Engineering as EngineeringIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { UserStats } from '../types/user.types';

interface UserStatsCardsProps {
  stats: UserStats;
  loading?: boolean;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats, loading = false }) => {
  const statsData = [
    {
      title: 'إجمالي المستخدمين',
      value: stats.total,
      icon: <PeopleIcon />,
      color: 'primary',
      percentage: 100,
    },
    {
      title: 'المستخدمين النشطين',
      value: stats.active,
      icon: <PersonIcon />,
      color: 'success',
      percentage: stats.total > 0 ? (stats.active / stats.total) * 100 : 0,
    },
    {
      title: 'المستخدمين المعلقين',
      value: stats.suspended,
      icon: <BlockIcon />,
      color: 'warning',
      percentage: stats.total > 0 ? (stats.suspended / stats.total) * 100 : 0,
    },
    {
      title: 'المستخدمين المحذوفين',
      value: stats.deleted,
      icon: <DeleteIcon />,
      color: 'error',
      percentage: stats.total > 0 ? (stats.deleted / stats.total) * 100 : 0,
    },
    {
      title: 'المديرين',
      value: stats.admins,
      icon: <AdminIcon />,
      color: 'info',
      percentage: stats.total > 0 ? (stats.admins / stats.total) * 100 : 0,
    },
    {
      title: 'المهندسين',
      value: stats.engineers,
      icon: <EngineeringIcon />,
      color: 'secondary',
      percentage: stats.total > 0 ? (stats.engineers / stats.total) * 100 : 0,
    },
    {
      title: 'التجار',
      value: stats.wholesale,
      icon: <StoreIcon />,
      color: 'success',
      percentage: stats.total > 0 ? (stats.wholesale / stats.total) * 100 : 0,
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        إحصائيات المستخدمين
      </Typography>
      
      <Grid container spacing={2}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: `${stat.color}.light`,
                      color: `${stat.color}.main`,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  {loading ? '...' : stat.value.toLocaleString()}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={stat.percentage}
                    sx={{ 
                      flexGrow: 1, 
                      mr: 1,
                      backgroundColor: `${stat.color}.light`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: `${stat.color}.main`,
                      }
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {stat.percentage.toFixed(1)}%
                  </Typography>
                </Box>
                
                <Chip
                  label={`${stat.percentage.toFixed(1)}% من الإجمالي`}
                  size="small"
                  color={stat.color as any}
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

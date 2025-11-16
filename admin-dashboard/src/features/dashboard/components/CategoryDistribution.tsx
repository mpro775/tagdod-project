import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, alpha, Skeleton } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

interface CategoryData {
  name: string;
  value: number;
  color?: string;
}

interface CategoryDistributionProps {
  salesData?: any;
  revenueCharts?: {
    byCategory?: Array<{ category: string; revenue: number; percentage?: number }>;
  };
  isLoading?: boolean;
}

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({ 
  salesData,
  revenueCharts,
  isLoading 
}) => {
  const theme = useTheme();
  const { t } = useTranslation(['dashboard']);

  const PREDEFINED_COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
    theme.palette.secondary.main,
  ];

  // Use real data from API or fallback to empty
  // Priority: salesByCategory > revenueCharts.byCategory > categoryBreakdown > revenueByCategory
  let categoryData: any[] = [];
  
  // Debug logging (يمكن إزالتها لاحقاً)
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('CategoryDistribution - salesData:', salesData);
    // eslint-disable-next-line no-console
    console.log('CategoryDistribution - revenueCharts:', revenueCharts);
    // eslint-disable-next-line no-console
    console.log('CategoryDistribution - isLoading:', isLoading);
  }
  
  // معالجة البيانات فقط إذا لم تكن قيد التحميل
  if (!isLoading) {
    if (salesData && typeof salesData === 'object') {
      // جرب جميع الحقول المحتملة
      if (Array.isArray(salesData.salesByCategory) && salesData.salesByCategory.length > 0) {
        categoryData = salesData.salesByCategory;
      } else if (Array.isArray(salesData.categoryBreakdown) && salesData.categoryBreakdown.length > 0) {
        categoryData = salesData.categoryBreakdown;
      } else if (Array.isArray(salesData.revenueByCategory) && salesData.revenueByCategory.length > 0) {
        categoryData = salesData.revenueByCategory;
      }
    }
    
    // Fallback to dashboard revenueCharts.byCategory if salesData is empty
    if (categoryData.length === 0 && revenueCharts && typeof revenueCharts === 'object') {
      if (Array.isArray(revenueCharts.byCategory) && revenueCharts.byCategory.length > 0) {
        categoryData = revenueCharts.byCategory.map((cat) => ({
          categoryName: cat.category,
          category: cat.category,
          revenue: cat.revenue || 0,
          percentage: cat.percentage,
        }));
      }
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('CategoryDistribution - categoryData:', categoryData);
  }
  
  const totalRevenue = salesData?.totalRevenue || 
                       categoryData.reduce((sum: number, cat: any) => sum + (cat.revenue || cat.totalRevenue || 0), 0) || 
                       1;

  const chartData: CategoryData[] = categoryData.length > 0 
    ? categoryData
        .filter((cat: any) => {
          // تصفية الفئات التي لديها إيرادات أكبر من 0
          const revenue = cat.revenue || cat.totalRevenue || 0;
          return revenue > 0;
        })
        .map((cat: any, index: number) => {
          const revenue = cat.revenue || cat.totalRevenue || 0;
          const percentage = cat.percentage !== undefined 
            ? cat.percentage 
            : totalRevenue > 0 
              ? Math.round((revenue / totalRevenue) * 100) 
              : 0;
          
          return {
            name: cat.categoryName || cat.category || cat.name || t('categoryDistribution.unknown', 'غير محدد'),
            value: percentage || 0,
            color: PREDEFINED_COLORS[index % PREDEFINED_COLORS.length],
          };
        })
    : [];

  const COLORS = chartData.map(item => item.color || theme.palette.primary.main);

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {t('categoryDistribution.title', 'توزيع الفئات')}
          </Typography>
          <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rectangular" height={32} width="50%" />
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Handle empty data
  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {t('categoryDistribution.title', 'توزيع الفئات')}
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('categoryDistribution.empty', 'لا توجد بيانات للفئات')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontWeight="bold"
        fontSize="14"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {t('categoryDistribution.title', 'توزيع الفئات')}
        </Typography>

        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.map((_, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [`${value}%`, t('categoryDistribution.tooltip', 'النسبة')]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span style={{ fontSize: '13px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Category list */}
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {chartData.map((category, index) => (
            <Box
              key={category.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                borderRadius: 1,
                bgcolor: alpha(COLORS[index], 0.05),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: COLORS[index],
                  }}
                />
                <Typography variant="body2">{category.name}</Typography>
              </Box>
              <Typography variant="body2" fontWeight="600">
                {category.value}%
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};


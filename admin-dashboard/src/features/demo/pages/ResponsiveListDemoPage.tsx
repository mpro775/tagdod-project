import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Switch, FormControlLabel } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { ResponsiveListWrapper } from '@/shared/components/ResponsiveList';
import { UserCard, ProductCard, OrderCard } from '@/shared/components/Cards';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

// Mock data for demonstration
const mockUsers = [
  {
    _id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '+966501234567',
    roles: ['admin'],
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    lastLoginAt: '2024-01-20T14:22:00Z',
    avatar: null,
  },
  {
    _id: '2',
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    phone: '+966507654321',
    roles: ['user'],
    isActive: true,
    createdAt: '2024-01-10T09:15:00Z',
    lastLoginAt: '2024-01-19T16:45:00Z',
    avatar: null,
  },
  {
    _id: '3',
    name: 'محمد أحمد',
    email: 'mohamed@example.com',
    phone: '+966509876543',
    roles: ['moderator'],
    isActive: false,
    createdAt: '2024-01-05T11:20:00Z',
    lastLoginAt: '2024-01-18T12:30:00Z',
    avatar: null,
  },
];

const mockProducts = [
  {
    _id: '1',
    name: 'iPhone 15 Pro',
    sku: 'IPH15P-256-BLK',
    price: 3999,
    comparePrice: 4299,
    stock: 25,
    status: 'active',
    category: { name: 'هواتف ذكية' },
    brand: { name: 'Apple' },
    rating: 4.8,
    reviewCount: 156,
    tags: ['جديد', 'مميز', 'تخفيض'],
    isFeatured: true,
    images: [{ url: '/images/iphone15.jpg' }],
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    _id: '2',
    name: 'Samsung Galaxy S24',
    sku: 'SGS24-128-GLD',
    price: 2999,
    stock: 15,
    status: 'active',
    category: { name: 'هواتف ذكية' },
    brand: { name: 'Samsung' },
    rating: 4.6,
    reviewCount: 89,
    tags: ['جديد', 'Android'],
    isFeatured: false,
    images: [{ url: '/images/galaxy-s24.jpg' }],
    createdAt: '2024-01-12T14:20:00Z',
  },
];

const mockOrders = [
  {
    _id: '1',
    orderNumber: 'ORD-2024-001',
    customer: { name: 'أحمد محمد', email: 'ahmed@example.com' },
    total: 3999,
    status: 'delivered',
    paymentStatus: 'paid',
    items: [
      { product: { name: 'iPhone 15 Pro' }, quantity: 1 },
    ],
    shippingAddress: { city: 'الرياض', country: 'السعودية' },
    isUrgent: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
  {
    _id: '2',
    orderNumber: 'ORD-2024-002',
    customer: { name: 'فاطمة علي', email: 'fatima@example.com' },
    total: 2999,
    status: 'processing',
    paymentStatus: 'paid',
    items: [
      { product: { name: 'Samsung Galaxy S24' }, quantity: 1 },
    ],
    shippingAddress: { city: 'جدة', country: 'السعودية' },
    isUrgent: true,
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-19T11:20:00Z',
  },
];

const ResponsiveListDemoPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'users' | 'products' | 'orders'>('users');
  const [cardBreakpoint, setCardBreakpoint] = useState<'xs' | 'sm' | 'md'>('sm');
  const [showActions, setShowActions] = useState(true);
  const { current, isMobile, isTablet, isDesktop } = useBreakpoint();

  // Mock columns
  const userColumns: GridColDef[] = [
    { field: 'name', headerName: 'الاسم', minWidth: 150 },
    { field: 'email', headerName: 'البريد الإلكتروني', minWidth: 200 },
    { field: 'phone', headerName: 'الهاتف', minWidth: 130 },
    { field: 'roles', headerName: 'الأدوار', minWidth: 100 },
    { field: 'status', headerName: 'الحالة', minWidth: 80 },
  ];

  const productColumns: GridColDef[] = [
    { field: 'name', headerName: 'اسم المنتج', minWidth: 200 },
    { field: 'sku', headerName: 'كود المنتج', minWidth: 120 },
    { field: 'price', headerName: 'السعر', minWidth: 100 },
    { field: 'stock', headerName: 'المخزون', minWidth: 80 },
    { field: 'status', headerName: 'الحالة', minWidth: 100 },
  ];

  const orderColumns: GridColDef[] = [
    { field: 'orderNumber', headerName: 'رقم الطلب', minWidth: 120 },
    { field: 'customer', headerName: 'العميل', minWidth: 150 },
    { field: 'total', headerName: 'المجموع', minWidth: 100 },
    { field: 'status', headerName: 'الحالة', minWidth: 120 },
    { field: 'paymentStatus', headerName: 'حالة الدفع', minWidth: 100 },
  ];

  const getCurrentData = () => {
    switch (currentView) {
      case 'users': return mockUsers;
      case 'products': return mockProducts;
      case 'orders': return mockOrders;
      default: return [];
    }
  };

  const getCurrentColumns = () => {
    switch (currentView) {
      case 'users': return userColumns;
      case 'products': return productColumns;
      case 'orders': return orderColumns;
      default: return [];
    }
  };

  const getCurrentCardComponent = () => {
    switch (currentView) {
      case 'users': return UserCard;
      case 'products': return ProductCard;
      case 'orders': return OrderCard;
      default: return UserCard;
    }
  };

  const handleEdit = (item: any) => {
    // eslint-disable-next-line no-console
    console.log('Edit:', item);
  };

  const handleDelete = (item: any) => {
    // eslint-disable-next-line no-console
    console.log('Delete:', item);
  };

  const handleView = (item: any) => {
    // eslint-disable-next-line no-console
    console.log('View:', item);
  };

  const handleToggleStatus = (item: any) => {
    // eslint-disable-next-line no-console
    console.log('Toggle status:', item);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        تجربة القوائم المتجاوبة
      </Typography>

      {/* Breakpoint Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            معلومات الشاشة الحالية
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                الحجم الحالي: <strong>{current}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                موبايل: <strong>{isMobile ? 'نعم' : 'لا'}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                تابلت: <strong>{isTablet ? 'نعم' : 'لا'}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                سطح مكتب: <strong>{isDesktop ? 'نعم' : 'لا'}</strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            إعدادات العرض
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" gutterBottom>
                نوع البيانات:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant={currentView === 'users' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setCurrentView('users')}
                >
                  المستخدمون
                </Button>
                <Button
                  variant={currentView === 'products' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setCurrentView('products')}
                >
                  المنتجات
                </Button>
                <Button
                  variant={currentView === 'orders' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setCurrentView('orders')}
                >
                  الطلبات
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" gutterBottom>
                نقطة التبديل:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant={cardBreakpoint === 'xs' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setCardBreakpoint('xs')}
                >
                  xs
                </Button>
                <Button
                  variant={cardBreakpoint === 'sm' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setCardBreakpoint('sm')}
                >
                  sm
                </Button>
                <Button
                  variant={cardBreakpoint === 'md' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setCardBreakpoint('md')}
                >
                  md
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showActions}
                    onChange={(e) => setShowActions(e.target.checked)}
                  />
                }
                label="عرض الإجراءات"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Responsive List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            القائمة المتجاوبة
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            جرب تغيير حجم النافذة لترى كيف تتحول القائمة من DataGrid إلى البطاقات
          </Typography>

          <ResponsiveListWrapper
            data={getCurrentData()}
            loading={false}
            columns={getCurrentColumns()}
            CardComponent={getCurrentCardComponent()}
            getRowId={(item) => item._id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onToggleStatus={handleToggleStatus}
            showActions={showActions}
            cardBreakpoint={cardBreakpoint}
            emptyMessage={`لا يوجد ${currentView === 'users' ? 'مستخدمون' : currentView === 'products' ? 'منتجات' : 'طلبات'}`}
            emptyDescription="لم يتم العثور على أي عناصر في هذه القائمة"
            errorMessage="حدث خطأ أثناء تحميل البيانات"
            pagination={false}
            cardContainerProps={{
              sx: { 
                px: { xs: 1, sm: 2 },
                py: 1
              }
            }}
            gridProps={{
              sx: { 
                height: 400,
                '& .MuiDataGrid-root': {
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                },
              }
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResponsiveListDemoPage;

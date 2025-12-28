/**
 * Linked Products Page
 * صفحة المنتجات المربوطة
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Typography,
    Chip,
    Button,
    Breadcrumbs,
    Link,
    Alert,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    TextField,
    InputAdornment,
} from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
    Home,
    ChevronRight,
    Link as LinkIcon,
    Refresh,
    ArrowBack,
    Search,
    CheckCircle,
    Warning,
} from '@mui/icons-material';
import { DataTable } from '@/shared/components';
import { useLinkedProducts } from '../hooks/useInventoryIntegration';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import type { LinkedItem } from '../types/inventory-integration.types';

export const LinkedProductsPage: React.FC = () => {
    const { t } = useTranslation(['products', 'common']);
    const navigate = useNavigate();
    const { isMobile } = useBreakpoint();
    const [searchQuery, setSearchQuery] = useState('');
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

    // استدعاء الـ Hook سيعيد الآن كائناً فيه data و total
    const { data: response, isLoading, refetch } = useLinkedProducts(100);

    // استخراج البيانات من الاستجابة الجديدة
    const items = response?.data || [];
    const totalCount = response?.total || 0;

    // Filter items based on search
    const filteredItems = React.useMemo(() => {
        if (!searchQuery.trim()) return items;
        const query = searchQuery.toLowerCase();
        return items.filter(
            (item) =>
                item.sku.toLowerCase().includes(query) ||
                item.appName?.toLowerCase().includes(query) ||
                item.onyxName?.toLowerCase().includes(query)
        );
    }, [items, searchQuery]);

    // Define columns for DataTable
    const columns: GridColDef[] = [
        {
            field: 'sku',
            headerName: t('products:integration.linked.columns.sku', 'SKU'),
            flex: 1,
            minWidth: 120,
            renderCell: (params: GridRenderCellParams<LinkedItem>) => (
                <Chip
                    label={params.value}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: 'monospace' }}
                />
            ),
        },
        {
            field: 'onyxName',
            headerName: t('products:integration.linked.columns.onyxName', 'اسم أونكس'),
            flex: 1.5,
            minWidth: 150,
            renderCell: (params: GridRenderCellParams<LinkedItem>) => (
                <Typography variant="body2" noWrap>
                    {params.value || '-'}
                </Typography>
            ),
        },
        {
            field: 'appName',
            headerName: t('products:integration.linked.columns.appName', 'اسم التطبيق'),
            flex: 1.5,
            minWidth: 150,
            renderCell: (params: GridRenderCellParams<LinkedItem>) => (
                <Typography variant="body2" noWrap>
                    {params.value || '-'}
                </Typography>
            ),
        },
        {
            field: 'onyxStock',
            headerName: t('products:integration.linked.columns.onyxStock', 'مخزون أونكس'),
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<LinkedItem>) => (
                <Chip
                    label={params.value?.toLocaleString('en-US') ?? 0}
                    color="primary"
                    variant="outlined"
                    size="small"
                />
            ),
        },
        {
            field: 'appStock',
            headerName: t('products:integration.linked.columns.appStock', 'مخزون التطبيق'),
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<LinkedItem>) => {
                const row = params.row as LinkedItem;
                const isMatch = row.appStock === row.onyxStock;
                return (
                    <Chip
                        label={params.value?.toLocaleString('en-US') ?? 0}
                        color={isMatch ? 'success' : 'error'}
                        size="small"
                    />
                );
            },
        },
        {
            field: 'status',
            headerName: t('products:integration.linked.columns.status', 'الحالة'),
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<LinkedItem>) => {
                const row = params.row as LinkedItem;
                const isMatch = row.appStock === row.onyxStock;
                return (
                    <Chip
                        label={isMatch ? 'متطابق' : 'اختلاف'}
                        color={isMatch ? 'success' : 'warning'}
                        size="small"
                    />
                );
            },
        },
    ];

    // Mobile Card Component
    const LinkedItemCard = ({ item }: { item: LinkedItem }) => {
        const isMatch = item.appStock === item.onyxStock;
        return (
            <Card
                variant="outlined"
                sx={{
                    height: '100%',
                    borderColor: isMatch ? 'success.light' : 'warning.light',
                    borderWidth: 2,
                }}
            >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    {/* SKU & Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Chip
                            label={item.sku}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                        />
                        <Chip
                            icon={isMatch ? <CheckCircle sx={{ fontSize: 16 }} /> : <Warning sx={{ fontSize: 16 }} />}
                            label={isMatch ? 'متطابق' : 'اختلاف'}
                            color={isMatch ? 'success' : 'warning'}
                            size="small"
                        />
                    </Box>

                    {/* Names */}
                    <Typography variant="body2" fontWeight="bold" noWrap sx={{ mb: 0.5 }}>
                        {item.appName || item.onyxName || '-'}
                    </Typography>
                    {item.onyxName && item.appName && item.onyxName !== item.appName && (
                        <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ mb: 1 }}>
                            أونكس: {item.onyxName}
                        </Typography>
                    )}

                    {/* Stock Comparison */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                أونكس
                            </Typography>
                            <Typography variant="h6" color="primary.main">
                                {item.onyxStock?.toLocaleString('en-US') ?? 0}
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: isMatch ? 'success.light' : 'error.light', borderRadius: 1 }}>
                            <Typography variant="caption" color={isMatch ? 'success.dark' : 'error.dark'} display="block">
                                التطبيق
                            </Typography>
                            <Typography variant="h6" color={isMatch ? 'success.dark' : 'error.dark'}>
                                {item.appStock?.toLocaleString('en-US') ?? 0}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Breadcrumbs */}
            <Breadcrumbs separator={<ChevronRight fontSize="small" />} sx={{ mb: 3 }}>
                <Link
                    component="button"
                    underline="hover"
                    color="inherit"
                    onClick={() => navigate('/')}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                    <Home fontSize="small" />
                    {t('common:navigation.home', 'الرئيسية')}
                </Link>
                <Link
                    component="button"
                    underline="hover"
                    color="inherit"
                    onClick={() => navigate('/products/integration')}
                >
                    {t('products:integration.title', 'ربط المخزون')}
                </Link>
                <Typography color="text.primary">
                    {t('products:integration.linked.title', 'المنتجات المربوطة')}
                </Typography>
            </Breadcrumbs>

            {/* Page Header */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/products/integration')}
                        sx={{ mb: 1 }}
                    >
                        {t('common:actions.back', 'رجوع')}
                    </Button>
                    <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" gutterBottom>
                        <LinkIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
                        {t('products:integration.linked.title', 'المنتجات المربوطة')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('products:integration.linked.subtitle', 'المنتجات التي تتم مزامنتها تلقائياً مع أونكس')}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => refetch()}
                    disabled={isLoading}
                >
                    {t('common:actions.refresh', 'تحديث')}
                </Button>
            </Box>

            {/* Summary Stats */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                    label={`${t('products:integration.linked.totalLabel', 'إجمالي')}: ${totalCount.toLocaleString('ar-SA')} ${t('products:integration.linked.productUnit', 'منتج')}`}
                    color="success"
                    variant="outlined"
                />
                <Chip
                    label={`${t('products:integration.linked.displayedLabel', 'معروض')}: ${items.length}`}
                    variant="outlined"
                    size="small"
                />
                <Chip
                    label={`${t('products:integration.linked.matchedLabel', 'متطابق')}: ${items.filter((i) => i.appStock === i.onyxStock).length}`}
                    color="success"
                    size="small"
                />
                <Chip
                    label={`${t('products:integration.linked.mismatchedLabel', 'اختلاف')}: ${items.filter((i) => i.appStock !== i.onyxStock).length}`}
                    color="warning"
                    size="small"
                />
            </Box>

            {/* Mobile Search */}
            {isMobile && (
                <TextField
                    fullWidth
                    size="small"
                    placeholder={t('products:integration.linked.search', 'بحث برمز SKU أو اسم المنتج...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
            )}

            {/* Content - Cards for Mobile, DataTable for Desktop */}
            {isLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : isMobile ? (
                /* Mobile Card Layout */
                <Grid container spacing={2}>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <Grid size={{ xs: 12 }} key={item.sku}>
                                <LinkedItemCard item={item} />
                            </Grid>
                        ))
                    ) : (
                        <Grid size={{ xs: 12 }}>
                            <Alert severity="info">
                                {t('products:integration.linked.noResults', 'لا توجد نتائج')}
                            </Alert>
                        </Grid>
                    )}
                </Grid>
            ) : (
                /* Desktop DataTable */
                <DataTable
                    columns={columns}
                    rows={filteredItems}
                    loading={isLoading}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    getRowId={(row) => (row as LinkedItem).sku}
                    onSearch={setSearchQuery}
                    searchPlaceholder={t('products:integration.linked.search', 'بحث برمز SKU أو اسم المنتج...')}
                    height={600}
                />
            )}

            {/* Info Alert */}
            <Alert severity="info" sx={{ mt: 3 }}>
                {t(
                    'products:integration.linked.tip',
                    'هذه المنتجات يتم تحديث مخزونها تلقائياً عند استلام بيانات جديدة من نظام أونكس.'
                )}
            </Alert>
        </Box>
    );
};
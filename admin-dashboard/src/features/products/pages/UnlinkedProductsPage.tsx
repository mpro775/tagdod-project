/**
 * Unlinked Products Page
 * صفحة المنتجات غير المربوطة (فرص الإضافة)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Typography,
    Button,
    Alert,
    Chip,
    Tooltip,
} from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
    Add,
    Refresh,
    Home,
    ChevronRight,
    Inventory,
    ArrowBack,
} from '@mui/icons-material';
import { Breadcrumbs, Link } from '@mui/material';
import { DataTable } from '@/shared/components';
import { useUnlinkedItems } from '../hooks/useInventoryIntegration';
import type { UnlinkedItem } from '../types/inventory-integration.types';

export const UnlinkedProductsPage: React.FC = () => {
    const { t } = useTranslation(['products', 'common']);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 25 });

    // استدعاء الـ Hook سيعيد الآن كائناً فيه data و total
    const { data: response, isLoading, error, refetch } = useUnlinkedItems(200);

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
                item.itemNameAr?.toLowerCase().includes(query)
        );
    }, [items, searchQuery]);

    // Handle create product action
    const handleCreateProduct = (item: UnlinkedItem) => {
        navigate('/products/new', {
            state: {
                prefillSku: item.sku,
                prefillStock: item.quantity,
                prefillName: item.itemNameAr,
            },
        });
    };

    // Define columns for DataTable
    const columns: GridColDef[] = [
        {
            field: 'sku',
            headerName: t('products:integration.unlinked.columns.sku', 'رمز الصنف (SKU)'),
            flex: 1,
            minWidth: 120,
            renderCell: (params: GridRenderCellParams<UnlinkedItem>) => (
                <Chip
                    label={params.value}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: 'monospace' }}
                />
            ),
        },
        {
            field: 'itemNameAr',
            headerName: t('products:integration.unlinked.columns.name', 'الاسم'),
            flex: 2,
            minWidth: 200,
            renderCell: (params: GridRenderCellParams<UnlinkedItem>) => (
                <Typography variant="body2" noWrap>
                    {params.value || (
                        <Typography component="span" variant="body2" color="text.secondary" fontStyle="italic">
                            {t('products:integration.unlinked.noName', 'بدون اسم')}
                        </Typography>
                    )}
                </Typography>
            ),
        },
        {
            field: 'quantity',
            headerName: t('products:integration.unlinked.columns.quantity', 'الكمية'),
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams<UnlinkedItem>) => (
                <Chip
                    label={params.value?.toLocaleString('en-US') ?? 0}
                    color={params.value > 0 ? 'success' : 'default'}
                    size="small"
                />
            ),
        },
        {
            field: 'actions',
            headerName: t('products:integration.unlinked.columns.action', 'إجراء'),
            width: 150,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params: GridRenderCellParams<UnlinkedItem>) => (
                <Tooltip title={t('products:integration.unlinked.createProduct', 'إضافة كمنتج جديد')}>
                    <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        startIcon={<Add />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCreateProduct(params.row as UnlinkedItem);
                        }}
                    >
                        {t('products:integration.unlinked.createProduct', 'إضافة كمنتج')}
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
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
                    onClick={() => navigate('/products')}
                >
                    {t('products:title', 'المنتجات')}
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
                    {t('products:integration.unlinked.title', 'فرص الإضافة')}
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
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        <Inventory sx={{ mr: 1, verticalAlign: 'middle', color: 'warning.main' }} />
                        {t('products:integration.unlinked.title', 'المنتجات غير المربوطة')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t(
                            'products:integration.unlinked.subtitle',
                            'أصناف موجودة في نظام أونكس ولم تُضف للموقع بعد. أضفها للاستفادة من الربط التلقائي.'
                        )}
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

            {/* Summary Stats - استخدام العداد الحقيقي من الباك إند */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                    label={`${t('products:integration.unlinked.totalLabel', 'إجمالي')}: ${totalCount.toLocaleString('ar-SA')} ${t('products:integration.unlinked.itemUnit', 'صنف')}`}
                    color="warning"
                    variant="outlined"
                />
                <Chip
                    label={`${t('products:integration.unlinked.displayedLabel', 'معروض')}: ${items.length}`}
                    variant="outlined"
                    size="small"
                />
                {searchQuery && (
                    <Chip
                        label={`${t('products:integration.unlinked.filteredLabel', 'نتائج البحث')}: ${filteredItems.length}`}
                        color="primary"
                        variant="outlined"
                    />
                )}
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {t('products:integration.error', 'حدث خطأ في جلب البيانات.')}
                </Alert>
            )}

            {/* DataTable */}
            <DataTable
                columns={columns}
                rows={filteredItems}
                loading={isLoading}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                getRowId={(row) => (row as UnlinkedItem)._id || (row as UnlinkedItem).sku}
                onSearch={setSearchQuery}
                searchPlaceholder={t('products:integration.unlinked.search', 'بحث برمز الصنف...')}
                height={600}
            />

            {/* Info Alert */}
            <Alert severity="info" sx={{ mt: 3 }}>
                {t(
                    'products:integration.unlinked.tip',
                    'عند الضغط على "إضافة كمنتج"، سيتم نقلك لصفحة إضافة منتج جديد مع تعبئة رمز الصنف والكمية تلقائياً.'
                )}
            </Alert>
        </Box>
    );
};

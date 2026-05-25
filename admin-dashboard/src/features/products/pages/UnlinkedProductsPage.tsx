import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sync } from '@mui/icons-material';
import {
    PageShell,
    PageHeader,
    LoadingState,
    ErrorState,
    ResponsiveDataView,
    usePageTitle,
} from '@/shared/design-system';
import { DataTable } from '@/shared/components';
import { useUnlinkedItems } from '../hooks/useInventoryIntegration';
import type { UnlinkedItem } from '../types/inventory-integration.types';
import { UnlinkedProductsStatsCards } from '../components/admin/UnlinkedProductsStatsCards';
import { UnlinkedProductsToolbar, type UnlinkedProductsFilters } from '../components/admin/UnlinkedProductsToolbar';
import { useUnlinkedProductsTableColumns } from '../components/admin/UnlinkedProductsTableColumns';
import { UnlinkedOpportunityCard } from '../components/admin/UnlinkedOpportunityCard';

export const UnlinkedProductsPage: React.FC = () => {
    const { t } = useTranslation(['products', 'common']);
    const navigate = useNavigate();
    const pageTitle = t('products:integration.unlinked.title', 'فرص الإضافة');
    usePageTitle(pageTitle);

    const [filters, setFilters] = useState<UnlinkedProductsFilters>({
        search: '',
        sortField: 'quantity',
        sortOrder: 'desc',
    });

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

    const { data: response, isLoading, error, refetch } = useUnlinkedItems({
        limit: paginationModel.pageSize,
        page: paginationModel.page + 1,
        search: filters.search,
        sort: filters.sortField,
        sortOrder: filters.sortOrder,
    });

    const items = response?.data || [];
    const totalCount = response?.total || 0;

    const handleCreateProduct = useCallback((item: UnlinkedItem) => {
        navigate('/products/new', {
            state: {
                prefillSku: item.sku,
                prefillStock: item.quantity,
                prefillName: item.itemNameAr,
            },
        });
    }, [navigate]);

    const columns = useUnlinkedProductsTableColumns({
        onCreateProduct: handleCreateProduct,
    });

    return (
        <PageShell spacing="compact" fullHeight>
            <PageHeader
                variant="compact"
                title={pageTitle}
                description={t(
                    'products:integration.unlinked.subtitle',
                    'أصناف موجودة في نظام أونكس ولم تُضف للموقع بعد. أضفها للاستفادة من الربط التلقائي.'
                )}
                breadcrumbs={[
                    { label: t('common:navigation.home', 'الرئيسية'), to: '/' },
                    { label: t('products:title', 'المنتجات'), to: '/products' },
                    { label: t('products:integration.title', 'ربط المخزون'), to: '/products/integration' },
                    { label: pageTitle },
                ]}
                actions={[
                    {
                        label: t('common:actions.refresh', 'تحديث'),
                        icon: <Sync fontSize="small" />,
                        onClick: () => refetch(),
                        variant: 'secondary',
                    },
                ]}
            />

            <UnlinkedProductsStatsCards total={totalCount} loading={isLoading} compact />

            <UnlinkedProductsToolbar
                filters={filters}
                onFiltersChange={setFilters}
                loading={isLoading}
            />

            {isLoading ? (
                <LoadingState variant="skeleton" rows={5} />
            ) : error ? (
                <ErrorState
                    title={t('products:integration.error', 'حدث خطأ في جلب البيانات')}
                    onRetry={() => refetch()}
                />
            ) : (
                <ResponsiveDataView
                    rows={items}
                    columns={columns}
                    renderCard={(item: UnlinkedItem) => (
                        <UnlinkedOpportunityCard item={item} onCreateProduct={handleCreateProduct} />
                    )}
                    renderTable={(rows: UnlinkedItem[]) => (
                        <DataTable
                            columns={columns}
                            rows={rows}
                            loading={false}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            paginationMode="server"
                            rowCount={totalCount}
                            getRowId={(row) => (row as UnlinkedItem)._id || (row as UnlinkedItem).sku}
                            height={600}
                        />
                    )}
                    loading={false}
                    emptyTitle={t('products:integration.unlinked.empty', 'لا توجد أصناف غير مربوطة 🎉')}
                    emptyDescription={t('products:integration.unlinked.noResults', 'لا توجد نتائج للبحث')}
                    getRowId={(row: UnlinkedItem) => row._id || row.sku}
                />
            )}
        </PageShell>
    );
};
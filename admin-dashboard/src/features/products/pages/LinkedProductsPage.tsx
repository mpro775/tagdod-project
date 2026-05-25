import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sync } from '@mui/icons-material';
import { GridPaginationModel } from '@mui/x-data-grid';
import {
    PageShell,
    PageHeader,
    LoadingState,
    ErrorState,
    ResponsiveDataView,
    usePageTitle,
} from '@/shared/design-system';
import { DataTable } from '@/shared/components';
import { useLinkedProducts } from '../hooks/useInventoryIntegration';
import type { LinkedItem } from '../types/inventory-integration.types';
import { LinkedProductsStatsCards } from '../components/admin/LinkedProductsStatsCards';
import { LinkedProductsToolbar, type LinkedProductsFilters } from '../components/admin/LinkedProductsToolbar';
import { useLinkedProductsTableColumns } from '../components/admin/LinkedProductsTableColumns';
import { LinkedProductCard } from '../components/admin/LinkedProductCard';

interface LinkedProductsTableViewProps {
    rows: LinkedItem[];
    columns: any[];
    paginationModel: GridPaginationModel;
    onPaginationModelChange: (model: GridPaginationModel) => void;
    totalCount: number;
}

const LinkedProductsTableView: React.FC<LinkedProductsTableViewProps> = ({
    rows,
    columns,
    paginationModel,
    onPaginationModelChange,
    totalCount,
}) => {
    return (
        <DataTable
            columns={columns}
            rows={rows}
            loading={false}
            paginationModel={paginationModel}
            onPaginationModelChange={onPaginationModelChange}
            paginationMode="server"
            rowCount={totalCount}
            getRowId={(row) => (row as LinkedItem).sku}
            height={600}
        />
    );
};

export const LinkedProductsPage: React.FC = () => {
    const { t } = useTranslation(['products', 'common']);
    const navigate = useNavigate();
    const pageTitle = t('products:integration.linked.title', 'المنتجات المربوطة');
    usePageTitle(pageTitle);

    const [filters, setFilters] = useState<LinkedProductsFilters>({
        search: '',
        status: 'all',
        sortField: 'sku',
        sortOrder: 'asc',
    });

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });

    const { data: response, isLoading, error, refetch } = useLinkedProducts({
        limit: paginationModel.pageSize,
        page: paginationModel.page + 1,
        search: filters.search,
        status: filters.status,
        sort: filters.sortField,
        sortOrder: filters.sortOrder,
    });

    const items = response?.data || [];
    const totalCount = response?.total || 0;

    const columns = useLinkedProductsTableColumns();

    const handleViewItem = useCallback((item: LinkedItem) => {
        const path = item.linkType === 'variant' && item.productId
            ? `/products/${item.productId}/variants`
            : item.productId
                ? `/products/${item.productId}`
                : null;
        if (path) navigate(path);
    }, [navigate]);

    return (
        <PageShell spacing="compact" fullHeight>
            <PageHeader
                variant="compact"
                title={pageTitle}
                description={t('products:integration.linked.subtitle', 'المنتجات التي تتم مزامنتها تلقائياً مع أونكس')}
                breadcrumbs={[
                    { label: t('common:navigation.home', 'الرئيسية'), to: '/' },
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

            <LinkedProductsStatsCards data={response} loading={isLoading} compact />

            <LinkedProductsToolbar
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
                    renderCard={(item: LinkedItem) => (
                        <LinkedProductCard item={item} onClick={handleViewItem} />
                    )}
                    renderTable={(rows: LinkedItem[]) => (
                        <LinkedProductsTableView
                            rows={rows}
                            columns={columns}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            totalCount={totalCount}
                        />
                    )}
                    loading={false}
                    emptyTitle={t('products:integration.linked.noResults', 'لا توجد نتائج')}
                    emptyDescription={t('products:integration.linked.noResults', 'لا توجد نتائج')}
                    getRowId={(row: LinkedItem) => row.sku}
                />
            )}
        </PageShell>
    );
};
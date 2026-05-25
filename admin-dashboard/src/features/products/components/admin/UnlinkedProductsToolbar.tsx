import { useCallback } from 'react';
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DataToolbar, type DataToolbarFilter } from '@/shared/design-system';
import { useQueryClient } from '@tanstack/react-query';

export type UnlinkedSortField = 'sku' | 'quantity' | 'itemNameAr' | 'price' | 'lastSyncedAt';

export interface UnlinkedProductsFilters {
    search: string;
    sortField: UnlinkedSortField;
    sortOrder: 'asc' | 'desc';
}

interface UnlinkedProductsToolbarProps {
    filters: UnlinkedProductsFilters;
    onFiltersChange: (filters: UnlinkedProductsFilters) => void;
    loading?: boolean;
}

export const UnlinkedProductsToolbar: React.FC<UnlinkedProductsToolbarProps> = ({
    filters,
    onFiltersChange,
    loading = false,
}) => {
    const { t } = useTranslation(['products', 'common']);
    const queryClient = useQueryClient();

    const update = <K extends keyof UnlinkedProductsFilters>(key: K, value: UnlinkedProductsFilters[K]) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const handleRefresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['inventory-integration', 'unlinked'] });
    }, [queryClient]);

    const sortLabels: Record<UnlinkedSortField, string> = {
        sku: t('products:integration.unlinked.columns.sku', 'رمز الصنف'),
        quantity: t('products:integration.unlinked.columns.quantity', 'الكمية'),
        itemNameAr: t('products:integration.unlinked.columns.name', 'الاسم'),
        price: t('products:integration.unlinked.columns.price', 'السعر'),
        lastSyncedAt: t('products:integration.unlinked.columns.lastSynced', 'آخر مزامنة'),
    };

    const activeFilters: DataToolbarFilter[] = [];

    if (filters.search) {
        activeFilters.push({
            label: t('products:filter.search', 'بحث'),
            value: filters.search.length > 24 ? `${filters.search.slice(0, 24)}...` : filters.search,
            onDelete: () => update('search', ''),
        });
    }

    if (filters.sortField !== 'quantity' || filters.sortOrder !== 'desc') {
        const sortLabel = `${sortLabels[filters.sortField]} (${filters.sortOrder === 'asc'
            ? t('common:sort.ascending', 'تصاعدي')
            : t('common:sort.descending', 'تنازلي')})`;
        activeFilters.push({
            label: t('products:integration.unlinked.filter.sort', 'ترتيب'),
            value: sortLabel,
            onDelete: () => update('sortField', 'quantity'),
        });
    }

    const filterControls = (
        <>
            <FormControl size="small" sx={{ minWidth: 145 }}>
                <InputLabel>{t('products:integration.unlinked.filter.sortBy', 'ترتيب حسب')}</InputLabel>
                <Select
                    value={filters.sortField}
                    label={t('products:integration.unlinked.filter.sortBy', 'ترتيب حسب')}
                    onChange={(e) => update('sortField', e.target.value as UnlinkedSortField)}
                    disabled={loading}
                >
                    <MenuItem value="sku">{sortLabels.sku}</MenuItem>
                    <MenuItem value="quantity">{sortLabels.quantity}</MenuItem>
                    <MenuItem value="itemNameAr">{sortLabels.itemNameAr}</MenuItem>
                    <MenuItem value="price">{sortLabels.price}</MenuItem>
                    <MenuItem value="lastSyncedAt">{sortLabels.lastSyncedAt}</MenuItem>
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{t('products:integration.unlinked.filter.sortOrder', 'الاتجاه')}</InputLabel>
                <Select
                    value={filters.sortOrder}
                    label={t('products:integration.unlinked.filter.sortOrder', 'الاتجاه')}
                    onChange={(e) => update('sortOrder', e.target.value as 'asc' | 'desc')}
                    disabled={loading}
                >
                    <MenuItem value="asc">{t('common:sort.ascending', 'تصاعدي')}</MenuItem>
                    <MenuItem value="desc">{t('common:sort.descending', 'تنازلي')}</MenuItem>
                </Select>
            </FormControl>
        </>
    );

    const actions = (
        <Tooltip title={t('common:actions.refresh', 'تحديث')}>
            <IconButton size="small" onClick={handleRefresh} disabled={loading}>
                <Refresh />
            </IconButton>
        </Tooltip>
    );

    return (
        <DataToolbar
            searchValue={filters.search}
            searchPlaceholder={t('products:integration.unlinked.search', 'بحث برمز الصنف...')}
            onSearchChange={(value: string) => update('search', value)}
            filters={filterControls}
            activeFilters={activeFilters}
            actions={actions}
            compact
        />
    );
};
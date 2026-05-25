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

export type LinkedSortField = 'sku' | 'onyxStock' | 'appStock' | 'lastSynced';

export interface LinkedProductsFilters {
    search: string;
    status: 'all' | 'matched' | 'mismatched';
    sortField: LinkedSortField;
    sortOrder: 'asc' | 'desc';
}

interface LinkedProductsToolbarProps {
    filters: LinkedProductsFilters;
    onFiltersChange: (filters: LinkedProductsFilters) => void;
    loading?: boolean;
}

export const LinkedProductsToolbar: React.FC<LinkedProductsToolbarProps> = ({
    filters,
    onFiltersChange,
    loading = false,
}) => {
    const { t } = useTranslation(['products', 'common']);
    const queryClient = useQueryClient();

    const update = <K extends keyof LinkedProductsFilters>(key: K, value: LinkedProductsFilters[K]) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const handleRefresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['inventory-integration', 'linked'] });
    }, [queryClient]);

    const statusLabels: Record<LinkedProductsFilters['status'], string> = {
        all: t('products:integration.linked.filter.allStatus', 'الكل'),
        matched: t('products:integration.linked.filter.matched', 'متطابق'),
        mismatched: t('products:integration.linked.filter.mismatched', 'اختلاف'),
    };

    const sortLabels: Record<LinkedSortField, string> = {
        sku: t('products:integration.linked.columns.sku', 'SKU'),
        onyxStock: t('products:integration.linked.columns.onyxStock', 'مخزون أونكس'),
        appStock: t('products:integration.linked.columns.appStock', 'مخزون التطبيق'),
        lastSynced: t('products:integration.linked.columns.lastSynced', 'آخر مزامنة'),
    };

    const activeFilters: DataToolbarFilter[] = [];

    if (filters.search) {
        activeFilters.push({
            label: t('products:filter.search', 'بحث'),
            value: filters.search.length > 24 ? `${filters.search.slice(0, 24)}...` : filters.search,
            onDelete: () => update('search', ''),
        });
    }

    if (filters.status !== 'all') {
        activeFilters.push({
            label: t('products:integration.linked.filter.statusLabel', 'الحالة'),
            value: statusLabels[filters.status],
            onDelete: () => update('status', 'all'),
        });
    }

    if (filters.sortField !== 'sku' || filters.sortOrder !== 'asc') {
        const sortLabel = `${sortLabels[filters.sortField]} (${filters.sortOrder === 'asc'
            ? t('common:sort.ascending', 'تصاعدي')
            : t('common:sort.descending', 'تنازلي')})`;
        activeFilters.push({
            label: t('products:integration.linked.filter.sort', 'ترتيب'),
            value: sortLabel,
            onDelete: () => update('sortField', 'sku'),
        });
    }

    const filterControls = (
        <>
            <FormControl size="small" sx={{ minWidth: 145 }}>
                <InputLabel>{t('products:integration.linked.filter.statusLabel', 'الحالة')}</InputLabel>
                <Select
                    value={filters.status}
                    label={t('products:integration.linked.filter.statusLabel', 'الحالة')}
                    onChange={(e) => update('status', e.target.value as LinkedProductsFilters['status'])}
                    disabled={loading}
                >
                    <MenuItem value="all">{statusLabels.all}</MenuItem>
                    <MenuItem value="matched">{statusLabels.matched}</MenuItem>
                    <MenuItem value="mismatched">{statusLabels.mismatched}</MenuItem>
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 145 }}>
                <InputLabel>{t('products:integration.linked.filter.sortBy', 'ترتيب حسب')}</InputLabel>
                <Select
                    value={filters.sortField}
                    label={t('products:integration.linked.filter.sortBy', 'ترتيب حسب')}
                    onChange={(e) => update('sortField', e.target.value as LinkedSortField)}
                    disabled={loading}
                >
                    <MenuItem value="sku">{sortLabels.sku}</MenuItem>
                    <MenuItem value="onyxStock">{sortLabels.onyxStock}</MenuItem>
                    <MenuItem value="appStock">{sortLabels.appStock}</MenuItem>
                    <MenuItem value="lastSynced">{sortLabels.lastSynced}</MenuItem>
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{t('products:integration.linked.filter.sortOrder', 'الاتجاه')}</InputLabel>
                <Select
                    value={filters.sortOrder}
                    label={t('products:integration.linked.filter.sortOrder', 'الاتجاه')}
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
            searchPlaceholder={t('products:integration.linked.search', 'بحث برمز SKU أو اسم المنتج...')}
            onSearchChange={(value: string) => update('search', value)}
            filters={filterControls}
            activeFilters={activeFilters}
            actions={actions}
            compact
        />
    );
};
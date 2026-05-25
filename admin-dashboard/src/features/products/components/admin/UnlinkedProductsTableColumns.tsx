import { useTranslation } from 'react-i18next';
import { Chip, Typography, Button, Tooltip } from '@mui/material';
import { Add } from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import type { UnlinkedItem } from '../../types/inventory-integration.types';
import { StatusChip } from '@/shared/design-system';

interface UnlinkedColumnsCallbacks {
    onCreateProduct: (item: UnlinkedItem) => void;
}

export const useUnlinkedProductsTableColumns = ({
    onCreateProduct,
}: UnlinkedColumnsCallbacks): GridColDef[] => {
    const { t } = useTranslation('products');

    return [
        {
            field: 'sku',
            headerName: t('integration.unlinked.columns.sku', 'رمز الصنف (SKU)'),
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
            ),
        },
        {
            field: 'itemNameAr',
            headerName: t('integration.unlinked.columns.name', 'الاسم'),
            flex: 2,
            minWidth: 200,
            renderCell: (params) => (
                params.value ? (
                    <Typography variant="body2" noWrap>{params.value}</Typography>
                ) : (
                    <Typography component="span" variant="body2" color="text.secondary" fontStyle="italic">
                        {t('integration.unlinked.noName', 'بدون اسم')}
                    </Typography>
                )
            ),
        },
        {
            field: 'quantity',
            headerName: t('integration.unlinked.columns.quantity', 'الكمية'),
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <StatusChip
                    label={params.value?.toLocaleString('en-US') ?? 0}
                    status={params.value > 0 ? 'success' : 'neutral'}
                    size="small"
                />
            ),
        },
        {
            field: 'price',
            headerName: t('integration.unlinked.columns.price', 'السعر'),
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                if (params.value == null) return '-';
                return (
                    <Typography variant="body2" fontWeight={700}>
                        ${params.value.toLocaleString('en-US')}
                    </Typography>
                );
            },
        },
        {
            field: 'actions',
            headerName: t('integration.unlinked.columns.action', 'إجراء'),
            width: 150,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params) => (
                <Tooltip title={t('integration.unlinked.createProduct', 'إضافة كمنتج جديد')}>
                    <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        startIcon={<Add />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onCreateProduct(params.row as UnlinkedItem);
                        }}
                    >
                        {t('integration.unlinked.createProduct', 'إضافة كمنتج')}
                    </Button>
                </Tooltip>
            ),
        },
    ];
};
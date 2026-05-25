import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageShell,
  PageHeader,
  LoadingState,
  ErrorState,
  ResponsiveDataView,
  usePageTitle,
} from '@/shared/design-system';
import { useInventorySummary, useLowStockVariants, useOutOfStockVariants } from '../hooks/useProducts';
import type { Variant } from '../types/product.types';
import { InventoryStatsCards } from '../components/admin/InventoryStatsCards';
import { InventoryToolbar, type InventoryFilters } from '../components/admin/InventoryToolbar';
import { InventoryAlertsSection } from '../components/admin/InventoryAlertsSection';
import { InventoryItemsTable, type InventoryItem } from '../components/admin/InventoryItemsTable';
import { InventoryItemCard } from '../components/admin/InventoryItemCard';
import { InventoryVariantDetailsDrawer } from '../components/admin/InventoryVariantDetailsDrawer';

export const InventoryPage: React.FC = () => {
  const { t } = useTranslation('products');
  const pageTitle = t('inventory.title', 'إدارة المخزون');
  usePageTitle(pageTitle);

  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    stockStatus: 'all',
    itemType: 'all',
    sortField: 'name',
    sortOrder: 'asc',
  });

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: _summary,
    isLoading: loadingSummary,
    error: summaryError,
    refetch: refetchSummary,
  } = useInventorySummary();

  const {
    data: lowStockVariants,
    isLoading: loadingLowStock,
    refetch: refetchLowStock,
  } = useLowStockVariants();

  const {
    data: outOfStockVariants,
    isLoading: loadingOutOfStock,
    refetch: refetchOutOfStock,
  } = useOutOfStockVariants();

  const isLoading = loadingSummary || loadingLowStock || loadingOutOfStock;

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedVariant(null);
  }, []);

  const handleStockUpdate = useCallback((updatedVariant: Variant) => {
    setSelectedVariant(updatedVariant);
    refetchSummary();
    refetchLowStock();
    refetchOutOfStock();
  }, [refetchSummary, refetchLowStock, refetchOutOfStock]);

  const handleAlertVariantClick = useCallback((variantId: string, _productId: string) => {
    const variant = {
      _id: variantId,
      productId: _productId,
    } as unknown as Variant;
    setSelectedVariant(variant);
    setDrawerOpen(true);
  }, []);

  const allInventoryItems = useMemo<InventoryItem[]>(() => {
    const items: InventoryItem[] = [];

    if (lowStockVariants) {
      for (const item of lowStockVariants) {
        const isLow = item.currentStock > 0;
        items.push({
          id: item.variantId,
          name: item.variantName || item.sku || item.variantId,
          sku: item.sku || '',
          product: item.productName || item.productId,
          productId: item.productId,
          stock: item.currentStock,
          minStock: item.minStock,
          price: 0,
          status: isLow ? 'low' : 'out',
          isVariant: true,
        });
      }
    }

    if (outOfStockVariants) {
      for (const item of outOfStockVariants) {
        const existing = items.find((i) => i.id === item.variantId);
        if (!existing) {
          items.push({
            id: item.variantId,
            name: item.variantName || item.sku || item.variantId,
            sku: item.sku || '',
            product: item.productName || item.productId,
            productId: item.productId,
            stock: 0,
            minStock: 0,
            price: 0,
            status: 'out',
            isVariant: true,
          });
        }
      }
    }

    let filtered = items;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.sku.toLowerCase().includes(search),
      );
    }

    if (filters.stockStatus !== 'all') {
      filtered = filtered.filter((item) => {
        if (filters.stockStatus === 'available') return item.status === 'available';
        if (filters.stockStatus === 'low') return item.status === 'low';
        if (filters.stockStatus === 'out') return item.status === 'out';
        return true;
      });
    }

    if (filters.itemType !== 'all') {
      filtered = filtered.filter((item) => {
        if (filters.itemType === 'variant') return item.isVariant;
        if (filters.itemType === 'direct') return !item.isVariant;
        return true;
      });
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'ar');
          break;
        case 'sku':
          comparison = a.sku.localeCompare(b.sku);
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'updatedAt':
          comparison = 0;
          break;
        default:
          comparison = 0;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [lowStockVariants, outOfStockVariants, filters]);

  const handleViewItem = useCallback((item: InventoryItem) => {
    const variant = {
      _id: item.id,
      productId: item.productId,
      sku: item.sku,
      stock: item.stock,
      minStock: item.minStock,
    } as unknown as Variant;
    setSelectedVariant(variant);
    setDrawerOpen(true);
  }, []);

  if (isLoading) {
    return (
      <PageShell spacing="compact" fullHeight>
        <PageHeader variant="compact" title={pageTitle} />
        <LoadingState variant="skeleton" rows={6} />
      </PageShell>
    );
  }

  if (summaryError) {
    return (
      <PageShell spacing="compact" fullHeight>
        <PageHeader variant="compact" title={pageTitle} />
        <ErrorState
          title={t('inventory.errorTitle', 'خطأ في تحميل المخزون')}
          onRetry={() => {
            refetchSummary();
            refetchLowStock();
            refetchOutOfStock();
          }}
        />
      </PageShell>
    );
  }

  return (
    <PageShell spacing="compact" fullHeight>
      <PageHeader
        variant="compact"
        title={pageTitle}
        breadcrumbs={[
          { label: t('navigation.dashboard', 'لوحة التحكم'), to: '/dashboard' },
          { label: t('list.title', 'المنتجات'), to: '/products' },
          { label: pageTitle },
        ]}
      />

      <InventoryStatsCards compact />

      <InventoryToolbar
        filters={filters}
        onFiltersChange={setFilters}
        loading={isLoading}
      />

      <InventoryAlertsSection onVariantClick={handleAlertVariantClick} />

      <ResponsiveDataView
        rows={allInventoryItems}
        renderCard={(item: InventoryItem) => (
          <InventoryItemCard item={item} onView={handleViewItem} />
        )}
        renderTable={(rows: InventoryItem[]) => (
          <InventoryItemsTable
            rows={rows as InventoryItem[]}
            loading={isLoading}
            paginationModel={{ page: 0, pageSize: 20 }}
            onPaginationModelChange={() => {}}
            sortModel={[]}
            onSortModelChange={() => {}}
            onView={handleViewItem}
          />
        )}
        loading={false}
        emptyTitle={t('inventory.empty', 'لا توجد عناصر في المخزون')}
        emptyDescription={t('inventory.emptyDescription', 'لم يتم العثور على عناصر تطابق معايير البحث')}
        getRowId={(row: InventoryItem) => row.id}
      />

      <InventoryVariantDetailsDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        variant={selectedVariant}
        onStockUpdate={handleStockUpdate}
      />
    </PageShell>
  );
};
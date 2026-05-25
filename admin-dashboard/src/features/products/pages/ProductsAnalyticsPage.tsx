import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from '@mui/icons-material';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import {
  PageShell,
  PageHeader,
  LoadingState,
  ErrorState,
} from '@/shared/design-system';
import {
  useProductStats,
  useInventorySummary,
} from '../hooks/useProducts';
import { ProductAnalyticsToolbar } from '../components/admin/ProductAnalyticsToolbar';
import { ProductAnalyticsStatsCards } from '../components/admin/ProductAnalyticsStatsCards';
import { ProductAnalyticsCharts } from '../components/admin/ProductAnalyticsCharts';

export const ProductsAnalyticsPage: React.FC = () => {
  const { t } = useTranslation(['products', 'common']);

  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const {
    data: stats,
    isLoading: loadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useProductStats(dateRange.start || undefined, dateRange.end || undefined);

  const {
    data: inventorySummary,
    isLoading: loadingInventory,
    refetch: refetchInventory,
  } = useInventorySummary(dateRange.start || undefined, dateRange.end || undefined);

  const handleRefresh = () => {
    refetchStats();
    refetchInventory();
  };

  const handleExportData = () => {
    if (!stats && !inventorySummary) {
      toast.error(t('products:stats.noDataToExport', 'لا توجد بيانات للتصدير'));
      return;
    }

    try {
      const wb = XLSX.utils.book_new();
      const dateStr = new Date().toLocaleDateString('ar-SA');

      if (stats) {
        const overviewData = [
          {
            [t('products:stats.metric', 'المقياس')]: t('products:stats.total', 'إجمالي المنتجات'),
            [t('products:stats.value', 'القيمة')]: stats.total,
          },
          {
            [t('products:stats.metric', 'المقياس')]: t('products:stats.active', 'منتجات نشطة'),
            [t('products:stats.value', 'القيمة')]: stats.active,
          },
          {
            [t('products:stats.metric', 'المقياس')]: t('products:stats.featured', 'منتجات مميزة'),
            [t('products:stats.value', 'القيمة')]: stats.featured,
          },
          {
            [t('products:stats.metric', 'المقياس')]: t('products:stats.newProducts', 'منتجات جديدة'),
            [t('products:stats.value', 'القيمة')]: stats.newProducts,
          },
        ];
        const wsOverview = XLSX.utils.json_to_sheet(overviewData);
        XLSX.utils.book_append_sheet(wb, wsOverview, t('products:stats.overviewSheet', 'إحصائيات عامة'));

        const statusData = [
          {
            [t('products:stats.status', 'الحالة')]: t('products:status.active', 'نشط'),
            [t('products:stats.count', 'العدد')]: stats.active,
          },
          {
            [t('products:stats.status', 'الحالة')]: t('products:status.draft', 'مسودة'),
            [t('products:stats.count', 'العدد')]: stats.draft,
          },
          {
            [t('products:stats.status', 'الحالة')]: t('products:status.archived', 'مؤرشف'),
            [t('products:stats.count', 'العدد')]: stats.archived,
          },
        ];
        const wsStatus = XLSX.utils.json_to_sheet(statusData);
        XLSX.utils.book_append_sheet(wb, wsStatus, t('products:stats.statusSheet', 'حسب الحالة'));
      }

      if (inventorySummary) {
        const inventoryData = [
          {
            [t('products:stats.metric', 'المقياس')]: t('products:stats.totalVariants', 'إجمالي المتغيرات'),
            [t('products:stats.value', 'القيمة')]: inventorySummary.totalVariants,
          },
          {
            [t('products:stats.metric', 'المقياس')]: t('products:stats.inStock', 'متوفر في المخزون'),
            [t('products:stats.value', 'القيمة')]: inventorySummary.inStock,
          },
          {
            [t('products:stats.metric', 'المقياس')]: t('products:stats.inStockUnits', 'وحدات متوفرة'),
            [t('products:stats.value', 'القيمة')]: inventorySummary.inStockUnits ?? '-',
          },
          {
            [t('products:stats.metric', 'المقياس')]: t('products:stats.lowStock', 'مخزون منخفض'),
            [t('products:stats.value', 'القيمة')]: inventorySummary.lowStock,
          },
          {
            [t('products:stats.metric', 'المقياس')]: t('products:stats.lowStockUnits', 'وحدات منخفضة'),
            [t('products:stats.value', 'القيمة')]: inventorySummary.lowStockUnits ?? '-',
          },
          {
            [t('products:stats.metric', 'المقياس')]: t('products:stats.outOfStock', 'نفذ من المخزون'),
            [t('products:stats.value', 'القيمة')]: inventorySummary.outOfStock,
          },
          {
            [t('products:stats.metric', 'المقياس')]: t('products:stats.outOfStockUnits', 'وحدات نفذت'),
            [t('products:stats.value', 'القيمة')]: inventorySummary.outOfStockUnits ?? '-',
          },
          {
            [t('products:stats.metric', 'المقياس')]: t('products:stats.totalInventoryValue', 'إجمالي قيمة المخزون'),
            [t('products:stats.value', 'القيمة')]: inventorySummary.totalValue
              ? `${inventorySummary.totalValue.toLocaleString('en-US')} $`
              : '-',
          },
        ];
        const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
        XLSX.utils.book_append_sheet(wb, wsInventory, t('products:stats.inventorySheet', 'المخزون'));
      }

      if (inventorySummary?.variantsPerProduct && inventorySummary.variantsPerProduct.length > 0) {
        const variantsData = inventorySummary.variantsPerProduct.map((row) => ({
          [t('products:stats.product', 'المنتج')]: row.productName || row.productId,
          [t('products:stats.variantsCount', 'عدد المتغيرات')]: row.variantsCount,
          [t('products:stats.totalUnits', 'إجمالي الوحدات')]: row.totalUnits ?? '-',
        }));
        const wsVariants = XLSX.utils.json_to_sheet(variantsData);
        XLSX.utils.book_append_sheet(wb, wsVariants, t('products:stats.variantsSheet', 'المتغيرات'));
      }

      const dateRangeData = [
        {
          [t('products:stats.field', 'الحقل')]: t('products:stats.dateFrom', 'من تاريخ'),
          [t('products:stats.value', 'القيمة')]: dateRange.start || '-',
        },
        {
          [t('products:stats.field', 'الحقل')]: t('products:stats.dateTo', 'إلى تاريخ'),
          [t('products:stats.value', 'القيمة')]: dateRange.end || '-',
        },
      ];
      const wsDateRange = XLSX.utils.json_to_sheet(dateRangeData);
      XLSX.utils.book_append_sheet(wb, wsDateRange, t('products:stats.dateRangeSheet', 'نطاق التاريخ'));

      const fileName = `products-analytics-${dateStr}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(t('products:stats.exportSuccess', 'تم تصدير البيانات بنجاح'));
    } catch {
      toast.error(t('products:stats.exportError', 'حدث خطأ أثناء تصدير البيانات'));
    }
  };

  if (loadingStats && !stats) {
    return (
      <PageShell spacing="compact" fullHeight>
        <LoadingState variant="skeleton" rows={6} />
      </PageShell>
    );
  }

  if (statsError) {
    return (
      <PageShell spacing="compact" fullHeight>
        <ErrorState
          title={t('products:stats.loadError', 'حدث خطأ أثناء تحميل الإحصائيات')}
          onRetry={handleRefresh}
        />
      </PageShell>
    );
  }

  return (
    <PageShell spacing="compact" fullHeight>
      <PageHeader
        variant="compact"
        title={t('products:stats.title', 'إحصائيات المنتجات')}
        description={t('products:stats.description', 'عرض وتحليل بيانات المنتجات')}
        breadcrumbs={[
          { label: t('products:list.title', 'المنتجات'), to: '/products' },
          { label: t('products:stats.title', 'إحصائيات المنتجات') },
        ]}
        actions={[
          {
            label: t('products:stats.export', 'تصدير البيانات'),
            icon: <Download />,
            variant: 'primary',
            onClick: handleExportData,
          },
        ]}
      />

      <ProductAnalyticsToolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        loading={loadingStats || loadingInventory}
      />

      <ProductAnalyticsStatsCards
        stats={stats}
        inventory={inventorySummary}
        loading={loadingStats}
      />

      <ProductAnalyticsCharts
        stats={stats}
        inventory={inventorySummary}
        loadingStats={loadingStats}
        loadingInventory={loadingInventory}
      />
    </PageShell>
  );
};
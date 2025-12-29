import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  ListOrdersParams,
  UpdateOrderStatusDto,
  ShipOrderDto,
  RefundOrderDto,
  CancelOrderDto,
  AddOrderNotesDto,
  BulkOrderUpdateDto,
  OrderAnalyticsParams,
  VerifyPaymentDto,
} from '../types/order.types';

const ORDERS_KEY = 'orders';

// List orders
export const useOrders = (params: ListOrdersParams) => {
  return useQuery({
    queryKey: [ORDERS_KEY, params],
    queryFn: () => ordersApi.list(params),
    placeholderData: (previousData) => previousData,
  });
};

// List out of stock orders
export const useOutOfStockOrders = (params: ListOrdersParams) => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'out-of-stock', params],
    queryFn: () => ordersApi.getOutOfStockOrders(params),
    placeholderData: (previousData) => previousData,
  });
};

// Get single order
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: [ORDERS_KEY, id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusDto }) =>
      ordersApi.updateStatus(id, data),
    onSuccess: () => {
      toast.success('تم تحديث حالة الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Ship order
export const useShipOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShipOrderDto }) => ordersApi.ship(id, data),
    onSuccess: () => {
      toast.success('تم شحن الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Refund order
export const useRefundOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RefundOrderDto }) => ordersApi.refund(id, data),
    onSuccess: () => {
      toast.success('تم استرداد المبلغ بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelOrderDto }) => ordersApi.cancel(id, data),
    onSuccess: () => {
      toast.success('تم إلغاء الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Add order notes
export const useAddOrderNotes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddOrderNotesDto }) => ordersApi.addNotes(id, data),
    onSuccess: () => {
      toast.success('تم إضافة الملاحظات بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Bulk update orders status
export const useBulkUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkOrderUpdateDto) => ordersApi.bulkUpdateStatus(data),
    onSuccess: (data) => {
      const successCount = data.results.length;
      const errorCount = data.errors.length;
      toast.success(`تم تحديث ${successCount} طلب بنجاح${errorCount > 0 ? `، فشل ${errorCount} طلب` : ''}`);
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Get order analytics
export const useOrderAnalytics = (params: OrderAnalyticsParams) => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'analytics', params],
    queryFn: () => ordersApi.getAnalytics(params),
  });
};

// Get revenue analytics
export const useRevenueAnalytics = (fromDate?: string, toDate?: string) => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'revenue-analytics', fromDate, toDate],
    queryFn: () => ordersApi.getRevenueAnalytics(fromDate, toDate),
  });
};

// Get performance analytics
export const usePerformanceAnalytics = () => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'performance-analytics'],
    queryFn: () => ordersApi.getPerformanceAnalytics(),
  });
};

// Get order tracking
export const useOrderTracking = (id: string) => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'tracking', id],
    queryFn: () => ordersApi.getTracking(id),
    enabled: !!id,
  });
};

// Generate orders report
export const useGenerateOrdersReport = () => {
  return useMutation({
    mutationFn: ({ params, format }: { params: ListOrdersParams; format?: 'json' | 'pdf' | 'excel' }) =>
      ordersApi.generateOrdersReport(params, format),
    onSuccess: () => {
      toast.success('تم إنشاء التقرير بنجاح');
    },
    onError: ErrorHandler.showError,
  });
};

// Generate financial report
export const useGenerateFinancialReport = () => {
  return useMutation({
    mutationFn: () => ordersApi.generateFinancialReport(),
    onSuccess: () => {
      toast.success('تم إنشاء التقرير المالي بنجاح');
    },
    onError: ErrorHandler.showError,
  });
};

// Helper function to generate CSV from data
const generateCSV = (_data: any, summary: any): string => {
  const rows: string[] = [];
  
  // Add summary section
  rows.push('تحليلات الطلبات - ملخص');
  rows.push('');
  rows.push(`إجمالي الطلبات,${summary?.totalOrders || 0}`);
  rows.push(`إجمالي الإيرادات,${summary?.totalRevenue || 0}`);
  rows.push(`متوسط قيمة الطلب,${summary?.averageOrderValue || 0}`);
  rows.push('');
  
  // Add status breakdown
  if (summary?.byStatus && Array.isArray(summary.byStatus)) {
    rows.push('الطلبات حسب الحالة');
    rows.push('الحالة,العدد');
    summary.byStatus.forEach((item: any) => {
      const status = item._id || item.status || '';
      const count = item.count || 0;
      rows.push(`${status},${count}`);
    });
    rows.push('');
  }
  
  // Add performance metrics
  if (summary?.performance) {
    rows.push('مؤشرات الأداء');
    rows.push('المؤشر,القيمة');
    const perf = summary.performance;
    if (perf.averageProcessingTime !== undefined) {
      rows.push(`متوسط وقت المعالجة,${perf.averageProcessingTime} أيام`);
    }
    if (perf.fulfillmentRate !== undefined) {
      rows.push(`معدل الإنجاز,${perf.fulfillmentRate}%`);
    }
    if (perf.cancellationRate !== undefined) {
      rows.push(`معدل الإلغاء,${perf.cancellationRate}%`);
    }
    if (perf.returnRate !== undefined) {
      rows.push(`معدل الإرجاع,${perf.returnRate}%`);
    }
    if (perf.customerSatisfaction !== undefined) {
      rows.push(`رضا العملاء,${perf.customerSatisfaction}/5`);
    }
  }
  
  return rows.join('\n');
};

// Helper function to generate JSON from data
const generateJSON = (data: any, summary: any): string => {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    summary: summary || {},
    data: data || {},
  }, null, 2);
};

// Helper function to generate PDF content (simple HTML-based PDF)
const generatePDF = (_data: any, summary: any): string => {
  const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير تحليلات الطلبات</title>
  <style>
    body {
      font-family: 'Arial', 'Tahoma', sans-serif;
      direction: rtl;
      padding: 20px;
      line-height: 1.6;
    }
    h1 {
      color: #1976d2;
      text-align: center;
      border-bottom: 3px solid #1976d2;
      padding-bottom: 10px;
    }
    h2 {
      color: #424242;
      margin-top: 30px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: right;
    }
    th {
      background-color: #1976d2;
      color: white;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f5f5f5;
    }
    .summary-box {
      background-color: #e3f2fd;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .metric {
      display: inline-block;
      margin: 10px 20px;
      padding: 10px;
      background-color: white;
      border-radius: 5px;
      min-width: 150px;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
    }
  </style>
</head>
<body>
  <h1>تقرير تحليلات الطلبات</h1>
  <p style="text-align: center; color: #666;">تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}</p>
  
  <div class="summary-box">
    <h2>الملخص</h2>
    <div class="metric">
      <div class="metric-label">إجمالي الطلبات</div>
      <div class="metric-value">${summary?.totalOrders || 0}</div>
    </div>
    <div class="metric">
      <div class="metric-label">إجمالي الإيرادات</div>
      <div class="metric-value">${summary?.totalRevenue || 0}</div>
    </div>
    <div class="metric">
      <div class="metric-label">متوسط قيمة الطلب</div>
      <div class="metric-value">${summary?.averageOrderValue?.toFixed(2) || 0}</div>
    </div>
  </div>
  
  ${summary?.byStatus && Array.isArray(summary.byStatus) && summary.byStatus.length > 0 ? `
  <h2>الطلبات حسب الحالة</h2>
  <table>
    <thead>
      <tr>
        <th>الحالة</th>
        <th>العدد</th>
      </tr>
    </thead>
    <tbody>
      ${summary.byStatus.map((item: any) => `
      <tr>
        <td>${item._id || item.status || ''}</td>
        <td>${item.count || 0}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}
  
  ${summary?.performance ? `
  <h2>مؤشرات الأداء</h2>
  <table>
    <thead>
      <tr>
        <th>المؤشر</th>
        <th>القيمة</th>
      </tr>
    </thead>
    <tbody>
      ${summary.performance.averageProcessingTime !== undefined ? `
      <tr>
        <td>متوسط وقت المعالجة</td>
        <td>${summary.performance.averageProcessingTime.toFixed(2)} أيام</td>
      </tr>
      ` : ''}
      ${summary.performance.fulfillmentRate !== undefined ? `
      <tr>
        <td>معدل الإنجاز</td>
        <td>${summary.performance.fulfillmentRate.toFixed(2)}%</td>
      </tr>
      ` : ''}
      ${summary.performance.cancellationRate !== undefined ? `
      <tr>
        <td>معدل الإلغاء</td>
        <td>${summary.performance.cancellationRate.toFixed(2)}%</td>
      </tr>
      ` : ''}
      ${summary.performance.returnRate !== undefined ? `
      <tr>
        <td>معدل الإرجاع</td>
        <td>${summary.performance.returnRate.toFixed(2)}%</td>
      </tr>
      ` : ''}
      ${summary.performance.customerSatisfaction !== undefined ? `
      <tr>
        <td>رضا العملاء</td>
        <td>${summary.performance.customerSatisfaction.toFixed(2)}/5</td>
      </tr>
      ` : ''}
    </tbody>
  </table>
  ` : ''}
  
  <p style="text-align: center; color: #999; margin-top: 40px; font-size: 12px;">
    تم إنشاء هذا التقرير تلقائياً من نظام إدارة الطلبات
  </p>
</body>
</html>
  `;
  return htmlContent;
};

// Export order analytics
export const useExportOrderAnalytics = () => {
  return useMutation({
    mutationFn: ({
      format,
      days,
      fromDate,
      toDate,
    }: {
      format?: string;
      days?: number;
      fromDate?: string;
      toDate?: string;
    }) => ordersApi.exportOrderAnalytics(format || 'csv', days, fromDate, toDate),
    onSuccess: (data) => {
      const exportFormat = data.format || 'csv';
      const fileName = data.fileName || `order_analytics_${Date.now()}.${exportFormat}`;
      const summary = data.summary || {};
      
      let content: string;
      let mimeType: string;
      
      try {
        switch (exportFormat.toLowerCase()) {
          case 'csv':
            content = generateCSV(data, summary);
            mimeType = 'text/csv;charset=utf-8;';
            break;
          case 'json':
            content = generateJSON(data, summary);
            mimeType = 'application/json;charset=utf-8;';
            break;
          case 'xlsx':
          case 'excel':
            // For Excel, we'll generate CSV as fallback (requires xlsx library for full support)
            content = generateCSV(data, summary);
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            toast('ملاحظة: يتم تصدير Excel كـ CSV حالياً. لإضافة دعم كامل لـ Excel، يرجى تثبيت مكتبة xlsx', { icon: 'ℹ️' });
            break;
          case 'pdf':
            // Generate HTML-based PDF content
            content = generatePDF(data, summary);
            mimeType = 'text/html';
            // Create blob and open in new window for printing/saving as PDF
            const pdfBlob = new Blob([content], { type: 'text/html;charset=utf-8;' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const pdfWindow = window.open(pdfUrl, '_blank');
            if (pdfWindow) {
              pdfWindow.onload = () => {
                pdfWindow.print();
              };
            }
            URL.revokeObjectURL(pdfUrl);
            toast.success(`تم فتح التقرير في نافذة جديدة. استخدم Ctrl+P لحفظه كـ PDF`);
            return; // Early return since we handled PDF differently
          default:
            content = generateCSV(data, summary);
            mimeType = 'text/csv;charset=utf-8;';
        }
        
        // Create blob and download
        const blob = new Blob(['\ufeff' + content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = fileName;
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        toast.success(`تم تصدير البيانات بنجاح (${data.recordCount || 0} سجل)`);
      } catch (error) {
        console.error('Error generating export file:', error);
        toast.error('حدث خطأ أثناء إنشاء الملف');
      }
    },
    onError: ErrorHandler.showError,
  });
};

// Export orders list
export const useExportOrders = () => {
  return useMutation({
    mutationFn: ({ format, params }: { format?: string; params: ListOrdersParams }) =>
      ordersApi.exportOrders(format || 'csv', params),
    onSuccess: (data) => {
      toast.success('تم تصدير قائمة الطلبات بنجاح');
      if (data?.fileUrl) {
        window.open(data.fileUrl, '_blank');
      }
    },
    onError: ErrorHandler.showError,
  });
};

// Get stats
export const useOrderStats = () => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'stats'],
    queryFn: () => ordersApi.getStats(),
  });
};

// Verify payment
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VerifyPaymentDto }) =>
      ordersApi.verifyPayment(id, data),
    onSuccess: (data) => {
      const message = data.paymentStatus === 'paid' 
        ? 'تم قبول الدفع بنجاح' 
        : 'تم رفض الدفع - المبلغ غير كافٍ';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Send invoice manually
export const useSendInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.sendInvoice(id),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'تم إرسال الفاتورة بنجاح إلى إيميل المبيعات');
        queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
      } else {
        toast.error(data.message || 'فشل في إرسال الفاتورة');
      }
    },
    onError: ErrorHandler.showError,
  });
};
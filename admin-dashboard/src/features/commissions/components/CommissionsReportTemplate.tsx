import React from 'react';
import { CommissionsReport } from '../types/commissions.types';
import { formatCurrency, formatNumber } from '@/shared/utils/formatters';

interface Props {
  report: CommissionsReport;
  id: string; // سنحتاج هذا المعرف لاحقاً
}

export const CommissionsReportTemplate: React.FC<Props> = ({ report, id }) => {
  // تنسيقات CSS لضمان شكل الطباعة
  const styles = {
    container: {
      width: '210mm', // عرض A4
      minHeight: '297mm', // طول A4
      padding: '20mm',
      backgroundColor: 'white',
      direction: 'rtl' as const,
      fontFamily: '"Graphik Arabic", "Cairo", "Tajawal", sans-serif',
      color: '#333',
      boxSizing: 'border-box' as const,
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '30px',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '15px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold' as const,
      marginBottom: '10px',
      color: '#1f2937',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '5px 0',
    },
    section: {
      marginTop: '30px',
      marginBottom: '30px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold' as const,
      marginBottom: '15px',
      color: '#374151',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '8px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '15px',
      fontSize: '12px',
    },
    th: {
      backgroundColor: '#f3f4f6',
      border: '1px solid #e5e7eb',
      padding: '10px 8px',
      textAlign: 'right' as const,
      fontWeight: 'bold' as const,
      color: '#374151',
    },
    td: {
      border: '1px solid #e5e7eb',
      padding: '10px 8px',
      textAlign: 'right' as const,
      color: '#1f2937',
    },
    summaryTable: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '15px',
      fontSize: '13px',
    },
    summaryRow: {
      borderBottom: '1px solid #e5e7eb',
    },
    summaryLabel: {
      backgroundColor: '#f9fafb',
      padding: '12px',
      fontWeight: 'bold' as const,
      textAlign: 'right' as const,
      width: '50%',
    },
    summaryValue: {
      padding: '12px',
      textAlign: 'right' as const,
      width: '50%',
    },
    // فئة لمنع قص العناصر عند نهاية الصفحة
    pageBreak: {
      pageBreakInside: 'avoid' as const,
    },
    periodLabel: {
      display: 'inline-block',
      margin: '0 5px',
      padding: '4px 8px',
      backgroundColor: '#eff6ff',
      borderRadius: '4px',
      fontSize: '12px',
    },
  };

  const periodLabels: { [key: string]: string } = {
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري',
    yearly: 'سنوي',
    custom: 'مخصص',
  };

  const dateFrom = report.dateFrom
    ? new Date(report.dateFrom).toLocaleDateString('ar-EG')
    : 'غير محدد';
  const dateTo = report.dateTo
    ? new Date(report.dateTo).toLocaleDateString('ar-EG')
    : 'غير محدد';

  return (
    <div id={id} style={styles.container}>
      {/* الترويسة */}
      <div style={styles.header}>
        <h1 style={styles.title}>تقرير العمولات</h1>
        <div>
          <span style={styles.subtitle}>
            الفترة:{' '}
            <span style={styles.periodLabel}>
              {periodLabels[report.period] || report.period}
            </span>
          </span>
        </div>
        <div>
          <span style={styles.subtitle}>من تاريخ: {dateFrom}</span>
          <span style={{ ...styles.subtitle, margin: '0 15px' }}> - </span>
          <span style={styles.subtitle}>إلى تاريخ: {dateTo}</span>
        </div>
      </div>

      {/* الملخص */}
      <div style={{ ...styles.section, ...styles.pageBreak }}>
        <h2 style={styles.sectionTitle}>الملخص العام</h2>
        <table style={styles.summaryTable}>
          <tbody>
            <tr style={styles.summaryRow}>
              <td style={styles.summaryLabel}>إجمالي المهندسين</td>
              <td style={styles.summaryValue}>{formatNumber(report.summary.totalEngineers || 0)}</td>
            </tr>
            <tr style={styles.summaryRow}>
              <td style={styles.summaryLabel}>إجمالي العمولات</td>
              <td style={styles.summaryValue}>
                {formatCurrency(report.summary.totalCommissions || 0)}
              </td>
            </tr>
            <tr style={styles.summaryRow}>
              <td style={styles.summaryLabel}>إجمالي المبيعات</td>
              <td style={styles.summaryValue}>{formatNumber(report.summary.totalSales || 0)}</td>
            </tr>
            <tr style={styles.summaryRow}>
              <td style={styles.summaryLabel}>إجمالي الإيرادات</td>
              <td style={styles.summaryValue}>
                {formatCurrency(report.summary.totalRevenue || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* جدول المهندسين */}
      {report.engineers && report.engineers.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>تفاصيل المهندسين</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>اسم المهندس</th>
                <th style={styles.th}>رقم الهاتف</th>
                <th style={styles.th}>إجمالي العمولة</th>
                <th style={styles.th}>إجمالي المبيعات</th>
                <th style={styles.th}>إجمالي الإيرادات</th>
              </tr>
            </thead>
            <tbody>
              {report.engineers.map((engineer, index) => (
                <tr key={index} style={styles.pageBreak}>
                  <td style={styles.td}>{engineer.engineerName || '-'}</td>
                  <td style={styles.td}>{engineer.engineerPhone || '-'}</td>
                  <td style={styles.td}>
                    {formatCurrency(engineer.totals?.totalCommission || 0)}
                  </td>
                  <td style={styles.td}>{formatNumber(engineer.totals?.totalSales || 0)}</td>
                  <td style={styles.td}>
                    {formatCurrency(engineer.totals?.totalRevenue || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* تفصيل الكوبونات */}
      {report.engineers &&
        report.engineers.some((e) => e.coupons && e.coupons.length > 0) && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>تفصيل حسب الكوبونات</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>اسم المهندس</th>
                  <th style={styles.th}>كود الكوبون</th>
                  <th style={styles.th}>اسم الكوبون</th>
                  <th style={styles.th}>نسبة العمولة</th>
                  <th style={styles.th}>عمولة الكوبون</th>
                  <th style={styles.th}>مبيعات الكوبون</th>
                  <th style={styles.th}>إيرادات الكوبون</th>
                </tr>
              </thead>
              <tbody>
                {report.engineers.map((engineer) =>
                  engineer.coupons?.map((coupon, couponIndex) => (
                    <tr key={`${engineer.engineerId}-${couponIndex}`} style={styles.pageBreak}>
                      <td style={styles.td}>{engineer.engineerName || '-'}</td>
                      <td style={styles.td}>{coupon.couponCode || '-'}</td>
                      <td style={styles.td}>{coupon.couponName || '-'}</td>
                      <td style={styles.td}>{coupon.commissionRate || 0}%</td>
                      <td style={styles.td}>
                        {formatCurrency(coupon.totalCommission || 0)}
                      </td>
                      <td style={styles.td}>{formatNumber(coupon.totalSales || 0)}</td>
                      <td style={styles.td}>
                        {formatCurrency(coupon.totalRevenue || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      {/* تفصيل حسب الفترة */}
      {report.periodBreakdown && report.periodBreakdown.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>تفصيل حسب الفترة</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>الفترة</th>
                <th style={styles.th}>إجمالي العمولة</th>
                <th style={styles.th}>إجمالي المبيعات</th>
                <th style={styles.th}>إجمالي الإيرادات</th>
              </tr>
            </thead>
            <tbody>
              {report.periodBreakdown.map((period, index) => (
                <tr key={index} style={styles.pageBreak}>
                  <td style={styles.td}>{period.period || '-'}</td>
                  <td style={styles.td}>
                    {formatCurrency(period.totalCommission || 0)}
                  </td>
                  <td style={styles.td}>{formatNumber(period.totalSales || 0)}</td>
                  <td style={styles.td}>
                    {formatCurrency(period.totalRevenue || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          fontSize: '10px',
          color: '#9ca3af',
        }}
      >
        <p>
          تم الإنشاء في: {new Date().toLocaleDateString('ar-EG')}{' '}
          {new Date().toLocaleTimeString('ar-EG')}
        </p>
      </div>
    </div>
  );
};


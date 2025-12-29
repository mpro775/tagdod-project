import { CommissionsReport, AccountStatement } from '../types/commissions.types';
import { formatCurrency, formatNumber } from '@/shared/utils/formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// @ts-ignore - arabic-reshaper doesn't have type definitions
import ArabicReshaper from 'arabic-reshaper';
// @ts-ignore - html2pdf.js doesn't have type definitions
import html2pdf from 'html2pdf.js';

/**
 * تحميل الخط العربي وإضافته إلى jsPDF
 * ملاحظة: jsPDF يحتاج الخط بصيغة خاصة (subset font)
 * الطريقة الموصى بها: استخدام Font Converter من jsPDF لتحويل الخط مسبقاً
 * رابط Font Converter: https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
 */
async function loadArabicFont(doc: jsPDF): Promise<boolean> {
  try {
    // تحميل الخط العادي (Regular)
    const regularFontPath = `/fonts/GraphikArabic-Regular.ttf`;
    let regularResponse = await fetch(regularFontPath);

    // إذا فشل، جرب مسارات بديلة
    if (!regularResponse.ok) {
      const altPaths = [
        `./fonts/GraphikArabic-Regular.ttf`,
        `fonts/GraphikArabic-Regular.ttf`,
        `/public/fonts/GraphikArabic-Regular.ttf`,
      ];

      for (const altPath of altPaths) {
        try {
          regularResponse = await fetch(altPath);
          if (regularResponse.ok) break;
        } catch {
          continue;
        }
      }
    }

    if (!regularResponse.ok) {
      console.warn(`Could not load regular font. Status: ${regularResponse.status}`);
      return false;
    }

    const regularFontArrayBuffer = await regularResponse.arrayBuffer();
    const regularBase64Font = arrayBufferToBase64(regularFontArrayBuffer);

    // تحميل الخط العريض (Bold)
    const boldFontPath = `/fonts/GraphikArabic-Bold.ttf`;
    let boldResponse = await fetch(boldFontPath);

    if (!boldResponse.ok) {
      const altPaths = [
        `./fonts/GraphikArabic-Bold.ttf`,
        `fonts/GraphikArabic-Bold.ttf`,
        `/public/fonts/GraphikArabic-Bold.ttf`,
      ];

      for (const altPath of altPaths) {
        try {
          boldResponse = await fetch(altPath);
          if (boldResponse.ok) break;
        } catch {
          continue;
        }
      }
    }

    let boldBase64Font: string | null = null;
    if (boldResponse.ok) {
      const boldFontArrayBuffer = await boldResponse.arrayBuffer();
      boldBase64Font = arrayBufferToBase64(boldFontArrayBuffer);
    }

    // إضافة الخطوط إلى jsPDF
    try {
      // إضافة الخط العادي
      doc.addFileToVFS('GraphikArabic-Regular.ttf', regularBase64Font);
      doc.addFont('GraphikArabic-Regular.ttf', 'GraphikArabic', 'normal');

      // إضافة الخط العريض إذا كان متوفراً
      if (boldBase64Font) {
        doc.addFileToVFS('GraphikArabic-Bold.ttf', boldBase64Font);
        doc.addFont('GraphikArabic-Bold.ttf', 'GraphikArabic', 'bold');
        console.log('Arabic fonts (regular and bold) loaded successfully');
      } else {
        console.log('Arabic font (regular only) loaded successfully');
        console.warn('Bold font not found, using normal font for bold text');
      }

      return true;
    } catch (fontError: any) {
      console.error('Error adding font to jsPDF:', fontError);
      console.warn('jsPDF may need font in special format (subset font)');
      console.warn(
        'Please use Font Converter: https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html'
      );
      return false;
    }
  } catch (error) {
    console.error('Error loading Arabic font:', error);
    return false;
  }
}

/**
 * تحويل ArrayBuffer إلى Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * دالة معالجة النص العربي
 * تقوم بـ:
 * 1. تشكيل الحروف (توصيلها ببعض) باستخدام arabic-reshaper
 * 2. عكس النص (لأن jsPDF يطبع الحروف بترتيب عكسي للعربية)
 *
 * ملاحظة: الأرقام والتواريخ قد تحتاج معالجة خاصة لتجنب عكسها
 */
const processArabicText = (text: string): string => {
  if (!text) return '';
  try {
    // 1. تشكيل النص (تحويل الحروف لأشكالها المتصلة)
    const shapedText = ArabicReshaper.convertArabic(String(text));
    // 2. عكس النص (هذا ضروري لظهور النص العربي بشكل صحيح في jsPDF)
    return shapedText.split('').reverse().join('');
  } catch (e) {
    console.warn('Error processing Arabic text:', e);
    return text;
  }
};

/**
 * تصدير تقرير العمولات إلى PDF
 */
export const exportCommissionsReportToPDF = async (report: CommissionsReport) => {
  console.log('exportCommissionsReportToPDF called', { report });
  try {
    if (!report) {
      console.error('Report is undefined');
      alert('لا توجد بيانات للتصدير');
      return;
    }

    if (!report.summary) {
      console.error('Report summary is undefined');
      alert('لا توجد بيانات ملخصة للتصدير');
      return;
    }

    // إنشاء مستند PDF جديد
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // تحميل الخط العربي
    const fontLoaded = await loadArabicFont(doc);
    const fontFamily = fontLoaded ? 'GraphikArabic' : 'helvetica';

    // محاولة التحقق من أن الخط Bold متوفر
    // إذا لم يكن متوفراً، سنستخدم 'normal' بدلاً من 'bold'
    let boldStyle: 'bold' | 'normal' = 'bold';
    if (fontLoaded) {
      try {
        // محاولة استخدام الخط Bold - إذا فشل، سنستخدم normal
        doc.setFont(fontFamily, 'bold');
        // إذا وصلنا هنا بدون خطأ، الخط Bold متوفر
      } catch {
        // الخط Bold غير متوفر، استخدم normal
        boldStyle = 'normal';
        console.warn('Bold font not available, using normal font for bold text');
      }
    }

    // إعدادات RTL
    doc.setR2L(true);

    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Header
    doc.setFontSize(20);
    doc.setFont(fontFamily, boldStyle);
    doc.text(processArabicText('تقرير العمولات'), pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // معلومات الفترة
    doc.setFontSize(12);
    doc.setFont(fontFamily, 'normal');
    const periodLabels: { [key: string]: string } = {
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      yearly: 'سنوي',
      custom: 'مخصص',
    };
    const periodLabel = periodLabels[report.period] || report.period;
    doc.text(processArabicText(`الفترة: ${periodLabel}`), margin, yPosition);
    yPosition += 6;

    const dateFrom = report.dateFrom
      ? new Date(report.dateFrom).toLocaleDateString('ar-EG')
      : 'غير محدد';
    const dateTo = report.dateTo ? new Date(report.dateTo).toLocaleDateString('ar-EG') : 'غير محدد';
    // معالجة النص العربي مع التاريخ بشكل منفصل لتجنب عكس الأرقام
    doc.text(processArabicText('من تاريخ: ') + dateFrom, margin, yPosition);
    yPosition += 6;
    doc.text(processArabicText('إلى تاريخ: ') + dateTo, margin, yPosition);
    yPosition += 10;

    // Summary Section
    doc.setFontSize(14);
    doc.setFont(fontFamily, boldStyle);
    doc.text(processArabicText('الملخص'), margin, yPosition);
    yPosition += 8;

    // Summary Table
    const summaryData = [
      [processArabicText('إجمالي المهندسين'), formatNumber(report.summary.totalEngineers || 0)],
      [processArabicText('إجمالي العمولات'), formatCurrency(report.summary.totalCommissions || 0)],
      [processArabicText('إجمالي المبيعات'), formatNumber(report.summary.totalSales || 0)],
      [processArabicText('إجمالي الإيرادات'), formatCurrency(report.summary.totalRevenue || 0)],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [[processArabicText('المؤشر'), processArabicText('القيمة')]],
      body: summaryData,
      theme: 'striped',
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'right',
      },
      bodyStyles: {
        halign: 'right',
      },
      styles: {
        font: fontFamily,
        fontSize: 10,
        cellPadding: 5,
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Engineers Table
    if (report.engineers && report.engineers.length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont(fontFamily, boldStyle);
      doc.text(processArabicText('المهندسين'), margin, yPosition);
      yPosition += 8;

      const engineersData = report.engineers.map((engineer) => [
        processArabicText(engineer.engineerName || '-'),
        engineer.engineerPhone || '-',
        formatCurrency(engineer.totals?.totalCommission || 0),
        formatNumber(engineer.totals?.totalSales || 0),
        formatCurrency(engineer.totals?.totalRevenue || 0),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [
          [
            processArabicText('اسم المهندس'),
            processArabicText('رقم الهاتف'),
            processArabicText('إجمالي العمولة'),
            processArabicText('إجمالي المبيعات'),
            processArabicText('إجمالي الإيرادات'),
          ],
        ],
        body: engineersData,
        theme: 'striped',
        headStyles: {
          fillColor: [76, 175, 80],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'right',
        },
        bodyStyles: {
          halign: 'right',
        },
        styles: {
          font: fontFamily,
          fontSize: 9,
          cellPadding: 4,
        },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 30 },
          4: { cellWidth: 35 },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;

      // Coupons Breakdown (if exists)
      const engineersWithCoupons = report.engineers.filter(
        (e) => e.coupons && e.coupons.length > 0
      );

      if (engineersWithCoupons.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont(fontFamily, boldStyle);
        doc.text(processArabicText('تفصيل حسب الكوبونات'), margin, yPosition);
        yPosition += 8;

        const couponsData: string[][] = [];

        engineersWithCoupons.forEach((engineer) => {
          engineer.coupons?.forEach((coupon) => {
            couponsData.push([
              processArabicText(engineer.engineerName || '-'),
              coupon.couponCode || '-',
              processArabicText(coupon.couponName || '-'),
              `${coupon.commissionRate || 0}%`,
              formatCurrency(coupon.totalCommission || 0),
              formatNumber(coupon.totalSales || 0),
              formatCurrency(coupon.totalRevenue || 0),
            ]);
          });
        });

        autoTable(doc, {
          startY: yPosition,
          head: [
            [
              processArabicText('اسم المهندس'),
              processArabicText('كود الكوبون'),
              processArabicText('اسم الكوبون'),
              processArabicText('نسبة العمولة'),
              processArabicText('عمولة الكوبون'),
              processArabicText('مبيعات الكوبون'),
              processArabicText('إيرادات الكوبون'),
            ],
          ],
          body: couponsData,
          theme: 'striped',
          headStyles: {
            fillColor: [255, 152, 0],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'right',
          },
          bodyStyles: {
            halign: 'right',
          },
          styles: {
            font: fontFamily,
            fontSize: 8,
            cellPadding: 3,
          },
          margin: { left: margin, right: margin },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
    }

    // Period Breakdown
    if (report.periodBreakdown && report.periodBreakdown.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont(fontFamily, boldStyle);
      doc.text(processArabicText('تفصيل حسب الفترة'), margin, yPosition);
      yPosition += 8;

      const periodData = report.periodBreakdown.map((period) => [
        period.period || '-',
        formatCurrency(period.totalCommission || 0),
        formatNumber(period.totalSales || 0),
        formatCurrency(period.totalRevenue || 0),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [
          [
            processArabicText('الفترة'),
            processArabicText('إجمالي العمولة'),
            processArabicText('إجمالي المبيعات'),
            processArabicText('إجمالي الإيرادات'),
          ],
        ],
        body: periodData,
        theme: 'striped',
        headStyles: {
          fillColor: [156, 39, 176],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'right',
        },
        bodyStyles: {
          halign: 'right',
        },
        styles: {
          font: fontFamily,
          fontSize: 10,
          cellPadding: 5,
        },
        margin: { left: margin, right: margin },
      });
    }

    // Footer on last page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(fontFamily, 'normal');
      // معالجة النص العربي مع الأرقام بشكل منفصل
      const pageText =
        processArabicText('صفحة') + ` ${i} ` + processArabicText('من') + ` ${pageCount}`;
      doc.text(pageText, pageWidth / 2, pageHeight - 10, {
        align: 'center',
      });
      // معالجة النص العربي مع التاريخ والوقت بشكل منفصل
      const createdDate = new Date().toLocaleDateString('ar-EG');
      const createdTime = new Date().toLocaleTimeString('ar-EG');
      doc.text(
        processArabicText('تم الإنشاء في: ') + `${createdDate} ${createdTime}`,
        margin,
        pageHeight - 10
      );
    }

    // حفظ الملف
    const fileName = `commissions-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error exporting commissions report to PDF:', error);
    alert('حدث خطأ أثناء تصدير التقرير. يرجى المحاولة مرة أخرى.');
  }
};

/**
 * تصدير تقرير العمولات إلى Excel (CSV) - محفوظ للتوافق مع الإصدارات السابقة
 */
export const exportCommissionsReportToExcel = (report: CommissionsReport) => {
  console.log('exportCommissionsReportToExcel called', { report });
  try {
    if (!report) {
      console.error('Report is undefined');
      alert('لا توجد بيانات للتصدير');
      return;
    }

    if (!report.summary) {
      console.error('Report summary is undefined');
      alert('لا توجد بيانات ملخصة للتصدير');
      return;
    }

    const rows: string[][] = [];

    // Header
    rows.push(['تقرير العمولات']);
    rows.push(['الفترة', report.period || 'غير محدد']);
    rows.push([
      'من تاريخ',
      report.dateFrom ? new Date(report.dateFrom).toLocaleDateString('ar-EG') : 'غير محدد',
    ]);
    rows.push([
      'إلى تاريخ',
      report.dateTo ? new Date(report.dateTo).toLocaleDateString('ar-EG') : 'غير محدد',
    ]);
    rows.push([]);

    // Summary
    rows.push(['الملخص']);
    rows.push(['إجمالي المهندسين', (report.summary.totalEngineers || 0).toString()]);
    rows.push(['إجمالي العمولات', formatCurrency(report.summary.totalCommissions || 0)]);
    rows.push(['إجمالي المبيعات', (report.summary.totalSales || 0).toString()]);
    rows.push(['إجمالي الإيرادات', formatCurrency(report.summary.totalRevenue || 0)]);
    rows.push([]);

    // Engineers
    rows.push(['المهندسين']);
    rows.push([
      'اسم المهندس',
      'رقم الهاتف',
      'إجمالي العمولة',
      'إجمالي المبيعات',
      'إجمالي الإيرادات',
      'كود الكوبون',
      'اسم الكوبون',
      'نسبة العمولة',
      'عمولة الكوبون',
      'مبيعات الكوبون',
      'إيرادات الكوبون',
    ]);

    if (report.engineers && report.engineers.length > 0) {
      report.engineers.forEach((engineer) => {
        if (!engineer.coupons || engineer.coupons.length === 0) {
          rows.push([
            engineer.engineerName || '-',
            engineer.engineerPhone || '-',
            formatCurrency(engineer.totals?.totalCommission || 0),
            (engineer.totals?.totalSales || 0).toString(),
            formatCurrency(engineer.totals?.totalRevenue || 0),
            '-',
            '-',
            '-',
            '-',
            '-',
            '-',
          ]);
        } else {
          engineer.coupons.forEach((coupon, index) => {
            rows.push([
              index === 0 ? engineer.engineerName || '-' : '',
              index === 0 ? engineer.engineerPhone || '-' : '',
              index === 0 ? formatCurrency(engineer.totals?.totalCommission || 0) : '',
              index === 0 ? (engineer.totals?.totalSales || 0).toString() : '',
              index === 0 ? formatCurrency(engineer.totals?.totalRevenue || 0) : '',
              coupon.couponCode || '-',
              coupon.couponName || '-',
              `${coupon.commissionRate || 0}%`,
              formatCurrency(coupon.totalCommission || 0),
              (coupon.totalSales || 0).toString(),
              formatCurrency(coupon.totalRevenue || 0),
            ]);
          });
        }
      });
    } else {
      rows.push(['لا توجد بيانات']);
    }

    rows.push([]);

    // Period Breakdown
    if (report.periodBreakdown && report.periodBreakdown.length > 0) {
      rows.push(['تفصيل حسب الفترة']);
      rows.push(['الفترة', 'إجمالي العمولة', 'إجمالي المبيعات', 'إجمالي الإيرادات']);

      report.periodBreakdown.forEach((period) => {
        rows.push([
          period.period || '-',
          formatCurrency(period.totalCommission || 0),
          (period.totalSales || 0).toString(),
          formatCurrency(period.totalRevenue || 0),
        ]);
      });
    }

    // Convert to CSV
    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `commissions-report-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error exporting commissions report:', error);
    alert('حدث خطأ أثناء تصدير التقرير. يرجى المحاولة مرة أخرى.');
  }
};

/**
 * تصدير كشف الحساب إلى Excel (CSV)
 */
export const exportAccountStatementToExcel = (statement: AccountStatement) => {
  const rows: string[][] = [];

  // Header
  rows.push(['كشف حساب المهندس']);
  rows.push(['اسم المهندس', statement.engineerName]);
  rows.push(['رقم الهاتف', statement.engineerPhone]);
  rows.push(['من تاريخ', new Date(statement.dateFrom).toLocaleDateString('ar-EG')]);
  rows.push(['إلى تاريخ', new Date(statement.dateTo).toLocaleDateString('ar-EG')]);
  rows.push([]);

  // Summary
  rows.push(['الملخص']);
  rows.push(['الرصيد الافتتاحي', formatCurrency(statement.openingBalance)]);
  rows.push(['الرصيد الختامي', formatCurrency(statement.closingBalance)]);
  rows.push(['إجمالي العمولات', formatCurrency(statement.summary.totalCommissions)]);
  rows.push(['إجمالي السحوبات', formatCurrency(statement.summary.totalWithdrawals)]);
  rows.push(['إجمالي الاستردادات', formatCurrency(statement.summary.totalRefunds)]);
  rows.push(['صافي المبلغ', formatCurrency(statement.summary.netAmount)]);
  rows.push([]);

  // Transactions
  rows.push(['المعاملات']);
  rows.push(['رقم المعاملة', 'النوع', 'المبلغ', 'رقم الطلب', 'كود الكوبون', 'الوصف', 'التاريخ']);

  statement.transactions.forEach((transaction) => {
    rows.push([
      transaction.transactionId,
      transaction.type === 'commission'
        ? 'عمولة'
        : transaction.type === 'withdrawal'
        ? 'سحب'
        : 'استرداد',
      formatCurrency(transaction.amount),
      transaction.orderId || '-',
      transaction.couponCode || '-',
      transaction.description || '-',
      new Date(transaction.createdAt).toLocaleDateString('ar-EG'),
    ]);
  });

  rows.push([]);

  // Coupon Breakdown
  if (statement.couponBreakdown.length > 0) {
    rows.push(['تفصيل حسب الكوبون']);
    rows.push(['كود الكوبون', 'اسم الكوبون', 'نسبة العمولة', 'إجمالي العمولة', 'عدد المعاملات']);

    statement.couponBreakdown.forEach((coupon) => {
      rows.push([
        coupon.couponCode,
        coupon.couponName,
        `${coupon.commissionRate}%`,
        formatCurrency(coupon.totalCommission),
        coupon.transactionCount.toString(),
      ]);
    });
  }

  // Convert to CSV
  const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `account-statement-${statement.engineerId}-${new Date().toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * تصدير تقرير العمولات إلى PDF باستخدام HTML to PDF
 * هذا الحل أفضل للغة العربية لأنه يعتمد على المتصفح لرسم النصوص
 */
export const exportCommissionsReportToPDFFromHTML = (report: CommissionsReport): void => {
  try {
    if (!report) {
      console.error('Report is undefined');
      alert('لا توجد بيانات للتصدير');
      return;
    }

    if (!report.summary) {
      console.error('Report summary is undefined');
      alert('لا توجد بيانات ملخصة للتصدير');
      return;
    }

    // 1. تحديد العنصر الذي نريد طباعته بواسطة الـ ID
    const element = document.getElementById('commissions-report-template-container');

    if (!element) {
      console.error('عنصر التقرير غير موجود في الصفحة');
      alert('عنصر التقرير غير موجود. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
      return;
    }

    // 2. إعدادات المكتبة
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number], // هوامش: أعلى، يسار، أسفل، يمين (mm)
      filename: `commissions-report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2, // scale: 2 لرفع الجودة والوضوح
        useCORS: true,
        letterRendering: true, // مهم للغة العربية
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
      },
    };

    // 3. التنفيذ
    html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error exporting commissions report to PDF from HTML:', error);
    alert('حدث خطأ أثناء تصدير التقرير. يرجى المحاولة مرة أخرى.');
  }
};

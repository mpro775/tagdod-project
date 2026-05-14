import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import { FileStorageService } from './file-storage.service';

export interface ExportOptions {
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  filename?: string;
  folder?: string;
  title?: string;
  data: any;
  branding?: {
    companyName?: string;
    logo?: string;
    colors?: { primary: string; secondary: string };
  };
}

export interface ExportResult {
  url: string;
  filename: string;
  format: string;
  size: number;
  path: string;
}

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private fileStorageService: FileStorageService) {}

  async exportData(options: ExportOptions): Promise<ExportResult> {
    const { format, data, filename, folder, title, branding } = options;

    try {
      switch (format) {
        case 'pdf':
          return await this.exportToPDF(data, filename, folder, title, branding);
        case 'xlsx':
          return await this.exportToExcel(data, filename, folder, title);
        case 'csv':
          return await this.exportToCSV(data, filename, folder);
        case 'json':
          return await this.exportToJSON(data, filename, folder);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      this.logger.error(`Export failed for format ${format}:`, error);
      throw error instanceof Error ? error : new Error(`Failed to export ${format}`);
    }
  }

  private async exportToPDF(
    data: any,
    filename?: string,
    folder?: string,
    title?: string,
    branding?: { companyName?: string; logo?: string; colors?: { primary: string; secondary: string } },
  ): Promise<ExportResult> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 60, bottom: 60, left: 60, right: 60 },
          info: {
            Title: title || 'Report',
            Author: branding?.companyName || 'System',
            Creator: branding?.companyName || 'Reports System',
          },
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        doc.on('end', async () => {
          try {
            const pdfBuffer = Buffer.concat(chunks);
            const fileName = filename || `report_${Date.now()}.pdf`;
            const result = await this.fileStorageService.uploadBuffer(
              pdfBuffer,
              fileName,
              'application/pdf',
              folder,
            );

            resolve({
              url: result.url,
              filename: result.filename,
              format: 'pdf',
              size: result.size,
              path: result.path,
            });
          } catch (error) {
            reject(error);
          }
        });

        doc.on('error', (error) => {
          reject(error);
        });

        const primaryColor = branding?.colors?.primary || '#1a56db';
        const secondaryColor = branding?.colors?.secondary || '#6b7280';
        const companyName = branding?.companyName || '';

        this.generatePDFCover(doc, title, data, companyName, primaryColor);
        this.generatePDFContent(doc, data, title, primaryColor, secondaryColor);
        this.generatePDFFooter(doc, companyName);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private generatePDFCover(
    doc: PDFKit.PDFDocument,
    title?: string,
    data?: any,
    companyName?: string,
    primaryColor?: string,
  ): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc.fillColor(primaryColor || '#1a56db');
    doc.rect(0, 0, pageWidth, pageHeight).fill();

    doc.fillColor('#ffffff');

    if (companyName) {
      doc.fontSize(14).text(companyName, { align: 'center' });
      doc.moveDown(1);
    }

    doc.moveDown(4);

    doc.fontSize(28).font('Helvetica-Bold').text(title || 'Report', {
      align: 'center',
      width: pageWidth - 120,
    });

    doc.moveDown(2);

    doc.fontSize(12).font('Helvetica');

    if (data?.period) {
      doc.text(`Period: ${data.period}`, { align: 'center' });
    }

    if (data?.generatedAt) {
      doc.text(`Generated: ${new Date(data.generatedAt).toLocaleDateString('en-US')}`, {
        align: 'center',
      });
    } else {
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, { align: 'center' });
    }

    doc.moveDown(3);

    if (data?.summary) {
      doc.fontSize(11);
      const summary = data.summary;
      if (summary.totalRevenue !== undefined) {
        doc.text(`Total Revenue: ${Number(summary.totalRevenue).toLocaleString()}`, { align: 'center' });
      }
      if (summary.totalOrders !== undefined) {
        doc.text(`Total Orders: ${Number(summary.totalOrders).toLocaleString()}`, { align: 'center' });
      }
      if (summary.totalRecords !== undefined) {
        doc.text(`Total Records: ${Number(summary.totalRecords).toLocaleString()}`, { align: 'center' });
      }
    }

    doc.moveDown(4);

    doc.fontSize(10).fillColor('#e5e7eb').text('CONFIDENTIAL', { align: 'center' });
  }

  private generatePDFContent(
    doc: PDFKit.PDFDocument,
    data: any,
    title?: string,
    primaryColor?: string,
    secondaryColor?: string,
  ): void {
    doc.addPage();

    doc.fontSize(14).fillColor(primaryColor || '#1a56db').font('Helvetica-Bold');

    if (title) {
      doc.text('Executive Summary', { underline: true });
    } else {
      doc.text('Summary', { underline: true });
    }

    doc.moveDown(1);
    doc.fontSize(10).fillColor('#374151').font('Helvetica');

    if (data.period) {
      doc.text(`Period: ${data.period}`, { align: 'left' });
    }
    if (data.generatedAt) {
      doc.text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, { align: 'right' });
    }
    doc.moveDown(1);

    if (data.summary) {
      doc.fontSize(12).fillColor(primaryColor || '#1a56db').font('Helvetica-Bold').text('Key Metrics', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#374151').font('Helvetica');

      const metrics = data.summary;
      if (metrics.totalRevenue !== undefined) {
        doc.text(`Total Revenue: $${Number(metrics.totalRevenue).toLocaleString()}`);
      }
      if (metrics.totalOrders !== undefined) {
        doc.text(`Total Orders: ${Number(metrics.totalOrders).toLocaleString()}`);
      }
      if (metrics.totalUsers !== undefined) {
        doc.text(`Total Users: ${Number(metrics.totalUsers).toLocaleString()}`);
      }
      if (metrics.totalRecords !== undefined) {
        doc.text(`Total Records: ${Number(metrics.totalRecords).toLocaleString()}`);
      }
      if (metrics.totalValue !== undefined) {
        doc.text(`Total Value: ${Number(metrics.totalValue).toLocaleString()}`);
      }
      if (metrics.growth !== undefined) {
        doc.text(`Growth: ${Number(metrics.growth).toFixed(1)}%`);
      }
      doc.moveDown(1);
    }

    if (data.salesAnalytics) {
      this.renderPDFSection(doc, 'Sales Analytics', primaryColor, secondaryColor);
      const sales = data.salesAnalytics;
      if (sales.totalRevenue !== undefined) {
        doc.fontSize(10).text(`Revenue: $${Number(sales.totalRevenue).toLocaleString()}`);
      }
      if (sales.totalOrders !== undefined) {
        doc.text(`Orders: ${Number(sales.totalOrders).toLocaleString()}`);
      }
      if (sales.averageOrderValue !== undefined) {
        doc.text(`Avg Order Value: $${Number(sales.averageOrderValue).toFixed(2)}`);
      }
      doc.moveDown(0.5);

      if (sales.topSellingProducts?.length > 0) {
        doc.fontSize(11).fillColor(primaryColor || '#1a56db').font('Helvetica-Bold').text('Top Products', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(9).fillColor('#374151').font('Helvetica');
        sales.topSellingProducts.slice(0, 10).forEach((p: any, i: number) => {
          doc.text(`${i + 1}. ${p.name || 'N/A'}: $${Number(p.revenue || 0).toLocaleString()} (${Number(p.quantity || 0)} sold)`);
        });
        doc.moveDown(0.5);
      }
    }

    if (data.productAnalytics) {
      this.renderPDFSection(doc, 'Product Analytics', primaryColor, secondaryColor);
      const prod = data.productAnalytics;
      if (prod.totalProducts !== undefined) doc.fontSize(10).text(`Total Products: ${prod.totalProducts}`);
      if (prod.activeProducts !== undefined) doc.text(`Active: ${prod.activeProducts}`);
      if (prod.outOfStock !== undefined) doc.text(`Out of Stock: ${prod.outOfStock}`);
      doc.moveDown(0.5);
    }

    if (data.customerAnalytics) {
      this.renderPDFSection(doc, 'Customer Analytics', primaryColor, secondaryColor);
      const cust = data.customerAnalytics;
      if (cust.totalCustomers !== undefined) doc.fontSize(10).text(`Total Customers: ${cust.totalCustomers}`);
      if (cust.newCustomers !== undefined) doc.text(`New Customers: ${cust.newCustomers}`);
      if (cust.activeCustomers !== undefined) doc.text(`Active: ${cust.activeCustomers}`);
      if (cust.averageLifetimeValue !== undefined) doc.text(`Avg Lifetime Value: $${Number(cust.averageLifetimeValue).toFixed(2)}`);
      doc.moveDown(0.5);
    }

    if (data.financialAnalytics) {
      this.renderPDFSection(doc, 'Financial Analytics', primaryColor, secondaryColor);
      const fin = data.financialAnalytics;
      if (fin.grossRevenue !== undefined) doc.fontSize(10).text(`Gross Revenue: $${Number(fin.grossRevenue).toLocaleString()}`);
      if (fin.netRevenue !== undefined) doc.text(`Net Revenue: $${Number(fin.netRevenue).toLocaleString()}`);
      if (fin.grossMargin !== undefined) doc.text(`Gross Margin: ${fin.grossMargin.toFixed(1)}%`);
      doc.moveDown(0.5);
    }

    if (data.marketingAnalytics) {
      this.renderPDFSection(doc, 'Marketing Analytics', primaryColor, secondaryColor);
      const mkt = data.marketingAnalytics;
      if (mkt.totalCampaigns !== undefined) doc.fontSize(10).text(`Total Campaigns: ${mkt.totalCampaigns}`);
      if (mkt.totalCouponsUsed !== undefined) doc.text(`Coupons Used: ${mkt.totalCouponsUsed}`);
      if (mkt.conversionRate !== undefined) doc.text(`Conversion Rate: ${mkt.conversionRate.toFixed(1)}%`);
      doc.moveDown(0.5);
    }

    if (data.insights && Array.isArray(data.insights) && data.insights.length > 0) {
      this.renderPDFSection(doc, 'Key Insights', primaryColor, secondaryColor);
      doc.fontSize(10).fillColor('#374151').font('Helvetica');
      data.insights.slice(0, 10).forEach((insight: any, i: number) => {
        const text = typeof insight === 'string' ? insight : insight.text || insight.message || 'N/A';
        doc.text(`${i + 1}. ${text}`);
      });
      doc.moveDown(0.5);
    }

    if (data.recommendations && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
      this.renderPDFSection(doc, 'Recommendations', primaryColor, secondaryColor);
      doc.fontSize(10).fillColor('#374151').font('Helvetica');
      data.recommendations.slice(0, 10).forEach((rec: any, i: number) => {
        const text = typeof rec === 'string' ? rec : rec.text || rec.message || 'N/A';
        doc.text(`${i + 1}. ${text}`);
      });
      doc.moveDown(0.5);
    }

    if (data.dataQuality) {
      this.renderPDFSection(doc, 'Data Quality', primaryColor, secondaryColor);
      doc.fontSize(10).fillColor('#374151').font('Helvetica');
      const dq = data.dataQuality;
      doc.text(`Overall: ${dq.overall || 'N/A'}`);
      if (dq.notes?.length > 0) {
        doc.text('Notes:');
        dq.notes.forEach((note: string) => {
          doc.text(`  - ${note}`);
        });
      }
    }
  }

  private renderPDFSection(
    doc: PDFKit.PDFDocument,
    sectionTitle: string,
    primaryColor?: string,
    secondaryColor?: string,
  ): void {
    const y = doc.y;
    const pageHeight = doc.page.height - 60;

    if (y > pageHeight - 80) {
      doc.addPage();
    }

    doc.fontSize(12).fillColor(primaryColor || '#1a56db').font('Helvetica-Bold').text(sectionTitle, { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#374151').font('Helvetica');
  }

  private generatePDFFooter(doc: PDFKit.PDFDocument, companyName?: string): void {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      const pageHeight = doc.page.height;
      const pageWidth = doc.page.width;

      doc.fontSize(8).fillColor('#9ca3af');

      if (companyName) {
        doc.text(companyName, 60, pageHeight - 40, { width: 200 });
      }

      doc.text(
        `Page ${i + 1} of ${pages.count}`,
        pageWidth - 160,
        pageHeight - 40,
        { width: 100, align: 'right' },
      );

      doc.text(
        `Generated: ${new Date().toLocaleDateString('en-US')}`,
        60,
        pageHeight - 28,
        { width: 200 },
      );
    }
  }

  private async exportToExcel(
    data: any,
    filename?: string,
    folder?: string,
    title?: string,
  ): Promise<ExportResult> {
    const workbook = XLSX.utils.book_new();

    const sheetsToAdd: { name: string; rows: any[][] }[] = [];

    if (title) {
      sheetsToAdd.push({
        name: 'Cover',
        rows: [
          ['Report'],
          [title],
          [],
          ['Generated', new Date().toISOString()],
          ...(data.period ? [['Period', data.period]] : []),
        ],
      });
    }

    if (data.summary) {
      const summaryRows = [['Metric', 'Value']];
      const s = data.summary;
      if (s.totalRevenue !== undefined) summaryRows.push(['Total Revenue', s.totalRevenue]);
      if (s.totalOrders !== undefined) summaryRows.push(['Total Orders', s.totalOrders]);
      if (s.totalUsers !== undefined) summaryRows.push(['Total Users', s.totalUsers]);
      if (s.totalRecords !== undefined) summaryRows.push(['Total Records', s.totalRecords]);
      if (s.totalValue !== undefined) summaryRows.push(['Total Value', s.totalValue]);
      if (s.growth !== undefined) summaryRows.push(['Growth %', s.growth]);
      if (data.period) summaryRows.push(['Period', data.period]);
      summaryRows.push(['Generated At', new Date().toISOString()]);
      sheetsToAdd.push({ name: 'Summary', rows: summaryRows });
    }

    if (data.salesAnalytics) {
      const salesRows = [['Metric', 'Value']];
      const sa = data.salesAnalytics;
      if (sa.totalRevenue !== undefined) salesRows.push(['Total Revenue', sa.totalRevenue]);
      if (sa.totalOrders !== undefined) salesRows.push(['Total Orders', sa.totalOrders]);
      if (sa.averageOrderValue !== undefined) salesRows.push(['Avg Order Value', sa.averageOrderValue]);
      if (sa.netRevenue !== undefined) salesRows.push(['Net Revenue', sa.netRevenue]);
      if (sa.totalDiscount !== undefined) salesRows.push(['Total Discount', sa.totalDiscount]);
      sheetsToAdd.push({ name: 'Sales', rows: salesRows });

      if (sa.topSellingProducts?.length > 0) {
        const topRows = [['Rank', 'Product', 'Quantity', 'Revenue']];
        sa.topSellingProducts.forEach((p: any, i: number) => {
          topRows.push([i + 1, p.name || 'N/A', p.quantity || 0, p.revenue || 0]);
        });
        sheetsToAdd.push({ name: 'Top Products', rows: topRows });
      }

      if (sa.salesByDate?.length > 0) {
        const dateRows = [['Date', 'Revenue', 'Orders']];
        sa.salesByDate.forEach((item: any) => {
          dateRows.push([item.date || 'N/A', item.revenue || item.sales || 0, item.orders || 0]);
        });
        sheetsToAdd.push({ name: 'Sales by Date', rows: dateRows });
      }
    }

    if (data.productAnalytics) {
      const prodRows = [['Metric', 'Value']];
      const pa = data.productAnalytics;
      if (pa.totalProducts !== undefined) prodRows.push(['Total Products', pa.totalProducts]);
      if (pa.activeProducts !== undefined) prodRows.push(['Active Products', pa.activeProducts]);
      if (pa.outOfStock !== undefined) prodRows.push(['Out of Stock', pa.outOfStock]);
      if (pa.lowStock !== undefined) prodRows.push(['Low Stock', pa.lowStock]);
      if (pa.inventoryValue !== undefined) prodRows.push(['Inventory Value', pa.inventoryValue]);
      sheetsToAdd.push({ name: 'Products', rows: prodRows });
    }

    if (data.customerAnalytics) {
      const custRows = [['Metric', 'Value']];
      const ca = data.customerAnalytics;
      if (ca.totalCustomers !== undefined) custRows.push(['Total Customers', ca.totalCustomers]);
      if (ca.newCustomers !== undefined) custRows.push(['New Customers', ca.newCustomers]);
      if (ca.activeCustomers !== undefined) custRows.push(['Active Customers', ca.activeCustomers]);
      if (ca.averageLifetimeValue !== undefined) custRows.push(['Avg Lifetime Value', ca.averageLifetimeValue]);
      if (ca.customerRetentionRate !== undefined) custRows.push(['Retention Rate %', ca.customerRetentionRate]);
      sheetsToAdd.push({ name: 'Customers', rows: custRows });

      if (ca.topCustomers?.length > 0) {
        const topCustRows = [['Rank', 'Customer', 'Orders', 'Total Spent']];
        ca.topCustomers.forEach((c: any, i: number) => {
          topCustRows.push([i + 1, c.name || 'Unknown', c.totalOrders || c.orders || 0, c.totalSpent || 0]);
        });
        sheetsToAdd.push({ name: 'Top Customers', rows: topCustRows });
      }
    }

    if (data.financialAnalytics) {
      const finRows = [['Metric', 'Value']];
      const fa = data.financialAnalytics;
      if (fa.grossRevenue !== undefined) finRows.push(['Gross Revenue', fa.grossRevenue]);
      if (fa.netRevenue !== undefined) finRows.push(['Net Revenue', fa.netRevenue]);
      if (fa.grossProfit !== undefined) finRows.push(['Gross Profit', fa.grossProfit]);
      if (fa.grossMargin !== undefined) finRows.push(['Gross Margin %', fa.grossMargin]);
      if (fa.totalDiscounts !== undefined) finRows.push(['Total Discounts', fa.totalDiscounts]);
      if (fa.totalRefunds !== undefined) finRows.push(['Total Refunds', fa.totalRefunds]);
      sheetsToAdd.push({ name: 'Financial', rows: finRows });
    }

    if (data.marketingAnalytics) {
      const mktRows = [['Metric', 'Value']];
      const ma = data.marketingAnalytics;
      if (ma.totalCampaigns !== undefined) mktRows.push(['Total Campaigns', ma.totalCampaigns]);
      if (ma.activeCampaigns !== undefined) mktRows.push(['Active Campaigns', ma.activeCampaigns]);
      if (ma.totalCouponsUsed !== undefined) mktRows.push(['Coupons Used', ma.totalCouponsUsed]);
      if (ma.conversionRate !== undefined) mktRows.push(['Conversion Rate %', ma.conversionRate]);
      sheetsToAdd.push({ name: 'Marketing', rows: mktRows });
    }

    if (data.insights && Array.isArray(data.insights) && data.insights.length > 0) {
      const insightRows = [['Rank', 'Insight']];
      data.insights.forEach((insight: any, i: number) => {
        const text = typeof insight === 'string' ? insight : insight.text || insight.message || 'N/A';
        insightRows.push([i + 1, text]);
      });
      sheetsToAdd.push({ name: 'Insights', rows: insightRows });
    }

    if (data.recommendations && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
      const recRows = [['Rank', 'Recommendation']];
      data.recommendations.forEach((rec: any, i: number) => {
        const text = typeof rec === 'string' ? rec : rec.text || rec.message || 'N/A';
        recRows.push([i + 1, text]);
      });
      sheetsToAdd.push({ name: 'Recommendations', rows: recRows });
    }

    for (const sheet of sheetsToAdd) {
      const ws = XLSX.utils.aoa_to_sheet(sheet.rows);
      const safeName = sheet.name.slice(0, 31);
      XLSX.utils.book_append_sheet(workbook, ws, safeName);
    }

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const fileName = filename || `report_${Date.now()}.xlsx`;

    const result = await this.fileStorageService.uploadBuffer(
      excelBuffer,
      fileName,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      folder,
    );

    return {
      url: result.url,
      filename: result.filename,
      format: 'xlsx',
      size: result.size,
      path: result.path,
    };
  }

  private async exportToCSV(data: any, filename?: string, folder?: string): Promise<ExportResult> {
    let csvContent = '';

    if (data.summary) {
      csvContent += 'Summary\nMetric,Value\n';
      const s = data.summary;
      if (s.totalRevenue !== undefined) csvContent += `Total Revenue,${s.totalRevenue}\n`;
      if (s.totalOrders !== undefined) csvContent += `Total Orders,${s.totalOrders}\n`;
      if (s.totalUsers !== undefined) csvContent += `Total Users,${s.totalUsers}\n`;
      if (s.totalRecords !== undefined) csvContent += `Total Records,${s.totalRecords}\n`;
      csvContent += '\n';
    }

    if (data.salesByDate && Array.isArray(data.salesByDate) && data.salesByDate.length > 0) {
      csvContent += 'Date,Revenue,Orders\n';
      data.salesByDate.forEach((item: any) => {
        csvContent += `${item.date || 'N/A'},${item.revenue || item.sales || 0},${item.orders || 0}\n`;
      });
      csvContent += '\n';
    }

    if (data.topProducts && Array.isArray(data.topProducts) && data.topProducts.length > 0) {
      csvContent += 'Rank,Product,Sales,Revenue\n';
      data.topProducts.forEach((p: any, i: number) => {
        csvContent += `${i + 1},${p.name || 'N/A'},${p.sales || p.quantity || 0},${p.revenue || 0}\n`;
      });
      csvContent += '\n';
    }

    if (data.topCustomers && Array.isArray(data.topCustomers) && data.topCustomers.length > 0) {
      csvContent += 'Rank,Customer,Total Spent,Orders\n';
      data.topCustomers.forEach((c: any, i: number) => {
        csvContent += `${i + 1},${c.name || 'Unknown'},${c.totalSpent || 0},${c.orders || c.totalOrders || 0}\n`;
      });
      csvContent += '\n';
    }

    if (!csvContent || csvContent.trim() === '') {
      csvContent = JSON.stringify(data, null, 2);
    }

    const csvBuffer = Buffer.from('\uFEFF' + csvContent, 'utf-8');
    const fileName = filename || `report_${Date.now()}.csv`;

    const result = await this.fileStorageService.uploadBuffer(
      csvBuffer,
      fileName,
      'text/csv',
      folder,
    );

    return {
      url: result.url,
      filename: result.filename,
      format: 'csv',
      size: result.size,
      path: result.path,
    };
  }

  private async exportToJSON(data: any, filename?: string, folder?: string): Promise<ExportResult> {
    const jsonContent = JSON.stringify(data, null, 2);
    const jsonBuffer = Buffer.from(jsonContent, 'utf-8');
    const fileName = filename || `report_${Date.now()}.json`;

    const result = await this.fileStorageService.uploadBuffer(
      jsonBuffer,
      fileName,
      'application/json',
      folder,
    );

    return {
      url: result.url,
      filename: result.filename,
      format: 'json',
      size: result.size,
      path: result.path,
    };
  }
}

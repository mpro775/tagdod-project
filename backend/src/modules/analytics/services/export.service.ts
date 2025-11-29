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
}

export interface ExportResult {
  url: string;
  filename: string;
  format: string;
  size: number;
  path: string;
}

/**
 * Export Service for Analytics Reports
 * Handles generation of PDF, Excel, CSV, and JSON exports
 */
@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private fileStorageService: FileStorageService) {}

  /**
   * Export data in the specified format
   */
  async exportData(options: ExportOptions): Promise<ExportResult> {
    const { format, data, filename, folder, title } = options;

    try {
      switch (format) {
        case 'pdf':
          return await this.exportToPDF(data, filename, folder, title);
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

  /**
   * Export data to PDF
   */
  private async exportToPDF(
    data: any,
    filename?: string,
    folder?: string,
    title?: string,
  ): Promise<ExportResult> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const chunks: Buffer[] = [];

        // Collect PDF data
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

        // Generate PDF content
        this.generatePDFContent(doc, data, title);

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate PDF content
   */
  private generatePDFContent(doc: PDFKit.PDFDocument, data: any, title?: string): void {
    // Title
    if (title) {
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown(2);
    }

    // Report metadata
    if (data.period) {
      doc.fontSize(12).text(`Period: ${data.period}`, { align: 'left' });
    }
    if (data.generatedAt) {
      doc.fontSize(12).text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, {
        align: 'right',
      });
    } else {
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
    }
    doc.moveDown();

    // Generate content based on data structure
    if (data.summary) {
      doc.fontSize(16).text('Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);

      if (data.summary.totalRevenue !== undefined && data.summary.totalRevenue !== null) {
        doc.text(`Total Revenue: $${Number(data.summary.totalRevenue).toLocaleString()}`);
      }
      if (data.summary.totalOrders !== undefined && data.summary.totalOrders !== null) {
        doc.text(`Total Orders: ${Number(data.summary.totalOrders).toLocaleString()}`);
      }
      if (data.summary.totalUsers !== undefined && data.summary.totalUsers !== null) {
        doc.text(`Total Users: ${Number(data.summary.totalUsers).toLocaleString()}`);
      }
      doc.moveDown();
    }

    // Top products
    if (data.topProducts && Array.isArray(data.topProducts) && data.topProducts.length > 0) {
      doc.fontSize(16).text('Top Products', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      data.topProducts.slice(0, 10).forEach((product: any, index: number) => {
        const productName = product.name || 'N/A';
        const revenue = product.revenue || 0;
        const sales = product.sales || product.quantity || 0;
        doc.text(
          `${index + 1}. ${productName}: $${Number(revenue).toLocaleString()} (${Number(sales).toLocaleString()} sold)`,
        );
      });
      doc.moveDown();
    }

    // Top customers
    if (data.topCustomers && Array.isArray(data.topCustomers) && data.topCustomers.length > 0) {
      doc.fontSize(16).text('Top Customers', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      data.topCustomers.slice(0, 10).forEach((customer: any, index: number) => {
        const customerName = customer.name || 'Unknown';
        const totalSpent = customer.totalSpent || 0;
        const orders = customer.orders || customer.totalOrders || 0;
        doc.text(
          `${index + 1}. ${customerName}: $${Number(totalSpent).toLocaleString()} (${Number(orders).toLocaleString()} orders)`,
        );
      });
      doc.moveDown();
    }

    // Sales by date
    if (data.salesByDate && Array.isArray(data.salesByDate) && data.salesByDate.length > 0) {
      doc.fontSize(16).text('Sales by Date', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      data.salesByDate.slice(0, 20).forEach((item: any) => {
        const date = item.date || 'N/A';
        const revenue = item.revenue || item.sales || 0;
        const orders = item.orders || 0;
        doc.text(
          `${date}: $${Number(revenue).toLocaleString()} (${Number(orders).toLocaleString()} orders)`,
        );
      });
      doc.moveDown();
    }

    // Insights
    if (data.insights && Array.isArray(data.insights) && data.insights.length > 0) {
      doc.fontSize(16).text('Key Insights', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      data.insights.slice(0, 10).forEach((insight: any, index: number) => {
        const insightText =
          typeof insight === 'string' ? insight : insight.text || insight.message || 'N/A';
        doc.text(`${index + 1}. ${insightText}`);
      });
      doc.moveDown();
    }

    // Add page numbers
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .text(`Page ${i + 1} of ${pages.count}`, doc.page.width - 100, doc.page.height - 30, {
          align: 'right',
        });
    }
  }

  /**
   * Export data to Excel (XLSX)
   */
  private async exportToExcel(
    data: any,
    filename?: string,
    folder?: string,
    title?: string,
  ): Promise<ExportResult> {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    if (data.summary) {
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Revenue', data.summary.totalRevenue || 0],
        ['Total Orders', data.summary.totalOrders || 0],
        ['Total Users', data.summary.totalUsers || 0],
      ];
      if (data.period) {
        summaryData.push(['Period', data.period]);
      }
      if (data.generatedAt) {
        summaryData.push(['Generated At', new Date(data.generatedAt).toISOString()]);
      } else {
        summaryData.push(['Generated At', new Date().toISOString()]);
      }
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    // Top Products sheet
    if (data.topProducts && Array.isArray(data.topProducts) && data.topProducts.length > 0) {
      const productsData = [
        ['Rank', 'Product Name', 'Sales', 'Revenue', 'Rating'],
        ...data.topProducts.map((product: any, index: number) => [
          index + 1,
          product.name || 'N/A',
          product.sales || product.quantity || 0,
          product.revenue || 0,
          product.rating || 0,
        ]),
      ];
      const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
      XLSX.utils.book_append_sheet(workbook, productsSheet, 'Top Products');
    }

    // Sales by Date sheet
    if (data.salesByDate && Array.isArray(data.salesByDate) && data.salesByDate.length > 0) {
      const salesData = [
        ['Date', 'Revenue', 'Orders', 'Average Order Value'],
        ...data.salesByDate.map((item: any) => {
          const revenue = item.revenue || item.sales || 0;
          const orders = item.orders || 0;
          return [
            item.date || 'N/A',
            revenue,
            orders,
            orders > 0 ? (revenue / orders).toFixed(2) : 0,
          ];
        }),
      ];
      const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
      XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales by Date');
    }

    // Top Customers sheet
    if (data.topCustomers && Array.isArray(data.topCustomers) && data.topCustomers.length > 0) {
      const customersData = [
        ['Rank', 'Customer Name', 'Total Spent', 'Orders'],
        ...data.topCustomers.map((customer: any, index: number) => [
          index + 1,
          customer.name || 'Unknown',
          customer.totalSpent || 0,
          customer.orders || customer.totalOrders || 0,
        ]),
      ];
      const customersSheet = XLSX.utils.aoa_to_sheet(customersData);
      XLSX.utils.book_append_sheet(workbook, customersSheet, 'Top Customers');
    }

    // Insights sheet
    if (data.insights && Array.isArray(data.insights) && data.insights.length > 0) {
      const insightsData = [
        ['Rank', 'Insight'],
        ...data.insights.map((insight: any, index: number) => [
          index + 1,
          typeof insight === 'string' ? insight : insight.text || insight.message || 'N/A',
        ]),
      ];
      const insightsSheet = XLSX.utils.aoa_to_sheet(insightsData);
      XLSX.utils.book_append_sheet(workbook, insightsSheet, 'Insights');
    }

    // Generate Excel buffer
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

  /**
   * Export data to CSV
   */
  private async exportToCSV(data: any, filename?: string, folder?: string): Promise<ExportResult> {
    // Convert data to CSV format
    let csvContent = '';

    // Summary section
    if (data.summary) {
      csvContent += 'Summary\n';
      csvContent += 'Metric,Value\n';
      if (data.summary.totalRevenue !== undefined && data.summary.totalRevenue !== null) {
        csvContent += `Total Revenue,${data.summary.totalRevenue}\n`;
      }
      if (data.summary.totalOrders !== undefined && data.summary.totalOrders !== null) {
        csvContent += `Total Orders,${data.summary.totalOrders}\n`;
      }
      if (data.summary.totalUsers !== undefined && data.summary.totalUsers !== null) {
        csvContent += `Total Users,${data.summary.totalUsers}\n`;
      }
      csvContent += '\n';
    }

    // Sales by date
    if (data.salesByDate && Array.isArray(data.salesByDate) && data.salesByDate.length > 0) {
      csvContent += 'Sales by Date\n';
      csvContent += 'Date,Revenue,Orders,Average Order Value\n';
      data.salesByDate.forEach((item: any) => {
        const revenue = item.revenue || item.sales || 0;
        const orders = item.orders || 0;
        const avgOrderValue = orders > 0 ? (revenue / orders).toFixed(2) : '0';
        csvContent += `${item.date || 'N/A'},${revenue},${orders},${avgOrderValue}\n`;
      });
      csvContent += '\n';
    }

    // Top products
    if (data.topProducts && Array.isArray(data.topProducts) && data.topProducts.length > 0) {
      csvContent += 'Top Products\n';
      csvContent += 'Rank,Product Name,Sales,Revenue,Rating\n';
      data.topProducts.forEach((product: any, index: number) => {
        const sales = product.sales || product.quantity || 0;
        const revenue = product.revenue || 0;
        const rating = product.rating || 0;
        csvContent += `${index + 1},${product.name || 'N/A'},${sales},${revenue},${rating}\n`;
      });
      csvContent += '\n';
    }

    // Top customers
    if (data.topCustomers && Array.isArray(data.topCustomers) && data.topCustomers.length > 0) {
      csvContent += 'Top Customers\n';
      csvContent += 'Rank,Customer Name,Total Spent,Orders\n';
      data.topCustomers.forEach((customer: any, index: number) => {
        const totalSpent = customer.totalSpent || 0;
        const orders = customer.orders || customer.totalOrders || 0;
        csvContent += `${index + 1},${customer.name || 'Unknown'},${totalSpent},${orders}\n`;
      });
      csvContent += '\n';
    }

    // If no structured data, fallback to JSON
    if (!csvContent || csvContent.trim() === '') {
      csvContent = JSON.stringify(data, null, 2);
    }

    const csvBuffer = Buffer.from(csvContent, 'utf-8');
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

  /**
   * Export data to JSON
   */
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

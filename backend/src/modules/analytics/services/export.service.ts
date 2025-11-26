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
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    // Generate content based on data structure
    if (data.summary) {
      doc.fontSize(16).text('Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);

      if (data.summary.totalRevenue !== undefined) {
        doc.text(`Total Revenue: $${data.summary.totalRevenue.toLocaleString()}`);
      }
      if (data.summary.totalOrders !== undefined) {
        doc.text(`Total Orders: ${data.summary.totalOrders.toLocaleString()}`);
      }
      if (data.summary.totalUsers !== undefined) {
        doc.text(`Total Users: ${data.summary.totalUsers.toLocaleString()}`);
      }
      doc.moveDown();
    }

    // Top products
    if (data.topProducts && Array.isArray(data.topProducts)) {
      doc.fontSize(16).text('Top Products', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      data.topProducts.slice(0, 10).forEach((product: any, index: number) => {
        doc.text(
          `${index + 1}. ${product.name || 'N/A'}: $${(product.revenue || 0).toLocaleString()}`,
        );
      });
      doc.moveDown();
    }

    // Sales by date
    if (data.salesByDate && Array.isArray(data.salesByDate)) {
      doc.fontSize(16).text('Sales by Date', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      data.salesByDate.slice(0, 20).forEach((item: any) => {
        doc.text(
          `${item.date || 'N/A'}: $${(item.revenue || 0).toLocaleString()} (${item.orders || 0} orders)`,
        );
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
        ['Generated At', new Date().toISOString()],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    // Top Products sheet
    if (data.topProducts && Array.isArray(data.topProducts)) {
      const productsData = [
        ['Rank', 'Product Name', 'Sales', 'Revenue', 'Rating'],
        ...data.topProducts.map((product: any, index: number) => [
          index + 1,
          product.name || 'N/A',
          product.sales || 0,
          product.revenue || 0,
          product.rating || 0,
        ]),
      ];
      const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
      XLSX.utils.book_append_sheet(workbook, productsSheet, 'Top Products');
    }

    // Sales by Date sheet
    if (data.salesByDate && Array.isArray(data.salesByDate)) {
      const salesData = [
        ['Date', 'Revenue', 'Orders', 'Average Order Value'],
        ...data.salesByDate.map((item: any) => [
          item.date || 'N/A',
          item.revenue || 0,
          item.orders || 0,
          item.orders > 0 ? (item.revenue / item.orders).toFixed(2) : 0,
        ]),
      ];
      const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
      XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales by Date');
    }

    // Top Customers sheet
    if (data.topCustomers && Array.isArray(data.topCustomers)) {
      const customersData = [
        ['Rank', 'Customer Name', 'Total Spent', 'Orders'],
        ...data.topCustomers.map((customer: any, index: number) => [
          index + 1,
          customer.name || 'Unknown',
          customer.totalSpent || 0,
          customer.orders || 0,
        ]),
      ];
      const customersSheet = XLSX.utils.aoa_to_sheet(customersData);
      XLSX.utils.book_append_sheet(workbook, customersSheet, 'Top Customers');
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

    // If data has salesByDate, use that
    if (data.salesByDate && Array.isArray(data.salesByDate)) {
      csvContent = 'Date,Revenue,Orders,Average Order Value\n';
      data.salesByDate.forEach((item: any) => {
        const avgOrderValue = item.orders > 0 ? (item.revenue / item.orders).toFixed(2) : '0';
        csvContent += `${item.date || 'N/A'},${item.revenue || 0},${item.orders || 0},${avgOrderValue}\n`;
      });
    } else if (data.topProducts && Array.isArray(data.topProducts)) {
      csvContent = 'Product Name,Sales,Revenue,Rating\n';
      data.topProducts.forEach((product: any) => {
        csvContent += `${product.name || 'N/A'},${product.sales || 0},${product.revenue || 0},${product.rating || 0}\n`;
      });
    } else {
      // Fallback: convert object to CSV
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

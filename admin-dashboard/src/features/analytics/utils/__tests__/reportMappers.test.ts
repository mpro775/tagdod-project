import { describe, it, expect } from 'vitest';
import { mapAdvancedReport, mapSchedule, mapExportFile, mapExportResult } from '../reportMappers';

describe('reportMappers', () => {
  describe('mapAdvancedReport', () => {
    it('maps id to reportId', () => {
      const raw = {
        id: 'abc123',
        title: 'Sales Report',
        category: 'sales',
        status: 'completed',
        priority: 'high',
        summary: { totalRecords: 10, totalValue: 1000, currency: 'USD', growth: 5 },
      };
      const result = mapAdvancedReport(raw);
      expect(result.reportId).toBe('abc123');
      expect(result.id).toBe('abc123');
      expect(result.title).toBe('Sales Report');
    });

    it('defaults currency to YER when missing', () => {
      const raw = {
        id: '1',
        title: 'R',
        summary: { totalRecords: 0 },
      };
      const result = mapAdvancedReport(raw);
      expect(result.summary.currency).toBe('YER');
    });

    it('preserves provided currency', () => {
      const raw = {
        id: '1',
        title: 'R',
        summary: { totalRecords: 0, currency: 'SAR' },
      };
      const result = mapAdvancedReport(raw);
      expect(result.summary.currency).toBe('SAR');
    });
  });

  describe('mapSchedule', () => {
    it('maps status from isActive', () => {
      const raw = {
        _id: 's1',
        name: 'Weekly',
        isActive: false,
        frequency: 'weekly',
        reportType: 'monthly_report',
      };
      const result = mapSchedule(raw);
      expect(result.status).toBe('paused');
      expect(result.isActive).toBe(false);
    });

    it('falls back to active when isActive is true', () => {
      const raw = {
        _id: 's2',
        name: 'Daily',
        isActive: true,
        frequency: 'daily',
        reportType: 'daily_summary',
      };
      const result = mapSchedule(raw);
      expect(result.status).toBe('active');
      expect(result.isActive).toBe(true);
    });
  });

  describe('mapExportFile', () => {
    it('normalizes format to lowercase', () => {
      const raw = {
        fileUrl: 'http://example.com/file.xlsx',
        fileName: 'report',
        format: 'EXCEL',
      };
      const result = mapExportFile(raw);
      expect(result.format).toBe('xlsx');
    });
  });

  describe('mapExportResult', () => {
    it('handles string response', () => {
      const raw = 'http://example.com/file.pdf';
      const result = mapExportResult(raw);
      expect(result.fileUrl).toBe('http://example.com/file.pdf');
      expect(result.fileName).toBe('file.pdf');
    });

    it('handles object response with nested data', () => {
      const raw = {
        data: {
          data: {
            fileUrl: 'http://example.com/file.csv',
            fileName: 'data',
            format: 'csv',
            fileSize: 1024,
          },
        },
      };
      const result = mapExportResult(raw);
      expect(result.fileUrl).toBe('http://example.com/file.csv');
      expect(result.format).toBe('csv');
    });
  });
});

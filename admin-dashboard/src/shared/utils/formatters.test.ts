import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatCurrency,
  formatNumber,
  formatPhoneNumber,
  truncateText,
  formatFileSize,
  sanitizePaginationParams,
} from './formatters';

describe('formatters utilities', () => {
  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      
      expect(result).toBe('2024-01-15');
    });

    it('should format date string', () => {
      const result = formatDate('2024-01-15');
      
      expect(result).toBe('2024-01-15');
    });

    it('should format with custom format', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'dd/MM/yyyy');
      
      expect(result).toBe('15/01/2024');
    });

    it('should use Arabic locale by default', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'MMMM yyyy');
      
      expect(result).toContain('2024');
    });

    it('should use English locale when specified', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'MMMM yyyy', 'en');
      
      expect(result).toBe('January 2024');
    });
  });

  describe('formatCurrency', () => {
    it('should format SAR currency with Arabic locale', () => {
      const result = formatCurrency(1000, 'SAR', 'ar');
      
      expect(result).toContain('1000');
      expect(result.includes('$') || result.includes('SAR')).toBe(true);
    });

    it('should format USD currency', () => {
      const result = formatCurrency(1000, 'USD', 'en');
      
      expect(result).toContain('1,000');
      expect(result.includes('$') || result.includes('USD')).toBe(true);
    });

    it('should use default SAR currency', () => {
      const result = formatCurrency(500);
      
      expect(result).toContain('500');
    });

    it('should handle decimal values', () => {
      const result = formatCurrency(99.99, 'USD', 'en');
      
      expect(result.includes('99.99') || result.includes('100')).toBe(true);
    });

    it('should handle zero', () => {
      const result = formatCurrency(0, 'USD', 'en');
      
      expect(result).toContain('0');
    });
  });

  describe('formatNumber', () => {
    it('should format number with Arabic locale', () => {
      const result = formatNumber(1234567, 'ar');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should format number with English locale', () => {
      const result = formatNumber(1234567, 'en');
      
      expect(result).toBe('1,234,567');
    });

    it('should handle decimal numbers', () => {
      const result = formatNumber(1234.56, 'en', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      
      expect(result).toBe('1,234.56');
    });

    it('should handle zero', () => {
      const result = formatNumber(0, 'en');
      
      expect(result).toBe('0');
    });

    it('should apply custom options', () => {
      const result = formatNumber(0.123, 'en', {
        style: 'percent',
        minimumFractionDigits: 1,
      });
      
      expect(result).toContain('%');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format Saudi phone number with country code', () => {
      const result = formatPhoneNumber('966501234567');
      
      expect(result).toBe('+966 50 123 4567');
    });

    it('should format Saudi phone number starting with 0', () => {
      const result = formatPhoneNumber('0501234567');
      
      expect(result).toBe('050 123 4567');
    });

    it('should handle phone with non-digits', () => {
      const result = formatPhoneNumber('+966-50-123-4567');
      
      expect(result).toBe('+966 50 123 4567');
    });

    it('should return original for unrecognized format', () => {
      const result = formatPhoneNumber('123456');
      
      expect(result).toBe('123456');
    });

    it('should handle empty string', () => {
      const result = formatPhoneNumber('');
      
      expect(result).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      const result = truncateText(text, 20);
      
      expect(result).toBe('This is a very lo...');
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      const result = truncateText(text, 50);
      
      expect(result).toBe('Short text');
    });

    it('should use default max length of 50', () => {
      const text = 'A'.repeat(100);
      const result = truncateText(text);
      
      expect(result.length).toBeLessThanOrEqual(50);
    });

    it('should use custom suffix', () => {
      const text = 'This is a long text';
      const result = truncateText(text, 10, '***');
      
      expect(result).toContain('***');
    });

    it('should handle exact max length', () => {
      const text = 'Exactly 20 character';
      const result = truncateText(text, 20);
      
      expect(result).toBe('Exactly 20 character');
    });
  });

  describe('formatFileSize', () => {
    it('should format 0 bytes', () => {
      const result = formatFileSize(0);
      
      expect(result).toBe('0 Bytes');
    });

    it('should format bytes', () => {
      const result = formatFileSize(500);
      
      expect(result).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      const result = formatFileSize(1024);
      
      expect(result).toBe('1 KB');
    });

    it('should format megabytes', () => {
      const result = formatFileSize(1024 * 1024);
      
      expect(result).toBe('1 MB');
    });

    it('should format gigabytes', () => {
      const result = formatFileSize(1024 * 1024 * 1024);
      
      expect(result).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      const result = formatFileSize(1536); // 1.5 KB
      
      expect(result).toBe('1.5 KB');
    });

    it('should format large files', () => {
      const result = formatFileSize(5 * 1024 * 1024 * 1024); // 5 GB
      
      expect(result).toBe('5 GB');
    });
  });

  describe('sanitizePaginationParams', () => {
    it('should convert page to number', () => {
      const params = { page: '2', limit: '20' };
      const result = sanitizePaginationParams(params);
      
      expect(result.page).toBe(2);
      expect(typeof result.page).toBe('number');
    });

    it('should convert limit to number', () => {
      const params = { page: '1', limit: '30' };
      const result = sanitizePaginationParams(params);
      
      expect(result.limit).toBe(30);
      expect(typeof result.limit).toBe('number');
    });

    it('should default page to 1 if falsy', () => {
      const params = { page: '', limit: '20' };
      const result = sanitizePaginationParams(params);
      
      expect(result.page).toBe(1);
    });

    it('should default limit to 20 if falsy', () => {
      const params = { page: '1', limit: '' };
      const result = sanitizePaginationParams(params);
      
      expect(result.limit).toBe(20);
    });

    it('should preserve other params', () => {
      const params = { page: '1', limit: '20', search: 'test', filter: 'active' };
      const result = sanitizePaginationParams(params);
      
      expect(result.search).toBe('test');
      expect(result.filter).toBe('active');
    });

    it('should handle undefined page and limit', () => {
      const params = { search: 'test' };
      const result = sanitizePaginationParams(params);
      
      expect(result.page).toBeUndefined();
      expect(result.limit).toBeUndefined();
    });

    it('should handle numeric values', () => {
      const params = { page: 5, limit: 50 };
      const result = sanitizePaginationParams(params);
      
      expect(result.page).toBe(5);
      expect(result.limit).toBe(50);
    });
  });
});


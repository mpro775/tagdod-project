import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatFileSize,
  formatDuration,
} from '../formatters';

describe('formatters', () => {
  describe('formatNumber', () => {
    it('formats a number with Arabic locale', () => {
      expect(formatNumber(1234)).toBe('١٬٢٣٤');
    });

    it('returns 0 for null/undefined/NaN', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
      expect(formatNumber(NaN)).toBe('0');
    });
  });

  describe('formatCurrency', () => {
    it('formats with YER by default', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('YER');
      expect(result).toContain('١٬٠٠٠');
    });

    it('accepts custom currency', () => {
      const result = formatCurrency(500, 'SAR');
      expect(result).toContain('SAR');
    });
  });

  describe('formatPercent', () => {
    it('formats a percent with one decimal', () => {
      expect(formatPercent(12.5)).toBe('12.5%');
    });

    it('returns 0.0% for null', () => {
      expect(formatPercent(null)).toBe('0.0%');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(512)).toBe('512 B');
    });

    it('formats kilobytes', () => {
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('formats megabytes', () => {
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
    });
  });

  describe('formatDuration', () => {
    it('formats seconds only', () => {
      expect(formatDuration(45)).toBe('45s');
    });

    it('formats minutes and seconds', () => {
      expect(formatDuration(125)).toBe('2m 5s');
    });

    it('formats hours minutes seconds', () => {
      expect(formatDuration(3665)).toBe('1h 1m 5s');
    });
  });
});

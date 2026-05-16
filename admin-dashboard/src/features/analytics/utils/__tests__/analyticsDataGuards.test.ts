import { describe, it, expect } from 'vitest';
import {
  unwrapApiData,
  asArray,
  normalizeFormat,
  normalizePaginatedResponse,
} from '../analyticsDataGuards';

describe('analyticsDataGuards', () => {
  describe('unwrapApiData', () => {
    it('unwraps wrapper shape data.data', () => {
      const response = { data: { data: { value: 1 } } };
      expect(unwrapApiData(response)).toEqual({ value: 1 });
    });

    it('unwraps wrapper shape data', () => {
      const response = { data: { value: 2 } };
      expect(unwrapApiData(response)).toEqual({ value: 2 });
    });

    it('returns raw response if no wrapper', () => {
      const response = { value: 3 };
      expect(unwrapApiData(response)).toEqual({ value: 3 });
    });
  });

  describe('asArray', () => {
    it('returns array when given array', () => {
      expect(asArray([1, 2])).toEqual([1, 2]);
    });

    it('returns empty array when given object', () => {
      expect(asArray({ a: 1 })).toEqual([]);
    });

    it('returns empty array when given null', () => {
      expect(asArray(null)).toEqual([]);
    });
  });

  describe('normalizeFormat', () => {
    it('converts excel to xlsx', () => {
      expect(normalizeFormat('excel')).toBe('xlsx');
    });

    it('defaults to pdf when empty', () => {
      expect(normalizeFormat('')).toBe('pdf');
    });

    it('preserves pdf', () => {
      expect(normalizeFormat('pdf')).toBe('pdf');
    });
  });

  describe('normalizePaginatedResponse', () => {
    it('maps items and builds meta from payload', () => {
      // Simulate Axios response wrapper shape: response.data.data = { data, meta }
      const payload = {
        data: {
          success: true,
          data: {
            data: [{ id: 1, name: 'A' }],
            meta: { total: 10, page: 1, limit: 5, totalPages: 2 },
          },
          requestId: 'req-1',
        },
      };
      const result = normalizePaginatedResponse(payload, (item) => ({
        id: item.id,
        title: item.name,
      }));
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('A');
      expect(result.meta.total).toBe(10);
      expect(result.meta.totalPages).toBe(2);
    });
  });
});

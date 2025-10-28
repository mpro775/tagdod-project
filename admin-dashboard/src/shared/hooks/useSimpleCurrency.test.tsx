import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCurrencyProvider } from './useSimpleCurrency';

// Mock API client
vi.mock('@/core/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from '@/core/api/client';

describe('useSimpleCurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCurrencyProvider', () => {
    it('should initialize with default USD currency', () => {
      const { result } = renderHook(() => useCurrencyProvider());

      expect(result.current.selectedCurrency).toBe('USD');
    });

    it('should fetch exchange rates on mount', async () => {
      const mockRates = {
        usdToYer: 250,
        usdToSar: 3.75,
        lastUpdated: new Date().toISOString(),
      };

      (apiClient.get as any).mockResolvedValue({ data: mockRates });

      const { result } = renderHook(() => useCurrencyProvider());

      // Wait for the effect to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(result.current.exchangeRates).toEqual({
        usdToYer: 250,
        usdToSar: 3.75,
        lastUpdated: expect.any(Date),
      });
    });

    it('should handle API errors', async () => {
      (apiClient.get as any).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useCurrencyProvider());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(result.current.error).toBe('فشل في تحديث أسعار الصرف');
    });

    it('should set loading state during fetch', async () => {
      (apiClient.get as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100))
      );

      const { result } = renderHook(() => useCurrencyProvider());

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should change selected currency', () => {
      const { result } = renderHook(() => useCurrencyProvider());

      act(() => {
        result.current.setSelectedCurrency('SAR');
      });

      expect(result.current.selectedCurrency).toBe('SAR');
    });

    it('should refresh rates on demand', async () => {
      const mockRates = {
        usdToYer: 250,
        usdToSar: 3.75,
      };

      (apiClient.get as any).mockResolvedValue({ data: mockRates });

      const { result } = renderHook(() => useCurrencyProvider());

      await act(async () => {
        await result.current.refreshRates();
      });

      expect(apiClient.get).toHaveBeenCalled();
    });
  });

  describe('convertFromUSD', () => {
    it('should convert USD to YER', async () => {
      const mockRates = {
        usdToYer: 250,
        usdToSar: 3.75,
      };

      (apiClient.get as any).mockResolvedValue({ data: mockRates });

      const { result } = renderHook(() => useCurrencyProvider());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      act(() => {
        result.current.setSelectedCurrency('YER');
      });

      const converted = result.current.convertFromUSD(100);

      expect(converted.amount).toBe(25000); // 100 * 250
      expect(converted.formatted).toContain('25,000');
      expect(converted.formatted).toContain('$');
    });

    it('should convert USD to SAR', async () => {
      const mockRates = {
        usdToYer: 250,
        usdToSar: 3.75,
      };

      (apiClient.get as any).mockResolvedValue({ data: mockRates });

      const { result } = renderHook(() => useCurrencyProvider());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      act(() => {
        result.current.setSelectedCurrency('SAR');
      });

      const converted = result.current.convertFromUSD(100);

      expect(converted.amount).toBe(375); // 100 * 3.75
      expect(converted.formatted).toBe('375.00 $');
    });

    it('should return USD when currency is USD', async () => {
      const mockRates = {
        usdToYer: 250,
        usdToSar: 3.75,
      };

      (apiClient.get as any).mockResolvedValue({ data: mockRates });

      const { result } = renderHook(() => useCurrencyProvider());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const converted = result.current.convertFromUSD(100);

      expect(converted.amount).toBe(100);
      expect(converted.formatted).toBe('$100');
    });

    it('should handle missing exchange rates', () => {
      (apiClient.get as any).mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useCurrencyProvider());

      const converted = result.current.convertFromUSD(100);

      expect(converted.amount).toBe(100);
      expect(converted.formatted).toBe('$100');
    });
  });

  describe('formatPrice', () => {
    it('should format YER price', async () => {
      const mockRates = {
        usdToYer: 250,
        usdToSar: 3.75,
      };

      (apiClient.get as any).mockResolvedValue({ data: mockRates });

      const { result } = renderHook(() => useCurrencyProvider());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const formatted = result.current.formatPrice(25000, 'YER');

      expect(formatted).toContain('25,000');
      expect(formatted).toContain('$');
    });

    it('should format SAR price', async () => {
      const mockRates = {
        usdToYer: 250,
        usdToSar: 3.75,
      };

      (apiClient.get as any).mockResolvedValue({ data: mockRates });

      const { result } = renderHook(() => useCurrencyProvider());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const formatted = result.current.formatPrice(375, 'SAR');

      expect(formatted).toBe('375.00 $');
    });

    it('should format USD price', async () => {
      const mockRates = {
        usdToYer: 250,
        usdToSar: 3.75,
      };

      (apiClient.get as any).mockResolvedValue({ data: mockRates });

      const { result } = renderHook(() => useCurrencyProvider());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const formatted = result.current.formatPrice(100, 'USD');

      expect(formatted).toBe('$100');
    });

    it('should use selected currency when currency not specified', async () => {
      const mockRates = {
        usdToYer: 250,
        usdToSar: 3.75,
      };

      (apiClient.get as any).mockResolvedValue({ data: mockRates });

      const { result } = renderHook(() => useCurrencyProvider());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      act(() => {
        result.current.setSelectedCurrency('SAR');
      });

      const formatted = result.current.formatPrice(375);

      expect(formatted).toBe('375.00 $');
    });
  });
});


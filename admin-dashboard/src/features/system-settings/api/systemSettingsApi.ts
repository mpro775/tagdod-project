import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  type: string;
  description?: string;
  isPublic: boolean;
  updatedAt: Date;
  updatedBy?: string;
}

export const systemSettingsApi = {
  /**
   * Get all settings
   */
  getAllSettings: async (category?: string): Promise<SystemSetting[]> => {
    const response = await apiClient.get<ApiResponse<SystemSetting[]>>(
      '/system-settings',
      { params: { category } }
    );
    return response.data.data;
  },

  /**
   * Get settings by category (as key-value pairs)
   */
  getSettingsByCategory: async (category: string): Promise<Record<string, any>> => {
    const response = await apiClient.get<ApiResponse<Record<string, any>>>(
      `/system-settings/category/${category}`
    );
    return response.data.data;
  },

  /**
   * Get single setting
   */
  getSetting: async (key: string): Promise<SystemSetting> => {
    const response = await apiClient.get<ApiResponse<SystemSetting>>(
      `/system-settings/${key}`
    );
    return response.data.data;
  },

  /**
   * Create setting
   */
  createSetting: async (data: {
    key: string;
    value: any;
    category: string;
    type?: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<SystemSetting> => {
    const response = await apiClient.post<ApiResponse<SystemSetting>>(
      '/system-settings',
      data
    );
    return response.data.data;
  },

  /**
   * Update setting
   */
  updateSetting: async (key: string, data: {
    value: any;
    description?: string;
  }): Promise<SystemSetting> => {
    const response = await apiClient.put<ApiResponse<SystemSetting>>(
      `/system-settings/${key}`,
      data
    );
    return response.data.data;
  },

  /**
   * Bulk update settings
   */
  bulkUpdate: async (settings: Record<string, any>) => {
    const response = await apiClient.put<ApiResponse<{ updated: number }>>(
      '/system-settings/bulk',
      { settings }
    );
    return response.data.data;
  },

  /**
   * Delete setting
   */
  deleteSetting: async (key: string): Promise<void> => {
    await apiClient.delete(`/system-settings/${key}`);
  },

  /**
   * Get public settings (no auth required)
   */
  getPublicSettings: async (category?: string): Promise<Record<string, any>> => {
    const response = await apiClient.get<Record<string, any>>(
      '/system-settings/public',
      { params: { category } }
    );
    return response.data;
  },
};

// ==================== Local Payment Accounts ====================

export type CurrencyCode = 'YER' | 'SAR' | 'USD';
export type PaymentAccountType = 'bank' | 'wallet';
export type PaymentAccountNumberingMode = 'shared' | 'per_currency';

export interface MediaReference {
  id: string;
  url: string;
  name?: string;
}

export interface ProviderAccountItem {
  id: string;
  currency: CurrencyCode;
  accountNumber: string;
  isActive: boolean;
  displayOrder: number;
  notes?: string;
  isOverride: boolean;
}

export interface LocalPaymentAccount {
  _id: string;
  providerName: string;
  iconMediaId?: string;
  icon?: MediaReference;
  type: PaymentAccountType;
  numberingMode: PaymentAccountNumberingMode;
  supportedCurrencies: CurrencyCode[];
  sharedAccountNumber?: string;
  accounts: ProviderAccountItem[];
  isActive: boolean;
  notes?: string;
  displayOrder: number;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupedPaymentAccount {
  providerId: string;
  providerName: string;
  icon?: MediaReference;
  type: PaymentAccountType;
  numberingMode: PaymentAccountNumberingMode;
  supportedCurrencies: CurrencyCode[];
  sharedAccountNumber?: string;
  accounts: Array<{
    id: string;
    accountNumber: string;
    currency: CurrencyCode;
    isActive: boolean;
    displayOrder: number;
    notes?: string;
  }>;
}

export interface ProviderAccountInput {
  id?: string;
  currency: CurrencyCode;
  accountNumber: string;
  isActive?: boolean;
  displayOrder?: number;
  notes?: string;
}

export interface CreatePaymentAccountDto {
  providerName: string;
  iconMediaId?: string | null;
  type: PaymentAccountType;
  numberingMode: PaymentAccountNumberingMode;
  sharedAccountNumber?: string;
  supportedCurrencies?: CurrencyCode[];
  accounts?: ProviderAccountInput[];
  isActive?: boolean;
  notes?: string;
  displayOrder?: number;
}

export interface UpdatePaymentAccountDto {
  providerName?: string;
  iconMediaId?: string | null;
  type?: PaymentAccountType;
  numberingMode?: PaymentAccountNumberingMode;
  sharedAccountNumber?: string;
  supportedCurrencies?: CurrencyCode[];
  accounts?: ProviderAccountInput[];
  isActive?: boolean;
  notes?: string;
  displayOrder?: number;
}

export const localPaymentAccountsApi = {
  /**
   * Get all payment accounts
   */
  getAllAccounts: async (activeOnly?: boolean): Promise<LocalPaymentAccount[]> => {
    const response = await apiClient.get<ApiResponse<LocalPaymentAccount[]>>(
      '/system-settings/payment-accounts',
      { params: { activeOnly: activeOnly ? 'true' : undefined } }
    );
    return response.data.data;
  },

  /**
   * Get grouped payment accounts
   */
  getGroupedAccounts: async (activeOnly?: boolean): Promise<GroupedPaymentAccount[]> => {
    const response = await apiClient.get<ApiResponse<GroupedPaymentAccount[]>>(
      '/system-settings/payment-accounts/grouped',
      { params: { activeOnly: activeOnly ? 'true' : undefined } }
    );
    return response.data.data;
  },

  /**
   * Get public payment accounts (for customers)
   */
  getPublicAccounts: async (currency?: string): Promise<GroupedPaymentAccount[]> => {
    const response = await apiClient.get<ApiResponse<GroupedPaymentAccount[]>>(
      '/system-settings/payment-accounts/public',
      { params: { currency } }
    );
    return response.data.data;
  },

  /**
   * Create payment account provider
   */
  createAccount: async (data: CreatePaymentAccountDto): Promise<LocalPaymentAccount> => {
    const response = await apiClient.post<ApiResponse<LocalPaymentAccount>>(
      '/system-settings/payment-accounts',
      data
    );
    return response.data.data;
  },

  /**
   * Update payment account provider
   */
  updateAccount: async (id: string, data: UpdatePaymentAccountDto): Promise<LocalPaymentAccount> => {
    const response = await apiClient.put<ApiResponse<LocalPaymentAccount>>(
      `/system-settings/payment-accounts/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete payment account provider
   */
  deleteAccount: async (id: string): Promise<void> => {
    await apiClient.delete(`/system-settings/payment-accounts/${id}`);
  },
};

